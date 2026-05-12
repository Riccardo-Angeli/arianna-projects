/**
 * AriannA — Counter starter
 *
 * Demonstrates fine-grained reactivity: only the text node showing the
 * count re-renders when `count` changes. The label and the buttons stay
 * mounted forever.
 *
 * Three signals, one computed, three event handlers. That's it.
 */

declare const Real:     any;
declare const signal:   <T>(v: T) => { get(): T; set(v: T): void };
declare const computed: <T>(fn: () => T) => { get(): T };

const app = document.getElementById('app')!;

const count = signal(0);
const doubled = computed(() => count.get() * 2);

// Label
new Real('h1', {}, 'Counter').append(app);

// The reactive value — text() takes a function, so it re-evaluates on every
// dependency change. Only the inner text node updates; the <div> stays put.
new Real('div', { class: 'count' })
  .text(() => String(count.get()))
  .append(app);

// Doubled — same pattern with a computed.
new Real('div', { style: 'color:#8a8f98;font-size:12px' })
  .text(() => `doubled: ${doubled.get()}`)
  .append(app);

// Buttons
const btns = new Real('div', { class: 'btns' }).append(app);

new Real('button', { onclick: () => count.set(count.get() - 1) }, '−').append(btns.el);
new Real('button', { class: 'primary', onclick: () => count.set(0) }, 'reset').append(btns.el);
new Real('button', { onclick: () => count.set(count.get() + 1) }, '+').append(btns.el);
