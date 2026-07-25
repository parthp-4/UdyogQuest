import { PageHeader } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSchemeKnowledge } from "@/lib/knowledge/queries";
import { VERIFIED_UNAVAILABLE } from "@/lib/constants";

export default async function SchemesPage() {
  const schemes = await getSchemeKnowledge();
  return (
    <>
      <PageHeader eyebrow="Schemes" title="Scheme Intelligence" description="Eligibility, benefits, timeline, fees, documents, circulars, FAQs, portals, related schemes, and latest updates from verified records." />
      <div className="grid gap-5 p-5 lg:p-8">
        {schemes.map((scheme) => (
          <Card key={scheme.id}>
            <CardHeader>
              <CardTitle>{scheme.title}</CardTitle>
              <CardDescription>{scheme.source.authority.name}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground">
              <p>Eligibility: {scheme.eligibility ?? VERIFIED_UNAVAILABLE}</p>
              <p>Benefits: {scheme.benefits ?? VERIFIED_UNAVAILABLE}</p>
              <p>Fees: {scheme.fees ?? VERIFIED_UNAVAILABLE}</p>
              <p>Timeline: {scheme.processingTime ?? VERIFIED_UNAVAILABLE}</p>
              <p>Documents: {scheme.requiredDocuments ?? VERIFIED_UNAVAILABLE}</p>
              <p>Official link: <a className="underline" href={scheme.source.officialUrl} target="_blank" rel="noreferrer">{scheme.source.officialUrl}</a></p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
