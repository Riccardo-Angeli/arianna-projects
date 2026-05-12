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

Unzip, open in your IDE, the preset auto-applies.

### Power user: clone the monorepo

Clone, copy any starter folder, rename it, open it in your IDE.

```
git clone https://github.com/Riccardo-Angeli/arianna-projects.git
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
├── scripts/build-zips.mjs             ← produces all 36 release ZIPs
├── scripts/install-presets.mjs        ← copies preset into existing project
├── .github/workflows/release.yml      ← auto-releases on tag push
├── release/dist/                      ← build output (gitignored)
├── LICENSE
└── package.json
```

## Producing the release ZIPs (maintainer workflow — WebStorm)

The build is one self-contained script — no `npm install`, no external
dependencies, just Node 20+ built-ins.

**1. Make sure the runtime bundles are in place.** The script reads them
from `../arianna-web/arianna-web-static/`:

```
arianna-web/arianna-web-static/arianna.js
arianna-web/arianna-web-static/arianna-additionals.js
arianna-web/arianna-web-static/arianna-components.js
```

If you've just rebuilt the framework, copy the 3 bundles from
`AriannA-Js/dist/` into that folder first.

**2. In WebStorm, right-click `scripts/build-zips.mjs` → Run.**

Output:

```
release/dist/arianna-counter.zip
release/dist/arianna-counter-vscode.zip
release/dist/arianna-counter-webstorm.zip
…  (36 files total)
```

**3. Commit, tag, push from WebStorm's VCS panel:**

- VCS → Commit → "Release v1.5.0"
- Git → New Tag → `v1.5.0`
- Push (with the "Push Tags" option checked)

The GitHub Action in `.github/workflows/release.yml` picks up the tag,
runs the build on CI, and creates the release with all 36 ZIPs attached.

If you'd rather do the release locally:

- Build → right-click `release/dist/` → "Show in Files" (Finder)
- Drag all 36 ZIPs into the GitHub web UI: Releases → "Draft a new release"

## License

Template code is MIT. AriannA runtime is dual-licensed AGPL-3.0 / Commercial
(see the [framework repo](https://github.com/Riccardo-Angeli/AriannA-Js)).
Three.js (used by `three-keyframes`) is MIT. Tauri is MIT/Apache-2.0.
