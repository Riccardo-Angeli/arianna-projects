#!/usr/bin/env node
/**
 * Build all 18 starter ZIPs.
 *
 * For each of the 6 templates we emit three variants:
 *
 *   arianna-<name>.zip            ← bare project (no IDE folder)
 *   arianna-<name>-vscode.zip     ← + .vscode/ from .vscode-presets/
 *   arianna-<name>-webstorm.zip   ← + .idea/   from .webstorm-presets/
 *
 * Output goes to dist/. CI uploads these as GitHub release assets via
 * `gh release create vX.Y.Z dist/*.zip --generate-notes`.
 *
 * Requires Node 18+. Uses only built-ins + the archiver package.
 *
 *   npm install --no-save archiver
 *   node scripts/build-zips.js [--runtime path/to/arianna-web/dist]
 */

import { readdirSync, statSync, mkdirSync, rmSync, copyFileSync, existsSync, createWriteStream, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');

// Allow overriding the runtime source via --runtime=/path/to/arianna-web/dist
const args     = process.argv.slice(2);
const runtimeArg = args.find(a => a.startsWith('--runtime='));
const RUNTIME  = runtimeArg
  ? resolve(runtimeArg.split('=')[1])
  : resolve(ROOT, '..', 'arianna-web');

const TEMPLATES = ['minimal', 'counter', 'three-keyframes', 'physics', 'desktop', 'payments'];
const BUNDLES   = ['arianna.js', 'arianna-additionals.js', 'arianna-components.js'];

// ── Helpers ────────────────────────────────────────────────────────────────

function rimraf(p) { if (existsSync(p)) rmSync(p, { recursive: true, force: true }); }

function copyDir(src, dst) {
  mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
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

// ── Per-template staging ───────────────────────────────────────────────────

async function buildOne(name, variant) {
  const staging = join(DIST, '_staging', `arianna-${name}${variant ? '-' + variant : ''}`);
  rimraf(staging);

  // 1. Copy project files
  const src = join(ROOT, name);
  copyDir(src, staging);

  // 2. Copy runtime bundles (if present in --runtime path)
  for (const b of BUNDLES) {
    const r = join(RUNTIME, b);
    if (existsSync(r)) copyFileSync(r, join(staging, b));
    else console.warn(`  ! runtime ${b} missing in ${RUNTIME} — zip will not include it`);
  }

  // 3. Add IDE preset folder if this is the vscode or webstorm variant
  if (variant === 'vscode') {
    const presets = join(ROOT, '.vscode-presets');
    const target  = join(staging, '.vscode');
    copyDir(presets, target);
  } else if (variant === 'webstorm') {
    const presets = join(ROOT, '.webstorm-presets');
    const target  = join(staging, '.idea');
    copyDir(presets, target);
    // WebStorm wants a workspace.xml-style root; symlink-style minimum:
    writeFileSync(join(target, 'workspace.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="ProjectViewState">
    <option name="hideEmptyMiddlePackages" value="true" />
    <option name="showLibraryContents" value="true" />
  </component>
</project>
`);
  }

  // 4. Bump README front-matter so unzipped folder name is clear
  const readme = join(staging, 'README.md');
  if (existsSync(readme)) {
    const txt = readFileSync(readme, 'utf8');
    writeFileSync(readme, txt);
  }

  // 5. Zip it
  const outFile = join(DIST, `arianna-${name}${variant ? '-' + variant : ''}.zip`);
  rimraf(outFile);
  const bytes = await zipFolder(staging, outFile);
  console.log(`  ✓ ${basename(outFile)}  (${(bytes / 1024).toFixed(0)} KB)`);
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Building starter ZIPs into ${DIST}`);
  console.log(`Runtime source: ${RUNTIME}`);
  rimraf(DIST);
  mkdirSync(DIST, { recursive: true });

  for (const name of TEMPLATES) {
    console.log(`\n→ ${name}`);
    for (const variant of ['', 'vscode', 'webstorm']) {
      await buildOne(name, variant);
    }
  }

  // Cleanup staging
  rimraf(join(DIST, '_staging'));

  // Stats
  const zips = readdirSync(DIST).filter(f => f.endsWith('.zip'));
  const total = zips.reduce((sum, f) => sum + statSync(join(DIST, f)).size, 0);
  console.log(`\nDone. ${zips.length} ZIPs, ${(total / 1024 / 1024).toFixed(1)} MB total.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
