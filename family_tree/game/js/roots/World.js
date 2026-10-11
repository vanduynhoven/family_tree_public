// ═══════════════════════════════════════════════════════════
//  World — ONE continuous tile map per era (G2), tile collision, regions, active entity lists
//
//  The era used to be a 4×4 grid of 20×14-tile screens with Zelda-style slide transitions. Now the
//  screens are stitched into a single map in global tile coordinates (EraData.buildEraMap) and the
//  player just walks: the camera follows and stops at the map edge. The old screen (row, col)
//  survives as a REGION: a named rectangle with a spawn point. Regions have no exits; they drive the
//  place name in the HUD, the minimap, "explored" and the per-region population.
//  Everything is spawned once when the era loads; docs/game/g2-scrolling-map.md has the details.
// ═══════════════════════════════════════════════════════════
import { TILE, SOLID_TYPES, FISHABLE_WATER, T } from './Renderer.js';
import { buildEraMap, ENEMY_DEFS } from './EraData.js';
import { STATIC_SCREEN_DROPS } from './NpcData.js';
import { NPC } from './NPC.js';
import { Enemy } from './Enemy.js';
import { DroppedItem } from './DroppedItem.js';
import { Livestock } from './Livestock.js';

/** How far (px) the player must be outside the current region before the world calls it a new one, so
 *  standing on a region border does not flicker the place name. */
const REGION_HYSTERESIS = TILE * 0.25;

export class World {
  constructor() {
    this.map        = [];     // rows of Uint8Array tile ids in global tile coordinates (the whole era)
    this.cols       = 0;      // map size in tiles (always read these, map-based places are free-size)
    this.rows       = 0;
    this.regions    = null;   // [row][col] -> region or null  (see EraData.stitchScreens)
    this.regionList = [];
    this.screenRow  = 1;      // the region the player is in. The names are the old screen index: they are
    this.screenCol  = 1;      // what saves and the minimap have always used.
    this._visited   = new Set();   // region keys "row,col" the player has been in
    this.portalSet  = new Set();   // region keys where the player has seen a portal (minimap star)
    this._drops     = [];
    this._npcs      = [];
    this._enemies   = [];
    this._livestock = [];
    // Tracks which ambient NPC types have been placed anywhere in the current era
    // so the same named type doesn't appear in several regions at once
    this._ambientNPCsUsed = new Set();
  }

  /** The region the player is in (set by updateRegion). `screen` / `screens` are the old names. */
  get region()       { return this.regions?.[this.screenRow]?.[this.screenCol] ?? null; }
  get screen()       { return this.region; }
  get screens()      { return this.regions; }
  get widthPx()      { return this.cols * TILE; }
  get heightPx()     { return this.rows * TILE; }
  get activeNPCs()   { return this._npcs.filter(n => n.alive); }
  get activeEnemies(){ return this._enemies.filter(e => e.alive); }
  get activeDrops()  { return this._drops.filter(d => d.alive); }
  get activeLivestock() { return (this._livestock || []).filter(l => l.alive !== false); }

  // ── Load an era ────────────────────────────────────────

  loadEra(eraId, npcData, startRow = 1, startCol = 0, location = 'haarlem', friendshipMap = null, talkCountMap = null) {
    const built = buildEraMap(eraId, location);
    this.map        = built.map;
    this.cols       = built.cols;
    this.rows       = built.rows;
    this.regions    = built.regions;
    this.regionList = built.regionList;
    this._location  = location;
    this._friendshipMap  = friendshipMap;
    this._talkCountMap   = talkCountMap;
    this._ambientNPCsUsed = new Set(); // reset for new era
    this.screenRow = startRow;
    this.screenCol = startCol;
    if (!this.region && this.regionList.length) {
      this.screenRow = this.regionList[0].row;
      this.screenCol = this.regionList[0].col;
    }
    this._visited.clear();
    if (this.region) this._visited.add(this.region.key);
    this.portalSet.clear(); // reset portal markers for new era
    this._populate(eraId, npcData);
  }

  /** Spawn the whole era once: named NPCs, ambient NPCs, enemies, forage and static drops, region by region. */
  _populate(eraId, npcData) {
    this._drops     = [];
    this._npcs      = [];
    this._enemies   = [];
    this._livestock = [];

    // Names/ids of named NPCs, so nobody appears twice (one person is never in two places at once)
    const namedNpcKeys = new Set();
    for (const region of this.regionList) {
      this._spawnNamedNPCs(eraId, npcData, region, namedNpcKeys);
      this._spawnAmbientNPCs(eraId, namedNpcKeys, region);
      this._spawnEnemies(eraId, region);
      this._spawnForage(eraId, region);
      this._spawnStaticDrops(eraId, region);
    }
  }

