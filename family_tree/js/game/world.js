// ═══════════════════════════════════════════════════════════════
//  WORLD — Manages screens, entities, camera, transitions
// ═══════════════════════════════════════════════════════════════
import { TILE, NPC, Enemy, DroppedItem } from './entities.js';
import { T, SOLID_TYPES, setEra } from './renderer.js';
import { buildEraWorld, ERAS, ENEMY_DEFS, SCREEN_COLS, SCREEN_ROWS } from './eras.js';

export class World {
  constructor() {
    this.screens = [];
    this.currentScreenIdx = 0;
    this.eraId = 0;
    this.npcs = [];
    this.enemies = [];
    this.drops = [];
    this.transition = null; // {dir, progress, fromIdx, toIdx}
    this.transSpeed = 3.5; // screens per second
  }

  get screen() { return this.screens[this.currentScreenIdx]; }
  get map()    { return this.screen?.map; }
  get cols()   { return SCREEN_COLS; }
  get rows()   { return SCREEN_ROWS; }

  solidAt(wx, wy) {
    const c=~~(wx/TILE), r=~~(wy/TILE);
    if(c<0||r<0||c>=SCREEN_COLS||r>=SCREEN_ROWS) return true;
    const t = this.map?.[r]?.[c];
    return SOLID_TYPES.has(t);
  }

  tileAt(wx, wy) {
    const c=~~(wx/TILE), r=~~(wy/TILE);
    if(c<0||r<0||c>=SCREEN_COLS||r>=SCREEN_ROWS) return 0;
    return this.map?.[r]?.[c] ?? 0;
  }

  loadEra(eraId, allNpcData) {
    this.eraId = eraId;
    setEra(eraId);
    this.screens = buildEraWorld(eraId);
    this.currentScreenIdx = 0;
    this.transition = null;
    this._spawnEntities(allNpcData);
  }

  _spawnEntities(allNpcData) {
    this.npcs = [];
    this.enemies = [];
    this.drops = [];

    const eraNpcs = (allNpcData[this.eraId] || []);
    const era = ERAS[this.eraId];
    const numScreens = this.screens.length;

    // Distribute NPCs across screens
    eraNpcs.forEach((npcData, i) => {
      const screenIdx = i % numScreens;
      const screen = this.screens[screenIdx];
      if(!screen) return;

      // Find safe position
      const pos = this._safePos(screen.map, i);
      const npc = new NPC({
        ...npcData,
        bodyColor: ['#8b6a30','#2a4a8a','#3a4a6a','#3a3a5a','#4a5a6a','#4a7030','#3a3a6a','#c04080'][this.eraId],
        hatColor:  ['#4a3010','#1a2a5a','#1a2030','#1a1a2a','#2a3040','#2a4010','#202040','#801050'][this.eraId],
        skinColor: ['#f5c890','#e8b870','#f0c080','#d5a870','#e8a060','#f0b880','#e8a868','#f5c890'][i%8],
      }, pos.x, pos.y);
      npc.screenIdx = screenIdx;
      this.npcs.push(npc);
    });

    // Spawn enemies for current screen
    this._spawnEnemiesForScreen(0);
  }

  _spawnEnemiesForScreen(screenIdx) {
    // Remove enemies from other screens, keep current
    this.enemies = this.enemies.filter(e => e.screenIdx === screenIdx);

    const era = ERAS[this.eraId];
    const screen = this.screens[screenIdx];
    if(!screen) return;

    // Spawn 2-4 enemies from era's enemy list
    const count = 2 + Math.floor(Math.random()*3);
    const enemyTypes = era.enemies || [];
    for(let i=0;i<count;i++) {
      const defKey = enemyTypes[i % enemyTypes.length];
      const def = ENEMY_DEFS[defKey];
      if(!def) continue;
      const pos = this._safePos(screen.map, 50+i*17);
      const e = new Enemy(def, pos.x, pos.y);
      e.screenIdx = screenIdx;
      this.enemies.push(e);
    }
  }

  _safePos(map, seed) {
    // Find a non-solid grass tile
    const cols=SCREEN_COLS, rows=SCREEN_ROWS;
    let x = (3+(seed*7)%( cols-6))*TILE;
    let y = (3+(seed*11)%(rows-6))*TILE;
    for(let attempt=0;attempt<30;attempt++) {
      const c=3+(seed*7+attempt*3)%(cols-6);
      const r=3+(seed*11+attempt*5)%(rows-6);
      if(!SOLID_TYPES.has(map[r]?.[c])) { return {x:c*TILE+4, y:r*TILE+4}; }
    }
    return {x, y};
  }

  // Active entities for current screen
  get activeNPCs()    { return this.npcs.filter(n=>n.screenIdx===this.currentScreenIdx); }
  get activeEnemies() { return this.enemies.filter(e=>e.screenIdx===this.currentScreenIdx); }
  get activeDrops()   { return this.drops.filter(d=>d.screenIdx===this.currentScreenIdx); }

  nearestNPC(player, range=TILE*1.8) {
    let best=null, bestD=range;
    for(const n of this.activeNPCs) {
      const d=player.distTo(n);
      if(d<bestD){bestD=d;best=n;}
    }
    return best;
  }

  atPortal(player) {
    const t=this.tileAt(player.cx, player.cy);
    return t===T.PORTAL;
  }

  checkScreenExit(player) {
    if(this.transition) return null;
    const screen=this.screen;
    if(!screen?.exits) return null;
    const hw=TILE*0.3;
    if(player.x <= 2          && screen.exits.left  !== undefined) return 'left';
    if(player.x+player.w >= (SCREEN_COLS)*TILE-2 && screen.exits.right !== undefined) return 'right';
    if(player.y <= 2          && screen.exits.up    !== undefined) return 'up';
    if(player.y+player.h >= (SCREEN_ROWS)*TILE-2 && screen.exits.down  !== undefined) return 'down';
    return null;
  }

  startTransition(dir) {
    const exits = this.screen?.exits||{};
    const toIdx = exits[dir];
    if(toIdx===undefined) return;
    this.transition={dir,progress:0,fromIdx:this.currentScreenIdx,toIdx};
  }

  updateTransition(dt) {
    if(!this.transition) return false;
    this.transition.progress += this.transSpeed * dt;
    if(this.transition.progress >= 1) {
      this.currentScreenIdx = this.transition.toIdx;
      this.transition = null;
      this._spawnEnemiesForScreen(this.currentScreenIdx);
      return true; // completed
    }
    return false;
  }

  update(dt, player) {
    // Update active NPCs
    for(const n of this.activeNPCs) n.update(dt, this);
    // Update active enemies
    for(const e of this.activeEnemies) { e.update(dt, player, this); }
    // Update drops
    for(const d of this.activeDrops) d.update(dt);
    // Dead enemies drop items
    this.enemies = this.enemies.filter(e=>{
      if(!e.alive) {
        // small chance to drop item
        if(Math.random()<0.3) {
          const rareItems=[{id:'health_potion',icon:'💊',name:'Medicine',desc:'Restores 25 HP.'}];
          const item=rareItems[0];
          const d=new DroppedItem(item,e.cx-12,e.cy-12);
          d.screenIdx=e.screenIdx;
          this.drops.push(d);
        }
        return false;
      }
      return true;
    });
  }
}
