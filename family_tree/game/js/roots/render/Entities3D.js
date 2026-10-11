// ═══════════════════════════════════════════════════════════
//  Entities3D - the game's people, enemies, animals and pick-ups as low-poly figures (G1/G3/G4)
//
//  Every Entity of the world (player, NPC, Enemy, Livestock, DroppedItem) gets drawn here, keyed by the entity
//  object, from the same fields the 2D draw() uses (x, y, facing, bodyColor/skinColor/hairColor, color/accent,
//  fishTimer ...). Non-person entities (enemies, animals, pick-ups) are instanced: ONE draw call per body part.
//
//  G3 CHARACTERS: People (NPCs and player) now use CharacterMesh.js, which builds a ~204-triangle low-poly
//  figure per (tier×sex×skin×hair×outfit×era) combination. Appearance is derived from the GEDCOM id by
//  AppearanceLookup.js. Each unique character variant is cached as a THREE.Group and positioned each frame.
//
//  G4 WALK CYCLE: CharacterMesh now returns separate arm and leg pivot Object3Ds (group.userData.pivots).
//  _person() rotates them each frame: walking = ±25° arm swing / ±20° leg swing opposite phase;
//  idle (amp < 0.05) = gentle ±4° breathing sway on arms, legs at rest.
// ═══════════════════════════════════════════════════════════
import * as THREE from '../../../vendor/three/three.module.min.js';
import { TILE } from '../Renderer.js';
import { MeshBuilder, lin, shade } from './MeshBuilder3D.js';
import { buildCharacter, clearCharacterCache } from './CharacterMesh.js';
import { lookupAppearance } from './AppearanceLookup.js';

export const FIGURE_SCALE = 1.25;                 // people are drawn a little larger than life: the camera looks down at them
const YAW = { down: 0, right: Math.PI / 2, up: Math.PI, left: -Math.PI / 2 };
const W = [1, 1, 1];

const _colorCache = new Map();
const _tc = new THREE.Color();
function rgb(css, fallback = '#808080') {
  let v = _colorCache.get(css);
  if (!v) {
    try { _tc.set(css); } catch (e) { _tc.set(fallback); }
    v = [_tc.r, _tc.g, _tc.b];
    _colorCache.set(css, v);
  }
  return v;
}

// ── shapes (local space: feet at the origin, facing +z) ────
function humanoidShapes() {
  const torso = new MeshBuilder();
  torso.box(-0.2, 0.36, -0.12, 0.2, 0.76, 0.12, W, shade(W, 0.9), shade(W, 0.7));
  torso.box(-0.207, 0.36, -0.127, 0.207, 0.43, 0.127, [0.42, 0.38, 0.34], [0.42, 0.38, 0.34]);     // belt

  const head = new MeshBuilder();
  head.box(-0.15, 0.76, -0.14, 0.15, 1.04, 0.14, W, shade(W, 0.95), shade(W, 0.8));
  const dark = [0.06, 0.05, 0.05];
  head.south(-0.1, -0.04, 0.89, 0.96, 0.142, dark);                                       // eyes
  head.south(0.04, 0.1, 0.89, 0.96, 0.142, dark);
  head.south(-0.04, 0.04, 0.8, 0.83, 0.142, [0.55, 0.38, 0.34]);                          // mouth

  const hair = new MeshBuilder();
  hair.box(-0.168, 0.98, -0.158, 0.168, 1.1, 0.158, W, W, shade(W, 0.8));                  // cap
  hair.box(-0.168, 0.8, -0.168, 0.168, 1.0, -0.1, W, shade(W, 0.9), shade(W, 0.8));        // back
  hair.box(-0.172, 0.88, -0.1, -0.14, 1.0, 0.14, W, shade(W, 0.9));                       // sideburns
  hair.box(0.14, 0.88, -0.1, 0.172, 1.0, 0.14, W, shade(W, 0.9));
  hair.box(-0.168, 0.995, 0.1, 0.168, 1.03, 0.16, W, shade(W, 0.9));                      // fringe

  const arm = new MeshBuilder();                                                          // pivot at the shoulder
  arm.box(-0.05, -0.34, -0.05, 0.05, 0, 0.05, W, shade(W, 0.9), shade(W, 0.7));
  arm.box(-0.052, -0.4, -0.052, 0.052, -0.3, 0.052, [1.35, 1.1, 0.9], [1.2, 1.0, 0.85]);   // hand (skin-ish highlight)

  const leg = new MeshBuilder();                                                          // pivot at the hip
  leg.box(-0.07, -0.36, -0.075, 0.07, 0, 0.075, W, shade(W, 0.9), shade(W, 0.7));
  leg.box(-0.075, -0.36, -0.08, 0.075, -0.27, 0.1, [0.32, 0.27, 0.24], [0.28, 0.24, 0.21]);   // boot
  return { torso, head, hair, arm, leg };
}

