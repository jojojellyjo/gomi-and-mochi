// Seven flowers, drawn in code. Round blooms are centred on (0,0) with radius r;
// spikes stand from y = +1.3r (base) to y = -1.3r (tip).
import { TAU, rr, mk, grain, tint, bake } from './textures.js';

function petal(x, len, wid) {
  x.beginPath();
  x.moveTo(0, 0);
  x.bezierCurveTo(wid, -len * 0.25, wid * 0.9, -len * 0.85, 0, -len);
  x.bezierCurveTo(-wid * 0.9, -len * 0.85, -wid, -len * 0.25, 0, 0);
  x.closePath();
}
function roundPetal(x, len, wid) {
  x.beginPath();
  x.ellipse(0, -len / 2, wid, len / 2, 0, 0, TAU);
}
function notchPetal(x, len, wid) {
  x.beginPath();
  x.moveTo(0, 0);
  x.bezierCurveTo(wid * 0.9, -len * 0.3, wid, -len * 0.75, wid * 0.7, -len * 0.95);
  x.lineTo(wid * 0.35, -len * 0.87);
  x.lineTo(0, -len);
  x.lineTo(-wid * 0.35, -len * 0.87);
  x.lineTo(-wid * 0.7, -len * 0.95);
  x.bezierCurveTo(-wid, -len * 0.75, -wid * 0.9, -len * 0.3, 0, 0);
  x.closePath();
}
function centre(x, r, c1, c2, dots) {
  const g = x.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  x.fillStyle = g;
  x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill();
  if (dots) {
    x.fillStyle = dots;
    for (let i = 0; i < 14; i++) {
      const a = i * 2.4, d = Math.sqrt(i / 14) * r * 0.8;
      x.beginPath(); x.arc(Math.cos(a) * d, Math.sin(a) * d, r * 0.09, 0, TAU); x.fill();
    }
  }
}
function stem(x, r, col = '#7d9a62', w = 14) {
  x.strokeStyle = col;
  x.lineWidth = r / w;
  x.lineCap = 'round';
  x.beginPath();
  x.moveTo(0, r * 1.3);
  x.quadraticCurveTo(r * 0.08, 0, 0, -r * 1.25);
  x.stroke();
}
function leaf(x, len, wid, col, vein = true) {
  const g = x.createLinearGradient(0, 0, 0, -len);
  g.addColorStop(0, col[0]);
  g.addColorStop(1, col[1]);
  x.fillStyle = g;
  x.beginPath();
  x.moveTo(0, 0);
  x.bezierCurveTo(wid, -len * 0.25, wid * 0.8, -len * 0.8, 0, -len);
  x.bezierCurveTo(-wid * 0.8, -len * 0.8, -wid, -len * 0.25, 0, 0);
  x.fill();
  if (vein) {
    x.strokeStyle = 'rgba(255,255,230,.35)';
    x.lineWidth = Math.max(0.8, wid / 8);
    x.beginPath(); x.moveTo(0, -len * 0.05); x.lineTo(0, -len * 0.9); x.stroke();
  }
}

