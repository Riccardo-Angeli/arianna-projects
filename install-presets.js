#!/usr/bin/env node
/**
 * Install AriannA IDE presets (.vscode/ or .idea/) into an existing project.
 *
 * Usage from your project root:
 *
 *   npx degit Riccardo-Angeli/AriannA-Js-Starters/.vscode-presets    .vscode
 *   npx degit Riccardo-Angeli/AriannA-Js-Starters/.webstorm-presets  .idea
 *
 * Or, if you have a local clone of this repo:
 *
 *   node /path/to/AriannA-Js-Starters/scripts/install-presets.js vscode   ./my-project
 *   node /path/to/AriannA-Js-Starters/scripts/install-presets.js webstorm ./my-project
 */

import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const which = (process.argv[2] || '').toLowerCase();
const target = process.argv[3] || '.';

if (!['vscode', 'webstorm'].includes(which)) {
  console.error('Usage: install-presets.js <vscode|webstorm> [target-dir]');
  process.exit(1);
}

const sourceDir = which === 'vscode'
  ? join(ROOT, '.vscode-presets')
  : join(ROOT, '.webstorm-presets');
const outDir = which === 'vscode'
  ? join(resolve(target), '.vscode')
  : join(resolve(target), '.idea');

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