  /** Named NPCs of one region. NPC_DATA keys are `${eraId}_${row}_${col}` and its tile coordinates
   *  (spawnR/spawnC, schedule r/c) are local to that old screen, so they are shifted by the region origin. */
  _spawnNamedNPCs(eraId, npcData, region, namedNpcKeys) {
    const spawn = region.spawn;
    const npcsHere = (npcData[`${eraId}_${region.row}_${region.col}`] || []);
    npcsHere.forEach(d => {
      // Skip NPCs whose location doesn't match current world location
      // For Era 8 specifically, also check against the eraId context location
      // since Haarlem-only NPCs (Romijn/Liv/Henk/Paul) must never appear in Mankato
      const worldLoc = this._location || 'haarlem';
      if (d.location && d.location !== worldLoc) return;
      // Deduplicate: skip if a named NPC with this key already exists
      const npcKey = d.gedcomId || d.name;
      if (namedNpcKeys.has(npcKey)) return;
      namedNpcKeys.add(npcKey);
      if (d.name)  namedNpcKeys.add(d.name);
      if (d.given) namedNpcKeys.add(d.given);

      // Initial spawn position from data
      let nx = (d.spawnC != null ? region.x0 + d.spawnC : spawn.c + Math.floor(Math.random()*4) - 2) * TILE + 4;
      let ny = (d.spawnR != null ? region.y0 + d.spawnR : spawn.r + Math.floor(Math.random()*4) - 2) * TILE + 4;

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
              // stay inside the region's interior, as the old screen interior did
              if (tr < region.y0 + 1 || tr >= region.y0 + region.rows - 1 ||
                  tc < region.x0 + 1 || tc >= region.x0 + region.cols - 1) continue;
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

      // Schedule waypoints are local to the old screen too
      const data = d.schedule
        ? { ...d, schedule: d.schedule.map(w => ({ ...w, r: w.r + region.y0, c: w.c + region.x0 })) }
        : d;
      const npc = new NPC(data, nx, ny);
      // Restore persistent friendship hearts and talk count (reuse npcKey from dedup above)
      if (this._friendshipMap?.has(npcKey)) npc.friendship = this._friendshipMap.get(npcKey);
      if (this._talkCountMap?.has(npcKey))  npc.talkCount  = this._talkCountMap.get(npcKey);
      if (npc.talkCount > 0) npc.talked = true;
      this._npcs.push(npc);
    });
  }

  /** Enemies of one region (not in the middle row of regions): one kind, chosen by the region's column. */
  _spawnEnemies(eraId, region) {
    if (region.row === 1) return;
    const defs = eraId >= 0 ? [ENEMY_DEFS[_eraEnemies(eraId)[region.col % 2]]] : [];
    defs.filter(Boolean).forEach((def, i) => {
      // Find a walkable spawn position — try initial position, then random search
      let ex = 0, ey = 0;
      const initialX = (region.x0 + 3 + i * 5) * TILE;
      const initialY = (region.y0 + 3 + i * 2) * TILE;
      const pad = 4;
      const walkable = (wx, wy) =>
        !this.solidAt(wx + pad, wy + pad) &&
        !this.solidAt(wx + TILE - pad, wy + TILE - pad);

      if (walkable(initialX, initialY)) {
        ex = initialX; ey = initialY;
      } else {
        // Random search for a clear tile (up to 30 attempts), inside the region
        let found = false;
        for (let attempt = 0; attempt < 30 && !found; attempt++) {
          const tc = region.x0 + 2 + Math.floor(Math.random() * (region.cols - 4));
          const tr = region.y0 + 2 + Math.floor(Math.random() * (region.rows - 4));
          const wx = tc * TILE + pad;
          const wy = tr * TILE + pad;
          if (walkable(wx, wy)) { ex = wx; ey = wy; found = true; }
        }
        if (!found) return; // skip this enemy if no clear spot found
      }
      this._enemies.push(new Enemy(def, ex, ey));
    });
  }

