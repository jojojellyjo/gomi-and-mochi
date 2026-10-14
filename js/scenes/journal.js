import { game } from '../state.js';
import { Button, F, INK, toasts } from '../ui.js';
import { getDesk } from '../bg.js';
import { drawCat, CAT_NAME } from '../cat.js';
import { FLOWERS } from '../flowers.js';
import { mk, rr, pick, shuffle, clamp, TAU, pageTex, PAGE_KINDS } from '../textures.js';
import { SCRAPS, WASHI, STAMPS, washiThumb, makeTapeStrip, pawPrints } from '../ephemera.js';
import { photoScraps } from '../photos.js';
import { sfx } from '../sfx.js';

export const SP = { x: 40, y: 104, w: 960, h: 640 };
const PW = SP.w / 2;
const TRAY = { x: 1018, y: 104, w: 246, h: 640 };
const TABS = ['Flowers', 'Scraps', 'Tape', 'Stamps'];
const CELL = { w: 113, h: 104, gap: 6, top: 46 };

let layers = [], undo = [], sel = null, drag = null, tool = null, tab = 0, tray = null;
let pageKind = 0, pages = null, buttons = [], t = 0, cat = null, catTimer = 0, firstCat = true, hover = null;
let shadow = null, hintShown = false;

/* ---------- sprites & hit tests ---------- */

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
  return { x: (dx * c - dy * s) / L.scale + L.sprite.width / 2, y: (dx * s + dy * c) / L.scale + L.sprite.height / 2 };
}
function toWorld(L, lx, ly) {
  const dx = (lx - L.sprite.width / 2) * L.scale, dy = (ly - L.sprite.height / 2) * L.scale;
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
function handles(L) {
  const w = L.sprite.width, h = L.sprite.height;
  return {
    rot: toWorld(L, w - 6, 6),
    del: toWorld(L, 6, 6),
    back: toWorld(L, 6, h - 6),
  };
}
function isAnchored(L) {
  const i = layers.indexOf(L);
  for (let j = i + 1; j < layers.length; j++) {
    const T = layers[j];
    if (T.type !== 'tape') continue;
    const w = T.sprite.width, h = T.sprite.height;
    for (let lx = 6; lx < w - 6; lx += 8) for (const ly of [h * 0.25, h * 0.5, h * 0.75]) {
      if (inLayer(L, toWorld(T, lx, ly), 40)) return true;
    }
  }
  return false;
}
function inSpread(p, m = 0) { return p.x > SP.x - m && p.x < SP.x + SP.w + m && p.y > SP.y - m && p.y < SP.y + SP.h + m; }

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
function buildTray() {
  const flowers = game.day.pressed.map((p) => ({ label: `${FLOWERS[p.type].name}`, thumb: fit(p.sprite, 92, 70), make: () => p.sprite, kind: 'item' }));
  const photos = photoScraps();
  const drawn = shuffle([...SCRAPS]).slice(0, Math.max(6, 10 - Math.min(4, photos.length)));
  const pocket = shuffle([...drawn.map((s) => ({ label: s.label, src: s })), ...shuffle([...photos]).slice(0, 4).map((p) => ({ label: p.label, sprite: p.sprite }))]).slice(0, 10);
  const scraps = pocket.map((s) => {
    const sample = s.sprite || s.src.make();
    return { label: s.label, thumb: fit(sample, 92, 70), make: s.sprite ? () => s.sprite : (() => { let first = sample; return () => { const r = first || s.src.make(); first = null; return r; }; })(), kind: 'item' };
  });
  const tape = WASHI.map((w) => ({ label: w.label, thumb: washiThumb(w), washi: w, kind: 'tape' }));
  const stamps = STAMPS.map((s) => ({ label: s.label, thumb: fit(s.make(), 92, 70), make: s.make, kind: 'stamp' }));
  return [flowers, scraps, tape, stamps];
}
function cellRect(i) {
  const col = i % 2, row = Math.floor(i / 2);
  return { x: TRAY.x + 8 + col * (CELL.w + CELL.gap), y: TRAY.y + CELL.top + row * (CELL.h + CELL.gap), w: CELL.w, h: CELL.h };
}
function trayCellAt(p) {
  const items = tray[tab];
  for (let i = 0; i < items.length; i++) {
    const r = cellRect(i);
    if (p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h) return i;
  }
  return -1;
}
function tabAt(p) {
  if (p.y < TRAY.y || p.y > TRAY.y + 38 || p.x < TRAY.x || p.x > TRAY.x + TRAY.w) return -1;
  return Math.floor((p.x - TRAY.x) / (TRAY.w / TABS.length));
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

// Draws pages + every layer with the spread's top-left at (ox, oy).
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
  x.scale(L.scale, L.scale);
  if (L.blend) x.globalCompositeOperation = L.blend;
  x.drawImage(L.sprite, -L.sprite.width / 2, -L.sprite.height / 2);
  x.restore();
}

/* ---------- the cat ---------- */

function spawnCat() {
  const dir = Math.random() < 0.5 ? 1 : -1;
  cat = {
    dir, x: dir > 0 ? SP.x - 140 : SP.x + SP.w + 140, y: rr(SP.y + 220, SP.y + SP.h - 30),
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
function overCat(p) {
  const b = catBox();
  return b && p.x > b.x0 && p.x < b.x1 && p.y > b.y0 && p.y < b.y1;
}
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
    if (cat.loafAt !== null && (prev - cat.loafAt) * (cat.x - cat.loafAt) <= 0) {
      cat.state = 'loaf'; cat.timer = 6; cat.loafAt = null; sfx.purr();
    }
    let scattered = 0;
    for (const L of layers) {
      if (L.type !== 'item' || cat.pushed.has(L)) continue;
      if (Math.abs(L.x - cat.x) < 60 && L.y > cat.y - 120 && L.y < cat.y + 30) {
        cat.pushed.add(L);
        if (isAnchored(L)) continue;
        L.vx = cat.dir * rr(160, 300); L.vy = rr(-90, 90); L.vr = rr(-2.2, 2.2);
        scattered++;
      }
    }
    if (scattered) { game.day.stats.scattered += scattered; sfx.pop(); }
    if (cat.x < SP.x - 200 || cat.x > SP.x + SP.w + 200) { cat = null; catTimer = rr(14, 22); }
  } else if (cat.state === 'loaf') {
    cat.timer -= dt;
    if (cat.timer <= 0) {
      const pp = pawPrints();
      layers.push({ type: 'decal', sprite: pp, x: cat.x + rr(-20, 20), y: cat.y - 30, rot: rr(-0.5, 0.5), scale: 1, blend: 'multiply' });
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
  cat.state = 'walk';
  cat.speed = 420;
  cat.loafAt = null;
}

/* ---------- scene ---------- */

function finish() {
  sel = null; tool = null;
  sfx.shutter();
  const M = 50, c = mk(SP.w + M * 2, SP.h + M * 2), x = c.getContext('2d');
  x.drawImage(getDesk(), SP.x - M, SP.y - M, c.width, c.height, 0, 0, c.width, c.height);
  drawSpread(x, M, M, true);
  game.go('keepsake', { image: c });
}

export const journal = {
  enter(arg) {
    t = 0;
    if (!shadow) shadow = buildShadow();
    if (arg && arg.fresh) {
      layers = []; undo = []; sel = null; drag = null; tool = null; tab = 0;
      pageKind = 0; buildPages();
      tray = buildTray();
      cat = null; catTimer = 9; firstCat = true; hintShown = false;
      toasts.clear();
      toasts.add('Drag your flowers and scraps onto the page', 3.2);
    } else if (!pages) buildPages();
    buttons = [
      new Button({ x: 610, y: 30, w: 100, h: 50, label: 'Undo', size: 18, onClick: doUndo }),
      new Button({ x: 720, y: 30, w: 170, h: 50, label: `Paper: ${PAGE_KINDS[pageKind]}`, size: 17, onClick: () => { pageKind = (pageKind + 1) % PAGE_KINDS.length; buildPages(); buttons[1].label = `Paper: ${PAGE_KINDS[pageKind]}`; sfx.click(); } }),
      new Button({ x: 1018, y: 30, w: 246, h: 50, label: 'Finish & keep ✓', primary: true, size: 19, onClick: finish }),
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
    buttons[2].pulse = layers.length >= 6;
    toasts.update(dt);
  },

  draw(x) {
    x.drawImage(getDesk(), 0, 0);
    drawSpread(x, SP.x, SP.y, true);

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

    if (sel && layers.includes(sel)) drawSelection(x, sel);

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
    x.font = `600 32px ${F.serif}`;
    x.fillText(`Day ${game.day.n} · the journal`, 34, 58);
    x.font = `24px ${F.hand}`;
    const hint = tool ? (tool.kind === 'tape' ? 'drag across the page to lay tape · tap the roll again to stop' : 'tap the page to stamp · tap the stamp again to stop')
      : 'drag to move · corner handle to spin & size · Q/E rotate';
    x.fillText(hint, 36, 88);
    x.restore();
    for (const b of buttons) b.draw(x, t);
    toasts.draw(x, 1280);
  },

  pointerdown(p) {
    for (const b of buttons) if (b.hit(p)) return b.onClick();
    if (cat && overCat(p)) return catClick();

    const ti = tabAt(p);
    if (ti >= 0) { tab = ti; if (tab < 2) tool = null; sfx.click(); return; }
    if (p.x > TRAY.x && p.x < TRAY.x + TRAY.w && p.y > TRAY.y && p.y < TRAY.y + TRAY.h) {
      const ci = trayCellAt(p);
      if (ci < 0) return;
      const cell = tray[tab][ci];
      if (cell.kind === 'item') {
        snapshot();
        const sprite = cell.make();
        const L = { type: 'item', sprite, x: p.x, y: p.y, rot: rr(-0.12, 0.12), scale: 1 };
        layers.push(L); sel = L;
        drag = { mode: 'move', layer: L, ox: 0, oy: 0, fromTray: true };
        sfx.pop();
      } else {
        tool = tool && tool.cell === cell ? null : { kind: cell.kind, cell };
        sel = null;
        sfx.click();
      }
      return;
    }

    if (sel && layers.includes(sel)) {
      const h = handles(sel);
      if (Math.hypot(p.x - h.rot.x, p.y - h.rot.y) < 18) {
        snapshot();
        const a = Math.atan2(p.y - sel.y, p.x - sel.x), d = Math.hypot(p.x - sel.x, p.y - sel.y);
        drag = { mode: 'rot', layer: sel, a0: a - sel.rot, d0: d / sel.scale };
        return;
      }
      if (Math.hypot(p.x - h.del.x, p.y - h.del.y) < 18) { snapshot(); layers.splice(layers.indexOf(sel), 1); sel = null; sfx.rip(); return; }
      if (Math.hypot(p.x - h.back.x, p.y - h.back.y) < 18) { snapshot(); layers.splice(layers.indexOf(sel), 1); layers.unshift(sel); sfx.click(); toasts.add('sent to the back', 1.2); return; }
    }

    if (tool && inSpread(p, 20)) {
      if (tool.kind === 'tape') { drag = { mode: 'tape', washi: tool.cell.washi, x0: p.x, y0: p.y, x1: p.x, y1: p.y }; return; }
      snapshot();
      const sprite = tool.cell.make();
      layers.push({ type: 'decal', sprite, x: p.x, y: p.y, rot: rr(-0.25, 0.25), scale: 1, blend: 'multiply' });
      sfx.thunk();
      return;
    }

    const L = hitLayer(p);
    if (L) {
      snapshot();
      sel = L;
      layers.splice(layers.indexOf(L), 1); layers.push(L);
      L.vx = L.vy = L.vr = 0;
      drag = { mode: 'move', layer: L, ox: p.x - L.x, oy: p.y - L.y };
      sfx.pop();
    } else sel = null;
  },

  pointermove(p) {
    if (drag) {
      const L = drag.layer;
      if (drag.mode === 'move') { L.x = p.x - drag.ox; L.y = p.y - drag.oy; }
      else if (drag.mode === 'rot') {
        L.rot = Math.atan2(p.y - L.y, p.x - L.x) - drag.a0;
        L.scale = clamp(Math.hypot(p.x - L.x, p.y - L.y) / drag.d0, 0.35, 2.4);
      } else if (drag.mode === 'tape') {
        let dx = p.x - drag.x0, dy = p.y - drag.y0;
        const len = Math.hypot(dx, dy);
        if (len > 420) { dx *= 420 / len; dy *= 420 / len; }
        drag.x1 = drag.x0 + dx; drag.y1 = drag.y0 + dy;
      }
      game.cursor = drag.mode === 'tape' ? 'crosshair' : 'grabbing';
      return;
    }
    let cur = 'default';
    if (buttons.some((b) => b.hit(p))) cur = 'pointer';
    else if (cat && overCat(p)) cur = 'pointer';
    else if (tabAt(p) >= 0 || trayCellAt(p) >= 0 && p.x > TRAY.x) cur = 'pointer';
    else if (tool && inSpread(p, 20)) cur = 'crosshair';
    else if (sel && layers.includes(sel)) {
      const h = handles(sel);
      if ([h.rot, h.del, h.back].some((q) => Math.hypot(p.x - q.x, p.y - q.y) < 18)) cur = 'pointer';
      else if (hitLayer(p)) cur = 'grab';
    } else if (hitLayer(p)) cur = 'grab';
    for (const b of buttons) b.hover = b.hit(p);
    game.cursor = cur;
  },

  pointerup(p) {
    if (!drag) return;
    if (drag.mode === 'move') {
      const L = drag.layer;
      if (!inSpread(L, 40)) {
        layers.splice(layers.indexOf(L), 1);
        if (sel === L) sel = null;
        if (drag.fromTray) undo.pop(); else toasts.add('tossed', 1.1);
      } else if (drag.fromTray && !hintShown && layers.filter((l) => l.type === 'item').length >= 2) {
        hintShown = true;
        toasts.add('Tip: pick a washi roll in Tape to stick things down', 3);
      }
    } else if (drag.mode === 'tape') {
      const len = Math.hypot(drag.x1 - drag.x0, drag.y1 - drag.y0);
      if (len > 24) {
        snapshot();
        layers.push({ type: 'tape', sprite: makeTapeStrip(drag.washi, len), x: (drag.x0 + drag.x1) / 2, y: (drag.y0 + drag.y1) / 2, rot: Math.atan2(drag.y1 - drag.y0, drag.x1 - drag.x0), scale: 1 });
        sfx.rip();
      }
    }
    drag = null;
  },

  wheel(e, p) {
    if (sel && layers.includes(sel)) { sel.rot += Math.sign(e.deltaY) * 0.06; e.preventDefault(); }
  },

  keydown(e) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); return doUndo(); }
    if (e.key === 'Escape') { tool = null; sel = null; return; }
    if (!sel || !layers.includes(sel)) return;
    if (e.key === 'q' || e.key === 'Q') sel.rot -= 0.08;
    else if (e.key === 'e' || e.key === 'E') sel.rot += 0.08;
    else if (e.key === 'Delete' || e.key === 'Backspace') { snapshot(); layers.splice(layers.indexOf(sel), 1); sel = null; sfx.rip(); }
    else if (e.key === '[') { snapshot(); layers.splice(layers.indexOf(sel), 1); layers.unshift(sel); }
    else if (e.key === ']') { snapshot(); layers.splice(layers.indexOf(sel), 1); layers.push(sel); }
  },
};

function drawSelection(x, L) {
  const w = L.sprite.width, h = L.sprite.height;
  x.save();
  x.translate(L.x, L.y); x.rotate(L.rot); x.scale(L.scale, L.scale);
  x.setLineDash([6 / L.scale, 5 / L.scale]);
  x.strokeStyle = 'rgba(58,46,40,.6)'; x.lineWidth = 1.5 / L.scale;
  x.strokeRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
  x.restore();
  const hd = handles(L);
  const dot = (q, col, glyph) => {
    x.save();
    x.fillStyle = 'rgba(30,15,5,.25)'; x.beginPath(); x.arc(q.x + 1, q.y + 2, 15, 0, TAU); x.fill();
    x.fillStyle = col; x.beginPath(); x.arc(q.x, q.y, 15, 0, TAU); x.fill();
    x.fillStyle = '#fffdf5'; x.font = `600 17px ${F.serif}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(glyph, q.x, q.y + 1);
    x.restore();
  };
  dot(hd.rot, '#7f9c5b', '↻');
  dot(hd.del, '#c0574b', '×');
  dot(hd.back, '#8a7a6a', '↓');
}

function drawTray(x) {
  x.save();
  x.fillStyle = 'rgba(30,15,5,.35)'; x.beginPath(); x.roundRect(TRAY.x + 4, TRAY.y + 8, TRAY.w, TRAY.h, 14); x.fill();
  x.fillStyle = '#efe6d3'; x.beginPath(); x.roundRect(TRAY.x, TRAY.y, TRAY.w, TRAY.h, 14); x.fill();
  const tw = TRAY.w / TABS.length;
  TABS.forEach((name, i) => {
    x.fillStyle = i === tab ? '#fbf6ea' : 'rgba(0,0,0,.06)';
    x.beginPath(); x.roundRect(TRAY.x + i * tw + 3, TRAY.y + 4, tw - 6, 34, 9); x.fill();
    x.fillStyle = INK; x.font = `${i === tab ? 600 : 400} 15px ${F.serif}`; x.textAlign = 'center';
    x.fillText(name, TRAY.x + i * tw + tw / 2, TRAY.y + 26);
  });
  const items = tray[tab];
  items.forEach((cell, i) => {
    const r = cellRect(i);
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
    x.fillText('nothing here yet', TRAY.x + TRAY.w / 2, TRAY.y + 120);
  }
  x.restore();
}
