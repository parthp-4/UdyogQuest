---
name: udyogquest-testing
description: Verify UdyogQuest routes, calculations, API boundaries, and responsive interactions. Use after implementing or reviewing application behavior, especially shared queries, assistant flows, documents, journey maps, or dashboards.
---

# UdyogQuest Testing

Choose checks according to blast radius:

- Pure data or utility change: run the focused test or typecheck.
- Shared query, service, API, or schema change: run `npm run typecheck` and `npm run build`.
- UI change: load the affected route, exercise its primary controls, and check desktop and mobile widths for overlap or clipped content.
- React Flow change: verify nodes and edges render, week navigation changes the view, selection opens details, and zoom/fit controls remain usable.

Do not report a manual check unless it was actually performed. Record failed or unavailable checks in `ChangeLog.md`.