function creatureShapes() {
  const body = new MeshBuilder();
  body.ico(0, 0.36, 0, 0.34, 0.3, 0.34, 0.4, shade(W, 0.85), W);
  const horns = new MeshBuilder();
  horns.cone(-0.17, 0.58, 0, 0.07, 0.24, 5, W, W);
  horns.cone(0.17, 0.58, 0, 0.07, 0.24, 5, W, W);
  horns.ico(0, 0.26, 0.2, 0.24, 0.12, 0.14, 0, shade(W, 0.9));                              // snout / belly plate
  const eyes = new MeshBuilder();
  for (const x of [-0.12, 0.12]) {
    eyes.boxC(x, 0.38, 0.27, 0.1, 0.11, 0.05, 0, W, W);
    eyes.boxC(x, 0.4, 0.3, 0.045, 0.06, 0.03, 0, [0.04, 0.04, 0.04], [0.04, 0.04, 0.04]);
  }
  return { body, horns, eyes };
}

function animalShapes() {
  const body = new MeshBuilder();
  body.box(-0.16, 0.3, -0.3, 0.16, 0.6, 0.3, W, shade(W, 0.92), shade(W, 0.7));               // trunk
  body.box(-0.11, 0.42, 0.26, 0.11, 0.7, 0.5, W, shade(W, 0.94), shade(W, 0.8));                // head
  body.box(-0.07, 0.42, 0.5, 0.07, 0.54, 0.56, shade(W, 0.88), shade(W, 0.8));                   // snout
  body.box(-0.15, 0.66, 0.34, -0.1, 0.78, 0.4, shade(W, 0.85), shade(W, 0.75));                  // ears
  body.box(0.1, 0.66, 0.34, 0.15, 0.78, 0.4, shade(W, 0.85), shade(W, 0.75));
  body.box(-0.025, 0.46, -0.36, 0.025, 0.58, -0.3, shade(W, 0.8), shade(W, 0.7));                // tail
  for (const [x, z] of [[-0.11, 0.2], [0.11, 0.2], [-0.11, -0.2], [0.11, -0.2]]) {
    body.box(x - 0.04, 0, z - 0.04, x + 0.04, 0.32, z + 0.04, shade(W, 0.75), shade(W, 0.68), shade(W, 0.5));
  }
  const eyeDark = [0.05, 0.05, 0.05];
  body.south(-0.08, -0.04, 0.58, 0.63, 0.502, eyeDark);
  body.south(0.04, 0.08, 0.58, 0.63, 0.502, eyeDark);
  const patches = new MeshBuilder();
  const d = [0.16, 0.14, 0.13];
  const fan = (pts, y) => {                                  // an irregular spot lying on the back (+y)
    for (let i = 1; i < pts.length - 1; i++) {
      const a = pts[0], b = pts[i], c = pts[i + 1];
      const ny = (b[1] - a[1]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[1] - a[1]);
      if (ny >= 0) patches.tri(a[0], y, a[1], b[0], y, b[1], c[0], y, c[1], d);
      else patches.tri(a[0], y, a[1], c[0], y, c[1], b[0], y, b[1], d);
    }
  };
  fan([[-0.12, -0.2], [0.0, -0.27], [0.13, -0.15], [0.1, 0.0], [-0.04, 0.04], [-0.15, -0.06]], 0.603);
  fan([[0.02, 0.08], [0.14, 0.05], [0.12, 0.2], [-0.05, 0.24], [-0.1, 0.14]], 0.603);
  patches.east(-0.22, -0.06, 0.4, 0.55, 0.163, d);
  patches.west(0.02, 0.18, 0.34, 0.5, -0.163, d);
  patches.east(0.06, 0.2, 0.36, 0.5, 0.163, d);
  return { body, patches };
}

