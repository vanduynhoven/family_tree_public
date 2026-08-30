// ═══════════════════════════════════════════════════════════
//  NPC — wandering ancestor with schedule, dialog, friendship
// ═══════════════════════════════════════════════════════════
import { Entity } from './Entity.js';
import { TILE, drawNPCPortrait } from './Renderer.js';

export class NPC extends Entity {
  constructor(data, x, y) {
    super(x, y, TILE * 0.52, TILE * 0.72);
    this.data       = data;
    this.name       = data.name;
    this.gedcomId   = data.gedcomId || '';
    this.era        = data.era ?? 0;
    this.lines      = data.lines   || {};
    this.item       = data.item    || null;
    this.friendship = 0;          // 0-5 hearts
    this.talked     = false;
    this.homeX      = x;
    this.homeY      = y;
    this.speed      = 35;
    this.wanderTimer = 0;
    this.wanderDx   = 0;
    this.wanderDy   = 0;

    this.bodyColor  = data.bodyColor || '#806040';
    this.hairColor  = data.hairColor || '#403020';
    this.skinColor  = data.skinColor || '#f0c080';
    this._portrait  = null; // lazy-created canvas
  }

  linesForCharacter(charId) {
    return this.lines[charId] || this.lines.generic || [];
  }

  addFriendship(amt) {
    this.friendship = Math.min(5, this.friendship + amt);
  }

  getPortraitCanvas() {
    if (!this._portrait) {
      this._portrait = document.createElement('canvas');
      this._portrait.width = 64; this._portrait.height = 64;
      drawNPCPortrait(this._portrait.getContext('2d'), {
        skinColor: this.skinColor,
        hairColor: this.hairColor,
        bodyColor: this.bodyColor,
        era:       this.era,
      });
    }
    return this._portrait;
  }

  update(dt, world, game) {
    if (game?.dialogActive) return; // freeze during dialog

    this.wanderTimer -= dt;
    if (this.wanderTimer <= 0) {
      const dirs = [[-1,0],[1,0],[0,-1],[0,1],[0,0],[0,0],[0,0]]; // pause more often
      const d = dirs[Math.floor(Math.random() * dirs.length)];
      this.wanderDx = d[0]; this.wanderDy = d[1];
      this.wanderTimer = 1.5 + Math.random() * 2;

      if (this.wanderDx < 0) this.facing = 'left';
      if (this.wanderDx > 0) this.facing = 'right';
      if (this.wanderDy < 0) this.facing = 'up';
      if (this.wanderDy > 0) this.facing = 'down';
    }

    if (!this.wanderDx && !this.wanderDy) return;

    // Stay within 3 tiles of home
    if (Math.hypot(this.cx - this.homeX, this.cy - this.homeY) > TILE * 3) {
      this.wanderDx = this.cx > this.homeX ? -1 : 1;
      this.wanderDy = 0;
    }

    const spd = this.speed * dt;
    const nx  = this.x + this.wanderDx * spd;
    const ny  = this.y + this.wanderDy * spd;
    const pad = 3;
    if (this.wanderDx !== 0 &&
        !world.solidAt(nx + pad, this.y + pad) &&
        !world.solidAt(nx + this.w - pad, this.y + this.h - pad)) this.x = nx;
    if (this.wanderDy !== 0 &&
        !world.solidAt(this.x + pad, ny + pad) &&
        !world.solidAt(this.x + this.w - pad, ny + this.h - pad)) this.y = ny;
  }

  draw(ctx, ox, oy, frame) {
    const sx = this.x - ox;
    const sy = this.y - oy;
    const s  = this.w;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(sx + s/2, sy + this.h * 0.92, s*0.35, s*0.1, 0, 0, Math.PI*2);
    ctx.fill();

    // Body
    ctx.fillStyle = this.bodyColor;
    ctx.fillRect(sx + s*0.15, sy + s*0.3, s*0.7, s*0.55);

    // Head
    ctx.fillStyle = this.skinColor;
    ctx.beginPath();
    ctx.arc(sx + s/2, sy + s*0.22, s*0.22, 0, Math.PI*2);
    ctx.fill();

    // Hair
    ctx.fillStyle = this.hairColor;
    ctx.beginPath();
    ctx.arc(sx + s/2, sy + s*0.14, s*0.22, Math.PI, Math.PI*2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#202020';
    const edir = this.facing === 'left' ? -1 : this.facing === 'right' ? 1 : 0;
    ctx.beginPath(); ctx.arc(sx + s*0.38 + edir*2, sy + s*0.22, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx + s*0.62 + edir*2, sy + s*0.22, 2, 0, Math.PI*2); ctx.fill();

    // Name label
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(sx + s*0.05, sy - 14, s*0.9, 12);
    ctx.fillStyle = '#fff';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.data.given || this.name.split(' ')[0], sx + s/2, sy - 8);

    // Friendship hearts
    if (this.friendship > 0) {
      ctx.font = '8px sans-serif';
      ctx.fillStyle = '#f060a0';
      ctx.fillText('♥'.repeat(this.friendship), sx + s/2, sy - 22);
    }
    ctx.textBaseline = 'alphabetic';
  }
}
