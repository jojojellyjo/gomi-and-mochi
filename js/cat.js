// Mochi, an orange tabby. Origin is the point between the feet on the ground.
import { TAU } from './textures.js';

export const CAT_NAME = 'Mochi';
const C = { body: '#eb9c50', dark: '#c46a26', belly: '#f8dcb4', line: '#5b3b22', pink: '#f2a0a0', eye: '#3a2a1a' };

export function drawCat(x, { pose = 'walk', t = 0, dir = 1, s = 1 } = {}) {
  x.save();
  x.scale(dir * s, s);
  x.lineWidth = 3;
  x.strokeStyle = C.line;
  x.lineJoin = 'round';
  x.lineCap = 'round';
  if (pose === 'walk') walk(x, t);
  else if (pose === 'sit') sit(x, t);
  else loaf(x, t);
  x.restore();
}

function head(x, hx, hy, r, sleepy, t) {
  for (const s of [-1, 1]) {
    x.fillStyle = C.body;
    x.beginPath();
    x.moveTo(hx + s * r * 0.9, hy - r * 0.2);
    x.lineTo(hx + s * r * 0.6, hy - r * 1.25);
    x.lineTo(hx + s * r * 0.05, hy - r * 0.78);
    x.closePath();
    x.fill(); x.stroke();
    x.fillStyle = C.pink;
    x.beginPath();
    x.moveTo(hx + s * r * 0.7, hy - r * 0.45);
    x.lineTo(hx + s * r * 0.58, hy - r * 1.0);
    x.lineTo(hx + s * r * 0.28, hy - r * 0.74);
    x.closePath();
    x.fill();
  }
  x.fillStyle = C.body;
  x.beginPath(); x.ellipse(hx, hy, r * 1.05, r * 0.92, 0, 0, TAU); x.fill(); x.stroke();
  x.save();
  x.strokeStyle = C.dark; x.lineWidth = 2.5;
  for (const dx of [-0.25, 0, 0.25]) {
    x.beginPath(); x.moveTo(hx + dx * r, hy - r * 0.86); x.lineTo(hx + dx * r * 0.8, hy - r * 0.52); x.stroke();
  }
  x.fillStyle = C.belly;
  x.beginPath(); x.ellipse(hx, hy + r * 0.38, r * 0.46, r * 0.32, 0, 0, TAU); x.fill();
  // cheeks
  x.fillStyle = 'rgba(240,120,110,.25)';
  for (const s of [-1, 1]) { x.beginPath(); x.ellipse(hx + s * r * 0.62, hy + r * 0.25, r * 0.17, r * 0.1, 0, 0, TAU); x.fill(); }
  const blink = sleepy || t % 4 < 0.13;
  x.strokeStyle = C.eye; x.fillStyle = C.eye;
  for (const s of [-1, 1]) {
    const ex = hx + s * r * 0.4, ey = hy - r * 0.05;
    if (blink) {
      x.lineWidth = 2.5;
      x.beginPath(); x.arc(ex, ey - r * 0.05, r * 0.15, 0.25, Math.PI - 0.25); x.stroke();
    } else {
      x.beginPath(); x.ellipse(ex, ey, r * 0.13, r * 0.17, 0, 0, TAU); x.fill();
      x.fillStyle = '#fff';
      x.beginPath(); x.arc(ex - r * 0.04, ey - r * 0.07, r * 0.05, 0, TAU); x.fill();
      x.fillStyle = C.eye;
    }
  }
  x.fillStyle = C.pink;
  x.beginPath(); x.moveTo(hx - r * 0.1, hy + r * 0.2); x.lineTo(hx + r * 0.1, hy + r * 0.2); x.lineTo(hx, hy + r * 0.31); x.closePath(); x.fill();
  x.strokeStyle = C.line; x.lineWidth = 1.8;
  x.beginPath();
  x.moveTo(hx, hy + r * 0.31); x.quadraticCurveTo(hx - r * 0.1, hy + r * 0.46, hx - r * 0.21, hy + r * 0.38);
  x.moveTo(hx, hy + r * 0.31); x.quadraticCurveTo(hx + r * 0.1, hy + r * 0.46, hx + r * 0.21, hy + r * 0.38);
  x.stroke();
  x.lineWidth = 1.2; x.strokeStyle = 'rgba(90,60,40,.55)';
  for (const s of [-1, 1]) for (const k of [-1, 0, 1]) {
    x.beginPath(); x.moveTo(hx + s * r * 0.48, hy + r * 0.3 + k * r * 0.08); x.lineTo(hx + s * r * 1.28, hy + r * 0.24 + k * r * 0.18); x.stroke();
  }
  x.restore();
}

