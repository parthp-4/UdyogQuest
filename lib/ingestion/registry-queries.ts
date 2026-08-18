import { prisma } from "@/lib/db/prisma";

export type RegistryOverviewEntry = {
  id: string;
  label: string;
  industry: string;
  seedUrl: string;
  status: string;
  lastSuccessfulRunAt: Date | null;
  lastChangedAt: Date | null;
  currentSourceStatus: string | null;
};

/** Callers must confirm LIVE mode (via getRuntimeStatus()) before calling this -- it does not check itself. */
export async function getSourceRegistryOverview(): Promise<RegistryOverviewEntry[]> {
  const entries = await prisma.sourceRegistryEntry.findMany({
    include: { governmentSource: true },
    orderBy: { label: "asc" }
  });

  return entries.map((entry) => ({
    id: entry.id,
    label: entry.label,
    industry: entry.industry,
    seedUrl: entry.seedUrl,
    status: entry.status,
    lastSuccessfulRunAt: entry.lastSuccessfulRunAt,
    lastChangedAt: entry.lastChangedAt,
    currentSourceStatus: entry.governmentSource?.status ?? null
  }));
}

export type IngestionRunOverview = {
  id: string;
  trigger: string;
  status: string;
  startedAt: Date;
  finishedAt: Date | null;
  sourceCount: number;
  changedCount: number;
  unchangedCount: number;
  failedCount: number;
  events: Array<{ id: string; label: string; status: string; message: string | null; createdAt: Date }>;
};

/** Callers must confirm LIVE mode (via getRuntimeStatus()) before calling this -- it does not check itself. */
export async function getRecentIngestionRuns(limit = 10): Promise<IngestionRunOverview[]> {
  const runs = await prisma.ingestionRun.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
    include: { events: { include: { sourceRegistryEntry: true }, orderBy: { createdAt: "asc" } } }
  });

  return runs.map((run) => ({
    id: run.id,
    trigger: run.trigger,
    status: run.status,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    sourceCount: run.sourceCount,
    changedCount: run.changedCount,
    unchangedCount: run.unchangedCount,
    failedCount: run.failedCount,
    events: run.events.map((event) => ({
      id: event.id,
      label: event.sourceRegistryEntry.label,
      status: event.status,
      message: event.message,
      createdAt: event.createdAt
    }))
  }));
}
