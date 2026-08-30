// ═══════════════════════════════════════════════════════════
//  World — 4×4 screen grid, tile collision, Zelda-slide
//  transitions, active entity lists
// ═══════════════════════════════════════════════════════════
import { TILE, SOLID_TYPES, FISHABLE_WATER, T } from './Renderer.js';
import { SCREEN_COLS, SCREEN_ROWS, WORLD_COLS, WORLD_ROWS, buildEraWorld, ENEMY_DEFS, FISH_TABLES } from './EraData.js';
import { NPC } from './NPC.js';
import { Enemy } from './Enemy.js';
import { DroppedItem } from './DroppedItem.js';

export class World {
  constructor() {
    this.screens    = null;   // 2D array [row][col] of screen objects
    this.screenRow  = 1;
    this.screenCol  = 1;
    this.transition = null;   // { dir, fromR, fromC, toR, toC, progress }
    this._visited   = new Set();
    this._drops     = [];     // DroppedItem[]
    this._npcs      = [];     // NPC[] for current screen
    this._enemies   = [];     // Enemy[]
  }

  get screen()       { return this.screens?.[this.screenRow]?.[this.screenCol]; }
  get map()          { return this.screen?.map ?? []; }
  get activeNPCs()   { return this._npcs.filter(n => n.alive); }
  get activeEnemies(){ return this._enemies.filter(e => e.alive); }
  get activeDrops()  { return this._drops.filter(d => d.alive); }

  // ── Load an era ────────────────────────────────────────

  loadEra(eraId, npcData, startRow = 1, startCol = 1) {
    this.screens   = buildEraWorld(eraId);
    this.screenRow = startRow;
    this.screenCol = startCol;
    this._visited.clear();
    this._visited.add(`${startRow},${startCol}`);
    this._loadScreen(eraId, npcData);
  }

  _loadScreen(eraId, npcData) {
    this._drops   = [];
    this._npcs    = [];
    this._enemies = [];

    const scr = this.screen;
    if (!scr) return;

    const { map, spawn } = scr;
    const sx = spawn.c * TILE + 4;
    const sy = spawn.r * TILE + 4;

    // Spawn NPCs for this screen from npcData
    const screenKey = `${eraId}_${this.screenRow}_${this.screenCol}`;
    const npcsHere  = (npcData[screenKey] || []);
    npcsHere.forEach(d => {
      const nx = (d.spawnC ?? spawn.c + Math.floor(Math.random()*4) - 2) * TILE + 4;
      const ny = (d.spawnR ?? spawn.r + Math.floor(Math.random()*4) - 2) * TILE + 4;
      this._npcs.push(new NPC(d, nx, ny));
    });

    // Spawn enemies based on era def (only in row 0, 2, 3 screens)
    if (this.screenRow !== 1) {
      const era  = { id:eraId, enemies: [] };
      const defs = eraId >= 0 ? [ENEMY_DEFS[_eraEnemies(eraId)[this.screenCol % 2]]] : [];
      defs.filter(Boolean).forEach((def, i) => {
        const ex = (3 + i * 5) * TILE;
        const ey = (3 + i * 2) * TILE;
        this._enemies.push(new Enemy(def, ex, ey));
      });
    }

    // Forage drops
    for (let i = 0; i < 3; i++) {
      const item = _randomForage(eraId);
      const fx   = (2 + Math.floor(Math.random() * (SCREEN_COLS - 4))) * TILE;
      const fy   = (2 + Math.floor(Math.random() * (SCREEN_ROWS - 4))) * TILE;
      if (!this.solidAt(fx + 12, fy + 12)) {
        this._drops.push(new DroppedItem(item, fx, fy));
      }
    }

    this._visited.add(`${this.screenRow},${this.screenCol}`);
  }

  // ── Tile queries ───────────────────────────────────────

  solidAt(wx, wy) {
    const c = Math.floor(wx / TILE);
    const r = Math.floor(wy / TILE);
    if (r < 0 || r >= SCREEN_ROWS || c < 0 || c >= SCREEN_COLS) return true;
    return SOLID_TYPES.has(this.map[r]?.[c] ?? T.GRASS);
  }

