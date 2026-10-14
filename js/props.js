// Top-down desk props that sit around the journal.
import { mk, rr, TAU, grain, bake } from './textures.js';
import { drawFlower } from './flowers.js';

function matchaCup() {
  const s = 150, c = mk(s, s), x = c.getContext('2d');
  x.translate(70, 75);
  // handle
  x.strokeStyle = '#e9e2d4'; x.lineWidth = 13; x.lineCap = 'round';
  x.beginPath(); x.arc(52, 4, 18, -1.2, 1.3); x.stroke();
  x.strokeStyle = 'rgba(0,0,0,.12)'; x.lineWidth = 2; x.beginPath(); x.arc(52, 4, 24, -1.1, 1.2); x.stroke();
  // cup
  const g = x.createRadialGradient(-14, -16, 6, 0, 0, 58);
  g.addColorStop(0, '#fbf8f1'); g.addColorStop(1, '#ddd4c2');
  x.fillStyle = g; x.beginPath(); x.arc(0, 0, 56, 0, TAU); x.fill();
  x.strokeStyle = 'rgba(80,60,40,.18)'; x.lineWidth = 2; x.stroke();
  x.fillStyle = '#5f8a4a'; x.beginPath(); x.arc(0, 0, 46, 0, TAU); x.fill();
  const m = x.createRadialGradient(-10, -10, 2, 0, 0, 44);
  m.addColorStop(0, '#a9c978'); m.addColorStop(1, '#7da35a');
  x.fillStyle = m; x.beginPath(); x.arc(0, 0, 43, 0, TAU); x.fill();
  // foam heart
  x.fillStyle = 'rgba(236,242,214,.92)';
  x.beginPath(); x.moveTo(0, 20); x.bezierCurveTo(-30, 0, -18, -26, 0, -10); x.bezierCurveTo(18, -26, 30, 0, 0, 20); x.fill();
  x.strokeStyle = 'rgba(255,255,255,.5)'; x.lineWidth = 3; x.beginPath(); x.arc(0, 0, 52, 3.6, 4.6); x.stroke();
  return bake(grain(c, 8), { pad: 12, blur: 14, off: 6, alpha: 0.35 });
}

function pencil() {
  const w = 300, h = 26, c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = '#9fbf8a'; x.fillRect(30, 3, 230, 20);
  x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(30, 5, 230, 5);
  x.fillStyle = 'rgba(0,0,0,.1)'; x.fillRect(30, 17, 230, 6);
  x.fillStyle = '#c9c9cf'; x.fillRect(260, 3, 18, 20);
  x.fillStyle = '#e89aa0'; x.beginPath(); x.roundRect(276, 3, 22, 20, 5); x.fill();
  x.fillStyle = '#e8cfa6'; x.beginPath(); x.moveTo(30, 3); x.lineTo(4, 13); x.lineTo(30, 23); x.fill();
  x.fillStyle = '#3a3a40'; x.beginPath(); x.moveTo(12, 10); x.lineTo(2, 13); x.lineTo(12, 16); x.fill();
  return bake(c, { pad: 8, blur: 6, off: 4, alpha: 0.35 });
}

function scissors() {
  const w = 220, h = 120, c = mk(w, h), x = c.getContext('2d');
  x.translate(70, 60);
  x.fillStyle = '#c9cad2'; x.strokeStyle = 'rgba(60,60,70,.4)'; x.lineWidth = 1.5;
  for (const s of [-1, 1]) {
    x.save(); x.rotate(s * 0.16);
    x.beginPath(); x.moveTo(0, -5 * s); x.lineTo(140, -2 * s); x.lineTo(140, 2 * s); x.lineTo(0, 7 * s); x.closePath(); x.fill(); x.stroke();
    x.restore();
  }
  x.fillStyle = '#7a7a84'; x.beginPath(); x.arc(4, 0, 5, 0, TAU); x.fill();
  x.strokeStyle = '#e88aa0'; x.lineWidth = 9;
  for (const s of [-1, 1]) { x.beginPath(); x.ellipse(-32, s * 24, 24, 15, s * 0.3, 0, TAU); x.stroke(); }
  return bake(c, { pad: 8, blur: 6, off: 4, alpha: 0.35 });
}

