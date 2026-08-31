// ═══════════════════════════════════════════════════════════
//  EraData — era metadata, enemy definitions, world builder
//  4×4 screen grid (WORLD_COLS × WORLD_ROWS) per era
// ═══════════════════════════════════════════════════════════
import { T, TILE } from './Renderer.js';

export const SCREEN_COLS = 20;   // tiles wide per screen
export const SCREEN_ROWS = 14;   // tiles tall per screen
export const WORLD_COLS  = 4;    // screens across
export const WORLD_ROWS  = 4;    // screens down

// ── Enemy definitions ────────────────────────────────────
export const ENEMY_DEFS = {
  tax_collector:   { id:'tax_collector', name:'Tax Collector',   emoji:'💰', color:'#8a6020', accent:'#c09030', hp:4, speed:55, damage:20, chaseRange:190, peaceful:true,  steal:15,
                     desc:'A royal tax collector demanding tithes from peasants. He won\'t hurt you — but he\'ll take your coins!' },
  plague_rat:   { id:'plague_rat', name:'Plague Rat',      emoji:'🐀', color:'#3a3020', accent:'#607020', hp:2, speed:90, damage:12, chaseRange:150,
                     desc:'A diseased rat from the 1539 village. Fast and hard to catch. Medieval Brabant had many of them.' },
  inquisitor:   { id:'inquisitor', name:'Inquisitor',      emoji:'⛪', color:'#1a1040', accent:'#4030a0', hp:6, speed:45, damage:25, chaseRange:220,
                     desc:'A Spanish Inquisition agent. Slow but powerful. The Spanish ruled the Southern Netherlands and enforced strict Catholicism.' },
  spanish_soldier:   { id:'spanish_soldier', name:'Spanish Soldier', emoji:'⚔️', color:'#7a1010', accent:'#c02020', hp:5, speed:60, damage:22, chaseRange:190,
                     desc:'A soldier from the Spanish garrison in the Golden Age Netherlands. Spain tried to control the Dutch trading cities — it didn\'t go well for them.' },
  pickpocket:   { id:'pickpocket', name:'Pickpocket',      emoji:'🤏', color:'#404040', accent:'#808080', hp:2, speed:100,damage:8,  chaseRange:160, peaceful:true,  steal:8,
                     desc:'A nimble thief working the crowded Golden Age markets. He won\'t fight — just grabs your coins and runs!' },
  debt_collector:   { id:'debt_collector', name:'Debt Collector',  emoji:'📜', color:'#503010', accent:'#806020', hp:3, speed:50, damage:15, chaseRange:170, peaceful:true,  steal:12,
                     desc:'A debt collector hired by wealthy Golden Age merchants. He demands payment — peacefully, but insistently.' },
  fr_conscript:   { id:'fr_conscript', name:'French Conscript',emoji:'🪖', color:'#2a3a6a', accent:'#4a6aaa', hp:4, speed:65, damage:20, chaseRange:190,
                     desc:'A young French soldier conscripted into Napoleon\'s army. In 1799 French troops occupied the Southern Netherlands and forced young men to fight.' },
  deserter:   { id:'deserter', name:'Deserter',        emoji:'🏃', color:'#5a5020', accent:'#8a8040', hp:3, speed:85, damage:18, chaseRange:170,
                     desc:'A French army deserter hiding in the Brabant countryside. Desperate and dangerous — he has nothing to lose.' },
  overseer:   { id:'overseer', name:'Factory Overseer',emoji:'🏭', color:'#2a1a0a', accent:'#5a3a1a', hp:5, speed:55, damage:22, chaseRange:180,
                     desc:'A harsh factory foreman from the 1872 industrial revolution. He kept workers in line with threats and fines.' },
  steam_machine:   { id:'steam_machine', name:'Steam Machine',   emoji:'⚙️', color:'#4a4040', accent:'#8a8080', hp:8, speed:40, damage:30, chaseRange:150,
                     desc:'A runaway industrial steam engine. The new factories of 1872 were dangerous — machinery accidents were common. Very tough but slow.' },
  storm_wave:   { id:'storm_wave', name:'Storm Wave',      emoji:'🌊', color:'#1a3a5a', accent:'#2a6a9a', hp:3, speed:80, damage:25, chaseRange:200,
                     desc:'A fierce Atlantic wave on the 1950 crossing. The emigrant ship faced ten days of unpredictable North Atlantic weather.' },
  u_boat:   { id:'u_boat', name:'U-Boat Ghost',    emoji:'🛸', color:'#1a2a1a', accent:'#3a5a3a', hp:5, speed:50, damage:28, chaseRange:220,
                     desc:'The spectral echo of a WWII German U-boat. By 1950 the Atlantic was safer, but the memory of wartime submarines still haunted sailors.' },
  mccarthyist:   { id:'mccarthyist', name:'McCarthyist',     emoji:'🔍', color:'#2a2050', accent:'#5a4a90', hp:4, speed:55, damage:20, chaseRange:180, peaceful:true, steal:10,
                     desc:'A 1950s anti-Communist investigator. He accuses immigrants of suspicious loyalties — and takes their savings as "evidence".' },
  tornado:   { id:'tornado', name:'Tornado',         emoji:'🌪️', color:'#4a4a5a', accent:'#7a7a9a', hp:6, speed:70, damage:30, chaseRange:260,
                     desc:'A Minnesota tornado. The Great Plains are famous for violent storms. The Van Duynhoven farm would have seen several over the years.' },
  cold_war_spy:   { id:'cold_war_spy', name:'Cold War Spy',    emoji:'🕵️', color:'#1a1a2a', accent:'#3a3a5a', hp:5, speed:65, damage:22, chaseRange:200, peaceful:true, steal:18,
                     desc:'A 1984 Cold War intelligence agent. East–West tensions were high and spies were everywhere — especially near Dutch NATO installations.' },
  computer_virus:   { id:'computer_virus', name:'Computer Virus',  emoji:'💻', color:'#0a2a0a', accent:'#0a6a0a', hp:4, speed:75, damage:18, chaseRange:180,
                     desc:'An early 1984 computer virus. The first personal computers were appearing in homes and offices — and so were the first malicious programs.' },
  virus_cloud:   { id:'virus_cloud', name:'Virus Cloud',     emoji:'🦠', color:'#1a0a2a', accent:'#4a1a6a', hp:5, speed:60, damage:25, chaseRange:220,
                     desc:'A COVID-19 cloud from 2020. The pandemic changed everything — travel, family visits, the whole world. The Van Duynhovens were separated for months.' },
  misinfo_bot:   { id:'misinfo_bot', name:'Misinfo Bot',     emoji:'📱', color:'#0a1a2a', accent:'#1a3a5a', hp:3, speed:70, damage:15, chaseRange:200, peaceful:true, steal:5,
                     desc:'A 2020 social media bot spreading false information. It steals your attention — and your confidence. Annoying rather than dangerous.' },
};

// ── Era metadata ─────────────────────────────────────────
export const ERAS = [
  { id:0, year:'1539', name:'Aarle-Rixtel, Netherlands',       enemies:['tax_collector','plague_rat','inquisitor'],    gateItem:{id:'family_seal',     label:'Family Seal',      emoji:'🔏'} },
  { id:1, year:'1660', name:'Dutch Golden Age',                 enemies:['spanish_soldier','pickpocket','debt_collector'], gateItem:{id:'prayer_book',  label:'Prayer Book',      emoji:'📖'} },
  { id:2, year:'1799', name:'Napoleonic Uden',                  enemies:['fr_conscript','deserter'],                   gateItem:{id:'birth_record',    label:'Birth Record',     emoji:'📜'} },
  { id:3, year:'1872', name:'Industrial Noord-Brabant',         enemies:['overseer','steam_machine'],                  gateItem:{id:'train_ticket',    label:'Train Ticket',     emoji:'🎟️'} },
  { id:4, year:'1950', name:'Atlantic Ocean — Emigrant Ship',   enemies:['storm_wave','u_boat'],                       gateItem:{id:'immigration_papers',label:'Immigration Papers',emoji:'📋'} },
  { id:5, year:'1955', name:'Moorhead, Minnesota',              enemies:['mccarthyist','tornado'],                     gateItem:{id:'boterkoek',       label:'Boterkoek Recipe', emoji:'🍪'} },
  { id:6, year:'1984', name:'Wisconsin & Netherlands',          enemies:['cold_war_spy','computer_virus'],             gateItem:{id:'floppy_disk',     label:'Floppy Disk',      emoji:'💾'} },
  { id:7, year:'2020', name:'Minnesota & Haarlem',              enemies:['virus_cloud','misinfo_bot'],                 gateItem:null },
  { id:8, year:'2026', name:'Haarlem & Mankato — Present Day',  enemies:[],                                           gateItem:null,
    locations: {
      haarlem: 'Leidsevaart, Haarlem, Netherlands',
      mankato:  '313 Hanover St, Mankato, Minnesota',
    },
  },
];

// ── Fishing catches per era ───────────────────────────────
export const FISH_TABLES = [
  // Each era: [common_fish, rare_catch]
  // Rare catches include Starling's youngest_voyager quest items (era-themed)
  [ {id:'perch',  label:'Perch',      emoji:'🐟', hp:15, common:true},  {id:'pebble',       label:'Smooth Pebble',    emoji:'🪨', quest:'starling'} ],  // Era 0
  [ {id:'bream',  label:'Bream',      emoji:'🐟', hp:15, common:true},  {id:'dried_tulip',  label:'Dried Tulip',      emoji:'🌷', quest:'starling'} ],  // Era 1
  [ {id:'carp',   label:'Carp',       emoji:'🐟', hp:20, common:true},  {id:'copper_coin',  label:'Copper Coin',      emoji:'🪙', quest:'starling'} ],  // Era 2
  [ {id:'eel',    label:'Eel',        emoji:'🐟', hp:15, common:true},  {id:'iron_bolt',    label:'Iron Bolt',        emoji:'🔩', quest:'starling'} ],  // Era 3
  [ {id:'flying', label:'Flying Fish', emoji:'🐠', hp:20, common:true}, {id:'driftwood',    label:'Driftwood Plank',  emoji:'🪵', quest:'starling'} ],  // Era 4
  [ {id:'walleye',label:'Walleye',    emoji:'🐟', hp:25, common:true},  {id:'corn_husk_doll',label:'Corn Husk Doll',  emoji:'🪆', quest:'starling'} ],  // Era 5
  [ {id:'bass',   label:'Bass',       emoji:'🐟', hp:20, common:true},  {id:'cassette_tape',label:'Cassette Tape',    emoji:'📼', quest:'starling'} ],  // Era 6
  [ {id:'pike',   label:'Pike',       emoji:'🐟', hp:30, common:true},  {id:'usb_drive',    label:'USB Drive',        emoji:'💾', quest:'starling'} ],  // Era 7
  [ {id:'pike',   label:'Leidsevaart Pike',emoji:'🐟', hp:30, common:true}, {id:'old_coin', label:'Old Dutch Coin',  emoji:'🪙'} ],                      // Era 8
];

// ── Map helpers ───────────────────────────────────────────
const W = SCREEN_COLS, H = SCREEN_ROWS;

function blank(t = T.GRASS) {
  return Array.from({length: H}, () => new Uint8Array(W).fill(t));
}
function set(m, r, c, t)  { if (r >= 0 && r < H && c >= 0 && c < W) m[r][c] = t; }
function fill(m, r1, c1, r2, c2, t) {
  for (let r = Math.max(0,r1); r <= Math.min(H-1,r2); r++)
    for (let c = Math.max(0,c1); c <= Math.min(W-1,c2); c++) m[r][c] = t;
}
function border(m, t = T.TREE) {
  for (let c = 0; c < W; c++) { m[0][c] = t; m[H-1][c] = t; }
  for (let r = 0; r < H; r++) { m[r][0] = t; m[r][W-1] = t; }
}

// Era-accurate house: wall and roof tile depend on period
// eraId 0 = thatched/daub, 1-3 = brick, 4 = plank, 5-6 = wood/plank, 7-8 = modern
function house(m, r, c, w, h, wallTile = T.HOUSE_WALL, roofTile = T.HOUSE_ROOF) {
  fill(m, r, c, r, c+w-1, roofTile);
  fill(m, r+1, c, r+h-1, c+w-1, wallTile);
  // Keep door row walkable
  set(m, r+h-1, c + Math.floor(w/2), T.DOOR);
}

// Returns [wallTile, roofTile] for the given era
function eraHouseTiles(eraId) {
  switch (eraId) {
    case 0:  return [T.HOUSE_WALL, T.HOUSE_ROOF]; // 1539 — wattle & daub, thatched. HOUSE_WALL = warm tan
    case 1:  return [T.BRICK,      T.HOUSE_ROOF]; // 1660 — Dutch brick canal houses
    case 2:  return [T.BRICK,      T.HOUSE_ROOF]; // 1799 — Napoleonic-era brick
    case 3:  return [T.BRICK,      T.HOUSE_ROOF]; // 1872 — industrial red brick
    case 4:  return [T.PLANK,      T.PLANK];      // 1950 — ship = wooden planks throughout
    case 5:  return [T.PLANK,      T.HOUSE_ROOF]; // 1955 — Minnesota wood-frame houses
    case 6:  return [T.PLANK,      T.HOUSE_ROOF]; // 1984 — US side wood frame; NL side brick (default plank)
    case 7:  return [T.STEEL,      T.HOUSE_ROOF]; // 2020 — modern construction (concrete/steel)
    case 8:  return [T.BRICK,      T.HOUSE_ROOF]; // 2026 Haarlem — Dutch brick; Mankato wood
    default: return [T.HOUSE_WALL, T.HOUSE_ROOF];
  }
}

// Convenience: house with era-appropriate materials
function houseEra(m, r, c, w, h, eraId = 0) {
  const [wall, roof] = eraHouseTiles(eraId);
  house(m, r, c, w, h, wall, roof);
}

function clearZone(m, r, c, size = 2) {
  for (let dr = -size; dr <= size; dr++)
    for (let dc = -size; dc <= size; dc++) set(m, r+dr, c+dc, T.GRASS);
}
function openEdge(m, side, pos) {
  if (side === 'right') for (let r = pos-2; r <= pos+2; r++) { set(m,r,W-1,T.GRASS); set(m,r,W-2,T.GRASS); }
  if (side === 'left')  for (let r = pos-2; r <= pos+2; r++) { set(m,r,0,T.GRASS);   set(m,r,1,T.GRASS); }
  if (side === 'down')  for (let c = pos-2; c <= pos+2; c++) { set(m,H-1,c,T.GRASS); set(m,H-2,c,T.GRASS); }
  if (side === 'up')    for (let c = pos-2; c <= pos+2; c++) { set(m,0,c,T.GRASS);   set(m,1,c,T.GRASS); }
}

/**
 * Carve a guaranteed walkable L-shaped path from (sr,sc) to the exit passage.
 * Uses T.ROAD so it's visually distinct from the surrounding terrain.
 * Does NOT overwrite DOOR, BRIDGE, PORTAL, WATER, or DEEP_WATER tiles.
 */
const KEEP_TILES = new Set([T.DOOR, T.BRIDGE, T.PORTAL, T.WATER, T.DEEP_WATER, T.PLANK]);

function carvePathToExit(m, sr, sc, side, pos) {
  // Target: centre of the opening on that edge
  let tr, tc;
  if (side === 'right')  { tr = pos; tc = W - 2; }
  else if (side === 'left')   { tr = pos; tc = 1; }
  else if (side === 'down')   { tr = H - 2; tc = pos; }
  else                        { tr = 1;     tc = pos; }

  // L-shaped path: horizontal first, then vertical (or vice versa)
  // Pick the leg order that avoids as many solids as possible
  // Simple approach: go horizontal to target column, then vertical to target row
  const carve = (r, c) => {
    if (KEEP_TILES.has(m[r]?.[c])) return;
    m[r][c] = T.ROAD;
  };

  // Horizontal leg
  const minC = Math.min(sc, tc), maxC = Math.max(sc, tc);
  for (let c = minC; c <= maxC; c++) carve(sr, c);
  // Vertical leg from (sr, tc) to (tr, tc)
  const minR = Math.min(sr, tr), maxR = Math.max(sr, tr);
  for (let r = minR; r <= maxR; r++) carve(r, tc);
}

/**
 * Reinforce edges that have NO exit with a 2-tile-thick visual barrier.
 * Outer row = T.CLIFF (stone-grey), inner row = T.WALL — makes it
 * unambiguous that the player cannot go that direction.
 * Called AFTER openEdge() so exit gaps are already carved.
 */
function sealClosedEdges(m, exits) {
  const sides = ['up', 'down', 'left', 'right'];
  for (const side of sides) {
    if (exits[side]) continue;   // has an exit — leave the gap alone
    if (side === 'up') {
      for (let c = 0; c < W; c++) { m[0][c] = T.CLIFF; m[1][c] = T.WALL; }
    } else if (side === 'down') {
      for (let c = 0; c < W; c++) { m[H-1][c] = T.CLIFF; m[H-2][c] = T.WALL; }
    } else if (side === 'left') {
      for (let r = 0; r < H; r++) { m[r][0] = T.CLIFF; m[r][1] = T.WALL; }
    } else if (side === 'right') {
      for (let r = 0; r < H; r++) { m[r][W-1] = T.CLIFF; m[r][W-2] = T.WALL; }
    }
  }
  // Corners always sealed — cliff at very corner, wall one step in
  m[0][0] = T.CLIFF;   m[0][W-1] = T.CLIFF;
  m[H-1][0] = T.CLIFF; m[H-1][W-1] = T.CLIFF;
}

function makeScreen(map, exits = {}, title = '', spawn = {r:7, c:10}) {
  // 1. Open edge passages where exits exist
  Object.entries(exits).forEach(([side, {pos}]) => openEdge(map, side, pos));
  // 2. Seal closed edges so dead-ends read as walls, not just decoration
  sealClosedEdges(map, exits);
  // 3. Clear spawn zone
  clearZone(map, spawn.r, spawn.c, 2);
  // 4. Carve guaranteed paths from spawn to every exit
  Object.entries(exits).forEach(([side, {pos}]) =>
    carvePathToExit(map, spawn.r, spawn.c, side, pos)
  );
  // 5. Derive a representative minimap color from the screen title
  const color = _screenColor(title);
  return { map, exits, title, spawn, color };
}