  /** Three random forage drops in one region — check full drop footprint before placing */
  _spawnForage(eraId, region) {
    for (let i = 0; i < 3; i++) {
      const fc = region.x0 + 3 + Math.floor(Math.random() * (region.cols - 6));
      const fr = region.y0 + 3 + Math.floor(Math.random() * (region.rows - 6));
      const fx = fc * TILE + 4;
      const fy = fr * TILE + 4;
      if (!this.solidAt(fx, fy) && !this.solidAt(fx + 20, fy + 20)) {
        const item = _randomForage(eraId, this._location || 'haarlem');
        this._drops.push(new DroppedItem(item, fx, fy));
      }
    }
  }

  /** Static drops — guaranteed items in specific regions (Knoxley's ancient stones, collectible
   *  curiosities, farm animals). STATIC_SCREEN_DROPS keys are the old screen keys, r/c are local. */
  _spawnStaticDrops(eraId, region) {
    const key = `${eraId}_${region.row}_${region.col}`;
    for (const sd of STATIC_SCREEN_DROPS) {
      if (sd.screenKey !== key) continue;
      if (sd.location && sd.location !== (this._location || 'haarlem')) continue;
      const r = region.y0 + sd.r, c = region.x0 + sd.c;
      // Decor animals → wandering Livestock entities (not static drops)
      if (sd.item.decorOnly && sd.item.id?.startsWith('decor_')) {
        const sx = c * TILE + TILE * 0.1;
        const sy = r * TILE + TILE * 0.1;
        if (!this.solidAt(sx + 4, sy + 4)) {
          this._livestock.push(new Livestock({ animalId: sd.item.id, emoji: sd.item.emoji, name: sd.item.label }, sx, sy));
        }
        continue;
      }
      const sx = c * TILE + 8;
      const sy = r * TILE + 8;
      if (!this.solidAt(sx, sy)) {
        this._drops.push(new DroppedItem(sd.item, sx, sy, -1));
      }
    }
  }

  /** Populate a region with era-appropriate background NPCs.
   *  existingNames: Set of names/ids already placed in the era — skip those. */
  _spawnAmbientNPCs(eraId, existingNames, region) {
    const era = eraId;
    const location = this._location || 'haarlem';
    const pools = _ambientNPCPool(era, location);
    if (!pools.length) return;

    // Reduce ambient density slightly: max 2 per region (was 4)
    // This prevents overcrowding and makes each NPC feel special
    const counts = { 0:1, 1:2, 2:2, 3:1 };
    const count = Math.min(counts[region.row] ?? 1, pools.length);

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
      // Also skip if already placed
      if (existingNames.has(template.name) || existingNames.has(template.given)) continue;

      // Find a walkable spawn position — check full NPC footprint, not just centre
      let tx = 0, ty = 0;
      for (let attempt = 0; attempt < 30; attempt++) {
        const tc = region.x0 + 3 + Math.floor(Math.random() * (region.cols - 6));
        const tr = region.y0 + 3 + Math.floor(Math.random() * (region.rows - 6));
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

      // Mark as used world-wide
      this._ambientNPCsUsed.add(template.name);
      existingNames.add(template.name);
      if (template.given) existingNames.add(template.given);

      this._npcs.push(npc);
      spawned++;
    }
  }

  // ── Regions ────────────────────────────────────────────

  /** The region at grid cell (row, col), or null. */
  regionAt(row, col) { return this.regions?.[row]?.[col] ?? null; }

  /** The region that contains map tile (tr, tc), or null outside every region. */
  regionAtTile(tr, tc) {
    for (const reg of this.regionList) {
      if (tr >= reg.y0 && tr < reg.y0 + reg.rows && tc >= reg.x0 && tc < reg.x0 + reg.cols) return reg;
    }
    return null;
  }

  /** The region that contains world pixel (x, y), or null. */
  regionAtPixel(x, y) { return this.regionAtTile(Math.floor(y / TILE), Math.floor(x / TILE)); }

  /** World pixel position (top-left of the player's box) of a region's spawn point. */
  spawnPixel(region = this.region) {
    const sp = region?.spawn;
    return sp ? { x: sp.c * TILE + 4, y: sp.r * TILE + 4 } : { x: 10 * TILE + 4, y: 7 * TILE + 4 };
  }

