// ═══════════════════════════════════════════════════════════
//  World — 4×4 screen grid, tile collision, Zelda-slide
//  transitions, active entity lists
// ═══════════════════════════════════════════════════════════
import { TILE, SOLID_TYPES, FISHABLE_WATER, T } from './Renderer.js';
import { SCREEN_COLS, SCREEN_ROWS, WORLD_COLS, WORLD_ROWS, buildEraWorld, ENEMY_DEFS } from './EraData.js';
import { NPC_DATA as _unused, STATIC_SCREEN_DROPS } from './NpcData.js';
import { NPC } from './NPC.js';
import { Enemy } from './Enemy.js';
import { DroppedItem } from './DroppedItem.js';

export class World {
  constructor() {
    this.screens    = null;
    this.screenRow  = 1;
    this.screenCol  = 1;
    this.transition = null;
    this._visited   = new Set();
    this.portalSet  = new Set(); // screens where player found a portal (persists across screens)
    this._drops     = [];
    this._npcs      = [];
    this._enemies   = [];
    // Tracks which ambient NPC types have been placed anywhere in the current era
    // so the same named type doesn't appear on multiple screens simultaneously
    this._ambientNPCsUsed = new Set();
  }

  get screen()       { return this.screens?.[this.screenRow]?.[this.screenCol]; }
  get map()          { return this.screen?.map ?? []; }
  get activeNPCs()   { return this._npcs.filter(n => n.alive); }
  get activeEnemies(){ return this._enemies.filter(e => e.alive); }
  get activeDrops()  { return this._drops.filter(d => d.alive); }

  // ── Load an era ────────────────────────────────────────

  loadEra(eraId, npcData, startRow = 1, startCol = 0, location = 'haarlem', friendshipMap = null, talkCountMap = null) {
    this.screens      = buildEraWorld(eraId, location);
    this._location    = location;
    this._friendshipMap  = friendshipMap;
    this._talkCountMap   = talkCountMap;
    this._ambientNPCsUsed = new Set(); // reset for new era
    this.screenRow = startRow;
    this.screenCol = startCol;
    this._visited.clear();
    this._visited.add(`${startRow},${startCol}`);
    this.portalSet.clear(); // reset portal markers for new era
    this._loadScreen(eraId, npcData);
  }

