// Shared helpers: random, canvases, paper + wood textures.
export const TAU = Math.PI * 2;
export const rr = (a, b) => a + Math.random() * (b - a);
export const ri = (a, b) => Math.floor(rr(a, b + 1));
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

// Random brightness noise on opaque pixels.
export function grain(c, amt = 18) {
  const x = c.getContext('2d');
  const img = x.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const n = (Math.random() - 0.5) * amt;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  x.putImageData(img, 0, 0);
  return c;
}

// Per-pixel colour transform on opaque pixels.
export function tint(c, fn) {
  const x = c.getContext('2d');
  const img = x.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const o = fn(d[i], d[i + 1], d[i + 2]);
    d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2];
  }
  x.putImageData(img, 0, 0);
  return c;
}

// Knock tiny holes out of ink so stamps look hand-pressed.
export function inkWear(c, count = 220, maxR = 1.8) {
  const x = c.getContext('2d');
  x.save();
  x.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < count; i++) {
    x.globalAlpha = Math.random() * 0.9;
    x.beginPath();
    x.arc(rr(0, c.width), rr(0, c.height), rr(0.3, maxR), 0, TAU);
    x.fill();
  }
  x.restore();
  return c;
}

// Polygon with ragged edges, for torn paper.
export function tornPoly(w, h, { j = 3, step = 7, edges = 'tblr' } = {}) {
  const T = edges.includes('t'), B = edges.includes('b'), L = edges.includes('l'), R = edges.includes('r');
  const pts = [];
  for (let x = 0; x <= w; x += step) pts.push([x, T ? rr(0, j) : 0]);
  for (let y = step; y <= h; y += step) pts.push([R ? w - rr(0, j) : w, y]);
  for (let x = w; x >= 0; x -= step) pts.push([x, B ? h - rr(0, j) : h]);
  for (let y = h; y >= 0; y -= step) pts.push([L ? rr(0, j) : 0, y]);
  return pts;
}
export function pathPoly(x, pts) {
  x.beginPath();
  pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])));
  x.closePath();
}

// Copy a sprite onto a padded canvas with a soft drop shadow baked in.
export function bake(c, { pad = 14, blur = 8, off = 3, alpha = 0.28 } = {}) {
  const o = mk(c.width + pad * 2, c.height + pad * 2);
  const x = o.getContext('2d');
  x.shadowColor = `rgba(40,25,10,${alpha})`;
  x.shadowBlur = blur;
  x.shadowOffsetY = off;
  x.shadowOffsetX = off * 0.5;
  x.drawImage(c, pad, pad);
  return o;
}

export function wood(w, h, base = '#a77a50') {
  const c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = base;
  x.fillRect(0, 0, w, h);
  const plank = 160;
  for (let py = 0; py < h; py += plank) {
    const shade = rr(-14, 14);
    x.fillStyle = shade > 0 ? `rgba(255,230,200,${shade / 160})` : `rgba(60,30,10,${-shade / 160})`;
    x.fillRect(0, py, w, plank);
    for (let i = 0; i < 26; i++) {
      const y0 = py + rr(4, plank - 4), amp = rr(1, 5), f = rr(0.002, 0.008), ph = rr(0, TAU);
      x.strokeStyle = `rgba(70,40,15,${rr(0.05, 0.16)})`;
      x.lineWidth = rr(0.6, 2);
      x.beginPath();
      for (let xx = 0; xx <= w; xx += 12) {
        const yy = y0 + Math.sin(xx * f + ph) * amp;
        xx ? x.lineTo(xx, yy) : x.moveTo(xx, yy);
      }
      x.stroke();
    }
    // a knot or two
    if (Math.random() < 0.7) {
      const kx = rr(60, w - 60), ky = py + rr(30, plank - 30);
      for (let r = 3; r < 22; r += 3) {
        x.strokeStyle = `rgba(80,45,20,${0.2 - r / 160})`;
        x.beginPath();
        x.ellipse(kx, ky, r * 2.2, r, 0, 0, TAU);
        x.stroke();
      }
    }
    x.fillStyle = 'rgba(40,20,5,.35)';
    x.fillRect(0, py, w, 2);
  }
  return grain(c, 14);
}

export const PAGE_KINDS = ['dot grid', 'lined', 'grid', 'plain', 'kraft'];

export function pageTex(w, h, kind, side = 'left') {
  const c = mk(w, h), x = c.getContext('2d');
  const kraft = kind === 'kraft';
  x.fillStyle = kraft ? '#c9a57a' : '#f8f2e4';
  x.fillRect(0, 0, w, h);
  if (kraft) {
    for (let i = 0; i < 900; i++) {
      x.strokeStyle = `rgba(${Math.random() < 0.5 ? '90,60,30' : '240,220,190'},${rr(0.05, 0.18)})`;
      x.lineWidth = rr(0.4, 1.1);
      const px = rr(0, w), py = rr(0, h), a = rr(0, TAU), l = rr(3, 12);
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
    }
  }
  if (kind === 'dot grid') {
    x.fillStyle = 'rgba(80,70,60,.28)';
    for (let yy = 24; yy < h - 10; yy += 22) for (let xx = 24; xx < w - 10; xx += 22) {
      x.beginPath(); x.arc(xx, yy, 1.15, 0, TAU); x.fill();
    }
  } else if (kind === 'lined') {
    x.strokeStyle = 'rgba(90,120,165,.28)'; x.lineWidth = 1;
    for (let yy = 70; yy < h - 20; yy += 28) { x.beginPath(); x.moveTo(0, yy); x.lineTo(w, yy); x.stroke(); }
    x.strokeStyle = 'rgba(210,90,90,.35)';
    const mx = side === 'left' ? w - 50 : 50;
    x.beginPath(); x.moveTo(mx, 0); x.lineTo(mx, h); x.stroke();
  } else if (kind === 'grid') {
    x.strokeStyle = 'rgba(80,130,120,.17)'; x.lineWidth = 1;
    for (let yy = 20; yy < h; yy += 20) { x.beginPath(); x.moveTo(0, yy); x.lineTo(w, yy); x.stroke(); }
    for (let xx = 20; xx < w; xx += 20) { x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx, h); x.stroke(); }
  }
  // soft watercolour wash
  for (let i = 0; i < 7; i++) {
    const bx = rr(0, w), by = rr(0, h), br = rr(80, 220);
    const wg = x.createRadialGradient(bx, by, 0, bx, by, br);
    const col = pick(kraft ? ['120,80,40', '200,170,120'] : ['230,190,150', '200,215,180', '235,200,205', '210,200,230']);
    wg.addColorStop(0, `rgba(${col},${rr(0.05, 0.11)})`); wg.addColorStop(0.7, `rgba(${col},${rr(0.02, 0.05)})`); wg.addColorStop(1, `rgba(${col},0)`);
    x.fillStyle = wg; x.fillRect(0, 0, w, h);
  }
  // gentle vignette toward the edges
  const g = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, kraft ? 'rgba(70,40,15,.22)' : 'rgba(120,90,50,.16)');
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);
  return grain(c, kraft ? 16 : 9);
}
