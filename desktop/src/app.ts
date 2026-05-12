/**
 * AriannA — Desktop starter
 *
 * macOS-style desktop with a Dock at the bottom and draggable Windows on
 * a wallpaper. Click a dock icon to open / focus the matching window;
 * close a window and the dock un-runs it.
 *
 * The OS switcher in the top-right repaints every open window + the dock
 * in unison (macOS / Windows / Linux). The Linux mode is a CSS veneer
 * over the macOS layout — see index.html for the .ar-*--linux rules.
 */

declare const Window: any;
declare const Dock:   any;

// ── Mount points ────────────────────────────────────────────────────────────

const stage = document.getElementById('stage')!;

const desktopArea = document.createElement('div');
desktopArea.style.cssText =
  'position:absolute; left:0; right:0; top:0; bottom:84px; overflow:hidden;';
stage.appendChild(desktopArea);

const dockHost = document.createElement('div');
dockHost.style.cssText =
  'position:absolute; left:0; right:0; bottom:8px; display:flex; ' +
  'justify-content:center; pointer-events:none;';
stage.appendChild(dockHost);

const dockInner = document.createElement('div');
dockInner.style.pointerEvents = 'auto';
dockHost.appendChild(dockInner);

// ── State ───────────────────────────────────────────────────────────────────

let currentOS = 'macos';
const openWindows = new Map<string, any>();

// ── Dock ────────────────────────────────────────────────────────────────────

const dock = new Dock(dockInner, {
  style: 'macos',
  items: [
    { id: 'finder', label: 'Finder', icon: '🗂️' },
    { id: 'safari', label: 'Safari', icon: '🧭' },
    { id: 'mail',   label: 'Mail',   icon: '✉️' },
    { id: 'music',  label: 'Music',  icon: '🎵' },
    { id: 'notes',  label: 'Notes',  icon: '📝' },
    { id: 'trash',  label: 'Trash',  icon: '🗑️', separator: true },
  ],
});

// ── App registry ────────────────────────────────────────────────────────────

const apps: Record<string, { title: string; body: string }> = {
  finder: { title: 'Finder', body: '📁 Documents · Pictures · Downloads' },
  safari: { title: 'Safari', body: '🌐 https://arianna-js.dev' },
  mail  : { title: 'Mail',   body: '<b>Inbox</b> · 3 unread<br><br>Subject: AriannA v1.5' },
  music : { title: 'Music',  body: '🎵 Sweet Child O Mine — Guns N\' Roses' },
  notes : { title: 'Notes',  body: 'Type-here notepad. <i>Demo only.</i>' },
  trash : { title: 'Trash',  body: 'Trash is empty.' },
};

// ── Window-open + OS coordination ───────────────────────────────────────────

function applyOSToWindow(win: any, os: string) {
  if (!win || !win.el) return;
  win.el.classList.remove('ar-window--linux');
  if (os === 'linux') {
    win.setStyle('macos');
    win.el.classList.add('ar-window--linux');
  } else {
    win.setStyle(os);
  }
}
function applyOSToDock(d: any, os: string) {
  if (!d || !d.el) return;
  d.el.classList.remove('ar-dock--linux');
  if (os === 'linux') {
    d.setStyle('macos');
    d.el.classList.add('ar-dock--linux');
  } else {
    d.setStyle(os);
  }
}

function openApp(id: string) {
  if (openWindows.has(id)) { openWindows.get(id).focus(); return; }
  const cfg = apps[id];
  if (!cfg) return;
  const win = new Window(desktopArea, {
    style : 'macos',
    title : cfg.title,
    width : 360, height: 240,
    x: 40 + openWindows.size * 36,
    y: 40 + openWindows.size * 28,
    menu  : [
      { id: 'file', label: 'File' },
      { id: 'edit', label: 'Edit' },
      { id: 'view', label: 'View' },
    ],
    body  : `<div style="padding:14px;font:12px ui-sans-serif,sans-serif;color:#d4d4d4">${cfg.body}</div>`,
  });
  applyOSToWindow(win, currentOS);
  openWindows.set(id, win);
  win.on('close', () => { openWindows.delete(id); dock.setRunning(id, false); });
  dock.setRunning(id, true);
}

dock.on('item-click', (e: any) => openApp(e.id));

// Open Finder by default
setTimeout(() => openApp('finder'), 50);

// ── OS switcher wiring ──────────────────────────────────────────────────────

document.querySelectorAll<HTMLButtonElement>('.os-switch button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.os-switch button')
      .forEach(b => b.classList.toggle('active', b === btn));
    currentOS = btn.dataset.os!;
    openWindows.forEach(w => applyOSToWindow(w, currentOS));
    applyOSToDock(dock, currentOS);
    // Adjust dock host bottom inset per OS
    dockHost.style.bottom = currentOS === 'windows' ? '0'
                          : currentOS === 'linux'   ? '12px' : '8px';
    dockHost.style.justifyContent = currentOS === 'windows' ? 'stretch' : 'center';
    dockInner.style.width = currentOS === 'windows' ? '100%' : 'auto';
  });
});
