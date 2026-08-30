// ═══════════════════════════════════════════════════════════════
//  ERAS — Era definitions, world maps, enemies, item configs
// ═══════════════════════════════════════════════════════════════
import { T } from './renderer.js';
import { TILE } from './entities.js';

export const SCREEN_COLS = 22;
export const SCREEN_ROWS = 14;

// ── ERA METADATA ─────────────────────────────────────────────
export const ERAS = [
  { id:0, year:'1539', name:'Aarle-Rixtel, Netherlands',
    music:0, portalItem:null,
    enemies:['tax_collector','plague_rat','inquisitor'],
    desc:'The first Van Duynhovens farm the heathlands of Noord-Brabant.' },
  { id:1, year:'1660', name:'Dutch Golden Age',
    music:1, portalItem:'seal',
    enemies:['spanish_soldier','pickpocket','sailor'],
    desc:'Amsterdam grows rich, but Catholics in the south struggle.' },
  { id:2, year:'1799', name:'Napoleonic Uden',
    music:2, portalItem:'prayer_book',
    enemies:['french_conscript','deserter','looter'],
    desc:'Napoleon\'s armies march through the Netherlands.' },
  { id:3, year:'1872', name:'Industrial Uden',
    music:3, portalItem:'birth_record',
    enemies:['factory_overseer','steam_machine','strike_breaker'],
    desc:'Railways and factories transform the old village ways.' },
  { id:4, year:'1950', name:'Atlantic Ocean — Emigrant Ship',
    music:4, portalItem:'train_ticket',
    enemies:['storm_wave','u_boat_ghost','sea_sickness'],
    desc:'Johan and family sail ten days to their new home in Minnesota.' },
  { id:5, year:'1955', name:'Minnesota Farmland',
    music:5, portalItem:'immigration_papers',
    enemies:['mccarthyist','tornado','crop_pest'],
    desc:'The first American-born Van Duynhovens grow up on the prairie.' },
  { id:6, year:'1984', name:'Wisconsin & Netherlands',
    music:6, portalItem:'baseball_card',
    enemies:['cold_war_spy','computer_virus','road_rager'],
    desc:'Gen 6 spans two continents. Some cousins move back to Holland.' },
  { id:7, year:'2020', name:'Minnesota & Haarlem',
    music:7, portalItem:'floppy_disk',
    enemies:['virus_cloud','misinformation_bot','climate_storm'],
    desc:'Gen 7 video-calls across the Atlantic. 500 years complete.' },
];

