// ═══════════════════════════════════════════════════════════
//  Canvas2DRenderer - the original top-down 2D look, behind the renderer interface (G1)
//
//  The game (Game.js) decides WHAT is on screen; a renderer decides how it looks. Game never touches a
//  canvas context any more, it hands a renderer plain data once per frame. A 3D renderer (three.js)
//  implements the same three members, so the two can be swapped (and compared pixel for pixel while the
//  2D one is the reference: scripts/render_parity.js).
//
//  The interface (all positions are WORLD pixels, the renderer subtracts the camera itself):
//
//    width, height                      size of the drawing surface in CSS pixels
//    flash(color)                       cover the whole surface (era-travel flash)
//    drawFrame(view)                    one frame of play. view = {
//        world,                         the World: world.map is the WHOLE era map (rows of tile ids, size =
//                                       map.length x map[0].length, also world.cols / world.rows), plus
//                                       activeDrops, activeNPCs, activeEnemies, activeLivestock
//        player,                        the Player entity
//        camera: { x, y },              integer world pixel of the top-left corner of the view, already
//                                       followed and clamped to the map by Engine.updateCamera
//        timeOfDay, frame,              0..1 and a running frame counter
//        guide: { x, y } | null,        world point to point the onboarding arrow at (null = no arrow)
//        clickTarget: { tx, ty } | null world point the player is walking to
//      }
//
//  (G2 removed drawTransition: the screens are one scrolling map, there is no slide between them.)
//  Entities still carry their own draw(ctx, ox, oy, frame) for now; the 3D renderer replaces them by
//  meshes keyed by entity (G3). The HUD, dialogs and the minimap stay DOM/UI code.
// ═══════════════════════════════════════════════════════════
import { TILE, drawSky, drawTiles, drawBobber } from '../Renderer.js';

export class Canvas2DRenderer {
  /** @param engine  provides ctx, width, height  @param ui  draws the minimap (a UI widget) */
  constructor(engine, ui) {
    this.engine = engine;
    this.ui = ui;
  }

  get width()  { return this.engine.width; }
  get height() { return this.engine.height; }

  flash(color) {
    const ctx = this.engine.ctx;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, this.engine.width, this.engine.height);
  }

  drawFrame(view) {
    const ctx = this.engine.ctx;
    const W = this.engine.width, H = this.engine.height;
    const { world, player, frame, timeOfDay } = view;
    const ox = view.camera.x, oy = view.camera.y;

    drawSky(ctx, W, H, frame, timeOfDay);
    drawTiles(ctx, world.map, world.map.length, world.map[0]?.length ?? 0, ox, oy, W, H);

    // Drops
    for (const d of world.activeDrops) d.draw(ctx, ox, oy, frame);

    // Entities sorted by Y (depth sort)
    const entities = [...world.activeNPCs, ...world.activeEnemies, ...world.activeLivestock, player];
    entities.sort((a, b) => a.cy - b.cy);
    for (const e of entities) e.draw(ctx, ox, oy, frame);

    if (view.guide) this._drawGuideArrow(ctx, player, view.guide, ox, oy, frame);

    // Fishing bobber
    if (player.fishTimer > 0) this._drawBobber(ctx, player, ox, oy, frame);

    // Click target cursor
    if (view.clickTarget) this._drawClickTarget(ctx, view.clickTarget, ox, oy);
  }

  /** The onboarding arrow: points from the player towards the nearest person. */
  _drawGuideArrow(ctx, player, guide, ox, oy, frame) {
    const px = player.cx - ox, py = player.cy - oy;
    const nx = guide.x - ox,   ny = guide.y - oy;
    const ang = Math.atan2(ny - py, nx - px);
    const pulse = 0.7 + Math.sin(frame / 10) * 0.3;
    const r = 38;  // radius from player centre
    const ax = px + Math.cos(ang) * r;
    const ay = py + Math.sin(ang) * r;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.translate(ax, ay);
    ctx.rotate(ang);
    ctx.fillStyle = '#f0e040';
    ctx.strokeStyle = '#806010';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(14, 0); ctx.lineTo(-6, -8); ctx.lineTo(-6, 8); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  _drawBobber(ctx, player, ox, oy, frame) {
    // Player hand position (rod tip) from the sprite position and facing
    const renderW = TILE * 0.95;
    const renderH = TILE * 1.1;
    const rx = player.x - ox + (TILE - renderW) / 2;
    const ry = player.y - oy + TILE - renderH;
    let handSX, handSY;
    switch (player.facing) {
      case 'right': handSX = rx + renderW * 0.85; handSY = ry + renderH * 0.38; break;
      case 'left':  handSX = rx - renderW * 0.05; handSY = ry + renderH * 0.38; break;
      case 'down':  handSX = rx + renderW * 0.75; handSY = ry + renderH * 0.50; break;
      default:      handSX = rx + renderW * 0.20; handSY = ry + renderH * 0.30; break; // up
    }
    drawBobber(ctx,
      player.bobberX - ox, player.bobberY - oy,
      player.fishDipped, frame,
      handSX, handSY);
  }

  _drawClickTarget(ctx, target, ox, oy) {
    const sx = target.tx - ox;
    const sy = target.ty - oy;
    const r  = TILE * 0.28;
    ctx.strokeStyle = 'rgba(255,255,120,0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    // Cross-hair lines
    ctx.beginPath(); ctx.moveTo(sx - r*1.3, sy); ctx.lineTo(sx - r*0.5, sy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx + r*0.5, sy); ctx.lineTo(sx + r*1.3, sy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx, sy - r*1.3); ctx.lineTo(sx, sy - r*0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx, sy + r*0.5); ctx.lineTo(sx, sy + r*1.3); ctx.stroke();
  }
}
