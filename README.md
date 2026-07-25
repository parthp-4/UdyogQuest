# UdyogQuest

UdyogQuest is an AI operating system for Indian food and export/import businesses. It helps founders understand which registrations, documents, schemes, compliance actions, and export steps apply to them using source-cited government knowledge.

This repository contains the Round 1 demo version of the platform. It is designed to run without any database setup during a hackathon demo while still showing realistic workflows, profiles, search, recommendations, dependency graphs, document intelligence, and an AI assistant.

## Demo Scope

The demo supports two industries:

- Food businesses: cloud kitchen, restaurant, cafe, bakery, dairy, food processing, pickle unit, meat shop, grocery with food license.
- Export / import businesses: merchant exporter, manufacturer exporter, importer, trading company, export house, DGFT-related businesses.

The curated demo profiles are:

- Priya Sharma: cloud kitchen in Lucknow, Uttar Pradesh.
- Rahul Mehta: merchant exporter in Ahmedabad, Gujarat.

## What Works

- Dashboard with readiness, documents, opportunities, deadlines, and official updates.
- Profile intelligence for Priya and Rahul.
- Knowledge search across curated official-source records.
- Registration and scheme pages.
- Food and export/import operating views.
- Document vault with extraction/reuse status and upload preview.
- Journey and timeline dependency graph using React Flow.
- AI assistant that answers from the curated corpus and returns citations.
- Demo-safe APIs that do not fail when PostgreSQL is not configured.

## Source Policy

User-facing government information is tied to official government or government-linked sources. If a detail is not verified in the curated corpus, the app displays:

> Information unavailable from verified government source.

Official source anchors include FoSCoS/FSSAI, PMFME, Udyam, GST, DGFT, ICEGATE, APEDA, GeM, MUDRA, Stand-Up India, and other relevant portals.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible components
- Prisma schema
- PostgreSQL-ready architecture
- Zustand
- React Hook Form
- Zod
- React Flow
- Recharts
- Gemini-ready AI service layer
- Vercel-ready route handlers

## Run Locally

Use Node.js 20+.

```bash
npm install
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Open:

```text
http://127.0.0.1:3001/dashboard
```

If the browser shows an unstyled page after a rebuild, hard refresh:

```text
Cmd + Shift + R
```

## Useful Commands

```bash
npm run typecheck
npm run build
npm run dev -- --hostname 127.0.0.1 --port 3001
```

## Environment Variables

The demo runs without environment variables.

For future production integrations:

```env
DATABASE_URL=
GEMINI_API_KEY=
```

Do not commit `.env.local`.

## Project Structure

```text
app/
  dashboard/
  profile/
  knowledge/
  journey/
  documents/
  registrations/
  schemes/
  compliance/
  export/
  food/
  assistant/
  timeline/
  notifications/
  settings/
components/
  charts/
  flow/
  forms/
  layout/
  ui/
lib/
  demo/
  knowledge/
  profile/
  ai/
  rag/
  db/
prisma/
```

## Demo Data

The curated demo corpus lives in:

```text
lib/demo/corpus.ts
```

It contains official-source metadata, knowledge records, demo profiles, documents, recommendations, dependency rules, timeline steps, scoring helpers, and assistant responses.

## Deployment

The app is ready for Vercel deployment as a standard Next.js app. For a no-database demo deployment, keep demo mode enabled, which is the default.

To later connect production data, configure `DATABASE_URL`, generate Prisma, migrate the schema, and switch the query layer away from demo mode.