  /**
   * Work out which region the player is in. Call once per frame (or with force=true after placing the
   * player). Keeps screenRow/screenCol current and marks the region visited. Returns the region the
   * player has just ENTERED, or null when nothing changed.
   */
  updateRegion(player, force = false) {
    const cx = player.cx, cy = player.cy;
    const cur = this.region;
    if (cur && !force) {
      const m = REGION_HYSTERESIS;
      if (cx >= cur.x0 * TILE - m && cx < (cur.x0 + cur.cols) * TILE + m &&
          cy >= cur.y0 * TILE - m && cy < (cur.y0 + cur.rows) * TILE + m) return null;
    }
    const next = this.regionAtPixel(cx, cy);
    if (!next || next === cur) return null;
    this.screenRow = next.row;
    this.screenCol = next.col;
    this._visited.add(next.key);
    return next;
  }

  /** An entity's position in region-grid units (x = 1.5 is the middle of the second region column),
   *  for the minimap dot. */
  regionGridPosition(entity) {
    const ref = this.regionList[0];
    if (!ref) return null;
    return { x: entity.cx / (TILE * ref.cols), y: entity.cy / (TILE * ref.rows) };
  }

  // ── Tile queries ───────────────────────────────────────

  solidAt(wx, wy, player = null) {
    const c = Math.floor(wx / TILE);
    const r = Math.floor(wy / TILE);
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return true;
    const tile = this.map[r]?.[c] ?? T.GRASS;
    // flotsam item: player can temporarily walk on water
    if (player?._flotsam && (tile === T.WATER || tile === T.DEEP_WATER)) return false;
    return SOLID_TYPES.has(tile);
  }

  /** True when a box of this size at (x, y) would not stand in a wall (the foot test Player.update uses). */
  canStandAt(x, y, w = TILE * 0.52, h = TILE * 0.72) {
    const pad = 3, footTop = y + h * 0.65, footBottom = y + h - pad;
    return !this.solidAt(x + pad,     footTop)    && !this.solidAt(x + w - pad, footTop) &&
           !this.solidAt(x + pad,     footBottom) && !this.solidAt(x + w - pad, footBottom);
  }

