import { game, save, writeSave } from '../state.js';
import { Button, F, INK, toasts } from '../ui.js';
import { getDesk } from '../bg.js';
import { drawCat, CAT_NAME } from '../cat.js';
import { FLOWERS } from '../flowers.js';
import { mk, rr, pick, clamp, TAU, pageTex, PAGE_KINDS, bake } from '../textures.js';
import { JUNK, WASHI, STAMPS, washiThumb, makeTapeStrip, pawPrints, postit, handwriting } from '../ephemera.js';
import { photoScraps, toSprite } from '../photos.js';
import { sfx } from '../sfx.js';
import { deskProps, matchaRing } from '../props.js';
import { memoryPolaroid, souvenirSprites } from './memory.js';
import { drawHand } from '../hands.js';

export const SP = { x: 84, y: 120, w: 860, h: 580 };
const PW = SP.w / 2;
const TRAY = { x: 1018, y: 104, w: 246, h: 640 };
const TABS = ['Flowers', 'Paper', 'Finds', 'Bits', 'Tape', 'Stamps', 'Photos', 'Memory'];
const TAB_W = TRAY.w / 4, TAB_H = 30;
const LIST = { top: TRAY.y + 2 * TAB_H + 16, bottom: TRAY.y + TRAY.h - 46 };
const CELL = { w: 113, h: 104, gap: 6 };

let layers = [], undo = [], sel = null, drag = null, tool = null, tab = 0, tray = null, scroll = [];
let pageKind = 0, pages = null, buttons = [], t = 0, cat = null, catTimer = 0, firstCat = true;
let shadow = null, hintShown = false, glueFx = [];
let fileInput = null;
const CUP_HOME = { x: 112, y: 668 };
let cup = { ...CUP_HOME }, cupDrag = null, cupWobble = 0;
function cupOnPage() { return cup.x > SP.x - 20 && cup.x < SP.x + SP.w + 20 && cup.y > SP.y - 20 && cup.y < SP.y + SP.h + 20; }
function drawDesk(x, behind) {
  const P = deskProps();
  const put = (img, px, py, rot) => { x.save(); x.translate(px, py); x.rotate(rot); x.drawImage(img, -img.width / 2, -img.height / 2); x.restore(); };
  if (behind) {
    put(P.mint, 30, 300, 0.2);
    put(P.wax, 990, 770, -0.08);
    put(P.candle, 760, 772, 0);
    put(P.stamp, 860, 768, 0);
    put(P.pencil, 420, 766, -0.04);
    put(P.scissors, 40, 570, 1.45);
  } else {
    put(P.cup, cup.x + (cupWobble ? Math.sin(cupWobble * 40) * 3 : 0), cup.y, 0.1);
  }
}

/* ---------- geometry ---------- */

const alphaCache = new WeakMap();
function alphaAt(sprite, lx, ly) {
  let d = alphaCache.get(sprite);
  if (!d) { d = sprite.getContext('2d').getImageData(0, 0, sprite.width, sprite.height).data; alphaCache.set(sprite, d); }
  const ix = Math.floor(lx), iy = Math.floor(ly);
  if (ix < 0 || iy < 0 || ix >= sprite.width || iy >= sprite.height) return 0;
  return d[(iy * sprite.width + ix) * 4 + 3];
}
function toLocal(L, p) {
  const dx = p.x - L.x, dy = p.y - L.y, c = Math.cos(-L.rot), s = Math.sin(-L.rot);
  return { x: ((dx * c - dy * s) / L.scale) * (L.flip || 1) + L.sprite.width / 2, y: (dx * s + dy * c) / L.scale + L.sprite.height / 2 };
}
function toWorld(L, lx, ly) {
  const dx = (lx - L.sprite.width / 2) * L.scale * (L.flip || 1), dy = (ly - L.sprite.height / 2) * L.scale;
  const c = Math.cos(L.rot), s = Math.sin(L.rot);
  return { x: L.x + dx * c - dy * s, y: L.y + dx * s + dy * c };
}
function inLayer(L, p, thresh = 50) {
  const l = toLocal(L, p);
  return alphaAt(L.sprite, l.x, l.y) > thresh;
}
function hitLayer(p) {
  for (let i = layers.length - 1; i >= 0; i--) if (inLayer(layers[i], p)) return layers[i];
  return null;
}
// Does layer U (drawn above) physically overlap layer L?
function overlaps(U, L) {
  const w = U.sprite.width, h = U.sprite.height, step = Math.max(6, Math.min(w, h) / 10);
  for (let ly = step / 2; ly < h; ly += step) for (let lx = step / 2; lx < w; lx += step) {
    if (alphaAt(U.sprite, lx, ly) < 60) continue;
    if (inLayer(L, toWorld(U, lx, ly), 60)) return true;
  }
  return false;
}
// Held down by glue, or by tape / glued pieces lying over it.
function isPinned(L) {
  if (L.glued) return 'glue';
  const i = layers.indexOf(L);
  for (let j = i + 1; j < layers.length; j++) {
    const U = layers[j];
    if ((U.type === 'tape' || U.glued) && overlaps(U, L)) return U.type === 'tape' ? 'tape' : 'glued piece';
  }
  return null;
}
// Something (not ink) lying on top of it.
function coveredBy(L) {
  const i = layers.indexOf(L);
  for (let j = layers.length - 1; j > i; j--) {
    const U = layers[j];
    if (U.type !== 'decal' && overlaps(U, L)) return U;
  }
  return null;
}
function inSpread(p, m = 0) { return p.x > SP.x - m && p.x < SP.x + SP.w + m && p.y > SP.y - m && p.y < SP.y + SP.h + m; }
function bounds(L) {
  const w = L.sprite.width, h = L.sprite.height;
  const pts = [toWorld(L, 0, 0), toWorld(L, w, 0), toWorld(L, w, h), toWorld(L, 0, h)];
  return { x0: Math.min(...pts.map((q) => q.x)), x1: Math.max(...pts.map((q) => q.x)), y0: Math.min(...pts.map((q) => q.y)), y1: Math.max(...pts.map((q) => q.y)) };
}
function rotHandle(L) { return toWorld(L, L.sprite.width - 6, 6); }

/* ---------- scissors ---------- */

