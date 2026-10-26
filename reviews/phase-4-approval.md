# Phase 4 (Results) approval

Verdict: NEEDS HUMAN

All A and R tests are green (lint, 91 Vitest, build, 19 e2e per the tester). No code changes are requested. The only open item is P4-8, which cannot be proven in a desktop browser.

## Scope
- Diff is redeem(), buildRedemption, 4a, 4b, feedback sounds/haptics, the demo offline switch, the store `redeem` action, and the Pay confirm wiring. No Report, Payouts, Help, Stall or OfflineBanner work. Nothing in scope is missing.
- Minor note: the `plain` prop on AppShell and the `settle` CSS are small supporting changes and are fine.

## Rules
- Banned copy: no "credited", no Official/CDC claims, no Hawker, no second helpline. 4a says "Payment confirmed" and "Paid to your bank tonight at midnight" (reuses `home.paidTonight`).
- New keys are in all four dictionaries (typed, build passes). Non-EN text is still EN fallback marked TODO-TRANSLATE, which is expected until Phase 7.
- Taps: Next customer, Back to home, Try again and Call HeartPay helper use `min-h-tap-pay` (56px); the e2e test checks it. "View details" uses 48px. Body text is 16px or larger.
- Icon plus words on both screens (tick + "Payment confirmed"; alert icon + "Payment didn't go through" + "No money was taken").

## Logic
- redeem() is pure. Offline is checked first and returns `network`; nothing is queued or stored. Failures write nothing to the store.
- Single use: a `confirmed` ref blocks a double tap, and the pre-redeem state marks vouchers used, so a rescan returns `already_used`. The success route replaces history, and the sound plays once per mount (ref guard). A reload of the success URL still shows the same payment and does not charge again.
- `insufficient` is only unit-tested because no demo QR triggers it. That is acceptable.

## Final-state check (mid-animation screenshots)
The `settle` animation is 0.35s scale+fade, with the end state at full opacity, `bg-success` and a white tick. `success-details.png` was taken nearly settled and shows a solid green circle with a white tick, so the end state is sound. In `success.png` the pale tick and in `failed.png` the missing icon are capture timing only. The animation is skipped under reduced motion, where it renders at its final state. A final-state re-capture would be nice, but is not required.

## UI/UX notes
- 4a: calm white layout, with the tick, the "Payment confirmed" headline and a big $15.00 as the clear focal point. It has three rows only, a details expander, then a primary and a secondary button with a gap between them. Nothing is clipped and there is no stray block. This is cleaner than the Figma and follows changes.md.
- 4b: a white page with a red icon. Order is red headline, then the largest "No money was taken" (text-amount), then the plain reason, then Try again and Call helper. This matches changes.md.
- Consistent with earlier phases (teal header, button styles, type scale). The header still reads "Accept CDC payment" on result screens, which is fine as context.
- Minor, optional for later phases: "Call HeartPay helper" could be labelled as a call button once Help exists (Phase 6). The red headline on white should be confirmed at AA in the Phase 8 axe pass.

## NEEDS HUMAN checks (P4-8)
On a real phone (iPhone Safari and Android Chrome), with /demo open on a laptop:
1. Scan the valid $15 QR and tap Confirm payment. The success chime plays once, and Android vibrates (iPhone will not).
2. Scan the same QR again. The failure screen shows with a softer, different tone and a vibration on Android, plus "This voucher was already used." and "No money was taken".
3. Turn on Simulate offline in /demo, scan a valid QR, and confirm. The failure screen shows "Nothing was charged".
4. Muting in Stall arrives in Phase 6, so it is covered by tests only for now.
Reply "pass" or the failures.
