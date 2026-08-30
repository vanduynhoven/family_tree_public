// ═══════════════════════════════════════════════════════════════
//  WORLD — 4×4 grid, matching entry/exit, scattered entities
// ═══════════════════════════════════════════════════════════════
import { TILE, NPC, Enemy, DroppedItem } from './entities.js';
import { T, SOLID_TYPES } from './renderer.js';
import { buildEraWorld, ERAS, ENEMY_DEFS, SCREEN_COLS, SCREEN_ROWS, WORLD_COLS, WORLD_ROWS } from './eras.js';

export class World {
  constructor() {
    this.grid = null;       // [row][col] of screen objects
    this.gridRow = 1;       // current screen row in 4×4 grid
    this.gridCol = 1;       // current screen col in 4×4 grid
    this.eraId = 0;
    this.npcs = [];         // all NPC objects in this era (one instance each)
    this.enemies = [];      // all enemy objects in this era
    this.drops = [];
    this.transition = null; // {dir, progress, fromRow, fromCol, toRow, toCol, entryPos}
    this.transSpeed = 3.5;
  }

  get screen()   { return this.grid?.[this.gridRow]?.[this.gridCol]; }
  get map()      { return this.screen?.map; }
  get screenKey(){ return `${this.gridRow}_${this.gridCol}`; }

  solidAt(wx, wy) {
    const c=~~(wx/TILE), r=~~(wy/TILE);
    if(c<0||r<0||c>=SCREEN_COLS||r>=SCREEN_ROWS) return true;
    return SOLID_TYPES.has(this.map?.[r]?.[c] ?? T.WALL);
  }

  tileAt(wx, wy) {
    const c=~~(wx/TILE), r=~~(wy/TILE);
    if(c<0||r<0||c>=SCREEN_COLS||r>=SCREEN_ROWS) return 0;
    return this.map?.[r]?.[c] ?? 0;
  }

  loadEra(eraId, allNpcData) {
    this.eraId = eraId;
    this.grid = buildEraWorld(eraId);
    this.gridRow = 1; this.gridCol = 1; // start in [1,1] — town center
    this.transition = null;
    this._scatterEntities(allNpcData);
  }

  // Place each NPC/enemy exactly once in the grid (not repeated per screen)
  _scatterEntities(allNpcData) {
    this.npcs = [];
    this.enemies = [];
    this.drops = [];

    const eraNpcs = (allNpcData[this.eraId] || []);
    const era = ERAS[this.eraId];
    const totalScreens = WORLD_ROWS * WORLD_COLS;

    // Spread NPCs across all 16 screens — roughly 1-2 per screen
    eraNpcs.forEach((npcData, i) => {
      const row = ~~(i / WORLD_COLS) % WORLD_ROWS;
      const col = i % WORLD_COLS;
      const screen = this.grid?.[row]?.[col];
      if(!screen) return;

      const pos = this._safePos(screen.map, screen.spawn, i);
      const bodyColors = ['#8b6a30','#2a4a8a','#3a4a6a','#3a3a5a','#4a5a6a','#4a7030','#3a3a6a','#c04080'];
      const hatColors  = ['#4a3010','#1a2a5a','#1a2030','#1a1a2a','#2a3040','#2a4010','#202040','#801050'];
      const skinColors = ['#f5c890','#e8b870','#f0c080','#d5a870','#e8a060','#f0b880','#e8a868','#f5c890'];

      const npc = new NPC({
        ...npcData,
        bodyColor: bodyColors[this.eraId],
        hatColor:  hatColors[this.eraId],
        skinColor: skinColors[i % 8],
      }, pos.x, pos.y);
      npc.gridRow = row;
      npc.gridCol = col;
      this.npcs.push(npc);
    });

    // Enemies: 1-2 per screen, distributed across all 16
    const enemyTypes = era.enemies || [];
    for(let row=0;row<WORLD_ROWS;row++) for(let col=0;col<WORLD_COLS;col++) {
      const screen = this.grid?.[row]?.[col];
      if(!screen) continue;
      const count = 1 + ~~(Math.random() * 2);
      for(let k=0;k<count;k++) {
        const defKey = enemyTypes[(row*WORLD_COLS+col+k) % enemyTypes.length];
        const def = ENEMY_DEFS[defKey];
        if(!def) continue;
        const pos = this._safePos(screen.map, screen.spawn, 100+row*10+col*3+k);
        const e = new Enemy(def, pos.x, pos.y);
        e.gridRow = row; e.gridCol = col;
        this.enemies.push(e);
      }
    }
  }

