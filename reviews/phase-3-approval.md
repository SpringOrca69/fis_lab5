# Phase 3 approval (Scan flow), re-review after loop 1

## Verdict: NEEDS HUMAN

Both loop-1 items are resolved in code. All A and R tests are green (lint, 73 unit, build, 17/17 e2e). Only the real-device checks P3-6 to P3-9 remain.

## Loop-1 items
1. Focus restore: resolved. `BottomPanel.tsx` saves the opener on mount and restores focus on unmount. If the opener is gone it falls back to the Type code button (`data-return-focus`), then to the first control in `main`. A Vitest test and an e2e test check that focus is not left on `body` after Cancel.
2. Header behind the sheet: resolved. All `header` elements get `inert` and `aria-hidden` while the dialog is open, and both are removed on close. The backdrop is now `bg-black/70`. The e2e test checks both the set and the clear, and that the header is not inert while scanning.

## Regression and scope
- Diff since loop 1 touches only `BottomPanel.tsx`, `Scanner.tsx` (one data attribute) and tests, plus screenshots. Nothing from Phase 4 or later was added.
- Copy, dictionaries, tap targets: unchanged from the first review, still clean.
- The test report is honest. H tests are not claimed as passed.

## UI/UX notes
- The sheet now stands alone over a dimmed page, with the amount as the largest element and Confirm and Cancel clearly spaced.
- The corner guides are thin. If they are hard to see on a real camera, make them heavier.

## Device checks the human must run (NEEDS HUMAN)
Use the HTTPS Vercel preview, with `/demo` open on a laptop. P0-3 is also still pending (Vercel URL and `/home` deep link on a phone).
- P3-6, iPhone Safari: the explainer appears. Tap Allow camera and accept the prompt. The rear camera starts. Torch is absent if unsupported.
- P3-7, Android Chrome: same steps. The Torch button toggles On/Off and the torch lights. It is hidden on devices without torch.
- P3-8: deny the permission. The blocked screen shows steps for your browser. Try again does not loop the prompt. Type code and Choose a screenshot each reach the sheet with a `/demo` code.
- P3-9: hold the camera on the valid $15 QR for 5 seconds. Exactly one sheet opens, with a green frame and tick, a beep, and a buzz on Android. The torch turns off on read.
