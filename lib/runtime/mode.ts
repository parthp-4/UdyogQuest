import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export type AppDataMode = "DEMO" | "LIVE";
export type RuntimeStatus = { mode: AppDataMode | "UNAVAILABLE"; reason?: string };

/**
 * Single explicit runtime-mode switch. Replaces the old per-file
 * `NEXT_PUBLIC_DEMO_MODE !== "false" || !isDatabaseConfigured()` heuristic that every
 * query/API boundary duplicated. APP_DATA_MODE defaults to "demo" so local development
 * without a database keeps working; it must be explicitly set to "live" to serve
 * database-backed data, and doing so without DATABASE_URL fails loudly instead of
 * silently falling back to the demo corpus.
 */
function readConfiguredMode(): AppDataMode {
  const raw = (process.env.APP_DATA_MODE ?? "demo").trim().toLowerCase();
  if (raw === "demo") return "DEMO";
  if (raw === "live") return "LIVE";
  throw new Error(`Invalid APP_DATA_MODE "${process.env.APP_DATA_MODE}". Expected "demo" or "live".`);
}

/**
 * Throws if LIVE mode is selected but DATABASE_URL is missing. Call this from every
 * data boundary (query functions, server actions, API routes) instead of reading
 * environment variables directly, so misconfiguration fails at the point of use
 * rather than silently serving demo data.
 */
export function getAppDataMode(): AppDataMode {
  const mode = readConfiguredMode();
  if (mode === "LIVE" && !isDatabaseConfigured()) {
    throw new Error(
      "APP_DATA_MODE=live requires DATABASE_URL to be set. Refusing to silently fall back to the demo corpus. " +
        "Set DATABASE_URL to a reachable PostgreSQL connection string, or set APP_DATA_MODE=demo for local development."
    );
  }
  return mode;
}

export function isLiveMode(): boolean {
  return getAppDataMode() === "LIVE";
}

/**
 * Non-throwing status for UI display (dashboard/settings mode badge). Distinguishes a
 * misconfiguration (LIVE selected without DATABASE_URL) and a live-but-unreachable
 * database from a healthy LIVE or DEMO state, without crashing the page that renders it.
 */
export async function getRuntimeStatus(): Promise<RuntimeStatus> {
  let mode: AppDataMode;
  try {
    mode = getAppDataMode();
  } catch (error) {
    return { mode: "UNAVAILABLE", reason: error instanceof Error ? error.message : "Runtime mode is misconfigured." };
  }

  if (mode === "DEMO") return { mode: "DEMO" };

  const reachable = await isDatabaseReachable();
  return reachable ? { mode: "LIVE" } : { mode: "UNAVAILABLE", reason: "DATABASE_URL is set but the database did not respond to a health check." };
}

async function isDatabaseReachable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
