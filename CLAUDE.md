# HeartPay POC

Mobile web app for older Singapore heartland merchants redeeming CDC vouchers. Merchant scans the customer's QR, then confirms.

@plan.md
@changes.md
@phases.md
@tests.md

## Commands
- `npm run dev`, `npm run build`, `npm run lint`
- `npm run test` (Vitest), `npm run e2e` (Playwright at 390×844)

## Non-negotiables
- Persona: Ah Seng Minimart, Blk 123 Toa Payoh Lor 4. Merchant ID HP-M-88392, device HP-D-0417.
- One helpline everywhere: `6000 0000 (demo)`, daily 8am–10pm. Never invent another number.
- Say "Payment confirmed" and "Paid to your bank tonight at midnight". Never "credited".
- No "Official / CDC / GovTech / IRAS approved" claims. Footer: "Concept prototype. Not affiliated with CDC or GovTech."
- Every UI string goes through `t()` and exists in EN, ZH, MS, TA.
- Tap targets ≥48px (56px for payment actions). Body ≥18px base. Success/failure = icon + words, never colour alone.
- Follow `changes.md` over the Figma screenshots when they conflict.
- Out of scope: promotions/insights, onboarding, real Singpass/CDC/bank.

## Workflow
Work one phase at a time using `/run-phase N`. Never start a phase until the previous one is `approved` in phases.md. For any UI work, load the `frontend-design` skill.
