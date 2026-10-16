// Stepping into a polaroid: a faded room from the neighbour's past.
// Each keepsake you find brings the colour back; three and the photo is fully developed.
import { game, save, writeSave } from '../state.js';
import { Button, F, INK, toasts } from '../ui.js';
import { mk, rr, pick, TAU, grain, bake, wood, lerp } from '../textures.js';
import { drawFlower, makePressed } from '../flowers.js';
import { drawHand } from '../hands.js';
import { sfx } from '../sfx.js';

/* ---------- keepsake sprites (go into the journal) ---------- */

function card(w, h, bg, draw) {
  const c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  draw(x, w, h);
  return bake(grain(c, 12));
}
const OLD_INK = '#4a3a50';
const SOUVENIRS = {
  recipe: () => card(200, 140, '#f6efd8', (x, w) => {
    x.strokeStyle = 'rgba(200,90,90,.4)'; x.beginPath(); x.moveTo(0, 34); x.lineTo(w, 34); x.stroke();
    x.strokeStyle = 'rgba(90,120,165,.25)'; for (let y = 56; y < 140; y += 20) { x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); }
    x.fillStyle = OLD_INK; x.font = `24px ${F.hand}`; x.fillText('Matcha castella', 12, 26);
    x.font = `19px ${F.hand}`; ['4 eggs, 120g sugar', '2 tbsp matcha', 'bake low & slow', '— for Yumi ♥'].forEach((l, i) => x.fillText(l, 12, 52 + i * 20));
  }),
  oldTicket: () => card(230, 90, '#e9d9b0', (x, w, h) => {
    x.strokeStyle = 'rgba(80,50,30,.5)'; x.strokeRect(8, 8, w - 16, h - 16);
    x.fillStyle = '#5a3a2a'; x.font = `18px ${F.type}`; x.fillText('KYOTO → NARA', 20, 38);
    x.font = `12px ${F.type}`; x.fillText('2ND CLASS · 1979', 20, 58); x.fillText('¥ 340', 20, 74);
    x.fillStyle = 'rgba(176,52,52,.6)'; x.beginPath(); x.arc(w - 44, h / 2, 22, 0, TAU); x.lineWidth = 2; x.strokeStyle = 'rgba(176,52,52,.6)'; x.stroke();
    x.font = `10px ${F.type}`; x.textAlign = 'center'; x.fillText('54.4.2', w - 44, h / 2 + 4);
  }),
  violet: () => makePressed('pansy', 'good'),
  rinkTicket: () => card(220, 96, '#f4c6d0', (x, w, h) => {
    x.strokeStyle = 'rgba(120,40,70,.5)'; x.setLineDash([3, 3]); x.strokeRect(8, 8, w - 16, h - 16); x.setLineDash([]);
    x.fillStyle = '#7a2a4a'; x.font = `600 22px ${F.serif}`; x.fillText('Starlight Rink', 18, 40);
    x.font = `12px ${F.type}`; x.fillText('SAT NIGHT SKATE · 1983', 18, 62); x.fillText('ADMIT ONE  ★', 18, 80);
  }),
  photoStrip: () => {
    const w = 70, h = 250, c = mk(w, h), x = c.getContext('2d');
    x.fillStyle = '#fbfaf5'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      const g = x.createLinearGradient(0, 8 + i * 58, 0, 58 + i * 58);
      g.addColorStop(0, '#b9a58a'); g.addColorStop(1, '#6e5a48');
      x.fillStyle = g; x.fillRect(7, 8 + i * 58, 56, 50);
      x.fillStyle = 'rgba(255,240,220,.55)';
      x.beginPath(); x.arc(24, 30 + i * 58, 9, 0, TAU); x.arc(46, 32 + i * 58, 9, 0, TAU); x.fill();
      x.fillRect(14, 40 + i * 58, 20, 18); x.fillRect(36, 42 + i * 58, 20, 16);
    }
    return bake(grain(c, 14));
  },
  ribbon: () => {
    const w = 150, h = 90, c = mk(w, h), x = c.getContext('2d');
    x.fillStyle = '#d9607a';
    x.beginPath(); x.moveTo(75, 40); x.bezierCurveTo(30, 0, 6, 30, 20, 50); x.bezierCurveTo(30, 66, 60, 50, 75, 44); x.fill();
    x.beginPath(); x.moveTo(75, 40); x.bezierCurveTo(120, 0, 144, 30, 130, 50); x.bezierCurveTo(120, 66, 90, 50, 75, 44); x.fill();
    x.beginPath(); x.moveTo(70, 44); x.lineTo(50, 88); x.lineTo(62, 84); x.lineTo(76, 48); x.fill();
    x.beginPath(); x.moveTo(80, 44); x.lineTo(104, 86); x.lineTo(92, 86); x.lineTo(74, 48); x.fill();
    x.fillStyle = '#b8405a'; x.beginPath(); x.ellipse(75, 42, 9, 11, 0, 0, TAU); x.fill();
    x.fillStyle = 'rgba(255,255,255,.3)'; x.beginPath(); x.ellipse(40, 30, 14, 5, -0.5, 0, TAU); x.fill();
    return bake(c);
  },
  scrapbook: () => card(190, 150, '#efe2c8', (x, w, h) => {
    x.fillStyle = '#c9a77c'; x.fillRect(0, 0, 14, h);
    x.fillStyle = '#e9c9cf'; x.save(); x.translate(80, 60); x.rotate(-0.1); x.fillRect(-40, -30, 80, 60); x.restore();
    x.save(); x.translate(140, 70); drawFlower(x, 'daisy', 18); x.restore();
    x.fillStyle = OLD_INK; x.font = `20px ${F.hand}`; x.fillText('to be continued…', 34, h - 18);
  }),
  seeds: () => card(130, 170, '#f3ead2', (x, w, h) => {
    x.fillStyle = '#e98fb6'; x.fillRect(10, 10, w - 20, 90);
    x.save(); x.translate(w / 2, 56); drawFlower(x, 'cosmos', 30); x.restore();
    x.fillStyle = OLD_INK; x.font = `600 16px ${F.serif}`; x.textAlign = 'center'; x.fillText('COSMOS', w / 2, 124);
    x.font = `17px ${F.hand}`; x.fillText('for upstairs ♥', w / 2, 150);
  }),
  glasses: () => {
    const w = 170, h = 70, c = mk(w, h), x = c.getContext('2d');
    x.strokeStyle = '#6a4a3a'; x.lineWidth = 4;
    x.beginPath(); x.ellipse(45, 38, 30, 24, 0, 0, TAU); x.stroke();
    x.beginPath(); x.ellipse(125, 38, 30, 24, 0, 0, TAU); x.stroke();
    x.beginPath(); x.moveTo(75, 34); x.quadraticCurveTo(85, 26, 95, 34); x.stroke();
    x.fillStyle = 'rgba(200,220,240,.3)'; x.beginPath(); x.ellipse(45, 38, 28, 22, 0, 0, TAU); x.ellipse(125, 38, 28, 22, 0, 0, TAU); x.fill();
    return bake(c);
  },
};

