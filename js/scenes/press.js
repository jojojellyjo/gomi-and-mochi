// The flower press, played like a fishing bar: hold to push the pressure up, let go
// and it sinks. Keep it inside the drifting green zone until the progress bar fills.
import { game, recordFound } from '../state.js';
import { Button, F, INK, toasts } from '../ui.js';
import { getDesk } from '../bg.js';
import { drawPaw, CAT_NAME } from '../cat.js';
import { drawHand } from '../hands.js';
import { FLOWERS, flowerSprite, makePressed, QUALITY_LABEL } from '../flowers.js';
import { mk, rr, pick, lerp, clamp, TAU, wood, grain } from '../textures.js';
import { sfx } from '../sfx.js';

const CX = 520, CY = 450, BS = 390;
const NUT_OFF = BS / 2 - 34;
const NUTS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
const MX = 850, MY = 170, MW = 64, MH = 500, MAXV = 120, NEED = 3, LIMIT = 16;

let queue, idx, phase, p, v, holding, zc, zt, zw, ztimer, prog, tHigh, tLow, tAll, top, shake, paw, result, fresh, boards = null, t, creakT, lastIn;
let nextBtn, lineup;

function makeBoards() {
  const base = wood(BS, BS, '#c9a070'), x = base.getContext('2d');
  const topB = wood(BS, BS, '#b88d5e'), y = topB.getContext('2d');
  for (const [sx, sy] of NUTS) {
    const cx = BS / 2 + sx * NUT_OFF, cy = BS / 2 + sy * NUT_OFF;
    x.fillStyle = '#5a4030'; x.beginPath(); x.arc(cx, cy, 9, 0, TAU); x.fill();
    y.fillStyle = 'rgba(60,35,15,.4)'; y.beginPath(); y.arc(cx, cy, 20, 0, TAU); y.fill();
  }
  y.fillStyle = 'rgba(60,35,15,.5)'; y.font = `italic 600 30px ${F.serif}`; y.textAlign = 'center';
  y.fillText('flora press', BS / 2, BS / 2 + 10);
  y.strokeStyle = 'rgba(60,35,15,.35)'; y.lineWidth = 2; y.strokeRect(70, 70, BS - 140, BS - 140);
  const paper = mk(300, 300), pp = paper.getContext('2d');
  pp.fillStyle = '#f4eee2'; pp.fillRect(0, 0, 300, 300);
  grain(paper, 12);
  return { base, top: topB, paper };
}

function startFlower() {
  const type = queue[idx];
  const [a, b] = FLOWERS[type].zone;
  zw = clamp((b - a) * 1.25, 18, 36);
  zc = zt = 60; ztimer = 1.2;
  p = 0; v = 0; holding = false; prog = 0; tHigh = 0; tLow = 0; tAll = 0; lastIn = false;
  fresh = flowerSprite(type, 95);
  phase = 'ready'; top = -620; shake = 0; result = null; paw = null;
  nextBtn.visible = false;
}

function finish() {
  const type = queue[idx];
  const off = tHigh + tLow;
  let q;
  if (prog >= 1 && off < 1.6) q = 'perfect';
  else if (prog >= 1 && off < 4) q = 'good';
  else if (prog >= 0.7 && off < 5) q = 'good';
  else q = tHigh > tLow ? 'browned' : 'curled';
  const sprite = makePressed(type, q);
  game.day.pressed.push({ type, quality: q, sprite });
  if (q === 'perfect') game.day.stats.perfect++;
  const isNew = recordFound(type, q);
  const why = q === 'perfect' ? 'you held it just right the whole time'
    : q === 'good' ? 'mostly in the green, nicely done'
    : q === 'browned' ? 'too much pressure for too long' : 'not enough pressure to flatten it';
  result = { q, sprite, isNew, why };
  phase = 'result'; holding = false;
  if (paw) paw.retreat = true;
  nextBtn.visible = true;
  nextBtn.label = idx + 1 < queue.length ? 'Next flower →' : 'All done →';
  sfx.creak();
  if (q === 'perfect') sfx.chime(); else if (q === 'good') sfx.good(); else sfx.bad();
  if (isNew) setTimeout(() => { if (game.sceneName === 'press') toasts.add(`New in your herbarium: ${FLOWERS[type].name}!`); }, 400);
}

function next() {
  idx++;
  if (idx >= queue.length) { phase = 'done'; nextBtn.visible = false; lineup.visible = true; sfx.good(); }
  else startFlower();
}

