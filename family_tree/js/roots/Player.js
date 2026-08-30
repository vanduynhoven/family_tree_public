// ═══════════════════════════════════════════════════════════
//  Player — movement, attack, fishing, inventory, stats
// ═══════════════════════════════════════════════════════════
import { Entity } from './Entity.js';
import { TILE, drawPlayer } from './Renderer.js';

export class Player extends Entity {
  constructor(x, y, charConfig = {}) {
    super(x, y, TILE * 0.52, TILE * 0.72);
    this.speed      = 180;
    this.hp         = 100;
    this.maxHp      = 100;
    this.stamina    = 100;
    this.maxStamina = 100;
    this.inventory      = [];   // max 12 slots
    this.collectedFacts = [];   // { npcId, name, text }
    this.walkCycle      = 0;
    this.hurtTimer      = 0;
    this.swingTimer     = 0;
    this.fishTimer      = 0;    // >0 = bobber in water
    this.fishDipped     = false;
    this.fishWindowSecs = 0.7;
    this.bobberX        = 0;
    this.bobberY        = 0;
    this.pose           = 'idle'; // idle | reading | sleeping | pointing | surprised

    // Appearance from CharacterData
    this.hairColor = charConfig.hairColor || '#c07830';
    this.bodyColor = charConfig.bodyColor || '#3060a0';
    this.skinColor = charConfig.skinColor || '#f0c080';
  }

  get inventoryFull() { return this.inventory.length >= 12; }
  hasItem(id)         { return this.inventory.some(i => i.id === id); }

  collectItem(item) {
    if (!item || this.hasItem(item.id) || this.inventoryFull) return false;
    this.inventory.push(item);
    return true;
  }

  takeDamage(amt) {
    if (this.hurtTimer > 0) return;
    this.hp = Math.max(0, this.hp - amt);
    this.hurtTimer = 1.2;
    const el = document.getElementById('rt-damage-flash');
    if (el) { el.style.background = 'rgba(255,0,0,0.4)'; setTimeout(() => el.style.background = '', 200); }
  }

  heal(amt)           { this.hp = Math.min(this.maxHp, this.hp + amt); }
  restoreStamina(amt) { this.stamina = Math.min(this.maxStamina, this.stamina + amt); }

  drainStamina(amt) {
    this.stamina = Math.max(0, this.stamina - amt);
    return this.stamina > 0;
  }

  /** Returns arc hitbox in world coords for current swing */
  getSwingHitbox() {
    const reach = TILE * 1.3, cx = this.cx, cy = this.cy;
    switch (this.facing) {
      case 'right': return { x: cx,         y: cy - TILE*0.3, w: reach,    h: TILE*0.6 };
      case 'left':  return { x: cx - reach, y: cy - TILE*0.3, w: reach,    h: TILE*0.6 };
      case 'up':    return { x: cx - TILE*0.3, y: cy - reach, w: TILE*0.6, h: reach    };
      default:      return { x: cx - TILE*0.3, y: cy,         w: TILE*0.6, h: reach    };
    }
  }

  hitboxOverlaps(hb, entity) {
    return hb.x < entity.x + entity.w && hb.x + hb.w > entity.x &&
           hb.y < entity.y + entity.h && hb.y + hb.h > entity.y;
  }

  startFishing(bx, by) {
    this.fishTimer  = 2 + Math.random() * 3;
    this.fishDipped = false;
    this.bobberX    = bx;
    this.bobberY    = by;
    this.pose = 'pointing';
    return true;
  }

  tryReel() {
    if (this.fishTimer <= 0) return 'idle';
    if (this.fishDipped) {
      this.fishTimer  = 0;
      this.fishDipped = false;
      this.pose       = 'idle';
      return 'caught';
    }
    // Pressed too early — miss, reset
    this.fishTimer  = 0;
    this.pose       = 'idle';
    return 'miss';
  }

  update(dt, keys, world) {
    if (this.hurtTimer > 0) this.hurtTimer -= dt;
    if (this.swingTimer > 0) this.swingTimer -= dt;

    // Stamina recharge when stationary
    if (!keys.up && !keys.down && !keys.left && !keys.right) {
      this.stamina = Math.min(this.maxStamina, this.stamina + dt * 8);
    }

    // Fishing tick
    if (this.fishTimer > 0) {
      this.fishTimer -= dt;
      // Random dip trigger in second half of wait
      if (!this.fishDipped && this.fishTimer < 2 && Math.random() < dt * 0.8) {
        this.fishDipped = true;
        setTimeout(() => { this.fishDipped = false; this.fishTimer = 0; this.pose = 'idle'; },
                   this.fishWindowSecs * 1000);
      }
      return; // no movement while fishing
    }

    // Movement
    let dx = 0, dy = 0;
    if (keys.left)  dx = -1;
    if (keys.right) dx =  1;
    if (keys.up)    dy = -1;
    if (keys.down)  dy =  1;
    if (dx && dy)   { dx *= 0.707; dy *= 0.707; }

    if (dx < 0) this.facing = 'left';
    if (dx > 0) this.facing = 'right';
    if (dy < 0) this.facing = 'up';
    if (dy > 0) this.facing = 'down';

    if (dx !== 0 || dy !== 0) this.walkCycle += dt * 9;

    const spd = this.speed * dt;
    const nx  = this.x + dx * spd;
    const ny  = this.y + dy * spd;
    const pad = 3;

    if (dx !== 0 &&
        !world.solidAt(nx + pad, this.y + pad) &&
        !world.solidAt(nx + this.w - pad, this.y + pad) &&
        !world.solidAt(nx + pad, this.y + this.h - pad) &&
        !world.solidAt(nx + this.w - pad, this.y + this.h - pad)) {
      this.x = nx;
    }
    if (dy !== 0 &&
        !world.solidAt(this.x + pad, ny + pad) &&
        !world.solidAt(this.x + this.w - pad, ny + pad) &&
        !world.solidAt(this.x + pad, ny + this.h - pad) &&
        !world.solidAt(this.x + this.w - pad, ny + this.h - pad)) {
      this.y = ny;
    }
  }

  draw(ctx, ox, oy, frame) {
    drawPlayer(ctx, this.x - ox, this.y - oy, {
      facing:    this.facing,
      walkCycle: this.walkCycle,
      hurt:      this.hurtTimer > 0,
      hairColor: this.hairColor,
      bodyColor: this.bodyColor,
      skinColor: this.skinColor,
      pose:      this.pose,
    });
  }
}
