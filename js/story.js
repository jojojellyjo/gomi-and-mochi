// Hana's three days. Day 4+ is free play.
export const HANA = 'Hana';
export const NEIGHBOUR = 'Mrs. Sato';

export const INTRO = [
  'Hana has just moved into a tiny apartment in a quiet Japanese town, with her cat, Mochi.',
  'Here, rubbish waits for its day. Burnables on Monday, plastics on Wednesday, paper on Friday. Until then, it stays with you.',
  'So Hana started keeping the pretty bits. Then, one morning, a paper bag appeared outside her door…',
];

export const DAYS = [
  {
    weekday: 'Monday', bin: 'burnables', binJa: '燃えるごみ', binCol: '#d9786a',
    note: ['Too pretty to throw away.', 'Maybe you can use them?', '— a neighbour'],
    memory: 'kitchen',
  },
  {
    weekday: 'Wednesday', bin: 'plastics', binJa: 'プラスチック', binCol: '#7fa6c9',
    note: ['I saw your balcony flowers.', 'Here is more, from a happy place.', '— a neighbour'],
    memory: 'rink',
  },
  {
    weekday: 'Friday', bin: 'paper', binJa: '古紙', binCol: '#c9a24f',
    note: ['My eyes are tired these days.', 'Please finish what I started.', '— downstairs, 1F'],
    memory: 'balcony',
  },
];

export const FREE_NOTES = [
  ['A few more bits I found.', 'Have fun!', '— S.'],
  ['The tea shop gave me extra receipts.', 'Ha!', '— S.'],
  ['Mochi visited me today.', 'Sending treasures back up.', '— S.'],
];

export function dayInfo(n) {
  if (n <= DAYS.length) return { ...DAYS[n - 1], story: true };
  const week = ['Monday', 'Wednesday', 'Friday'];
  const bins = [DAYS[0], DAYS[1], DAYS[2]];
  const b = bins[(n - 1) % 3];
  return { weekday: week[(n - 1) % 3], bin: b.bin, binJa: b.binJa, binCol: b.binCol, note: FREE_NOTES[(n - 4) % FREE_NOTES.length], memory: null, story: false };
}

export const ENDING = [
  'That evening, Hana slipped the sealed letter under the door downstairs.',
  'The next morning, there was no paper bag. Just a knock, and a small voice: "Would you like some tea?"',
  'Now they journal together on Fridays, while Mochi sleeps on the scraps.',
];