function pawTip() {
  const startX = paw.side < 0 ? -40 : 1320;
  return { x: lerp(startX, paw.side < 0 ? CX - BS / 2 + 30 : CX + BS / 2 - 30, paw.k), y: lerp(paw.y0, CY - 40, paw.k) };
}

export const press = {
  enter() {
    if (!boards) boards = makeBoards();
    queue = game.day.picked.slice();
    idx = 0; t = 0; creakT = 0;
    nextBtn = new Button({ x: CX - 120, y: CY + BS / 2 + 84, w: 240, h: 54, label: 'Next flower →', visible: false, onClick: next });
    lineup = new Button({ x: 980, y: 700, w: 270, h: 60, label: 'Back inside →', primary: true, visible: false, onClick: () => { sfx.click(); game.go('morning', { back: true }); } });
    toasts.clear();
    if (!queue.length) { phase = 'done'; lineup.visible = true; return; }
    startFlower();
  },

  update(dt) {
    t += dt;
    top = lerp(top, phase === 'pressing' ? 0 : -620, 1 - Math.pow(0.0004, dt));
    shake = Math.max(0, shake - dt);
    if (phase === 'pressing') {
      tAll += dt;
      v += (holding ? 260 : -200) * dt;
      v = clamp(v, -130, 150);
      p += v * dt;
      if (p <= 0) { p = 0; v = Math.max(0, v); }
      if (p >= MAXV) { p = MAXV; v = Math.min(0, v); }
      ztimer -= dt;
      if (ztimer <= 0) { zt = rr(18 + zw / 2, MAXV - 14 - zw / 2); ztimer = rr(0.9, 2.2); }
      zc += clamp(zt - zc, -38 * dt, 38 * dt);
      const lo = zc - zw / 2, hi = zc + zw / 2, inside = p >= lo && p <= hi;
      if (inside) prog = Math.min(1, prog + dt / NEED);
      else { prog = Math.max(0, prog - dt / (NEED * 2.2)); if (p > hi) tHigh += dt; else tLow += dt; }
      if (inside !== lastIn && tAll > 0.6) { inside ? sfx.pop() : sfx.click(); }
      lastIn = inside;
      creakT -= dt;
      if (holding && creakT <= 0) { sfx.click(); creakT = 0.16; }
      if (!paw && tAll > 1.5 && Math.random() < dt * 0.22) paw = { side: Math.random() < 0.5 ? -1 : 1, y0: rr(CY - 120, CY + 120), k: 0, retreat: false, hit: false };
      if (paw && !paw.retreat) {
        paw.k = Math.min(1, paw.k + dt / 1.0);
        if (paw.k >= 1 && !paw.hit) {
          paw.hit = true; paw.retreat = true;
          v += 140; shake = 0.35;
          game.day.stats.jolts++;
          toasts.add(`${CAT_NAME} leaned on the press!`, 1.8);
          sfx.thunk();
        }
      }
      if (prog >= 1 || tAll >= LIMIT) finish();
    }
    if (paw && paw.retreat) { paw.k -= dt * 2.5; if (paw.k <= 0) paw = null; }
    toasts.update(dt);
  },

  draw(x) {
    x.drawImage(getDesk(), 0, 0);
    x.save();
    x.fillStyle = '#fdf7ea'; x.shadowColor = 'rgba(30,15,5,.5)'; x.shadowBlur = 6;
    x.font = `600 32px ${F.serif}`;
    x.fillText(phase === 'done' ? 'Pressed and ready ✿' : `The press · ${idx + 1} of ${queue.length}`, 34, 58);
    x.font = `25px ${F.hand}`;
    const hint = phase === 'ready' ? 'tap to close the press'
      : phase === 'pressing' ? 'hold to press down, let go to ease off · stay in the green until the bar fills'
      : phase === 'result' ? result.why : '';
    x.fillText(hint, 36, 88);
    x.restore();

    if (phase === 'done') { drawLineup(x); toasts.draw(x, 1280); return; }

    const sx = shake > 0 ? rr(-5, 5) : 0, sy = shake > 0 ? rr(-3, 3) : 0;
    x.save();
    x.translate(CX + sx, CY + sy);
    x.fillStyle = 'rgba(30,15,5,.35)'; x.fillRect(-BS / 2 + 8, -BS / 2 + 14, BS, BS);
    x.drawImage(boards.base, -BS / 2, -BS / 2);
    x.save(); x.rotate(0.02); x.drawImage(boards.paper, -150, -150); x.restore();
    if (phase === 'result') {
      const s = result.sprite, sc = 1.55;
      x.drawImage(s, -s.width * sc / 2, -s.height * sc / 2, s.width * sc, s.height * sc);
    } else x.drawImage(fresh, -fresh.width / 2, -fresh.height / 2);
    for (let i = 0; i < 4; i++) { x.fillStyle = '#9a9aa2'; x.beginPath(); x.arc(NUTS[i][0] * NUT_OFF, NUTS[i][1] * NUT_OFF, 8, 0, TAU); x.fill(); }
    x.restore();

    if (top > -600) {
      x.save();
      const squash = phase === 'pressing' ? p / MAXV : 0;
      x.translate(CX + sx, CY + sy + top);
      x.scale(1 - squash * 0.02, 1 - squash * 0.02);
      x.fillStyle = `rgba(30,15,5,${0.3 + squash * 0.2})`; x.fillRect(-BS / 2 + 6 - squash * 4, -BS / 2 + 10 - squash * 6, BS, BS);
      x.drawImage(boards.top, -BS / 2, -BS / 2);
      for (let i = 0; i < 4; i++) {
        x.save(); x.translate(NUTS[i][0] * NUT_OFF, NUTS[i][1] * NUT_OFF); x.rotate(p / 7 + i);
        x.fillStyle = '#b8b8c2';
        x.beginPath(); x.ellipse(-16, 0, 16, 9, 0, 0, TAU); x.ellipse(16, 0, 16, 9, 0, 0, TAU); x.fill();
        x.strokeStyle = '#6a6a74'; x.lineWidth = 2; x.stroke();
        x.fillStyle = '#9a9aa4'; x.beginPath(); x.arc(0, 0, 11, 0, TAU); x.fill(); x.stroke();
        x.restore();
      }
      x.restore();
      if (phase === 'pressing') {
        const push = holding ? 10 : 0;
        x.save(); x.translate(CX + 40, CY - 30 + push); drawHand(x, { pose: 'press', s: 1.05, rot: -0.15 }); x.restore();
      }
    }
    if (phase === 'pressing' || phase === 'result') drawMeter(x);

    if (paw) {
      const tip = pawTip(), from = paw.side < 0 ? -60 : 1340;
      x.save(); x.translate(from, paw.y0); x.rotate(Math.atan2(tip.y - paw.y0, tip.x - from));
      drawPaw(x, Math.hypot(tip.x - from, tip.y - paw.y0)); x.restore();
    }

    if (phase === 'result') {
      x.save();
      x.translate(CX, CY + BS / 2 + 50);
      x.rotate(-0.02);
      const label = QUALITY_LABEL[result.q];
      x.font = `38px ${F.hand}`;
      const w = x.measureText(label).width + 50;
      x.fillStyle = 'rgba(40,25,10,.3)'; x.fillRect(-w / 2 + 3, -27, w, 52);
      x.fillStyle = result.q === 'perfect' ? '#eaf2d9' : result.q === 'good' ? '#fbf6ea' : '#f3e2d2';
      x.fillRect(-w / 2, -30, w, 52);
      x.fillStyle = INK; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(label, 0, -3);
      x.restore();
    } else if (phase === 'ready') {
      x.save();
      x.fillStyle = '#fdf7ea'; x.font = `34px ${F.hand}`; x.textAlign = 'center';
      x.shadowColor = 'rgba(30,15,5,.6)'; x.shadowBlur = 6;
      const f = FLOWERS[queue[idx]];
      x.fillText(`${f.name}${f.edible ? ' (edible!)' : ''}`, CX, CY + BS / 2 + 50);
      x.restore();
    }
    nextBtn.draw(x, t);
    toasts.draw(x, 1280);
  },

  pointerdown(q) {
    if (phase === 'done') { if (lineup.hit(q)) lineup.onClick(); return; }
    if (nextBtn.hit(q)) return nextBtn.onClick();
    if (paw && !paw.retreat) {
      const tip = pawTip();
      if (Math.hypot(q.x - tip.x, q.y - tip.y) < 70) {
        paw.retreat = true;
        game.day.stats.shoos++;
        sfx.meow();
        toasts.add(pick([`not now, ${CAT_NAME}!`, 'mrrp?', 'paws off!']), 1.4);
        return;
      }
    }
    if (phase === 'ready') { phase = 'pressing'; sfx.thunk(); return; }
    if (phase === 'pressing') holding = true;
  },
  pointerup() { holding = false; },
  pointermove(q) {
    let h = false;
    for (const b of [nextBtn, lineup]) { b.hover = b.hit(q); h = h || b.hover; }
    game.cursor = h || phase === 'ready' || phase === 'pressing' ? 'pointer' : 'default';
  },
  keydown(e) {
    if (e.key === ' ') {
      e.preventDefault();
      if (phase === 'ready') { phase = 'pressing'; sfx.thunk(); }
      else if (phase === 'pressing') holding = true;
    }
    if (e.key === 'Enter') { if (phase === 'done') lineup.onClick(); else if (phase === 'result') next(); }
  },
  keyup(e) { if (e.key === ' ') holding = false; },
};

