// ═══════════════════════════════════════════════════════════
//  AppearanceLookup - deterministic appearance derivation for G3 characters
//
//  Given a GEDCOM id (e.g. "@I027@") or a name string (for hand-written NPCs),
//  returns { skinColorHex, hairColorHex, outfitColorHex } by hashing the id
//  into era-appropriate palettes.
//
//  All results are stable across frames and eras for the same person.
// ═══════════════════════════════════════════════════════════

// ── Hash function ─────────────────────────────────────────
// djb2-style: fast, deterministic, good distribution.
function hash32(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return (h >>> 0);               // unsigned 32-bit
}

// Pick one element from an array using a hash seed.
function pick(arr, h) { return arr[h % arr.length]; }

// ── Skin tones (6 tones, historically appropriate for N. European family) ──
const SKIN_TONES = [
  '#f5d6b2',   // very fair
  '#f0c896',   // fair
  '#e8b878',   // light warm
  '#d4a460',   // medium
  '#b8844a',   // tan
  '#9a6838',   // brown
];

// ── Hair colours (8 tones; elders favour grey/white below) ──
const HAIR_COLORS = [
  '#18100a',   // very dark brown/black
  '#30200e',   // dark brown
  '#4a2e10',   // medium brown
  '#6e4820',   // warm brown
  '#8a6432',   // light brown
  '#c0a050',   // dark blonde
  '#d8c070',   // blonde
  '#dcd0b8',   // light blonde
];
const HAIR_GREY  = '#a0a098';
const HAIR_WHITE = '#d8d8d0';

// ── Outfit colour palettes per era group ──────────────────
// Each is a list of hex colours appropriate to the period.
const OUTFIT_PALETTES = [
  // eraId 0-1: 1539/1660 early modern – earthy natural dyes
  ['#6a4a22', '#5a3c28', '#7a5830', '#8a6840', '#3a4828', '#503030', '#7a4030', '#40382a'],
  // eraId 2: 1799 late early modern – muted neoclassical
  ['#5a5060', '#4a4858', '#6a6070', '#606868', '#384840', '#504040', '#606050', '#484438'],
  // eraId 3-4: 1872/1950 Dutch traditional/emigrant – navy, dark green, rust
  ['#20283c', '#18243a', '#2a3848', '#2c3028', '#3a2820', '#241c14', '#482820', '#283428'],
  // eraId 5-8: modern – any colour
  ['#3060a0', '#a03030', '#30883a', '#886030', '#505050', '#602868', '#205a50', '#8a4820',
   '#1e3e7a', '#c04820', '#3a7060', '#6a3a78'],
];

function outfitPalette(eraId) {
  if (eraId <= 1) return OUTFIT_PALETTES[0];
  if (eraId === 2) return OUTFIT_PALETTES[1];
  if (eraId <= 4) return OUTFIT_PALETTES[2];
  return OUTFIT_PALETTES[3];
}

// Elder hair override: people 70+ go grey or white.
function hairForAge(birthYear, eraYear, baseHair) {
  if (birthYear == null) return baseHair;
  const age = eraYear - birthYear;
  if (age >= 80) return HAIR_WHITE;
  if (age >= 68) return HAIR_GREY;
  if (age >= 58) {
    // blend towards grey
    return pick([baseHair, HAIR_GREY, HAIR_GREY], (age | 0) % 3);
  }
  return baseHair;
}

// ── Public API ─────────────────────────────────────────────

/**
 * Derive appearance from a GEDCOM id or a name string.
 *
 * @param {{gedcomId?:string, name?:string, sex?:string,
 *          birthYear?:number, eraYear:number, eraId:number}} opts
 * @returns {{skinColorHex:string, hairColorHex:string, outfitColorHex:string}}
 */
export function lookupAppearance({ gedcomId, name, sex, birthYear, eraYear, eraId }) {
  // Use gedcomId as the primary seed; fall back to the name so hand-written NPCs
  // get a stable look tied to their name.
  const seed = gedcomId || name || 'unknown';
  const h1 = hash32(seed);
  const h2 = hash32(seed + '#2');
  const h3 = hash32(seed + '#3');

  const skinColorHex   = pick(SKIN_TONES, h1);
  const baseHair       = pick(HAIR_COLORS, h2);
  const hairColorHex   = hairForAge(birthYear, eraYear, baseHair);
  const outfitColorHex = pick(outfitPalette(eraId), h3);

  return { skinColorHex, hairColorHex, outfitColorHex };
}
