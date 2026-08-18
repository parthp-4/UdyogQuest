# UdyogQuest System Flow

This file is the map for debugging and extending the application. Update it whenever a route, service, API contract, state transition, or dependency changes.

## Runtime overview

```text
Next.js route
  -> feature page/component
  -> query or service boundary
  -> lib/runtime/mode.ts: getAppDataMode() / isLiveMode() / getRuntimeStatus()
     -> DEMO: demo corpus (lib/demo/corpus.ts)
     -> LIVE + DATABASE_URL set: Prisma
     -> LIVE + DATABASE_URL missing: throws (data boundaries, API routes) or
        resolves to UNAVAILABLE (getRuntimeStatus(), used only for UI display)
  -> computed profile/recommendation/timeline data
  -> source-linked UI
```

`lib/knowledge/queries.ts`, `lib/profile/actions.ts`, and the assistant/documents/profile/recommendations API routes all resolve mode through this one boundary now -- there is no longer a per-file `NEXT_PUBLIC_DEMO_MODE !== "false" || !isDatabaseConfigured()` heuristic. `/profile` and `/documents` are the two exceptions: they call the demo corpus directly and are not yet mode-aware (Phase 2E work).

`app/layout.tsx` also renders `<Analytics />` / `<SpeedInsights />` (`@vercel/analytics/next`, `@vercel/speed-insights/next`) alongside `PageShell`. This is observability-only -- it does not participate in the request/response cycle above and has no effect on runtime mode.

## Runtime mode

```text
lib/runtime/mode.ts
  readConfiguredMode()      -> reads APP_DATA_MODE ("demo" default | "live"), throws on an unrecognized value
  getAppDataMode()           -> readConfiguredMode() + throws if LIVE and !DATABASE_URL
  isLiveMode()                -> getAppDataMode() === "LIVE" (throws under the same condition)
  getRuntimeStatus()         -> non-throwing: { mode: DEMO | LIVE | UNAVAILABLE, reason? }
                                 used by /dashboard and /settings for a graceful banner instead of a crash

lib/runtime/route-mode.ts
  resolveRouteMode()          -> API-route wrapper: { mode } or { response: NextResponse 503 }
                                 used by /api/assistant, /api/documents/upload, /api/profile,
                                 /api/recommendations/evaluate, /api/ingest/run
```

Failure behavior by surface:
- API routes (`resolveRouteMode()`): structured 503 with the misconfiguration reason. Never a raw 500.
- `/dashboard`, `/settings` (`getRuntimeStatus()`): render normally with an `UNAVAILABLE` banner/reason.
- All other pages that read through `lib/knowledge/queries.ts` (`isLiveMode()`/`useDemoCorpus()`): the page render throws -- a hard Next.js error, not demo data. This is deliberate ("fail clearly, never silently demo"), not a bug, but it means a misconfigured `APP_DATA_MODE=live` deployment will show broken pages across most of the app, by design.

## Dashboard and knowledge

```text
/dashboard
  -> getRuntimeStatus() -> mode badge (DEMO / LIVE / UNAVAILABLE) in the page header
     -> LIVE: notice that profile/readiness cards still read the demo corpus (Phase 2E, not this slice)
     -> UNAVAILABLE: notice with the misconfiguration reason
  -> knowledge summary + latest sources + selected profile (always from lib/demo/corpus.ts today)
  -> readiness, pending actions, updates, and navigation cards

/knowledge
  -> search/filter controls
  -> lib/knowledge/queries.ts (throws if LIVE is misconfigured -- see "Runtime mode" above)
  -> curated corpus or database records, each with a verification-state badge and fetched time
  -> source detail and official links
```

## Assistant

```text
AssistantPanel
  -> POST /api/assistant { question, profileId? }
  -> resolveRouteMode()
     -> DEMO: answerFromDemoKnowledge(question)
     -> LIVE: lib/rag/retriever.ts retrieveVerifiedChunks(question, filters?)
              -> Prisma: KnowledgeChunk where document.source.status = VERIFIED
                 (+ optional industry filter), joined to the current SourceVersion
              -> WHERE content matches ANY tokenized query term (OR-per-token recall net --
                 NOT a literal full-phrase match; that was tried and returned zero results
                 for real multi-word questions against live data, see Decisions.md 2026-08-18)
              -> lib/rag/ranking.ts rankByRelevance() -- deterministic lexical scoring across
                 all matched tokens, precision layer on top of the recall net
              -> RetrievedChunk[] (content, sourceTitle, officialUrl, authority,
                 lastUpdated, fetchedAt, verificationState, sourceVersionId, industry)
              -> lib/ai/gemini.ts askGeminiFromSources(question, chunks)
                 -> chunks.length === 0: unavailableAnswer(), Gemini not called
                 -> model: "gemini-3.6-flash" (updated 2026-08-18 -- "gemini-2.5-flash" was
                    rejected live with a 404, the model no longer being available; see Decisions.md)
                 -> generateContent() call wrapped in try/catch: any Gemini failure
                    (invalid key, rate limit, network error) -> unavailableAnswer() with a
                    diagnostic in missingInformation, never an unhandled 500
                 -> on success: Gemini constrained to the evidence bundle, must reuse
                    each citation's exact fetchedAt/sourceVersionId, must only cite
                    VERIFIED sources (lib/ai/system-prompt.ts)
                 -> normalizeAssistantAnswer() reconstructs the exact AssistantAnswer shape
                    field-by-field from the parsed JSON before returning it -- Gemini's JSON
                    output is syntactically valid but not schema-enforced (fixed 2026-08-18
                    after missingInformation came back as a string instead of string[] and
                    crashed the client's .map() call in production; see Decisions.md)
  -> AssistantPanel normalizes the fetch response the same way before setAnswer() --
     a second, independent guard against a malformed/unexpected API response shape
  -> JSON response { answer, citations[], missingInformation[], suggestedNextAction }
  -> render answer, citations (+ fetched date when present), and next action
```

