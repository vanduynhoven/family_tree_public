// ═══════════════════════════════════════════════════════════
//  UI — HUD, dialog, journal, intro sequence, era select
//  All DOM-based overlays; canvas minimap/bobber in Game.js
// ═══════════════════════════════════════════════════════════
import { drawMinimap } from './Renderer.js';
import { ERAS } from './EraData.js';
import { SCREEN_COLS, SCREEN_ROWS, WORLD_COLS, WORLD_ROWS } from './EraData.js';

export class UI {
  constructor(game) {
    this.game         = game;
    this.journalOpen  = false;
    this.eraSelOpen   = false;
    this.dialogActive = false;
    this._dialogLines = [];
    this._dialogIdx   = 0;
    this._dialogNPC   = null;
    this._onDialogDone = null;
    this._toastTimer  = null;

    this._buildDOM();
    this._bindDOM();
  }

  // ── DOM construction ────────────────────────────────

  _buildDOM() {
    // All UI lives inside #rt-ui
    const root = document.getElementById('rt-ui');
    if (!root) return;
    root.innerHTML = `
      <!-- HUD top bar -->
      <div id="rt-hud">
        <span id="rt-hp">❤️ 100</span>
        <span id="rt-stamina">⚡ 100</span>
        <span id="rt-era">⏰ 1539</span>
        <span id="rt-stories">📖 0</span>
        <span id="rt-mute" class="rt-btn">🔊</span>
        <a id="rt-exit" class="rt-btn" href="index.html">🏠</a>
      </div>

      <!-- Prompt -->
      <div id="rt-prompt"></div>

      <!-- Dialog box -->
      <div id="rt-dialog">
        <div id="rt-dlg-inner">
          <canvas id="rt-portrait" width="64" height="64"></canvas>
          <div id="rt-dlg-body">
            <div id="rt-dlg-name"></div>
            <div id="rt-dlg-text"></div>
            <div id="rt-dlg-hearts"></div>
          </div>
        </div>
        <div id="rt-dlg-hint">▶ Tap or click to continue</div>
      </div>

      <!-- Inventory bar -->
      <div id="rt-inv"></div>

      <!-- D-pad -->
      <div id="rt-dpad">
        <button id="dp-u">▲</button>
        <button id="dp-l">◀</button>
        <button id="dp-r">▶</button>
        <button id="dp-d">▼</button>
      </div>

      <!-- Action buttons -->
      <div id="rt-actions">
        <div class="rt-ab" id="ab-attack">⚔️<span>Attack</span></div>
        <div class="rt-ab" id="ab-talk">💬<span>Talk</span></div>
        <div class="rt-ab rt-ab-fish" id="ab-fish" style="display:none">🎣<span>Fish</span></div>
        <div class="rt-ab" id="ab-era">⏰<span>Time</span></div>
        <div class="rt-ab" id="ab-journal">📖<span>Journal</span></div>
      </div>

      <!-- Damage flash -->
      <div id="rt-damage-flash"></div>

      <!-- Toast -->
      <div id="rt-toast"></div>

      <!-- Journal overlay -->
      <div id="rt-journal-overlay" style="display:none">
        <button id="rt-journal-close">✕</button>
        <h2>📖 Family Chronicle</h2>
        <div id="rt-journal-tabs">
          <button class="rt-jtab active" data-tab="stories">Stories</button>
          <button class="rt-jtab" data-tab="quests">Quests</button>
          <button class="rt-jtab" data-tab="dutch">Dutch</button>
        </div>
        <div id="rt-journal-content"></div>
      </div>

      <!-- Era select overlay -->
      <div id="rt-era-overlay" style="display:none">
        <h2>⏰ Time Portal</h2>
        <div id="rt-era-list"></div>
        <button id="rt-era-close">Close</button>
      </div>

      <!-- Screen title flash -->
      <div id="rt-screen-title"></div>

      <!-- Intro overlay -->
      <div id="rt-intro" style="display:none">
        <canvas id="rt-intro-canvas"></canvas>
        <div id="rt-intro-caption"></div>
        <div id="rt-intro-progress"></div>
        <button id="rt-intro-skip">Skip ▶▶</button>
      </div>

      <!-- Character select overlay -->
      <div id="rt-char-select" style="display:none">
        <h2>Choose Your Character</h2>
        <div id="rt-char-list"></div>
      </div>
    `;
  }

