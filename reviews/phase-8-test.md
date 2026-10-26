# Phase 8 test report (Hardening)

Branch `phase-8`. Run: lint clean; Vitest 14 files / 121 tests pass; build passes (only the pre-existing >500kB chunk-size notice); Playwright 56 passed (48 builder + 8 new in `e2e/phase8b.spec.ts`).

| ID | Result | Evidence |
|---|---|---|
| B-1 | pass | `npm run lint`, `test`, `build` all green, zero type errors. |
| B-2 | pass | `git diff main..HEAD`: only hardening files (OfflineBanner, AppShell, Scanner, Report skeleton, README, checklist, axe e2e, one i18n key x4). No later-phase features. |
| B-3 | pass | New `P8 banned copy sweep in en/zh/ms/ta` visits 11 routes per language (incl. FAQ open, failure screen, /demo): no "credited", "official", "IRAS", "hawker", "stall 01-42", 1800/6123, and no phone number other than 6000 0000. |
| B-4 | pass | `translations.test.ts` (in Vitest) passes; new offline-banner key present in all 4 dictionaries; no raw keys/TODO in any route in any language. |
| B-5 | pass (R) | `:focus-visible` is a 3px outline (index.css:79); P8-2 asserts computed outline >=2px on each tabbed control. Tap size/18px tokens covered by `tokens.test.ts`; screenshots show labelled icons. |
| P8-1 | pass | axe (wcag2a/aa, 2.1a/aa), serious+critical = 0 on all 10 routes (`/`, `/home`, `/pay`, `/history`, `/payouts`, `/help`, `/help/book`, `/stall`, `/notifications`, `/demo`) plus extra states: FAQ open, 3 failure reasons, mismatch day, pay fallback/manual/sheet/success. |
| P8-2 | pass | Keyboard-only: login, Accept CDC, Not now, Type code, type payload, Submit, sheet (dialog gets focus, `aria-live=assertive`), Confirm, success heading. Focus ring checked on every tabbed target. `P8-2b`: cancelling the sheet leaves focus off `<body>`. |
| P8-3 | pass | Skeletons: Home ("Loading today's sales") and Report ("Loading the report") appear on first load (new test; screenshot `reviews/screenshots/phase-8/home-skeleton.png`). Empty states: Home "No payments yet today", Report "No payments this day", Notifications "No notifications" (new test with emptied store). Offline: banner via `/demo` toggle and via `navigator.onLine` event (builder test) and now via a true `context.setOffline(true)` (new test): banner shows, Home/Report/Help render, "Needs internet" on videos, `tel:` link visible, confirm in the manual flow ends on `reason=network` "nothing was charged". Navigation done client-side since no service worker exists until Phase 9. Screenshot `report-offline.png`. |
| P8-4 | pass | Disclaimer asserted visible on `/` and on 10 routes incl. `/pay` (camera screen) and failure screen. |
| P8-5 | pass | Global `@media (prefers-reduced-motion: reduce)` zeroes animations/transitions; e2e with reduced-motion emulation: max duration <0.01s. `.settle` animation only under `no-preference`. |
| Safe areas | pass | `viewport-fit=cover` in meta; built CSS contains `safe-area-inset-bottom` and `-top`. |
| Console | pass | No console errors/warnings or page errors across 10 routes x 4 languages. |
| README | pass | Has run, demo flow, left-out list, translations-need-review, accessibility, Vercel deploy, device checklist pointer. |
| Final device checklist | pass | New test: all 11 items of `tests.md` are present in `reviews/final-device-checklist.md` for iPhone Safari and Android Chrome. |
| P8-6 | needs human | See below. |

## Needs human (P8-6)
Open the Vercel HTTPS URL on an iPhone (Safari) and an Android phone (Chrome), with `<url>/demo` open on a laptop. Work through `reviews/final-device-checklist.md` (11 items each), ticking boxes and noting device/OS.

## Notes (not failures)
- True offline works only for in-app navigation; a hard reload offline fails until the Phase 9 service worker. Expected.
- My first banned-copy regex falsely matched "6123" inside QR payload "20261231"; fixed in the test with word boundaries.
- Phase 8 added tests in `e2e/phase8b.spec.ts`. No app code changed.

## Verdict: PASS WITH HUMAN CHECKS
