# AriannA Physics — starter template

A 2D physics playground. Floor + walls are static; boxes and balls fall in
from the top with random initial velocity and bounce around. Demonstrates
the `World` / `Body` / `Shape` / `debugDraw` API and the marriage of the
Physics additional with a plain HTML canvas (no Three.js / Two.js needed).

## Run

```bash
npm install
npm run dev
# → http://localhost:5500
```

Click **"Drop a box"** or **"Drop a ball"** to spawn shapes. Hit **"Reset"**
to clear everything except the static scenery.

## Anatomy

```
physics/
├── index.html         ← header + canvas + 3 buttons
├── src/app.ts         ← world setup + spawn helpers + render loop
├── arianna.js
├── arianna-additionals.js
├── arianna-components.js
├── tsconfig.json
└── package.json
```

## What to try next

- **Springs**: chain bodies together with `new Spring(a, b, restLength, stiffness, damping)`
  and `world.addConstraint(...)`. See [the Physics additional reference](https://arianna-js.dev/reference.html#sp-phys-marriage)
  for the constraint API.
- **Bake into keyframes**: hook in a `KeyframeEditor` and call
  `world.bake(editor, clipId, { from: 0, to: 2, fps: 60, nodes: { ball } })`
  to convert a physics run into editable animation. The `three-keyframes`
  starter has the bind pattern.
- **3D**: switch `dimension: 2` to `dimension: 3`, use `Sphere` and 3D
  `Box`, and render with Three.js (see `three-keyframes` for the Three
  scene boilerplate).

## License

MIT for the template code; AriannA runtime is dual-licensed AGPL-3.0 / Commercial.
