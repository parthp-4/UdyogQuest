import Link from "next/link";
import { LayoutDashboard, UserRound, Library, Route, FileText, ClipboardCheck, BadgeIndianRupee, ShieldCheck, Globe2, Utensils, Bot, CalendarClock, Bell, Settings } from "lucide-react";

const nav = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/profile", "Profile", UserRound],
  ["/knowledge", "Knowledge", Library],
  ["/journey", "Journey", Route],
  ["/documents", "Documents", FileText],
  ["/registrations", "Registrations", ClipboardCheck],
  ["/schemes", "Schemes", BadgeIndianRupee],
  ["/compliance", "Compliance", ShieldCheck],
  ["/export", "Export", Globe2],
  ["/food", "Food", Utensils],
  ["/assistant", "AI Assistant", Bot],
  ["/timeline", "Timeline", CalendarClock],
  ["/notifications", "Notifications", Bell],
  ["/settings", "Settings", Settings]
] as const;

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r bg-card p-4 lg:block">
      <div className="mb-6 px-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Platform</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">UdyogQuest</h1>
      </div>
      <nav className="grid gap-1">
        {nav.map(([href, label, Icon]) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

