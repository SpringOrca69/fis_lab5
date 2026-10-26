# Phase 4 (Results) test report

Branch phase-4, commit 17b98dd plus test additions. Run 2026-10-26.

Commands: `npm run lint` clean. `npm run test` 11 files, 91 tests pass. `npm run build` passes (only the chunk-size warning). `npm run e2e` 19 of 19 pass (full suite).

Tester changes (tests only, no product code):
- `e2e/phase3.spec.ts`: the P3-3 test expected the Phase 3 placeholder (Confirm shows "No money was taken" and stays on /pay). Phase 4 intentionally replaces that, so it failed on first run. Updated to expect navigation to `/pay/success/`. This was a stale test, not an app bug.
- `src/screens/results.test.tsx`: added P4-6 integration test (muted setting reaches `playSuccess` with `soundOn: false`).

| ID | Result | Evidence |
|---|---|---|
| B-1 | pass | lint, vitest (91), build, e2e (19) all green |
| B-2 | pass | Diff is redeem, 4a/4b, feedback, offline toggle, store update. No Phase 5+ screens (Report, Payouts, Help, Stall are still placeholders). No OfflineBanner (Phase 8), as noted. |
| B-3 | pass | grep of `src` (non-test) for credited, official, hawker, "stall 01", 1800, 6123: no matches. Only helpline is `6000 0000 (demo)` in constants.ts. Unit and e2e assert no "credited" on 4a. |
| B-4 | pass | Build type-checks the typed dictionaries, so a key missing from any of the 4 dictionaries fails the build. Non-EN strings are still EN fallback marked TODO-TRANSLATE (expected until Phase 7). |
| B-5 | pass | e2e asserts "Next customer" and "Back to home" are at least 56px tall. Failed screen uses min-h-tap-pay. Icons are paired with words. Screenshots in `reviews/screenshots/phase-4/`. Note: the secondary "Call HeartPay helper" label is `text-base` (16px), which meets the 16px minimum. |
| P4-1 | pass | `src/lib/redeem.test.ts`: success, expired, already_used, wrong_merchant, network (checked first), insufficient. |
| P4-2 | pass | Vitest: confirm adds exactly one transaction and shows 4a. E2E: after paying $15, Home shows "6 payments". |
| P4-3 | pass | Vitest and e2e: the same code twice goes to `reason=already_used`, failure screen. |
| P4-4 | pass | E2E with the demo offline switch: confirm goes to `reason=network`, text "Nothing was charged"; Vitest also checks nothing is stored. Screenshot `failed-network.png`. |
| P4-5 | pass | Vitest P4-5 plus screenshot `failed.png`: "No money was taken" is `text-amount`, larger than the headline (`text-title`) and the reason (`text-lg`). Actions go to /pay and /help. |
| P4-6 | pass | `feedback.test.ts` (muted plays nothing) plus the new integration test showing `soundOn:false` reaches the chime call. |
| P4-7 | pass | Screenshots `success.png` and `failed.png`: success is a tick icon plus "Payment confirmed"; failure is an alert icon plus "Payment didn't go through" and "No money was taken". Colour is not the only signal. 4b is white with a red icon. |
| P4-8 | needs human | On a phone, open the Vercel/preview URL. Log in, then open /demo on a laptop and scan the valid $15 QR from Pay. Confirm payment. Check (1) the chime plays on the success screen, (2) Android vibrates (iPhone will not), (3) the failure tone is soft on a re-scan (already used). Then set sound off and check there is no chime (the Stall settings screen arrives in Phase 6, so mute can only be tested via store or unit tests until then). |

Notes (not failures):
- `insufficient` is not reachable from any demo QR; covered by unit test only (builder note confirmed).
- "Try again" on 4b goes to `/pay` and restarts the scanner (per plan).
- The success screenshot was taken mid "settle" animation, so the tick circle looks pale; not a defect.

Verdict: PASS WITH HUMAN CHECKS (P4-8).
