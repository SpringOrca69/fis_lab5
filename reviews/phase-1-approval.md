# Phase 1 approval (Foundations)

## Verdict: APPROVED

## Scope
- The diff covers tokens, AppShell, BottomNav, I18nProvider with four dictionaries, types, seed, store, selectors, and format/dates.
- It also adds `Foundations.tsx`, a stub page that uses the seed and the language switcher, plus `Placeholder.tsx` for /pay, /history, /payouts, /stall and /notifications.
- There is no Login, no Home beyond the stub, no auth guard and no scan code. The placeholders are acknowledged and keep the nav links working.
- `phases.md` only changed the Phase 1 status to `review`, which is fine.
- Nothing in scope is missing.

## Tests
- The test report is honest. Lint, 38 unit tests, build and 3 e2e tests all pass. There is no failing A or R test, and no H test is claimed as passed.
- P0-3, the Vercel phone check, is correctly carried over. It must pass before Phase 3 starts.
- The report admits that `vite preview` already falls back to the SPA, so the e2e deep links do not prove the Vercel rewrite.

## Extra requirements checked
- `vercel.json` has the catch-all rewrite to /index.html. Pass.
- Tokens are defined once in `@theme`, in rem. Base is 18px, sm is 16px, amounts are 40px and 48px, taps are 48px, 56px and 64px. Pass.
- AA colours: every computed pair is at least 4.5:1, and a test covers it. Pass.
- Dictionaries: ZH, MS and TA have the same keys as EN, enforced by the `Record<TranslationKey, string>` type. Untranslated values carry `TODO-TRANSLATE`. Pass.
- Seed is relative to now, with exactly one mismatch day, 3 days ago, $5 short. Pass.
- Stub page shows the $75.00 total, the payment count, the last payment, and a 4-way language switcher. Pass.
- Copy rules: no banned words and no second helpline number. The disclaimer is in the footer. "Stall" is the spec tab name. All visible strings go through `t()`. Pass.

## UI/UX notes
- The AppShell hierarchy is clear. The teal header is sticky with the title and bell, and the bell has an accessible name that includes the unread count.
- Bell badge: the white count on teal stays readable.
- The $75.00 amount at 48px is the dominant element on the stub.
- The bottom nav is the strongest element. Pay is the one filled tile, and the active state combines a top bar, bold label and filled icon, so it never relies on colour alone. Nav items are 56px tall, and a focus ring is defined.
- Spacing and radii are consistent. The look is intentional rather than a default template.
- Warning badge: "Not matched, $5.00 missing" has no icon or date, and it sits in today's card, which could mislead. It is stub-only, but Phase 5 must show it only on the relevant day, with an icon and words.
- Nav label truncation: in ZH, MS and TA the nav labels truncate to "TODO-...". This is expected until Phase 7, which must check label length.
- Plurals: "{count} payments" shows "1 payments" for a count of one. Handle singular and plural in Phase 2 or Phase 7.
- Contrast comment: the CSS comments state 9.6:1 and 7.4:1, but the measured values are 8.74 and 7.49. This is cosmetic. Fix it when the file is next touched.

## Needs human
None for this phase. P0-3 (Vercel HTTPS URL and a `/home` deep link on a phone) is still pending and blocks the start of Phase 3.
