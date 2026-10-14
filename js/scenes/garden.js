import { game } from '../state.js';
import { Button, F, INK, toasts } from '../ui.js';
import { drawCat, CAT_NAME } from '../cat.js';
import { FLOWERS, FLOWER_TYPES, flowerSprite } from '../flowers.js';
import { mk, rr, pick, shuffle, lerp, TAU, grain, tint } from '../textures.js';
import { sfx } from '../sfx.js';

const BEDS = [{ x: 80, w: 340 }, { x: 470, w: 340 }, { x: 860, w: 340 }];
const BED_Y = 560, BED_H = 74, LAWN_Y = 765, MAX = 4;

let flowers, cat, btn, t, flying, butterflies, bgCache = null, frontCache = null;
const heads = {}, squashed = {}, spikes = {};

function head(type) {
  if (!heads[type]) heads[type] = flowerSprite(type, 26);
  return heads[type];
}
function squashedHead(type) {
  if (!squashed[type]) {
    const s = head(type), c = mk(s.width, s.height);
    c.getContext('2d').drawImage(s, 0, 0);
    tint(c, (r, g, b) => [r * 0.55 + 40, g * 0.45 + 25, b * 0.35 + 10]);
    squashed[type] = c;
  }
  return squashed[type];
}
function spike(type) {
  if (!spikes[type]) spikes[type] = flowerSprite(type, 40);
  return spikes[type];
}

function buildBg() {
  const c = mk(1280, 800), x = c.getContext('2d');
  const sky = x.createLinearGradient(0, 0, 0, BED_Y);
  sky.addColorStop(0, '#f6e6cf'); sky.addColorStop(1, '#e8f0da');
  x.fillStyle = sky; x.fillRect(0, 0, 1280, 800);
  const sun = x.createRadialGradient(1090, 140, 10, 1090, 140, 220);
  sun.addColorStop(0, 'rgba(255,244,200,.95)'); sun.addColorStop(0.25, 'rgba(255,236,180,.5)'); sun.addColorStop(1, 'rgba(255,236,180,0)');
  x.fillStyle = sun; x.fillRect(0, 0, 1280, 500);
  x.fillStyle = '#cddcb2';
  x.beginPath(); x.moveTo(0, 420);
  for (let px = 0; px <= 1280; px += 20) x.lineTo(px, 400 + Math.sin(px / 170) * 26 + Math.sin(px / 60) * 6);
  x.lineTo(1280, 800); x.lineTo(0, 800); x.fill();
  x.fillStyle = '#a3bc88';
  for (let px = -30; px < 1320; px += 56) { x.beginPath(); x.arc(px, 470 + Math.sin(px) * 6, 44, Math.PI, 0); x.fill(); }
  x.fillRect(0, 468, 1280, 30);
  // picket fence
  for (let px = 10; px < 1280; px += 40) {
    x.fillStyle = '#f3ebdc';
    x.beginPath(); x.moveTo(px, 520); x.lineTo(px, 448); x.lineTo(px + 11, 438); x.lineTo(px + 22, 448); x.lineTo(px + 22, 520); x.fill();
    x.fillStyle = 'rgba(120,100,70,.15)'; x.fillRect(px + 17, 448, 5, 72);
  }
  x.fillStyle = '#ede3d0'; x.fillRect(0, 470, 1280, 9); x.fillRect(0, 500, 1280, 9);
  const g = x.createLinearGradient(0, 510, 0, 800);
  g.addColorStop(0, '#b9cf8e'); g.addColorStop(1, '#93ad6b');
  x.fillStyle = g; x.fillRect(0, 512, 1280, 300);
  for (let i = 0; i < 1400; i++) {
    const px = rr(0, 1280), py = rr(515, 800);
    x.strokeStyle = `rgba(${Math.random() < 0.5 ? '80,110,50' : '210,230,170'},${rr(0.2, 0.5)})`;
    x.lineWidth = 1.2;
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + rr(-3, 3), py - rr(4, 10)); x.stroke();
  }
  for (const b of BEDS) {
    x.fillStyle = '#6b4a33';
    x.beginPath(); x.roundRect(b.x - 6, BED_Y - 10, b.w + 12, 24, 10); x.fill();
    x.fillStyle = 'rgba(40,25,15,.35)';
    for (let i = 0; i < 60; i++) { x.beginPath(); x.arc(rr(b.x, b.x + b.w), rr(BED_Y - 6, BED_Y + 8), rr(1, 2.5), 0, TAU); x.fill(); }
  }
  return grain(c, 8);
}
function buildFront() {
  const c = mk(1280, 800), x = c.getContext('2d');
  for (const b of BEDS) {
    x.fillStyle = 'rgba(40,30,15,.25)';
    x.beginPath(); x.ellipse(b.x + b.w / 2, BED_Y + BED_H + 4, b.w / 2 + 14, 10, 0, 0, TAU); x.fill();
    x.fillStyle = '#9a6b44'; x.fillRect(b.x - 8, BED_Y + 4, b.w + 16, BED_H);
    x.fillStyle = '#b07d52'; x.fillRect(b.x - 8, BED_Y + 4, b.w + 16, 10);
    x.strokeStyle = 'rgba(60,35,15,.45)'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(b.x - 8, BED_Y + 4 + BED_H / 2 + 5); x.lineTo(b.x + b.w + 8, BED_Y + 4 + BED_H / 2 + 5); x.stroke();
    x.fillStyle = 'rgba(60,35,15,.5)';
    for (const px of [b.x + 4, b.x + b.w - 4]) for (const py of [BED_Y + 26, BED_Y + 60]) { x.beginPath(); x.arc(px, py, 3, 0, TAU); x.fill(); }
  }
  return grain(c, 10);
}