  /** Returns the tile ID under a world coordinate */
  tileAt(wx, wy) {
    const c = Math.floor(wx / TILE);
    const r = Math.floor(wy / TILE);
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return T.GRASS;
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

  /** True if there is a portal tile anywhere in the region (default: the player's current one) */
  portalInRegion(region = this.region) {
    return !!region?.hasPortal;
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
    return { spent: true, r, c };
  }

  /** Spawn a collectible DroppedItem. Pass r,c for tile position OR r=0,c=0,x,y for explicit coords */
  spawnDrop(item, r, c, explicitX, explicitY) {
    let x = explicitX ?? (c * TILE + TILE * 0.25);
    let y = explicitY ?? (r * TILE + TILE * 0.25);
    // Clamp to the map so the item doesn't spawn outside bounds
    const margin = TILE * 0.5;
    x = Math.max(margin, Math.min(this.cols * TILE - margin, x));
    y = Math.max(margin, Math.min(this.rows * TILE - margin, y));
    // If clamped position is solid, try the item's source tile as fallback
    if (this.solidAt(x + 4, y + 4) && r > 0) {
      x = c * TILE + TILE * 0.25;
      y = r * TILE + TILE * 0.25;
    }
    this._drops.push(new DroppedItem({ ...item, decorOnly: false }, x, y, -1));
  }

  resetCrops() {
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        if (this.map[r]?.[c] === T.CROP_SPENT) this.map[r][c] = T.CROP_READY;
  }

  // ── NPC proximity ──────────────────────────────────────

  nearestNPC(player, maxDist = TILE * 1.1) {
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
    for (const livestock of this._livestock || []) livestock.update(dt, this);
    for (const drop of this.activeDrops)  drop.update(dt);

    // Cull dead entities — spawn loot for newly-dead enemies
    for (const enemy of this._enemies) {
      if (enemy.state === 'dead' && enemy.deathTimer > 0 && !enemy._lootDropped) {
        enemy._lootDropped = true;
        const drops = enemy.loot?.() || [];
        for (let i = 0; i < drops.length; i++) {
          // Scatter drops slightly around the death position
          const angle = (i / Math.max(drops.length, 1)) * Math.PI * 2;
          const r = TILE * 0.5;
          const dx = drops.length > 1 ? Math.cos(angle) * r : 0;
          const dy = drops.length > 1 ? Math.sin(angle) * r : 0;
          this._drops.push(new DroppedItem(drops[i], enemy.cx + dx - TILE*0.25, enemy.cy + dy - TILE*0.25, -1));
        }
        if (drops.length > 0) {
          game?.ui?.showToast(`💀 ${enemy.name} dropped ${drops.length} item${drops.length > 1 ? 's' : ''}!`, '#c0ffa0');
        }
      }
    }
    this._npcs    = this._npcs.filter(n => n.alive);
    this._enemies = this._enemies.filter(e => e.alive || e.deathTimer > 0);
    this._drops   = this._drops.filter(d => d.alive);
  }

  get visitedSet()     { return this._visited; }
  /** Number of defined regions in the current era (a region is explored once the player has been in it) */
  get definedRegionCount() { return this.regionList.length; }
  get definedScreenCount() { return this.definedRegionCount; }
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

function _randomForage(eraId, loc = 'haarlem') {
  const tables = [
    [{id:'herb',label:'Healing Herb',emoji:'🌿'},{id:'mushroom',label:'Mushroom',emoji:'🍄'},{id:'flower',label:'Flower',emoji:'🌸'},{id:'wood',label:'Wood',emoji:'🪵'}],
    [{id:'tulip',label:'Tulip',emoji:'🌷'},{id:'coin',label:'Coin',emoji:'🪙'},{id:'herb',label:'Herb',emoji:'🌿'},{id:'flower',label:'Flower',emoji:'🌸'}],
    [{id:'rye',label:'Rye Stalk',emoji:'🌾'},{id:'coin',label:'Franc',emoji:'🪙'},{id:'herb',label:'Herb',emoji:'🌿'},{id:'wood',label:'Wood',emoji:'🪵'}],
    [{id:'coal',label:'Coal',emoji:'⬛'},{id:'iron',label:'Iron',emoji:'🔩'},{id:'herb',label:'Herb',emoji:'🌿'},{id:'potato',label:'Potato',emoji:'🥔'}],
    [{id:'rope',label:'Rope',emoji:'🪢'},{id:'fish_ration',label:'Fish Ration',emoji:'🐟'},{id:'coin',label:'Dollar',emoji:'💵'},{id:'wood',label:'Driftwood',emoji:'🪵'}],
    [{id:'corn',label:'Corn',emoji:'🌽'},{id:'coin',label:'Dollar',emoji:'💵'},{id:'flower',label:'Prairie Flower',emoji:'🌻'},{id:'herb',label:'Herb',emoji:'🌿'}],
    // Era 6: Dutch side has Guilder/Tulip; US (Wisconsin) side has Dollar/Flower
    // Era 7: NL side has Euro; US (Minnesota) side has Dollar
  ];

  // Era 6 (1984): Dutch Netherlands has Guilder + Tulip; Wisconsin USA has Dollar + Flower
  const era6NL = [{id:'coin',label:'Guilder',emoji:'🪙'},{id:'flower',label:'Tulip',emoji:'🌷'},{id:'cassette_tape',label:'Cassette',emoji:'📼'},{id:'herb',label:'Herb',emoji:'🌿'}];
  const era6US = [{id:'coin',label:'Dollar',emoji:'💵'}, {id:'flower',label:'Flower',emoji:'🌸'},{id:'cassette_tape',label:'Cassette',emoji:'📼'},{id:'herb',label:'Herb',emoji:'🌿'}];

  // Era 7 (2020): NL Haarlem has Euro; Minnesota USA has Dollar
  const era7NL = [{id:'coin',label:'Euro',emoji:'💶'},{id:'flower',label:'Flower',emoji:'🌸'},{id:'usb_drive',label:'USB Drive',emoji:'💾'},{id:'herb',label:'Herb',emoji:'🌿'}];
  const era7US = [{id:'coin',label:'Dollar',emoji:'💵'},{id:'flower',label:'Flower',emoji:'🌸'},{id:'usb_drive',label:'USB Drive',emoji:'💾'},{id:'herb',label:'Herb',emoji:'🌿'}];

  let t;
  if (eraId === 6) t = (loc === 'haarlem') ? era6NL : era6US;
  else if (eraId === 7) t = (loc === 'haarlem') ? era7NL : era7US;
  else t = tables[eraId] || tables[0];
  return t[Math.floor(Math.random() * t.length)];
}

// ── Ambient NPC pool — DISABLED ──────────────────────────
// Only Van Duynhoven family members and spouses appear as NPCs.
// All NPCs are generated from the GEDCOM in Game._buildNpcData().
function _ambientNPCPool(eraId, location = 'haarlem') {
  return [];
}
