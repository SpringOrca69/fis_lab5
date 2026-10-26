# Test report: post-Phase-8 fix `fix-voucher-type` (not a phase; phases.md status table untouched)

## Automated runs (branch fix-voucher-type)
| Command | Result |
|---|---|
| `npm run lint` | pass, no errors |
| `npm run test` | pass: 14 files, 133 tests |
| `npm run build` | pass, no type errors (only the existing >500 kB chunk warning) |
| `npm run e2e` | pass: 65 passed, 0 failed (includes new `e2e/fix-voucher-type.spec.ts`, 5 tests) |

## Checks
| # | Check | Result | Evidence |
|---|---|---|---|
| 1a | Payload `CDC1\|<type>\|<ids>\|<amount>\|<expiry>\|<nonce>`, SUPERMARKET/FOOD | pass | `parseQr.ts` requires 6 parts, `TYPES` map, unknown type gives `not_cdc`; `parseQr.test.ts` updated; /demo test asserts `CDC1\|FOOD\|` and `CDC1\|SUPERMARKET\|` |
| 1b | `Voucher.type`, `VoucherType`, merchant `acceptedVoucherType` = supermarket | pass | `types.ts`, `seed.ts` |
| 1c | `wrong_merchant` renamed `wrong_voucher_type`; OTHER/USED shortcuts removed; already_used from store only | pass | `redeem.ts` diff; seed holds a pre-used voucher `CDC-DEMO-SPENT-0001`; e2e "demo Already used code fails from the voucher store" passes |
| 1d | Manual entry | pass | Uses same `parseQr`; e2e types a 6-part code and reaches the sheet in all 4 languages |
| 1e | Failure message in EN/ZH/MS/TA, accepted type read from merchant setting, still leads "No money was taken" | pass | `PaymentFailed.tsx` uses `state.merchant.acceptedVoucherType`; screenshots `{en,zh,ms,ta}-failed.png` (en viewed: headline, big "No money was taken", reason, "ask for a Supermarket voucher") |
| 1f | Type on result sheet and Details | pass | `ResultSheet.tsx` badge plus Details row; `*-sheet.png`, e2e assertion |
| 1g | /demo cards, Food = "Wrong voucher type", exact description, fresh IDs per load | pass | en.ts `demo.e.wrongType` = "Shows the amount. Confirm fails: this type of voucher can't be used here." (exact match); `demoQr.ts` generates IDs from timestamp per load (existing `ids()`), used card uses fixed store ID by design |
| 2 | Nav "Accept payment" + ZH 接受付款 / MS Terima bayaran / TA பணம் பெறுக; 5 tabs fit at 390px, ≥48px, icon+text, route /pay | pass | e2e asserts 5 links, height ≥48, inside 0..390, svg + text, in all 4 languages; `ta-nav.png` viewed (wraps onto two lines but fits). No other bare "Pay" labels found (grep of dictionaries; BottomNav uses `nav.pay` as the only name, aria-label is `nav.label`) |
| 3 | Docs | pass | plan.md, tests.md, phases.md note "Post-Phase-8 fixes (not a phase; status table unchanged)"; status table not in diff |
| 4 | Counts | pass | see table above |
| 5 | Grep for "wrong shop", "wrong merchant", wrong_merchant, "can't be used at this shop", CDC-OTHER, CDC-USED | pass | Remaining hits only: `changes.md:74` (known, historical), `phases.md:93` (the fix note itself), `reviews/phase-4-test.md:18` (old report mentioning `wrong_merchant`, historical). None in src, dictionaries, public/captions |
| 6 | 16 screenshots in `reviews/screenshots/fix-voucher-type/` | pass | 16 files: demo, failed, nav, sheet x 4 languages |
| 7 | Old 5-part code `CDC1\|ids\|10\|20261231\|N1` | pass | Throwaway Playwright run: shows "This is not a CDC voucher code / No money was taken. / Scan again"; no page errors |
| 8 | Old localStorage save (no `acceptedVoucherType`, old voucher shape) | pass | Same-day save was discarded and re-seeded; merchant now has `acceptedVoucherType: 'supermarket'`; login and /pay load with no page errors |

## Notes (not failures)
- Re-running e2e regenerates tracked screenshots in other `reviews/screenshots/phase-*` folders (byte diffs only); I reverted those and committed only the fix-voucher-type files and this report.
- The old-format check used a temporary spec, deleted afterwards (not added to the suite).
- Tamil nav label wraps to two lines at 390px; it fits and meets the 48px height.
- Wrong-voucher-type message for a Food-accepting merchant is only covered by unit logic; the app has no way to change `acceptedVoucherType` in the UI.

## Verdict: PASS
