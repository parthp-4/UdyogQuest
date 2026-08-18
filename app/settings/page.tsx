import { PageHeader } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IngestionForm } from "@/components/forms/ingestion-form";
import { SUPPORTED_INDUSTRIES } from "@/lib/constants";
import { getLatestVerifiedSources } from "@/lib/knowledge/queries";
import { getRecentIngestionRuns, getSourceRegistryOverview } from "@/lib/ingestion/registry-queries";
import { getRuntimeStatus } from "@/lib/runtime/mode";

const modeBadgeClass: Record<string, string> = {
  LIVE: "bg-emerald-50 text-emerald-700",
  DEMO: "bg-amber-50 text-amber-800",
  UNAVAILABLE: "bg-rose-50 text-rose-700"
};

export default async function SettingsPage() {
  const runtimeStatus = await getRuntimeStatus();
  const isLive = runtimeStatus.mode === "LIVE";

  const [verifiedSources, registryEntries, recentRuns] = await Promise.all([
    runtimeStatus.mode === "UNAVAILABLE" ? Promise.resolve([]) : getLatestVerifiedSources(12),
    isLive ? getSourceRegistryOverview() : Promise.resolve([]),
    isLive ? getRecentIngestionRuns(5) : Promise.resolve([])
  ]);

  const needsReview = registryEntries.filter((entry) => entry.currentSourceStatus === "NEEDS_REVIEW");

  return (
    <>
      <PageHeader eyebrow="Administration" title="Settings" description="Runtime mode, database health, source registry, ingestion runs, and verified-source audit trail." />
      <div className="grid gap-5 p-5 lg:p-8">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Runtime mode</CardTitle>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${modeBadgeClass[runtimeStatus.mode]}`}>{runtimeStatus.mode}</span>
            </div>
            <CardDescription>
              {runtimeStatus.mode === "DEMO" && "Serving the curated demo corpus. Set APP_DATA_MODE=live with a reachable DATABASE_URL to serve persisted data instead."}
              {runtimeStatus.mode === "LIVE" && "Serving persisted PostgreSQL data. The demo corpus is not used while this mode is active."}
              {runtimeStatus.mode === "UNAVAILABLE" && (runtimeStatus.reason ?? "Runtime mode is misconfigured or the database is unreachable.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground lg:grid-cols-3">
            <div className="rounded-md border bg-secondary/40 p-4">
              <strong className="text-foreground">Data source</strong>
              <p className="mt-1">{runtimeStatus.mode === "LIVE" ? "PostgreSQL (Prisma)" : "Curated demo dataset"}</p>
            </div>
            <div className="rounded-md border bg-secondary/40 p-4">
              <strong className="text-foreground">Industries</strong>
              <p className="mt-1">Food and Export / Import</p>
            </div>
            <div className="rounded-md border bg-secondary/40 p-4">
              <strong className="text-foreground">Answer policy</strong>
              <p className="mt-1">Use stored official citations; mark unknowns unavailable.</p>
            </div>
          </CardContent>
        </Card>

        {isLive ? (
          <Card>
            <CardHeader>
              <CardTitle>Source registry</CardTitle>
              <CardDescription>Allowlisted official hosts the ingestion pipeline is permitted to fetch from.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {registryEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No registry entries seeded yet. Run `npm run prisma:seed`.</p>
              ) : (
                registryEntries.map((entry) => (
                  <div key={entry.id} className="rounded-md border p-4 text-sm text-muted-foreground">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <strong className="text-foreground">{entry.label}</strong>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{entry.status}</span>
                    </div>
                    <p className="mt-1">
                      {entry.industry} · {entry.seedUrl}
                    </p>
                    <p className="mt-1">Current verification: {entry.currentSourceStatus ?? "not yet ingested"}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : null}

        {isLive ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent ingestion runs</CardTitle>
              <CardDescription>Every run is recorded, including failures -- a failed fetch is visible, not silently empty.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {recentRuns.length === 0 ? (
                <p className="text-sm text-muted-foreground">No ingestion runs recorded yet.</p>
              ) : (
                recentRuns.map((run) => (
                  <div key={run.id} className="rounded-md border p-4 text-sm text-muted-foreground">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <strong className="text-foreground">
                        {run.trigger} run · {new Date(run.startedAt).toLocaleString()}
                      </strong>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{run.status}</span>
                    </div>
                    <p className="mt-1">
                      {run.sourceCount} sources · {run.changedCount} changed · {run.unchangedCount} unchanged · {run.failedCount} failed
                    </p>
                    <ul className="mt-2 list-disc pl-5">
                      {run.events.map((event) => (
                        <li key={event.id}>
                          {event.label}: {event.status} {event.message ? `- ${event.message}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : null}

        {isLive && needsReview.length > 0 ? (
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle>Verification queue</CardTitle>
              <CardDescription>Sources marked NEEDS_REVIEW did not pass the automated verification policy and require human review before use.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {needsReview.map((entry) => (
                <div key={entry.id} className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <strong>{entry.label}</strong> · {entry.seedUrl}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Verified source audit trail</CardTitle>
            <CardDescription>{isLive ? "Verified sources currently persisted in PostgreSQL." : "Official websites and portals used by the demo knowledge base."}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {verifiedSources.map((source) => (
              <a key={source.id} href={source.officialUrl} target="_blank" rel="noreferrer" className="flex flex-col gap-3 rounded-md border p-4 hover:bg-secondary lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <strong>{source.title}</strong>
                  <p className="text-sm text-muted-foreground">{source.authority.name} · {source.officialUrl}</p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">Verified</span>
              </a>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Run registered source ingestion</CardTitle>
            <CardDescription>
              {isLive
                ? "Triggers a real fetch -> parse -> checksum -> version -> verify -> persist run for one registered source. Never accepts an arbitrary URL."
                : "Disabled in demo/unavailable mode. Enable live mode with a configured database to run real ingestion."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IngestionForm mode={runtimeStatus.mode} entries={registryEntries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supported industries</CardTitle>
            <CardDescription>Scope is intentionally narrow for version one.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {SUPPORTED_INDUSTRIES.map((industry) => (
              <div key={industry.id} className="rounded-md border p-4">
                <strong>{industry.label}</strong>
                <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
                  {industry.examples.map((example) => <li key={example}>{example}</li>)}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