  /** Returns the tile ID under a world coordinate */
  tileAt(wx, wy) {
    const c = Math.floor(wx / TILE);
    const r = Math.floor(wy / TILE);
    if (r < 0 || r >= SCREEN_ROWS || c < 0 || c >= SCREEN_COLS) return T.GRASS;
    return this.map[r]?.[c] ?? T.GRASS;
  }

  /** True when player is adjacent to a fishable water tile */
  isFishable(player) {
    const probes = [
      [player.cx,       player.y - 4],
      [player.cx,       player.y + player.h + 4],
      [player.x - 4,   player.cy],
      [player.x + player.w + 4, player.cy],
    ];
    return probes.some(([wx, wy]) => FISHABLE_WATER.has(this.tileAt(wx, wy)));
  }

  /** Returns {x,y} of the water tile the player is adjacent to for bobber placement */
  fishingBobberPos(player) {
    const reach = TILE;
    switch (player.facing) {
      case 'up':    return { x: player.cx, y: player.y - reach };
      case 'down':  return { x: player.cx, y: player.y + player.h + reach * 0.5 };
      case 'left':  return { x: player.x - reach * 0.5, y: player.cy };
      default:      return { x: player.x + player.w + reach * 0.5, y: player.cy };
    }
  }

  /** True when player overlaps a portal tile */
  atPortal(player) {
    const probes = [
      [player.cx, player.cy],
      [player.cx - 4, player.cy],
      [player.cx + 4, player.cy],
    ];
    return probes.some(([wx, wy]) => this.tileAt(wx, wy) === T.PORTAL);
  }

  /** True when player overlaps a ready crop tile, returns tile position */
  atCrop(player) {
    const cx = Math.floor(player.cx / TILE);
    const cy = Math.floor(player.cy / TILE);
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const r = cy + dr, c = cx + dc;
      if (this.map[r]?.[c] === T.CROP_READY) return { r, c };
    }
    return null;
  }

  harvestCrop(r, c) {
    if (this.map[r]?.[c] !== T.CROP_READY) return null;
    this.map[r][c] = T.CROP_SPENT;
    // Regrow after next sleep (flagged externally via resetCrops)
    return { spent: true, r, c };
  }

  resetCrops() {
    for (let r = 0; r < SCREEN_ROWS; r++)
      for (let c = 0; c < SCREEN_COLS; c++)
        if (this.map[r]?.[c] === T.CROP_SPENT) this.map[r][c] = T.CROP_READY;
  }

  // ── Screen exits ───────────────────────────────────────

  checkScreenExit(player) {
    const margin = 4;
    if (player.x + player.w >= SCREEN_COLS * TILE - margin) return 'right';
    if (player.x <= margin)                                   return 'left';
    if (player.y + player.h >= SCREEN_ROWS * TILE - margin)  return 'down';
    if (player.y <= margin)                                   return 'up';
    return null;
  }

  canExitDir(dir) {
    const exits = this.screen?.exits || {};
    return !!exits[dir];
  }

  startTransition(dir, player, eraId, npcData) {
    if (this.transition) return;
    const dR = dir === 'down' ? 1 : dir === 'up' ? -1 : 0;
    const dC = dir === 'right' ? 1 : dir === 'left' ? -1 : 0;
    const toR = this.screenRow + dR;
    const toC = this.screenCol + dC;
    if (toR < 0 || toR >= WORLD_ROWS || toC < 0 || toC >= WORLD_COLS) return;
    if (!this.canExitDir(dir)) return;

    this.transition = { dir, fromR: this.screenRow, fromC: this.screenCol, toR, toC, progress: 0, eraId, npcData };
  }

  updateTransition(dt) {
    if (!this.transition) return null;
    this.transition.progress += dt * 3.5; // 0.28s slide
    if (this.transition.progress >= 1) {
      const t = this.transition;
      this.screenRow = t.toR;
      this.screenCol = t.toC;
      this.transition = null;
      this._loadScreen(t.eraId, t.npcData);
      return t;
    }
    return null;
  }

  entryPosition(dir) {
    const margin = TILE;
    switch (dir) {
      case 'right': return { x: margin,                          y: this.screen?.spawn?.r * TILE || TILE * 7 };
      case 'left':  return { x: SCREEN_COLS * TILE - TILE * 2,  y: this.screen?.spawn?.r * TILE || TILE * 7 };
      case 'down':  return { x: this.screen?.spawn?.c * TILE || TILE * 10, y: margin };
      case 'up':    return { x: this.screen?.spawn?.c * TILE || TILE * 10, y: SCREEN_ROWS * TILE - TILE * 2 };
    }
    return { x: TILE * 10, y: TILE * 7 };
  }

  // ── NPC proximity ──────────────────────────────────────

  nearestNPC(player, maxDist = TILE * 1.6) {
    let best = null, bestDist = maxDist;
    for (const npc of this.activeNPCs) {
      const d = player.distTo(npc);
      if (d < bestDist) { bestDist = d; best = npc; }
    }
    return best;
  }

  // ── World update ───────────────────────────────────────

  update(dt, player, game) {
    for (const npc of this.activeNPCs)    npc.update(dt, this, game);
    for (const enemy of this.activeEnemies) enemy.update(dt, this, game);
    for (const drop of this.activeDrops)  drop.update(dt);

    // Cull dead entities
    this._npcs    = this._npcs.filter(n => n.alive);
    this._enemies = this._enemies.filter(e => e.alive || e.deathTimer > 0);
    this._drops   = this._drops.filter(d => d.alive);
  }

  get visitedSet() { return this._visited; }
}

