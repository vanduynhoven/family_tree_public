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
      // Farm animals / decor: solid, clearly visible emoji on a light circle
      const s = TILE * 0.9;
      const x = this.x - ox, y = this.y - oy;
      const cx = x + s / 2, cy = y + s / 2;
      const bob = Math.sin(frame / 55) * 2;  // gentle idle sway

      // Bright circle background so the animal pops against any terrain
      ctx.save();
      ctx.globalAlpha = 0.88;
      ctx.fillStyle = '#fffde8';
      ctx.beginPath(); ctx.ellipse(cx, cy + bob, s * 0.44, s * 0.38, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1.0;

      // Drop shadow below
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath(); ctx.ellipse(cx, y + s - 2, s * 0.3, s * 0.09, 0, 0, Math.PI * 2); ctx.fill();

      // Emoji — full size, no alpha reduction
      ctx.font = `${Math.floor(s * 0.72)}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(this.item.emoji || '🐄', cx, cy + bob - 1);
      ctx.restore();
      ctx.textBaseline = 'alphabetic';
    } else {
      drawDroppedItem(ctx, this.x - ox, this.y - oy, this.item.emoji || '📦', frame, this.item.id);
    }
  }
}
