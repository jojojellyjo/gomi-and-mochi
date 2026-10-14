// Hana's hands: warm skin, glossy pink-nude nails with crisp white French tips.
// Origin is the working fingertip; the wrist trails down and to the right.
import { TAU } from './textures.js';

const SKIN = '#f2cfae', SKIN_SH = '#dfb08c', LINE = 'rgba(120,70,40,.45)';
let NAIL = '#f6cfc9', TIP = '#fffaf4', SLEEVE = '#efe6d6', SLEEVE_SH = '#d9ccb6', SKIN_C = SKIN;

function nail(x, len, wid) {
  // drawn along -y from the fingertip end
  x.save();
  x.fillStyle = NAIL;
  x.beginPath(); x.roundRect(-wid / 2, 2, wid, len, [wid / 2, wid / 2, 3, 3]); x.fill();
  x.fillStyle = TIP;
  x.beginPath(); x.moveTo(-wid / 2, 2 + wid / 2);
  x.arc(0, 2 + wid / 2, wid / 2, Math.PI, 0);
  x.quadraticCurveTo(0, 2 + len * 0.55, -wid / 2, 2 + wid / 2);
  x.fill();
  x.fillStyle = 'rgba(255,255,255,.65)';
  x.beginPath(); x.ellipse(-wid * 0.18, 2 + len * 0.45, wid * 0.1, len * 0.28, 0, 0, TAU); x.fill();
  x.strokeStyle = 'rgba(160,100,90,.35)'; x.lineWidth = 0.8;
  x.beginPath(); x.roundRect(-wid / 2, 2, wid, len, [wid / 2, wid / 2, 3, 3]); x.stroke();
  x.restore();
}

function finger(x, len, wid, curl = 0, showNail = true) {
  x.save();
  x.fillStyle = SKIN; x.strokeStyle = LINE; x.lineWidth = 1.5;
  x.beginPath(); x.roundRect(-wid / 2, 0, wid, len, wid / 2); x.fill(); x.stroke();
  x.strokeStyle = 'rgba(150,90,60,.25)'; x.lineWidth = 1;
  x.beginPath(); x.moveTo(-wid * 0.3, len * 0.55); x.quadraticCurveTo(0, len * 0.6, wid * 0.3, len * 0.55); x.stroke();
  if (showNail && !curl) nail(x, wid * 1.15, wid * 0.72);
  x.restore();
}

function sleeve(x) {
  x.save();
  x.fillStyle = SLEEVE;
  x.beginPath(); x.roundRect(30, 120, 120, 70, 24); x.fill();
  x.strokeStyle = SLEEVE_SH; x.lineWidth = 3;
  for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(40 + i * 18, 124); x.lineTo(40 + i * 18, 186); x.stroke(); }
  x.restore();
}

// pose: 'point' (index fingertip at origin), 'pinch' (thumb + index meet at origin), 'press' (flat palm, fingertips at origin)
export function drawHand(x, { pose = 'point', s = 1, flip = false, rot = -0.55, elder = false } = {}) {
  if (elder) { NAIL = '#efd9cf'; TIP = '#efd9cf'; SLEEVE = '#9a86b0'; SLEEVE_SH = '#7d6a94'; }
  x.save();
  x.scale(flip ? -s : s, s);
  x.rotate(rot);
  x.lineJoin = 'round';
  if (pose === 'press') {
    sleeve(x);
    x.fillStyle = SKIN; x.strokeStyle = LINE; x.lineWidth = 1.5;
    x.beginPath(); x.roundRect(10, 44, 96, 90, 34); x.fill(); x.stroke();
    [[18, 0, 58], [42, -8, 66], [66, -4, 62], [88, 8, 52]].forEach(([fx, fy, len]) => {
      x.save(); x.translate(fx, fy); finger(x, len, 21); x.restore();
    });
    x.save(); x.translate(106, 70); x.rotate(-0.9); finger(x, 46, 22); x.restore();
    x.restore();
    resetColours();
    return;
  }
  // sleeve trails toward the wrist
  x.save();
  x.fillStyle = SLEEVE;
  x.beginPath(); x.roundRect(-34, 128, 116, 90, 26); x.fill();
  x.strokeStyle = SLEEVE_SH; x.lineWidth = 3;
  for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(-24 + i * 18, 134); x.lineTo(-24 + i * 18, 212); x.stroke(); }
  x.restore();
  const knuckles = (x0, y0) => {
    for (let i = 0; i < 3; i++) {
      x.fillStyle = SKIN_SH; x.beginPath(); x.roundRect(x0 + i * 19, y0 + i * 6 + 4, 21, 32, 10); x.fill();
      x.fillStyle = SKIN; x.strokeStyle = LINE; x.lineWidth = 1.5;
      x.beginPath(); x.roundRect(x0 + i * 19, y0 + i * 6, 21, 30, 10); x.fill(); x.stroke();
    }
  };
  if (pose === 'pinch') {
    x.save(); x.rotate(-0.25); finger(x, 72, 20); x.restore();
    x.fillStyle = SKIN; x.strokeStyle = LINE; x.lineWidth = 1.5;
    x.beginPath(); x.roundRect(-30, 50, 102, 96, 34); x.fill(); x.stroke();
    knuckles(22, 50);
    x.save(); x.rotate(0.62); finger(x, 60, 22); x.restore();
  } else {
    finger(x, 82, 20);
    x.fillStyle = SKIN; x.strokeStyle = LINE; x.lineWidth = 1.5;
    x.beginPath(); x.roundRect(-16, 62, 92, 90, 32); x.fill(); x.stroke();
    knuckles(12, 58);
    x.save(); x.translate(-14, 104); x.rotate(-0.55); x.translate(0, -44); finger(x, 50, 22); x.restore();
  }
  x.restore();
  resetColours();
}

function resetColours() { NAIL = '#f6cfc9'; TIP = '#fffaf4'; SLEEVE = '#efe6d6'; SLEEVE_SH = '#d9ccb6'; }
