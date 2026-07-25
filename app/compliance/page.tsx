import { PageHeader } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getVerifiedRegistrations } from "@/lib/knowledge/queries";
import { VERIFIED_UNAVAILABLE } from "@/lib/constants";

export default async function CompliancePage() {
  const items = await getVerifiedRegistrations();
  return (
    <>
      <PageHeader eyebrow="Compliance" title="Compliance" description="Renewals, penalties, dependencies, deadlines, and compliance events from verified government records." />
      <div className="grid gap-5 p-5 lg:p-8">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.source.authority.name}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground">
              <p>Renewal: {item.renewal ?? VERIFIED_UNAVAILABLE}</p>
              <p>Validity: {item.validity ?? VERIFIED_UNAVAILABLE}</p>
              <p>Dependencies: {item.dependencies ?? VERIFIED_UNAVAILABLE}</p>
              <p>Official source: <a className="underline" href={item.source.officialUrl} target="_blank" rel="noreferrer">{item.source.officialUrl}</a></p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
