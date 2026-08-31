// ═══════════════════════════════════════════════════════════
//  DroppedItem — collectible sparkle item on the ground
// ═══════════════════════════════════════════════════════════
import { Entity } from './Entity.js';
import { TILE, drawDroppedItem } from './Renderer.js';

export class DroppedItem extends Entity {
  constructor(item, x, y, despawnSecs = -1) {
    super(x, y, TILE * 0.5, TILE * 0.5);
    this.item      = item;          // { id, label, emoji, decorOnly?, ... }
    this.despawn   = despawnSecs;   // -1 = permanent
    this.decorOnly = !!item.decorOnly; // true = visual only, cannot be picked up
  }

  update(dt) {
    if (this.despawn > 0) {
      this.despawn -= dt;
      if (this.despawn <= 0) this.alive = false;
    }
  }

  draw(ctx, ox, oy, frame) {
    if (this.decorOnly) {
      // Farm animals / decor: larger emoji, gentle shadow, no pickup glow
      const s = TILE * 0.65;
      const x = this.x - ox, y = this.y - oy;
      const bob = Math.sin(frame / 60) * 1.5;  // very gentle sway
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath(); ctx.ellipse(x + s/2, y + s - 3, s*.28, s*.07, 0, 0, Math.PI*2); ctx.fill();
      ctx.font = `${Math.floor(s*.75)}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(this.item.emoji || '🐄', x + s/2, y + s/2 + bob);
      ctx.textBaseline = 'alphabetic';
    } else {
      drawDroppedItem(ctx, this.x - ox, this.y - oy, this.item.emoji || '📦', frame, this.item.id);
    }
  }
}
