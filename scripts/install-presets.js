#!/usr/bin/env node
/**
 * Install AriannA IDE presets (.vscode/ or .idea/) into an existing project.
 *
 * Usage from your project root:
 *
 *   npx degit Riccardo-Angeli/arianna-projects/.vscode-presets    .vscode
 *   npx degit Riccardo-Angeli/arianna-projects/.webstorm-presets  .idea
 *   npx degit Riccardo-Angeli/arianna-projects/.rustrover-presets .idea
 *
 * Or, if you have a local clone of this repo:
 *
 *   node /path/to/arianna-projects/scripts/install-presets.js vscode    ./my-project
 *   node /path/to/arianna-projects/scripts/install-presets.js webstorm  ./my-project
 *   node /path/to/arianna-projects/scripts/install-presets.js rustrover ./my-tauri-project
 *
 * webstorm preset → for plain JS/TS browser projects.
 * rustrover preset → for Tauri projects (also wires Cargo + Tauri run configs).
 */

import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const which  = (process.argv[2] || '').toLowerCase();
const target = process.argv[3] || '.';

const PRESETS = {
  vscode:    { from: '.vscode-presets',    to: '.vscode' },
  webstorm:  { from: '.webstorm-presets',  to: '.idea'   },
  rustrover: { from: '.rustrover-presets', to: '.idea'   },
};

if (!PRESETS[which]) {
  console.error('Usage: install-presets.js <vscode|webstorm|rustrover> [target-dir]');
  process.exit(1);
}

const preset    = PRESETS[which];
const sourceDir = join(ROOT, preset.from);
const outDir    = join(resolve(target), preset.to);

function copyDir(src, dst) {
  mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else copyFileSync(s, d);
  }
}

if (existsSync(outDir)) {
  console.error(`✗ ${outDir} already exists. Remove it first or pick a different target.`);
  process.exit(1);
}
copyDir(sourceDir, outDir);
console.log(`✓ Installed AriannA ${which} preset into ${outDir}`);
