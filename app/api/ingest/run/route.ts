import { NextResponse } from "next/server";
import { runIngestionForAllRegisteredSources, runIngestionForRegistryEntryId } from "@/lib/ingestion/run-ingestion";
import { resolveRouteMode } from "@/lib/runtime/route-mode";

const DEMO_RESPONSE = {
  results: [],
  message: "Runtime ingestion is disabled for the demo. The curated official-source corpus is already loaded."
};

/**
 * Vercel Cron Jobs send a GET request and automatically attach
 * `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is configured. This route requires
 * that same bearer token in LIVE mode for both GET (the scheduled trigger) and POST
 * (manual/admin trigger) -- there is no anonymous path that can start a network fetch.
 */
function isAuthorizedRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function runTriggeredIngestion(request: Request) {
  const modeResult = resolveRouteMode();
  if ("response" in modeResult) return modeResult.response;

  if (modeResult.mode === "DEMO") {
    return NextResponse.json(DEMO_RESPONSE);
  }

  if (!isAuthorizedRequest(request)) {
    return NextResponse.json(
      { error: "Unauthorized. This endpoint requires a valid CRON_SECRET bearer token in LIVE mode." },
      { status: 401 }
    );
  }

  let sourceRegistryEntryId: string | undefined;
  try {
    const body = await request.json();
    sourceRegistryEntryId = typeof body?.sourceRegistryEntryId === "string" ? body.sourceRegistryEntryId : undefined;
  } catch {
    // No JSON body (the Vercel Cron GET trigger sends none) -> run every ACTIVE registry entry.
  }

  try {
    const summary = sourceRegistryEntryId
      ? await runIngestionForRegistryEntryId(sourceRegistryEntryId, "CRON")
      : await runIngestionForAllRegisteredSources("CRON");
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Ingestion run failed." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return runTriggeredIngestion(request);
}

export async function POST(request: Request) {
  return runTriggeredIngestion(request);
}
