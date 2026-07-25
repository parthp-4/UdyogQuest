import type { Metadata } from "next";
import "./globals.css";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "UdyogQuest",
  description: "Verified government-source operating system for food and export/import businesses."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}