// ── ENEMY CONFIGS ─────────────────────────────────────────────
export const ENEMY_DEFS = {
  // Era 0 — Medieval
  tax_collector: {name:'Tax Collector',emoji:'💰',color:'#8a6020',accent:'#c09030',hp:4,speed:55,damage:20,chaseRange:180,
    desc:'A corrupt official demanding tribute from farmers.'},
  plague_rat: {name:'Plague Rat',emoji:'🐀',color:'#3a3020',accent:'#607020',hp:2,speed:90,damage:12,chaseRange:140,
    desc:'Carries the Black Death through the heathlands.'},
  inquisitor: {name:'Inquisitor',emoji:'⛪',color:'#1a1040',accent:'#4030a0',hp:6,speed:45,damage:25,chaseRange:200,
    desc:'A church official hunting for heretics.'},
  // Era 1 — Golden Age
  spanish_soldier: {name:'Spanish Soldier',emoji:'⚔️',color:'#7a1010',accent:'#c02020',hp:5,speed:60,damage:22,chaseRange:180,
    desc:'Spanish Habsburg troops still occupy parts of the Netherlands.'},
  pickpocket: {name:'Pickpocket',emoji:'🤏',color:'#404040',accent:'#808080',hp:2,speed:100,damage:8,chaseRange:150,
    desc:'Quick fingers in Amsterdam\'s busy markets.'},
  sailor: {name:'Rough Sailor',emoji:'⚓',color:'#3a5a7a',accent:'#5a8aaa',hp:3,speed:65,damage:15,chaseRange:160,
    desc:'A VOC sailor who\'s had too much Dutch gin.'},
  // Era 2 — Napoleonic
  french_conscript: {name:'French Conscript',emoji:'🪖',color:'#2a3a6a',accent:'#4a6aaa',hp:4,speed:65,damage:20,chaseRange:190,
    desc:'A young French soldier far from home, afraid and dangerous.'},
  deserter: {name:'Deserter',emoji:'🏃',color:'#5a5020',accent:'#8a8040',hp:3,speed:85,damage:18,chaseRange:170,
    desc:'A deserter who\'ll rob civilians to survive.'},
  looter: {name:'Wartime Looter',emoji:'💀',color:'#3a2020',accent:'#6a4040',hp:3,speed:70,damage:20,chaseRange:160,
    desc:'War brings out the worst in desperate people.'},
  // Era 3 — Industrial
  factory_overseer: {name:'Factory Overseer',emoji:'🏭',color:'#2a1a0a',accent:'#5a3a1a',hp:5,speed:55,damage:22,chaseRange:170,
    desc:'Drives workers mercilessly in the new steam factories.'},
  steam_machine: {name:'Steam Machine',emoji:'⚙️',color:'#4a4040',accent:'#8a8080',hp:8,speed:40,damage:30,chaseRange:140,
    desc:'A malfunctioning steam-powered machine out of control.'},
  strike_breaker: {name:'Strike Breaker',emoji:'🤜',color:'#3a2a1a',accent:'#7a5a3a',hp:4,speed:70,damage:18,chaseRange:180,
    desc:'Hired by factory owners to crush worker uprisings.'},
  // Era 4 — Ship
  storm_wave: {name:'Storm Wave',emoji:'🌊',color:'#1a3a5a',accent:'#2a6a9a',hp:3,speed:80,damage:25,chaseRange:200,
    desc:'A massive Atlantic wave threatening the ship.'},
  u_boat_ghost: {name:'U-Boat Ghost',emoji:'🛸',color:'#1a2a1a',accent:'#3a5a3a',hp:5,speed:50,damage:28,chaseRange:220,
    desc:'The ghost of a WWII submarine that sank here.'},
  sea_sickness: {name:'Sea Sickness',emoji:'🤢',color:'#3a4a1a',accent:'#6a7a2a',hp:2,speed:60,damage:12,chaseRange:150,
    desc:'The rolling ocean saps your energy.'},
  // Era 5 — Minnesota
  mccarthyist: {name:'McCarthyist',emoji:'🔍',color:'#2a2050',accent:'#5a4a90',hp:4,speed:55,damage:20,chaseRange:180,
    desc:'Sees communists everywhere in 1950s America.'},
  tornado: {name:'Twister',emoji:'🌪️',color:'#4a4a5a',accent:'#7a7a9a',hp:6,speed:70,damage:30,chaseRange:250,
    desc:'A Minnesota tornado tears across the prairie.'},
  crop_pest: {name:'Crop Pest',emoji:'🦗',color:'#3a4a1a',accent:'#6a8a2a',hp:2,speed:95,damage:10,chaseRange:160,
    desc:'A swarm of locusts devastating the cornfields.'},
  // Era 6 — 1984
  cold_war_spy: {name:'Cold War Spy',emoji:'🕵️',color:'#1a1a2a',accent:'#3a3a5a',hp:5,speed:65,damage:22,chaseRange:200,
    desc:'An East German spy monitoring Dutch families.'},
  computer_virus: {name:'Computer Virus',emoji:'💻',color:'#0a2a0a',accent:'#0a6a0a',hp:4,speed:75,damage:18,chaseRange:180,
    desc:'An early computer virus from 1984 that escaped the mainframe.'},
  road_rager: {name:'Road Rager',emoji:'🚗',color:'#5a1a1a',accent:'#9a2a2a',hp:3,speed:80,damage:20,chaseRange:190,
    desc:'80s road rage is real.'},
  // Era 7 — 2020
  virus_cloud: {name:'Virus Cloud',emoji:'🦠',color:'#1a0a2a',accent:'#4a1a6a',hp:5,speed:60,damage:25,chaseRange:220,
    desc:'COVID-19 drifts through the air.'},
  misinformation_bot: {name:'Misinfo Bot',emoji:'📱',color:'#0a1a2a',accent:'#1a3a5a',hp:3,speed:70,damage:15,chaseRange:200,
    desc:'Spreads false family history. Confuses your memories.'},
  climate_storm: {name:'Climate Storm',emoji:'⚡',color:'#1a1a4a',accent:'#3a3a8a',hp:7,speed:55,damage:30,chaseRange:250,
    desc:'An extreme weather event born of climate change.'},
};