// ── Helpers ───────────────────────────────────────────────

function _eraEnemies(eraId) {
  const map = [
    ['tax_collector','plague_rat','inquisitor'],
    ['spanish_soldier','pickpocket','debt_collector'],
    ['fr_conscript','deserter','fr_conscript'],
    ['overseer','steam_machine','overseer'],
    ['storm_wave','u_boat','storm_wave'],
    ['mccarthyist','tornado','mccarthyist'],
    ['cold_war_spy','computer_virus','cold_war_spy'],
    ['virus_cloud','misinfo_bot','virus_cloud'],
  ];
  return map[eraId] || map[0];
}

function _randomForage(eraId) {
  const tables = [
    [{id:'herb',label:'Healing Herb',emoji:'🌿'},{id:'mushroom',label:'Mushroom',emoji:'🍄'},{id:'flower',label:'Flower',emoji:'🌸'},{id:'wood',label:'Wood',emoji:'🪵'}],
    [{id:'tulip',label:'Tulip',emoji:'🌷'},{id:'coin',label:'Coin',emoji:'🪙'},{id:'herb',label:'Herb',emoji:'🌿'},{id:'flower',label:'Flower',emoji:'🌸'}],
    [{id:'rye',label:'Rye Stalk',emoji:'🌾'},{id:'coin',label:'Franc',emoji:'🪙'},{id:'herb',label:'Herb',emoji:'🌿'},{id:'wood',label:'Wood',emoji:'🪵'}],
    [{id:'coal',label:'Coal',emoji:'⬛'},{id:'iron',label:'Iron',emoji:'🔩'},{id:'herb',label:'Herb',emoji:'🌿'},{id:'potato',label:'Potato',emoji:'🥔'}],
    [{id:'rope',label:'Rope',emoji:'🪢'},{id:'fish_ration',label:'Fish Ration',emoji:'🐟'},{id:'coin',label:'Dollar',emoji:'💵'},{id:'wood',label:'Driftwood',emoji:'🪵'}],
    [{id:'corn',label:'Corn',emoji:'🌽'},{id:'coin',label:'Dollar',emoji:'💵'},{id:'flower',label:'Prairie Flower',emoji:'🌻'},{id:'herb',label:'Herb',emoji:'🌿'}],
    [{id:'coin',label:'Guilder',emoji:'🪙'},{id:'flower',label:'Tulip',emoji:'🌷'},{id:'cassette',label:'Cassette',emoji:'📼'},{id:'herb',label:'Herb',emoji:'🌿'}],
    [{id:'coin',label:'Euro',emoji:'💶'},{id:'flower',label:'Flower',emoji:'🌸'},{id:'usb',label:'USB Drive',emoji:'💾'},{id:'herb',label:'Herb',emoji:'🌿'}],
  ];
  const t = tables[eraId] || tables[0];
  return t[Math.floor(Math.random() * t.length)];
}
