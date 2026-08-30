// ═══════════════════════════════════════════════════════════════
//  ERAS — 4×4 world grid per era, thematic map layouts
//  Each era = 16 screens arranged as a 4-column × 4-row world
//  Transitions: exit col C on right → enter col C on left of next
// ═══════════════════════════════════════════════════════════════
import { T } from './renderer.js';
import { TILE } from './entities.js';

export const SCREEN_COLS = 20;  // tiles wide per screen
export const SCREEN_ROWS = 14;  // tiles tall per screen
export const WORLD_COLS = 4;    // screens across
export const WORLD_ROWS = 4;    // screens down

// ── ENEMY CONFIGS ─────────────────────────────────────────────
export const ENEMY_DEFS = {
  tax_collector:    {name:'Tax Collector',  emoji:'💰',color:'#8a6020',accent:'#c09030',hp:4,speed:55,damage:20,chaseRange:200},
  plague_rat:       {name:'Plague Rat',     emoji:'🐀',color:'#3a3020',accent:'#607020',hp:2,speed:90,damage:12,chaseRange:150},
  inquisitor:       {name:'Inquisitor',     emoji:'⛪',color:'#1a1040',accent:'#4030a0',hp:6,speed:45,damage:25,chaseRange:220},
  spanish_soldier:  {name:'Spanish Soldier',emoji:'⚔️',color:'#7a1010',accent:'#c02020',hp:5,speed:60,damage:22,chaseRange:190},
  pickpocket:       {name:'Pickpocket',     emoji:'🤏',color:'#404040',accent:'#808080',hp:2,speed:100,damage:8, chaseRange:160},
  french_conscript: {name:'Conscript',      emoji:'🪖',color:'#2a3a6a',accent:'#4a6aaa',hp:4,speed:65,damage:20,chaseRange:190},
  deserter:         {name:'Deserter',       emoji:'🏃',color:'#5a5020',accent:'#8a8040',hp:3,speed:85,damage:18,chaseRange:170},
  factory_overseer: {name:'Overseer',       emoji:'🏭',color:'#2a1a0a',accent:'#5a3a1a',hp:5,speed:55,damage:22,chaseRange:180},
  steam_machine:    {name:'Steam Machine',  emoji:'⚙️', color:'#4a4040',accent:'#8a8080',hp:8,speed:40,damage:30,chaseRange:150},
  storm_wave:       {name:'Storm Wave',     emoji:'🌊',color:'#1a3a5a',accent:'#2a6a9a',hp:3,speed:80,damage:25,chaseRange:200},
  u_boat_ghost:     {name:'U-Boat Ghost',   emoji:'🛸',color:'#1a2a1a',accent:'#3a5a3a',hp:5,speed:50,damage:28,chaseRange:220},
  mccarthyist:      {name:'McCarthyist',    emoji:'🔍',color:'#2a2050',accent:'#5a4a90',hp:4,speed:55,damage:20,chaseRange:180},
  tornado:          {name:'Twister',        emoji:'🌪️',color:'#4a4a5a',accent:'#7a7a9a',hp:6,speed:70,damage:30,chaseRange:260},
  cold_war_spy:     {name:'Cold War Spy',   emoji:'🕵️',color:'#1a1a2a',accent:'#3a3a5a',hp:5,speed:65,damage:22,chaseRange:200},
  computer_virus:   {name:'Computer Virus', emoji:'💻',color:'#0a2a0a',accent:'#0a6a0a',hp:4,speed:75,damage:18,chaseRange:180},
  virus_cloud:      {name:'Virus Cloud',    emoji:'🦠',color:'#1a0a2a',accent:'#4a1a6a',hp:5,speed:60,damage:25,chaseRange:220},
  misinformation_bot:{name:'Misinfo Bot',  emoji:'📱',color:'#0a1a2a',accent:'#1a3a5a',hp:3,speed:70,damage:15,chaseRange:200},
  climate_storm:    {name:'Climate Storm',  emoji:'⚡',color:'#1a1a4a',accent:'#3a3a8a',hp:7,speed:55,damage:30,chaseRange:260},
};

// ── MAP HELPERS ───────────────────────────────────────────────
const W=SCREEN_COLS, H=SCREEN_ROWS;

