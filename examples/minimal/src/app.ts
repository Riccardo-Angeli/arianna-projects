/**
 * AriannA — Minimal starter
 *
 * The smallest possible AriannA program: render a heading. Imports are
 * loaded as side-effect modules from the bundled runtime in the parent
 * folder; window.Real / window.signal are exposed by arianna.js for the
 * casual / inline-script use case.
 *
 * For the typed import path, swap the (Real as any) cast for an
 * `import { Real } from 'arianna/real'` once the local node_modules has
 * the published package.
 */

declare const Real: any;

const app = document.getElementById('app')!;

new Real('h1', {}, 'Hello, AriannA!')
  .append(app);

new Real('p', {}, 'Edit src/app.ts and refresh — that\'s the whole loop.')
  .append(app);
