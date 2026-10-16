// Hana's hands: one smooth silhouette, tapered fingers, almond nails with crisp
// white French tips that extend just past each fingertip.
// Origin is the working fingertip; the wrist trails down (+y) before rotation.
import { TAU } from './textures.js';

const HANA_STYLE = {
  skin: '#f3d2b3', skinSh: '#e2b693', line: '#b98466',
  nail: '#f5c9c4', tip: '#fffaf5', french: true,
  sleeve: '#f1e8d8', sleeveSh: '#dccfb8',
};
const ELDER_STYLE = {
  skin: '#efd2bb', skinSh: '#dbb69c', line: '#b08a72',
  nail: '#ecd3c9', tip: '#ecd3c9', french: false,
  sleeve: '#9a86b0', sleeveSh: '#7d6a94',
};

// a finger: base at (bx, by), pointing along angle a (0 = up, clockwise +)
const F = (bx, by, a, len, w) => ({ bx, by, a, len, w });

const POSES = {
  point: {
    palm: [-24, 66, 100, 96, 34],
    fingers: [F(0, 96, 0, 96, 23)],
    thumb: F(-16, 132, -0.42, 58, 25),
    knuckles: [[22, 76], [44, 80], [64, 88]],
  },
  pinch: {
    palm: [-50, 60, 128, 100, 40],
    fingers: [F(20, 92, -0.22, 94, 23)],
    thumb: F(-44, 74, 0.7, 62, 26),
    knuckles: [[40, 74], [58, 82], [72, 94]],
  },
  press: {
    palm: [-16, 52, 104, 100, 34],
    fingers: [F(4, 70, -0.1, 70, 22), F(28, 64, -0.02, 78, 23), F(52, 68, 0.06, 74, 22), F(74, 78, 0.16, 60, 19)],
    thumb: F(84, 118, 1.0, 56, 25),
  },
};

function fingerPath(x, f) {
  const { len, w } = f, tw = w * 0.84;
  x.save();
  x.translate(f.bx, f.by);
  x.rotate(f.a);
  x.moveTo(-w / 2, 0);
  x.bezierCurveTo(-w / 2, -len * 0.5, -tw / 2, -len + tw * 0.7, -tw / 2, -len + tw / 2);
  x.arc(0, -len + tw / 2, tw / 2, Math.PI, 0);
  x.bezierCurveTo(tw / 2, -len + tw * 0.7, w / 2, -len * 0.5, w / 2, 0);
  x.restore();
}

function drawNail(x, f, st) {
  const { len, w } = f, nw = w * 0.66, nl = w * 0.95;
  x.save();
  x.translate(f.bx, f.by);
  x.rotate(f.a);
  x.translate(0, -len + w * 0.2);
  // almond nail: the free edge sits just past the fingertip
  const path = () => {
    x.beginPath();
    x.moveTo(-nw / 2, nl * 0.75);
    x.bezierCurveTo(-nw / 2, nl * 0.05, -nw * 0.46, -nl * 0.36, 0, -nl * 0.38);
    x.bezierCurveTo(nw * 0.46, -nl * 0.36, nw / 2, nl * 0.05, nw / 2, nl * 0.75);
    x.quadraticCurveTo(0, nl * 0.88, -nw / 2, nl * 0.75);
    x.closePath();
  };
  path();
  x.fillStyle = st.nail; x.fill();
  if (st.french) {
    x.save(); path(); x.clip();
    x.fillStyle = st.tip;
    x.beginPath();
    x.moveTo(-nw, -nl);
    x.lineTo(nw, -nl);
    x.lineTo(nw, -nl * 0.02);
    x.quadraticCurveTo(0, nl * 0.32, -nw, -nl * 0.02);
    x.closePath(); x.fill();
    x.restore();
  }
  x.fillStyle = 'rgba(255,255,255,.7)';
  x.beginPath(); x.ellipse(-nw * 0.18, nl * 0.18, nw * 0.09, nl * 0.3, 0.05, 0, TAU); x.fill();
  path();
  x.strokeStyle = 'rgba(170,110,100,.45)'; x.lineWidth = 0.9; x.stroke();
  x.restore();
}

function knuckleLines(x, f, st) {
  const { len, w } = f;
  x.save();
  x.translate(f.bx, f.by); x.rotate(f.a);
  x.strokeStyle = st.skinSh; x.lineWidth = 1.4; x.lineCap = 'round';
  for (const k of [0.38, 0.62]) {
    x.beginPath(); x.moveTo(-w * 0.22, -len * k); x.quadraticCurveTo(0, -len * k + 2.5, w * 0.22, -len * k); x.stroke();
  }
  x.restore();
}

function sleeve(x, st, pose) {
  const y0 = pose === 'press' ? 140 : 146;
  x.save();
  x.fillStyle = st.sleeve;
  x.beginPath(); x.roundRect(-40, y0, 132, 110, 28); x.fill();
  x.strokeStyle = st.sleeveSh; x.lineWidth = 3; x.lineCap = 'round';
  for (let i = 0; i < 7; i++) { x.beginPath(); x.moveTo(-28 + i * 18, y0 + 8); x.lineTo(-28 + i * 18, y0 + 100); x.stroke(); }
  x.fillStyle = 'rgba(0,0,0,.06)'; x.fillRect(-40, y0, 132, 10);
  x.restore();
}

// pose: 'point' | 'pinch' | 'press'
export function drawHand(x, { pose = 'point', s = 1, flip = false, rot = -0.55, elder = false } = {}) {
  const st = elder ? ELDER_STYLE : HANA_STYLE;
  const P = POSES[pose];
  x.save();
  x.scale(flip ? -s : s, s);
  x.rotate(rot);
  x.lineJoin = 'round';
  sleeve(x, st, pose);

  const silhouette = () => {
    x.beginPath();
    const [px, py, pw, ph, pr] = P.palm;
    x.roundRect(px, py, pw, ph, pr);
    for (const f of P.fingers) fingerPath(x, f);
    fingerPath(x, P.thumb);
    if (P.knuckles) for (const [kx, ky] of P.knuckles) { x.moveTo(kx + 14, ky); x.ellipse(kx, ky, 14, 17, 0, 0, TAU); }
  };
  // one outline around the whole hand, then fill over it so inner seams vanish
  silhouette();
  x.strokeStyle = st.line; x.lineWidth = 3.2; x.stroke();
  silhouette();
  x.fillStyle = st.skin; x.fill('nonzero');
  x.save();
  silhouette(); x.clip();
  const g = x.createLinearGradient(0, 40, 0, 170);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(200,140,110,.25)');
  x.fillStyle = g; x.fillRect(-60, 0, 200, 200);
  if (P.knuckles) {
    x.strokeStyle = st.skinSh; x.lineWidth = 1.6;
    for (const [kx, ky] of P.knuckles) { x.beginPath(); x.arc(kx, ky + 4, 9, 0.3, Math.PI - 0.3); x.stroke(); }
  }
  x.strokeStyle = st.skinSh; x.lineWidth = 1.4;
  const [px, py, pw] = P.palm;
  x.beginPath(); x.moveTo(px + 18, py + 10); x.quadraticCurveTo(px + pw / 2, py + 2, px + pw - 18, py + 10); x.stroke();
  x.restore();

  for (const f of P.fingers) knuckleLines(x, f, st);
  knuckleLines(x, P.thumb, st);
  drawNail(x, P.thumb, st);
  for (const f of P.fingers) drawNail(x, f, st);
  x.restore();
}
