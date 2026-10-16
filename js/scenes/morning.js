// Morning at Hana's door: the garbage calendar, a paper bag of junk and a note.
import { game, save, writeSave } from '../state.js';
import { Button, F, INK, toasts, thoughts } from '../ui.js';
import { mk, rr, TAU, grain, wood, bake } from '../textures.js';
import { drawHand } from '../hands.js';
import { drawCat, CAT_NAME } from '../cat.js';
import { INTRO, dayInfo, HANA } from '../story.js';
import { sfx } from '../sfx.js';

let t = 0, phase = 'intro', introIdx = 0, info, btn, bg = null, bagOpen = 0, noteOpen = 0, hand = null, hub = [], hearts = 0;

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
  // a trailing pothos in a little glazed pot
  const vine = (x0, y0, len, dir) => {
    x.strokeStyle = '#5f7f45'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(x0, y0);
    for (let k = 1; k <= len; k++) x.lineTo(x0 + Math.sin(k * 0.6) * 6 * dir + dir * k * 2, y0 + k * 12);
    x.stroke();
    for (let k = 1; k <= len; k += 1) {
      const lx = x0 + Math.sin(k * 0.6) * 6 * dir + dir * k * 2, ly = y0 + k * 12;
      x.save(); x.translate(lx, ly); x.rotate(dir * 0.8 + Math.sin(k) * 0.4);
      x.fillStyle = k % 2 ? '#6f9a52' : '#86b062';
      x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(9, -4, 10, -14, 0, -18); x.bezierCurveTo(-10, -14, -9, -4, 0, 0); x.fill();
      x.strokeStyle = 'rgba(230,240,200,.5)'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, -2); x.lineTo(0, -15); x.stroke();
      x.restore();
    }
  };
  for (let k = 0; k < 9; k++) {
    x.save(); x.translate(150 + (k - 4) * 9, 262); x.rotate((k - 4) * 0.28);
    x.fillStyle = k % 2 ? '#6f9a52' : '#86b062';
    x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(13, -8, 14, -26, 0, -32); x.bezierCurveTo(-14, -26, -13, -8, 0, 0); x.fill();
    x.strokeStyle = 'rgba(230,240,200,.5)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(0, -3); x.lineTo(0, -28); x.stroke();
    x.restore();
  }
  vine(126, 290, 9, -1); vine(176, 290, 7, 1); vine(150, 296, 5, 1);
  const pg = x.createLinearGradient(118, 0, 182, 0); pg.addColorStop(0, '#d9d2c4'); pg.addColorStop(0.5, '#f2ece0'); pg.addColorStop(1, '#cfc7b8');
  x.fillStyle = pg; x.beginPath(); x.moveTo(116, 262); x.lineTo(184, 262); x.lineTo(176, 302); x.lineTo(124, 302); x.closePath(); x.fill();
  x.fillStyle = '#7fa6c9'; x.fillRect(119, 276, 62, 6);
  x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(116, 262, 68, 4);
  return grain(c, 8);
}

