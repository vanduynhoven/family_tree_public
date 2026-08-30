// ═══════════════════════════════════════════════════════════════
//  UI — HUD, dialog, journal, inventory, era select
// ═══════════════════════════════════════════════════════════════
import { ERAS } from './eras.js';
import { SCREEN_COLS, SCREEN_ROWS } from './eras.js';

export class UI {
  constructor(game) {
    this.game = game;
    this.journalOpen = false;
    this.eraSelOpen = false;
  }

  updateHUD(eraId, screenTitle, hp, maxHp, stories, total) {
    const eb = document.getElementById('era-badge');
    if(eb) eb.textContent = `⏰ ${ERAS[eraId]?.year} — ${screenTitle||ERAS[eraId]?.name}`;
    const hb = document.getElementById('hp-badge');
    if(hb) hb.textContent = `❤️ ${hp}/${maxHp}`;
    const sb = document.getElementById('score-badge');
    if(sb) sb.textContent = `📖 ${stories}/${total}`;
  }

  showPrompt(text) {
    const el = document.getElementById('prompt');
    if(!el) return;
    el.textContent = text;
    el.style.display = 'block';
  }
  hidePrompt() {
    const el = document.getElementById('prompt');
    if(el) el.style.display = 'none';
  }

  showScreenTitle(title) {
    const el = document.getElementById('screen-title');
    if(!el) return;
    el.textContent = title;
    el.style.display = 'block';
    clearTimeout(this._stTimeout);
    this._stTimeout = setTimeout(() => { el.style.display='none'; }, 2500);
  }

  // ── DIALOG ────────────────────────────────────────────────
  openDialog(npc) {
    this._dlgNPC = npc;
    this._dlgLine = 0;
    const dlg = document.getElementById('dialog');
    if(!dlg) return;
    dlg.style.display = 'block';
    document.getElementById('dlg-name').textContent = `${npc.data?.given||npc.name} (${npc.data?.year||''}) — ${npc.data?.gen !== undefined ? 'Gen '+npc.data.gen : npc.data?.role||''}`;
    document.getElementById('dlg-name').style.color = '#3498db';
    document.getElementById('dlg-text').textContent = npc.lines[0] || '...';
    // Draw portrait
    const portrait = document.getElementById('dlg-portrait');
    if(portrait) this._drawPortrait(portrait, npc);
    portrait.style.borderColor = '#3498db';
  }

  advanceDialog() {
    const npc = this._dlgNPC;
    if(!npc) return false;
    this._dlgLine++;
    if(this._dlgLine >= npc.lines.length) {
      document.getElementById('dialog').style.display = 'none';
      this._dlgNPC = null;
      return 'done'; // signal: collect item
    }
    document.getElementById('dlg-text').textContent = npc.lines[this._dlgLine];
    return 'continue';
  }

  isDialogOpen() { return !!this._dlgNPC; }

  _drawPortrait(canvas, npc) {
    const ctx = canvas.getContext('2d');
    const s = npc.bodyColor || '#6a5a3a';
    const h = npc.hatColor || '#3a2a10';
    const k = npc.skinColor || '#e8b870';
    ctx.fillStyle='#111'; ctx.fillRect(0,0,64,64);
    ctx.fillStyle=h; ctx.fillRect(14,10,36,10);
    ctx.fillStyle=k; ctx.fillRect(16,18,32,26);
    ctx.fillStyle=s; ctx.fillRect(10,44,44,24);
    ctx.fillStyle='#2a2020'; ctx.fillRect(22,26,6,6); ctx.fillRect(36,26,6,6);
    ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(0,0,64,64);
  }

  // ── JOURNAL ───────────────────────────────────────────────
  toggleJournal() {
    this.journalOpen = !this.journalOpen;
    const j = document.getElementById('journal');
    if(!j) return;
    if(this.journalOpen) {
      const facts = this.game.player?.collectedFacts || [];
      document.getElementById('jentries').innerHTML = facts.length === 0
        ? '<div style="color:#555;font-style:italic;font-size:11px">Talk to Van Duynhoven ancestors to collect their stories.</div>'
        : facts.map(f=>`<div class="je"><div class="jname">📖 ${f.name}</div><div class="jfact">${f.fact}</div></div>`).join('');
      j.style.display='flex';
    } else {
      j.style.display='none';
    }
  }