  _loadScreen(eraId, npcData) {
    this._drops   = [];
    this._npcs    = [];
    this._enemies = [];

    const scr = this.screen;
    if (!scr) return;

    const { map, spawn } = scr;

    // Track all names/IDs of named NPCs to prevent ambient duplicates
    const namedNpcKeys = new Set();

    // Spawn named NPCs for this screen from npcData
    const screenKey = `${eraId}_${this.screenRow}_${this.screenCol}`;
    const npcsHere  = (npcData[screenKey] || []);
    npcsHere.forEach(d => {
      // Deduplicate: skip if a named NPC with this key already exists
      const npcKey = d.gedcomId || d.name;
      if (namedNpcKeys.has(npcKey)) return;
      namedNpcKeys.add(npcKey);
      if (d.name)  namedNpcKeys.add(d.name);
      if (d.given) namedNpcKeys.add(d.given);

      // Initial spawn position from data
      let nx = (d.spawnC ?? spawn.c + Math.floor(Math.random()*4) - 2) * TILE + 4;
      let ny = (d.spawnR ?? spawn.r + Math.floor(Math.random()*4) - 2) * TILE + 4;

      // If the initial position is solid, search outward for a clear tile
      const NPC_PAD = 4;
      const isWalkable = (wx, wy) =>
        !this.solidAt(wx + NPC_PAD, wy + NPC_PAD) &&
        !this.solidAt(wx + Math.floor(TILE * 0.5), wy + Math.floor(TILE * 0.7));

      if (!isWalkable(nx, ny)) {
        let found = false;
        // Spiral search outward from the intended spawn point
        for (let radius = 1; radius <= 4 && !found; radius++) {
          for (let dr = -radius; dr <= radius && !found; dr++) {
            for (let dc = -radius; dc <= radius && !found; dc++) {
              if (Math.abs(dr) !== radius && Math.abs(dc) !== radius) continue;
              const tr = Math.floor(ny / TILE) + dr;
              const tc = Math.floor(nx / TILE) + dc;
              if (tr < 1 || tr >= SCREEN_ROWS-1 || tc < 1 || tc >= SCREEN_COLS-1) continue;
              const cx = tc * TILE + 4, cy = tr * TILE + 4;
              if (isWalkable(cx, cy)) {
                nx = cx; ny = cy; found = true;
              }
            }
          }
        }
        // If still not found, fall back to spawn point
        if (!found) { nx = spawn.c * TILE + 4; ny = spawn.r * TILE + 4; }
      }

      const npc = new NPC(d, nx, ny);
      // Restore persistent friendship hearts and talk count (reuse npcKey from dedup above)
      if (this._friendshipMap?.has(npcKey)) npc.friendship = this._friendshipMap.get(npcKey);
      if (this._talkCountMap?.has(npcKey))  npc.talkCount  = this._talkCountMap.get(npcKey);
      if (npc.talkCount > 0) npc.talked = true;
      this._npcs.push(npc);
    });

    // Spawn ambient background NPCs — pass existing names so we don't duplicate
    this._spawnAmbientNPCs(eraId, namedNpcKeys);

    // Spawn enemies (only in row 0, 2, 3 screens)
    if (this.screenRow !== 1) {
      const defs = eraId >= 0 ? [ENEMY_DEFS[_eraEnemies(eraId)[this.screenCol % 2]]] : [];
      defs.filter(Boolean).forEach((def, i) => {
        // Find a walkable spawn position — try initial position, then random search
        let ex = 0, ey = 0;
        const initialX = (3 + i * 5) * TILE;
        const initialY = (3 + i * 2) * TILE;
        const pad = 4;
        const walkable = (wx, wy) =>
          !this.solidAt(wx + pad, wy + pad) &&
          !this.solidAt(wx + TILE - pad, wy + TILE - pad);

        if (walkable(initialX, initialY)) {
          ex = initialX; ey = initialY;
        } else {
          // Random search for a clear tile (up to 30 attempts)
          let found = false;
          for (let attempt = 0; attempt < 30 && !found; attempt++) {
            const tc = 2 + Math.floor(Math.random() * (SCREEN_COLS - 4));
            const tr = 2 + Math.floor(Math.random() * (SCREEN_ROWS - 4));
            const wx = tc * TILE + pad;
            const wy = tr * TILE + pad;
            if (walkable(wx, wy)) { ex = wx; ey = wy; found = true; }
          }
          if (!found) return; // skip this enemy if no clear spot found
        }
        this._enemies.push(new Enemy(def, ex, ey));
      });
    }

    // Forage drops — check full drop footprint before placing
    for (let i = 0; i < 3; i++) {
      const fc = 3 + Math.floor(Math.random() * (SCREEN_COLS - 6));
      const fr = 3 + Math.floor(Math.random() * (SCREEN_ROWS - 6));
      const fx = fc * TILE + 4;
      const fy = fr * TILE + 4;
      if (!this.solidAt(fx, fy) && !this.solidAt(fx + 20, fy + 20)) {
        const item = _randomForage(eraId);
        this._drops.push(new DroppedItem(item, fx, fy));
      }
    }

    this._visited.add(`${this.screenRow},${this.screenCol}`);

    // Static screen drops — guaranteed items on specific screens
    // (Knoxley's ancient stones, collectible curiosities)
    // Only spawn if the player hasn't already collected this item
    const screenKey2 = `${eraId}_${this.screenRow}_${this.screenCol}`;
    for (const sd of STATIC_SCREEN_DROPS) {
      if (sd.screenKey !== screenKey2) continue;
      const sx = sd.c * TILE + 8;
      const sy = sd.r * TILE + 8;
      if (!this.solidAt(sx, sy)) {
        this._drops.push(new DroppedItem(sd.item, sx, sy, -1)); // -1 = permanent
      }
    }
  }

  /** Populate a screen with era-appropriate background NPCs.
   *  existingNames: Set of names/ids already on this screen — skip those. */
  _spawnAmbientNPCs(eraId, existingNames = new Set()) {
    const era = eraId;
    const location = this._location || 'haarlem';
    const pools = _ambientNPCPool(era, location);
    if (!pools.length) return;

    // Reduce ambient density slightly: max 2 per screen (was 4)
    // This prevents overcrowding and makes each NPC feel special
    const counts = { 0:1, 1:2, 2:2, 3:1 };
    const count = Math.min(counts[this.screenRow] ?? 1, pools.length);

    // Shuffle pool (Fisher-Yates) for variety
    const shuffled = [...pools];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const NPC_W = Math.floor(TILE * 0.52);
    const NPC_H = Math.floor(TILE * 0.72);
    const pad   = 4;

    let spawned = 0;
    for (const template of shuffled) {
      if (spawned >= count) break;

      // Skip if this NPC type already appears anywhere in the current era world
      if (this._ambientNPCsUsed.has(template.name)) continue;
      // Also skip if already on this specific screen
      if (existingNames.has(template.name) || existingNames.has(template.given)) continue;

      // Find a walkable spawn position — check full NPC footprint, not just centre
      let tx = 0, ty = 0;
      for (let attempt = 0; attempt < 30; attempt++) {
        const tc = 3 + Math.floor(Math.random() * (SCREEN_COLS - 6));
        const tr = 3 + Math.floor(Math.random() * (SCREEN_ROWS - 6));
        const wx = tc * TILE + pad;
        const wy = tr * TILE + pad;
        // Check all 4 corners of the NPC's bounding box
        const clear = !this.solidAt(wx,            wy           ) &&
                      !this.solidAt(wx + NPC_W - pad, wy        ) &&
                      !this.solidAt(wx,            wy + NPC_H - pad) &&
                      !this.solidAt(wx + NPC_W - pad, wy + NPC_H - pad);
        if (clear) { tx = wx; ty = wy; break; }
      }
      if (!tx && !ty) continue; // no clear spot found

      const npcDef = { ...template, era, wanderRadius: 2 + Math.floor(Math.random() * 2) };
      const npc = new NPC(npcDef, tx, ty);
      npc.homeX = tx; npc.homeY = ty;
      npc.wanderTimer = Math.random() * 3;

      // Restore persistent friendship hearts and talk count
      const npcKey = template.name;
      if (this._friendshipMap?.has(npcKey)) npc.friendship = this._friendshipMap.get(npcKey);
      if (this._talkCountMap?.has(npcKey))  npc.talkCount  = this._talkCountMap.get(npcKey);
      if (npc.talkCount > 0) npc.talked = true;

      // Mark as used world-wide and on this screen
      this._ambientNPCsUsed.add(template.name);
      existingNames.add(template.name);
      if (template.given) existingNames.add(template.given);

      this._npcs.push(npc);
      spawned++;
    }
  }

