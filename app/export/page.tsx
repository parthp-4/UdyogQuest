import { PageHeader } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getKnowledgeByIndustry } from "@/lib/knowledge/queries";
import { VERIFIED_UNAVAILABLE } from "@/lib/constants";

export default async function ExportPage() {
  const articles = await getKnowledgeByIndustry("EXPORT_IMPORT");
  return (
    <>
      <PageHeader eyebrow="Export / Import" title="Export OS" description="IEC, DGFT, ICEGATE, export councils, incentives, finance, certification, and market-linkage guidance from verified sources only." />
      <div className="grid gap-5 p-5 lg:p-8">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <CardTitle>{article.title}</CardTitle>
              <CardDescription>{article.summary ?? article.source.authority.name}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground lg:grid-cols-2">
              <p><strong className="text-foreground">Authority:</strong> {article.source.authority.name}</p>
              <p><strong className="text-foreground">Applicability:</strong> {article.applicability ?? VERIFIED_UNAVAILABLE}</p>
              <p><strong className="text-foreground">Documents:</strong> {article.requiredDocuments ?? VERIFIED_UNAVAILABLE}</p>
              <p><strong className="text-foreground">Fees:</strong> {article.fees ?? VERIFIED_UNAVAILABLE}</p>
              <p><strong className="text-foreground">Processing:</strong> {article.processingTime ?? VERIFIED_UNAVAILABLE}</p>
              <p><strong className="text-foreground">Dependencies:</strong> {article.dependencies ?? VERIFIED_UNAVAILABLE}</p>
              <a className="font-medium text-foreground underline" href={article.source.officialUrl} target="_blank" rel="noreferrer">Official source</a>
              <a className="font-medium text-foreground underline" href={article.source.applicationPortal ?? article.source.officialUrl} target="_blank" rel="noreferrer">Application portal</a>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