export const FLOWERS = {
  daisy: {
    name: 'Daisy', shape: 'round', zone: [58, 76], color: '#f4ecd8',
    draw(x, r) {
      x.strokeStyle = 'rgba(140,120,90,.35)';
      x.lineWidth = Math.max(0.6, r / 60);
      const n = 18;
      for (let i = 0; i < n; i++) {
        x.save();
        x.rotate((i / n) * TAU + Math.sin(i * 7) * 0.05);
        x.fillStyle = i % 2 ? '#fffdf7' : '#f5eedf';
        petal(x, r * (0.92 + Math.sin(i * 3) * 0.06), r * 0.16);
        x.fill(); x.stroke();
        x.restore();
      }
      centre(x, r * 0.27, '#fbd75b', '#d8921c', 'rgba(150,90,10,.5)');
    },
  },
  pansy: {
    name: 'Pansy', shape: 'round', zone: [66, 78], color: '#6b48a0',
    draw(x, r) {
      const P = [
        [-38, r * 0.95, r * 0.42, '#5b3f93'], [38, r * 0.95, r * 0.42, '#5b3f93'],
        [-105, r * 0.85, r * 0.4, '#8e6cc6'], [105, r * 0.85, r * 0.4, '#8e6cc6'],
        [180, r * 0.92, r * 0.5, '#9a78d0'],
      ];
      for (const [a, l, w, c] of P) {
        x.save();
        x.rotate((a * Math.PI) / 180);
        x.fillStyle = c;
        roundPetal(x, l, w);
        x.fill();
        x.strokeStyle = 'rgba(40,20,60,.3)';
        x.lineWidth = r / 50;
        x.stroke();
        x.restore();
      }
      const g = x.createRadialGradient(0, r * 0.1, 0, 0, r * 0.1, r * 0.5);
      g.addColorStop(0, 'rgba(250,210,70,1)');
      g.addColorStop(0.55, 'rgba(250,210,70,.65)');
      g.addColorStop(1, 'rgba(250,210,70,0)');
      x.fillStyle = g;
      x.beginPath(); x.arc(0, r * 0.1, r * 0.5, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(40,20,50,.7)';
      x.lineWidth = r / 45;
      for (const a of [-112, -100, 98, 110, 165, 180, 195]) {
        const ra = (a * Math.PI) / 180;
        x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.sin(ra) * r * 0.42, -Math.cos(ra) * r * 0.42); x.stroke();
      }
      centre(x, r * 0.08, '#fff6c8', '#e2b42a');
    },
  },
  cosmos: {
    name: 'Cosmos', shape: 'round', zone: [60, 73], color: '#e98fb6',
    draw(x, r) {
      const n = 8;
      for (let i = 0; i < n; i++) {
        x.save();
        x.rotate((i / n) * TAU);
        const g = x.createLinearGradient(0, 0, 0, -r);
        g.addColorStop(0, '#c8507f');
        g.addColorStop(0.35, '#e98fb6');
        g.addColorStop(1, '#f6c6da');
        x.fillStyle = g;
        notchPetal(x, r, r * 0.36);
        x.fill();
        x.strokeStyle = 'rgba(120,30,70,.25)';
        x.lineWidth = r / 60;
        x.stroke();
        x.beginPath(); x.moveTo(0, -r * 0.2); x.lineTo(0, -r * 0.85); x.stroke();
        x.restore();
      }
      centre(x, r * 0.2, '#ffe27a', '#d9a21b', 'rgba(140,90,10,.55)');
    },
  },
  nasturtium: {
    name: 'Nasturtium', shape: 'round', zone: [62, 80], color: '#f08a24', edible: true,
    draw(x, r) {
      const n = 5;
      for (let i = 0; i < n; i++) {
        x.save();
        x.rotate((i / n) * TAU + 0.3);
        const g = x.createRadialGradient(0, 0, 0, 0, -r * 0.5, r * 0.8);
        g.addColorStop(0, '#d9481e');
        g.addColorStop(0.5, '#f08a24');
        g.addColorStop(1, '#f7b743');
        x.fillStyle = g;
        x.beginPath();
        x.moveTo(0, 0);
        x.bezierCurveTo(r * 0.68, -r * 0.2, r * 0.72, -r * 0.95, 0, -r * 0.93);
        x.bezierCurveTo(-r * 0.72, -r * 0.95, -r * 0.68, -r * 0.2, 0, 0);
        x.fill();
        x.strokeStyle = 'rgba(150,30,10,.5)';
        x.lineWidth = r / 45;
        for (const s of [-0.18, 0, 0.18]) {
          x.beginPath(); x.moveTo(0, -r * 0.05); x.quadraticCurveTo(s * r, -r * 0.3, s * r * 1.6, -r * 0.5); x.stroke();
        }
        x.restore();
      }
      centre(x, r * 0.1, '#f3d36a', '#b5651d');
    },
  },
  lavender: {
    name: 'Lavender', shape: 'spike', zone: [50, 82], color: '#8e74c4',
    draw(x, r) {
      stem(x, r);
      for (const [y, s] of [[r * 1.0, 1], [r * 0.75, -1]]) {
        x.save(); x.translate(0, y); x.rotate(s * 0.5);
        leaf(x, r * 0.55, r * 0.07, ['#6f8f58', '#9ab783'], false);
        x.restore();
      }
      for (let i = 0; i < 16; i++) {
        const t = i / 15, y = -r * 1.25 + t * r * 1.5, s = r * (0.13 + 0.02 * Math.sin(i));
        for (const side of [-1, 1]) {
          x.save();
          x.translate(side * r * (0.07 + t * 0.04), y);
          x.rotate(side * 0.5);
          x.fillStyle = (i + (side > 0 ? 1 : 0)) % 2 ? '#8e74c4' : '#ab8dda';
          x.beginPath(); x.ellipse(0, 0, s * 0.6, s, 0, 0, TAU); x.fill();
          x.restore();
        }
      }
    },
  },
  fern: {
    name: 'Fern', shape: 'spike', zone: [54, 84], color: '#5f8f4e',
    draw(x, r) {
      stem(x, r, '#4f7a3f', 18);
      const n = 11;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1), y = r * 1.1 - t * r * 2.3, len = r * (0.66 - t * 0.5);
        for (const s of [-1, 1]) {
          x.save();
          x.translate(0, y);
          x.rotate(s * (1.15 - t * 0.35));
          x.fillStyle = i % 2 ? '#5f8f4e' : '#73a35d';
          x.beginPath(); x.ellipse(0, -len / 2, len * 0.17, len / 2, 0, 0, TAU); x.fill();
          x.restore();
        }
      }
    },
  },
  mint: {
    name: 'Mint', shape: 'spike', zone: [60, 78], color: '#6fae63', edible: true,
    draw(x, r) {
      stem(x, r, '#6b8f4f', 12);
      const pairs = [[r * 0.85, 0.62], [r * 0.2, 0.55], [-r * 0.45, 0.45], [-r * 0.98, 0.32]];
      for (const [y, sz] of pairs) {
        for (const s of [-1, 1]) {
          x.save();
          x.translate(0, y);
          x.rotate(s * 1.0);
          leaf(x, r * sz, r * sz * 0.42, ['#5c9a52', '#8cc77d']);
          x.restore();
        }
      }
      x.save(); x.translate(0, -r * 1.2);
      leaf(x, r * 0.2, r * 0.1, ['#6fae63', '#a6d896'], false);
      x.restore();
    },
  },
};
export const FLOWER_TYPES = Object.keys(FLOWERS);

