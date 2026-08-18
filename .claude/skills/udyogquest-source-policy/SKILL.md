---
name: udyogquest-source-policy
description: Enforce UdyogQuest's official-source and auditability rules. Use when adding or editing government knowledge, schemes, registrations, eligibility, recommendations, assistant answers, citations, or demo data.
---

# UdyogQuest Source Policy

Use only verified official government sources for government facts. Each item should retain authority, official URL, title, applicability, and any available update date, portal, documents, fees, timeline, validity, and legal reference.

Do not invent schemes, benefits, eligibility, document lists, fees, processing times, deadlines, or rules. Blank or unknown fields must be represented as `Not specified` or the exact fallback `Information unavailable from verified government source.`

Eligibility and recommendation matching must be deterministic and auditable. AI may summarize or explain matched rules, but it must not decide eligibility from model memory. Assistant responses must cite the source records used and clearly separate verified facts from unavailable information.

For the current demo, explain the corpus accurately: it is curated and source-linked for reliable demonstration, and is pipeline-ready for a future scheduled ingestion system. Do not claim live crawling or runtime scraping.
