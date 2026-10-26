# HeartPay

HeartPay is a mobile web app for older heartland merchants in Singapore who accept CDC vouchers. The merchant scans the customer's CDC voucher QR code, checks the amount, and taps **Confirm payment**. The app shows "Payment confirmed" at once and "Paid to your bank tonight at midnight".

This is a **proof of concept**. It uses mock data stored in `localStorage` and has no backend. It is a concept prototype and is not affiliated with CDC or GovTech.

Demo shop: Ah Seng Minimart, Blk 123 Toa Payoh Lor 4 (merchant ID HP-M-88392, device HP-D-0417). Demo helpline: `6000 0000 (demo)`, daily 8am to 10pm.

## Run it

Needs Node 20 or newer.

```bash
npm install
npm run dev        # dev server
npm run build      # type-check and production build
npm run preview    # serve the build
npm run lint
npm run test       # Vitest unit tests
npm run e2e        # Playwright at 390x844 (builds and serves the app itself)
npm run check:i18n # every language has every key
```

First time with Playwright: `npx playwright install chromium`.

## Demo flow

1. Open the app on a phone (camera needs HTTPS or localhost) and open `/demo` on a laptop.
2. On the phone, choose a language and tap "Log in with Singpass (demo)".
3. Tap **Accept CDC Payment**, allow the camera, and scan a QR code from `/demo`.
4. `/demo` has seven QR codes: valid $15, valid $10, expired, already used, wrong merchant, a plain link, and random text.
5. Scan a valid code, then Confirm. You get the success screen, and Home and the report update.
6. Scan the same code again to see the "already used" failure ("No money was taken").
7. On `/demo`, turn on "Simulate offline" to see the banner and the blocked payment.
8. Open the report for 3 days ago to see the "Not matched, $5.00 missing" day.
9. `/demo` also has "Reset demo data". `/demo` is linked from Stall, Demo tools.

No camera? Use "Type the code" (the code is shown under each test QR) or upload a screenshot of the QR.

## Left out on purpose

- Promotion and insights (signage, promo templates, "extra business" dashboard)
- Onboarding and sign-up (the app assumes a returning merchant; ambassadors onboard shops)
- Real Singpass login (a mock button only)
- Real CDC or SGQR redemption (QR format is made up, see `src/lib/parseQr.ts`)
- Real bank payouts
- Push or SMS reminders (booking adds an in-app notification only)
- Real help videos (placeholder files with caption tracks)

## Translations need review

Chinese (ZH), Malay (MS) and Tamil (TA) text, including the video captions in `public/captions`, is AI-drafted. **Native speakers must review it** before any real use.

## Accessibility

Body text is 18px, tap targets are at least 48px (56px for payment actions), and success or failure always shows an icon plus words. Reduced-motion settings are respected and safe-area insets are applied. `npm run e2e` runs an axe-core scan on every route and a keyboard-only run from login to the success screen.

## Deploy to Vercel

1. Push the repo to GitHub.
2. In Vercel, choose **Add New, Project** and import the repo.
3. Framework preset: Vite. Build command `npm run build`, output directory `dist`. (Defaults are right.)
4. Deploy. `vercel.json` rewrites every path to `index.html`, so deep links like `/home` work.
5. Open the HTTPS preview URL on a phone. Each push gets its own preview URL.

Device checks are listed in `reviews/final-device-checklist.md`.
