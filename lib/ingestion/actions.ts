"use server";

import { revalidatePath } from "next/cache";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { runIngestionForRegistryEntryId } from "@/lib/ingestion/run-ingestion";
import { getAppDataMode } from "@/lib/runtime/mode";

export type RunIngestionActionResult = { ok: true; message: string } | { ok: false; message: string };

/**
 * Settings "Run ingestion" trigger. Runs server-side against a registered source ID only
 * (never a user-supplied URL) and never touches the network from the browser -- the
 * CRON_SECRET used by the scheduled /api/ingest/run trigger is not needed here since this
 * is a direct in-process call, not an HTTP request to this app's own route.
 */
export async function runRegisteredSourceIngestion(sourceRegistryEntryId: string): Promise<RunIngestionActionResult> {
  const mode = getAppDataMode();

  if (mode === "DEMO") {
    return { ok: true, message: "Runtime ingestion is disabled for the demo. The curated official-source corpus is already loaded." };
  }

  try {
    const summary = await runIngestionForRegistryEntryId(sourceRegistryEntryId, "MANUAL");
    revalidatePath("/settings");
    revalidatePath("/knowledge");
    revalidatePath("/dashboard");
    const [result] = summary.results;
    return { ok: summary.status !== "FAILED", message: `${result?.label ?? sourceRegistryEntryId}: ${result?.status ?? summary.status} - ${result?.message ?? ""}` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Ingestion run failed." };
  }
}

export async function verifySource(formData: FormData) {
  const sourceId = String(formData.get("sourceId") ?? "");
  const confidence = Number(formData.get("sourceConfidence") ?? 0.9);

  if (!sourceId) return;
  if (!isDatabaseConfigured()) return;

  await prisma.governmentSource.update({
    where: { id: sourceId },
    data: {
      status: "VERIFIED",
      sourceConfidence: Math.max(0, Math.min(1, confidence))
    }
  });

  revalidatePath("/settings");
  revalidatePath("/knowledge");
  revalidatePath("/dashboard");
}
