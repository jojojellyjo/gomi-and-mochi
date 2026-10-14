import { game } from './state.js';
import { F, drawSpeaker } from './ui.js';
import { sfx, isMuted, setMuted } from './sfx.js';
import { loadPhotos } from './photos.js';
import { title } from './scenes/title.js';
import { garden } from './scenes/garden.js';
import { press } from './scenes/press.js';
import { journal } from './scenes/journal.js';
import { keepsake } from './scenes/keepsake.js';

const { W, H } = game;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let scale = 1, dpr = 1;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  canvas.style.width = `${W * scale}px`;
  canvas.style.height = `${H * scale}px`;
  canvas.width = Math.round(W * scale * dpr);
  canvas.height = Math.round(H * scale * dpr);
}
window.addEventListener('resize', resize);
resize();

function toGame(e) {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
}
const MUTE = { x: W - 30, y: H - 30 };
function onMute(p) { return Math.hypot(p.x - MUTE.x, p.y - MUTE.y) < 22; }

canvas.addEventListener('pointerdown', (e) => {
  sfx.unlock();
  canvas.setPointerCapture(e.pointerId);
  const p = toGame(e);
  if (onMute(p)) { setMuted(!isMuted()); return; }
  game.scene && game.scene.pointerdown && game.scene.pointerdown(p, e);
});
canvas.addEventListener('pointermove', (e) => {
  const p = toGame(e);
  game.scene && game.scene.pointermove && game.scene.pointermove(p, e);
  canvas.style.cursor = onMute(p) ? 'pointer' : game.cursor;
});
canvas.addEventListener('pointerup', (e) => {
  const p = toGame(e);
  game.scene && game.scene.pointerup && game.scene.pointerup(p, e);
});
canvas.addEventListener('pointercancel', (e) => {
  const p = toGame(e);
  game.scene && game.scene.pointerup && game.scene.pointerup(p, e);
});
canvas.addEventListener('wheel', (e) => {
  game.scene && game.scene.wheel && game.scene.wheel(e, toGame(e));
}, { passive: false });
window.addEventListener('keyup', (e) => {
  game.scene && game.scene.keyup && game.scene.keyup(e);
});
window.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  sfx.unlock();
  game.scene && game.scene.keydown && game.scene.keydown(e);
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  if (game.scene) {
    game.scene.update(dt);
    game.scene.draw(ctx);
  }
  drawSpeaker(ctx, MUTE.x, MUTE.y, isMuted());
  requestAnimationFrame(frame);
}

async function boot() {
  ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  ctx.fillStyle = '#2b211b'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f7f1e3'; ctx.font = '28px Georgia'; ctx.textAlign = 'center';
  ctx.fillText('pressing flowers…', W / 2, H / 2);
  ctx.textAlign = 'left';
  const fonts = [`600 32px ${F.serif}`, `400 32px ${F.serif}`, `italic 600 32px ${F.serif}`, `30px ${F.hand}`, `20px ${F.type}`];
  try {
    await Promise.race([
      Promise.all(fonts.map((f) => document.fonts.load(f))),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  } catch (e) { /* fonts optional */ }
  await loadPhotos();
  Object.assign(game.scenes, { title, garden, press, journal, keepsake });
  game.go('title');
  requestAnimationFrame(frame);
}
boot();
