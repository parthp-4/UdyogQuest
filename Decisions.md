# Decisions

This file records why implementation and product decisions were made. Agents must read it before changing the project and append a dated entry when a meaningful decision is introduced or reversed.

## 2026-07-25 - Use a curated demo corpus for the hackathon

- Decision: use verified, source-linked demo knowledge in `lib/demo/corpus.ts` instead of live government scraping during the demo.
- Why: live government sites are inconsistent, slow, and can change during a presentation. A curated corpus makes the demo repeatable while preserving authority, title, and URL citations.
- Production direction: replace or augment the corpus through a separately validated ingestion pipeline; do not claim that the demo is live-ingesting government sites.

## 2026-07-25 - Keep eligibility deterministic

- Decision: compute eligibility and recommendations from explicit profile/data rules, then use AI only to explain the result.
- Why: eligibility must be auditable and must not be hallucinated by a language model.
- Consequence: every recommendation should expose its matched conditions, missing requirements, and source citation.

## 2026-07-25 - Add an interactive journey map

- Decision: use React Flow for the dependency/timeline map with week navigation, status styling, node selection, and fit-to-view controls.
- Why: the earlier static map did not communicate sequencing or dependencies clearly enough for the demo.
- Consequence: keep map data separate from the canvas component so the same dependency model can power timeline and journey pages.

## 2026-08-18 - Maintain persistent AI collaboration memory

- Decision: keep `CLAUDE.md`, `ChangeLog.md`, `Decisions.md`, and `Flow.md` at repository root.
- Why: future Claude Code and Codex runs need durable context, decision history, and data-flow knowledge independent of chat history.
- Consequence: every agent must read these files at the start and update them before finishing.

## 2026-08-18 - Surface source ingestion as a demo-safe form in Settings

- Decision: render `IngestionForm` on `/settings` instead of deleting it or building a new admin surface.
- Why: the component and its target route (`/api/ingest/run`) already existed and satisfy the project rule that every interactive control must trigger a real workflow; it was simply never imported, so it was dead code with no page exposing it.
- Alternatives considered: delete the unused component (rejected — it is functioning, demo-safe, and matches the source-policy expectation of a visible ingestion pipeline path); build a dedicated `/settings/sources` route (rejected as unnecessary scope for a single form).
- Consequences: Settings now has a fourth card. The route stays demo-safe since `/api/ingest/run` returns a fixed "disabled for the demo" message and performs no writes when no database is configured.

## 2026-08-18 - Add Vercel Analytics and Speed Insights, skip log drains