// ── MAP BUILDER ──────────────────────────────────────────────
const W=SCREEN_COLS, H=SCREEN_ROWS;

function blank(fill=T.GRASS) {
  return Array.from({length:H}, ()=>new Uint8Array(W).fill(fill));
}

function fill(m,r1,c1,r2,c2,t) {
  for(let r=Math.max(0,r1);r<=Math.min(H-1,r2);r++)
    for(let c=Math.max(0,c1);c<=Math.min(W-1,c2);c++) m[r][c]=t;
}

function border(m,t=T.TREE) {
  for(let c=0;c<W;c++){m[0][c]=t;m[H-1][c]=t;}
  for(let r=0;r<H;r++){m[r][0]=t;m[r][W-1]=t;}
}

function house(m,r,c,w,h,wall=T.HOUSE_WALL,roof=T.HOUSE_ROOF,door=T.DOOR) {
  fill(m,r,c,r,c+w-1,roof);          // roof row
  fill(m,r+1,c,r+h-1,c+w-1,wall);   // walls
  // Door in center of bottom wall
  m[r+h-1][c+~~(w/2)]=door;
  m[r+h-1][c+~~(w/2)+1]=door;
}

function tree(m,r,c){ if(r>=0&&r<H&&c>=0&&c<W) m[r][c]=T.TREE; }
function rock(m,r,c){ if(r>=0&&r<H&&c>=0&&c<W) m[r][c]=T.ROCK; }

// Clear a safe 3×3 walkable area at the spawn point
function clearSpawn(m, sr, sc) {
  for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) {
    const r=sr+dr, c=sc+dc;
    if(r>=0&&r<H&&c>=0&&c<W) m[r][c]=T.GRASS;
  }
}

// Open a passage through a border tile for screen transitions
function openExit(m,side,size=3) {
  const mid=side==='left'||side==='right'?~~(H/2):~~(W/2);
  if(side==='right') for(let r=mid-size;r<=mid+size;r++) m[r][W-1]=T.GRASS;
  if(side==='left')  for(let r=mid-size;r<=mid+size;r++) m[r][0]=T.GRASS;
  if(side==='down')  for(let c=mid-size;c<=mid+size;c++) m[H-1][c]=T.GRASS;
  if(side==='up')    for(let c=mid-size;c<=mid+size;c++) m[0][c]=T.GRASS;
}

// Draw a clear path between two points (ensures connectivity)
function clearPath(m, r1, c1, r2, c2) {
  let r=r1, c=c1;
  while(r!==r2||c!==c2) {
    m[r][c]=T.ROAD;
    if(r<r2) r++; else if(r>r2) r--;
    else if(c<c2) c++; else if(c>c2) c--;
  }
  m[r2][c2]=T.ROAD;
}