function mintPot() {
  const s = 190, c = mk(s, s), x = c.getContext('2d');
  x.translate(s / 2, s / 2);
  x.fillStyle = '#c4703f'; x.beginPath(); x.arc(0, 0, 62, 0, TAU); x.fill();
  x.fillStyle = '#b05f33'; x.beginPath(); x.arc(0, 0, 52, 0, TAU); x.fill();
  x.fillStyle = '#5a3e2b'; x.beginPath(); x.arc(0, 0, 48, 0, TAU); x.fill();
  for (let i = 0; i < 16; i++) {
    const a = i * 2.4 + rr(-0.2, 0.2), d = 8 + (i % 4) * 14;
    x.save(); x.translate(Math.cos(a) * d * 0.6, Math.sin(a) * d * 0.6); x.rotate(a + Math.PI / 2);
    const g = x.createLinearGradient(0, 0, 0, -40); g.addColorStop(0, '#5c9a52'); g.addColorStop(1, '#9bd28a');
    x.fillStyle = g;
    x.beginPath(); x.ellipse(0, -22, 14, 24, 0, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(255,255,230,.35)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, -2); x.lineTo(0, -42); x.stroke();
    x.restore();
  }
  return bake(grain(c, 8), { pad: 12, blur: 14, off: 6, alpha: 0.35 });
}

function candle() {
  const s = 110, c = mk(s, s), x = c.getContext('2d');
  x.translate(s / 2, s / 2);
  x.fillStyle = '#b9bcc6'; x.beginPath(); x.arc(0, 0, 40, 0, TAU); x.fill();
  x.fillStyle = '#f4ecdc'; x.beginPath(); x.arc(0, 0, 35, 0, TAU); x.fill();
  x.fillStyle = 'rgba(200,170,120,.25)'; x.beginPath(); x.arc(0, 0, 18, 0, TAU); x.fill();
  x.fillStyle = '#3a2e28'; x.fillRect(-1.5, -6, 3, 8);
  return bake(c, { pad: 10, blur: 10, off: 5, alpha: 0.35 });
}

function sealStamp() {
  const s = 110, c = mk(s, s), x = c.getContext('2d');
  x.translate(s / 2, s / 2);
  const g = x.createRadialGradient(-10, -10, 4, 0, 0, 40);
  g.addColorStop(0, '#c99a6a'); g.addColorStop(1, '#7d5634');
  x.fillStyle = g; x.beginPath(); x.arc(0, 0, 36, 0, TAU); x.fill();
  x.strokeStyle = 'rgba(40,20,5,.35)'; x.lineWidth = 2;
  for (let r = 8; r < 34; r += 7) { x.beginPath(); x.arc(2, 1, r, 0, TAU); x.stroke(); }
  x.fillStyle = '#d4af5a'; x.beginPath(); x.arc(0, 0, 10, 0, TAU); x.fill();
  return bake(grain(c, 10), { pad: 10, blur: 10, off: 5, alpha: 0.35 });
}

function waxSticks() {
  const w = 130, h = 70, c = mk(w, h), x = c.getContext('2d');
  ['#9b2335', '#c8962e', '#2f4f7f'].forEach((col, i) => {
    x.save(); x.translate(10, 14 + i * 18); x.rotate(-0.05 + i * 0.04);
    x.fillStyle = col; x.beginPath(); x.roundRect(0, 0, 110, 13, 6); x.fill();
    x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(4, 2, 100, 3);
    x.restore();
  });
  return bake(c, { pad: 8, blur: 6, off: 3, alpha: 0.3 });
}

let cache = null;
export function deskProps() {
  if (cache) return cache;
  cache = {
    cup: matchaCup(), pencil: pencil(), scissors: scissors(), mint: mintPot(),
    candle: candle(), stamp: sealStamp(), wax: waxSticks(),
  };
  return cache;
}

// A matcha ring left on the page when the cup gets knocked.
export function matchaRing() {
  const c = mk(150, 150), x = c.getContext('2d');
  for (let i = 0; i < 3; i++) {
    x.strokeStyle = `rgba(110,150,70,${rr(0.15, 0.3)})`; x.lineWidth = rr(2, 6);
    x.beginPath(); x.arc(75 + rr(-2, 2), 75 + rr(-2, 2), rr(48, 54), rr(0, 1), rr(5.2, TAU + 0.5)); x.stroke();
  }
  x.fillStyle = 'rgba(120,160,70,.07)'; x.beginPath(); x.arc(75, 75, 50, 0, TAU); x.fill();
  x.fillStyle = 'rgba(110,150,70,.3)';
  for (let i = 0; i < 8; i++) { x.beginPath(); x.arc(75 + rr(-70, 70), 75 + rr(-70, 70), rr(1, 5), 0, TAU); x.fill(); }
  return c;
}