function inPoly(pts, x, y) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
function opaqueCount(c) {
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 16) if (d[i] > 140) n++;
  return n;
}
function finishCut(pts) {
  if (pts.length < 8) return;
  const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y);
  const bx = Math.floor(Math.min(...xs)), by = Math.floor(Math.min(...ys));
  const bw = Math.ceil(Math.max(...xs)) - bx, bh = Math.ceil(Math.max(...ys)) - by;
  if (bw < 12 || bh < 12) return;
  // the topmost cuttable piece most of the loop sits on
  const votes = new Map();
  const step = Math.max(5, Math.min(bw, bh) / 14);
  for (let yy = by; yy < by + bh; yy += step) for (let xx = bx; xx < bx + bw; xx += step) {
    if (!inPoly(pts, xx, yy)) continue;
    for (let i = layers.length - 1; i >= 0; i--) {
      const L = layers[i];
      if (L.type === 'decal') continue;
      if (inLayer(L, { x: xx, y: yy }, 140)) { votes.set(L, (votes.get(L) || 0) + 1); break; }
    }
  }
  let target = null, best = 0;
  for (const [L, n] of votes) if (n > best) { best = n; target = L; }
  if (!target) { toasts.add('Draw your loop over a piece of junk', 1.8); return; }
  if (target.glued || (target.type !== 'tape' && isPinned(target))) { toasts.add("It's stuck down, can't cut it here", 1.8); return sfx.bad(); }

  // the cut-out piece, in page space
  const piece = mk(bw, bh), px = piece.getContext('2d');
  px.translate(-bx, -by);
  px.beginPath(); pts.forEach((q, i) => (i ? px.lineTo(q.x, q.y) : px.moveTo(q.x, q.y))); px.closePath();
  px.clip();
  drawLayer(px, { ...target, blend: null });
  const img = px.getImageData(0, 0, bw, bh), d = img.data;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 140) d[i] = 0;
  px.putImageData(img, 0, 0);
  if (opaqueCount(piece) < 20) { toasts.add('Nothing to cut there', 1.4); return; }

  snapshot();
  // punch the same shape out of the original
  const rest = mk(target.sprite.width, target.sprite.height), rx = rest.getContext('2d');
  rx.drawImage(target.sprite, 0, 0);
  rx.globalCompositeOperation = 'destination-out';
  rx.beginPath();
  pts.forEach((q, i) => { const l = toLocal(target, q); i ? rx.lineTo(l.x, l.y) : rx.moveTo(l.x, l.y); });
  rx.closePath(); rx.fill();
  const idx = layers.indexOf(target);
  if (opaqueCount(rest) < 25) layers.splice(idx, 1);
  else layers[idx] = { ...target, sprite: rest };

  const sprite = bake(piece, { pad: 8, blur: 5, off: 2, alpha: 0.3 });
  const L = { type: target.type === 'tape' ? 'tape' : 'item', sprite, x: bx + bw / 2 + 10, y: by + bh / 2 + 8, rot: 0, scale: 1, flip: 1 };
  layers.push(L);
  sel = L;
  sfx.rip();
  toasts.add('snip! drag your piece wherever you like', 1.8);
}

/* ---------- undo ---------- */

function snapshot() {
  undo.push(layers.map((l) => ({ ...l })));
  if (undo.length > 60) undo.shift();
}
function doUndo() {
  if (!undo.length) return;
  layers = undo.pop();
  sel = null;
  sfx.click();
}

/* ---------- tray ---------- */

