// ═══════════════════════════════════════════════════════════
//  Game — main orchestrator: owns all subsystems, runs tick
// ═══════════════════════════════════════════════════════════
import { Engine }        from './Engine.js';
import { Player }        from './Player.js';
import { World }         from './World.js';
import { UI }            from './UI.js';
import { Music }         from './Music.js';
import { EventBus }      from './EventBus.js';
import { SaveManager }   from './SaveManager.js';
import { QuestManager }  from './QuestManager.js';
import { CHARACTERS, getCharacter } from './CharacterData.js';
import { NPC_DATA, CROP_ITEMS }     from './NpcData.js';
import { ERAS, FISH_TABLES, SCREEN_COLS, SCREEN_ROWS } from './EraData.js';
import {
  TILE, setEra,
  drawSky, drawTiles, drawBobber,
} from './Renderer.js';

// ── Game states ──────────────────────────────────────────
const STATE = {
  CHAR_SELECT: 'char_select',
  INTRO:       'intro',
  PLAYING:     'playing',
  PAUSED:      'paused',
};

export class Game {
  constructor(canvasId = 'rt-canvas') {
    this.engine  = new Engine(document.getElementById(canvasId));
    this.world   = new World();
    this.music   = new Music();
    this.events  = new EventBus();
    this.save    = new SaveManager();
    this.ui      = new UI(this);
    this.player  = null;   // set after character select
    this.quests  = null;
    this._state  = STATE.CHAR_SELECT;
    this._dialogNPC   = null;
    this._eraId       = 0;
    this._timeOfDay   = 0.3;
    this.characterId  = 'traveller';
    this.unlockedEras = new Set([0]);
    this._gedcom      = null;  // parsed GEDCOM data

    // Bind event listeners
    this._bindQuestEvents();

    // Preload GEDCOM
    this._loadGEDCOM();
  }

  // ── Public entry ────────────────────────────────────

  async init() {
    // Show character select
    this.ui.showCharacterSelect(CHARACTERS, id => this._onCharSelected(id));
  }

  // ── Character selection ─────────────────────────────

  _onCharSelected(charId) {
    this.characterId = charId;
    const char = getCharacter(charId);

    // Initialise player with character appearance
    this.player = new Player(SCREEN_COLS/2 * TILE, (SCREEN_ROWS-3) * TILE, char.sprite);
    this.player.dutchWords = [];

    // Initialise quest manager
    this.quests = new QuestManager(charId, this.events);

    // Start intro sequence
    this._state = STATE.INTRO;
    this.ui.playIntro(char.intro, () => this._afterIntro(char));
  }

  _afterIntro(char) {
    // Load the starting era
    const startEra = char.startEra ?? 0;
    this.loadEra(startEra);
    this._state = STATE.PLAYING;
    this.engine.start((dt, frame) => this._tick(dt, frame));
    this.ui.showToast(`⏰ ${ERAS[startEra]?.year} — Find your ancestors!`);
  }

  // ── Era management ───────────────────────────────────

  loadEra(eraId) {
    this._eraId = eraId;
    setEra(eraId);

    // Merge NPC_DATA with GEDCOM metadata
    const npcData = this._buildNpcData(eraId);

    this.world.loadEra(eraId, npcData);
    const sp = this.world.screen?.spawn;
    if (this.player) {
      this.player.x = (sp?.c ?? 10) * TILE + 4;
      this.player.y = (sp?.r ?? 7)  * TILE + 4;
    }
    this.engine.cameraX = 0;
    this.engine.cameraY = 0;
    this._dialogNPC = null;
    document.getElementById('rt-dialog').style.display = 'none';
    this.music.playTrack(eraId);
    this.ui.showScreenTitle(this.world.screen?.title || ERAS[eraId]?.year || '');
  }

  travelToEra(targetId) {
    if (targetId < 0 || targetId > 7) return;
    if (!this.unlockedEras.has(targetId)) return;
    const ctx = this.engine.ctx;
    ctx.fillStyle = 'rgba(80,40,180,0.88)';
    ctx.fillRect(0, 0, this.engine.width, this.engine.height);
    this.music.sfxPortal?.();
    setTimeout(() => {
      this.loadEra(targetId);
      this.ui.showToast(`⏰ Arrived: ${ERAS[targetId]?.year} — ${ERAS[targetId]?.name}`);
    }, 350);
  }

  // ── Interaction ──────────────────────────────────────

