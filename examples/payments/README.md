# AriannA Payments — starter template

Multi-provider checkout using `PaymentGateway`. Six payment methods on the
same form: credit card, Apple Pay, Google Pay, PayPal, Satispay, Nexi
XPay. The component handles provider selection, validation, and emits a
unified `submit` event with a provider-specific token your server then
charges.

⚠️ All providers run in **mock mode** in this demo. Replace each adapter's
public keys with your real ones, and the `submit` handler with a real
`fetch('/api/charge', ...)` to your backend. **Never ship secret keys in
the browser bundle.**

## Run

```bash
npm install
npm run dev
# → http://localhost:5500
```

## Anatomy

```
payments/
├── index.html         ← checkout shell + summary + log panel
├── src/app.ts         ← PaymentGateway + event handlers
├── arianna.js
├── arianna-additionals.js
├── arianna-components.js
├── tsconfig.json
└── package.json
```

## What to try next

- **Stripe Connect** — swap the `card` adapter for Stripe Payment
  Elements; the token in `submit` becomes a `PaymentMethod.id` that your
  server confirms with `PaymentIntents.confirm()`.
- **PayPal Smart Buttons** — replace the `paypal` adapter with the official
  PayPal JS SDK loaded from `https://www.paypal.com/sdk/js?client-id=…`.
- **Save-for-later** — `saveOption: true` shows the checkbox in the form;
  pipe the `e.savePaymentMethod` flag in `submit` to your customer-vault
  endpoint.

## License

MIT for the template code; AriannA runtime is dual-licensed AGPL-3.0 / Commercial.
Payment provider SDKs have their own licenses (Stripe MIT-style, PayPal SDK MIT,
Apple Pay JS Apple developer license).
