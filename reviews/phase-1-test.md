# Phase 1 test report (Foundations), branch phase-1

Commands run: `npm run lint` (clean), `npm run test` (5 files, 38 tests pass), `npm run build` (tsc -b + vite build, zero errors), `npm run e2e` (3 pass at 390x844).

Tests added by Tester: `src/styles/tokens.test.ts` (rem sizes, computed WCAG contrast), `e2e/foundations.spec.ts` (stub page totals, language switch/persist, overflow, tap sizes, deep links). No product code changed.

| ID | Result | Evidence |
|---|---|---|
| B-1 | pass | lint, test, build, e2e all exit 0, no type errors |
| B-2 | pass | Only foundations scope plus placeholder routes (/pay, /history, /payouts, /stall, /notifications render `Placeholder`; /, /home render the `Foundations` stub). No Login, Home, scan, or Phase 2+ screens |
| B-3 | pass | grep of `src` for credited/official/hawker/stall 01/1800/6123: no hits (only English-dictionary guard in test). Footer text correct. Nav tab label is "Stall" (spec tab name, not "Stall 01-42") |
| B-4 | pass | All visible strings go through `t()`. ZH/MS/TA have identical key sets (test). Not yet translated: marked TODO-TRANSLATE, as the phase permits |
| B-5 | pass | e2e: nav links >=56px, language tiles >=64px, bell >=48px, html font 18px, `text-sm` 16px min. Focus ring `3px solid` in `:focus-visible`. Icons have text labels (bell has aria-label) |
| P1-1 | pass | data.test.ts: todayTotal 75, last tx $15, newest first, Home total == report total, empty -> undefined |
| P1-2 | pass | reconcile matched / not_matched ($5 gap + missing $5 payment) / pending |
| P1-3 | pass | format.test.ts: SGD and dates/times for en, zh, ms, ta |
| P1-4 | pass | i18n.test.tsx (provider remount reads storage, sets html lang) plus e2e reload: lang stays `ta`, aria-pressed true |
| P1-5 | pass | save/load `heartpay:v1`, reset restores seed, re-seed on new day or corrupt data, seed relative to date (tested for 2027 date and 00:30 edge); e2e confirms key exists in browser |
| P1-6 | pass | `Dictionary = Record<TranslationKey,string>`. I temporarily deleted `'nav.pay'` from ms.ts: `tsc -b` failed with `TS2741 Property '"nav.pay"' is missing ...`; file restored (git status clean for product files). Runtime key-parity test also exists |

## Extra requirements
| Item | Result | Evidence |
|---|---|---|
| vercel.json catch-all rewrite | pass | `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`; e2e deep links on preview server work (note: vite preview already does SPA fallback, so this is not proof of Vercel behaviour; that is the deferred P0-3 human check) |
| Tokens in rem, 18px base | pass | html 18px; text-sm 16px, amount 40px, amount-xl 48px, tap 48px, tap-pay 56px, tile 64px, all rem (tokens.test.ts) |
| AA contrast computed | pass | Script output: white/brand-700 8.74, ink/canvas 15.35, ink/white 16.72, ink-muted/white 7.49, ink-muted/canvas 6.87, success on tint 6.06, danger on tint 5.59, warning on tint 6.06, success/white 7.13, danger/white 6.57, brand-900 on brand-100 10.39, brand-700/canvas 8.02, focus/white 5.85, focus/canvas 5.37. All >= 4.5. Minor: CSS comment claims white on brand-700 is "9.6:1" and ink-muted "7.4:1"; actual 8.74 and 7.49. Comment only, not a defect in behaviour |
| ZH/MS/TA full keys with TODO-TRANSLATE | pass | Key parity test; 22 TODO-TRANSLATE entries in each (language names and app.name intentionally untouched); English has none |
| Seed: one mismatch, 3 days ago, $5 short | pass | data.test.ts; e2e shows "Not matched, $5.00 missing" |
| Stub page shows seeded totals + switcher | pass | e2e: $75.00, 5 payments, paid-tonight line, 4 language buttons switch. Screenshots in `reviews/screenshots/phase-1/` (home-en, zh, ms, ta). No horizontal scroll in any language |
| No Phase 2+ scope | pass | See B-2 |

## Observations (not failures)
- With TODO-TRANSLATE stubs, bottom-nav labels truncate ("TODO-...") and the header wraps in zh/ms/ta. Expected until Phase 7, but Phase 7 must re-check nav label length (labels use `truncate`).
- The footer disclaimer sits above the sticky bottom nav; fine.
- Full-page screenshots show the sticky nav overlapping content; that is a screenshot artefact of fullPage capture.
- The Home stub heading is "Home" but with no Phase 2 guard (/ and /home both render it); expected.

## Needs human
None for Phase 1. Carry-over: P0-3 (Vercel HTTPS URL and `/home` deep link on a phone) is still pending, and must pass before Phase 3 starts.

## Verdict: PASS
