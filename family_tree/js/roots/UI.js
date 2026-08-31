// ═══════════════════════════════════════════════════════════
//  UI — HUD, dialog, journal, intro sequence, era select
//  All DOM-based overlays; canvas minimap/bobber in Game.js
// ═══════════════════════════════════════════════════════════
import { drawMinimap } from './Renderer.js';
import { ERAS } from './EraData.js';
import { SCREEN_COLS, SCREEN_ROWS, WORLD_COLS, WORLD_ROWS } from './EraData.js';
import { itemTooltip } from './Player.js';

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
        <span id="rt-location" style="color:#aad4ff;border-color:#224466"></span>
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
        <div class="rt-ab" id="ab-attack" onclick="G?.interact()">⚔️💬<span>Act</span></div>
        <div class="rt-ab rt-ab-fish" id="ab-fish" style="display:none">🎣<span>Fish</span></div>
        <div class="rt-ab" id="ab-era">⏰<span>Time</span></div>
        <div class="rt-ab" id="ab-journal">📚<span>Family</span></div>
      </div>

      <!-- Damage flash -->
      <div id="rt-damage-flash"></div>

      <!-- Toast -->
      <div id="rt-toast"></div>

      <!-- Journal overlay -->
      <div id="rt-journal-overlay" style="display:none">
        <button id="rt-journal-close">✕</button>
        <h2>📚 Family Album</h2>
        <div id="rt-journal-tabs">
          <button class="rt-jtab active" data-tab="stories">👨‍👩‍👧 Ancestors</button>
          <button class="rt-jtab" data-tab="quests">🗺️ Missions</button>
          <button class="rt-jtab" data-tab="dutch">🇳🇱 Dutch Words</button>
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
    // Single unified action button
    $('ab-attack')?.addEventListener('click', () => this.game.interact());
    $('ab-fish')?.addEventListener('click',   () => this.game.fish());
    $('ab-era')?.addEventListener('click',    () => this.showEraSel());
    $('ab-journal')?.addEventListener('click',() => this.toggleJournal());
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

  updateHUD(eraId, hp, maxHp, stamina, maxStamina, storiesCount, totalNpcs, isFishable, screenTitle) {
    const hpHearts = Math.ceil(hp / 20);
    document.getElementById('rt-hp').textContent = '❤️'.repeat(Math.max(0,hpHearts)) + (hp <= 0 ? ' 💀' : '');
    document.getElementById('rt-stamina').textContent = `⚡ ${Math.floor(stamina)}`;
    const era = ERAS[eraId];
    document.getElementById('rt-era').textContent = era ? `⏰ ${era.year}` : '';
    // Screen title — strip the year prefix (e.g. "1539 · Church" → "Church")
    const locEl = document.getElementById('rt-location');
    if (locEl && screenTitle) {
      const short = screenTitle.replace(/^\d{4}\s*[··]\s*/, '').replace(/^2026\s*[··]\s*/, '');
      locEl.textContent = short ? `📍 ${short}` : '';
    }
    document.getElementById('rt-stories').textContent = `📖 ${storiesCount}/${totalNpcs}`;
    const fishBtn = document.getElementById('ab-fish');
    if (fishBtn) fishBtn.style.display = isFishable ? 'flex' : 'none';
  }

  renderInventory(inventory, onUse) {
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
      slot.style.position = 'relative';
      slot.style.cursor = 'pointer';

      const emojiEl = document.createElement('span');
      emojiEl.textContent = item.emoji || '📦';
      emojiEl.style.fontSize = '20px';
      slot.appendChild(emojiEl);

      // Count badge
      if ((item.count || 1) > 1) {
        const badge = document.createElement('span');
        badge.textContent = item.count;
        badge.style.cssText = 'position:absolute;bottom:1px;right:2px;font-size:9px;font-weight:bold;color:#fff;background:rgba(0,0,0,0.6);border-radius:6px;padding:0 3px;line-height:12px;';
        slot.appendChild(badge);
      }

      // Rich tooltip on hover
      const tip = itemTooltip(item);
      slot.addEventListener('mouseenter', (e) => this._showItemTip(e.currentTarget, tip));
      slot.addEventListener('mouseleave', () => this._hideItemTip());
      slot.addEventListener('touchstart', (e) => { e.preventDefault(); this._showItemTip(e.currentTarget, tip); }, { passive: false });
      slot.addEventListener('touchend', () => setTimeout(() => this._hideItemTip(), 1800));

      // Tap/click to use
      slot.addEventListener('click', () => {
        if (onUse) onUse(item.id);
      });

      bar.appendChild(slot);
    });
  }

  _showItemTip(anchor, text) {
    this._hideItemTip();
    const tip = document.createElement('div');
    tip.id = 'rt-item-tip';

    // Parse the tooltip: "Label ×N\nDesc\n\n💡 Use"
    const [header, ...rest] = text.split('\n');
    const useIdx = rest.findLastIndex(l => l.startsWith('💡'));
    const desc = rest.slice(0, useIdx < 0 ? rest.length : useIdx).filter(Boolean).join(' ');
    const useLine = useIdx >= 0 ? rest[useIdx] : '';

    tip.innerHTML = `
      <div style="font-weight:bold;color:#f0e080;margin-bottom:4px">${header}</div>
      ${desc ? `<div style="color:#d0d0b0;font-size:11px;line-height:1.4;margin-bottom:6px">${desc}</div>` : ''}
      ${useLine ? `<div style="color:#80ff80;font-size:11px">${useLine}</div>` : ''}
    `;
    tip.style.cssText = `
      position:fixed;z-index:9999;
      background:rgba(20,16,10,0.96);
      border:1px solid #806040;border-radius:6px;
      padding:8px 10px;max-width:220px;
      font-family:inherit;font-size:12px;
      pointer-events:none;box-shadow:0 3px 12px rgba(0,0,0,0.7);
    `;

    document.body.appendChild(tip);

    // Position above the anchor slot
    const rect = anchor.getBoundingClientRect();
    const tipW = 220;
    let left = rect.left + rect.width / 2 - tipW / 2;
    left = Math.max(4, Math.min(left, window.innerWidth - tipW - 4));
    const top = rect.top - tip.offsetHeight - 8;
    tip.style.left = left + 'px';
    tip.style.top  = Math.max(4, top) + 'px';

    this._itemTip = tip;
  }

  _hideItemTip() {
    if (this._itemTip) { this._itemTip.remove(); this._itemTip = null; }
  }

  // ── Prompts ──────────────────────────────────────────

  showPrompt(text) {
    const el = document.getElementById('rt-prompt');
    if (el) { el.textContent = text; el.style.display = 'block'; }
    document.getElementById('ab-attack')?.classList.add('lit');
  }

  hidePrompt() {
    const el = document.getElementById('rt-prompt');
    if (el) el.style.display = 'none';
    document.getElementById('ab-attack')?.classList.remove('lit');
  }

  showToast(text, color = '#f0c040') {
    const el = document.getElementById('rt-toast');
    if (!el) return;
    if (this._toastTimer) clearTimeout(this._toastTimer);
    el.textContent = text;
    el.style.color = color;
    el.style.opacity = '1';
    this._toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 3500);
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

    // Show name + era relationship label for kids
    const era = npc.era ?? 0;
    const eraYear = [1539,1660,1799,1872,1950,1955,1984,2020,2026][era] || '';
    const nameEl = document.getElementById('rt-dlg-name');
    if (nameEl) {
      nameEl.innerHTML = `${npc.name || ''}
        <span style="font-size:0.75em;color:#80c0ff;font-weight:normal;margin-left:8px">
          ${npc.gedcomId ? `👨‍👩‍👧 Your ancestor · ${eraYear}` : eraYear ? `📍 ${eraYear}` : ''}
        </span>`;
    }
    document.getElementById('rt-dlg-hearts').textContent = npc.friendship > 0 ? '♥'.repeat(npc.friendship) : '';
    this._showDialogLine();

    document.getElementById('rt-dialog').style.display = 'block';
    this.game.music.sfxDialog?.();
  }

  _showDialogLine() {
    const line = this._dialogLines[this._dialogIdx];
    if (!line) return;
    const el = document.getElementById('rt-dlg-text');
    if (!el) return;

    if (typeof line === 'object' && line.dutch) {
      // Show Dutch phrase in gold, English translation in normal white
      // Kids see both clearly — language learning + understanding
      const dutch = line.dutch || '';
      const eng   = line.en || '';
      if (eng) {
        el.innerHTML =
          `<span style="color:#f0c040;font-style:italic">${dutch}</span>` +
          `<br><span style="color:#dde;font-size:0.9em">💬 ${eng}</span>`;
      } else {
        el.innerHTML = `<span style="color:#f0c040;font-style:italic">${dutch}</span>`;
      }
    } else {
      el.textContent = typeof line === 'string' ? line : (line || '');
    }
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
      const facts    = this.game.player?.collectedFacts || [];
      const total    = this.game._totalNpcCount?.() || '?';
      if (!facts.length) {
        content.innerHTML = `
          <div style="text-align:center;padding:24px 12px;color:#aaa">
            <div style="font-size:3em;margin-bottom:12px">👨‍👩‍👧‍👦</div>
            <div style="font-size:1.1em;color:#dde;margin-bottom:8px">Your Family Album is empty!</div>
            <div style="font-size:0.9em;color:#888">Walk up to family members and press <strong style="color:#f0c040">E</strong> or tap <strong style="color:#f0c040">Act</strong> to hear their story.</div>
          </div>`;
        return;
      }
      // Progress header
      const pct = Math.round((facts.length / total) * 100) || 0;
      const header = document.createElement('div');
      header.style.cssText = 'text-align:center;padding:12px 0 16px;border-bottom:1px solid #333;margin-bottom:14px';
      header.innerHTML = `
        <div style="font-size:1.1em;color:#f0c040;margin-bottom:6px">
          📖 ${facts.length} ancestor${facts.length !== 1 ? 's' : ''} met out of ${total}
        </div>
        <div style="background:#1a1a1a;border-radius:6px;height:8px;overflow:hidden">
          <div style="background:linear-gradient(90deg,#27ae60,#2ecc71);width:${pct}%;height:100%;border-radius:6px;transition:width 0.5s"></div>
        </div>
        <div style="font-size:0.75em;color:#666;margin-top:4px">${pct}% of the family discovered ✨</div>`;
      content.appendChild(header);
      facts.forEach((f, i) => {
        const div = document.createElement('div');
        div.className = 'rt-journal-entry';
        const story = (f.text && f.text.trim())
          ? f.text
          : 'You met this ancestor on your travels. Talk to them again to learn more of their story.';
        div.innerHTML = `
          <div class="rt-je-name">👤 <strong>${f.name}</strong> <span style="color:#666;font-weight:normal;font-size:0.85em">· #${i + 1}</span></div>
          <div class="rt-je-text">${story}</div>`;
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
      const words = this.game.player?.dutchWords || [];
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
    // One-line description per era (falls back to the era name if unlisted)
    const eraDesc = {
      0: 'Medieval Netherlands · ~1450',
      1: 'Renaissance & Reformation · ~1539',
      2: 'Dutch Golden Age · ~1700',
      3: 'Industrial Revolution · ~1829',
      4: 'Early Republic · ~1872',
      5: 'World War Era · ~1915',
      6: 'Post-War America · ~1951',
      7: 'Modern Era · ~1982',
    };
    const unlockedEras = this.game.unlockedEras || new Set([0, 8]);
    ERAS.forEach(era => {
      const locked = !unlockedEras.has(era.id);
      const locLabel = era.id === 8
        ? (this.game._startLocation === 'mankato'
            ? '313 Hanover St, Mankato MN'
            : 'Leidsevaart 276, Haarlem NL')
        : era.name;
      const desc = era.id === 8 ? 'Present Day · 2026' : (eraDesc[era.id] || '');
      const btn = document.createElement('button');
      btn.className = 'rt-era-btn' + (locked ? ' locked' : '');
      btn.innerHTML = `
        <span class="rt-era-year">${era.year}</span> ${locLabel} ${locked ? '🔒' : ''}
        ${desc ? `<div style="font-size:0.78em;color:#7f9db0;margin-top:2px">${desc}</div>` : ''}`;
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
                world.screenRow, world.screenCol, x, y, cellSize, world.portalSet, world.screens);
  }

  // ── Character Select ─────────────────────────────────

  showCharacterSelect(characters, hasSave, onSelect) {
    const overlay = document.getElementById('rt-char-select');
    if (!overlay) return;
    overlay.style.display = 'flex';
    const list = document.getElementById('rt-char-list');
    if (!list) return;
    list.innerHTML = '';
    characters.forEach(char => {
      const saveExists = hasSave(char.id);
      const card = document.createElement('div');
      card.className = 'rt-char-card';
      card.innerHTML = `
        <div class="rt-char-emoji">${char.emoji}</div>
        <div class="rt-char-name">${char.name}</div>
        <div class="rt-char-branch">${char.branch}</div>
        <div class="rt-char-hook">"${char.hook}"</div>
        <div class="rt-char-actions">
          ${saveExists
            ? `<button class="rt-char-btn rt-char-continue" data-id="${char.id}" data-mode="continue">▶ Continue</button>
               <button class="rt-char-btn rt-char-newgame" data-id="${char.id}" data-mode="new">✦ New Game</button>`
            : `<button class="rt-char-btn rt-char-continue" data-id="${char.id}" data-mode="new">▶ Start</button>`
          }
        </div>
      `;
      card.querySelectorAll('.rt-char-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          overlay.style.display = 'none';
          onSelect(btn.dataset.id, btn.dataset.mode);
        });
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

  // Background gradients keyed by setting
  const bgs = {
    library:          ['#3a2a10','#1a1008'],
    haarlem_bedroom:  ['#1a3060','#0a1830'],
    haarlem_living:   ['#1a2850','#080f28'],
    mn_bedroom:       ['#3a5020','#1a2a08'],
    mn_attic:         ['#2a2010','#120e04'],
    mn_kitchen:       ['#7a5830','#3a2810'],
    mn_office:        ['#1a2840','#080e1a'],
    mn_home:          ['#3a5020','#1a2808'],
    mn_bbq:           ['#4a6020','#1a2808'],
    classroom:        ['#7a6840','#3a3018'],
    closeup:          ['#100c06','#050302'],
    reading:          ['#2a1e0a','#100a02'],
    sleep:            ['#050518','#000000'],
  };
  const [c1, c2] = bgs[panel.bg] || ['#202020','#050505'];
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // ── Atmospheric scene drawing per background ──────────

  if (panel.bg === 'library' || panel.bg === 'reading') {
    // Bookshelves left and right
    ctx.fillStyle = 'rgba(80,50,10,0.6)';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(w*0.03 + i*w*0.07, h*0.05, w*0.055, h*0.75);
      ctx.fillRect(w*0.72 + i*w*0.07, h*0.05, w*0.055, h*0.75);
    }
    // Book spines
    const bookColors = ['#8b2020','#206040','#204080','#806020','#602080','#204040'];
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = bookColors[i % bookColors.length];
      const bx = w*0.03 + (i % 4)*w*0.07 + 3;
      const by = h*0.07 + Math.floor(i/4) * (h*0.13);
      ctx.fillRect(bx, by, w*0.045, h*0.11);
    }
    // Warm desk lamp glow (right side)
    const lg = ctx.createRadialGradient(w*0.72, h*0.35, 0, w*0.72, h*0.35, w*0.28);
    lg.addColorStop(0, 'rgba(255,200,80,0.22)');
    lg.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, w, h);
    // Armchair silhouette (centre)
    ctx.fillStyle = 'rgba(60,35,10,0.7)';
    ctx.fillRect(w*0.35, h*0.55, w*0.30, h*0.25);
    ctx.fillRect(w*0.32, h*0.45, w*0.07, h*0.35);
    ctx.fillRect(w*0.61, h*0.45, w*0.07, h*0.35);
    // Journal on lap
    ctx.fillStyle = 'rgba(160,110,50,0.8)';
    ctx.fillRect(w*0.38, h*0.62, w*0.24, h*0.14);
    ctx.strokeStyle = 'rgba(100,70,20,0.9)'; ctx.lineWidth = 2;
    ctx.strokeRect(w*0.38, h*0.62, w*0.24, h*0.14);
    // Window with light
    ctx.fillStyle = 'rgba(80,120,200,0.15)';
    ctx.fillRect(w*0.43, h*0.12, w*0.14, h*0.22);
    ctx.strokeStyle = 'rgba(150,180,255,0.3)'; ctx.lineWidth = 2;
    ctx.strokeRect(w*0.43, h*0.12, w*0.14, h*0.22);

  } else if (panel.bg === 'haarlem_bedroom') {
    // Canal window view
    ctx.fillStyle = 'rgba(40,80,160,0.25)';
    ctx.fillRect(w*0.6, h*0.1, w*0.32, h*0.35);
    ctx.strokeStyle = 'rgba(180,200,255,0.4)'; ctx.lineWidth = 3;
    ctx.strokeRect(w*0.6, h*0.1, w*0.32, h*0.35);
    // Dutch rooftops in window
    ctx.fillStyle = 'rgba(30,20,60,0.6)';
    ctx.fillRect(w*0.62, h*0.22, w*0.08, h*0.22);
    ctx.fillRect(w*0.74, h*0.18, w*0.10, h*0.26);
    ctx.fillRect(w*0.86, h*0.25, w*0.06, h*0.19);
    // Canal reflection glow
    const cg = ctx.createLinearGradient(0, h*0.38, 0, h*0.45);
    cg.addColorStop(0, 'rgba(40,80,180,0.2)');
    cg.addColorStop(1, 'rgba(40,80,180,0)');
    ctx.fillStyle = cg; ctx.fillRect(w*0.6, h*0.38, w*0.32, h*0.08);
    // Desk with Dutch homework
    ctx.fillStyle = 'rgba(100,70,30,0.55)';
    ctx.fillRect(w*0.05, h*0.5, w*0.45, h*0.25);
    // Papers on desk
    ctx.fillStyle = 'rgba(240,235,210,0.7)';
    ctx.fillRect(w*0.08, h*0.45, w*0.18, h*0.24);
    ctx.fillRect(w*0.20, h*0.47, w*0.18, h*0.24);
    // Dutch word lines on paper
    ctx.fillStyle = 'rgba(40,40,120,0.5)';
    for (let i = 0; i < 5; i++) ctx.fillRect(w*0.09, h*0.48 + i*h*0.03, w*0.12, h*0.008);
    // Bed
    ctx.fillStyle = 'rgba(60,80,120,0.4)';
    ctx.fillRect(w*0.55, h*0.55, w*0.40, h*0.30);

  } else if (panel.bg === 'haarlem_living') {
    // Big living room — tall ceilings, light from left
    const rg = ctx.createRadialGradient(w*0.15, h*0.4, 0, w*0.15, h*0.4, w*0.55);
    rg.addColorStop(0, 'rgba(200,180,120,0.18)');
    rg.addColorStop(1, 'rgba(200,180,120,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
    // Tall bookshelves
    ctx.fillStyle = 'rgba(80,55,20,0.5)';
    ctx.fillRect(w*0.75, h*0.05, w*0.22, h*0.75);
    // Couch
    ctx.fillStyle = 'rgba(80,60,100,0.5)';
    ctx.fillRect(w*0.20, h*0.60, w*0.50, h*0.22);
    ctx.fillRect(w*0.18, h*0.52, w*0.08, h*0.30);
    ctx.fillRect(w*0.70, h*0.52, w*0.08, h*0.30);
    // Small Starling sprite (tiny figure)
    ctx.fillStyle = 'rgba(210,190,140,0.7)'; // skin
    ctx.beginPath(); ctx.arc(w*0.42, h*0.72, h*0.04, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(212,192,64,0.75)'; // yellow dress
    ctx.fillRect(w*0.405, h*0.76, w*0.03, h*0.10);
    // Wooden box on floor
    ctx.fillStyle = 'rgba(140,90,30,0.7)';
    ctx.fillRect(w*0.44, h*0.76, w*0.08, h*0.06);
    ctx.strokeStyle = 'rgba(180,120,40,0.6)'; ctx.lineWidth = 1;
    ctx.strokeRect(w*0.44, h*0.76, w*0.08, h*0.06);

  } else if (panel.bg === 'mn_bedroom') {
    // Minnesota teen bedroom
    ctx.fillStyle = 'rgba(60,80,40,0.35)';
    ctx.fillRect(w*0.05, h*0.05, w*0.22, h*0.30); // poster
    ctx.fillStyle = 'rgba(200,60,60,0.3)';
    ctx.fillRect(w*0.72, h*0.05, w*0.20, h*0.28); // poster 2
    // Bed
    ctx.fillStyle = 'rgba(60,80,120,0.45)';
    ctx.fillRect(w*0.55, h*0.50, w*0.40, h*0.32);
    // Desk + phone glow
    ctx.fillStyle = 'rgba(80,60,30,0.55)';
    ctx.fillRect(w*0.05, h*0.52, w*0.42, h*0.22);
    const pg = ctx.createRadialGradient(w*0.15, h*0.5, 0, w*0.15, h*0.5, w*0.12);
    pg.addColorStop(0, 'rgba(180,220,255,0.25)'); pg.addColorStop(1, 'rgba(180,220,255,0)');
    ctx.fillStyle = pg; ctx.fillRect(0, 0, w, h);
    // Attic hatch / stairs entrance silhouette
    ctx.fillStyle = 'rgba(20,15,5,0.6)';
    ctx.fillRect(w*0.30, h*0.0, w*0.40, h*0.06);

  } else if (panel.bg === 'mn_attic') {
    // Dark attic, cardboard boxes
    ctx.fillStyle = 'rgba(100,75,30,0.55)';
    ctx.fillRect(w*0.05, h*0.50, w*0.22, h*0.28);
    ctx.fillRect(w*0.30, h*0.45, w*0.20, h*0.33);
    ctx.fillRect(w*0.55, h*0.52, w*0.18, h*0.26);
    ctx.fillRect(w*0.76, h*0.48, w*0.17, h*0.30);
    // Box labels
    ctx.fillStyle = 'rgba(240,220,180,0.6)';
    ctx.font = `${Math.floor(w*0.018)}px monospace`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('FAMILY PAPERS', w*0.32, h*0.58);
    ctx.fillText('DO NOT THROW', w*0.32, h*0.62);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    // Dusty light from small window
    const al = ctx.createRadialGradient(w*0.85, h*0.15, 0, w*0.85, h*0.15, w*0.3);
    al.addColorStop(0, 'rgba(255,220,120,0.12)'); al.addColorStop(1, 'rgba(255,220,120,0)');
    ctx.fillStyle = al; ctx.fillRect(0, 0, w, h);
    // Journal + map spread
    ctx.fillStyle = 'rgba(220,190,130,0.7)';
    ctx.fillRect(w*0.30, h*0.28, w*0.22, h*0.16); // journal
    ctx.fillStyle = 'rgba(200,180,120,0.6)';
    ctx.fillRect(w*0.54, h*0.26, w*0.28, h*0.18); // old map
    // Map circle
    ctx.strokeStyle = 'rgba(120,40,20,0.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(w*0.68, h*0.35, w*0.06, 0, Math.PI*2); ctx.stroke();

  } else if (panel.bg === 'mn_kitchen') {
    // Kitchen table with photos spread
    ctx.fillStyle = 'rgba(160,120,60,0.5)';
    ctx.fillRect(w*0.10, h*0.45, w*0.80, h*0.35); // table
    // Photos on table
    const photoPos = [[0.15,0.30],[0.30,0.32],[0.50,0.28],[0.65,0.33],[0.78,0.30]];
    photoPos.forEach(([px,py]) => {
      ctx.fillStyle = 'rgba(240,235,220,0.85)';
      ctx.fillRect(w*px, h*py, w*0.11, h*0.15);
      ctx.strokeStyle = 'rgba(150,120,60,0.6)'; ctx.lineWidth = 1;
      ctx.strokeRect(w*px, h*py, w*0.11, h*0.15);
      // Sepia portrait placeholder
      ctx.fillStyle = 'rgba(160,120,60,0.35)';
      ctx.fillRect(w*px+4, h*py+4, w*0.11-8, h*0.15-8);
    });
    // Journal open
    ctx.fillStyle = 'rgba(180,140,70,0.75)';
    ctx.fillRect(w*0.35, h*0.50, w*0.30, h*0.20);
    ctx.strokeStyle = 'rgba(100,70,20,0.7)'; ctx.lineWidth = 2;
    ctx.strokeRect(w*0.35, h*0.50, w*0.30, h*0.20);
    // Text lines in journal
    ctx.fillStyle = 'rgba(40,30,10,0.5)';
    for (let i = 0; i < 4; i++) ctx.fillRect(w*0.37, h*0.54 + i*h*0.03, w*0.12, h*0.008);
    for (let i = 0; i < 4; i++) ctx.fillRect(w*0.52, h*0.54 + i*h*0.03, w*0.11, h*0.008);

  } else if (panel.bg === 'mn_office') {
    // Home office, computer screen showing family tree
    const sg = ctx.createRadialGradient(w*0.45, h*0.38, 0, w*0.45, h*0.38, w*0.35);
    sg.addColorStop(0, 'rgba(80,140,220,0.25)'); sg.addColorStop(1, 'rgba(80,140,220,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, w, h);
    // Monitor
    ctx.fillStyle = 'rgba(20,20,30,0.8)';
    ctx.fillRect(w*0.25, h*0.12, w*0.50, h*0.38);
    ctx.fillStyle = 'rgba(40,80,180,0.6)';
    ctx.fillRect(w*0.27, h*0.14, w*0.46, h*0.34);
    // Family tree fan-chart on screen
    ctx.strokeStyle = 'rgba(180,220,255,0.5)'; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(w*0.50, h*0.46, w*(0.04 + i*0.04), Math.PI*1.1, Math.PI*1.9);
      ctx.stroke();
    }
    // Monitor stand
    ctx.fillStyle = 'rgba(30,30,40,0.8)';
    ctx.fillRect(w*0.46, h*0.50, w*0.08, h*0.06);
    ctx.fillRect(w*0.38, h*0.55, w*0.24, h*0.03);
    // Desk
    ctx.fillStyle = 'rgba(60,50,30,0.6)';
    ctx.fillRect(w*0.05, h*0.57, w*0.90, h*0.18);
    // Box on desk
    ctx.fillStyle = 'rgba(120,90,40,0.65)';
    ctx.fillRect(w*0.08, h*0.48, w*0.14, h*0.10);
    ctx.fillStyle = 'rgba(240,220,180,0.6)';
    ctx.font = `${Math.floor(w*0.014)}px monospace`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('FAMILY', w*0.09, h*0.51);
    ctx.fillText('PAPERS', w*0.09, h*0.54);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';

  } else if (panel.bg === 'mn_home') {
    // Living room / home interior
    ctx.fillStyle = 'rgba(80,100,50,0.3)';
    ctx.fillRect(0, 0, w, h);
    // Couch
    ctx.fillStyle = 'rgba(100,80,50,0.55)';
    ctx.fillRect(w*0.15, h*0.55, w*0.55, h*0.25);
    ctx.fillRect(w*0.12, h*0.46, w*0.09, h*0.34);
    ctx.fillRect(w*0.68, h*0.46, w*0.09, h*0.34);
    // Box with Johan's things
    ctx.fillStyle = 'rgba(160,120,60,0.7)';
    ctx.fillRect(w*0.28, h*0.42, w*0.24, h*0.16);
    ctx.strokeStyle = 'rgba(100,70,20,0.8)'; ctx.lineWidth = 2;
    ctx.strokeRect(w*0.28, h*0.42, w*0.24, h*0.16);
    ctx.fillStyle = 'rgba(240,220,180,0.7)';
    ctx.font = `${Math.floor(w*0.015)}px monospace`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('Grandpa Johan', w*0.30, h*0.49);
    ctx.fillText('Netherlands', w*0.30, h*0.52);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    // Ship ticket
    ctx.fillStyle = 'rgba(240,235,200,0.8)';
    ctx.fillRect(w*0.56, h*0.40, w*0.20, h*0.10);
    ctx.fillStyle = 'rgba(40,40,80,0.6)';
    ctx.font = `${Math.floor(w*0.012)}px monospace`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('Johan v. Duijnhoven', w*0.57, h*0.43);
    ctx.fillText('Southampton → New York', w*0.57, h*0.46);
    ctx.fillText('Nov 1950', w*0.57, h*0.47);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';

  } else if (panel.bg === 'mn_bbq') {
    // Outdoor BBQ, party lights, people silhouettes
    ctx.fillStyle = 'rgba(60,100,20,0.3)';
    ctx.fillRect(0, h*0.7, w, h*0.3); // grass
    // String lights
    ctx.strokeStyle = 'rgba(255,220,100,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, h*0.18); ctx.lineTo(w, h*0.22); ctx.stroke();
    for (let i = 0; i < 15; i++) {
      const lx = (i / 14) * w;
      const ly = h*0.18 + (lx/w)*(h*0.04);
      const lg2 = ctx.createRadialGradient(lx, ly, 0, lx, ly, 12);
      lg2.addColorStop(0, 'rgba(255,220,80,0.5)'); lg2.addColorStop(1, 'rgba(255,220,80,0)');
      ctx.fillStyle = lg2; ctx.beginPath(); ctx.arc(lx, ly, 12, 0, Math.PI*2); ctx.fill();
    }
    // People silhouettes
    const silhouettes = [0.12, 0.22, 0.38, 0.52, 0.62, 0.73, 0.85];
    silhouettes.forEach(sx2 => {
      const sh = h*(0.15 + Math.sin(sx2*17)*0.06);
      ctx.fillStyle = 'rgba(20,20,20,0.6)';
      ctx.beginPath(); ctx.arc(w*sx2, h*0.62 - sh, sh*0.22, 0, Math.PI*2); ctx.fill();
      ctx.fillRect(w*sx2 - sh*0.12, h*0.62 - sh, sh*0.24, sh*0.7);
    });
    // BBQ counter top-right
    ctx.fillStyle = 'rgba(40,30,15,0.65)';
    ctx.fillRect(w*0.72, h*0.55, w*0.24, h*0.20);
    // Counter badge
    ctx.fillStyle = 'rgba(255,220,80,0.85)';
    ctx.font = `bold ${Math.floor(w*0.028)}px sans-serif`;
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText('47 people', w*0.95, h*0.30);
    ctx.fillText('today', w*0.95, h*0.36);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';

  } else if (panel.bg === 'classroom') {
    // School classroom, whiteboard at front
    ctx.fillStyle = 'rgba(220,210,180,0.3)';
    ctx.fillRect(0, 0, w, h);
    // Whiteboard
    ctx.fillStyle = 'rgba(240,240,230,0.7)';
    ctx.fillRect(w*0.10, h*0.05, w*0.80, h*0.35);
    ctx.strokeStyle = 'rgba(100,100,80,0.5)'; ctx.lineWidth = 3;
    ctx.strokeRect(w*0.10, h*0.05, w*0.80, h*0.35);
    // Board text
    ctx.fillStyle = 'rgba(30,30,60,0.65)';
    ctx.font = `${Math.floor(w*0.022)}px Georgia, serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Daily Life in 19th Century Netherlands', w/2, h*0.15);
    ctx.font = `${Math.floor(w*0.016)}px Georgia, serif`;
    ctx.fillText('Population growth · Industrialisation · Emigration', w/2, h*0.25);
    // Desks and students (rows of rectangles)
    ctx.fillStyle = 'rgba(160,120,60,0.4)';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      ctx.fillRect(w*(0.08 + c*0.18), h*(0.50 + r*0.14), w*0.13, h*0.08);
    }
    // Maxwell silhouette slightly apart, looking at phone/book
    ctx.fillStyle = 'rgba(50,70,50,0.6)';
    ctx.beginPath(); ctx.arc(w*0.44, h*0.56, h*0.04, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(w*0.425, h*0.60, w*0.03, h*0.08);
    // Book on desk glowing faintly
    const jg = ctx.createRadialGradient(w*0.46, h*0.67, 0, w*0.46, h*0.67, w*0.08);
    jg.addColorStop(0, 'rgba(200,160,80,0.3)'); jg.addColorStop(1, 'rgba(200,160,80,0)');
    ctx.fillStyle = jg; ctx.fillRect(0, 0, w, h);
    ctx.textBaseline = 'alphabetic';

  } else if (panel.bg === 'closeup') {
    // Journal closeup — worn leather cover + title
    const jg2 = ctx.createRadialGradient(w/2, h*0.48, 0, w/2, h*0.48, w*0.35);
    jg2.addColorStop(0, 'rgba(140,90,30,0.6)'); jg2.addColorStop(1, 'rgba(140,90,30,0)');
    ctx.fillStyle = jg2; ctx.fillRect(0, 0, w, h);
    // Journal cover
    ctx.fillStyle = 'rgba(120,75,20,0.85)';
    const jw = Math.min(w*0.55, 480), jh = Math.min(h*0.55, 380);
    const jx = w/2 - jw/2, jy = h*0.22;
    ctx.fillRect(jx, jy, jw, jh);
    ctx.strokeStyle = 'rgba(200,160,80,0.7)'; ctx.lineWidth = 3;
    ctx.strokeRect(jx, jy, jw, jh);
    // Inner border
    ctx.strokeStyle = 'rgba(200,160,80,0.4)'; ctx.lineWidth = 1;
    ctx.strokeRect(jx+10, jy+10, jw-20, jh-20);
    // Title text on cover
    ctx.fillStyle = 'rgba(220,180,80,0.9)';
    ctx.font = `bold ${Math.floor(Math.min(jw*0.09, 28))}px Georgia, serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Van Duynhoven', w/2, jy + jh*0.35);
    ctx.font = `${Math.floor(Math.min(jw*0.065, 20))}px Georgia, serif`;
    ctx.fillText('Family History', w/2, jy + jh*0.52);
    // Decorative line
    ctx.strokeStyle = 'rgba(220,180,80,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(jx+30, jy + jh*0.44); ctx.lineTo(jx+jw-30, jy + jh*0.44); ctx.stroke();
    ctx.textBaseline = 'alphabetic';

  } else if (panel.bg === 'sleep') {
    // Stars — fix: use Math.abs to ensure positive radius
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 80; i++) {
      const sx2 = Math.sin(i * 13.7) * w/2 + w/2;
      const sy2 = Math.cos(i * 11.3) * h/2 + h/2;
      const r   = Math.abs(Math.sin(i)) * 1.5 + 0.5; // always positive
      ctx.beginPath(); ctx.arc(sx2, sy2, r, 0, Math.PI*2); ctx.fill();
    }
    // Nebula glow
    const ng = ctx.createRadialGradient(w*0.5, h*0.4, 0, w*0.5, h*0.4, w*0.4);
    ng.addColorStop(0, 'rgba(80,40,160,0.25)'); ng.addColorStop(1, 'rgba(80,40,160,0)');
    ctx.fillStyle = ng; ctx.fillRect(0, 0, w, h);
    // Swirling light wisps
    ctx.strokeStyle = 'rgba(140,100,255,0.2)'; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(w*(0.3 + i*0.1), h*(0.3 + Math.sin(i)*0.2), w*(0.05 + i*0.03), 0, Math.PI*2);
      ctx.stroke();
    }
  }

  // Caption is rendered by the #rt-intro-caption DOM element (not on canvas)
  // — avoids double-render / overlap
  ctx.textBaseline = 'alphabetic';
}
