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
  TILE, T, setEra, loadSprites,
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
    this.unlockedEras = new Set([0, 8]); // Era 0 (1539) and Era 8 (2026 home) always unlocked
    this._gedcom      = null;  // parsed GEDCOM data

    // Persistent NPC state — survives screen transitions and era travel
    // Key: npc.gedcomId || npc.name
    this._npcFriendship = new Map();  // key → hearts (0-5)
    this._npcTalkCount  = new Map();  // key → number of conversations

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

    // Restore save data if a save exists for this character
    const savedData = this.save.load(0);
    if (savedData && savedData.characterId === charId) {
      // Restore NPC friendship hearts + talk counts
      if (savedData.npcFriendship) {
        this._npcFriendship = new Map(Object.entries(savedData.npcFriendship));
      }
      if (savedData.npcTalkCount) {
        this._npcTalkCount = new Map(Object.entries(savedData.npcTalkCount));
      }
      // Restore unlocked eras
      if (savedData.unlockedEras) {
        this.unlockedEras = new Set(savedData.unlockedEras);
      }
    }

    // Initialise player with character appearance
    this.player = new Player(SCREEN_COLS/2 * TILE, (SCREEN_ROWS-3) * TILE, char.sprite);
    this.player.dutchWords = [];

    // Restore player state from save
    if (savedData && savedData.characterId === charId && savedData.inventory) {
      this.player.inventory      = savedData.inventory;
      this.player.collectedFacts = savedData.collectedFacts || [];
      this.player.hp             = savedData.playerHP      || 100;
      this.player.stamina        = savedData.playerStamina || 100;
    }

    // Initialise quest manager
    this.quests = new QuestManager(charId, this.events);

    // Start intro sequence
    this._state = STATE.INTRO;
    this.ui.playIntro(char.intro, () => this._afterIntro(char));
  }

  _afterIntro(char) {
    const startEra = char.startEra ?? 0;

    // Load sprite sheets first, then start the game
    loadSprites('./assets/sprites/').then(() => {
      this._startLocation = char.startLocation || 'haarlem'; // 'haarlem' | 'mankato'
      this.loadEra(startEra);
      this._state = STATE.PLAYING;

      // Canvas click → navigate or act
      this._clickTarget  = null;
      this._clickArrived = false;
      this.engine.canvas.addEventListener('click', e => {
        const rect = this.engine.canvas.getBoundingClientRect();
        this.handleCanvasClick(e.clientX - rect.left, e.clientY - rect.top);
      });
      let _touchStart = null;
      this.engine.canvas.addEventListener('touchstart', e => {
        if (e.touches.length === 1) _touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }, { passive: true });
      this.engine.canvas.addEventListener('touchend', e => {
        if (!_touchStart) return;
        const t = e.changedTouches[0];
        if (Math.hypot(t.clientX - _touchStart.x, t.clientY - _touchStart.y) < 10) {
          const rect = this.engine.canvas.getBoundingClientRect();
          this.handleCanvasClick(t.clientX - rect.left, t.clientY - rect.top);
        }
        _touchStart = null;
      }, { passive: true });

      this.engine.start((dt, frame) => this._tick(dt, frame));
      this.ui.showToast(`⏰ ${ERAS[startEra]?.year} — Find your ancestors!`);
    });
  }

  // ── Era management ───────────────────────────────────

  loadEra(eraId) {
    this._eraId = eraId;
    setEra(Math.min(eraId, 7)); // Renderer only has 8 palettes (0-7); clamp

    // Merge NPC_DATA with GEDCOM metadata
    const npcData  = this._buildNpcData(eraId);
    const location = this._startLocation || 'haarlem';

    this.world.loadEra(eraId, npcData, 1, 1, location, this._npcFriendship, this._npcTalkCount);
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
    if (targetId < 0 || targetId > 8) return;
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

  // ── Interaction — unified context-sensitive action ───
  // Called by: E key, Space key, X key, mobile Talk button,
  //            mobile Attack button, canvas click (when adjacent)

  interact() {
    if (this._state !== STATE.PLAYING) return;

    // During dialog: advance it
    if (this._dialogNPC) { this.ui.advanceDialog(); return; }

    // 1. Enemy nearby? → attack it
    const nearEnemy = this._nearestEnemy(TILE * 1.6);
    if (nearEnemy) { this._doAttack(nearEnemy); return; }

    // 2. NPC nearby? → talk
    const npc = this.world.nearestNPC(this.player);
    if (npc) { this._startDialog(npc); return; }

    // 3. At portal? → open era select
    if (this.world.atPortal(this.player)) { this.ui.showEraSel(); return; }

    // 4. Crop ready? → harvest
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

    // 5. Dropped item nearby? → pick up
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

    // 6. Near fishable water? → start fishing
    if (this.world.isFishable(this.player)) { this.fish(); return; }
  }

  // attack() kept as alias for legacy mobile button wiring
  attack() { this.interact(); }

  _doAttack(enemy) {
    if (!enemy || this.player.swingTimer > 0) return;
    this.player.swingTimer = 0.25;
    this.player.faceToward(enemy);
    const hb = this.player.getSwingHitbox();
    for (const e of this.world.activeEnemies) {
      if (e.alive && this.player.hitboxOverlaps(hb, e)) {
        const dx = e.cx - this.player.cx;
        const dy = e.cy - this.player.cy;
        const len = Math.hypot(dx, dy) || 1;
        e.takeDamage(25, dx/len, dy/len);
        this.music.sfxHit?.();
      }
    }
  }

  _nearestEnemy(maxDist) {
    let best = null, bestDist = maxDist;
    for (const e of this.world.activeEnemies) {
      if (!e.alive) continue;
      const d = this.player.distTo(e);
      if (d < bestDist) { bestDist = d; best = e; }
    }
    return best;
  }

  // ── Click-to-navigate / click-to-act ─────────────────

  handleCanvasClick(screenX, screenY) {
    if (this._state !== STATE.PLAYING) return;
    if (this._dialogNPC) { this.ui.advanceDialog(); return; }
    if (this.ui.journalOpen || this.ui.eraSelOpen) return;

    // Convert screen coords → world coords
    const wx = screenX + this.engine.cameraX;
    const wy = screenY + this.engine.cameraY;

    // ── Off-screen click → walk toward the nearest valid screen edge ──
    // This lets the player click beyond the current screen to trigger a transition.
    const screenW = SCREEN_COLS * TILE;
    const screenH = SCREEN_ROWS * TILE;
    const offRight  = wx >= screenW;
    const offLeft   = wx < 0;
    const offBottom = wy >= screenH;
    const offTop    = wy < 0;

    if (offRight || offLeft || offBottom || offTop) {
      // Determine which edge the click is toward and whether it has an exit
      let dir = null;
      if (offRight  && wx - this.player.cx >= Math.abs(wy - this.player.cy)) dir = 'right';
      else if (offLeft   && this.player.cx - wx >= Math.abs(wy - this.player.cy)) dir = 'left';
      else if (offBottom && wy - this.player.cy >= Math.abs(wx - this.player.cx)) dir = 'down';
      else if (offTop    && this.player.cy - wy >= Math.abs(wx - this.player.cx)) dir = 'up';
      // Also handle purely off-screen in one axis
      if (!dir) {
        if (offRight)  dir = 'right';
        else if (offLeft)   dir = 'left';
        else if (offBottom) dir = 'down';
        else if (offTop)    dir = 'up';
      }

      if (dir && this.world.canExitDir(dir)) {
        // Walk the player toward the open passage on that edge
        const exits = this.world.screen?.exits || {};
        const exit  = exits[dir];
        let edgeTx, edgeTy;
        if (dir === 'right')  { edgeTx = screenW - 1;  edgeTy = (exit?.pos ?? 7) * TILE + TILE/2; }
        else if (dir === 'left')   { edgeTx = 1;          edgeTy = (exit?.pos ?? 7) * TILE + TILE/2; }
        else if (dir === 'down')   { edgeTx = (exit?.pos ?? 10) * TILE + TILE/2; edgeTy = screenH - 1; }
        else                       { edgeTx = (exit?.pos ?? 10) * TILE + TILE/2; edgeTy = 1; }
        this._navigateTo(edgeTx, edgeTy, null);
        return;
      }
      // No exit in that direction — ignore the click
      return;
    }

    // ── On-screen click — check for interactive targets first ──

    // 1. NPC?
    for (const npc of this.world.activeNPCs) {
      if (Math.hypot(npc.cx - wx, npc.cy - wy) < TILE * 0.9) {
        this._navigateTo(npc.cx, npc.cy, () => this._startDialog(npc));
        return;
      }
    }

    // 2. Enemy?
    for (const e of this.world.activeEnemies) {
      if (e.alive && Math.hypot(e.cx - wx, e.cy - wy) < TILE * 0.9) {
        this._navigateTo(e.cx, e.cy, () => this._doAttack(e));
        return;
      }
    }

    // 3. Dropped item?
    for (const drop of this.world.activeDrops) {
      if (drop.alive && Math.hypot(drop.cx - wx, drop.cy - wy) < TILE * 1.0) {
        this._navigateTo(drop.cx, drop.cy, () => {
          if (this.player.collectItem(drop.item)) {
            this.ui.showItemToast(drop.item);
            this.ui.renderInventory(this.player.inventory);
            drop.alive = false;
            this.events.emit('item_collected', { itemId: drop.item.id });
            this.music.sfxCollect?.();
          }
        });
        return;
      }
    }

    // 4. Portal?
    if (this.world.tileAt(wx, wy) === T.PORTAL) {
      this._navigateTo(wx, wy, () => this.ui.showEraSel());
      return;
    }

    // 5. Crop?
    const cr = Math.floor(wy / TILE), cc = Math.floor(wx / TILE);
    if (this.world.map[cr]?.[cc] === T.CROP_READY) {
      this._navigateTo(wx, wy, () => this.interact());
      return;
    }

    // 6. Plain walkable ground
    if (!this.world.solidAt(wx, wy)) {
      this._navigateTo(wx, wy, null);
    }
    // Solid tile click — walk toward it as far as possible (player bumps the wall)
    else {
      this._navigateTo(wx, wy, null);
    }
  }

  _navigateTo(tx, ty, onArrival) {
    this._clickTarget  = { tx, ty, onArrival };
    this._clickArrived = false;
  }

  _tickClickNav(dt) {
    if (!this._clickTarget) return;
    const { tx, ty, onArrival } = this._clickTarget;
    const dist = Math.hypot(this.player.cx - tx, this.player.cy - ty);

    if (dist < TILE * 0.8) {
      this._clickTarget = null;
      onArrival?.();
      return;
    }

    // If a screen transition just started, clear the target (world handles it)
    if (this.world.transition) { this._clickTarget = null; return; }

    // Walk toward target
    const dx  = tx - this.player.cx;
    const dy  = ty - this.player.cy;
    const len = Math.hypot(dx, dy) || 1;
    const spd = this.player.speed * dt;
    const nx  = this.player.x + (dx / len) * spd;
    const ny  = this.player.y + (dy / len) * spd;
    const pad = 3;

    if (!this.world.solidAt(nx + pad, this.player.y + pad) &&
        !this.world.solidAt(nx + this.player.w - pad, this.player.y + this.player.h - pad)) {
      this.player.x = nx;
    }
    if (!this.world.solidAt(this.player.x + pad, ny + pad) &&
        !this.world.solidAt(this.player.x + this.player.w - pad, ny + this.player.h - pad)) {
      this.player.y = ny;
    }
    this.player.walkCycle += dt * 9;

    if (Math.abs(dx) > Math.abs(dy)) this.player.facing = dx > 0 ? 'right' : 'left';
    else this.player.facing = dy > 0 ? 'down' : 'up';

    // Cancel if player manually uses keyboard/d-pad
    const keys = this.engine.keys;
    if (keys.up || keys.down || keys.left || keys.right) this._clickTarget = null;
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

    // Add friendship — cap at 5
    npc.addFriendship(1);
    npc.talkCount++;
    npc.talked = true;

    // Persist to cross-screen friendship maps (key = gedcomId || name)
    const npcKey = npc.gedcomId || npc.name;
    this._npcFriendship.set(npcKey, npc.friendship);
    this._npcTalkCount.set(npcKey, npc.talkCount);

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

    // Dialog advance: E / Space always works during dialog
    if (this._dialogNPC) {
      if (engine.consumeAction() || engine.consumeAttack()) this.ui.advanceDialog();
    } else if (!inputBlocked) {
      // Single unified action: E / Space / X / attack button all call interact()
      if (engine.consumeAction() || engine.consumeAttack()) this.interact();
      if (engine.consumeFish()) this.fish();
    }

    // Click-to-navigate tick (runs when no keyboard movement)
    if (!inputBlocked) this._tickClickNav(dt);

    // ── Check screen exit ──────────────────────────────
    const exitDir = this.world.checkScreenExit(this.player);
    if (exitDir && this.world.canExitDir(exitDir)) {
      this.world.startTransition(exitDir, this.player, this._eraId, this._buildNpcData(this._eraId), this._startLocation || 'haarlem');
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

    // Click target cursor
    if (this._clickTarget) {
      const { tx, ty } = this._clickTarget;
      const sx = tx - Math.floor(engine.cameraX);
      const sy = ty - Math.floor(engine.cameraY);
      const r  = TILE * 0.28;
      ctx.strokeStyle = 'rgba(255,255,120,0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      // Cross-hair lines
      ctx.beginPath(); ctx.moveTo(sx - r*1.3, sy); ctx.lineTo(sx - r*0.5, sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx + r*0.5, sy); ctx.lineTo(sx + r*1.3, sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx, sy - r*1.3); ctx.lineTo(sx, sy - r*0.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx, sy + r*0.5); ctx.lineTo(sx, sy + r*1.3); ctx.stroke();
    }

    // ── Prompt ────────────────────────────────────────
    const nearNPC = this.world.nearestNPC(this.player);
    const atPortal = this.world.atPortal(this.player);
    const atCrop   = this.world.atCrop(this.player);
    const fishable = this.world.isFishable(this.player);

    if (nearNPC && !this._dialogNPC) {
      this.ui.showPrompt(`💬 Talk to ${nearNPC.data?.given || nearNPC.name} — E`);
    } else if (this._nearestEnemy(TILE * 1.6)) {
      this.ui.showPrompt('⚔️ Enemy nearby — E to attack');
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
      this._totalNpcCount(),
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
    let inBirt = false, inDeat = false;

    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim();
      if (!line) continue;
      const m = line.match(/^(\d+)\s+(@[^@]+@|\S+)\s*(.*)?$/);
      if (!m) continue;
      const [, level, tag, value] = m;
      const lvl = parseInt(level);

      if (lvl === 0 && tag.startsWith('@I')) {
        cur = { id:tag, name:'', given:'', surname:'', birthYear:null, birthPlace:'',
                deathYear:null, occupation:'', sex:'', famc:null, fams:[] };
        individuals.set(tag, cur);
        inBirt = false; inDeat = false;
      } else if (cur) {
        if (tag === 'NAME') {
          cur.name = value.replace(/\//g, '').trim();
          // Extract surname from /Surname/ pattern
          const sn = value.match(/\/([^\/]+)\//);
          cur.surname = sn ? sn[1].trim() : '';
          cur.given   = value.replace(/\/[^\/]*\//g, '').trim().split(' ')[0];
        }
        if (tag === 'SEX')  cur.sex  = value;
        if (tag === 'OCCU') cur.occupation = value;
        if (tag === 'FAMC') cur.famc = value;
        if (tag === 'FAMS') cur.fams.push(value);

        if (tag === 'BIRT') { inBirt = true; inDeat = false; }
        if (tag === 'DEAT') { inDeat = true; inBirt = false; }
        if (tag === 'DATE') {
          const y = value.match(/\d{4}/);
          if (y) {
            if (inBirt && !cur.birthYear) cur.birthYear = parseInt(y[0]);
            if (inDeat && !cur.deathYear) cur.deathYear = parseInt(y[0]);
          }
        }
        if (tag === 'PLAC') {
          if (inBirt && !cur.birthPlace) cur.birthPlace = value;
        }
        // Reset section flags on new level-1 tag
        if (lvl === 1 && tag !== 'BIRT' && tag !== 'DEAT') { inBirt = false; inDeat = false; }
      }
    }
    return { individuals };
  }

  _buildNpcData(eraId) {
    // Start with static NPC_DATA (hand-authored, richer dialog)
    const result = {};
    const staticKeys = new Set(); // gedcomIds already covered by static data

    for (const [key, arr] of Object.entries(NPC_DATA)) {
      if (!key.startsWith(`${eraId}_`)) continue;
      result[key] = arr.map(d => {
        if (d.gedcomId) staticKeys.add(d.gedcomId);
        if (d.gedcomId && this._gedcom) {
          const gd = this._gedcom.individuals.get(d.gedcomId);
          if (gd) return { ...d, _gedcomName: gd.name, _birthYear: gd.birthYear, _birthPlace: gd.birthPlace };
        }
        return d;
      });
    }

    // Auto-generate NPC entries for every GEDCOM individual in this era
    // who isn't already covered by static NPC_DATA
    if (this._gedcom) {
      for (const [id, gd] of this._gedcom.individuals) {
        if (staticKeys.has(id)) continue;       // hand-authored entry exists
        if (!gd.name || !gd.name.trim()) continue; // unnamed
        const assignedEra = _gedcomEraId(gd.birthYear);
        if (assignedEra !== eraId) continue;

        // Deterministic screen assignment — spread people across the 4×4 grid
        // Use a hash of the gedcom ID to pick row/col
        const hash = _strHash(id);
        const row  = hash % 4;          // 0-3
        const col  = (hash >> 4) % 4;   // 0-3
        const screenKey = `${eraId}_${row}_${col}`;

        // Deterministic tile position within the screen
        const spawnR = 3 + (hash % 8);      // rows 3-10
        const spawnC = 4 + ((hash >> 3) % 10); // cols 4-13

        // Build appearance from name hash (consistent colour per person)
        const skinTones  = ['#f0c080','#d8a060','#c89050','#d0b080','#d4a870'];
        const hairColors = ['#2a1808','#1a0a00','#6a4020','#3a2010','#804020','#d4a020'];
        const bodyColors = ['#3a2a18','#2a3a5a','#5a4020','#3a4828','#6a4030','#2a4050'];
        const hi = hash & 0xfff;
        const skinColor  = skinTones [hi % skinTones.length];
        const hairColor  = hairColors[(hi >> 4) % hairColors.length];
        const bodyColor  = bodyColors[(hi >> 8) % bodyColors.length];

        // Parse given name (first word of name field)
        const given = gd.name.split(' ')[0];
        const surname = gd.name.replace(given, '').trim();

        // Build auto-generated dialog lines using all available GEDCOM data
        const yearStr  = gd.birthYear  ? gd.birthYear.toString()  : 'unknown time';
        const deathStr = gd.deathYear  ? ` I lived until ${gd.deathYear}.` : '';
        const placeStr = gd.birthPlace ? gd.birthPlace.split(',')[0].trim() : 'this region';
        const occupStr = gd.occupation || '';
        const surnameDisplay = gd.surname || surname;

        const lines = { generic: [] };

        // Line 1: personal introduction
        if (gd.birthYear && gd.birthPlace) {
          lines.generic.push(
            `I am ${given}${surnameDisplay ? ' ' + surnameDisplay : ''}. Born in ${placeStr} in ${yearStr}.${deathStr}`
          );
        } else {
          lines.generic.push(
            `My name is ${given}${surnameDisplay ? ' ' + surnameDisplay : ''}. I have lived here all my life.`
          );
        }

        // Line 2: occupation or era flavour
        if (occupStr) {
          lines.generic.push(`I work as a ${occupStr.toLowerCase()}. It keeps food on the table.`);
        } else {
          lines.generic.push(_eraFlavourLine(eraId, given));
        }

        // Line 3: family connection hint
        lines.generic.push(
          `The Van Duynhoven family? Yes — I know them. ${_eraFamilyHint(eraId)}`
        );

        // Repeat lines (2nd and 3rd visits)
        lines.repeat1 = [
          `${given} greets you with a nod.`,
          `"You again! How goes the journey?"`,
          _eraFlavourLine(eraId, given),
        ];
        lines.repeat2 = [
          `"There is always more to tell, if you have time to listen."`,
          gd.occupation
            ? `Being a ${gd.occupation.toLowerCase()} in these times is no easy thing.`
            : _eraFlavourLine(eraId, given),
        ];

        const npcEntry = {
          gedcomId:  id,
          name:      gd.name,
          given,
          era:       eraId,
          spawnR,
          spawnC,
          bodyColor,
          hairColor,
          skinColor,
          lines,
        };

        if (!result[screenKey]) result[screenKey] = [];
        result[screenKey].push(npcEntry);
      }
    }

    return result;
  }

  // Total NPC count (static + GEDCOM) — used in HUD
  _totalNpcCount() {
    if (!this._gedcom) {
      return Object.keys(NPC_DATA).reduce((s, k) => s + (NPC_DATA[k]?.length || 0), 0);
    }
    return this._gedcom.individuals.size;
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

// ── Module-level helpers for GEDCOM NPC generation ───────

/** Assign a GEDCOM individual to an era by birth year */
function _gedcomEraId(birthYear) {
  if (!birthYear) return 0;
  if (birthYear <= 1600) return 0;
  if (birthYear <= 1780) return 1;
  if (birthYear <= 1850) return 2;
  if (birthYear <= 1920) return 3;
  if (birthYear <= 1952) return 4;
  if (birthYear <= 1972) return 5;
  if (birthYear <= 2000) return 6;
  return 7;
}

/** Simple deterministic string hash (djb2-style) */
function _strHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33 ^ str.charCodeAt(i)) & 0x7fffffff;
  return h;
}

/** Era-specific flavour line for auto-generated NPCs */
function _eraFlavourLine(eraId, name) {
  const lines = [
    `The heather is in bloom. A good omen, they say.`,                                      // 0
    `Business flows like canal water — everywhere at once.`,                                // 1
    `The French soldiers marched through again this morning.`,                              // 2
    `The factory whistle rules our lives now.`,                                             // 3
    `Ten days at sea. I am beginning to forget what land smells like.`,                     // 4
    `Minnesota is flat but the soil is rich. We will manage.`,                              // 5
    `Strange times. Everything is changing so fast.`,                                       // 6
    `Video calls to the Netherlands, same family — different world.`,                       // 7
  ];
  return lines[eraId] || lines[0];
}

/** Era-specific family connection hint for auto-generated NPCs */
function _eraFamilyHint(eraId) {
  const hints = [
    `Their farm is east of the church. Good people, quiet workers.`,                        // 0
    `They worship at the old church in the south quarter.`,                                 // 1
    `They keep to themselves these days. Careful with the French about.`,                   // 2
    `Marianus is the one to speak to. He knows everything.`,                                // 3
    `Johan and his family are on B deck. Come find them.`,                                  // 4
    `The van Duijnhovens farm two miles east of town. Ask at the church.`,                  // 5
    `They moved here from Minnesota. Nice family.`,                                         // 6
    `Arthur built a whole website about the family. Ask him about it.`,                     // 7
  ];
  return hints[eraId] || hints[0];
}
