# AriannA JS Starters

Twelve ready-to-run starter templates for the [AriannA JS framework](https://ariannajs.dev).
Six **browser** starters (load the AriannA bundles via `<script type="module">`,
no build step) and six **Tauri** starters (Vite + a Rust backend, target
macOS, Windows, Linux, iOS, Android, plus a browser-preview variant).

Each template ships in three flavours: a bare ZIP, an IDE-paired ZIP for
your editor of choice. Browser starters pair with **VSCode** and
**WebStorm**; Tauri starters pair with **VSCode** and **RustRover** since
they also need a Rust toolchain.

## Web / browser starters

| Template | What it shows | Tags |
|---|---|---|
| **[minimal](./examples/minimal)**                | Smallest setup — one HTML, one TS file, the runtime  | `html` `vanilla` |
| **[counter](./examples/counter)**                | Fine-grained reactivity with `signal()` + `computed()` | `signals` `tutorial` |
| **[three-keyframes](./examples/three-keyframes)**| Three.js cube driven by `KeyframeEditor` timeline    | `three` `animation` |
| **[physics](./examples/physics)**                | Falling boxes / balls with `World`, `Body`, debug-draw | `physics` `canvas` |
| **[desktop](./examples/desktop)**                | `Dock` + `Window` macOS / Windows / Linux composition | `layout` `window` |
| **[payments](./examples/payments)**              | Multi-provider checkout: Stripe, PayPal, Apple Pay, Google Pay, Satispay, Nexi | `commerce` |

## Tauri starters

| Template | Target | Pairs with |
|---|---|---|
| **[tauri/web](./tauri/web)**         | Browser preview of the Tauri shell  | VSCode + RustRover |
| **[tauri/macos](./tauri/macos)**     | macOS desktop binary (`.app`/`.dmg`) | VSCode + RustRover |
| **[tauri/windows](./tauri/windows)** | Windows desktop binary (`.exe`/`.msi`) | VSCode + RustRover |
| **[tauri/linux](./tauri/linux)**     | Linux desktop binary (`.AppImage`/`.deb`) | VSCode + RustRover |
| **[tauri/ios](./tauri/ios)**         | iOS app bundle | VSCode + RustRover |
| **[tauri/android](./tauri/android)** | Android `.apk`/`.aab` | VSCode + RustRover |

## How to use

### Easiest: grab a ZIP from the releases page

Visit the [releases page](https://github.com/Riccardo-Angeli/arianna-projects/releases/latest)
and pick the right ZIP for your project + IDE:

```
arianna-<name>.zip                ← bare project
arianna-<name>-vscode.zip         ← + .vscode/  (VSCode preset)
arianna-<name>-webstorm.zip       ← + .idea/    (web starters)
arianna-<name>-rustrover.zip      ← + .idea/    (Tauri starters)
```

36 ZIPs per release: 6 web × 3 flavours + 6 Tauri × 3 flavours.

```bash
unzip arianna-counter-vscode.zip
cd arianna-counter
npm install
npm run dev
```

For a Tauri starter you'll also need a Rust toolchain (`rustup`) and the
Tauri CLI prerequisites for your platform — see
[tauri.app/v2/guides/getting-started/prerequisites](https://tauri.app).

### Power user: clone the monorepo

```bash
git clone https://github.com/Riccardo-Angeli/arianna-projects.git
cd arianna-projects
cp -r examples/counter my-app
cd my-app && npm install && npm run dev
```

### Add presets to an existing project

```bash
# VSCode for any project kind
npx degit Riccardo-Angeli/arianna-projects/.vscode-presets .vscode

# WebStorm — best for web (browser-only) projects
npx degit Riccardo-Angeli/arianna-projects/.webstorm-presets .idea

# RustRover — best for Tauri (Rust + TS) projects
npx degit Riccardo-Angeli/arianna-projects/.rustrover-presets .idea
```

## Repo layout

```
arianna-projects/
├── examples/                          ← 6 web starters
│   ├── counter/  desktop/  minimal/
│   ├── payments/ physics/ three-keyframes/
├── tauri/                             ← 6 Tauri starters
│   ├── android/  ios/  linux/
│   ├── macos/    web/  windows/
├── .vscode-presets/                   ← shared VSCode config
├── .webstorm-presets/                 ← shared WebStorm config (web)
├── .rustrover-presets/                ← shared RustRover config (Tauri)
├── scripts/build-zips.js              ← produces all 36 release ZIPs
├── scripts/install-presets.js         ← copies preset into existing project
├── .github/workflows/release.yml      ← auto-releases on tag push
├── LICENSE
└── package.json
```

## Producing the release ZIPs (maintainer workflow)

```bash
# Step 1: build the 3 runtime bundles in the framework repo
cd ../AriannA-Js && npm run build

# Step 2: copy them next to the Cloudflare-Pages-served site files
cp dist/arianna.js dist/arianna-additionals.js dist/arianna-components.js \
   ../arianna-web-static/

# Step 3: generate the 36 starter ZIPs
cd ../arianna-projects
npm install
npm run build-zips:local             # reads ../arianna-web-static for bundles

# Step 4: tag + push + release
git tag v1.5.0
git push origin v1.5.0
gh release create v1.5.0 dist/*.zip --generate-notes --title "AriannA Starters v1.5.0"
```

The GitHub Action in `.github/workflows/release.yml` does Step 3 + 4
automatically on every `v*` tag push (so locally you can skip steps 3 and 4
and just `git tag && git push --tags`).

## License

Template code is MIT. AriannA runtime is dual-licensed AGPL-3.0 / Commercial
(see the [framework repo](https://github.com/Riccardo-Angeli/AriannA-Js)).
Three.js (used by `three-keyframes`) is MIT. Tauri is MIT/Apache-2.0.
