# HeartPay Proof of Concept: Build Plan

## Context

HeartPay is a mobile web app for older heartland merchants in Singapore who accept CDC vouchers. The hi-fi Figma prototype (`figma_screenshots/overall-screen-flow.png`, Screens 1, 2, 3, 4a, 4b, 5, 6) was reviewed against the Lab 2 document, and the findings are in `changes.md`. This plan turns the screens plus those fixes into a working, deployable proof of concept (POC) on phone browsers. The design priorities are simplicity, reassurance and human help.

The project folder is empty apart from `changes.md` and the screenshot, so this is a greenfield build.

---

## 1. Decisions (resolves changes.md §1 and §2)

### Confirmed with the user
| Topic | Decision |
|---|---|
| Payment direction | **Merchant scans the customer's CDC voucher QR**, then confirms. HeartPay is the redemption method. |
| Persona | **Ah Seng Minimart, Blk 123 Toa Payoh Lor 4**. Remove all "Stall 01-42", "Hawker Support" and "Hawker Peak Hours" references. |
| Idea 3 (promotion and insights) | **Descoped.** Not built. Flag that the Lab 2 document must drop it or mark it as future work. |
| Onboarding | **Descoped.** The app assumes a returning, already-registered merchant (ambassadors handle onboarding). State this on the login screen help text and in the README. |
| In scope extras | History, Payout and Stall (profile) tabs, and a Notifications screen. |
| Login | **Mock Singpass button**: short fake loading state, then Home. Includes a simulated failure path ("Singpass login trouble") that links to Help. |
| Data | **Mock data + `localStorage`**. Fully static, no backend. Deploys to Vercel Hobby. |
| Languages | **All four (EN, ZH, MS, TA), AI-drafted**, with a visible "translations need native-speaker review" note in the README. |
| QR demo | **Made-up CDC payload format** plus a `/demo` page that renders test QR codes for every scenario. |
| Targets | No hard deadline. iPhone Safari and Android Chrome. |

### Defaults I chose to fix the content contradictions (changes.md §2)
| # | Issue | Fix in the POC |
|---|---|---|
| 1 | Two helpline numbers and hours | One clearly fake number everywhere: **`6000 0000 (demo)`**, **daily 8am–10pm**. Not described as toll-free. The anti-scam card uses placeholder text, no real numbers. |
| 2 | Dates in 2025 vs 2026 | Scheme label **"CDC Vouchers 2026"**, voucher expiry **31 Dec 2026**. Seed transactions are generated **relative to the current date**, so dates never go stale. |
| 3 | "Credited" vs "paid at midnight" | Every screen says **"Payment confirmed"** at once and **"Paid to your bank tonight at midnight"**. The word "credited" is never used. |
| 4 | Last transaction on Home ≠ newest on report | Home and Report both read from the same transaction store, so the last transaction and the day's total always match. |
| 5 | Same ID for merchant and terminal | Merchant ID **`HP-M-88392`**, Device ID **`HP-D-0417`**. |
| 6 | Ambassador station in Chong Pang | **Toa Payoh Lor 8 Market & Food Centre** (near the persona). |
| 7 | Jargon | Apply the copy table in changes.md §5 to every string, in all four languages. |
| — | Trust claims (changes.md §6) | Remove all "Official CDC / GovTech / IRAS approved" claims. Add a persistent footer line: **"Concept prototype. Not affiliated with CDC or GovTech."** |

---

## 2. Stack

| Concern | Choice |
|---|---|
| Framework | Vite + React + TypeScript |
| Routing | `react-router` (many screens now) |
| State | React context + `useReducer`, persisted to `localStorage` (no Redux) |
| UI | Tailwind CSS + shadcn/ui (Button, Sheet/Drawer, Dialog, Accordion, Tabs, Calendar/Popover), `sonner` for toasts |
| QR scanning | `@yudiel/react-qr-scanner` (camera); `barcode-detector` ponyfill (already a dependency of the scanner) for decoding uploaded images |
| Test QR rendering | `qrcode.react` (only used on `/demo`) |
| Fonts | `@fontsource/noto-sans`, `@fontsource/noto-sans-sc`, `@fontsource/noto-sans-tamil` (bundled, so they work offline and Tamil never shows empty boxes) |
| i18n | Small custom `I18nProvider` with typed dictionaries (`t('home.todaySales')`); missing keys fail type-checking |
| Sound | Web Audio API generated tones (distinct success chime and soft failure tone), so no audio assets are needed |
| Tests | Vitest for pure logic (`parseQr`, reconciliation, formatting) |
| Later | `vite-plugin-pwa` in the final phase (optional) |
| Hosting | Vercel (HTTPS, preview URL per push) |

No animation library: CSS transitions only, disabled under `prefers-reduced-motion`.

---

## 3. Architecture

```
src/
  main.tsx
  App.tsx                       // providers + router
  routes.tsx
  styles/index.css              // Tailwind + design tokens (CSS variables)
  i18n/
    I18nProvider.tsx            // language context, persists choice, sets <html lang>
    en.ts zh.ts ms.ts ta.ts     // typed string dictionaries
  data/
    types.ts                    // Merchant, Transaction, Payout, Voucher, Notification, AmbassadorBooking
    seed.ts                     // seeded merchant + ~12 transactions today, past 14 days, payouts (date-relative)
    store.tsx                   // StoreProvider: reducer, localStorage persistence, selectors
    selectors.ts                // todayTotal, lastTransaction, reportForDate, reconcile()
  lib/
    parseQr.ts                  // payload validation → typed result (see §5)
    redeem.ts                   // mock "redemption API": validates against store, returns success/failure type
    feedback.ts                 // playSuccess(), playFailure(), vibrate() with feature detection + mute
    format.ts                   // SGD currency, SG date/time per locale
    exportReport.ts             // CSV, print-to-PDF, Web Share API
    camera.ts                   // permission state helpers (Permissions API + stored fallback)
  components/
    AppShell.tsx                // header (per-screen title, bell, language chip), bottom nav, disclaimer
    BottomNav.tsx               // Home · Accept payment · History · Payout · Stall
    BigButton.tsx               // ≥56px primary action
    OfflineBanner.tsx
    EmptyState.tsx  Loading.tsx
    scan/
      PermissionPrompt.tsx      // pre-permission explainer (8.1)
      CameraBlocked.tsx         // denied state with per-browser steps (8.2)
      Scanner.tsx               // full-screen camera, viewfinder, torch, bottom controls
      ResultSheet.tsx           // bottom sheet: amount, Confirm payment, Cancel, Details expander
      ManualEntry.tsx           // type a voucher code
      ImageUpload.tsx           // decode QR from gallery screenshot
  screens/
    Login.tsx                   // Screen 1
    Home.tsx                    // Screen 2
    Pay.tsx                     // Screen 3: state machine over the scan/* components
    PaymentSuccess.tsx          // Screen 4a
    PaymentFailed.tsx           // Screen 4b
    Report.tsx                  // Screen 5 (today) and History (any date)
    Payouts.tsx                 // new
    Help.tsx                    // Screen 6
    BookAmbassador.tsx          // form + slot picker + confirmation
    Stall.tsx                   // new: shop details, language, sound on/off, log out
    Notifications.tsx           // new
    Demo.tsx                    // test QR codes + reset demo data
```

### Routes and back behaviour (changes.md §9)
| Route | Screen | Back goes to |
|---|---|---|
| `/` | Login (language first) | none |
| `/home` | Home | none (root tab) |
| `/pay` | Accept CDC payment | Home (nav hidden while camera is active) |
| `/pay/success/:txId` | 4a | Home. "Next customer" → `/pay` |
| `/pay/failed?reason=` | 4b | `/pay`. "Try again" → `/pay`, "Call helper" → `/help` |
| `/history` and `/history/:date` | Report (today by default) | Home |
| `/payouts` | Payouts | Home |
| `/stall` | Stall / profile | Home |
| `/help`, `/help/book` | Help, booking | previous screen |
| `/notifications` | Notifications | previous screen |
| `/demo` | Test QRs (not in nav, linked from Stall → "Demo tools") | Stall |

Unauthenticated access to any route except `/` and `/demo` redirects to `/`.

---

## 4. Data model (mock)

```ts
Merchant      { id: 'HP-M-88392', deviceId: 'HP-D-0417', name, address, bankLast4, language, acceptedVoucherType: 'supermarket' | 'food' }   // Ah Seng Minimart: supermarket only
Transaction   { id, voucherIds: string[], amount, createdAt, status: 'confirmed', payoutId }
Payout        { id, date, expected, received?: number, status: 'scheduled' | 'paid' | 'matched' | 'not_matched' }
Voucher       { id, type: 'supermarket' | 'food', value: 2 | 5 | 10, expiry, usedAt?, merchantId? }   // the "redemption DB"; vouchers are not tied to a shop, a shop accepts one type
Notification  { id, type: 'payout' | 'mismatch' | 'tip' | 'booking', createdAt, read, i18nKey, params }
AmbassadorBooking { id, date, slot, name, phone, note, status: 'booked' }
Settings      { soundOn, hapticsOn }
```

- **"Matched" is defined as:** the amount the bank received for a payout equals the sum of the transactions HeartPay logged for that day.
- **Seed includes one "Not matched" day** (e.g. 3 days ago, $5 short) so the reconciliation problem state can be demoed. That day's report shows the gap, which transaction(s) are not in the payout, and a "Report a problem" action that opens Help.
- Tonight's payout is `scheduled`; past ones are `matched` except the seeded mismatch.
- `localStorage` key `heartpay:v1`; `Demo → Reset demo data` restores the seed.

---

## 5. QR payload and validation (changes.md §8.4)

Made-up format: `CDC1|<type>|<voucherId>,<voucherId>,...|<totalAmount>|<expiryYYYYMMDD>|<nonce>` where `<type>` is `SUPERMARKET` or `FOOD`. Voucher type comes from this field only; "already used" comes from the voucher store, never from an ID prefix.

`parseQr(text)` returns one of:
- `{ kind: 'cdc', voucherType, vouchers, amount, expiry }`: valid format
- `{ kind: 'url', domain }`: domain shown large; "Open link" only for an allowlist (empty in POC, so never shown), plus a warning consistent with the anti-scam notice
- `{ kind: 'not_cdc' }`: "This is not a CDC voucher code". No action offered except "Scan again".

`redeem()` (on Confirm) checks the voucher store and returns success or one failure type:

| Failure | Plain message (all 4 languages) |
|---|---|
| `expired` | QR code expired. Ask the customer to refresh it. |
| `already_used` | This voucher was already used. |
| `wrong_voucher_type` | This type of voucher can't be used here. Please ask the customer for a Supermarket voucher. (accepted type read from the merchant setting, translated) |
| `insufficient` | Not enough voucher value for this amount. |
| `network` | No internet connection. Nothing was charged. Try again when online. |

`/demo` renders a QR for: valid $15 (3 × $5) and valid $10 (both Supermarket), expired, already used (a voucher already in the store), wrong voucher type (a Food voucher), a plain URL, and random text. Each valid QR gets a fresh nonce/voucher IDs on page load so it can be redeemed once; scanning again triggers `already_used`. A "Simulate offline" toggle forces the `network` failure.

---

## 6. Screen specs (applies changes.md §3)

### Screen 1: Login
- Language picker first, four large tiles (≥64px) in native script. The choice persists (`localStorage`) and applies to every screen.
- Big "Log in with Singpass (demo)" button → 1.2s spinner → Home. A small "Trouble logging in?" link → Help (Singpass FAQ).
- Footer: help line `6000 0000 (demo)`, "existing HeartPay shops only, ask an ambassador to join", concept disclaimer.

### Screen 2: Home (title "Home")
- Only four blocks: today's CDC sales (total, payment count, last payment time and amount); **huge "Accept CDC Payment" button** in thumb reach; "Today's report" link; "Get help" link.
- Shop name and "Paid to your bank tonight at midnight" line under the total.
- Scheme info and community banner removed (scheme info moves to Stall).
- Empty state for first use: "No payments yet today".

### Screen 3: Accept CDC payment (`Pay.tsx` state machine, changes.md §8.7)
`checkingPermission → explainer | blocked | starting → scanning → (unreadable | not_cdc | url | sheet) → confirming → success | failed`, plus `noCamera`, `cameraError`, `manualEntry`, `upload`.
- **Explainer** (only if permission not decided): "We need your camera to scan QR codes", why, and "no photos are saved". "Allow camera" (the user gesture that starts the camera, needed for iOS) / "Not now" → fallbacks.
- **Blocked**: numbered steps tabbed by Chrome Android / Safari iOS / Samsung Internet; "Try again" re-checks without re-prompting in a loop; manual entry, image upload, call helper.
- **Scanning**: full-screen camera, rear camera (`facingMode: 'environment'`), viewfinder with corner guides, hint "Point at the customer's QR code" on a semi-opaque backing. Bottom controls: Torch (labelled, on/off state, hidden if `getCapabilities().torch` is unsupported), Type code, Cancel, Help. 10s timeout hint. `aria-live="polite"`.
- **On read**: pause the scanner at once (`paused` prop) to prevent double charges, green frame + tick (~400ms), vibrate where supported, short beep. Torch off.
- **ResultSheet** (bottom sheet, focus moved into it, `aria-live="assertive"`): large amount, "3 vouchers × $5", voucher type ("Supermarket voucher"), "Valid until 31 Dec 2026", **Confirm payment** (primary, 56px) and **Cancel, no money taken** (secondary, spaced apart). "Details" expander holds voucher IDs and scheme. The confirm sheet is the explicit confirmation step, so no tiny "non-refundable" text is needed. Instead: "Check the amount with the customer before you confirm" in body size.
- Bottom nav hidden; safe-area insets applied; `viewport-fit=cover`.

### Screen 4a: Payment successful
- White/calm layout, big tick, amount, "Payment confirmed". Success chime plays on mount (respects mute in Stall settings). Haptic where supported.
- Three rows max: shop, time, "Paid to your bank tonight at midnight". "View details" expander.
- Buttons: **Next customer** (primary) and Back to home. Not clipped, no stray white block.

### Screen 4b: Payment failed
- White background, red icon (calmer than a full red screen). Headline "Payment didn't go through", then the **largest text: "No money was taken"**, then the plain reason from §5.
- **Try again** (→ scanner) and **Call HeartPay helper** (opens `/help`, which has the `tel:` call button). Same wording on every screen.

### Screen 5: Report / History (title "Today's report" or the date)
- Date picker (last 14 days) at the top; History tab opens it.
- Summary: total, payment count, payout status in plain words ("Paid to your bank tonight at midnight" / "Received, matches" / "Not matched, $5.00 missing").
- Payment list with filter chips: All / Morning / Afternoon / Evening. Collapses after 5 with "Show all".
- **Download / share**: CSV download; "Share" via the Web Share API (file share to WhatsApp where supported, text summary fallback); "Print / save as PDF" via print stylesheet.
- No IRAS claim. "Hawker Peak Hours" card removed.

### Payouts (new)
- Tonight's scheduled payout at the top, then past payouts with status badges (icon + word, not colour alone). Tapping one opens that day's report.

### Screen 6: Help
- Top section only: **Call a person** (`tel:` link, hours, languages), **Book an ambassador visit**, **Short videos**.
- Videos: two cards with durations ("How to accept a CDC payment, 1:30", "What to do if a payment fails, 1:15"). The POC uses placeholder video files with a WebVTT caption track per language that follows the app language. Shows "Needs internet" when offline. Real video content is out of scope.
- Lower collapsed section: FAQ accordion with written answers (payout timing, Singpass login trouble, lost or cracked phone), and an anti-scam notice labelled "concept, placeholder text".
- Language chips are tappable and switch the app language.

### Book an ambassador (new)
- Fields: name (prefilled), phone (prefilled), preferred date (next 7 days), slot (9–11am / 2–4pm / 4–6pm), note (optional). Confirmation screen with a summary; a notification is added ("Visit booked for…"). Reminders: noted as future work, the POC adds an in-app notification only.

### Stall (new)
- Shop details (name, address, merchant ID, device ID, bank ending ••••1234), language switcher, sound on/off, vibration on/off, scheme info (moved from Home), Demo tools link, Log out.

### Notifications (new)
- List from the store (payout sent, mismatch found, booking confirmed), unread dot, "Mark all read". The bell shows the unread count. Empty state.

---

## 7. Cross-cutting requirements

- **Design tokens** (CSS variables, Tailwind theme): teal/green brand from the Figma, success/danger/warning with AA contrast; body ≥16px (base 18px), amounts 36–48px; tap targets ≥48px (56px for main payment actions, never <44px); `rem` units so system text size is respected.
- **Accessibility**: visible focus rings, text labels with all icons, `aria-live` regions, focus management for sheets, success/failure always shown by icon + words (+ sound/haptic), `prefers-reduced-motion`.
- **Offline**: `OfflineBanner` driven by `navigator.onLine` plus the demo toggle. Viewing home, reports and help text works offline. **Confirming a payment is blocked offline** (shows the `network` failure, "nothing was charged"). Payments are not queued, to avoid double-charge risk.
- **Loading states**: skeletons for Home and Report (short artificial delay on first load so the state exists), "Starting camera…" in the viewfinder.
- **One job per screen**, primary action in thumb reach, consistent bottom nav with correct active state.

---

## 8. Build phases

| Phase | Work | Done when |
|---|---|---|
| 0. Scaffold | Vite React TS, Tailwind, shadcn init, router, fonts, ESLint, Vitest; push to GitHub; connect Vercel | Blank app live on an HTTPS Vercel URL, opens on a phone |
| 1. Foundations | Tokens, `AppShell`, `BottomNav`, `I18nProvider` + EN dictionary skeleton, data types, seed, store + persistence, selectors (+ tests) | Can switch language and see seeded totals in a stub page |
| 2. Login + Home | Screens 1 and 2, mock Singpass, auth guard | Core navigation works end to end with mock data |
| 3. Scan flow | `parseQr` (+ tests), `/demo` page, `Pay` state machine, explainer, blocked, scanner, torch, result sheet, manual entry, image upload | Scanning a demo QR on a real phone opens the sheet; all §8.7 states reachable |
| 4. Results | `redeem()`, 4a / 4b, feedback sounds/haptics, store update | Confirm adds a transaction; Home and Report update; each failure QR shows its message |
| 5. Money screens | Report/History with date picker, filter, reconciliation states, export/share; Payouts | Mismatch day demoable; CSV downloads; share sheet opens on phone |
| 6. Support + profile | Help, FAQ, videos, Book ambassador, Stall, Notifications | All nav tabs and the bell lead somewhere |
| 7. Translations | Fill ZH, MS, TA dictionaries for every key; check Tamil/Chinese layout overflow | Every screen readable in all four languages |
| 8. Hardening | Empty/loading/offline states, a11y pass (keyboard, VoiceOver/TalkBack spot check, contrast), safe areas, README | Device checklist (§9) passes |
| 9. Optional | `vite-plugin-pwa` (installable, offline shell) | Installs to home screen |

---

## 9. Verification

- **Unit tests** (`npm run test`): `parseQr` for every payload type and malformed input; `redeem` for each failure; `reconcile` for matched / not matched; currency and date formatting per locale.
- **Build**: `npm run build` and `npm run preview` with no type errors (missing translation keys fail the build).
- **Real-device checklist** on the Vercel preview URL, on iPhone Safari and Android Chrome, with `/demo` open on a laptop:
  1. First visit: explainer appears → Allow → camera starts (rear).
  2. Deny permission → blocked screen; manual entry and image upload both complete a payment.
  3. Scan valid $15 → sheet once only (hold the camera on it for 5s: no second sheet) → Confirm → 4a with chime → Home total and last payment updated → Report shows it at the top.
  4. Scan the same QR again → 4b "already used", "No money was taken".
  5. Expired, wrong voucher type, URL and random-text QRs each show the right message.
  6. Torch toggles on Android; hidden on iPhone if unsupported.
  7. Simulate offline → banner shows; confirm is blocked with the network message.
  8. Switch to Tamil and Chinese → no empty boxes on any screen; layout does not overflow.
  9. Report: change date to the mismatch day → "Not matched" explained; download CSV; share opens the share sheet.
  10. Book an ambassador → confirmation + notification appears; bell count updates.
  11. Reload the browser → data and language persist; Demo → Reset restores the seed.
- **Desktop sanity**: works in Chrome at 390px width with webcam (secondary check only).

---

## 10. Out of scope / follow-ups outside the code

- Idea 3 (signage, promo templates, extra-business dashboard): descoped. Update the Lab 2 document to match.
- Sign-up for non-participating shops: descoped (ambassador-led onboarding).
- Real Singpass, real CDC/SGQR redemption, real bank payouts, push/SMS reminders, POS integration (CSV export is the stated integration path).
- Native-speaker review of ZH, MS and TA strings.
- Update the Lab 2 document: merchant-scans-customer flow, Singpass login in the user flow, consistent persona and dates.