function simpleShapes() {
  const gem = new MeshBuilder();
  gem.octa(0, 0, 0, 0.14, 0.2, 0.14, [0.85, 0.65, 0.15], [1, 0.9, 0.4]);
  return { gem };
}

// ── species table for Livestock (animalId = 'decor_cow' ...) ──
const ANIMALS = {
  decor_cow: { tint: '#f4f4ee', size: 1.0, patches: true },
  decor_pig: { tint: '#f2a4ac', size: 0.78 },
  decor_sheep: { tint: '#efe9da', size: 0.76 },
  decor_chicken: { tint: '#fbfbf6', size: 0.36 },
  decor_goat: { tint: '#cbb898', size: 0.72 },
  decor_horse: { tint: '#8a5a32', size: 1.18 },
};

// ═══════════════════════════════════════════════════════════
class Part {
  constructor(scene, geometry, material, { cap = 32, cast = false, name = 'part' } = {}) {
    this.scene = scene; this.geometry = geometry; this.material = material; this.cast = cast; this.name = name;
    this.cap = cap; this.n = 0;
    this.mesh = this._make(cap);
  }

  _make(cap) {
    const m = new THREE.InstancedMesh(this.geometry, this.material, cap);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3);
    m.instanceColor.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false; m.castShadow = this.cast; m.count = 0; m.name = this.name;
    this.scene.add(m);
    return m;
  }

  reset() { this.n = 0; }

  push(matrix, c) {
    if (this.n >= this.cap) {
      const old = this.mesh, cap = this.cap * 2, m = this._make(cap);
      m.instanceMatrix.array.set(old.instanceMatrix.array); m.instanceColor.array.set(old.instanceColor.array);
      this.scene.remove(old); old.dispose();
      this.mesh = m; this.cap = cap;
    }
    const m = this.mesh;
    matrix.toArray(m.instanceMatrix.array, this.n * 16);
    const a = m.instanceColor.array, o = this.n * 3;
    a[o] = c[0]; a[o + 1] = c[1]; a[o + 2] = c[2];
    this.n++;
  }

  commit() {
    this.mesh.count = this.n;
    this.mesh.instanceMatrix.needsUpdate = true; this.mesh.instanceColor.needsUpdate = true;
  }

  dispose() { this.scene.remove(this.mesh); this.mesh.dispose(); }
}

const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _qx = new THREE.Quaternion();
const _base = new THREE.Matrix4(), _loc = new THREE.Matrix4(), _out = new THREE.Matrix4();
const _axX = new THREE.Vector3(1, 0, 0), _axY = new THREE.Vector3(0, 1, 0), _axZ = new THREE.Vector3(0, 0, 1);

function angleDelta(a, b) { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }

