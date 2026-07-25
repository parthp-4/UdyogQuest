import crypto from "node:crypto";
import { isDatabaseConfigured, prisma } from "../db/prisma";
import { ingestionSourceSchema, type IngestionSourceInput } from "./schema";

export async function ingestOfficialSource(input: IngestionSourceInput) {
  if (!isDatabaseConfigured()) {
    throw new Error("Runtime ingestion is disabled for the demo. The curated official-source corpus is already loaded.");
  }

  const parsed = ingestionSourceSchema.parse(input);
  const response = await fetch(parsed.officialUrl, {
    headers: {
      "User-Agent": "UdyogQuestSourceIngestion/0.1 verified-government-corpus"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch official source: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "text/plain";
  const text = await response.text();
  const checksum = crypto.createHash("sha256").update(text).digest("hex");
  const authority = await prisma.authority.upsert({
    where: {
      name_jurisdiction: {
        name: parsed.authorityName,
        jurisdiction: parsed.stateApplicability ?? "India"
      }
    },
    update: {
      websiteUrl: parsed.authorityWebsite
    },
    create: {
      name: parsed.authorityName,
      jurisdiction: parsed.stateApplicability ?? "India",
      websiteUrl: parsed.authorityWebsite
    }
  });

  const source = await prisma.governmentSource.upsert({
    where: { officialUrl: parsed.officialUrl },
    update: {
      title: parsed.title,
      kind: parsed.kind,
      fetchedAt: new Date(),
      checksum,
      status: "PENDING",
      stateApplicability: parsed.stateApplicability,
      districtApplicability: parsed.districtApplicability,
      metadata: { contentType }
    },
    create: {
      authorityId: authority.id,
      officialUrl: parsed.officialUrl,
      title: parsed.title,
      kind: parsed.kind,
      fetchedAt: new Date(),
      checksum,
      status: "PENDING",
      stateApplicability: parsed.stateApplicability,
      districtApplicability: parsed.districtApplicability,
      metadata: { contentType }
    }
  });

  const document = await prisma.knowledgeDocument.create({
    data: {
      sourceId: source.id,
      industry: parsed.industry,
      title: parsed.title,
      rawText: stripHtml(text)
    }
  });

  const chunks = chunkText(stripHtml(text), 1400).map((content) => ({
    documentId: document.id,
    sourceId: source.id,
    content,
    tokenCount: Math.ceil(content.length / 4)
  }));

  if (chunks.length) {
    await prisma.knowledgeChunk.createMany({ data: chunks });
  }

  return { sourceId: source.id, documentId: document.id, chunks: chunks.length };
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function chunkText(value: string, size: number) {
  const chunks: string[] = [];
  for (let index = 0; index < value.length; index += size) {
    const chunk = value.slice(index, index + size).trim();
    if (chunk) chunks.push(chunk);
  }
  return chunks;
}