// ── Minimap color by screen type (derived from title keywords) ──
function _screenColor(title) {
  const t = title.toLowerCase();
  // Indoor / special
  if (/church|kerk|chapel|monastery|cathedral|shrine|temple/.test(t)) return '#5a3a80'; // purple
  if (/tavern|inn|café|pub|bar/.test(t))                                return '#7a3a10'; // dark amber
  if (/warehouse|dock|port|wharf|harbour|harbor|cargo|ship/.test(t))   return '#1a4060'; // navy
  if (/market|square|plein|town.*green|village.*centre|centre/.test(t))return '#c8b060'; // gold
  if (/castle|fort|citadel|fortress|wall|gate/.test(t))                return '#606060'; // grey
  if (/farm|field|wheat|polder|crop|harvest/.test(t))                   return '#5a7a20'; // field green
  if (/forest|wood|tree|pine/.test(t))                                  return '#2a5a18'; // dark green
  if (/river|canal|stream|bridge|water|harbour|wharf/.test(t))          return '#1a5a8a'; // blue
  if (/road|path|street|highway|south.*road/.test(t))                   return '#8a7a50'; // tan
  if (/marsh|bog|swamp|fen|peat/.test(t))                               return '#3a5a30'; // murky
  if (/heath|moor|heather|heathland/.test(t))                           return '#8a6a40'; // heath brown
  if (/house|home|dwelling|cottage|neighbourhood/.test(t))              return '#c07040'; // warm brown
  if (/wind.*mill|windmill/.test(t))                                    return '#c8c090'; // pale yellow
  if (/prison|jail|dungeon/.test(t))                                    return '#303030'; // very dark
  if (/portal|shrine|standing.*stone/.test(t))                          return '#4020a0'; // deep purple
  if (/station|railway|factory|industrial|mill/.test(t))               return '#505868'; // steel grey
  if (/office|apartment|flat|building/.test(t))                         return '#6a7880'; // blue-grey
  if (/park|garden|grass|meadow/.test(t))                               return '#4a9040'; // medium green
  if (/beach|shore|sand|coast/.test(t))                                 return '#c8a860'; // sand
  // Era-specific fallbacks
  if (/1950|ship|atlantic|ocean|sea/.test(t))                           return '#1a4a6a'; // deep ocean
  if (/1539|1660|1799|1872/.test(t))                                    return '#5a6a40'; // historic green
  if (/minnesota|wisconsin|prairie|midwest/.test(t))                    return '#7a9040'; // prairie
  if (/haarlem|amsterdam|netherlands|dutch/.test(t))                    return '#4a6a90'; // dutch blue
  return '#4a5a40'; // default: muted olive
}

