// Junk-journal scraps, washi tape and ink stamps. Every call makes a fresh variant.
import { mk, rr, ri, pick, TAU, grain, inkWear, tornPoly, pathPoly, bake } from './textures.js';
import { drawFlower, FLOWER_TYPES } from './flowers.js';
import { drawCat } from './cat.js';
import { F } from './ui.js';

const INK = '#3a2e28';
const today = () => new Date();
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/* ---------- scraps ---------- */

function ticket() {
  const w = 250, h = 104, c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = pick(['#f3d9a4', '#f2b8b0', '#bcd8c8', '#c9d3ee', '#f6e7a1', '#e3c9ef']);
  x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(60,40,30,.5)'; x.lineWidth = 1.5;
  x.strokeRect(9, 9, w - 18, h - 18);
  x.setLineDash([3, 4]);
  x.beginPath(); x.moveTo(186, 4); x.lineTo(186, h - 4); x.stroke();
  x.setLineDash([]);
  x.fillStyle = INK;
  x.font = `22px ${F.type}`;
  x.fillText('ADMIT ONE', 22, 44);
  x.font = `12px ${F.type}`;
  x.fillText(pick(['ROLLER RINK · NIGHT SKATE', 'ICE RINK · 7PM SESSION', 'GREENHOUSE · DAY PASS', 'FLOWER MARKET · SAT', 'NIGHT TRAIN · CAR 3', 'FIGURE FAIR · HALL B', 'SKATE PARK · ALL DAY']), 22, 68);
  x.fillText('No. ' + String(ri(1000, 99999)).padStart(6, '0'), 22, 86);
  x.save(); x.translate(216, h / 2); x.rotate(-Math.PI / 2);
  x.font = `15px ${F.type}`; x.textAlign = 'center'; x.fillText('Nº ' + ri(10, 99), 0, 5);
  x.restore();
  x.globalCompositeOperation = 'destination-out';
  for (const [a, b] of [[0, h / 2], [w, h / 2], [186, 0], [186, h]]) { x.beginPath(); x.arc(a, b, 9, 0, TAU); x.fill(); }
  x.globalCompositeOperation = 'source-over';
  return bake(grain(c, 14));
}

