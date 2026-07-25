import Link from "next/link";
import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthScoreChart } from "@/components/charts/health-score-chart";
import { getDemoDashboardData } from "@/lib/demo/corpus";

export default function DashboardPage() {
  const dashboard = getDemoDashboardData();
  const primary = dashboard.profileCards[0];

  return (
    <>
      <PageHeader
        eyebrow="Operating system"
        title="Dashboard"
        description="Demo-ready operating view for Priya's food business and Rahul's export/import workflow, powered by a curated official-source corpus."
        action={
          <Button asChild>
            <Link href="/profile">View profiles</Link>
          </Button>
        }
      />
      <div className="grid gap-5 p-5 lg:grid-cols-3 lg:p-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Business Health Score</CardTitle>
            <CardDescription>
              {primary.profile.ownerName} · {primary.profile.businessActivity} · {primary.profile.city}, {primary.profile.state}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HealthScoreChart
              data={[
                { label: "Readiness", value: primary.scores.readiness },
                { label: "Profile", value: primary.scores.profileCompletion },
                { label: "Documents", value: primary.scores.documentCompletion },
                { label: "Registrations", value: primary.scores.registrationCompletion },
                { label: "Timeline", value: primary.scores.timelineScore }
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Knowledge Statistics</CardTitle>
            <CardDescription>Curated official-source demo corpus for two industries.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Metric label="Verified sources" value={dashboard.knowledgeSummary.verifiedSources} />
            <Metric label="Knowledge articles" value={dashboard.knowledgeSummary.documents} />
            <Metric label="Dependency rules" value={dashboard.knowledgeSummary.rules} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>Next actions are computed from the two demo profiles, their documents, and source-linked dependency graph.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-2">
            {dashboard.profileCards.flatMap((card) =>
              card.pendingActions.map((action) => (
                <div key={`${card.profile.id}-${action.id}`} className="rounded-md border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong>{card.profile.ownerName}: {action.title}</strong>
                      <p className="mt-1 text-sm text-muted-foreground">{action.why}</p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{action.status}</span>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{action.authority} · {action.week}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Money Available</CardTitle>
            <CardDescription>Scheme routes with official citations.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {dashboard.moneyAvailable.map((item) => (
              <a key={item.title} href={item.source.officialUrl} target="_blank" rel="noreferrer" className="rounded-md border p-3 text-sm hover:bg-secondary">
                <strong>{item.title}</strong>
                <p className="mt-1 text-muted-foreground">{item.value}</p>
              </a>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Demo workflow reminders with official-source context.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {dashboard.deadlines.map((deadline) => (
              <a key={deadline.id} href={deadline.source.officialUrl} target="_blank" rel="noreferrer" className="rounded-md border p-3 text-sm hover:bg-secondary">
                <strong>{deadline.title}</strong>
                <p className="mt-1 text-muted-foreground">{deadline.authority} · {deadline.due}</p>
              </a>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Government Updates</CardTitle>
            <CardDescription>Official sources active in the demo corpus.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {dashboard.latestUpdates.map((source) => (
              <a key={source.id} href={source.officialUrl} className="rounded-md border p-3 text-sm hover:bg-secondary" target="_blank" rel="noreferrer">
                <strong>{source.title}</strong>
                <p className="mt-1 text-muted-foreground">{source.authority.name}</p>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-secondary/40 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