/* ---------- rooms ---------- */

function room(id) {
  const c = mk(1280, 800), x = c.getContext('2d');
  if (id === 'kitchen') {
    x.fillStyle = '#f2e3b8'; x.fillRect(0, 0, 1280, 520);
    x.strokeStyle = 'rgba(160,130,80,.25)';
    for (let y = 300; y < 520; y += 30) { x.beginPath(); x.moveTo(0, y); x.lineTo(1280, y); x.stroke(); }
    for (let xx = 0; xx < 1280; xx += 30) { x.beginPath(); x.moveTo(xx, 300); x.lineTo(xx, 520); x.stroke(); }
    // window
    x.fillStyle = '#cfe4ee'; x.fillRect(470, 70, 340, 210);
    x.fillStyle = '#e8f2f4'; x.fillRect(480, 80, 155, 190); x.fillRect(645, 80, 155, 190);
    x.fillStyle = 'rgba(255,250,220,.5)'; x.beginPath(); x.moveTo(480, 270); x.lineTo(640, 270); x.lineTo(760, 700); x.lineTo(420, 700); x.fill();
    x.fillStyle = '#e9a0a0'; x.fillRect(440, 60, 50, 240); x.fillRect(790, 60, 50, 240);
    x.drawImage(wood(1280, 280, '#a8784c'), 0, 520);
    // shelf + jars
    x.fillStyle = '#9a6b44'; x.fillRect(90, 230, 260, 14);
    ['#e9c46a', '#d9867d', '#8fb36a'].forEach((col, i) => { x.fillStyle = col; x.beginPath(); x.roundRect(110 + i * 80, 170, 50, 60, 8); x.fill(); x.fillStyle = '#efe6d6'; x.fillRect(110 + i * 80, 164, 50, 12); });
    // table with gingham cloth
    x.fillStyle = '#7d5a37'; x.fillRect(360, 600, 20, 160); x.fillRect(900, 600, 20, 160);
    x.fillStyle = '#fbf6ea'; x.fillRect(320, 520, 640, 90);
    x.fillStyle = 'rgba(200,90,90,.35)';
    for (let i = 320; i < 960; i += 24) x.fillRect(i, 520, 12, 90);
    for (let j = 520; j < 610; j += 24) x.fillRect(320, j, 640, 12);
    // vase
    x.fillStyle = '#a9c4d8'; x.beginPath(); x.moveTo(850, 520); x.lineTo(830, 440); x.lineTo(870, 440); x.lineTo(890, 520); x.fill();
    x.save(); x.translate(845, 420); drawFlower(x, 'pansy', 18); x.restore();
    x.save(); x.translate(872, 410); drawFlower(x, 'pansy', 15); x.restore();
    // hanging lamp + clock + calendar + kettle on a little stove
    x.strokeStyle = '#6a5a4a'; x.lineWidth = 2; x.beginPath(); x.moveTo(640, 0); x.lineTo(640, 330); x.stroke();
    x.fillStyle = '#e9c46a'; x.beginPath(); x.moveTo(600, 360); x.lineTo(680, 360); x.lineTo(660, 330); x.lineTo(620, 330); x.closePath(); x.fill();
    x.fillStyle = 'rgba(255,240,190,.25)'; x.beginPath(); x.moveTo(600, 360); x.lineTo(680, 360); x.lineTo(760, 520); x.lineTo(520, 520); x.fill();
    x.fillStyle = '#fbf8f0'; x.beginPath(); x.arc(1080, 120, 44, 0, TAU); x.fill();
    x.strokeStyle = '#7d5a37'; x.lineWidth = 5; x.stroke();
    x.strokeStyle = '#3a2e28'; x.lineWidth = 3; x.beginPath(); x.moveTo(1080, 120); x.lineTo(1080, 92); x.moveTo(1080, 120); x.lineTo(1100, 130); x.stroke();
    x.fillStyle = '#fbf8f0'; x.fillRect(1010, 200, 120, 140);
    x.fillStyle = '#c0574b'; x.fillRect(1010, 200, 120, 30);
    x.fillStyle = '#fffdf5'; x.font = `600 18px ${F.serif}`; x.textAlign = 'center'; x.fillText('1979', 1070, 222);
    x.fillStyle = 'rgba(58,46,40,.5)'; for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) x.fillRect(1020 + c * 18, 244 + r * 22, 10, 8);
    x.fillStyle = '#d9d2c2'; x.fillRect(1000, 420, 220, 100);
    x.fillStyle = '#3a3a40'; x.beginPath(); x.ellipse(1060, 420, 36, 8, 0, 0, TAU); x.fill();
    x.fillStyle = '#c0574b'; x.beginPath(); x.moveTo(1030, 418); x.quadraticCurveTo(1030, 370, 1060, 368); x.quadraticCurveTo(1090, 370, 1090, 418); x.fill();
    x.strokeStyle = '#c0574b'; x.lineWidth = 6; x.beginPath(); x.moveTo(1088, 395); x.lineTo(1112, 380); x.stroke();
    x.strokeStyle = '#3a2e28'; x.lineWidth = 3; x.beginPath(); x.arc(1060, 368, 18, Math.PI, 0); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 3;
    for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(1116 + k * 6, 372 - k * 4); x.quadraticCurveTo(1126 + k * 6, 350, 1116 + k * 6, 330 - k * 6); x.stroke(); }
    // open book on table
    x.fillStyle = '#efe6d6'; x.beginPath(); x.moveTo(470, 520); x.lineTo(600, 505); x.lineTo(600, 528); x.lineTo(470, 538); x.fill();
    x.beginPath(); x.moveTo(600, 505); x.lineTo(730, 520); x.lineTo(730, 538); x.lineTo(600, 528); x.fill();
  } else if (id === 'rink') {
    const g = x.createLinearGradient(0, 0, 0, 520);
    g.addColorStop(0, '#3a2f5a'); g.addColorStop(1, '#6a4a7a');
    x.fillStyle = g; x.fillRect(0, 0, 1280, 520);
    for (let i = 0; i < 26; i++) {
      const lx = 40 + i * 48, ly = 120 + Math.sin(i * 0.6) * 20;
      x.fillStyle = ['#f6d27a', '#f4a9b8', '#a9d8c8', '#c9b8f2'][i % 4];
      x.beginPath(); x.arc(lx, ly, 7, 0, TAU); x.fill();
      x.fillStyle = 'rgba(255,240,200,.15)'; x.beginPath(); x.arc(lx, ly, 18, 0, TAU); x.fill();
    }
    x.strokeStyle = 'rgba(255,255,255,.4)'; x.beginPath(); x.moveTo(0, 120); for (let i = 0; i < 26; i++) x.lineTo(40 + i * 48, 120 + Math.sin(i * 0.6) * 20); x.stroke();
    x.fillStyle = '#d8d8e0'; x.beginPath(); x.arc(640, 60, 34, 0, TAU); x.fill();
    x.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 20; i++) x.fillRect(612 + (i % 5) * 12, 34 + Math.floor(i / 5) * 12, 8, 8);
    // lockers
    ['#e98fb6', '#7fa6c9', '#f6d27a', '#8fb36a'].forEach((col, i) => {
      x.fillStyle = col; x.fillRect(900 + i * 86, 230, 80, 290);
      x.fillStyle = 'rgba(0,0,0,.15)'; for (let k = 0; k < 4; k++) x.fillRect(916 + i * 86, 260 + k * 10, 48, 4);
      x.fillStyle = '#efe6d6'; x.beginPath(); x.arc(966 + i * 86, 380, 5, 0, TAU); x.fill();
    });
    // rink floor
    const f = wood(1280, 280, '#c99a64');
    x.drawImage(f, 0, 520);
    x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 4; x.beginPath(); x.ellipse(500, 700, 460, 120, 0, Math.PI, TAU); x.stroke();
    // neon sign, light spots on the floor, rental skate shelf
    x.save();
    x.font = `italic 600 64px ${F.serif}`; x.textAlign = 'center';
    x.shadowColor = '#f4a9d8'; x.shadowBlur = 24; x.fillStyle = '#ffd6ec'; x.fillText('Starlight', 420, 300);
    x.shadowColor = '#a9e0ff'; x.font = `600 26px ${F.serif}`; x.fillStyle = '#d9f2ff'; x.fillText('ROLLER  RINK', 420, 340);
    x.restore();
    for (let i = 0; i < 14; i++) {
      x.fillStyle = ['rgba(246,210,122,.22)', 'rgba(244,169,184,.22)', 'rgba(169,216,200,.22)', 'rgba(201,184,242,.22)'][i % 4];
      x.beginPath(); x.ellipse(80 + i * 85, 600 + (i % 3) * 50, 40, 12, 0, 0, TAU); x.fill();
    }
    x.fillStyle = '#5a4a6a'; x.fillRect(640, 380, 220, 140);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
      x.fillStyle = ['#f4a9b8', '#a9d8c8', '#f6d27a', '#c9b8f2'][(r + c) % 4];
      const sx = 656 + c * 50, sy = 400 + r * 60;
      x.beginPath(); x.moveTo(sx, sy + 40); x.lineTo(sx, sy); x.lineTo(sx + 18, sy); x.lineTo(sx + 20, sy + 26); x.lineTo(sx + 36, sy + 30); x.lineTo(sx + 36, sy + 40); x.fill();
      x.fillStyle = '#eee'; x.beginPath(); x.arc(sx + 8, sy + 44, 4, 0, TAU); x.arc(sx + 28, sy + 44, 4, 0, TAU); x.fill();
    }
    // bench
    x.fillStyle = '#7d5a37'; x.fillRect(80, 560, 360, 26); x.fillRect(100, 586, 16, 70); x.fillRect(400, 586, 16, 70);
    // skates on bench
    x.fillStyle = '#f4a9b8'; x.beginPath(); x.moveTo(140, 560); x.lineTo(140, 520); x.lineTo(170, 520); x.lineTo(172, 545); x.lineTo(205, 550); x.lineTo(205, 560); x.fill();
  } else {
    const g = x.createLinearGradient(0, 0, 0, 500);
    g.addColorStop(0, '#f6e6cf'); g.addColorStop(1, '#e9f0da');
    x.fillStyle = g; x.fillRect(0, 0, 1280, 500);
    // rooftops
    x.fillStyle = '#c9b8a8';
    for (let i = 0; i < 12; i++) { const rx = i * 120 - 20, rh = 60 + (i * 37) % 60; x.fillRect(rx, 380 - rh, 100, rh + 40); x.fillStyle = '#7a8a9a'; x.beginPath(); x.moveTo(rx - 10, 380 - rh); x.lineTo(rx + 50, 350 - rh); x.lineTo(rx + 110, 380 - rh); x.fill(); x.fillStyle = '#c9b8a8'; }
    // sliding door edge
    x.fillStyle = '#efe6d4'; x.fillRect(0, 0, 160, 800);
    x.strokeStyle = 'rgba(0,0,0,.15)'; x.lineWidth = 3; x.strokeRect(20, 40, 120, 560);
    // balcony floor
    x.fillStyle = '#b8b2a6'; x.fillRect(0, 560, 1280, 240);
    x.strokeStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 1280; i += 80) { x.beginPath(); x.moveTo(i, 560); x.lineTo(i, 800); x.stroke(); }
    // railing
    x.fillStyle = '#8a8f96'; x.fillRect(160, 400, 1120, 10); x.fillRect(160, 550, 1120, 10);
    for (let i = 180; i < 1280; i += 26) x.fillRect(i, 400, 5, 160);
    // planters
    for (const px of [300, 620]) {
      x.fillStyle = '#9a6b44'; x.fillRect(px, 500, 260, 70);
      for (let k = 0; k < 4; k++) {
        x.strokeStyle = '#7d9a62'; x.lineWidth = 3; x.beginPath(); x.moveTo(px + 40 + k * 60, 500); x.lineTo(px + 40 + k * 60, 430 - k * 6); x.stroke();
        x.save(); x.translate(px + 40 + k * 60, 424 - k * 6); drawFlower(x, ['cosmos', 'daisy', 'pansy', 'nasturtium'][k], 16); x.restore();
      }
    }
    // furin wind chime, watering can, potted mint
    x.strokeStyle = '#6a5a4a'; x.lineWidth = 2; x.beginPath(); x.moveTo(900, 0); x.lineTo(900, 150); x.stroke();
    x.fillStyle = 'rgba(200,230,250,.85)'; x.beginPath(); x.arc(900, 170, 24, Math.PI, 0); x.lineTo(924, 178); x.lineTo(876, 178); x.fill();
    x.fillStyle = '#d9607a'; x.beginPath(); x.arc(892, 162, 4, 0, TAU); x.arc(906, 158, 3, 0, TAU); x.fill();
    x.beginPath(); x.moveTo(900, 178); x.lineTo(900, 200); x.stroke();
    x.fillStyle = '#fbf6e6'; x.fillRect(888, 200, 24, 56);
    x.fillStyle = '#c0574b'; x.font = '14px sans-serif'; x.textAlign = 'center'; x.fillText('風', 900, 226);
    x.fillStyle = '#8fb3c9'; x.beginPath(); x.roundRect(210, 640, 90, 64, 10); x.fill();
    x.strokeStyle = '#8fb3c9'; x.lineWidth = 8; x.beginPath(); x.moveTo(296, 660); x.lineTo(350, 620); x.stroke();
    x.beginPath(); x.arc(255, 640, 26, Math.PI * 1.1, Math.PI * 1.9); x.stroke();
    x.fillStyle = '#c4703f'; x.fillRect(820, 660, 70, 54);
    for (let k = 0; k < 7; k++) { x.fillStyle = k % 2 ? '#6fae63' : '#8cc77d'; x.beginPath(); x.ellipse(830 + k * 8, 650 - (k % 3) * 8, 10, 16, (k - 3) * 0.3, 0, TAU); x.fill(); }
    // little stool
    x.fillStyle = '#c9a77c'; x.fillRect(940, 600, 200, 20); x.fillRect(960, 620, 14, 80); x.fillRect(1106, 620, 14, 80);
    x.fillStyle = '#d9cbb0'; x.beginPath(); x.ellipse(1040, 600, 30, 8, 0, 0, TAU); x.fill();
  }
  return grain(c, 10);
}

