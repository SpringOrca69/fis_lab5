# Phase 3 test report (Scan flow), branch `phase-3`

Commands run: `npm run lint` (clean), `npm run test` (8 files, 72 tests pass), `npm run build` (pass, zero type errors; only the >500kB chunk warning), `npm run e2e` (16 pass: 6 new in `e2e/phase3.spec.ts`, plus phases 0-2).
Screenshots: `reviews/screenshots/phase-3/` (demo, explainer, fallbacks, not-cdc, scanning, sheet, blocked, upload-fail).

| ID | Result | Evidence |
|---|---|---|
| B-1 | pass | lint, vitest 72/72, build, e2e 16/16 all green. |
| B-2 | pass | Diff vs main is scan flow only (parseQr, payMachine, scan components, Pay, Demo, camera/decodeImage/demoQr libs, i18n keys, routes for /pay and /demo). No redeem, success or failed screens, no `/pay/success` route (e2e "phase boundary" test confirms). Confirm goes to a placeholder panel: "Payment confirmation arrives in the next update. No money was taken." |
| B-3 | pass | grep of `src` (non-test) for credited, official, govtech, iras, hawker, stall 01, 1800, 6123, toll: only the required disclaimer line. No 8-digit phone number other than `6000 0000`. |
| B-4 | pass | All new strings go through `t()`; EN/ZH/MS/TA share the typed key set (build passes). ZH/MS/TA values are `TODO-TRANSLATE` (138 each) by design this phase. Phase 7 must clear these. |
| B-5 | pass | Playwright asserts: Allow camera, Confirm, Cancel, camera controls >=56px; Not now, tabs, demo buttons >=48px. `text-sm` token is 16px (minimum). All icons have text labels. Global `:focus-visible` 3px outline. No horizontal scroll on demo, explainer, blocked, sheet. |
| P3-1 | pass | `src/lib/parseQr.test.ts` (valid, trim, URL domain, random, empty, malformed, 7 demo scenarios parse as intended, fresh nonces). |
| P3-2 | pass | Vitest (`pay.test.tsx` /demo) and e2e: 7 QR SVGs on `/demo`, public route, no overflow. |
| P3-3 | pass | Vitest `payMachine.test.ts` covers every state transition; e2e covers explainer, Not now -> noCamera + fallbacks, manual entry (empty error, not_cdc, url with no "Open link", valid sheet), granted permission skips the explainer and shows full-screen camera with no bottom nav and controls in the bottom 30%, blocked screen with three browser tabs and Try again staying blocked (fake camera via Chromium flags). `starting`, `scanning`, `unreadable`, `slow`, `cameraError` and `detected` are covered by the reducer tests and the mocked-scanner component test. |
| P3-4 | pass | e2e: dialog shows $15.00, "3 vouchers × $5", "Valid until 31 Dec 2026", the "Check the amount" line, Confirm payment (>=56px), "Cancel, no money taken" (>=56px, >=16px gap below Confirm); focus is inside `[role=dialog]`; Details expander shows codes and scheme. Screenshot `sheet.png`. |
| P3-5 | pass | e2e: manual entry reaches the sheet. Upload of a real screenshot of a `/demo` QR decodes (barcode-detector wasm) to the $10.00 sheet; a blank image shows "We couldn't find a QR code in that picture." |
| P3-6 | needs human | iPhone Safari on the Vercel HTTPS URL: log in, tap Accept CDC payment. Explainer appears, tap Allow camera, accept the iOS prompt, confirm the rear camera starts. Keep `/demo` open on a laptop. |
| P3-7 | needs human | Android Chrome, same steps. Torch button appears (if supported); tap and check it lights and the label says On/Off. On a device without torch the button must be absent. |
| P3-8 | needs human | Deny the prompt (or block in site settings). Blocked screen shows the steps tab matching the browser (Chrome Android, Safari iPhone, Samsung Internet). "Try again" does not loop the prompt. "Type the code" and "Choose a screenshot" each reach the sheet with a `/demo` code. |
| P3-9 | needs human | Point the camera at the `/demo` "Valid, $15" QR and hold for 5 seconds. Exactly one sheet opens, with a green frame + tick, a short beep (sound on) and a buzz on Android. Torch turns off on read. |

## R review notes
- Pause on read: `CameraView` sets a `handled` ref before the first callback returns and passes `paused` to the scanner; the reducer ignores `read` outside scanning/manual/upload. Supports P3-9 but is not proof until a human runs it.
- Feedback pairs visual (green frame + tick) with haptic/sound. Scan status uses `aria-live="polite"`; sheet is `role=dialog aria-modal aria-live="assertive"` with focus moved in.
- Camera view: facingMode environment, safe-area insets on top hint and bottom controls, semi-opaque backing behind text, 10s slow hint. Nav hidden while camera active.
- Minor, non-blocking: plan.md says to return focus to the scan button when the sheet closes; `BottomPanel` moves focus in but does not restore it explicitly. The camera restarts from `scanning`, so this is low impact. Approver may decide.
- Minor: the `/pay` header (bell with unread count "2") remains visible faintly behind the sheet for typed/uploaded codes. Cosmetic.
- Note: `e2e/phase3.spec.ts` added by tester. No app code was changed.

## Verdict: PASS WITH HUMAN CHECKS
All A and R tests pass. P3-6 to P3-9 need a real iPhone and Android.

## Retest after loop-1 fixes (commit ff6f31b)
Run on `phase-3`: `npm run lint` clean; `npm run test` 8 files, 73 tests pass (new: Cancel closes sheet and focus not on body); `npm run build` pass (only chunk-size warning); `npm run e2e` 17/17 pass (full suite, which the builder had skipped).

| Check | Result | Evidence |
|---|---|---|
| Header inert and aria-hidden while sheet open | pass | New e2e "P3-4 loop-1": with the sheet open every `header` has `inert` and `aria-hidden=true`; both removed after "Cancel, no money taken". |
| Focus restored on sheet close | pass | e2e: after cancel the dialog is gone and `document.activeElement` is not `body`; Vitest covers the same. |
| Darker backdrop | pass | Code: `bg-black/70` in BottomPanel. |
| Scanner path still works | pass | Existing granted-camera e2e (fake camera, controls, Type code, Use camera, Cancel to /home) passes; added assertion that no header is inert while scanning. |
| Earlier minor notes (focus restore, header faintly visible) | resolved | See above. |

Test file changed: `e2e/phase3.spec.ts` only. No app code changed. P3-6 to P3-9 remain for a human (steps above).

## Retest verdict: PASS WITH HUMAN CHECKS
