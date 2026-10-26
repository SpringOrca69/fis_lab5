# Phase 7 approval (Translations)

## Verdict: CHANGES REQUESTED (one small fix)

## Checks passed
- No TODO-TRANSLATE in src, public/captions or README. translations.test.ts enforces key parity, no empty strings and no TODO.
- `src/i18n/en.ts` is unchanged versus main.
- Banned copy absent from ZH, MS, TA and captions: credited and its equivalents, Official, Hawker, Stall 01-42, 1800 and 6123. The helpline appears only as `6000 0000 (demo)` (Help screenshots in Tamil and Chinese confirm). HeartPay, CDC, GovTech, Singpass, merchant and device IDs are unchanged.
- Scope is clean. The only code changes are layout-only: truncate switched to wrap in BottomNav, DayPicker and Scanner; Help call button keeps the phone number on one line; PaymentFailed wrapping; a Tamil size override. No new features.
- Sizes and taps: nothing below the 16px project minimum or the 18px base. Nav, DayPicker and call-button targets keep their min-height classes. Payment buttons are still 56px.
- README has the AI-drafted and native-speaker-review note.
- Tester's nav note verified. ZH nav.payout is "款项" and the FAQ says "款项" page. MS nav.payout is "Bank" and the FAQ says "tab Bank". TA nav is "வங்கி" and the FAQ says "வங்கி பகுதி". All three match.
- Screenshots (TA and ZH for home, sheet, failed, help, stall, notifications, plus MS home): no empty boxes, no horizontal overflow, no clipping. Icon plus words is kept on result screens. The nav overlay in the full-page shots is a screenshot artifact.
- Test report is honest. Lint, 121 unit tests and 41 e2e pass. P7-4 is not claimed as passed.

## Requested change
1. `src/styles/index.css` (`:lang(ta) .text-amount-wide`) and `src/screens/PaymentFailed.tsx`. On the Tamil failure screen (`ta-08-failed-expired.png`, `ta-09`), the key reassurance line "பணம் எடுக்கப்படவில்லை" is split in the middle of a word ("எடுக்கப்படவில்" / "லை") by `break-words`. This is the most important line on the failure screen for an anxious user. Good looks like: a Tamil font size where the longest word fits the 342px column (try about 1.5rem), still the largest text on the screen, so the line wraps only at word boundaries. Keep `break-words` only as a last-resort fallback. Re-run the P7-2 screenshots and check that `ta-08`, `ta-09` and `ta-06` look right.

## UI/UX notes
- Hierarchy is preserved in all languages: the amount and status stay largest, and the primary buttons stay full width.
- Tamil is long and wraps heavily on the Home CTA, the Help cards and the Notifications cards. It is readable and unclipped, so this is acceptable. The Chinese layouts are tight and clean.
- The Chinese notifications line breaks inside "银行户口" (a harmless cosmetic break).
- Spacing and type scale match earlier phases.

## Human and out-of-band checks
- P7-4: native-speaker review of ZH, MS and TA is out of band (noted in README). Not blocking.
- Optional glance on a phone: Tamil and Chinese Home and Failure screens, to confirm there are no empty boxes. Playwright asserts the fonts load.
