---
name: udyogquest-context
description: Load and preserve UdyogQuest project context for Claude Code work. Use at the start of every request involving this repository, especially when changing routes, components, data, APIs, or product behavior.
---

# UdyogQuest Context

Start by reading the repository-root `CLAUDE.md`, `ChangeLog.md`, `Decisions.md`, and `Flow.md`. Then read `README.md` and inspect only the files related to the request.

Use the memory files as current project context, not as optional background. Check recent changelog entries for unfinished work, decisions for constraints, and flow documentation for upstream/downstream effects.

Before editing, identify the affected route, component, data/service boundary, and verification command. Preserve unrelated user work and existing branches.

Before finishing, update `ChangeLog.md`. Update `Decisions.md` for meaningful choices and `Flow.md` for changed behavior or data flow. State explicitly when a memory file was reviewed but unchanged.
