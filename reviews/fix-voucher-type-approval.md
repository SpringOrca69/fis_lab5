# Approval: post-Phase-8 fix `fix-voucher-type` (not a phase; phases.md status table untouched)

## Verdict: APPROVED

## Scope and requirements
- Payload `CDC1|<type>|<ids>|<amount>|<expiry>|<nonce>` (6 parts, SUPERMARKET/FOOD) is implemented in `parseQr.ts`. Unknown type and old 5-part codes give `not_cdc`. `Voucher.type`, `Merchant.acceptedVoucherType` (Ah Seng = supermarket), seed, manual entry (same parser) and `/demo` are all updated.
- `wrong_merchant` is now `wrong_voucher_type`. The CDC-OTHER-/CDC-USED- shortcuts are gone. Already-used is decided only from the voucher store, and the seed holds `CDC-DEMO-SPENT-0001` for the demo card.
- Failure copy "This type of voucher can't be used here." plus "Please ask the customer for a Supermarket voucher." exists in EN/ZH/MS/TA. The failed screen still leads with the headline, then the largest "No money was taken", then the reason (viewed en and ta screenshots). The accepted type is read from the merchant setting.
- The type shows on the result sheet (badge) and in Details. The /demo cards show the type and the Food card is labelled "Wrong voucher type" (zh demo screenshot viewed, all 7 present, raw codes shown).
- Nav label "Accept payment" / 接受付款 / Terima bayaran / பணம் பெறுக. The Tamil screenshot shows 5 tabs fitting at 390px, with the label on two lines. The e2e test asserts height >=48 and that every tab is inside the viewport. Grep found no bare "Pay" label left.
- Docs: plan.md, tests.md and the phases.md fix note are updated. The status table is not changed. Grep for old wording shows only the known allowed hits. "credited" appears only in plan.md/tests.md as the banned-word rule. No new helpline number. No scope creep (the diff is limited to the files in scope plus regenerated screenshots).
- Test report is honest: lint, 133 unit tests, build and 65 e2e pass, with no hidden failures. It discloses that the Food-accepting merchant case is only covered by unit logic.

## Flag: old-localStorage reseed (not blocking)
`loadState` now discards any same-day save lacking `merchant.acceptedVoucherType` and reseeds. This runs once, for a save made before this branch. A tester who already confirmed payments on a device today will lose those transactions and the used-voucher records, and then see a fresh seed. Settings and language may also reset if they live inside the saved state. After the first load the new save has the field, so it does not recur. This is acceptable for a POC. Tell the device tester to expect it: open the app once after deploying, then start the checklist. A migration that patches the field in place would be gentler but is not needed.

## UI/UX notes
- The sheet hierarchy is good. The amount is the biggest element, the type badge is a clear secondary chip, and the warning and the 56px Confirm/Cancel are well spaced. The badge uses text, not colour alone.
- The failed screen has a clear order, an icon plus words, and a bold "ask for" line that is actionable. The Tamil text wraps cleanly with no overflow.
- The Tamil nav label wraps to two lines, so it is a bit heavier than the other tabs, but it is aligned, readable and fits.
- /demo is consistent with earlier phases. Each card now names its voucher type, which makes the test scenarios clearer.
