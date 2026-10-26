# Phase 0 (Scaffold) approval

Verdict: NEEDS HUMAN

## What I checked
- Diff `main..phase-0` (commit 624c7db) is 22 files, all additions. Nothing in main (CLAUDE.md, plan.md, changes.md, phases.md, tests.md, `.claude/agents`, `.claude/commands`, Figma screenshot) was modified or deleted.
- Scope: Vite, React, TS, Tailwind 4, shadcn config, react-router, bundled Noto Sans, Sans SC and Sans Tamil fonts, ESLint, Vitest, Playwright, vercel.json SPA rewrite. Only a stub page exists. No i18n, store, scan or other later-phase code. Nothing in Phase 0 scope is missing.
- I re-ran `npm run lint`, `npm run test` and `npm run build`. All pass. The test report records e2e as passing.
- Banned copy grep (credited, official, hawker, 1800, 6123) over src, index.html and e2e found nothing. The only UI strings are "HeartPay" and "Scaffold ready." These are not yet in `t()`, which is acceptable because i18n is Phase 1.
- The test report is honest. P0-3 is marked "needs human" and is not claimed as passed. The report also states that shadcn CLI compatibility is unproven.
- P0-4: CLAUDE.md, `.claude/agents` and `.claude/commands` are present.

## Notes (non-blocking)
- `.claude/settings.json` was added. It is harmless: it holds a permission allowlist, with `git push` set to ask. It is tooling config, not app code.
- The build also bundles Devanagari and latin-ext font subsets, which adds weight. Consider importing only the needed subsets in Phase 8.
- Phase 1 must add the shadcn theme variables and the `tw-animate-css` import to `src/styles/index.css`. The first `shadcn add` will show whether the hand-written `components.json` works.
- `phases.md` has an uncommitted change on the working tree. I did not touch it.

## Human checks required (P0-3)
1. Confirm the GitHub repo (github.com/SpringOrca69/fis_lab5) is connected to a Vercel project. The tester did not verify this. Push `phase-0` or `main` so a deployment exists.
2. Open the Vercel HTTPS URL on a phone. Expect the "HeartPay / Scaffold ready." page over HTTPS, with no certificate warning.
3. Open a deep link such as `<url>/home` on the phone. It should load the same stub page, not a 404. This confirms the SPA rewrite works.
4. Reply "pass" or describe the failure.
