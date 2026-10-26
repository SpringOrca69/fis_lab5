# Phase 6 approval (Support + profile)

## Verdict: APPROVED

## Checks
- Scope: Help, Book ambassador, Stall, Notifications, booking lib, placeholder videos and captions only. Placeholder screen removed. Only outside change is a phone icon on the "Call HeartPay helper" link in PaymentFailed (same wording, now clearly a call). No Phase 7+ work.
- Banned copy: diff grep finds no "credited", "Official", "Hawker", "Stall 01-42", 1800 or 6123. One helpline, `6000 0000 (demo)`, daily 8am-10pm, never called toll-free. Booking prefill 9000 0000 is the merchant's own phone in a labelled field (acceptable).
- Strings: all via `t()`, all four dictionaries extended and type-checked. Station is "Toa Payoh Lor 8 Market & Food Centre".
- Tap targets: controls use min-h-tap / min-h-tap-pay (call button measured >=55px by e2e). Switches and chips show a tick plus words, notifications show icon plus "New" plus dot.
- Settings: sound and vibration come from the store; haptics-off test shows zero vibrate calls; mute covered by Phase 4 tests.
- Tests per tester report: lint, Vitest 100, build, Playwright 37 all green; P6-1 to P6-6 pass. No failing A or R test.

## UI/UX notes (screenshots in reviews/screenshots/phase-6/)
- Help follows changes.md: call, book, videos on top, FAQ and scam notice collapsed below. Call button is the clear primary; language chips are tappable. The call button text wraps to two lines ("Call 6000 0000 / (demo)"); acceptable, could be tightened in Phase 8.
- Stall: clear hierarchy (shop, language, sound and vibration, scheme, demo tools, red-outlined Log out kept apart). Consistent cards, spacing and type with earlier phases.
- Book form: single column, large fields, selected slot and day marked with tick plus colour. Notifications: unread dot plus "New" word, Mark all read on top, empty state exists.
- Nav bar mid-page in full-page screenshots is a capture artefact of the fixed nav, not a layout bug.
- Videos are 2KB placeholders by design.

## Carry-over to Phase 7 (required)
1. `public/captions/*.ms.vtt`, `*.ta.vtt`, `*.zh.vtt` still contain `TODO-TRANSLATE`. P7-1 must scan `public/captions` as well as the dictionaries and translate them.

## Needs human
None required. Optional: on a phone open /help, tap Play, switch language, confirm captions follow.
