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

## Decision template

### YYYY-MM-DD - Short title

- Decision:
- Why:
- Alternatives considered:
- Consequences:
