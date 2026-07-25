import { PageHeader } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLatestNotifications } from "@/lib/knowledge/queries";

export default async function NotificationsPage() {
  const notifications = await getLatestNotifications();
  return (
    <>
      <PageHeader eyebrow="Alerts" title="Notifications" description="Government notifications, deadlines, renewals, missing documents, policy changes, and new source events." />
      <div className="grid gap-5 p-5 lg:p-8">
        {notifications.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.authority.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <a className="text-sm underline" href={item.officialUrl} target="_blank" rel="noreferrer">Open official source</a>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
