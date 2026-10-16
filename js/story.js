// Hana's three days. Day 4+ is free play.
export const HANA = 'Hana';
export const NEIGHBOUR = 'Mrs. Sato';

export const INTRO = [
  'After Obaachan passed away, Hana moved to a quiet town in Japan. She brought one suitcase, her cat Mochi, and a box of things she couldn\'t throw away.',
  'Here, rubbish waits for its day: burnables (food scraps, tissues, paper bits) on Monday, plastics on Wednesday, paper on Friday. Until then, it stays with you.',
  'Obaachan always said some things are too pretty to throw away. Then, one morning, a paper bag appeared outside Hana\'s door…',
];

export const DAYS = [
  {
    weekday: 'Monday', bin: 'burnables', binJa: '燃えるごみ', binCol: '#d9786a',
    note: ['Too pretty to throw away.', 'Maybe you can use them?', '— a neighbour'],
    memory: 'kitchen',
    thoughts: {
      wake: 'Burnables day. I still haven\'t unpacked Obaachan\'s box.',
      note: 'Someone else keeps the pretty things too…',
      bag: 'A train ticket, a recipe, a polaroid. Obaachan would have loved this.',
      garden: 'Pick them in the morning, before the sun gets warm. Her trick.',
      journal: 'Okay. Make something out of it. That\'s what she\'d say.',
    },
  },
  {
    weekday: 'Wednesday', bin: 'plastics', binJa: 'プラスチック', binCol: '#7fa6c9',
    note: ['I saw your balcony flowers.', 'Here is more, from a happy place.', '— a neighbour'],
    memory: 'rink',
    thoughts: {
      wake: 'Plastics day. Even a bottle can be something, if you cut it right.',
      note: 'They noticed my flowers. Nobody notices things here.',
      bag: 'A roller rink ticket… and a bottle to cut up. Who are you?',
      garden: 'The cosmos came up. I didn\'t think anything would grow for me.',
      journal: 'Cut a little shape out of the bottle. Like the charms we used to make.',
    },
  },
  {
    weekday: 'Friday', bin: 'paper', binJa: '古紙', binCol: '#c9a24f',
    note: ['My eyes are tired these days.', 'Please finish what I started.', '— downstairs, 1F'],
    memory: 'balcony',
    thoughts: {
      wake: 'Paper day. I can\'t keep everything forever… can I?',
      note: 'Downstairs. She\'s been right below me all this time.',
      bag: 'Her scrapbook. She wants me to finish it.',
      garden: 'She planted these seeds before I came. They were waiting for me.',
      journal: 'A thank-you. For the junk. For the company.',
    },
  },
];

export const FREE_NOTES = [
  ['A few more bits I found.', 'See you on Friday?', '— S.'],
  ['The tea shop gave me extra receipts.', 'Ha!', '— S.'],
  ['Mochi visited me today.', 'Sending treasures back up.', '— S.'],
];

export function dayInfo(n) {
  if (n <= DAYS.length) return { ...DAYS[n - 1], story: true };
  const week = ['Monday', 'Wednesday', 'Friday'];
  const b = DAYS[(n - 1) % 3];
  return {
    weekday: week[(n - 1) % 3], bin: b.bin, binJa: b.binJa, binCol: b.binCol,
    note: FREE_NOTES[(n - 4) % FREE_NOTES.length], memory: null, story: false,
    thoughts: { wake: 'Another rubbish day. I don\'t mind them so much now.', note: 'Mrs. Sato\'s handwriting. I\'d know it anywhere.', bag: 'More treasures.', garden: 'Good morning, flowers.', journal: 'Tea with Mrs. Sato later. Let\'s make something nice.' },
  };
}

export const ENDING = [
  'On Friday evening, Hana slipped the sealed letter under the door downstairs.',
  'A little later, a knock. Mrs. Sato, holding a flower press just like Obaachan\'s. "Would you like some tea?"',
  'Hana put the rest of the paper out for collection. Some things are too pretty to throw away. The rest, she could finally let go.',
];
