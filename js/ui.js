// Fonts, buttons and the little paper toasts.
export const INK = '#3a2e28';
export const CREAM = '#f7f1e3';
export const MATCHA = '#7f9c5b';
export const F = {
  serif: "'Fraunces', Georgia, serif",
  hand: "'Caveat', 'Bradley Hand', cursive",
  type: "'Special Elite', 'Courier New', monospace",
};

export class Button {
  constructor(o) {
    Object.assign(this, { enabled: true, visible: true, primary: false, size: 20 }, o);
    this.hover = false;
    this.pulse = false;
  }
  contains(p) { return p.x >= this.x && p.x <= this.x + this.w && p.y >= this.y && p.y <= this.y + this.h; }
  hit(p) { return this.visible && this.enabled && this.contains(p); }
  draw(x, t = 0) {
    if (!this.visible) return;
    x.save();
    x.globalAlpha = this.enabled ? 1 : 0.45;
    const lift = (this.hover && this.enabled ? -2 : 0) + (this.pulse ? Math.sin(t * 6) * 2 : 0);
    x.translate(0, lift);
    x.fillStyle = 'rgba(40,25,10,.28)';
    x.beginPath(); x.roundRect(this.x + 2, this.y + 4 - lift, this.w, this.h, 12); x.fill();
    x.fillStyle = this.primary ? MATCHA : '#fbf6ea';
    x.beginPath(); x.roundRect(this.x, this.y, this.w, this.h, 12); x.fill();
    x.strokeStyle = this.primary ? '#5d7741' : 'rgba(58,46,40,.3)';
    x.lineWidth = 1.5; x.stroke();
    x.fillStyle = this.primary ? '#fffdf5' : INK;
    x.font = `600 ${this.size}px ${F.serif}`;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(this.label, this.x + this.w / 2, this.y + this.h / 2 + 1);
    x.restore();
  }
}

export function hoverButtons(buttons, p) {
  let any = false;
  for (const b of buttons) { b.hover = b.hit(p); any = any || b.hover; }
  return any;
}

export const toasts = {
  list: [],
  y: 118,
  add(text, dur = 2.6) {
    this.list.push({ text, t: 0, dur, rot: (Math.random() - 0.5) * 0.04 });
    if (this.list.length > 3) this.list.shift();
  },
  clear() { this.list = []; },
  update(dt) { for (const t of this.list) t.t += dt; this.list = this.list.filter((t) => t.t < t.dur); },
  draw(x, W) {
    let y = this.y;
    for (const t of this.list) {
      const a = Math.max(0, Math.min(1, t.t * 6, (t.dur - t.t) * 3));
      x.save();
      x.globalAlpha = a;
      x.translate(W / 2, y + (1 - Math.min(1, t.t * 6)) * -10);
      x.rotate(t.rot);
      x.font = `30px ${F.hand}`;
      const w = x.measureText(t.text).width + 44;
      x.fillStyle = 'rgba(40,25,10,.25)'; x.fillRect(-w / 2 + 2, -20, w, 44);
      x.fillStyle = '#fffaf0'; x.fillRect(-w / 2, -23, w, 44);
      x.fillStyle = 'rgba(190,210,160,.75)'; x.fillRect(-16, -31, 32, 14);
      x.fillStyle = INK; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(t.text, 0, 0);
      x.restore();
      y += 56;
    }
  },
};

// Small speaker icon used for the global mute toggle.
export function drawSpeaker(x, cx, cy, muted) {
  x.save();
  x.fillStyle = 'rgba(251,246,234,.92)';
  x.beginPath(); x.arc(cx, cy, 20, 0, Math.PI * 2); x.fill();
  x.fillStyle = INK; x.strokeStyle = INK; x.lineWidth = 2; x.lineCap = 'round';
  x.beginPath(); x.moveTo(cx - 9, cy - 4); x.lineTo(cx - 4, cy - 4); x.lineTo(cx + 2, cy - 10); x.lineTo(cx + 2, cy + 10); x.lineTo(cx - 4, cy + 4); x.lineTo(cx - 9, cy + 4); x.closePath(); x.fill();
  if (muted) {
    x.beginPath(); x.moveTo(cx + 6, cy - 5); x.lineTo(cx + 13, cy + 5); x.moveTo(cx + 13, cy - 5); x.lineTo(cx + 6, cy + 5); x.stroke();
  } else {
    x.beginPath(); x.arc(cx + 3, cy, 6, -0.9, 0.9); x.stroke();
    x.beginPath(); x.arc(cx + 3, cy, 11, -0.9, 0.9); x.stroke();
  }
  x.restore();
}

// Hana's inner monologue: one quiet line at the bottom of the screen.
export const thoughts = {
  cur: null,
  say(text, dur = 4.5) { this.cur = { text, t: 0, dur }; },
  clear() { this.cur = null; },
  update(dt) { if (this.cur) { this.cur.t += dt; if (this.cur.t > this.cur.dur) this.cur = null; } },
  draw(x, W, H) {
    const c = this.cur;
    if (!c) return;
    const a = Math.max(0, Math.min(1, c.t * 3, (c.dur - c.t) * 2));
    x.save();
    x.globalAlpha = a;
    x.font = `italic 30px ${F.hand}`;
    const text = `“${c.text}”`;
    const w = Math.min(W - 80, x.measureText(text).width + 60);
    const y = H - 70;
    x.fillStyle = 'rgba(28,18,10,.78)';
    x.beginPath(); x.roundRect(W / 2 - w / 2, y - 26, w, 52, 26); x.fill();
    x.fillStyle = '#f7ead2'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(text, W / 2, y + 1);
    x.font = `600 13px ${F.serif}`; x.fillStyle = 'rgba(247,234,210,.7)';
    x.fillText('HANA', W / 2 - w / 2 + 34, y - 34);
    x.restore();
  },
};
