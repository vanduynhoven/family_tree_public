// ═══════════════════════════════════════════════════════════
//  World — 4×4 screen grid, tile collision, Zelda-slide
//  transitions, active entity lists
// ═══════════════════════════════════════════════════════════
import { TILE, SOLID_TYPES, FISHABLE_WATER, T } from './Renderer.js';
import { SCREEN_COLS, SCREEN_ROWS, WORLD_COLS, WORLD_ROWS, buildEraWorld, ENEMY_DEFS } from './EraData.js';
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
      // Deduplicate: skip if a named NPC with this gedcomId or name already exists
      const npcKey = d.gedcomId || d.name;
      if (namedNpcKeys.has(npcKey)) return;
      namedNpcKeys.add(npcKey);
      if (d.name) namedNpcKeys.add(d.name);
      if (d.given) namedNpcKeys.add(d.given);

      const nx = (d.spawnC ?? spawn.c + Math.floor(Math.random()*4) - 2) * TILE + 4;
      const ny = (d.spawnR ?? spawn.r + Math.floor(Math.random()*4) - 2) * TILE + 4;
      const npc = new NPC(d, nx, ny);
      // Restore persistent friendship hearts and talk count
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
        const ex = (3 + i * 5) * TILE;
        const ey = (3 + i * 2) * TILE;
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

