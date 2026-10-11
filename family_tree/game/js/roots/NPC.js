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
    this.talkCount  = 0;          // increments each conversation, drives repeat lines
    this.homeX      = x;
    this.homeY      = y;
    this.speed      = 35;
    this.wanderTimer = 0;
    this.wanderDx   = 0;
    this.wanderDy   = 0;
    // Schedule: [{time:0.0-1.0, r, c}] — NPC walks to tile (r,c) at this time of day
    this.schedule     = data.schedule    || null;
    // Wander radius in pixels when not on a schedule
    this.wanderRadius = data.wanderRadius != null ? data.wanderRadius * TILE : TILE * 3;

    this.bodyColor  = data.bodyColor || '#806040';
    this.hairColor  = data.hairColor || '#403020';
    this.skinColor  = data.skinColor || '#f0c080';
    this._portrait  = null; // lazy-created canvas
  }

  linesForCharacter(charId) {
    // Lines can be an array (flat) or an object with keys:
    //   generic, <charId>, repeat1, repeat2, repeat3, heart2, heart3, heart5
    //   <charId>_repeat1, <charId>_repeat2, <charId>_heart2  (character-specific repeats)
    // Priority: charId-specific > generic, then repeat based on talkCount, then heart-gated
    const pool = this.lines;

    // 1. Pick base set: charId-specific or generic
    const base = pool[charId] || pool.generic || [];

    // 2. On repeat visits, check charId-prefixed keys first, then generic ones
    if (this.talkCount > 0) {
      // Character-specific heart/repeat keys (e.g. 'raven_heart2', 'starling_repeat1')
      const heartKey = this.friendship >= 5 ? 'heart5'
                     : this.friendship >= 3 ? 'heart3'
                     : this.friendship >= 2 ? 'heart2' : null;

      if (heartKey) {
        const charHeartKey = charId ? `${charId}_${heartKey}` : null;
        if (charHeartKey && pool[charHeartKey]) return pool[charHeartKey];
        if (pool[heartKey]) return pool[heartKey];
      }

      const repeatKey = `repeat${this.talkCount}`;
      const charRepeatKey = charId ? `${charId}_${repeatKey}` : null;
      if (charRepeatKey && pool[charRepeatKey]) return pool[charRepeatKey];
      if (pool[repeatKey]) return pool[repeatKey];

      // Cycle through character-specific repeat keys, then generic
      const charRepeatKeys = charId
        ? Object.keys(pool).filter(k => k.startsWith(`${charId}_repeat`))
        : [];
      const genericRepeatKeys = Object.keys(pool).filter(k => /^repeat\d+$/.test(k));
      const allRepeatKeys = [...charRepeatKeys, ...genericRepeatKeys];
      if (allRepeatKeys.length) {
        const idx = (this.talkCount - 1) % allRepeatKeys.length;
        return pool[allRepeatKeys[idx]] || base;
      }

      return pool.repeat_default || [
        `${this.data?.given || this.name.split(' ')[0]} smiles at you warmly. ♥`,
        'It is good to talk again. Come back any time.',
      ];
    }

    return base;
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

    // ── Schedule-based movement ──────────────────────────
    // If this NPC has a schedule, walk toward current waypoint
    if (this.schedule && this.schedule.length > 0) {
      const tod = game?._timeOfDay ?? 0.4;
      // Find active waypoint (last one whose time <= tod)
      let wp = this.schedule[0];
      for (const s of this.schedule) {
        if (s.time <= tod) wp = s;
        else break;
      }
      const tx = wp.c * TILE + 4;
      const ty = wp.r * TILE + 4;
      const dist = Math.hypot(this.cx - tx, this.cy - ty);

      if (dist > TILE * 0.6) {
        // Walk toward waypoint
        const dx = tx - this.cx, dy = ty - this.cy;
        const len = Math.hypot(dx, dy) || 1;
        const spd = this.speed * dt;
        const nx = this.x + (dx / len) * spd;
        const ny = this.y + (dy / len) * spd;
        const pad = 3;
        if (!world.solidAt(nx + pad, this.y + pad) &&
            !world.solidAt(nx + this.w - pad, this.y + this.h - pad)) this.x = nx;
        if (!world.solidAt(this.x + pad, ny + pad) &&
            !world.solidAt(this.x + this.w - pad, ny + this.h - pad)) this.y = ny;

        if (Math.abs(dx) > Math.abs(dy)) this.facing = dx > 0 ? 'right' : 'left';
        else this.facing = dy > 0 ? 'down' : 'up';
        return; // don't also wander
      }
      // At waypoint — do small local wander
    }

    // ── Default wander ────────────────────────────────────
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

    // Stay within wander radius of homeX/homeY
    const wanderRadius = this.wanderRadius ?? TILE * 3;
    if (Math.hypot(this.cx - this.homeX, this.cy - this.homeY) > wanderRadius) {
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