function fit(src, w, h) {
  const c = mk(w, h), x = c.getContext('2d'), s = Math.min(w / src.width, h / src.height, 1.2);
  x.drawImage(src, (w - src.width * s) / 2, (h - src.height * s) / 2, src.width * s, src.height * s);
  return c;
}
function itemCell(label, sprite) { return { label, sprite, thumb: fit(sprite, 92, 70), kind: 'item' }; }
function buildTray() {
  const flowers = game.day.pressed.map((p) => itemCell(FLOWERS[p.type].name, p.sprite));
  const box = (cat) => {
    const out = [];
    for (const j of JUNK[cat]) for (let i = 0; i < j.n; i++) out.push(itemCell(j.label, j.make()));
    return out;
  };
  const tape = WASHI.map((w) => ({ label: w.label, thumb: washiThumb(w), washi: w, kind: 'tape' }));
  const stamps = STAMPS.map((s) => ({ label: s.label, thumb: fit(s.make(), 92, 70), make: s.make, kind: 'stamp' }));
  const photos = [{ label: 'add a photo', kind: 'upload', thumb: uploadThumb() }, ...photoScraps().map((p) => itemCell(p.label, p.sprite))];
  return [flowers, [{ label: 'write a post-it', kind: 'note', thumb: noteThumb() }, ...box('Paper')], box('Ephemera'), box('Bits'), tape, stamps, photos, memoryCells()];
}
function memoryCells() {
  const info = game.day.info, m = info && info.memory;
  if (!m) return [];
  const pol = memoryPolaroid(m);
  if (!game.day.memoryDone) return [{ label: 'step inside ✦', kind: 'memory', memory: m, thumb: fit(pol, 92, 70), sprite: pol }];
  return [itemCell('memory', pol), ...souvenirSprites(m).map((s) => itemCell(s.label, s.sprite))];
}
function askWrite(p) {
  const inks = ['#3b3550', '#9b2335', '#2f4f7f', '#5d7741'];
  let ink = inks[0];
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(30,20,10,.45);z-index:10';
  wrap.innerHTML = `<div style="background:#fbf6e6;padding:18px;border-radius:6px;box-shadow:0 10px 30px rgba(0,0,0,.35);width:min(380px,88vw)">
    <textarea maxlength="120" rows="3" placeholder="write something…" style="width:100%;box-sizing:border-box;border:0;border-bottom:1px solid rgba(90,120,165,.3);background:transparent;font:30px Caveat,cursive;color:${ink};resize:none;outline:none"></textarea>
    <div style="display:flex;gap:8px;align-items:center;margin-top:10px">
      ${inks.map((c, i) => `<button data-ink="${c}" aria-label="ink ${i + 1}" style="width:26px;height:26px;border-radius:50%;border:2px solid ${i ? 'transparent' : '#3a2e28'};background:${c};cursor:pointer"></button>`).join('')}
      <span style="flex:1"></span>
      <button data-a="cancel" style="font:600 15px Fraunces,Georgia,serif;padding:8px 14px;border-radius:10px;border:1px solid rgba(58,46,40,.3);background:#fff;cursor:pointer">Cancel</button>
      <button data-a="ok" style="font:600 15px Fraunces,Georgia,serif;padding:8px 14px;border-radius:10px;border:0;background:#7f9c5b;color:#fffdf5;cursor:pointer">Write it</button>
    </div></div>`;
  document.body.appendChild(wrap);
  const ta = wrap.querySelector('textarea');
  setTimeout(() => ta.focus(), 30);
  const close = (ok) => {
    const text = ta.value.trim();
    wrap.remove();
    if (!ok || !text) return;
    snapshot();
    const sprite = handwriting(text, ink);
    const L = { type: 'item', sprite, x: clamp(p.x + sprite.width / 2 - 20, SP.x + 20, SP.x + SP.w - 20), y: p.y, rot: rr(-0.03, 0.03), scale: 1, flip: 1, ink: true };
    layers.push(L); sel = L;
    sfx.scribble();
  };
  wrap.addEventListener('click', (e) => {
    const d = e.target.dataset || {};
    if (d.ink) { ink = d.ink; ta.style.color = ink; wrap.querySelectorAll('[data-ink]').forEach((b) => { b.style.borderColor = b.dataset.ink === ink ? '#3a2e28' : 'transparent'; }); return; }
    if (d.a) close(d.a === 'ok'); else if (e.target === wrap) close(false);
  });
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); close(true); } if (e.key === 'Escape') close(false); e.stopPropagation(); });
}
function noteThumb() {
  const c = mk(92, 70), x = c.getContext('2d');
  x.fillStyle = '#fbe57a'; x.fillRect(22, 6, 50, 50);
  x.fillStyle = 'rgba(0,0,0,.06)'; x.fillRect(22, 6, 50, 9);
  x.fillStyle = '#2f2a3a'; x.font = `600 26px ${F.hand}`; x.textAlign = 'center'; x.fillText('✎', 47, 44);
  return c;
}
function askNote() {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(30,20,10,.45);z-index:10';
  wrap.innerHTML = `<div style="background:#fbe57a;padding:18px;border-radius:4px;box-shadow:0 10px 30px rgba(0,0,0,.35);width:min(320px,86vw);font-family:Caveat,cursive">
    <textarea maxlength="60" rows="3" placeholder="write a little note…" style="width:100%;box-sizing:border-box;border:0;background:transparent;font:28px Caveat,cursive;color:#2f2a3a;resize:none;outline:none"></textarea>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
      <button data-a="cancel" style="font:600 15px Fraunces,Georgia,serif;padding:8px 14px;border-radius:10px;border:1px solid rgba(58,46,40,.3);background:#fbf6ea;cursor:pointer">Cancel</button>
      <button data-a="ok" style="font:600 15px Fraunces,Georgia,serif;padding:8px 14px;border-radius:10px;border:0;background:#7f9c5b;color:#fffdf5;cursor:pointer">Stick it</button>
    </div></div>`;
  document.body.appendChild(wrap);
  const ta = wrap.querySelector('textarea');
  setTimeout(() => ta.focus(), 30);
  const close = (ok) => {
    const text = ta.value.trim();
    wrap.remove();
    if (!ok || !text) return;
    snapshot();
    const L = { type: 'item', sprite: postit(text), x: SP.x + SP.w / 2 + rr(-60, 60), y: SP.y + SP.h / 2 + rr(-40, 40), rot: rr(-0.1, 0.1), scale: 1, flip: 1 };
    layers.push(L); sel = L;
    sfx.pop();
  };
  wrap.addEventListener('click', (e) => { const a = e.target.dataset && e.target.dataset.a; if (a) close(a === 'ok'); else if (e.target === wrap) close(false); });
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); close(true); } if (e.key === 'Escape') close(false); e.stopPropagation(); });
}
function uploadThumb() {
  const c = mk(92, 70), x = c.getContext('2d');
  x.strokeStyle = 'rgba(58,46,40,.45)'; x.setLineDash([5, 4]); x.lineWidth = 2;
  x.beginPath(); x.roundRect(14, 6, 64, 58, 10); x.stroke(); x.setLineDash([]);
  x.fillStyle = 'rgba(58,46,40,.7)'; x.font = `600 34px ${F.serif}`; x.textAlign = 'center'; x.fillText('+', 46, 48);
  return c;
}
function listHeight(i) { return Math.ceil(tray[i].length / 2) * (CELL.h + CELL.gap); }
function maxScroll() { return Math.max(0, listHeight(tab) - (LIST.bottom - LIST.top)); }
function cellRect(i) {
  const col = i % 2, row = Math.floor(i / 2);
  return { x: TRAY.x + 8 + col * (CELL.w + CELL.gap), y: LIST.top + row * (CELL.h + CELL.gap) - scroll[tab], w: CELL.w, h: CELL.h };
}
function trayCellAt(p) {
  if (p.y < LIST.top || p.y > LIST.bottom) return -1;
  const items = tray[tab];
  for (let i = 0; i < items.length; i++) {
    const r = cellRect(i);
    if (p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h) return i;
  }
  return -1;
}
function tabAt(p) {
  if (p.x < TRAY.x || p.x > TRAY.x + TRAY.w || p.y < TRAY.y + 4 || p.y > TRAY.y + 4 + 2 * TAB_H) return -1;
  const i = Math.floor((p.y - TRAY.y - 4) / TAB_H) * 4 + Math.floor((p.x - TRAY.x) / TAB_W);
  return i < TABS.length ? i : -1;
}
const ARROWS = { up: { x: TRAY.x + 10, y: TRAY.y + TRAY.h - 40, w: 108, h: 32 }, down: { x: TRAY.x + 128, y: TRAY.y + TRAY.h - 40, w: 108, h: 32 } };
const inRect = (p, r) => p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h;

function askPhoto() {
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.addEventListener('change', () => {
      const f = fileInput.files && fileInput.files[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => {
        const cell = itemCell('my photo', toSprite(img, 240));
        tray[6].push(cell);
        URL.revokeObjectURL(url);
        tab = 6; scroll[6] = maxScroll();
        toasts.add('Photo added! Drag it onto the page');
        sfx.shutter();
      };
      img.src = url;
      fileInput.value = '';
    });
  }
  fileInput.click();
}

/* ---------- pages ---------- */