// ── World builder ─────────────────────────────────────────
export function buildEraWorld(eraId, location = 'haarlem') {
  // Era 8 = 2026 present-day — two distinct accurate worlds
  if (eraId === 8) {
    return location === 'mankato' ? _buildMankatoWorld() : _buildHaarlemWorld();
  }

  const grid = Array.from({length: WORLD_ROWS}, () => Array(WORLD_COLS).fill(null));

  switch (eraId) {

    // ═══════════════════════════════════════════════════
    // ERA 0 · 1539 · AARLE-RIXTEL, NOORD-BRABANT
    // Heathland, thatched farms, Sint-Lambertus church.
    // Portal: Ancient standing stones — row 0 far east [0,3]
    // ═══════════════════════════════════════════════════
    case 0: {
      // [0,0] Deep heather forest — north wilderness
      { const m=blank(T.GRASS); border(m,T.PINE);
        fill(m,1,1,H-3,W-3,T.TREE); fill(m,4,5,9,14,T.GRASS);
        fill(m,6,7,8,12,T.FLOWER);
        // scattered boulders & fallen logs in the clearing
        set(m,5,6,T.ROCK); set(m,7,10,T.ROCK); set(m,8,13,T.ROCK); set(m,4,8,T.ROCK);
        // lone pines dotting the clearing edge
        set(m,4,11,T.PINE); set(m,9,6,T.PINE); set(m,6,14,T.PINE);
        // wildflower patches
        fill(m,4,5,4,6,T.FLOWER); set(m,9,12,T.FLOWER);
        grid[0][0]=makeScreen(m,{right:{pos:7},down:{pos:10}},'1539 · Northern Heathland',{r:7,c:12}); }

      // [0,1] Heather ridge — open heath with wildflowers
      { const m=blank(T.FLOWER); border(m,T.TREE);
        fill(m,3,3,10,16,T.GRASS); fill(m,5,6,8,14,T.FLOWER);
        for(let c=4;c<W-3;c+=3) set(m,2,c,T.TREE);
        // heath boulders & gorse clumps
        set(m,4,5,T.ROCK); set(m,6,15,T.ROCK); set(m,9,4,T.ROCK); set(m,4,15,T.ROCK);
        // extra flower drifts among the grass
        fill(m,9,7,10,13,T.FLOWER); set(m,3,9,T.FLOWER); set(m,3,10,T.FLOWER);
        grid[0][1]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'1539 · Open Heath',{r:7,c:10}); }

      // [0,2] Peat bog — marshy, difficult terrain
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,1,1,H-3,8,T.WATER); fill(m,1,11,H-3,W-3,T.WATER);
        fill(m,1,9,H-3,10,T.BRIDGE); // narrow causeway
        fill(m,3,3,5,7,T.GRASS); fill(m,3,11,5,15,T.GRASS);
        // reed beds fringing the open water (FLOWER = marsh reeds)
        set(m,2,3,T.FLOWER); set(m,3,2,T.FLOWER); set(m,8,4,T.FLOWER); set(m,9,7,T.FLOWER);
        set(m,2,15,T.FLOWER); set(m,8,13,T.FLOWER); set(m,9,12,T.FLOWER); set(m,3,16,T.FLOWER);
        // stepping stones across the bog
        set(m,7,4,T.ROCK); set(m,8,6,T.ROCK); set(m,7,13,T.ROCK); set(m,8,15,T.ROCK);
        grid[0][2]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'1539 · Peat Bog',{r:7,c:9}); }

      // [0,3] ANCIENT STANDING STONES + PORTAL — druidic/pre-Christian site
      { const m=blank(T.FLOWER); border(m,T.ROCK);
        fill(m,2,2,H-3,W-3,T.FLOWER);
        // Larger stone circle around the portal
        [[3,9],[3,10],[3,11],[4,7],[4,13],[5,6],[5,14],[7,6],[7,14],[8,7],[8,13],[9,9],[9,10],[9,11]]
          .forEach(([r,c])=>set(m,r,c,T.ROCK));
        // fallen outlier stones and a stone path leading in
        set(m,10,3,T.ROCK); set(m,3,16,T.ROCK); set(m,11,15,T.ROCK);
        set(m,11,10,T.ROCK); set(m,12,10,T.ROCK);
        // Portal at the centre of the stone circle
        set(m,6,9,T.PORTAL); set(m,6,10,T.PORTAL); set(m,6,11,T.PORTAL);
        clearZone(m,9,10,2);
        grid[0][3]=makeScreen(m,{left:{pos:7},down:{pos:10}},'1539 · Ancient Standing Stones',{r:9,c:10}); }

      // [1,0] Sint-Lambertus church + monastery
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,1,2,8,10,T.COBBLE); // churchyard
        houseEra(m, 1,3,7,6, 0); // church
        set(m,7,6,T.DOOR); set(m,7,7,T.DOOR); // church entrance
        // Interior detail on the cobbled nave: altar at the front, pews in rows
        set(m,2,6,T.ROCK); set(m,2,7,T.ROCK); // altar block at front, c=6-7
        fill(m,3,4,3,9,T.ROCK); // front pew row
        fill(m,5,4,5,9,T.ROCK); // rear pew row
        set(m,4,4,T.COBBLE); set(m,4,9,T.COBBLE); // side aisles kept clear
        // churchyard graves & memorial stones flanking the path
        set(m,8,2,T.ROCK); set(m,8,4,T.ROCK); set(m,8,9,T.ROCK); set(m,8,10,T.ROCK);
        fill(m,9,1,H-3,W-3,T.WHEAT); // monastery fields
        fill(m,10,3,10,7,T.CROP_READY); fill(m,12,10,12,15,T.CROP_READY); // ripe rows
        set(m,11,2,T.TREE); set(m,11,16,T.TREE); // orchard trees
        grid[1][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'1539 · Sint-Lambertus Church',{r:10,c:12}); }

      // [1,1] Village green — Aarle main street (CLUE NPC: Aelken here)
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,3,4,9,15,T.COBBLE);
        houseEra(m, 1,1,5,4, 0); houseEra(m, 1,14,5,4, 0);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        // Market stall (timber frame) on the west side of the green
        fill(m,5,4,6,6,T.HOUSE_WALL); set(m,6,5,T.PLANK); // stall counter
        // second stall to the east
        fill(m,5,12,6,13,T.HOUSE_WALL);
        // village well — stone ring at r=7,c=9 area (kept off the road at c=8)
        set(m,7,8,T.ROCK); set(m,8,8,T.ROCK);
        // stone paths radiating from the green
        fill(m,3,7,3,8,T.COBBLE); fill(m,9,11,9,14,T.COBBLE);
        // flower beds along the south verge
        fill(m,10,3,H-3,7,T.FLOWER); fill(m,10,12,H-3,15,T.FLOWER);
        set(m,H-2,9,T.CROP_READY); // well marker
        grid[1][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1539 · Aarle Village Green',{r:7,c:9}); }

      // [1,2] East farmland — wheat fields + Dirck's area
      { const m=blank(T.WHEAT); border(m,T.TREE);
        fill(m,2,9,H-3,W-3,T.GRASS);
        houseEra(m, 2,11,5,6, 0); // Dirck's farmhouse
        // ripening crop rows across the west field
        fill(m,3,3,3,7,T.CROP_READY); fill(m,4,3,4,7,T.CROP_READY);
        fill(m,7,3,7,7,T.CROP_READY); fill(m,8,3,8,7,T.CROP_READY);
        fill(m,10,3,10,7,T.CROP_READY);
        // farmyard clutter east of the road: barrels/stones + animal pen
        set(m,9,10,T.ROCK); set(m,10,10,T.ROCK); set(m,9,16,T.ROCK);
        fill(m,10,13,11,16,T.DIRT); set(m,11,14,T.CROP_READY); // penned feed
        set(m,3,16,T.TREE); set(m,4,10,T.FLOWER); // kitchen-garden flowers
        for(let r=1;r<H-1;r++) m[r][9]=T.ROAD;
        grid[1][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1539 · East Wheat Fields',{r:7,c:9}); }

      // [1,3] Outskirt farms — eastern edge
      { const m=blank(T.WHEAT); border(m,T.TREE);
        houseEra(m, 2,2,5,4, 0); houseEra(m, 2,13,5,5, 0);
        fill(m,7,1,H-3,W-3,T.GRASS);
        fill(m,8,3,10,6,T.FLOWER);
        // farmyard between the two homesteads: dirt yard, animal pen, barrels
        fill(m,7,8,9,12,T.DIRT);
        set(m,8,9,T.CROP_READY); set(m,8,11,T.CROP_READY); // penned feed
        set(m,7,10,T.ROCK); set(m,9,8,T.ROCK); set(m,9,12,T.ROCK); // barrels/stones
        set(m,10,14,T.ROCK); fill(m,10,13,11,16,T.FLOWER); // eastern kitchen garden
        set(m,7,2,T.ROCK); set(m,7,16,T.TREE);
        grid[1][3]=makeScreen(m,{left:{pos:7},up:{pos:10},down:{pos:10}},'1539 · Outer Farms',{r:7,c:10}); }

      // [2,0] River crossing — fishable water
      { const m=blank(T.GRASS); border(m,T.TREE);
        for(let c=1;c<W-1;c++){ m[5][c]=T.WATER; m[6][c]=T.WATER; }
        // main bridge (centre) + second footbridge to the west
        m[5][9]=T.BRIDGE; m[5][10]=T.BRIDGE; m[6][9]=T.BRIDGE; m[6][10]=T.BRIDGE;
        m[5][4]=T.BRIDGE; m[6][4]=T.BRIDGE;
        fill(m,1,1,4,W-2,T.GRASS); fill(m,7,1,H-3,W-2,T.GRASS);
        // watermill on the north bank (east side), wheel sitting in the race
        houseEra(m, 1,13,5,4, 0);
        set(m,5,14,T.PLANK); set(m,6,14,T.PLANK); // mill race decking / wheel
        set(m,4,13,T.ROCK); set(m,4,17,T.ROCK); // mill foundation stones
        // millpond stones & bank reeds
        set(m,4,6,T.ROCK); set(m,7,15,T.ROCK); set(m,4,3,T.FLOWER); set(m,7,3,T.FLOWER);
        fill(m,8,2,11,5,T.FLOWER);
        set(m,9,13,T.ROCK); set(m,10,15,T.ROCK); // south-bank boulders
        grid[2][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'1539 · River Crossing',{r:10,c:10}); }

      // [2,1] South village — more houses
      { const m=blank(T.GRASS); border(m,T.TREE);
        houseEra(m, 1,2,5,4, 0); houseEra(m, 1,13,5,4, 0);
        for(let r=1;r<H-1;r++){ m[r][9]=T.COBBLE; m[r][10]=T.COBBLE; }
        fill(m,7,2,H-3,6,T.FLOWER); fill(m,7,13,H-3,W-3,T.WHEAT);
        // small market stall & village well beside the path
        fill(m,4,4,5,5,T.HOUSE_WALL); set(m,5,4,T.PLANK); // stall
        set(m,6,8,T.ROCK); set(m,7,8,T.ROCK); // well ring west of path
        set(m,6,11,T.ROCK); // mounting stone east of path
        set(m,10,14,T.CROP_READY); fill(m,11,13,11,16,T.CROP_READY); // ripe rows
        set(m,3,7,T.TREE); set(m,3,12,T.TREE);
        grid[2][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1539 · South Village',{r:7,c:9}); }

      // [2,2] DIRCK'S FIELD — KEY ANCESTOR LOCATION (morning/afternoon)
      { const m=blank(T.WHEAT); border(m,T.TREE);
        fill(m,1,9,H-3,W-3,T.GRASS);
        fill(m,7,10,11,16,T.WATER); // ditch for fishing
        m[9][9]=T.BRIDGE; m[10][9]=T.BRIDGE;
        // ripening crop rows across the west field
        fill(m,3,3,3,7,T.CROP_READY); fill(m,4,3,4,7,T.CROP_READY);
        fill(m,8,3,8,7,T.CROP_READY); fill(m,9,3,9,7,T.CROP_READY);
        fill(m,11,3,11,7,T.CROP_READY);
        // reeds along the ditch + a mooring stone
        set(m,6,11,T.FLOWER); set(m,6,14,T.FLOWER); set(m,6,16,T.ROCK);
        // hedgerow trees & a boundary stone on the grass verge
        set(m,2,12,T.TREE); set(m,4,15,T.ROCK); set(m,4,10,T.FLOWER);
        for(let r=1;r<H-1;r++) m[r][9]=T.ROAD;
        grid[2][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1539 · Dirck\'s East Field',{r:7,c:9}); }

      // [2,3] Heathland path to stones — only connects left and up (no [3,3] screen)
      { const m=blank(T.FLOWER); border(m,T.TREE);
        fill(m,1,1,H-3,W-3,T.FLOWER);
        for(let r=3;r<H-3;r+=2){ set(m,r,3,T.ROCK); set(m,r,W-4,T.ROCK); }
        // waymarker cairns lining the path + a couple of gnarled pines
        set(m,4,7,T.ROCK); set(m,6,12,T.ROCK); set(m,8,6,T.ROCK); set(m,9,13,T.ROCK);
        set(m,2,9,T.PINE); set(m,10,10,T.PINE);
        grid[2][3]=makeScreen(m,{left:{pos:7},up:{pos:10}},'1539 · Heather Path',{r:7,c:10}); }

      // [3,0] Marshland — tavern/inn at edge
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,1,1,5,W-3,T.WATER);
        // twin causeway bridges across the marsh
        m[3][9]=T.BRIDGE; m[3][10]=T.BRIDGE; m[4][9]=T.BRIDGE; m[4][10]=T.BRIDGE;
        m[3][14]=T.BRIDGE; m[4][14]=T.BRIDGE;
        houseEra(m, 6,3,6,5, 0); // tavern
        set(m,10,6,T.DOOR);
        // tavern interior: bar counter (WALL) along the west inner wall + tables (ROCK)
        set(m,7,4,T.WALL); set(m,8,4,T.WALL); set(m,9,4,T.WALL); // bar counter, c=4 inner wall
        set(m,7,6,T.ROCK); set(m,8,7,T.ROCK); // tables/stools
        set(m,9,7,T.ROCK);
        fill(m,6,9,H-3,W-3,T.GRASS);
        // outdoor trestle tables & barrels by the water, reeds fringing the marsh
        set(m,7,12,T.ROCK); set(m,7,14,T.ROCK); set(m,8,13,T.ROCK); // trestle tables
        set(m,6,10,T.FLOWER); set(m,6,15,T.FLOWER); set(m,10,16,T.FLOWER); // reeds
        set(m,9,11,T.ROCK); set(m,11,14,T.ROCK); // barrels
        grid[3][0]=makeScreen(m,{right:{pos:7},up:{pos:10}},'1539 · Marsh Tavern',{r:10,c:12}); }

      // [3,1] Road south — open fields
      { const m=blank(T.GRASS); border(m,T.TREE);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        fill(m,1,1,H-3,8,T.WHEAT); fill(m,1,11,H-3,W-3,T.WHEAT);
        // ripening rows either side of the road
        fill(m,4,2,4,7,T.CROP_READY); fill(m,9,2,9,7,T.CROP_READY);
        fill(m,4,12,4,16,T.CROP_READY); fill(m,9,12,9,16,T.CROP_READY);
        // milestones flanking the road + a wayside shrine stone
        set(m,6,8,T.ROCK); set(m,6,11,T.ROCK); set(m,11,8,T.ROCK);
        set(m,2,4,T.FLOWER); set(m,2,15,T.FLOWER); // verge flowers
        grid[3][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10}},'1539 · South Road',{r:7,c:9}); }

      // [3,2] Old shrine — rocky outcrop
      { const m=blank(T.GRASS); border(m,T.ROCK);
        fill(m,2,2,H-3,W-3,T.FLOWER);
        // Standing-stone circle in the upper half of the shrine
        [[2,9],[2,10],[3,7],[3,12],[4,5],[4,14],[5,4],[5,15],[6,5],[6,14]]
          .forEach(([r,c])=>set(m,r,c,T.ROCK));
        // central altar pair (row 5), clear of the movement path (col 8-11 kept open below)
        set(m,5,9,T.ROCK); set(m,5,10,T.ROCK);
        // outer sentinel stones flanking the approach
        set(m,7,4,T.ROCK); set(m,7,15,T.ROCK); set(m,8,5,T.ROCK); set(m,8,14,T.ROCK);
        // Wide clear corridor up the centre so player can always move
        fill(m,7,8,H-3,11,T.GRASS);
        grid[3][2]=makeScreen(m,{left:{pos:7},up:{pos:10}},'1539 · Old Shrine',{r:10,c:10}); }

      break; }

    // ═══════════════════════════════════════════════════
    // ERA 1 · 1660 · DUTCH GOLDEN AGE
    // Amsterdam-style canal city. Portal: hidden in a
    // merchant warehouse at the harbour [3,0]
    // ═══════════════════════════════════════════════════
    case 1: {
      // [0,0] Canal district north — row houses + water
      { const m=blank(T.COBBLE); border(m,T.BRICK);
        fill(m,0,0,H-1,6,T.WATER); // canal
        fill(m,0,7,H-1,8,T.ROAD); // quay
        fill(m,0,9,H-1,W-1,T.COBBLE);
        houseEra(m, 1,9,4,5, 1); houseEra(m, 7,9,4,5, 1);
        for(let r=2;r<H-2;r+=3) set(m,r,8,T.FLOWER);
        set(m,5,6,T.BRIDGE); set(m,6,6,T.BRIDGE);
        grid[0][0]=makeScreen(m,{right:{pos:7},down:{pos:10}},'1660 · Noord Canal',{r:7,c:12}); }

      // [0,1] Market street — Kalverstraat style
      { const m=blank(T.COBBLE);
        houseEra(m, 0,1,4,6, 1); houseEra(m, 0,13,4,6, 1);
        houseEra(m, 8,1,4,6, 1); houseEra(m, 8,13,4,6, 1);
        fill(m,3,5,9,14,T.COBBLE); // market square
        for(let r=4;r<9;r+=2) set(m,r,9,T.FLOWER); // market stalls
        grid[0][1]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'1660 · Market Street',{r:7,c:9}); }

      // [0,2] Church square — Protestant church
      { const m=blank(T.COBBLE);
        fill(m,0,3,6,15,T.BRICK); // church
        fill(m,0,3,0,15,T.HOUSE_ROOF);
        // Interior: altar at the front, pew rows down the nave
        for(let c=8;c<=10;c++) set(m,1,c,T.CROP_READY); // glowing altar
        for(let c=4;c<=12;c++){ set(m,2,c,T.ROCK); set(m,4,c,T.ROCK); } // pew rows
        set(m,6,8,T.DOOR); set(m,6,9,T.DOOR);
        fill(m,7,0,H-1,W-1,T.COBBLE);
        for(let c=3;c<W-3;c+=3) set(m,8,c,T.FLOWER);
        grid[0][2]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'1660 · Nieuwe Kerk Square',{r:10,c:9}); }

      // [0,3] Amsterdam city gate — toll house
      { const m=blank(T.COBBLE);
        fill(m,0,0,H-1,W-1,T.COBBLE);
        fill(m,0,7,H-1,12,T.ROAD); // main road through gate
        fill(m,3,7,8,12,T.BRICK); // gate towers
        set(m,5,9,T.DOOR); set(m,5,10,T.DOOR); // gate arch
        houseEra(m, 9,1,4,5, 1); houseEra(m, 9,13,4,5, 1);
        grid[0][3]=makeScreen(m,{left:{pos:7},down:{pos:10}},'1660 · City Gate',{r:10,c:9}); }

      // [1,0] HARBOUR — quay with ships (PORTAL here in warehouse)
      { const m=blank(T.DEEP_WATER); border(m,T.PLANK);
        fill(m,6,0,H-1,W-1,T.PLANK); // dock
        fill(m,6,0,6,W-1,T.BRIDGE);
        fill(m,0,0,5,W-1,T.DEEP_WATER); // harbour water
        houseEra(m, 7,1,7,8, 1); // warehouse
        houseEra(m, 7,10,7,8, 1);
        set(m,11,4,T.DOOR);
        for(let c=6;c<=9;c++) set(m,9,c,T.ROCK); // barrels stacked on quay
        for(let c=14;c<=16;c++) set(m,8,c,T.ROCK); // cargo crates awaiting loading
        fill(m,6,0,6,W-1,T.BRIDGE); // gangplank run along the dock edge
        // PORTAL inside warehouse
        set(m,8,3,T.PORTAL); set(m,8,4,T.PORTAL);
        clearZone(m,10,12,2);
        grid[1][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'1660 · Amsterdam Harbour — VOC Warehouse',{r:10,c:12}); }

      // [1,1] Main canal (Herengracht style)
      { const m=blank(T.COBBLE);
        fill(m,5,0,8,W-1,T.WATER); // main canal
        m[5][9]=T.BRIDGE; m[6][9]=T.BRIDGE; m[7][9]=T.BRIDGE;
        m[5][10]=T.BRIDGE; m[6][10]=T.BRIDGE; m[7][10]=T.BRIDGE;
        // Row houses each side
        fill(m,0,0,4,W-1,T.HOUSE_WALL); fill(m,0,0,0,W-1,T.HOUSE_ROOF);
        for(let c=2;c<W-2;c+=4) set(m,4,c,T.DOOR);
        fill(m,9,0,H-1,W-1,T.HOUSE_WALL); fill(m,H-1,0,H-1,W-1,T.HOUSE_ROOF);
        for(let c=2;c<W-2;c+=4) set(m,9,c,T.DOOR);
        // Flower boxes along the house frontages
        for(let r=0;r<5;r+=2){ set(m,r,0,T.FLOWER); set(m,r,1,T.FLOWER); }
        for(let r=9;r<H;r+=2){ set(m,r,0,T.FLOWER); set(m,r,1,T.FLOWER); }
        // Canal-side lamp posts at the corners
        set(m,5,0,T.ROCK); set(m,5,W-1,T.ROCK); set(m,8,0,T.ROCK); set(m,8,W-1,T.ROCK);
        grid[1][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1660 · Herengracht',{r:5,c:9}); }

      // [1,2] Tulip market + merchant row
      { const m=blank(T.COBBLE);
        fill(m,2,2,9,17,T.COBBLE);
        fill(m,3,3,5,6,T.FLOWER); fill(m,3,8,5,11,T.FLOWER); fill(m,3,13,5,16,T.FLOWER);
        // Alternating flower/stall-frame rows make the market stalls read clearly
        for(let r=3;r<=5;r++) for(let c=3;c<=16;c++) if((r+c)%2===0) set(m,r,c,T.ROCK);
        houseEra(m, 0,1,4,4, 1); houseEra(m, 0,14,4,5, 1); houseEra(m, 9,1,4,5, 1); houseEra(m, 9,13,4,5, 1);
        set(m,6,9,T.ROCK); // Coster statue
        grid[1][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1660 · Bloemenmarkt',{r:7,c:9}); }

      // [1,3] Jewish quarter / Jodenbuurt
      { const m=blank(T.COBBLE);
        fill(m,0,3,7,15,T.BRICK); fill(m,0,3,0,15,T.HOUSE_ROOF);
        set(m,7,8,T.DOOR); set(m,7,9,T.DOOR);
        fill(m,8,1,H-1,W-1,T.COBBLE);
        houseEra(m, 9,1,4,4, 1); houseEra(m, 9,14,4,4, 1);
        grid[1][3]=makeScreen(m,{left:{pos:7},up:{pos:10},down:{pos:10}},'1660 · Jodenbuurt',{r:10,c:9}); }

      // [2,0] Fishermen's wharf + fishing
      { const m=blank(T.WATER); border(m,T.PLANK);
        fill(m,7,0,H-1,W-1,T.PLANK);
        fill(m,0,0,6,W-1,T.WATER);
        set(m,6,5,T.BRIDGE); set(m,6,6,T.BRIDGE);
        // Fishing nets drying at the water's edge
        set(m,6,9,T.BRIDGE); set(m,6,10,T.BRIDGE); set(m,6,14,T.BRIDGE); set(m,6,15,T.BRIDGE);
        houseEra(m, 8,2,5,6, 1); // fish market
        set(m,11,4,T.DOOR);
        // Barrels of salted catch and glowing harbour lanterns
        set(m,8,10,T.ROCK); set(m,8,11,T.ROCK); set(m,10,14,T.ROCK); set(m,10,15,T.ROCK);
        set(m,7,9,T.CROP_READY); set(m,7,16,T.CROP_READY); set(m,11,12,T.CROP_READY);
        grid[2][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'1660 · Fishermen\'s Wharf',{r:10,c:12}); }

      // [2,1] Canal neighbourhood — Johannes NPC area
      { const m=blank(T.COBBLE);
        fill(m,3,0,6,W-1,T.WATER); // cross canal
        m[4][9]=T.BRIDGE; m[5][9]=T.BRIDGE;
        fill(m,0,0,2,W-1,T.HOUSE_WALL); fill(m,7,0,H-1,W-1,T.HOUSE_WALL);
        for(let c=2;c<W-2;c+=4){ set(m,2,c,T.DOOR); set(m,7,c,T.DOOR); }
        grid[2][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1660 · Canal Neighbourhood',{r:5,c:9}); }

      // [2,2] Craftsmen's district
      { const m=blank(T.COBBLE);
        houseEra(m, 1,1,5,5, 1); houseEra(m, 1,13,5,5, 1);
        fill(m,7,3,11,15,T.COBBLE);
        for(let c=4;c<=14;c+=3) set(m,9,c,T.ROCK); // workshop benches
        // Blacksmith's forge — glowing coals with an anvil beside it
        set(m,8,6,T.CROP_READY); set(m,8,7,T.CROP_READY); set(m,9,6,T.CROP_READY);
        set(m,8,8,T.ROCK); // anvil
        fill(m,2,7,5,11,T.FLOWER); // craftsman garden
        grid[2][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1660 · Craftsmen\'s District',{r:9,c:9}); }

      // [2,3] City wall walk
      { const m=blank(T.COBBLE); border(m,T.BRICK);
        fill(m,0,0,3,W-1,T.BRICK); // city wall
        fill(m,4,0,H-1,W-1,T.COBBLE);
        fill(m,4,8,7,11,T.GRASS); // garden below wall
        fill(m,5,9,6,10,T.FLOWER);
        grid[2][3]=makeScreen(m,{left:{pos:7},up:{pos:10},down:{pos:10}},'1660 · City Wall Walk',{r:8,c:9}); }

      // [3,0] City outskirts south
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,1,1,H-3,5,T.WATER); // canal south end
        m[6][5]=T.BRIDGE; m[7][5]=T.BRIDGE;
        fill(m,1,6,H-3,W-3,T.FLOWER);
        grid[3][0]=makeScreen(m,{right:{pos:7},up:{pos:10}},'1660 · South Canal End',{r:9,c:12}); }

      // [3,1] Windmill field
      { const m=blank(T.FLOWER);
        for(let r=1;r<H-1;r+=2) for(let c=1;c<W-1;c+=4) set(m,r,c,T.TREE);
        // Windmills (WALL tiles as sails)
        fill(m,2,5,7,7,T.WALL); fill(m,2,12,7,14,T.WALL);
        fill(m,3,6,6,6,T.HOUSE_WALL); fill(m,3,13,6,13,T.HOUSE_WALL);
        grid[3][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10}},'1660 · Windmill Field',{r:9,c:9}); }

      // [3,2] City farm / polder
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,1,1,H-3,W-3,T.WHEAT);
        fill(m,4,6,9,13,T.GRASS);
        houseEra(m, 5,7,5,5, 1);
        grid[3][2]=makeScreen(m,{left:{pos:7},up:{pos:10}},'1660 · Polder Farm',{r:9,c:9}); }

      break; }

    // ═══════════════════════════════════════════════════
    // ERA 2 · 1799 · NAPOLEONIC UDEN
    // French occupation. Portal: hidden in church crypt
    // under the Uden church [2,1] — dangerous to reach
    // ═══════════════════════════════════════════════════
    case 2: {
      // [0,0] Northern woods — refugees hiding
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,1,1,H-3,W-3,T.TREE); fill(m,4,5,9,13,T.GRASS);
        grid[0][0]=makeScreen(m,{right:{pos:7},down:{pos:10}},'1799 · Northern Woods',{r:7,c:10}); }

      // [0,1] French encampment — enemy-heavy
      { const m=blank(T.DIRT); border(m,T.ROCK);
        fill(m,1,1,H-3,W-3,T.DIRT);
        houseEra(m, 2,3,5,6, 2); houseEra(m, 2,11,5,6, 2); // military tents
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        fill(m,8,4,10,14,T.COBBLE); // parade ground
        // Campfire at centre — glowing embers ring
        set(m,10,9,T.CROP_READY); set(m,10,10,T.CROP_READY);
        set(m,9,9,T.CROP_READY); set(m,11,9,T.ROCK); set(m,11,10,T.ROCK); // fire ring stones
        // Field cannons flanking the parade ground
        set(m,9,5,T.ROCK); set(m,9,13,T.ROCK);
        // Stacked supply crates along the tent lines
        set(m,7,4,T.ROCK); set(m,7,5,T.ROCK); set(m,7,14,T.ROCK); set(m,7,13,T.ROCK);
        set(m,4,7,T.ROCK); set(m,4,12,T.ROCK); // powder kegs by tents
        grid[0][1]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'1799 · French Encampment',{r:10,c:9}); }

      // [0,2] Road north — conscription posters on walls
      { const m=blank(T.DIRT); border(m,T.HOUSE_WALL);
        fill(m,1,1,H-3,W-3,T.DIRT);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        fill(m,3,1,5,7,T.COBBLE); fill(m,3,12,5,W-2,T.COBBLE);
        // "notices" on walls (CROP_READY as glow)
        set(m,4,0,T.CROP_READY); set(m,7,0,T.CROP_READY); set(m,4,W-1,T.CROP_READY);
        grid[0][2]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'1799 · Conscription Road',{r:7,c:9}); }

      // [0,3] Farmhouse in flames — burned by retreating troops
      { const m=blank(T.DIRT); border(m,T.ROCK);
        fill(m,2,3,8,14,T.COBBLE);
        fill(m,2,5,6,11,T.BRICK); // ruined house
        // Wider flickering fire glow across the ruin
        fill(m,3,6,5,10,T.CROP_READY); // core blaze
        set(m,2,7,T.CROP_READY); set(m,2,9,T.CROP_READY); // flames licking the roofline
        set(m,6,6,T.CROP_READY); set(m,6,10,T.CROP_READY); // embers at the base
        set(m,4,4,T.CROP_READY); set(m,4,12,T.CROP_READY); // fire spread to the sides
        // Charred scorched earth ringing the ruins
        fill(m,7,4,7,12,T.DIRT); fill(m,8,5,8,11,T.DIRT);
        set(m,1,6,T.DIRT); set(m,1,8,T.DIRT); set(m,1,10,T.DIRT); // ash drift above
        set(m,5,4,T.ROCK); set(m,5,12,T.ROCK); // collapsed masonry rubble
        grid[0][3]=makeScreen(m,{left:{pos:7},down:{pos:10}},'1799 · Burned Farmstead',{r:10,c:9}); }

      // [1,0] Uden market — civilians
      { const m=blank(T.COBBLE); border(m,T.HOUSE_WALL);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        houseEra(m, 1,2,5,5, 2); houseEra(m, 1,13,5,5, 2);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        // Market stalls — awnings (HOUSE_WALL) with goods crates (ROCK) beneath
        fill(m,6,4,6,6,T.HOUSE_WALL); set(m,7,4,T.ROCK); set(m,7,6,T.ROCK); set(m,8,5,T.ROCK); // west stall
        fill(m,6,13,6,15,T.HOUSE_WALL); set(m,7,13,T.ROCK); set(m,7,15,T.ROCK); set(m,8,14,T.ROCK); // east stall
        fill(m,10,4,10,7,T.HOUSE_WALL); set(m,11,5,T.ROCK); set(m,11,6,T.ROCK); // produce stall row
        fill(m,10,12,10,15,T.HOUSE_WALL); set(m,11,13,T.ROCK); set(m,11,14,T.ROCK); // cloth stall row
        set(m,4,7,T.ROCK); set(m,4,12,T.ROCK); // barrels flanking the square
        grid[1][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'1799 · Uden Market',{r:7,c:12}); }

      // [1,1] Village centre — Petrus NPC area (clue given here)
      { const m=blank(T.COBBLE);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        houseEra(m, 1,2,4,4, 2); houseEra(m, 1,14,4,5, 2);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        set(m,7,9,T.ROCK); // town well
        grid[1][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1799 · Uden Village Centre',{r:7,c:12}); }

      // [1,2] Farmstead — civilian homes
      { const m=blank(T.GRASS);
        fill(m,1,1,H-3,W-3,T.WHEAT);
        houseEra(m, 2,2,5,5, 2); houseEra(m, 2,13,5,5, 2);
        fill(m,7,5,10,13,T.GRASS);
        grid[1][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1799 · Farm District',{r:7,c:9}); }

      // [1,3] Mill and stream
      { const m=blank(T.GRASS);
        for(let c=1;c<W-1;c++){ m[6][c]=T.WATER; m[7][c]=T.WATER; }
        m[6][9]=T.BRIDGE; m[6][10]=T.BRIDGE; m[7][9]=T.BRIDGE; m[7][10]=T.BRIDGE;
        fill(m,1,1,5,8,T.GRASS); fill(m,1,10,5,W-2,T.GRASS);
        houseEra(m, 1,11,5,6, 2); // mill
        grid[1][3]=makeScreen(m,{left:{pos:7},up:{pos:10},down:{pos:10}},'1799 · Mill Stream',{r:5,c:9}); }

      // [2,0] French patrol road
      { const m=blank(T.DIRT); border(m,T.ROCK);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        fill(m,1,1,H-3,8,T.GRASS); fill(m,1,11,H-3,W-3,T.WHEAT);
        grid[2][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'1799 · Patrol Road',{r:7,c:12}); }

      // [2,1] UDEN CHURCH + CRYPT PORTAL
      { const m=blank(T.COBBLE);
        fill(m,1,1,H-3,W-3,T.COBBLE); // cold stone crypt floor throughout
        fill(m,1,4,7,14,T.BRICK); // church
        fill(m,0,4,0,14,T.HOUSE_ROOF);
        // Crypt pillars flanking the nave (paired columns down each side)
        set(m,2,5,T.ROCK); set(m,2,13,T.ROCK);
        set(m,4,5,T.ROCK); set(m,4,13,T.ROCK);
        set(m,6,5,T.ROCK); set(m,6,13,T.ROCK);
        // Altar with candle glow at the head of the nave
        set(m,1,9,T.CROP_READY); set(m,1,10,T.CROP_READY); // candlelit altar
        set(m,2,8,T.CROP_READY); set(m,2,11,T.CROP_READY); // flanking candles
        set(m,7,8,T.DOOR); set(m,7,9,T.DOOR);
        // Crypt entrance — side door at east
        set(m,4,14,T.DOOR);
        // PORTAL in the crypt (inside church east side)
        set(m,3,15,T.PORTAL); set(m,4,15,T.PORTAL);
        set(m,3,14,T.CROP_READY); set(m,5,15,T.CROP_READY); // portal energy glow
        fill(m,8,1,H-3,W-3,T.COBBLE); // lower crypt hall — cold stone
        set(m,9,5,T.ROCK); set(m,9,14,T.ROCK); // crypt tomb slabs
        clearZone(m,10,9,2);
        grid[2][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1799 · Uden Church — Crypt Below',{r:10,c:9}); }

      // [2,2] PETRUS NPC location — hiding in cellar here
      { const m=blank(T.COBBLE);
        houseEra(m, 1,3,6,5, 2); houseEra(m, 1,11,6,7, 2);
        fill(m,8,1,H-3,W-3,T.GRASS);
        fill(m,9,4,11,8,T.COBBLE); // hidden path
        // Barricaded approach — rubble blocking the obvious way
        set(m,9,3,T.ROCK); set(m,10,3,T.ROCK); set(m,11,3,T.ROCK); // west barricade
        set(m,9,9,T.ROCK); set(m,10,9,T.ROCK); // east barricade closing off the nook
        set(m,8,5,T.ROCK); set(m,8,7,T.ROCK); // stacked crates screening the entrance
        set(m,10,4,T.DOOR); // cellar entrance (kept)
        set(m,11,6,T.DOOR); // second hidden door deeper in
        // Lantern glow marking the safe hiding spot
        set(m,10,7,T.CROP_READY); set(m,11,7,T.CROP_READY);
        grid[2][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1799 · Petrus\'s Hiding Place',{r:7,c:12}); }

      // [2,3] Bridge over river — contested crossing
      { const m=blank(T.GRASS);
        for(let c=1;c<W-1;c++){ m[5][c]=T.WATER; m[6][c]=T.WATER; m[7][c]=T.WATER; }
        m[5][9]=T.BRIDGE; m[6][9]=T.BRIDGE; m[7][9]=T.BRIDGE;
        m[5][10]=T.BRIDGE; m[6][10]=T.BRIDGE; m[7][10]=T.BRIDGE;
        grid[2][3]=makeScreen(m,{left:{pos:7},up:{pos:10},down:{pos:10}},'1799 · River Bridge',{r:4,c:9}); }

      // [3,0] Deserter hideout — inn
      { const m=blank(T.GRASS); border(m,T.TREE);
        houseEra(m, 2,3,7,6, 2); // inn
        set(m,8,6,T.DOOR);
        fill(m,9,1,H-3,W-3,T.GRASS);
        // Inn interior — taproom floor with tables and a bar counter
        fill(m,4,3,7,15,T.COBBLE); // common-room floor
        set(m,4,4,T.ROCK); set(m,4,5,T.ROCK); set(m,4,6,T.ROCK); // table, north-west
        set(m,4,12,T.ROCK); set(m,4,13,T.ROCK); set(m,4,14,T.ROCK); // table, north-east
        set(m,7,4,T.ROCK); set(m,7,5,T.ROCK); set(m,7,6,T.ROCK); // table, south-west
        set(m,7,12,T.ROCK); set(m,7,13,T.ROCK); set(m,7,14,T.ROCK); // table, south-east
        fill(m,3,2,7,2,T.WALL); // bar counter along west wall
        set(m,3,3,T.CROP_READY); // hearth glow behind the bar
        grid[3][0]=makeScreen(m,{right:{pos:7},up:{pos:10}},'1799 · Deserter\'s Inn',{r:10,c:12}); }

      // [3,1] South road — open landscape
      { const m=blank(T.WHEAT); border(m,T.TREE);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        grid[3][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10}},'1799 · South Farmland',{r:7,c:9}); }

      // [3,2] Fortified manor — French HQ
      { const m=blank(T.COBBLE); border(m,T.WALL);
        fill(m,1,1,H-3,W-3,T.COBBLE); // grand stone-flagged floor
        fill(m,1,4,6,14,T.HOUSE_WALL); fill(m,0,4,0,14,T.HOUSE_ROOF);
        // Wood-panelled walls lining the great hall
        fill(m,2,3,6,3,T.HOUSE_WALL); fill(m,2,15,6,15,T.HOUSE_WALL);
        // Officer's desk, centred before the far wall
        set(m,3,9,T.ROCK); set(m,3,10,T.ROCK); set(m,4,9,T.ROCK); set(m,4,10,T.ROCK);
        set(m,3,8,T.CROP_READY); set(m,3,11,T.CROP_READY); // candelabra flanking the desk
        set(m,8,5,T.ROCK); set(m,8,14,T.ROCK); // flanking chests / strongboxes
        fill(m,9,7,10,12,T.COBBLE); // audience floor before the entrance
        set(m,6,9,T.DOOR);
        grid[3][2]=makeScreen(m,{left:{pos:7},up:{pos:10}},'1799 · French Manor HQ',{r:10,c:9}); }

      break; }

    // ═══════════════════════════════════════════════════
    // ERA 3 · 1872 · INDUSTRIAL NOORD-BRABANT
    // Factory, railway, farm. Portal: abandoned mine shaft
    // at [3,2] — discovered after helping the strikers
    // ═══════════════════════════════════════════════════
    case 3: {
      // [0,0] Dense woodland + charcoal burners
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,1,1,H-3,W-3,T.TREE); fill(m,4,5,9,14,T.GRASS);
        set(m,6,9,T.ROCK); // charcoal mound
        grid[0][0]=makeScreen(m,{right:{pos:7},down:{pos:10}},'1872 · Woodland',{r:7,c:12}); }

      // [0,1] Railway embankment — tracks running east
      { const m=blank(T.DIRT); border(m,T.ROCK);
        fill(m,1,1,H-3,W-3,T.DIRT);
        fill(m,5,0,5,W-1,T.STEEL); fill(m,6,0,6,W-1,T.STEEL); // tracks
        fill(m,1,1,4,W-3,T.GRASS); fill(m,7,1,H-3,W-3,T.GRASS);
        grid[0][1]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'1872 · Railway Embankment',{r:3,c:9}); }

      // [0,2] Railway station — Veghel/Boekel area
      { const m=blank(T.COBBLE); border(m,T.BRICK);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        houseEra(m, 1,4,5,10, 3); // station building at rear
        set(m,5,8,T.DOOR); set(m,5,9,T.DOOR);
        // Steel railway tracks running east-west (two 2-tile rails)
        for(let c=1;c<W-1;c++){ m[8][c]=T.ROAD; m[9][c]=T.ROAD; m[11][c]=T.ROAD; m[12][c]=T.ROAD; }
        // Sleepers / steel rail edges
        fill(m,8,1,8,W-2,T.STEEL); fill(m,12,1,12,W-2,T.STEEL);
        // COBBLE platform between the two track pairs
        fill(m,10,1,10,W-2,T.COBBLE);
        // Waiting benches (ROCK) along the platform
        set(m,10,4,T.ROCK); set(m,10,7,T.ROCK); set(m,10,11,T.ROCK); set(m,10,14,T.ROCK);
        // Station lamps / posts framing the platform
        set(m,10,2,T.WALL); set(m,10,W-3,T.WALL);
        clearZone(m,7,9,1);
        grid[0][2]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'1872 · Railway Station',{r:7,c:9}); }

      // [0,3] Factory district — smoky, industrial interior
      { const m=blank(T.DIRT); border(m,T.BRICK);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        // Chimneys along the top wall
        set(m,0,3,T.WALL); set(m,0,5,T.WALL); set(m,0,7,T.WALL); set(m,0,13,T.WALL); set(m,0,15,T.WALL);
        // Rows of STEEL machinery (looms) with CROP_READY steam glow between them
        fill(m,2,2,2,W-3,T.STEEL); fill(m,3,2,3,W-3,T.CROP_READY); // steam over loom row 1
        fill(m,5,2,5,W-3,T.STEEL); fill(m,6,2,6,W-3,T.CROP_READY); // steam over loom row 2
        fill(m,8,2,8,W-3,T.STEEL);
        // Conveyor belt (ROAD tiles) running down the centre aisle
        for(let r=2;r<H-2;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        set(m,H-2,9,T.DOOR); set(m,H-2,10,T.DOOR); // loading door
        clearZone(m,10,9,1);
        grid[0][3]=makeScreen(m,{left:{pos:7},down:{pos:10}},'1872 · Textile Factory',{r:10,c:9}); }

      // [1,0] Village church + square
      { const m=blank(T.COBBLE);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        // Church shell
        fill(m,1,3,7,12,T.BRICK); fill(m,0,3,0,12,T.HOUSE_ROOF);
        // Nave interior floor
        fill(m,2,5,6,10,T.COBBLE);
        // Altar at the front (ROCK) flanked by CROP_READY candles
        fill(m,2,6,2,9,T.ROCK); set(m,2,5,T.CROP_READY); set(m,2,10,T.CROP_READY);
        // Rows of pews (ROCK) down the nave with a central aisle
        fill(m,4,5,4,7,T.ROCK); fill(m,4,9,4,10,T.ROCK);
        fill(m,5,5,5,7,T.ROCK); fill(m,5,9,5,10,T.ROCK);
        // Doors out to the courtyard
        set(m,7,7,T.DOOR); set(m,7,8,T.DOOR);
        // COBBLE church courtyard / square
        fill(m,8,1,H-3,W-3,T.COBBLE);
        grid[1][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'1872 · Boekel Church',{r:10,c:12}); }

      // [1,1] VILLAGE CENTRE — Baker clue NPC here
      { const m=blank(T.COBBLE);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        houseEra(m, 1,2,4,4, 3); houseEra(m, 1,14,4,5, 3);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        set(m,6,9,T.ROCK); // village well
        fill(m,9,3,H-3,6,T.FLOWER);
        grid[1][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1872 · Boekel Village Centre',{r:7,c:12}); }

      // [1,2] Farmland + van Duijnhoven house — OUR ANCESTOR'S HOME
      { const m=blank(T.GRASS); border(m,T.TREE);
        // Crop field on the west side — alternating WHEAT / CORN rows
        for(let r=1;r<H-1;r++){ fill(m,r,1,r,6, (r%2===0)?T.WHEAT:T.CORN); }
        // Farmyard (grass) around the house
        fill(m,1,7,H-3,W-3,T.GRASS);
        // The farmhouse itself
        houseEra(m, 2,11,5,6, 3);
        set(m,6,13,T.DOOR); // farmhouse door
        // Barn with its big door, tucked to the north-east
        fill(m,1,7,3,9,T.HOUSE_WALL); fill(m,0,7,0,9,T.HOUSE_ROOF);
        set(m,3,8,T.DOOR); // barn door
        // Flower garden rows in front of the house
        fill(m,9,11,9,W-3,T.FLOWER); fill(m,11,11,11,W-3,T.FLOWER);
        // The well
        set(m,8,9,T.ROCK);
        // Ripe crops ready near the field edge
        fill(m,4,3,4,5,T.CROP_READY); fill(m,10,3,10,5,T.CROP_READY);
        clearZone(m,7,9,1); // keep the arrival point walkable
        grid[1][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1872 · Van Duijnhoven Farm',{r:7,c:9}); }

      // [1,3] East farms
      { const m=blank(T.WHEAT); border(m,T.TREE);
        houseEra(m, 2,2,4,5, 3); houseEra(m, 2,12,4,6, 3);
        fill(m,7,1,H-3,W-3,T.GRASS);
        grid[1][3]=makeScreen(m,{left:{pos:7},up:{pos:10},down:{pos:10}},'1872 · East Farms',{r:7,c:10}); }

      // [2,0] Canal + factory drainage ditch (fishing)
      { const m=blank(T.GRASS);
        // The canal — two rows of water across
        for(let c=1;c<W-1;c++){ m[5][c]=T.WATER; m[6][c]=T.WATER; }
        // Bridge crossing
        m[5][9]=T.BRIDGE; m[6][9]=T.BRIDGE; m[5][10]=T.BRIDGE; m[6][10]=T.BRIDGE;
        // ROCK lock gates pinching the canal on either side of the bridge
        set(m,5,8,T.ROCK); set(m,6,8,T.ROCK); set(m,5,11,T.ROCK); set(m,6,11,T.ROCK);
        // Factory drainage outfall
        fill(m,7,10,H-3,W-3,T.WATER);
        // COBBLE towpaths running alongside the canal
        fill(m,4,1,4,W-2,T.COBBLE); fill(m,7,1,7,8,T.COBBLE);
        // STEEL pipes along the top and bottom walls feeding the canal
        fill(m,1,1,1,W-2,T.STEEL); fill(m,H-2,1,H-2,8,T.STEEL);
        set(m,3,3,T.STEEL); set(m,3,3,T.STEEL); // pipe elbow down to canal
        fill(m,2,3,3,3,T.STEEL); // vertical inlet pipe
        fill(m,1,1,3,2,T.GRASS); // tidy corner so it stays walkable
        fill(m,8,1,H-3,7,T.GRASS);
        clearZone(m,3,9,1);
        grid[2][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'1872 · Factory Canal',{r:3,c:9}); }

      // [2,1] MARIANUS'S SOUTH FIELDS — key NPC here
      { const m=blank(T.WHEAT); border(m,T.TREE);
        // Alternating WHEAT / GRASS field strips (ploughed rows)
        for(let r=1;r<H-1;r++){ fill(m,r,1,r,8, (r%2===0)?T.GRASS:T.WHEAT); }
        fill(m,1,11,H-3,W-3,T.GRASS);
        // Farmhouse in the far corner
        houseEra(m, 1,13,3,4, 3);
        set(m,3,14,T.DOOR);
        // Irrigation WATER channel feeding the fields, crossed by a bridge
        fill(m,7,11,11,16,T.WATER); // ditch
        for(let r=1;r<H-1;r++) m[r][10]=T.WATER; // irrigation channel down the middle
        m[7][10]=T.BRIDGE; m[9][9]=T.BRIDGE; m[10][9]=T.BRIDGE;
        // Central farm track (ROAD) alongside the channel
        for(let r=1;r<H-1;r++) m[r][9]=T.ROAD;
        // Ripe crops
        fill(m,4,3,4,7,T.CROP_READY); fill(m,8,3,8,7,T.CROP_READY);
        clearZone(m,7,9,1);
        grid[2][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1872 · Marianus\'s Fields',{r:7,c:9}); }

      // [2,2] Workers' cottages — strike organising area
      { const m=blank(T.COBBLE);
        houseEra(m, 1,2,4,5, 3); houseEra(m, 1,12,4,6, 3); houseEra(m, 7,2,4,5, 3); houseEra(m, 7,12,4,6, 3);
        fill(m,5,6,7,13,T.COBBLE); // meeting area
        grid[2][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1872 · Workers\' Cottages',{r:6,c:9}); }

      // [2,3] Potato field + fishing ditch
      { const m=blank(T.WHEAT); border(m,T.TREE);
        fill(m,8,1,H-3,W-3,T.WATER);
        m[8][9]=T.BRIDGE; m[8][10]=T.BRIDGE;
        fill(m,4,3,7,6,T.CROP_READY);
        grid[2][3]=makeScreen(m,{left:{pos:7},up:{pos:10},down:{pos:10}},'1872 · Potato Fields',{r:5,c:9}); }

      // [3,0] Village inn — innkeeper
      { const m=blank(T.GRASS); border(m,T.TREE);
        houseEra(m, 2,3,7,6, 3); set(m,8,6,T.DOOR);
        fill(m,9,1,H-3,W-3,T.FLOWER);
        grid[3][0]=makeScreen(m,{right:{pos:7},up:{pos:10}},'1872 · Village Inn',{r:10,c:12}); }

      // [3,1] South road to Veghel railway
      { const m=blank(T.DIRT); border(m,T.TREE);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        fill(m,1,1,H-3,8,T.WHEAT); fill(m,1,11,H-3,W-3,T.WHEAT);
        grid[3][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10}},'1872 · Road to Veghel',{r:7,c:9}); }

      // [3,2] ABANDONED MINE + PORTAL — hidden by rock fall
      { const m=blank(T.DIRT); border(m,T.ROCK);
        fill(m,1,1,H-3,W-3,T.DIRT);
        // Massive rock fall / collapsed mine face framing the entrance
        fill(m,1,2,7,16,T.ROCK);
        // Hewn-out chamber inside the mine
        fill(m,2,6,7,12,T.COBBLE);
        // Shored mine timbers (WALL) framing the mouth of the shaft
        set(m,2,7,T.WALL); set(m,2,11,T.WALL); set(m,6,7,T.WALL); set(m,6,11,T.WALL);
        // Lanterns (CROP_READY glow) lining the approach — dramatic light
        set(m,3,7,T.CROP_READY); set(m,3,11,T.CROP_READY);
        set(m,5,7,T.CROP_READY); set(m,5,11,T.CROP_READY);
        // The PORTAL — the glowing shaft at the heart of the chamber
        set(m,3,9,T.PORTAL); set(m,3,10,T.PORTAL);
        set(m,4,9,T.PORTAL); set(m,4,10,T.PORTAL);
        set(m,5,9,T.PORTAL); set(m,5,10,T.PORTAL);
        // Mine-cart STEEL rail leading dramatically up to the shaft
        for(let r=H-3;r>6;r--){ m[r][9]=T.STEEL; m[r][10]=T.STEEL; }
        // Abandoned mine carts (ROCK) beside the rail
        set(m,10,7,T.ROCK); set(m,11,12,T.ROCK);
        clearZone(m,H-3,9,2);
        grid[3][2]=makeScreen(m,{left:{pos:7},up:{pos:10}},'1872 · Abandoned Mine Shaft',{r:H-3,c:9}); }

      break; }

    // ═══════════════════════════════════════════════════
    // ERA 4 · 1950 · RMS QUEEN ELIZABETH — ATLANTIC OCEAN
    // All screens are the ship. Portal: captain's bridge [0,3]
    // ═══════════════════════════════════════════════════
    case 4: {
      // [0,0] Bow deck — lookout
      { const m=blank(T.DEEP_WATER); border(m,T.PLANK);
        fill(m,4,0,H-1,W-1,T.PLANK); // deck
        fill(m,0,0,3,W-1,T.DEEP_WATER); // ocean
        fill(m,4,5,6,13,T.STEEL); // railing
        set(m,7,9,T.ROCK); // anchor windlass
        grid[0][0]=makeScreen(m,{right:{pos:7},down:{pos:10}},'1950 · RMS Queen Elizabeth — Bow',{r:7,c:12}); }

      // [0,1] First class deck — upper promenade
      { const m=blank(T.PLANK); border(m,T.STEEL);
        fill(m,1,1,H-3,W-3,T.PLANK);
        fill(m,0,2,2,W-3,T.DEEP_WATER); // ocean view
        houseEra(m, 4,3,4,5, 4); houseEra(m, 4,11,4,6, 4); // deck chairs/cabin
        fill(m,3,3,3,15,T.STEEL); // upper railing
        grid[0][1]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'1950 · First Class Promenade',{r:7,c:9}); }

      // [0,2] Lifeboat deck — emergency equipment
      { const m=blank(T.PLANK); border(m,T.STEEL);
        fill(m,1,1,H-3,W-3,T.PLANK);
        // Lifeboats (ROCK tiles as hulls)
        for(let c=3;c<W-3;c+=5){ set(m,2,c,T.ROCK); set(m,2,c+1,T.ROCK); set(m,2,c+2,T.ROCK); }
        fill(m,0,0,1,W-1,T.DEEP_WATER);
        grid[0][2]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'1950 · Lifeboat Deck',{r:7,c:9}); }

      // [0,3] CAPTAIN'S BRIDGE + PORTAL — top of ship
      { const m=blank(T.STEEL); border(m,T.WALL);
        fill(m,1,1,H-3,W-3,T.STEEL);
        fill(m,1,3,6,15,T.HOUSE_WALL); // bridge room
        fill(m,7,2,H-3,W-3,T.COBBLE); // bridge deck floor
        set(m,6,8,T.DOOR); set(m,6,9,T.DOOR);
        fill(m,0,0,0,W-1,T.DEEP_WATER);
        // Porthole windows — evenly spaced across the forward wall
        for(let c=4;c<=16;c+=2) set(m,1,c,T.DEEP_WATER);
        // Navigation instrument panels on side walls
        set(m,2,3,T.STEEL); set(m,3,3,T.STEEL); set(m,4,3,T.STEEL);
        set(m,2,15,T.STEEL); set(m,3,15,T.STEEL); set(m,4,15,T.STEEL);
        // Binnacle / wheel instruments flanking the helm
        set(m,5,6,T.ROCK); set(m,5,12,T.ROCK);
        // Helm wheel
        set(m,4,9,T.ROCK); set(m,4,10,T.ROCK);
        // PORTAL — navigation chart glows with time energy
        set(m,3,9,T.PORTAL); set(m,3,10,T.PORTAL); set(m,3,11,T.PORTAL);
        clearZone(m,9,9,2);
        grid[0][3]=makeScreen(m,{left:{pos:7},down:{pos:10}},'1950 · Captain\'s Bridge',{r:9,c:9}); }

      // [1,0] Cabin B deck — second class cabins (Johan's cabin)
      { const m=blank(T.PLANK); border(m,T.STEEL);
        fill(m,1,1,H-3,W-3,T.PLANK);
        for(let r=1;r<H-3;r+=4){ houseEra(m, r,1,3,4, 4); houseEra(m, r,5,3,4, 4); houseEra(m, r,9,3,4, 4); houseEra(m, r,13,3,4, 4); }
        // Johan's cabin door marker
        set(m,5,5,T.CROP_READY); // cabin 214 glow
        grid[1][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'1950 · B Deck — Cabin 214',{r:7,c:12}); }

      // [1,1] Main deck — Johan NPC location
      { const m=blank(T.PLANK); border(m,T.STEEL);
        fill(m,1,1,H-3,W-3,T.PLANK);
        fill(m,4,2,8,16,T.COBBLE); // main deck open area
        houseEra(m, 1,7,3,5, 4); // deck house
        set(m,9,5,T.ROCK); // deck bench
        set(m,9,13,T.ROCK);
        grid[1][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1950 · Main Deck',{r:7,c:9}); }

      // [1,2] Stern deck — fishing possible (ocean edge)
      { const m=blank(T.PLANK); border(m,T.STEEL);
        fill(m,1,1,H-3,W-3,T.PLANK);
        fill(m,H-4,1,H-1,W-1,T.DEEP_WATER); // stern — ocean below
        fill(m,H-5,2,H-5,W-3,T.BRIDGE); // stern rail / fishing spot
        for(let c=3;c<W-3;c+=3) set(m,7,c,T.ROCK); // deck chairs
        grid[1][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1950 · Stern Deck',{r:7,c:9}); }

      // [1,3] Engine room access — deep below decks
      { const m=blank(T.STEEL); border(m,T.WALL);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        for(let r=2;r<H-3;r+=3) fill(m,r,2,r,W-3,T.STEEL); // pipe rows
        // Pressure gauges across a gauge bank
        for(let c=5;c<=13;c+=2) set(m,6,c,T.CROP_READY);
        // Boiler units on south wall
        fill(m,H-3,2,H-3,W-3,T.WALL);
        // ROCK equipment clusters
        set(m,3,4,T.ROCK); set(m,3,5,T.ROCK); set(m,3,13,T.ROCK); set(m,3,14,T.ROCK);
        set(m,8,4,T.ROCK); set(m,8,14,T.ROCK);
        grid[1][3]=makeScreen(m,{left:{pos:7},up:{pos:10},down:{pos:10}},'1950 · Engine Room',{r:8,c:12}); }

      // [2,0] Mess hall — steerage passengers
      { const m=blank(T.PLANK); border(m,T.STEEL);
        fill(m,1,1,H-3,W-3,T.PLANK);
        fill(m,3,3,9,15,T.COBBLE); // dining hall
        fill(m,2,3,2,15,T.WALL); // kitchen counter
        set(m,2,9,T.DOOR); // serving hatch
        set(m,1,11,T.CROP_READY); set(m,1,12,T.CROP_READY); // galley glow
        for(let r=4;r<=8;r+=2) for(let c=4;c<=13;c+=3) set(m,r,c,T.ROCK); // tables
        grid[2][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'1950 · Mess Hall',{r:7,c:12}); }

      // [2,1] ANNA NPC + families gathering area
      { const m=blank(T.PLANK); border(m,T.STEEL);
        fill(m,1,1,H-3,W-3,T.PLANK);
        fill(m,4,4,9,14,T.COBBLE);
        for(let c=5;c<14;c+=3) set(m,7,c,T.ROCK); // benches
        houseEra(m, 1,6,2,7, 4); // deck cabin
        grid[2][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1950 · Families Deck',{r:7,c:9}); }

      // [2,2] Infirmary + ship's nurse
      { const m=blank(T.PLANK); border(m,T.STEEL);
        fill(m,1,1,H-3,W-3,T.PLANK);
        fill(m,2,4,8,14,T.HOUSE_WALL); // infirmary
        fill(m,2,5,2,13,T.WALL); // medical supply shelf
        set(m,2,9,T.CROP_READY); // antiseptic glow
        set(m,3,6,T.ROCK); set(m,3,7,T.ROCK); // bed (left)
        set(m,3,12,T.ROCK); set(m,3,13,T.ROCK); // bed (right)
        set(m,8,9,T.DOOR);
        grid[2][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1950 · Ship\'s Infirmary',{r:10,c:9}); }

      // [2,3] Storage hold — below decks
      { const m=blank(T.STEEL); border(m,T.WALL);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        // Side walls — deep hold atmosphere
        fill(m,1,1,H-3,1,T.WALL); fill(m,1,W-3,H-3,W-3,T.WALL);
        // Structured crate layout: ROCK crate rows alternating with COBBLE aisles
        for(let r=3;r<H-3;r+=2){ for(let c=3;c<W-3;c++) set(m,r,c,T.ROCK); }
        // Overhead lighting every 4 cols
        for(let c=3;c<W-3;c+=4) set(m,1,c,T.CROP_READY);
        grid[2][3]=makeScreen(m,{left:{pos:7},up:{pos:10},down:{pos:10}},'1950 · Cargo Hold',{r:8,c:12}); }

      // [3,0] Rough sea — storm waves
      { const m=blank(T.DEEP_WATER); border(m,T.PLANK);
        fill(m,6,0,H-1,W-1,T.PLANK);
        fill(m,0,0,5,W-1,T.DEEP_WATER);
        for(let c=2;c<W-3;c+=3) set(m,3,c,T.WATER); // waves
        grid[3][0]=makeScreen(m,{right:{pos:7},up:{pos:10}},'1950 · Rough Sea Side',{r:7,c:12}); }

      // [3,1] Observation lounge — calm side
      { const m=blank(T.PLANK); border(m,T.STEEL);
        fill(m,1,1,H-3,W-3,T.PLANK);
        fill(m,3,3,9,15,T.COBBLE);
        for(let c=5;c<14;c+=4){ set(m,4,c,T.ROCK); set(m,8,c,T.ROCK); } // lounge chairs
        grid[3][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10}},'1950 · Observation Lounge',{r:6,c:9}); }

      // [3,2] Aft promenade — sunset view (fishing here)
      { const m=blank(T.PLANK); border(m,T.STEEL);
        fill(m,1,1,H-3,W-3,T.PLANK);
        fill(m,H-4,0,H-1,W-1,T.DEEP_WATER); // water at stern
        fill(m,H-5,1,H-5,W-2,T.BRIDGE); // fishing rail
        for(let c=4;c<W-3;c+=4) set(m,6,c,T.ROCK);
        grid[3][2]=makeScreen(m,{left:{pos:7},up:{pos:10}},'1950 · Aft Promenade',{r:5,c:9}); }

      break; }

    // ═══════════════════════════════════════════════════
    // ERA 5 · 1955 · MOORHEAD / FRAZEE, MINNESOTA
    // Flat prairie farms, small-town Main St.
    // Portal: old Dutch Lutheran church basement [1,3]
    // ═══════════════════════════════════════════════════
    case 5: {
      // [0,0] Prairie north — open flat fields
      { const m=blank(T.CORN); border(m,T.TREE);
        fill(m,1,1,H-3,W-3,T.CORN);
        for(let r=3;r<H-3;r+=3) fill(m,r,1,r,W-2,T.GRASS); // field rows
        grid[0][0]=makeScreen(m,{right:{pos:7},down:{pos:10}},'1955 · Northern Prairie',{r:7,c:12}); }

      // [0,1] Wheat fields — approaching town
      { const m=blank(T.WHEAT); border(m,T.TREE);
        fill(m,1,1,H-3,W-3,T.WHEAT);
        fill(m,4,7,9,12,T.GRASS); // clearing
        for(let c=3;c<W-3;c+=4) set(m,2,c,T.TREE);
        grid[0][1]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'1955 · Wheat Fields',{r:7,c:9}); }

      // [0,2] Minnesota lake — fishing spot
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,3,3,H-4,W-4,T.WATER);
        m[HP][3]=T.BRIDGE; m[HP][2]=T.BRIDGE; m[HP][1]=T.BRIDGE;
        fill(m,1,1,2,W-2,T.GRASS); fill(m,H-3,1,H-2,W-2,T.GRASS);
        for(let c=3;c<W-3;c+=3) set(m,1,c,T.TREE);
        grid[0][2]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'1955 · Minnesota Lake',{r:HP,c:4}); }

      // [0,3] Farm road north — endless flat
      { const m=blank(T.CORN); border(m,T.TREE);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        grid[0][3]=makeScreen(m,{left:{pos:7},down:{pos:10}},'1955 · Farm Road North',{r:7,c:9}); }

      // [1,0] Dutch Catholic community church + school
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,1,2,7,14,T.COBBLE); // churchyard
        fill(m,1,4,6,12,T.BRICK); fill(m,0,4,0,12,T.HOUSE_ROOF); // church
        // Church interior: altar at the head, flanked by a lit candle
        set(m,1,8,T.ROCK); // stone altar
        set(m,1,9,T.CROP_READY); // altar candle glowing
        // Two rows of pews inside the nave
        fill(m,2,5,2,11,T.ROCK); fill(m,4,5,4,11,T.ROCK);
        set(m,6,7,T.DOOR); set(m,6,8,T.DOOR);
        // Churchyard path: cobble walk from the door out to the yard edge
        for(let r=7;r<H-3;r++){ set(m,r,7,T.COBBLE); set(m,r,8,T.COBBLE); }
        fill(m,8,1,H-3,W-3,T.GRASS);
        // Re-lay the cobble approach path over the grass
        set(m,8,7,T.COBBLE); set(m,8,8,T.COBBLE);
        houseEra(m, 9,3,5,8, 5); // school
        set(m,13,7,T.DOOR);
        // School playground: grass yard framed with flower borders
        fill(m,9,11,H-3,W-3,T.GRASS);
        fill(m,9,11,9,W-3,T.FLOWER); fill(m,H-3,11,H-3,W-3,T.FLOWER);
        fill(m,9,11,H-3,11,T.FLOWER); fill(m,9,W-3,H-3,W-3,T.FLOWER);
        grid[1][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'1955 · Dutch Catholic Church & School',{r:10,c:12}); }

      // [1,1] MAIN STREET — town centre, stores
      { const m=blank(T.COBBLE);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        houseEra(m, 1,1,4,6, 5); houseEra(m, 1,13,4,5, 5);
        houseEra(m, 8,1,4,6, 5); houseEra(m, 8,13,4,5, 5);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        // Storefront awning overhangs below each shop front
        fill(m,4,1,4,4,T.HOUSE_WALL); fill(m,4,13,4,W-3,T.HOUSE_WALL);
        fill(m,11,1,11,4,T.HOUSE_WALL); fill(m,11,13,11,W-3,T.HOUSE_WALL);
        // Sidewalk cobble strips fronting the stores
        fill(m,5,1,5,4,T.COBBLE); fill(m,5,13,5,W-3,T.COBBLE);
        fill(m,12,1,12,4,T.COBBLE); fill(m,12,13,12,W-3,T.COBBLE);
        // General store: a barrel out on the sidewalk
        set(m,5,3,T.ROCK);
        // Diner: row of tables inside
        set(m,10,3,T.ROCK); set(m,10,4,T.ROCK); set(m,10,5,T.ROCK);
        // Boulevard maples
        set(m,4,7,T.TREE); set(m,4,11,T.TREE);
        set(m,9,7,T.TREE); set(m,9,11,T.TREE);
        grid[1][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1955 · Main Street Frazee',{r:7,c:9}); }

      // [1,2] Farmstead — Gerardus NPC area
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,1,1,H-3,5,T.CORN); fill(m,1,6,H-3,W-3,T.WHEAT);
        // Explicit field rows: ripe WHEAT strips then GRASS rows between them
        fill(m,3,6,3,W-3,T.WHEAT); fill(m,4,6,4,W-3,T.GRASS);
        fill(m,5,6,5,W-3,T.WHEAT); fill(m,6,6,6,W-3,T.GRASS);
        fill(m,7,6,7,W-3,T.WHEAT); fill(m,8,6,8,W-3,T.GRASS);
        houseEra(m, 2,7,6,8, 5); // farmhouse
        set(m,7,10,T.DOOR);
        // Barn hay bales stacked at the north-east
        set(m,3,14,T.ROCK); set(m,3,15,T.ROCK);
        // Chicken coop: fenced pen bottom-right
        fill(m,10,14,10,16,T.HOUSE_WALL);
        // Orchard: fruit trees at the yard corners
        set(m,9,1,T.TREE); set(m,9,W-2,T.TREE);
        set(m,H-3,1,T.TREE); set(m,H-3,W-2,T.TREE);
        // Vegetable garden rows in front of the house
        fill(m,10,3,10,5,T.FLOWER); fill(m,12,3,12,5,T.FLOWER);
        fill(m,4,3,4,5,T.CROP_READY); fill(m,9,3,9,5,T.CROP_READY);
        grid[1][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1955 · Dutch Immigrant Farm',{r:7,c:9}); }

      // [1,3] DUTCH LUTHERAN CHURCH + BASEMENT PORTAL
      { const m=blank(T.GRASS); border(m,T.TREE);
        // Dark crypt: fill the whole interior with brick walls, then a cobble floor
        fill(m,1,1,H-3,W-3,T.BRICK);
        fill(m,1,3,H-4,W-4,T.COBBLE); // cobble floor throughout
        fill(m,1,5,7,13,T.BRICK); fill(m,0,5,0,13,T.HOUSE_ROOF);
        // Re-lay cobble inside the sanctuary so it stays walkable
        fill(m,2,6,6,12,T.COBBLE);
        // Stone pillars flanking the crypt aisle
        set(m,2,6,T.ROCK); set(m,2,12,T.ROCK);
        set(m,5,6,T.ROCK); set(m,5,12,T.ROCK);
        set(m,8,6,T.ROCK); set(m,8,12,T.ROCK);
        set(m,7,8,T.DOOR); set(m,7,9,T.DOOR);
        // Basement entrance (side door)
        set(m,4,13,T.DOOR);
        // PORTAL glows in the basement, ringed by an eerie CROP_READY halo
        set(m,3,15,T.PORTAL); set(m,4,15,T.PORTAL);
        set(m,2,15,T.CROP_READY); set(m,5,15,T.CROP_READY);
        set(m,3,14,T.CROP_READY); set(m,4,14,T.CROP_READY);
        set(m,3,16,T.CROP_READY); set(m,4,16,T.CROP_READY);
        clearZone(m,10,9,2);
        grid[1][3]=makeScreen(m,{left:{pos:7},up:{pos:10},down:{pos:10}},'1955 · Dutch Church — Basement',{r:10,c:9}); }

      // [2,0] Dairy farm + milk cans (fishing stream)
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,1,1,5,W-3,T.GRASS);
        houseEra(m, 1,3,5,9, 5); // barn
        // Silo: a tall stone column standing at the barn's west end
        fill(m,1,2,3,3,T.WALL);
        // Milk cans lined up on the east side of the barn
        set(m,2,13,T.ROCK); set(m,2,14,T.ROCK); set(m,2,15,T.ROCK);
        // Pasture fence posts every 3 cols along the stream bank
        for(let c=1;c<W-1;c+=3) set(m,6,c,T.ROCK);
        for(let c=1;c<W-1;c++){ m[7][c]=T.WATER; m[8][c]=T.WATER; }
        m[7][9]=T.BRIDGE; m[8][9]=T.BRIDGE; m[7][10]=T.BRIDGE; m[8][10]=T.BRIDGE;
        fill(m,9,1,H-3,W-3,T.CORN);
        grid[2][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'1955 · Dairy Farm',{r:6,c:12}); }

      // [2,1] Town park + bandstand
      { const m=blank(T.GRASS);
        fill(m,3,3,H-4,W-4,T.FLOWER);
        for(let c=5;c<W-4;c+=4) set(m,4,c,T.TREE);
        set(m,8,9,T.ROCK); set(m,8,10,T.ROCK); // bandstand
        fill(m,0,1,2,W-2,T.ROAD);
        grid[2][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1955 · Town Park',{r:7,c:9}); }

      // [2,2] Corn fields — Gerardus works here
      { const m=blank(T.CORN); border(m,T.TREE);
        fill(m,1,1,H-3,W-3,T.CORN);
        for(let r=3;r<H-3;r+=3) fill(m,r,1,r,W-2,T.GRASS);
        fill(m,5,8,8,11,T.CROP_READY);
        grid[2][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1955 · Corn Fields',{r:7,c:9}); }

      // [2,3] Lake east — walleye fishing
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,4,1,H-4,W-4,T.WATER);
        m[HP][1]=T.BRIDGE; m[HP][2]=T.BRIDGE; m[HP][3]=T.BRIDGE;
        fill(m,1,1,3,W-2,T.GRASS);
        for(let c=3;c<W-3;c+=3) set(m,2,c,T.TREE);
        grid[2][3]=makeScreen(m,{left:{pos:7},up:{pos:10},down:{pos:10}},'1955 · Walleye Lake',{r:HP,c:4}); }

      // [3,0] Old farmstead — innkeeper
      { const m=blank(T.GRASS); border(m,T.TREE);
        houseEra(m, 2,3,7,7, 5); set(m,8,6,T.DOOR);
        fill(m,9,1,H-3,W-3,T.GRASS);
        grid[3][0]=makeScreen(m,{right:{pos:7},up:{pos:10}},'1955 · Old Farmstead Inn',{r:10,c:12}); }

      // [3,1] County road south
      { const m=blank(T.CORN); border(m,T.TREE);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        grid[3][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10}},'1955 · County Road South',{r:7,c:9}); }

      // [3,2] Drive-in movie ruins / old barn
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,1,3,6,15,T.COBBLE);
        houseEra(m, 1,7,4,6, 5);
        fill(m,7,1,H-3,W-3,T.FLOWER);
        grid[3][2]=makeScreen(m,{left:{pos:7},up:{pos:10}},'1955 · Old Drive-In',{r:10,c:9}); }

      break; }

    // ═══════════════════════════════════════════════════
    // ERA 6 · 1984 · WISCONSIN (USA) + NETHERLANDS
    // Two halves: suburban USA west, Dutch rural east.
    // Portal: a phone booth in the Wisconsin cul-de-sac [3,1]
    // ═══════════════════════════════════════════════════
    case 6: {
      // [0,0] Wisconsin highway north
      { const m=blank(T.GRASS); border(m,T.TREE);
        for(let r=1;r<H-1;r++){ m[r][8]=T.ROAD; m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        fill(m,1,1,H-3,7,T.GRASS); fill(m,1,11,H-3,W-3,T.GRASS);
        for(let c=2;c<7;c+=2) set(m,4,c,T.TREE);
        grid[0][0]=makeScreen(m,{right:{pos:7},down:{pos:10}},'1984 · Wisconsin Highway',{r:7,c:12}); }

      // [0,1] Shopping mall — modern American
      { const m=blank(T.COBBLE); border(m,T.STEEL);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        fill(m,1,2,6,W-3,T.STEEL); // mall roof
        fill(m,1,2,6,W-3,T.HOUSE_WALL);
        for(let c=3;c<W-3;c+=4) set(m,6,c,T.DOOR); // mall entrances
        fill(m,2,3,2,W-4,T.WALL); // interior storefront lockers/shops row
        fill(m,4,4,4,7,T.ROCK); fill(m,4,10,4,13,T.ROCK); // food-court tables
        fill(m,7,2,H-3,W-3,T.COBBLE); // parking lot
        for(let c=3;c<W-3;c+=3) set(m,9,c,T.ROAD); // parking lanes
        set(m,8,4,T.STEEL); set(m,8,14,T.STEEL); // cart corrals / lamp posts
        grid[0][1]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'1984 · Shopping Mall',{r:10,c:9}); }

      // [0,2] Netherlands — tulip fields (sub-portal to NL side)
      { const m=blank(T.FLOWER); border(m,T.TREE);
        fill(m,1,1,H-3,W-3,T.FLOWER);
        for(let r=2;r<H-3;r+=2) fill(m,r,1,r,W-2,T.GRASS);
        // Wind turbines (WALL tiles)
        set(m,1,5,T.WALL); set(m,1,14,T.WALL);
        grid[0][2]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'1984 · Dutch Tulip Fields',{r:7,c:9}); }

      // [0,3] Netherlands windmill + canal
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,1,1,H-3,5,T.WATER); // canal
        m[HP][5]=T.BRIDGE; m[HP][6]=T.BRIDGE;
        fill(m,1,7,H-3,W-3,T.FLOWER);
        // Windmill
        fill(m,2,12,8,14,T.WALL);
        fill(m,2,11,4,11,T.WALL); fill(m,2,15,4,15,T.WALL); // sails
        grid[0][3]=makeScreen(m,{left:{pos:7},down:{pos:10}},'1984 · Dutch Windmill',{r:7,c:10}); }

      // [1,0] Wisconsin suburban street — cul-de-sac north
      { const m=blank(T.GRASS);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        houseEra(m, 2,2,4,5, 6); houseEra(m, 2,13,4,5, 6);
        houseEra(m, 8,2,4,5, 6); houseEra(m, 8,13,4,5, 6);
        for(let c=3;c<W-3;c+=4) set(m,6,c,T.TREE);
        set(m,6,6,T.COBBLE); set(m,7,6,T.COBBLE); // driveway to NW house
        set(m,6,13,T.COBBLE); set(m,7,13,T.COBBLE); // driveway to NE house
        set(m,2,7,T.FLOWER); set(m,8,7,T.FLOWER); // lawn flower borders
        set(m,2,12,T.FLOWER); set(m,8,12,T.FLOWER);
        grid[1][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'1984 · Suburban Street North',{r:7,c:12}); }

      // [1,1] VAN DYN HOVEN HOUSE — Chuck NPC here
      { const m=blank(T.GRASS);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        // The Van Dyn Hoven house — big oak in front yard
        fill(m,1,2,6,7,T.HOUSE_WALL); fill(m,0,2,0,7,T.HOUSE_ROOF);
        set(m,6,4,T.DOOR);
        fill(m,1,11,6,W-3,T.HOUSE_WALL); fill(m,0,11,0,W-3,T.HOUSE_ROOF);
        set(m,6,13,T.DOOR);
        set(m,3,8,T.TREE); // big oak
        set(m,9,5,T.TREE); set(m,9,13,T.TREE); // boulevard maples
        fill(m,7,4,8,4,T.COBBLE); // driveway to left house
        fill(m,7,13,8,13,T.COBBLE); // driveway to right house
        fill(m,1,8,3,8,T.HOUSE_WALL); // attached garage, left
        set(m,2,3,T.FLOWER); set(m,2,6,T.FLOWER); // foundation flower beds
        set(m,2,12,T.FLOWER); set(m,2,15,T.FLOWER);
        grid[1][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1984 · Van Dyn Hoven House',{r:7,c:9}); }

      // [1,2] Netherlands farm / Van Duynhoven NL side
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,1,1,H-3,5,T.WATER);
        m[HP][5]=T.BRIDGE; m[HP][6]=T.BRIDGE;
        fill(m,1,7,H-3,W-3,T.WHEAT);
        houseEra(m, 2,9,5,8, 1);
        fill(m,4,9,4,15,T.CROP_READY);
        grid[1][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1984 · Netherlands Farm',{r:7,c:9}); }

      // [1,3] Dutch village — Netherlands side
      { const m=blank(T.COBBLE); border(m,T.BRICK);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        houseEra(m, 1,3,5,5, 1); houseEra(m, 1,12,5,6, 1);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        fill(m,8,2,H-3,6,T.FLOWER);
        fill(m,8,12,H-3,W-3,T.WATER); // village canal
        set(m,8,12,T.BRIDGE); // canal crossing
        set(m,1,2,T.BRICK); set(m,1,8,T.BRICK); set(m,1,11,T.BRICK); set(m,1,W-3,T.BRICK); // brick gable facades
        grid[1][3]=makeScreen(m,{left:{pos:7},up:{pos:10},down:{pos:10}},'1984 · Dutch Village',{r:7,c:9}); }

      // [2,0] Wisconsin park + VFW hall
      { const m=blank(T.GRASS);
        fill(m,3,3,H-4,W-4,T.FLOWER);
        for(let c=5;c<W-4;c+=4) set(m,4,c,T.TREE);
        houseEra(m, 7,10,5,8, 6); // VFW hall
        set(m,11,13,T.DOOR);
        fill(m,0,1,2,W-2,T.ROAD);
        grid[2][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'1984 · Town Park & VFW',{r:7,c:12}); }

      // [2,1] Courthouse square + records (Chuck clue)
      { const m=blank(T.COBBLE);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        fill(m,1,5,7,13,T.BRICK); // courthouse
        set(m,7,8,T.DOOR); set(m,7,9,T.DOOR);
        fill(m,8,1,H-3,W-3,T.COBBLE);
        // Courthouse record: clue to name spelling change
        set(m,4,14,T.CROP_READY);
        grid[2][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1984 · Courthouse Square',{r:10,c:9}); }

      // [2,2] Netherlands pen pal neighbourhood
      { const m=blank(T.COBBLE); border(m,T.BRICK);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        houseEra(m, 1,2,4,5, 1); houseEra(m, 1,12,4,6, 1);
        fill(m,1,7,4,10,T.FLOWER); // window boxes
        for(let r=1;r<H-1;r++) m[r][9]=T.ROAD;
        fill(m,9,1,9,8,T.WATER); // gracht canal along the street
        m[9][9]=T.BRIDGE; // stepped canal bridge
        set(m,1,2,T.BRICK); set(m,1,6,T.BRICK); set(m,1,12,T.BRICK); set(m,1,W-3,T.BRICK); // brick step-gables
        set(m,5,3,T.FLOWER); set(m,5,14,T.FLOWER); // stoop planters
        grid[2][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'1984 · Dutch Pen Pal Street',{r:7,c:9}); }

      // [2,3] Netherlands canal + boat (fishing)
      { const m=blank(T.COBBLE);
        fill(m,3,0,8,W-1,T.WATER);
        m[HP][9]=T.BRIDGE; m[HP][10]=T.BRIDGE; m[HP][11]=T.BRIDGE;
        fill(m,0,0,2,W-1,T.HOUSE_WALL); fill(m,9,0,H-1,W-1,T.HOUSE_WALL);
        for(let c=2;c<W-2;c+=4){ set(m,2,c,T.DOOR); set(m,9,c,T.DOOR); }
        grid[2][3]=makeScreen(m,{left:{pos:7},up:{pos:10},down:{pos:10}},'1984 · Dutch Canal Street',{r:5,c:9}); }

      // [3,0] Wisconsin suburbs — quiet street
      { const m=blank(T.GRASS); border(m,T.TREE);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        houseEra(m, 2,2,4,5, 6); houseEra(m, 8,2,4,5, 6);
        grid[3][0]=makeScreen(m,{right:{pos:7},up:{pos:10}},'1984 · Quiet Suburb',{r:7,c:12}); }

      // [3,1] CUL-DE-SAC + PHONE BOOTH PORTAL
      { const m=blank(T.COBBLE);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        // Cul-de-sac circle
        fill(m,3,4,9,14,T.ROAD);
        houseEra(m, 1,2,3,4, 6); houseEra(m, 1,13,3,5, 6); houseEra(m, 10,2,3,4, 6); houseEra(m, 10,13,3,5, 6);
        // PORTAL — phone booth glows
        set(m,6,9,T.PORTAL); set(m,6,10,T.PORTAL);
        set(m,5,9,T.STEEL); set(m,5,10,T.STEEL); // phone booth frame
        set(m,4,9,T.STEEL); set(m,4,10,T.STEEL); // booth roof
        set(m,7,8,T.FLOWER); set(m,7,11,T.FLOWER); // planter beds flanking booth
        set(m,8,9,T.COBBLE); set(m,8,10,T.COBBLE); // approach paving
        clearZone(m,8,9,2);
        grid[3][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10}},'1984 · Cul-de-Sac — Phone Booth',{r:8,c:9}); }

      // [3,2] Netherlands rural — windmill road
      { const m=blank(T.FLOWER); border(m,T.TREE);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        fill(m,1,1,H-3,8,T.FLOWER); fill(m,1,11,H-3,W-3,T.FLOWER);
        grid[3][2]=makeScreen(m,{left:{pos:7},up:{pos:10}},'1984 · Dutch Rural Road',{r:7,c:9}); }

      break; }

    // ═══════════════════════════════════════════════════
    // ERA 7 · 2020 · MINNESOTA + HAARLEM (COVID era)
    // Modern, but lockdown. Portal: family Zoom call room [2,2]
    // ═══════════════════════════════════════════════════
    case 7: {
      // [0,0] Minnesota suburb — quiet pandemic streets
      { const m=blank(T.COBBLE);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        fill(m,1,1,H-3,8,T.GRASS); fill(m,1,11,H-3,W-3,T.GRASS);
        houseEra(m, 2,2,4,5, 7); houseEra(m, 2,12,4,6, 7);
        for(let c=2;c<W-2;c+=4) set(m,6,c,T.TREE);
        for(let r=2;r<H-2;r+=2) set(m,r,9,T.CROP_SPENT); // dashed lane markings
        set(m,2,3,T.CIRCUIT); set(m,2,13,T.CIRCUIT);     // smart-home / doorbell cams
        grid[0][0]=makeScreen(m,{right:{pos:7},down:{pos:10}},'2020 · Minnesota Suburb',{r:7,c:12}); }

      // [0,1] Closed shops — lockdown Main Street
      { const m=blank(T.COBBLE); border(m,T.BRICK);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        fill(m,1,1,5,W-2,T.BRICK); // storefronts
        for(let c=3;c<W-3;c+=4) set(m,5,c,T.DOOR);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        fill(m,6,1,H-3,W-3,T.COBBLE);
        grid[0][1]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'2020 · Closed Main Street',{r:10,c:9}); }

      // [0,2] Haarlem canal — empty bike paths
      { const m=blank(T.COBBLE); border(m,T.HOUSE_WALL);
        fill(m,0,0,H-1,5,T.WATER);
        fill(m,0,6,H-1,8,T.ROAD);
        fill(m,0,9,H-1,W-1,T.COBBLE);
        houseEra(m, 2,9,4,5, 7); houseEra(m, 7,9,4,7, 7);
        set(m,1,9,T.BRICK); set(m,1,11,T.BRICK); set(m,1,13,T.BRICK); // brick facades
        set(m,6,10,T.FLOWER); set(m,6,12,T.FLOWER); set(m,6,14,T.FLOWER); // flower market stalls
        for(let r=2;r<H-2;r+=2) set(m,r,8,T.FLOWER);
        grid[0][2]=makeScreen(m,{left:{pos:7},right:{pos:7},down:{pos:10}},'2020 · Haarlem Canal',{r:7,c:12}); }

      // [0,3] Haarlem park — joggers only
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,3,3,H-4,W-4,T.FLOWER);
        for(let c=5;c<W-4;c+=3) set(m,4,c,T.TREE);
        fill(m,7,6,10,13,T.WATER); // park pond
        m[HP][6]=T.BRIDGE; m[HP][7]=T.BRIDGE;
        grid[0][3]=makeScreen(m,{left:{pos:7},down:{pos:10}},'2020 · Haarlem Park',{r:5,c:9}); }

      // [1,0] Work-from-home street — home offices lit up
      { const m=blank(T.COBBLE);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        houseEra(m, 1,2,4,5, 7); houseEra(m, 1,13,4,5, 7);
        houseEra(m, 7,2,4,5, 7); houseEra(m, 7,13,4,5, 7);
        // Glowing screens (CROP_READY in windows)
        set(m,2,3,T.CROP_READY); set(m,3,3,T.CROP_READY);
        set(m,8,3,T.CROP_READY); set(m,2,14,T.CROP_READY);
        set(m,2,4,T.CIRCUIT); set(m,8,14,T.CIRCUIT); // fibre/router nodes
        set(m,3,14,T.CROP_READY); set(m,8,14,T.CROP_READY); // more lit home offices
        grid[1][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'2020 · Home Office Street',{r:7,c:12}); }

      // [1,1] Arthur's Minnesota neighbourhood
      { const m=blank(T.COBBLE);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        houseEra(m, 2,2,4,5, 7); houseEra(m, 2,13,4,5, 7);
        set(m,5,7,T.TREE); set(m,5,11,T.TREE); // boulevard oaks
        // Arthur's house glows (front window)
        set(m,3,3,T.CROP_READY);
        fill(m,9,3,H-3,6,T.FLOWER); // front garden
        grid[1][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'2020 · Arthur\'s Neighbourhood',{r:7,c:9}); }

      // [1,2] Haarlem Leidsevaart area
      { const m=blank(T.COBBLE);
        fill(m,0,0,H-1,4,T.WATER); // canal
        fill(m,0,5,H-1,6,T.ROAD);
        fill(m,0,7,H-1,W-1,T.COBBLE);
        houseEra(m, 1,7,5,9, 7); // Arthur's haarlem-side house
        set(m,1,8,T.BRICK); set(m,1,11,T.BRICK); set(m,1,14,T.BRICK); // brick row-house facades
        for(let r=1;r<H-1;r+=3) set(m,r,6,T.FLOWER);
        grid[1][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'2020 · Leidsevaart',{r:7,c:10}); }

      // [1,3] Haarlem neighbourhood — Raven & Starling NPC
      { const m=blank(T.COBBLE); border(m,T.HOUSE_WALL);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        houseEra(m, 1,3,4,5, 7); houseEra(m, 1,12,4,6, 7);
        fill(m,6,4,9,14,T.FLOWER); // courtyard
        for(let c=4;c<W-4;c+=3) set(m,5,c,T.FLOWER);
        grid[1][3]=makeScreen(m,{left:{pos:7},up:{pos:10},down:{pos:10}},'2020 · Haarlem Flat',{r:7,c:9}); }

      // [2,0] Grocery store — essential workers
      { const m=blank(T.COBBLE); border(m,T.BRICK);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        fill(m,1,3,6,W-4,T.STEEL); // store exterior
        fill(m,1,3,6,W-4,T.HOUSE_WALL);
        for(let c=5;c<W-4;c+=5) set(m,6,c,T.DOOR);
        set(m,2,4,T.STEEL); set(m,2,14,T.STEEL); // steel-clad storefront corners
        set(m,3,8,T.CIRCUIT); set(m,3,11,T.CIRCUIT); // self-checkout / signage tech
        fill(m,7,1,H-3,W-3,T.COBBLE); // car park
        for(let c=3;c<W-3;c+=3) set(m,9,c,T.ROAD); // parking-bay markings
        grid[2][0]=makeScreen(m,{right:{pos:7},up:{pos:10},down:{pos:10}},'2020 · Essential Grocery',{r:10,c:12}); }

      // [2,1] Outdoor exercise area — joggers
      { const m=blank(T.GRASS);
        fill(m,0,1,2,W-2,T.ROAD); // jogging path
        fill(m,3,3,H-4,W-4,T.FLOWER);
        for(let c=5;c<W-4;c+=4) set(m,5,c,T.TREE);
        fill(m,7,7,10,12,T.WATER); // exercise pond
        grid[2][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'2020 · Outdoor Exercise',{r:7,c:9}); }

      // [2,2] FAMILY ZOOM CALL ROOM + PORTAL
      { const m=blank(T.COBBLE); border(m,T.STEEL);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        // Living room screens glowing
        fill(m,2,3,8,15,T.STEEL); // screen wall (TV/monitor)
        fill(m,2,3,8,15,T.HOUSE_WALL);
        // Multiple family faces (CROP_READY glow = video call tiles)
        set(m,3,4,T.CROP_READY); set(m,3,7,T.CROP_READY);
        set(m,3,10,T.CROP_READY); set(m,3,13,T.CROP_READY);
        set(m,5,4,T.CROP_READY); set(m,5,7,T.CROP_READY);
        set(m,5,10,T.CROP_READY); set(m,5,13,T.CROP_READY);
        // PORTAL — time energy emanates from the family connection
        set(m,10,9,T.PORTAL); set(m,10,10,T.PORTAL); set(m,10,11,T.PORTAL);
        set(m,9,10,T.PORTAL); set(m,11,10,T.PORTAL); // vertical energy column
        set(m,9,9,T.CIRCUIT); set(m,9,11,T.CIRCUIT); // glowing tech frame
        set(m,11,9,T.STEEL); set(m,11,11,T.STEEL);   // reinforced base
        set(m,8,3,T.ROCK); set(m,9,3,T.ROCK);         // living-room sofa
        set(m,8,15,T.ROCK); set(m,9,15,T.ROCK);       // armchair + side table
        clearZone(m,11,9,1);
        grid[2][2]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10},down:{pos:10}},'2020 · Family Zoom Call',{r:11,c:9}); }

      // [2,3] Haarlem empty streets — lockdown
      { const m=blank(T.COBBLE); border(m,T.HOUSE_WALL);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        fill(m,0,4,H-1,6,T.WATER); // canal
        set(m,2,8,T.BRICK); set(m,2,11,T.BRICK); set(m,2,14,T.BRICK); // shuttered brick shops
        m[HP][6]=T.BRIDGE; m[HP][7]=T.BRIDGE;
        for(let r=2;r<H-2;r+=2) set(m,r,3,T.FLOWER);
        grid[2][3]=makeScreen(m,{left:{pos:7},up:{pos:10},down:{pos:10}},'2020 · Empty Haarlem Street',{r:7,c:10}); }

      // [3,0] Minnesota river walk
      { const m=blank(T.GRASS); border(m,T.TREE);
        fill(m,1,1,H-4,4,T.WATER);
        fill(m,5,5,7,7,T.BRIDGE); // fishing dock
        fill(m,1,5,H-3,W-3,T.GRASS);
        for(let c=6;c<W-3;c+=3) set(m,3,c,T.TREE);
        grid[3][0]=makeScreen(m,{right:{pos:7},up:{pos:10}},'2020 · River Walk',{r:7,c:12}); }

      // [3,1] Takeout coffee shop — drive-through
      { const m=blank(T.COBBLE);
        fill(m,1,1,H-3,W-3,T.COBBLE);
        houseEra(m, 2,5,5,8, 7);
        set(m,6,8,T.DOOR);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; } // drive-through
        grid[3][1]=makeScreen(m,{left:{pos:7},right:{pos:7},up:{pos:10}},'2020 · Takeout Coffee',{r:7,c:9}); }

      // [3,2] Neighbourhood street — ending area
      { const m=blank(T.COBBLE);
        for(let r=1;r<H-1;r++){ m[r][9]=T.ROAD; m[r][10]=T.ROAD; }
        houseEra(m, 2,2,4,5, 7); houseEra(m, 2,13,4,5, 7);
        fill(m,7,2,H-3,6,T.FLOWER); fill(m,7,13,H-3,W-3,T.FLOWER);
        grid[3][2]=makeScreen(m,{left:{pos:7},up:{pos:10}},'2020 · Quiet Neighbourhood',{r:7,c:9}); }

      break; }

    default:
      // Fallback for any unimplemented era — shouldn't happen
      for (let row = 0; row < WORLD_ROWS; row++) {
        for (let col = 0; col < WORLD_COLS; col++) {
          const m = blank(T.GRASS); border(m, T.TREE);
          const exits = {};
          if (col < WORLD_COLS-1) exits.right = { pos:7 };
          if (col > 0)            exits.left  = { pos:7 };
          if (row < WORLD_ROWS-1) exits.down  = { pos:10 };
          if (row > 0)            exits.up    = { pos:10 };
          clearZone(m, 7, 10, 2);
          grid[row][col] = makeScreen(m, exits, `Era ${eraId}`, {r:7, c:10});
        }
      }
  }

  return grid;
}

