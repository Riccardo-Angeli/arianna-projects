# AriannA Desktop — starter template

A full mini-desktop: wallpaper background, a Dock at the bottom that
launches apps, draggable Windows with title bars and traffic lights.
Click a dock icon to open / focus the matching window; close a window and
the dock un-runs it.

The **OS switcher** in the top-right repaints every open window plus the
dock in unison — macOS, Windows, or Linux (GNOME / Adwaita). The Linux
mode is a CSS veneer over the macOS layout, no rebuild needed.

## Run

```bash
npm install
npm run dev
# → http://localhost:5500
```

## Anatomy

```
desktop/
├── index.html         ← wallpaper + OS switcher + Linux CSS veneer
├── src/app.ts         ← Dock, Window registry, OS coordination
├── arianna.js
├── arianna-additionals.js
├── arianna-components.js
├── tsconfig.json
└── package.json
```

## What to try next

- **Add a new app** — extend the `apps` registry in `app.ts` and add a
  matching dock item.
- **Persist window positions** — listen for `'move'` / `'resize'` events
  on each Window and write to `localStorage`; restore on open.
- **Native Linux chrome** — when AriannA's `Dock.ts` / `Window.ts` get a
  proper `'linux'` style branch, the CSS veneer in `index.html` becomes
  a no-op and `setStyle('linux')` will work natively.

## License

MIT for the template code; AriannA runtime is dual-licensed AGPL-3.0 / Commercial.
