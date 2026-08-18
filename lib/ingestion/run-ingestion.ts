import type { IngestionEventStatus, IngestionTrigger, SourceRegistryEntry } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { canonicalizeUrl } from "@/lib/ingestion/canonicalize";
import { computeChecksum, isUnchanged } from "@/lib/ingestion/checksum";
import { fetchRegisteredSource } from "@/lib/ingestion/fetch";
import { chunkText, parseHtml } from "@/lib/ingestion/parse";

const MIN_PARSED_LENGTH = 200;

export type SourceRunResult = {
  sourceRegistryEntryId: string;
  label: string;
  status: "UNCHANGED" | "CHANGED" | "REJECTED" | "FAILED";
  message: string;
  httpStatus?: number;
  checksum?: string;
};

export type IngestionRunSummary = {
  runId: string;
  status: "SUCCEEDED" | "FAILED" | "PARTIAL";
  sourceCount: number;
  changedCount: number;
  unchangedCount: number;
  failedCount: number;
  results: SourceRunResult[];
};

/** Prevents concurrent duplicate runs: refuses to start a new run while one is already RUNNING. */
async function assertNoConcurrentRun() {
  const running = await prisma.ingestionRun.findFirst({ where: { status: "RUNNING" } });
  if (running) {
    throw new Error(`Ingestion run "${running.id}" is already RUNNING. Refusing to start a concurrent run.`);
  }
}

async function recordEvent(
  runId: string,
  sourceRegistryEntryId: string,
  status: IngestionEventStatus,
  details: { checksum?: string; httpStatus?: number; sourceVersionId?: string; message?: string }
) {
  await prisma.ingestionRunEvent.create({
    data: {
      runId,
      sourceRegistryEntryId,
      status,
      checksum: details.checksum,
      httpStatus: details.httpStatus,
      sourceVersionId: details.sourceVersionId,
      message: details.message
    }
  });
}

/**
 * Runs one registry entry through fetch -> parse -> checksum -> version -> verify -> persist.
 * Idempotent: an unchanged checksum only updates lastSuccessfulRunAt and logs UNCHANGED,
 * it never creates a duplicate KnowledgeDocument/KnowledgeChunk row.
 */
async function runOneRegistryEntry(runId: string, entry: SourceRegistryEntry): Promise<SourceRunResult> {
  const fetchOutcome = await fetchRegisteredSource({ url: entry.seedUrl, allowedHosts: entry.allowedHosts });

  if (!fetchOutcome.ok) {
    const status: IngestionEventStatus = fetchOutcome.status === undefined ? "REJECTED" : "FAILED";
    await recordEvent(runId, entry.id, status, { message: fetchOutcome.reason, httpStatus: fetchOutcome.status });
    return {
      sourceRegistryEntryId: entry.id,
      label: entry.label,
      status: status === "REJECTED" ? "REJECTED" : "FAILED",
      message: fetchOutcome.reason,
      httpStatus: fetchOutcome.status
    };
  }

  const { parsedText } = parseHtml(fetchOutcome.body);
  const checksum = computeChecksum(parsedText);
  const parseOk = parsedText.length >= MIN_PARSED_LENGTH;

  const existingSource = await prisma.governmentSource.findUnique({
    where: { sourceRegistryEntryId: entry.id },
    include: { versions: { where: { isCurrent: true }, take: 1 } }
  });
  const previousVersion = existingSource?.versions[0] ?? null;

  if (previousVersion && isUnchanged(previousVersion.checksum, checksum)) {
    await prisma.sourceRegistryEntry.update({ where: { id: entry.id }, data: { lastSuccessfulRunAt: fetchOutcome.fetchedAt } });
    await recordEvent(runId, entry.id, "UNCHANGED", { checksum, httpStatus: fetchOutcome.status, sourceVersionId: previousVersion.id });
    return {
      sourceRegistryEntryId: entry.id,
      label: entry.label,
      status: "UNCHANGED",
      message: "Content unchanged since the last verified fetch.",
      httpStatus: fetchOutcome.status,
      checksum
    };
  }

  const verificationStatus: "VERIFIED" | "NEEDS_REVIEW" = parseOk ? "VERIFIED" : "NEEDS_REVIEW";
  const verificationNotes = parseOk
    ? `Passed policy "${entry.verificationPolicy}": host allowlisted, https, DNS resolved to a public address, parsed text length ${parsedText.length} >= ${MIN_PARSED_LENGTH}.`
    : `Failed policy "${entry.verificationPolicy}": parsed text length ${parsedText.length} is below the ${MIN_PARSED_LENGTH}-character minimum. Needs human review before use.`;

  const { version } = await prisma.$transaction(async (tx) => {
    const governmentSource = await tx.governmentSource.upsert({
      where: { sourceRegistryEntryId: entry.id },
      update: {
        title: entry.label,
        status: verificationStatus,
        lastUpdated: fetchOutcome.fetchedAt,
        fetchedAt: fetchOutcome.fetchedAt,
        checksum,
        sourceConfidence: parseOk ? 0.9 : 0.3
      },
      create: {
        authorityId: entry.authorityId,
        sourceRegistryEntryId: entry.id,
        officialUrl: canonicalizeUrl(fetchOutcome.finalUrl),
        title: entry.label,
        kind: "WEB_PAGE",
        status: verificationStatus,
        lastUpdated: fetchOutcome.fetchedAt,
        fetchedAt: fetchOutcome.fetchedAt,
        checksum,
        sourceConfidence: parseOk ? 0.9 : 0.3,
        stateApplicability: entry.jurisdiction
      }
    });

    if (previousVersion) {
      await tx.sourceVersion.update({ where: { id: previousVersion.id }, data: { isCurrent: false } });
    }

    const newVersion = await tx.sourceVersion.create({
      data: {
        sourceId: governmentSource.id,
        checksum,
        fetchedAt: fetchOutcome.fetchedAt,
        httpStatus: fetchOutcome.status,
        contentType: fetchOutcome.contentType,
        rawText: fetchOutcome.body,
        parsedText,
        isCurrent: true
      }
    });

    await tx.verificationRecord.create({
      data: {
        sourceId: governmentSource.id,
        sourceVersionId: newVersion.id,
        status: verificationStatus,
        policy: entry.verificationPolicy,
        notes: verificationNotes
      }
    });

    let document = await tx.knowledgeDocument.findFirst({ where: { sourceId: governmentSource.id } });
    if (document) {
      document = await tx.knowledgeDocument.update({
        where: { id: document.id },
        data: { title: entry.label, industry: entry.industry, rawText: parsedText }
      });
      await tx.knowledgeChunk.deleteMany({ where: { documentId: document.id } });
    } else {
      document = await tx.knowledgeDocument.create({
        data: { sourceId: governmentSource.id, industry: entry.industry, title: entry.label, rawText: parsedText }
      });
    }

    const chunkContents = chunkText(parsedText, 1400);
    if (chunkContents.length > 0) {
      await tx.knowledgeChunk.createMany({
        data: chunkContents.map((content) => ({
          documentId: document.id,
          sourceId: governmentSource.id,
          content,
          tokenCount: Math.ceil(content.length / 4)
        }))
      });
    }

    return { governmentSource, version: newVersion };
  });

  await prisma.sourceRegistryEntry.update({
    where: { id: entry.id },
    data: { lastSuccessfulRunAt: fetchOutcome.fetchedAt, lastChangedAt: fetchOutcome.fetchedAt }
  });

  await recordEvent(runId, entry.id, "CHANGED", {
    checksum,
    httpStatus: fetchOutcome.status,
    sourceVersionId: version.id,
    message: verificationNotes
  });

  return {
    sourceRegistryEntryId: entry.id,
    label: entry.label,
    status: "CHANGED",
    message: verificationNotes,
    httpStatus: fetchOutcome.status,
    checksum
  };
}