  interact() {
    if (this._state !== STATE.PLAYING) return;
    if (this._dialogNPC) { this.ui.advanceDialog(); return; }

    const npc = this.world.nearestNPC(this.player);
    if (npc) { this._startDialog(npc); return; }

    if (this.world.atPortal(this.player)) { this.ui.showEraSel(); return; }

    // Harvest crop
    const crop = this.world.atCrop(this.player);
    if (crop) {
      this.world.harvestCrop(crop.r, crop.c);
      const cropItem = CROP_ITEMS.find(c => c.era === this._eraId);
      if (cropItem && this.player.collectItem(cropItem)) {
        this.ui.showItemToast(cropItem);
        this.ui.renderInventory(this.player.inventory);
        this.player.drainStamina(1);
        this.events.emit('item_collected', { itemId: cropItem.id });
        this.music.sfxCollect?.();
      }
      return;
    }

    // Pick up dropped items
    for (const drop of this.world.activeDrops) {
      if (this.player.distTo(drop) < TILE * 1.5) {
        if (this.player.collectItem(drop.item)) {
          this.ui.showItemToast(drop.item);
          this.ui.renderInventory(this.player.inventory);
          drop.alive = false;
          this.events.emit('item_collected', { itemId: drop.item.id });
          this.music.sfxCollect?.();
        }
        return;
      }
    }
  }

  attack() {
    if (this._state !== STATE.PLAYING) return;
    if (this.player.swingTimer > 0) return;
    this.player.swingTimer = 0.25;

    const hb = this.player.getSwingHitbox();
    for (const enemy of this.world.activeEnemies) {
      if (enemy.alive && this.player.hitboxOverlaps(hb, enemy)) {
        const dx = enemy.cx - this.player.cx;
        const dy = enemy.cy - this.player.cy;
        const len = Math.hypot(dx, dy) || 1;
        enemy.takeDamage(25, dx/len, dy/len);
        this.music.sfxHit?.();
      }
    }
  }

  fish() {
    if (this._state !== STATE.PLAYING) return;
    if (!this.world.isFishable(this.player)) return;

    if (this.player.fishTimer > 0) {
      // Reel attempt
      const result = this.player.tryReel();
      if (result === 'caught') this._grantFish();
      else if (result === 'miss') { this.ui.showToast('Oh no — it got away! 🐟', '#ff8080'); this.music.sfxFishMiss?.(); }
      return;
    }

    // Start fishing
    const bpos = this.world.fishingBobberPos(this.player);
    this.player.startFishing(bpos.x, bpos.y);
    this.music.sfxFishCast?.();
    this.ui.showToast('🎣 Fishing… watch for the dip!', '#80c0ff');
  }

  _grantFish() {
    const table = FISH_TABLES[this._eraId] || FISH_TABLES[0];
    const pick  = Math.random() < 0.2 ? table[1] : table[0];
    if (!pick) return;
    if (this.player.collectItem(pick)) {
      this.ui.showItemToast(pick);
      this.ui.renderInventory(this.player.inventory);
      this.events.emit('item_collected', { itemId: pick.id });
    }
    this.music.sfxFishCaught?.();
    this.ui.showToast(`${pick.emoji} You caught a ${pick.label}!`, '#80ff80');
  }

  // ── Dialog ───────────────────────────────────────────

  _startDialog(npc) {
    this._dialogNPC = npc;
    npc.wanderDx = 0; npc.wanderDy = 0;
    npc.faceToward(this.player);

    this.ui.openDialog(npc, this.characterId, () => {
      this._onDialogDone(npc);
    });
  }

  _onDialogDone(npc) {
    this._dialogNPC = null;

    // Add fact to journal
    if (!this.player.collectedFacts.find(f => f.npcId === npc.gedcomId)) {
      const lines = npc.linesForCharacter(this.characterId);
      const text  = (typeof lines[0] === 'object' ? lines[0].en || lines[0].dutch : lines[0]) || '';
      this.player.collectedFacts.push({ npcId: npc.gedcomId || npc.name, name: npc.name, text });
      this.events.emit('npc_talked', { npcId: npc.gedcomId });
      // Facts milestone
      this.events.emit('facts_milestone', { count: this.player.collectedFacts.length });
    }

    // Add friendship
    npc.addFriendship(1);
    npc.talked = true;

    // Give gate item
    if (npc.item && !this.player.hasItem(npc.item.id)) {
      if (this.player.collectItem(npc.item)) {
        this.ui.showItemToast(npc.item);
        this.ui.renderInventory(this.player.inventory);
        this.music.sfxCollect?.();
        // Unlock next era if this is the gate item
        const era = ERAS[this._eraId];
        if (era?.gateItem?.id === npc.item.id && this._eraId < 7) {
          this.unlockedEras.add(this._eraId + 1);
          this.ui.showToast(`⏰ Time Portal to ${ERAS[this._eraId+1]?.year} unlocked!`, '#c060ff');
          this.music.sfxEraUnlock?.();
          this.events.emit('era_unlocked', { eraId: this._eraId + 1 });
        }
      }
    }

    // Dutch word quest — collect from dialog
    if (this.characterId === 'raven') {
      const lines = npc.linesForCharacter(this.characterId);
      lines.forEach(line => {
        if (typeof line === 'object' && line.dutch) {
          const word = line.dutch.split(' ')[0].replace(/[^a-zA-Z]/g,'').toLowerCase();
          if (word && !this.player.dutchWords?.find(w => w.dutch === line.dutch)) {
            this.player.dutchWords = this.player.dutchWords || [];
            this.player.dutchWords.push({ dutch: line.dutch, en: line.en || '' });
          }
        }
      });
    }

    // Auto-save
    this.save.save(this);
  }

