import { PageHeader } from "@/components/layout/page-shell";
import { DependencyMap } from "@/components/flow/dependency-map";
import { getDependencyItems } from "@/lib/knowledge/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function JourneyPage() {
  const items = await getDependencyItems();
  return (
    <>
      <PageHeader eyebrow="Dependency engine" title="Journey" description="Registrations, certifications, subsidies, and export/food steps unlock from verified source-backed dependency rules." />
      <div className="grid gap-5 p-5 lg:p-8">
        <DependencyMap items={items} />
        <Card>
          <CardHeader>
            <CardTitle>Dependency explanations</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-2">
            {items.map((item) => (
              <div key={item.id} className="rounded-md border p-4">
                <strong>{item.label}</strong>
                <p className="mt-1 text-sm text-muted-foreground">{item.why ?? "Dependency reason stored in verified rule corpus."}</p>
                <p className="mt-2 text-xs text-muted-foreground">Depends on: {item.dependsOn.length ? item.dependsOn.join(", ") : "Profile data"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
