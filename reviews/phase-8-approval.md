# Phase 8 (Hardening) approval

## Verdict: NEEDS HUMAN

No failing A or R test. Lint, Vitest and build re-run clean by the approver. P8-6 (full device run) is the only open item and cannot be proven in Playwright.

## Scope (B-2)
Hardening only: OfflineBanner (AppShell, Login, camera view), Report loading skeleton, disclaimer on the camera screen, a feedback.ts guard, a Payouts aria fix, README, device checklist, axe and e2e tests. One i18n key (`offline.banner`) in all four dictionaries. No PWA or Phase 9 work, no new features. Note: the test report says "No app code changed" in its notes, but the builder commit did change app code; the diff above is what counts and it is in scope.

## Rules
- Banned copy: grep of `src` finds none (only test assertions and the 20261231 date). One helpline only.
- Disclaimer visible on every screen including the camera (new line in Scanner).
- New string translated in EN, ZH, MS, TA (checked in diff); i18n tests pass.
- Banner is icon plus words, not colour alone. Text 16px bold, AA contrast on the amber tint.

## Spot checks
- Offline: `useIsOnline` uses `useSyncExternalStore` over the demo toggle, `online`/`offline` events and `navigator.onLine`. Banner shows on Home and Report in screenshots; Home, Report and Help stay readable; confirm is blocked (network failure). No regression. A hard reload offline fails until the Phase 9 service worker. Expected.
- Sheet focus: dialog receives focus on open (asserted) and focus does not fall to `<body>` after cancel (P8-2b). Acceptable. It is checked only as "not body", not "back on the scan control"; worth a glance on a device.
- feedback.ts: `allowed()` returns false only when `navigator.userActivation.hasBeenActive === false`. Sticky activation is true after any earlier tap (login, Accept CDC, Confirm), so the chime on the success screen and the scan vibration still fire. Browsers without the API (older Safari) give `undefined`, which is treated as allowed. No regression found. The P4-8 chime/vibration was already human-confirmed, but re-check it in the device run since this file changed.
- Report skeleton: 400ms once per session. Fine, matches plan.

## README
Has what it is, PoC and mock-data statement, dev/build/test/e2e commands, /demo flow, left-out list, ZH/MS/TA native-review note, Vercel deploy, and a pointer to the checklist.

## Device checklist
`reviews/final-device-checklist.md` has all 11 `tests.md` items for iPhone Safari and Android Chrome. Item 6 wording is shared across both phones; fine.

## UI/UX notes
- The offline banner sits under the header, above the content: clear, calm, wraps to three lines at 390px without clipping. Good hierarchy; the amber is distinct from the failure red.
- On the camera screen the offline strip sits at the bottom of the video area and may overlap the lower viewfinder edge; minor, check on a device.
- Skeleton shapes match the real layout. Spacing and type scale are consistent with earlier phases.

## NEEDS HUMAN: exact device checks (P8-6)
On the Vercel HTTPS URL, iPhone Safari and Android Chrome, with `/demo` open on a laptop, run all 11 items in `reviews/final-device-checklist.md`. Pay particular attention to:
1. Chime and vibration still fire on the success screen after tapping Confirm (feedback.ts changed).
2. Simulate offline: banner shows on Home, Report, Help and the camera screen, and Confirm shows "nothing was charged".
3. Tamil and Chinese: no empty boxes or overflow, including the new banner.
4. Cancelling the result sheet: focus is sensible (with VoiceOver or TalkBack if available).
5. Torch works on Android, hidden where unsupported.
Reply "pass" or list the failures.
