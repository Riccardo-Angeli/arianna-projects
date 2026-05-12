# AriannA JS Starters

Six ready-to-run starter templates for the [AriannA JS framework](https://arianna-js.dev),
each shipped with VSCode and WebStorm presets. Pick the one closest to
what you want to build, download the ZIP, unzip it, open it in your IDE.

## Available templates

| Template | What it shows | Tags |
|---|---|---|
| **[minimal](./minimal)**        | Smallest possible setup — one HTML, one TS file, the runtime | `html` `vanilla` |
| **[counter](./counter)**        | Fine-grained reactivity with `signal()` + `computed()`        | `signals` `tutorial` |
| **[three-keyframes](./three-keyframes)** | Three.js cube driven by `KeyframeEditor` timeline | `three` `animation` |
| **[physics](./physics)**        | Falling boxes / balls with `World`, `Body`, debug-draw canvas | `physics` `canvas` |
| **[desktop](./desktop)**        | `Dock` + `Window` macOS / Windows / Linux composition         | `layout` `window` |
| **[payments](./payments)**      | Multi-provider checkout: Stripe, PayPal, Apple Pay, Google Pay, Satispay, Nexi | `commerce` |

## How to use

### Easiest: download a ZIP from the releases page

Visit the [releases page](https://github.com/Riccardo-Angeli/AriannA-Js-Starters/releases/latest)
and pick one of the 18 ZIPs:

- `arianna-<name>.zip` — bare project
- `arianna-<name>-vscode.zip` — same + `.vscode/` folder with formatter,
  ESLint, launch config, recommended extensions
- `arianna-<name>-webstorm.zip` — same + `.idea/` folder with code style,
  inspection profile, run configuration

Unzip, open the folder in your IDE, install dependencies, run the dev
server:

```bash
unzip arianna-counter-vscode.zip
cd arianna-counter
npm install
npm run dev
# → http://localhost:5500
```

### Power user: clone the monorepo

```bash
git clone https://github.com/Riccardo-Angeli/AriannA-Js-Starters.git
cd AriannA-Js-Starters
# Pick a template
cp -r counter my-app
cd my-app
npm install
npm run dev
```

### Install IDE presets into an existing project

If you already have an AriannA project and just want the preset:

```bash
# VSCode preset
npx degit Riccardo-Angeli/AriannA-Js-Starters/.vscode-presets .vscode

# WebStorm preset
npx degit Riccardo-Angeli/AriannA-Js-Starters/.webstorm-presets .idea
```

## Repo layout

```
AriannA-Js-Starters/
├── minimal/                ← starter 1
├── counter/                ← starter 2
├── three-keyframes/        ← starter 3
├── physics/                ← starter 4
├── desktop/                ← starter 5
├── payments/               ← starter 6
├── .vscode-presets/        ← shared VSCode config
├── .webstorm-presets/      ← shared WebStorm config
├── scripts/
│   ├── build-zips.js       ← produces all 18 release ZIPs
│   └── install-presets.js  ← copies a preset into an existing project
├── .github/workflows/      ← CI for release tags
└── package.json
```

## Producing the release ZIPs (maintainer workflow)

```bash
# Build the AriannA runtime in the sibling repo first:
cd ../arianna-web && npm run build

# Then back here:
cd ../AriannA-Js-Starters
npm install
npm run build-zips:local       # reads ../arianna-web for the 3 JS bundles
# → dist/ has 18 ZIPs

# Tag and publish:
git tag v1.5.0
git push origin v1.5.0
gh release create v1.5.0 dist/*.zip --generate-notes
```

The GitHub Action in `.github/workflows/release.yml` automates the
`gh release create` step on every tag push.

## License

Template code is MIT. The AriannA runtime is dual-licensed AGPL-3.0 /
Commercial — see the [main repo](https://github.com/Riccardo-Angeli/AriannA-Js).
Three.js (used by `three-keyframes`) is MIT.