  _bindDOM() {
    const $ = id => document.getElementById(id);
    $('rt-mute')?.addEventListener('click', () => {
      const muted = this.game.music.toggleMute();
      $('rt-mute').textContent = muted ? '🔇' : '🔊';
    });
    $('rt-dialog')?.addEventListener('click', () => this.advanceDialog());
    $('rt-journal-close')?.addEventListener('click', () => this.closeJournal());
    $('ab-attack')?.addEventListener('click', () => this.game.attack());
    $('ab-talk')?.addEventListener('click', () => this.game.interact());
    $('ab-fish')?.addEventListener('click', () => this.game.fish());
    $('ab-era')?.addEventListener('click', () => this.showEraSel());
    $('ab-journal')?.addEventListener('click', () => this.toggleJournal());
    $('rt-era-close')?.addEventListener('click', () => this.closeEraSel());
    $('rt-intro-skip')?.addEventListener('click', () => this._skipIntro());

    // D-pad
    const dpadMap = { 'dp-u':'up', 'dp-l':'left', 'dp-r':'right', 'dp-d':'down' };
    for (const [id, dir] of Object.entries(dpadMap)) {
      const btn = $(id);
      if (!btn) continue;
      btn.addEventListener('pointerdown', e => { e.preventDefault(); this.game.engine.dpadDown(dir); });
      btn.addEventListener('pointerup',   () => this.game.engine.dpadUp(dir));
      btn.addEventListener('pointerleave',() => this.game.engine.dpadUp(dir));
    }

    // Journal tabs
    document.querySelectorAll('.rt-jtab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.rt-jtab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this._renderJournalTab(tab.dataset.tab);
      });
    });
  }

  // ── HUD ─────────────────────────────────────────────

  updateHUD(eraId, hp, maxHp, stamina, maxStamina, storiesCount, totalNpcs, isFishable) {
    const hpHearts = Math.ceil(hp / 20);
    document.getElementById('rt-hp').textContent = '❤️'.repeat(Math.max(0,hpHearts)) + (hp <= 0 ? ' 💀' : '');
    document.getElementById('rt-stamina').textContent = `⚡ ${Math.floor(stamina)}`;
    const era = ERAS[eraId];
    document.getElementById('rt-era').textContent = era ? `⏰ ${era.year}` : '';
    document.getElementById('rt-stories').textContent = `📖 ${storiesCount}/${totalNpcs}`;
    // Show fish button only when near water
    const fishBtn = document.getElementById('ab-fish');
    if (fishBtn) fishBtn.style.display = isFishable ? 'flex' : 'none';
  }

  renderInventory(inventory) {
    const bar = document.getElementById('rt-inv');
    if (!bar) return;
    bar.innerHTML = '';
    if (inventory.length === 0) {
      bar.innerHTML = '<div style="color:#888;font-size:10px;padding:4px">No items yet</div>';
      return;
    }
    inventory.forEach(item => {
      const slot = document.createElement('div');
      slot.className = 'rt-inv-slot';
      slot.textContent = item.emoji || '📦';
      slot.title = item.label;
      bar.appendChild(slot);
    });
  }

  // ── Prompts ──────────────────────────────────────────

  showPrompt(text) {
    const el = document.getElementById('rt-prompt');
    if (el) { el.textContent = text; el.style.display = 'block'; }
    document.getElementById('ab-talk')?.classList.add('lit');
  }

  hidePrompt() {
    const el = document.getElementById('rt-prompt');
    if (el) el.style.display = 'none';
    document.getElementById('ab-talk')?.classList.remove('lit');
  }

  showToast(text, color = '#f0c040') {
    const el = document.getElementById('rt-toast');
    if (!el) return;
    if (this._toastTimer) clearTimeout(this._toastTimer);
    el.textContent = text;
    el.style.color = color;
    el.style.opacity = '1';
    this._toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 2800);
  }

  showItemToast(item) {
    this.showToast(`${item.emoji} Got: ${item.label}`, '#80ff80');
  }

  showScreenTitle(title) {
    const el = document.getElementById('rt-screen-title');
    if (!el) return;
    el.textContent = title;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 2200);
  }

  // ── Dialog ───────────────────────────────────────────

  openDialog(npc, charId, onDone) {
    const lines = npc.linesForCharacter ? npc.linesForCharacter(charId) : (npc.lines?.generic || []);
    this._dialogLines  = lines;
    this._dialogIdx    = 0;
    this._dialogNPC    = npc;
    this._onDialogDone = onDone;
    this.dialogActive  = true;

    npc.faceToward?.(this.game.player);

    // Draw portrait
    const pc = document.getElementById('rt-portrait');
    if (pc && npc.getPortraitCanvas) {
      const src = npc.getPortraitCanvas();
      pc.getContext('2d').drawImage(src, 0, 0);
    }

    document.getElementById('rt-dlg-name').textContent = npc.name || '';
    document.getElementById('rt-dlg-hearts').textContent = npc.friendship > 0 ? '♥'.repeat(npc.friendship) : '';
    this._showDialogLine();

    document.getElementById('rt-dialog').style.display = 'block';
    this.game.music.sfxDialog?.();
  }

  _showDialogLine() {
    const line = this._dialogLines[this._dialogIdx];
    if (!line) return;
    const text = typeof line === 'object' && line.dutch
      ? `${line.dutch} ${line.en || ''}`
      : (line || '');
    document.getElementById('rt-dlg-text').textContent = text;
  }

  advanceDialog() {
    if (!this.dialogActive) return;
    this._dialogIdx++;
    if (this._dialogIdx >= this._dialogLines.length) {
      this.closeDialog();
    } else {
      this._showDialogLine();
    }
  }

  closeDialog() {
    this.dialogActive = false;
    document.getElementById('rt-dialog').style.display = 'none';
    const cb = this._onDialogDone;
    this._dialogNPC   = null;
    this._onDialogDone = null;
    cb?.();
  }

  // ── Journal ──────────────────────────────────────────

  toggleJournal() {
    this.journalOpen ? this.closeJournal() : this.openJournal();
  }

  openJournal() {
    this.journalOpen = true;
    document.getElementById('rt-journal-overlay').style.display = 'flex';
    this._renderJournalTab('stories');
  }

  closeJournal() {
    this.journalOpen = false;
    document.getElementById('rt-journal-overlay').style.display = 'none';
  }

  _renderJournalTab(tab) {
    const content = document.getElementById('rt-journal-content');
    if (!content) return;
    content.innerHTML = '';

    if (tab === 'stories') {
      const facts = this.game.player.collectedFacts;
      if (!facts.length) { content.innerHTML = '<p style="color:#888">No stories collected yet.</p>'; return; }
      facts.forEach(f => {
        const div = document.createElement('div');
        div.className = 'rt-journal-entry';
        div.innerHTML = `<div class="rt-je-name">${f.name}</div><div class="rt-je-text">${f.text}</div>`;
        content.appendChild(div);
      });
    } else if (tab === 'quests') {
      const quests = this.game.quests?.activeQuests() || [];
      if (!quests.length) { content.innerHTML = '<p style="color:#888">No active quests.</p>'; return; }
      quests.forEach(q => {
        const div = document.createElement('div');
        div.className = 'rt-journal-entry';
        const done = q.complete ? ' ✅' : '';
        const steps = q.steps.map(s => `<div class="rt-je-step ${s.completed?'done':''}">${s.completed?'✓':'○'} ${s.desc}</div>`).join('');
        div.innerHTML = `<div class="rt-je-name">${q.title}${done}</div>${steps}`;
        content.appendChild(div);
      });
    } else if (tab === 'dutch') {
      const words = this.game.player.dutchWords || [];
      if (!words.length) { content.innerHTML = '<p style="color:#888">No Dutch words found yet.</p>'; return; }
      words.forEach(w => {
        const div = document.createElement('div');
        div.className = 'rt-journal-entry';
        div.innerHTML = `<span style="color:#c9820a">${w.dutch}</span> — ${w.en}`;
        content.appendChild(div);
      });
    }
  }

  // ── Era Select ───────────────────────────────────────

  showEraSel() {
    this.eraSelOpen = true;
    document.getElementById('rt-era-overlay').style.display = 'flex';
    const list = document.getElementById('rt-era-list');
    if (!list) return;
    list.innerHTML = '';
    const unlockedEras = this.game.unlockedEras || new Set([0]);
    ERAS.forEach(era => {
      const locked = !unlockedEras.has(era.id);
      const btn = document.createElement('button');
      btn.className = 'rt-era-btn' + (locked ? ' locked' : '');
      btn.innerHTML = `<span class="rt-era-year">${era.year}</span> ${era.name} ${locked ? '🔒' : ''}`;
      if (!locked) btn.addEventListener('click', () => { this.closeEraSel(); this.game.travelToEra(era.id); });
      list.appendChild(btn);
    });
  }

  closeEraSel() {
    this.eraSelOpen = false;
    document.getElementById('rt-era-overlay').style.display = 'none';
  }

  // ── Minimap (drawn on main canvas) ───────────────────

  drawMinimap(ctx, world, w) {
    const cellSize = 8;
    const x = w - WORLD_COLS * cellSize - 12;
    const y = 10;
    drawMinimap(ctx, WORLD_COLS, WORLD_ROWS, world.visitedSet,
                world.screenRow, world.screenCol, x, y, cellSize);
  }

  // ── Character Select ─────────────────────────────────

  showCharacterSelect(characters, onSelect) {
    const overlay = document.getElementById('rt-char-select');
    if (!overlay) return;
    overlay.style.display = 'flex';
    const list = document.getElementById('rt-char-list');
    if (!list) return;
    list.innerHTML = '';
    characters.forEach(char => {
      const card = document.createElement('div');
      card.className = 'rt-char-card';
      card.innerHTML = `
        <div class="rt-char-emoji">${char.emoji}</div>
        <div class="rt-char-name">${char.name}</div>
        <div class="rt-char-branch">${char.branch}</div>
        <div class="rt-char-hook">"${char.hook}"</div>
      `;
      card.addEventListener('click', () => {
        overlay.style.display = 'none';
        onSelect(char.id);
      });
      list.appendChild(card);
    });
  }

  // ── Intro Sequence ───────────────────────────────────

  playIntro(panels, onComplete) {
    const overlay = document.getElementById('rt-intro');
    const canvas  = document.getElementById('rt-intro-canvas');
    const caption = document.getElementById('rt-intro-caption');
    const progress= document.getElementById('rt-intro-progress');
    const skip    = document.getElementById('rt-intro-skip');
    if (!overlay || !canvas) { onComplete(); return; }

    overlay.style.display = 'flex';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    let panelIdx = 0;

    const finish = () => {
      overlay.style.display = 'none';
      window.removeEventListener('keydown', _keyHandler);
      onComplete();
    };

    this._skipIntroFn = finish;
    skip.style.display = 'none';

    const showPanel = () => {
      if (panelIdx >= panels.length) { finish(); return; }
      const p = panels[panelIdx];
      caption.textContent  = p.caption || '';
      progress.textContent = `${panelIdx + 1} / ${panels.length}`;
      if (panelIdx >= 1) skip.style.display = 'block';
      drawIntroPanel(ctx, p, canvas.width, canvas.height);
    };

    const advance = () => { panelIdx++; showPanel(); };
    const _keyHandler = e => { if (e.code === 'Space' || e.code === 'Enter') advance(); };
    window.addEventListener('keydown', _keyHandler);
    canvas.addEventListener('click', advance);

    showPanel();
  }

  _skipIntro() {
    this._skipIntroFn?.();
  }
}