function buildPages() {
  const k = PAGE_KINDS[pageKind];
  pages = [pageTex(PW, SP.h, k, 'left'), pageTex(PW, SP.h, k, 'right')];
}
function buildShadow() {
  const c = mk(SP.w + 80, SP.h + 80), x = c.getContext('2d');
  x.shadowColor = 'rgba(30,15,5,.55)'; x.shadowBlur = 30; x.shadowOffsetY = 12;
  x.fillStyle = '#000'; x.fillRect(40, 40, SP.w, SP.h);
  return c;
}
export function drawSpread(x, ox, oy, withShadow = true) {
  if (withShadow) x.drawImage(shadow, ox - 40, oy - 40);
  x.drawImage(pages[0], ox, oy);
  x.drawImage(pages[1], ox + PW, oy);
  const g = x.createLinearGradient(ox + PW - 50, 0, ox + PW + 50, 0);
  g.addColorStop(0, 'rgba(80,50,20,0)'); g.addColorStop(0.45, 'rgba(80,50,20,.18)'); g.addColorStop(0.5, 'rgba(60,35,15,.32)');
  g.addColorStop(0.55, 'rgba(80,50,20,.18)'); g.addColorStop(1, 'rgba(80,50,20,0)');
  x.fillStyle = g; x.fillRect(ox + PW - 50, oy, 100, SP.h);
  x.strokeStyle = 'rgba(90,70,50,.25)'; x.lineWidth = 1; x.strokeRect(ox + 0.5, oy + 0.5, SP.w - 1, SP.h - 1);
  x.save();
  x.translate(ox - SP.x, oy - SP.y);
  for (const L of layers) drawLayer(x, L);
  x.restore();
}
function drawLayer(x, L) {
  x.save();
  x.translate(L.x, L.y);
  x.rotate(L.rot);
  x.scale(L.scale * (L.flip || 1), L.scale);
  if (L.blend) x.globalCompositeOperation = L.blend;
  x.drawImage(L.sprite, -L.sprite.width / 2, -L.sprite.height / 2);
  x.restore();
}

/* ---------- selection toolbar ---------- */

const TOOLS = [
  { id: 'ccw', glyph: '↺', tip: 'rotate' }, { id: 'cw', glyph: '↻', tip: 'rotate' },
  { id: 'small', glyph: '−', tip: 'smaller' }, { id: 'big', glyph: '+', tip: 'bigger' },
  { id: 'flip', glyph: '⇆', tip: 'flip' }, { id: 'dup', glyph: '⧉', tip: 'copy' },
  { id: 'del', glyph: '✕', tip: 'remove' },
];
function toolbarRect() {
  if (!sel || !layers.includes(sel) || drag) return null;
  const b = bounds(sel), w = TOOLS.length * 38 + 8, h = 42;
  let x = (b.x0 + b.x1) / 2 - w / 2, y = b.y0 - h - 12;
  if (y < SP.y - 20) y = b.y1 + 12;
  x = clamp(x, 8, TRAY.x - w - 8); y = clamp(y, 96, 800 - h - 8);
  return { x, y, w, h };
}
function toolAt(p) {
  const r = toolbarRect();
  if (!r || !inRect(p, r)) return null;
  const i = Math.floor((p.x - r.x - 4) / 38);
  return TOOLS[clamp(i, 0, TOOLS.length - 1)];
}
function applyTool(tl) {
  const L = sel;
  if (tl.id === 'del') {
    const why = isPinned(L);
    if (why && L.type !== 'tape') { toasts.add(why === 'glue' ? "It's glued down for good" : `It's held under the ${why}`); return sfx.bad(); }
    snapshot(); layers.splice(layers.indexOf(L), 1); sel = null; sfx.rip(); return;
  }
  if (tl.id === 'dup') {
    snapshot();
    const c = { ...L, x: L.x + 24, y: L.y + 24, glued: false, vx: 0, vy: 0, vr: 0 };
    layers.push(c); sel = c; sfx.pop(); return;
  }
  if (L.glued || (L.type !== 'tape' && isPinned(L))) { toasts.add("Can't adjust it while it's stuck down"); return sfx.bad(); }
  snapshot();
  if (tl.id === 'ccw') L.rot -= Math.PI / 12;
  else if (tl.id === 'cw') L.rot += Math.PI / 12;
  else if (tl.id === 'small') L.scale = clamp(L.scale / 1.12, 0.35, 2.4);
  else if (tl.id === 'big') L.scale = clamp(L.scale * 1.12, 0.35, 2.4);
  else if (tl.id === 'flip') L.flip = -(L.flip || 1);
  sfx.click();
}

/* ---------- the cat ---------- */

function spawnCat() {
  const dir = Math.random() < 0.5 ? 1 : -1;
  cat = {
    dir, x: dir > 0 ? SP.x - 140 : SP.x + SP.w + 140, y: cupOnPage() && Math.random() < 0.5 ? clamp(cup.y + 40, SP.y + 200, SP.y + SP.h + 10) : rr(SP.y + 200, SP.y + SP.h - 20),
    state: 'walk', speed: 150, t: 0, timer: 0, pushed: new Set(),
    loafAt: Math.random() < 0.45 ? rr(SP.x + 220, SP.x + SP.w - 220) : null,
  };
  game.day.stats.visits++;
  sfx.meow();
  if (firstCat) { toasts.add(`${CAT_NAME} is coming! Tape scraps down to keep them put`, 3.6); firstCat = false; }
}
function catBox() {
  if (!cat) return null;
  if (cat.state === 'loaf') return { x0: cat.x - 80, x1: cat.x + 80, y0: cat.y - 90, y1: cat.y + 6 };
  return { x0: cat.x - 95, x1: cat.x + 95, y0: cat.y - 125, y1: cat.y + 6 };
}
function overCat(p) { const b = catBox(); return b && p.x > b.x0 && p.x < b.x1 && p.y > b.y0 && p.y < b.y1; }
function updateCat(dt) {
  if (!cat) {
    catTimer -= dt;
    if (catTimer <= 0 && !drag) spawnCat();
    return;
  }
  cat.t += dt;
  if (cat.state === 'walk') {
    const prev = cat.x;
    cat.x += cat.dir * cat.speed * dt;
    if (cat.loafAt !== null && (prev - cat.loafAt) * (cat.x - cat.loafAt) <= 0) { cat.state = 'loaf'; cat.timer = 6; cat.loafAt = null; sfx.purr(); }
    let scattered = 0;
    for (const L of layers) {
      if (L.type !== 'item' || L.ink || cat.pushed.has(L) || L === (drag && drag.layer)) continue;
      if (Math.abs(L.x - cat.x) < 60 && L.y > cat.y - 120 && L.y < cat.y + 30) {
        cat.pushed.add(L);
        if (isPinned(L)) continue;
        L.vx = cat.dir * rr(160, 300); L.vy = rr(-90, 90); L.vr = rr(-2.2, 2.2);
        scattered++;
      }
    }
    if (scattered) { game.day.stats.scattered += scattered; sfx.pop(); }
    if (!cat.knocked && cupOnPage() && Math.abs(cup.x - cat.x) < 70 && Math.abs(cup.y - (cat.y - 40)) < 120) {
      cat.knocked = true;
      cupWobble = 0.6;
      const ringX = clamp(cup.x + cat.dir * rr(50, 90), SP.x + 40, SP.x + SP.w - 40), ringY = clamp(cup.y + rr(-40, 20), SP.y + 40, SP.y + SP.h - 40);
      layers.push({ type: 'decal', sprite: matchaRing(), x: ringX, y: ringY, rot: rr(0, TAU), scale: 1, blend: 'multiply' });
      toasts.add(`${CAT_NAME} knocked your matcha! A ring on the page…`, 2.4);
      sfx.thunk();
    }
    if (cat.x < SP.x - 200 || cat.x > SP.x + SP.w + 200) { cat = null; catTimer = rr(14, 22); }
  } else if (cat.state === 'loaf') {
    cat.timer -= dt;
    if (cat.timer <= 0) {
      layers.push({ type: 'decal', sprite: pawPrints(), x: cat.x + rr(-20, 20), y: cat.y - 30, rot: rr(-0.5, 0.5), scale: 1, blend: 'multiply' });
      game.day.stats.paws++;
      toasts.add(`${CAT_NAME} left paw prints ♥`, 2.4);
      cat.state = 'walk'; cat.speed = 150;
    }
  }
}
function catClick() {
  if (cat.state === 'loaf') {
    game.day.stats.pets++;
    sfx.purr();
    toasts.add(pick([`you pet ${CAT_NAME} ♥`, 'purrrr', `${CAT_NAME} approves`]), 1.6);
    cat.hearts = 1.2;
  } else {
    game.day.stats.shoos++;
    sfx.meow();
    toasts.add(pick(['mrrp!', 'zoom!', '*offended meow*']), 1.4);
  }
  cat.state = 'walk'; cat.speed = 420; cat.loafAt = null;
}

