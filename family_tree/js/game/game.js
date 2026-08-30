// ═══════════════════════════════════════════════════════════════
//  GAME — Main orchestrator (OOP entry point)
// ═══════════════════════════════════════════════════════════════
import { Engine } from './engine.js';
import { Player, NPC, Enemy, DroppedItem, TILE } from './entities.js';
import { World } from './world.js';
import { UI } from './ui.js';
import { Music } from './music.js';
import { drawTiles, drawSky, setEra, T } from './renderer.js';
import { ERAS, SCREEN_COLS, SCREEN_ROWS } from './eras.js';
import { NPC_DATA, PORTAL_ITEMS } from './npc-data.js';

export class Game {
  constructor() {
    this.engine  = new Engine(document.getElementById('c'));
    this.world   = new World();
    this.player  = new Player(SCREEN_COLS/2*TILE, (SCREEN_ROWS-3)*TILE);
    this.ui      = new UI(this);
    this.music   = new Music();
    this._dialogNPC  = null;
    this._totalNPCs  = Object.values(NPC_DATA).reduce((a,arr)=>a+arr.length,0);
    this._running    = false;
    this._eraId      = 0;

    // Wire up onclick on dialog/prompt to game methods
    document.getElementById('dialog').onclick = () => this.advanceDialog();
    document.getElementById('prompt').onclick  = () => this.interact();
  }

  start() {
    document.getElementById('title').style.display='none';
    this._running = true;
    this.loadEra(0);
    this.music.playTrack(0);
    this.engine.start((dt, frame) => this._tick(dt, frame));
    this.ui.showToast('Find your ancestors! Walk to them and press E 💬');
  }

  loadEra(idx) {
    this._eraId = idx;
    setEra(idx);
    this.world.loadEra(idx, NPC_DATA);
    // Use the first screen's defined spawn point
    const spawnPos = this.world.screen?.spawn;
    this.player.x = (spawnPos ? spawnPos.c : Math.floor(SCREEN_COLS/2)) * TILE + 4;
    this.player.y = (spawnPos ? spawnPos.r : SCREEN_ROWS - 3)           * TILE + 4;
    this.engine.cameraX = 0; this.engine.cameraY = 0;
    this._dialogNPC = null;
    document.getElementById('dialog').style.display='none';
    this.music.playTrack(idx);
    this.ui.showScreenTitle(this.world.screen?.title || ERAS[idx]?.name);
    this.ui.renderInventory(this.player.inventory);
  }

  travelToEra(idx) {
    // Flash transition
    const ctx = this.engine.ctx;
    ctx.fillStyle='rgba(100,80,200,0.85)';
    ctx.fillRect(0,0,this.engine.width,this.engine.height);
    setTimeout(() => { this.loadEra(idx); this.ui.showToast(`⏰ ${ERAS[idx]?.year} — ${ERAS[idx]?.name}`); }, 350);
  }

  interact() {
    // If dialog open, advance it
    if(this._dialogNPC) { this.advanceDialog(); return; }
    // Check nearest NPC
    const npc = this.world.nearestNPC(this.player);
    if(npc) { this._startDialog(npc); return; }
    // Check portal
    if(this.world.atPortal(this.player)) { this.ui.showEraSel(); return; }
    // Pick up nearby dropped item
    for(const d of this.world.activeDrops) {
      if(this.player.distTo(d) < TILE*1.5) {
        if(this.player.collectItem(d.item)) {
          this.ui.showItemToast(d.item);
          this.ui.renderInventory(this.player.inventory);
          d.alive = false;
          this.world.drops = this.world.drops.filter(x=>x.alive!==false);
        }
        return;
      }
    }
  }

  advanceDialog() {
    if(!this._dialogNPC) return;
    const result = this.ui.advanceDialog();
    if(result === 'done') {
      const npc = this._dialogNPC;
      this._dialogNPC = null;
      // Collect fact
      if(!this.player.collectedFacts.find(f=>f.name===npc.name)) {
        this.player.collectedFacts.push({name:npc.name,fact:`${npc.data?.name||npc.name} (${npc.data?.year||''}) — ${npc.data?.place||''}`});
      }
      // Give item
      if(npc.item && !this.player.hasItem(npc.item.id)) {
        if(this.player.collectItem(npc.item)) {
          this.ui.showItemToast(npc.item);
          this.ui.renderInventory(this.player.inventory);
        }
      }
    }
  }

  _startDialog(npc) {
    this._dialogNPC = npc;
    // Build NPC object for UI
    const uiNPC = {
      name: npc.name,
      data: npc.data,
      given: npc.data?.given,
      lines: npc.lines,
      item: npc.item,
      bodyColor: npc.bodyColor,
      hatColor: npc.hatColor,
      skinColor: npc.skinColor,
    };
    this.ui.openDialog(uiNPC);
  }

