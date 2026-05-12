# AriannA Counter — starter template

Classic counter with fine-grained reactivity. Demonstrates the three
foundational primitives of AriannA reactivity:

- **`signal(initial)`** — mutable reactive cell
- **`computed(fn)`** — derived value that auto-recomputes when its
  dependencies change
- **`Real(...).text(fn)`** — text node bound to a function; re-evaluates
  only when the signals it reads change

Only the text node showing the count re-renders on each click — the
surrounding `<div>` and the buttons stay mounted. Open DevTools, watch the
text node update by itself.

## Run

```bash
npm install
npm run dev
# → http://localhost:5500
```

## Anatomy

```
counter/
├── index.html         ← shell + dark theme styles
├── src/app.ts         ← all the reactivity, 20-ish lines
├── arianna.js         ← runtime (core)
├── arianna-additionals.js
├── arianna-components.js
├── tsconfig.json
└── package.json
```

## Next steps

The pattern scales: replace `signal(0)` with `signal({ items: [...] })`
and you have a Todo list. Replace it with a fetch result and you have a
data view. The render code doesn't change — it just reads the signal.

Move on to:

- **three-keyframes** if you want to drive 3D objects from a timeline
- **physics** if you want simulated motion alongside hand-keyed motion
- **desktop** for full window-manager composition

## License

MIT for the template code; AriannA runtime is dual-licensed AGPL-3.0 / Commercial.
