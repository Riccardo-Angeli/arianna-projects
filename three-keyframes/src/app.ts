/**
 * AriannA — Three.js cube driven by KeyframeEditor
 *
 * Two panes: on the left a Three.js scene with a cube; on the right the
 * AriannA KeyframeEditor. The editor's `bind(nodeId, target)` API lets
 * us drive any property setter on the cube — position, rotation, scale —
 * with the same single editor.
 *
 * Drag the playhead, double-click a property lane to add a keyframe,
 * right-click a keyframe for the easing menu.
 */

import * as THREE from 'three';

declare const KeyframeEditor: any;

// ── Three.js scene ──────────────────────────────────────────────────────────

const sceneStage = document.getElementById('scene-stage')!;
const W = sceneStage.clientWidth;
const H = sceneStage.clientHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(W, H);
renderer.setClearColor(0x0f1115);
sceneStage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
camera.position.set(3, 2.5, 4);
camera.lookAt(0, 0, 0);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xe40c88, roughness: 0.4 }),
);
scene.add(cube);

const grid = new THREE.GridHelper(10, 10, 0x2a2d36, 0x1a1d24);
scene.add(grid);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(3, 5, 2);
scene.add(dir);

// ── KeyframeEditor ──────────────────────────────────────────────────────────

const editor = new KeyframeEditor('#editor-mount', {
  clips: [{
    id: 'anim-1', name: 'cube-spin',
    sampleRate: 60, duration: 2.0,
    nodes: [{
      id: 'cube', label: 'Cube',
      properties: [
        {
          id: 'position', label: 'position', channels: ['x', 'y', 'z'],
          keyframes: [
            { time: 0.0, values: [0, 0, 0] },
            { time: 1.0, values: [0, 1.5, 0], easing: 'easeOutCubic' },
            { time: 2.0, values: [0, 0, 0],   easing: 'easeOutBounce' },
          ],
        },
        {
          id: 'rotation', label: 'rotation', channels: ['x', 'y', 'z'],
          keyframes: [
            { time: 0.0, values: [0, 0,            0] },
            { time: 2.0, values: [0, Math.PI * 2, 0], easing: 'linear' },
          ],
        },
      ],
    }],
  }],
  wrapMode: 'loop',
  speed   : 1,
});

// ── Wire editor → Three.js ──────────────────────────────────────────────────

editor.bind('cube', {
  set: (prop: string, [x, y, z]: number[]) => {
    if (prop === 'position') cube.position.set(x, y, z);
    if (prop === 'rotation') cube.rotation.set(x, y, z);
    if (prop === 'scale')    cube.scale.set(x, y, z);
  },
});

editor.play();

// ── Render loop ─────────────────────────────────────────────────────────────

function tick() {
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// ── Resize ──────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  const w = sceneStage.clientWidth, h = sceneStage.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});