// ── Intro panel drawing ───────────────────────────────────

function drawIntroPanel(ctx, panel, w, h) {
  ctx.clearRect(0, 0, w, h);

  // Background by setting
  const bgs = {
    library:        ['#3a2a10','#1a1008'],
    haarlem_bedroom:['#3060a0','#102040'],
    haarlem_living: ['#2040a0','#102040'],
    mn_bedroom:     ['#608040','#204010'],
    mn_attic:       ['#4a3a20','#2a1a08'],
    mn_kitchen:     ['#c0a060','#806030'],
    mn_office:      ['#304060','#102040'],
    mn_home:        ['#608040','#204010'],
    mn_bbq:         ['#80a040','#406020'],
    classroom:      ['#c0b080','#806040'],
    closeup:        ['#1a1208','#0a0804'],
    reading:        ['#3a2a10','#1a1008'],
    sleep:          ['#050518','#000000'],
  };
  const [c1, c2] = bgs[panel.bg] || ['#202020','#050505'];
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  // Simple atmospheric elements by background type
  if (panel.bg === 'library' || panel.bg === 'reading') {
    // Bookshelves
    ctx.fillStyle = 'rgba(100,70,20,0.4)';
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(w*0.05 + i*w*0.11, h*0.1, w*0.09, h*0.7);
    }
    // Warm lamp glow
    ctx.fillStyle = 'rgba(255,180,60,0.15)';
    ctx.beginPath(); ctx.arc(w*0.7, h*0.25, w*0.2, 0, Math.PI*2); ctx.fill();
  } else if (panel.bg === 'sleep') {
    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 80; i++) {
      const sx = Math.sin(i * 13.7) * w/2 + w/2;
      const sy = Math.cos(i * 11.3) * h/2 + h/2;
      ctx.beginPath(); ctx.arc(sx, sy, Math.sin(i)*1.5+0.5, 0, Math.PI*2); ctx.fill();
    }
  }

  // Caption box at bottom
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, h * 0.82, w, h * 0.18);
  ctx.fillStyle = '#e8d4a0';
  ctx.font = `${Math.floor(Math.min(w*0.032, 22))}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(panel.caption || '', w/2, h * 0.91);
  ctx.textBaseline = 'alphabetic';
}
