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
  x.beginPath(); x.roundRect(90, 150, 300, 170, 8); x.fill();
  x.strokeStyle = 'rgba(80,60,40,.5)'; x.lineWidth = 1.5;
  x.beginPath(); x.roundRect(100, 160, 280, 150, 6); x.stroke();
  x.fillStyle = INK; x.textAlign = 'center';
  x.font = `600 74px ${F.serif}`; x.fillText('Pressed', 240, 250);
  x.font = `30px ${F.hand}`; x.fillText('a little junk journal', 240, 290);
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
      x: 760, y: 560, w: 320, h: 66, primary: true, size: 26,
      label: save.days ? `Start day ${save.days + 1}` : 'Start your first day',
      onClick: () => { sfx.chime(); newDay(); game.go('morning'); },
    });
  },
  update(dt) { t += dt; },
  draw(x) {
    x.drawImage(getDesk(), 0, 0);
    x.save(); x.translate(380, 410); x.rotate(-0.05); x.drawImage(cover, -cover.width / 2, -cover.height / 2); x.restore();

    x.save();
    x.shadowColor = 'rgba(30,15,5,.5)'; x.shadowBlur = 8; x.shadowOffsetY = 2;
    x.fillStyle = '#fdf7ea';
    x.font = `600 46px ${F.serif}`;
    x.fillText('Forage. Press. Journal.', 720, 170);
    x.font = `31px ${F.hand}`;
    const lines = [
      '✿  pick flowers from the garden',
      '✿  press them nice and evenly',
      '✿  junk-journal a keepsake spread',
      `✿  …while ${CAT_NAME} tries very hard to help`,
    ];
    lines.forEach((l, i) => x.fillText(l, 724, 232 + i * 44));
    x.restore();

    // herbarium shelf
    x.save();
    x.fillStyle = 'rgba(250,244,230,.92)';
    x.beginPath(); x.roundRect(720, 420, 470, 104, 12); x.fill();
    x.fillStyle = INK; x.font = `600 18px ${F.serif}`;
    const found = Object.keys(save.found).length;
    x.fillText(`Herbarium  ${found} / ${FLOWER_TYPES.length}`, 740, 446);
    FLOWER_TYPES.forEach((type, i) => {
      const ic = icons[type][save.found[type] ? 'on' : 'off'];
      const s = 48 / Math.max(ic.width, ic.height);
      x.drawImage(ic, 748 + i * 63, 458, ic.width * s, ic.height * s);
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
