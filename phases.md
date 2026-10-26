# HeartPay: Phase Roadmap

Source of truth for scope is `plan.md` (+ `changes.md`). This file says **what order** and **what "done" means**. Test IDs refer to `tests.md`.

## Status
| Phase | Name | Status | Approved on |
|---|---|---|---|
| 0 | Scaffold | approved | 2026-10-26 |
| 1 | Foundations | todo | |
| 2 | Login + Home | todo | |
| 3 | Scan flow | todo | |
| 4 | Results | todo | |
| 5 | Money screens | todo | |
| 6 | Support + profile | todo | |
| 7 | Translations | todo | |
| 8 | Hardening | todo | |
| 9 | PWA (optional) | todo | |

**Deferred human check:** P0-3 (Vercel HTTPS URL, and `/home` deep link, open on a phone) is **pending**. Deferred by the user on 2026-10-26; must pass before Phase 3 starts.

Status values: `todo` → `building` → `testing` → `review` → `needs-human` → `approved`.

## The loop (per phase)
1. **Builder** builds only the phase's scope (plan.md section listed below). Commits on branch `phase-N`.
2. **Tester** runs the phase's tests from `tests.md`, writes missing automated tests, writes `reviews/phase-N-test.md`.
3. **Approver** reads the diff, the test report, and screenshots; checks scope, UI/UX, accessibility, copy rules; writes `reviews/phase-N-approval.md` with verdict `APPROVED`, `CHANGES REQUESTED` or `NEEDS HUMAN`.
4. `CHANGES REQUESTED` → back to Builder with the list. Max **3 loops**, then stop and ask the human.
5. `NEEDS HUMAN` → you run the real-device checks listed, reply "pass" or the failures.
6. On `APPROVED`: merge `phase-N` to `main`, update the Status table, `/clear`, start the next phase.

No phase starts until the previous one is `approved`.

## Design rule for every UI phase (2, 3, 4, 5, 6, 8)
Builder and Approver must load the `frontend-design` skill. Builder compares each screen with its Figma screenshot **plus** the fixes in `changes.md`; where they conflict, `changes.md` wins. Tokens (teal/green brand, 18px base, ≥48px taps, 56px for payment actions) are defined once in Phase 1 and reused.

---

## Phase 0: Scaffold
- **Scope:** plan.md §2, §8 Phase 0.
- **Deliver:** Vite + React + TS, Tailwind, shadcn init, react-router, fonts, ESLint, Vitest, Playwright; repo on GitHub; Vercel connected.
- **Tests:** P0-1 to P0-4.
- **Human needed:** create GitHub repo, connect Vercel, open URL on phone.

## Phase 1: Foundations
- **Scope:** plan.md §3 (shell, i18n, data), §4, §7 (tokens).
- **Deliver:** design tokens, `AppShell`, `BottomNav`, `I18nProvider` with **all four dictionaries stubbed** (EN full, ZH/MS/TA keys present with EN fallback text marked `TODO-TRANSLATE`), types, seed (date-relative, one mismatch day), store + localStorage, selectors.
- **Tests:** P1-1 to P1-6.

## Phase 2: Login + Home
- **Scope:** plan.md §6 Screens 1 and 2; routes and auth guard in §3.
- **Deliver:** language-first login, mock Singpass (+ failure path), Home with four blocks, skeleton + empty state.
- **Tests:** P2-1 to P2-6. **Design review:** yes.

## Phase 3: Scan flow
- **Scope:** plan.md §5, §6 Screen 3, §8 Phase 3.
- **Deliver:** `parseQr`, `/demo` page, `Pay` state machine, explainer, blocked, scanner, torch, result sheet, manual entry, image upload.
- **Tests:** P3-1 to P3-9. **Design review:** yes. **Human needed:** real camera on iPhone + Android.

## Phase 4: Results
- **Scope:** plan.md §5 (`redeem`), §6 Screens 4a/4b.
- **Deliver:** `redeem()`, success + failed screens, chime and haptics, store update, offline block.
- **Tests:** P4-1 to P4-8. **Design review:** yes. **Human needed:** sound and vibration on phone.

## Phase 5: Money screens
- **Scope:** plan.md §6 Screen 5, Payouts.
- **Deliver:** Report/History with date picker and filters, reconciliation states, CSV / share / print, Payouts.
- **Tests:** P5-1 to P5-7. **Design review:** yes. **Human needed:** share sheet on phone.

## Phase 6: Support + profile
- **Scope:** plan.md §6 Help, Book ambassador, Stall, Notifications.
- **Deliver:** Help with FAQ and video cards (placeholder files + captions), booking flow, Stall, Notifications with bell count.
- **Tests:** P6-1 to P6-6. **Design review:** yes.

## Phase 7: Translations
- **Scope:** plan.md §8 Phase 7; copy table in `changes.md` §5.
- **Deliver:** ZH, MS, TA filled for every key; no `TODO-TRANSLATE` left; overflow checked.
- **Tests:** P7-1 to P7-4. **Human needed:** native-speaker review (out of band, noted in README).

## Phase 8: Hardening
- **Scope:** plan.md §7, §8 Phase 8, §9.
- **Deliver:** empty/loading/offline states, a11y pass, safe areas, README, concept disclaimer everywhere.
- **Tests:** P8-1 to P8-6 (includes full `tests.md` device checklist). **Human needed:** full device run.

## Phase 9: PWA (optional)
- **Deliver:** `vite-plugin-pwa`, installable, offline shell.
- **Tests:** P9-1 to P9-2.
