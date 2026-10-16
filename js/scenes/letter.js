// Day 3 finale: fold the spread into an envelope, pour and stamp a wax seal, then the ending.
import { game, newDay } from '../state.js';
import { Button, F, INK, toasts } from '../ui.js';
import { getDesk } from '../bg.js';
import { mk, rr, TAU, lerp, clamp, grain } from '../textures.js';
import { drawHand } from '../hands.js';
import { drawCat } from '../cat.js';
import { ENDING, NEIGHBOUR, HANA } from '../story.js';
import { sfx } from '../sfx.js';

const EX = 640, EY = 430, EW = 560, EH = 360;
const POOL_BAND = [44, 58];
let t, phase, spread, foldK, pool, pouring, cool, result, btn, endIdx, sealCol, stampK, hand;

const COLS = [['#9b2335', '#d26070', '#5a0f1e'], ['#2f4f7f', '#6a8cc0', '#14284a'], ['#6f8a3a', '#a9c06a', '#3b4d18'], ['#c8962e', '#f0cf73', '#7d5a10']];

function drawEnvelope(x) {
  x.save();
  x.translate(EX, EY);
  x.fillStyle = 'rgba(30,15,5,.35)'; x.fillRect(-EW / 2 + 8, -EH / 2 + 12, EW, EH);
  x.fillStyle = '#efe2c6'; x.fillRect(-EW / 2, -EH / 2, EW, EH);
  x.strokeStyle = 'rgba(80,60,40,.22)'; x.lineWidth = 2;
  x.beginPath(); x.moveTo(-EW / 2, EH / 2); x.lineTo(-30, 10); x.moveTo(EW / 2, EH / 2); x.lineTo(30, 10); x.stroke();
  // flap
  x.fillStyle = '#e8d8b8';
  x.beginPath(); x.moveTo(-EW / 2, -EH / 2); x.lineTo(EW / 2, -EH / 2); x.lineTo(0, 40); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(80,60,40,.25)'; x.stroke();
  x.fillStyle = '#3b3550'; x.font = `34px ${F.hand}`; x.textAlign = 'left';
  x.fillText(`to ${NEIGHBOUR}, 1F`, -EW / 2 + 40, EH / 2 - 60);
  x.font = `24px ${F.hand}`; x.fillText(`thank you, from ${HANA} (203) ♥`, -EW / 2 + 40, EH / 2 - 26);
  x.restore();
}

