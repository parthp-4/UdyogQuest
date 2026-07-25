import { PageHeader } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OnboardingForm } from "@/components/forms/onboarding-form";
import { RecommendationAction } from "@/components/forms/recommendation-action";
import { VERIFIED_UNAVAILABLE } from "@/lib/constants";
import { calculateProfileScores, getDemoProfiles } from "@/lib/demo/corpus";

export default function ProfilePage() {
  const profiles = getDemoProfiles();

  return (
    <>
      <PageHeader eyebrow="Onboarding" title="Business Profile" description="Collect the data needed to evaluate food and export/import registrations, schemes, documents, and compliance." />
      <div className="grid gap-5 p-5 lg:p-8">
        <div className="grid gap-5 lg:grid-cols-2">
          {profiles.map((profile) => {
            const scores = calculateProfileScores(profile);
            return (
              <Card key={profile.id}>
                <CardHeader>
                  <CardTitle>{profile.ownerName}</CardTitle>
                  <CardDescription>{profile.businessName} · {profile.businessActivity} · {profile.city}, {profile.state}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-3 text-sm lg:grid-cols-3">
                    <Metric label="Readiness" value={`${scores.readiness}%`} />
                    <Metric label="Documents" value={`${scores.documentCompletion}%`} />
                    <Metric label="Opportunity" value={`${scores.opportunityScore}%`} />
                  </div>
                  <div className="grid gap-2 text-sm text-muted-foreground lg:grid-cols-2">
                    <p><strong className="text-foreground">Category:</strong> {profile.socialCategory}</p>
                    <p><strong className="text-foreground">Gender:</strong> {profile.gender}</p>
                    <p><strong className="text-foreground">Age:</strong> {profile.age}</p>
                    <p><strong className="text-foreground">Ownership:</strong> {profile.ownership}</p>
                    <p><strong className="text-foreground">Turnover:</strong> Rs. {profile.turnover.toLocaleString("en-IN")}</p>
                    <p><strong className="text-foreground">Investment:</strong> Rs. {profile.investment.toLocaleString("en-IN")}</p>
                    <p><strong className="text-foreground">Premises:</strong> {profile.premises}</p>
                    <p><strong className="text-foreground">Languages:</strong> {profile.languages.join(", ")}</p>
                  </div>
                  <RecommendationAction profileId={profile.id} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {profiles.map((profile) => (
          <Card key={`${profile.id}-intel`}>
            <CardHeader>
              <CardTitle>{profile.ownerName} Profile Intelligence</CardTitle>
              <CardDescription>Source-backed recommendations generated from curated rules and profile evidence. AI explains; deterministic checks decide.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {profile.recommendations.map((recommendation) => (
                <div key={recommendation.id} className="rounded-md border p-4">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <strong>{recommendation.title}</strong>
                      <p className="mt-1 text-sm text-muted-foreground">{recommendation.why || VERIFIED_UNAVAILABLE}</p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{recommendation.status}</span>
                  </div>
                  <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
                    <p>Expected benefit: {recommendation.expectedBenefit ?? VERIFIED_UNAVAILABLE}</p>
                    <p>Expected timeline: {recommendation.expectedTimeline ?? VERIFIED_UNAVAILABLE}</p>
                    <p>Why now: {recommendation.whyNow}</p>
                    <p>If skipped: {recommendation.skippedImpact}</p>
                    <p>Estimated delay: {recommendation.estimatedDelay}</p>
                    <p>Documents needed: {recommendation.documentsNeeded.length ? recommendation.documentsNeeded.join(", ") : VERIFIED_UNAVAILABLE}</p>
                    <p>Official portal: {recommendation.officialPortal ?? VERIFIED_UNAVAILABLE}</p>
                    <p>Application steps: {recommendation.applicationSteps ?? VERIFIED_UNAVAILABLE}</p>
                    <p>AI confidence: {recommendation.confidence}%</p>
                  </div>
                  <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                    {recommendation.citations.map((citation) => (
                      <a key={citation.id} className="underline" href={citation.source.officialUrl} target="_blank" rel="noreferrer">Source: {citation.source.title} · {citation.source.officialUrl}</a>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Create AI profile</CardTitle>
            <CardDescription>Demo onboarding workflow. Submission returns a profile preview without requiring database setup.</CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-secondary/40 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
