# UdyogQuest

UdyogQuest is an AI operating system for Indian food and export/import businesses. It helps founders understand which registrations, documents, schemes, compliance actions, and export steps apply to them using source-cited government knowledge.

This repository contains the Round 1 demo version of the platform, plus a working Phase 2A/2B live product foundation: an explicit runtime-mode switch, a source registry, and one real end-to-end ingestion slice (fetch -> parse -> checksum/version -> verify -> persist -> retrieve -> cite) -- **verified against a real PostgreSQL (Supabase) database**, not just built. It still runs without any database setup by default, and now also supports a genuine live PostgreSQL mode that never silently falls back to demo data.

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

## Runtime Modes

The application has a single explicit mode switch: `APP_DATA_MODE` (see `lib/runtime/mode.ts`).

- `demo` (default if unset): serves `lib/demo/corpus.ts`. No database required. Safe for local UI work.
- `live`: serves persisted PostgreSQL data through Prisma. **`DATABASE_URL` is then required.** If it's missing, data boundaries (`lib/knowledge/queries.ts`, the assistant/profile/documents/recommendations API routes) fail loudly -- a 503 from API routes, a rendering error from most pages -- instead of silently serving demo data. `/dashboard` and `/settings` render a graceful `UNAVAILABLE` banner with the reason instead of crashing, since they resolve mode through the non-throwing `getRuntimeStatus()` helper; other pages currently fail with a hard error, which is deliberate ("fail clearly," not "silently demo").

`/profile` and `/documents` are not yet wired to this mode switch -- they always render the demo corpus regardless of `APP_DATA_MODE`. Making them live-aware requires persisted profile/recommendation records, which is Phase 2E, not this slice.

## Source Registry and Ingestion (Phase 2B)

Two official sources are seeded for this slice, one per supported industry (`lib/ingestion/registry-seed.ts`):

- Food: FoSCoS (`https://foscos.fssai.gov.in/`)
- Export/Import: DGFT (`https://www.dgft.gov.in/`)

The ingestion pipeline (`lib/ingestion/*`) only ever fetches a registered `SourceRegistryEntry`'s `seedUrl` against its own `allowedHosts` allowlist -- it never accepts an arbitrary URL from a request. Each run: validates scheme/host/DNS (rejects non-https, localhost, and private/loopback addresses, including a defense-in-depth DNS-resolution check), fetches with a timeout and size cap (following at most one redirect hop, whether an HTTP 3xx or an HTML `<meta http-equiv="refresh">` stub -- DGFT's root URL is the latter), parses HTML, computes a SHA-256 checksum, and only writes a new immutable `SourceVersion` when the checksum changed (unchanged reruns are idempotent -- no duplicate rows). Every run is recorded in `IngestionRun`/`IngestionRunEvent`, including failures. A source is marked `VERIFIED` or `NEEDS_REVIEW` by an explicit, recorded `VerificationRecord` policy check -- never just because a URL was reachable.

**Real, live-verified result (2026-08-18):** DGFT is `VERIFIED` with 12,104 characters of real parsed content across 9 knowledge chunks. FoSCoS is `NEEDS_REVIEW` -- its root URL is a JavaScript-rendered SPA shell (the raw HTML is literally a "your browser does not support JavaScript" fallback), so a plain HTTP fetch can't retrieve real content from it; that would need a headless-browser fetch adapter, which is intentionally not built in this slice. This is the verification policy working as intended, not a bug.

To run ingestion against your own database:

```bash
# 1. Point at a real PostgreSQL instance. If you're on Supabase, use the transaction-mode
#    pooler for DATABASE_URL and the session-mode pooler for DIRECT_URL (migrations only) --
#    see "Environment Variables" below.
export DATABASE_URL="postgresql://user:pass@host:6543/udyogquest?pgbouncer=true"
export DIRECT_URL="postgresql://user:pass@host:5432/udyogquest"
export APP_DATA_MODE="live"

# 2. Create the schema
npx prisma migrate dev

# 3. Seed the two registry entries (operational metadata, not government facts)
npm run prisma:seed

# 4. Ingest one source, or all ACTIVE sources
npm run ingest -- <sourceRegistryEntryId>
npm run ingest -- --all
```

In production, the same flow is triggered by `POST`/`GET /api/ingest/run`, authenticated with `Authorization: Bearer $CRON_SECRET` (Vercel Cron sends this automatically -- see `vercel.json`). The Settings page also exposes a "Run ingestion" action per registered source, which calls the ingestion function directly server-side (no HTTP round-trip, no secret exposed to the browser).

### Applying the Phase 2 migrations

Two migrations are checked in under `prisma/migrations/`, both generated by `prisma migrate dev` against a real database (not hand-written -- `prisma migrate diff` needs a live/shadow Postgres connection to produce dialect-accurate SQL for a Postgres datasource, so hand-authoring seven-plus interrelated tables' worth of DDL untested wasn't an option):

- `20260818081124_phase2a_source_registry` -- the full Phase 2A/2B schema (source registry, versions, verification records, ingestion runs).
- `20260818082652_enable_row_level_security` -- enables RLS on every application table with no policies (see "Security: Row Level Security" below).