/* ---------- scene ---------- */

function setTool(tl) {
  tool = tool && tool.id === tl.id ? null : tl;
  syncToolButtons();
  sel = null;
  sfx.click();
}
function syncToolButtons() {
  buttons[2].primary = !!(tool && tool.id === 'write');
  buttons[4].primary = !!(tool && tool.id === 'cut');
}
function finish() {
  sel = null; tool = null;
  sfx.shutter();
  const M = 50, c = mk(SP.w + M * 2, SP.h + M * 2), x = c.getContext('2d');
  x.drawImage(getDesk(), SP.x - M, SP.y - M, c.width, c.height, 0, 0, c.width, c.height);
  x.save(); x.translate(M - SP.x, M - SP.y); drawDesk(x, true); x.restore();
  drawSpread(x, M, M, true);
  x.save(); x.translate(M - SP.x, M - SP.y); drawDesk(x, false); x.restore();
  game.go('keepsake', { image: c });
}

export const journal = {
  enter(arg) {
    t = 0;
    if (!shadow) shadow = buildShadow();
    if (arg && arg.fresh) {
      layers = []; undo = []; sel = null; drag = null; tool = null; tab = 0; glueFx = [];
      cup = { x: SP.x + 40, y: SP.y + SP.h - 50 };
      pageKind = 0; buildPages();
      tray = buildTray();
      scroll = tray.map(() => 0);
      cat = null; catTimer = 12; firstCat = true; hintShown = false;
      toasts.clear();
      toasts.add('Your junk box is full, make whatever you like!', 3.2);
      if (game.day.info && game.day.info.memory) {
        tab = 7;
        setTimeout(() => { if (game.sceneName === 'journal' && !game.day.memoryDone) toasts.add("The bag's polaroid is in the Memory tab. Tap it to step inside ✦", 4); }, 1200);
      }
    } else if (arg && arg.memoryDone) {
      game.day.memoryDone = true;
      if (!save.memories.includes(arg.memoryDone)) { save.memories.push(arg.memoryDone); writeSave(); }
      tray[7] = memoryCells();
      tab = 7; scroll[7] = 0;
      toasts.clear();
      toasts.add('Your keepsakes from the memory are in the tray', 2.6);
    } else if (!pages) buildPages();
    buttons = [
      new Button({ x: 384, y: 30, w: 86, h: 50, label: 'Undo', size: 17, onClick: doUndo }),
      new Button({ x: 478, y: 30, w: 160, h: 50, label: `Paper: ${PAGE_KINDS[pageKind]}`, size: 15, onClick: () => { pageKind = (pageKind + 1) % PAGE_KINDS.length; buildPages(); buttons[1].label = `Paper: ${PAGE_KINDS[pageKind]}`; sfx.click(); } }),
      new Button({ x: 646, y: 30, w: 130, h: 50, label: '✎ Write', size: 16, onClick: () => setTool({ id: 'write' }) }),
      new Button({ x: 1018, y: 30, w: 246, h: 50, label: 'Finish & keep ✓', primary: true, size: 19, onClick: finish }),
      new Button({ x: 784, y: 30, w: 130, h: 50, label: '✂ Scissors', size: 16, onClick: () => setTool({ id: 'cut' }) }),
    ];
  },

  update(dt) {
    t += dt;
    for (const L of layers) {
      if (!L.vx && !L.vy && !L.vr) continue;
      L.x += (L.vx || 0) * dt; L.y += (L.vy || 0) * dt; L.rot += (L.vr || 0) * dt;
      const f = Math.pow(0.015, dt);
      L.vx *= f; L.vy *= f; L.vr *= f;
      if (Math.abs(L.vx) < 2 && Math.abs(L.vy) < 2 && Math.abs(L.vr) < 0.02) { L.vx = L.vy = L.vr = 0; }
    }
    updateCat(dt);
    if (cat && cat.hearts) cat.hearts = Math.max(0, cat.hearts - dt);
    cupWobble = Math.max(0, cupWobble - dt);
    for (const g of glueFx) g.t += dt;
    glueFx = glueFx.filter((g) => g.t < 0.8);
    buttons[3].pulse = layers.length >= 6;
    toasts.update(dt);
  },

  draw(x) {
    x.drawImage(getDesk(), 0, 0);
    drawDesk(x, true);
    drawSpread(x, SP.x, SP.y, true);
    drawDesk(x, false);

    for (const g of glueFx) {
      x.save();
      x.globalAlpha = 1 - g.t / 0.8;
      x.strokeStyle = '#fffbe6'; x.lineWidth = 3;
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU, r0 = 10 + g.t * 50;
        x.beginPath(); x.moveTo(g.x + Math.cos(a) * r0, g.y + Math.sin(a) * r0); x.lineTo(g.x + Math.cos(a) * (r0 + 10), g.y + Math.sin(a) * (r0 + 10)); x.stroke();
      }
      x.restore();
    }

    if (drag && drag.mode === 'tape') {
      const len = Math.hypot(drag.x1 - drag.x0, drag.y1 - drag.y0);
      if (len > 8) {
        x.save();
        x.globalAlpha = 0.7;
        x.translate((drag.x0 + drag.x1) / 2, (drag.y0 + drag.y1) / 2);
        x.rotate(Math.atan2(drag.y1 - drag.y0, drag.x1 - drag.x0));
        if (!drag.preview || Math.abs(drag.preview.width - len) > 30) drag.preview = makeTapeStrip(drag.washi, len);
        x.drawImage(drag.preview, -len / 2, -17, len, 34);
        x.restore();
      }
    }

    if (drag && drag.mode === 'cut' && drag.pts.length > 1) {
      x.save();
      x.lineWidth = 2; x.strokeStyle = 'rgba(58,46,40,.8)'; x.setLineDash([7, 5]); x.lineDashOffset = -t * 30;
      x.beginPath(); drag.pts.forEach((q, i) => (i ? x.lineTo(q.x, q.y) : x.moveTo(q.x, q.y)));
      const a = drag.pts[0], b = drag.pts[drag.pts.length - 1];
      x.stroke();
      x.globalAlpha = 0.4; x.beginPath(); x.moveTo(b.x, b.y); x.lineTo(a.x, a.y); x.stroke();
      x.globalAlpha = 1; x.setLineDash([]);
      x.font = '26px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText('✂', b.x + 14, b.y - 14);
      x.restore();
    }
    if (sel && layers.includes(sel)) drawSelection(x, sel);
    if (drag && drag.mode === 'move') {
      const L = drag.layer;
      x.save(); x.translate(L.x + drag.ox * 0 + 6, L.y + 10); drawHand(x, { pose: 'pinch', s: 0.75 }); x.restore();
    } else if (drag && drag.mode === 'cut' && drag.pts.length) {
      const q = drag.pts[drag.pts.length - 1];
      x.save(); x.translate(q.x + 10, q.y + 18); drawHand(x, { pose: 'point', s: 0.6 }); x.restore();
    }

    if (cat) {
      x.save(); x.translate(cat.x, cat.y);
      drawCat(x, { pose: cat.state === 'loaf' ? 'loaf' : 'walk', t: cat.t, dir: cat.dir, s: 0.95 });
      x.restore();
      if (cat.hearts) {
        x.save(); x.fillStyle = '#e06c84'; x.font = `30px ${F.hand}`;
        for (let i = 0; i < 3; i++) { x.globalAlpha = cat.hearts / 1.2; x.fillText('♥', cat.x - 20 + i * 22, cat.y - 100 - (1.2 - cat.hearts) * 60 - i * 8); }
        x.restore();
      }
      if (cat.state === 'loaf') {
        x.save(); x.fillStyle = 'rgba(58,46,40,.75)'; x.font = `26px ${F.hand}`;
        for (let i = 0; i < 3; i++) { const k = (cat.t * 0.6 + i / 3) % 1; x.globalAlpha = Math.sin(k * Math.PI); x.fillText('z', cat.x + 44 * cat.dir + k * 24, cat.y - 70 - k * 50); }
        x.restore();
      }
    }

    drawTray(x);

    x.save();
    x.fillStyle = '#fdf7ea'; x.shadowColor = 'rgba(30,15,5,.5)'; x.shadowBlur = 6;
    x.font = `600 30px ${F.serif}`;
    x.fillText(game.day.n === 3 ? 'Day 3 · a thank-you' : `Day ${game.day.n} · journal`, 34, 56);
    x.font = `22px ${F.hand}`;
    const hint = !tool ? 'drag junk onto the page · lift the top piece before the one under it'
      : tool.id === 'write' ? 'tap the page where you want to write · tap Write to stop'
      : tool.id === 'cut' ? 'draw a loop around the part you want to cut out · tap Scissors to stop'
      : tool.id === 'tape' ? 'drag across the page to lay tape · tap the roll again to stop'
      : 'tap the page to stamp · tap the stamp again to stop';
    x.fillText(hint, 36, 86);
    x.restore();
    for (const b of buttons) b.draw(x, t);
    const ty = toasts.y; toasts.y = 772 - toasts.list.length * 56; toasts.draw(x, 1040); toasts.y = ty;
  },

  pointerdown(p) {
    for (const b of buttons) if (b.hit(p)) return b.onClick();
    if (cat && overCat(p)) return catClick();
    if (!tool && Math.hypot(p.x - cup.x, p.y - cup.y) < 60) { cupDrag = { ox: p.x - cup.x, oy: p.y - cup.y }; sel = null; return; }
    const tl = toolAt(p);
    if (tl) return applyTool(tl);

    const ti = tabAt(p);
    if (ti >= 0) { tab = ti; if (tool && tool.kind) { tool = null; syncToolButtons(); } sfx.page(); return; }
    if (inRect(p, ARROWS.up)) { scroll[tab] = clamp(scroll[tab] - 220, 0, maxScroll()); return sfx.click(); }
    if (inRect(p, ARROWS.down)) { scroll[tab] = clamp(scroll[tab] + 220, 0, maxScroll()); return sfx.click(); }
    if (inRect(p, TRAY)) {
      const ci = trayCellAt(p);
      if (ci < 0) return;
      const cell = tray[tab][ci];
      if (cell.kind === 'upload') return askPhoto();
      if (cell.kind === 'note') return askNote();
      if (cell.kind === 'memory') { sfx.paper(); return game.go('memory', { memory: cell.memory }); }
      if (cell.kind === 'item') {
        snapshot();
        const L = { type: 'item', sprite: cell.sprite, x: p.x, y: p.y, rot: rr(-0.12, 0.12), scale: 1, flip: 1 };
        layers.push(L); sel = L;
        drag = { mode: 'move', layer: L, ox: 0, oy: 0, fromTray: true };
        sfx.pop();
      } else {
        const id = cell.kind + ':' + ci;
        tool = tool && tool.id === id ? null : { id, kind: cell.kind, cell };
        if (tool) tool.id = id;
        syncToolButtons();
        sel = null;
        sfx.click();
      }
      return;
    }

    if (sel && layers.includes(sel)) {
      const h = rotHandle(sel);
      if (Math.hypot(p.x - h.x, p.y - h.y) < 18) {
        if (sel.glued || (sel.type !== 'tape' && isPinned(sel))) { toasts.add("It's stuck down"); return sfx.bad(); }
        snapshot();
        const a = Math.atan2(p.y - sel.y, p.x - sel.x), d = Math.hypot(p.x - sel.x, p.y - sel.y);
        drag = { mode: 'rot', layer: sel, a0: a - sel.rot, d0: d / sel.scale };
        return;
      }
    }

    if (tool && tool.id === 'cut') {
      if (!inSpread(p, 30)) return;
      drag = { mode: 'cut', pts: [{ x: p.x, y: p.y }] };
      sel = null;
      return;
    }
    if (tool && tool.id === 'write') {
      if (inSpread(p, 0)) askWrite(p);
      return;
    }
    if (false) {
      const L = hitLayer(p);
      if (!L || L.type === 'decal') return;
      if (L.glued) { toasts.add('Already glued', 1.2); return; }
      snapshot();
      L.glued = true; L.vx = L.vy = L.vr = 0;
      glueFx.push({ x: p.x, y: p.y, t: 0 });
      sfx.thunk();
      toasts.add('glued!', 1.0);
      return;
    }
    if (tool && inSpread(p, 20)) {
      if (tool.kind === 'tape') { drag = { mode: 'tape', washi: tool.cell.washi, x0: p.x, y0: p.y, x1: p.x, y1: p.y }; return; }
      snapshot();
      layers.push({ type: 'decal', sprite: tool.cell.make(), x: p.x, y: p.y, rot: rr(-0.25, 0.25), scale: 1, blend: 'multiply' });
      sfx.thunk();
      return;
    }

    const L = hitLayer(p);
    if (!L) { sel = null; return; }
    sel = L;
    if (L.type === 'decal') return;
    if (L.type !== 'tape') {
      const why = isPinned(L);
      if (why) { toasts.add(why === 'glue' ? "That one's glued down" : `It's held under the ${why}, peel that first`, 1.8); return sfx.bad(); }
      const top = coveredBy(L);
      if (top) { toasts.add('Something is lying on top, lift that first', 1.8); sel = top; return sfx.bad(); }
    }
    snapshot();
    layers.splice(layers.indexOf(L), 1); layers.push(L);
    L.vx = L.vy = L.vr = 0;
    drag = { mode: 'move', layer: L, ox: p.x - L.x, oy: p.y - L.y };
    sfx.pop();
  },

  pointermove(p) {
    if (cupDrag) { cup.x = clamp(p.x - cupDrag.ox, 40, 990); cup.y = clamp(p.y - cupDrag.oy, 110, 770); game.cursor = 'grabbing'; return; }
    if (drag) {
      const L = drag.layer;
      if (drag.mode === 'move') { L.x = p.x - drag.ox; L.y = p.y - drag.oy; }
      else if (drag.mode === 'rot') {
        L.rot = Math.atan2(p.y - L.y, p.x - L.x) - drag.a0;
        L.scale = clamp(Math.hypot(p.x - L.x, p.y - L.y) / drag.d0, 0.35, 2.4);
      } else if (drag.mode === 'cut') {
        const last = drag.pts[drag.pts.length - 1];
        if (Math.hypot(p.x - last.x, p.y - last.y) > 4) {
          drag.pts.push({ x: p.x, y: p.y });
          drag.snip = (drag.snip || 0) + 1;
          if (drag.snip % 5 === 0) sfx.snip();
        }
      } else if (drag.mode === 'tape') {
        let dx = p.x - drag.x0, dy = p.y - drag.y0;
        const len = Math.hypot(dx, dy);
        if (len > 420) { dx *= 420 / len; dy *= 420 / len; }
        drag.x1 = drag.x0 + dx; drag.y1 = drag.y0 + dy;
      }
      game.cursor = drag.mode === 'tape' || drag.mode === 'cut' ? 'crosshair' : 'grabbing';
      return;
    }
    let cur = 'default';
    if (!tool && Math.hypot(p.x - cup.x, p.y - cup.y) < 60) { game.cursor = 'grab'; for (const b of buttons) b.hover = false; return; }
    if (buttons.some((b) => b.hit(p)) || toolAt(p) || (cat && overCat(p)) || tabAt(p) >= 0 || inRect(p, ARROWS.up) || inRect(p, ARROWS.down) || trayCellAt(p) >= 0 && p.x > TRAY.x) cur = 'pointer';
    else if (tool && inSpread(p, 20)) cur = tool.id === 'write' ? 'text' : 'crosshair';
    else if (sel && layers.includes(sel) && Math.hypot(p.x - rotHandle(sel).x, p.y - rotHandle(sel).y) < 18) cur = 'pointer';
    else if (hitLayer(p)) cur = 'grab';
    for (const b of buttons) b.hover = b.hit(p);
    game.cursor = cur;
  },

  pointerup() {
    if (cupDrag) { cupDrag = null; sfx.thunk(); if (cupOnPage()) toasts.add(`Careful, ${CAT_NAME} loves knocking that cup`, 2); return; }
    if (!drag) return;
    if (drag.mode === 'move') {
      const L = drag.layer;
      if (!inSpread(L, 40)) {
        layers.splice(layers.indexOf(L), 1);
        if (sel === L) sel = null;
        if (drag.fromTray) undo.pop(); else toasts.add('tossed', 1.1);
      } else if (drag.fromTray && !hintShown && layers.filter((l) => l.type === 'item').length >= 2) {
        hintShown = true;
        toasts.add(`Tip: tape things down before ${CAT_NAME} visits`, 3);
      }
    } else if (drag.mode === 'cut') {
      finishCut(drag.pts);
    } else if (drag.mode === 'tape') {
      const len = Math.hypot(drag.x1 - drag.x0, drag.y1 - drag.y0);
      if (len > 24) {
        snapshot();
        layers.push({ type: 'tape', sprite: makeTapeStrip(drag.washi, len), x: (drag.x0 + drag.x1) / 2, y: (drag.y0 + drag.y1) / 2, rot: Math.atan2(drag.y1 - drag.y0, drag.x1 - drag.x0), scale: 1, flip: 1 });
        sfx.rip();
      }
    }
    drag = null;
  },

  wheel(e, p) {
    if (inRect(p, TRAY)) { scroll[tab] = clamp(scroll[tab] + e.deltaY, 0, maxScroll()); e.preventDefault(); return; }
    if (sel && layers.includes(sel) && !sel.glued) { sel.rot += Math.sign(e.deltaY) * 0.06; e.preventDefault(); }
  },

  keydown(e) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); return doUndo(); }
    if (e.key === 'Escape') { tool = null; sel = null; drag = null; syncToolButtons(); return; }
    if (!sel || !layers.includes(sel)) return;
    const map = { q: 'ccw', e: 'cw', '-': 'small', '=': 'big', '+': 'big', f: 'flip', d: 'dup', Delete: 'del', Backspace: 'del' };
    const id = map[e.key] || map[e.key.toLowerCase()];
    if (id) { e.preventDefault(); applyTool(TOOLS.find((tl) => tl.id === id)); }
  },
};