  get dialogActive() { return !!this._dialogNPC; }

  // ── Main tick ────────────────────────────────────────

  _tick(dt, frame) {
    if (this._state !== STATE.PLAYING) return;

    const engine = this.engine;
    const ctx    = engine.ctx;
    const W      = engine.width;
    const H      = engine.height;

    // ── Screen transition ──────────────────────────────
    if (this.world.transition) {
      const done = this.world.updateTransition(dt);
      this._drawTransition(frame);
      if (done) {
        const pos = this.world.entryPosition(done.dir);
        this.player.x = pos.x;
        this.player.y = pos.y;
        this.ui.showScreenTitle(this.world.screen?.title || '');
      }
      return;
    }

    // ── Input ──────────────────────────────────────────
    const inputBlocked = this._dialogNPC || this.ui.journalOpen || this.ui.eraSelOpen;

    if (!inputBlocked) {
      this.player.update(dt, engine.keys, this.world);
    }

    if (!inputBlocked) {
      if (engine.consumeAttack()) this.attack();
      if (engine.consumeFish())   this.fish();
      if (engine.consumeAction()) this.interact();
    }

    // ── Check screen exit ──────────────────────────────
    const exitDir = this.world.checkScreenExit(this.player);
    if (exitDir && this.world.canExitDir(exitDir)) {
      this.world.startTransition(exitDir, this.player, this._eraId, this._buildNpcData(this._eraId));
    }

    // ── World update ───────────────────────────────────
    if (!this._dialogNPC) {
      this.world.update(dt, this.player, this);
    }

    // Fishing dip is handled internally by Player.update() via setTimeout

    // ── Time of day ────────────────────────────────────
    this._timeOfDay = (this._timeOfDay + dt / 600) % 1; // full cycle ~10min

    // ── Camera ────────────────────────────────────────
    engine.updateCamera(this.player, TILE, TILE, SCREEN_COLS, SCREEN_ROWS);
    const ox = Math.floor(engine.cameraX);
    const oy = Math.floor(engine.cameraY);

    // ── Draw ──────────────────────────────────────────
    drawSky(ctx, W, H, frame, this._timeOfDay);
    drawTiles(ctx, this.world.map, SCREEN_ROWS, SCREEN_COLS, ox, oy, W, H);

    // Drops
    for (const d of this.world.activeDrops) d.draw(ctx, ox, oy, frame);

    // Entities sorted by Y (depth sort)
    const entities = [...this.world.activeNPCs, ...this.world.activeEnemies, this.player];
    entities.sort((a, b) => a.cy - b.cy);
    for (const e of entities) e.draw(ctx, ox, oy, frame);

    // Fishing bobber
    if (this.player.fishTimer > 0) {
      drawBobber(ctx, this.player.bobberX - ox, this.player.bobberY - oy,
                 this.player.fishDipped, frame);
    }

    // ── Minimap ────────────────────────────────────────
    this.ui.drawMinimap(ctx, this.world, W);

    // ── Prompt ────────────────────────────────────────
    const nearNPC = this.world.nearestNPC(this.player);
    const atPortal = this.world.atPortal(this.player);
    const atCrop   = this.world.atCrop(this.player);
    const fishable = this.world.isFishable(this.player);

    if (nearNPC && !this._dialogNPC) {
      this.ui.showPrompt(`💬 Talk to ${nearNPC.data?.given || nearNPC.name} — E`);
    } else if (atPortal) {
      this.ui.showPrompt('⏰ Time Portal — E to travel');
    } else if (atCrop) {
      this.ui.showPrompt('🌾 Harvest crop — E');
    } else {
      this.ui.hidePrompt();
    }

    // ── HUD ────────────────────────────────────────────
    this.ui.updateHUD(
      this._eraId,
      this.player.hp, this.player.maxHp,
      this.player.stamina, this.player.maxStamina,
      this.player.collectedFacts.length,
      Object.keys(NPC_DATA).reduce((s, k) => s + (NPC_DATA[k]?.length || 0), 0),
      fishable,
    );

    // ── Death check ────────────────────────────────────
    if (this.player.hp <= 0) this._respawn();
  }