// ── ERA 8 · HAARLEM — Leidsevaart 276 ────────────────────
// Based on actual Leidsevaart street, canal running N-S,
// brick row houses on east side, canal water on west side.
// 4-screen walk north → Grote Markt with Sint-Bavo church.
// Layout:
//   [0,0] Leidsevaart south (canal + row houses)
//   [0,1] Leidsevaart canal open water / bike path
//   [0,2] Westergracht junction (cross canal)
//   [0,3] Haarlem Centrum approach (brick street)
//   [1,0] HOME: Leidsevaart 276 (Arthur/Raven/Starling)
//   [1,1] Leidsevaart north (more row houses, canal)
//   [1,2] Botermarkt / small canal square
//   [1,3] Narrow old-town streets toward Grote Markt
//   [2,0] Bakery / neighbourhood shops
//   [2,1] Bicycle park + small park / Stadsbos edge
//   [2,2] Old town canal alley (Bakenessergracht)
//   [2,3] Grote Markt approach — open cobblestone
//   [3,0] Stadsbos De Hout (forest park)
//   [3,1] Park with benches, pond (fishing spot)
//   [3,2] Grote Markt square
//   [3,3] Sint-Bavo Grote Kerk + TIME PORTAL (church entrance)

function _buildHaarlemWorld() {
  const grid = Array.from({length: WORLD_ROWS}, () => Array(WORLD_COLS).fill(null));
  const HP = 7, VP = 10;

  // Helper: canal side — water on left columns, path + houses on right
  function canalScreen(hasBoat = false) {
    const m = blank(T.COBBLE);
    // Canal water on left third
    fill(m, 0, 0, H-1, 5, T.WATER);
    // Towpath / bike path
    fill(m, 0, 6, H-1, 7, T.ROAD);
    // Row house facades (solid wall strip) — east side
    fill(m, 0, 8, H-1, 9, T.HOUSE_WALL);
    // Interior / gardens behind houses
    fill(m, 0, 10, H-1, W-1, T.GRASS);
    // House doors at street level
    for (let r = 2; r < H-2; r += 4) set(m, r, 8, T.DOOR);
    // Window-like brick detail
    fill(m, 0, 8, H-1, W-1, T.COBBLE);
    fill(m, 0, 8, H-1, 9, T.HOUSE_WALL);
    fill(m, 0, 10, H-1, W-1, T.GRASS);
    // Flowers in window boxes (on house wall row)
    for (let r = 1; r < H-1; r += 3) set(m, r, 9, T.FLOWER);
    return m;
  }

  // [0,0] Leidsevaart south
  { const m = canalScreen();
    set(m, 3, 6, T.FLOWER); set(m, 8, 6, T.FLOWER); // cyclists / decoration
    grid[0][0] = makeScreen(m, {right:{pos:HP},down:{pos:VP}}, '2026 · Leidsevaart South', {r:HP,c:11}); }

  // [0,1] Canal / open water section
  { const m = blank(T.WATER);
    fill(m, 0, 0, H-1, W-1, T.WATER);
    fill(m, 0, 6, H-1, 8, T.ROAD);      // bike path
    fill(m, 0, 9, H-1, W-1, T.COBBLE);  // pavement
    border(m, T.WATER);
    set(m, 4, 3, T.BRIDGE); set(m, 4, 4, T.BRIDGE); // small footbridge
    grid[0][1] = makeScreen(m, {left:{pos:HP},right:{pos:HP},down:{pos:VP}}, '2026 · Leidsevaart Canal', {r:HP,c:9}); }

  // [0,2] Westergracht junction
  { const m = blank(T.COBBLE);
    fill(m, 4, 0, 7, W-1, T.WATER);     // cross canal (Westergracht)
    fill(m, 4, 8, 7, 10, T.BRIDGE);     // bridge crossing it
    fill(m, 0, 8, 3, 10, T.ROAD);       // road north of bridge
    fill(m, 8, 8, H-1, 10, T.ROAD);     // road south of bridge
    fill(m, 0, 0, H-1, 5, T.HOUSE_WALL);
    fill(m, 0, 11, H-1, W-1, T.HOUSE_WALL);
    // Flower boxes on houses
    for (let r = 1; r < H-1; r+=3) { set(m, r, 5, T.FLOWER); set(m, r, 11, T.FLOWER); }
    grid[0][2] = makeScreen(m, {left:{pos:HP},right:{pos:HP},down:{pos:VP}}, '2026 · Westergracht', {r:HP,c:9}); }

  // [0,3] Approach to city centre
  { const m = blank(T.COBBLE);
    fill(m, 0, 7, H-1, 12, T.ROAD);
    fill(m, 0, 0, H-1, 6, T.HOUSE_WALL);
    fill(m, 0, 13, H-1, W-1, T.HOUSE_WALL);
    for (let r = 0; r < H; r+=2) { set(m, r, 6, T.FLOWER); set(m, r, 13, T.FLOWER); }
    grid[0][3] = makeScreen(m, {left:{pos:HP},down:{pos:VP}}, '2026 · Centrum Approach', {r:HP,c:10}); }

  // [1,0] HOME: Leidsevaart 276 — the family house
  { const m = blank(T.COBBLE);
    // Canal on left
    fill(m, 0, 0, H-1, 4, T.WATER);
    set(m, 6, 4, T.BRIDGE); set(m, 7, 4, T.BRIDGE); // bridge to house
    // Bike path
    fill(m, 0, 5, H-1, 6, T.ROAD);
    // The house: Leidsevaart 276 — 3-story Dutch brick house
    fill(m, 1, 7, 7, 13, T.HOUSE_WALL);     // house body
    fill(m, 0, 7, 0, 13, T.HOUSE_ROOF);     // roof
    set(m, 7, 10, T.DOOR);                   // front door (faces canal)
    // Garden behind
    fill(m, 1, 14, H-1, W-1, T.GRASS);
    fill(m, 3, 14, 6, 17, T.FLOWER);         // garden flowers
    // Neighbours
    fill(m, 1, 7, 1, 13, T.HOUSE_WALL);
    // Window box flowers
    for (let c = 8; c <= 13; c += 2) set(m, 0, c, T.FLOWER);
    // Bicycle parked outside
    set(m, 8, 6, T.ROAD);
    // Time Portal hidden in the attic — at upper floor position
    set(m, 2, 10, T.PORTAL); set(m, 2, 11, T.PORTAL);
    clearZone(m, 8, 8, 2);
    grid[1][0] = makeScreen(m, {right:{pos:HP},up:{pos:VP},down:{pos:VP}},
      '2026 · Leidsevaart 276, Haarlem', {r:8,c:8}); }

  // [1,1] Leidsevaart north (row houses continued)
  { const m = canalScreen();
    // Slightly different houses — added storey variation
    fill(m, 2, 8, 5, 9, T.HOUSE_ROOF);  // taller house section
    set(m, 6, 8, T.DOOR);
    grid[1][1] = makeScreen(m, {left:{pos:HP},right:{pos:HP},up:{pos:VP},down:{pos:VP}}, '2026 · Leidsevaart North', {r:HP,c:11}); }

  // [1,2] Botermarkt / small neighbourhood square
  { const m = blank(T.COBBLE);
    // Small open square in the middle
    fill(m, 3, 4, 9, 14, T.COBBLE);
    // Market stalls
    fill(m, 4, 5, 6, 7, T.HOUSE_WALL);
    fill(m, 4, 10, 6, 12, T.HOUSE_WALL);
    // Trees around square
    for (let r = 3; r <= 9; r += 3) { set(m, r, 4, T.TREE); set(m, r, 14, T.TREE); }
    // Fountain / well in center
    set(m, 6, 9, T.WATER); set(m, 6, 10, T.WATER);
    // Surrounding buildings
    fill(m, 0, 0, H-1, 3, T.HOUSE_WALL);
    fill(m, 0, 15, H-1, W-1, T.HOUSE_WALL);
    // Flower boxes
    for (let r = 1; r < H-1; r+=2) { set(m, r, 3, T.FLOWER); set(m, r, 15, T.FLOWER); }
    grid[1][2] = makeScreen(m, {left:{pos:HP},right:{pos:HP},up:{pos:VP},down:{pos:VP}}, '2026 · Botermarkt', {r:HP,c:9}); }

  // [1,3] Narrow old-town alleys
  { const m = blank(T.COBBLE);
    // Narrow street — close brick walls on left and right
    fill(m, 0, 0, H-1, 5, T.BRICK);
    fill(m, 0, 14, H-1, W-1, T.BRICK);
    fill(m, 0, 6, H-1, 13, T.ROAD);
    // Small alley canal
    fill(m, 5, 0, 7, 5, T.WATER);
    // Arch / gateway at bottom — only the gateposts are solid, centre is walkable
    // (was: fill whole row with BRICK trapping players entering from south)
    set(m, H-3, 7, T.BRICK); set(m, H-3, 12, T.BRICK); // gatepost pillars
    set(m, H-2, 7, T.BRICK); set(m, H-2, 12, T.BRICK); // gatepost pillars
    set(m, H-1, 7, T.BRICK); set(m, H-1, 12, T.BRICK);
    // Centre of arch is open (DOOR tiles = walkable visual)
    set(m, H-2, 9, T.DOOR); set(m, H-2, 10, T.DOOR);
    grid[1][3] = makeScreen(m, {left:{pos:HP},up:{pos:VP},down:{pos:VP}}, '2026 · Oude Binnenstad Alleys', {r:HP,c:9}); }

  // [2,0] Bakery and neighbourhood shops
  { const m = blank(T.COBBLE);
    houseEra(m, 1, 1, 7, 5, 1);   // bakery
    houseEra(m, 1, 10, 7, 5, 1);  // café
    fill(m, 7, 0, H-1, W-1, T.GRASS);
    fill(m, 8, 3, 11, 6, T.FLOWER);
    set(m, 6, 3, T.DOOR); set(m, 6, 12, T.DOOR);
    grid[2][0] = makeScreen(m, {right:{pos:HP},up:{pos:VP},down:{pos:VP}}, '2026 · Haarlem Shops', {r:HP,c:9}); }

  // [2,1] Bicycle park + small park
  { const m = blank(T.GRASS);
    fill(m, 0, 0, 3, W-1, T.ROAD);   // road
    fill(m, 4, 4, 8, 14, T.FLOWER);  // park area
    for (let c = 6; c <= 13; c += 3) set(m, 6, c, T.TREE);
    fill(m, 9, 7, 11, 12, T.WATER);  // pond
    set(m, 10, 9, T.BRIDGE);          // footbridge over pond
    grid[2][1] = makeScreen(m, {left:{pos:HP},right:{pos:HP},up:{pos:VP},down:{pos:VP}}, '2026 · Wilhelminapark', {r:HP,c:9}); }

  // [2,2] Bakenessergracht canal alley — historic canal
  { const m = blank(T.COBBLE);
    // The Bakenessergracht runs north-south
    fill(m, 0, 5, H-1, 7, T.WATER);
    set(m, 5, 5, T.BRIDGE); set(m, 5, 6, T.BRIDGE); set(m, 5, 7, T.BRIDGE);
    fill(m, 0, 0, H-1, 4, T.HOUSE_WALL);
    fill(m, 0, 8, H-1, W-1, T.COBBLE);
    houseEra(m, 2, 9, 5, 5, 1);
    // Flowers on house fronts
    for (let r = 0; r < H; r += 2) set(m, r, 4, T.FLOWER);
    grid[2][2] = makeScreen(m, {left:{pos:HP},right:{pos:HP},up:{pos:VP},down:{pos:VP}}, '2026 · Bakenessergracht', {r:HP,c:10}); }

  // [2,3] Grote Markt approach — open cobblestone square begins
  { const m = blank(T.COBBLE);
    // Open market square starts here — no buildings, market stalls
    fill(m, 2, 2, H-3, W-3, T.COBBLE);
    // Market stalls
    fill(m, 3, 3, 5, 6, T.HOUSE_WALL);
    fill(m, 3, 13, 5, 16, T.HOUSE_WALL);
    fill(m, 8, 3, 10, 6, T.HOUSE_WALL);
    // Statue of Laurens Janszoon Coster (inventor of printing)
    set(m, 6, 10, T.ROCK); // statue base
    grid[2][3] = makeScreen(m, {left:{pos:HP},up:{pos:VP},down:{pos:VP}}, '2026 · Grote Markt West', {r:HP,c:9}); }

  // [3,0] Stadsbos De Hout — city forest park
  { const m = blank(T.GRASS);
    // Dense forest area
    fill(m, 0, 0, 5, W-1, T.TREE);
    fill(m, 3, 4, 7, 14, T.GRASS);  // clearing with path
    fill(m, 6, 0, H-1, W-1, T.GRASS);
    for (let c = 1; c < W-1; c += 3) set(m, 8, c, T.TREE);
    fill(m, 9, 5, 11, 12, T.WATER); // forest pond — good fishing
    set(m, 10, 8, T.BRIDGE);
    grid[3][0] = makeScreen(m, {right:{pos:HP},up:{pos:VP}}, '2026 · Stadsbos De Hout', {r:HP,c:8}); }

  // [3,1] Forest park south — meadow with pond
  { const m = blank(T.GRASS);
    fill(m, 0, 0, 2, W-1, T.TREE);   // trees only rows 0-2 (was 0-3)
    fill(m, 3, 0, H-1, W-1, T.GRASS); // row 3+ is clear grass — entry from north lands here
    fill(m, 5, 5, 9, 13, T.WATER);   // fishing lake
    set(m, 7, 5, T.BRIDGE); set(m, 7, 6, T.BRIDGE);
    // Clear a wide safe corridor at the top for the 'up' entry passage
    fill(m, 3, 8, 4, 12, T.GRASS);
    // Benches
    set(m, 10, 4, T.ROCK); set(m, 10, 14, T.ROCK);
    grid[3][1] = makeScreen(m, {left:{pos:HP},right:{pos:HP},up:{pos:VP}}, '2026 · Park Fishing Pond', {r:9,c:10}); }

  // [3,2] GROTE MARKT — the main town square
  { const m = blank(T.COBBLE);
    // Entire screen is the grand square
    fill(m, 0, 0, H-1, W-1, T.COBBLE);

    // Stadhuis (town hall) — west side
    fill(m, 0, 0, 5, 5, T.HOUSE_WALL);
    fill(m, 0, 0, 0, 5, T.HOUSE_ROOF);
    set(m, 5, 2, T.DOOR);

    // Vleeshal (meat hall) — north-east corner
    fill(m, 0, 14, 5, W-1, T.BRICK);
    fill(m, 0, 14, 0, W-1, T.HOUSE_ROOF);
    set(m, 5, 16, T.DOOR);

    // TIERNEY'S IRISH PUB — Spekstraat 8, just off the Grote Markt
    // South side of the square, green-painted facade (brick base)
    fill(m, H-6, 1, H-2, 7, T.BRICK);       // pub building
    fill(m, H-6, 1, H-6, 7, T.HOUSE_ROOF);  // roof
    set(m, H-2, 4, T.DOOR);                  // pub entrance
    // Green awning tiles (FLOWER — closest to a coloured decoration)
    fill(m, H-6, 1, H-6, 7, T.FLOWER);       // green awning along roofline
    // Outdoor pub tables on cobblestone (weekend lunch seating)
    set(m, H-3, 8, T.ROCK);  set(m, H-3, 10, T.ROCK);   // table 1 & 2
    set(m, H-2, 8, T.ROCK);  set(m, H-2, 10, T.ROCK);   // table 3 & 4

    // SATURDAY FLOWER MARKET stalls — centre of the square
    // Fresh tulips, roses, seasonal Dutch flowers
    fill(m, 8, 5, 10, 7, T.FLOWER);    // flower stall 1 — tulips
    fill(m, 8, 9, 10, 11, T.FLOWER);   // flower stall 2 — roses
    fill(m, 8, 13, 10, 15, T.FLOWER);  // flower stall 3 — seasonal
    // Stall awnings (HOUSE_WALL behind flowers)
    fill(m, 8, 5, 8, 7, T.HOUSE_WALL);
    fill(m, 8, 9, 8, 11, T.HOUSE_WALL);
    fill(m, 8, 13, 8, 15, T.HOUSE_WALL);

    // Central open cobblestone with statue of Coster
    set(m, 5, 9, T.ROCK); set(m, 5, 10, T.ROCK);  // statue plinth

    // Path from church entrance (east) toward Tierney's (west)
    fill(m, H-4, 1, H-4, W-1, T.ROAD);  // worn cobblestone path across square

    clearZone(m, HP, VP, 3);
    grid[3][2] = makeScreen(m, {left:{pos:HP},right:{pos:HP},up:{pos:VP}},
      '2026 · Grote Markt & Tierney\'s Irish Pub', {r:HP,c:VP}); }

  // [3,3] SINT-BAVO GROTE KERK + TIME PORTAL
  { const m = blank(T.COBBLE);
    // The church is massive — occupies most of the screen
    // Gothic Sint-Bavo: thick walls, tall nave, side aisles
    fill(m, 0, 2, H-2, W-3, T.BRICK);     // church body
    fill(m, 0, 2, 1, W-3, T.HOUSE_ROOF);   // roof ridge line
    // Nave walls (thicker)
    fill(m, 1, 5, H-3, 14, T.HOUSE_WALL);  // interior lighter colour
    // Tower / spire base (NW corner — 80m spire)
    fill(m, 0, 2, 5, 5, T.WALL);            // tower base
    // Church entrance — three doorways (Gothic triple portal)
    set(m, H-2, 7, T.DOOR); set(m, H-2, 9, T.DOOR); set(m, H-2, 11, T.DOOR);
    // TIME PORTAL floats inside the church (the adventure begins!)
    set(m, 3, 9, T.PORTAL); set(m, 3, 10, T.PORTAL); set(m, 3, 11, T.PORTAL);
    // Flying buttresses (ROCK tiles on sides)
    for (let r = 2; r < H-2; r += 3) {
      set(m, r, 2, T.ROCK);
      set(m, r, W-3, T.ROCK);
    }
    // Churchyard cobblestone
    fill(m, H-3, 2, H-1, W-3, T.COBBLE);
    clearZone(m, H-3, 9, 2); // spawn near church door
    grid[3][3] = makeScreen(m, {left:{pos:HP},up:{pos:VP}},
      '2026 · Grote Kerk Sint-Bavo — Haarlem', {r:H-3,c:9}); }

  return grid;
}