Apply both to your own database with:

```bash
npx prisma migrate deploy   # applies checked-in migrations without generating new ones
# or, during development:
npx prisma migrate dev
```

## Security: Row Level Security

All 16 application tables have Row Level Security enabled with **no policies** (default-deny). This matters specifically because Supabase auto-exposes every `public`-schema table through its REST/GraphQL API (PostgREST) via the `anon`/`authenticated` roles, independent of whether this app uses that API. This app only ever connects through Prisma using the `postgres` role, which has `rolbypassrls = true` -- confirmed against the connected project -- so RLS has zero effect on the app itself. If you add direct Supabase client (`supabase-js`) or REST usage for any table in the future, that table will return zero rows until you add a scoped policy for that specific access pattern. This is intentional; don't broadly open a table to "fix" it.

If you're setting this up on a non-Supabase Postgres, this is still safe to leave in place: by default, a table's owning role (which your migration role will be, having created the tables) bypasses its own RLS unless `FORCE ROW LEVEL SECURITY` is explicitly set, which this migration does not do.

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
npm run test                      # vitest -- pure-function unit tests, no database needed
npm run dev -- --hostname 127.0.0.1 --port 3001
npm run prisma:seed               # seed the two Phase 2B source registry entries (needs a live DATABASE_URL)
npm run ingest -- --all           # run ingestion for every ACTIVE registry entry (needs a live DATABASE_URL)
```

`npm run build` runs `prisma generate` before `next build`. This is required on Vercel because dependency caching can otherwise leave Prisma Client outdated. Note: `prisma generate` only needs `DATABASE_URL` to exist as *some* string (it does not connect); `prisma validate`/`prisma migrate` need it to be a real, reachable connection string.

## Environment Variables

The demo runs without environment variables. `APP_DATA_MODE` defaults to `demo` when unset.

```env
APP_DATA_MODE=demo        # "demo" (default) or "live"
DATABASE_URL=             # required when APP_DATA_MODE=live -- app runtime queries
DIRECT_URL=               # required when APP_DATA_MODE=live -- migrations only (see below)
GEMINI_API_KEY=           # required for the assistant/document-extraction Gemini calls in live mode
CRON_SECRET=              # required to authenticate POST/GET /api/ingest/run in live mode
```

`DATABASE_URL`/`DIRECT_URL` as two separate variables is specifically the Supabase-recommended Prisma setup: `DATABASE_URL` points at the shared transaction-mode pooler (port 6543, `?pgbouncer=true`) for app queries, `DIRECT_URL` at the session-mode pooler (port 5432) for `prisma migrate`, since the transaction pooler doesn't support the prepared statements migrations need. If you're not on Supabase's pooler, both can point at the same database.

See `.env.example` for the full annotated list. Do not commit `.env` or `.env.local` -- both are gitignored.

Supabase's Agent Skills (`supabase`, `supabase-postgres-best-practices`) are installed under `.agents/skills/` and symlinked into `.claude/skills/` (`npx skills add supabase/agent-skills`). Load `supabase-postgres-best-practices` before any further schema/migration/RLS work against this database -- it's what caught the missing RLS policies documented above.

**Security note:** if a `GEMINI_API_KEY` was ever shared outside of environment variables (chat, screenshots, logs, commits), treat it as compromised -- rotate it in Google AI Studio / Cloud console and set the new value only through your deployment platform's environment variables.

If you want to run this app against your own PostgreSQL database, set `DATABASE_URL` and `APP_DATA_MODE=live` in your own `.env.local` (never paste credentials into a chat/agent session) and follow "Source Registry and Ingestion" above.

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
  runtime/       # the single APP_DATA_MODE boundary (lib/runtime/mode.ts)
  ingestion/      # source registry, controlled fetch/parse/checksum, run orchestration
prisma/
  schema.prisma
  seed.ts         # seeds the two Phase 2B registry entries
tests/            # vitest unit tests (no database/network dependency)
```

## Demo Data

The curated demo corpus lives in:

```text
lib/demo/corpus.ts
```

It contains official-source metadata, knowledge records, demo profiles, documents, recommendations, dependency rules, timeline steps, scoring helpers, and assistant responses.

## Deployment

The app is ready for Vercel deployment as a standard Next.js app. For a no-database demo deployment, leave `APP_DATA_MODE` unset (or `demo`), which is the default -- `DATABASE_URL` is not required.

To run live: set `APP_DATA_MODE=live`, `DATABASE_URL`, `DIRECT_URL`, `GEMINI_API_KEY`, and `CRON_SECRET` in your deployment platform's environment variables (never in a committed file). Run `npx prisma migrate deploy` and `npm run prisma:seed` against that database, then either let the `vercel.json` cron trigger `GET /api/ingest/run` on schedule, or run `npm run ingest -- --all` once manually. `CRON_SECRET` is required for the cron/manual trigger to authenticate -- there is no anonymous path that starts a network fetch. If your database is on Supabase, RLS is already enabled on every table with no policies (see "Security: Row Level Security"), so nothing further is needed there.