export function drawFlower(x, type, r) {
  x.save();
  FLOWERS[type].draw(x, r);
  x.restore();
}

// A flower on its own canvas, centred.
export function flowerSprite(type, r) {
  const spike = FLOWERS[type].shape === 'spike';
  const c = mk(spike ? r * 1.7 : r * 2.4, spike ? r * 2.8 : r * 2.4);
  const x = c.getContext('2d');
  x.translate(c.width / 2, c.height / 2);
  drawFlower(x, type, r);
  return c;
}

export const QUALITY_LABEL = {
  perfect: 'Just right! Flat & vivid',
  good: 'Nicely pressed',
  curled: 'Too loose: petals curled up',
  browned: 'Too tight: squashed & bruised',
};

const mix = (a, b, t) => a + (b - a) * t;

export function makePressed(type, quality) {
  const f = FLOWERS[type], r = 56, spike = f.shape === 'spike';
  const W = spike ? r * 1.8 : r * 2.6, H = spike ? r * 3 : r * 2.6;
  const c = mk(W, H), x = c.getContext('2d');
  x.translate(W / 2, H / 2);
  x.rotate(rr(-0.15, 0.15));

  if (quality === 'browned') {
    // squashed flat and spread out
    x.scale(1.12, 1.06);
    x.globalAlpha = 0.86;
    f.draw(x, r);
  } else if (quality === 'curled') {
    // petals lift and curl: drawn smaller and squished, a second offset pass for depth
    x.save(); x.scale(0.92, 0.74); x.rotate(rr(-0.25, 0.25)); f.draw(x, r); x.restore();
  } else {
    x.globalAlpha = 0.95;
    f.draw(x, r);
  }
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalAlpha = 1;

  if (quality === 'perfect') {
    tint(c, (R, G, B) => { const l = (R + G + B) / 3; return [l + (R - l) * 1.25, l + (G - l) * 1.25, l + (B - l) * 1.25]; });
    // a fresh sheen
    x.globalCompositeOperation = 'source-atop';
    const g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.08)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
  } else if (quality === 'good') {
    tint(c, (R, G, B) => [mix(R, 246, 0.14), mix(G, 238, 0.14), mix(B, 222, 0.14)]);
  } else if (quality === 'curled') {
    tint(c, (R, G, B) => [R * 0.92, G * 0.9, B * 0.88]);
    // edges darken where petals roll over, plus wrinkle lines
    x.globalCompositeOperation = 'source-atop';
    const g = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.12, W / 2, H / 2, Math.min(W, H) * 0.42);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(60,30,20,.45)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(50,25,15,.35)'; x.lineWidth = 1.4;
    for (let i = 0; i < 14; i++) {
      const a = rr(0, TAU), d0 = rr(8, 20), d1 = d0 + rr(10, 26);
      x.beginPath(); x.moveTo(W / 2 + Math.cos(a) * d0, H / 2 + Math.sin(a) * d0);
      x.quadraticCurveTo(W / 2 + Math.cos(a + 0.3) * (d0 + d1) / 2, H / 2 + Math.sin(a + 0.3) * (d0 + d1) / 2, W / 2 + Math.cos(a) * d1, H / 2 + Math.sin(a) * d1);
      x.stroke();
    }
    x.strokeStyle = 'rgba(255,250,240,.35)'; x.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const a = rr(0, TAU), d = rr(16, 34);
      x.beginPath(); x.arc(W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d, rr(3, 7), a, a + 1.6); x.stroke();
    }
  } else {
    // too tight: bruised brown, translucent, cracked and a little torn
    tint(c, (R, G, B) => {
      const sr = 0.393 * R + 0.769 * G + 0.189 * B, sg = 0.349 * R + 0.686 * G + 0.168 * B, sb = 0.272 * R + 0.534 * G + 0.131 * B;
      return [mix(R, sr * 0.7, 0.85), mix(G, sg * 0.58, 0.85), mix(B, sb * 0.45, 0.85)];
    });
    x.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < 9; i++) {
      const bx = rr(W * 0.2, W * 0.8), by = rr(H * 0.2, H * 0.8), br = rr(6, 16);
      const g = x.createRadialGradient(bx, by, 0, bx, by, br);
      g.addColorStop(0, 'rgba(70,35,15,.55)'); g.addColorStop(1, 'rgba(70,35,15,0)');
      x.fillStyle = g; x.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    x.strokeStyle = 'rgba(255,240,220,.6)'; x.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      let px = rr(W * 0.25, W * 0.75), py = rr(H * 0.25, H * 0.75);
      x.beginPath(); x.moveTo(px, py);
      for (let k = 0; k < 4; k++) { px += rr(-12, 12); py += rr(-12, 12); x.lineTo(px, py); }
      x.stroke();
    }
    x.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 5; i++) {
      const a = rr(0, TAU), d = Math.min(W, H) * rr(0.3, 0.4);
      x.beginPath(); x.arc(W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d, rr(3, 7), 0, TAU); x.fill();
    }
  }
  x.globalCompositeOperation = 'source-over';
  grain(c, 10);
  // loose petals stand up off the page, so they cast a bigger shadow
  return quality === 'curled'
    ? bake(c, { pad: 12, blur: 9, off: 5, alpha: 0.35 })
    : bake(c, { pad: 8, blur: 3, off: 1, alpha: 0.18 });
}
