// The flower press: tighten four wing nuts evenly into the green band, then open it.
import { game, recordFound } from '../state.js';
import { Button, F, INK, toasts } from '../ui.js';
import { getDesk } from '../bg.js';
import { drawPaw, CAT_NAME } from '../cat.js';
import { drawHand } from '../hands.js';
import { FLOWERS, flowerSprite, makePressed, QUALITY_LABEL } from '../flowers.js';
import { mk, rr, pick, lerp, clamp, TAU, wood, grain } from '../textures.js';
import { sfx } from '../sfx.js';

const CX = 540, CY = 450, BS = 390;
const NUT_OFF = BS / 2 - 34;
const NUTS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
const NUT_COL = ['#d9867d', '#7fa6c9', '#8fb36a', '#c9a24f'];
const MX = 860, MY = 190, MW = 54, MH = 420, MAXV = 120;

let queue, idx, phase, nuts, zone, held, holdT, top, shake, paw, result, fresh, boards = null, t, creakT;
let openBtn, nextBtn, lineup;

function makeBoards() {
  const base = wood(BS, BS, '#d6ad80'), x = base.getContext('2d');
  const topB = wood(BS, BS, '#caa070'), y = topB.getContext('2d');
  for (const [sx, sy] of NUTS) {
    const cx = BS / 2 + sx * NUT_OFF, cy = BS / 2 + sy * NUT_OFF;
    x.fillStyle = '#5a4030'; x.beginPath(); x.arc(cx, cy, 9, 0, TAU); x.fill();
    y.fillStyle = 'rgba(60,35,15,.4)'; y.beginPath(); y.arc(cx, cy, 20, 0, TAU); y.fill();
  }
  y.fillStyle = 'rgba(60,35,15,.5)'; y.font = `italic 600 30px ${F.serif}`; y.textAlign = 'center';
  y.fillText('flora press', BS / 2, BS / 2 + 10);
  y.strokeStyle = 'rgba(60,35,15,.35)'; y.lineWidth = 2; y.strokeRect(70, 70, BS - 140, BS - 140);
  const paper = mk(300, 300), p = paper.getContext('2d');
  p.fillStyle = '#f4eee2'; p.fillRect(0, 0, 300, 300);
  grain(paper, 12);
  return { base, top: topB, paper };
}

function nutPos(i) { return { x: CX + NUTS[i][0] * NUT_OFF, y: CY + NUTS[i][1] * NUT_OFF }; }
function nutAt(p) {
  for (let i = 0; i < 4; i++) { const n = nutPos(i); if (Math.hypot(p.x - n.x, p.y - n.y) < 46) return i; }
  return -1;
}
const spread = () => Math.max(...nuts) - Math.min(...nuts);
const avg = () => nuts.reduce((a, b) => a + b, 0) / 4;

function startFlower() {
  const type = queue[idx];
  const [a, b] = FLOWERS[type].zone;
  const s = rr(-5, 5);
  zone = [a + s, b + s];
  fresh = flowerSprite(type, 95);
  nuts = [0, 0, 0, 0];
  phase = 'ready'; top = -620; shake = 0; result = null; paw = null; held = -1; holdT = 0;
  openBtn.visible = false; nextBtn.visible = false;
}

function evaluate() {
  const lo = Math.min(...nuts), hi = Math.max(...nuts), sp = hi - lo, m = avg();
  if (hi > zone[1] + 14) return 'browned';
  if (lo >= zone[0] && hi <= zone[1] && sp <= 12) return 'perfect';
  if (m >= zone[0] - 10 && m <= zone[1] + 10 && sp <= 22) return 'good';
  return 'curled';
}

function openPress() {
  const type = queue[idx];
  const q = evaluate();
  const sprite = makePressed(type, q);
  game.day.pressed.push({ type, quality: q, sprite });
  if (q === 'perfect') game.day.stats.perfect++;
  const isNew = recordFound(type, q);
  const why = q === 'browned' ? 'one corner was screwed too tight'
    : q === 'curled' ? (spread() > 22 ? 'the pressure was uneven' : 'it was too loose to flatten')
    : q === 'good' ? 'nearly even, nicely done' : 'perfectly even pressure';
  result = { q, sprite, isNew, why };
  phase = 'result';
  held = -1;
  if (paw) paw.retreat = true;
  openBtn.visible = false; nextBtn.visible = true;
  nextBtn.label = idx + 1 < queue.length ? 'Next flower →' : 'All done →';
  sfx.creak();
  if (q === 'perfect') sfx.chime(); else if (q === 'good') sfx.good(); else sfx.bad();
  if (isNew) setTimeout(() => toasts.add(`New in your herbarium: ${FLOWERS[type].name}!`), 400);
}