  _respawn() {
    this.player.hp = Math.floor(this.player.maxHp * 0.3);
    const sp = this.world.screen?.spawn || { r:7, c:10 };
    this.player.x = sp.c * TILE + 4;
    this.player.y = sp.r * TILE + 4;
    this.ui.showToast('💀 Defeated! Respawned.', '#e74c3c');
  }

  // ── Screen transition drawing ─────────────────────────

  _drawTransition(frame) {
    const tr = this.world.transition;
    if (!tr) return;
    const ctx = this.engine.ctx;
    const p   = tr.progress;
    const ease = p < 0.5 ? 2*p*p : -1+(4-2*p)*p;
    const W   = this.engine.width;
    const H   = this.engine.height;

    let dx=0, dy=0;
    if (tr.dir==='right') dx=-1; if (tr.dir==='left') dx=1;
    if (tr.dir==='down')  dy=-1; if (tr.dir==='up')   dy=1;

    const fromMap = this.world.screens?.[tr.fromR]?.[tr.fromC]?.map;
    const toMap   = this.world.screens?.[tr.toR]?.[tr.toC]?.map;

    ctx.save();
    ctx.translate(dx*W*ease, dy*H*ease);
    drawSky(ctx, W, H, frame, this._timeOfDay);
    if (fromMap) drawTiles(ctx, fromMap, SCREEN_ROWS, SCREEN_COLS, 0, 0, W, H);
    ctx.restore();

    ctx.save();
    ctx.translate(dx*W*(ease-1), dy*H*(ease-1));
    drawSky(ctx, W, H, frame, this._timeOfDay);
    if (toMap) drawTiles(ctx, toMap, SCREEN_ROWS, SCREEN_COLS, 0, 0, W, H);
    ctx.restore();
  }

  // ── GEDCOM ───────────────────────────────────────────

  async _loadGEDCOM() {
    try {
      const text = await fetch('./vanduynhoven_family.ged').then(r => r.ok ? r.text() : null);
      if (!text) return;
      this._gedcom = this._parseGEDCOM(text);
    } catch { /* GEDCOM load is optional — static NPC_DATA fallback */ }
  }

  _parseGEDCOM(text) {
    const individuals = new Map();
    let cur = null;
    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim();
      if (!line) continue;
      const m = line.match(/^(\d+)\s+(@[^@]+@|\S+)\s*(.*)?$/);
      if (!m) continue;
      const [, level, tag, value] = m;
      if (level === '0' && tag.startsWith('@I')) {
        cur = { id: tag, name:'', birthYear:null, birthPlace:'', occupation:'' };
        individuals.set(tag, cur);
      } else if (cur) {
        if (tag === 'NAME')  cur.name = value.replace(/\//g,'').trim();
        if (tag === 'DATE' && !cur.birthYear) {
          const y = value.match(/\d{4}/);
          if (y) cur.birthYear = parseInt(y[0]);
        }
        if (tag === 'PLAC' && !cur.birthPlace) cur.birthPlace = value;
        if (tag === 'OCCU') cur.occupation = value;
      }
    }
    return { individuals };
  }

  _buildNpcData(eraId) {
    // Combine static NPC_DATA with GEDCOM enrichment
    const result = {};
    for (const [key, arr] of Object.entries(NPC_DATA)) {
      if (!key.startsWith(`${eraId}_`)) continue;
      result[key] = arr.map(d => {
        if (d.gedcomId && this._gedcom) {
          const gd = this._gedcom.individuals.get(d.gedcomId);
          if (gd) {
            return { ...d, _gedcomName: gd.name, _birthYear: gd.birthYear, _birthPlace: gd.birthPlace };
          }
        }
        return d;
      });
    }
    return result;
  }

  _bindQuestEvents() {
    this.events.on('quest_step_done', ({ questId, stepId, desc }) => {
      this.ui.showToast(`📋 Quest progress: ${desc}`, '#a0c0ff');
    });
    this.events.on('quest_complete', ({ questId, title }) => {
      this.ui.showToast(`✅ Quest complete: ${title}!`, '#80ff80');
      this.music.sfxQuestComplete?.();
    });
  }
}
