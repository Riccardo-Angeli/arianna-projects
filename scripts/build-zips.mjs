#!/usr/bin/env node
/**
 * @file        scripts/build-zips.mjs
 * @author      Riccardo Angeli
 * @version     1.5.0
 *
 * Standalone — no `npm install` required. Uses only Node built-ins
 * (`node:fs`, `node:zlib`, `node:crypto`). Tested on Node 20+, recommended
 * Node 22+.
 *
 * ── WHAT IT DOES ──────────────────────────────────────────────────────────
 *
 *   Walks the monorepo (examples/ + tauri/) and produces 36 release ZIPs.
 *
 *      12 templates  ×  3 IDE flavours  =  36 archives
 *
 *      examples/        6 web starters   × { bare · vscode · webstorm }
 *      tauri/           6 Tauri starters × { bare · vscode · rustrover }
 *
 *   Web ZIPs are seeded with the 3 AriannA runtime bundles (`arianna.js`,
 *   `arianna-additionals.js`, `arianna-components.js`) copied from the
 *   static-site folder (`../arianna-web/arianna-web-static/` by default,
 *   override with --runtime=path).
 *
 *   Tauri ZIPs do NOT need the bundles — they consume `arianna` as an npm
 *   dependency at install time.
 *
 *   IDE flavours are produced by copying the matching preset directory:
 *      .vscode-presets    → .vscode/   (in every flavour 'vscode')
 *      .webstorm-presets  → .idea/     (web 'webstorm' only)
 *      .rustrover-presets → .idea/     (tauri 'rustrover' only)
 *
 * ── OUTPUT ────────────────────────────────────────────────────────────────
 *
 *   release/dist/arianna-<name>{,-vscode,-webstorm,-rustrover}.zip
 *
 *   For browser starters:
 *     release/dist/arianna-counter.zip
 *     release/dist/arianna-counter-vscode.zip
 *     release/dist/arianna-counter-webstorm.zip
 *     ... × 6 templates  =  18 files
 *
 *   For Tauri starters:
 *     release/dist/arianna-tauri-macos.zip
 *     release/dist/arianna-tauri-macos-vscode.zip
 *     release/dist/arianna-tauri-macos-rustrover.zip
 *     ... × 6 templates  =  18 files
 *
 *   Total: 36 ZIPs. CI uploads them via:
 *      gh release create vX.Y.Z release/dist/*.zip --generate-notes
 *
 * ── HOW TO RUN ────────────────────────────────────────────────────────────
 *
 *   From WebStorm: right-click this file → Run 'build-zips.mjs'.
 *   From CLI:      node scripts/build-zips.mjs [--runtime=...] [--out=...]
 *
 * ── FLAGS ─────────────────────────────────────────────────────────────────
 *
 *   --runtime=<path>   override the runtime-bundle location. Default tries:
 *                        ../arianna-web/arianna-web-static
 *                        ../arianna-web-static
 *                        ../arianna-web
 *                        the project root
 *   --out=<path>       override the output directory.
 *                      Default: release/dist
 *   --quiet            suppress per-file logs (only the summary).
 */

import {
  readdirSync, statSync, readFileSync, mkdirSync, rmSync, copyFileSync,
  existsSync, writeFileSync,
} from 'node:fs';
import { join, resolve, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';

// ── CRC32 (no dependency on zlib.crc32 — that was only added in Node 22) ─
//
// Standard ITU-T V.42 CRC32 with polynomial 0xEDB88320. Precomputes a
// 256-entry table at module load (~1 ms) so each addFile() runs at full
// pipe-line speed. Matches the output of zlib.crc32 byte for byte.

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');

// ── Args ─────────────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const flagVal   = (name) => {
  const a = args.find(a => a.startsWith(`--${name}=`));
  return a ? a.split('=').slice(1).join('=') : null;
};
const flag      = (name) => args.includes(`--${name}`);

const QUIET     = flag('quiet');
const OUT       = resolve(ROOT, flagVal('out') || 'release/dist');