const MEMORIES = {
  kitchen: {
    caption: 'the kitchen, spring 1979',
    items: [
      { id: 'recipe', label: 'recipe card', x: 230, y: 330, w: 110, h: 80, lore: '"Mother\'s matcha castella. I never once got it right."', draw: (x) => { x.fillStyle = '#f6efd8'; x.fillRect(-50, -34, 100, 68); x.fillStyle = OLD_INK; x.font = `18px ${F.hand}`; x.fillText('castella', -36, -6); x.fillStyle = '#c0574b'; x.beginPath(); x.arc(0, -34, 5, 0, TAU); x.fill(); } },
      { id: 'oldTicket', label: 'train ticket', x: 400, y: 540, w: 110, h: 50, lore: '"Our first trip alone, my sister and I. We kept everything."', draw: (x) => { x.save(); x.rotate(0.1); x.fillStyle = '#e9d9b0'; x.fillRect(-48, -18, 96, 36); x.restore(); } },
      { id: 'violet', label: 'pressed violet', x: 600, y: 518, w: 120, h: 40, lore: '"We pressed violets in Father\'s dictionary every spring."', draw: (x) => { x.save(); x.scale(1, 0.4); drawFlower(x, 'pansy', 20); x.restore(); } },
    ],
  },
  rink: {
    caption: 'Starlight Rink, 1983',
    items: [
      { id: 'rinkTicket', label: 'rink ticket', x: 300, y: 552, w: 100, h: 40, lore: '"He fell over three times trying to impress me."', draw: (x) => { x.save(); x.rotate(-0.12); x.fillStyle = '#f4c6d0'; x.fillRect(-46, -14, 92, 28); x.restore(); } },
      { id: 'photoStrip', label: 'photo strip', x: 1052, y: 300, w: 40, h: 120, lore: '"Four photos. In every one, we\'re laughing."', draw: (x) => { x.fillStyle = '#fbfaf5'; x.fillRect(-16, -56, 32, 112); x.fillStyle = '#9a8670'; for (let i = 0; i < 4; i++) x.fillRect(-12, -52 + i * 27, 24, 22); } },
      { id: 'ribbon', label: 'hair ribbon', x: 700, y: 690, w: 90, h: 50, lore: '"I lost this ribbon on the rink. He skated back to find it."', draw: (x) => { x.fillStyle = '#d9607a'; x.beginPath(); x.ellipse(-14, 0, 16, 9, 0.3, 0, TAU); x.ellipse(14, 0, 16, 9, -0.3, 0, TAU); x.fill(); } },
    ],
  },
  balcony: {
    caption: 'my balcony, last spring',
    items: [
      { id: 'scrapbook', label: 'scrapbook', x: 1040, y: 584, w: 120, h: 40, lore: '"The last page is still empty. I can\'t see the little things any more."', draw: (x) => { x.fillStyle = '#c9a77c'; x.fillRect(-56, -14, 112, 26); x.fillStyle = '#efe2c8'; x.fillRect(-52, -18, 104, 22); } },
      { id: 'seeds', label: 'seed packet', x: 560, y: 600, w: 60, h: 70, lore: '"Cosmos seeds. I planted the ones upstairs too, before you moved in."', draw: (x) => { x.save(); x.rotate(0.2); x.fillStyle = '#e98fb6'; x.fillRect(-22, -30, 44, 60); x.restore(); } },
      { id: 'glasses', label: 'reading glasses', x: 1000, y: 560, w: 90, h: 36, lore: '"Even these don\'t help much now. So I give my treasures away."', draw: (x) => { x.strokeStyle = '#6a4a3a'; x.lineWidth = 3; x.beginPath(); x.ellipse(-18, 0, 14, 10, 0, 0, TAU); x.moveTo(32, 0); x.ellipse(18, 0, 14, 10, 0, 0, TAU); x.stroke(); } },
    ],
  },
};