function calendar(x) {
  const X = 880, Y = 90, W = 300, H = 346;
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
  x.textAlign = 'left'; x.fillStyle = 'rgba(58,46,40,.75)'; x.font = `17px ${F.hand}`;
  x.fillText('burnables = food scraps, tissues, paper bits', 18, H - 8);
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
  enter(arg) {
    t = 0; hand = null; hearts = 0;
    if (!bg) bg = buildBg();
    info = dayInfo(game.day.n);
    game.day.info = info;
    introIdx = 0;
    if (arg && arg.back) {
      phase = 'hub'; bagOpen = 1; noteOpen = 0;
      buildHub();
      toasts.clear();
      return;
    }
    bagOpen = 0; noteOpen = 0;
    phase = game.day.n === 1 && !save.seenIntro ? 'intro' : 'door';
    if (phase === 'door') setTimeout(() => { if (game.sceneName === 'morning' && phase === 'door') thoughts.say(info.thoughts.wake); }, 600);
    btn = new Button({ x: 0, y: 0, w: 1, h: 1, label: '', visible: false, onClick: () => {} });
    hub = [];
    toasts.clear();
    if (phase === 'door') toasts.add('Tap the note, then the bag', 2.6);
  },
  update(dt) {
    t += dt;
    if (phase === 'note') noteOpen = Math.min(1, noteOpen + dt * 3);
    else noteOpen = Math.max(0, noteOpen - dt * 3);
    if (phase === 'bag') bagOpen = Math.min(1, bagOpen + dt * 2);
    if (hand) { hand.t += dt; if (hand.t > 0.6) hand = null; }
    if (hearts) hearts = Math.max(0, hearts - dt);
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
    x.fillText(phase === 'hub' ? 'the bag is open · what would you like to do?' : phase === 'bag' ? 'the bag is full of treasures… and one old polaroid' : phase === 'note' ? 'tap anywhere to put the note down' : 'a paper bag is waiting outside the door', 36, 88);
    x.restore();
    if (hearts) {
      x.save(); x.fillStyle = '#e06c84'; x.font = `34px ${F.hand}`;
      for (let i = 0; i < 3; i++) { x.globalAlpha = hearts / 1.4; x.fillText('♥', 1090 + i * 20, 470 - (1.4 - hearts) * 70 - i * 10); }
      x.restore();
    }
    if (phase === 'hub') drawHub(x);
    toasts.draw(x, 1280);
  },
  pointerdown(p) {
    if (phase === 'intro') {
      sfx.click();
      introIdx++;
      if (introIdx >= INTRO.length) { phase = 'door'; save.seenIntro = true; writeSave(); thoughts.say(info.thoughts.wake); toasts.add('Tap the note, then the bag', 2.6); }
      return;
    }
    if (phase === 'hub') {
      for (const b of hub) if (b.hit(p)) return b.onClick();
      if (Math.abs(p.x - 1110) < 60 && p.y > 470 && p.y < 610) return petCat();
      return;
    }
    if (phase === 'note') { phase = 'door2'; return; }
    const onNote = Math.abs(p.x - 600) < 70 && Math.abs(p.y - 610) < 45;
    const onBag = Math.abs(p.x - 600) < 110 && p.y > 480 && p.y < 720;
    if (onNote && phase !== 'bag') { phase = 'note'; hand = { x: 600, y: 610, t: 0 }; sfx.paper(); thoughts.say(info.thoughts.note); return; }
    if (onBag) {
      if (phase === 'door') { toasts.add('Read the note first?', 1.6); }
      phase = 'bag'; hand = { x: 600, y: 540, t: 0 }; sfx.bag();
      thoughts.say(info.thoughts.bag);
      setTimeout(() => { if (game.sceneName === 'morning' && phase === 'bag') { phase = 'hub'; buildHub(); } }, 1100);
      return;
    }
    if (Math.abs(p.x - 1110) < 50 && p.y > 470 && p.y < 610) petCat();
  },
  pointermove(p) {
    if (phase === 'hub') {
      let h = false; for (const b of hub) { b.hover = b.hit(p); h = h || b.hover; }
      game.cursor = h || (Math.abs(p.x - 1110) < 60 && p.y > 470 && p.y < 610) ? 'pointer' : 'default';
      return;
    }
    const onNote = Math.abs(p.x - 600) < 70 && Math.abs(p.y - 610) < 45;
    const onBag = Math.abs(p.x - 600) < 110 && p.y > 480 && p.y < 720;
    game.cursor = phase === 'intro' || onNote || onBag || phase === 'note' ? 'pointer' : 'default';
  },
  keydown(e) { if (phase !== 'hub' && (e.key === 'Enter' || e.key === ' ')) this.pointerdown({ x: -1, y: -1 }); },
};

