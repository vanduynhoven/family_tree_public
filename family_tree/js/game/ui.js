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

  // Minimap
  drawMinimap(ctx, world, player) {
    const mmW=SCREEN_COLS*3, mmH=SCREEN_ROWS*3;
    const mmX=ctx.canvas.width-mmW-8, mmY=56;
    ctx.fillStyle='rgba(0,0,0,0.75)'; ctx.fillRect(mmX-2,mmY-2,mmW+4,mmH+4);
    const map=world.map;
    const TILE_COLS=['#2d6b3a','#5a4a3a','#1a5a9a','#c8b460','#7a6040','#1a5010',
                     '#787878','#3a7d44','#c8a830','#7a3020','#b07840','#888888',
                     '#6020c0','#e8eef0','#708090','#0a2a10','#3a6020','#4a3a2a','#8a7060','#7a3020','#0a1828',
                     '#1e5a26','#6a5a4a','#b07840','#5a3010'];
    if(map) for(let r=0;r<SCREEN_ROWS;r++) for(let c=0;c<SCREEN_COLS;c++) {
      const t=map[r]?.[c]??0;
      ctx.fillStyle=TILE_COLS[t]||'#333'; ctx.fillRect(mmX+c*3,mmY+r*3,3,3);
    }
    ctx.fillStyle='#fff';
    const pc=~~(player.cx/48), pr=~~(player.cy/48);
    ctx.fillRect(mmX+pc*3-1,mmY+pr*3-1,5,5);
    ctx.fillStyle='#f39c12';
    for(const n of world.activeNPCs) ctx.fillRect(mmX+~~(n.cx/48)*3,mmY+~~(n.cy/48)*3,3,3);
    ctx.fillStyle='#e74c3c';
    for(const e of world.activeEnemies) ctx.fillRect(mmX+~~(e.cx/48)*3,mmY+~~(e.cy/48)*3,3,3);
    if(map) for(let r=0;r<SCREEN_ROWS;r++) for(let c=0;c<SCREEN_COLS;c++) {
      if(map[r]?.[c]===12){ctx.fillStyle='#c080ff';ctx.fillRect(mmX+c*3,mmY+r*3,4,4);}
    }
    // Grid position indicator
    ctx.fillStyle='rgba(0,0,0,0.7)';
    ctx.fillRect(mmX-2, mmY+mmH+4, mmW+4, 14);
    ctx.fillStyle='#888'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText(`[${world.gridRow+1},${world.gridCol+1}] of 4×4`, mmX+mmW/2, mmY+mmH+14);
  }
}
