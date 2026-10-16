import { game } from './state.js';
import { F, drawSpeaker, thoughts } from './ui.js';
import { sfx, isMuted, setMuted } from './sfx.js';
import { loadPhotos } from './photos.js';
import { title } from './scenes/title.js';
import { garden } from './scenes/garden.js';
import { press } from './scenes/press.js';
import { journal } from './scenes/journal.js';
import { keepsake } from './scenes/keepsake.js';
import { morning } from './scenes/morning.js';
import { memory } from './scenes/memory.js';
import { letter } from './scenes/letter.js';

const { W, H } = game;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let scale = 1, dpr = 1;

// warm, lamp-lit evening mood laid over every scene
let mood = null;
function buildMood() {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const v = x.createRadialGradient(W * 0.45, H * 0.42, 220, W * 0.5, H * 0.5, 860);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.55, 'rgba(25,12,4,.14)'); v.addColorStop(1, 'rgba(18,8,2,.62)');
  x.fillStyle = v; x.fillRect(0, 0, W, H);
  return c;
}
function drawMood(x) {
  if (!mood) mood = buildMood();
  x.save();
  x.globalCompositeOperation = 'multiply';
  x.fillStyle = 'rgba(255,236,212,1)'; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'source-over';
  x.drawImage(mood, 0, 0);
  x.globalCompositeOperation = 'soft-light';
  const g = x.createRadialGradient(W * 0.42, H * 0.38, 0, W * 0.42, H * 0.38, 520);
  g.addColorStop(0, 'rgba(255,200,120,.35)'); g.addColorStop(1, 'rgba(255,200,120,0)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.restore();
}

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
  // reset drawing state so one scene's text alignment etc. never leaks into the next frame
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over'; ctx.setLineDash([]); ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  if (game.scene) {
    game.scene.update(dt);
    game.scene.draw(ctx);
    if (game.sceneName !== 'memory') drawMood(ctx);
    thoughts.update(dt);
    thoughts.draw(ctx, W, H);
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
  Object.assign(game.scenes, { title, morning, garden, press, journal, memory, keepsake, letter });
  game.go('title');
  requestAnimationFrame(frame);
}
boot();
