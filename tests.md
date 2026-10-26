# HeartPay: Test Plan

Types: **A** = automated (Vitest/Playwright, run by Tester), **R** = Tester/Approver review of code, screenshots or output, **H** = human on a real device.
Playwright runs at **390×844** (mobile) in Chromium. Camera, torch, vibration and share sheet cannot be proven in Playwright, so those are **H**.

A phase passes when every A and R test is green and every H test is either passed by the human or listed in the approval as `NEEDS HUMAN`.

## Every phase (baseline)
| ID | Type | Check |
|---|---|---|
| B-1 | A | `npm run lint`, `npm run test`, `npm run build` all pass with zero type errors |
| B-2 | R | Only this phase's scope changed; nothing from later phases built |
| B-3 | R | No banned copy: "credited", "Official CDC/GovTech/IRAS", "Hawker", "Stall 01-42", a second helpline number |
| B-4 | R | Every new UI string is in all four dictionaries via `t()` |
| B-5 | R | Taps ≥48px (56px for payment actions), body ≥16px, icons have text labels, focus rings visible |

## Phase 0
| ID | Type | Check |
|---|---|---|
| P0-1 | A | App renders at `/` with no console errors |
| P0-2 | A | Vitest runs a sample test; Playwright runs a sample test |
| P0-3 | H | Vercel HTTPS URL opens on a phone |
| P0-4 | R | `CLAUDE.md`, `.claude/agents`, `.claude/commands` present |

## Phase 1
| ID | Type | Check |
|---|---|---|
| P1-1 | A | `selectors`: `todayTotal`, `lastTransaction` correct on seed |
| P1-2 | A | `reconcile()` returns matched / not matched, and shows the $5 gap on the seeded day |
| P1-3 | A | `format`: SGD and dates for en, zh, ms, ta |
| P1-4 | A | Language choice persists after reload and sets `<html lang>` |
| P1-5 | A | Store persists to `heartpay:v1`; reset restores seed; seed dates are relative to now |
| P1-6 | R | A missing translation key fails type-checking |

## Phase 2
| ID | Type | Check |
|---|---|---|
| P2-1 | A | Login shows four language tiles ≥64px; choosing one changes text immediately |
| P2-2 | A | Singpass demo: spinner ~1.2s then `/home`; failure path links to Help |
| P2-3 | A | Unauthenticated `/home` redirects to `/` |
| P2-4 | A | Home total and last payment match the store; empty state when no payments |
| P2-5 | R | Home has only four blocks; text says "Paid to your bank tonight at midnight" |
| P2-6 | R | Design review vs Screens 1 and 2 and `changes.md` (see "Design review" below) |

## Phase 3
| ID | Type | Check |
|---|---|---|
| P3-1 | A | `parseQr`: valid CDC, URL, random text, malformed, empty |
| P3-2 | A | `/demo` renders a QR for each of 7 scenarios |
| P3-3 | A | Pay state machine: every state in plan.md §6 Screen 3 is reachable (mock camera) |
| P3-4 | A | Result sheet: amount, Confirm, "Cancel, no money taken"; focus moves into sheet |
| P3-5 | A | Manual code entry and image upload each reach the result sheet |
| P3-6 | H | iPhone: explainer, Allow, rear camera starts |
| P3-7 | H | Android: same, plus torch toggles; torch hidden where unsupported |
| P3-8 | H | Deny permission: blocked screen with steps for the right browser; fallbacks work |
| P3-9 | H | Hold camera on a valid QR for 5s: only one sheet opens |

## Phase 4
| ID | Type | Check |
|---|---|---|
| P4-1 | A | `redeem`: success plus each failure (expired, already_used, wrong_merchant, insufficient, network) |
| P4-2 | A | Confirm adds one transaction; Home and Report update |
| P4-3 | A | Scanning the same QR twice gives `already_used` and a failure screen |
| P4-4 | A | Offline toggle blocks confirm and shows "Nothing was charged" |
| P4-5 | A | Failure screen shows "No money was taken" as largest text |
| P4-6 | A | Mute setting prevents the chime |
| P4-7 | R | Success/failure shown by icon + words, not colour alone |
| P4-8 | H | Chime and vibration on a real phone |

## Phase 5
| ID | Type | Check |
|---|---|---|
| P5-1 | A | Report for today lists the same total as Home |
| P5-2 | A | Date picker limited to 14 days; filters All/Morning/Afternoon/Evening work |
| P5-3 | A | Mismatch day shows "Not matched, $5.00 missing", the missing payment, and "Report a problem" → Help |
| P5-4 | A | CSV download contents match the displayed list |
| P5-5 | A | Payouts: tonight scheduled on top; badge has icon + word; tap opens that day's report |
| P5-6 | R | Print stylesheet produces a clean page |
| P5-7 | H | Share sheet opens on a phone |

## Phase 6
| ID | Type | Check |
|---|---|---|
| P6-1 | A | Help: call link is `tel:`, hours and number match the single demo number |
| P6-2 | A | FAQ accordion opens and closes; anti-scam card labelled "concept, placeholder text" |
| P6-3 | A | Booking creates a booking and a notification; bell count updates |
| P6-4 | A | Notifications: unread dots, "Mark all read", empty state |
| P6-5 | A | Stall settings (language, sound, vibration) persist after reload |
| P6-6 | R | Video cards show duration and "Needs internet" offline; captions follow app language |

## Phase 7
| ID | Type | Check |
|---|---|---|
| P7-1 | A | Script confirms ZH, MS, TA have every EN key and none contain `TODO-TRANSLATE` |
| P7-2 | A | Playwright screenshots of every screen in all 4 languages: no horizontal scroll |
| P7-3 | R | Tamil and Chinese render with bundled fonts (no empty boxes) |
| P7-4 | H | Native-speaker review (can happen after the POC) |

## Phase 8
| ID | Type | Check |
|---|---|---|
| P8-1 | A | axe-core scan on every route: no serious or critical issues |
| P8-2 | A | Keyboard-only run through login → pay → success |
| P8-3 | R | Loading skeletons, empty and offline states exist for Home and Report |
| P8-4 | R | Concept disclaimer visible in footer on every screen |
| P8-5 | R | `prefers-reduced-motion` respected |
| P8-6 | H | Full device checklist below on iPhone Safari and Android Chrome |

## Phase 9
| ID | Type | Check |
|---|---|---|
| P9-1 | A | Lighthouse PWA installable |
| P9-2 | H | Installs to home screen; opens offline to the shell |

## Design review (Approver, UI phases)
Load `frontend-design`. Take Playwright screenshots at 390px of each new screen and compare to the matching Figma screenshot and `changes.md`. Check:
1. One job per screen; one obvious primary action in thumb reach.
2. Hierarchy: amount or status is the biggest thing; nothing clipped, no stray blocks.
3. Contrast AA; colour never the only signal.
4. Plain words (changes.md §5 table); no jargon.
5. Consistent spacing, type scale and button style with earlier phases.
6. Looks intentional, not a default template.

## Final device checklist (Phase 8, H)
1. First visit: explainer → Allow → rear camera starts.
2. Deny permission → blocked screen; manual entry and image upload complete a payment.
3. Scan valid $15 → one sheet only → Confirm → success + chime → Home and Report updated.
4. Scan the same QR again → "already used", "No money was taken".
5. Expired, wrong merchant, URL and random text each show the right message.
6. Torch works on Android; hidden on iPhone if unsupported.
7. Simulate offline → banner; confirm blocked.
8. Tamil and Chinese: no empty boxes, no overflow.
9. Mismatch day explained; CSV downloads; share sheet opens.
10. Book an ambassador → confirmation + notification; bell count updates.
11. Reload → data and language persist; Demo → Reset restores seed.
