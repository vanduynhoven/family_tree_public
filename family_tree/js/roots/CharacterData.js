// ═══════════════════════════════════════════════════════════
//  CharacterData — all 9 playable characters
//  Each has: id, name, sprite config, startEra, intro panels,
//  questIds, and a character-specific ending line
// ═══════════════════════════════════════════════════════════

export const CHARACTERS = [
  // ── Generic Traveller ─────────────────────────────────
  {
    id:       'traveller',
    name:     'Time Traveller',
    emoji:    '🌍',
    branch:   '—',
    hook:     "You don't know this family — yet.",
    startEra: 0,
    questIds: [],
    sprite:   { hairColor:'#806040', bodyColor:'#503040', skinColor:'#d0a070' },
    ending:   "You close the journal and place it back on the shelf. Outside, the world looks different now.",
    intro: [
      { bg:'library',   pose:'idle',     caption:'A quiet afternoon. Nothing in particular to do.' },
      { bg:'library',   pose:'idle',     caption:'You weren\'t looking for anything. That\'s when you find things.' },
      { bg:'closeup',   pose:'pointing', caption:'"Van Duynhoven — Family History." A name you don\'t recognise.' },
      { bg:'reading',   pose:'reading',  caption:'You begin to read. The words pull you in deeper than you expected…' },
      { bg:'sleep',     pose:'sleeping', caption:'And just like that — you are somewhere else. Somewhen else.' },
    ],
  },

  // ── Raven ─────────────────────────────────────────────
  {
    id:       'raven',
    name:     'Raven Van Duynhoven',
    emoji:    '🐦',
    branch:   "Arthur's children · Haarlem, NL",
    hook:     "You've heard Oma speak Dutch. Now live it.",
    startEra: 8,
    startLocation: 'haarlem',
    questIds: ['learning_dutch'],
    sprite:   { hairColor:'#c02020', bodyColor:'#308060', skinColor:'#d0b080' },
    ending:   "You close the journal. Oma's secret message glows on the last page. You finally understand every word.",
    intro: [
      { bg:'haarlem_bedroom', pose:'idle',    caption:'Leidsevaart 276, Haarlem. Sunday morning, 2026. The canal outside catches the light.' },
      { bg:'haarlem_bedroom', pose:'idle',    caption:'Dad keeps saying we\'re Dutch. But what does that actually mean?' },
      { bg:'closeup',         pose:'reading', caption:'"Duinhoven. Dune garden." — That\'s us. Going back to 1539.' },
      { bg:'haarlem_bedroom', pose:'sleeping',caption:'The Dutch vocabulary list on your desk glows, one word at a time…' },
      { bg:'sleep',           pose:'sleeping',caption:'Droom maar. [Just dream.]' },
    ],
  },

  // ── Starling ──────────────────────────────────────────
  {
    id:       'starling',
    name:     'Starling Van Duynhoven',
    emoji:    '⭐',
    branch:   "Arthur's children · Haarlem, NL",
    hook:     "The youngest of the line — for now.",
    startEra: 8,
    startLocation: 'haarlem',
    questIds: ['youngest_voyager'],
    sprite:   { hairColor:'#d4c040', bodyColor:'#c06040', skinColor:'#d8b890' },
    ending:   "Your Time Capsule is full. Eight eras, eight treasures, and a message for future generations.",
    intro: [
      { bg:'haarlem_living', pose:'surprised', caption:'Leidsevaart 276, Haarlem. 2026. Everything is very tall when you\'re small.' },
      { bg:'haarlem_living', pose:'idle',      caption:'A small wooden box on the shelf. It rattles.' },
      { bg:'closeup',        pose:'reading',   caption:'Pictures of farms. Pictures of ships. People who look a little like you.' },
      { bg:'sleep',          pose:'sleeping',  caption:'You wonder where they all went. Then you go there too.' },
    ],
  },

  // ── Charlotte ─────────────────────────────────────────
  {
    id:       'charlotte',
    name:     'Charlotte Van Duynhoven',
    emoji:    '🏆',
    branch:   "Chuck & Daina · Minnesota, US",
    hook:     "Dad says we're Dutch. What does that even mean?",
    startEra: 8,
    startLocation: 'mankato',
    questIds: ['the_name'],
    sprite:   { hairColor:'#805020', bodyColor:'#4060c0', skinColor:'#c89060' },
    ending:   "The family motto appears on the screen. Five hundred years, one meaning. You finally know who you are.",
    intro: [
      { bg:'mn_bedroom', pose:'idle',    caption:'313 Hanover Street, Mankato, Minnesota. 2026. Dad\'s history stuff is everywhere.' },
      { bg:'mn_attic',   pose:'idle',    caption:'"Van Duijnhoven." Wait — that\'s our name. Sort of.' },
      { bg:'closeup',    pose:'reading', caption:'Three different spellings. Same family? How does a name just… change?' },
      { bg:'sleep',      pose:'sleeping',caption:'Guess you\'re going to find out.' },
    ],
  },

  // ── Tenley ────────────────────────────────────────────
  {
    id:       'tenley',
    name:     'Tenley Van Duynhoven',
    emoji:    '🌸',
    branch:   "Chuck & Daina · Minnesota, US",
    hook:     "Every family has a story. What's ours?",
    startEra: 8,
    startLocation: 'mankato',
    questIds: ['womens_line'],
    sprite:   { hairColor:'#d05060', bodyColor:'#804080', skinColor:'#c89060' },
    ending:   '"Five Centuries of Women" fills the last pages of your journal. Every name remembered.',
    intro: [
      { bg:'mn_kitchen',  pose:'idle',    caption:'Nobody wrote her name down.' },
      { bg:'mn_kitchen',  pose:'reading', caption:'"Anna Maria van den Elzen, 1906." She married into this family. Then what?' },
      { bg:'closeup',     pose:'reading', caption:'Twelve children. A farmhouse. A boat across the ocean. She did all of that.' },
      { bg:'sleep',       pose:'sleeping',caption:'You want to know her name. So go and ask.' },
    ],
  },

  // ── Knoxley ───────────────────────────────────────────
  {
    id:       'knoxley',
    name:     'Knoxley Van Duynhoven',
    emoji:    '🗝️',
    branch:   "Chuck & Daina · Minnesota, US",
    hook:     "I'm the youngest — but I want to find the oldest ancestor possible.",
    startEra: 8,
    startLocation: 'mankato',
    questIds: ['deep_roots'],
    sprite:   { hairColor:'#404030', bodyColor:'#304050', skinColor:'#c89060' },
    ending:   '"Before the Name" glows in her journal. 1450. The youngest one found the very beginning.',
    intro: [
      { bg:'mn_office', pose:'pointing', caption:'"Dirck van Duinhoven, ~1450." Five hundred and seventy years ago. The oldest name anyone could find.' },
      { bg:'mn_office', pose:'idle',     caption:'"FAMILY PAPERS — DO NOT THROW." Everyone said she was too young to look. She looked anyway.' },
      { bg:'closeup',   pose:'reading',  caption:'A circle drawn on the map: Aarle-Rixtel. The youngest girl in the family. The one who asked the oldest question.' },
      { bg:'sleep',     pose:'sleeping', caption:'1450. She\'s going to find out what was there before anything else.' },
    ],
  },

  // ── Isabella ──────────────────────────────────────────
  {
    id:       'isabella',
    name:     'Isabella Van Duynhoven',
    emoji:    '🌊',
    branch:   "William & Leslie · Minnesota, US",
    hook:     "We crossed an ocean to get here. I want to understand why.",
    startEra: 8,
    startLocation: 'mankato',
    questIds: ['the_crossing'],
    sprite:   { hairColor:'#3060a0', bodyColor:'#205080', skinColor:'#c89060' },
    ending:   '"The Crossing" fills your journal — every account, every feeling, every hope. The ocean between then and now feels smaller.',
    intro: [
      { bg:'mn_home',   pose:'idle',    caption:'"Grandpa Johan — Netherlands." He crossed the Atlantic in 1950. Ten days. Seven people.' },
      { bg:'mn_home',   pose:'reading', caption:'"Johan van Duijnhoven. Cabin 214. Southampton → New York. Nov 1950." He kept the ticket.' },
      { bg:'closeup',   pose:'reading', caption:'What was it like? Leaving everything. Not knowing if you\'d ever come back?' },
      { bg:'sleep',     pose:'sleeping',caption:'There\'s only one way to find out.' },
    ],
  },

  // ── Henry ─────────────────────────────────────────────
  {
    id:       'henry',
    name:     'Henry Van Duynhoven',
    emoji:    '⚓',
    branch:   "William & Leslie · Minnesota, US",
    hook:     "Two continents, one family. I want to meet them all.",
    startEra: 8,
    startLocation: 'mankato',
    questIds: ['the_reunion'],
    sprite:   { hairColor:'#2a3040', bodyColor:'#2050a0', skinColor:'#c89060' },
    ending:   '"Everyone Connected." The family reunion screen glows with 130 silhouettes. You talked to all of them.',
    intro: [
      { bg:'mn_bbq',   pose:'idle',     caption:'You love a big family. The bigger the better. 47 people today.' },
      { bg:'mn_bbq',   pose:'reading',  caption:'"Four hundred and forty-nine names. Going back to 1450."' },
      { bg:'closeup',  pose:'surprised',caption:'"One day, someone will have talked to all of them." Challenge accepted.' },
      { bg:'sleep',    pose:'sleeping', caption:'You\'ve got a lot of introductions to make.' },
    ],
  },

  // ── Maxwell ───────────────────────────────────────────
  {
    id:       'maxwell',
    name:     'Maxwell Van Duynhoven',
    emoji:    '🌟',
    branch:   "William & Leslie · Minnesota, US",
    hook:     "What was daily life actually like back then?",
    startEra: 8,
    startLocation: 'mankato',
    questIds: ['day_in_their_life'],
    sprite:   { hairColor:'#806040', bodyColor:'#406040', skinColor:'#c89060' },
    ending:   '"500 Years of Daily Life" fills your journal. History is just people\'s ordinary days — and now you know them.',
    intro: [
      { bg:'classroom',  pose:'idle',    caption:'History class. Again.' },
      { bg:'classroom',  pose:'reading', caption:'"These are actual people. Our actual people."' },
      { bg:'closeup',    pose:'reading', caption:'More vivid than any textbook. This is what a history lesson is supposed to feel like.' },
      { bg:'sleep',      pose:'sleeping',caption:'History is just people\'s ordinary days. Let\'s go see some.' },
    ],
  },
];

/** Look up a character by id */
export function getCharacter(id) {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}
