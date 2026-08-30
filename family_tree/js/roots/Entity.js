// ═══════════════════════════════════════════════════════════
//  Entity — base class for all game objects
//  Provides: position, velocity, AABB, draw interface
// ═══════════════════════════════════════════════════════════
import { TILE } from './Renderer.js';

export class Entity {
  constructor(x, y, w = TILE * 0.6, h = TILE * 0.75) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx     = 0;
    this.vy     = 0;
    this.facing = 'down'; // 'up' | 'down' | 'left' | 'right'
    this.alive  = true;
  }

  /** Centre X / Centre Y */
  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  /** Axis-aligned bounding box */
  get rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  overlaps(other) {
    return this.x < other.x + other.w && this.x + this.w > other.x &&
           this.y < other.y + other.h && this.y + this.h > other.y;
  }

  distTo(other) {
    return Math.hypot(this.cx - other.cx, this.cy - other.cy);
  }

  /** Face toward another entity */
  faceToward(other) {
    const dx = other.cx - this.cx;
    const dy = other.cy - this.cy;
    if (Math.abs(dx) > Math.abs(dy)) {
      this.facing = dx > 0 ? 'right' : 'left';
    } else {
      this.facing = dy > 0 ? 'down' : 'up';
    }
  }

  // Subclasses implement these
  update(dt, world, game) {}
  draw(ctx, ox, oy, frame)  {}
}
