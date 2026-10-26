# Phase 7 test report (Translations)

Branch `phase-7`. Commands run: lint (clean), `npm run test` (121 passed), `npm run build` (ok, only chunk-size warning), `npm run e2e` (41 passed incl. 4 x P7-2).

| ID | Result | Evidence |
|---|---|---|
| B-1 | pass | lint, vitest 121/121, tsc+vite build, playwright 41/41 |
| B-2 | pass | Diff vs main: zh/ms/ta dictionaries, captions, tests, README note, small layout-only tweaks (BottomNav, DayPicker, Scanner label wrap, Help call button, PaymentFailed wrap, Tamil amount size). No later-phase features. |
| B-3 | pass | grep of zh/ms/ta/captions for credited/入账/kredit/வரவு/official/hawker/1800/6123/Stall 01: no hits. Only helpline is `6000 0000 (demo)` (from constant, unchanged); `{phone}` placeholders kept. |
| B-4 | pass | Key parity enforced by TS type + `translations.test.ts`; no new keys added. |
| B-5 | pass | Min font 16px (`text-sm`, project minimum), base 18px; BottomNav/DayPicker keep `min-h-tap-pay`/`min-h-tap`. Layout fixes only switched truncate to wrap; Tamil "No money was taken" is 1.5rem (27px at 18px base, above the 26px headline) after the loop-1 fix. |
| P7-1 | pass | `translations.test.ts`: all EN keys in ZH/MS/TA, no TODO-TRANSLATE, no empty strings, and none in `src` or `public/captions`. `git diff main -- src/i18n/en.ts` is empty (English unchanged). Placeholders {x}, HeartPay, CDC, GovTech, Singpass preserved in all. |
| P7-2 | pass | `e2e/phase7.spec.ts`: 19 screens x 4 languages at 390x844, no horizontal scroll and no element outside viewport. Screenshots in `reviews/screenshots/phase-7/`. |
| P7-3 | pass | Playwright asserts Noto Sans SC (zh) and Noto Sans Tamil (ta) faces are loaded; screenshots show no empty boxes. |
| P7-4 | out of band | Native-speaker review; README notes AI-drafted. |

## Spot-check of key strings (reviewer is not a native speaker)
| String | ZH | MS | TA |
|---|---|---|---|
| Payment confirmed | 付款已确认 | Bayaran disahkan | கட்டணம் உறுதிசெய்யப்பட்டது |
| Paid to your bank tonight at midnight | 今晚午夜付到您的银行户口 | Dibayar ke bank anda malam ini pada tengah malam | இன்றிரவு நள்ளிரவில் உங்கள் வங்கிக்கு செலுத்தப்படும் |
| No money was taken | 没有扣任何钱 | Tiada wang diambil | பணம் எடுக்கப்படவில்லை |
| Cancel, no money taken | 取消，不扣钱 | Batal, tiada wang diambil | ரத்து, பணம் எடுக்கப்படாது |

All four are accurate and plain, with "confirmed" and "paid tonight" semantics and no "credited" equivalent. Minor: ZH FAQ references a "款项" tab and MS a "Bank" tab; confirm these match the nav labels (nav labels not changed this phase, low risk).

## Defects
None found. Note: running e2e regenerates old-phase screenshots (phase-2..6); these were not committed.

## Re-test after loop-1 fix (commit aec2b6b)
lint clean, vitest 121/121, build ok, e2e 41/41. `break-words` removed from the PaymentFailed no-money line; ta-08 and ta-09 screenshots viewed: the line wraps only between words (பணம் / எடுக்கப்படவில்லை), is larger (27px) than the 26px headline, nothing overflows on the failed screens in any language (P7-2 checks failed screens for all 4 languages), no text under 16px minimum / 18px base. The blue box seen around the headline is the programmatic focus ring.

## Verdict: PASS (P7-4 native review remains out of band)