function drawMeter(x) {
  const yOf = (val) => MY + MH - (val / MAXV) * MH;
  x.save();
  x.fillStyle = 'rgba(30,15,5,.35)'; x.beginPath(); x.roundRect(MX - 22 + 4, MY - 46 + 6, 200, MH + 96, 16); x.fill();
  x.fillStyle = '#fbf6ea'; x.beginPath(); x.roundRect(MX - 22, MY - 46, 200, MH + 96, 16); x.fill();
  x.fillStyle = INK; x.font = `600 16px ${F.serif}`; x.fillText('pressure', MX - 4, MY - 18);
  x.fillStyle = '#e4dccd'; x.fillRect(MX, MY, MW, MH);
  x.fillStyle = 'rgba(176,122,74,.35)'; x.fillRect(MX, MY, MW, yOf(zc + zw / 2) - MY);
  const zy0 = yOf(zc + zw / 2), zy1 = yOf(zc - zw / 2);
  const inside = p >= zc - zw / 2 && p <= zc + zw / 2;
  x.fillStyle = inside ? '#8fbf6a' : '#a9c98a';
  x.beginPath(); x.roundRect(MX + 3, zy0, MW - 6, zy1 - zy0, 8); x.fill();
  x.strokeStyle = 'rgba(58,46,40,.35)'; x.lineWidth = 1.5; x.strokeRect(MX, MY, MW, MH);
  x.font = `19px ${F.hand}`; x.fillStyle = INK;
  x.fillText('too tight', MX + MW + 12, MY + 16);
  x.fillText('too loose', MX + MW + 12, MY + MH - 6);
  const ny = yOf(p);
  x.fillStyle = '#c0574b'; x.fillRect(MX - 8, ny - 2.5, MW + 16, 5);
  x.save(); x.translate(MX + MW / 2, ny);
  x.fillStyle = '#fffaf0';
  for (let i = 0; i < 6; i++) { x.save(); x.rotate((i / 6) * TAU); x.beginPath(); x.ellipse(0, -8, 4, 7, 0, 0, TAU); x.fill(); x.restore(); }
  x.fillStyle = '#e8a92a'; x.beginPath(); x.arc(0, 0, 4, 0, TAU); x.fill();
  x.restore();
  const px = MX + MW + 70, ph = MH - 40, py = MY + 20;
  x.fillStyle = '#e4dccd'; x.beginPath(); x.roundRect(px, py, 22, ph, 11); x.fill();
  x.fillStyle = prog > 0.66 ? '#7f9c5b' : prog > 0.33 ? '#c9b25a' : '#d9867d';
  if (prog > 0.01) { x.beginPath(); x.roundRect(px, py + ph * (1 - prog), 22, ph * prog, 11); x.fill(); }
  x.fillStyle = INK; x.font = `600 14px ${F.serif}`; x.textAlign = 'center';
  x.fillText('flat', px + 11, py - 8);
  x.restore();
}

function drawLineup(x) {
  const list = game.day.pressed.slice(-queue.length);
  const n = list.length, gap = 250, x0 = 640 - ((n - 1) * gap) / 2;
  list.forEach((pr, i) => {
    const s = pr.sprite, sc = 1.25;
    x.save();
    x.translate(x0 + i * gap, 400);
    x.rotate((i % 2 ? 1 : -1) * 0.05);
    x.fillStyle = 'rgba(30,15,5,.3)'; x.fillRect(-100 + 4, -140 + 6, 200, 280);
    x.fillStyle = '#f6f0e3'; x.fillRect(-100, -140, 200, 280);
    x.drawImage(s, -s.width * sc / 2, -s.height * sc / 2 - 20, s.width * sc, s.height * sc);
    x.fillStyle = INK; x.font = `26px ${F.hand}`; x.textAlign = 'center';
    x.fillText(FLOWERS[pr.type].name, 0, 110);
    x.font = `18px ${F.hand}`; x.fillStyle = 'rgba(58,46,40,.7)';
    x.fillText(pr.quality === 'curled' ? 'too loose' : pr.quality === 'browned' ? 'too tight' : pr.quality, 0, 130);
    x.restore();
  });
  lineup.draw(x, t);
}
