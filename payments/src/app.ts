/**
 * AriannA — Payments starter
 *
 * Multi-provider checkout: the user picks one of six payment methods and
 * the component routes the submit through the right provider. In this
 * demo every provider stays in mock mode — replace each adapter with
 * your real keys / endpoints when going live.
 *
 * Live API keys belong in environment variables on the server, never
 * shipped to the browser bundle.
 */

declare const PaymentGateway: any;

const log = document.getElementById('log')!;
function logLine(msg: string) {
  const t = new Date().toLocaleTimeString();
  log.insertAdjacentHTML('afterbegin', `<div>[${t}] ${msg}</div>`);
}

const gateway = new PaymentGateway('#gateway-mount', {
  amount    : 99.00,
  currency  : 'EUR',
  providers : ['card', 'apple-pay', 'google-pay', 'paypal', 'satispay', 'nexi'],
  // Default to credit card; lay out as a dropdown of icons.
  default   : 'card',
  // Branding for each method — keep them subtle, the gateway picks colors.
  saveOption: true,
  countries : ['IT', 'CH', 'DE', 'FR', 'GB', 'US'],
});

gateway.on('provider-change', (e: any) => {
  logLine(`Selected provider: <b>${e.provider}</b>`);
});

gateway.on('submit', (e: any) => {
  // e.provider — which method the user picked
  // e.token    — provider-specific opaque token (card.id, paypal.orderID, …)
  // e.amount   — final amount in minor units (cents)
  logLine(`SUBMIT via ${e.provider} → token=${JSON.stringify(e.token).slice(0, 40)}…`);

  // Mock server call. Replace with your real /api/charge endpoint.
  setTimeout(() => {
    logLine(`<span style="color:#16a34a">✓ Charge approved (mock)</span>`);
  }, 800);
});

gateway.on('error', (e: any) => {
  logLine(`<span style="color:#dc2626">✗ ${e.message}</span>`);
});