// ── WORLD DEFINITION ──────────────────────────────────────────
// Each era: array of screen defs  {map, exits:{right/left/up/down: idx}, title, npcs, enemies}
export function buildEraWorld(eraId) {
  const screens = [];

  if(eraId===0) { // ── MEDIEVAL NETHERLANDS 1539 ──
    // Screen 0: Village green + church
    const s0=blank();
    border(s0,T.TREE);
    // Church (upper center)
    house(s0,1,8,7,6,T.BRICK,T.BRICK,T.DOOR);
    // Fill church interior
    fill(s0,2,9,5,13,T.COBBLE);
    // Cobblestone path to church
    for(let r=6;r<H-1;r++){s0[r][10]=T.COBBLE;s0[r][11]=T.COBBLE;}
    // Houses left
    house(s0,7,1,5,4,T.HOUSE_WALL,T.HOUSE_ROOF);
    house(s0,8,16,5,4,T.HOUSE_WALL,T.HOUSE_ROOF);
    // Water stream crossing
    for(let c=1;c<9;c++) s0[6][c]=T.WATER;
    for(let c=13;c<W-1;c++) s0[6][c]=T.WATER;
    s0[6][9]=T.BRIDGE; s0[6][10]=T.BRIDGE; s0[6][11]=T.BRIDGE; s0[6][12]=T.BRIDGE;
    // Wheat fields
    fill(s0,8,16,12,20,T.WHEAT);
    // Flowers
    fill(s0,9,2,11,5,T.FLOWER);
    // Rocks as obstacles
    [3,5,6,14,15].forEach(c=>s0[9][c]=T.ROCK);
    // Portal at bottom center
    s0[H-2][10]=T.PORTAL; s0[H-2][11]=T.PORTAL;
    openExit(s0,'right'); openExit(s0,'up');
    // Spawn at bottom-center, path to NPCs and portal
    const spawn0 = {r:11,c:11};
    clearSpawn(s0,11,11);
    clearPath(s0,11,11,12,11); // path to portal
    screens.push({map:s0,exits:{right:1,up:2},title:'Aarle-Rixtel Village',spawn:spawn0});

    // Screen 1: Church interior + fields
    const s1=blank(T.COBBLE);
    fill(s1,0,0,H-1,W-1,T.GRASS);
    border(s1,T.TREE);
    house(s1,1,1,7,5,T.HOUSE_WALL,T.HOUSE_ROOF);
    house(s1,1,13,7,5,T.HOUSE_WALL,T.HOUSE_ROOF);
    fill(s1,7,4,11,17,T.WHEAT);
    fill(s1,7,1,11,3,T.FLOWER);
    for(let r=1;r<H-1;r++) {s1[r][10]=T.COBBLE;s1[r][11]=T.COBBLE;}
    [3,5,15,17].forEach(c=>{s1[7][c]=T.ROCK;s1[9][c]=T.ROCK;});
    s1[H-2][10]=T.PORTAL;
    openExit(s1,'left');
    clearSpawn(s1,10,10);
  clearPath(s1,10,10,11,10);
  screens.push({map:s1,exits:{left:0},title:'Village East — Farms',spawn:{r:10,c:10}}) ;

    // Screen 2: Heathland + ancient stones
    const s2=blank();
    border(s2,T.TREE);
    fill(s2,3,5,8,16,T.FLOWER);
    [[3,3],[3,18],[5,2],[5,19],[7,3],[7,18]].forEach(([r,c])=>rock(s2,r,c));
    // Ancient standing stones
    fill(s2,4,9,7,12,T.ROCK);
    s2[4][10]=T.GRASS; s2[4][11]=T.GRASS; // center open
    for(let c=7;c<15;c++) s2[H-2][c]=T.WHEAT;
    s2[H-2][10]=T.PORTAL;
    openExit(s2,'down');
    clearSpawn(s2,10,10);
  clearPath(s2,10,10,12,10);
  screens.push({map:s2,exits:{down:0},title:'Ancient Heathlands',spawn:{r:10,c:10}}) ;
  }

  else if(eraId===1) { // ── DUTCH GOLDEN AGE 1660 ──
    const s0=blank();
    border(s0,T.TREE);
    // Windmill towers
    fill(s0,1,1,5,3,T.WALL); fill(s0,1,18,5,20,T.WALL);
    // Canal across middle
    for(let c=1;c<W-1;c++) s0[7][c]=T.WATER;
    s0[7][9]=T.BRIDGE;s0[7][10]=T.BRIDGE;s0[7][11]=T.BRIDGE;s0[7][12]=T.BRIDGE;
    // Merchant houses
    house(s0,1,5,8,5,T.BRICK,T.BRICK);
    // Tulip fields
    fill(s0,9,1,12,7,T.FLOWER);
    fill(s0,9,14,12,20,T.FLOWER);
    // Market stalls (plank)
    fill(s0,8,9,9,12,T.PLANK);
    [3,5,15,17].forEach(c=>s0[9][c]=T.ROCK);
    s0[H-2][10]=T.PORTAL; s0[H-2][11]=T.PORTAL;
    openExit(s0,'right');
    clearSpawn(s0,10,10);
  clearPath(s0,10,10,12,10);
  screens.push({map:s0,exits:{right:1},title:'Golden Age Village',spawn:{r:10,c:10}}) ;

    const s1=blank(T.WATER);
    fill(s1,0,0,H-1,W-1,T.WATER);
    // Islands
    fill(s1,2,2,9,8,T.GRASS);
    fill(s1,2,13,9,19,T.GRASS);
    house(s1,3,3,5,4,T.BRICK,T.BRICK);
    house(s1,3,14,5,4,T.BRICK,T.BRICK);
    // Bridges between
    for(let c=9;c<13;c++) s1[6][c]=T.BRIDGE;
    fill(s1,3,9,9,12,T.WATER);
    fill(s1,4,5,7,7,T.FLOWER);
    s1[H-2][10]=T.PORTAL;
    openExit(s1,'left');
    clearSpawn(s1,10,10);
  clearPath(s1,10,10,12,10);
  screens.push({map:s1,exits:{left:0},title:'Canal District',spawn:{r:6,c:5}}) ;
  }

  else if(eraId===2) { // ── NAPOLEONIC 1799 ──
    const s0=blank(T.COBBLE);
    fill(s0,0,0,H-1,W-1,T.COBBLE);
    border(s0,T.WALL);
    // Town hall
    house(s0,1,7,9,5,T.BRICK,T.BRICK);
    // Barricades
    [3,5,7,15,17,19].forEach(c=>{s0[7][c]=T.WALL;});
    fill(s0,9,1,11,5,T.BRICK);
    fill(s0,9,16,11,20,T.BRICK);
    // Town square cobble
    fill(s0,8,7,11,14,T.COBBLE);
    for(let r=1;r<H-1;r++){s0[r][10]=T.ROAD;s0[r][11]=T.ROAD;}
    s0[H-2][10]=T.PORTAL; s0[H-2][11]=T.PORTAL;
    openExit(s0,'up');
    clearSpawn(s0,10,10);
  clearPath(s0,10,10,12,10);
  screens.push({map:s0,exits:{up:1},title:'Napoleonic Town Square',spawn:{r:10,c:10}}) ;

    const s1=blank();
    border(s1,T.TREE);
    fill(s1,2,2,H-3,W-3,T.WHEAT);
    [4,6,8,13,15,17].forEach(c=>{s1[4][c]=T.ROCK;s1[9][c]=T.ROCK;});
    s1[H-2][10]=T.PORTAL;
    openExit(s1,'down');
    clearSpawn(s1,10,10);
  clearPath(s1,10,10,12,10);
  screens.push({map:s1,exits:{down:0},title:'Occupied Farmland',spawn:{r:7,c:10}}) ;
  }

  else if(eraId===3) { // ── INDUSTRIAL 1872 ──
    const s0=blank(T.COBBLE);
    fill(s0,0,0,H-1,W-1,T.COBBLE);
    // Factory (large building)
    fill(s0,0,0,7,7,T.BRICK);
    // Chimneys
    for(let r=0;r<6;r++){s0[r][2]=T.STEEL;s0[r][4]=T.STEEL;s0[r][6]=T.STEEL;}
    // Railway tracks
    for(let c=0;c<W;c++) s0[9][c]=T.ROAD;
    // Factory machinery (rocks = crates/machines)
    [8,11,14,17,20].forEach(c=>{s0[6][c]=T.ROCK;s0[7][c]=T.ROCK;});
    // Workers' houses right side
    house(s0,1,15,6,5,T.HOUSE_WALL,T.HOUSE_ROOF);
    fill(s0,10,8,H-2,14,T.GRASS);
    fill(s0,10,8,H-2,14,T.FLOWER);
    s0[H-2][10]=T.PORTAL;
    openExit(s0,'right');
    clearSpawn(s0,10,10);
  clearPath(s0,10,10,12,10);
  screens.push({map:s0,exits:{right:1},title:'Steam Factory',spawn:{r:11,c:11}}) ;

    const s1=blank();
    border(s1,T.TREE);
    house(s1,1,3,6,5,T.HOUSE_WALL,T.HOUSE_ROOF);
    house(s1,1,13,6,5,T.HOUSE_WALL,T.HOUSE_ROOF);
    for(let c=0;c<W;c++) s1[7][c]=T.ROAD; // railway continues
    fill(s1,9,5,12,16,T.WHEAT);
    [8,11,14].forEach(c=>{s1[5][c]=T.ROCK;s1[11][c]=T.ROCK;});
    s1[H-2][10]=T.PORTAL;
    openExit(s1,'left'); openExit(s1,'right');
    clearSpawn(s1,10,10);
  clearPath(s1,10,10,12,10);
  screens.push({map:s1,exits:{left:0,right:2},title:'Industrial Town',spawn:{r:10,c:10}}) ;

    const s2=blank();
    border(s2,T.TREE);
    fill(s2,2,2,H-3,W-3,T.WHEAT);
    fill(s2,5,8,9,13,T.FLOWER);
    [4,8,12,16].forEach(c=>{s2[4][c]=T.ROCK;s2[10][c]=T.ROCK;});
    s2[H-2][10]=T.PORTAL;
    openExit(s2,'left');
    clearSpawn(s2,10,10);
  clearPath(s2,10,10,12,10);
  screens.push({map:s2,exits:{left:1},title:'Farm Fields',spawn:{r:7,c:10}}) ;
  }

  else if(eraId===4) { // ── EMIGRANT SHIP 1950 ──
    const s0=blank(T.WATER);
    for(let r=0;r<H;r++) for(let c=0;c<W;c++) s0[r][c]=T.DEEP_WATER;
    // Ship deck
    fill(s0,2,2,H-2,W-3,T.SHIP);
    // Railing walls
    fill(s0,2,2,2,W-3,T.WALL); fill(s0,H-2,2,H-2,W-3,T.WALL);
    fill(s0,2,2,H-2,2,T.WALL); fill(s0,2,W-3,H-2,W-3,T.WALL);
    // Bridge/wheelhouse
    fill(s0,3,8,7,13,T.PLANK); fill(s0,3,8,3,13,T.WALL); fill(s0,3,8,7,8,T.WALL); fill(s0,3,13,7,13,T.WALL);
    s0[7][10]=T.SHIP; s0[7][11]=T.SHIP; // door in bridge
    // Mast
    for(let r=2;r<H-2;r++) s0[r][10]=T.PLANK;
    // Crates as obstacles
    [[3,3],[3,17],[10,3],[10,17],[5,6],[5,15]].forEach(([r,c])=>rock(s0,r,c));
    s0[H-2][10]=T.PORTAL;
    openExit(s0,'down');
    clearSpawn(s0,10,10);
  clearPath(s0,10,10,12,10);
  screens.push({map:s0,exits:{down:1},title:'SS Volendam — Main Deck',spawn:{r:10,c:6}}) ;

    const s1=blank(T.SHIP);
    fill(s1,0,0,H-1,W-1,T.SHIP);
    border(s1,T.WALL);
    fill(s1,2,3,4,8,T.PLANK); fill(s1,2,13,4,18,T.PLANK); // bunks
    [[5,5],[5,9],[5,15],[7,4],[7,16],[9,6],[9,14]].forEach(([r,c])=>rock(s1,r,c));
    fill(s1,9,9,11,12,T.PLANK);
    s1[H-2][10]=T.PORTAL;
    openExit(s1,'up');
    clearSpawn(s1,10,10);
  clearPath(s1,10,10,12,10);
  screens.push({map:s1,exits:{up:0},title:'Ship Hold',spawn:{r:10,c:10}}) ;
  }

  else if(eraId===5) { // ── MINNESOTA 1955 ──
    const s0=blank();
    border(s0,T.TREE);
    // Farmhouse + barn
    house(s0,1,6,8,5,T.HOUSE_WALL,T.HOUSE_ROOF);
    fill(s0,1,1,6,5,T.WALL); // Red barn
    // Silo
    for(let r=1;r<8;r++) {s0[r][15]=T.STEEL;s0[r][16]=T.STEEL;}
    // Dirt path
    for(let r=6;r<H-1;r++){s0[r][10]=T.ROAD;s0[r][11]=T.ROAD;}
    fill(s0,7,14,H-3,W-2,T.CORN);
    fill(s0,8,1,H-3,5,T.FLOWER);
    [5,7,9].forEach(c=>{s0[8][c]=T.ROCK;s0[10][c]=T.ROCK;});
    s0[H-2][10]=T.PORTAL;
    openExit(s0,'right');
    clearSpawn(s0,10,10);
  clearPath(s0,10,10,12,10);
  screens.push({map:s0,exits:{right:1},title:'Van Duynhoven Farm',spawn:{r:10,c:12}}) ;

    const s1=blank();
    border(s1,T.TREE);
    for(let c=0;c<W;c++) s1[8][c]=T.ROAD; // Highway
    fill(s1,2,2,7,9,T.CORN);
    fill(s1,2,12,7,19,T.CORN);
    // White church
    house(s1,1,9,5,4,T.HOUSE_WALL,T.HOUSE_ROOF);
    s1[H-2][10]=T.PORTAL;
    openExit(s1,'left'); openExit(s1,'right');
    clearSpawn(s1,10,10);
  clearPath(s1,10,10,12,10);
  screens.push({map:s1,exits:{left:0,right:2},title:'Minnesota Prairie',spawn:{r:6,c:11}}) ;

    const s2=blank(T.COBBLE);
    fill(s2,0,0,H-1,W-1,T.COBBLE);
    border(s2,T.TREE);
    house(s2,1,2,6,5,T.HOUSE_WALL,T.HOUSE_ROOF);
    house(s2,1,14,6,5,T.HOUSE_WALL,T.HOUSE_ROOF);
    fill(s2,7,7,10,14,T.GRASS);
    [4,9,12,17].forEach(c=>{s2[5][c]=T.ROCK;s2[9][c]=T.ROCK;});
    for(let c=0;c<W;c++){s2[6][c]=T.ROAD;}
    s2[H-2][10]=T.PORTAL;
    openExit(s2,'left');
    clearSpawn(s2,10,10);
  clearPath(s2,10,10,12,10);
  screens.push({map:s2,exits:{left:1},title:'Small Minnesota Town',spawn:{r:10,c:10}}) ;
  }

  else if(eraId===6) { // ── SUBURBAN 1984 ──
    const s0=blank();
    border(s0,T.TREE);
    house(s0,1,5,8,5,T.HOUSE_WALL,T.HOUSE_ROOF);
    fill(s0,1,1,4,4,T.STEEL); // Garage
    for(let c=0;c<W;c++) s0[8][c]=T.ROAD;
    // Parked car (rocks)
    s0[9][6]=T.ROCK;s0[9][7]=T.ROCK;s0[9][8]=T.ROCK;
    // Dutch house on right
    house(s0,1,14,7,5,T.BRICK,T.BRICK);
    fill(s0,7,15,H-3,W-2,T.FLOWER); // Tulips
    for(let r=1;r<8;r++) s0[r][12]=T.STEEL; // TV antenna
    s0[H-2][10]=T.PORTAL;
    openExit(s0,'right');
    clearSpawn(s0,10,10);
  clearPath(s0,10,10,12,10);
  screens.push({map:s0,exits:{right:1},title:'Suburban Wisconsin',spawn:{r:10,c:12}}) ;

    const s1=blank();
    border(s1,T.TREE);
    for(let c=0;c<W;c++) s1[7][c]=T.ROAD;
    house(s1,1,2,7,5,T.HOUSE_WALL,T.HOUSE_ROOF);
    house(s1,1,14,7,5,T.BRICK,T.BRICK);
    fill(s1,8,8,H-3,13,T.FLOWER);
    [3,6,15,18].forEach(c=>{s1[4][c]=T.ROCK;s1[10][c]=T.ROCK;});
    s1[H-2][10]=T.PORTAL;
    openExit(s1,'left');
    clearSpawn(s1,10,10);
  clearPath(s1,10,10,12,10);
  screens.push({map:s1,exits:{left:0},title:'Haarlem Street',spawn:{r:10,c:11}}) ;
  }

  else { // eraId===7  ── MODERN 2020 ──
    const s0=blank();
    border(s0,T.TREE);
    // Modern glass house
    house(s0,1,5,10,5,T.STEEL,T.HOUSE_ROOF);
    // Dutch gable house
    house(s0,2,1,5,4,T.BRICK,T.BRICK);
    // EV car
    fill(s0,7,7,7,9,T.STEEL);
    // Cell tower
    for(let r=1;r<8;r++) s0[r][18]=T.STEEL;
    s0[2][16]=T.STEEL;s0[2][20]=T.STEEL;
    // Circuit garden
    fill(s0,8,1,H-3,6,T.CIRCUIT);
    fill(s0,8,15,H-3,W-2,T.FLOWER);
    [T.TREE,T.PINE].forEach((t,i)=>{[3,5,8,12,16,19].forEach(c=>{if(s0[H-2][c]===0) s0[H-3][c]=(i%2===0)?T.TREE:T.PINE;});});
    s0[H-2][10]=T.PORTAL;
    openExit(s0,'right');
    clearSpawn(s0,10,10);
  clearPath(s0,10,10,12,10);
  screens.push({map:s0,exits:{right:1},title:'St. Paul, Minnesota',spawn:{r:10,c:12}}) ;

    const s1=blank(T.COBBLE);
    fill(s1,0,0,H-1,W-1,T.COBBLE);
    border(s1,T.STEEL);
    house(s1,1,2,7,5,T.STEEL,T.HOUSE_ROOF);
    house(s1,1,14,7,5,T.BRICK,T.BRICK);
    fill(s1,7,7,10,14,T.CIRCUIT);
    [4,8,12,16].forEach(c=>{s1[5][c]=T.ROCK;s1[10][c]=T.ROCK;});
    s1[H-2][10]=T.PORTAL;
    openExit(s1,'left');
    clearSpawn(s1,10,10);
  clearPath(s1,10,10,12,10);
  screens.push({map:s1,exits:{left:0},title:'Haarlem, Netherlands',spawn:{r:10,c:10}}) ;
  }

  return screens;
}
