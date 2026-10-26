# Phase 5 approval (Money screens)

## Verdict: NEEDS HUMAN

No failing A or R test. Scope, copy and design review pass. Two device checks (P5-6, P5-7) cannot be proven in Playwright. Approve once the person replies "pass".

## Checks
- Scope: diff is Report, Payouts, DayPicker, PayoutBadge, report.ts, exportReport.ts, routes, i18n keys, print classes on AppShell/BottomNav. Stall, Notifications and Help remain placeholders. Nothing from Phase 6+.
- Copy: no "credited", Official, Hawker, 1800 or 6123 in src. Status text is "Paid to your bank tonight at midnight". No new phone number.
- i18n: 46 new keys in en/zh/ms/ta, all through `t()`; plurals use `.one/.other` (`report.showAll`). TODO-TRANSLATE in zh/ms/ta is expected until Phase 7.
- Test report is honest: P5-6 and P5-7 are marked human, none claimed passed. Lint, 97 unit tests, build and 26 e2e green per report.
- Observation on custom DayPicker (not shadcn Calendar/Popover): accepted. The repo has no shadcn UI components, and it meets 14-day limit, 48px taps, Esc and focus return. Note it in README at Phase 8.

## Design review (390px)
- One job per screen. Report leads with a large $ total, count and status line. Payouts leads with the Tonight card. Good hierarchy.
- Mismatch state is clear: warning icon + words "Not matched, $5.00 missing", tinted explanation panel, the missing 11:15 am row tagged "Not in payout" (icon + words), and a 56px "Report a problem" button. Colour is never the only signal.
- Payout badges have icon + word. Consistent with Phase 2-4 type scale, cards and buttons.
- Matches Figma Screen 5, with changes.md fixes applied (no IRAS claim, no Hawker card, plain wording, date picker, filters, export).
- Mid-page nav bar in full-page screenshots is a sticky artifact, not a bug.

## Non-blocking polish (can go in Phase 8)
1. Print: AppShell wrapper `bg-canvas` still shows grey in print emulation. Add `print:bg-white` on the wrapper.
2. Payouts: "Received, matches" badge wraps to two lines on 390px, so the row is taller than needed. Allow the badge to use full width or shorten the layout.
3. `report.loading` key is unused (skeleton belongs to Phase 8).

## Device checks the person must run (Phase 5 deferred, H)
- P5-6: On a phone or desktop browser, open `/history` (try a mismatch day too), tap "Print / save as PDF". The preview should be a clean white page: shop name, address and date at the top, all payments listed (even if collapsed on screen), no nav bar, bell, buttons or date picker, and the concept footer. A grey background is the known polish item above, not a failure.
- P5-7: On iPhone Safari and Android Chrome (HTTPS Vercel preview), open `/history`, tap "Share". The share sheet should open, and WhatsApp should offer the CSV file where supported. Also tap "Download CSV" and confirm the file opens.
