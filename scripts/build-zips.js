#!/usr/bin/env node
/**
 * Build all 36 starter ZIPs.
 *
 * The monorepo holds 12 templates:
 *
 *   Web / browser starters (6) — Vite-free, just HTML + the 3 AriannA
 *   bundles loaded via <script type="module">:
 *
 *       minimal · counter · three-keyframes · physics · desktop · payments
 *
 *   Tauri starters (6) — Vite + src-tauri/ (Rust backend) for native
 *   binaries across desktop and mobile:
 *
 *       tauri-web · tauri-macos · tauri-windows · tauri-linux
 *       tauri-ios · tauri-android
 *
 * IDE flavours are matched to the project kind:
 *
 *       web    → bare ZIP + VSCode (.vscode/) + WebStorm  (.idea/)
 *       Tauri  → bare ZIP + VSCode (.vscode/) + RustRover (.idea/)
 *
 * Output → dist/. CI uploads as release assets via
 *   gh release create vX.Y.Z dist/*.zip --generate-notes
 *
 * Node 18+. Requires `archiver`:
 *   npm install --no-save archiver
 *   node scripts/build-zips.js [--runtime=path/to/arianna-web/dist]
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
const RUNTIME    = runtimeArg
  ? resolve(runtimeArg.split('=')[1])
  : resolve(ROOT, '..', 'arianna-web');

const WEB_TEMPLATES = [
  'minimal', 'counter', 'three-keyframes', 'physics', 'desktop', 'payments',
];

const TAURI_TEMPLATES = [
  'tauri-web', 'tauri-macos', 'tauri-windows', 'tauri-linux',
  'tauri-ios', 'tauri-android',
];

const BUNDLES = ['arianna.js', 'arianna-additionals.js', 'arianna-components.js'];

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

async function buildOne(name, kind, variant) {
  const staging = join(DIST, '_staging', `arianna-${name}${variant ? '-' + variant : ''}`);
  rimraf(staging);

  const src = join(ROOT, name);
  if (!existsSync(src)) {
    console.warn(`  ! ${name} not found, skipping`);
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

  const outFile = join(DIST, `arianna-${name}${variant ? '-' + variant : ''}.zip`);
  rimraf(outFile);
  const bytes = await zipFolder(staging, outFile);
  console.log(`  ✓ ${basename(outFile)}  (${(bytes / 1024).toFixed(0)} KB)`);
}

async function main() {
  console.log(`Building starter ZIPs into ${DIST}`);
  console.log(`Runtime source: ${RUNTIME}\n`);
  rimraf(DIST);
  mkdirSync(DIST, { recursive: true });

  for (const name of WEB_TEMPLATES) {
    console.log(`→ ${name} (web)`);
    for (const v of ['', 'vscode', 'webstorm']) await buildOne(name, 'web', v);
  }
  for (const name of TAURI_TEMPLATES) {
    console.log(`\n→ ${name} (tauri)`);
    for (const v of ['', 'vscode', 'rustrover']) await buildOne(name, 'tauri', v);
  }

  rimraf(join(DIST, '_staging'));

  const zips = readdirSync(DIST).filter(f => f.endsWith('.zip'));
  const total = zips.reduce((sum, f) => sum + statSync(join(DIST, f)).size, 0);
  console.log(`\nDone. ${zips.length} ZIPs, ${(total / 1024 / 1024).toFixed(1)} MB total.`);
}

main().catch(err => { console.error(err); process.exit(1); });