export class EntityLayer {
  /** @param labels LabelPool  @param {{shadows:boolean}} opts */
  constructor(scene, labels, opts = {}) {
    this.scene = scene; this.labels = labels; this.shadows = !!opts.shadows;
    this.recs = new Map();
    /** G3: cache of THREE.Group per (gedcomId|name, eraId) -> group currently in the scene */
    this._charGroups = new Map();   // key: '<cacheKey>|<eraId>' -> THREE.Group
    this._charInUse  = new Set();   // keys seen in the current frame
    this.pickList = [];
    const lam = () => new THREE.MeshLambertMaterial({ vertexColors: true });
    const hs = humanoidShapes(), cs = creatureShapes(), as = animalShapes(), ss = simpleShapes();
    const mat = lam();
    this.mats = [mat];
    const g = b => b.toGeometry(false);
    this.parts = {
      torso: new Part(scene, g(hs.torso), mat, { cast: this.shadows, name: 'fig-torso' }),
      head: new Part(scene, g(hs.head), mat, { cast: this.shadows, name: 'fig-head' }),
      hair: new Part(scene, g(hs.hair), mat, { cast: this.shadows, name: 'fig-hair' }),
      arms: new Part(scene, g(hs.arm), mat, { cap: 64, cast: this.shadows, name: 'fig-arms' }),
      legs: new Part(scene, g(hs.leg), mat, { cap: 64, cast: this.shadows, name: 'fig-legs' }),
      cBody: new Part(scene, g(cs.body), mat, { cast: this.shadows, name: 'enemy-body' }),
      cHorns: new Part(scene, g(cs.horns), mat, { cast: false, name: 'enemy-accent' }),
      cEyes: new Part(scene, g(cs.eyes), mat, { cast: false, name: 'enemy-eyes' }),
      aBody: new Part(scene, g(as.body), mat, { cast: this.shadows, name: 'animal-body' }),
      aPatch: new Part(scene, g(as.patches), mat, { cast: false, name: 'animal-patches' }),
    };
    const gemMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: new THREE.Color(0x6a4a08), emissiveIntensity: 0.9 });
    this.mats.push(gemMat);
    this.parts.gem = new Part(scene, g(ss.gem), gemMat, { cap: 16, name: 'drop-gem' });
    const blobGeo = new THREE.CircleGeometry(0.5, 14); blobGeo.rotateX(-Math.PI / 2);
    const blobMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    this.mats.push(blobMat);
    this.blob = new THREE.InstancedMesh(blobGeo, blobMat, 64);
    this.blob.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.blob.frustumCulled = false; this.blob.renderOrder = 2; this.blob.count = 0; this.blob.name = 'blob-shadows';
    scene.add(this.blob);
    this._blobN = 0;
    this.stats = { figures: 0, labels: 0 };
  }

  _blobAdd(x, y, z, r) {
    if (this._blobN >= this.blob.instanceMatrix.count) {
      const cap = this.blob.instanceMatrix.count * 2, m = new THREE.InstancedMesh(this.blob.geometry, this.blob.material, cap);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; m.renderOrder = 2; m.name = this.blob.name;
      m.instanceMatrix.array.set(this.blob.instanceMatrix.array);
      this.scene.remove(this.blob); this.blob.dispose(); this.blob = m; this.scene.add(m);
    }
    _p.set(x, y + 0.012, z); _q.identity(); _s.set(r * 2, 1, r * 2);
    _out.compose(_p, _q, _s);
    this.blob.setMatrixAt(this._blobN++, _out);
  }

  _record(e, kind, frame) {
    let r = this.recs.get(e);
    if (!r) {
      r = { kind, px: e.x, py: e.y, phase: Math.random() * 6, amp: 0, yaw: YAW[e.facing] ?? 0, seen: frame, moving: false, jump: 0 };
      this.recs.set(e, r);
    }
    r.seen = frame;
    return r;
  }

  /** Move the animation state forward from how far the entity travelled. */
  _motion(r, e, frame, turn = true) {
    const dx = e.x - r.px, dy = e.y - r.py;
    const dist = Math.hypot(dx, dy);
    r.px = e.x; r.py = e.y;
    r.moving = dist > 0.04 && dist < TILE * 2;
    if (r.moving) r.phase += Math.min(dist, 12) / TILE * 7.5;
    r.amp += ((r.moving ? 1 : 0) - r.amp) * 0.3;
    if (turn) {
      const target = YAW[e.facing] ?? r.yaw;
      r.yaw += angleDelta(r.yaw, target) * 0.35;
    }
  }

  /**
   * @param view the renderer-interface view; @param terrain TerrainSet; @param rect visible rectangle in tile units
   */
  update(view, terrain, rect) {
    const { world, player, frame } = view;
    // G3: track eraId for appearance lookup; expire char groups from previous eras
    const eraId = (typeof view.eraId === 'number') ? view.eraId : 0;
    if (eraId !== this._lastEraId) {
      // Remove all cached groups that belong to the old era
      for (const [k, g] of this._charGroups) {
        this.scene.remove(g);
        g.children.forEach(m => { m.geometry?.dispose(); m.material?.dispose(); });
      }
      this._charGroups.clear();
      this._lastEraId = eraId;
    }
    this._charInUse.clear();
    for (const k of Object.keys(this.parts)) this.parts[k].reset();
    this._blobN = 0;
    this.pickList.length = 0;
    this.labels.begin();
    const inView = (x, z, pad = 2) => x > rect.x0 - pad && x < rect.x1 + pad && z > rect.z0 - pad && z < rect.z1 + pad;
    let figures = 0;

    // pick-ups on the ground
    for (const d of world.activeDrops) {
      const x = d.cx / TILE, z = d.cy / TILE;
      if (!inView(x, z)) continue;
      const y = terrain.heightAt(x, z);
      this._drop(d, x, y, z, frame);
      this.pickList.push({ entity: d, x, y, z, r: 0.42, h: 0.9 });
      figures++;
    }

    // livestock
    for (const a of world.activeLivestock) {
      const x = a.cx / TILE, z = (a.y + a.h * 0.9) / TILE;
      if (!inView(x, z)) continue;
      this._animal(a, x, terrain.heightAt(x, z), z, frame);
      this.pickList.push({ entity: a, x, y: terrain.heightAt(x, z), z, r: 0.5, h: 0.9 });
      figures++;
    }

    // enemies
    for (const e of world.activeEnemies) {
      const x = e.cx / TILE, z = (e.y + e.h * 0.92) / TILE;
      if (!inView(x, z)) continue;
      this._enemy(e, x, terrain.heightAt(x, z), z, frame);
      if (e.alive) this.pickList.push({ entity: e, x, y: terrain.heightAt(x, z), z, r: 0.42, h: 0.9 });
      figures++;
    }

    // people
    for (const n of world.activeNPCs) {
      const x = n.cx / TILE, z = (n.y + n.h * 0.92) / TILE;
      if (!inView(x, z)) continue;
      this._person(n, 'npc', x, terrain.heightAt(x, z), z, frame, eraId);
      this.pickList.push({ entity: n, x, y: terrain.heightAt(x, z), z, r: 0.4, h: 1.5 });
      figures++;
    }
    if (player) {
      const x = player.cx / TILE, z = (player.y + player.h * 0.92) / TILE;
      this._person(player, 'player', x, terrain.heightAt(x, z), z, frame, eraId);
      figures++;
    }

    for (const k of Object.keys(this.parts)) this.parts[k].commit();
    this.blob.count = this._blobN; this.blob.instanceMatrix.needsUpdate = true;
    this.labels.end();
    this.stats.figures = figures; this.stats.labels = this.labels.used;

    // G3: remove char groups that were not seen this frame (left viewport)
    for (const [k, g] of this._charGroups) {
      if (!this._charInUse.has(k)) {
        this.scene.remove(g);
        this._charGroups.delete(k);
      }
    }

    // forget entities that left the world
    for (const [e, r] of this.recs) if (r.seen !== frame) this.recs.delete(e);
  }

  // ── people (G3: rigged character meshes keyed by GEDCOM id) ───────────────
  _person(e, kind, x, y, z, frame, eraId = 0) {
    const r = this._record(e, kind, frame);
    this._motion(r, e, frame);
    const s = FIGURE_SCALE;

    const amp = r.amp, ph = r.phase;
    const bob = Math.abs(Math.sin(ph)) * 0.05 * amp + Math.sin(frame * 0.045 + r.px) * 0.008 * (1 - amp);

    // ── Derive appearance from GEDCOM id or name ──
    const gedcomId  = e.gedcomId || '';
    const nameStr   = e.data?.given || (e.name || '').split(' ')[0] || '';
    const sex       = (e.data?.sex || e.sex || 'M').toUpperCase();
    const birthYear = e.data?.birthYear ?? e.birthYear ?? null;
    const eraYear   = (typeof eraId === 'number' && eraId >= 0 && eraId <= 8)
      ? [1539, 1660, 1799, 1872, 1950, 1955, 1984, 2020, 2026][eraId]
      : 1984;

    // Override: use entity colours when set explicitly (maintains backward compat for custom NPCs)
    let skinColorHex  = e.skinColor  || null;
    let hairColorHex  = e.hairColor  || null;
    let outfitColorHex = e.bodyColor || null;

    if (!skinColorHex || !hairColorHex || !outfitColorHex) {
      const app = lookupAppearance({ gedcomId: gedcomId || null, name: nameStr, sex, birthYear, eraYear, eraId });
      skinColorHex   = skinColorHex   || app.skinColorHex;
      hairColorHex   = hairColorHex   || app.hairColorHex;
      outfitColorHex = outfitColorHex || app.outfitColorHex;
    }

    // ── Get or create the cached THREE.Group for this character variant ──
    const cacheKey = `${gedcomId || nameStr}|${eraId}`;
    this._charInUse.add(cacheKey);
    let group = this._charGroups.get(cacheKey);
    if (!group) {
      group = buildCharacter({ gedcomId, sex, birthYear, eraYear, eraId, hairColorHex, skinColorHex, outfitColorHex });
      this.scene.add(group);
      this._charGroups.set(cacheKey, group);
    }

    // ── Position and orient the group this frame ──
    // Blink on hurt (same as old code)
    if (kind === 'player' && e.hurtTimer > 0) {
      if (Math.floor(frame / 4) % 2 === 0) {
        group.visible = false;
        return;
      }
    }
    group.visible = true;

    group.position.set(x, y + bob * s, z);
    group.rotation.set(0, r.yaw, 0);
    group.scale.setScalar(s);

    // ── G4: walk cycle + idle breathing on gait pivots ──
    // phaseA = armL + legR (swing forward when phase is positive)
    // phaseB = armR + legL (swing backward — opposite phase)
    const { phaseA, phaseB } = group.userData.pivots ?? {};
    if (phaseA) {
      if (r.amp >= 0.05) {
        // Walking: max ±25° (0.44 rad); gait pivot handles arm+opposite-leg pair
        const swing = Math.sin(r.phase) * 0.44 * r.amp;
        phaseA.rotation.x =  swing;
        phaseB.rotation.x = -swing;
      } else {
        // Idle: gentle ±4° breathing sway on both pivots (symmetric)
        const breathe = Math.sin(frame * 0.018 + r.px) * 0.04;
        phaseA.rotation.x = breathe;
        phaseB.rotation.x = breathe;
      }
    }

    this._blobAdd(x, y, z, 0.3 * s);

    if (kind === 'npc') {
      this.labels.tag(x, y + 1.2 * s + 0.14, z, {
        text: e.data?.given || (e.name || '').split(' ')[0] || '?', color: '#ffffff',
        sub: e.friendship > 0 ? '♥'.repeat(e.friendship) : '',
      });
    }
  }

  // ── enemies ───────────────────────────────────────────
  _enemy(e, x, y, z, frame) {
    const r = this._record(e, 'enemy', frame);
    this._motion(r, e, frame);
    const P = this.parts;
    let fade = 1;
    const dead = e.state === 'dead';
    if (dead) fade = Math.max(0, e.deathTimer / 0.5);
    if (e.hurtTimer > 0 && Math.sin(frame * 25) > 0) fade *= 0.35;
    const col = rgb(e.peaceful ? '#c8a020' : (e.color || '#a03020'));
    const acc = rgb(e.accent || '#c05040');
    let k = 1;
    if (e.stealFlash > 0 && Math.sin(frame * 30) > 0) k = 1.6;
    const bob = Math.abs(Math.sin(r.phase * 0.8)) * 0.09 * (r.moving ? 1 : 0.3) + (r.moving ? 0 : Math.sin(frame * 0.07 + x) * 0.03);
    const sc = 1.05 * (dead ? 0.4 + 0.6 * fade : 1) * (0.9 + 0.1 * fade);
    const squash = 1 - 0.08 * Math.abs(Math.sin(r.phase * 0.8)) * (r.moving ? 1 : 0);
    _base.compose(_p.set(x, y + 0.04 + bob, z), _q.setFromAxisAngle(_axY, r.yaw), _s.set(sc, sc * squash, sc));
    const c1 = [col[0] * k * fade, col[1] * k * fade, col[2] * k * fade];
    P.cBody.push(_base, c1);
    P.cHorns.push(_base, [acc[0] * fade, acc[1] * fade, acc[2] * fade]);
    P.cEyes.push(_base, [fade, fade, fade]);
    this._blobAdd(x, y, z, 0.38 * sc);
    if (!dead) {
      const peaceful = !!e.peaceful;
      this.labels.tag(x, y + 0.95, z, {
        text: e.name || '?', color: peaceful ? '#ffd700' : '#ffccaa',
        sub: peaceful ? '💸' : '', subColor: '#ffd700',
        bar: (!peaceful && e.hp < e.maxHp && e.hp > 0) ? e.hp / e.maxHp : null,
      });
    }
  }

  // ── animals ───────────────────────────────────────────
  _animal(a, x, y, z, frame) {
    const r = this._record(a, 'animal', frame);
    if (a.butchered) {                                       // the meat drop
      this._blobAdd(x, y, z, 0.2);
      this.labels.icon(x, y + 0.45 + Math.sin(frame / 18) * 0.04, z, '🥩', 0.5);
      return;
    }
    // livestock only moves along x/y and has no facing; turn towards where it walks
    const dx = a.x - r.px, dy = a.y - r.py;
    if (Math.abs(dx) + Math.abs(dy) > 0.03) r.yaw += angleDelta(r.yaw, Math.atan2(dx, dy)) * 0.2;
    this._motion(r, a, frame, false);
    const spec = ANIMALS[a.animalId] || { tint: '#c8b8a0', size: 0.8 };
    const sz = spec.size;
    const tint = rgb(spec.tint);
    const bob = Math.abs(Math.sin(r.phase)) * 0.04 * r.amp + Math.sin(frame / 30 + (a.homeX || 0)) * 0.012;
    _base.compose(_p.set(x, y + bob, z), _q.setFromAxisAngle(_axY, r.yaw), _s.set(sz, sz, sz));
    this.parts.aBody.push(_base, tint);
    if (spec.patches) this.parts.aPatch.push(_base, [0.14, 0.14, 0.14]);
    this._blobAdd(x, y, z, 0.42 * sz);
    this.labels.icon(x, y + 0.82 * sz + 0.2, z, a.emoji || '🐾', 0.4);
  }

  // ── pick-ups ──────────────────────────────────────────
  _drop(d, x, y, z, frame) {
    const emoji = d.item?.emoji || '📦';
    const bob = Math.sin(frame / 28) * 0.06;
    if (d.decorOnly) {
      this._blobAdd(x, y, z, 0.3);
      this.labels.icon(x, y + 0.5 + bob * 0.5, z, emoji, 0.7);
      return;
    }
    const rot = frame / 40;
    _base.compose(_p.set(x, y + 0.34 + bob, z), _q.setFromAxisAngle(_axY, rot), _s.set(1, 1, 1));
    this.parts.gem.push(_base, [1, 1, 1]);
    this._blobAdd(x, y, z, 0.26);
    this.labels.icon(x, y + 0.82 + bob, z, emoji, 0.46);
  }

  /** Closest pickable entity hit by the ray, or null. @returns {{entity:Object, x:number, z:number}|null} */
  pick(ray) {
    let best = null, bestD = Infinity;
    for (const p of this.pickList) {
      _box.min.set(p.x - p.r, p.y, p.z - p.r); _box.max.set(p.x + p.r, p.y + p.h, p.z + p.r);
      if (ray.intersectBox(_box, _hit)) {
        const d = _hit.distanceToSquared(ray.origin);
        if (d < bestD) { bestD = d; best = p; }
      }
    }
    return best;
  }

  dispose() {
    for (const k of Object.keys(this.parts)) { this.parts[k].dispose(); this.parts[k].geometry.dispose(); }
    this.scene.remove(this.blob); this.blob.geometry.dispose(); this.blob.dispose();
    for (const m of this.mats) m.dispose();
    this.recs.clear();
    // G3: dispose all cached character groups
    for (const g of this._charGroups.values()) {
      this.scene.remove(g);
      g.children.forEach(m => { m.geometry?.dispose(); m.material?.dispose(); });
    }
    this._charGroups.clear();
    clearCharacterCache();
  }
}

const _box = new THREE.Box3(), _hit = new THREE.Vector3();
