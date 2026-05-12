#!/usr/bin/env node
/**
 * Build all 36 starter ZIPs.
 *
 * The monorepo holds 12 templates in a two-folder layout:
 *
 *   examples/             — Web / browser starters (6) — Vite-free, plain
 *                           HTML + the 3 AriannA bundles loaded via
 *                           <script type="module">:
 *                             counter · desktop · minimal · payments ·
 *                             physics · three-keyframes
 *
 *   tauri/                — Tauri starters (6) — Vite + src-tauri/ (Rust
 *                           backend) for native binaries:
 *                             android · ios · linux · macos · web · windows
 *
 * IDE flavours by project kind:
 *
 *       web    → bare ZIP + VSCode (.vscode/) + WebStorm  (.idea/)
 *       Tauri  → bare ZIP + VSCode (.vscode/) + RustRover (.idea/)
 *
 * Output → dist/. CI uploads as release assets via
 *   gh release create vX.Y.Z dist/*.zip --generate-notes
 *
 * Node 18+. Requires `archiver`:
 *   npm install --no-save archiver
 *   node scripts/build-zips.js [--runtime=path/to/arianna-web-static]
 *
 * If --runtime is omitted the script tries ../arianna-web-static first,
 * then ../arianna-web, then the current directory.
 */

import {
  readdirSync, statSync, mkdirSync, rmSync, copyFileSync, existsSync,
  createWriteStream, writeFileSync,
} from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');

const args       = process.argv.slice(2);
const runtimeArg = args.find(a => a.startsWith('--runtime='));

function findRuntime() {
  if (runtimeArg) return resolve(runtimeArg.split('=')[1]);
  const candidates = [
    resolve(ROOT, '..', 'arianna-web-static'),
    resolve(ROOT, '..', 'arianna-web'),
    ROOT,
  ];
  for (const c of candidates) {
    if (existsSync(join(c, 'arianna.js'))) return c;
  }
  return candidates[0];
}
const RUNTIME = findRuntime();

const BUNDLES = ['arianna.js', 'arianna-additionals.js', 'arianna-components.js'];

const WEB_TEMPLATES = [
  { name: 'counter',          src: 'examples/counter'         },
  { name: 'desktop',          src: 'examples/desktop'         },
  { name: 'minimal',          src: 'examples/minimal'         },
  { name: 'payments',         src: 'examples/payments'        },
  { name: 'physics',          src: 'examples/physics'         },
  { name: 'three-keyframes',  src: 'examples/three-keyframes' },
];

const TAURI_TEMPLATES = [
  { name: 'tauri-android',  src: 'tauri/android' },
  { name: 'tauri-ios',      src: 'tauri/ios'     },
  { name: 'tauri-linux',    src: 'tauri/linux'   },
  { name: 'tauri-macos',    src: 'tauri/macos'   },
  { name: 'tauri-web',      src: 'tauri/web'     },
  { name: 'tauri-windows',  src: 'tauri/windows' },
];

function rimraf(p) { if (existsSync(p)) rmSync(p, { recursive: true, force: true }); }

function copyDir(src, dst) {
  mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'target' ||
        entry.name === '.DS_Store'   || entry.name === 'dist') continue;
    const s = join(src, entry.name);
    const d = join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else copyFileSync(s, d);
  }
}

async function zipFolder(src, outFile) {
  return new Promise((resolveP, rejectP) => {
    const out = createWriteStream(outFile);
    const arc = archiver('zip', { zlib: { level: 9 } });
    out.on('close', () => resolveP(arc.pointer()));
    arc.on('error', rejectP);
    arc.pipe(out);
    arc.directory(src, basename(src));
    arc.finalize();
  });
}

const WORKSPACE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="ProjectViewState">
    <option name="hideEmptyMiddlePackages" value="true" />
    <option name="showLibraryContents" value="true" />
  </component>
</project>
`;

async function buildOne(tpl, kind, variant) {
  const stagingName = `arianna-${tpl.name}${variant ? '-' + variant : ''}`;
  const staging = join(DIST, '_staging', stagingName);
  rimraf(staging);

  const src = join(ROOT, tpl.src);
  if (!existsSync(src)) {
    console.warn(`  ! ${tpl.src} not found, skipping`);
    return;
  }
  copyDir(src, staging);

  if (kind === 'web') {
    for (const b of BUNDLES) {
      const r = join(RUNTIME, b);
      if (existsSync(r)) copyFileSync(r, join(staging, b));
      else console.warn(`  ! runtime ${b} missing in ${RUNTIME}`);
    }
  }

  if (variant === 'vscode') {
    copyDir(join(ROOT, '.vscode-presets'), join(staging, '.vscode'));
  } else if (variant === 'webstorm') {
    const target = join(staging, '.idea');
    copyDir(join(ROOT, '.webstorm-presets'), target);
    writeFileSync(join(target, 'workspace.xml'), WORKSPACE_XML);
  } else if (variant === 'rustrover') {
    const target = join(staging, '.idea');
    copyDir(join(ROOT, '.rustrover-presets'), target);
    writeFileSync(join(target, 'workspace.xml'), WORKSPACE_XML);
  }

  const outFile = join(DIST, `${stagingName}.zip`);
  rimraf(outFile);
  const bytes = await zipFolder(staging, outFile);
  console.log(`  ✓ ${basename(outFile)}  (${(bytes / 1024).toFixed(0)} KB)`);
}

async function main() {
  console.log(`Building starter ZIPs into ${DIST}`);
  console.log(`Runtime source: ${RUNTIME}`);
  if (!existsSync(join(RUNTIME, 'arianna.js'))) {
    console.warn(`! arianna.js NOT FOUND in ${RUNTIME}`);
    console.warn('  Web starter ZIPs will be missing the 3 runtime bundles.');
    console.warn('  Pass --runtime=path/to/folder/with/bundles to fix this.\n');
  } else {
    console.log('');
  }

  rimraf(DIST);
  mkdirSync(DIST, { recursive: true });

  for (const tpl of WEB_TEMPLATES) {
    console.log(`→ ${tpl.name} (web, from ${tpl.src})`);
    for (const v of ['', 'vscode', 'webstorm']) await buildOne(tpl, 'web', v);
  }
  for (const tpl of TAURI_TEMPLATES) {
    console.log(`\n→ ${tpl.name} (tauri, from ${tpl.src})`);
    for (const v of ['', 'vscode', 'rustrover']) await buildOne(tpl, 'tauri', v);
  }

  rimraf(join(DIST, '_staging'));

  const zips = readdirSync(DIST).filter(f => f.endsWith('.zip'));
  const total = zips.reduce((sum, f) => sum + statSync(join(DIST, f)).size, 0);
  console.log(`\nDone. ${zips.length} ZIPs, ${(total / 1024 / 1024).toFixed(1)} MB total.`);
  console.log(`\nNext: gh release create v1.5.0 dist/*.zip --generate-notes --title "AriannA Starters v1.5.0"`);
}

main().catch(err => { console.error(err); process.exit(1); });
