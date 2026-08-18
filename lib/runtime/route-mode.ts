import { NextResponse } from "next/server";
import { getAppDataMode, type AppDataMode } from "@/lib/runtime/mode";

/**
 * Route-handler variant of getAppDataMode(): converts the "LIVE selected without
 * DATABASE_URL" failure into a structured 503 instead of an unhandled 500, while still
 * refusing to silently serve demo data for a misconfigured LIVE deployment.
 */
export function resolveRouteMode(): { mode: AppDataMode } | { response: NextResponse } {
  try {
    return { mode: getAppDataMode() };
  } catch (error) {
    return {
      response: NextResponse.json(
        { error: error instanceof Error ? error.message : "Runtime mode is misconfigured." },
        { status: 503 }
      )
    };
  }
}