/* ---------- scene ---------- */

let from = 'journal', t = 0, mem, id, R = null, low = null, found = [], dev = 0, devTarget = 0, lore = null, enterK = 0, hand = null, outBtn, flying = [];

export function memoryPolaroid(memId) {
  const src = room(memId);
  const w = 200, h = 236, c = mk(w, h), x = c.getContext('2d');
  x.fillStyle = '#fbfaf6'; x.fillRect(0, 0, w, h);
  x.drawImage(src, 240, 0, 800, 800, 12, 12, 176, 176);
  x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgba(255,215,160,.35)'; x.fillRect(12, 12, 176, 176);
  x.globalCompositeOperation = 'source-over';
  x.fillStyle = '#3b3550'; x.font = `22px ${F.hand}`; x.textAlign = 'center';
  x.fillText(MEMORIES[memId].caption, w / 2, h - 16);
  return bake(grain(c, 12));
}
export function souvenirSprites(memId) {
  return MEMORIES[memId].items.map((it) => ({ label: it.label, sprite: SOUVENIRS[it.id]() }));
}

export const memory = {
  enter(arg) {
    id = arg.memory; mem = MEMORIES[id]; from = arg.from || 'journal';
    t = 0; found = []; dev = 0; devTarget = 0; lore = null; enterK = 0; hand = null; flying = [];
    R = room(id);
    low = mk(160, 100); low.getContext('2d').drawImage(R, 0, 0, 160, 100);
    outBtn = new Button({ x: 1010, y: 26, w: 240, h: 56, label: 'Step out ↩', primary: true, visible: false, onClick: () => {
      sfx.paper();
      game.day.memoryDone = true;
      if (!save.memories.includes(id)) { save.memories.push(id); writeSave(); }
      if (from === 'hub') game.go('morning', { back: true }); else game.go('journal', { memoryDone: id });
    } });
    toasts.clear();
    toasts.add('Find three keepsakes hidden in the memory', 3);
    sfx.paper();
    setTimeout(() => sfx.chime(), 350);
  },
  update(dt) {
    t += dt;
    enterK = Math.min(1, enterK + dt * 1.4);
    dev = lerp(dev, devTarget, 1 - Math.pow(0.05, dt));
    if (hand) { hand.t += dt; if (hand.t > 0.7) hand = null; }
    for (const f of flying) f.k = Math.min(1, f.k + dt * 1.8);
    flying = flying.filter((f) => f.k < 1);
    if (lore) lore.t += dt;
    toasts.update(dt);
  },
  draw(x) {
    x.fillStyle = '#2b211b'; x.fillRect(0, 0, 1280, 800);
    const e = 1 - Math.pow(1 - enterK, 3);
    const s = lerp(0.25, 1, e);
    x.save();
    x.translate(640, 400); x.scale(s, s); x.rotate((1 - e) * -0.08); x.translate(-640, -400);
    // polaroid frame grows out to fill the screen
    x.fillStyle = '#fbfaf6'; x.fillRect(-30, -30, 1340, 900);
    x.drawImage(R, 0, 0);
    // items
    for (const it of mem.items) {
      if (found.includes(it.id)) continue;
      x.save(); x.translate(it.x, it.y); it.draw(x); x.restore();
    }
    // faded-photo layers: blur, desaturate, warm
    const fade = 1 - dev;
    if (fade > 0.01) {
      x.save();
      x.globalAlpha = 0.85 * fade; x.imageSmoothingEnabled = true;
      x.drawImage(low, 0, 0, 1280, 800);
      x.globalAlpha = fade; x.globalCompositeOperation = 'saturation'; x.fillStyle = '#888'; x.fillRect(0, 0, 1280, 800);
      x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.6 * fade + 0.2; x.fillStyle = '#f2d7b0'; x.fillRect(0, 0, 1280, 800);
      x.restore();
    } else {
      x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.2; x.fillStyle = '#f2d7b0'; x.fillRect(0, 0, 1280, 800); x.restore();
    }
    const v = x.createRadialGradient(640, 400, 300, 640, 400, 820);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(40,20,5,${0.35 + 0.25 * fade})`);
    x.fillStyle = v; x.fillRect(0, 0, 1280, 800);
    // glints on keepsakes still to find
    for (const it of mem.items) {
      if (found.includes(it.id)) continue;
      const k = (Math.sin(t * 2.5 + it.x) + 1) / 2;
      x.save();
      const gl = x.createRadialGradient(it.x, it.y, 0, it.x, it.y, Math.max(it.w, it.h) * 0.9);
      gl.addColorStop(0, `rgba(255,245,200,${0.25 + 0.25 * k})`); gl.addColorStop(1, 'rgba(255,245,200,0)');
      x.fillStyle = gl; x.fillRect(it.x - it.w * 1.2, it.y - it.h * 1.6, it.w * 2.4, it.h * 3.2);
      x.globalAlpha = 0.5 + 0.5 * k; x.fillStyle = '#fffbe6';
      x.translate(it.x + it.w / 2 - 4, it.y - it.h / 2 - 4); x.rotate(t * 0.8);
      x.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU, r = i % 2 ? 4 : 16; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.fill();
      x.restore();
    }
    x.restore();

    if (hand) {
      const k = Math.sin(Math.min(1, hand.t / 0.7) * Math.PI);
      x.save(); x.translate(hand.x + 220 - k * 220, hand.y + 240 - k * 240); drawHand(x, { pose: 'pinch', s: 1.15 }); x.restore();
    }

    if (enterK >= 1) {
      // caption + found strip
      x.save();
      x.fillStyle = 'rgba(251,250,246,.92)'; x.beginPath(); x.roundRect(30, 22, 520, 70, 12); x.fill();
      x.fillStyle = INK; x.font = `34px ${F.hand}`; x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.fillText(mem.caption, 50, 66);
      x.restore();
      mem.items.forEach((it, i) => {
        const has = found.includes(it.id);
        x.save(); x.translate(470 + i * 120, 740);
        x.fillStyle = has ? 'rgba(251,250,246,.95)' : 'rgba(251,250,246,.35)';
        x.beginPath(); x.roundRect(-52, -36, 104, 72, 10); x.fill();
        x.fillStyle = has ? INK : 'rgba(58,46,40,.5)'; x.font = `20px ${F.hand}`; x.textAlign = 'center';
        x.fillText(has ? it.label : '?', 0, 8);
        x.restore();
      });
    }
    for (const f of flying) {
      const k = 1 - Math.pow(1 - f.k, 3);
      x.save(); x.translate(lerp(f.x, f.tx, k), lerp(f.y, f.ty, k) - Math.sin(f.k * Math.PI) * 80); x.scale(1 - 0.4 * k, 1 - 0.4 * k); f.it.draw(x); x.restore();
    }
    if (lore && lore.t < 5) {
      const a = Math.min(1, lore.t * 4, (5 - lore.t) * 2);
      x.save(); x.globalAlpha = a;
      x.translate(640, 640); x.rotate(-0.015);
      x.font = `32px ${F.hand}`;
      const w = Math.min(1100, x.measureText(lore.text).width + 60);
      x.fillStyle = 'rgba(30,15,5,.3)'; x.fillRect(-w / 2 + 4, -30, w, 60);
      x.fillStyle = '#fbf6e6'; x.fillRect(-w / 2, -34, w, 60);
      x.fillStyle = '#3b3550'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(lore.text, 0, -4);
      x.restore();
    }
    outBtn.draw(x, t);
    toasts.draw(x, 1280);
  },
  pointerdown(p) {
    if (outBtn.hit(p)) return outBtn.onClick();
    if (enterK < 1) return;
    for (const it of mem.items) {
      if (found.includes(it.id)) continue;
      if (Math.abs(p.x - it.x) < it.w / 2 + 16 && Math.abs(p.y - it.y) < it.h / 2 + 16) {
        found.push(it.id);
        devTarget = found.length / mem.items.length;
        hand = { x: it.x, y: it.y, t: 0 };
        flying.push({ it, x: it.x, y: it.y, tx: 470 + (found.length - 1) * 120, ty: 740, k: 0 });
        lore = { text: it.lore, t: 0 };
        sfx.pluck();
        if (found.length === mem.items.length) {
          outBtn.visible = true; outBtn.pulse = true;
          setTimeout(() => { if (game.sceneName === 'memory') { toasts.add('The memory is fully developed ✿', 3); sfx.chime(); } }, 900);
        }
        return;
      }
    }
  },
  pointermove(p) {
    outBtn.hover = outBtn.hit(p);
    const over = mem.items.some((it) => !found.includes(it.id) && Math.abs(p.x - it.x) < it.w / 2 + 16 && Math.abs(p.y - it.y) < it.h / 2 + 16);
    game.cursor = outBtn.hover || over ? 'pointer' : 'default';
  },
  keydown(e) { if (e.key === 'Enter' && outBtn.visible) outBtn.onClick(); },
};