function drawPool(x, r, col, k) {
  // k: 0 glossy-hot … 1 matte-cold
  const [base, light, dark] = col;
  x.save();
  x.translate(EX, EY + 40);
  x.beginPath();
  for (let a = 0; a <= TAU + 0.01; a += 0.1) {
    const rad = r + Math.sin(a * 5 + 1) * r * 0.05 + Math.sin(a * 3) * r * 0.04;
    a ? x.lineTo(Math.cos(a) * rad, Math.sin(a) * rad) : x.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  x.closePath();
  const g = x.createRadialGradient(-r * 0.3, -r * 0.35, 2, 0, 0, r * 1.1);
  g.addColorStop(0, light); g.addColorStop(0.5, base); g.addColorStop(1, dark);
  x.fillStyle = g; x.fill();
  // gloss fades as it cools
  x.globalAlpha = Math.max(0, 0.75 - k * 0.9);
  x.fillStyle = '#fff';
  x.beginPath(); x.ellipse(-r * 0.32, -r * 0.38, r * 0.28, r * 0.12, -0.6, 0, TAU); x.fill();
  x.restore();
}

function drawSealFace(x, r, col, quality) {
  const [base, light, dark] = col;
  x.save();
  x.translate(EX, EY + 40);
  x.lineWidth = 3;
  x.strokeStyle = dark; x.beginPath(); x.arc(1, 1, r * 0.66, 0, TAU); x.stroke();
  x.strokeStyle = light; x.beginPath(); x.arc(-1, -1, r * 0.66, Math.PI * 0.9, Math.PI * 1.7); x.stroke();
  const heart = (o, c) => {
    x.save(); x.translate(o, o); x.fillStyle = c; const s = r * 0.36;
    x.beginPath(); x.moveTo(0, s * 0.7); x.bezierCurveTo(-s * 1.3, -s * 0.2, -s * 0.5, -s * 1.1, 0, -s * 0.35); x.bezierCurveTo(s * 0.5, -s * 1.1, s * 1.3, -s * 0.2, 0, s * 0.7); x.fill(); x.restore();
  };
  if (quality !== 'smudged') { heart(1.5, dark); heart(-1.2, light); heart(0, base); }
  else { x.globalAlpha = 0.5; heart(3, dark); heart(-2, light); x.globalAlpha = 1; }
  if (quality === 'cracked') {
    x.strokeStyle = dark; x.lineWidth = 2;
    x.beginPath(); x.moveTo(-r * 0.7, -r * 0.2); x.lineTo(-r * 0.2, 0); x.lineTo(r * 0.1, -r * 0.3); x.lineTo(r * 0.7, -r * 0.1); x.stroke();
  }
  x.restore();
}

function coolBand() { return [0.45, 0.7]; }

export const letter = {
  enter(arg) {
    t = 0; phase = 'fold'; spread = arg.image; foldK = 0; pool = 0; pouring = false; cool = 0; result = null; endIdx = 0; stampK = 0; hand = null;
    sealCol = COLS[Math.floor(Math.random() * COLS.length)];
    btn = new Button({ x: 990, y: 700, w: 260, h: 60, label: 'Slip it under the door →', primary: true, visible: false, onClick: () => { sfx.click(); phase = 'ending'; endIdx = 0; btn.visible = false; } });
    toasts.clear();
  },
  update(dt) {
    t += dt;
    if (phase === 'fold') { foldK = Math.min(1, foldK + dt * 0.8); if (foldK >= 1) { phase = 'pour'; toasts.add('Hold to pour the wax. Let go when it fills the ring', 3.4); } }
    if (phase === 'pour' && pouring) { pool = Math.min(80, pool + dt * 30); if (pool >= 80) release(); }
    if (phase === 'cool') {
      cool = Math.min(1.15, cool + dt * 0.28);
      if (cool >= 1.15) stamp();
    }
    if (phase === 'stamped') stampK = Math.min(1, stampK + dt * 3);
    toasts.update(dt);
  },
  draw(x) {
    if (phase === 'ending' || phase === 'end') return drawEnding(x);
    x.drawImage(getDesk(), 0, 0);
    x.save();
    x.fillStyle = '#fdf7ea'; x.shadowColor = 'rgba(30,15,5,.5)'; x.shadowBlur = 6;
    x.font = `600 32px ${F.serif}`; x.textAlign = 'left';
    x.fillText('Day 3 · a letter for downstairs', 34, 58);
    x.font = `25px ${F.hand}`;
    const hint = { fold: 'folding your spread into an envelope…', pour: 'hold anywhere to pour the wax · let go inside the ring', cool: 'wait for the shine to soften… tap to stamp when the gauge is green', stamped: result ? result.why : '' }[phase];
    x.fillText(hint, 36, 88);
    x.restore();

    if (phase === 'fold') {
      const k = 1 - Math.pow(1 - foldK, 2);
      drawEnvelope(x);
      if (k < 1) {
        x.save();
        x.translate(EX, lerp(EY - 20, EY + 10, k));
        const s = lerp(0.7, 0.2, k);
        x.scale(s, s * lerp(1, 0.3, k));
        x.globalAlpha = 1 - k * 0.8;
        x.drawImage(spread, -spread.width / 2, -spread.height / 2);
        x.restore();
      }
      return;
    }
    drawEnvelope(x);
    // target ring
    if (phase === 'pour') {
      x.save(); x.translate(EX, EY + 40);
      x.setLineDash([6, 6]); x.lineWidth = 2;
      x.strokeStyle = 'rgba(58,46,40,.5)'; x.beginPath(); x.arc(0, 0, POOL_BAND[0], 0, TAU); x.stroke();
      x.strokeStyle = 'rgba(58,46,40,.25)'; x.beginPath(); x.arc(0, 0, POOL_BAND[1], 0, TAU); x.stroke();
      x.restore();
    }
    if (pool > 0) drawPool(x, pool, sealCol, phase === 'pour' ? 0 : cool);
    if (phase === 'stamped' && result) drawSealFace(x, pool, sealCol, result.q);
    // candle + wax stick hand while pouring
    if (phase === 'pour') {
      x.save(); x.translate(EX + 20, EY - 30 - (pouring ? 0 : 30));
      x.fillStyle = sealCol[0]; x.save(); x.rotate(-0.9); x.beginPath(); x.roundRect(-8, -150, 16, 150, 6); x.fill(); x.restore();
      if (pouring) { x.fillStyle = sealCol[0]; x.beginPath(); x.moveTo(-4, 0); x.quadraticCurveTo(0, 40, 0, 70); x.quadraticCurveTo(2, 40, 4, 0); x.fill(); }
      x.translate(-110, -90); drawHand(x, { pose: 'pinch', s: 0.9, rot: -1.2 });
      x.restore();
    }
    if (phase === 'cool' || phase === 'stamped') {
      // stamp + hand
      const down = phase === 'stamped' ? Math.sin(Math.min(1, stampK) * Math.PI) : 0;
      x.save(); x.translate(EX, EY + 40 - 170 + down * 130);
      x.fillStyle = '#8a5a36'; x.beginPath(); x.roundRect(-22, -90, 44, 110, 18); x.fill();
      x.fillStyle = '#d4af5a'; x.beginPath(); x.roundRect(-34, 10, 68, 22, 6); x.fill();
      x.translate(20, -40); drawHand(x, { pose: 'press', s: 0.75, rot: 0.1 });
      x.restore();
    }
    if (phase === 'cool') {
      // cooling gauge
      const gx = 960, gy = 300, gw = 40, gh = 300, [a, b] = coolBand();
      x.save();
      x.fillStyle = '#fbf6ea'; x.beginPath(); x.roundRect(gx - 14, gy - 40, gw + 120, gh + 70, 14); x.fill();
      x.fillStyle = INK; x.font = `600 16px ${F.serif}`; x.fillText('wax', gx - 2, gy - 14);
      const yOf = (v) => gy + gh - (v / 1.15) * gh;
      x.fillStyle = '#e79a6a'; x.fillRect(gx, yOf(a), gw, gh - (yOf(a) - gy));
      x.fillStyle = '#7f9c5b'; x.fillRect(gx, yOf(b), gw, yOf(a) - yOf(b));
      x.fillStyle = '#b8b2c8'; x.fillRect(gx, gy, gw, yOf(b) - gy);
      x.font = `19px ${F.hand}`;
      x.fillText('too hot', gx + gw + 10, yOf(a / 2) + 6); x.fillText('just right', gx + gw + 10, yOf((a + b) / 2) + 6); x.fillText('too cold', gx + gw + 10, yOf((b + 1.15) / 2) + 6);
      const y = yOf(cool);
      x.fillStyle = '#c0392b'; x.fillRect(gx - 6, y - 2, gw + 12, 4);
      x.restore();
    }
    btn.draw(x, t);
    toasts.draw(x, 1280);
  },
  pointerdown(p) {
    if (phase === 'ending') {
      sfx.click();
      endIdx++;
      if (endIdx >= ENDING.length) {
        phase = 'end';
        btn = new Button({ x: 500, y: 640, w: 280, h: 60, label: 'Keep journalling →', primary: true, onClick: () => { newDay(); game.go('morning'); } });
      }
      return;
    }
    if (phase === 'end') { if (btn.hit(p)) btn.onClick(); return; }
    if (btn.hit(p)) return btn.onClick();
    if (phase === 'pour') { pouring = true; }
    else if (phase === 'cool') stamp();
  },
  pointerup() { if (phase === 'pour' && pouring) release(); },
  pointermove(p) { btn.hover = btn.hit(p); game.cursor = phase === 'pour' || phase === 'cool' || phase === 'ending' || btn.hover ? 'pointer' : 'default'; },
  keydown(e) {
    if (e.key === ' ' && phase === 'pour' && !e.repeat) pouring = true;
    else if ((e.key === ' ' || e.key === 'Enter') && (phase === 'cool' || phase === 'ending' || phase === 'end')) this.pointerdown({ x: -1, y: -1 });
  },
  keyup(e) { if (e.key === ' ' && phase === 'pour' && pouring) release(); },
};

function release() {
  pouring = false;
  if (pool < 18) return; // a tiny drip doesn't count; keep pouring
  phase = 'cool'; cool = 0;
  sfx.pop();
  toasts.add(pool < POOL_BAND[0] ? 'A little small, but it will do' : pool > POOL_BAND[1] ? 'A generous puddle!' : 'Perfect pool!', 1.8);
}

function stamp() {
  if (phase !== 'cool') return;
  const [a, b] = coolBand();
  const sizeOk = pool >= POOL_BAND[0] && pool <= POOL_BAND[1];
  let q, why;
  if (cool < a) { q = 'smudged'; why = 'too hot, the wax squished out of shape'; }
  else if (cool > b) { q = 'cracked'; why = 'too cold, the seal cracked a little'; }
  else if (sizeOk) { q = 'perfect'; why = 'a crisp, perfect seal ✿'; }
  else { q = 'good'; why = 'a lovely seal, a bit ' + (pool < POOL_BAND[0] ? 'small' : 'big'); }
  result = { q, why };
  phase = 'stamped'; stampK = 0;
  game.day.stats.seal = q;
  sfx.thunk();
  if (q === 'perfect') setTimeout(() => sfx.chime(), 250); else if (q === 'good') sfx.good(); else sfx.bad();
  btn.visible = true;
}

function drawEnding(x) {
  x.fillStyle = '#2b211b'; x.fillRect(0, 0, 1280, 800);
  // two hands on one journal
  x.save();
  x.translate(640, 330);
  x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(-300 + 8, -150 + 12, 600, 300);
  x.fillStyle = '#f8f2e4'; x.fillRect(-300, -150, 600, 300);
  x.fillStyle = 'rgba(60,35,15,.25)'; x.fillRect(-4, -150, 8, 300);
  x.fillStyle = '#e98fb6'; x.save(); x.translate(-160, -40); x.rotate(-0.1); x.fillRect(-60, -50, 120, 100); x.restore();
  x.fillStyle = '#f3d9a4'; x.save(); x.translate(150, 20); x.rotate(0.08); x.fillRect(-70, -30, 140, 60); x.restore();
  x.save(); x.translate(-150, 40); drawHand(x, { pose: 'point', s: 0.85, rot: 0.35 }); x.restore();
  x.save(); x.translate(170, 60); drawHand(x, { pose: 'pinch', s: 0.85, flip: true, rot: 0.3, elder: true }); x.restore();
  x.restore();
  x.save(); x.translate(1040, 520); drawCat(x, { pose: 'loaf', t, dir: -1, s: 1 }); x.restore();
  if (phase === 'ending') {
    x.save();
    x.fillStyle = '#fbf6e6'; x.fillRect(190, 540, 900, 120);
    x.fillStyle = '#3b3550'; x.font = `32px ${F.hand}`; x.textAlign = 'center';
    const words = ENDING[endIdx].split(' ');
    let line = '', y = 590;
    for (const w of words) { if (x.measureText(line + w).width > 820) { x.fillText(line, 640, y); line = ''; y += 40; } line += w + ' '; }
    x.fillText(line, 640, y);
    x.font = `600 14px ${F.serif}`; x.fillStyle = 'rgba(58,46,40,.6)'; x.fillText('tap to continue', 640, 650);
    x.restore();
  } else {
    x.save();
    x.fillStyle = '#fdf7ea'; x.textAlign = 'center';
    x.font = `600 52px ${F.serif}`; x.fillText('the end', 640, 560);
    x.font = `28px ${F.hand}`; x.fillText('thank you for playing Gomi & Mochi ✿', 640, 604);
    x.restore();
    btn.draw(x, t);
  }
}