function catHitbox() {
  if (cat.pose === 'loaf') return { x0: cat.x - 75, x1: cat.x + 80, y0: cat.y - 85, y1: cat.y + 5 };
  if (cat.pose === 'sit') return { x0: cat.x - 45, x1: cat.x + 45, y0: cat.y - 140, y1: cat.y + 5 };
  return { x0: cat.x - 90, x1: cat.x + 90, y0: cat.y - 120, y1: cat.y + 5 };
}
function onBed(xx) { return BEDS.findIndex((b) => xx > b.x + 30 && xx < b.x + b.w - 30); }
function pesterTarget() {
  const beds = BEDS.filter((b) => flowers.some((f) => f.state === 'ok' && f.x > b.x && f.x < b.x + b.w));
  const b = beds.length ? pick(beds) : pick(BEDS);
  return b.x + b.w / 2 + rr(-80, 80);
}
function headPos(f) {
  const sway = Math.sin(t * 1.6 + f.ph) * 4;
  return { x: f.x + sway, y: f.y - f.h };
}

export const garden = {
  enter() {
    t = 0;
    if (!bgCache) { bgCache = buildBg(); frontCache = buildFront(); }
    const types = shuffle([...FLOWER_TYPES]);
    flowers = [];
    let k = 0;
    const slots = [];
    for (const b of BEDS) for (let i = 0; i < 4; i++) slots.push(b.x + 45 + (i * (b.w - 90)) / 3 + rr(-14, 14));
    shuffle(slots);
    for (const sx of slots.sort((a, b) => a - b)) {
      const type = k < types.length ? types[k] : pick(FLOWER_TYPES);
      k++;
      const sp = FLOWERS[type].shape === 'spike';
      flowers.push({ type, x: sx, y: BED_Y + 2, h: sp ? 0 : rr(78, 125), ph: rr(0, TAU), state: 'ok' });
    }
    // shuffle which flower sits in which slot, keeping x order for draw
    const ts = shuffle(flowers.map((f) => f.type));
    flowers.forEach((f, i) => { f.type = ts[i]; f.h = FLOWERS[f.type].shape === 'spike' ? 0 : rr(78, 125); });
    flowers.sort((a, b) => a.x - b.x);

    cat = { x: -120, y: LAWN_Y, dir: 1, pose: 'walk', state: 'enter', target: pesterTarget(), timer: 0, t: 0, from: LAWN_Y, to: LAWN_Y, squashT: 0, squashed: false, delay: 3 };
    flying = [];
    butterflies = [
      { x: 300, y: 300, vx: 30, vy: 0, ph: 0, col: '#f2c14e' },
      { x: 900, y: 250, vx: -25, vy: 0, ph: 2, col: '#9fc5e8' },
    ];
    btn = new Button({ x: 1010, y: 26, w: 240, h: 56, label: 'To the press →', primary: true, enabled: false, onClick: () => { sfx.click(); game.go('press'); } });
    toasts.clear();
    toasts.add(`Pick up to ${MAX} flowers for the press`, 3.4);
  },

  update(dt) {
    t += dt;
    cat.t += dt;
    updateCat(dt);
    for (const f of flying) f.k = Math.min(1, f.k + dt * 2.2);
    flying = flying.filter((f) => f.k < 1);
    for (const b of butterflies) {
      b.ph += dt * 14;
      b.vx += rr(-60, 60) * dt; b.vy += rr(-60, 60) * dt;
      b.vx = Math.max(-50, Math.min(50, b.vx)); b.vy = Math.max(-35, Math.min(35, b.vy));
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < 80 || b.x > 1200) b.vx *= -1;
      if (b.y < 160 || b.y > 470) b.vy *= -1;
    }
    btn.enabled = game.day.picked.length > 0;
    btn.pulse = game.day.picked.length >= MAX;
    toasts.update(dt);
  },

  draw(x) {
    x.drawImage(bgCache, 0, 0);
    for (const f of flowers) drawFlowerInBed(x, f);
    if (cat.y < BED_Y + 40) drawTheCat(x);
    x.drawImage(frontCache, 0, 0);

    for (const b of butterflies) {
      x.save(); x.translate(b.x, b.y);
      const s = Math.abs(Math.sin(b.ph));
      x.fillStyle = b.col;
      x.beginPath(); x.ellipse(-6 * s, 0, 8 * s + 1, 6, -0.3, 0, TAU); x.ellipse(6 * s, 0, 8 * s + 1, 6, 0.3, 0, TAU); x.fill();
      x.fillStyle = '#4a3a2c'; x.fillRect(-1, -5, 2, 10);
      x.restore();
    }

    drawBasket(x);
    if (cat.y >= BED_Y + 40) drawTheCat(x);
    for (const f of flying) {
      const k = f.k, e = 1 - Math.pow(1 - k, 3);
      const px = lerp(f.x, f.tx, e), py = lerp(f.y, f.ty, e) - Math.sin(k * Math.PI) * 120;
      const s = head(f.type);
      x.save(); x.translate(px, py); x.rotate(k * 4); x.drawImage(s, -s.width / 2, -s.height / 2); x.restore();
    }

    x.fillStyle = INK;
    x.font = `600 32px ${F.serif}`;
    x.fillText(`Day ${game.day.n} · the garden`, 34, 58);
    x.font = `25px ${F.hand}`;
    x.fillText(`tap flowers to pick them · tap ${CAT_NAME} to shoo`, 36, 88);
    btn.draw(x, t);
    toasts.draw(x, 1280);
  },

  pointerdown(p) {
    if (btn.hit(p)) return btn.onClick();
    const hb = catHitbox();
    if (cat.state !== 'away' && p.x > hb.x0 && p.x < hb.x1 && p.y > hb.y0 && p.y < hb.y1) return shooCat();
    let best = null, bd = 1e9;
    for (const f of flowers) {
      if (f.state === 'picked') continue;
      let hit = false, d = 0;
      if (FLOWERS[f.type].shape === 'spike') {
        const s = spike(f.type);
        hit = Math.abs(p.x - f.x) < 26 && p.y < f.y + 6 && p.y > f.y - s.height + 10;
        d = Math.abs(p.x - f.x);
      } else {
        const hp = headPos(f);
        d = Math.hypot(p.x - hp.x, p.y - hp.y);
        hit = d < 32 || (Math.abs(p.x - f.x) < 12 && p.y < f.y && p.y > hp.y);
      }
      if (hit && d < bd) { best = f; bd = d; }
    }
    if (!best) return;
    if (best.state === 'squashed') { toasts.add('That one is a bit too squashed…'); return sfx.bad(); }
    if (game.day.picked.length >= MAX) { toasts.add('Your basket is full!'); return sfx.bad(); }
    best.state = 'picked';
    game.day.picked.push(best.type);
    const i = game.day.picked.length - 1;
    const hp = FLOWERS[best.type].shape === 'spike' ? { x: best.x, y: best.y - 60 } : headPos(best);
    flying.push({ type: best.type, x: hp.x, y: hp.y, tx: 92 + i * 52, ty: 706, k: 0 });
    sfx.pluck();
    if (game.day.picked.length === MAX) toasts.add('Basket full, off to the press!');
  },

  pointermove(p) {
    btn.hover = btn.hit(p);
    const hb = catHitbox();
    const overCat = cat.state !== 'away' && p.x > hb.x0 && p.x < hb.x1 && p.y > hb.y0 && p.y < hb.y1;
    game.cursor = btn.hover || overCat || p.y > 380 && p.y < BED_Y + 10 ? 'pointer' : 'default';
  },
  keydown(e) { if (e.key === 'Enter' && btn.enabled) btn.onClick(); },
};

