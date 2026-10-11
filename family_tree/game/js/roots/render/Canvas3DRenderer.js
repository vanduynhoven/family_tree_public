// ═══════════════════════════════════════════════════════════
//  Canvas3DRenderer - a three.js renderer behind the same interface as Canvas2DRenderer (G1)
//
//  Select it with ?renderer=3d (Game.js picks it in its constructor; the default stays Canvas2DRenderer).
//  It draws the SAME game state the 2D renderer draws, from the same `view` object:
//
//    width, height                      the drawing surface in CSS pixels (the engine's size)
//    flash(color)                       a full-screen colour that fades out (era travel)
//    drawFrame(view)                    terrain from world.map, props, water, buildings, portals, drops, NPCs,
//                                       enemies, livestock, the player (placeholder figures with name sprites),
//                                       fishing bobber, click-target ring, onboarding arrow, minimap
//    drawTransition(world, tr, tod, f)  the slide between two screens (goes away with G2)
//    screenToWorld(clientX, clientY)    NEW, 3D only: where on the ground (world pixels) a pointer is, or the
//                                       entity under it. This is what Game.js click handlers need (see docs).
//    worldToScreen(wx, wy, wz)          the opposite, for DOM overlays and tests
//    getStats()                         draw calls, triangles, ... of the last frame
//
//  Camera contract: view.camera.x/y is the top-left WORLD PIXEL of the visible area, as in 2D. The 3D camera
//  looks at the centre of that rectangle from the south at a 52 degree pitch and is placed so the ground
//  width at the centre equals the 2D width (1 tile = TILE pixels there); the tilt shows a bit more ground at
//  the top and a bit less at the bottom. Nothing in here depends on SCREEN_COLS/ROWS: the grid is read from
//  world.map itself.
//
//  WebGL and a 2D context cannot share a canvas element, so this renderer inserts its OWN canvas right after
//  the engine's canvas, hides the 2D one (visibility:hidden, so its layout rect stays valid) and keeps the
//  HUD (z-index 10) above both. Pointer events on the 3D canvas are forwarded to the 2D canvas' handlers with
//  the pointer already converted to the world position the 2D handlers expect (opts.pointerShim, see below),
//  so the unmodified Game.js click handlers work until they call screenToWorld themselves.
// ═══════════════════════════════════════════════════════════
import * as THREE from '../../../vendor/three/three.module.min.js';
import { TILE } from '../Renderer.js';
import { Canvas2DRenderer } from './Canvas2DRenderer.js';
import { eraStyle, lightingFor } from './EraStyle3D.js';
import { TerrainSet } from './Terrain3D.js';
import { EntityLayer } from './Entities3D.js';
import { LabelPool } from './Labels3D.js';
import { Markers } from './Markers3D.js';

const PITCH = 52 * Math.PI / 180;
const TIERS = ['low', 'medium', 'high'];

