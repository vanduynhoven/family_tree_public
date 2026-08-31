// ═══════════════════════════════════════════════════════════
//  DroppedItem — collectible sparkle item on the ground
// ═══════════════════════════════════════════════════════════
import { Entity } from './Entity.js';
import { TILE, drawDroppedItem } from './Renderer.js';

export class DroppedItem extends Entity {
  constructor(item, x, y, despawnSecs = -1) {
    super(x, y, TILE * 0.5, TILE * 0.5);
    this.item    = item;          // { id, label, emoji, ... }
    this.despawn = despawnSecs;   // -1 = permanent
  }

  update(dt) {
    if (this.despawn > 0) {
      this.despawn -= dt;
      if (this.despawn <= 0) this.alive = false;
    }
  }

  draw(ctx, ox, oy, frame) {
    drawDroppedItem(ctx, this.x - ox, this.y - oy, this.item.emoji || '📦', frame, this.item.id);
  }
}
