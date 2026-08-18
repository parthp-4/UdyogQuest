---
name: udyogquest-change-discipline
description: Apply UdyogQuest's safe implementation and verification discipline. Use for any code, UI, data, configuration, deployment, or dependency change in the repository.
---

# UdyogQuest Change Discipline

Keep the change scoped to the user's request. Do not reset, delete, rename, or overwrite unrelated files. Prefer existing Next.js, TypeScript, Tailwind, Prisma, React Flow, and local component patterns.

Before editing:

- read the four project memory files;
- inspect git status and the relevant files;
- identify the smallest behaviorally complete change;
- define how the result will be verified.

After editing:

- run focused checks, then `npm run typecheck` and `npm run build` for shared changes;
- exercise the affected route and its main interaction for UI changes;
- update `ChangeLog.md` for every prompt;
- record rationale in `Decisions.md` and flow changes in `Flow.md`;
- report failures instead of claiming a check passed.

Never leave dead buttons, fake success states, text overlap, exposed secrets, or unsupported government claims.
