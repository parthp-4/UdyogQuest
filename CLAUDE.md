# UdyogQuest AI Working Agreement

UdyogQuest is an AI-assisted operating system for Indian MSMEs. The current demo focuses on two supported industries: food businesses and export/import businesses.

## Required context on every run

Before changing code, read these files in order:

1. `CLAUDE.md`
2. `ChangeLog.md`
3. `Decisions.md`
4. `Flow.md`
5. `README.md`, then the files related to the request

Treat these files as project memory. Do not rely on conversation history alone.

## Required updates after every prompt

- Update `ChangeLog.md` for every code, configuration, data, documentation, or design change.
- Update `Decisions.md` whenever a meaningful implementation or product decision is made. Record the reason and alternatives considered.
- Update `Flow.md` whenever a route, service, data flow, state transition, API contract, or dependency changes.
- If a file does not need a substantive change, add a short dated note to `ChangeLog.md` stating that it was reviewed and unchanged.

## Project rules

- Preserve user changes. Do not reset, delete, rename, or rewrite unrelated work.
- Keep changes modular and close to the affected route, component, service, or data boundary.
- Use TypeScript and existing Next.js App Router patterns. Avoid vanilla JavaScript and new server frameworks.
- Use the existing UI system and icon conventions before introducing new primitives.
- Every interactive control must navigate, open a panel, submit, upload, filter, search, download, expand, or trigger a real workflow.
- Prevent text overlap and verify responsive layouts at desktop and mobile widths.
- Keep eligibility and government facts deterministic and source-linked. AI may explain a result but may not invent or decide eligibility from memory.
- When an official government fact cannot be verified, render exactly: `Information unavailable from verified government source.`
- Never expose API keys, database credentials, or other secrets in source files, commits, screenshots, or logs.

## Important project paths

- `app/`: Next.js routes and API routes
- `components/`: shared UI and feature components
- `components/flow/dependency-map.tsx`: interactive React Flow journey/dependency map
- `lib/demo/corpus.ts`: curated demo knowledge corpus
- `lib/knowledge/queries.ts`: knowledge access boundary
- `components/forms/assistant-panel.tsx`: assistant UI
- `app/api/assistant/route.ts`: assistant endpoint
- `app/api/documents/upload/route.ts`: document upload endpoint
- `lib/documents/extract.ts`: document extraction boundary
- `lib/search/search.ts`: global search boundary
- `prisma/schema.prisma`: database model source
- `phase-one/`: prior prototype and presentation materials; preserve it unless explicitly asked to change it

## Verification

Use the smallest relevant checks, then broaden them for shared changes:

```bash
npm run typecheck
npm run build
```

For UI changes, also exercise the affected route and test the key interaction. Report commands that could not run and why.

## Final response format for agents

End each task with:

- What changed
- Files changed
- Verification performed
- Any known limitation or follow-up
