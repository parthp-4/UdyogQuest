# UdyogQuest System Flow

This file is the map for debugging and extending the application. Update it whenever a route, service, API contract, state transition, or dependency changes.

## Runtime overview

```text
Next.js route
  -> feature page/component
  -> query or service boundary
  -> demo corpus when demo mode is enabled
     or Prisma when database configuration is available
  -> computed profile/recommendation/timeline data
  -> source-linked UI
```

## Dashboard and knowledge

```text
/dashboard
  -> knowledge summary + latest sources + selected profile
  -> readiness, pending actions, updates, and navigation cards

/knowledge
  -> search/filter controls
  -> lib/knowledge/queries.ts
  -> curated corpus or database records
  -> source detail and official links
```

## Assistant

```text
AssistantPanel
  -> POST /api/assistant { question, profileId? }
  -> AssistantService / demo answer boundary
  -> retrieve relevant source-linked corpus items
  -> build answer with citations and limitations
  -> JSON response
  -> render answer, citations, and next action
```

The assistant must not answer from model memory. If the corpus does not support an answer, return `Information unavailable from verified government source.`

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

## Settings

```text
/settings
  -> Demo mode summary
  -> Verified source audit trail (getLatestVerifiedSources)
  -> IngestionForm
     -> POST /api/ingest/run
     -> demo mode: returns fixed "ingestion disabled for the demo" message, no writes
     -> database mode: would call lib/ingestion/ingest-source.ts (not wired into this route today)
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