function blank(t=T.GRASS) { return Array.from({length:H},()=>new Uint8Array(W).fill(t)); }
function set(m,r,c,t){ if(r>=0&&r<H&&c>=0&&c<W) m[r][c]=t; }
function fill(m,r1,c1,r2,c2,t){
  for(let r=Math.max(0,r1);r<=Math.min(H-1,r2);r++)
    for(let c=Math.max(0,c1);c<=Math.min(W-1,c2);c++) m[r][c]=t;
}
function border(m,t=T.TREE){
  for(let c=0;c<W;c++){m[0][c]=t;m[H-1][c]=t;}
  for(let r=0;r<H;r++){m[r][0]=t;m[r][W-1]=t;}
}
function house(m,r,c,w,h){
  fill(m,r,c,r,c+w-1,T.HOUSE_ROOF);
  fill(m,r+1,c,r+h-1,c+w-1,T.HOUSE_WALL);
  m[r+h-1][c+~~(w/2)]=T.DOOR; m[r+h-1][c+~~(w/2)+1]=T.DOOR;
}
// Clear a safe walkable zone — always call AFTER all fills
function clearZone(m,r,c,size=2){
  for(let dr=-size;dr<=size;dr++) for(let dc=-size;dc<=size;dc++) set(m,r+dr,c+dc,T.GRASS);
}
// Open a passage on a border edge at a specific column/row position
function openEdge(m,side,pos){
  if(side==='right') for(let r=pos-2;r<=pos+2;r++){set(m,r,W-1,T.GRASS);set(m,r,W-2,T.GRASS);}
  if(side==='left')  for(let r=pos-2;r<=pos+2;r++){set(m,r,0,T.GRASS);set(m,r,1,T.GRASS);}
  if(side==='down')  for(let c=pos-2;c<=pos+2;c++){set(m,H-1,c,T.GRASS);set(m,H-2,c,T.GRASS);}
  if(side==='up')    for(let c=pos-2;c<=pos+2;c++){set(m,0,c,T.GRASS);set(m,1,c,T.GRASS);}
}
// Draw road from point to edge opening
function roadToEdge(m,sr,sc,side,pos){
  let r=sr,c=sc;
  if(side==='right'){while(c<W-1){m[r][c]=T.ROAD;c++;}}
  if(side==='left') {while(c>0)  {m[r][c]=T.ROAD;c--;}}
  if(side==='down') {while(r<H-1){m[r][c]=T.ROAD;r++;}}
  if(side==='up')   {while(r>0)  {m[r][c]=T.ROAD;r--;}}
}

// ── SCREEN FACTORY ────────────────────────────────────────────
// Each screen knows which edges connect (right/left/up/down)
// and the position on that edge where the player passes through
// exits: { right:{pos:7}, left:{pos:7}, up:{pos:10}, down:{pos:10} }
// pos = row (for left/right) or col (for up/down)

function makeScreen(map, exits={}, title='', spawn={r:7,c:10}) {
  // Apply exits (openings and roads)
  Object.entries(exits).forEach(([side,{pos}])=>{
    openEdge(map,side,pos);
    roadToEdge(map,spawn.r,spawn.c,side,pos);
  });
  // Guarantee spawn is clear
  clearZone(map,spawn.r,spawn.c,2);
  return {map, exits, title, spawn};
}

// ── ERA WORLD BUILDERS ────────────────────────────────────────
// Returns a 2D array [row][col] of screens (4×4 = 16 screens)
// exits use row/col positions that MATCH between adjacent screens

