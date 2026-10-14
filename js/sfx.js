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

export const sfx = {
  unlock() { audio(); },
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
  shutter() { noise(0.05, { vol: 0.25, freq: 4000 }); noise(0.07, { vol: 0.2, freq: 2500, delay: 0.09 }); },
};
