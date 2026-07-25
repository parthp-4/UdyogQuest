import { PageHeader } from "@/components/layout/page-shell";
import { DependencyMap } from "@/components/flow/dependency-map";
import { getDependencyItems } from "@/lib/knowledge/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDemoProfiles } from "@/lib/demo/corpus";

export default async function TimelinePage() {
  const items = await getDependencyItems();
  const profiles = getDemoProfiles();
  return (
    <>
      <PageHeader eyebrow="Roadmap" title="Timeline" description="A visual roadmap of registrations, schemes, compliances, export steps, and food steps connected by verified dependencies." />
      <div className="grid gap-5 p-5 lg:p-8">
        <DependencyMap items={items} />
        <div className="grid gap-5 lg:grid-cols-2">
          {profiles.map((profile) => (
            <Card key={profile.id}>
              <CardHeader>
                <CardTitle>{profile.ownerName} roadmap</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {profile.timeline.map((step) => (
                  <div key={step.id} className="rounded-md border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <strong>{step.title}</strong>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{step.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{step.why}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{step.week} · {step.authority} · Dependency: {step.dependency}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
