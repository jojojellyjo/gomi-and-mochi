// Morning at Hana's door: the garbage calendar, a paper bag of junk and a note.
import { game, save, writeSave } from '../state.js';
import { Button, F, INK, toasts } from '../ui.js';
import { mk, rr, TAU, grain, wood, bake } from '../textures.js';
import { drawHand } from '../hands.js';
import { drawCat, CAT_NAME } from '../cat.js';
import { INTRO, dayInfo, HANA } from '../story.js';
import { sfx } from '../sfx.js';

let t = 0, phase = 'intro', introIdx = 0, info, btn, bg = null, bagOpen = 0, noteOpen = 0, hand = null;

function buildBg() {
  const c = mk(1280, 800), x = c.getContext('2d');
  // wall
  x.fillStyle = '#efe6d4'; x.fillRect(0, 0, 1280, 560);
  for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(160,130,90,${rr(0.02, 0.05)})`; x.fillRect(rr(0, 1280), rr(0, 560), rr(40, 200), rr(1, 3)); }
  // door
  x.fillStyle = '#8a9a8a'; x.fillRect(420, 70, 360, 500);
  x.fillStyle = '#7b8b7b'; x.fillRect(436, 86, 328, 468);
  x.strokeStyle = 'rgba(0,0,0,.12)'; x.lineWidth = 2; x.strokeRect(470, 120, 260, 180); x.strokeRect(470, 330, 260, 190);
  x.fillStyle = '#d9d2c2'; x.beginPath(); x.arc(600, 160, 10, 0, TAU); x.fill();
  x.fillStyle = '#3a3a40'; x.beginPath(); x.arc(600, 160, 5, 0, TAU); x.fill();
  x.fillStyle = '#c9c2b4'; x.beginPath(); x.roundRect(730, 300, 24, 70, 8); x.fill();
  x.fillStyle = '#f6efe0'; x.fillRect(560, 210, 80, 26);
  x.fillStyle = INK; x.font = `16px ${F.type}`; x.textAlign = 'center'; x.fillText('2F · 203', 600, 229);
  // genkan floor + step
  const fl = wood(1280, 260, '#b98d62');
  x.drawImage(fl, 0, 560);
  x.fillStyle = 'rgba(40,20,5,.25)'; x.fillRect(0, 560, 1280, 8);
  x.fillStyle = '#9a9a96'; x.fillRect(380, 568, 440, 232);
  x.fillStyle = 'rgba(255,255,255,.06)';
  for (let i = 0; i < 400; i++) x.fillRect(rr(380, 820), rr(568, 800), 2, 2);
  // slippers
  for (const [sx, col] of [[880, '#d9867d'], [960, '#d9867d']]) {
    x.fillStyle = col; x.beginPath(); x.ellipse(sx, 690, 30, 62, 0.1, 0, TAU); x.fill();
    x.fillStyle = '#f6efe0'; x.beginPath(); x.ellipse(sx, 670, 26, 22, 0.1, Math.PI, 0); x.fill();
  }
  // shoe cabinet
  x.fillStyle = '#c9a77c'; x.fillRect(60, 300, 300, 260);
  x.strokeStyle = 'rgba(80,50,20,.3)'; x.strokeRect(70, 310, 135, 240); x.strokeRect(215, 310, 135, 240);
  x.fillStyle = '#7f9c5b';
  x.beginPath(); x.ellipse(150, 280, 40, 26, 0, Math.PI, 0); x.fill();
  x.fillStyle = '#c4703f'; x.fillRect(120, 272, 60, 30);
  return grain(c, 8);
}

function calendar(x) {
  const X = 880, Y = 90, W = 300, H = 330;
  x.save();
  x.translate(X, Y); x.rotate(0.02);
  x.fillStyle = 'rgba(30,15,5,.2)'; x.fillRect(4, 6, W, H);
  x.fillStyle = '#fbf8f0'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#c0574b'; x.beginPath(); x.arc(W / 2, -2, 7, 0, TAU); x.fill();
  x.fillStyle = INK; x.textAlign = 'center';
  x.font = `600 22px ${F.serif}`; x.fillText('rubbish days', W / 2, 36);
  x.font = '15px sans-serif'; x.fillText('ごみカレンダー', W / 2, 58);
  const rows = [['Mon', '燃えるごみ', 'burnables', '#d9786a'], ['Wed', 'プラスチック', 'plastics', '#7fa6c9'], ['Fri', '古紙', 'paper', '#c9a24f'], ['Tue', 'びん・かん', 'cans & bottles', '#8fb36a']];
  rows.forEach(([d, ja, en, col], i) => {
    const y = 84 + i * 58, today = info.weekday.startsWith(d);
    x.fillStyle = today ? col : 'rgba(0,0,0,.04)';
    x.beginPath(); x.roundRect(16, y, W - 32, 48, 8); x.fill();
    x.fillStyle = today ? '#fffdf5' : INK; x.textAlign = 'left';
    x.font = `600 18px ${F.serif}`; x.fillText(d, 28, y + 30);
    x.font = '14px sans-serif'; x.fillText(ja, 84, y + 21);
    x.font = `20px ${F.hand}`; x.fillText(en, 84, y + 41);
    if (today) { x.textAlign = 'right'; x.font = `22px ${F.hand}`; x.fillText('today!', W - 26, y + 31); }
  });
  x.restore();
}

function bag(x, ox, oy) {
  x.save(); x.translate(ox, oy);
  x.fillStyle = 'rgba(30,15,5,.3)'; x.beginPath(); x.ellipse(0, 120, 120, 16, 0, 0, TAU); x.fill();
  const g = x.createLinearGradient(-100, 0, 100, 0);
  g.addColorStop(0, '#b88a5c'); g.addColorStop(0.5, '#cfa572'); g.addColorStop(1, '#b0825a');
  x.fillStyle = g;
  x.beginPath(); x.moveTo(-96, -40); x.lineTo(96, -40); x.lineTo(104, 120); x.lineTo(-104, 120); x.closePath(); x.fill();
  x.fillStyle = 'rgba(80,50,20,.2)';
  for (let i = -80; i < 100; i += 26) x.fillRect(i, -40, 2, 160);
  x.fillStyle = '#c29866'; x.beginPath(); x.moveTo(-96, -40); x.lineTo(-70, -64); x.lineTo(70, -64); x.lineTo(96, -40); x.fill();
  // peeking junk
  const peek = bagOpen;
  x.save(); x.translate(-40, -50 - peek * 30); x.rotate(-0.3);
  x.fillStyle = '#f3d9a4'; x.fillRect(-30, -40, 60, 80); x.restore();
  x.save(); x.translate(20, -60 - peek * 40); x.rotate(0.2);
  x.fillStyle = '#fbfaf6'; x.fillRect(-36, -46, 72, 86); x.fillStyle = '#c9b8a0'; x.fillRect(-28, -38, 56, 56); x.restore();
  x.save(); x.translate(60, -44 - peek * 24); x.rotate(0.5);
  x.fillStyle = '#9b2335'; x.beginPath(); x.arc(0, 0, 18, 0, TAU); x.fill(); x.restore();
  x.restore();
}

function noteCard(x, k) {
  const W = 420, H = 260;
  const s = 0.4 + 0.6 * k;
  x.save();
  x.translate(640 - (1 - k) * 60, 330 + (1 - k) * 180);
  x.rotate(-0.04 * (1 - k) - 0.02);
  x.scale(s, s);
  x.fillStyle = 'rgba(30,15,5,.3)'; x.fillRect(-W / 2 + 6, -H / 2 + 8, W, H);
  x.fillStyle = '#fbf6e6'; x.fillRect(-W / 2, -H / 2, W, H);
  x.strokeStyle = 'rgba(90,120,165,.25)';
  for (let y = -H / 2 + 60; y < H / 2 - 10; y += 34) { x.beginPath(); x.moveTo(-W / 2 + 20, y); x.lineTo(W / 2 - 20, y); x.stroke(); }
  x.fillStyle = 'rgba(190,210,160,.8)'; x.fillRect(-40, -H / 2 - 12, 80, 24);
  x.fillStyle = '#3b3550'; x.font = `36px ${F.hand}`; x.textAlign = 'left';
  info.note.forEach((line, i) => x.fillText(line, -W / 2 + 30, -H / 2 + 54 + i * 52));
  x.restore();
}

export const morning = {
  enter() {
    t = 0; bagOpen = 0; noteOpen = 0; hand = null;
    if (!bg) bg = buildBg();
    info = dayInfo(game.day.n);
    game.day.info = info;
    phase = game.day.n === 1 && !save.seenIntro ? 'intro' : 'door';
    introIdx = 0;
    btn = new Button({ x: 990, y: 700, w: 260, h: 60, label: 'To the balcony →', primary: true, visible: false, onClick: () => { sfx.click(); game.go('garden'); } });
    toasts.clear();
    if (phase === 'door') toasts.add('Tap the note, then the bag', 2.6);
  },
  update(dt) {
    t += dt;
    if (phase === 'note') noteOpen = Math.min(1, noteOpen + dt * 3);
    else noteOpen = Math.max(0, noteOpen - dt * 3);
    if (phase === 'bag') bagOpen = Math.min(1, bagOpen + dt * 2);
    if (hand) { hand.t += dt; if (hand.t > 0.6) hand = null; }
    toasts.update(dt);
  },
  draw(x) {
    if (phase === 'intro') return drawIntro(x);
    x.drawImage(bg, 0, 0);
    calendar(x);
    bag(x, 600, 590);
    if (noteOpen < 1) {
      // note taped on the bag
      x.save(); x.translate(600, 610); x.rotate(-0.06);
      x.fillStyle = '#fbf6e6'; x.fillRect(-60, -34, 120, 68);
      x.fillStyle = 'rgba(190,210,160,.8)'; x.fillRect(-18, -42, 36, 14);
      x.fillStyle = '#3b3550'; x.font = `22px ${F.hand}`; x.textAlign = 'center'; x.fillText('for 203 ♥', 0, 8);
      x.restore();
    }
    if (noteOpen > 0) {
      x.fillStyle = `rgba(30,20,10,${0.35 * noteOpen})`; x.fillRect(0, 0, 1280, 800);
      noteCard(x, noteOpen);
    }
    if (hand) {
      const k = Math.sin(Math.min(1, hand.t / 0.6) * Math.PI);
      x.save(); x.translate(hand.x + 140 - k * 140, hand.y + 160 - k * 160); drawHand(x, { pose: 'pinch', s: 1.1 }); x.restore();
    }
    x.save(); x.translate(1110, 600); drawCat(x, { pose: 'sit', t, dir: -1, s: 0.9 }); x.restore();
    x.save();
    x.fillStyle = INK; x.font = `600 32px ${F.serif}`; x.textAlign = 'left';
    x.fillText(`Day ${game.day.n} · ${info.weekday} morning`, 34, 58);
    x.font = `25px ${F.hand}`;
    x.fillText(phase === 'bag' ? 'the bag is full of treasures… and one old polaroid' : phase === 'note' ? 'tap anywhere to put the note down' : 'a paper bag is waiting outside the door', 36, 88);
    x.restore();
    btn.draw(x, t);
    toasts.draw(x, 1280);
  },
  pointerdown(p) {
    if (phase === 'intro') {
      sfx.click();
      introIdx++;
      if (introIdx >= INTRO.length) { phase = 'door'; save.seenIntro = true; writeSave(); toasts.add('Tap the note, then the bag', 2.6); }
      return;
    }
    if (btn.hit(p)) return btn.onClick();
    if (phase === 'note') { phase = 'door2'; return; }
    const onNote = Math.abs(p.x - 600) < 70 && Math.abs(p.y - 610) < 45;
    const onBag = Math.abs(p.x - 600) < 110 && p.y > 480 && p.y < 720;
    if (onNote && phase !== 'bag') { phase = 'note'; hand = { x: 600, y: 610, t: 0 }; sfx.pop(); return; }
    if (onBag) {
      if (phase === 'door') { toasts.add('Read the note first?', 1.6); }
      phase = 'bag'; btn.visible = true; hand = { x: 600, y: 540, t: 0 }; sfx.rip();
      toasts.add(info.memory ? 'There\'s a polaroid inside. Look for it in your journal' : 'More junk for the journal!', 3);
      return;
    }
    if (Math.abs(p.x - 1110) < 50 && p.y > 470 && p.y < 610) { sfx.meow(); toasts.add(`${CAT_NAME} wants breakfast`, 1.4); }
  },
  pointermove(p) {
    btn.hover = btn.hit(p);
    const onNote = Math.abs(p.x - 600) < 70 && Math.abs(p.y - 610) < 45;
    const onBag = Math.abs(p.x - 600) < 110 && p.y > 480 && p.y < 720;
    game.cursor = phase === 'intro' || btn.hover || onNote || onBag || phase === 'note' ? 'pointer' : 'default';
  },
  keydown(e) { if (e.key === 'Enter' || e.key === ' ') this.pointerdown({ x: -1, y: -1 }); },
};

function drawIntro(x) {
  x.fillStyle = '#2b211b'; x.fillRect(0, 0, 1280, 800);
  x.save();
  x.translate(640, 380);
  x.rotate(-0.01 * (introIdx % 2 ? -1 : 1));
  x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(-372, -212, 760, 440);
  x.fillStyle = '#fbf6e6'; x.fillRect(-380, -220, 760, 440);
  x.fillStyle = 'rgba(190,210,160,.8)'; x.fillRect(-50, -232, 100, 26);
  x.fillStyle = '#3b3550'; x.font = `38px ${F.hand}`; x.textAlign = 'left';
  const words = INTRO[introIdx].split(' ');
  let line = '', y = -130;
  for (const w of words) {
    if (x.measureText(line + w).width > 640) { x.fillText(line, -330, y); line = ''; y += 54; }
    line += w + ' ';
  }
  x.fillText(line, -330, y);
  x.font = `600 16px ${F.serif}`; x.fillStyle = 'rgba(58,46,40,.6)'; x.textAlign = 'right';
  x.fillText(`${introIdx + 1} / ${INTRO.length}  ·  tap to continue`, 350, 196);
  x.restore();
  x.fillStyle = '#fdf7ea'; x.font = `600 28px ${F.serif}`; x.textAlign = 'center';
  x.fillText('Gomi & Mochi', 640, 110);
}
