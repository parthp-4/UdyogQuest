import { PageHeader } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUploadForm } from "@/components/forms/document-upload-form";
import { getDemoProfiles } from "@/lib/demo/corpus";

export default function DocumentsPage() {
  const profiles = getDemoProfiles();
  const primaryProfile = profiles[0];

  return (
    <>
      <PageHeader eyebrow="Document intelligence" title="Document Vault" description="Upload PDFs, images, or scans. Gemini Vision extracts visible facts, mismatches, expiry, missing pages, and reusable fields." />
      <div className="grid gap-5 p-5 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Demo upload workflow</CardTitle>
            <CardDescription>Uploads return a demo-safe extraction preview and never fail because of missing database configuration.</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploadForm profileId={primaryProfile.id} />
          </CardContent>
        </Card>
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader>
              <CardTitle>{profile.ownerName} document packet</CardTitle>
              <CardDescription>{profile.businessActivity} · {profile.city}, {profile.state}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {profile.documents.map((document) => (
                <div key={document.id} className="rounded-md border p-4">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <strong>{document.fileName}</strong>
                      <p className="text-sm text-muted-foreground">{document.documentType} · {document.aiExtractionStatus}</p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{document.status}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground lg:grid-cols-3">
                    <p><strong className="text-foreground">Accepted format:</strong> {document.acceptedFormat}</p>
                    <p><strong className="text-foreground">Maximum size:</strong> {document.maximumSize}</p>
                    <p><strong className="text-foreground">Reuse count:</strong> {document.reuseCount}</p>
                    <p><strong className="text-foreground">Authority:</strong> {document.governmentAuthority}</p>
                    <p><strong className="text-foreground">Expiry:</strong> {document.expiry}</p>
                    <p><strong className="text-foreground">Required for:</strong> {document.requiredFor.join(", ")}</p>
                    <p className="lg:col-span-3"><strong className="text-foreground">Missing/mismatch:</strong> {[...document.missingFields, ...document.mismatchFlags].join(", ") || "None"}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