function next() {
  idx++;
  if (idx >= queue.length) { phase = 'done'; nextBtn.visible = false; lineup.visible = true; sfx.good(); }
  else startFlower();
}

function pawTip() {
  const startX = paw.side < 0 ? -40 : 1320;
  const n = nutPos(paw.nut);
  return { x: lerp(startX, n.x, paw.k), y: lerp(paw.y0, n.y, paw.k) };
}

export const press = {
  enter() {
    if (!boards) boards = makeBoards();
    queue = game.day.picked.slice();
    idx = 0; t = 0; creakT = 0;
    openBtn = new Button({ x: CX - 120, y: CY + BS / 2 + 30, w: 240, h: 56, label: 'Open the press', primary: true, visible: false, onClick: openPress });
    nextBtn = new Button({ x: CX - 120, y: CY + BS / 2 + 84, w: 240, h: 54, label: 'Next flower →', visible: false, onClick: next });
    lineup = new Button({ x: 980, y: 700, w: 270, h: 60, label: 'Open the journal →', primary: true, visible: false, onClick: () => { sfx.click(); game.go('journal', { fresh: true }); } });
    toasts.clear();
    startFlower();
  },

  update(dt) {
    t += dt;
    top = lerp(top, phase === 'tighten' ? 0 : -620, 1 - Math.pow(0.0004, dt));
    shake = Math.max(0, shake - dt);
    if (phase === 'tighten') {
      if (held >= 0) {
        holdT += dt;
        const rate = 18 + Math.min(holdT, 1.5) * 34;
        nuts[held] = Math.min(MAXV, nuts[held] + rate * dt);
        creakT -= dt;
        if (creakT <= 0) { sfx.click(); creakT = 0.12; }
      }
      openBtn.visible = Math.min(...nuts) > 10;
      if (!paw && nuts.some((n) => n > 25) && Math.random() < dt * 0.12) {
        const nut = Math.floor(Math.random() * 4);
        const side = NUTS[nut][0];
        paw = { nut, side, y0: rr(CY - 100, CY + 100), k: 0, retreat: false, hit: false };
      }
      if (paw && !paw.retreat) {
        paw.k = Math.min(1, paw.k + dt / 1.1);
        if (paw.k >= 1 && !paw.hit) {
          paw.hit = true; paw.retreat = true;
          const d = Math.random() < 0.5 ? rr(-26, -16) : rr(14, 22);
          nuts[paw.nut] = clamp(nuts[paw.nut] + d, 0, MAXV);
          shake = 0.35;
          game.day.stats.jolts++;
          toasts.add(d < 0 ? `${CAT_NAME} loosened a nut!` : `${CAT_NAME} bapped a nut tighter!`, 2);
          sfx.thunk();
        }
      }
    }
    if (paw && paw.retreat) { paw.k -= dt * 2.5; if (paw.k <= 0) paw = null; }
    toasts.update(dt);
  },

  draw(x) {
    x.drawImage(getDesk(), 0, 0);
    x.save();
    x.fillStyle = '#fdf7ea'; x.shadowColor = 'rgba(30,15,5,.5)'; x.shadowBlur = 6;
    x.font = `600 32px ${F.serif}`;
    x.fillText(phase === 'done' ? 'Pressed and ready' : `The press · ${idx + 1} of ${queue.length}`, 34, 58);
    x.font = `25px ${F.hand}`;
    const hint = phase === 'ready' ? 'tap to close the press'
      : phase === 'tighten' ? 'hold each wing nut to tighten it · keep all four even and in the green'
      : phase === 'result' ? result.why : 'your flowers are flat and lovely';
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
    // threaded posts
    for (let i = 0; i < 4; i++) {
      const px = NUTS[i][0] * NUT_OFF, py = NUTS[i][1] * NUT_OFF;
      x.fillStyle = '#9a9aa2'; x.beginPath(); x.arc(px, py, 8, 0, TAU); x.fill();
    }
    x.restore();

    if (top > -600) drawTopBoard(x, sx, sy);
    if (phase === 'tighten' && held >= 0) {
      const n = nutPos(held);
      x.save(); x.translate(n.x + 10, n.y + 6); x.rotate(Math.sin(t * 14) * 0.06); drawHand(x, { pose: 'pinch', s: 0.8, flip: NUTS[held][0] < 0, rot: NUTS[held][0] < 0 ? -0.4 : -0.55 }); x.restore();
    }
    drawMeter(x);

    if (paw) {
      const p = pawTip(), from = paw.side < 0 ? -60 : 1340;
      x.save();
      x.translate(from, paw.y0);
      const ang = Math.atan2(p.y - paw.y0, p.x - from);
      x.rotate(ang);
      drawPaw(x, Math.hypot(p.x - from, p.y - paw.y0));
      x.restore();
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
    openBtn.draw(x, t);
    nextBtn.draw(x, t);
    toasts.draw(x, 1280);
  },

  pointerdown(p) {
    if (phase === 'done') { if (lineup.hit(p)) lineup.onClick(); return; }
    if (openBtn.hit(p)) return openBtn.onClick();
    if (nextBtn.hit(p)) return nextBtn.onClick();
    if (paw && !paw.retreat) {
      const tip = pawTip();
      if (Math.hypot(p.x - tip.x, p.y - tip.y) < 60) {
        paw.retreat = true;
        game.day.stats.shoos++;
        sfx.meow();
        toasts.add(pick([`not now, ${CAT_NAME}!`, 'mrrp?', 'paws off!']), 1.4);
        return;
      }
    }
    if (phase === 'ready') { phase = 'tighten'; sfx.thunk(); return; }
    if (phase === 'tighten') {
      const i = nutAt(p);
      if (i >= 0) { held = i; holdT = 0; }
    }
  },
  pointerup() { held = -1; },
  pointermove(p) {
    const btns = [openBtn, nextBtn, lineup];
    let h = false;
    for (const b of btns) { b.hover = b.hit(p); h = h || b.hover; }
    game.cursor = h || (phase === 'tighten' && nutAt(p) >= 0) || phase === 'ready' ? 'pointer' : 'default';
  },
  keydown(e) {
    if (e.key === 'Enter') {
      if (phase === 'done') lineup.onClick();
      else if (phase === 'result') next();
      else if (phase === 'tighten' && openBtn.visible) openPress();
      else if (phase === 'ready') phase = 'tighten';
    }
    const k = { '1': 0, '2': 1, '3': 2, '4': 3 }[e.key];
    if (k !== undefined && phase === 'tighten' && !e.repeat) { held = k; holdT = 0; }
  },
  keyup(e) { if ('1234'.includes(e.key)) held = -1; },
};

function drawTopBoard(x, sx, sy) {
  x.save();
  x.translate(CX + sx, CY + sy + top);
  x.fillStyle = 'rgba(30,15,5,.3)'; x.fillRect(-BS / 2 + 6, -BS / 2 + 10, BS, BS);
  x.drawImage(boards.top, -BS / 2, -BS / 2);
  // tilt shading: tighter corners sit lower and darker
  const m = avg();
  for (let i = 0; i < 4; i++) {
    const d = (nuts[i] - m) / 40;
    if (Math.abs(d) < 0.02) continue;
    const cx = NUTS[i][0] * BS / 2, cy = NUTS[i][1] * BS / 2;
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, BS * 0.8);
    g.addColorStop(0, d > 0 ? `rgba(40,20,5,${Math.min(0.45, d * 0.5)})` : `rgba(255,240,210,${Math.min(0.35, -d * 0.4)})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(-BS / 2, -BS / 2, BS, BS);
  }
  for (let i = 0; i < 4; i++) {
    const px = NUTS[i][0] * NUT_OFF, py = NUTS[i][1] * NUT_OFF;
    const v = nuts[i];
    const col = v > zone[1] + 14 ? '#b07a4a' : v >= zone[0] && v <= zone[1] ? '#7f9c5b' : v >= zone[0] - 10 && v <= zone[1] + 14 ? '#c9d99e' : '#d8d0c4';
    x.lineWidth = 7; x.strokeStyle = 'rgba(0,0,0,.18)';
    x.beginPath(); x.arc(px, py, 38, 0, TAU); x.stroke();
    x.strokeStyle = col;
    x.beginPath(); x.arc(px, py, 38, -Math.PI / 2, -Math.PI / 2 + TAU * (v / MAXV)); x.stroke();
    x.save();
    x.translate(px, py);
    x.rotate(v / 9);
    const press = held === i ? 0.92 : 1;
    x.scale(press, press);
    x.fillStyle = '#b8b8c2';
    x.beginPath(); x.ellipse(-16, 0, 16, 9, 0, 0, TAU); x.ellipse(16, 0, 16, 9, 0, 0, TAU); x.fill();
    x.strokeStyle = '#6a6a74'; x.lineWidth = 2; x.stroke();
    x.fillStyle = '#9a9aa4'; x.beginPath(); x.arc(0, 0, 11, 0, TAU); x.fill(); x.stroke();
    x.restore();
    x.fillStyle = NUT_COL[i];
    x.beginPath(); x.arc(px + NUTS[i][0] * -26, py + NUTS[i][1] * -26, 7, 0, TAU); x.fill();
  }
  x.restore();
}

function drawMeter(x) {
  const yOf = (v) => MY + MH - (v / MAXV) * MH;
  x.save();
  x.fillStyle = 'rgba(30,15,5,.3)'; x.beginPath(); x.roundRect(MX - 14 + 3, MY - 40 + 5, MW + 120, MH + 170, 14); x.fill();
  x.fillStyle = '#fbf6ea'; x.beginPath(); x.roundRect(MX - 14, MY - 40, MW + 120, MH + 170, 14); x.fill();
  x.fillStyle = INK; x.font = `600 16px ${F.serif}`; x.fillText('pressure', MX - 2, MY - 14);
  const bands = [[0, zone[0] - 10, '#ddd6cb'], [zone[0] - 10, zone[0], '#cfe0a8'], [zone[0], zone[1], '#7f9c5b'], [zone[1], zone[1] + 14, '#cfe0a8'], [zone[1] + 14, MAXV, '#b07a4a']];
  for (const [a, b, col] of bands) {
    const y0 = yOf(clamp(b, 0, MAXV)), y1 = yOf(clamp(a, 0, MAXV));
    x.fillStyle = col; x.fillRect(MX, y0, MW, y1 - y0);
  }
  x.strokeStyle = 'rgba(58,46,40,.4)'; x.lineWidth = 1.5; x.strokeRect(MX, MY, MW, MH);
  x.font = `19px ${F.hand}`; x.fillStyle = INK;
  x.fillText('too tight', MX + MW + 10, yOf(MAXV - 5));
  x.fillText('just right', MX + MW + 10, yOf((zone[0] + zone[1]) / 2) + 6);
  x.fillText('too loose', MX + MW + 10, yOf(6));
  if (phase === 'tighten' || phase === 'result') {
    nuts.forEach((v, i) => {
      const y = yOf(v), xx = MX + 6 + i * 12;
      x.fillStyle = NUT_COL[i];
      x.fillRect(MX, y - 1.5, MW, 3);
      x.beginPath(); x.arc(xx, y, 6, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(0,0,0,.3)'; x.lineWidth = 1; x.stroke();
    });
    // evenness level
    const sp = spread();
    const ly = MY + MH + 50;
    x.fillStyle = INK; x.font = `600 16px ${F.serif}`; x.fillText('evenness', MX - 2, ly - 16);
    x.fillStyle = '#e6efd8'; x.beginPath(); x.roundRect(MX, ly, 150, 26, 13); x.fill();
    x.strokeStyle = 'rgba(58,46,40,.35)'; x.stroke();
    x.strokeStyle = 'rgba(58,46,40,.5)'; x.beginPath(); x.moveTo(MX + 63, ly + 3); x.lineTo(MX + 63, ly + 23); x.moveTo(MX + 87, ly + 3); x.lineTo(MX + 87, ly + 23); x.stroke();
    const off = clamp(sp / 40, 0, 1) * 62 * (nuts[0] + nuts[3] >= nuts[1] + nuts[2] ? -1 : 1);
    x.fillStyle = sp <= 12 ? '#9cc46a' : sp <= 22 ? '#e3c25a' : '#d9786a';
    x.beginPath(); x.ellipse(MX + 75 + off, ly + 13, 11, 8, 0, 0, TAU); x.fill();
  }
  x.restore();
}

function drawLineup(x) {
  const list = game.day.pressed.slice(-queue.length);
  const n = list.length, gap = 250, x0 = 640 - ((n - 1) * gap) / 2;
  list.forEach((p, i) => {
    const s = p.sprite, sc = 1.25;
    x.save();
    x.translate(x0 + i * gap, 400);
    x.rotate((i % 2 ? 1 : -1) * 0.05);
    x.fillStyle = 'rgba(30,15,5,.3)'; x.fillRect(-100 + 4, -140 + 6, 200, 280);
    x.fillStyle = '#f6f0e3'; x.fillRect(-100, -140, 200, 280);
    x.drawImage(s, -s.width * sc / 2, -s.height * sc / 2 - 20, s.width * sc, s.height * sc);
    x.fillStyle = INK; x.font = `26px ${F.hand}`; x.textAlign = 'center';
    x.fillText(FLOWERS[p.type].name, 0, 110);
    x.font = `18px ${F.hand}`; x.fillStyle = 'rgba(58,46,40,.7)';
    x.fillText(p.quality, 0, 130);
    x.restore();
  });
  lineup.draw(x, t);
}