  // ── Tile queries ───────────────────────────────────────

  solidAt(wx, wy, player = null) {
    const c = Math.floor(wx / TILE);
    const r = Math.floor(wy / TILE);
    if (r < 0 || r >= SCREEN_ROWS || c < 0 || c >= SCREEN_COLS) return true;
    const tile = this.map[r]?.[c] ?? T.GRASS;
    // flotsam item: player can temporarily walk on water
    if (player?._flotsam && (tile === T.WATER || tile === T.DEEP_WATER)) return false;
    return SOLID_TYPES.has(tile);
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

  startTransition(dir, player, eraId, npcData, location = 'haarlem') {
    if (this.transition) return;
    const dR = dir === 'down' ? 1 : dir === 'up' ? -1 : 0;
    const dC = dir === 'right' ? 1 : dir === 'left' ? -1 : 0;
    const toR = this.screenRow + dR;
    const toC = this.screenCol + dC;
    if (toR < 0 || toR >= WORLD_ROWS || toC < 0 || toC >= WORLD_COLS) return;
    if (!this.canExitDir(dir)) return;

    this.transition = { dir, fromR: this.screenRow, fromC: this.screenCol, toR, toC, progress: 0, eraId, npcData, location: this._location || 'haarlem' };
    // Friendship maps stay on this._friendshipMap / this._talkCountMap — already set at loadEra
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
    const spawnR = this.screen?.spawn?.r ?? 7;
    const spawnC = this.screen?.spawn?.c ?? 10;
    // The player enters via the OPPOSITE edge to their travel direction
    // e.g. travelling 'right' → enters new screen from its LEFT edge
    const entryEdge = { right:'left', left:'right', down:'up', up:'down' }[dir];
    const exit = this.screen?.exits?.[entryEdge];
    const passR = (dir === 'right' || dir === 'left') ? (exit?.pos ?? spawnR) : spawnR;
    const passC = (dir === 'down'  || dir === 'up')   ? (exit?.pos ?? spawnC) : spawnC;

    // Scan inward from the entry edge along the passage column/row
    // to find the first walkable position (player foot hitbox check)
    const scanForWalkable = (startR, startC, dR, dC, maxSteps) => {
      for (let i = 0; i < maxSteps; i++) {
        const r = startR + dR * i;
        const c = startC + dC * i;
        const footR = r + 1;
        if (!this.solidAt(c * TILE + 4, r * TILE + 4) &&
            !this.solidAt(c * TILE + 4, footR * TILE + 4)) {
          return { x: c * TILE + 4, y: r * TILE + 4 };
        }
      }
      return { x: spawnC * TILE + 4, y: spawnR * TILE + 4 };
    };

    switch (dir) {
      case 'right': return scanForWalkable(passR, 1,              0,  1, SCREEN_COLS - 2);
      case 'left':  return scanForWalkable(passR, SCREEN_COLS - 2, 0, -1, SCREEN_COLS - 2);
      case 'down':  return scanForWalkable(1,     passC,           1,  0, SCREEN_ROWS - 2);
      case 'up':    return scanForWalkable(SCREEN_ROWS - 3, passC, -1, 0, SCREEN_ROWS - 2);
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
    [{id:'coin',label:'Guilder',emoji:'🪙'},{id:'flower',label:'Tulip',emoji:'🌷'},{id:'cassette_tape',label:'Cassette',emoji:'📼'},{id:'herb',label:'Herb',emoji:'🌿'}],
    [{id:'coin',label:'Euro',emoji:'💶'},{id:'flower',label:'Flower',emoji:'🌸'},{id:'usb_drive',label:'USB Drive',emoji:'💾'},{id:'herb',label:'Herb',emoji:'🌿'}],
  ];
  const t = tables[eraId] || tables[0];
  return t[Math.floor(Math.random() * t.length)];
}

// ── Ambient NPC pool — DISABLED ──────────────────────────
// Only Van Duynhoven family members and spouses appear as NPCs.
// All NPCs are generated from the GEDCOM in Game._buildNpcData().
function _ambientNPCPool(eraId, location = 'haarlem') {
  return [];
}