- Decision: install `@vercel/analytics` and `@vercel/speed-insights` and render them in `app/layout.tsx`; do not configure Vercel log drains at this time.
- Why: a Vercel status check flagged both as gaps. Analytics/Speed Insights are zero-config, first-party, and give real traffic/CWV visibility with no added infrastructure. Log drains require a Pro-plan feature and an external sink to forward to, which this project does not have a use case for yet -- `vercel logs --follow` and the dashboard already cover current debugging needs.
- Consequence: if centralized log export is needed later (e.g. once there's an external observability sink), configure drains then rather than preemptively now.

## 2026-08-18 - Explicit APP_DATA_MODE replaces the implicit demo-mode heuristic

- Decision: add `lib/runtime/mode.ts` as the single boundary for DEMO/LIVE/UNAVAILABLE resolution, driven by an explicit `APP_DATA_MODE=demo|live` env var. `getAppDataMode()`/`isLiveMode()` throw if LIVE is selected without `DATABASE_URL`; the non-throwing `getRuntimeStatus()` is for UI display only. Replaced the five duplicated `NEXT_PUBLIC_DEMO_MODE !== "false" || !isDatabaseConfigured()` functions in `lib/knowledge/queries.ts`, `lib/profile/actions.ts`, and four API routes with calls to this boundary (a sixth, `app/api/ingest/run/route.ts`, now goes through it for the first time).
- Why: the Phase 2 master prompt requires that LIVE mode never silently fall back to demo data, and that misconfiguration fail clearly. The old heuristic treated "demo flag off + DB happens to be reachable" as live, with no way to force a hard failure on misconfiguration and no single place to change the rule.
- Alternatives considered: keep the per-file heuristic and just tighten it in place (rejected -- duplication across six files was already a maintainability problem the master prompt called out); a config object read once at boot (rejected -- Next.js route handlers/server components don't share a boot phase in the way this would need, and re-reading env per call keeps tests simple).
- Consequences: pages/routes that go through `lib/knowledge/queries.ts` now genuinely crash (500 / structured 503) when LIVE is misconfigured, which is new, broad-reaching behavior. `/dashboard` and `/settings` were deliberately upgraded to resolve mode via the non-throwing `getRuntimeStatus()` first and render a graceful `UNAVAILABLE` banner instead; other pages (knowledge, registrations, schemes, compliance, food, export, journey, timeline, notifications) were left to fail loud, which is intentional per the master prompt ("fail clearly") rather than a gap, but is worth knowing before flipping `APP_DATA_MODE=live` in a shared environment without `DATABASE_URL` set.

## 2026-08-18 - Registry-only ingestion replaces arbitrary-URL ingestion

- Decision: delete `lib/ingestion/ingest-source.ts` and `lib/ingestion/schema.ts` (which accepted any `officialUrl` a caller supplied) and replace them with `lib/ingestion/run-ingestion.ts`, which only ever fetches a `SourceRegistryEntry.seedUrl` against that same entry's `allowedHosts`. Redesigned `IngestionForm` to list registered sources with a "Run ingestion" button per entry instead of free-text URL/authority/title fields.
- Why: the master prompt's ingestion workflow rule 1 is explicit -- "Accept only a registered source ID or approved seed URL. Never accept arbitrary user URLs for server-side fetching." The old form's fields mapped directly onto an unauthenticated SSRF-shaped fetch (`app/api/ingest/run/route.ts` was a no-op today, but the form was clearly built to eventually POST those fields somewhere that fetches them).
- Alternatives considered: keep the old free-text form but add server-side URL allowlisting at submit time (rejected -- that still invites someone to "just add a host to the allowlist" ad hoc from a form, instead of the registry being the single source of truth seeded via `prisma/seed.ts`).
- Consequences: adding a new source now requires adding a `SourceRegistryEntry` (currently via `lib/ingestion/registry-seed.ts` + `npm run prisma:seed`), not a form submission. This is deliberately less convenient in exchange for the invariant that the server never fetches an unreviewed host.

## 2026-08-18 - Defer migration SQL generation to a real database connection

- Decision: do not hand-author `prisma/migrations/*/migration.sql` for the Phase 2A/2B schema changes. Document the exact `npx prisma migrate dev --name phase2a_source_registry` command to run once a real `DATABASE_URL` is available instead.
- Why: `prisma migrate diff` for a PostgreSQL datasource requires a live (or shadow) database connection to produce dialect-accurate SQL -- confirmed empirically (`--from-empty --to-schema` against a schema with a real `datasource {provider = "postgresql"}` block produced empty output with no connection available). No database was reachable in this environment (no `psql`, no Docker, nothing on port 5432). Hand-writing DDL for seven interrelated tables (enums, string arrays, foreign keys, unique constraints) with no way to test it would be exactly the kind of unverified, "claims a stub is live" artifact the master prompt prohibits.
- Alternatives considered: provision a real database via the Supabase MCP tools available in this session (explicitly declined by the project owner -- that MCP is authenticated to someone else's account and must not be used to provision, access, modify, or inspect any Supabase project); ask the owner to paste a `DATABASE_URL` into chat (explicitly declined -- credentials must not be pasted into the session).
- Consequences: `prisma validate` and `prisma generate` are the two things verified in this environment (both pass against the new schema). `prisma migrate dev`, real database writes, and a genuine live ingestion run of FoSCoS/DGFT into PostgreSQL are unverified until the project owner connects their own `DATABASE_URL`. See `ChangeLog.md` for the full list of what ran and what didn't.

## 2026-08-18 - Reverted an uncommitted, unrelated Prisma CLI major-version bump

- Decision: `git checkout -- package.json package-lock.json` to restore `prisma` to the pinned `6.12.0` dependency (matching `origin/main`), then `npm install` to reconcile `node_modules`, discarding an uncommitted local change that had bumped `prisma` to `^7.9.1` (devDependency) while leaving `@prisma/client` at `6.12.0`.
- Why: that uncommitted, unrelated change broke `prisma generate`/`npm run build` outright -- Prisma 7 rejects the `datasource { url = env("DATABASE_URL") }` block this schema (and the whole app) has always used, requiring a `prisma.config.ts` + adapter migration instead. It predated this session's edits, wasn't part of the requested Phase 2 work, and a partial CLI-only bump with a mismatched client is exactly the kind of state that shouldn't be silently resolved either way. Asked the project owner directly; they chose to revert.
- Alternatives considered: migrate the whole app to Prisma 7's config format now (rejected by owner -- real, non-trivial, out-of-scope architecture change); leave it broken and work around it (rejected by owner -- would have prevented `prisma generate`/`npm run build` from ever succeeding this session).
- Consequences: Prisma 7 migration remains a real, separate future decision if ever wanted. `npm run build`/`prisma generate` work again as of this change.

## 2026-08-18 - vitest for the first test runner in this repository

- Decision: add `vitest` (not jest) as the project's first test runner, with `tests/**/*.test.ts` covering only pure functions that need neither a live database nor network access (runtime-mode resolution, SSRF/host-allowlist validation, IP-literal classification, URL canonicalization, checksum unchanged-detection, HTML parsing/chunking, lexical ranking).
- Why: the master prompt requires tests for SSRF protection, canonicalization, checksum/no-change detection, HTML parsing, and mode separation, and no test runner existed at all beforehand. vitest needs no Babel/ts-jest config to run this project's ESM + TypeScript + path-alias setup, and is fast enough to run on every change.
- Alternatives considered: jest (rejected -- would need extra config for ESM/`"type": "module"` and the `@/*` path alias already used throughout the app); Node's built-in test runner (rejected -- no built-in path-alias resolution, would need the same config work as vitest for less tooling payoff).
- Consequences: DB-dependent behavior (the actual ingestion transaction, retrieval against real rows, mode-boundary integration with a real Prisma client) has no automated test yet -- it's unverified until a real `DATABASE_URL` is available, consistent with the migration decision above.

## 2026-08-18 - Retrieval matches per-token, not the full literal query phrase

- Decision: change `retrieveVerifiedChunks`'s database filter from `content: {contains: fullQuery}}` to an `OR` across each significant token of the query (`lib/rag/ranking.ts`'s `tokenize()`), still scoped to `VERIFIED` sources and any industry filter, then let the existing `rankByRelevance()` sort by how many tokens actually matched.
- Why: tested live against the real, freshly-ingested DGFT content and found the old filter returned zero results for "export import trade policy" -- and would return zero for almost any real multi-word question, since it required the entire phrase to appear as one literal substring. Single-word queries worked, which is why this wasn't caught by earlier unit tests (which didn't exercise a live database).
- Alternatives considered: Postgres full-text search (`tsvector`/`tsquery` + a GIN index) -- rejected for this fix, not because it's wrong long-term, but because it's a real schema/migration change (new column, new index, language configuration) beyond what a same-session bug fix should carry; worth considering explicitly for Phase 2D's "reliable fallback" retrieval layer. Keeping `contains` per-token is the smallest change that makes multi-word queries actually work today.
- Consequences: retrieval can now return chunks that match only some query tokens, ranked below chunks matching more -- this is the intended "recall net + ranked precision" shape the master prompt describes, not a regression; a completely irrelevant single shared word (e.g. "the") could previously never happen because it was filtered out as a length-1 token by `tokenize()`, so precision stays reasonable without stopword handling.

## 2026-08-18 - Follow HTML meta-refresh redirects in the controlled fetch layer

- Decision: detect `<meta http-equiv="refresh" content="N;url=...">` in fetched HTML and follow it exactly like an HTTP 3xx redirect -- same allowlist re-validation, same shared redirect budget (`MAX_REDIRECTS = 1`), same recursive call into `fetchRegisteredSource`.
- Why: the real DGFT root URL returns this exact pattern (a "Page Moved" stub pointing at `/CP/`) instead of an HTTP-level redirect. Without following it, ingestion captured 10 characters of stub text and correctly (but unnecessarily) marked the source `NEEDS_REVIEW` -- the real content was one hop away.
- Alternatives considered: manually re-pointing the registry's `seedUrl` at `https://www.dgft.gov.in/CP/` directly (rejected -- the master prompt says not to guess/hardcode a different URL without verifying it's the stable canonical one, and the official site itself declares `/CP/` as the current location via its own redirect, which is exactly the kind of provenance a redirect-following fetch layer should capture rather than an agent guessing).
- Consequences: any future registered source that uses this common government-portal pattern (an old URL kept alive only as a meta-refresh pointer) is now handled correctly without needing a manual fix each time.

