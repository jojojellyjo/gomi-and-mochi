// Shared game state, scene switching and the save file (herbarium + day count).
export const game = {
  W: 1280,
  H: 800,
  scenes: {},
  scene: null,
  sceneName: '',
  cursor: 'default',
  day: null,
  go(name, arg) {
    this.scene = this.scenes[name];
    this.sceneName = name;
    if (this.scene.enter) this.scene.enter(arg);
  },
};

const KEY = 'pressed.save.v1';
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s === 'object') return { days: s.days || 0, found: s.found || {} };
  } catch (e) { /* storage unavailable or corrupt */ }
  return { days: 0, found: {} };
}
export const save = load();
function write() {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* ignore */ }
}

export function newDay() {
  game.day = {
    n: save.days + 1,
    picked: [],
    pressed: [],
    stats: { shoos: 0, squashed: 0, jolts: 0, scattered: 0, pets: 0, paws: 0, perfect: 0, visits: 0 },
  };
}

const RANK = { browned: 0, curled: 1, good: 2, perfect: 3 };
// Returns true if this flower is new to the herbarium.
export function recordFound(type, quality) {
  const prev = save.found[type];
  const isNew = prev === undefined;
  if (isNew || RANK[quality] > RANK[prev]) save.found[type] = quality;
  write();
  return isNew;
}

export function finishDay() {
  if (game.day && game.day.n > save.days) {
    save.days = game.day.n;
    write();
  }
}
