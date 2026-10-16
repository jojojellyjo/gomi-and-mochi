import { game, save, finishDay, newDay } from '../state.js';
import { Button, F, INK, toasts } from '../ui.js';
import { getDesk } from '../bg.js';
import { drawCat, CAT_NAME } from '../cat.js';
import { FLOWER_TYPES } from '../flowers.js';
import { mk, grain } from '../textures.js';
import { makeTapeStrip, WASHI } from '../ephemera.js';
import { sfx } from '../sfx.js';

let card = null, buttons = [], t = 0, blob = null, spreadImg = null;

function compose(image) {
  const W = 1200, H = 1010, c = mk(W, H), x = c.getContext('2d');
  x.drawImage(getDesk(), 0, 0, 1280, 800, 0, 0, W, H);
  const s = Math.min((W - 80) / image.width, 760 / image.height);
  const iw = image.width * s, ih = image.height * s;
  x.drawImage(image, (W - iw) / 2, 24, iw, ih);

  // caption card
  x.save();
  x.translate(W / 2, 880);
  x.rotate(-0.012);
  x.fillStyle = 'rgba(30,15,5,.35)'; x.fillRect(-470 + 4, -88 + 8, 940, 176);
  const paper = mk(940, 176), p = paper.getContext('2d');
  p.fillStyle = '#fbf5e6'; p.fillRect(0, 0, 940, 176);
  grain(paper, 10);
  x.drawImage(paper, -470, -88);
  for (const [tx, rot] of [[-420, -0.5], [420, 0.5]]) {
    const tape = makeTapeStrip(WASHI[1], 110);
    x.save(); x.translate(tx, -84); x.rotate(rot); x.drawImage(tape, -55, -17); x.restore();
  }
  const d = new Date();
  const st = game.day.stats, pressed = game.day.pressed.length;
  x.fillStyle = INK;
  x.font = `600 40px ${F.serif}`;
  x.fillText(`Day ${game.day.n}`, -430, -26);
  x.font = `30px ${F.hand}`;
  x.fillText(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), -430, 12);
  x.font = `29px ${F.hand}`;
  x.fillText(`${pressed} flower${pressed === 1 ? '' : 's'} pressed · ${st.perfect} perfect`, -190, -32);
  x.fillText(`${CAT_NAME} visited ${st.visits}× · ${st.paws ? st.paws + ' paw print' + (st.paws > 1 ? 's' : '') : 'no paw prints'} · ${st.pets} pet${st.pets === 1 ? '' : 's'}`, -190, 4);
  x.fillText(`flowers collected ${Object.keys(save.found).length} / ${FLOWER_TYPES.length} · memories ${(save.memories || []).length} / 3`, -190, 40);
  x.font = `italic 600 22px ${F.serif}`; x.fillStyle = 'rgba(58,46,40,.6)';
  x.textAlign = 'right'; x.fillText('Gomi & Mochi ✿', 300, 66);
  x.restore();
  x.save(); x.translate(W / 2 + 400, 950); drawCat(x, { pose: 'sit', t: 1, dir: -1, s: 0.75 }); x.restore();
  return c;
}

function download() {
  const done = (b) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = `gomi-and-mochi-day-${game.day.n}.png`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toasts.add('Saved to your downloads ✿');
  };
  if (blob) done(blob); else card.toBlob((b) => { blob = b; done(b); });
}

async function share() {
  const go = async (b) => {
    const file = new File([b], `gomi-and-mochi-day-${game.day.n}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'My Gomi & Mochi journal', text: `Day ${game.day.n} of my Gomi & Mochi journal ✿` }); } catch (e) { /* cancelled */ }
    } else download();
  };
  if (blob) go(blob); else card.toBlob((b) => { blob = b; go(b); });
}

export const keepsake = {
  enter(arg) {
    t = 0; blob = null;
    finishDay();
    spreadImg = arg.image;
    card = compose(arg.image);
    sfx.chime();
    toasts.clear();
    const bx = 950, bw = 300;
    buttons = [
      new Button({ x: bx, y: 300, w: bw, h: 58, label: 'Save keepsake', primary: true, onClick: download }),
      new Button({ x: bx, y: 372, w: bw, h: 58, label: 'Share', onClick: share }),
      new Button({ x: bx, y: 444, w: bw, h: 58, label: '← Back to journal', onClick: () => game.go('journal') }),
      game.day.n === 3
        ? new Button({ x: bx, y: 560, w: bw, h: 58, label: 'Seal it as a letter →', primary: true, onClick: () => { sfx.click(); game.go('letter', { image: spreadImg }); } })
        : new Button({ x: bx, y: 560, w: bw, h: 58, label: `Start day ${game.day.n + 1} →`, onClick: () => { newDay(); game.go('morning'); } }),
    ];
  },
  update(dt) { t += dt; toasts.update(dt); },
  draw(x) {
    x.drawImage(getDesk(), 0, 0);
    const s = Math.min(860 / card.width, 740 / card.height);
    x.save();
    x.translate(40 + (860 - card.width * s) / 2, 30);
    x.rotate(-0.01);
    x.fillStyle = 'rgba(30,15,5,.45)'; x.fillRect(6, 10, card.width * s, card.height * s);
    x.drawImage(card, 0, 0, card.width * s, card.height * s);
    x.restore();
    x.save();
    x.fillStyle = '#fdf7ea'; x.shadowColor = 'rgba(30,15,5,.5)'; x.shadowBlur = 6;
    x.font = `600 40px ${F.serif}`; x.fillText('Your keepsake', 950, 150);
    x.font = `26px ${F.hand}`;
    x.fillText('save it, share it with friends,', 952, 200);
    x.fillText('or keep journalling', 952, 232);
    x.restore();
    for (const b of buttons) b.draw(x, t);
    toasts.draw(x, 1280);
  },
  pointerdown(p) { for (const b of buttons) if (b.hit(p)) return b.onClick(); },
  pointermove(p) { let h = false; for (const b of buttons) { b.hover = b.hit(p); h = h || b.hover; } game.cursor = h ? 'pointer' : 'default'; },
};