function receipt() {
  const pool = [['MATCHA LATTE', 5.5], ['ICED HOJICHA', 5.2], ['OAT FLAT WHITE', 4.8], ['CORTADO', 4.2], ['YUZU TONIC', 5.0],
    ['MOCHI x2', 4.0], ['CROISSANT', 3.6], ['BASIL SEEDS', 2.9], ['MINT PLANT', 6.5], ['SEALING WAX', 7.0], ['WASHI TAPE', 3.5], ['ORIGAMI PAPER', 4.5]];
  const items = pool.sort(() => Math.random() - 0.5).slice(0, ri(3, 4));
  const w = 170, h = 150 + items.length * 20, c = mk(w, h), x = c.getContext('2d');
  const pts = [];
  for (let px = 0; px <= w; px += 8) pts.push([px, (px / 8) % 2 ? 5 : 0]);
  for (let px = w; px >= 0; px -= 8) pts.push([px, h - ((px / 8) % 2 ? 5 : 0)]);
  pathPoly(x, pts);
  x.fillStyle = '#fbfaf4'; x.fill();
  x.fillStyle = 'rgba(70,70,80,.85)';
  x.textAlign = 'center';
  x.font = `15px ${F.type}`; x.fillText('TWIG & LEAF CAFÉ', w / 2, 30);
  x.font = `10px ${F.type}`; x.fillText('tea · coffee · plants', w / 2, 45);
  const d = today();
  x.fillText(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}  ${ri(8, 11)}:${String(ri(0, 59)).padStart(2, '0')}`, w / 2, 60);
  x.textAlign = 'left';
  let y = 84, total = 0;
  x.font = `11px ${F.type}`;
  for (const [n, p] of items) {
    x.fillText(n, 12, y);
    x.textAlign = 'right'; x.fillText(p.toFixed(2), w - 12, y); x.textAlign = 'left';
    total += p; y += 20;
  }
  x.setLineDash([2, 3]); x.strokeStyle = 'rgba(70,70,80,.6)';
  x.beginPath(); x.moveTo(12, y - 10); x.lineTo(w - 12, y - 10); x.stroke(); x.setLineDash([]);
  x.font = `13px ${F.type}`;
  x.fillText('TOTAL', 12, y + 8);
  x.textAlign = 'right'; x.fillText(total.toFixed(2), w - 12, y + 8);
  x.textAlign = 'center'; x.font = `11px ${F.type}`;
  x.fillText('THANK YOU ♥', w / 2, y + 32);
  for (let bx = 28; bx < w - 28; bx += ri(2, 4)) x.fillRect(bx, y + 42, ri(1, 2), 18);
  return bake(grain(c, 10));
}

function sealIcon(x, kind, s) {
  x.beginPath();
  if (kind === 'heart') {
    x.moveTo(0, s * 0.7);
    x.bezierCurveTo(-s * 1.3, -s * 0.2, -s * 0.5, -s * 1.1, 0, -s * 0.35);
    x.bezierCurveTo(s * 0.5, -s * 1.1, s * 1.3, -s * 0.2, 0, s * 0.7);
  } else if (kind === 'star') {
    for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU - Math.PI / 2, rad = i % 2 ? s * 0.42 : s; x.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); }
  } else if (kind === 'leaf') {
    x.moveTo(0, s); x.bezierCurveTo(s, s * 0.2, s * 0.8, -s * 0.8, 0, -s); x.bezierCurveTo(-s * 0.8, -s * 0.8, -s, s * 0.2, 0, s);
  } else if (kind === 'flower') {
    for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; x.moveTo(Math.cos(a) * s * 0.55 + s * 0.42, Math.sin(a) * s * 0.55); x.arc(Math.cos(a) * s * 0.55, Math.sin(a) * s * 0.55, s * 0.42, 0, TAU); }
  } else if (kind === 'cat') {
    x.ellipse(0, s * 0.15, s * 0.8, s * 0.65, 0, 0, TAU);
    x.moveTo(-s * 0.75, -s * 0.05); x.lineTo(-s * 0.55, -s * 0.95); x.lineTo(-s * 0.15, -s * 0.45);
    x.moveTo(s * 0.75, -s * 0.05); x.lineTo(s * 0.55, -s * 0.95); x.lineTo(s * 0.15, -s * 0.45);
  } else {
    x.arc(0, 0, s * 0.85, Math.PI * 0.3, Math.PI * 1.7); x.arc(s * 0.35, 0, s * 0.62, Math.PI * 1.55, Math.PI * 0.45, true);
  }
  x.closePath();
}

function waxSeal() {
  const s = 108, c = mk(s, s), x = c.getContext('2d');
  const [base, light, dark] = pick([
    ['#9b2335', '#d26070', '#5a0f1e'], ['#2f4f7f', '#6a8cc0', '#14284a'], ['#6f8a3a', '#a9c06a', '#3b4d18'],
    ['#c8962e', '#f0cf73', '#7d5a10'], ['#6b4a8a', '#a585c6', '#3a2252'], ['#2a2a30', '#6a6a76', '#0d0d10'], ['#c8707e', '#efb0b9', '#80384a'],
  ]);
  const kind = pick(['heart', 'star', 'leaf', 'flower', 'cat', 'moon']);
  x.translate(s / 2, s / 2);
  const p1 = rr(0, TAU), p2 = rr(0, TAU);
  x.beginPath();
  for (let a = 0; a <= TAU + 0.01; a += 0.08) {
    const rad = 46 + Math.sin(a * 3 + p1) * 3 + Math.sin(a * 7 + p2) * 2 + rr(-0.6, 0.6);
    a ? x.lineTo(Math.cos(a) * rad, Math.sin(a) * rad) : x.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  x.closePath();
  const g = x.createRadialGradient(-14, -16, 4, 0, 0, 52);
  g.addColorStop(0, light); g.addColorStop(0.45, base); g.addColorStop(1, dark);
  x.fillStyle = g; x.fill();
  x.lineWidth = 3;
  x.strokeStyle = dark; x.beginPath(); x.arc(1, 1, 32, 0, TAU); x.stroke();
  x.strokeStyle = light; x.beginPath(); x.arc(-1, -1, 32, Math.PI * 0.9, Math.PI * 1.7); x.stroke();
  x.fillStyle = base; x.beginPath(); x.arc(0, 0, 30.5, 0, TAU); x.fill();
  for (const [o, col] of [[1.5, dark], [-1.2, light], [0, base]]) {
    x.save(); x.translate(o, o); x.fillStyle = col; sealIcon(x, kind, 17); x.fill(); x.restore();
  }
  return bake(grain(c, 10), { pad: 8, blur: 5, off: 2, alpha: 0.35 });
}

function postage() {
  const w = 118, h = 146, c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = '#fffdf6'; x.fillRect(0, 0, w, h);
  x.fillStyle = pick(['#cfe3d0', '#f3d7cf', '#d8d4ef', '#f4e6b8', '#cfe0ef']);
  x.fillRect(12, 12, w - 24, h - 24);
  x.save(); x.translate(w / 2, h / 2 - 6);
  drawFlower(x, pick(FLOWER_TYPES), 30);
  x.restore();
  x.fillStyle = INK;
  x.font = `600 18px ${F.serif}`; x.fillText(String(ri(5, 80)), 18, 34);
  x.font = `10px ${F.type}`; x.textAlign = 'center'; x.fillText('FLORA POST', w / 2, h - 20);
  x.globalCompositeOperation = 'destination-out';
  for (let px = 5; px < w; px += 10) { x.beginPath(); x.arc(px, 0, 4, 0, TAU); x.arc(px, h, 4, 0, TAU); x.fill(); }
  for (let py = 5; py < h; py += 10) { x.beginPath(); x.arc(0, py, 4, 0, TAU); x.arc(w, py, 4, 0, TAU); x.fill(); }
  x.globalCompositeOperation = 'source-over';
  return bake(grain(c, 10), { pad: 10, blur: 5, off: 2 });
}

function polaroid() {
  const w = 170, h = 202, c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = '#fbfaf6'; x.fillRect(0, 0, w, h);
  const P = { x: 12, y: 12, w: 146, h: 146 };
  x.save();
  x.beginPath(); x.rect(P.x, P.y, P.w, P.h); x.clip();
  x.translate(P.x, P.y);
  const subject = pick(['plant', 'matcha', 'cat', 'coffee', 'skate', 'flowers']);
  let caption = '';
  if (subject === 'plant') {
    const g = x.createLinearGradient(0, 0, 0, 146); g.addColorStop(0, '#dfe9dc'); g.addColorStop(1, '#c4d6c2'); x.fillStyle = g; x.fillRect(0, 0, 146, 146);
    x.fillStyle = '#e8ddc9'; x.fillRect(0, 112, 146, 34);
    for (const [lx, ly, a, sz] of [[73, 70, -0.6, 34], [73, 70, 0.5, 38], [73, 70, -0.1, 42], [73, 74, 1.1, 28], [73, 74, -1.2, 28]]) {
      x.save(); x.translate(lx, ly + 30); x.rotate(a);
      x.fillStyle = '#3f7a4a'; x.beginPath(); x.ellipse(0, -sz, sz * 0.62, sz, 0, 0, TAU); x.fill();
      x.strokeStyle = '#dfe9dc'; x.lineWidth = 3;
      for (let k = -2; k <= 2; k++) { if (!k) continue; x.beginPath(); x.moveTo(k * sz * 0.18, -sz * 1.1 - k * 2); x.lineTo(k * sz * 0.55, -sz + k * 8); x.stroke(); }
      x.restore();
    }
    x.fillStyle = '#c4703f'; x.beginPath(); x.moveTo(50, 106); x.lineTo(96, 106); x.lineTo(90, 140); x.lineTo(56, 140); x.closePath(); x.fill();
    caption = pick(['new leaf!!', 'monstera era', 'plant baby']);
  } else if (subject === 'matcha' || subject === 'coffee') {
    x.fillStyle = subject === 'matcha' ? '#e8dcc6' : '#d6c2a4'; x.fillRect(0, 0, 146, 146);
    x.fillStyle = 'rgba(120,80,40,.18)'; for (let i = 0; i < 6; i++) x.fillRect(0, i * 26 + 8, 146, 2);
    x.fillStyle = '#f4f1ea'; x.beginPath(); x.arc(73, 73, 52, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(0,0,0,.12)'; x.lineWidth = 2; x.stroke();
    x.fillStyle = subject === 'matcha' ? '#8fb35a' : '#6b4226'; x.beginPath(); x.arc(73, 73, 40, 0, TAU); x.fill();
    x.fillStyle = subject === 'matcha' ? '#e2ebc6' : '#ead7bc';
    x.beginPath(); x.moveTo(73, 92); x.bezierCurveTo(44, 72, 58, 50, 73, 64); x.bezierCurveTo(88, 50, 102, 72, 73, 92); x.fill();
    caption = subject === 'matcha' ? pick(['sunday matcha', 'matcha o\'clock', 'whisked it myself']) : pick(['oat flat white', 'coffee first', 'café day']);
  } else if (subject === 'cat') {
    const g = x.createLinearGradient(0, 0, 0, 146); g.addColorStop(0, '#cfe1ef'); g.addColorStop(1, '#eef3f6'); x.fillStyle = g; x.fillRect(0, 0, 146, 146);
    x.strokeStyle = '#fff'; x.lineWidth = 6; x.strokeRect(10, -4, 126, 104); x.beginPath(); x.moveTo(73, -4); x.lineTo(73, 100); x.stroke();
    x.fillStyle = '#d8c3a5'; x.fillRect(0, 100, 146, 46);
    x.save(); x.translate(70, 128); drawCat(x, { pose: 'loaf', t: 1, dir: 1, s: 0.75 }); x.restore();
    caption = pick(['mochi :3', 'sun loaf', 'my assistant']);
  } else if (subject === 'skate') {
    x.fillStyle = '#bcd6e8'; x.fillRect(0, 0, 146, 90); x.fillStyle = '#9a9aa2'; x.fillRect(0, 90, 146, 56);
    x.strokeStyle = '#f2f2f2'; x.lineWidth = 3; x.setLineDash([12, 10]); x.beginPath(); x.moveTo(0, 120); x.lineTo(146, 120); x.stroke(); x.setLineDash([]);
    x.fillStyle = pick(['#f4a9b8', '#a9d8c8', '#f6d27a']);
    x.beginPath(); x.moveTo(42, 40); x.lineTo(70, 40); x.lineTo(72, 74); x.lineTo(108, 80); x.quadraticCurveTo(116, 96, 104, 98); x.lineTo(40, 98); x.closePath(); x.fill();
    x.strokeStyle = '#fff'; x.lineWidth = 2; for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(52, 48 + k * 8); x.lineTo(66, 50 + k * 8); x.stroke(); }
    x.fillStyle = '#fafafa'; for (const wx of [52, 92]) { x.beginPath(); x.arc(wx, 106, 10, 0, TAU); x.fill(); }
    caption = pick(['rink night', 'skate date', 'new wheels']);
  } else {
    x.fillStyle = '#f1e8dc'; x.fillRect(0, 0, 146, 146);
    x.fillStyle = '#a9c4d8'; x.beginPath(); x.moveTo(52, 70); x.lineTo(94, 70); x.lineTo(88, 140); x.lineTo(58, 140); x.closePath(); x.fill();
    for (const [fx, fy, t, s] of [[60, 52, 'cosmos', 18], [88, 46, 'daisy', 18], [74, 34, 'pansy', 15]]) { x.save(); x.translate(fx, fy); drawFlower(x, t, s); x.restore(); }
    caption = pick(['market haul', 'fresh flowers', 'for the press']);
  }
  x.fillStyle = 'rgba(255,190,110,.1)'; x.fillRect(0, 0, 146, 146);
  const v = x.createRadialGradient(73, 73, 40, 73, 73, 110); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,20,0,.28)');
  x.fillStyle = v; x.fillRect(0, 0, 146, 146);
  x.restore();
  x.fillStyle = '#3b3550'; x.font = `24px ${F.hand}`; x.textAlign = 'center';
  x.fillText(caption, w / 2, h - 16);
  return bake(grain(c, 12));
}

function crane() {
  const w = 170, h = 120, c = mk(w, h), x = c.getContext('2d');
  const [base, lt, dk] = pick([['#e8768a', '#f4a3b1', '#c25168'], ['#6aa3c8', '#9cc6e2', '#3f7aa0'], ['#e9b949', '#f5d77e', '#c08d1f'], ['#86b36b', '#b0d39a', '#5d8a46'], ['#b28fd1', '#d2b8e8', '#8460a8']]);
  const poly = (pts, col) => { x.fillStyle = col; x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fill(); x.strokeStyle = 'rgba(0,0,0,.15)'; x.lineWidth = 1; x.stroke(); };
  poly([[74, 64], [40, 8], [96, 58]], lt);
  poly([[60, 72], [86, 56], [116, 72], [86, 88]], base);
  poly([[86, 56], [116, 72], [86, 72]], lt);
  poly([[62, 72], [22, 36], [74, 66]], dk);
  poly([[22, 36], [12, 48], [30, 44]], dk);
  poly([[110, 70], [160, 56], [116, 80]], base);
  poly([[96, 60], [152, 20], [108, 70]], base);
  poly([[96, 60], [152, 20], [118, 50]], lt);
  return bake(c, { pad: 10, blur: 6, off: 3, alpha: 0.25 });
}

function lace() {
  const w = 250, h = 58, c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = '#f6f0e1';
  x.beginPath(); x.moveTo(0, 0); x.lineTo(w, 0); x.lineTo(w, 36);
  for (let px = w; px >= 0; px -= 20) x.arc(px - 10, 36, 10, 0, Math.PI);
  x.closePath(); x.fill();
  x.globalCompositeOperation = 'destination-out';
  for (let px = 10; px < w; px += 20) {
    x.beginPath(); x.arc(px, 38, 4, 0, TAU); x.fill();
    for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; x.beginPath(); x.arc(px + Math.cos(a) * 5, 18 + Math.sin(a) * 5, 2.2, 0, TAU); x.fill(); }
    x.beginPath(); x.arc(px + 10, 8, 1.6, 0, TAU); x.fill();
  }
  x.globalCompositeOperation = 'source-over';
  return bake(c, { pad: 8, blur: 4, off: 2, alpha: 0.2 });
}

function kraftTag() {
  const w = 112, h = 200, c = mk(w, h + 40), x = c.getContext('2d');
  x.translate(0, 40);
  x.fillStyle = '#c49a6c';
  x.beginPath(); x.moveTo(24, 0); x.lineTo(w - 24, 0); x.lineTo(w, 24); x.lineTo(w, h); x.lineTo(0, h); x.lineTo(0, 24); x.closePath(); x.fill();
  x.fillStyle = '#ece0c8'; x.beginPath(); x.arc(w / 2, 26, 12, 0, TAU); x.fill();
  x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(w / 2, 26, 6, 0, TAU); x.fill(); x.globalCompositeOperation = 'source-over';
  x.strokeStyle = '#efe6d6'; x.lineWidth = 2.5;
  x.beginPath(); x.moveTo(w / 2, 22); x.bezierCurveTo(w / 2 - 30, -10, w / 2 + 40, -30, w / 2 + 20, -40); x.stroke();
  x.save(); x.translate(w / 2, h * 0.62); x.rotate(-Math.PI / 2 + 0.05);
  x.fillStyle = '#3d2a1d'; x.font = `34px ${F.hand}`; x.textAlign = 'center';
  x.fillText(pick(['hello', 'grow', 'slow days', 'bloom', 'stay soft', 'today', 'keep this']), 0, 10);
  x.restore();
  return bake(grain(c, 16));
}

function newsScrap() {
  const w = 210, h = 160, c = mk(w, h), x = c.getContext('2d');
  pathPoly(x, tornPoly(w, h, { j: 5, step: 6 }));
  x.fillStyle = '#ece6d6'; x.fill();
  x.save(); x.clip();
  x.fillStyle = '#2b2622';
  const head = pick([['LOCAL GARDEN', 'BLOOMS EARLY'], ['RINK REOPENS', 'FOR WINTER'], ['CAT NAPS', 'THROUGH STORM'], ['MATCHA PRICES', 'STEEP AGAIN'], ['FIGURE FAIR', 'DRAWS CROWDS'], ['WAX SEAL', 'REVIVAL']]);
  x.font = `700 20px ${F.serif}`;
  x.fillText(head[0], 14, 32); x.fillText(head[1], 14, 54);
  x.fillStyle = 'rgba(50,45,40,.45)';
  for (let col = 0; col < 2; col++) for (let ly = 70; ly < h - 8; ly += 7) {
    const lw = ly > h - 20 ? rr(30, 80) : rr(70, 88);
    x.fillRect(14 + col * 98, ly, lw, 2.2);
  }
  x.restore();
  return bake(grain(c, 14), { pad: 10, blur: 5, off: 2 });
}

function bujoNote() {
  const w = 192, h = 176, c = mk(w, h), x = c.getContext('2d');
  pathPoly(x, tornPoly(w, h, { j: 4, step: 5, edges: 'l' }));
  x.fillStyle = '#fbf6ea'; x.fill();
  x.fillStyle = 'rgba(80,70,60,.25)';
  for (let yy = 14; yy < h; yy += 16) for (let xx = 18; xx < w; xx += 16) { x.beginPath(); x.arc(xx, yy, 1, 0, TAU); x.fill(); }
  x.fillStyle = '#3a3a5a';
  x.font = `30px ${F.hand}`; x.fillText('today', 22, 36);
  x.strokeStyle = 'rgba(200,120,140,.6)'; x.lineWidth = 4; x.beginPath(); x.moveTo(22, 42); x.lineTo(84, 40); x.stroke();
  const tasks = ['water plants', 'matcha', 'wax seal letters', 'skate @ park', 'press flowers', 'fold cranes', 'watch anime', 'fix wire art', 'repot mint', 'waveboard'].sort(() => Math.random() - 0.5).slice(0, 4);
  x.font = `22px ${F.hand}`; x.strokeStyle = '#3a3a5a'; x.lineWidth = 1.6;
  tasks.forEach((tk, i) => {
    const y = 66 + i * 27;
    x.strokeRect(22, y - 13, 13, 13);
    if (Math.random() < 0.55) { x.beginPath(); x.moveTo(24, y - 7); x.lineTo(28, y - 2); x.lineTo(37, y - 16); x.stroke(); }
    x.fillText(tk, 44, y);
  });
  return bake(grain(c, 8));
}

function wireArt() {
  const w = 170, h = 130, c = mk(w, h), x = c.getContext('2d');
  const path = () => {
    x.beginPath();
    x.moveTo(14, 112);
    x.bezierCurveTo(30, 108, 40, 120, 52, 104);
    x.bezierCurveTo(60, 92, 44, 86, 50, 98);
    x.bezierCurveTo(56, 108, 72, 104, 85, 96);
    x.bezierCurveTo(40, 60, 50, 18, 85, 38);
    x.bezierCurveTo(120, 18, 130, 60, 85, 96);
    x.bezierCurveTo(110, 110, 130, 100, 156, 112);
  };
  x.lineCap = 'round'; x.lineJoin = 'round';
  path(); x.strokeStyle = '#4b4b52'; x.lineWidth = 4.5; x.stroke();
  x.save(); x.translate(-0.8, -0.8); path(); x.strokeStyle = 'rgba(220,220,230,.8)'; x.lineWidth = 1.2; x.stroke(); x.restore();
  return bake(c, { pad: 8, blur: 3, off: 3, alpha: 0.3 });
}

function leather() {
  const w = 184, h = 80, c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = pick(['#8a5a36', '#6e4426', '#a8744a']);
  x.beginPath(); x.roundRect(0, 0, w, h, 10); x.fill();
  x.save(); x.clip();
  for (let i = 0; i < 500; i++) { x.fillStyle = `rgba(30,15,5,${rr(0.05, 0.2)})`; x.fillRect(rr(0, w), rr(0, h), rr(1, 3), rr(1, 2)); }
  x.restore();
  x.strokeStyle = '#ead9b6'; x.lineWidth = 2; x.setLineDash([7, 5]);
  x.beginPath(); x.roundRect(9, 9, w - 18, h - 18, 6); x.stroke(); x.setLineDash([]);
  x.font = `italic 600 26px ${F.serif}`; x.textAlign = 'center';
  const word = pick(['handmade', 'made slow', 'est. 2026']);
  x.fillStyle = 'rgba(20,10,0,.55)'; x.fillText(word, w / 2 + 1, h / 2 + 10);
  x.fillStyle = 'rgba(255,230,190,.25)'; x.fillText(word, w / 2 - 1, h / 2 + 8);
  return bake(grain(c, 18));
}

function teaBag() {
  const w = 120, h = 190, c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = '#efe7d4'; x.beginPath(); x.roundRect(14, 82, 92, 100, 6); x.fill();
  x.strokeStyle = 'rgba(160,140,100,.35)'; x.lineWidth = 1;
  for (let k = 18; k < 104; k += 5) { x.beginPath(); x.moveTo(k, 84); x.lineTo(k, 180); x.stroke(); }
  x.fillStyle = 'rgba(95,130,60,.55)';
  for (let i = 0; i < 70; i++) { x.beginPath(); x.ellipse(rr(26, 94), rr(118, 172), rr(1.5, 3.5), rr(1, 2), rr(0, 3), 0, TAU); x.fill(); }
  x.strokeStyle = '#e9e3d6'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(60, 84); x.bezierCurveTo(70, 60, 40, 50, 60, 46); x.stroke();
  x.fillStyle = '#8fae6a'; x.fillRect(30, 8, 60, 40);
  x.fillStyle = '#f7f3e6'; x.font = `600 15px ${F.serif}`; x.textAlign = 'center'; x.fillText('matcha', 60, 33);
  return bake(grain(c, 10));
}

function sticker() {
  const s = 110, c = mk(s, s), x = c.getContext('2d');
  x.translate(s / 2, s / 2);
  const kind = pick(['mushroom', 'cloud', 'onigiri', 'strawberry', 'succulent', 'sparkle']);
  const shape = (fill, stroke) => {
    x.save();
    if (stroke) { x.lineWidth = 9; x.strokeStyle = '#fff'; x.lineJoin = 'round'; }
    const draw = (f) => { x.fillStyle = f; x.fill(); if (stroke) x.stroke(); };
    if (kind === 'mushroom') {
      x.beginPath(); x.roundRect(-12, 0, 24, 30, 8); draw(fill ? '#f4ead8' : '#fff');
      x.beginPath(); x.ellipse(0, 0, 38, 26, 0, Math.PI, 0); x.closePath(); draw(fill ? '#e0584a' : '#fff');
      if (fill) { x.fillStyle = '#fff'; for (const [a, b, r] of [[-18, -10, 5], [6, -16, 6], [20, -6, 4]]) { x.beginPath(); x.arc(a, b, r, 0, TAU); x.fill(); } }
    } else if (kind === 'cloud') {
      x.beginPath(); x.arc(-18, 6, 18, 0, TAU); x.arc(4, -6, 24, 0, TAU); x.arc(24, 8, 16, 0, TAU); x.rect(-18, 6, 42, 18); draw(fill ? '#cfe3f3' : '#fff');
    } else if (kind === 'onigiri') {
      x.beginPath(); x.moveTo(0, -34); x.quadraticCurveTo(40, 28, 26, 30); x.lineTo(-26, 30); x.quadraticCurveTo(-40, 28, 0, -34); draw(fill ? '#fbfaf5' : '#fff');
      if (fill) { x.fillStyle = '#2d3b33'; x.fillRect(-16, 10, 32, 21); }
    } else if (kind === 'strawberry') {
      x.beginPath(); x.moveTo(0, 34); x.bezierCurveTo(-40, 4, -30, -26, 0, -20); x.bezierCurveTo(30, -26, 40, 4, 0, 34); draw(fill ? '#e2475a' : '#fff');
      if (fill) { x.fillStyle = '#6fae63'; x.beginPath(); x.ellipse(0, -22, 16, 6, 0, 0, TAU); x.fill(); x.fillStyle = '#fbe2a0'; for (let i = 0; i < 9; i++) { x.beginPath(); x.ellipse(rr(-16, 16), rr(-10, 22), 1.5, 2.5, 0, 0, TAU); x.fill(); } }
    } else if (kind === 'succulent') {
      x.beginPath(); x.roundRect(-20, 6, 40, 28, 4); draw(fill ? '#d1875a' : '#fff');
      for (const a of [-1.1, -0.5, 0, 0.5, 1.1]) { x.save(); x.rotate(a); x.beginPath(); x.ellipse(0, -14, 9, 20, 0, 0, TAU); draw(fill ? (a ? '#8fbf8a' : '#a9d3a2') : '#fff'); x.restore(); }
    } else {
      x.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU, rad = i % 2 ? 12 : 36; x.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); } x.closePath(); draw(fill ? '#f6d27a' : '#fff');
    }
    x.restore();
  };
  shape(false, true);
  shape(true, false);
  return bake(c, { pad: 8, blur: 4, off: 2, alpha: 0.3 });
}

export const SCRAPS = [
  { id: 'ticket', label: 'ticket', make: ticket },
  { id: 'receipt', label: 'café receipt', make: receipt },
  { id: 'seal', label: 'wax seal', make: waxSeal },
  { id: 'postage', label: 'stamp', make: postage },
  { id: 'polaroid', label: 'polaroid', make: polaroid },
  { id: 'crane', label: 'origami crane', make: crane },
  { id: 'lace', label: 'lace', make: lace },
  { id: 'tag', label: 'kraft tag', make: kraftTag },
  { id: 'news', label: 'newspaper', make: newsScrap },
  { id: 'bujo', label: 'bujo list', make: bujoNote },
  { id: 'wire', label: 'wire heart', make: wireArt },
  { id: 'leather', label: 'leather label', make: leather },
  { id: 'tea', label: 'tea bag', make: teaBag },
  { id: 'sticker', label: 'sticker', make: sticker },
];

/* ---------- washi tape ---------- */

const TW = 34;
function washiTile(p) {
  const w = 64, c = mk(w, TW), x = c.getContext('2d');
  x.fillStyle = p.base; x.fillRect(0, 0, w, TW);
  p.draw(x, w, TW);
  return c;
}
export const WASHI = [
  { label: 'matcha stripe', base: '#bcd29b', draw(x, w, h) { x.fillStyle = '#93b06c'; for (let i = -2; i < 6; i++) { x.beginPath(); x.moveTo(i * 16, h); x.lineTo(i * 16 + 8, h); x.lineTo(i * 16 + 8 + h, 0); x.lineTo(i * 16 + h, 0); x.fill(); } } },
  { label: 'rose dots', base: '#f2c4c0', draw(x) { x.fillStyle = '#fff'; for (const [a, b] of [[8, 9], [24, 25], [40, 9], [56, 25]]) { x.beginPath(); x.arc(a, b, 4, 0, TAU); x.fill(); } } },
  { label: 'gingham', base: '#e8f0f8', draw(x, w, h) { x.fillStyle = 'rgba(110,150,200,.35)'; for (let i = 0; i < w; i += 16) x.fillRect(i, 0, 8, h); for (let j = 1; j < h; j += 16) x.fillRect(0, j, w, 8); } },
  { label: 'coffee beans', base: '#dcc4a2', draw(x) { for (const [a, b, r] of [[12, 10, 0.4], [36, 24, -0.5], [54, 9, 0.9], [22, 27, 1.4]]) { x.save(); x.translate(a, b); x.rotate(r); x.fillStyle = '#7a4f2e'; x.beginPath(); x.ellipse(0, 0, 6, 4, 0, 0, TAU); x.fill(); x.strokeStyle = '#d6b892'; x.lineWidth = 1; x.beginPath(); x.moveTo(-5, 0); x.quadraticCurveTo(0, 2, 5, 0); x.stroke(); x.restore(); } } },
  { label: 'gold stars', base: '#2f3b5c', draw(x) { x.fillStyle = '#f2cf6b'; for (const [a, b, s] of [[10, 10, 4], [30, 24, 3], [48, 12, 5], [58, 28, 2.5], [20, 28, 2]]) { x.beginPath(); for (let i = 0; i < 10; i++) { const an = (i / 10) * TAU - Math.PI / 2, rad = i % 2 ? s * 0.45 : s; x.lineTo(a + Math.cos(an) * rad, b + Math.sin(an) * rad); } x.fill(); } } },
  { label: 'lavender sprig', base: '#e6ddf4', draw(x) { for (const [a, b] of [[14, 26], [46, 28]]) { x.strokeStyle = '#8aa070'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(a, b); x.lineTo(a + 6, b - 20); x.stroke(); x.fillStyle = '#9b80cc'; for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(a + 2 + k * 1.2, b - 6 - k * 3.4, 2, 2.8, 0.3, 0, TAU); x.fill(); } } } },
  { label: 'kraft hello', base: '#cfae84', draw(x) { x.fillStyle = 'rgba(70,45,25,.7)'; x.font = `20px ${F.hand}`; x.fillText('hello', 8, 24); } },
  { label: 'graph paper', base: '#fbfbf6', draw(x, w, h) { x.strokeStyle = 'rgba(80,140,170,.35)'; x.lineWidth = 1; for (let i = 0; i <= w; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let j = 1; j <= h; j += 8) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); } } },
];
WASHI.forEach((p) => { p.tile = null; });

export function washiThumb(p) {
  if (!p.tile) p.tile = washiTile(p);
  const c = mk(90, 90), x = c.getContext('2d');
  x.translate(45, 45);
  // a little roll
  x.fillStyle = 'rgba(0,0,0,.15)'; x.beginPath(); x.arc(2, 4, 34, 0, TAU); x.fill();
  x.fillStyle = x.createPattern(p.tile, 'repeat');
  x.beginPath(); x.arc(0, 0, 34, 0, TAU); x.fill();
  x.fillStyle = '#f3ede0'; x.beginPath(); x.arc(0, 0, 17, 0, TAU); x.fill();
  x.strokeStyle = 'rgba(0,0,0,.12)'; x.lineWidth = 1.5; x.beginPath(); x.arc(0, 0, 17, 0, TAU); x.stroke();
  x.beginPath(); x.arc(0, 0, 34, 0, TAU); x.stroke();
  return c;
}

export function makeTapeStrip(p, len) {
  if (!p.tile) p.tile = washiTile(p);
  len = Math.max(30, Math.round(len));
  const c = mk(len, TW), x = c.getContext('2d');
  const pts = [];
  for (let y = 0; y <= TW; y += 4) pts.push([rr(0, 5), y]);
  for (let y = TW; y >= 0; y -= 4) pts.push([len - rr(0, 5), y]);
  x.beginPath();
  pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b)));
  x.closePath();
  const pat = x.createPattern(p.tile, 'repeat');
  pat.setTransform && pat.setTransform(new DOMMatrix().translate(rr(0, 64), 0));
  x.globalAlpha = 0.86;
  x.fillStyle = pat; x.fill();
  x.globalAlpha = 1;
  x.save(); x.clip();
  x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(0, 3, len, 4);
  x.fillStyle = 'rgba(0,0,0,.05)'; x.fillRect(0, TW - 3, len, 3);
  x.restore();
  return c;
}

/* ---------- stamps (ink decals) ---------- */

function inkCanvas(w, h, draw) {
  const c = mk(w, h), x = c.getContext('2d');
  draw(x, w, h);
  return inkWear(c, (w * h) / 40);
}
const INKS = ['rgba(176,52,52,.85)', 'rgba(52,72,120,.85)', 'rgba(60,60,64,.8)', 'rgba(96,120,64,.85)', 'rgba(140,80,150,.8)'];

export const STAMPS = [
  { label: 'coffee ring', make: () => {
    const c = mk(150, 150), x = c.getContext('2d');
    for (let i = 0; i < 3; i++) {
      x.strokeStyle = `rgba(120,72,30,${rr(0.12, 0.28)})`; x.lineWidth = rr(2, 6);
      x.beginPath(); x.arc(75 + rr(-2, 2), 75 + rr(-2, 2), rr(50, 56), rr(0, 1), rr(5.2, TAU + 0.5)); x.stroke();
    }
    x.fillStyle = 'rgba(150,95,45,.06)'; x.beginPath(); x.arc(75, 75, 52, 0, TAU); x.fill();
    x.fillStyle = 'rgba(120,72,30,.25)'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(75 + rr(-70, 70), 75 + rr(-70, 70), rr(1, 4), 0, TAU); x.fill(); }
    return c;
  } },
  { label: 'matcha splash', make: () => {
    const c = mk(140, 140), x = c.getContext('2d');
    x.fillStyle = 'rgba(120,160,70,.4)';
    x.beginPath();
    for (let a = 0; a <= TAU + 0.01; a += 0.15) { const rad = 30 + Math.sin(a * 5) * 6 + rr(-4, 4); x.lineTo(70 + Math.cos(a) * rad, 70 + Math.sin(a) * rad); }
    x.fill();
    for (let i = 0; i < 14; i++) { const a = rr(0, TAU), d = rr(40, 64); x.beginPath(); x.arc(70 + Math.cos(a) * d, 70 + Math.sin(a) * d, rr(1.5, 5), 0, TAU); x.fill(); }
    return c;
  } },
  { label: 'date', make: () => inkCanvas(200, 64, (x, w, h) => {
    const d = today(), ink = pick(INKS);
    x.strokeStyle = ink; x.fillStyle = ink; x.lineWidth = 3;
    x.strokeRect(6, 6, w - 12, h - 12);
    x.font = `26px ${F.type}`; x.textAlign = 'center';
    x.fillText(`${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`, w / 2, h / 2 + 9);
  }) },
  { label: 'postmark', make: () => inkCanvas(170, 120, (x) => {
    const ink = pick(INKS); x.strokeStyle = ink; x.fillStyle = ink; x.lineWidth = 2.5;
    x.beginPath(); x.arc(60, 60, 46, 0, TAU); x.stroke();
    x.beginPath(); x.arc(60, 60, 36, 0, TAU); x.stroke();
    x.font = `11px ${F.type}`; x.textAlign = 'center';
    const txt = 'PRESSED POST · FLORA · ';
    for (let i = 0; i < txt.length; i++) { const a = (i / txt.length) * TAU - Math.PI / 2; x.save(); x.translate(60 + Math.cos(a) * 41, 60 + Math.sin(a) * 41); x.rotate(a + Math.PI / 2); x.fillText(txt[i], 0, 4); x.restore(); }
    x.font = `16px ${F.type}`; x.fillText(MONTHS[today().getMonth()], 60, 58); x.fillText(String(today().getFullYear()), 60, 76);
    for (let k = 0; k < 4; k++) { x.beginPath(); for (let px = 104; px < 170; px += 4) { const py = 30 + k * 18 + Math.sin(px / 8) * 5; px === 104 ? x.moveTo(px, py) : x.lineTo(px, py); } x.stroke(); }
  }) },
  { label: 'heart', make: () => inkCanvas(90, 90, (x) => { x.fillStyle = pick(INKS); x.translate(45, 48); sealIcon(x, 'heart', 36); x.fill(); }) },
  { label: 'star', make: () => inkCanvas(90, 90, (x) => { x.fillStyle = pick(INKS); x.translate(45, 45); sealIcon(x, 'star', 38); x.fill(); }) },
  { label: 'hello', make: () => inkCanvas(160, 70, (x, w, h) => {
    const ink = pick(INKS); x.strokeStyle = ink; x.fillStyle = ink; x.lineWidth = 3;
    x.beginPath(); x.roundRect(6, 6, w - 12, h - 12, 30); x.stroke();
    x.font = `40px ${F.hand}`; x.textAlign = 'center'; x.fillText(pick(['hello!', 'lovely', 'cosy', 'thank you']), w / 2, h / 2 + 12);
  }) },
  { label: 'leaf', make: () => inkCanvas(100, 120, (x) => {
    x.fillStyle = pick(INKS); x.translate(50, 60); x.rotate(rr(-0.3, 0.3)); sealIcon(x, 'leaf', 46); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(0, 44); x.lineTo(0, -40); x.stroke();
    for (let k = -3; k <= 2; k++) { x.beginPath(); x.moveTo(0, k * 12); x.lineTo(18, k * 12 - 10); x.moveTo(0, k * 12); x.lineTo(-18, k * 12 - 10); x.stroke(); }
  }) },
];

// Muddy little paw prints, Mochi's contribution.
export function pawPrints() {
  const c = mk(150, 110), x = c.getContext('2d');
  x.fillStyle = 'rgba(110,78,50,.55)';
  for (const [px, py, a] of [[40, 70, -0.3], [100, 40, 0.2]]) {
    x.save(); x.translate(px, py); x.rotate(a);
    x.beginPath(); x.ellipse(0, 8, 13, 11, 0, 0, TAU); x.fill();
    for (const [bx, by] of [[-13, -9], [-4, -16], [6, -16], [14, -8]]) { x.beginPath(); x.ellipse(bx, by, 5, 6, 0, 0, TAU); x.fill(); }
    x.restore();
  }
  return inkWear(c, 120, 1.4);
}

/* ---------- more junk: papers, packaging, bits & bobs ---------- */

const PASTELS = ['#f3d9a4', '#f2b8b0', '#bcd8c8', '#c9d3ee', '#f6e7a1', '#e3c9ef', '#f7cfdc', '#d4e6b5'];

function tornScrap(w, h, fill, j = 5) {
  const c = mk(w, h), x = c.getContext('2d');
  pathPoly(x, tornPoly(w, h, { j, step: 6 }));
  x.save(); x.clip();
  fill(x, w, h);
  x.restore();
  return c;
}

const PATTERNS = {
  floral(x, w, h) {
    x.fillStyle = pick(['#f6e3e6', '#e8efe0', '#f4ead6', '#e6e6f4']); x.fillRect(0, 0, w, h);
    const col = pick(['#d9867d', '#8f74c4', '#e0a54a', '#6f9f8a']);
    for (let yy = 10; yy < h; yy += 34) for (let xx = (yy / 34) % 2 ? 24 : 6; xx < w; xx += 38) {
      x.fillStyle = col;
      for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; x.beginPath(); x.arc(xx + Math.cos(a) * 5, yy + Math.sin(a) * 5, 4, 0, TAU); x.fill(); }
      x.fillStyle = '#f6d36b'; x.beginPath(); x.arc(xx, yy, 2.5, 0, TAU); x.fill();
      x.fillStyle = '#8aa070'; x.beginPath(); x.ellipse(xx + 10, yy + 8, 5, 2.5, 0.6, 0, TAU); x.fill();
    }
  },
  gingham(x, w, h) {
    x.fillStyle = '#fbf8f0'; x.fillRect(0, 0, w, h);
    x.fillStyle = pick(['rgba(217,110,110,.35)', 'rgba(110,150,200,.35)', 'rgba(120,160,90,.35)', 'rgba(200,160,60,.35)']);
    for (let i = 0; i < w; i += 18) x.fillRect(i, 0, 9, h);
    for (let j = 0; j < h; j += 18) x.fillRect(0, j, w, 9);
  },
  stripes(x, w, h) {
    x.fillStyle = pick(PASTELS); x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,255,255,.6)';
    for (let i = 0; i < w + h; i += 22) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 10, 0); x.lineTo(i + 10 - h, h); x.lineTo(i - h, h); x.fill(); }
  },
  dots(x, w, h) {
    x.fillStyle = pick(['#2f3b5c', '#c8707e', '#7f9c5b', '#e0a54a']); x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,250,240,.85)';
    for (let yy = 8; yy < h; yy += 16) for (let xx = (yy / 16) % 2 ? 16 : 8; xx < w; xx += 16) { x.beginPath(); x.arc(xx, yy, 3, 0, TAU); x.fill(); }
  },
  music(x, w, h) {
    x.fillStyle = '#f2ead6'; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(50,40,30,.55)'; x.fillStyle = 'rgba(40,30,20,.75)'; x.lineWidth = 1;
    for (let s = 20; s < h - 30; s += 54) {
      for (let l = 0; l < 5; l++) { x.beginPath(); x.moveTo(0, s + l * 7); x.lineTo(w, s + l * 7); x.stroke(); }
      for (let n = 14; n < w - 6; n += rr(14, 24)) {
        const ny = s + ri(-1, 8) * 3.5;
        x.beginPath(); x.ellipse(n, ny, 4, 3, -0.4, 0, TAU); x.fill();
        x.beginPath(); x.moveTo(n + 3.5, ny); x.lineTo(n + 3.5, ny - 20); x.stroke();
      }
    }
  },
  map(x, w, h) {
    x.fillStyle = '#efe6cf'; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(140,180,200,.55)';
    x.beginPath(); x.moveTo(0, h * 0.6); x.bezierCurveTo(w * 0.3, h * 0.4, w * 0.6, h * 0.9, w, h * 0.7); x.lineTo(w, h); x.lineTo(0, h); x.fill();
    x.strokeStyle = 'rgba(190,110,80,.6)'; x.lineWidth = 2; x.setLineDash([5, 4]);
    x.beginPath(); x.moveTo(10, 20); x.bezierCurveTo(w * 0.4, 10, w * 0.3, h * 0.5, w - 20, h * 0.35); x.stroke(); x.setLineDash([]);
    x.strokeStyle = 'rgba(120,100,70,.25)'; x.lineWidth = 1;
    for (let i = 0; i < w; i += 30) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
    for (let j = 0; j < h; j += 30) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); }
    x.fillStyle = '#c0574b'; x.beginPath(); x.arc(w - 20, h * 0.35, 5, 0, TAU); x.fill();
  },
  ledger(x, w, h) {
    x.fillStyle = '#eef2e2'; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(90,140,110,.35)'; x.lineWidth = 1;
    for (let j = 14; j < h; j += 14) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); }
    x.strokeStyle = 'rgba(200,90,90,.4)';
    for (const xx of [w * 0.6, w * 0.8]) { x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx, h); x.stroke(); }
    x.fillStyle = 'rgba(60,60,80,.6)'; x.font = `11px ${F.type}`;
    for (let j = 25; j < h; j += 28) x.fillText((rr(1, 40)).toFixed(2), w * 0.62, j);
  },
};
function patternPaper(kind) {
  const w = ri(150, 210), h = ri(120, 180);
  return bake(grain(tornScrap(w, h, PATTERNS[kind]), 12), { pad: 10, blur: 5, off: 2 });
}

function magazine() {
  const w = 190, h = 230;
  const c = tornScrap(w, h, (x) => {
    const g = x.createLinearGradient(0, 0, w, h);
    const [a, b] = pick([['#f4b8a8', '#f7e0b5'], ['#b8d8e8', '#e8d8f0'], ['#c8e0b8', '#f0e8c0'], ['#e8b8c8', '#c8b8e8']]);
    g.addColorStop(0, a); g.addColorStop(1, b);
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,255,255,.35)';
    for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(rr(0, w), rr(0, h), rr(20, 60), 0, TAU); x.fill(); }
    x.fillStyle = '#2b2622'; x.font = `900 44px ${F.serif}`;
    x.fillText(pick(['SPRING', 'bloom', 'SLOW', 'cozy', 'GROW', 'soft']), 12, 60);
    x.font = `italic 16px ${F.serif}`;
    x.fillText(pick(['the little things issue', '10 ways to slow down', 'plants we love', 'a quiet weekend']), 14, 86);
    x.fillStyle = 'rgba(40,30,20,.5)';
    for (let ly = 160; ly < h - 10; ly += 8) x.fillRect(14, ly, rr(90, 160), 2.4);
  }, 6);
  return bake(grain(c, 10), { pad: 10, blur: 6, off: 2 });
}

function brochure() {
  const w = 160, h = 240, c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = '#fbf8f0'; x.fillRect(0, 0, w, h);
  const col = pick(['#7f9c5b', '#c8707e', '#4f7aa0', '#c9a24f']);
  x.fillStyle = col; x.fillRect(0, 0, w, 64);
  x.fillStyle = '#fffdf5'; x.font = `600 22px ${F.serif}`;
  x.fillText(pick(['Garden Tour', 'Tea Fest', 'Rink Night', 'Craft Fair', 'Plant Swap']), 12, 40);
  x.font = `12px ${F.serif}`; x.fillText(pick(['open every weekend', 'free entry · all welcome', 'saturday 10am–4pm']), 12, 56);
  x.save(); x.beginPath(); x.rect(12, 76, w - 24, 80); x.clip();
  x.fillStyle = '#dfe9dc'; x.fillRect(12, 76, w - 24, 80);
  x.save(); x.translate(w / 2 - 30, 116); drawFlower(x, pick(FLOWER_TYPES), 26); x.restore();
  x.save(); x.translate(w / 2 + 30, 120); drawFlower(x, pick(FLOWER_TYPES), 22); x.restore();
  x.restore();
  x.fillStyle = 'rgba(60,50,40,.5)';
  for (let ly = 172; ly < h - 16; ly += 8) x.fillRect(12, ly, rr(80, w - 24), 2.2);
  x.strokeStyle = 'rgba(0,0,0,.08)'; x.beginPath(); x.moveTo(0, h * 0.5); x.lineTo(w, h * 0.5); x.stroke();
  return bake(grain(c, 8));
}

function wrapper() {
  const w = 200, h = 90, c = mk(w, h), x = c.getContext('2d');
  const [a, b] = pick([['#e85d75', '#f7b0bd'], ['#4fa3c8', '#a8dcef'], ['#f0b33c', '#fbe08a'], ['#7cbf6a', '#c6eab4'], ['#9b7fd0', '#d4c3f2']]);
  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, b); g.addColorStop(0.45, a); g.addColorStop(0.55, a); g.addColorStop(1, b);
  x.fillStyle = g;
  x.beginPath(); x.moveTo(0, 18); x.lineTo(40, 30); x.lineTo(160, 30); x.lineTo(w, 18); x.lineTo(w, h - 18); x.lineTo(160, h - 30); x.lineTo(40, h - 30); x.lineTo(0, h - 18);
  for (let k = 0; k < 4; k++) x.lineTo(k % 2 ? 6 : 0, h - 18 - k * 14);
  x.closePath(); x.fill();
  x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(42, 36, 116, 5);
  x.fillStyle = '#fffdf5'; x.font = `700 italic 22px ${F.serif}`; x.textAlign = 'center';
  x.fillText(pick(['yum!', 'sweet', 'mochi', 'yuzu', 'berry']), w / 2, h / 2 + 8);
  x.strokeStyle = 'rgba(0,0,0,.12)';
  for (const xx of [8, 18, 28, 172, 182, 192]) { x.beginPath(); x.moveTo(xx, 22); x.lineTo(xx, h - 22); x.stroke(); }
  return bake(c);
}

function cosmeticBox() {
  const w = 120, h = 170;
  const c = tornScrap(w, h, (x) => {
    x.fillStyle = pick(['#f2c9cf', '#e8d6c8', '#d9c8e8', '#c8e0d6']); x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(170,120,60,.8)'; x.lineWidth = 2; x.strokeRect(10, 10, w - 20, h - 20);
    x.fillStyle = '#7a4a4a'; x.font = `italic 600 22px ${F.serif}`; x.textAlign = 'center';
    x.fillText(pick(['rosé', 'petal', 'blush', 'velvet']), w / 2, 70);
    x.font = `11px ${F.type}`; x.fillText('no. ' + ri(1, 40), w / 2, 92);
    x.fillStyle = 'rgba(170,120,60,.8)';
    for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; x.beginPath(); x.arc(w / 2 + Math.cos(a) * 9, 124 + Math.sin(a) * 9, 4, 0, TAU); x.fill(); }
  }, 4);
  return bake(grain(c, 8));
}

function postit(text) {
  const s = 130, c = mk(s, s), x = c.getContext('2d');
  const col = pick(['#fbe57a', '#f7b6c8', '#a8dcef', '#c6eab4', '#f9c58a']);
  x.fillStyle = col; x.fillRect(0, 0, s, s);
  x.fillStyle = 'rgba(0,0,0,.06)'; x.fillRect(0, 0, s, 22);
  x.fillStyle = 'rgba(255,255,255,.25)';
  x.beginPath(); x.moveTo(s, s - 22); x.lineTo(s - 22, s); x.lineTo(s, s); x.fill();
  x.fillStyle = '#2f2a3a'; x.font = `26px ${F.hand}`;
  const words = (text || pick(['buy more washi', 'call nana ♥', 'water the mint!', 'you got this', 'matcha @ 3?', 'skate sat', 'remember: rest'])).split(' ');
  let line = '', y = 50;
  for (const wd of words) {
    if (x.measureText(line + wd).width > s - 22 && line) { x.fillText(line, 12, y); line = ''; y += 28; }
    line += wd + ' ';
  }
  x.fillText(line, 12, y);
  return bake(c, { pad: 10, blur: 6, off: 3, alpha: 0.25 });
}
export { postit };

function filmStrip() {
  const w = 240, h = 80, c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = '#2a2420'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#f2e6cf';
  for (let i = 6; i < w; i += 14) { x.fillRect(i, 5, 7, 7); x.fillRect(i, h - 12, 7, 7); }
  for (let f = 0; f < 3; f++) {
    const fx = 10 + f * 77;
    const g = x.createLinearGradient(0, 16, 0, 64);
    g.addColorStop(0, pick(['#e9a46a', '#8fb3c9', '#c9a2c4', '#9cc28a'])); g.addColorStop(1, '#3a2e28');
    x.fillStyle = g; x.fillRect(fx, 16, 70, 48);
  }
  return bake(c, { pad: 8, blur: 4, off: 2 });
}

function fortune() {
  const w = 210, h = 46, c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = '#fbf8f0'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#b8403a'; x.font = `13px ${F.type}`; x.textAlign = 'center';
  x.fillText(pick(['Good things are blooming.', 'Rest is productive too.', 'A small joy is near.', 'Your patience will flower.', 'Keep the little things.']), w / 2, 22);
  x.font = `10px ${F.type}`; x.fillText('lucky: ' + [ri(1, 9), ri(10, 29), ri(30, 49)].join(' · '), w / 2, 36);
  return bake(c, { pad: 8, blur: 3, off: 1 });
}

function libraryCard() {
  const w = 150, h = 210, c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = '#f2e8c8'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#3a2e28'; x.font = `12px ${F.type}`; x.fillText('DATE DUE', 12, 22);
  x.strokeStyle = 'rgba(200,80,80,.5)'; x.beginPath(); x.moveTo(0, 30); x.lineTo(w, 30); x.stroke();
  x.strokeStyle = 'rgba(80,110,150,.3)';
  for (let j = 48; j < h; j += 18) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); }
  x.strokeStyle = 'rgba(80,110,150,.3)'; x.beginPath(); x.moveTo(60, 30); x.lineTo(60, h); x.stroke();
  x.fillStyle = 'rgba(150,50,60,.75)'; x.font = `12px ${F.type}`;
  for (let j = 0; j < ri(3, 6); j++) x.fillText(`${MONTHS[ri(0, 11)]} ${ri(1, 28)}`, 10, 62 + j * 18);
  x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(w / 2, 8, 0, 0, TAU); x.fill();
  return bake(grain(c, 10));
}

function miniEnvelope() {
  const w = 160, h = 104, c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = pick(['#e8d6b8', '#f2d0d0', '#d0dff0', '#dfe8cf']); x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(80,60,40,.25)'; x.lineWidth = 1.5;
  x.beginPath(); x.moveTo(0, 0); x.lineTo(w / 2, h * 0.58); x.lineTo(w, 0); x.moveTo(0, h); x.lineTo(w * 0.42, h * 0.48); x.moveTo(w, h); x.lineTo(w * 0.58, h * 0.48); x.stroke();
  return bake(grain(c, 10));
}

function button() {
  const s = 46, c = mk(s, s), x = c.getContext('2d');
  const col = pick(['#c8707e', '#7fa6c9', '#8fb36a', '#e0a54a', '#f2efe6', '#5a4a6a']);
  x.fillStyle = col; x.beginPath(); x.arc(s / 2, s / 2, 20, 0, TAU); x.fill();
  x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 2; x.beginPath(); x.arc(s / 2, s / 2, 15, 0, TAU); x.stroke();
  x.fillStyle = 'rgba(255,255,255,.3)'; x.beginPath(); x.arc(s / 2 - 6, s / 2 - 7, 6, 0, TAU); x.fill();
  x.globalCompositeOperation = 'destination-out';
  for (const [a, b] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) { x.beginPath(); x.arc(s / 2 + a, s / 2 + b, 2.6, 0, TAU); x.fill(); }
  return bake(c, { pad: 6, blur: 3, off: 2, alpha: 0.35 });
}

function paperclip() {
  const w = 40, h = 110, c = mk(w, h), x = c.getContext('2d');
  x.strokeStyle = pick(['#9a9aa4', '#d9867d', '#7fa6c9', '#c9a24f']); x.lineWidth = 3.5; x.lineCap = 'round';
  x.beginPath();
  x.moveTo(26, 30); x.lineTo(26, 86); x.arc(19, 86, 7, 0, Math.PI); x.lineTo(12, 18); x.arc(21, 18, 9, Math.PI, 0); x.lineTo(30, 96); x.arc(19, 96, 11, 0, Math.PI); x.lineTo(8, 40);
  x.stroke();
  return bake(c, { pad: 6, blur: 3, off: 2, alpha: 0.3 });
}

function twine() {
  const w = 220, h = 70, c = mk(w, h), x = c.getContext('2d');
  x.lineCap = 'round';
  const path = () => { x.beginPath(); x.moveTo(6, 40); x.bezierCurveTo(60, 0, 90, 70, 130, 30); x.bezierCurveTo(160, 6, 190, 60, 214, 30); };
  path(); x.strokeStyle = '#b8946a'; x.lineWidth = 4; x.stroke();
  x.setLineDash([3, 4]); path(); x.strokeStyle = '#e8d2b0'; x.lineWidth = 1.5; x.stroke();
  return bake(c, { pad: 6, blur: 3, off: 2, alpha: 0.3 });
}

function pressedLeaf() {
  const w = 120, h = 160, c = mk(w, h), x = c.getContext('2d');
  x.translate(w / 2, h / 2);
  x.rotate(rr(-0.4, 0.4));
  const col = pick([['#c97b3c', '#e8b060'], ['#a8442f', '#e07a4a'], ['#8aa060', '#c6d68a'], ['#d4a63c', '#f2d27a']]);
  const g = x.createLinearGradient(0, 60, 0, -60); g.addColorStop(0, col[0]); g.addColorStop(1, col[1]);
  x.fillStyle = g;
  x.beginPath(); x.moveTo(0, 62);
  x.bezierCurveTo(46, 30, 44, -30, 0, -66); x.bezierCurveTo(-44, -30, -46, 30, 0, 62); x.fill();
  x.strokeStyle = 'rgba(90,50,20,.45)'; x.lineWidth = 1.5;
  x.beginPath(); x.moveTo(0, 74); x.lineTo(0, -60); x.stroke();
  for (let k = -3; k <= 3; k++) { x.beginPath(); x.moveTo(0, k * 14); x.lineTo(26, k * 14 - 14); x.moveTo(0, k * 14); x.lineTo(-26, k * 14 - 14); x.stroke(); }
  return bake(grain(c, 10), { pad: 6, blur: 3, off: 1, alpha: 0.2 });
}

// The junk box: categories with several variants of each piece.
export const JUNK = {
  Paper: [
    ...['floral', 'gingham', 'stripes', 'dots', 'music', 'map', 'ledger'].map((k) => ({ label: k === 'music' ? 'sheet music' : k + ' paper', make: () => patternPaper(k), n: k === 'floral' || k === 'gingham' ? 2 : 1 })),
    { label: 'magazine', make: magazine, n: 2 },
    { label: 'brochure', make: brochure, n: 2 },
    { label: 'newspaper', make: newsScrap, n: 1 },
    { label: 'bujo list', make: bujoNote, n: 1 },
    { label: 'post-it', make: () => postit(), n: 3 },
    { label: 'lace', make: lace, n: 1 },
  ],
  Ephemera: [
    { label: 'ticket', make: ticket, n: 3 },
    { label: 'café receipt', make: receipt, n: 2 },
    { label: 'polaroid', make: polaroid, n: 3 },
    { label: 'postage', make: postage, n: 2 },
    { label: 'wax seal', make: waxSeal, n: 3 },
    { label: 'kraft tag', make: kraftTag, n: 2 },
    { label: 'tea bag', make: teaBag, n: 1 },
    { label: 'film strip', make: filmStrip, n: 1 },
    { label: 'fortune', make: fortune, n: 2 },
    { label: 'library card', make: libraryCard, n: 1 },
    { label: 'envelope', make: miniEnvelope, n: 1 },
    { label: 'sweet wrapper', make: wrapper, n: 2 },
    { label: 'blush box', make: cosmeticBox, n: 1 },
    { label: 'leather label', make: leather, n: 1 },
  ],
  Bits: [
    { label: 'origami crane', make: crane, n: 2 },
    { label: 'wire heart', make: wireArt, n: 1 },
    { label: 'button', make: button, n: 4 },
    { label: 'paper clip', make: paperclip, n: 2 },
    { label: 'twine', make: twine, n: 1 },
    { label: 'pressed leaf', make: pressedLeaf, n: 3 },
    { label: 'sticker', make: sticker, n: 6 },
  ],
};
