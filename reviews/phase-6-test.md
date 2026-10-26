# Phase 6 test report (Support + profile)

Branch `phase-6`. lint clean, Vitest 100/100, build OK, Playwright 37/37 (33 existing + 4 new in `e2e/phase6b.spec.ts`).

| ID | Result | Evidence |
|---|---|---|
| B-1 | pass | `npm run lint`, `test` (100 passed), `build`, `e2e` (37 passed) all green |
| B-2 | pass | Diff adds Help, BookAmbassador, Stall, Notifications, booking lib, videos/captions; Placeholder removed. Only other touch: PaymentFailed link label. No Phase 7+ work |
| B-3 | pass | grep of `src`: no "credited", "Official", "Hawker", "Stall 01-42", 1800, 6123. Only helpline is `6000 0000 (demo)`. Booking prefill `9000 0000` (`DEMO_PHONE`) is the merchant's own phone in a field labelled "Phone number", not shown as a helpline |
| B-4 | pass | No hard-coded JSX text in the new screens/components (grep); EN/ZH/MS/TA dictionaries all extended (type-checked by build). See note on captions |
| B-5 | pass | e2e checks call button >=55px; controls use `min-h-tap`/`min-h-tap-pay`; switches show icon tick + words; screenshots in `reviews/screenshots/phase-6/` |
| P6-1 | pass | `tel:60000000`, "Open daily 8am-10pm", no "toll-free", durations 1:30 / 1:15, language chips switch `<html lang>` |
| P6-2 | pass | FAQ aria-expanded toggles; scam notice shows "Concept, placeholder text"; no real numbers |
| P6-3 | pass | Booking validates phone, creates booking, bell 2 -> 3, notification "Visit booked for" |
| P6-4 | pass | 2 unread dots, Mark all read clears, empty state |
| P6-5 | pass | Sound, vibration, language persist after reload; shop details correct; Demo tools -> /demo; log out guards routes |
| P6-6 | pass | New tests: cards show duration; online Play renders `<track>` whose src/srclang follow language (en -> zh switches `/captions/accept.zh.vtt`); with simulated offline both cards show disabled "Needs internet" |
| Settings honoured | pass | New test: with `hapticsOn=false` success screen calls `navigator.vibrate` 0 times; with true, >0. Sound: `PaymentSuccess/Failed/Scanner` pass `soundOn`/`hapticsOn` from store; Vitest `feedback.test.ts` and `results.test.tsx` (P4-6) cover mute |
| Help entry points | pass | e2e: Login "Trouble logging in?", Login failure "Get help" (P2-2), Home "Get help", failed-payment "Call HeartPay helper", Report "Report a problem" (P5-3), all reach `/help` |

## Notes (not defects for this phase)
- Caption files `*.ms/ta/zh.vtt` contain `TODO-TRANSLATE` (2 lines each). Phase 7 P7-1 must cover `public/captions` as well as the dictionaries.
- Video files are 2KB placeholders by design; real playback not verified.

## Needs human
None required for Phase 6 (no H tests). Optional: on a phone open `/help`, tap Play, switch language, confirm captions appear.

## Verdict: PASS
