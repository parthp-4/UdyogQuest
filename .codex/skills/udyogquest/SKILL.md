---
name: udyogquest
description: Work safely and consistently on the UdyogQuest repository using its persistent context, source policy, deterministic recommendation rules, and documentation-first change workflow.
---

# UdyogQuest Project Skill

Read repository-root `CLAUDE.md`, `ChangeLog.md`, `Decisions.md`, and `Flow.md` before every task. Inspect the affected route and its upstream/downstream boundaries before editing.

UdyogQuest is a Next.js App Router application for Indian MSMEs, currently demonstrated with food and export/import workflows. Important boundaries include `lib/demo/corpus.ts`, `lib/knowledge/queries.ts`, `app/api/assistant/route.ts`, `lib/search/search.ts`, `lib/documents/extract.ts`, and `components/flow/dependency-map.tsx`.

Use official-source citations for government facts. Never fabricate eligibility or claim live ingestion when the demo uses the curated corpus. Use the exact unavailable-information fallback defined in `CLAUDE.md`.

At the end of every prompt, update `ChangeLog.md`; update `Decisions.md` and `Flow.md` when applicable. Run focused verification and report what actually ran.