function drawFlowerInBed(x, f) {
  if (f.state === 'picked') {
    x.fillStyle = '#7d9a62'; x.fillRect(f.x - 1.5, f.y - 14, 3, 14);
    return;
  }
  const sp = FLOWERS[f.type].shape === 'spike';
  const sway = Math.sin(t * 1.6 + f.ph) * (f.state === 'squashed' ? 0 : 0.05);
  x.save();
  x.translate(f.x, f.y);
  if (f.state === 'squashed') x.rotate(f.x % 2 ? 1.1 : -1.1);
  else x.rotate(sway);
  if (sp) {
    const s = spike(f.type);
    if (f.state === 'squashed') x.globalAlpha = 0.6;
    x.drawImage(s, -s.width / 2, -s.height + 8);
  } else {
    x.strokeStyle = '#7d9a62'; x.lineWidth = 3.2; x.lineCap = 'round';
    x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(4, -f.h / 2, 0, -f.h); x.stroke();
    x.fillStyle = '#88a86a';
    for (const [ly, s] of [[-f.h * 0.35, 1], [-f.h * 0.55, -1]]) {
      x.save(); x.translate(1, ly); x.rotate(s * 0.9);
      x.beginPath(); x.ellipse(0, -11, 5, 12, 0, 0, TAU); x.fill();
      x.restore();
    }
    const s = f.state === 'squashed' ? squashedHead(f.type) : head(f.type);
    x.drawImage(s, -s.width / 2, -f.h - s.height / 2);
  }
  x.restore();
}