export function buildEraWorld(eraId) {
  const grid = Array.from({length:WORLD_ROWS},()=>Array(WORLD_COLS).fill(null));

  // Transition positions (shared edges must use same pos value)
  // Horizontal connections: pos = which row the passage is on
  // Vertical connections: pos = which col the passage is on
  const H_POS = 7;  // row 7 — middle of screen height
  const V_POS = 10; // col 10 — slightly right of center

  if(eraId===0) { // ── MEDIEVAL NEDERLAND 1539 ──
    // Layout:
    // [0,0] Forest    [0,1] Forest     [0,2] Heathland  [0,3] Ancient stones
    // [1,0] Church    [1,1] Town green [1,2] Farmland   [1,3] Windmill field
    // [2,0] River     [2,1] Village    [2,2] More farms [2,3] Tulip fields
    // [3,0] Marsh     [3,1] Road south [3,2] Wheat farm [3,3] Time portal

    // [0,0] Forest
    const s00=blank(); border(s00,T.PINE);
    fill(s00,2,2,H-3,W-3,T.TREE);
    fill(s00,5,6,8,13,T.GRASS);
    clearZone(s00,H_POS,10);
    grid[0][0]=makeScreen(s00,{right:{pos:H_POS},down:{pos:V_POS}},'Deep Forest',{r:H_POS,c:10});

    // [0,1] Forest edge
    const s01=blank(); border(s01,T.TREE);
    fill(s01,1,1,5,8,T.TREE); fill(s01,1,12,5,W-2,T.PINE);
    fill(s01,5,2,H-3,W-3,T.GRASS);
    clearZone(s01,H_POS,10);
    grid[0][1]=makeScreen(s01,{left:{pos:H_POS},right:{pos:H_POS},down:{pos:V_POS}},'Forest Edge',{r:H_POS,c:10});

    // [0,2] Heathland
    const s02=blank(); border(s02,T.ROCK);
    fill(s02,2,2,H-3,W-3,T.FLOWER);
    fill(s02,4,7,9,12,T.GRASS);
    for(let i=0;i<6;i++) set(s02,2+i*2,3+i,T.ROCK);
    clearZone(s02,H_POS,10);
    grid[0][2]=makeScreen(s02,{left:{pos:H_POS},right:{pos:H_POS},down:{pos:V_POS}},'Open Heathland',{r:H_POS,c:10});

    // [0,3] Ancient stones
    const s03=blank(); border(s03,T.TREE);
    fill(s03,3,5,9,14,T.FLOWER);
    [[3,8],[3,11],[5,6],[5,13],[7,7],[7,12],[9,8],[9,11]].forEach(([r,c])=>set(s03,r,c,T.ROCK));
    clearZone(s03,H_POS,10);
    grid[0][3]=makeScreen(s03,{left:{pos:H_POS},down:{pos:V_POS}},'Ancient Stones',{r:H_POS,c:10});

    // [1,0] Church & monastery
    const s10=blank(); border(s10,T.TREE);
    house(s10,1,2,8,6);
    fill(s10,1,2,6,9,T.COBBLE); // church grounds cobble
    for(let r=1;r<H-1;r++){s10[r][11]=T.COBBLE;s10[r][12]=T.COBBLE;} // main path
    fill(s10,8,1,H-3,8,T.WHEAT);
    clearZone(s10,H_POS,12);
    grid[1][0]=makeScreen(s10,{right:{pos:H_POS},up:{pos:V_POS},down:{pos:V_POS}},'Sint-Lambertus Church',{r:H_POS,c:12});

    // [1,1] Town green — main village
    const s11=blank(); border(s11,T.TREE);
    fill(s11,2,6,8,13,T.COBBLE); // town square
    house(s11,1,1,5,4); house(s11,1,14,5,4);
    for(let r=1;r<H-1;r++){s11[r][9]=T.COBBLE;s11[r][10]=T.COBBLE;}
    set(s11,H-2,9,T.PORTAL); set(s11,H-2,10,T.PORTAL); set(s11,H-2,11,T.PORTAL);
    clearZone(s11,H_POS,9);
    grid[1][1]=makeScreen(s11,{left:{pos:H_POS},right:{pos:H_POS},up:{pos:V_POS},down:{pos:V_POS}},'Aarle-Rixtel Village',{r:H_POS,c:9});

    // [1,2] Farmland
    const s12=blank(); border(s12,T.TREE);
    fill(s12,2,2,H-3,8,T.WHEAT); fill(s12,2,10,H-3,W-3,T.WHEAT);
    for(let r=1;r<H-1;r++){s12[r][9]=T.ROAD;}
    house(s12,2,12,5,4);
    clearZone(s12,H_POS,9);
    grid[1][2]=makeScreen(s12,{left:{pos:H_POS},right:{pos:H_POS},up:{pos:V_POS},down:{pos:V_POS}},'Farmland',{r:H_POS,c:9});

    // [1,3] Windmill field
    const s13=blank(); border(s13,T.TREE);
    fill(s13,2,2,H-3,W-3,T.FLOWER);
    // Windmill structures
    for(let r=1;r<8;r++){set(s13,r,3,T.WALL);set(s13,r,4,T.WALL);}
    for(let r=1;r<10;r++){set(s13,r,16,T.WALL);set(s13,r,17,T.WALL);}
    clearZone(s13,H_POS,10);
    grid[1][3]=makeScreen(s13,{left:{pos:H_POS},up:{pos:V_POS},down:{pos:V_POS}},'Windmill Fields',{r:H_POS,c:10});

    // [2,0] River
    const s20=blank(); border(s20,T.TREE);
    for(let c=1;c<W-1;c++) s20[6][c]=T.WATER;
    for(let c=1;c<W-1;c++) s20[7][c]=T.WATER;
    s20[6][9]=T.BRIDGE;s20[6][10]=T.BRIDGE;s20[7][9]=T.BRIDGE;s20[7][10]=T.BRIDGE;
    fill(s20,1,1,5,W-2,T.GRASS); fill(s20,8,1,H-3,W-2,T.GRASS);
    clearZone(s20,H_POS+1,10);
    grid[2][0]=makeScreen(s20,{right:{pos:H_POS},up:{pos:V_POS},down:{pos:V_POS}},'River Crossing',{r:H_POS+1,c:10});

    // [2,1] Village south
    const s21=blank(); border(s21,T.TREE);
    house(s21,1,2,5,4); house(s21,1,13,5,4); house(s21,5,7,6,4);
    for(let r=1;r<H-1;r++){s21[r][9]=T.COBBLE;s21[r][10]=T.COBBLE;}
    fill(s21,9,2,H-3,6,T.FLOWER);
    clearZone(s21,H_POS,9);
    grid[2][1]=makeScreen(s21,{left:{pos:H_POS},right:{pos:H_POS},up:{pos:V_POS},down:{pos:V_POS}},'South Village',{r:H_POS,c:9});

    // [2,2] More farms
    const s22=blank(); border(s22,T.TREE);
    fill(s22,1,1,H-3,9,T.WHEAT); fill(s22,1,11,H-3,W-3,T.FLOWER);
    for(let r=1;r<H-1;r++) s22[r][10]=T.ROAD;
    clearZone(s22,H_POS,10);
    grid[2][2]=makeScreen(s22,{left:{pos:H_POS},right:{pos:H_POS},up:{pos:V_POS},down:{pos:V_POS}},'East Farms',{r:H_POS,c:10});

    // [2,3] Tulip fields
    const s23=blank(); border(s23,T.TREE);
    fill(s23,1,1,H-3,W-3,T.FLOWER);
    for(let r=2;r<H-2;r+=3) fill(s23,r,2,r,W-3,T.GRASS);
    clearZone(s23,H_POS,10);
    grid[2][3]=makeScreen(s23,{left:{pos:H_POS},up:{pos:V_POS},down:{pos:V_POS}},'Tulip Fields',{r:H_POS,c:10});

    // [3,0] Marsh
    const s30=blank(); border(s30,T.REED||T.TREE);
    fill(s30,1,1,H-3,W-3,T.WATER);
    for(let i=0;i<5;i++){const c2=3+i*3;fill(s30,2,c2,H-3,c2+1,T.GRASS);}
    s30[6][9]=T.BRIDGE;s30[6][10]=T.BRIDGE;s30[7][9]=T.BRIDGE;s30[7][10]=T.BRIDGE;
    clearZone(s30,H_POS,10);
    grid[3][0]=makeScreen(s30,{right:{pos:H_POS},up:{pos:V_POS}},'Marshland',{r:H_POS,c:10});

    // [3,1] Road south / gate
    const s31=blank(); border(s31,T.WALL);
    fill(s31,1,1,H-3,W-3,T.COBBLE);
    for(let r=1;r<H-1;r++){s31[r][9]=T.ROAD;s31[r][10]=T.ROAD;}
    house(s31,1,1,5,4); house(s31,1,14,5,4);
    set(s31,H-2,9,T.PORTAL);set(s31,H-2,10,T.PORTAL);
    clearZone(s31,H_POS,9);
    grid[3][1]=makeScreen(s31,{left:{pos:H_POS},right:{pos:H_POS},up:{pos:V_POS}},'South Gate Road',{r:H_POS,c:9});

    // [3,2] Wheat farm
    const s32=blank(); border(s32,T.TREE);
    fill(s32,1,1,H-3,W-3,T.WHEAT);
    house(s32,1,9,6,5);
    fill(s32,6,9,H-3,13,T.GRASS);
    clearZone(s32,H_POS,10);
    grid[3][2]=makeScreen(s32,{left:{pos:H_POS},right:{pos:H_POS},up:{pos:V_POS}},'Wheat Farm',{r:H_POS,c:10});

    // [3,3] Shrine / ancient portal
    const s33=blank(); border(s33,T.ROCK);
    fill(s33,2,3,H-3,W-4,T.FLOWER);
    [[4,8],[4,11],[6,7],[6,12],[8,9],[8,10]].forEach(([r,c])=>set(s33,r,c,T.ROCK));
    set(s33,H_POS,9,T.PORTAL);set(s33,H_POS,10,T.PORTAL);set(s33,H_POS,11,T.PORTAL);
    clearZone(s33,H_POS-2,10);
    grid[3][3]=makeScreen(s33,{left:{pos:H_POS},up:{pos:V_POS}},'Ancient Shrine',{r:H_POS-2,c:10});
  }

  else {
    // ── GENERIC WORLD GENERATOR for other eras ──────────────
    // Theme tiles per era
    const themes = [
      {base:T.GRASS,  fill1:T.WHEAT,  fill2:T.FLOWER, struct:T.BRICK},  // 0 medieval (fallback)
      {base:T.GRASS,  fill1:T.FLOWER, fill2:T.WATER,  struct:T.BRICK},  // 1 golden age
      {base:T.COBBLE, fill1:T.WHEAT,  fill2:T.GRASS,  struct:T.BRICK},  // 2 napoleonic
      {base:T.GRASS,  fill1:T.WHEAT,  fill2:T.CORN,   struct:T.STEEL},  // 3 industrial
      {base:T.DEEP_WATER,fill1:T.SHIP,fill2:T.WATER,  struct:T.PLANK},  // 4 ship
      {base:T.GRASS,  fill1:T.CORN,   fill2:T.WHEAT,  struct:T.PLANK},  // 5 minnesota
      {base:T.GRASS,  fill1:T.FLOWER, fill2:T.COBBLE, struct:T.HOUSE_WALL}, // 6 suburban
      {base:T.GRASS,  fill1:T.FLOWER, fill2:T.CIRCUIT,struct:T.STEEL},  // 7 modern
    ];
    const th = themes[eraId] || themes[0];

    // Screen type distribution for 4×4 grid
    const screenTypes = [
      'forest','forest','open','open',
      'village','town','farm','field',
      'river','south','farm2','field2',
      'road','road2','wheat','portal',
    ];

    for(let row=0;row<WORLD_ROWS;row++) for(let col=0;col<WORLD_COLS;col++) {
      const idx=row*WORLD_COLS+col;
      const m=blank(th.base);
      const type=screenTypes[idx];

      // Build by type
      switch(type) {
        case 'forest':  border(m,T.TREE); fill(m,2,2,H-4,W-4,T.TREE); fill(m,4,5,8,14,T.GRASS); break;
        case 'open':    border(m,T.TREE); fill(m,2,2,H-3,W-3,th.fill2); break;
        case 'village': border(m,T.TREE); fill(m,3,3,9,16,T.COBBLE); house(m,1,2,6,5); house(m,1,13,6,5); break;
        case 'town':    border(m,T.TREE); fill(m,2,5,8,14,T.COBBLE); house(m,1,2,5,4); house(m,1,14,5,4);
                        set(m,H-2,9,T.PORTAL);set(m,H-2,10,T.PORTAL);set(m,H-2,11,T.PORTAL); break;
        case 'farm':    border(m,T.TREE); fill(m,2,2,H-3,8,th.fill1); fill(m,2,11,H-3,W-3,th.fill1); house(m,2,9,4,5); break;
        case 'field':   border(m,T.TREE); fill(m,2,2,H-3,W-3,th.fill2); break;
        case 'river':   border(m,T.TREE);
                        for(let c2=1;c2<W-1;c2++){m[5][c2]=T.WATER;m[6][c2]=T.WATER;}
                        m[5][9]=T.BRIDGE;m[5][10]=T.BRIDGE;m[6][9]=T.BRIDGE;m[6][10]=T.BRIDGE; break;
        case 'south':   border(m,T.TREE); fill(m,1,1,H-3,W-3,T.GRASS); house(m,1,3,5,4); house(m,1,12,5,4); break;
        case 'farm2':   border(m,T.TREE); fill(m,1,1,H-3,W-3,th.fill1); house(m,3,8,6,5); break;
        case 'field2':  border(m,T.TREE); fill(m,1,1,H-3,W-3,th.fill2); break;
        case 'road':    border(m,T.WALL);  fill(m,1,1,H-3,W-3,T.COBBLE);
                        for(let r2=1;r2<H-1;r2++){m[r2][9]=T.ROAD;m[r2][10]=T.ROAD;}
                        house(m,1,1,5,4); house(m,1,13,5,4); break;
        case 'road2':   border(m,T.TREE); fill(m,1,1,H-3,W-3,T.GRASS);
                        for(let r2=1;r2<H-1;r2++){m[r2][9]=T.ROAD;m[r2][10]=T.ROAD;}
                        set(m,H-2,9,T.PORTAL);set(m,H-2,10,T.PORTAL); break;
        case 'wheat':   border(m,T.TREE); fill(m,1,1,H-3,W-3,T.WHEAT); house(m,3,8,6,5); break;
        case 'portal':  border(m,T.ROCK);  fill(m,2,2,H-3,W-3,th.fill2);
                        [[4,8],[4,11],[6,7],[6,12]].forEach(([r2,c2])=>set(m,r2,c2,T.ROCK));
                        set(m,H_POS,9,T.PORTAL);set(m,H_POS,10,T.PORTAL);set(m,H_POS,11,T.PORTAL); break;
      }

      // Determine exits based on grid position
      const exits={};
      if(col<WORLD_COLS-1) exits.right={pos:H_POS};
      if(col>0)            exits.left={pos:H_POS};
      if(row<WORLD_ROWS-1) exits.down={pos:V_POS};
      if(row>0)            exits.up={pos:V_POS};

      // Spawn in center-bottom area
      const spawn={r:H_POS,c:V_POS};
      clearZone(m,spawn.r,spawn.c,2);
      grid[row][col]=makeScreen(m,exits,type,spawn);
    }
  }

  return grid;
}

