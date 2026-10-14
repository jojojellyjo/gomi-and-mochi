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

// A paw reaching in along +x; origin at the shoulder, paw tip at (len, 0).
export function drawPaw(x, len) {
  x.save();
  x.lineWidth = 3; x.strokeStyle = C.line;
  x.fillStyle = C.body;
  x.beginPath(); x.roundRect(-20, -22, len + 20, 44, 22); x.fill(); x.stroke();
  x.save(); x.clip();
  x.strokeStyle = C.dark; x.lineWidth = 7;
  for (let sx = len - 70; sx > -20; sx -= 34) { x.beginPath(); x.moveTo(sx, -24); x.quadraticCurveTo(sx + 8, 0, sx, 24); x.stroke(); }
  x.restore();
  x.fillStyle = C.body;
  x.beginPath(); x.arc(len, 0, 30, 0, TAU); x.fill(); x.stroke();
  x.fillStyle = C.pink;
  x.beginPath(); x.ellipse(len + 6, 4, 11, 9, 0, 0, TAU); x.fill();
  for (const [bx, by] of [[len + 18, -14], [len + 24, 0], [len + 18, 14], [len + 6, -20]]) {
    x.beginPath(); x.arc(bx, by, 5, 0, TAU); x.fill();
  }
  x.restore();
}