// Where to find the 3 runtime bundles (arianna.js + additionals + components).
function findRuntime() {
  const arg = flagVal('runtime');
  if (arg) return resolve(arg);
  const candidates = [
    resolve(ROOT, '..', 'arianna-web', 'arianna-web-static'),
    resolve(ROOT, '..', 'arianna-web-static'),
    resolve(ROOT, '..', 'arianna-web'),
    ROOT,
  ];
  for (const c of candidates) {
    if (existsSync(join(c, 'arianna.js'))) return c;
  }
  return candidates[0]; // will be reported as missing
}
const RUNTIME = findRuntime();

// ── Manifest ─────────────────────────────────────────────────────────────

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

const PRESETS = {
  vscode:    { dir: '.vscode-presets',    target: '.vscode' },
  webstorm:  { dir: '.webstorm-presets',  target: '.idea'   },
  rustrover: { dir: '.rustrover-presets', target: '.idea'   },
};

const WORKSPACE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="ProjectViewState">
    <option name="hideEmptyMiddlePackages" value="true" />
    <option name="showLibraryContents" value="true" />
  </component>
</project>
`;

// ── ZIP writer (no external deps) ────────────────────────────────────────
//
// Hand-rolled minimal ZIP. Format reference:
//   https://en.wikipedia.org/wiki/ZIP_(file_format)
//
// We only need:
//   - Local file headers (one per entry)
//   - Deflate-compressed bodies
//   - A central directory at the end
//   - End-of-central-directory record
//
// No encryption, no zip64, no extra fields. Plenty for our 36 starter ZIPs.

class ZipWriter {
  constructor() {
    this.entries = [];       // { name, mtime, crc, compSize, origSize, offset, compData }
    this.chunks  = [];       // raw bytes accumulated; we Buffer.concat at finish()
    this.cursor  = 0;
  }

  /** Add a single file. `bytes` may be Buffer or string. */
  addFile(zipPath, bytes, mtime = new Date()) {
    const data = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
    const comp = data.length === 0 ? Buffer.alloc(0) : deflateRawSync(data, { level: 9 });
    const checksum = crc32(data);
    const { dos: dosTime, day: dosDate } = toDosDateTime(mtime);
    const nameBuf = Buffer.from(zipPath.replace(/\\/g, '/'), 'utf8');

    // ── Local file header (LFH) ─────────────────────────────────────────
    //   4  signature  0x04034b50
    //   2  version needed (20)
    //   2  general purpose bit flag (0x0800 = UTF-8 name)
    //   2  compression method (8 = deflate)
    //   2  last mod time
    //   2  last mod date
    //   4  CRC-32
    //   4  compressed size
    //   4  uncompressed size
    //   2  file name length
    //   2  extra field length
    //   …  file name
    //   …  extra field (none)
    //   …  compressed data
    const lfh = Buffer.alloc(30);
    lfh.writeUInt32LE(0x04034b50, 0);
    lfh.writeUInt16LE(20,         4);
    lfh.writeUInt16LE(0x0800,     6);
    lfh.writeUInt16LE(8,          8);
    lfh.writeUInt16LE(dosTime,   10);
    lfh.writeUInt16LE(dosDate,   12);
    lfh.writeUInt32LE(checksum,  14);
    lfh.writeUInt32LE(comp.length, 18);
    lfh.writeUInt32LE(data.length, 22);
    lfh.writeUInt16LE(nameBuf.length, 26);
    lfh.writeUInt16LE(0,         28);

    const offset = this.cursor;
    this.chunks.push(lfh, nameBuf, comp);
    this.cursor += lfh.length + nameBuf.length + comp.length;

    this.entries.push({
      name: nameBuf, dosTime, dosDate, crc: checksum,
      compSize: comp.length, origSize: data.length, offset,
    });
  }

  /** Finalise the archive and return a Buffer. */
  finish() {
    // ── Central directory (one entry per file) ─────────────────────────
    //   4  signature 0x02014b50
    //   2  version made by (20)
    //   2  version needed to extract (20)
    //   2  general purpose bit flag (0x0800)
    //   2  compression method (8)
    //   2  last mod time
    //   2  last mod date
    //   4  CRC-32
    //   4  compressed size
    //   4  uncompressed size
    //   2  file name length
    //   2  extra field length (0)
    //   2  file comment length (0)
    //   2  disk number start (0)
    //   2  internal file attributes (0)
    //   4  external file attributes (0)
    //   4  relative offset of local header
    //   …  file name
    const cdStart = this.cursor;
    for (const e of this.entries) {
      const cd = Buffer.alloc(46);
      cd.writeUInt32LE(0x02014b50,  0);
      cd.writeUInt16LE(20,          4);
      cd.writeUInt16LE(20,          6);
      cd.writeUInt16LE(0x0800,      8);
      cd.writeUInt16LE(8,          10);
      cd.writeUInt16LE(e.dosTime,  12);
      cd.writeUInt16LE(e.dosDate,  14);
      cd.writeUInt32LE(e.crc,      16);
      cd.writeUInt32LE(e.compSize, 20);
      cd.writeUInt32LE(e.origSize, 24);
      cd.writeUInt16LE(e.name.length, 28);
      cd.writeUInt16LE(0,          30);
      cd.writeUInt16LE(0,          32);
      cd.writeUInt16LE(0,          34);
      cd.writeUInt16LE(0,          36);
      cd.writeUInt32LE(0,          38);
      cd.writeUInt32LE(e.offset,   42);
      this.chunks.push(cd, e.name);
      this.cursor += cd.length + e.name.length;
    }
    const cdSize = this.cursor - cdStart;

    // ── End of central directory record ─────────────────────────────────
    //   4  signature 0x06054b50
    //   2  disk number (0)
    //   2  disk with central directory (0)
    //   2  entries on this disk
    //   2  total entries
    //   4  CD size
    //   4  CD offset
    //   2  comment length (0)
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(0,          4);
    eocd.writeUInt16LE(0,          6);
    eocd.writeUInt16LE(this.entries.length, 8);
    eocd.writeUInt16LE(this.entries.length, 10);
    eocd.writeUInt32LE(cdSize,    12);
    eocd.writeUInt32LE(cdStart,   16);
    eocd.writeUInt16LE(0,         20);
    this.chunks.push(eocd);

    return Buffer.concat(this.chunks);
  }
}

/** Convert a JS Date into DOS-style time + date 16-bit fields. */
function toDosDateTime(d) {
  const yr = d.getFullYear();
  const dos = ((d.getHours() & 0x1f) << 11)
            | ((d.getMinutes() & 0x3f) << 5)
            | ((d.getSeconds() / 2) & 0x1f);
  const day = (((yr - 1980) & 0x7f) << 9)
            | (((d.getMonth() + 1) & 0xf) << 5)
            | (d.getDate() & 0x1f);
  return { dos, day };
}

/** Walk a directory and feed every file into `cb(absPath, relPath)`. */
function walk(dir, baseInZip, cb, skip = SKIP_DEFAULT) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const abs    = join(dir, entry.name);
    const inZip  = baseInZip ? `${baseInZip}/${entry.name}` : entry.name;
    if (entry.isDirectory())     walk(abs, inZip, cb, skip);
    else if (entry.isFile())     cb(abs, inZip);
    // symlinks: skip (rare in starter templates and break in ZIPs anyway)
  }
}
const SKIP_DEFAULT = new Set(['node_modules', 'target', '.DS_Store', 'dist', 'release']);

// ── Build one ZIP ────────────────────────────────────────────────────────

function buildOne(tpl, kind, variant) {
  const stagingName = `arianna-${tpl.name}${variant ? '-' + variant : ''}`;
  const src         = join(ROOT, tpl.src);

  if (!existsSync(src)) {
    console.warn(`  ! ${tpl.src} not found, skipping`);
    return { name: stagingName, bytes: 0, skipped: true };
  }

  const zip = new ZipWriter();

  // Root folder in the ZIP. Common convention: arianna-counter/...
  const rootInZip = stagingName;

  // 1. Copy every file under the template directory.
  walk(src, rootInZip, (abs, rel) => {
    const bytes = readFileSync(abs);
    const st    = statSync(abs);
    zip.addFile(rel, bytes, st.mtime);
  });

  // 2. Drop the 3 runtime bundles into web ZIPs.
  if (kind === 'web') {
    for (const b of BUNDLES) {
      const r = join(RUNTIME, b);
      if (existsSync(r)) {
        const bytes = readFileSync(r);
        const st    = statSync(r);
        zip.addFile(`${rootInZip}/${b}`, bytes, st.mtime);
      } else if (!QUIET) {
        console.warn(`  ! runtime ${b} missing in ${RUNTIME}`);
      }
    }
  }

  // 3. Add the IDE preset if a variant was requested.
  if (variant && PRESETS[variant]) {
    const p = PRESETS[variant];
    const presetSrc = join(ROOT, p.dir);
    if (existsSync(presetSrc)) {
      walk(presetSrc, `${rootInZip}/${p.target}`, (abs, rel) => {
        zip.addFile(rel, readFileSync(abs), statSync(abs).mtime);
      });
      // .idea/workspace.xml stub so JetBrains IDEs don't regenerate it weirdly
      if (p.target === '.idea') {
        zip.addFile(`${rootInZip}/.idea/workspace.xml`, WORKSPACE_XML, new Date());
      }
    } else if (!QUIET) {
      console.warn(`  ! preset folder ${p.dir} not found at ${presetSrc}`);
    }
  }

  // 4. Serialise + write.
  const outFile = join(OUT, `${stagingName}.zip`);
  const buf     = zip.finish();
  writeFileSync(outFile, buf);

  if (!QUIET) {
    console.log(`  ✓ ${basename(outFile)}  (${(buf.length / 1024).toFixed(0)} KB)`);
  }
  return { name: stagingName, bytes: buf.length, skipped: false };
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log(`AriannA starter ZIP builder v1.5.0`);
  console.log(`Project root : ${ROOT}`);
  console.log(`Output       : ${OUT}`);
  console.log(`Runtime src  : ${RUNTIME}`);

  const haveRuntime = existsSync(join(RUNTIME, 'arianna.js'));
  if (!haveRuntime) {
    console.warn(`\n!  arianna.js NOT FOUND in the runtime folder.`);
    console.warn(`   Web starter ZIPs will ship WITHOUT the 3 runtime bundles.`);
    console.warn(`   Build the framework (cd ../AriannA-Js && npm run build) and`);
    console.warn(`   copy dist/arianna*.js into ${RUNTIME}/ before rebuilding.`);
  }
  console.log('');

  if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  let made = 0, skipped = 0, totalBytes = 0;
  for (const tpl of WEB_TEMPLATES) {
    console.log(`→ ${tpl.name} (web, from ${tpl.src})`);
    for (const v of ['', 'vscode', 'webstorm']) {
      const r = buildOne(tpl, 'web', v);
      if (r.skipped) skipped++;
      else { made++; totalBytes += r.bytes; }
    }
  }
  for (const tpl of TAURI_TEMPLATES) {
    console.log(`\n→ ${tpl.name} (tauri, from ${tpl.src})`);
    for (const v of ['', 'vscode', 'rustrover']) {
      const r = buildOne(tpl, 'tauri', v);
      if (r.skipped) skipped++;
      else { made++; totalBytes += r.bytes; }
    }
  }

  console.log(`\n────────────────────────────────────────────────────────`);
  console.log(`Done: ${made} ZIPs created, ${skipped} skipped, ${(totalBytes / 1024 / 1024).toFixed(1)} MB total.`);
  console.log(`Output folder: ${OUT}`);
  console.log(`\nNext: commit + tag v1.5.0 + push, then`);
  console.log(`  gh release create v1.5.0 ${relative(ROOT, OUT)}/*.zip --generate-notes \\`);
  console.log(`    --title "AriannA Starters v1.5.0"`);
}

main().catch(err => { console.error(err); process.exit(1); });