function drawTheCat(x) {
  if (cat.state === 'away') return;
  x.save();
  x.translate(cat.x, cat.y);
  drawCat(x, { pose: cat.pose, t: cat.t, dir: cat.dir, s: 0.9 });
  x.restore();
  if (cat.state === 'nap') {
    x.save();
    x.fillStyle = 'rgba(58,46,40,.75)'; x.font = `26px ${F.hand}`;
    for (let i = 0; i < 3; i++) {
      const k = (cat.t * 0.6 + i / 3) % 1;
      x.globalAlpha = Math.sin(k * Math.PI);
      x.fillText('z', cat.x + 40 * cat.dir + k * 24, cat.y - 70 - k * 50);
    }
    x.restore();
    // warning ring while a flower is in danger
    if (!cat.squashed) {
      const k = Math.max(0, cat.squashT / 3.2);
      x.save();
      x.strokeStyle = `rgba(200,80,70,${0.4 + (1 - k) * 0.5})`; x.lineWidth = 4;
      x.beginPath(); x.arc(cat.x - 70 * cat.dir, cat.y - 90, 14, -Math.PI / 2, -Math.PI / 2 + TAU * k); x.stroke();
      x.fillStyle = 'rgba(200,80,70,.9)'; x.font = `700 20px ${F.serif}`; x.textAlign = 'center';
      x.fillText('!', cat.x - 70 * cat.dir, cat.y - 83);
      x.restore();
    }
  }
}

