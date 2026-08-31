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
    // Pass hasSave checker so UI can show Continue vs New Game per character
    const hasSave = (charId) => {
      const d = this.save.load(0);
      return !!(d && d.characterId === charId);
    };
    this.ui.showCharacterSelect(CHARACTERS, hasSave, (id, mode) => this._onCharSelected(id, mode));
    // Play the title screen track while the character select is shown
    this.music.playTitleTrack();
  }

  // ── Character selection ─────────────────────────────

  _onCharSelected(charId, mode = 'continue') {
    this.characterId = charId;
    const char = getCharacter(charId);
    const savedData = this.save.load(0);
    const hasSave   = savedData && savedData.characterId === charId;

    if (mode === 'continue' && hasSave) {
      // ── CONTINUE: restore all saved state ──────────
      if (savedData.npcFriendship) {
        this._npcFriendship = new Map(Object.entries(savedData.npcFriendship));
      }
      if (savedData.npcTalkCount) {
        this._npcTalkCount = new Map(Object.entries(savedData.npcTalkCount));
      }
      if (savedData.unlockedEras) {
        this.unlockedEras = new Set(savedData.unlockedEras);
      }
    } else {
      // ── NEW GAME: reset all state ───────────────────
      this._npcFriendship = new Map();
      this._npcTalkCount  = new Map();
      this.unlockedEras   = new Set([0, 8]);
      // Delete any existing save so it doesn't carry over
      this.save.deleteSave(0);
    }

    // Initialise player with character appearance
    this.player = new Player(SCREEN_COLS/2 * TILE, (SCREEN_ROWS-3) * TILE, char.sprite);
    this.player.dutchWords = [];

    // Restore player state from save (continue only)
    if (mode === 'continue' && hasSave && savedData.inventory) {
      this.player.inventory      = savedData.inventory;
      this.player.collectedFacts = savedData.collectedFacts || [];
      this.player.hp             = savedData.playerHP      || 100;
      this.player.stamina        = savedData.playerStamina || 100;
    }

    // Initialise quest manager
    this.quests = new QuestManager(charId, this.events);

    if (mode === 'continue' && hasSave) {
      // ── CONTINUE: skip intro, jump straight to saved position ──
      this._state = STATE.INTRO; // will be set to PLAYING in _afterIntro
      loadSprites('./assets/sprites/').then(() => {
        this._resumeFromSave(char, savedData);
      });
    } else {
      // ── NEW GAME: play the character intro sequence ──
      this._state = STATE.INTRO;
      this.ui.playIntro(char.intro, () => this._afterIntro(char));
    }
  }

  _resumeFromSave(char, savedData) {
    const resumeEra      = savedData.eraId      ?? (char.startEra ?? 0);
    const resumeRow      = savedData.screenRow  ?? 1;
    const resumeCol      = savedData.screenCol  ?? 0;
    const resumePlayerX  = savedData.playerX;
    const resumePlayerY  = savedData.playerY;

    this._startLocation = char.startLocation || 'haarlem';
    this.loadEra(resumeEra);

    // Restore visited screens so minimap shows exploration history
    if (Array.isArray(savedData.visitedScreens)) {
      savedData.visitedScreens.forEach(k => this.world._visited.add(k));
    }
    // Restore portal screens so ★ markers persist
    if (Array.isArray(savedData.portalScreens)) {
      savedData.portalScreens.forEach(k => this.world.portalSet.add(k));
    }

    // Override spawn position with saved player position if available
    if (resumePlayerX != null && resumePlayerY != null) {
      this.player.x = resumePlayerX;
      this.player.y = resumePlayerY;
    }
    // Jump directly to the saved screen
    if (this.world.screens?.[resumeRow]?.[resumeCol]) {
      this.world.screenRow = resumeRow;
      this.world.screenCol = resumeCol;
      // Reload the screen's entities at the restored screen position
      const npcData = this._buildNpcData(resumeEra);
      this.world._loadScreen(resumeEra, npcData);
    }

    this._state = STATE.PLAYING;

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

    this._clickTarget  = null;
    this._clickArrived = false;
    this.engine.start((dt, frame) => this._tick(dt, frame));
    this.ui.showToast(`▶ Resumed — ${ERAS[resumeEra]?.year || ''}`);
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

      // Onboarding hint for first-time players (no collected facts yet)
      if (!this.player.collectedFacts.length) {
        setTimeout(() => {
          this.ui.showToast('👨‍👩‍👧 Walk up to family members and press Act or tap them to hear their story!', '#80c0ff');
        }, 3500);
        setTimeout(() => {
          this.ui.showToast('📚 Collect their stories to fill your Family Album!', '#a0e080');
        }, 8000);
      }
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
    this.music.playTrack(eraId, this._eraVisitCount?.[eraId] % 2 === 1 ? 'b' : 'a');
    // Track visit count so next visit plays the other variant
    if (!this._eraVisitCount) this._eraVisitCount = {};
    this._eraVisitCount[eraId] = (this._eraVisitCount[eraId] || 0) + 1;
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
        this.ui.renderInventory(this.player.inventory, (id) => this._useItem(id));
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
          this.ui.renderInventory(this.player.inventory, (id) => this._useItem(id));
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

        // If battle enemy is still alive and in range, queue another auto-attack
        if (e.alive && e.isBattle) {
          setTimeout(() => {
            if (e.alive && this.player.distTo(e) < TILE * 2.2) this._doAttack(e);
          }, 350);
        }
      }
    }
  }

  _useItem(id) {
    const result = this.player.useItem(id);
    if (!result) return;
    if (!result.used) {
      this.ui.showToast(`Can't use ${id} right now.`, '#888');
      return;
    }
    this.ui.showToast(`${result.emoji} Used! ${result.label}`, '#80ff80');
    this.music.sfxCollect?.();
    this.ui.renderInventory(this.player.inventory, (id) => this._useItem(id));
    this.save.save(this);
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

    const screenW = SCREEN_COLS * TILE;
    const screenH = SCREEN_ROWS * TILE;

    // ── Off-screen click — walk toward nearest exit ──────────────
    const offRight  = wx >= screenW;
    const offLeft   = wx < 0;
    const offBottom = wy >= screenH;
    const offTop    = wy < 0;

    if (offRight || offLeft || offBottom || offTop) {
      let dir = null;
      const adx = Math.abs(wx - this.player.cx);
      const ady = Math.abs(wy - this.player.cy);
      if      (offRight  && adx >= ady) dir = 'right';
      else if (offLeft   && adx >= ady) dir = 'left';
      else if (offBottom && ady >  adx) dir = 'down';
      else if (offTop    && ady >  adx) dir = 'up';
      else if (offRight)  dir = 'right';
      else if (offLeft)   dir = 'left';
      else if (offBottom) dir = 'down';
      else if (offTop)    dir = 'up';

      if (dir && this.world.canExitDir(dir)) {
        this._walkTowardExit(dir);
      }
      return;
    }

    // ── Near-edge click (within 2 tiles of an exit) — treat as exit click ─
    const edgeMargin = TILE * 2;
    if (wx >= screenW - edgeMargin && this.world.canExitDir('right')) { this._walkTowardExit('right'); return; }
    if (wx <= edgeMargin           && this.world.canExitDir('left'))  { this._walkTowardExit('left');  return; }
    if (wy >= screenH - edgeMargin && this.world.canExitDir('down'))  { this._walkTowardExit('down');  return; }
    if (wy <= edgeMargin           && this.world.canExitDir('up'))    { this._walkTowardExit('up');    return; }

    // ── On-screen click — check interactive targets ───────────────

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
            this.ui.renderInventory(this.player.inventory, (id) => this._useItem(id));
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

    // 6. Any ground tile — walk there (including solid, player will bump)
    this._navigateTo(wx, wy, null);
  }

  /** Walk the player in direction dir until they cross the screen boundary. */
  _walkTowardExit(dir) {
    const screenW = SCREEN_COLS * TILE;
    const screenH = SCREEN_ROWS * TILE;
    const exits   = this.world.screen?.exits || {};
    const exit    = exits[dir];
    if (!exit) return;

    // Target: a point well beyond the edge, aligned with the passage
    // The player will walk there, checkScreenExit fires, transition starts
    let tx, ty;
    if (dir === 'right')  { tx = screenW + TILE * 2; ty = exit.pos * TILE + TILE / 2; }
    else if (dir === 'left')   { tx = -TILE * 2;            ty = exit.pos * TILE + TILE / 2; }
    else if (dir === 'down')   { tx = exit.pos * TILE + TILE / 2; ty = screenH + TILE * 2; }
    else                       { tx = exit.pos * TILE + TILE / 2; ty = -TILE * 2; }

    // Use a large arrival threshold so the nav doesn't "stop" before crossing
    this._clickTarget = { tx, ty, onArrival: null, exitNav: true };
    this._clickArrived = false;
  }

  _navigateTo(tx, ty, onArrival) {
    this._clickTarget  = { tx, ty, onArrival, exitNav: false };
    this._clickArrived = false;
  }

  _tickClickNav(dt) {
    if (!this._clickTarget) return;
    const { tx, ty, onArrival, exitNav } = this._clickTarget;
    const dist = Math.hypot(this.player.cx - tx, this.player.cy - ty);

    // Transition started — keep walking (don't clear during exit nav)
    if (this.world.transition) {
      if (!exitNav) { this._clickTarget = null; }
      return;
    }

    // Arrival check — for exit nav, we never "arrive" naturally;
    // checkScreenExit fires the transition. For normal nav, stop when close.
    if (!exitNav && dist < TILE * 0.8) {
      this._clickTarget = null;
      onArrival?.();
      return;
    }

    // If exit nav target reached without transition firing (no exit there),
    // clear so player doesn't walk forever
    if (exitNav && dist < TILE * 0.8) {
      this._clickTarget = null;
      return;
    }

    // Walk toward target
    const dx  = tx - this.player.cx;
    const dy  = ty - this.player.cy;
    const len = Math.hypot(dx, dy) || 1;
    const spd = this.player.speed * dt;
    const nx  = this.player.x + (dx / len) * spd;
    const ny  = this.player.y + (dy / len) * spd;
    const pad = 3;
    const p   = this.player;

    // Foot-based collision (bottom 35% of sprite)
    const footTop    = p.y + p.h * 0.65;
    const footBottom = p.y + p.h - pad;

    if (!this.world.solidAt(nx + pad,        footTop) &&
        !this.world.solidAt(nx + p.w - pad,  footTop) &&
        !this.world.solidAt(nx + pad,        footBottom) &&
        !this.world.solidAt(nx + p.w - pad,  footBottom)) {
      p.x = nx;
    }
    const newFootTop    = ny + p.h * 0.65;
    const newFootBottom = ny + p.h - pad;
    if (!this.world.solidAt(p.x + pad,       newFootTop) &&
        !this.world.solidAt(p.x + p.w - pad, newFootTop) &&
        !this.world.solidAt(p.x + pad,       newFootBottom) &&
        !this.world.solidAt(p.x + p.w - pad, newFootBottom)) {
      p.y = ny;
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
      this.ui.renderInventory(this.player.inventory, (id) => this._useItem(id));
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

    // Add fact to journal — only on first meeting, and only for real ancestors (not friends/contemporaries)
    const alreadyMet = this.player.collectedFacts.find(f => f.npcId === (npc.gedcomId || npc.name));
    const isAncestor = npc.gedcomId !== null;  // null = friend NPC (Romijn, Liv, Paul, Henk)
    if (!alreadyMet) {
      const lines = npc.linesForCharacter(this.characterId);
      const text  = (typeof lines[0] === 'object' ? lines[0].en || lines[0].dutch : lines[0]) || '';
      this.player.collectedFacts.push({ npcId: npc.gedcomId || npc.name, name: npc.name, text });
      this.events.emit('npc_talked', { npcId: npc.gedcomId });
      this.events.emit('facts_milestone', { count: this.player.collectedFacts.length });

      if (isAncestor) {
        // 🎉 Celebrate discovering a new ancestor — kid-friendly big toast
        const given = npc.data?.given || npc.name.split(' ')[0];
        const count = this.player.collectedFacts.length;
        const msgs = [
          `🎉 You met ${given}! Added to your Family Album!`,
          `⭐ Amazing! ${given} is now in your Family Album!`,
          `✨ New ancestor found: ${given}! Keep exploring!`,
          `🌟 ${given} joined your family story! ${count} ancestors met!`,
        ];
        this.ui.showToast(msgs[Math.floor(Math.random() * msgs.length)], '#f0c040');
        this.music.sfxCollect?.();
      }
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
        this.ui.renderInventory(this.player.inventory, (id) => this._useItem(id));
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
      // Calculate player hand position (rod tip) based on sprite position and facing
      const renderW = TILE * 0.95;
      const renderH = TILE * 1.1;
      const rx = this.player.x - ox + (TILE - renderW) / 2;
      const ry = this.player.y - oy + TILE - renderH;
      let handSX, handSY;
      switch (this.player.facing) {
        case 'right': handSX = rx + renderW * 0.85; handSY = ry + renderH * 0.38; break;
        case 'left':  handSX = rx - renderW * 0.05; handSY = ry + renderH * 0.38; break;
        case 'down':  handSX = rx + renderW * 0.75; handSY = ry + renderH * 0.50; break;
        default:      handSX = rx + renderW * 0.20; handSY = ry + renderH * 0.30; break; // up
      }
      drawBobber(ctx,
        this.player.bobberX - ox, this.player.bobberY - oy,
        this.player.fishDipped, frame,
        handSX, handSY);
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

    // Track portal discovery for minimap ★ marker
    if (atPortal) {
      this.world.portalSet.add(`${this.world.screenRow},${this.world.screenCol}`);
    }

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
      this.world.screen?.title || '',
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
      this._familyMemberSet = null; // rebuilt on first _buildNpcData call
    } catch { /* GEDCOM load is optional — static NPC_DATA fallback */ }
  }

  _parseGEDCOM(text) {
    const individuals = new Map();
    const families    = new Map();  // famId → { husb, wife, chil[] }
    let cur = null;
    let curFam = null;
    let inBirt = false, inDeat = false;

    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim();
      if (!line) continue;
      const m = line.match(/^(\d+)\s+(@[^@]+@|\S+)\s*(.*)?$/);
      if (!m) continue;
      const [, level, tag, value] = m;
      const lvl = parseInt(level);

      if (lvl === 0 && tag.startsWith('@I')) {
        curFam = null;
        cur = { id:tag, name:'', given:'', surname:'', birthYear:null, birthPlace:'',
                deathYear:null, occupation:'', sex:'', famc:null, fams:[] };
        individuals.set(tag, cur);
        inBirt = false; inDeat = false;
      } else if (lvl === 0 && tag.startsWith('@F')) {
        cur = null;
        curFam = { id:tag, husb:null, wife:null, chil:[] };
        families.set(tag, curFam);
      } else if (cur) {
        if (tag === 'NAME') {
          cur.name = value.replace(/\//g, '').trim();
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
        if (lvl === 1 && tag !== 'BIRT' && tag !== 'DEAT') { inBirt = false; inDeat = false; }
      } else if (curFam) {
        if (tag === 'HUSB') curFam.husb = value;
        if (tag === 'WIFE') curFam.wife = value;
        if (tag === 'CHIL') curFam.chil.push(value);
      }
    }
    return { individuals, families };
  }

  /**
   * Build the set of GEDCOM IDs eligible to appear as NPCs:
   * - Anyone whose surname matches a Van Duynhoven variant
   * - Anyone who is a spouse of such a person (via shared FAM record)
   */
  _buildFamilyMemberSet() {
    if (!this._gedcom) return new Set();

    const { individuals, families } = this._gedcom;

    // Only Van Duynhoven name variants qualify as primary family members.
    // Spouses are added precisely via FAM records (direct spouse only,
    // not the spouse's extended family).
    const SURNAME_VARIANTS = new Set([
      'van duynhoven', 'van duijnhoven', 'van duinhoven',
      'van dyn hoven', 'vandynhoven',
      'duynhoven', 'duijnhoven', 'duinhoven',
    ]);

    const isVanDuynhoven = (id) => {
      const p = individuals.get(id);
      if (!p) return false;
      return SURNAME_VARIANTS.has((p.surname || '').toLowerCase());
    };

    // Collect primary family members
    const eligible = new Set();
    for (const [id, p] of individuals) {
      if (SURNAME_VARIANTS.has((p.surname || '').toLowerCase())) {
        eligible.add(id);
      }
    }

    // Add spouses: anyone married to an eligible person via a FAM record
    for (const [famId, fam] of families) {
      const husbEligible = fam.husb && eligible.has(fam.husb);
      const wifeEligible = fam.wife && eligible.has(fam.wife);
      if (husbEligible && fam.wife) eligible.add(fam.wife);
      if (wifeEligible && fam.husb) eligible.add(fam.husb);
    }

    return eligible;
  }

  _buildNpcData(eraId) {
    // Start with static NPC_DATA (hand-authored, richer dialog)
    const result = {};
    const staticKeys = new Set();

    // Build the set of eligible family members (Van Duynhoven + direct spouses)
    // Rebuild on every era load so it's always fresh
    if (!this._familyMemberSet && this._gedcom) {
      this._familyMemberSet = this._buildFamilyMemberSet();
    }
    const eligible = this._familyMemberSet || new Set();

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

    // Auto-generate NPC entries for every eligible GEDCOM individual in this era
    if (this._gedcom) {
      const { individuals, families } = this._gedcom;

      // Build spouse→era lookup for people with no birth year:
      // use their spouse's birth year to infer their era
      const spouseEra = new Map();
      for (const [famId, fam] of families) {
        const husbYear = fam.husb ? individuals.get(fam.husb)?.birthYear : null;
        const wifeYear = fam.wife ? individuals.get(fam.wife)?.birthYear : null;
        if (fam.husb && !individuals.get(fam.husb)?.birthYear && wifeYear) {
          spouseEra.set(fam.husb, _gedcomEraId(wifeYear));
        }
        if (fam.wife && !individuals.get(fam.wife)?.birthYear && husbYear) {
          spouseEra.set(fam.wife, _gedcomEraId(husbYear));
        }
      }

      for (const [id, gd] of individuals) {
        if (staticKeys.has(id)) continue;
        if (!gd.name || !gd.name.trim()) continue;

        // *** FAMILY FILTER: only Van Duynhoven family and their spouses ***
        if (!eligible.has(id)) continue;

        // Assign era: use own birth year, or spouse's era if unknown
        const ownEra    = _gedcomEraId(gd.birthYear);
        const inferEra  = spouseEra.get(id) ?? ownEra;
        const assignedEra = gd.birthYear ? ownEra : inferEra;
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
        // Era-appropriate hair and clothing colours
        const hairPalette = eraId <= 3
          ? ['#2a1808','#1a0a00','#5a3010','#3a2010','#7a5020']  // Dutch/NL dark tones
          : ['#2a1808','#1a0a00','#4a3020','#804020','#b08030','#a07840']; // mixed
        const bodyPalette = _eraPalette(eraId);
        const hi = hash & 0xfff;
        const skinColor = skinTones [hi % skinTones.length];
        const hairColor = hairPalette[(hi >> 4) % hairPalette.length];
        const bodyColor = bodyPalette[(hi >> 8) % bodyPalette.length];

        // Parse given and surname
        const given   = gd.given   || gd.name.split(' ')[0];
        const surname = gd.surname || '';
        const fullName = surname ? `${given} ${surname}` : given;

        // Determine the person's location from birth place
        const loc = _gedcomPersonLocation(gd.birthPlace, eraId);

        // For non-VD spouses, find their Van Duynhoven partner's given name
        // so _buildPersonDialog can introduce them in the first line
        const isVdName = /van\s*du[iy][jn]nhov/i.test(gd.name);
        let spouseGiven = null;
        if (!isVdName) {
          for (const famId of gd.fams) {
            const fam = families.get(famId);
            if (!fam) continue;
            const otherId = fam.husb === id ? fam.wife : fam.husb;
            if (!otherId) continue;
            const other = individuals.get(otherId);
            if (other && /van\s*du[iy][jn]nhov/i.test(other.name)) {
              spouseGiven = other.given || other.name.split(' ')[0];
              break;
            }
          }
        }

        // Build accurate, location-specific dialog
        const lines = _buildPersonDialog(given, fullName, gd, eraId, loc, spouseGiven);

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
    // Only count eligible family members + spouses
    if (!this._familyMemberSet) this._familyMemberSet = this._buildFamilyMemberSet();
    return this._familyMemberSet.size;
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

/** Assign a GEDCOM individual to an era by birth year.
 *  Unknown birth year defaults to era 7 (2020 — most recent, for living people). */
function _gedcomEraId(birthYear) {
  if (!birthYear) return 7;  // unknown birth = living person, default to modern era
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

/**
 * Determine a person's location type from their birth place string.
 * Returns: 'nl' | 'us' | 'ship' | 'unknown'
 */
function _gedcomPersonLocation(birthPlace, eraId) {
  if (!birthPlace) return eraId === 4 ? 'ship' : 'nl'; // default NL for early eras
  const bp = birthPlace.toLowerCase();

  // Ship / ocean
  if (bp.includes('atlantic') || bp.includes('ocean') || bp.includes('sea') ||
      bp.includes('aboard') || bp.includes('ship') || bp.includes('vessel')) return 'ship';

  // USA / Minnesota / Wisconsin
  if (bp.includes('minnesota') || bp.includes('mn,') || bp.includes(', mn') ||
      bp.includes('moorhead') || bp.includes('frazee') || bp.includes('mankato') ||
      bp.includes('wisconsin') || bp.includes('wi,') || bp.includes(', wi') ||
      bp.includes('new york') || bp.includes('united states') || bp.includes('u.s.') ||
      bp.includes('usa') || bp.includes('america') || bp.includes('chicago') ||
      bp.includes('illinois') || bp.includes('iowa') || bp.includes('michigan')) return 'us';

  // Canada / NZ / other English-speaking
  if (bp.includes('canada') || bp.includes('new zealand') || bp.includes('australia') ||
      bp.includes('england') || bp.includes('ireland') || bp.includes('scotland')) return 'other';

  // Default: Netherlands / Dutch location
  return 'nl';
}

/**
 * Era and location-appropriate clothing palette
 */
function _eraPalette(eraId) {
  const palettes = [
    ['#5a4020','#3a2810','#6a5030','#4a3820','#7a6040'],          // 0 1539 earthy homespun
    ['#1a2a6a','#2a3a80','#6a4820','#3a3060','#205040'],          // 1 1660 merchant blues/greens
    ['#2a3a5a','#3a4868','#4a3828','#5a4838','#2a2840'],          // 2 1799 muted wartime
    ['#1a1208','#2a2010','#3a2818','#4a3820','#2a1a08'],          // 3 1872 factory dark
    ['#2a3a5a','#1a2a3a','#3a2a18','#4a3828','#2a2a40'],          // 4 1950 ship/emigrant
    ['#5a6040','#6a5020','#4a4828','#7a5040','#3a3820'],          // 5 1955 Minnesota practical
    ['#4060a0','#c05080','#3060b0','#40a060','#806040'],          // 6 1984 colourful decade
    ['#c06040','#5060c0','#40a060','#c08010','#204080'],          // 7 2020 modern variety
    ['#2050a0','#308060','#5060c0','#c06040','#6a6858'],          // 8 2026
  ];
  return palettes[Math.min(eraId, palettes.length-1)];
}

/**
 * Build historically accurate, location-specific dialog for a GEDCOM individual.
 * All lines sound like they come from a real person of that time and place.
 */
function _buildPersonDialog(given, fullName, gd, eraId, loc, spouseGiven = null) {
  const year     = gd.birthYear  || null;
  const died     = gd.deathYear  || null;
  const place    = gd.birthPlace ? gd.birthPlace.split(',')[0].trim() : null;
  const occu     = gd.occupation ? gd.occupation.toLowerCase() : null;
  const isFemale = gd.sex === 'F';

  const lines = { generic: [], repeat1: [], repeat2: [] };

  // ── Introduction ──────────────────────────────────────────────

  // Line 1: for spouses, lead with their Van Duynhoven partner
  if (spouseGiven) {
    lines.generic.push(`I am ${given} — ${spouseGiven}'s ${isFemale ? 'wife' : 'husband'}. We are family.`);
  } else if (year && place) {
    lines.generic.push(`${_intro(eraId, loc, given, fullName, year, place)}`);
  } else if (year) {
    lines.generic.push(`My name is ${fullName}. I was born in ${year}.`);
  } else {
    lines.generic.push(`My name is ${fullName}. I live here, as my family has for generations.`);
  }

  // Line 2: occupation or life situation — era + location specific
  if (occu) {
    lines.generic.push(`${_occupationLine(occu, eraId, loc, given)}`);
  } else {
    lines.generic.push(`${_situationLine(eraId, loc, isFemale)}`);
  }

  // Line 3: death/life span context if known, or family awareness
  if (died && year) {
    const age = died - year;
    lines.generic.push(`${_lifeSpanLine(given, year, died, age, eraId, loc)}`);
  } else {
    lines.generic.push(`${_familyAwarenessLine(eraId, loc, given)}`);
  }

  // ── Repeat visits ─────────────────────────────────────────────

  lines.repeat1 = [
    `${given} ${_repeatGreeting(eraId, loc)}.`,
    `${_repeatLine1(eraId, loc, isFemale)}`,
  ];

  lines.repeat2 = [
    `${_repeatLine2(eraId, loc, isFemale)}`,
    occu ? `${_occupationDepth(occu, eraId, loc)}` : `${_situationLine2(eraId, loc, isFemale)}`,
  ];

  return lines;
}

// ── Dialog line builders ──────────────────────────────────────

function _intro(eraId, loc, given, fullName, year, place) {
  if (loc === 'ship') {
    return `I am ${fullName}, from ${place}. Ten days at sea so far and counting.`;
  }
  if (loc === 'us') {
    if (eraId === 5) return `Name's ${fullName}. Came over from the Netherlands in ${year > 1940 ? `the ${Math.floor((year-1920)/10)*10+1920}s` : `${year}`}. ${place} is home now.`;
    if (eraId === 6) return `I'm ${fullName}. Born right here in ${place} in ${year}.`;
    if (eraId === 7) return `${fullName}, from ${place}. Strange times we're living through.`;
    return `${fullName}, originally from ${place}.`;
  }
  // Netherlands / Dutch
  const dutchIntros = [
    // Era 0 — 1539
    `${_nl('Mijn naam is', 'My name is')} ${fullName}. ${_nl('Geboren in', 'Born in')} ${place} ${_nl('in het jaar', 'in the year')} ${year}.`,
    // Era 1 — 1660
    `I am ${fullName} of ${place}. My family has been here for three generations.`,
    // Era 2 — 1799
    `${fullName}. ${_nl('Geboren te', 'Born in')} ${place}, ${year}. These are difficult times.`,
    // Era 3 — 1872
    `${fullName}, from ${place}. Born in ${year}. The world is changing fast around us.`,
    // Era 4 — ship (already handled)
    `${fullName}, Rotterdam by way of ${place}.`,
    // Era 5+ (NL side rare)
    `${fullName}, from ${place}.`,
  ];
  return dutchIntros[Math.min(eraId, dutchIntros.length-1)];
}

function _nl(dutch, english) {
  // 50% chance to use Dutch phrasing with translation
  return `${dutch} [${english}]`;
}

function _occupationLine(occu, eraId, loc, given) {
  const place = loc === 'us' ? 'here in Minnesota' : loc === 'ship' ? 'on this ship' : 'here';
  if (eraId === 0) return `${_nl(`Als ${occu} werk ik hard`, `As a ${occu} I work hard`)} — from before dawn until dark.`;
  if (eraId === 1) return `I am a ${occu}. Business is brisk in these prosperous times, when it comes.`;
  if (eraId === 2) return `A ${occu} — in peacetime that was honest work. Now, with the French here, everything is uncertain.`;
  if (eraId === 3) return `${_nl('Ik werk als', 'I work as')} ${occu}. ${_nl('Eerlijk werk', 'Honest work')}, but the hours are long and the pay is poor.`;
  if (eraId === 4) return `I was a ${occu} back in the Netherlands. Starting over ${place}.`;
  if (eraId === 5) return `${occu.charAt(0).toUpperCase() + occu.slice(1)} — that's me. Been at it since I was fifteen.`;
  if (eraId === 6) return `I work as a ${occu}. Different career to my parents, that's for sure.`;
  return `I'm a ${occu} these days. The work keeps changing.`;
}

function _situationLine(eraId, loc, isFemale) {
  const she = isFemale;
  if (loc === 'ship') {
    return she
      ? 'I spend my days keeping the children calm and trying not to think about the water beneath us.'
      : 'I stand at the rail every morning. The horizon never changes, but it helps to look.';
  }
  const nl = [
    // 0 · 1539
    she ? `${_nl('Ik zorg voor het huis en de kinderen', 'I care for the house and children')} — the work never ends.`
        : `${_nl('Het land werkt niet zichzelf', 'The land does not work itself')} — we rise before dawn.`,
    // 1 · 1660
    she ? 'I manage the household accounts. My husband does not know how much he relies on my arithmetic.'
        : `${_nl('De handel gaat goed dit jaar', 'Trade is good this year')} — God willing it will last.`,
    // 2 · 1799
    she ? `${_nl('Wij vrouwen houden alles bijeen', 'We women hold everything together')} when the men are taken away.`
        : 'I try to keep my head down and my family fed. That is all a man can do these days.',
    // 3 · 1872
    she ? `${_nl('Twaalf kinderen en het werk gaat maar door', 'Twelve children and the work just keeps going')}.`
        : `${_nl('Vroeg opstaan, laat naar bed', 'Early to rise, late to bed')} — that is the life of a farmer.`,
    // 4
    'We had nothing to stay for. And everything to hope for.',
    // 5
    she ? 'I run the household and help with the farm accounts. The men do the lifting; I do the thinking.'
        : 'Hard work and faith — that is what brought us here and that is what will keep us.',
    // 6
    she ? 'My mother came over from the Netherlands. I grew up hearing Dutch at the dinner table.'
        : 'We built this neighbourhood from nothing in the fifties. I want my kids to appreciate that.',
    // 7
    'Lockdown has been hard. But you learn what matters when you cannot leave the house.',
  ];
  return nl[Math.min(eraId, nl.length-1)];
}

function _lifeSpanLine(given, year, died, age, eraId, loc) {
  if (age < 5)  return `${given} died very young — only ${age} years old. So many children were lost in those days.`;
  if (age < 20) return `${given} did not reach adulthood. Born ${year}, gone by ${died}. A short life, but remembered.`;
  if (age > 80) return `I will live to ${died}${eraId <= 3 ? ' — a very long life for these times' : ''}. ${age} years. Much to see.`;
  return `Born ${year}, died ${died}. ${age} years. ${_lifeContext(eraId, loc)}`;
}

function _lifeContext(eraId, loc) {
  if (loc === 'us') return 'A good American life.';
  if (eraId === 0) return `${_nl('Een eerlijk leven', 'An honest life')}.`;
  if (eraId === 2) return 'Survived the occupation, at least.';
  if (eraId === 3) return `${_nl('Genoeg om op terug te kijken', 'Enough to look back on')}.`;
  return 'A full life.';
}

function _familyAwarenessLine(eraId, loc, given) {
  if (loc === 'ship')
    return 'Everyone on this ship knows the van Duijnhoven family. They are good people.';
  if (loc === 'us') {
    if (eraId === 5) return 'The van Duijnhoven family farm? East of town, county road 9. Can\'t miss it.';
    if (eraId === 6) return 'Van Dyn Hoven — good family. The old spelling was different, they say.';
    return 'The Van Duynhovens? Yes, I know them. Nice people.';
  }
  // NL
  const hints = [
    `${_nl('De familie Van Duinhoven? Die ken ik', 'The Van Duinhoven family? I know them')} — good people, hard workers.`,
    `${_nl('Iedereen in dit dorp kent de Van Duynhovens', 'Everyone in this village knows the Van Duynhovens')}.`,
    `The van Duijnhovens keep to themselves, especially since the French came. Wise of them.`,
    `Marianus van Duijnhoven? His farm is south of the village. ${_nl('Een eerlijke man', 'An honest man')}.`,
    `Johan van Duijnhoven — good man. Going to America, he says.`,
  ];
  return hints[Math.min(eraId, hints.length-1)];
}

function _repeatGreeting(eraId, loc) {
  if (loc === 'us') return 'gives a friendly nod';
  const greetings = [
    `${_nl('knikt beleefd', 'nods politely')}`,
    `${_nl('groet u vriendelijk', 'greets you warmly')}`,
    'nods from across the street',
    `${_nl('herkent u meteen', 'recognises you immediately')}`,
    'spots you across the deck',
    'waves from the porch',
    'waves from the yard',
    'sends a thumbs-up',
  ];
  return greetings[Math.min(eraId, greetings.length-1)];
}

function _repeatLine1(eraId, loc, isFemale) {
  if (loc === 'ship') return 'The sea looks calmer today. Maybe the worst of the weather has passed.';
  if (loc === 'us') {
    if (eraId === 5) return 'Corn is coming in well this year. Best harvest in a decade, they say.';
    if (eraId === 6) return 'The drive-in closed last year. Nothing feels the same.';
    return 'Nice to see a familiar face.';
  }
  const nl = [
    `${_nl('Het gaat goed met de oogst dit jaar', 'The harvest is good this year')}.`,
    `${_nl('De tulpen bloeien vroeg', 'The tulips bloom early')} this season.`,
    `${_nl('De Fransen zijn gisteren weer langsgelopen', 'The French passed through again yesterday')}. Stay off the main road.`,
    `${_nl('De fabriek heeft overuren gevraagd', 'The factory has asked for overtime')} again. No rest for anyone.`,
    `I did not sleep well. The ocean is noisy in a way I did not expect.`,
    `That field is doing well. Rain came at just the right time.`,
    `I see you again! How is the journey going?`,
    `Still exploring, I see. Good.`,
  ];
  return nl[Math.min(eraId, nl.length-1)];
}

function _repeatLine2(eraId, loc, isFemale) {
  if (loc === 'ship') return 'Only a few more days now. I try to keep busy so I do not think about what we left behind.';
  if (loc === 'us') {
    if (eraId === 5) return isFemale ? 'I miss the Netherlands sometimes. The cheese especially.' : 'My Dutch is getting rusty. The kids already speak English better than me.';
    return 'There\'s always more to the story, if you have time.';
  }
  const nl = [
    `${_nl('Wij leven hier al honderden jaren', 'We have lived here for hundreds of years')}. The land knows us.`,
    `${_nl('De handel is goed als de oogst meevalt', 'Trade is good when the harvest cooperates')}.`,
    `${_nl('Men went snel aan alles', 'One gets used to everything quickly')} — even occupation. That is the sad truth.`,
    `${_nl('Mijn vader deed hetzelfde werk', 'My father did the same work')}. And his father before him.`,
    `My wife packed the boterkoek recipe. She said: even if we lose everything else, we keep that.`,
    `${isFemale ? 'The church keeps us together' : 'The community here is strong'} — all Dutch, all Catholic. That helps.`,
    `Strange to think my grandparents came from the Netherlands. I have never been.`,
    `${isFemale ? 'We video-called the cousins in Haarlem last week.' : 'Digital connections, physical distance. That is 2020.'} `,
  ];
  return nl[Math.min(eraId, nl.length-1)];
}

function _occupationDepth(occu, eraId, loc) {
  if (loc === 'ship') return `Even ${occu}s must rest at sea. There is little to do but wait.`;
  if (loc === 'us')   return `Being a ${occu} in ${eraId === 5 ? 'Minnesota' : 'America'} is not easy work, but it is honest.`;
  const nl = [
    `${_nl('Het werk van een', 'The work of a')} ${occu} ${_nl('is nooit af', 'is never done')}. From sunrise to the church bell.`,
    `A ${occu}'s life in the Golden Age is one of constant movement — ships, markets, ledgers.`,
    `As a ${occu}, I am caught between the demands of the French and the needs of my neighbours.`,
    `The ${occu}'s trade has changed with the railways. Everything is faster now — and harder.`,
    `I was a ${occu} in Boekel. What I will be in America, I cannot yet say.`,
    ``,
  ];
  return nl[Math.min(eraId, nl.length-1)] || `The work of a ${occu} is honest work.`;
}

function _situationLine2(eraId, loc, isFemale) {
  return _repeatLine2(eraId, loc, isFemale); // reuse
}
