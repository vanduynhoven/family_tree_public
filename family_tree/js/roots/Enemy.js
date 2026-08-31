// ═══════════════════════════════════════════════════════════
//  Enemy — patrol/chase/attack AI with knockback & death anim
//  Peaceful enemies steal gold on contact instead of fighting.
//  Battle enemies continue attacking as long as the player is adjacent.
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
    // Peaceful enemy state
    this.peaceful     = !!def.peaceful;
    this.stealAmt     = def.steal || 0;
    this.stealCd      = 0;       // cooldown between steals
    this.stealFlash   = 0;       // visual flash timer
  }

  takeDamage(amt, kdx = 0, kdy = 0) {
    if (this.hurtTimer > 0 || this.state === STATE.DEAD) return;
    // Peaceful enemies become aggressive when attacked
    if (this.peaceful) this.peaceful = false;
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

  /** Called by Game when the player chooses to keep attacking this enemy */
  get isBattle()  { return !this.peaceful; }
  get inAttackRange() { return this.state === STATE.ATTACK; }

  update(dt, world, game) {
    if (this.state === STATE.DEAD) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) this.alive = false;
      return;
    }

    if (this.hurtTimer > 0) this.hurtTimer -= dt;
    if (this.attackCd > 0)  this.attackCd  -= dt;
    if (this.stealCd > 0)   this.stealCd   -= dt;
    if (this.stealFlash > 0) this.stealFlash -= dt;

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
        if (this.attackCd <= 0) {
          if (this.peaceful && this.stealCd <= 0) {
            // Peaceful: steal gold/items instead of dealing HP damage
            this._steal(player, game);
            this.stealCd = 2.5;
            this.attackCd = 2.5;
          } else if (!this.peaceful) {
            // Battle: deal damage — auto-continues each attackCd cycle
            player.takeDamage(this.damage);
            this.attackCd = 1.2;
          }
        }
        break;
    }
  }

  _steal(player, game) {
    // Try to steal gold (represented as coin items) or just drain stamina
    const goldItem = player.inventory.find(i => i.id === 'coin' || i.id === 'gold' || i.tags?.includes('coin'));
    if (goldItem) {
      const take = Math.min(goldItem.count || 1, this.stealAmt);
      goldItem.count = (goldItem.count || 1) - take;
      if (goldItem.count <= 0) {
        player.inventory = player.inventory.filter(i => i !== goldItem);
      }
      game?.ui?.showToast(`💸 ${this.name} stole ${take} coins!`, '#ff8040');
    } else {
      // No coins — steal stamina as a softer penalty
      player.drainStamina(this.stealAmt);
      game?.ui?.showToast(`😰 ${this.name} drained your energy!`, '#ff8040');
    }
    this.stealFlash = 0.4;
    game?.music?.sfxHurt?.();
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
    // Low HP flicker — red tint when below 20% health (battle enemies only)
    const lowHp = !this.peaceful && this.hp > 0 && (this.hp / this.maxHp) < 0.2;
    if (lowHp && Math.sin(frame * 18) > 0.3) ctx.globalAlpha = Math.min(ctx.globalAlpha, 0.55);
    // Steal flash — gold tint on peaceful enemies stealing
    if (this.stealFlash > 0 && Math.sin(frame * 30) > 0) {
      ctx.globalAlpha = 0.7;
    }

    drawEnemy(ctx, this.x - ox, this.y - oy, {
      color: this.peaceful ? '#c8a020' : this.color,  // gold tint for peaceful
      accent: this.accent, emoji: this.emoji, size: this.w,
      enemyId: this.def?.id || '',
    });

    // HP bar (battle enemies only)
    if (!this.peaceful && this.hp < this.maxHp && this.hp > 0) {
      const bw = this.w * 0.9;
      const bx = this.x - ox + this.w * 0.05;
      const by = this.y - oy - 7;
      ctx.fillStyle = '#500'; ctx.fillRect(bx, by, bw, 4);
      ctx.fillStyle = '#f40'; ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), 4);
    }

    // Name label above sprite
    const cx = this.x - ox + this.w / 2;
    const labelY = this.y - oy - (this.hp < this.maxHp && !this.peaceful ? 14 : 6);
    ctx.save();
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    // Shadow for legibility on any background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillText(this.name, cx + 1, labelY + 1);
    ctx.fillStyle = this.peaceful ? '#ffd700' : '#ffccaa';
    ctx.fillText(this.name, cx, labelY);
    ctx.restore();

    // Peaceful label (💰)
    if (this.peaceful && this.state !== STATE.DEAD) {
      ctx.globalAlpha = 0.9;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.fillText('💸', this.x - ox + this.w / 2, this.y - oy - 4);
    }

    ctx.globalAlpha = 1;
  }
}