function drawSelection(x, L) {
  const w = L.sprite.width, h = L.sprite.height;
  x.save();
  x.translate(L.x, L.y); x.rotate(L.rot); x.scale(L.scale, L.scale);
  x.setLineDash([6 / L.scale, 5 / L.scale]);
  x.strokeStyle = L.glued ? 'rgba(200,150,40,.8)' : 'rgba(58,46,40,.6)'; x.lineWidth = 1.5 / L.scale;
  x.strokeRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
  x.restore();
  if (drag) return;
  if (!L.glued && L.type !== 'decal') {
    const q = rotHandle(L);
    x.save();
    x.fillStyle = 'rgba(30,15,5,.25)'; x.beginPath(); x.arc(q.x + 1, q.y + 2, 15, 0, TAU); x.fill();
    x.fillStyle = '#7f9c5b'; x.beginPath(); x.arc(q.x, q.y, 15, 0, TAU); x.fill();
    x.fillStyle = '#fffdf5'; x.font = `600 17px ${F.serif}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('↻', q.x, q.y + 1);
    x.restore();
  }
  const r = toolbarRect();
  if (!r) return;
  x.save();
  x.fillStyle = 'rgba(30,15,5,.3)'; x.beginPath(); x.roundRect(r.x + 2, r.y + 4, r.w, r.h, 12); x.fill();
  x.fillStyle = '#fbf6ea'; x.beginPath(); x.roundRect(r.x, r.y, r.w, r.h, 12); x.fill();
  x.strokeStyle = 'rgba(58,46,40,.25)'; x.lineWidth = 1; x.stroke();
  TOOLS.forEach((tl, i) => {
    const cx = r.x + 4 + i * 38 + 19, cy = r.y + r.h / 2;
    x.fillStyle = tl.id === 'del' ? '#c0574b' : INK;
    x.font = `600 20px ${F.serif}, 'Apple Symbols', sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(tl.glyph, cx, cy + 1);
  });
  if (L.glued) {
    x.fillStyle = 'rgba(160,110,20,.9)'; x.font = `18px ${F.hand}`; x.textAlign = 'left';
    x.fillText('glued', r.x + r.w + 8, r.y + r.h / 2 + 5);
  }
  x.restore();
}