function petCat() {
  hearts = 1.4; sfx.purr(); game.day.stats.pets++;
  const lines = [`${CAT_NAME} purrs like a little engine.`, `Okay, okay, breakfast first.`, `You're the only one who knew Obaachan too, huh.`];
  thoughts.say(lines[Math.min(game.day.stats.pets - 1, lines.length - 1)] || lines[0], 3.5);
}

function buildHub() {
  const d = game.day;
  const W = 330, H = 92, gx = 640 - W - 10, gy = 300;
  const mk2 = (i, label, sub, enabled, onClick, primary) => {
    const b = new Button({ x: gx + (i % 2) * (W + 20), y: gy + Math.floor(i / 2) * (H + 20), w: W, h: H, label, size: 22, primary, enabled, onClick });
    b.sub = sub;
    return b;
  };
  hub = [
    mk2(0, '✦  Look at the polaroid', info.memory ? (d.memoryDone ? 'a memory, collected' : 'step inside an old photo') : 'no polaroid today', !!info.memory && !d.memoryDone,
      () => { sfx.paper(); game.go('memory', { memory: info.memory, from: 'hub' }); }),
    mk2(1, '✿  Balcony garden', d.pressed.length ? 'flowers pressed ✓' : 'pick & press 3 flowers', !d.pressed.length,
      () => { sfx.click(); game.go('garden'); }),
    mk2(2, '♥  Pet Mochi', 'Mochi is waiting', true, () => petCat()),
    mk2(3, '✎  Junk journal', d.journalStarted ? 'keep going' : 'make something from it all', true,
      () => { sfx.page(); game.go('journal', d.journalStarted ? {} : { fresh: true }); }, true),
  ];
}

function drawHub(x) {
  x.save();
  x.fillStyle = 'rgba(28,18,10,.45)'; x.fillRect(0, 0, 1280, 800);
  x.fillStyle = 'rgba(251,246,234,.96)'; x.beginPath(); x.roundRect(250, 200, 780, 360, 18); x.fill();
  x.fillStyle = INK; x.textAlign = 'center';
  x.font = `600 30px ${F.serif}`; x.fillText(`${info.weekday} · what first?`, 640, 252);
  x.font = `22px ${F.hand}`; x.fillStyle = 'rgba(58,46,40,.75)';
  x.fillText(`today's bin: ${info.bin} (${info.binJa})`, 640, 282);
  x.restore();
  for (const b of hub) {
    b.draw(x, t);
    x.save();
    x.globalAlpha = b.enabled ? 0.75 : 0.4;
    x.fillStyle = b.primary ? '#fffdf5' : INK; x.font = `18px ${F.hand}`; x.textAlign = 'center';
    x.fillText(b.sub, b.x + b.w / 2, b.y + b.h - 14);
    x.restore();
  }
}