function stripedBody(x, cx, cy, rx, ry, xs, bellyY) {
  x.fillStyle = C.body;
  x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.fill();
  x.save();
  x.clip();
  x.fillStyle = C.belly;
  x.beginPath(); x.ellipse(cx + 4, bellyY, rx * 0.7, ry * 0.45, 0, 0, TAU); x.fill();
  x.strokeStyle = C.dark; x.lineWidth = 6;
  for (const sx of xs) {
    x.beginPath(); x.moveTo(cx + sx, cy - ry - 4); x.quadraticCurveTo(cx + sx + 9, cy - ry * 0.3, cx + sx, cy + ry * 0.2); x.stroke();
  }
  x.restore();
  x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.stroke();
}

function tail(x, pts) {
  x.save();
  x.lineWidth = 14; x.strokeStyle = C.line;
  x.beginPath(); x.moveTo(pts[0], pts[1]); x.bezierCurveTo(pts[2], pts[3], pts[4], pts[5], pts[6], pts[7]); x.stroke();
  x.lineWidth = 8.5; x.strokeStyle = C.body; x.stroke();
  x.restore();
}

function leg(x, lx, ly, a, far) {
  x.save();
  x.translate(lx, ly);
  x.rotate(a);
  x.fillStyle = far ? C.dark : C.body;
  x.beginPath(); x.roundRect(-7, 0, 14, 38, 7); x.fill(); x.stroke();
  x.restore();
}

function walk(x, t) {
  const ph = t * 9, bob = -Math.abs(Math.sin(ph)) * 2.5;
  x.translate(0, bob);
  const sw = Math.sin(t * 3);
  tail(x, [-52, -58, -82, -62, -88, -96 + sw * 8, -72, -118 + sw * 10]);
  leg(x, -36, -42, Math.sin(ph + Math.PI) * 0.4, true);
  leg(x, 34, -42, Math.sin(ph) * 0.4, true);
  stripedBody(x, 0, -54, 60, 26, [-38, -18, 2, 22], -34);
  leg(x, -26, -40, Math.sin(ph) * 0.4, false);
  leg(x, 44, -40, Math.sin(ph + Math.PI) * 0.4, false);
  head(x, 56, -82, 25, false, t);
}

function sit(x, t) {
  const sw = Math.sin(t * 2.2) * 6;
  tail(x, [-24, -10, -50, -2, -10, 4 + sw * 0.2, 40 + sw, -4]);
  stripedBody(x, 0, -50, 34, 46, [-20, -4, 12], -38);
  for (const lx of [-2, 18]) {
    x.fillStyle = C.body;
    x.beginPath(); x.roundRect(lx - 7, -34, 14, 34, 7); x.fill(); x.stroke();
  }
  head(x, 6, -104, 26, false, t);
}

function loaf(x, t) {
  const br = Math.sin(t * 2) * 1.5;
  tail(x, [-56, -12, -70, 2, -20, 6, 26, -2]);
  stripedBody(x, 0, -30, 62, 29 + br, [-40, -20, 0, 18], -14);
  x.fillStyle = C.belly;
  for (const px of [30, 50]) { x.beginPath(); x.ellipse(px, -5, 11, 7, 0, 0, TAU); x.fill(); x.stroke(); }
  head(x, 46, -50 - br, 24, true, t);
}

