# AriannA Three + KeyframeEditor — starter template

A Three.js cube driven by the AriannA `KeyframeEditor` timeline. Demonstrates
the `IKeyframeTarget` contract: any object that exposes a `set(prop, values)`
method can be bound to one or more property tracks.

The cube has two tracks pre-keyed: a vertical bounce on `position`, and a
full 360° rotation on `rotation`. Open the editor on the right, drag the
playhead, double-click any lane to add a keyframe, right-click for the
easing menu (linear, cubic, back, bounce, elastic, custom bezier).

## Run

```bash
npm install
npm run dev
# → http://localhost:5500
```

Three.js is loaded from the unpkg CDN via an importmap — no `npm install three`
required for the runtime. If you prefer a local install, change the importmap
to point at `./node_modules/three/...` and `npm install three`.

## Anatomy

```
three-keyframes/
├── index.html         ← two-pane layout + importmap for Three
├── src/app.ts         ← Three scene + KeyframeEditor + bind()
├── arianna.js
├── arianna-additionals.js
├── arianna-components.js
├── tsconfig.json
└── package.json
```

## What to try next

- **Add a scale track** to the cube. Reopen `app.ts`, add a third property
  in the clip definition with `channels: ['x','y','z']` and a couple of
  keyframes; the bind handler already maps `'scale'` for you.
- **Add a second clip** with `editor.addClip({...})` and switch between
  them with the Clips dropdown in the toolbar.
- **Bake physics into keyframes** — see the `physics` starter for the
  `World.bake(editor, clipId)` pattern.

## License

MIT for the template code; AriannA runtime is dual-licensed AGPL-3.0 / Commercial.
Three.js is MIT.