function vignette(x, i) {
  // little illustrations for the intro cards, drawn in a 260x260 box centred on (0,0)
  x.save();
  if (i === 0) {
    x.fillStyle = '#f6e6cf'; x.beginPath(); x.roundRect(-130, -130, 260, 260, 16); x.fill();
    x.fillStyle = '#e9dfcf'; x.fillRect(-90, -70, 180, 200);
    x.fillStyle = '#7d6a5a'; x.beginPath(); x.moveTo(-104, -70); x.lineTo(0, -112); x.lineTo(104, -70); x.closePath(); x.fill();
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      const wx = -70 + c * 52, wy = -46 + r * 70, lit = r === 0 && c === 1;
      x.fillStyle = lit ? '#fbe3a0' : '#b8c8d6'; x.fillRect(wx, wy, 36, 40);
      x.fillStyle = '#9aa0a6'; x.fillRect(wx - 4, wy + 40, 44, 5);
    }
    x.save(); x.translate(-16, -4); drawCat(x, { pose: 'loaf', t: 1, dir: 1, s: 0.22 }); x.restore();
    x.fillStyle = '#8a8378'; x.fillRect(-12, 96, 24, 34);
  } else if (i === 1) {
    x.fillStyle = '#efe6d4'; x.beginPath(); x.roundRect(-130, -130, 260, 260, 16); x.fill();
    [['#d9786a', '燃'], ['#7fa6c9', 'プラ'], ['#c9a24f', '紙']].forEach(([col, ja], k) => {
      const bx = -100 + k * 72;
      x.fillStyle = col; x.beginPath(); x.roundRect(bx, -20, 56, 100, 8); x.fill();
      x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(bx - 4, -30, 64, 14);
      x.fillStyle = '#fffdf5'; x.font = '600 20px sans-serif'; x.textAlign = 'center'; x.fillText(ja, bx + 28, 34);
    });
    x.fillStyle = '#fbf8f0'; x.fillRect(-80, -110, 160, 66);
    x.fillStyle = '#c0574b'; x.beginPath(); x.arc(0, -110, 5, 0, TAU); x.fill();
    x.fillStyle = INK; x.font = `22px ${F.hand}`; x.textAlign = 'center'; x.fillText('Mon · Wed · Fri', 0, -70);
  } else {
    x.fillStyle = '#efe6d4'; x.beginPath(); x.roundRect(-130, -130, 260, 260, 16); x.fill();
    x.fillStyle = '#7b8b7b'; x.fillRect(-70, -120, 140, 180);
    x.fillStyle = '#c9c2b4'; x.beginPath(); x.roundRect(46, -40, 10, 30, 4); x.fill();
    x.fillStyle = '#9a9a96'; x.fillRect(-130, 60, 260, 70);
    const g = x.createLinearGradient(-40, 0, 40, 0); g.addColorStop(0, '#b88a5c'); g.addColorStop(0.5, '#cfa572'); g.addColorStop(1, '#b0825a');
    x.fillStyle = g; x.beginPath(); x.moveTo(-40, 20); x.lineTo(40, 20); x.lineTo(44, 100); x.lineTo(-44, 100); x.closePath(); x.fill();
    x.fillStyle = '#fbf6e6'; x.save(); x.translate(0, 56); x.rotate(-0.06); x.fillRect(-28, -14, 56, 28);
    x.fillStyle = '#3b3550'; x.font = `14px ${F.hand}`; x.textAlign = 'center'; x.fillText('for 203 ♥', 0, 5); x.restore();
    x.fillStyle = '#9b2335'; x.beginPath(); x.arc(24, 18, 9, 0, TAU); x.fill();
  }
  x.restore();
}

function drawIntro(x) {
  x.fillStyle = '#2b211b'; x.fillRect(0, 0, 1280, 800);
  x.save();
  x.translate(640, 390);
  x.rotate(-0.01 * (introIdx % 2 ? -1 : 1));
  x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(-412, -212, 840, 440);
  x.fillStyle = '#fbf6e6'; x.fillRect(-420, -220, 840, 440);
  x.fillStyle = 'rgba(190,210,160,.8)'; x.fillRect(-50, -232, 100, 26);
  x.save(); x.translate(250, -10); x.rotate(0.03); vignette(x, introIdx); x.restore();
  x.fillStyle = '#3b3550'; x.font = `36px ${F.hand}`; x.textAlign = 'left';
  const words = INTRO[introIdx].split(' ');
  let line = '', y = -120;
  for (const w of words) {
    if (x.measureText(line + w).width > 420) { x.fillText(line, -370, y); line = ''; y += 50; }
    line += w + ' ';
  }
  x.fillText(line, -370, y);
  x.font = `600 16px ${F.serif}`; x.fillStyle = 'rgba(58,46,40,.6)';
  x.fillText(`${introIdx + 1} / ${INTRO.length}  ·  tap to continue`, -370, 190);
  x.restore();
  x.fillStyle = '#fdf7ea'; x.font = `600 28px ${F.serif}`; x.textAlign = 'center';
  x.fillText('Gomi & Mochi', 640, 110);
}
