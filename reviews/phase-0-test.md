# Phase 0 (Scaffold) test report

Branch `phase-0`, builder commit 624c7db. Run on 2026-10-26.

| ID | Result | Evidence |
|---|---|---|
| B-1 | pass | `npm run lint` clean, `npm run test` 1/1 passed, `npm run build` (tsc -b + vite build) succeeded, `npm run e2e` 1/1 passed |
| B-2 | pass | Only scaffold files: Stub screen, router, App, utils, config. No later-phase features (no i18n, store, scan code) |
| B-3 | pass | grep of src and index.html for credited, official, hawker, "stall 01", 1800, 6123 found nothing |
| B-4 | pass (n/a) | Only UI strings are the stub "HeartPay" and "Scaffold ready." Not through `t()`, but i18n is Phase 1; acceptable for a placeholder |
| B-5 | pass (n/a) | No interactive elements. Base font 18px set in src/styles/index.css. Tap targets and focus rings deferred to UI phases |
| P0-1 | pass | `e2e/smoke.spec.ts`: renders `/`, heading "HeartPay" visible, zero console errors and page errors (390x844 mobile Chromium) |
| P0-2 | pass | Vitest sample `src/lib/utils.test.ts` passes; Playwright sample passes |
| P0-3 | needs human | Open the Vercel HTTPS URL on a phone. Expected: "HeartPay / Scaffold ready." page loads over HTTPS. Also open a deep link (for example `/home`) to confirm the SPA rewrite in vercel.json works. Remote exists: github.com/SpringOrca69/fis_lab5; I did not verify that Vercel is connected |
| P0-4 | pass | `CLAUDE.md` present; `.claude/agents/` has phase-approver, phase-builder, phase-tester; `.claude/commands/run-phase.md` present (all non-empty) |

## Scaffold notes
- Stack present: Vite 8, React 19, TS, Tailwind 4 (@tailwindcss/vite), react-router, Vitest (jsdom), Playwright (390x844, isMobile), bundled Noto Sans / SC / Tamil fonts imported in index.css, `@` alias set in both tsconfig.app.json and vite.config.ts, vercel.json SPA rewrite, `.gitignore` covers dist and test-results.
- Playwright webServer runs `npm run build && preview`, so e2e tests the production build.
- Minor, non-blocking: the build also emitted Devanagari and latin-ext font files (from the Noto Sans fontsource CSS). This only adds weight and does not affect Phase 0 tests. Tamil and Chinese fonts are bundled as required.
- Minor: working tree has an uncommitted `phases.md` change (not touched by me).

## Hand-configured shadcn (components.json): acceptable
`components.json` is valid against the shadcn schema (new-york style, Tailwind v4 with empty `tailwind.config`, css `src/styles/index.css`, aliases `@/components`, `@/lib/utils` and so on, lucide icons). The prerequisites are in place: `cn()` in `src/lib/utils.ts` (tested), the `@` alias in TS and Vite, and the deps clsx, tailwind-merge, class-variance-authority, tw-animate-css and lucide-react. So `npx shadcn add button ...` should work in later phases. Caveats for the Phase 1 builder: (1) shadcn's CSS-variable theme block and `@import "tw-animate-css"` are not yet in index.css, so add them with the design tokens; (2) I did not run `shadcn add` to prove the CLI accepts the file, so the first component add is the real check. Acceptable for Phase 0; no `src/components/ui` exists yet, which is fine.

## Verdict: PASS WITH HUMAN CHECKS
All A and R tests pass. P0-3 (Vercel URL on a phone) needs a human.