// ── ERA METADATA ─────────────────────────────────────────────
export const ERAS = [
  {id:0,year:'1539',name:'Aarle-Rixtel, Netherlands',music:0,portalItem:null,
   enemies:['tax_collector','plague_rat','inquisitor'],
   desc:'The first Van Duynhovens farm the heathlands of Noord-Brabant.'},
  {id:1,year:'1660',name:'Dutch Golden Age',music:1,portalItem:'seal',
   enemies:['spanish_soldier','pickpocket'],
   desc:'Amsterdam grows rich, but Catholics in the south struggle.'},
  {id:2,year:'1799',name:'Napoleonic Uden',music:2,portalItem:'prayer_book',
   enemies:['french_conscript','deserter'],
   desc:'Napoleon\'s armies march through the Netherlands.'},
  {id:3,year:'1872',name:'Industrial Uden',music:3,portalItem:'birth_record',
   enemies:['factory_overseer','steam_machine'],
   desc:'Railways and factories transform the old village ways.'},
  {id:4,year:'1950',name:'Atlantic Ocean — Emigrant Ship',music:4,portalItem:'train_ticket',
   enemies:['storm_wave','u_boat_ghost'],
   desc:'Johan and family sail ten days to their new home in Minnesota.'},
  {id:5,year:'1955',name:'Minnesota Farmland',music:5,portalItem:'immigration_papers',
   enemies:['mccarthyist','tornado'],
   desc:'The first American-born Van Duynhovens grow up on the prairie.'},
  {id:6,year:'1984',name:'Wisconsin & Netherlands',music:6,portalItem:'baseball_card',
   enemies:['cold_war_spy','computer_virus'],
   desc:'Gen 6 spans two continents.'},
  {id:7,year:'2020',name:'Minnesota & Haarlem',music:7,portalItem:'floppy_disk',
   enemies:['virus_cloud','misinformation_bot','climate_storm'],
   desc:'Gen 7 video-calls across the Atlantic. 500 years complete.'},
];