  _tick(dt, frame) {
    if(!this._running) return;
    const engine = this.engine;
    const ctx = engine.ctx;

    // ── Handle screen transitions ───────────────────────────
    if(this.world.transition) {
      const done = this.world.updateTransition(dt);
      this._drawTransition(frame);
    if(done) {
      // Position player at new screen's spawn point
      const sp = this.world.screen?.spawn;
      if(sp) {
        this.player.x = sp.c * TILE + 4;
        this.player.y = sp.r * TILE + 4;
      }
      this.ui.showScreenTitle(this.world.screen?.title || '');
    }
      return;
    }

    // ── Player movement ─────────────────────────────────────
    if(!this._dialogNPC && !this.ui.journalOpen && !this.ui.eraSelOpen) {
      this.player.update(dt, engine.keys, this.world);
    }

    // ── Check screen exit ───────────────────────────────────
    const exitDir = this.world.checkScreenExit(this.player);
    if(exitDir) this.world.startTransition(exitDir);

    // ── Check portal proximity ──────────────────────────────
    if(this.world.atPortal(this.player) && !this._dialogNPC && engine.consumeAction()) {
      this.ui.showEraSel();
    }

    // ── Keyboard interact ───────────────────────────────────
    if(engine.consumeAction()) this.interact();

    // ── World update (NPCs wander, enemies chase) ───────────
    this.world.update(dt, this.player);

    // ── Camera ──────────────────────────────────────────────
    engine.updateCamera(this.player);
    const ox = engine.cameraX, oy = engine.cameraY;

    // ── Draw ─────────────────────────────────────────────────
    drawSky(ctx, this._eraId, engine.width, engine.height, frame);
    drawTiles(ctx, this.world.map, SCREEN_ROWS, SCREEN_COLS, ox, oy, engine.width, engine.height);

    // Draw drops
    for(const d of this.world.activeDrops) d.draw(ctx, ox, oy, frame);

    // Draw NPCs + enemies (sorted by Y for depth)
    const toSort=[
      ...this.world.activeNPCs,
      ...this.world.activeEnemies,
      this.player
    ];
    toSort.sort((a,b)=>a.cy-b.cy);
    for(const e of toSort) e.draw(ctx, ox, oy, frame);

    // ── Prompt ──────────────────────────────────────────────
    const nearNPC = this.world.nearestNPC(this.player);
    if(nearNPC && !this._dialogNPC) {
      this.ui.showPrompt(`💬 Talk to ${nearNPC.data?.given||nearNPC.name} — E or tap`);
      document.getElementById('ab-talk').classList.add('lit');
    } else if(this.world.atPortal(this.player)) {
      this.ui.showPrompt('⏰ Time Portal — E or tap');
      document.getElementById('ab-talk').classList.remove('lit');
    } else {
      this.ui.hidePrompt();
      document.getElementById('ab-talk').classList.remove('lit');
    }

    // ── HUD ─────────────────────────────────────────────────
    const screenTitle = this.world.screen?.title || '';
    this.ui.updateHUD(
      this._eraId, screenTitle,
      this.player.hp, this.player.maxHp,
      this.player.collectedFacts.length, this._totalNPCs
    );

    // ── Minimap ─────────────────────────────────────────────
    this.ui.drawMinimap(ctx, this.world, this.player);

    // Player HP dead?
    if(this.player.hp<=0) this._playerDied();
  }

  _drawTransition(frame) {
    const tr = this.world.transition;
    if(!tr) return;
    const ctx = this.engine.ctx;
    const p = tr.progress; // 0→1
    const ease = p<0.5 ? 2*p*p : -1+(4-2*p)*p;
    const W = this.engine.width, H = this.engine.height;
    const ox = this.engine.cameraX, oy = this.engine.cameraY;

    const fromMap = this.world.screens[tr.fromIdx]?.map;
    const toMap   = this.world.screens[tr.toIdx]?.map;

    let dx=0,dy=0;
    if(tr.dir==='right'){dx=-1;} if(tr.dir==='left'){dx=1;}
    if(tr.dir==='down'){dy=-1;}  if(tr.dir==='up'){dy=1;}

    ctx.save();
    ctx.translate(dx*W*ease, dy*H*ease);
    drawSky(ctx, this._eraId, W, H, frame);
    if(fromMap) drawTiles(ctx, fromMap, SCREEN_ROWS, SCREEN_COLS, ox, oy, W, H);
    ctx.restore();

    ctx.save();
    ctx.translate(dx*W*(ease-1), dy*H*(ease-1));
    drawSky(ctx, this._eraId, W, H, frame);
    if(toMap) drawTiles(ctx, toMap, SCREEN_ROWS, SCREEN_COLS, 0, 0, W, H);
    ctx.restore();
  }

  _playerDied() {
    this.player.hp = this.player.maxHp;
    this.ui.showToast('💀 Defeated! Respawning...', '#e74c3c');
    this.player.x = (SCREEN_COLS/2)*TILE;
    this.player.y = (SCREEN_ROWS-3)*TILE;
  }
}