  // ── ERA SELECT ────────────────────────────────────────────
  showEraSel() {
    const sel = document.getElementById('eraSel');
    if(!sel) return;
    sel.innerHTML='<h2>⏰ TIME PORTAL</h2>';
    this.eraSelOpen = true;
    ERAS.forEach((e,i)=>{
      const btn = document.createElement('button');
      btn.className='ebtn';
      const locked = e.portalItem && !this.game.player?.hasItem(e.portalItem);
      btn.innerHTML=`<span class="eyear">${e.year}</span><span><strong>${e.name}</strong>${locked?' 🔒':''}</span>`;
      btn.style.opacity = locked ? '0.5' : '1';
      btn.onclick = () => {
        if(locked) { this.showToast(`🔒 Need item to travel here`); return; }
        sel.style.display='none';
        this.eraSelOpen=false;
        this.game.travelToEra(i);
      };
      sel.appendChild(btn);
    });
    const cl=document.createElement('button');
    cl.style.cssText='background:#0a0a0a;border:2px solid #555;color:#888;font-family:inherit;padding:8px 20px;cursor:pointer;margin-top:4px;';
    cl.textContent='✕ Cancel';
    cl.onclick=()=>{ sel.style.display='none'; this.eraSelOpen=false; };
    sel.appendChild(cl);
    sel.style.display='flex';
  }

  // ── INVENTORY ─────────────────────────────────────────────
  renderInventory(items) {
    const bar = document.getElementById('inv-bar');
    if(!bar) return;
    bar.innerHTML = items.length===0
      ? '<div style="color:#333;font-size:10px;padding:4px">No items</div>'
      : items.map(i=>`<div class="inv-slot" title="${i.name}: ${i.desc}">${i.icon}</div>`).join('');
  }

  // ── TOAST ─────────────────────────────────────────────────
  showToast(msg, color='#f39c12') {
    const t=document.createElement('div');
    t.style.cssText=`position:fixed;bottom:130px;left:50%;transform:translateX(-50%);background:#000;border:2px solid ${color};padding:7px 18px;color:${color};font-size:11px;z-index:35;pointer-events:none;font-family:monospace;white-space:nowrap`;
    t.textContent=msg;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),2500);
  }

  showItemToast(item) {
    const t=document.createElement('div');
    t.style.cssText='position:fixed;bottom:130px;left:50%;transform:translateX(-50%);background:#000;border:3px solid #f39c12;padding:10px 20px;color:#f39c12;font-size:12px;z-index:35;pointer-events:none;font-family:monospace;text-align:center';
    t.innerHTML=`<div style="font-size:24px">${item.icon}</div><div>${item.name}</div><div style="color:#888;font-size:10px">${item.desc}</div>`;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),3000);
  }

  // Minimap — persistent 4×4 world grid view
  drawMinimap(ctx, world, player) {
    const game = this.game;
    const visited  = game.visitedScreens  || new Set();
    const portals  = game.portalScreens   || new Set();
    const R = SCREEN_ROWS, C = SCREEN_COLS; // grid dimensions: 4 rows × 4 cols
    const CELL = 12; // pixel size of each grid cell
    const PAD  = 3;
    const mmW  = C * CELL + PAD * 2;
    const mmH  = R * CELL + PAD * 2 + 16; // +16 for coordinate label
    const mmX  = ctx.canvas.width  - mmW - 8;
    const mmY  = 56;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.fillRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);

    // Draw each grid cell
    for(let r = 0; r < R; r++) {
      for(let c = 0; c < C; c++) {
        const key = `${r}_${c}`;
        const cx  = mmX + PAD + c * CELL;
        const cy  = mmY + PAD + r * CELL;
        const isCurrent = r === world.gridRow && c === world.gridCol;
        const isVisited  = visited.has(key);
        const hasPortal  = portals.has(key);

        // Cell background
        if(hasPortal) {
          ctx.fillStyle = '#2a0060';       // deep purple — portal found here
        } else if(isVisited) {
          ctx.fillStyle = '#1a3a1a';       // dark green — visited
        } else {
          ctx.fillStyle = '#0a0a0a';       // near-black — unknown
        }
        ctx.fillRect(cx, cy, CELL - 1, CELL - 1);

        // Portal icon — bright star in the cell
        if(hasPortal) {
          ctx.fillStyle = '#c080ff';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', cx + (CELL - 1) / 2, cy + (CELL - 1) / 2);
        }

        // Current screen border — bright white outline
        if(isCurrent) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cx - 0.5, cy - 0.5, CELL, CELL);
        }
      }
    }

    // Player dot on current cell
    const curX = mmX + PAD + world.gridCol * CELL + (CELL - 1) / 2;
    const curY = mmY + PAD + world.gridRow * CELL + (CELL - 1) / 2;
    if(!portals.has(world.screenKey)) { // don't overlap the star
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(curX - 2, curY - 2, 4, 4);
    }

    // Legend label
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(mmX - 2, mmY + PAD + R * CELL + 2, mmW + 4, 14);
    ctx.fillStyle = '#888';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`[${world.gridRow + 1},${world.gridCol + 1}] of 4×4`, mmX + mmW / 2, mmY + PAD + R * CELL + 13);
  }
}