function summarize(runId: string, results: SourceRunResult[]): IngestionRunSummary {
  const changedCount = results.filter((r) => r.status === "CHANGED").length;
  const unchangedCount = results.filter((r) => r.status === "UNCHANGED").length;
  const failedCount = results.filter((r) => r.status === "FAILED" || r.status === "REJECTED").length;
  const status: IngestionRunSummary["status"] = failedCount === 0 ? "SUCCEEDED" : failedCount === results.length ? "FAILED" : "PARTIAL";
  return { runId, status, sourceCount: results.length, changedCount, unchangedCount, failedCount, results };
}

export async function runIngestionForAllRegisteredSources(trigger: IngestionTrigger): Promise<IngestionRunSummary> {
  await assertNoConcurrentRun();
  const entries = await prisma.sourceRegistryEntry.findMany({ where: { status: "ACTIVE" } });
  const run = await prisma.ingestionRun.create({ data: { trigger, status: "RUNNING" } });

  const results: SourceRunResult[] = [];
  for (const entry of entries) {
    results.push(await runOneRegistryEntry(run.id, entry));
  }

  const summary = summarize(run.id, results);
  await prisma.ingestionRun.update({
    where: { id: run.id },
    data: {
      status: summary.status,
      finishedAt: new Date(),
      sourceCount: summary.sourceCount,
      changedCount: summary.changedCount,
      unchangedCount: summary.unchangedCount,
      failedCount: summary.failedCount
    }
  });

  return summary;
}

export async function runIngestionForRegistryEntryId(sourceRegistryEntryId: string, trigger: IngestionTrigger): Promise<IngestionRunSummary> {
  await assertNoConcurrentRun();
  const entry = await prisma.sourceRegistryEntry.findUnique({ where: { id: sourceRegistryEntryId } });
  if (!entry) throw new Error(`No SourceRegistryEntry with id "${sourceRegistryEntryId}".`);
  if (entry.status !== "ACTIVE") throw new Error(`SourceRegistryEntry "${entry.label}" is not ACTIVE.`);

  const run = await prisma.ingestionRun.create({ data: { trigger, status: "RUNNING" } });
  const results = [await runOneRegistryEntry(run.id, entry)];

  const summary = summarize(run.id, results);
  await prisma.ingestionRun.update({
    where: { id: run.id },
    data: {
      status: summary.status,
      finishedAt: new Date(),
      sourceCount: summary.sourceCount,
      changedCount: summary.changedCount,
      unchangedCount: summary.unchangedCount,
      failedCount: summary.failedCount
    }
  });

  return summary;
}
