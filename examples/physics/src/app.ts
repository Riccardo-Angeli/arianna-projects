/**
 * AriannA — Physics starter
 *
 * Drops boxes / balls into a 2D world with gravity, walls and friction.
 * The Physics additional handles broadphase (spatial hash), narrowphase
 * (circle/circle, circle/box, box/box analytic resolvers) and integrates
 * at a fixed step of 60 Hz with 4 substeps for stability.
 *
 * Click "Drop a box" / "Drop a ball" to spawn shapes from the top.
 */

declare const World:  any;
declare const Body:   any;
declare const Box:    any;
declare const Circle: any;

// ── Setup ──────────────────────────────────────────────────────────────────

const canvas = document.getElementById('stage') as HTMLCanvasElement;
const ctx    = canvas.getContext('2d')!;

const world = new World({
  gravity   : [0, -9.81],
  dimension : 2,
  substeps  : 4,
});

// ── Static scenery: floor + walls ──────────────────────────────────────────

const floor = new Body({ shape: new Box(20, 0.5), static: true, position: [0, -3] });
const lWall = new Body({ shape: new Box(0.5, 8),  static: true, position: [-5, 0] });
const rWall = new Body({ shape: new Box(0.5, 8),  static: true, position: [ 5, 0] });
world.addBody(floor);
world.addBody(lWall);
world.addBody(rWall);

// ── Dynamic spawning ───────────────────────────────────────────────────────

let nextId = 0;
function spawnBox() {
  const half = 0.25 + Math.random() * 0.25;
  world.addBody(new Body({
    shape       : new Box(half * 2, half * 2),
    position    : [(Math.random() - 0.5) * 4, 4],
    velocity    : [(Math.random() - 0.5) * 2, 0],
    restitution : 0.35,
    friction    : 0.4,
    angularVelocity: (Math.random() - 0.5) * 4,
  }));
}

function spawnBall() {
  const r = 0.2 + Math.random() * 0.2;
  world.addBody(new Body({
    shape       : new Circle(r),
    position    : [(Math.random() - 0.5) * 4, 4],
    velocity    : [(Math.random() - 0.5) * 2, 0],
    restitution : 0.75,
    friction    : 0.2,
  }));
}

function reset() {
  // Remove every non-static body. Static stays.
  const keep = world.bodies.filter((b: any) => b.static);
  world.bodies.length = 0;
  keep.forEach((b: any) => world.bodies.push(b));
}

document.getElementById('add-box')!.addEventListener('click', spawnBox);
document.getElementById('add-ball')!.addEventListener('click', spawnBall);
document.getElementById('reset')!.addEventListener('click', reset);

// Pre-populate
for (let i = 0; i < 5; i++) spawnBox();
for (let i = 0; i < 3; i++) spawnBall();

// ── Run + draw ─────────────────────────────────────────────────────────────

world.start();

const SCALE  = 50;
const OFFSET = [canvas.width / 2, canvas.height * 0.7];

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // World grid
  ctx.strokeStyle = '#1a1d24';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += SCALE) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += SCALE) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  // Bodies
  world.debugDraw(ctx, { scale: SCALE, offset: OFFSET });

  // Body count
  ctx.fillStyle = '#8a8f98';
  ctx.font = '11px ui-monospace, monospace';
  ctx.fillText(`bodies: ${world.bodies.length}`, 12, 20);

  requestAnimationFrame(draw);
}
draw();
