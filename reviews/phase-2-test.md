# Phase 2 test report (Login + Home)

Branch `phase-2`, builder commit 7aa463e. Tester run on 2026-10-26.

Automated results: `npm run lint` clean; `npm run test` 39/39 pass (5 files); `npm run build` OK, no type errors; `npm run e2e` 10/10 pass (Chromium 390x844).
No new tests were needed: `e2e/phase2.spec.ts` already covers every A test, including singular plural in all four languages, the Singpass failure link to Help, and the `/home` redirect.

| ID | Result | Evidence |
|---|---|---|
| B-1 | pass | lint, vitest, build all green, zero type errors. |
| B-2 | pass | Diff is Login, Home, auth guard, plural-aware `t()`, i18n keys, routes. No scan, results or money logic. `/help` and `/demo` are placeholders only. Note: the builder deleted `e2e/foundations.spec.ts` and the `Foundations` stub screen it tested; the stub was replaced by Home, so this is acceptable. |
| B-3 | pass | grep of `src` (non-test) for credited / official / hawker / stall 01 / 1800 / 6123 / IRAS found nothing. The only hits are the required disclaimer, which says "CDC or GovTech". The only helpline is `6000 0000 (demo)` in `src/lib/constants.ts`. |
| B-4 | pass with note | Login and Home strings all go through `t()`. Missing keys fail type-checking (build passes). The ZH, MS and TA entries for these screens still read `TODO-TRANSLATE: <English>`, which is expected until Phase 7. Only `home.payments` has real plural forms in all four languages. |
| B-5 | pass with note | E2E asserts: language tiles >=64px; Singpass button, Accept link and all Home links >=56px. Root font is 18px and `--spacing-tap-pay` is 3.125rem (56.25px), so the builder's change is fine. Icons carry text labels. Note: 6 uses of `text-sm` (15.75px) for secondary hints and the login footer are just under 16px. Primary body text is 16px or more. Minor, for the Approver. Focus rings: not asserted by an automated test. |
| P2-1 | pass | e2e: 4 tiles, each >=64px. Choosing Tamil sets `<html lang=ta>` and `aria-pressed`, and persists after reload. Footer shows the single helpline, hours, "existing HeartPay shops only" and the disclaimer. No horizontal scroll. |
| P2-2 | pass | e2e: the spinner "Logging in…" shows, then `/home` after 1.1 to 3s. `?singpass=fail` shows an alert with icon + "Singpass login trouble", and a "Get help" link to `/help`. The link navigates to `/help`, and "Try again" then reaches Home. |
| P2-3 | pass | e2e: `/home`, `/pay`, `/history`, `/payouts`, `/stall`, `/notifications` redirect to `/`. `/demo` stays open. |
| P2-4 | pass | e2e: total $75.00, "5 payments", last payment $15.00 (from the store). Singular "1 payment" in EN, "1 笔付款" in ZH, "1 bayaran" in MS, "1 கட்டணம்" in TA, with no horizontal scroll. Empty state "No payments yet today" appears with 0 payments. The skeleton (role=status) shows first. |
| P2-5 | pass | Code and e2e: Home has the sales card, the Accept CDC Payment link, "Today's report" and "Get help". `main` has exactly 3 links. The sales card has the "Paid to your bank tonight at midnight" line. |
| P2-6 | needs Approver | Design review is left to the Approver. Screenshots are in `reviews/screenshots/phase-2/`: login-en, login-fail, home-en, home-empty. |

## Builder deviations
- `/help` and `/demo` are unauthenticated placeholders: accepted, as the plan says the redirect excludes only `/` and `/demo`. `/help` being open lets the failed-login link work.
- `--spacing-tap-pay` is 3.125rem (56.25px at the 18px root): verified by the e2e height assertions.

## Bugs
None blocking.

## Verdict: PASS
(P2-6 design review is pending with the Approver. No H tests in this phase. The deferred P0-3 Vercel phone check from phases.md is still pending and must pass before Phase 3.)