// A fluffy paw reaching in along +x; origin at the shoulder, paw centre at (len, 0).
export function drawPaw(x, len) {
  x.save();
  x.lineJoin = 'round'; x.lineCap = 'round';
  const fluff = (x0, x1, wa, wb) => {
    // tapered furry arm outline with little tufts along the edges
    x.beginPath();
    x.moveTo(x0, -wa);
    for (let px = x0; px <= x1; px += 16) {
      const k = (px - x0) / Math.max(1, x1 - x0), w = wa + (wb - wa) * k;
      x.quadraticCurveTo(px + 8, -w - 5, px + 16, -w);
    }
    x.lineTo(x1, wb);
    for (let px = x1; px >= x0; px -= 16) {
      const k = (px - x0) / Math.max(1, x1 - x0), w = wa + (wb - wa) * k;
      x.quadraticCurveTo(px - 8, w + 5, px - 16, w);
    }
    x.closePath();
  };
  const armEnd = Math.max(-20, len - 24);
  fluff(-30, armEnd, 48, 38);
  x.lineWidth = 6; x.strokeStyle = C.line; x.stroke();
  x.fillStyle = C.body; x.fill();
  // tabby stripes, curved with the arm
  x.save(); fluff(-30, armEnd, 48, 38); x.clip();
  x.strokeStyle = C.dark; x.lineWidth = 9;
  for (let sx = armEnd - 50; sx > -40; sx -= 42) {
    x.beginPath(); x.moveTo(sx - 6, -46); x.quadraticCurveTo(sx + 12, -6, sx - 2, 46); x.stroke();
  }
  // lighter underside fur
  x.fillStyle = 'rgba(248,220,180,.55)';
  if (armEnd > 10) { x.beginPath(); x.ellipse(armEnd * 0.5, 22, armEnd * 0.55, 12, 0, 0, TAU); x.fill(); }
  x.restore();

  // the paw: a round mitten with four toes at the front
  const px = len, toes = [[30, -33, 16], [42, -12, 17], [42, 12, 17], [30, 33, 16]];
  const pawShape = () => {
    x.beginPath();
    x.ellipse(px, 0, 44, 48, 0, 0, TAU);
    for (const [tx, ty, r] of toes) { x.moveTo(px + tx + r, ty); x.arc(px + tx, ty, r, 0, TAU); }
  };
  pawShape(); x.lineWidth = 6; x.strokeStyle = C.line; x.stroke();
  pawShape(); x.fillStyle = C.body; x.fill();
  // toe separations + fur tufts
  x.strokeStyle = C.line; x.lineWidth = 2.2;
  for (const ty of [-23, 0, 23]) { x.beginPath(); x.moveTo(px + 28, ty); x.lineTo(px + 48, ty); x.stroke(); }
  x.strokeStyle = 'rgba(255,240,220,.7)'; x.lineWidth = 2;
  for (const [tx, ty] of [[-14, -20], [-18, 0], [-14, 20]]) { x.beginPath(); x.moveTo(px + tx, ty); x.lineTo(px + tx + 8, ty + 2); x.stroke(); }
  // a peek of pink beans as the paw tips toward you
  x.fillStyle = C.pink;
  x.beginPath(); x.ellipse(px + 6, 4, 16, 14, 0, 0, TAU); x.fill();
  for (const [tx, ty, r] of toes) { x.beginPath(); x.arc(px + tx + 2, ty, r * 0.45, 0, TAU); x.fill(); }
  x.fillStyle = 'rgba(255,255,255,.45)';
  x.beginPath(); x.ellipse(px, 0, 4, 3, 0, 0, TAU); x.fill();
  x.restore();
}
