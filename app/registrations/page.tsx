import { PageHeader } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getVerifiedRegistrations } from "@/lib/knowledge/queries";
import { VERIFIED_UNAVAILABLE } from "@/lib/constants";

export default async function RegistrationsPage() {
  const registrations = await getVerifiedRegistrations();
  return (
    <>
      <PageHeader eyebrow="Registrations" title="Registration Library" description="Eligibility, fees, processing, documents, dependencies, portals, helplines, FAQs, renewal, and penalties from verified sources." />
      <div className="grid gap-5 p-5 lg:p-8">
        {registrations.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.source.authority.name}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground lg:grid-cols-2">
              <p>Eligibility: {item.eligibility ?? VERIFIED_UNAVAILABLE}</p>
              <p>Fees: {item.fees ?? VERIFIED_UNAVAILABLE}</p>
              <p>Processing: {item.processingTime ?? VERIFIED_UNAVAILABLE}</p>
              <p>Documents: {item.requiredDocuments ?? VERIFIED_UNAVAILABLE}</p>
              <p>Renewal: {item.renewal ?? VERIFIED_UNAVAILABLE}</p>
              <p>Portal: <a className="underline" href={item.source.applicationPortal ?? item.source.officialUrl} target="_blank" rel="noreferrer">{item.source.applicationPortal ?? item.source.officialUrl}</a></p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
