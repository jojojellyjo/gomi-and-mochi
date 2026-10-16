import { game, save, newDay } from '../state.js';
import { Button, F, INK } from '../ui.js';
import { getDesk } from '../bg.js';
import { drawCat, CAT_NAME } from '../cat.js';
import { FLOWERS, FLOWER_TYPES, flowerSprite } from '../flowers.js';
import { mk, grain, tint, bake } from '../textures.js';
import { makeTapeStrip, WASHI } from '../ephemera.js';
import { sfx } from '../sfx.js';

let btn, t = 0, cover = null, icons = null;

function makeCover() {
  const w = 500, h = 620, c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = '#6f8f5a';
  x.beginPath(); x.roundRect(0, 0, w, h, 14); x.fill();
  x.save(); x.clip();
  for (let i = 0; i < w; i += 3) { x.fillStyle = `rgba(255,255,255,${0.03 + (i % 6 ? 0 : 0.03)})`; x.fillRect(i, 0, 1, h); }
  for (let j = 0; j < h; j += 3) { x.fillStyle = 'rgba(0,0,0,.035)'; x.fillRect(0, j, w, 1); }
  x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(0, 0, 26, h);
  x.fillStyle = '#4a3a2c'; x.fillRect(w - 70, 0, 18, h);
  x.restore();
  x.fillStyle = '#f6efdf';
  x.beginPath(); x.roundRect(60, 140, 360, 200, 8); x.fill();
  x.strokeStyle = 'rgba(80,60,40,.5)'; x.lineWidth = 1.5;
  x.beginPath(); x.roundRect(70, 150, 340, 180, 6); x.stroke();
  x.fillStyle = INK; x.textAlign = 'center';
  x.font = `600 64px ${F.serif}`; x.fillText('Gomi', 240, 222);
  x.font = `600 46px ${F.serif}`; x.fillText('& Mochi', 240, 272);
  x.font = `28px ${F.hand}`; x.fillText('a junk journal story', 240, 312);
  const daisy = flowerSprite('daisy', 46);
  x.save(); x.translate(330, 430); x.rotate(0.3); x.drawImage(daisy, -daisy.width / 2, -daisy.height / 2); x.restore();
  const fern = flowerSprite('fern', 60);
  x.save(); x.translate(170, 470); x.rotate(-0.5); x.drawImage(fern, -fern.width / 2, -fern.height / 2); x.restore();
  const tape = makeTapeStrip(WASHI[0], 140);
  x.save(); x.translate(240, 150); x.rotate(-0.08); x.drawImage(tape, -70, -17); x.restore();
  grain(c, 12);
  return bake(c, { pad: 24, blur: 24, off: 10, alpha: 0.45 });
}

function makeIcons() {
  const out = {};
  for (const type of FLOWER_TYPES) {
    const s = flowerSprite(type, 20);
    const ghost = mk(s.width, s.height);
    ghost.getContext('2d').drawImage(s, 0, 0);
    tint(ghost, (r, g, b) => { const l = (r + g + b) / 3 * 0.4 + 140; return [l, l * 0.95, l * 0.88]; });
    out[type] = { on: s, off: ghost };
  }
  return out;
}

export const title = {
  enter() {
    if (!cover) cover = makeCover();
    if (!icons) icons = makeIcons();
    btn = new Button({
      x: 780, y: 540, w: 320, h: 66, primary: true, size: 26,
      label: save.days ? `Start day ${save.days + 1}` : 'Start day 1',
      onClick: () => { sfx.chime(); newDay(); game.go('morning'); },
    });
  },
  update(dt) { t += dt; },
  draw(x) {
    x.drawImage(getDesk(), 0, 0);
    x.save(); x.translate(430, 410); x.rotate(-0.04); x.drawImage(cover, -cover.width / 2, -cover.height / 2); x.restore();

    // a little index card: what you've collected so far
    x.save();
    x.translate(940, 330); x.rotate(0.015);
    x.fillStyle = 'rgba(30,15,5,.35)'; x.fillRect(-206, -146, 420, 300);
    x.fillStyle = '#fbf6ea'; x.fillRect(-210, -150, 420, 300);
    x.fillStyle = 'rgba(190,210,160,.8)'; x.fillRect(-40, -162, 80, 24);
    x.fillStyle = INK; x.textAlign = 'left';
    const mem = (save.memories || []).length, fl = Object.keys(save.found).length;
    x.font = `600 22px ${F.serif}`; x.fillText('memories collected', -180, -92);
    x.font = `600 40px ${F.serif}`; x.textAlign = 'right'; x.fillText(`${mem} / 3`, 180, -88);
    for (let i = 0; i < 3; i++) {
      x.save(); x.translate(-150 + i * 60, -50); x.rotate((i - 1) * 0.1);
      x.fillStyle = i < mem ? '#ffffff' : 'rgba(58,46,40,.08)'; x.fillRect(-20, -16, 40, 46);
      x.fillStyle = i < mem ? ['#e8c98a', '#8a6aa8', '#b8cfa0'][i] : 'rgba(58,46,40,.1)'; x.fillRect(-16, -12, 32, 30);
      x.restore();
    }
    x.textAlign = 'left'; x.font = `600 22px ${F.serif}`; x.fillText('flowers collected', -180, 30);
    x.font = `600 40px ${F.serif}`; x.textAlign = 'right'; x.fillText(`${fl} / ${FLOWER_TYPES.length}`, 180, 34);
    FLOWER_TYPES.forEach((type, i) => {
      const ic = icons[type][save.found[type] ? 'on' : 'off'];
      const sc = 40 / Math.max(ic.width, ic.height);
      x.drawImage(ic, -184 + i * 54, 58, ic.width * sc, ic.height * sc);
    });
    x.restore();

    btn.draw(x, t);

    x.save(); x.translate(1110, 760); drawCat(x, { pose: 'loaf', t, dir: -1, s: 1.05 }); x.restore();
    x.save();
    x.fillStyle = 'rgba(253,247,234,.85)'; x.font = `28px ${F.hand}`;
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.5 + i / 3) % 1;
      x.globalAlpha = Math.sin(k * Math.PI);
      x.fillText('z', 1040 - k * 30 - i * 4, 690 - k * 60);
    }
    x.restore();
  },
  pointerdown(p) { if (btn.hit(p)) btn.onClick(); },
  pointermove(p) { btn.hover = btn.hit(p); game.cursor = btn.hover ? 'pointer' : 'default'; },
  keydown(e) { if (e.key === 'Enter' || e.key === ' ') btn.onClick(); },
};
