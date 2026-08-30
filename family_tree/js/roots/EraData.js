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
  tax_collector:   { name:'Tax Collector',   emoji:'💰', color:'#8a6020', accent:'#c09030', hp:4, speed:55, damage:20, chaseRange:190 },
  plague_rat:      { name:'Plague Rat',      emoji:'🐀', color:'#3a3020', accent:'#607020', hp:2, speed:90, damage:12, chaseRange:150 },
  inquisitor:      { name:'Inquisitor',      emoji:'⛪', color:'#1a1040', accent:'#4030a0', hp:6, speed:45, damage:25, chaseRange:220 },
  spanish_soldier: { name:'Spanish Soldier', emoji:'⚔️', color:'#7a1010', accent:'#c02020', hp:5, speed:60, damage:22, chaseRange:190 },
  pickpocket:      { name:'Pickpocket',      emoji:'🤏', color:'#404040', accent:'#808080', hp:2, speed:100,damage:8,  chaseRange:160 },
  debt_collector:  { name:'Debt Collector',  emoji:'📜', color:'#503010', accent:'#806020', hp:3, speed:50, damage:15, chaseRange:170 },
  fr_conscript:    { name:'French Conscript',emoji:'🪖', color:'#2a3a6a', accent:'#4a6aaa', hp:4, speed:65, damage:20, chaseRange:190 },
  deserter:        { name:'Deserter',        emoji:'🏃', color:'#5a5020', accent:'#8a8040', hp:3, speed:85, damage:18, chaseRange:170 },
  overseer:        { name:'Factory Overseer',emoji:'🏭', color:'#2a1a0a', accent:'#5a3a1a', hp:5, speed:55, damage:22, chaseRange:180 },
  steam_machine:   { name:'Steam Machine',   emoji:'⚙️', color:'#4a4040', accent:'#8a8080', hp:8, speed:40, damage:30, chaseRange:150 },
  storm_wave:      { name:'Storm Wave',      emoji:'🌊', color:'#1a3a5a', accent:'#2a6a9a', hp:3, speed:80, damage:25, chaseRange:200 },
  u_boat:          { name:'U-Boat Ghost',    emoji:'🛸', color:'#1a2a1a', accent:'#3a5a3a', hp:5, speed:50, damage:28, chaseRange:220 },
  mccarthyist:     { name:'McCarthyist',     emoji:'🔍', color:'#2a2050', accent:'#5a4a90', hp:4, speed:55, damage:20, chaseRange:180 },
  tornado:         { name:'Tornado',         emoji:'🌪️', color:'#4a4a5a', accent:'#7a7a9a', hp:6, speed:70, damage:30, chaseRange:260 },
  cold_war_spy:    { name:'Cold War Spy',    emoji:'🕵️', color:'#1a1a2a', accent:'#3a3a5a', hp:5, speed:65, damage:22, chaseRange:200 },
  computer_virus:  { name:'Computer Virus',  emoji:'💻', color:'#0a2a0a', accent:'#0a6a0a', hp:4, speed:75, damage:18, chaseRange:180 },
  virus_cloud:     { name:'Virus Cloud',     emoji:'🦠', color:'#1a0a2a', accent:'#4a1a6a', hp:5, speed:60, damage:25, chaseRange:220 },
  misinfo_bot:     { name:'Misinfo Bot',     emoji:'📱', color:'#0a1a2a', accent:'#1a3a5a', hp:3, speed:70, damage:15, chaseRange:200 },
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
];

