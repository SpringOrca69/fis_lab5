# Phase 3 approval (Scan flow)

## Verdict: CHANGES REQUESTED

All A and R tests are green (lint, 72 unit tests, build, 16 e2e). Scope, copy and tap targets are clean. One small requirement from changes.md §8.8 is missing, so I am not approving yet. After the fix, the verdict becomes NEEDS HUMAN for P3-6 to P3-9.

## Required changes
1. `src/components/scan/BottomPanel.tsx` (and the callers in `Pay.tsx`): focus is moved into the sheet but never returned. changes.md §8.8 and plan.md say "return focus to the scan button when it closes". Save `document.activeElement` on mount and restore it on unmount. If the opener is gone (the camera view remounts), focus the scan view container or the first bottom control (Type code). Add one test: open the sheet, Cancel, and check `document.activeElement` is not `body`.
2. Typed and uploaded codes (not the camera): the sheet backdrop is `bg-black/50`, so the header title and the bell with its "2" show through faintly. Make the header `inert` and `aria-hidden` while the dialog is open, or use a solid, darker backdrop (for example `bg-black/70`). Good looks like the sheet standing alone over a dimmed page, with nothing readable behind it. This is cosmetic, so a darker backdrop is enough.

## Checks
- Scope (B-2): pass. Only parseQr, Demo, Pay state machine, scan components, camera libs and i18n keys were added. Confirm leads to a placeholder, with no redeem, no success or failed screens and no `/pay/success` route. The e2e test confirms this.
- Copy (B-3): pass. No "credited", "Official", "Hawker" or second helpline. The disclaimer is present on non-camera screens. The URL warning is consistent with the anti-scam stance.
- Dictionaries (B-4): all four are present with the same typed keys. ZH, MS and TA are `TODO-TRANSLATE` by design until Phase 7.
- Tap targets (B-5): pass. Payment actions are 56px or more, the others 48px or more, and all icons have labels.
- Test report honesty: good. The H tests are marked "needs human", and the minor issues are disclosed.
- The blocked.png screenshot shows the bottom nav over the fallback buttons. This is a full-page capture artifact of a fixed nav. It is not a defect.

## UI/UX notes
- Explainer: clear hierarchy. One camera icon, a big headline, "No photos are saved" shown with a shield icon, a 56px Allow button, and Not now as a clear secondary.
- Result sheet: the amount ($15.00) is the largest thing, followed by "3 vouchers × $5" and the validity line. The amber "check the amount" line is readable. Confirm and Cancel are spaced apart. The Details expander is correctly kept low. This matches changes.md §3 and §8.4 and is simpler than Figma Screen 3.
- Blocked: browser tabs, numbered steps and a Try again button, with fallbacks below. This is good. The Chrome (Android) tab label wraps to two lines, which is acceptable.
- Scanning: full-screen view with corner guides, a dark backing behind the hint and bottom controls. The green background is the Chromium fake camera. The corner guides are visible but thin. Make them slightly heavier on a real camera if the human finds them hard to see.
- Spacing, type scale and button style are consistent with Phases 1 and 2.

## Device checks the human must run after the fixes (NEEDS HUMAN)
- P3-6, iPhone Safari (HTTPS Vercel preview, `/demo` open on a laptop): the explainer appears, tap Allow camera, accept the iOS prompt, and the rear camera starts. Torch should be absent if unsupported.
- P3-7, Android Chrome: the same steps. The torch button appears, and its On/Off label changes and the torch lights up. It should be hidden on devices without torch.
- P3-8: deny the permission. The blocked screen shows the steps tab for the right browser. Try again does not loop the prompt. Type the code and Choose a screenshot each reach the sheet with a `/demo` code.
- P3-9: hold the camera on the "Valid, $15" QR for 5 seconds. Exactly one sheet opens, with a green frame and tick, a beep and an Android buzz. The torch turns off on read.
