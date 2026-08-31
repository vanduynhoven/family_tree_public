// ═══════════════════════════════════════════════════════════
//  Livestock — wandering farm animals that can be butchered
//  Click once to butcher (transforms to meat DroppedItem),
//  click again to pick up the meat.
// ═══════════════════════════════════════════════════════════
import { Entity } from './Entity.js';
import { TILE } from './Renderer.js';

export class Livestock extends Entity {
  constructor(def, x, y) {
    super(x, y, TILE * 0.55, TILE * 0.55);
    this.def          = def;
    this.animalId     = def.animalId;   // e.g. 'decor_cow'
    this.emoji        = def.emoji;
    this.name         = def.name;
    this.homeX        = x;
    this.homeY        = y;
    this.speed        = 30 + Math.random() * 20;  // slow wander
    this.wanderTimer  = Math.random() * 3;
    this.wanderDx     = 0;
    this.wanderDy     = 0;
    this.butchered    = false;   // true = waiting to be picked up as meat
    this.butcherTimer = 0;       // brief stun after butcher
  }

  update(dt, world) {
    if (this.butchered) { this.butcherTimer -= dt; return; }

    this.wanderTimer -= dt;
    if (this.wanderTimer <= 0) {
      const dirs = [[1,0],[-1,0],[0,1],[0,-1],[0,0],[0,0],[0,0]]; // pause more
      const d = dirs[Math.floor(Math.random() * dirs.length)];
      this.wanderDx = d[0]; this.wanderDy = d[1];
      this.wanderTimer = 1.5 + Math.random() * 2.5;
    }

    // Stay near home
    if (Math.hypot(this.cx - this.homeX, this.cy - this.homeY) > TILE * 2.5) {
      this.wanderDx = this.cx > this.homeX ? -1 : 1;
      this.wanderDy = 0;
    }

    if (!this.wanderDx && !this.wanderDy) return;

    const spd = this.speed * dt;
    const nx = this.x + this.wanderDx * spd;
    const ny = this.y + this.wanderDy * spd;
    const pad = 3;
    const footTop = this.y + this.h * 0.65, footBottom = this.y + this.h - pad;
    if (!world.solidAt(nx + pad, footTop) && !world.solidAt(nx + this.w - pad, footBottom)) this.x = nx;
    if (!world.solidAt(this.x + pad, ny + this.h * 0.65) && !world.solidAt(this.x + this.w - pad, ny + this.h - pad)) this.y = ny;
  }

  draw(ctx, ox, oy, frame) {
    if (this.butchered) {
      // Meat drop glowing on the ground
      const x = this.x - ox, y = this.y - oy;
      const bob = Math.sin(frame / 18) * 2;
      ctx.fillStyle = `rgba(255,180,80,${0.3 + Math.sin(frame/12)*0.1})`;
      ctx.beginPath(); ctx.ellipse(x + this.w/2, y + this.h - 3, this.w*0.3, this.h*0.08, 0, 0, Math.PI*2); ctx.fill();
      ctx.font = `${Math.floor(this.w * 0.9)}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🥩', x + this.w/2, y + this.h/2 + bob);
      ctx.textBaseline = 'alphabetic';
      return;
    }
    // Animal emoji with gentle bob
    const bob = Math.sin(frame / 30 + this.homeX) * 1.5;
    const x = this.x - ox, y = this.y - oy;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath(); ctx.ellipse(x + this.w/2, y + this.h - 3, this.w*0.32, this.h*0.08, 0, 0, Math.PI*2); ctx.fill();
    ctx.font = `${Math.floor(this.w * 0.9)}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, x + this.w/2, y + this.h/2 + bob);
    ctx.textBaseline = 'alphabetic';
  }
}