// ── Ambient NPC pool per era ──────────────────────────────
// These are background villagers/workers who populate every screen.
// Each has a name, appearance, and one or two lines of flavour dialog.
// They don't give quest items but make the world feel alive.
// 'location' is used for Era 8 to pick the right country pool.
function _ambientNPCPool(eraId, location = 'haarlem') {
  const pools = [

    // ── Era 0 · 1539 ──
    [
      { name:'Village Farmer', given:'Gerrit',  bodyColor:'#6a4a20', hairColor:'#3a2010', skinColor:'#d0a060',
        lines:{ generic:['The heather is early this year. Good sign.','Keep off the east field — Dirck\'s animals are grazing.',{ dutch:'God zij met u. [God be with you.]', en:'' }] } },
      { name:'Miller\'s Wife', given:'Trijntje', bodyColor:'#8a6040', hairColor:'#4a2808', skinColor:'#d0a060',
        lines:{ generic:['The miller went to Aarle for the feast. Won\'t be back till dusk.',{ dutch:'Heb je brood nodig? [Do you need bread?]', en:'We have some to spare.' },'Mind the geese by the mill — they bite.'] } },
      { name:'Young Shepherd', given:'Hannes', bodyColor:'#5a4828', hairColor:'#2a1808', skinColor:'#c89050',
        lines:{ generic:['The priest says there\'s a stranger asking questions at the church. You, maybe?','If you\'re looking for Dirck, he was in the south field this morning.','Seen any wolves? The flock\'s been nervous.'] } },
      { name:'Old Weaver', given:'Brechje', bodyColor:'#7a5038', hairColor:'#604828', skinColor:'#c8a068',
        lines:{ generic:['I\'ve lived here seventy years. The van Duinhoven family — good blood, hard workers.',{ dutch:'Zoek Dirck aan de kerk. [Look for Dirck at the church.]', en:'He prays every morning.' }] } },
      { name:'Church Deacon', given:'Cornelis', bodyColor:'#1a1840', hairColor:'#0a0808', skinColor:'#c8a068',
        lines:{ generic:['Mass is at dawn. Be respectful.','Dirck van Duinhoven? He tends the east field until midday, then rests at home.','Light a candle if you seek guidance.'] } },
    ],

    // ── Era 1 · 1660 ──
    [
      { name:'Canal Merchant', given:'Pieter', bodyColor:'#1a2a6a', hairColor:'#1a1a1a', skinColor:'#d8a870',
        lines:{ generic:['Business is good — VOC ships came in last week.','Watch your coin purse. Pickpockets thick as flies near the bridge.',{ dutch:'Goedendag, vriend! [Good day, friend!]', en:'What are you trading?' }] } },
      { name:'Lacemaker', given:'Maritje', bodyColor:'#6a5040', hairColor:'#3a2010', skinColor:'#d4b070',
        lines:{ generic:['The best lace in all Haarlem — if I say so myself.',{ dutch:'Mooi werk, niet? [Beautiful work, no?]', en:'' },'Johannes van Duynhoven was here yesterday asking after a prayer book.'] } },
      { name:'Harbour Porter', given:'Klaas', bodyColor:'#3a3020', hairColor:'#2a2010', skinColor:'#c09050',
        lines:{ generic:['Third shift loading barrels since sunrise. My back is broken.',{ dutch:'Zwaar werk voor weinig geld. [Hard work for little pay.]', en:'' },'You want Johannes? He worships at Sint-Bavo on Sundays, lives on the Pater Street.'] } },
      { name:'Apothecary', given:'Abraham', bodyColor:'#2a3a2a', hairColor:'#1a1a10', skinColor:'#d0a868',
        lines:{ generic:['Herbs from the East Indies — very effective against fever.',{ dutch:'Hebt u medicijnen nodig? [Do you need medicine?]', en:'' },'The Catholics keep to the south quarter. Go carefully.'] } },
    ],

    // ── Era 2 · 1799 ──
    [
      { name:'Conscript\'s Mother', given:'Clasina', bodyColor:'#5a4838', hairColor:'#3a2818', skinColor:'#d0a868',
        lines:{ generic:['They took my son last month. Not even seventeen.','Keep away from the French patrol — they take anyone who looks strong.',{ dutch:'Pas op voor soldaten. [Watch out for soldiers.]', en:'' }] } },
      { name:'Village Blacksmith', given:'Jan', bodyColor:'#2a2010', hairColor:'#1a0a00', skinColor:'#b08040',
        lines:{ generic:['Too busy making horseshoes for the French army. Don\'t ask me how I feel about that.',{ dutch:'Oorlog is slecht voor iedereen. [War is bad for everyone.]', en:'' },'Petrus? He hides in the cellar when the patrols come through.'] } },
      { name:'Schoolteacher', given:'Hendrik', bodyColor:'#3a3a5a', hairColor:'#2a2a3a', skinColor:'#d0a868',
        lines:{ generic:['The children still come to school even now. Life must go on.','Petrus van Duijnhoven is a clever boy. Asks too many questions.',{ dutch:'Kennis is macht. [Knowledge is power.]', en:'Even in occupation.' }] } },
      { name:'Refugee Woman', given:'Aafke', bodyColor:'#6a4828', hairColor:'#3a2818', skinColor:'#c89050',
        lines:{ generic:['We fled Nijmegen when the French came. Uden is safer.','If you need shelter, the Verwegen family takes people in.',{ dutch:'Wij helpen elkaar. [We help each other.]', en:'That is all we can do.' }] } },
    ],

    // ── Era 3 · 1872 ──
    [
      { name:'Factory Worker', given:'Toon', bodyColor:'#1a1208', hairColor:'#0a0800', skinColor:'#b08040',
        lines:{ generic:['Twelve hours today. Twelve tomorrow. Same pay.',{ dutch:'De fabriek vreet ons op. [The factory devours us.]', en:'' },'Marianus knows how to handle the foreman. Watch and learn.'] } },
      { name:'Railway Navvy', given:'Sjef', bodyColor:'#2a1a08', hairColor:'#1a0a00', skinColor:'#b08040',
        lines:{ generic:['New line coming through — changes everything.',{ dutch:'De trein brengt de wereld. [The train brings the world.]', en:'' },'Marianus van Duijnhoven? Probably in the fields west of the mill.'] } },
      { name:'Market Woman', given:'Nelleke', bodyColor:'#8a4040', hairColor:'#3a1a08', skinColor:'#d0a860',
        lines:{ generic:['Potatoes, carrots, turnips — fresh from the farm.',{ dutch:'Verse groenten, alleen vandaag! [Fresh vegetables, today only!]', en:'' },'The van Duijnhovens always buy here. Good family. Many children.'] } },
      { name:'Village Priest', given:'Pater Koos', bodyColor:'#101010', hairColor:'#080808', skinColor:'#c89058',
        lines:{ generic:['God provides for those who work honestly.',{ dutch:'Ora et labora. [Pray and work.]', en:'The old Benedictine motto.' },'Marianus comes to evening mass. Every day, without fail.'] } },
      { name:'Seamstress', given:'Mientje', bodyColor:'#5a3040', hairColor:'#3a1810', skinColor:'#d0a860',
        lines:{ generic:['I sew until my fingers bleed. What do you want?',{ dutch:'We zijn arme mensen maar eerlijk. [We are poor people but honest.]', en:'' },'Look for Marianus after vespers — he walks home past the mill.'] } },
    ],

    // ── Era 4 · 1950 · Ship ──
    [
      { name:'Fellow Emigrant', given:'Cor', bodyColor:'#2a3a5a', hairColor:'#2a2010', skinColor:'#d0a868',
        lines:{ generic:['Rotterdam to New York in ten days. God willing.',{ dutch:'Wij gaan een nieuw leven beginnen. [We are going to start a new life.]', en:'' },'Johan van Duijnhoven is somewhere below decks with his family.'] } },
      { name:'Ship\'s Steward', given:'Thomas', bodyColor:'#1a2a3a', hairColor:'#1a1a1a', skinColor:'#d0b080',
        lines:{ generic:['Cabin B deck. Meals at seven, noon, and six.',{ dutch:'Welkom aan boord. [Welcome on board.]', en:'' },'Rough weather expected tonight. Stay below.','Mr. Van Duijnhoven? Cabin 214, B deck. Lovely family.'] } },
      { name:'Dutch Nurse', given:'Zuster Riet', bodyColor:'#f0f0f0', hairColor:'#3a2010', skinColor:'#d4b080',
        lines:{ generic:['Three children with seasickness, one with a fever. Busy morning.',{ dutch:'Rust, drinken, en geduld. [Rest, drink fluids, and be patient.]', en:'' },'The van Duijnhoven children are fine — just nervous.'] } },
      { name:'Old Emigrant', given:'Oom Piet', bodyColor:'#4a3828', hairColor:'#808070', skinColor:'#c89050',
        lines:{ generic:['Third time I\'ve made this crossing. Gets easier.',{ dutch:'Amerika is goed voor een werkende man. [America is good for a working man.]', en:'' },'Johan told me he\'s going to Minnesota. Lots of Dutch Catholics there.'] } },
    ],

    // ── Era 5 · 1955 · Minnesota ──
    [
      { name:'Dutch Neighbour', given:'Hendrika', bodyColor:'#5a6040', hairColor:'#3a2810', skinColor:'#d8b880',
        lines:{ generic:['We\'ve been here three years now. Still homesick, but the children love it.',{ dutch:'Amerika is anders maar goed. [America is different but good.]', en:'' },'Gerardus van Duijnhoven? He farms on the county road, half mile east.'] } },
      { name:'Feed Store Man', given:'Dale', bodyColor:'#6a5020', hairColor:'#4a3018', skinColor:'#d4b070',
        lines:{ generic:['Best corn crop in ten years. You can feel the soil is good here.','Dutch fella you\'re looking for? Gerardus works late — try the field after four.'] } },
      { name:'Catholic Priest', given:'Father O\'Brien', bodyColor:'#101010', hairColor:'#484840', skinColor:'#d8b890',
        lines:{ generic:['This whole county is Dutch Catholic. Remarkable community.',{ dutch:'Gelovig volk zijn goede buren. [Religious people make good neighbours.]', en:'' },'Gerardus leads the rosary group on Thursdays. Try the church hall.'] } },
      { name:'Farm Wife', given:'Greta', bodyColor:'#7a5040', hairColor:'#5a3820', skinColor:'#d4b070',
        lines:{ generic:['I baked twelve loaves this morning. Normal Tuesday.',{ dutch:'Werken en bidden, dat is ons leven. [Work and pray, that is our life.]', en:'' },'The van Duijnhoven family? Good people. Gerardus is in the east field.'] } },
      { name:'Hardware Man', given:'Chuck', bodyColor:'#4a4828', hairColor:'#3a3820', skinColor:'#d4b068',
        lines:{ generic:['New John Deere parts came in. Best tractor in the world.','Try the barn after sundown — that\'s when Gerardus tends the equipment.'] } },
    ],

    // ── Era 6 · 1984 ──
    [
      { name:'Neighbourhood Kid', given:'Kevin', bodyColor:'#4060a0', hairColor:'#2a4010', skinColor:'#d4b080',
        lines:{ generic:['Did you see the new BMX track by the school? Totally rad.','The Van Dyn Hoven house is three blocks west — the one with the big oak.'] } },
      { name:'Neighbour Lady', given:'Peg', bodyColor:'#c05080', hairColor:'#c02020', skinColor:'#d8b890',
        lines:{ generic:['Lovely neighbourhood. A bit different since the shopping mall opened though.','Chuck? Try the garage. He\'s always in there tinkering.'] } },
      { name:'Mailman', given:'Ron', bodyColor:'#3060b0', hairColor:'#4a3820', skinColor:'#d4b070',
        lines:{ generic:['Twenty years on this route. Know every dog by name.','You\'ll find Chuck Sr. at the VFW hall most Friday evenings.'] } },
    ],

    // ── Era 7 · 2020 ──
    [
      { name:'Coffee Shop Barista', given:'Emma', bodyColor:'#c06040', hairColor:'#804020', skinColor:'#d8b880',
        lines:{ generic:['Oat milk flat white? We\'re out of regular milk.','Arthur usually comes in at nine. Cappuccino, always.'] } },
      { name:'Pandemic Cyclist', given:'Sjoerd', bodyColor:'#40a060', hairColor:'#2a3010', skinColor:'#c8a060',
        lines:{ generic:['Best part of lockdown? The city belongs to cyclists.',{ dutch:'Haarlem is van de fiets. [Haarlem belongs to the bicycle.]', en:'Always has been.' }] } },
      { name:'Online Schoolteacher', given:'Merel', bodyColor:'#5060c0', hairColor:'#3a2a10', skinColor:'#d0b080',
        lines:{ generic:['Video calls all day. I miss actual classrooms.',{ dutch:'Zoom is geen school. [Zoom is not school.]', en:'The children are struggling.' },'Arthur Van Duynhoven teaches Dutch-American history online now.'] } },
    ],

  ];

  // ── Era 8 · 2026 — SPLIT by location ──────────────────────────────
  // Haarlem pool: Dutch canal cyclists, dog walkers, market regulars
  // Mankato pool:  Minnesota joggers, retirees, neighbourhood regulars
  // They must NOT cross over — a Minnesota jogger has no business in Haarlem.

  if (eraId === 8) {
    if (location === 'mankato') {
      return [
        { name:'Mankato Jogger',     given:'Sarah',   bodyColor:'#e06040', hairColor:'#803020', skinColor:'#d8b880',
          lines:{ generic:['Morning run along the river. Can\'t start the day without it.','You\'re looking for the Van Duynhoven house? 313 Hanover, big front porch.'] } },
        { name:'Hanover St Retiree', given:'Harold',  bodyColor:'#6a6858', hairColor:'#b0a898', skinColor:'#d8b880',
          lines:{ generic:['This street hasn\'t changed in sixty years. That\'s how I like it.','These houses were built around 1890. Solid construction.','Peter John\'s grandchildren visit every summer. Nice family.'] } },
        { name:'Dog Walker',         given:'Barb',    bodyColor:'#9060a0', hairColor:'#604030', skinColor:'#d4b080',
          lines:{ generic:['Three dogs, one leash, every morning. My cardio.','Peter John\'s place? 313 Hanover, two houses down from the big elm.'] } },
        { name:'Lawn Mower',         given:'Terry',   bodyColor:'#408020', hairColor:'#3a3010', skinColor:'#d4b070',
          lines:{ generic:['Nice day for yard work.','The Van Duynhoven family? Good neighbours. Quiet, friendly.'] } },
        { name:'School Bus Driver',  given:'Donna',   bodyColor:'#c08010', hairColor:'#4a3010', skinColor:'#d8b880',
          lines:{ generic:['Route 7, every morning. Thirty years and counting.','Hanover Street? Three blocks north, turn right at the stop sign.'] } },
      ];
    } else {
      // Haarlem pool
      return [
        { name:'Canal Cyclist',    given:'Floris',   bodyColor:'#3060a0', hairColor:'#2a3010', skinColor:'#c8a060',
          lines:{ generic:['Morning! Beautiful day for the canal.',{ dutch:'Fiets je mee naar de markt? [Cycling to the market?]', en:'' },'Tierney\'s opens at eleven on Saturdays. That\'s the rule.'] } },
        { name:'Dog Walker',       given:'Hanneke',  bodyColor:'#8060a0', hairColor:'#5a3020', skinColor:'#d4b080',
          lines:{ generic:['Three dogs, one walk, every morning. That\'s my life.',{ dutch:'Honden zijn de beste buren. [Dogs are the best neighbours.]', en:'' },'The van Duynhoven kids? Raven and Starling? Always at the flower market on Saturdays.'] } },
        { name:'Market Regular',   given:'Bert',     bodyColor:'#605040', hairColor:'#504030', skinColor:'#c8a060',
          lines:{ generic:['Same stall, twenty years. Tulips or roses today?',{ dutch:'De markt is het hart van Haarlem. [The market is the heart of Haarlem.]', en:'' },'You heading to Tierney\'s after? They do a good lunch.'] } },
        { name:'Bakery Owner',     given:'Ineke',    bodyColor:'#c09040', hairColor:'#6a4010', skinColor:'#d4b070',
          lines:{ generic:['Fresh stroopwafels this morning!',{ dutch:'Goedemorgen! Alles goed? [Good morning! All well?]', en:'' },'The family at 276? Yes — Arthur and his girls. Sweet children.'] } },
        { name:'Canal SUP Rider',  given:'Bram',     bodyColor:'#204080', hairColor:'#1a2010', skinColor:'#c8a060',
          lines:{ generic:['Stand-up paddle on the Leidsevaart — perfect flat water.',{ dutch:'Prachtig, toch? [Beautiful, isn\'t it?]', en:'' },'The Grote Kerk is straight ahead, ten minutes on foot.'] } },
      ];
    }
  }

  return pools[Math.min(eraId, pools.length - 1)] || [];
}