  _safePos(map, spawn, seed) {
    for(let attempt=0;attempt<40;attempt++) {
      const c = 2 + ~~((seed*7+attempt*3) % (SCREEN_COLS-4));
      const r = 2 + ~~((seed*11+attempt*5) % (SCREEN_ROWS-4));
      if(!SOLID_TYPES.has(map?.[r]?.[c])) {
        return { x: c*TILE+4, y: r*TILE+4 };
      }
    }
    return { x: (spawn?.c||10)*TILE+4, y: (spawn?.r||7)*TILE+4 };
  }

  // Active entities — only those on current screen
  get activeNPCs()    { return this.npcs.filter(n=>n.gridRow===this.gridRow&&n.gridCol===this.gridCol); }
  get activeEnemies() { return this.enemies.filter(e=>e.gridRow===this.gridRow&&e.gridCol===this.gridCol); }
  get activeDrops()   { return this.drops.filter(d=>d.gridRow===this.gridRow&&d.gridCol===this.gridCol); }

  nearestNPC(player, range=TILE*1.8) {
    let best=null,bestD=range;
    for(const n of this.activeNPCs) {
      const d=player.distTo(n); if(d<bestD){bestD=d;best=n;}
    }
    return best;
  }

  atPortal(player) { return this.tileAt(player.cx,player.cy)===T.PORTAL; }

  // Check if player is walking off a screen edge
  checkScreenExit(player) {
    if(this.transition) return null;
    const screen = this.screen;
    if(!screen?.exits) return null;
    const margin = TILE * 0.6;
    if(player.x <= margin            && screen.exits.left  && this.gridCol > 0)            return 'left';
    if(player.x+player.w >= SCREEN_COLS*TILE-margin && screen.exits.right && this.gridCol < WORLD_COLS-1) return 'right';
    if(player.y <= margin            && screen.exits.up    && this.gridRow > 0)            return 'up';
    if(player.y+player.h >= SCREEN_ROWS*TILE-margin && screen.exits.down  && this.gridRow < WORLD_ROWS-1) return 'down';
    return null;
  }

  startTransition(dir, player) {
    const [dr,dc] = {right:[0,1],left:[0,-1],up:[-1,0],down:[1,0]}[dir];
    const toRow = this.gridRow+dr, toCol = this.gridCol+dc;
    if(toRow<0||toRow>=WORLD_ROWS||toCol<0||toCol>=WORLD_COLS) return;
    // Entry position = matching coordinate on opposite edge
    const exitPos = this.screen.exits[dir]?.pos ?? 7;
    this.transition = { dir, progress:0, fromRow:this.gridRow, fromCol:this.gridCol,
                        toRow, toCol, entryPos: exitPos };
  }

  updateTransition(dt) {
    if(!this.transition) return null;
    this.transition.progress += 3.5 * dt;
    if(this.transition.progress >= 1) {
      const tr = this.transition;
      this.gridRow = tr.toRow; this.gridCol = tr.toCol;
      this.transition = null;
      return tr; // return completed transition for player repositioning
    }
    return false;
  }

  // Compute where player should appear on new screen
  entryPosition(dir, entryPos) {
    const opp = {right:'left',left:'right',up:'down',down:'up'}[dir];
    // entryPos = row (for left/right) or col (for up/down)
    const margin = 2;
    if(opp==='left')  return { x: margin*TILE,                    y: entryPos*TILE };
    if(opp==='right') return { x: (SCREEN_COLS-margin-1)*TILE,   y: entryPos*TILE };
    if(opp==='up')    return { x: entryPos*TILE,                  y: margin*TILE };
    if(opp==='down')  return { x: entryPos*TILE,                  y: (SCREEN_ROWS-margin-1)*TILE };
    return { x: 10*TILE, y: 7*TILE };
  }

  update(dt, player) {
    for(const n of this.activeNPCs) n.update(dt, this);
    for(const e of this.activeEnemies) e.update(dt, player, this);
    for(const d of this.activeDrops) d.update(dt);

    // Remove dead enemies, maybe drop items
    this.enemies = this.enemies.filter(e => {
      if(!e.alive) {
        if(Math.random()<0.25) {
          const d = new DroppedItem({id:'health_potion',icon:'💊',name:'Medicine',desc:'Restores 25 HP.'}, e.cx-12, e.cy-12);
          d.gridRow=e.gridRow; d.gridCol=e.gridCol;
          this.drops.push(d);
        }
        return false;
      }
      return true;
    });
  }
}
