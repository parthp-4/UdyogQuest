import { PageHeader } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IngestionForm } from "@/components/forms/ingestion-form";
import { SUPPORTED_INDUSTRIES } from "@/lib/constants";
import { getLatestVerifiedSources } from "@/lib/knowledge/queries";

export default async function SettingsPage() {
  const verifiedSources = await getLatestVerifiedSources(12);

  return (
    <>
      <PageHeader eyebrow="Administration" title="Settings" description="Demo controls, supported industries, and verified-source audit trail for the curated corpus." />
      <div className="grid gap-5 p-5 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Demo mode</CardTitle>
            <CardDescription>The application is running from a curated official-source corpus so every page works without database setup.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground lg:grid-cols-3">
            <div className="rounded-md border bg-secondary/40 p-4">
              <strong className="text-foreground">Corpus mode</strong>
              <p className="mt-1">Curated demo dataset</p>
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
        <Card>
          <CardHeader>
            <CardTitle>Verified source audit trail</CardTitle>
            <CardDescription>Official websites and portals used by the demo knowledge base.</CardDescription>
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
            <CardTitle>Add official source</CardTitle>
            <CardDescription>Runtime ingestion is disabled for this demo. Submitting checks the request against the curated corpus instead of writing to a live database.</CardDescription>
          </CardHeader>
          <CardContent>
            <IngestionForm />
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
