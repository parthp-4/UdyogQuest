import { PageHeader } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getKnowledgeArticles } from "@/lib/knowledge/queries";
import { VERIFIED_UNAVAILABLE } from "@/lib/constants";

export default async function KnowledgePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const articles = await getKnowledgeArticles(q);

  return (
    <>
      <PageHeader eyebrow="Verified corpus" title="Knowledge" description="Search official government articles, PDFs, circulars, notifications, FAQs, portals, and helplines stored in PostgreSQL." />
      <div className="grid gap-5 p-5 lg:p-8">
        <form className="flex gap-2" action="/knowledge">
          <Input name="q" placeholder="Search verified government sources" defaultValue={q ?? ""} />
          <button className="rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground" type="submit">Search</button>
        </form>
        <div className="grid gap-4">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <CardTitle>{article.title}</CardTitle>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{article.source.status ?? "VERIFIED"}</span>
                </div>
                <CardDescription>{article.summary ?? article.source.authority.name}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm text-muted-foreground">
                <div className="grid gap-3 lg:grid-cols-3">
                  <Info label="Authority" value={article.source.authority.name} />
                  <Info label="Last updated" value={article.source.lastUpdated?.toDateString() ?? VERIFIED_UNAVAILABLE} />
                  <Info label="Fetched" value={article.source.fetchedAt ? new Date(article.source.fetchedAt).toLocaleString() : VERIFIED_UNAVAILABLE} />
                  <Info label="Applicability" value={article.applicability ?? VERIFIED_UNAVAILABLE} />
                  <Info label="Documents required" value={article.requiredDocuments ?? VERIFIED_UNAVAILABLE} />
                  <Info label="Fees" value={article.fees ?? VERIFIED_UNAVAILABLE} />
                  <Info label="Timeline" value={article.processingTime ?? VERIFIED_UNAVAILABLE} />
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <a className="rounded-md border p-3 font-medium text-foreground underline hover:bg-secondary" href={article.source.officialUrl} target="_blank" rel="noreferrer">
                    Official website: {article.source.officialUrl}
                  </a>
                  <a className="rounded-md border p-3 font-medium text-foreground underline hover:bg-secondary" href={article.source.applicationPortal ?? article.source.officialUrl} target="_blank" rel="noreferrer">
                    Application portal: {article.source.applicationPortal ?? article.source.officialUrl}
                  </a>
                </div>
                <div className="grid gap-3 lg:grid-cols-3">
                  <Info label="Related articles" value={(article.relatedArticles ?? []).join(", ") || VERIFIED_UNAVAILABLE} />
                  <Info label="Related registrations" value={(article.relatedRegistrations ?? []).join(", ") || VERIFIED_UNAVAILABLE} />
                  <Info label="Related schemes" value={(article.relatedSchemes ?? []).join(", ") || VERIFIED_UNAVAILABLE} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-secondary/30 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 leading-6 text-foreground">{value}</p>
    </div>
  );
}