function drawTray(x) {
  x.save();
  x.fillStyle = 'rgba(30,15,5,.35)'; x.beginPath(); x.roundRect(TRAY.x + 4, TRAY.y + 8, TRAY.w, TRAY.h, 14); x.fill();
  x.fillStyle = '#efe6d3'; x.beginPath(); x.roundRect(TRAY.x, TRAY.y, TRAY.w, TRAY.h, 14); x.fill();
  TABS.forEach((name, i) => {
    const tx = TRAY.x + (i % 4) * TAB_W, ty = TRAY.y + 4 + Math.floor(i / 4) * TAB_H;
    x.fillStyle = i === tab ? '#fbf6ea' : 'rgba(0,0,0,.06)';
    x.beginPath(); x.roundRect(tx + 3, ty + 2, TAB_W - 6, TAB_H - 4, 8); x.fill();
    x.fillStyle = INK; x.font = `${i === tab ? 600 : 400} 13px ${F.serif}`; x.textAlign = 'center';
    x.fillText(name, tx + TAB_W / 2, ty + 20);
  });
  x.save();
  x.beginPath(); x.rect(TRAY.x, LIST.top - 4, TRAY.w, LIST.bottom - LIST.top + 4); x.clip();
  const items = tray[tab];
  items.forEach((cell, i) => {
    const r = cellRect(i);
    if (r.y + r.h < LIST.top - 4 || r.y > LIST.bottom) return;
    const active = tool && tool.cell === cell;
    x.fillStyle = active ? '#e3edd0' : '#fbf6ea';
    x.beginPath(); x.roundRect(r.x, r.y, r.w, r.h, 10); x.fill();
    if (active) { x.strokeStyle = '#7f9c5b'; x.lineWidth = 3; x.stroke(); }
    x.drawImage(cell.thumb, r.x + (r.w - cell.thumb.width) / 2, r.y + 6);
    x.fillStyle = 'rgba(58,46,40,.8)'; x.font = `18px ${F.hand}`; x.textAlign = 'center';
    x.fillText(cell.label, r.x + r.w / 2, r.y + r.h - 9);
  });
  if (!items.length) {
    x.fillStyle = 'rgba(58,46,40,.7)'; x.font = `22px ${F.hand}`; x.textAlign = 'center';
    x.fillText('nothing here yet', TRAY.x + TRAY.w / 2, LIST.top + 60);
  }
  x.restore();
  const ms = maxScroll();
  for (const [key, r, glyph, on] of [['up', ARROWS.up, '▲', scroll[tab] > 0], ['down', ARROWS.down, '▼', scroll[tab] < ms]]) {
    x.globalAlpha = on ? 1 : 0.35;
    x.fillStyle = '#fbf6ea'; x.beginPath(); x.roundRect(r.x, r.y, r.w, r.h, 9); x.fill();
    x.fillStyle = INK; x.font = `14px ${F.serif}`; x.textAlign = 'center'; x.fillText(glyph, r.x + r.w / 2, r.y + 21);
    x.globalAlpha = 1;
  }
  if (ms > 0) {
    const trackH = LIST.bottom - LIST.top, barH = Math.max(30, trackH * (trackH / (trackH + ms)));
    const by = LIST.top + (trackH - barH) * (scroll[tab] / ms);
    x.fillStyle = 'rgba(58,46,40,.25)'; x.beginPath(); x.roundRect(TRAY.x + TRAY.w - 6, by, 4, barH, 2); x.fill();
  }
  x.restore();
}
