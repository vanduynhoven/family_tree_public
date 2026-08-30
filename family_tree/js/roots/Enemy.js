// ═══════════════════════════════════════════════════════════
//  Enemy — patrol/chase/attack AI with knockback & death anim
// ═══════════════════════════════════════════════════════════
import { Entity } from './Entity.js';
import { TILE, drawEnemy } from './Renderer.js';

const STATE = { PATROL:'patrol', CHASE:'chase', ATTACK:'attack', DEAD:'dead' };

export class Enemy extends Entity {
  constructor(def, x, y) {
    super(x, y, TILE * 0.6, TILE * 0.6);
    this.def          = def;
    this.name         = def.name;
    this.emoji        = def.emoji  || '👹';
    this.color        = def.color  || '#a03020';
    this.accent       = def.accent || '#c05040';
    this.hp           = def.hp * 20;
    this.maxHp        = this.hp;
    this.speed        = def.speed  || 60;
    this.damage       = def.damage || 15;
    this.chaseRange   = def.chaseRange  || 180;
    this.attackRange  = TILE * 0.9;
    this.attackCd     = 0;
    this.knockbackX   = 0;
    this.knockbackY   = 0;
    this.state        = STATE.PATROL;
    this.homeX        = x;
    this.homeY        = y;
    this.wanderTimer  = 0;
    this.wanderDx     = 0;
    this.wanderDy     = 0;
    this.hurtTimer    = 0;
    this.deathTimer   = 0;
  }

  takeDamage(amt, kdx = 0, kdy = 0) {
    if (this.hurtTimer > 0 || this.state === STATE.DEAD) return;
    this.hp -= amt;
    this.hurtTimer = 0.3;
    this.knockbackX = kdx * 130;
    this.knockbackY = kdy * 130;
    if (this.hp <= 0) {
      this.hp = 0;
      this.state = STATE.DEAD;
      this.deathTimer = 0.5;
    }
  }

  update(dt, world, game) {
    if (this.state === STATE.DEAD) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) this.alive = false;
      return;
    }

    if (this.hurtTimer > 0) this.hurtTimer -= dt;
    if (this.attackCd > 0)  this.attackCd  -= dt;

    // Apply knockback
    const kspeed = Math.hypot(this.knockbackX, this.knockbackY);
    if (kspeed > 2) {
      this.x += this.knockbackX * dt;
      this.y += this.knockbackY * dt;
      this.knockbackX *= Math.pow(0.05, dt);
      this.knockbackY *= Math.pow(0.05, dt);
      return;
    }

    const player = game?.player;
    if (!player) { this._patrol(dt, world); return; }

    const dist = this.distTo(player);
    if (dist < this.attackRange)       this.state = STATE.ATTACK;
    else if (dist < this.chaseRange)   this.state = STATE.CHASE;
    else                               this.state = STATE.PATROL;

    switch (this.state) {
      case STATE.PATROL: this._patrol(dt, world); break;
      case STATE.CHASE:  this._moveToward(player, dt, world); break;
      case STATE.ATTACK:
        this.faceToward(player);
        if (this.attackCd <= 0) { player.takeDamage(this.damage); this.attackCd = 1.2; }
        break;
    }
  }

  _moveToward(target, dt, world) {
    const dx  = target.cx - this.cx;
    const dy  = target.cy - this.cy;
    const len = Math.hypot(dx, dy) || 1;
    const nx  = this.x + (dx / len) * this.speed * dt;
    const ny  = this.y + (dy / len) * this.speed * dt;
    const pad = 3;
    if (!world.solidAt(nx + pad, this.y + pad) &&
        !world.solidAt(nx + this.w - pad, this.y + this.h - pad)) this.x = nx;
    if (!world.solidAt(this.x + pad, ny + pad) &&
        !world.solidAt(this.x + this.w - pad, ny + this.h - pad)) this.y = ny;
    this.faceToward(target);
  }

  _patrol(dt, world) {
    this.wanderTimer -= dt;
    if (this.wanderTimer <= 0) {
      const dirs = [[1,0],[-1,0],[0,1],[0,-1],[0,0],[0,0]];
      const d    = dirs[Math.floor(Math.random() * dirs.length)];
      this.wanderDx = d[0]; this.wanderDy = d[1];
      this.wanderTimer = 1.2 + Math.random() * 1.5;
    }
    if (!this.wanderDx && !this.wanderDy) return;
    if (Math.hypot(this.cx - this.homeX, this.cy - this.homeY) > TILE * 3.5) {
      this.wanderDx = this.cx > this.homeX ? -1 : 1;
      this.wanderDy = 0;
    }
    const spd = this.speed * 0.5 * dt;
    const nx  = this.x + this.wanderDx * spd;
    const ny  = this.y + this.wanderDy * spd;
    const pad = 3;
    if (!world.solidAt(nx + pad, this.y + pad) &&
        !world.solidAt(nx + this.w - pad, this.y + this.h - pad)) this.x = nx;
    if (!world.solidAt(this.x + pad, ny + pad) &&
        !world.solidAt(this.x + this.w - pad, ny + this.h - pad)) this.y = ny;
  }

  draw(ctx, ox, oy, frame) {
    if (!this.alive && this.state !== STATE.DEAD) return;
    if (this.state === STATE.DEAD) ctx.globalAlpha = Math.max(0, this.deathTimer / 0.5);
    if (this.hurtTimer > 0 && Math.sin(frame * 25) > 0) ctx.globalAlpha = 0.2;

    drawEnemy(ctx, this.x - ox, this.y - oy, {
      color: this.color, accent: this.accent, emoji: this.emoji, size: this.w,
    });

    // HP bar
    if (this.hp < this.maxHp && this.hp > 0) {
      const bw = this.w * 0.9;
      const bx = this.x - ox + this.w * 0.05;
      const by = this.y - oy - 7;
      ctx.fillStyle = '#500'; ctx.fillRect(bx, by, bw, 4);
      ctx.fillStyle = '#f40'; ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), 4);
    }
    ctx.globalAlpha = 1;
  }
}
