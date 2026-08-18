"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { runRegisteredSourceIngestion } from "@/lib/ingestion/actions";
import type { RegistryOverviewEntry } from "@/lib/ingestion/registry-queries";

type RowState = { ok: boolean; message: string } | null;

/**
 * Runs a registered source ID only -- never an arbitrary URL. Ingestion rule 1 requires
 * the server-side fetch layer to accept only registered sources, so this form no longer
 * takes free-text URL/authority fields (that variant is what it replaced).
 */
export function IngestionForm({ mode, entries }: { mode: "DEMO" | "LIVE" | "UNAVAILABLE"; entries: RegistryOverviewEntry[] }) {
  const [rowState, setRowState] = useState<Record<string, RowState>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(entry: RegistryOverviewEntry) {
    setPendingId(entry.id);
    startTransition(async () => {
      const result = await runRegisteredSourceIngestion(entry.id);
      setRowState((prev) => ({ ...prev, [entry.id]: result }));
      setPendingId(null);
    });
  }

  if (mode !== "LIVE") {
    return (
      <p className="text-sm text-muted-foreground">
        {mode === "DEMO"
          ? "Ingestion is disabled in demo mode. The curated official-source corpus is already loaded; switch APP_DATA_MODE to live with a configured DATABASE_URL to run real ingestion."
          : "Ingestion is unavailable: the database is not reachable in live mode."}
      </p>
    );
  }

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No registry entries are seeded yet. Run `npm run prisma:seed` against your database.</p>;
  }

  return (
    <div className="grid gap-3">
      {entries.map((entry) => {
        const state = rowState[entry.id];
        return (
          <div key={entry.id} className="grid gap-2 rounded-md border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <strong>{entry.label}</strong>
                <p className="text-xs text-muted-foreground">
                  {entry.industry} · {entry.seedUrl}
                </p>
              </div>
              <Button type="button" size="sm" disabled={isPending && pendingId === entry.id} onClick={() => run(entry)}>
                {isPending && pendingId === entry.id ? "Running..." : "Run ingestion"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Current source status: {entry.currentSourceStatus ?? "not yet ingested"} · Last successful run:{" "}
              {entry.lastSuccessfulRunAt ? new Date(entry.lastSuccessfulRunAt).toLocaleString() : "never"}
            </p>
            {state ? <p className={`text-xs ${state.ok ? "text-muted-foreground" : "text-destructive"}`}>{state.message}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