// ── ERA 8 · MANKATO — 313 Hanover Street ─────────────────
// Based on actual street: late-19th-century Victorian homes
// built 1878–1904, compact urban blocks, front porches,
// paved sidewalks. Near Blue Earth River (~4 blocks west),
// riverfront park. Minnesota State University nearby.
// Layout:
//   [0,0] Riverfront park / Blue Earth River
//   [0,1] River bank path and trees
//   [0,2] N Riverfront Drive residential
//   [0,3] Old residential block (Victorian houses)
//   [1,0] HOME: 313 Hanover St (Peter John's house)
//   [1,1] Hanover St north (more Victorian homes)
//   [1,2] Cross street / neighbourhood block
//   [1,3] Commercial/Main St area
//   [2,0] Neighbourhood park with trees
//   [2,1] Elementary school / community building
//   [2,2] Residential block east
//   [2,3] Downtown Mankato approach
//   [3,0] River bend / fishing area
//   [3,1] Riverside walking trail
//   [3,2] Old downtown / Carnegie Art Center
//   [3,3] TIME PORTAL: Grandpa Peter John's attic

function _buildMankatoWorld() {
  const grid = Array.from({length: WORLD_ROWS}, () => Array(WORLD_COLS).fill(null));
  const HP = 7, VP = 10;

  // Helper: Minnesota residential block — sidewalks, front yards, Victorian houses
  function residentialBlock(housePositions = [[1,2],[1,13]]) {
    const m = blank(T.GRASS);
    // Sidewalk along south edge
    fill(m, H-3, 0, H-1, W-1, T.COBBLE);
    // Road running east-west through middle
    fill(m, HP-1, 0, HP+1, W-1, T.ROAD);
    // Houses
    housePositions.forEach(([r,c]) => {
      houseEra(m, r, c, 5, 5, 5);
    });
    // Trees along sidewalk (boulevard trees — classic Mankato)
    for (let c = 2; c < W-2; c += 4) {
      if (m[HP-3]?.[c] === T.GRASS) set(m, HP-3, c, T.TREE);
    }
    return m;
  }

  // [0,0] Blue Earth River park — west bank
  { const m = blank(T.GRASS);
    fill(m, 0, 0, H-1, 5, T.WATER);     // Blue Earth River
    fill(m, 0, 6, H-1, 8, T.ROAD);      // riverfront drive
    fill(m, 3, 9, 9, W-1, T.GRASS);
    fill(m, 4, 10, 8, W-2, T.FLOWER);   // park flowers
    for (let c = 9; c < W-1; c += 3) set(m, 2, c, T.TREE);
    // Fishing dock
    set(m, HP, 5, T.BRIDGE); set(m, HP, 4, T.BRIDGE);
    grid[0][0] = makeScreen(m, {right:{pos:HP},down:{pos:VP}}, '2026 · Blue Earth River Park', {r:HP,c:9}); }

  // [0,1] River bank and walking path
  { const m = blank(T.GRASS);
    fill(m, 0, 0, H-1, 4, T.WATER);
    fill(m, 0, 5, H-1, 7, T.ROAD);      // N Riverfront Drive
    fill(m, 0, 8, H-1, W-1, T.GRASS);
    for (let r = 1; r < H-1; r += 3) set(m, r, 9, T.TREE);
    // Fishing spot
    set(m, 5, 4, T.BRIDGE);
    grid[0][1] = makeScreen(m, {left:{pos:HP},right:{pos:HP},down:{pos:VP}}, '2026 · N Riverfront Drive', {r:HP,c:9}); }

  // [0,2] Riverfront residential block
  { const m = residentialBlock([[1,5],[1,14]]);
    fill(m, 0, 0, H-1, 3, T.WATER);     // river still visible west
    fill(m, 0, 4, H-1, 5, T.ROAD);
    grid[0][2] = makeScreen(m, {left:{pos:HP},right:{pos:HP},down:{pos:VP}}, '2026 · Riverfront Homes', {r:HP,c:10}); }

  // [0,3] Victorian residential block north
  { const m = residentialBlock([[1,3],[1,13]]);
    // 1887-era Victorian details — porch elements
    for (let r = 5; r < 8; r++) set(m, r, 2, T.PLANK);  // porch
    grid[0][3] = makeScreen(m, {left:{pos:HP},down:{pos:VP}}, '2026 · Hanover St North Homes', {r:HP,c:10}); }

  // [1,0] HOME: 313 Hanover St — Peter John's Victorian house
  { const m = blank(T.GRASS);
    // Hanover St runs east-west
    fill(m, HP-1, 0, HP+1, W-1, T.ROAD);
    // Sidewalk
    fill(m, HP-3, 0, HP-2, W-1, T.COBBLE);
    fill(m, HP+2, 0, HP+3, W-1, T.COBBLE);
    // THE HOUSE: 313 Hanover St — 2-story Victorian, built ~1890s
    // Two-story with front porch (built 1878-1891 range for this block)
    fill(m, 1, 6, 5, 13, T.HOUSE_WALL);   // house main body
    fill(m, 0, 6, 0, 13, T.HOUSE_ROOF);   // roof
    set(m, 5, 9, T.DOOR);                  // front door (faces street)
    // Front porch
    fill(m, 5, 7, 5, 11, T.PLANK);        // porch floor
    // Fence / yard
    fill(m, 1, 5, 5, 5, T.ROCK);          // left fence
    fill(m, 1, 14, 5, 14, T.ROCK);        // right fence
    fill(m, 1, 6, 1, 13, T.FLOWER);       // front garden
    // Backyard garden
    fill(m, H-5, 4, H-2, 14, T.GRASS);
    fill(m, H-4, 5, H-3, 7, T.CROP_READY); // vegetable garden
    // Neighbours (houses on both sides — compact urban block)
    fill(m, 1, 0, 5, 4, T.HOUSE_WALL);   // neighbour left
    fill(m, 0, 0, 0, 4, T.HOUSE_ROOF);
    fill(m, 1, 15, 5, W-1, T.HOUSE_WALL); // neighbour right
    fill(m, 0, 15, 0, W-1, T.HOUSE_ROOF);
    // Boulevard tree (Mankato signature)
    set(m, HP-4, 7, T.TREE); set(m, HP-4, 12, T.TREE);
    // TIME PORTAL in the attic
    set(m, 1, 9, T.PORTAL); set(m, 1, 10, T.PORTAL);
    clearZone(m, HP, 9, 2);
    grid[1][0] = makeScreen(m, {right:{pos:HP},up:{pos:VP},down:{pos:VP}},
      '2026 · 313 Hanover St, Mankato MN', {r:HP,c:9}); }

  // [1,1] Hanover St mid-block Victorian homes
  { const m = residentialBlock([[1,3],[1,13]]);
    // Extra porch details
    fill(m, 5, 3, 5, 6, T.PLANK);
    fill(m, 5, 13, 5, 16, T.PLANK);
    // Boulevard trees (maples — classic Minnesota street)
    set(m, HP-4, 5, T.TREE); set(m, HP-4, 14, T.TREE);
    grid[1][1] = makeScreen(m, {left:{pos:HP},right:{pos:HP},up:{pos:VP},down:{pos:VP}}, '2026 · Hanover St Homes', {r:HP,c:9}); }

  // [1,2] Cross street / neighbourhood square
  { const m = blank(T.GRASS);
    fill(m, HP-1, 0, HP+1, W-1, T.ROAD);    // Hanover running E-W
    fill(m, 0, VP-1, H-1, VP+1, T.ROAD);    // cross street N-S
    // Four-way intersection
    fill(m, HP-3, VP-3, HP+3, VP+3, T.COBBLE);
    houseEra(m, 1, 1, 5, 5, 5);
    houseEra(m, 1, 14, 5, 5, 5);
    houseEra(m, H-7, 1, 5, 5, 5);
    houseEra(m, H-7, 14, 5, 5, 5);
    // Stop sign / crosswalk
    set(m, HP-2, VP-2, T.ROCK);
    grid[1][2] = makeScreen(m, {left:{pos:HP},right:{pos:HP},up:{pos:VP},down:{pos:VP}}, '2026 · Hanover & 4th St', {r:HP,c:9}); }

  // [1,3] Commercial area / Main Street
  { const m = blank(T.COBBLE);
    fill(m, 0, 0, H-1, W-1, T.COBBLE);
    // Storefronts
    fill(m, 0, 0, 5, 7, T.BRICK);
    fill(m, 0, 12, 5, W-1, T.BRICK);
    set(m, 5, 3, T.DOOR); set(m, 5, 14, T.DOOR);
    // Main road
    fill(m, HP-1, 0, HP+1, W-1, T.ROAD);
    grid[1][3] = makeScreen(m, {left:{pos:HP},up:{pos:VP},down:{pos:VP}}, '2026 · Main Street Mankato', {r:HP,c:9}); }

  // [2,0] Neighbourhood park with trees
  { const m = blank(T.GRASS);
    for (let r = 2; r < H-2; r += 3) for (let c = 2; c < W-2; c += 3) {
      if (Math.random() > 0.6) set(m, r, c, T.TREE);
    }
    fill(m, 5, 5, 8, 14, T.FLOWER);
    fill(m, 0, 0, 2, W-1, T.ROAD);   // road at top
    grid[2][0] = makeScreen(m, {right:{pos:HP},up:{pos:VP},down:{pos:VP}}, '2026 · Tourtellotte Park', {r:HP,c:10}); }

  // [2,1] School / community building
  { const m = blank(T.GRASS);
    fill(m, 1, 2, 7, W-3, T.HOUSE_WALL);   // school building
    fill(m, 0, 2, 0, W-3, T.HOUSE_ROOF);
    fill(m, 7, 8, 7, 11, T.DOOR);           // school entrance
    fill(m, H-5, 2, H-2, W-3, T.GRASS);     // playground
    fill(m, H-4, 4, H-3, 7, T.COBBLE);      // basketball court
    fill(m, 0, 0, H-1, 1, T.ROAD);          // road
    grid[2][1] = makeScreen(m, {left:{pos:HP},right:{pos:HP},up:{pos:VP},down:{pos:VP}}, '2026 · Washington School', {r:HP,c:9}); }

  // [2,2] More residential east
  { const m = residentialBlock([[1,4],[1,14]]);
    grid[2][2] = makeScreen(m, {left:{pos:HP},right:{pos:HP},up:{pos:VP},down:{pos:VP}}, '2026 · East Residential', {r:HP,c:9}); }

  // [2,3] Downtown approach
  { const m = blank(T.COBBLE);
    fill(m, 0, 0, H-1, W-1, T.COBBLE);
    fill(m, HP-1, 0, HP+1, W-1, T.ROAD);
    fill(m, 0, 7, H-1, 12, T.ROAD);    // main street
    houseEra(m, 1, 1, 5, 5, 5);
    houseEra(m, 1, 13, 5, 6, 5);
    grid[2][3] = makeScreen(m, {left:{pos:HP},up:{pos:VP},down:{pos:VP}}, '2026 · Downtown Mankato', {r:HP,c:9}); }

  // [3,0] River bend — fishing spot
  { const m = blank(T.GRASS);
    fill(m, 0, 0, H-1, 8, T.WATER);   // wide river bend
    fill(m, 5, 8, 8, 10, T.BRIDGE);   // fishing dock
    fill(m, 0, 9, H-1, W-1, T.GRASS);
    for (let r = 1; r < H-1; r += 3) set(m, r, 10, T.TREE);
    grid[3][0] = makeScreen(m, {right:{pos:HP},up:{pos:VP}}, '2026 · River Bend Fishing', {r:HP,c:10}); }

  // [3,1] Riverfront walking trail
  { const m = blank(T.GRASS);
    fill(m, 0, 0, H-1, 3, T.WATER);
    fill(m, 0, 4, H-1, 6, T.ROAD);    // trail
    fill(m, 0, 7, H-1, W-1, T.GRASS);
    for (let c = 8; c < W-1; c += 3) set(m, 4, c, T.TREE);
    fill(m, 6, 8, 10, W-3, T.FLOWER);
    grid[3][1] = makeScreen(m, {left:{pos:HP},right:{pos:HP},up:{pos:VP}}, '2026 · Riverfront Trail', {r:HP,c:10}); }

  // [3,2] Carnegie Art Center / old downtown
  { const m = blank(T.COBBLE);
    // Carnegie building (historic brick)
    fill(m, 1, 3, 7, 10, T.BRICK);
    fill(m, 0, 3, 0, 10, T.HOUSE_ROOF);
    set(m, 7, 6, T.DOOR); set(m, 7, 7, T.DOOR);
    // Blue Bricks bar area
    fill(m, 1, 12, 7, W-2, T.BRICK);
    set(m, 7, 14, T.DOOR);
    fill(m, H-4, 0, H-1, W-1, T.ROAD);
    grid[3][2] = makeScreen(m, {left:{pos:HP},right:{pos:HP},up:{pos:VP}}, '2026 · Carnegie Art Center', {r:HP,c:9}); }

  // [3,3] TIME PORTAL — Peter John's attic / back at 313 Hanover
  { const m = blank(T.COBBLE);
    // Attic interior feel — wooden planks, stored boxes
    fill(m, 0, 0, H-1, W-1, T.PLANK);
    fill(m, 2, 2, H-3, W-3, T.DIRT);
    // Old boxes and items (ROCK placeholders)
    set(m, 3, 4, T.ROCK); set(m, 3, 14, T.ROCK);
    set(m, 8, 4, T.ROCK); set(m, 8, 14, T.ROCK);
    // The family journal (CROP_READY — glowing item)
    set(m, HP-1, VP-1, T.CROP_READY); set(m, HP-1, VP, T.CROP_READY);
    // TIME PORTAL
    set(m, HP, 9, T.PORTAL); set(m, HP, 10, T.PORTAL); set(m, HP, 11, T.PORTAL);
    clearZone(m, HP, 9, 2);
    grid[3][3] = makeScreen(m, {left:{pos:HP},up:{pos:VP}},
      '2026 · Grandpa\'s Attic — 313 Hanover St', {r:HP,c:9}); }

  return grid;
}

function _screenTitle(era, row, col) {
  const eraName = ERAS[era]?.year || '';
  const rowNames = [['Northern Wilderness','Forest Edge','Open Heath','Ancient Stones'],
                    ['Church & Market','Town Centre','Farmland','Windmill Fields'],
                    ['River Crossing','South Village','East Fields','Fishing Lake'],
                    ['The Tavern','South Road','The Crossroads','Time Portal']];
  return `${eraName} · ${rowNames[row]?.[col] || ''}`;
}