export class Canvas3DRenderer {
  /**
   * @param engine  provides canvas, width, height, cameraX/cameraY
   * @param ui      draws the minimap (a UI widget)
   * @param opts    { tier, getEra: () => eraId, pointerShim: true }
   */
  constructor(engine, ui, opts = {}) {
    this.engine = engine;
    this.ui = ui;
    this.getEra = opts.getEra || null;
    const qs = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
    const asked = opts.tier || qs.get('tier');
    this.tierFixed = TIERS.includes(asked);
    this.tier = this.tierFixed ? asked : 'medium';
    this.pointerShim = opts.pointerShim !== false;
    this.zoom = Number(qs.get('zoom')) > 0 ? Number(qs.get('zoom')) : 1;
    this._frames = 0; this._lastMs = 0; this._slow = 0;
    this._reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._prepMs = 0; this._submitMs = 0;
    this._errors = 0; this._degraded = false; this._lost = false;
    this._w = 0; this._h = 0; this._dpr = 0;
    this._lastEra = 0;
    this._transSets = new Map();

    // ── the canvas ──
    const base = engine.canvas;
    const cv = document.createElement('canvas');
    cv.id = 'rt-canvas-3d';
    Object.assign(cv.style, { position: 'fixed', left: '0', top: '0', width: '100%', height: '100%', display: 'block', zIndex: '1', cursor: 'crosshair', touchAction: 'none' });
    base.parentNode.insertBefore(cv, base.nextSibling);
    this.canvas = cv;
    try {
      this.gl = new THREE.WebGLRenderer({ canvas: cv, antialias: this.tier !== 'low', powerPreference: 'high-performance', alpha: false });
    } catch (e) {
      cv.remove();
      throw e;                                           // Game.js keeps the 2D renderer
    }
    this.base = base;
    this._baseVisibility = base.style.visibility;
    base.style.visibility = 'hidden';
    this.gl.setClearColor(0x101820, 1);
    this.gl.shadowMap.enabled = this.tier !== 'low';

    // ── scene ──
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x9ab8d0, 40, 120);
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.5, 400);
    this._skyCanvas = document.createElement('canvas'); this._skyCanvas.width = 2; this._skyCanvas.height = 128;
    this._skyTex = new THREE.CanvasTexture(this._skyCanvas); this._skyTex.colorSpace = THREE.SRGBColorSpace;
    this.scene.background = this._skyTex;
    this._skyKey = '';

    this.ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.4);
    this.sun = new THREE.DirectionalLight(0xffffff, 2);
    this.sun.target = new THREE.Object3D();
    this.scene.add(this.ambient, this.hemi, this.sun, this.sun.target);
    this._shadowSize = this.tier === 'high' ? 2048 : 1024;
    if (this.tier !== 'low') {
      this.sun.castShadow = true;
      this.sun.shadow.mapSize.set(this._shadowSize, this._shadowSize);
      this.sun.shadow.bias = -0.0006; this.sun.shadow.normalBias = 0.03;
      this.sun.shadow.camera.near = 1; this.sun.shadow.camera.far = 220;
    }
    this._half = 0;
    this._L = {};

    const shadows = this.tier !== 'low';
    this.terrain = new TerrainSet({ shadows, low: this.tier === 'low' });
    this.scene.add(this.terrain.group);
    this.entityGroup = new THREE.Group(); this.entityGroup.name = 'entities';
    this.scene.add(this.entityGroup);
    this.labels = new LabelPool(this.entityGroup);
    this.entities = new EntityLayer(this.entityGroup, this.labels, { shadows });
    this.markers = new Markers(this.entityGroup);

    // ── DOM helpers: flash overlay + minimap strip ──
    this._flashEl = document.createElement('div');
    Object.assign(this._flashEl.style, { position: 'fixed', inset: '0', zIndex: '2', pointerEvents: 'none', opacity: '0', background: '#fff' });
    base.parentNode.insertBefore(this._flashEl, cv.nextSibling);
    this._mini = document.createElement('canvas');
    this._mini.width = 64; this._mini.height = 60;
    // _mini is kept for compatibility (dispose() removes it) but hidden: the DOM #rt-minimap canvas is the G5 minimap.
    Object.assign(this._mini.style, { display: 'none', position: 'fixed', right: '0', top: '0', width: '64px', height: '60px', zIndex: '3', pointerEvents: 'none', imageRendering: 'auto' });
    base.parentNode.insertBefore(this._mini, cv.nextSibling);

    this._ray = new THREE.Raycaster(); this._ndc = new THREE.Vector2(); this._pt = new THREE.Vector3();
    this._plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this._rect = { x0: 0, z0: 0, x1: 20, z1: 14 };
    this._target = new THREE.Vector3();

    // ── Era 4 ship: ocean surroundings + funnels + gentle rocking ──
    this._shipGroup = null;   // THREE.Group added to scene when era === 4, removed otherwise
    this._shipEraBuilt = -1; // which era the ship group was built for

    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); this._lost = true; });
    cv.addEventListener('webglcontextrestored', () => { this._lost = false; this.terrain.mapRef = null; });
    if (this.pointerShim) this._bindPointerShim();
    this._resize();
  }

  get width() { return this.engine.width; }
  get height() { return this.engine.height; }

  // ═══ interface ═══════════════════════════════════════════
  flash(color) {
    if (this._degraded) return this._fb().flash(color);
    const el = this._flashEl;
    el.style.transition = 'none';
    el.style.background = color;
    el.style.opacity = '1';
    void el.offsetWidth;                                  // restart the transition
    el.style.transition = 'opacity 0.5s ease-out 0.15s';
    el.style.opacity = '0';
  }

  drawFrame(view) {
    if (this._degraded) return this._fb().drawFrame(view);
    if (this._lost) return;
    try {
      this._draw(view);
      this._errors = 0;
    } catch (e) {
      this._errors++;
      console.error('[roots 3d] frame failed:', e);
      if (this._errors >= 5) this._degrade(view);
    }
  }

  drawTransition(world, tr, timeOfDay, frame) {
    if (this._degraded) return this._fb().drawTransition(world, tr, timeOfDay, frame);
    if (this._lost) return;
    try { this._drawTransition(world, tr, timeOfDay, frame); } catch (e) { console.error('[roots 3d] transition failed:', e); }
  }

  /**
   * Where is a pointer on the ground? Casts a ray through the pointer.
   * @returns {{x:number, y:number, entity:(Object|null)}} world pixels; when the ray hits a person, enemy,
   *   animal or pick-up it returns that entity's centre (so the distance tests of the 2D click handlers
   *   succeed) and the entity itself. Null when the ray misses the ground plane.
   */
  screenToWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    this._ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this._ray.setFromCamera(this._ndc, this.camera);
    const hit = this.entities.pick(this._ray.ray);
    if (hit) return { x: hit.entity.cx, y: hit.entity.cy, entity: hit.entity };
    if (!this._ray.ray.intersectPlane(this._plane, this._pt)) return null;
    return { x: this._pt.x * TILE, y: this._pt.z * TILE, entity: null };
  }

  /** Client (viewport) coordinates of a world point (world pixels, optional height in tiles). */
  worldToScreen(wx, wy, wz = 0) {
    const rect = this.canvas.getBoundingClientRect();
    const v = new THREE.Vector3(wx / TILE, wz, wy / TILE).project(this.camera);
    return { x: rect.left + (v.x * 0.5 + 0.5) * rect.width, y: rect.top + (-v.y * 0.5 + 0.5) * rect.height, visible: v.z < 1 && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 };
  }

  getStats() {
    const i = this.gl.info;
    return {
      drawCalls: i.render.calls, triangles: i.render.triangles, geometries: i.memory.geometries, textures: i.memory.textures,
      programs: i.programs ? i.programs.length : 0, tier: this.tier, pixelRatio: this._dpr, canvas: [this.canvas.width, this.canvas.height],
      terrainTriangles: this.terrain.stats.triangles, terrainChunks: this.terrain.stats.chunks, propInstances: this.terrain.stats.instances,
      terrainBuildMs: Math.round(this.terrain.stats.buildMs * 10) / 10, figures: this.entities.stats.figures, labels: this.entities.stats.labels,
      shadows: this.gl.shadowMap.enabled, degraded: this._degraded,
      prepMs: Math.round(this._prepMs * 100) / 100, submitMs: Math.round(this._submitMs * 100) / 100,
      drawnInstances: this.terrain.stats.drawnInstances || 0,
    };
  }

  dispose() {
    this.canvas.remove(); this._flashEl.remove(); this._mini.remove();
    this.base.style.visibility = this._baseVisibility;
    if (this._shipGroup) { this.scene.remove(this._shipGroup); this._disposeObj(this._shipGroup); this._shipGroup = null; }
    this.terrain.dispose(); this.entities.dispose(); this.labels.dispose(); this.markers.dispose();
    for (const s of this._transSets.values()) s.dispose();
    this.gl.dispose();
  }

  // ═══ one frame ═══════════════════════════════════════════
  _draw(view) {
    const t0 = performance.now();
    const { world, timeOfDay } = view;
    const frame = this._reduceMotion ? 0 : view.frame;          // prefers-reduced-motion: water, sway and glows stand still
    this._checkSize();
    const eraId = this._era(view);
    const map = world.map;
    if (!map || !map.length) return;
    this._disposeTransition();

    this.terrain.sync(map, eraId);
    this._syncShip(eraId, map);
    const style = eraStyle(eraId);
    const L = lightingFor(style, timeOfDay, this._L);
    this._placeCamera(view.camera);
    this._applyLighting(L, style, timeOfDay);
    this.terrain.uniforms.uNight.value = L.night;
    this.terrain.group.visible = true; this.entityGroup.visible = true;
    this.terrain.update(frame, this._rect);
    if (eraId === 4 && !this._reduceMotion) this._updateShipRock(frame);
    // G3: inject eraId into view so EntityLayer can derive appearance
    const viewWithEra = view.eraId == null ? Object.assign(Object.create(view), { eraId }) : view;
    this.entities.update(viewWithEra, this.terrain, this._rect);
    this.markers.update(view, this.terrain);
    const t1 = performance.now();
    this._render();
    const t2 = performance.now();
    this._prepMs += (t1 - t0 - this._prepMs) * 0.1; this._submitMs += (t2 - t1 - this._submitMs) * 0.1;
    if (view.frame % 6 === 0) this._drawMinimap(world);
    this._autoTier();
  }

  // ── Era 4: ship-specific geometry (ocean plane + funnels) and rocking ──────

  _syncShip(eraId, map) {
    if (eraId !== 4) {
      // Remove ship group when leaving Era 4
      if (this._shipGroup) { this.scene.remove(this._shipGroup); this._disposeObj(this._shipGroup); this._shipGroup = null; this._shipEraBuilt = -1; }
      // Also reset any rocking on the terrain group
      this.terrain.group.rotation.x = 0;
      return;
    }
    if (this._shipEraBuilt === 4) return;  // already built

    const shadows = this.tier !== 'low';
    const segs = this.tier === 'low' ? 12 : 24;
    const cols = map[0].length, rows = map.length;  // 80×56 tiles
    const g = new THREE.Group(); g.name = 'ship-era';

    // ── Ocean plane extending 40 tiles beyond the map on all sides ──
    const ext = 40;
    const W = cols + 2 * ext, D = rows + 2 * ext;
    const oceanGeo = new THREE.PlaneGeometry(W, D);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.MeshLambertMaterial({ color: 0x1a3a5c });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.position.set(cols / 2, -0.05, rows / 2);  // slightly below ground to avoid z-fight
    ocean.receiveShadow = shadows;
    ocean.name = 'ship-ocean';
    g.add(ocean);

    // ── Two Cunard funnels aft of mid-ship (~col 20, rows 22 and 34) ──
    const FUNNEL_H = 8.0, R_BOT = 1.5, R_TOP = 1.2, BAND_Y = 5.5, BAND_H = 1.5;
    const funnelPositions = [
      { x: 20, z: 22 },
      { x: 20, z: 34 },
    ];
    const blackMat  = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });
    const goldMat   = new THREE.MeshLambertMaterial({ color: 0xd4a850 });
    const redMat    = new THREE.MeshLambertMaterial({ color: 0x9a2828 });

    for (const { x, z } of funnelPositions) {
      const base = new THREE.Group();
      base.position.set(x, 0, z);

      // Main funnel body (black)
      const bodyGeo = new THREE.CylinderGeometry(R_TOP, R_BOT, FUNNEL_H, segs);
      const body = new THREE.Mesh(bodyGeo, blackMat);
      body.position.y = FUNNEL_H / 2;
      body.castShadow = shadows;
      base.add(body);

      // Gold band
      const goldGeo = new THREE.CylinderGeometry(R_TOP + 0.05, R_TOP + 0.05, BAND_H, segs);
      const gold = new THREE.Mesh(goldGeo, goldMat);
      gold.position.y = BAND_Y + BAND_H / 2;
      base.add(gold);

      // Red band below gold
      const redGeo = new THREE.CylinderGeometry(R_TOP + 0.05, R_TOP + 0.05, BAND_H, segs);
      const red = new THREE.Mesh(redGeo, redMat);
      red.position.y = BAND_Y - BAND_H / 2;
      base.add(red);

      g.add(base);
    }

    this.scene.add(g);
    this._shipGroup = g;
    this._shipEraBuilt = 4;
  }

  _updateShipRock(frame) {
    // Gentle ±0.5° roll at 4-second period (60fps assumed; frame increments by 1 per requestAnimationFrame)
    const PERIOD_FRAMES = 240;  // 4s × 60fps
    const AMP = 0.5 * Math.PI / 180;  // 0.5° in radians
    const angle = AMP * Math.sin((frame % PERIOD_FRAMES) / PERIOD_FRAMES * 2 * Math.PI);
    this.terrain.group.rotation.x = angle;
    if (this._shipGroup) this._shipGroup.rotation.x = angle;
  }

  _disposeObj(obj) {
    obj.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) { if (Array.isArray(o.material)) o.material.forEach(m => m.dispose()); else o.material.dispose(); }
    });
  }

  _era(view) {
    const e = view.eraId ?? (this.getEra ? this.getEra() : this._lastEra);
    this._lastEra = Number.isFinite(e) ? e : 0;
    return this._lastEra;
  }

  _render() { this.gl.render(this.scene, this.camera); }

  _checkSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, this.tier === 'low' ? 1 : this.tier === 'medium' ? 1.5 : 2);
    if (this.engine.width !== this._w || this.engine.height !== this._h || dpr !== this._dpr) this._resize();
  }

  _resize() {
    const w = Math.max(1, this.engine.width || window.innerWidth), h = Math.max(1, this.engine.height || window.innerHeight);
    this._w = w; this._h = h;
    this._dpr = Math.min(window.devicePixelRatio || 1, this.tier === 'low' ? 1 : this.tier === 'medium' ? 1.5 : 2);
    this.gl.setPixelRatio(this._dpr);
    this.gl.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Look at the middle of the rectangle view.camera describes, from the south, tilted. */
  _placeCamera(cam, fixedCenter = null) {
    const W = this._w, H = this._h;
    const cx = (cam.x + W / 2) / TILE, cz = (cam.y + H / 2) / TILE;
    const fov = (W / H) < 0.8 ? 40 : 30;
    if (this.camera.fov !== fov) { this.camera.fov = fov; this.camera.updateProjectionMatrix(); }
    const d = (H / TILE) / (2 * Math.tan(fov * Math.PI / 360)) * this.zoom;
    this._dist = d;
    const y = 0;
    this._target.set(cx, y, cz);
    this.camera.position.set(cx, y + Math.sin(PITCH) * d, cz + Math.cos(PITCH) * d);
    this.camera.near = Math.max(0.5, d * 0.1);
    this.camera.far = d * 9 + 120;
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this._target);
    this.camera.updateMatrixWorld();
    this._footprint();
  }

  /** The ground rectangle (tile units) the camera sees, used to choose chunks, instances and shadow bounds. */
  _footprint() {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const [nx, ny] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      this._ndc.set(nx, ny);
      this._ray.setFromCamera(this._ndc, this.camera);
      if (this._ray.ray.intersectPlane(this._plane, this._pt)) {
        x0 = Math.min(x0, this._pt.x); x1 = Math.max(x1, this._pt.x); z0 = Math.min(z0, this._pt.z); z1 = Math.max(z1, this._pt.z);
      }
    }
    if (!isFinite(x0)) { x0 = this._target.x - 20; x1 = this._target.x + 20; z0 = this._target.z - 14; z1 = this._target.z + 14; }
    const r = this._rect;
    r.x0 = x0 - 1; r.x1 = x1 + 1; r.z0 = z0 - 1; r.z1 = z1 + 1;
  }

  _applyLighting(L, style, tod) {
    this.ambient.color.copy(L.ambient); this.ambient.intensity = L.ambI;
    this.hemi.color.copy(L.hemSky); this.hemi.groundColor.copy(L.hemGround); this.hemi.intensity = L.hemI;
    // one directional light: the sun by day, the moon by night
    const a = L.sunAngle, c = Math.max(0, Math.min(1, a));
    const up = 0.45 + Math.sin(Math.PI * c) * 0.75;
    const dayX = (1 - 2 * c) * 0.8 - 0.12, dayY = up, dayZ = 0.62;
    const k = L.sunUp;
    let dx = -0.35 + (dayX + 0.35) * k, dy = 0.9 + (dayY - 0.9) * k, dz = 0.5 + (dayZ - 0.5) * k;
    const len = Math.hypot(dx, dy, dz); dx /= len; dy /= len; dz /= len;
    const half = Math.max(this._rect.x1 - this._rect.x0, this._rect.z1 - this._rect.z0) * 0.5 + 3;
    const texel = (half * 2) / this._shadowSize;
    const tx = Math.round(this._target.x / texel) * texel, tz = Math.round(this._target.z / texel) * texel;
    this.sun.position.set(tx + dx * 70, dy * 70, tz + dz * 70);
    this.sun.target.position.set(tx, 0, tz);
    this.sun.color.copy(L.lightColor);
    this.sun.intensity = L.lightI;
    if (this.sun.castShadow && Math.abs(half - this._half) > 0.5) {
      const sc = this.sun.shadow.camera; sc.left = -half; sc.right = half; sc.top = half; sc.bottom = -half;
      sc.updateProjectionMatrix(); this._half = half;
    }
    // fog and sky follow the era and the hour
    this.scene.fog.color.copy(L.fog);
    this.scene.fog.near = this._dist * 1.6; this.scene.fog.far = this._dist * 3.6 + 40;
    const key = L.skyTop.getHexString() + L.skyHorizon.getHexString();
    if (key !== this._skyKey) {
      this._skyKey = key;
      const g = this._skyCanvas.getContext('2d'), grad = g.createLinearGradient(0, 0, 0, 128);
      grad.addColorStop(0, '#' + L.skyTop.getHexString()); grad.addColorStop(1, '#' + L.skyHorizon.getHexString());
      g.fillStyle = grad; g.fillRect(0, 0, 2, 128);
      this._skyTex.needsUpdate = true;
    }
  }

  _drawMinimap(world) {
    try {
      const g = this._mini.getContext('2d');
      g.clearRect(0, 0, 64, 60);
      this.ui.drawMinimap(g, world, 64);
    } catch (e) { /* the minimap is optional */ }
  }

  /** Without a fixed ?tier=, drop the shadows once when frames are slow. */
  _autoTier() {
    if (this.tierFixed || this.tier === 'low') return;
    const now = performance.now();
    if (this._lastMs) {
      this._frames++;
      if (this._frames > 40) {
        if (now - this._lastMs > 42) this._slow++; else this._slow = Math.max(0, this._slow - 1);
        if (this._slow > 25) this._setTier('low');
      }
    }
    this._lastMs = now;
  }

  _setTier(t) {
    this.tier = t;
    this.gl.shadowMap.enabled = t !== 'low';
    this.sun.castShadow = t !== 'low';
    this._resize();
    this._slow = 0;
  }

  // ═══ slide between two screens (goes away with G2) ═══════
  _drawTransition(world, tr, timeOfDay, frame) {
    this._checkSize();
    const eraId = this._era({});
    const p = tr.progress, ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
    const W = this._w, H = this._h;
    let dx = 0, dy = 0;
    if (tr.dir === 'right') dx = -1; if (tr.dir === 'left') dx = 1;
    if (tr.dir === 'down') dy = -1; if (tr.dir === 'up') dy = 1;
    const fromMap = world.screens?.[tr.fromR]?.[tr.fromC]?.map;
    const toMap = world.screens?.[tr.toR]?.[tr.toC]?.map;
    const style = eraStyle(eraId);
    const L = lightingFor(style, timeOfDay, this._L);
    this._placeCamera({ x: 0, y: 0 });
    this._applyLighting(L, style, timeOfDay);
    this.terrain.uniforms.uNight.value = L.night;
    this.terrain.group.visible = false; this.entityGroup.visible = false;
    const sets = [];
    [[fromMap, dx * (W / TILE) * ease, dy * (H / TILE) * ease], [toMap, dx * (W / TILE) * (ease - 1), dy * (H / TILE) * (ease - 1)]].forEach(([map, ox, oz], i) => {
      if (!map) return;
      let s = this._transSets.get(map);
      if (!s) {
        s = new TerrainSet({ shadows: this.tier !== 'low', low: this.tier === 'low', uniforms: this.terrain.uniforms });
        s.rebuild(map, eraId);
        this.scene.add(s.group);
        this._transSets.set(map, s);
      }
      s.group.visible = true;
      s.group.position.set(ox, 0, oz);
      s.update(frame, { x0: -1e3, z0: -1e3, x1: 1e3, z1: 1e3 });
      sets.push(s);
    });
    for (const s of this._transSets.values()) if (!sets.includes(s)) s.group.visible = false;
    this._render();
  }

  _disposeTransition() {
    if (!this._transSets.size) return;
    for (const s of this._transSets.values()) { this.scene.remove(s.group); s.dispose(); }
    this._transSets.clear();
  }

  // ═══ pointer bridge for the unmodified Game.js handlers ══
  _bindPointerShim() {
    const base = this.base, cv = this.canvas;
    const forward = type => ev => {
      const w = this.screenToWorld(ev.clientX, ev.clientY);
      if (!w && type !== 'mouseleave') return;
      // The 2D handlers compute  world = (clientX - rect.left) + engine.cameraX.  Give them a rect for which that
      // is the position we found; the real clientX/clientY still travel in the event (tooltips use them).
      const had = Object.prototype.hasOwnProperty.call(base, 'getBoundingClientRect');
      const orig = base.getBoundingClientRect;
      const left = w ? ev.clientX - (w.x - this.engine.cameraX) : 0, top = w ? ev.clientY - (w.y - this.engine.cameraY) : 0;
      base.getBoundingClientRect = () => new DOMRect(left, top, this._w, this._h);
      try {
        base.dispatchEvent(new MouseEvent(type, { clientX: ev.clientX, clientY: ev.clientY, button: ev.button, buttons: ev.buttons, bubbles: false, cancelable: true }));
      } finally {
        if (had) base.getBoundingClientRect = orig; else delete base.getBoundingClientRect;
      }
    };
    cv.addEventListener('click', forward('click'));
    cv.addEventListener('mousemove', forward('mousemove'));
    cv.addEventListener('mouseleave', forward('mouseleave'));
  }

  // ═══ safety net ═══════════════════════════════════════════
  _fb() {
    if (!this._fallback) this._fallback = new Canvas2DRenderer(this.engine, this.ui);
    return this._fallback;
  }

  /** The 3D path keeps failing: give the player the 2D game back instead of a frozen picture. */
  _degrade(view) {
    console.error('[roots 3d] giving up, back to the 2D renderer');
    this._degraded = true;
    this.canvas.style.display = 'none'; this._mini.style.display = 'none';
    this.base.style.visibility = this._baseVisibility;
    this._fb().drawFrame(view);
  }
}