// ── Fishing catches per era ───────────────────────────────
export const FISH_TABLES = [
  [ {id:'perch',  label:'Perch',      emoji:'🐟', hp:15, common:true},  {id:'old_boot', label:'Old Boot', emoji:'👢', comedic:true} ],
  [ {id:'bream',  label:'Bream',      emoji:'🐟', hp:15, common:true},  {id:'voc_coin', label:'VOC Coin', emoji:'🪙'} ],
  [ {id:'carp',   label:'Carp',       emoji:'🐟', hp:20, common:true},  {id:'fr_button',label:'French Button',emoji:'🔘'} ],
  [ {id:'eel',    label:'Eel',        emoji:'🐟', hp:15, common:true},  {id:'iron_gear',label:'Iron Gear',emoji:'⚙️'} ],
  [ {id:'flying', label:'Flying Fish', emoji:'🐠', hp:20, common:true}, {id:'flotsam',  label:'Flotsam', emoji:'🪵'} ],
  [ {id:'walleye',label:'Walleye',    emoji:'🐟', hp:25, common:true},  {id:'old_lure', label:'Old Lure', emoji:'🎣'} ],
  [ {id:'bass',   label:'Bass',       emoji:'🐟', hp:20, common:true},  {id:'retro_lure',label:'Retro Lure',emoji:'🎣'} ],
  [ {id:'pike',   label:'Pike',       emoji:'🐟', hp:30, common:true},  {id:'smart_buoy',label:'Smart Buoy',emoji:'📡'} ],
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
function house(m, r, c, w, h) {
  fill(m, r, c, r, c+w-1, T.HOUSE_ROOF);
  fill(m, r+1, c, r+h-1, c+w-1, T.HOUSE_WALL);
  set(m, r+h-1, c + Math.floor(w/2), T.DOOR);
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

function makeScreen(map, exits = {}, title = '', spawn = {r:7, c:10}) {
  Object.entries(exits).forEach(([side, {pos}]) => openEdge(map, side, pos));
  clearZone(map, spawn.r, spawn.c, 2);
  return { map, exits, title, spawn };
}

// ── World builder ─────────────────────────────────────────
export function buildEraWorld(eraId) {
  const grid = Array.from({length: WORLD_ROWS}, () => Array(WORLD_COLS).fill(null));
  const HP = 7;   // horizontal passage row
  const VP = 10;  // vertical passage col

  // Each era builds its 4×4 grid
  // Row 0 = wilderness/outskirts  Row 1 = settlement  Row 2 = working land  Row 3 = portal zone
  const themes = [
    { base:T.GRASS,      accent:T.WHEAT,      water:T.WATER,  struct:T.HOUSE_WALL },  // 0 medieval
    { base:T.COBBLE,     accent:T.FLOWER,     water:T.WATER,  struct:T.BRICK },       // 1 golden age
    { base:T.GRASS,      accent:T.WHEAT,      water:T.WATER,  struct:T.HOUSE_WALL },  // 2 napoleonic
    { base:T.DIRT,       accent:T.WHEAT,      water:T.WATER,  struct:T.BRICK },       // 3 industrial
    { base:T.PLANK,      accent:T.PLANK,      water:T.DEEP_WATER,struct:T.PLANK },    // 4 ship
    { base:T.GRASS,      accent:T.CORN,       water:T.WATER,  struct:T.HOUSE_WALL },  // 5 minnesota
    { base:T.GRASS,      accent:T.FLOWER,     water:T.WATER,  struct:T.HOUSE_WALL },  // 6 split
    { base:T.COBBLE,     accent:T.FLOWER,     water:T.WATER,  struct:T.STEEL },       // 7 modern
  ];
  const th = themes[eraId] || themes[0];

  for (let row = 0; row < WORLD_ROWS; row++) {
    for (let col = 0; col < WORLD_COLS; col++) {
      const m = blank(th.base);
      border(m, T.TREE);

      if (row === 0) {
        // Wilderness — dense trees, occasional clearings
        fill(m, 1, 1, H-3, W-3, T.TREE);
        fill(m, 3, 4, 9, 14, T.GRASS);
        if (Math.random() > 0.5) fill(m, 5, 7, 7, 11, T.FLOWER);
      } else if (row === 1) {
        // Settlement
        if (col === 0) {
          // [1,0] — merchant / church
          house(m, 1, 2, 6, 5);
          fill(m, 1, 2, 5, 7, T.COBBLE);
          fill(m, 7, 1, H-3, 8, th.accent);
        } else if (col === 1) {
          // [1,1] — town centre (key ancestor here)
          fill(m, 3, 4, 9, 15, T.COBBLE);
          house(m, 1, 1, 5, 4); house(m, 1, 14, 5, 4);
          for (let r = 1; r < H-1; r++) { m[r][9] = T.ROAD; m[r][10] = T.ROAD; }
          // Portal hint (portal is at [3,3] but a well/marker here)
          set(m, H-2, 9, T.CROP_READY);
        } else if (col === 2) {
          // [1,2] — farm fields
          fill(m, 2, 2, H-3, 8, th.accent);
          fill(m, 2, 11, H-3, W-3, th.accent);
          // Crop patches
          fill(m, 4, 3, 4, 6, T.CROP_READY); fill(m, 7, 3, 7, 6, T.CROP_READY);
          house(m, 2, 10, 5, 5);
          for (let r = 1; r < H-1; r++) m[r][9] = T.ROAD;
        } else {
          // [1,3] — outskirt farm
          fill(m, 2, 2, H-3, W-3, th.accent);
          house(m, 3, 13, 5, 4);
        }
      } else if (row === 2) {
        // Working land / water
        if (col === 0) {
          // River / canal
          for (let c = 1; c < W-1; c++) { m[5][c] = th.water; m[6][c] = th.water; }
          m[5][9] = T.BRIDGE; m[5][10] = T.BRIDGE;
          m[6][9] = T.BRIDGE; m[6][10] = T.BRIDGE;
          fill(m, 1, 1, 4, W-2, T.GRASS); fill(m, 7, 1, H-3, W-2, T.GRASS);
        } else if (col === 1) {
          // South village
          house(m, 1, 2, 5, 4); house(m, 1, 13, 5, 4);
          for (let r = 1; r < H-1; r++) { m[r][9] = T.COBBLE; m[r][10] = T.COBBLE; }
          fill(m, 8, 2, H-3, 6, T.FLOWER);
        } else if (col === 2) {
          // Farm + fishing spot
          fill(m, 1, 1, H-3, 8, th.accent);
          fill(m, 1, 11, H-3, W-3, T.GRASS);
          for (let r = 1; r < H-1; r++) m[r][9] = T.ROAD;
          // Water edge for fishing
          for (let c = 11; c < W-2; c++) { m[10][c] = th.water; m[11][c] = th.water; }
        } else {
          // [2,3] — open fields + fishing lake
          fill(m, 1, 1, 7, W-3, T.FLOWER);
          for (let c = 3; c < 14; c++) { m[9][c] = th.water; m[10][c] = th.water; m[11][c] = th.water; }
          m[9][9] = T.BRIDGE; m[10][9] = T.BRIDGE;
        }
      } else { // row === 3
        if (col === 0) {
          // [3,0] — innkeeper
          house(m, 2, 3, 6, 5);
          fill(m, 2, 3, 6, 8, T.COBBLE);
          fill(m, 7, 1, H-3, W-3, th.accent);
        } else if (col === 1) {
          // [3,1] — road south
          for (let r = 1; r < H-1; r++) { m[r][9] = T.ROAD; m[r][10] = T.ROAD; }
          fill(m, 1, 1, H-3, 8, T.GRASS);
          fill(m, 1, 11, H-3, W-3, T.GRASS);
        } else if (col === 2) {
          // [3,2] — boss room (open area)
          border(m, T.ROCK);
          fill(m, 2, 2, H-3, W-3, T.GRASS);
          fill(m, 4, 6, 9, 13, T.COBBLE);
        } else {
          // [3,3] — TIME PORTAL
          border(m, T.ROCK);
          fill(m, 2, 2, H-3, W-3, th.accent);
          [[4,8],[4,11],[6,7],[6,12],[8,9],[8,10]].forEach(([r,c]) => set(m,r,c,T.ROCK));
          set(m, HP, 9, T.PORTAL); set(m, HP, 10, T.PORTAL); set(m, HP, 11, T.PORTAL);
        }
      }

      // Exits based on grid position
      const exits = {};
      if (col < WORLD_COLS-1) exits.right = { pos: HP };
      if (col > 0)            exits.left  = { pos: HP };
      if (row < WORLD_ROWS-1) exits.down  = { pos: VP };
      if (row > 0)            exits.up    = { pos: VP };

      // Special: [3,3] has no left/right exits (portal room is a dead end)
      if (row === 3 && col === 3) { delete exits.right; }

      const title = _screenTitle(eraId, row, col);
      const spawn = { r: HP, c: row === 3 && col === 3 ? 5 : VP };
      clearZone(m, spawn.r, spawn.c, 2);
      grid[row][col] = makeScreen(m, exits, title, spawn);
    }
  }
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
