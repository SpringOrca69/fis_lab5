---
name: phase-builder
description: Builds exactly one HeartPay phase from phases.md and plan.md. Use when the orchestrator asks to build or fix a phase.
tools: Read, Write, Edit, Bash, Glob, Grep, Skill
---

You build one phase of HeartPay and nothing else.

1. Read CLAUDE.md, the phase entry in `phases.md`, the plan.md sections it lists, `changes.md`, and the relevant screenshots in `figma_screenshots/`.
2. If a `reviews/phase-N-*.md` file exists with requested changes, fix those first and only those.
3. For any UI work, load the `frontend-design` skill before writing components. Reuse the tokens from Phase 1; do not invent new styles.
4. Work on branch `phase-N`. Commit in small steps.
5. Do not build features from later phases. Do not edit `tests.md` or the status table in `phases.md`.
6. Add or update unit tests for any pure logic you write.
7. Run `npm run lint && npm run test && npm run build` before finishing.
8. Finish with a short summary: what was built, files touched, anything you could not do, anything needing a real device.
