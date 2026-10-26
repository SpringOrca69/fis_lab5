# Phase 2 approval (Login + Home)

## Verdict: APPROVED

Deferred item still open: P0-3 (Vercel HTTPS URL and `/home` deep link opened on a phone) must pass before Phase 3 starts. No H tests belong to Phase 2.

## Scope
- Diff is Login, Home, auth provider/guard, plural-aware `t()`, i18n keys, routes, e2e. Nothing from Phase 3+ (no scanner, redeem, report logic). `/pay`, `/history`, `/help` etc. remain placeholders behind links. Deleting the Phase 1 `Foundations` stub and its e2e is fine (replaced by Home).
- Everything in scope is present: language-first login, mock Singpass (1.2s spinner), failure path linking to Help, auth redirect, Home with skeleton and empty state.

## Rules
- Banned copy: none found. One helpline only (`6000 0000 (demo)`, daily 8am-10pm, from `src/lib/constants.ts`). Disclaimer present on Login and Home (AppShell footer). "Paid to your bank tonight at midnight" used; no "credited".
- Strings all via `t()`; all four dictionaries have every key (type-checked). ZH/MS/TA text is `TODO-TRANSLATE` English until Phase 7, as the phase plan allows.
- Plural: `home.payments.one/other` are real in EN, ZH, MS, TA ("1 payment", "1 笔付款", "1 bayaran", "1 கட்டணம்"); e2e covers it.
- Home has exactly four blocks (sales card, Accept CDC Payment, Today's report, Get help). Scheme info and community banner removed, per changes.md.
- Tap targets: tiles >=64px, Singpass, Accept and link rows at the 56px token (e2e-asserted), Get help and Trouble links >=48px. Failure shown by icon + words.

## B-5 text-sm decision: no fix required
The tester computed `text-sm` as 15.75px. In `src/styles/index.css` the token is `--text-sm: 0.889rem`, which at the 18px root is 16.0px, and the comment states 16px is the minimum anywhere. All six uses (merchant name, link hints, login footer, nav labels, bell badge, disclaimer) are therefore at the 16px floor. Not a violation. Optional polish for later: the login footer and Home link hints could go to `text-base` for older users, since 16px is the floor and not the 18px base. Not blocking.

## Design review (P2-6)
1. One job per screen: Login = pick language then log in; Home = Accept CDC Payment is the dominant block, thumb reach, 112px tall.
2. Hierarchy: $75.00 is the largest item on Home; the dark-teal Accept card is the clear primary action. Failure state on Login uses icon + "Singpass login trouble" + Get help. Nothing clipped.
3. Contrast: white on deep teal, dark teal on pale, red on tint all look AA. Selected language tile uses a tick plus border, not colour alone.
4. Plain words: matches changes.md section 5 ("Home", "Paid to your bank tonight at midnight"). No jargon.
5. Consistent tokens, radii and button style across both screens and the Phase 1 shell.
6. Intentional look: the teal brand, wallet/QR icons and calm card on pale canvas follow Figma but with far less density; it does not read as a default template.

Compared with Figma Screens 1 and 2: official-partner claim, scheme card, banner, "Scan" tab, jargon header and second helpline are all gone, as changes.md requires. Language and Login buttons are bigger.

Minor notes (not blocking):
- Home screenshots were full-page captures, so the fixed bottom nav appears mid-image overlapping the last card. This is a capture artifact, not a layout bug, but the Phase 8 pass should confirm the content has enough bottom padding above the nav on a short viewport.
- "Bahasa Melayu" wraps to two lines in its tile; acceptable, and the tile height holds.
- Login has a large empty gap between the language tiles and the Log in button; it keeps the primary action in thumb reach, so acceptable.
- Focus rings are not asserted by a test; add to the Phase 8 a11y pass.