## 2026-08-18 - Gemini API call failures degrade gracefully instead of crashing

- Decision: wrap the actual `ai.models.generateContent(...)` call (not just the subsequent `JSON.parse`) in try/catch, in both `lib/ai/gemini.ts` and `lib/documents/extract.ts`, returning the existing unavailable-response shape with a diagnostic message on any failure.
- Why: found live -- with a placeholder `GEMINI_API_KEY` set (non-empty, so the existing `if (!apiKey)` guard didn't trigger) and a real database configured, `POST /api/assistant` threw an unhandled `ApiError` (API key not valid) and returned a raw 500. This directly violates the requirement that the assistant either answers from verified evidence or returns the exact unavailable sentence -- it must never simply crash.
- Alternatives considered: only catch specific known error types (rejected -- an invalid key, a rate limit, a network timeout, and a malformed-but-non-throwing response are all real failure modes in production, and the desired behavior is identical for all of them: degrade to the unavailable answer, don't 500).
- Consequences: any Gemini outage or misconfiguration now surfaces as a normal `200` with `Information unavailable from verified government source.` and a `missingInformation` diagnostic, not a broken request. This was previously untested because no prior session had a live database configured (the assistant route short-circuits to the demo corpus in DEMO mode, which never reaches this code path).

## 2026-08-18 - Enable RLS on every application table, no policies

- Decision: add a migration enabling Row Level Security on all 16 Prisma-modeled tables in the connected Supabase project, with zero policies (default-deny for any role that doesn't bypass RLS).
- Why: Supabase auto-exposes every `public`-schema table through its REST/GraphQL API (PostgREST), accessible via the project's `anon`/`authenticated` keys, independent of whether this app happens to use that API. Confirmed via `pg_tables` that RLS was disabled on every table (Prisma migrations don't touch it), and via `pg_roles` that this app's own Prisma connection uses the `postgres` role with `rolbypassrls = true` -- so this change has zero effect on the app itself while closing a real exposure surface, especially for `BusinessProfile`/`UserDocument`, which are designed to eventually hold real founder PII. Found by installing and reading the `supabase-postgres-best-practices` Agent Skill (explicitly requested this session) and checking this session's own schema/migration against it, which is exactly what the skill instructs.
- Alternatives considered: writing explicit allow-policies for an anticipated future use case (rejected -- the app doesn't use the Supabase client/REST API at all today; a policy written against a use case that doesn't exist yet is a guess, and default-deny is strictly safer until a real need is designed).
- Consequences: if a future milestone adds direct Supabase client (`supabase-js`)/REST usage for any table, it will get zero rows back until a scoped policy is added for that specific access pattern -- this is the intended, safe default, not a bug to "fix" by broadly opening access.

## 2026-08-18 - Supabase pooled `DATABASE_URL` + direct `DIRECT_URL` for migrations

- Decision: add `directUrl = env("DIRECT_URL")` to the Prisma datasource, using Supabase's shared transaction-mode pooler (port 6543, `pgbouncer=true`) for `DATABASE_URL` (app runtime queries) and the session-mode pooler (port 5432) for `DIRECT_URL` (migrations only).
- Why: this is Supabase's own documented/recommended Prisma configuration -- the transaction pooler doesn't support the prepared statements Prisma Migrate needs, so migrations must go through a different connection.
- Alternatives considered: none seriously -- this is standard, not a judgment call.
- Consequences: two env vars are now required in live mode instead of one; documented in `README.md`/`.env.example`.

## 2026-08-18 - Vercel-only: remove Netlify config, keep Vercel Cron as the sole scheduler

- Decision: delete `netlify.toml` and reword the one Netlify-specific sentence in `README.md`. Keep `vercel.json`'s existing Cron entry untouched.
- Why: the project is explicitly Vercel-only for Phase 2 (per the master prompt and the project owner's confirmed Vercel account/project linkage). `netlify.toml` was stale config for a platform no longer in use, with no Netlify dependency or function elsewhere in the repo -- it was pure dead configuration, not a working alternate deployment path.
- Alternatives considered: keep `netlify.toml` as a documented fallback (rejected -- the master prompt explicitly says to remove stale alternative-host configuration once Vercel is canonical, and an unused, unmaintained second deploy target is a real drift risk, not a safety net).
- Consequences: none functionally -- Netlify was not an active deployment target. If Netlify is ever wanted again, its config would need to be re-created from scratch, deliberately.

## 2026-08-18 - Gemini model updated from gemini-2.5-flash to gemini-3.6-flash

- Decision: change the hardcoded model string in `lib/ai/gemini.ts` and `lib/documents/extract.ts` from `"gemini-2.5-flash"` to `"gemini-3.6-flash"`.
- Why: found live, not by inspection -- with the real (non-placeholder) `GEMINI_API_KEY` from `.env.local` and LIVE mode against the real database, `POST /api/assistant` returned a real Gemini `404 NOT_FOUND`: "This model models/gemini-2.5-flash is no longer available to new users... use models/gemini-3.6-flash." The prior session's graceful-degrade wrapper (see the 2026-08-18 "Gemini API call failures degrade gracefully" decision) correctly prevented a 500, but it was silently masking a real defect: the assistant's actual success path -- a working key producing a real cited answer -- could never be reached at all, with any key, because the model name itself was rejected by the API before authentication/content even mattered. Trusted the live API's own error body over stale training knowledge of Gemini model names, since it's the authoritative, current source for what that specific API key/project can call today.
- Alternatives considered: catch the 404 and retry with a different hardcoded fallback model (rejected -- unnecessary complexity for what is simply a stale model identifier that should just be corrected at the source); leave it and only fix if/when a user reports it (rejected -- this was directly observed as a live, reproducible failure during this session's own audit, so fixing it now is a genuine fix, not speculative hardening).
- Consequences: reverified live after the fix -- the assistant now returns a real, cited, grounded answer from retrieved DGFT evidence (see `ChangeLog.md`). This is the first time in this project the full live Gemini success path has been confirmed working, not just its failure/degrade path. `lib/documents/extract.ts` received the identical fix for consistency but was not independently re-tested against a real file upload in this pass.

## Decision template

### YYYY-MM-DD - Short title

- Decision:
- Why:
- Alternatives considered:
- Consequences:
