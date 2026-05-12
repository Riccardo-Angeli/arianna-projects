# AriannA Minimal — starter template

Smallest possible AriannA setup. One HTML, one TypeScript file, the bundled
runtime, no framework, no build step (just the optional `tsc --noEmit` for
type-checking).

## What you get

- **`index.html`** — entry point, loads the three runtime bundles + your app
- **`src/app.ts`** — renders a single `<h1>` via `Real`
- **`arianna.js` + `arianna-additionals.js` + `arianna-components.js`** — runtime
- **`tsconfig.json`** — strict TS config with `noEmit` (browser runs the TS
  directly when served via `live-server`'s typed-module fallback, or compile
  with `tsc` if you prefer a separate `dist/` step)

## Run

```bash
npm install
npm run dev
# → http://localhost:5500
```

That opens a server in the current folder. Edit `src/app.ts` and refresh.

## Type-check (optional)

```bash
npm run type-check
```

## Next steps

When you outgrow the minimal scaffold, copy what you need from one of the
larger starters:

- **counter** — fine-grained reactivity with `signal()`
- **three-keyframes** — Three.js cube driven by `KeyframeEditor`
- **physics** — `World`, `Body`, springs, debug-draw canvas
- **desktop** — `Dock` + `Window` macOS / Windows / Linux composition
- **payments** — multi-provider `PaymentGateway` checkout

All six live in the [AriannA-Js-Projects](https://github.com/Riccardo-Angeli/AriannA-Js-Projects)
monorepo.

## License

MIT for the template code; the AriannA runtime is dual-licensed
AGPL-3.0 / Commercial. See the [main repo](https://github.com/Riccardo-Angeli/AriannA-Js).
