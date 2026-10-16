// Tiny synthesised sound effects, no audio files needed.
let ac = null;
let muted = false;
try { muted = localStorage.getItem('pressed.muted') === '1'; } catch (e) { /* storage unavailable */ }

function audio() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
export function isMuted() { return muted; }
export function setMuted(m) {
  muted = m;
  try { localStorage.setItem('pressed.muted', m ? '1' : '0'); } catch (e) { /* ignore */ }
}

function env(a, g, t, vol, dur) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}
function tone(freq, dur, { type = 'sine', vol = 0.2, to = null, delay = 0 } = {}) {
  if (muted) return;
  const a = audio(); if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  env(a, g, t, vol, dur);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, { vol = 0.2, freq = 2000, type = 'bandpass', q = 1, delay = 0 } = {}) {
  if (muted) return;
  const a = audio(); if (!a) return;
  const t = a.currentTime + delay;
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource(); src.buffer = buf;
  const f = a.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = a.createGain();
  env(a, g, t, vol, dur);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
}

// A quiet generative music-box loop: soft pentatonic notes with slow fades.
let ambient = null;
function ambientNote(freq, when, dur, vol) {
  const a = audio(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = freq;
  f.type = 'lowpass'; f.frequency.value = 1400;
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(vol, when + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  o.connect(f).connect(g).connect(a.destination);
  o.start(when); o.stop(when + dur + 0.1);
}
function startAmbient() {
  if (ambient) return;
  const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
  const chords = [[0, 2, 4], [1, 3, 5], [4, 5, 7], [0, 3, 5]];
  let bar = 0;
  ambient = setInterval(() => {
    if (muted || document.hidden) return;
    const a = audio(); if (!a) return;
    const now = a.currentTime + 0.05;
    const ch = chords[bar % chords.length];
    ambientNote(scale[ch[0]] / 2, now, 3.6, 0.018);
    for (let i = 0; i < 4; i++) {
      if (Math.random() < 0.7) {
        const n = scale[ch[Math.floor(Math.random() * 3)] + (Math.random() < 0.4 ? 1 : 0)] || scale[ch[0]];
        ambientNote(n, now + i * 0.75 + Math.random() * 0.1, 1.8, 0.014);
      }
    }
    bar++;
  }, 3000);
}

export const sfx = {
  unlock() { audio(); startAmbient(); },
  pluck() { tone(660, 0.14, { type: 'triangle', vol: 0.14, to: 990 }); noise(0.05, { vol: 0.08, freq: 3000 }); },
  pop() { tone(380, 0.08, { vol: 0.16, to: 600 }); },
  rip() { noise(0.22, { vol: 0.22, freq: 2600, type: 'highpass' }); noise(0.12, { vol: 0.1, freq: 5000, delay: 0.08 }); },
  thunk() { tone(140, 0.16, { vol: 0.35, to: 60 }); noise(0.06, { vol: 0.15, freq: 700, type: 'lowpass' }); },
  creak() { tone(95, 0.5, { type: 'sawtooth', vol: 0.04, to: 70 }); },
  click() { tone(900, 0.04, { type: 'square', vol: 0.05 }); },
  meow() {
    if (muted) return;
    const a = audio(); if (!a) return;
    const t = a.currentTime;
    const o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
    o.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 1800;
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(820, t + 0.12);
    o.frequency.exponentialRampToValueAtTime(430, t + 0.42);
    env(a, g, t, 0.07, 0.45);
    o.connect(f).connect(g).connect(a.destination);
    o.start(t); o.stop(t + 0.5);
  },
  purr() { for (let i = 0; i < 6; i++) noise(0.09, { vol: 0.07, freq: 120, type: 'lowpass', delay: i * 0.12 }); },
  chime() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.6, { vol: 0.09, delay: i * 0.08 })); },
  good() { [659, 880].forEach((f, i) => tone(f, 0.35, { vol: 0.1, delay: i * 0.07 })); },
  bad() { tone(300, 0.3, { type: 'triangle', vol: 0.1, to: 200 }); },
  // soft paper rustle: a few filtered noise bursts
  paper() { for (let i = 0; i < 4; i++) noise(0.12, { vol: 0.12, freq: 2200 + i * 500, type: 'bandpass', q: 0.7, delay: i * 0.07 }); noise(0.35, { vol: 0.05, freq: 900, type: 'lowpass', delay: 0.05 }); },
  page() { noise(0.16, { vol: 0.09, freq: 3200, type: 'bandpass', q: 0.6 }); },
  snip() { noise(0.035, { vol: 0.16, freq: 5200, type: 'highpass' }); tone(1800, 0.03, { type: 'square', vol: 0.02 }); },
  scribble() { for (let i = 0; i < 6; i++) noise(0.05, { vol: 0.07, freq: 2600 + (i % 3) * 700, type: 'bandpass', q: 2, delay: i * 0.06 }); },
  bag() { for (let i = 0; i < 6; i++) noise(0.1, { vol: 0.1, freq: 1500 + (i % 3) * 600, type: 'bandpass', q: 0.6, delay: i * 0.05 }); },
  knock() { [0, 0.18].forEach((d) => { tone(160, 0.08, { vol: 0.3, to: 90, delay: d }); noise(0.04, { vol: 0.12, freq: 500, type: 'lowpass', delay: d }); }); },
  chirp() { tone(2400, 0.08, { vol: 0.035, to: 3200 }); tone(2800, 0.06, { vol: 0.03, to: 3600, delay: 0.1 }); },
  pour() { noise(0.5, { vol: 0.05, freq: 400, type: 'lowpass' }); },
  shutter() { noise(0.05, { vol: 0.25, freq: 4000 }); noise(0.07, { vol: 0.2, freq: 2500, delay: 0.09 }); },
};