The assistant must not answer from model memory. If no verified evidence is retrieved, `unavailableAnswer()` returns exactly `Information unavailable from verified government source.` without calling Gemini. `lib/rag/embeddings.ts` defines an `EmbeddingProvider` interface with a documented no-op implementation -- vector search is not implemented in this slice (Phase 2D), keyword/full-text retrieval is the real path. `lib/documents/extract.ts` has the same generateContent-failure -> graceful-degrade wrapping and the same `gemini-3.6-flash` model.

Live-verified 2026-08-18: with a real `GEMINI_API_KEY` and LIVE mode against the real database, a DGFT-relevant question returns a real, successful, grounded Gemini answer citing the actual retrieved chunk's exact `fetchedAt`/`sourceVersionId` -- the first time the full success path (not just the failure/degrade path) has been confirmed working end-to-end, not just built.

## Deployment state (as of 2026-08-18 release)

The linked Vercel project (`udyog-quest`, scope `parthporwal`) has all six required env vars (`APP_DATA_MODE`, `DATABASE_URL`, `DIRECT_URL`, `GEMINI_API_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`) configured for Production and Preview. This entire Phase 2A/2B slice was committed (`1f3418c`, "Phase 2 live product and Vercel deployment foundation") and pushed to `origin main`, triggering an automatic Vercel Production deployment (`dpl_4db3Z61g8gVAQXxFCk1HdZgvEBHt`), confirmed `Ready` and matching pushed `HEAD` (remote `main` SHA verified equal to local `HEAD`; the `udyog-quest-git-main-parthporwal.vercel.app` alias -- which Vercel's Git integration always points at the current tip of `main` -- resolves to this exact deployment).

Post-deploy checks against `https://udyog-quest.vercel.app` (production): `/dashboard`, `/settings`, `/knowledge`, `/assistant` all `200`; `/dashboard` shows a genuine `LIVE` mode badge (not DEMO/UNAVAILABLE); `/knowledge` shows real `VERIFIED` badges sourced from the live database (not the demo corpus); unauthenticated `POST /api/ingest/run` returns `401` with no secret in the response body. Production is now genuinely running the Phase 2A/2B live product, not the pre-Phase-2 demo-only code.

## Profile and recommendations

```text
Profile selection/onboarding
  -> founder profile
  -> deterministic profile/readiness scoring
  -> document and registration gaps
  -> deterministic scheme/dependency matching
  -> recommendations with why, blockers, and official sources
```

## Journey and timeline

```text
getDependencyItems(profile)
  -> dependency nodes + edges + week/status metadata
  -> DependencyMap React Flow component
  -> week slider changes visible window
  -> node click opens detail/why panel
  -> fit/zoom controls update viewport only
```

The map is a view of the shared dependency model, not an independent hardcoded illustration.

## Documents

```text
DocumentVault upload
  -> POST /api/documents/upload
  -> file validation and extraction boundary
  -> extracted fields + mismatch/expiry checks
  -> reusable document record
  -> linked registrations, schemes, and profile fields
```

## Search

```text
Global search input
  -> lib/search/search.ts
  -> search corpus/index across knowledge, schemes, registrations, documents, and updates
  -> ranked results with type and official source
  -> route/detail navigation
```

## Ingestion (Phase 2B)

```text
Trigger (one of):
  GET/POST /api/ingest/run          -- Vercel Cron (GET) or manual (POST/GET), both require
                                        Authorization: Bearer $CRON_SECRET in LIVE mode
  IngestionForm "Run ingestion"     -- Settings UI, calls the server action directly
                                        (lib/ingestion/actions.ts runRegisteredSourceIngestion),
                                        no HTTP round-trip, no secret sent to the browser
  npm run ingest -- <id> | --all    -- CLI (scripts/ingest-official-sources.ts)

  -> lib/ingestion/run-ingestion.ts
     assertNoConcurrentRun()        -- refuses to start while an IngestionRun.status = RUNNING exists
     -> prisma.ingestionRun.create({status: RUNNING})
     -> per SourceRegistryEntry (ACTIVE only, or the one requested id):
        lib/ingestion/fetch.ts fetchRegisteredSource({url: seedUrl, allowedHosts})
          -> validateFetchTarget(): https-only, host must match allowedHosts,
             rejects localhost/private-IP literals
          -> DNS pre-check: rejects hostnames resolving to a private/loopback address
          -> fetch with 15s timeout, 5MB cap. Redirect handling (max 1 hop total,
             re-validated against the same allowlist before following):
               - HTTP 3xx with Location header, or
               - HTML <meta http-equiv="refresh" content="N;url=..."> in the response body
                 (confirmed live: DGFT's root URL is exactly this pattern)
          fetch failed (no HTTP status)  -> IngestionRunEvent REJECTED
          fetch failed (bad HTTP status) -> IngestionRunEvent FAILED
          fetch ok:
            lib/ingestion/parse.ts parseHtml() -> parsedText
            lib/ingestion/checksum.ts computeChecksum(parsedText)
            checksum unchanged vs current SourceVersion -> IngestionRunEvent UNCHANGED,
              SourceRegistryEntry.lastSuccessfulRunAt updated, no new rows
            checksum new/changed -> transaction:
              upsert GovernmentSource (by sourceRegistryEntryId, unique)
              mark prior SourceVersion.isCurrent = false; create new SourceVersion (isCurrent = true)
              create VerificationRecord (VERIFIED if parsedText >= 200 chars per the
                registry entry's verificationPolicy, else NEEDS_REVIEW)
              upsert KnowledgeDocument (1 per GovernmentSource) + replace its KnowledgeChunk rows
              -> IngestionRunEvent CHANGED
     -> prisma.ingestionRun.update({status: SUCCEEDED|PARTIAL|FAILED, counts, finishedAt})
  -> IngestionRunSummary { runId, status, sourceCount, changedCount, unchangedCount, failedCount, results[] }
```

Idempotent by design: rerunning an entry whose fetched content checksum is unchanged never creates a duplicate `KnowledgeDocument`/`KnowledgeChunk`. `lib/ingestion/registry-seed.ts` + `prisma/seed.ts` seed exactly two `SourceRegistryEntry` rows (FoSCoS/food, DGFT/export-import) -- this is operational allowlist metadata, not a government fact, so it's safe to seed in any environment.

Real, live-verified outcome as of 2026-08-18 (see `ChangeLog.md` for the full run): DGFT is `VERIFIED` (12,104 characters of real content, 9 `KnowledgeChunk` rows, reachable only after the meta-refresh fix above). FoSCoS is `NEEDS_REVIEW` -- its root URL is a JavaScript-rendered SPA shell with no server-rendered text at all (confirmed by inspecting `rawText`); a headless-browser fetch adapter would be needed to retrieve real content from it, which is out of scope for this slice. This is the verification policy working correctly, not a defect.

## Database access model

All 16 application tables have Row Level Security enabled with zero policies (default-deny), added specifically because this project runs on Supabase, which auto-exposes every `public`-schema table through its REST/GraphQL API independent of whether the app uses that API. This app's own Prisma connection uses the `postgres` role (`rolbypassrls = true`), so RLS has no effect on the app itself -- it only blocks the `anon`/`authenticated` PostgREST roles. If a future milestone adds direct Supabase client (`supabase-js`) or REST usage, add a scoped policy for that specific access pattern then; don't broadly open a table.

## Settings

```text
/settings
  -> getRuntimeStatus() -> mode badge (DEMO / LIVE / UNAVAILABLE) + reason when UNAVAILABLE
  -> LIVE only: getSourceRegistryOverview() -> registry entries + current verification state
  -> LIVE only: getRecentIngestionRuns() -> last 5 IngestionRun rows + their events
  -> LIVE only + NEEDS_REVIEW entries present: verification queue card
  -> Verified source audit trail (getLatestVerifiedSources) -- guarded: skipped (not crashed)
     when mode resolves to UNAVAILABLE
  -> IngestionForm { mode, entries }
     -> DEMO/UNAVAILABLE: explanatory text only, no fetch capability
     -> LIVE: one "Run ingestion" button per registered source
        -> runRegisteredSourceIngestion(sourceRegistryEntryId) server action
        -> revalidatePath("/settings", "/knowledge", "/dashboard")
  -> Supported industries list
```

## Change tracing checklist

When a bug appears, trace in this order:

1. Route/page entry and props.
2. Query/service call and its mode switch.
3. Corpus/database record shape.
4. Deterministic computation or API response.
5. Component state and event handler.
6. Rendering/layout and responsive CSS.

## Flow entry template

### YYYY-MM-DD - Area changed

- Entry point:
- Data/service path:
- State transitions:
- Downstream consumers:
- Failure modes and verification:
