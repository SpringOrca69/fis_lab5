# HeartPay Hi-Fi Prototype: Required Changes Before Coding

Source: HeartPay hi-fi prototype (Screens 1, 2, 3, 4a, 4b, 5, 6) reviewed against the ISFS621 Lab 2 document (empathy map, problem definition, 3 ideas, user flow).

Priority key: **P0** = must fix before coding (blocks build or contradicts itself) / **P1** = should fix before coding / **P2** = polish, can be done during build.

---

## 1. Decisions needed first (P0)

These change what gets built. Resolve them before any code is written.

- [ ] **Payment direction.** Screen 3 has the merchant scanning the customer's voucher QR. The Lab 2 doc says HeartPay layers on top of the existing CDC/SGQR setup. Decide one:
  - (a) HeartPay is a companion app: the customer scans the shop's SGQR, and HeartPay only shows confirmation, logs and reconciles; or
  - (b) HeartPay is a new redemption method where the merchant scans the customer's code.
  Then update Screens 2 and 3, the copy, and the Lab 2 document so they all match.
- [ ] **Persona and location.** Pick one: minimart ("Ah Seng Minimart", Toa Payoh Lor 4) or hawker stall ("Stall 01-42", "Hawker Support", "Hawker Peak Hours"). Make every screen consistent with the choice.
- [ ] **Scope of Idea 3 (promotion and insights).** Either add the screens listed in section 4, or remove Idea 3 from the Lab 2 document. Do not code half of it.
- [ ] **Onboarding.** Either add a sign-up flow (section 4) or state clearly that onboarding is done by ambassadors and the app only handles returning merchants.
- [ ] **Login method.** Screen 1 uses "Log in with Singpass", which is not in the Lab 2 document. Confirm it is intended. If it is, add it to the user flow and handle the failure case ("Singpass login trouble" is already an FAQ on Screen 6).

---

## 2. Content contradictions to fix (P0)

| # | Issue | Where | Fix |
|---|---|---|---|
| 1 | Helpline conflict: `1800-HEARTPAY` ("24/7") vs `6123 4567` ("toll-free", Mon-Sun 8am-10pm) | Screens 1, 2 vs Screen 6 | Use one number and one set of hours everywhere. A 6123 number is not toll-free format. |
| 2 | Dates conflict: voucher expiry `31 Dec 2025`, scheme labelled "2025" / "2024/2025", but transactions dated `21 Sep 2026` | Screens 2, 3, 5, 6 | Align all dates to one year. A voucher expiring in 2025 would already be expired in Screen 3. |
| 3 | Settlement conflict: Screen 4a says "Confirmed & credited", while Screens 2, 3, 5 say funds are paid out at midnight (11:59 PM) | Screens 2, 3, 4a, 5 | Pick one story. Suggested: "Payment confirmed" now, "payout tonight at midnight". Remove the word "credited" from 4a. |
| 4 | "Last transaction 2:45 PM ($10.00)" vs newest item on the report `11:42 am` | Screens 2 vs 5 | Make the last transaction on Screen 2 equal the newest item on Screen 5. Make the day's total match. |
| 5 | `HP-88392` is used as both Merchant ID and Terminal ID | Screens 2, 3 | Use two distinct identifiers. |
| 6 | Nearest ambassador station is "Chong Pang Hawker Centre" while the shop is in Toa Payoh | Screen 6 | Use a location near the chosen persona's address. |
| 7 | Terminology: "Verified Result", "Live Scan", "Live Terminal", "PayNow Corp proxy", "voucher token", "auto-cleared" | Screens 2, 3, 5 | Replace with plain words (see section 5). |

---

## 3. Screen-by-screen changes

### Screen 1: Language and login
- [ ] **P0:** Fix Tamil rendering (shows empty boxes). Load a Tamil-capable font (e.g. Noto Sans Tamil). Check Chinese and Malay too.
- [ ] **P1:** Make the language the first thing a user sees and make it persist. Language selection must apply to every later screen, not only this one.
- [ ] **P1:** Increase the size of the language buttons and the "Log in" button.
- [ ] **P2:** Remove or label as "concept" the "Official CDC Merchant Partner" and "Supported by Singapore Community Development Council" claims (see section 6).

### Screen 2: Home dashboard
- [ ] **P0:** Fix the helpline and the last-transaction inconsistencies (section 2).
- [ ] **P1:** Reduce density. The screen has about 10 blocks. Keep only: today's total, big "Accept CDC Payment" action, today's report, help. Move the scheme info card and the community banner to a secondary place or remove them.
- [ ] **P1:** Enlarge the primary button and body text. The target users are older, low-digital-literacy merchants.
- [ ] **P1:** Remove the redundant "Scan" tab if "Accept CDC Payment" does the same job.
- [ ] **P1:** Add an entry point to the promotion and insights feature (Idea 3) if kept.
- [ ] **P2:** Rename "Merchant Dashboard" in the header to something friendlier (e.g. "Home"), and use per-screen titles.

### Screen 3: Accept CDC payment
- [ ] **P0:** Apply all camera and scanning principles in **section 8** (permission explainer, denial handling, scan feedback, bottom-sheet result, torch, thumb-first layout, explicit states, accessibility).
- [ ] **P0:** Resolve the payment direction (section 1) and rewrite the flow accordingly.
- [ ] **P0:** Fix the voucher expiry date.
- [ ] **P1:** Simplify. Show the amount and the "Confirm" button first. Move "Voucher Token Details", "Voucher Identifier", "Validity Expiry" and "Eligible Scheme" to an optional "Details" expander.
- [ ] **P1:** Remove "Live Terminal / Live Scan / Verified Result" jargon.
- [ ] **P1:** Make the "Cancel / Scan Another" button clearer. Confirm that Cancel is safe, since the user fears "pressing the wrong button".
- [ ] **P1:** Add an explicit confirmation step or an undo window before payment is final, since the current "non-refundable" note is in tiny text.
- [ ] **P1:** Make "non-refundable" wording readable (larger, plain language) or remove it if undo is added.

### Screen 4a: Payment successful
- [ ] **P0:** Fix the settlement wording (section 2).
- [ ] **P1:** Keep the big tick, the amount and the sound. Spec the audio: when it plays, a distinct success sound, volume, and a mute option.
- [ ] **P1:** Strip the detail table to 3 rows maximum (stall, time, status). Move the rest to "View details".
- [ ] **P1:** Fix the overlapping "SCREEN 4A" label (a prototype artifact) and the clipped "Next customer" and "Back to home" buttons. Make the white block at the bottom of the card a proper part of the layout or remove it.
- [ ] **P2:** Add haptic feedback on supported devices.

### Screen 4b: Payment failed
- [ ] **P1:** Keep the "No money was deducted" message and make it the largest text after the headline.
- [ ] **P1:** Show the failure reason in plain language and in the chosen language (e.g. "QR code expired. Ask the customer to refresh.").
- [ ] **P1:** Specify the different failure types and their messages (expired code, already used, network error, insufficient balance, wrong merchant). Only one case is shown.
- [ ] **P1:** Specify what "Call HeartPay Helper" does (dial, in-app call, or open Screen 6).
- [ ] **P2:** Reconsider the full red background. It is alarming for an anxious user. A white screen with a red icon is calmer.

### Screen 5: Today's report / reconciliation
- [ ] **P0:** Make totals consistent with Screen 2, and settlement wording consistent (section 2).
- [ ] **P1:** Replace "Stall 01-42 Settlement Status / Auto-cleared via PayNow Corp proxy" with plain words.
- [ ] **P1:** Define "Matched" (matched against what?). Define what happens when a payment is "Unmatched" or missing, since that is the core reconciliation use case. Add that state.
- [ ] **P1:** Add a date picker or "History" view so merchants can see previous days. The current screen only shows today and yesterday's payout.
- [ ] **P1:** Specify the "Download / share report" output (PDF, CSV, share to WhatsApp) and make it work.
- [ ] **P1:** Specify the "Filter" control.
- [ ] **P1:** Back up or remove the "approved for IRAS & CDC record keeping" claim (section 6).
- [ ] **P2:** Review the "Hawker Peak Hours" card. It is tip content and does not belong in a report. Move it to insights or remove it.

### Screen 6: Get help
- [ ] **P0:** Fix the helpline number and hours (section 2).
- [ ] **P1:** Reduce length. Help should show: call a person, book an ambassador, short videos. Collapse the FAQs and the anti-scam notice into a lower section.
- [ ] **P1:** Fix the Tamil rendering and make the language chips tappable.
- [ ] **P1:** Make videos play in the chosen language (or with subtitles), and specify durations and content. Define video hosting and offline behaviour.
- [ ] **P1:** Define "Book an ambassador visit": form fields, available time slots, confirmation, and reminders.
- [ ] **P1:** Make the FAQ items real. Write the answers for the three shown (payout timing, Singpass login trouble, lost or cracked phone).
- [ ] **P1:** Make the screen reachable from Screens 2 and 4b only through clear buttons. Remove the tangled connector that appears to come from the payments list on Screen 5.
- [ ] **P2:** Label the anti-scam card as a concept with placeholder numbers (see section 6).

---

## 4. Missing screens and features

| Priority | Item | Why |
|---|---|---|
| P0 or scope decision | **Promotion and insights** (Idea 3): "CDC Vouchers Accepted Here" signage download, promo templates (e.g. "$5 bundle for CDC users"), simple "extra business from CDC" dashboard | Addresses "benefits aren't visible" and "not worth the effort". Currently absent. |
| P0 or scope decision | **Sign-up / onboarding** for non-participating shops | The doc's problem includes shops that don't join. The prototype assumes an existing verified merchant. |
| P1 | **History tab** | Present in the nav bar, no screen. Can reuse Screen 5 with a date picker. |
| P1 | **Payout tab** | Present in the nav bar, no screen. Show upcoming and past payouts with status. |
| P1 | **Stall / profile tab** | Present in the nav bar, no screen. Language setting, shop details, log out. |
| P1 | **Empty and loading states** | First-time use (no transactions), loading, offline, slow network. |
| P1 | **Offline behaviour** | Heartland shops may have poor connectivity. Decide what is queued and what is blocked. |
| P1 | **Notifications screen** | A bell icon is shown on every header but leads nowhere. |
| P2 | **POS / existing-tool integration** | The doc says "must work with what they already use". At least specify the export format and a future integration path. |
| P2 | **Language switching inside the app** | Only possible on Screen 1 and a tiny "EN" chip on Screens 5 and 6. |

---

## 5. Copy and terminology changes (P1)

Use plain, short, non-technical language in every supported language.

| Current | Suggested |
|---|---|
| Merchant Dashboard | Home |
| Live Terminal / Live Scan / Verified Result | Remove, or "Ready to scan" |
| Voucher Token Details | Voucher details |
| Auto-cleared via PayNow Corp proxy | Paid to your bank tonight |
| Settlement guaranteed | Payment confirmed |
| Confirmed & credited | Payment confirmed |
| Voucher Not Redeemed / $0.00 Processed | No money taken |
| Try again / Call HeartPay Helper | Keep, but use the same wording on every screen |

Also: write all strings in all four languages (English, Chinese, Malay, Tamil), not only English, and have them reviewed by native speakers.

---

## 6. Trust and compliance claims (P1)

The prototype implies government endorsement. Before shipping anything real, remove or properly source each of these:

- [ ] "Official CDC Merchant Partner" (Screen 1)
- [ ] "Supported by Singapore Community Development Council" (Screen 1)
- [ ] "Official Singapore CDC Scheme Support" (Screen 6)
- [ ] "GovTech & CDC HeartPay Verified / Anti-Scam Verified Channel" (Screen 6)
- [ ] "Official transaction summary approved for IRAS & CDC record keeping" (Screen 5)
- [ ] Real-looking phone numbers (1800-HEARTPAY, 6123 4567, National Anti-Scam Helpline 1800-722-6688). Use clearly fake placeholders in the prototype, and only list the genuine anti-scam helpline if it has been verified.

For a class project, add a visible "Concept prototype, not affiliated with CDC or GovTech" line.

---

## 7. Accessibility and usability (P1)

Target users are older, low-digital-literacy merchants, often working at a busy counter.

- [ ] Minimum body text of 16px, with larger text for amounts and key actions. Much of the current text is very small.
- [ ] Minimum 48px tap targets, with spacing between destructive and primary actions.
- [ ] Contrast check on teal-on-dark and light-grey text (WCAG AA).
- [ ] Do not rely on colour alone for success and failure (icon and words are already present on 4a and 4b; keep them).
- [ ] Support the system text-size setting.
- [ ] Make the primary action reachable with one thumb.
- [ ] Limit each screen to one main job.

---

## 8. Camera and scanning UX principles (P0 for Screen 3 and any scan entry point)

These principles apply to every place the app uses the camera (Screen 3 "Accept CDC Payment", the "Scan" tab, and any future scan flow). Adapt them to HeartPay's payment context as noted. None of this exists in the current prototype except the torch button and the confirm step on Screen 3.

### 8.1 Explain before asking for permission
- [ ] Add a **pre-permission screen** before the browser's camera prompt. Example copy: "We need your camera to scan QR codes". Add one plain line on why (to read the customer's voucher QR) and one on what it is **not** used for (no photos are saved).
- [ ] Offer two buttons: a primary "Allow camera" (this is what triggers the browser prompt) and a secondary "Not now" (goes to the fallback in 8.2).
- [ ] Show this screen only when permission has not been decided. Skip it if already granted.
- [ ] Translate it into all four languages. Older merchants are the most likely to tap "Block" on an unexpected prompt.

### 8.2 Handle denial gracefully
- [ ] Add a **"Camera is blocked"** screen with clear, numbered steps to re-enable it in browser settings, with a short version per major browser (Chrome Android, Safari iOS, Samsung Internet). Include a "Try again" button that re-checks the permission.
- [ ] Provide **fallbacks** so the merchant is never stuck at the counter:
  - Manual code entry (type the voucher or transaction code).
  - Image upload (choose a screenshot of the QR from the gallery).
  - Link to "Call HeartPay Helper" (Screen 6).
- [ ] Do not repeatedly re-trigger the browser prompt after a denial. Browsers will stop showing it.

### 8.3 Instant scan feedback
- [ ] **Viewfinder frame with corner guides** on the camera view, so the merchant knows where to point the camera.
- [ ] **Haptic buzz** on a successful read using `navigator.vibrate`. Feature-detect it, since it is Android-only and a no-op on iOS. Never depend on it as the only feedback.
- [ ] **Short success animation** (e.g. frame turns green with a tick, about 300-500ms), plus the sound already planned for Screen 4a.
- [ ] **Pause scanning on success** so one QR code cannot fire repeatedly and cause a double charge. Resume only on "Scan another" or after the sheet is dismissed. This is critical for payments.

### 8.4 Don't auto-redirect or auto-charge on scan
- [ ] Show the scan result in a **bottom sheet** with one clear action. Do not navigate away or complete anything automatically.
- [ ] HeartPay adaptation: the bottom sheet shows the **voucher amount and validity**, with "Confirm payment" as the action (this matches the existing confirm step on Screen 3). Keep "Cancel / Scan another" beside it.
- [ ] **Validate the payload.** Only accept QR codes that match the expected CDC / SGQR format. For anything else show "This is not a CDC voucher code" and do not offer an action.
- [ ] If the QR contains a URL, **display the domain prominently** (large, high contrast, before any action) and show an "Open link" action only for allowlisted domains. QR codes can point to malicious URLs, and the anti-scam message on Screen 6 should be consistent with this behaviour.
- [ ] Never open an external link inside the payment flow without an explicit tap.

### 8.5 Torch toggle for low light
- [ ] Keep a **torch toggle** on the camera view (Screen 3 already has a "TORCH" button). Make it a proper labelled button with on/off state.
- [ ] **Feature-detect** support (`MediaStreamTrack.getCapabilities().torch`). **Hide it** where unavailable, rather than showing a dead button.
- [ ] Turn the torch off when leaving the camera view or after a successful scan.

### 8.6 Thumb-first layout
- [ ] **Controls at the bottom** of the camera screen (torch, cancel, manual entry, help).
- [ ] **Tap targets at least 44px**, with spacing between destructive and primary actions. (Section 7 uses a stricter 48px target. Use 48px for the main payment actions and never go below 44px.)
- [ ] **Full-screen camera view** with overlays on top, not a small embedded viewport.
- [ ] **Respect safe-area insets**, e.g. `padding-bottom: env(safe-area-inset-bottom)` on bottom controls and the bottom sheet, and add `viewport-fit=cover` to the viewport meta tag.
- [ ] Make sure the bottom navigation bar does not collide with the scan controls. Hide or dim the nav while the camera is active.

### 8.7 Handle states explicitly
Design a screen or inline state for each of these. Today only the happy path and one failure (4b) exist.

| State | What the user sees | Action offered |
|---|---|---|
| Permission not yet asked | Pre-permission explainer (8.1) | Allow camera / Not now |
| Permission denied | Re-enable steps (8.2) | Try again / Manual entry / Upload image / Call helper |
| Loading camera | Skeleton or spinner inside the viewfinder, "Starting camera..." | Cancel |
| No camera found | "No camera found on this device" | Manual entry / Upload image |
| Camera in use by another app / error | Plain-language error | Try again |
| Scanning | Viewfinder with corner guides and a short hint ("Point at the customer's QR code") | Torch, Cancel |
| Unreadable code | "We couldn't read that code. Hold steady, move closer, or turn on the torch." | **Scan again** / Manual entry |
| Not a CDC code | "This is not a CDC voucher code" | Scan again |
| Valid code | Bottom sheet with details (8.4) | Confirm payment / Cancel |
| Success / Failure | Screens 4a / 4b | Next customer / Try again / Get help |

- [ ] Add a **timeout hint** if nothing is detected after about 10 seconds ("Having trouble? Try the torch or enter the code").
- [ ] Always provide a **"Scan again" path** from every error state.

### 8.8 Accessibility for scanning
- [ ] **Visible focus states** on every control, including the torch, cancel and bottom sheet buttons (keyboard and switch-access users).
- [ ] **Sufficient contrast** for overlays and text on top of the live camera feed. Use a semi-opaque backing behind text and controls, since the background is unpredictable. Aim for WCAG AA.
- [ ] **Text labels alongside icons.** No icon-only buttons (the torch, back and bell icons need labels or accessible names).
- [ ] Use **`aria-live`** for scan results and state changes (`polite` for "Scanning...", `assertive` for "Code read" and errors) so screen readers announce them without the user needing to find them.
- [ ] Move focus to the bottom sheet when it opens, and return focus to the scan button when it closes.
- [ ] Do not rely on colour alone, haptics alone, or sound alone for scan feedback. Pair at least two (visual + haptic or sound).
- [ ] Respect `prefers-reduced-motion` for the success animation.

---

## 9. Flow and navigation clean-up (P1)

- [ ] Redraw the flow connectors. Currently they cross and overlap. Target flow: `1 → 2 → 3 → (4a | 4b)`, `4a → 2 or 3 (next customer)`, `4b → 3 (try again) | 6 (help)`, `2 → 5`, `2 → 6`.
- [ ] Define the back behaviour for every screen. Back arrows appear only on Screens 3, 5 and 6.
- [ ] Make the bottom nav consistent: same tabs, same order, correct active state on every screen (Home, Scan, History, Payout, Stall). Merge "Scan" with "Accept CDC Payment", or rename.
- [ ] Remove the prototype labels ("Html → Body", "SCREEN 4A") from exported frames.

---

## 10. Pre-build checklist

Before development starts:

1. [ ] Section 1 decisions made and written down.
2. [ ] All P0 contradictions in section 2 fixed in the design file.
3. [ ] Missing screens either designed or formally descoped.
4. [ ] Copy deck written in English, Chinese, Malay and Tamil.
5. [ ] Design tokens (colours, type sizes, spacing, radii) exported from the design file.
6. [ ] Asset list prepared (icons, success sound, tutorial videos, signage templates).
7. [ ] Data model and mock API agreed (merchant, transaction, payout, voucher, help request, ambassador booking).
8. [ ] Lab 2 document updated to match the final prototype.
9. [ ] Camera and scanning screens and states from section 8 designed (pre-permission, denied, loading, no camera, unreadable, not-a-CDC-code, bottom sheet).
10. [ ] Camera feature support decided and documented (torch, vibrate, secure-context HTTPS requirement, supported browsers).
11. [ ] Scan payload validation rules and domain allowlist agreed.