function drawBasket(x) {
  x.save();
  x.translate(40, 670);
  x.fillStyle = 'rgba(40,25,10,.25)';
  x.beginPath(); x.ellipse(130, 112, 130, 14, 0, 0, TAU); x.fill();
  x.fillStyle = '#7d5a37';
  x.beginPath(); x.ellipse(130, 36, 120, 20, 0, 0, TAU); x.fill();
  x.strokeStyle = '#b08458'; x.lineWidth = 7;
  x.beginPath(); x.ellipse(130, 30, 108, 80, 0, Math.PI * 1.08, Math.PI * 1.92); x.stroke();
  x.restore();
  game.day.picked.forEach((type, i) => {
    if (flying.some((f) => f.tx === 92 + i * 52)) return;
    const s = head(type);
    x.save(); x.translate(92 + i * 52, 706); x.rotate(i * 0.7 - 1); x.drawImage(s, -s.width / 2, -s.height / 2); x.restore();
  });
  x.save();
  x.translate(40, 670);
  const g = x.createLinearGradient(0, 40, 0, 110);
  g.addColorStop(0, '#c99a64'); g.addColorStop(1, '#a87a48');
  x.fillStyle = g;
  x.beginPath(); x.moveTo(10, 40); x.lineTo(250, 40); x.lineTo(228, 110); x.lineTo(32, 110); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(90,60,30,.45)'; x.lineWidth = 2;
  for (let yy = 52; yy < 110; yy += 12) { x.beginPath(); x.moveTo(14 + (yy - 40) * 0.3, yy); x.lineTo(246 - (yy - 40) * 0.3, yy); x.stroke(); }
  for (let xx = 26; xx < 240; xx += 18) { x.beginPath(); x.moveTo(xx, 42); x.lineTo(xx + (130 - xx) * 0.09, 108); x.stroke(); }
  x.fillStyle = '#fbf3e2'; x.font = `600 20px ${F.serif}`; x.textAlign = 'center';
  x.fillText(`${game.day.picked.length} / ${MAX}`, 130, 86);
  x.restore();
}

function updateCat(dt) {
  const c = cat;
  switch (c.state) {
    case 'enter':
      c.delay -= dt;
      if (c.delay > 0) return;
      c.state = 'walk';
    // fallthrough
    case 'walk': {
      c.pose = 'walk';
      const d = c.target - c.x;
      c.dir = Math.sign(d) || c.dir;
      c.x += c.dir * 120 * dt;
      if (Math.abs(d) < 5) {
        const bi = onBed(c.x);
        if (bi >= 0 && Math.random() < 0.75 && flowers.some((f) => f.state === 'ok' && Math.abs(f.x - c.x) < 70)) {
          c.state = 'hop'; c.timer = 0; c.from = c.y; c.to = BED_Y + 4;
        } else { c.state = 'sit'; c.timer = rr(1.5, 3); }
      }
      break;
    }
    case 'sit':
      c.pose = 'sit';
      c.timer -= dt;
      if (c.timer <= 0) { c.state = 'walk'; c.target = pesterTarget(); }
      break;
    case 'hop': case 'down': {
      c.timer += dt;
      const k = Math.min(1, c.timer / 0.45);
      c.y = lerp(c.from, c.to, k) - Math.sin(k * Math.PI) * 60;
      c.pose = 'walk';
      if (k >= 1) {
        if (c.state === 'hop') { c.state = 'nap'; c.timer = rr(6, 9); c.squashT = 3.2; c.squashed = false; sfx.purr(); }
        else if (c.run) { c.state = 'run'; c.run = false; }
        else { c.state = 'walk'; c.target = pesterTarget(); }
      }
      break;
    }
    case 'nap':
      c.pose = 'loaf';
      c.timer -= dt; c.squashT -= dt;
      if (c.squashT <= 0 && !c.squashed) {
        c.squashed = true;
        const under = flowers.filter((f) => f.state === 'ok' && Math.abs(f.x - c.x) < 70);
        if (under.length) {
          const f = pick(under);
          f.state = 'squashed';
          game.day.stats.squashed++;
          toasts.add(`${CAT_NAME} squashed the ${FLOWERS[f.type].name.toLowerCase()}!`);
          sfx.bad();
        }
      }
      if (c.timer <= 0) { c.state = 'down'; c.timer = 0; c.from = c.y; c.to = LAWN_Y; }
      break;
    case 'run':
      c.pose = 'walk';
      c.x += c.dir * 340 * dt;
      if (c.x < -160 || c.x > 1440) { c.state = 'away'; c.timer = rr(6, 9); }
      break;
    case 'away':
      c.timer -= dt;
      if (c.timer <= 0) { c.dir = c.x < 0 ? 1 : -1; c.state = 'walk'; c.target = pesterTarget(); }
      break;
  }
}

function shooCat() {
  const c = cat;
  game.day.stats.shoos++;
  sfx.meow();
  toasts.add(pick(['mrrp!', `${CAT_NAME} huffs off`, '*offended meow*', 'mrow?!']), 1.6);
  c.dir = c.x < 640 ? -1 : 1;
  if (c.state === 'nap' || c.state === 'hop') {
    c.state = 'down'; c.timer = 0; c.from = c.y; c.to = LAWN_Y; c.run = true;
  } else {
    c.state = 'run';
  }
}
