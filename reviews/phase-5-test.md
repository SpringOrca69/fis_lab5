# Phase 5 test report (Money screens), branch phase-5

Run: lint clean; vitest 12 files / 97 tests pass; build OK (only chunk-size warning); Playwright 26/26 pass (390x844).

| ID | Result | Evidence |
|---|---|---|
| B-1 | pass | `npm run lint`, `test`, `build`, `e2e` all green, zero type errors. (My first e2e edit broke `tsc -b` because e2e is type-checked; fixed in the test.) |
| B-2 | pass | Diff vs main: Report, Payouts, DayPicker, PayoutBadge, report.ts, exportReport.ts, i18n keys, routes, print classes on AppShell/BottomNav. Stall, Notifications, Help remain placeholders. |
| B-3 | pass | grep of src for credited / official / hawker / stall 01 / 1800 / 6123: no hits. Only helpline is `6000 0000 (demo)` in constants.ts. |
| B-4 | pass (with note) | All 46 new keys exist in en/zh/ms/ta (type-checked; build passes). ZH/MS/TA still carry `TODO-TRANSLATE` fallbacks, which is expected until Phase 7. |
| B-5 | pass | Picker day buttons, steppers and chips measured >=47px in e2e; actions use 56px (`min-h-tap-pay`); body text-base; every icon has a text label or aria-label; screenshots show focus-safe controls. |
| P5-1 | pass | e2e: report total equals Home total, newest row time equals Home last payment, midnight line shown, no h-scroll; Home link and History tab both open `/history`. |
| P5-2 | pass | Unit: 15 keys (today + 14), out-of-range rejected. e2e: `/history/2000-01-01` redirects, dialog has 15 day buttons. Added P5-2b: Morning/Afternoon/Evening counts equal expected split from row times, sum equals All, Show all expands from 5 rows. |
| P5-3 | pass | e2e: mismatch day shows "Not matched, $5.00 missing", "may be missing" with 11:15 am $5.00 row tagged "Not in payout", "Report a problem" goes to `/help`. Screenshot `reviews/screenshots/phase-5/report-mismatch.png`. |
| P5-4 | pass | e2e: downloaded CSV header, row count and amounts equal the displayed list. Unit tests on `buildCsv`. |
| P5-5 | pass | e2e: tonight card first with "Scheduled"; badges have icon + words; exactly one "Not matched" row; row opens that day's report. Screenshot `payouts.png`. |
| P5-6 | needs human (visual); code review pass | Print CSS hides nav, bell, controls, picker; shop name/address/date header shown; all rows printed even when collapsed. Added e2e using print media emulation (`print-preview.png`): clean. Observation: grey canvas background still shows in print emulation because the AppShell wrapper uses `bg-canvas` (only html/body are forced white). Human: open `/history`, Print / save as PDF, check preview page. |
| P5-7 | needs human | On a phone (HTTPS preview), open `/history`, tap Share: share sheet should open (WhatsApp offers the CSV file where supported). Button is hidden if `navigator.share` is missing. Cannot be proven in Playwright. |

## Observations (not failures)
- Builder used a custom `DayPicker` (dialog with a 15-button grid) instead of shadcn Calendar/Popover; repo has no shadcn UI components. Meets the 14-day limit, 48px taps, Esc to close, focus return. Deviates from plan.md stack wording only.
- Print: grey background (above). Mid-page nav bar in full-page screenshots is a sticky-nav artifact, not a bug.
- Original P5-2 e2e filter check was weak; strengthened with P5-2b.

Added tests: `e2e/phase5.spec.ts` (P5-2b, P5-6).

## Verdict: PASS WITH HUMAN CHECKS (P5-6 print preview, P5-7 share sheet)
