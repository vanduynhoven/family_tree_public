// ═══════════════════════════════════════════════════════════
//  Terrain3D - turns a tile map (World.map) into low-poly 3D ground, blocks, buildings and props (G1)
//
//  Input is the same Uint8 tile-id grid the 2D game draws (ids = T in Renderer.js). The size of the grid is
//  read from the grid itself (map.length x map[0].length), never from SCREEN_ROWS/COLS, so the 80x56 maps
//  of G2 work unchanged. 1 world unit = 1 tile.
//
//  How it is drawn (few draw calls):
//    - the map is cut into CHUNK_COLS x CHUNK_ROWS chunks; each chunk is ONE vertex-coloured mesh with the
//      ground, solid blocks (walls, cliffs, houses with gabled roofs, windows, doors) and the bridge decks;
//    - water is one more mesh per chunk that has water (waves and sparkle are done in the vertex/fragment
//      shader from a time uniform, so nothing is touched on the CPU per frame);
//    - repeated props (trees, pines, boulders, flowers, wheat, corn, grass tufts) are INSTANCED: one draw call
//      per prop type for the whole map, filled each time from the chunks near the camera;
//    - portal glow and ripe-crop sparkles are a few small instanced effect meshes animated per frame.
//  The map is rebuilt only when the map object, its size or the era changes; a changed tile that is only a
//  crop (ready <-> spent) rebuilds just its chunk.
// ═══════════════════════════════════════════════════════════
import * as THREE from '../../../vendor/three/three.module.min.js';
import { T } from '../Renderer.js';
import { MeshBuilder, lin, shade, mix } from './MeshBuilder3D.js';
import { eraStyle } from './EraStyle3D.js';

export const CHUNK_COLS = 20;
export const CHUNK_ROWS = 14;
export const WATER_Y = -0.12;
const RING = 28;                               // tiles of hazy ground around the map

const BRICK_ERAS = new Set([1, 3, 8]);              // the 2D renderer draws HOUSE_WALL with brick courses in these eras
const isWater = t => t === T.WATER || t === T.DEEP_WATER;
const isFootprint = t => t === T.HOUSE_WALL || t === T.HOUSE_ROOF || t === T.BRICK;
const FLAT_TOP = { [T.COBBLE]: 0.03, [T.ROAD]: 0.015, [T.PLANK]: 0.06, [T.STEEL]: 0.05, [T.BRIDGE]: 0.10, [T.DOOR]: 0.04, [T.PORTAL]: 0.03, [T.CIRCUIT]: 0.02 };

export function hash2(a, b, seed = 0) {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(seed | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// ── palette ───────────────────────────────────────────────
function buildPalette(st) {
  const grass = lin(st.grass);
  return {
    grass, forest: shade(grass, 0.66), road: lin(st.road), cobble: lin(st.cobble), dirt: lin(st.dirt), sand: lin(st.sand),
    soilWheat: lin('#7d6232'), soilCorn: lin('#6e5632'), soilReady: lin('#654a2a'), soilSpent: lin('#5c4c3a'),
    plank: lin(st.plank), plankDark: shade(lin(st.plank), 0.8), steel: lin(st.steel),
    water: lin(st.water), deep: lin(st.deep), shore: mix(lin(st.water), [1, 1, 1], 0.28),
    wall: lin(st.wall), brick: lin(st.brick), roof: lin(st.roof), stone: lin(st.stone), cliff: shade(lin(st.stone), 0.6),
    door: lin('#4a2c14'), doorFrame: lin('#e6dcc2'), glass: lin('#8fb2cc'), frame: lin('#f2ecdc'),
    portalBase: lin('#2c1a58'), circuit: lin('#1e3442'), circuitPad: lin('#2c5468'),
    chimney: shade(lin(st.brick), 0.85), bank: shade(lin(st.dirt), 0.78),
    glow: [1.0, 0.78, 0.42],
  };
}

function groundColor(P, t) {
  switch (t) {
    case T.GRASS: case T.FLOWER: case T.ROCK: return P.grass;
    case T.TREE: case T.PINE: return P.forest;
    case T.COBBLE: return P.cobble;
    case T.ROAD: return P.road;
    case T.DIRT: return P.dirt;
    case T.SAND: return P.sand;
    case T.WHEAT: return P.soilWheat;
    case T.CORN: return P.soilCorn;
    case T.CROP_READY: return P.soilReady;
    case T.CROP_SPENT: return P.soilSpent;
    case T.PLANK: return P.plank;
    case T.STEEL: return P.steel;
    case T.BRIDGE: return P.plank;
    case T.DOOR: return shade(P.plank, 0.7);
    case T.PORTAL: return P.portalBase;
    case T.CIRCUIT: return P.circuit;
    default: return P.grass;
  }
}

function sideColor(P, t) {
  switch (t) {
    case T.COBBLE: case T.ROAD: case T.SAND: return shade(P.cobble, 0.72);
    case T.PLANK: case T.BRIDGE: case T.DOOR: return shade(P.plank, 0.62);
    case T.STEEL: case T.CIRCUIT: return shade(P.steel, 0.6);
    case T.WALL: return shade(P.stone, 0.92);
    case T.CLIFF: return P.cliff;
    case T.PORTAL: return P.portalBase;
    default: return P.bank;
  }
}

// ── buildings: group HOUSE_WALL / HOUSE_ROOF / BRICK cells into houses and blocks ──────────
function analyseBuildings(map, rows, cols) {
  const n = rows * cols;
  const info = { h: new Float32Array(n), kind: new Uint8Array(n), rects: [], flat: [] };
  const seen = new Uint8Array(n);
  const tileAt = (r, c) => (r < 0 || c < 0 || r >= rows || c >= cols) ? -1 : (map[r][c] | 0);
  for (let r0 = 0; r0 < rows; r0++) {
    for (let c0 = 0; c0 < cols; c0++) {
      const i0 = r0 * cols + c0;
      if (seen[i0] || !isFootprint(tileAt(r0, c0))) continue;
      const cells = [], stack = [i0];
      seen[i0] = 1;
      let house = false, maxDepth = 1;
      while (stack.length) {
        const i = stack.pop(); cells.push(i);
        const r = (i / cols) | 0, c = i % cols, t = map[r][c];
        if (t === T.HOUSE_WALL || t === T.HOUSE_ROOF) house = true;
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const rr = r + dr, cc = c + dc;
          if (!isFootprint(tileAt(rr, cc))) continue;
          const j = rr * cols + cc;
          if (!seen[j]) { seen[j] = 1; stack.push(j); }
        }
      }
      if (!house) {                                    // plain brick: a flat-topped block
        for (const i of cells) { info.kind[i] = 3; info.h[i] = 1.9; }
        continue;
      }
      // greedy rectangles inside the component (each gets its own gabled roof)
      const inComp = new Set(cells), used = new Set(), rects = [];
      const order = cells.slice().sort((a, b) => a - b);
      for (const i of order) {
        if (used.has(i)) continue;
        const r = (i / cols) | 0, c = i % cols;
        let w = 1;
        while (inComp.has(r * cols + c + w) && !used.has(r * cols + c + w) && c + w < cols) w++;
        let d = 1;
        for (;;) {
          let ok = r + d < rows;
          for (let k = 0; ok && k < w; k++) { const j = (r + d) * cols + c + k; if (!inComp.has(j) || used.has(j)) ok = false; }
          if (!ok) break;
          d++;
        }
        for (let dr = 0; dr < d; dr++) for (let k = 0; k < w; k++) used.add((r + dr) * cols + c + k);
        rects.push({ r0: r, c0: c, r1: r + d - 1, c1: c + w - 1 });
        maxDepth = Math.max(maxDepth, Math.min(d, w));
      }
      const h = Math.max(1.55, Math.min(1.95, 1.25 + 0.12 * maxDepth));
      for (const i of cells) {
        info.h[i] = h;
        info.kind[i] = map[(i / cols) | 0][i % cols] === T.HOUSE_ROOF ? 2 : 1;
      }
      for (const rc of rects) info.rects.push({ ...rc, h });
    }
  }
  return info;
}

// ── shared prop shapes (built once; colours are multiplied by the per-instance tint) ──────
const PROP_GEO = {};
function propShapes(low = false) {
  const key = low ? 'low' : 'high';
  if (PROP_GEO[key]) return PROP_GEO[key];
  const bark = lin('#6a4424'), L1 = lin('#2f6b28'), L2 = lin('#48922e'), L3 = lin('#62b03c');
  const tree = new MeshBuilder();
  tree.cyl(0, 0, 0, 0.1, 0.06, 0.5, low ? 5 : 6, shade(bark, 0.75), bark);
  tree.ico(0, 0.72, 0, 0.42, 0.32, 0.42, 0.3, L1, L2);
  tree.ico(0.1, 1.0, -0.05, 0.32, 0.27, 0.32, 1.1, L2, L3);
  if (!low) tree.ico(-0.08, 1.2, 0.04, 0.21, 0.19, 0.21, 2.0, L2, L3);

  const P1 = lin('#1c4a22'), P2 = lin('#2a6a30'), P3 = lin('#3a8240');
  const pine = new MeshBuilder();
  const ps = low ? 5 : 7;
  pine.cyl(0, 0, 0, 0.08, 0.05, 0.32, 5, shade(bark, 0.7), shade(bark, 0.9));
  pine.cone(0, 0.22, 0, 0.44, 0.55, ps, P1, P2);
  if (!low) pine.cone(0, 0.55, 0, 0.35, 0.5, ps, P1, P2);
  pine.cone(0, low ? 0.6 : 0.86, 0, low ? 0.3 : 0.25, 0.5, ps, P2, P3);

  const R1 = lin('#6a6a68'), R2 = lin('#9a9a94');
  const rock = new MeshBuilder();
  rock.ico(0, 0.17, 0, 0.37, 0.27, 0.33, 0.5, R1, R2);
  rock.ico(0.24, 0.1, 0.12, 0.2, 0.15, 0.18, 1.3, R1, R2);
  if (!low) rock.ico(-0.2, 0.08, -0.16, 0.16, 0.12, 0.15, 2.2, shade(R1, 0.9), R2);

  const stem = lin('#3f9a2c'), petal = ['#ff6090', '#ffcc40', '#8a8aff', '#ff9040', '#ff4060'].map(lin);
  const flower = new MeshBuilder();
  [[-0.22, -0.18, 0], [0.2, -0.2, 1], [-0.1, 0.22, 2], [0.24, 0.16, 3], [0.0, 0.0, 4]].slice(0, low ? 3 : 5).forEach(([x, z, k]) => {
    const h = 0.2 + hash2(k, 7) * 0.12;
    flower.cyl(x, 0, z, 0.014, 0.012, h, 4, shade(stem, 0.8), stem);
    flower.octa(x, h + 0.04, z, 0.08, 0.06, 0.08, shade(petal[k], 0.85), petal[k]);
  });

  const wheat = new MeshBuilder();
  const w1 = lin('#b88a28'), w2 = lin('#e8b840');
  for (let i = 0; i < (low ? 7 : 12); i++) {
    const a = hash2(i, 3) * 6.28, rr = 0.1 + hash2(i, 5) * 0.32;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr, h = 0.5 + hash2(i, 9) * 0.14;
    wheat.blade(x, 0, z, 0.045, h, a, 0.04, w1, w2);
    wheat.cyl(x + Math.sin(a) * 0.04, h - 0.03, z + Math.cos(a) * 0.04, 0.03, 0.018, 0.16, 4, w2, lin('#f4cf60'), true);
  }

  const corn = new MeshBuilder();
  const c1 = lin('#3f8a24'), c2 = lin('#62b030'), cob = lin('#e8c040');
  [[-0.24, -0.2], [0.22, -0.22], [-0.2, 0.22], [0.24, 0.2], [0.0, 0.0]].slice(0, low ? 3 : 5).forEach(([x, z], k) => {
    const h = 0.78 + hash2(k, 11) * 0.16;
    corn.cyl(x, 0, z, 0.03, 0.02, h, 5, shade(c1, 0.8), c1);
    corn.blade(x, h * 0.45, z, 0.07, 0.32, k * 1.3, 0.22, c1, c2);
    corn.blade(x, h * 0.62, z, 0.07, 0.3, k * 1.3 + 2.4, 0.22, c1, c2);
    corn.cyl(x + 0.04, h * 0.55, z, 0.034, 0.03, 0.17, 5, cob, shade(cob, 1.1), true);
  });

  const tuft = new MeshBuilder();
  const g1 = lin('#4f8e2c'), g2 = lin('#86c448');
  for (let i = 0; i < (low ? 4 : 6); i++) {
    const a = i * 1.05 + hash2(i, 2);
    tuft.blade(Math.cos(a) * 0.05, 0, Math.sin(a) * 0.05, 0.06, 0.16 + hash2(i, 4) * 0.12, a, 0.05, g1, g2);
  }

  const crop = new MeshBuilder();                       // the glow orb above a ripe crop
  crop.ico(0, 0, 0, 0.15, 0.15, 0.15, 0, [1, 1, 1]);

  const spark = new MeshBuilder();
  spark.octa(0, 0, 0, 0.05, 0.07, 0.05, [1, 1, 1]);

  PROP_GEO[key] = { tree, pine, rock, flower, wheat, corn, tuft, crop, spark };
  return PROP_GEO[key];
}

const PROP_TYPES = ['tree', 'pine', 'rock', 'flower', 'wheat', 'corn', 'tuft'];
const SWAY = new Set(['flower', 'wheat', 'corn', 'tuft']);

// ── materials ─────────────────────────────────────────────
function patchLambert(mat, key, U, { glow = false, water = false, sway = false } = {}) {
  mat.customProgramCacheKey = () => key;
  mat.onBeforeCompile = shader => {
    shader.uniforms.uTime = U.uTime;
    shader.uniforms.uNight = U.uNight;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        uniform float uTime;
        ${glow ? 'attribute vec3 aGlow; varying vec3 vGlow;' : ''}
        ${water ? 'varying vec3 vWPos;' : ''}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        ${glow ? 'vGlow = aGlow;' : ''}
        ${water ? 'transformed.y += sin(uTime*1.7 + position.x*1.9 + position.z*1.2)*0.02 + sin(uTime*1.1 - position.x*1.3 + position.z*2.1)*0.014; vWPos = transformed;' : ''}
        ${sway ? 'float swPh = uTime*1.9 + instanceMatrix[3].x*1.7 + instanceMatrix[3].z*1.3; transformed.x += sin(swPh) * 0.05 * position.y; transformed.z += cos(swPh*0.8) * 0.02 * position.y;' : ''}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform float uTime; uniform float uNight;
        ${glow ? 'varying vec3 vGlow;' : ''}
        ${water ? 'varying vec3 vWPos;' : ''}`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        ${glow ? 'totalEmissiveRadiance += vGlow * uNight;' : ''}
        ${water ? `vec2 wp = vWPos.xz;
          float g1 = sin(dot(wp, vec2(7.1, 3.3)) + uTime*2.1);
          float g2 = sin(dot(wp, vec2(-4.2, 8.1)) - uTime*1.7);
          float g3 = sin(dot(wp, vec2(2.0, -9.3)) + uTime*1.3);
          float sp = smoothstep(2.25, 2.8, g1 + g2 + g3);
          float band = 0.5 + 0.5*sin(wp.x*2.2 + wp.y*1.6 + uTime*1.2);
          diffuseColor.rgb += vec3(0.34, 0.40, 0.46) * sp + vec3(0.02, 0.04, 0.06) * band;
          totalEmissiveRadiance += vec3(0.02, 0.05, 0.09) * uNight;` : ''}`);
  };
}

// ═══════════════════════════════════════════════════════════
export class TerrainSet {
  /** @param {{shadows:boolean}} opts */
  constructor(opts = {}) {
    this.shadows = !!opts.shadows;
    this.low = !!opts.low;                   // fewer facets per prop on the low tier
    this.group = new THREE.Group();
    this.group.name = 'terrain';
    this.uniforms = opts.uniforms || { uTime: { value: 0 }, uNight: { value: 0 } };
    const U = this.uniforms;
    this.mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    patchLambert(this.mat, 'terrain3d-glow', U, { glow: true });
    this.waterMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    patchLambert(this.waterMat, 'terrain3d-water', U, { water: true });
    this.propMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    patchLambert(this.propMat, 'terrain3d-prop', U);
    this.swayMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    patchLambert(this.swayMat, 'terrain3d-sway', U, { sway: true });
    this.fxRingMat = new THREE.MeshBasicMaterial({ color: 0xb070ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    this.fxBeamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    this.fxSparkMat = new THREE.MeshBasicMaterial({ color: 0xe0b8ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    this.fxOrbMat = new THREE.MeshBasicMaterial({ color: 0xa8ff60, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });

    this.rows = 0; this.cols = 0; this.eraId = -1; this.mapRef = null;
    this.snapshot = null;              // tile ids at the last build, to spot changed tiles
    this.chunks = [];
    this.height = null;                // ground height per tile, for placing figures
    this.bld = null;
    this.ring = null;
    this.propMeshes = new Map();       // type -> { mesh, cap }
    this.fx = {};
    this.portals = []; this.crops = [];
    this._visKey = '';
    this.stats = { triangles: 0, chunks: 0, instances: 0, buildMs: 0, builds: 0 };
  }

  get ready() { return this.rows > 0; }

  /** Compare with the map; rebuild what changed. @returns true when anything was rebuilt. */
  sync(map, eraId) {
    const rows = map ? map.length : 0, cols = rows ? map[0].length : 0;
    if (!rows || !cols) return false;
    let full = rows !== this.rows || cols !== this.cols || eraId !== this.eraId || map !== this.mapRef;
    let dirtyChunks = null;
    if (!full) {
      const snap = this.snapshot;
      for (let r = 0; r < rows && !full; r++) {
        const row = map[r];
        for (let c = 0; c < cols; c++) {
          const v = row[c] | 0, old = snap[r * cols + c];
          if (v === old) continue;
          const crop = (v === T.CROP_READY || v === T.CROP_SPENT) && (old === T.CROP_READY || old === T.CROP_SPENT);
          if (!crop) { full = true; break; }
          (dirtyChunks || (dirtyChunks = new Set())).add(((r / CHUNK_ROWS) | 0) * 1000 + ((c / CHUNK_COLS) | 0));
          snap[r * cols + c] = v;
        }
      }
    }
    if (full) { this.rebuild(map, eraId); return true; }
    if (dirtyChunks) {
      this._propsDirty = true;
      for (const k of dirtyChunks) {
        const ch = this.chunks.find(q => q.key === k);
        if (ch) this._buildChunk(ch);
      }
      this._rescan();
      return true;
    }
    return false;
  }

  rebuild(map, eraId) {
    const t0 = performance.now();
    this.dispose(false);
    const rows = map.length, cols = map[0].length;
    this.rows = rows; this.cols = cols; this.eraId = eraId; this.mapRef = map;
    this.style = eraStyle(eraId);
    this.pal = buildPalette(this.style);
    this.snapshot = new Uint8Array(rows * cols);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) this.snapshot[r * cols + c] = map[r][c] | 0;
    this.bld = analyseBuildings(map, rows, cols);
    this.height = new Float32Array(rows * cols);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) this.height[r * cols + c] = this._groundTop(r, c);
    this.chunks = [];
    for (let cr = 0; cr * CHUNK_ROWS < rows; cr++) {
      for (let cc = 0; cc * CHUNK_COLS < cols; cc++) {
        const ch = {
          key: cr * 1000 + cc, r0: cr * CHUNK_ROWS, c0: cc * CHUNK_COLS,
          r1: Math.min(rows, (cr + 1) * CHUNK_ROWS), c1: Math.min(cols, (cc + 1) * CHUNK_COLS),
          mesh: null, water: null, props: {}, tris: 0,
        };
        this._buildChunk(ch);
        this.chunks.push(ch);
      }
    }
    this._buildRing();
    this._rescan();
    this._visKey = '';
    this._propsDirty = true;
    this.stats.buildMs = performance.now() - t0;
    this.stats.builds++;
  }

  // ── geometry ───────────────────────────────────────────
  /** Top height of a tile's surface (not counting buildings that have been built above it). */
  _groundTop(r, c) {
    const t = this.mapRef[r][c] | 0;
    if (isWater(t)) return WATER_Y;
    if (t === T.WALL) return 0.95;
    if (t === T.CLIFF) return 1.7;
    if (isFootprint(t)) return 0;
    return FLAT_TOP[t] || 0;
  }

  /** Top of the solid at (r,c) as seen from a neighbour (blocks and buildings are tall). */
  _topAt(r, c) {
    if (r < 0 || c < 0 || r >= this.rows || c >= this.cols) return 0;
    const i = r * this.cols + c, t = this.mapRef[r][c] | 0;
    if (isFootprint(t)) return this.bld.h[i] || 1.9;
    return this._groundTop(r, c);
  }

  _buildChunk(ch) {
    const map = this.mapRef, P = this.pal, st = this.style, bld = this.bld, cols = this.cols, rows = this.rows;
    const mb = new MeshBuilder(), wb = new MeshBuilder();
    const props = {}; PROP_TYPES.forEach(k => { props[k] = { m: [], c: [], p: [], n: 0 }; });
    const grassTint = this._foliageTint();
    const portals = [], crops = [];
    const cornerNoise = (R, C, amp) => 1 + (hash2(R, C, 3) - 0.5) * amp;
    const inst = (arr, x, y, z, rotY, sx, sy, sz, tint) => {
      const c = Math.cos(rotY), s = Math.sin(rotY);
      arr.m.push(sx * c, 0, -sx * s, 0, 0, sy, 0, 0, sz * s, 0, sz * c, 0, x, y, z, 1);
      arr.c.push(tint[0], tint[1], tint[2]);
      arr.p.push(x, z);
      arr.n++;
    };

    for (let r = ch.r0; r < ch.r1; r++) {
      for (let c = ch.c0; c < ch.c1; c++) {
        const t = map[r][c] | 0, idx = r * cols + c;
        const rnd = (k) => hash2(r * 7 + k, c * 13 + k * 3, this.eraId + 1);

        if (isWater(t)) { this._water(wb, r, c, t); continue; }

        // bridge decks keep water under them
        const topY = isFootprint(t) ? (bld.h[idx] || 1.9) : this._groundTop(r, c);

        if (isFootprint(t)) {
          this._footprintCell(mb, r, c, t, idx, topY);
        } else if (t === T.WALL || t === T.CLIFF) {
          const base = t === T.WALL ? P.stone : P.cliff;
          const v = 0.94 + rnd(1) * 0.12;
          mb.top(c, r, c + 1, r + 1, topY, shade(base, v * 1.12), shade(base, v * 1.05), shade(base, v * 1.12), shade(base, v));
          this._sides(mb, r, c, topY, sideColor(P, t), t === T.CLIFF ? shade(P.cliff, 0.7) : shade(P.stone, 0.72));
        } else {
          this._groundTile(mb, r, c, t, topY);
          this._sides(mb, r, c, topY, sideColor(P, t), shade(sideColor(P, t), 0.7));
          if (t === T.BRIDGE) { this._bridgeWater(wb, r, c); this._bridgeRails(mb, r, c, topY); }
        }

        // ── props and decoration ──
        const cx = c + 0.5, cz = r + 0.5;
        switch (t) {
          case T.TREE: {
            const s = 0.85 + rnd(2) * 0.4;
            inst(props.tree, cx + (rnd(3) - 0.5) * 0.28, topY, cz + (rnd(4) - 0.5) * 0.28, rnd(5) * 6.28, s, s * (0.9 + rnd(6) * 0.25), s, this._tint(grassTint, rnd(7)));
            break;
          }
          case T.PINE: {
            const s = 0.85 + rnd(2) * 0.35;
            inst(props.pine, cx + (rnd(3) - 0.5) * 0.2, topY, cz + (rnd(4) - 0.5) * 0.2, rnd(5) * 6.28, s, s * (0.9 + rnd(6) * 0.3), s, this._tint(grassTint, rnd(7), 0.9));
            break;
          }
          case T.ROCK: {
            const s = 0.9 + rnd(2) * 0.35;
            inst(props.rock, cx, topY, cz, rnd(5) * 6.28, s, s * (0.85 + rnd(6) * 0.3), s, this._tint([1, 1, 1], rnd(7), 0.9));
            break;
          }
          case T.FLOWER:
            inst(props.flower, cx, topY, cz, rnd(5) * 6.28, 1, 0.9 + rnd(6) * 0.3, 1, this._tint([1, 1, 1], rnd(7), 0.95, 0.1));
            break;
          case T.WHEAT:
            inst(props.wheat, cx, topY, cz, rnd(5) * 6.28, 1, 0.9 + rnd(6) * 0.25, 1, this._tint([1, 1, 1], rnd(7), 0.95, 0.12));
            break;
          case T.CORN:
            inst(props.corn, cx, topY, cz, rnd(5) * 6.28, 1, 0.9 + rnd(6) * 0.2, 1, this._tint([1, 1, 1], rnd(7), 0.95, 0.12));
            break;
          case T.CROP_READY:
            crops.push({ x: cx, z: cz });
            inst(props.tuft, cx - 0.2, topY, cz + 0.12, rnd(5) * 6.28, 1.0, 1.3, 1.0, [1, 1, 1]);
            inst(props.tuft, cx + 0.2, topY, cz - 0.15, rnd(6) * 6.28, 1.0, 1.4, 1.0, [1, 1, 1]);
            break;
          case T.PORTAL:
            portals.push({ x: cx, z: cz, y: topY });
            break;
          case T.GRASS:
            if (rnd(8) < 0.42) inst(props.tuft, cx + (rnd(9) - 0.5) * 0.7, topY, cz + (rnd(10) - 0.5) * 0.7, rnd(5) * 6.28, 1, 0.8 + rnd(6) * 0.6, 1, this._tint(grassTint, rnd(7), 0.95));
            break;
          case T.DOOR:
            this._doorPanel(mb, r, c);
            break;
          default: break;
        }
      }
    }

    // roofs, chimneys: built by the chunk that owns the rectangle's top-left cell
    for (const rc of bld.rects) {
      if (rc.r0 >= ch.r0 && rc.r0 < ch.r1 && rc.c0 >= ch.c0 && rc.c0 < ch.c1) this._roof(mb, rc);
    }

    ch.portals = portals; ch.crops = crops;
    this._swapChunkMeshes(ch, mb, wb, props);
  }

  _swapChunkMeshes(ch, mb, wb, props) {
    if (ch.mesh) { ch.mesh.geometry.dispose(); this.group.remove(ch.mesh); ch.mesh = null; }
    if (ch.water) { ch.water.geometry.dispose(); this.group.remove(ch.water); ch.water = null; }
    const g = mb.toGeometry(true);
    ch.tris = mb.triangles;
    ch.bx0 = ch.c0; ch.bz0 = ch.r0; ch.bx1 = ch.c1; ch.bz1 = ch.r1;          // visibility bounds (roofs may spill over)
    if (g) {
      const bb = g.boundingBox;
      ch.bx0 = Math.min(ch.bx0, bb.min.x); ch.bz0 = Math.min(ch.bz0, bb.min.z);
      ch.bx1 = Math.max(ch.bx1, bb.max.x); ch.bz1 = Math.max(ch.bz1, bb.max.z);
      const m = new THREE.Mesh(g, this.mat);
      m.matrixAutoUpdate = false; m.castShadow = this.shadows; m.receiveShadow = this.shadows;
      m.name = 'terrain-chunk';
      this.group.add(m); ch.mesh = m;
    }
    const wg = wb.toGeometry(false);
    if (wg) {
      const w = new THREE.Mesh(wg, this.waterMat);
      w.matrixAutoUpdate = false; w.receiveShadow = this.shadows;
      w.name = 'water-chunk';
      this.group.add(w); ch.water = w; ch.tris += wb.triangles;
    }
    ch.props = {};
    for (const k of PROP_TYPES) {
      const p = props[k];
      ch.props[k] = { n: p.n, m: new Float32Array(p.m), c: new Float32Array(p.c), p: new Float32Array(p.p) };
    }
  }

  _foliageTint() {
    const g = lin(this.style.grass), ref = lin('#68a038');
    return [0.8 + 0.2 * Math.min(1.5, g[0] / ref[0]), 0.8 + 0.2 * Math.min(1.5, g[1] / ref[1]), 0.8 + 0.2 * Math.min(1.5, g[2] / ref[2])];
  }

  _tint(base, k, lo = 0.88, hue = 0.05) {
    const v = lo + k * (1.12 - lo);
    return [base[0] * v * (1 + (k - 0.5) * hue), base[1] * v, base[2] * v * (1 - (k - 0.5) * hue)];
  }

  /** Ground tile: top face with smoothly varying corner colours, plus a few patterned types. */
  _groundTile(mb, r, c, t, y) {
    const P = this.pal, base = groundColor(P, t);
    const amp = (t === T.GRASS || t === T.FLOWER || t === T.TREE || t === T.PINE || t === T.ROCK) ? 0.2 : 0.09;
    const k = (R, C) => 1 + (hash2(R, C, 3) - 0.5) * amp;
    const col = (R, C, f = 1) => shade(base, k(R, C) * f);
    if (t === T.COBBLE || t === T.STEEL || t === T.CIRCUIT) {
      // 2x2 cobbles / plates with their own shade
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const f = 0.9 + hash2(r * 2 + i, c * 2 + j, 9) * 0.16;
        let cc = shade(base, f);
        if (t === T.CIRCUIT && i === 0 && j === 0) cc = P.circuitPad;
        mb.top(c + j * 0.5 + 0.012, r + i * 0.5 + 0.012, c + j * 0.5 + 0.488, r + i * 0.5 + 0.488, y, cc);
      }
      // thin dark grout between the stones
      const grout = shade(base, 0.62);
      mb.top(c, r, c + 1, r + 1, y - 0.004, grout);
      return;
    }
    if (t === T.PLANK || t === T.BRIDGE) {
      const alongX = t === T.PLANK || this._bridgeAlongX(r, c);
      for (let i = 0; i < 4; i++) {
        const f = (i % 2 ? 0.86 : 1.0) * (0.95 + hash2(r * 4 + i, c, 5) * 0.1);
        const cc = shade(base, f);
        if (alongX) mb.top(c, r + i * 0.25, c + 1, r + i * 0.25 + 0.235, y, cc);
        else mb.top(c + i * 0.25, r, c + i * 0.25 + 0.235, r + 1, y, cc);
      }
      mb.top(c, r, c + 1, r + 1, y - 0.004, shade(base, 0.45));
      return;
    }
    if (t === T.PORTAL) {
      mb.top(c, r, c + 1, r + 1, y, shade(base, 0.9), shade(base, 1.2), shade(base, 0.9), shade(base, 1.2), [0.18, 0.08, 0.34]);
      return;
    }
    mb.top(c, r, c + 1, r + 1, y, col(r, c), col(r + 1, c), col(r + 1, c + 1), col(r, c + 1));
  }

  _bridgeAlongX(r, c) {
    const wN = isWater(this._tileAt(r - 1, c) | 0) || isWater(this._tileAt(r + 1, c) | 0);
    return wN;   // water above/below -> the deck runs east-west, boards lie along x
  }

  _tileAt(r, c) { return (r < 0 || c < 0 || r >= this.rows || c >= this.cols) ? -1 : this.mapRef[r][c]; }

  /** Vertical faces where this tile stands higher than a neighbour. */
  _sides(mb, r, c, y, cTop, cBot) {
    const nb = [[r + 1, c, 'S'], [r - 1, c, 'N'], [r, c + 1, 'E'], [r, c - 1, 'W']];
    for (const [rr, cc, d] of nb) {
      const y0 = this._topAt(rr, cc);
      if (y <= y0 + 0.002) continue;
      if (d === 'S') mb.south(c, c + 1, y0, y, r + 1, cTop, cBot);
      else if (d === 'N') mb.north(c, c + 1, y0, y, r, cTop, cBot);
      else if (d === 'E') mb.east(r, r + 1, y0, y, c + 1, cTop, cBot);
      else mb.west(r, r + 1, y0, y, c, cTop, cBot);
    }
  }

  /** One footprint cell (wall, roof row or brick block): a column; the gabled roof is added per rectangle. */
  _footprintCell(mb, r, c, t, idx, h) {
    const P = this.pal, kind = this.bld.kind[idx];
    const base = t === T.BRICK ? P.brick : (BRICK_ERAS.has(this.eraId) ? mix(P.wall, P.brick, 0.72) : P.wall);
    const v = 0.95 + hash2(r, c, 4) * 0.1;
    const wall = shade(base, v), wallHi = shade(base, v * 1.04), plinth = shade(P.stone, 0.78 * v);
    if (kind === 3) mb.top(c, r, c + 1, r + 1, h, shade(P.stone, 0.8));     // plain brick block: flat roof
    else mb.top(c, r, c + 1, r + 1, h, shade(P.roof, 0.85));               // hidden under the roof prism
    const PL = 0.26;                                                        // stone plinth height
    const face = (d, y0) => {
      const lo = Math.max(y0, 0), top = h;
      const split = lo + PL < top;
      const f = (a, b, cTop, cBot) => {
        if (d === 'S') mb.south(c, c + 1, a, b, r + 1, cTop, cBot);
        else if (d === 'N') mb.north(c, c + 1, a, b, r, cTop, cBot);
        else if (d === 'E') mb.east(r, r + 1, a, b, c + 1, cTop, cBot);
        else mb.west(r, r + 1, a, b, c, cTop, cBot);
      };
      if (y0 < lo) f(y0, lo, plinth, shade(plinth, 0.6));                   // carried down to the water
      if (split) {
        f(lo, lo + PL, plinth, shade(plinth, 0.85));
        f(lo + PL, top, wallHi, wall);
      } else f(lo, top, wallHi, wall);
    };
    const nb = [[r + 1, c, 'S'], [r - 1, c, 'N'], [r, c + 1, 'E'], [r, c - 1, 'W']];
    for (const [rr, cc, d] of nb) {
      const y0 = this._topAt(rr, cc);
      if (h <= y0 + 0.002) continue;
      face(d, y0);
    }
    // string course, windows on the exposed south facade
    if (this._topAt(r + 1, c) < h - 0.01) {
      if (kind !== 3) mb.south(c - 0.002, c + 1.002, h - 0.2, h - 0.12, r + 1 + 0.01, shade(P.frame, 0.92));
      this._windows(mb, r, c, h, kind);
    }
  }

  _windows(mb, r, c, h, kind) {
    const P = this.pal;
    const z = r + 1 + 0.012;
    // is there a door south-adjacent? then leave this cell's lower window out (door is on THIS facade only when tile south is a door)
    const southIsDoor = (this._tileAt(r + 1, c) | 0) === T.DOOR;
    const rowsY = h >= 2.05 ? [0.62, 1.26] : [0.74];
    rowsY.forEach((y0, k) => {
      if (southIsDoor && k === 0) return;
      if (hash2(r * 5 + k, c * 3, 11 + this.eraId) < 0.34) return;
      const w = 0.34, hgt = 0.44, cx = c + 0.5;
      mb.south(cx - w / 2 - 0.05, cx + w / 2 + 0.05, y0 - 0.05, y0 + hgt + 0.05, z, P.frame);
      mb.south(cx - w / 2, cx + w / 2, y0, y0 + hgt, z + 0.012, P.glass, shade(P.glass, 0.8), P.glow);
      mb.south(cx - 0.012, cx + 0.012, y0, y0 + hgt, z + 0.02, P.frame);                   // mullion
      mb.south(cx - w / 2, cx + w / 2, y0 + hgt * 0.5 - 0.012, y0 + hgt * 0.5 + 0.012, z + 0.02, P.frame);
    });
  }

  /** A door on the south face of the wall north of a DOOR tile. */
  _doorPanel(mb, r, c) {
    const P = this.pal;
    const nT = this._tileAt(r - 1, c) | 0;
    const nTop = this._topAt(r - 1, c);
    if (nTop < 0.8 || !(isFootprint(nT) || nT === T.WALL || nT === T.CLIFF)) return;
    const z = r + 0.012, cx = c + 0.5, y0 = this.height[r * this.cols + c];
    mb.south(cx - 0.34, cx + 0.34, y0, y0 + 1.22, z, P.doorFrame);                         // frame
    mb.south(cx - 0.27, cx + 0.27, y0, y0 + 1.12, z + 0.014, P.door, shade(P.door, 0.8));    // leaf
    mb.south(cx - 0.012, cx + 0.012, y0, y0 + 1.12, z + 0.022, shade(P.door, 0.6));          // seam
    mb.south(cx + 0.14, cx + 0.19, y0 + 0.5, y0 + 0.56, z + 0.024, lin('#d8b040'));          // handle
  }

  /** Gabled (or flat) roof over one rectangle of a house. */
  _roof(mb, rc) {
    const P = this.pal, st = this.style;
    const x0 = rc.c0, x1 = rc.c1 + 1, z0 = rc.r0, z1 = rc.r1 + 1, W = x1 - x0, D = z1 - z0, h = rc.h;
    const flat = st.roofStyle === 'flat';
    const thatch = st.roofStyle === 'thatch';
    const ov = thatch ? 0.26 : 0.16;
    const base = P.roof;
    const v = 0.94 + hash2(rc.r0, rc.c0, 21) * 0.12;
    const roofLo = shade(base, 0.8 * v), roofHi = shade(base, 1.1 * v);
    if (flat) {
      const t = 0.12;
      mb.top(x0 - 0.08, z0 - 0.08, x1 + 0.08, z1 + 0.08, h + t, shade(base, v));
      mb.south(x0 - 0.08, x1 + 0.08, h, h + t, z1 + 0.08, shade(base, 1.05), shade(base, 0.7));
      mb.north(x0 - 0.08, x1 + 0.08, h, h + t, z0 - 0.08, shade(base, 1.05), shade(base, 0.7));
      mb.east(z0 - 0.08, z1 + 0.08, h, h + t, x1 + 0.08, shade(base, 1.05), shade(base, 0.7));
      mb.west(z0 - 0.08, z1 + 0.08, h, h + t, x0 - 0.08, shade(base, 1.05), shade(base, 0.7));
      return;
    }
    const S = Math.min(W, D);
    const rise = Math.max(0.4, Math.min(0.95, 0.22 * S + 0.15)) * (thatch ? 1.12 : 1);
    const wallCol = shade(P.wall, 0.95);
    const strips = Math.max(2, Math.round(rise / 0.26));
    const alongX = W >= D;
    if (alongX) {
      const zm = (z0 + z1) / 2, ez0 = z0 - ov, ez1 = z1 + ov, ex0 = x0 - ov, ex1 = x1 + ov, eaveY = h - 0.05;
      // slopes, cut into strips so the roof reads as tiles
      for (let k = 0; k < strips; k++) {
        const a = k / strips, b = (k + 1) / strips;
        const f = (k % 2 ? 0.95 : 1.0);
        const yA = eaveY + (h + rise - eaveY) * a, yB = eaveY + (h + rise - eaveY) * b;
        const zSa = ez1 + (zm - ez1) * a, zSb = ez1 + (zm - ez1) * b;      // south slope
        mb.quad(ex0, yA, zSa, ex1, yA, zSa, ex1, yB, zSb, ex0, yB, zSb, shade(roofLo, f), shade(roofLo, f), shade(roofHi, f), shade(roofHi, f));
        const zNa = ez0 + (zm - ez0) * a, zNb = ez0 + (zm - ez0) * b;      // north slope
        mb.quad(ex1, yA, zNa, ex0, yA, zNa, ex0, yB, zNb, ex1, yB, zNb, shade(roofLo, f * 0.9), shade(roofLo, f * 0.9), shade(roofHi, f * 0.9), shade(roofHi, f * 0.9));
      }
      // gable triangles on the east and west faces
      mb.tri(x1, h, z1, x1, h, z0, x1, h + rise - 0.02, zm, wallCol);
      mb.tri(x0, h, z0, x0, h, z1, x0, h + rise - 0.02, zm, wallCol);
      // ridge cap
      mb.box(ex0, h + rise - 0.03, zm - 0.05, ex1, h + rise + 0.04, zm + 0.05, shade(base, 0.7), shade(base, 0.7));
      if (!thatch && W >= 3 && st.roofStyle === 'tile') this._chimney(mb, x0 + W * (0.62 + hash2(rc.r0, rc.c0, 3) * 0.2), zm - 0.1, h + rise * 0.72);
    } else {
      const xm = (x0 + x1) / 2, ex0 = x0 - ov, ex1 = x1 + ov, ez0 = z0 - ov, ez1 = z1 + ov, eaveY = h - 0.05;
      for (let k = 0; k < strips; k++) {
        const a = k / strips, b = (k + 1) / strips, f = (k % 2 ? 0.95 : 1.0);
        const yA = eaveY + (h + rise - eaveY) * a, yB = eaveY + (h + rise - eaveY) * b;
        const xEa = ex1 + (xm - ex1) * a, xEb = ex1 + (xm - ex1) * b;      // east slope
        mb.quad(xEa, yA, ez1, xEa, yA, ez0, xEb, yB, ez0, xEb, yB, ez1, shade(roofLo, f * 0.9), shade(roofLo, f * 0.9), shade(roofHi, f * 0.9), shade(roofHi, f * 0.9));
        const xWa = ex0 + (xm - ex0) * a, xWb = ex0 + (xm - ex0) * b;      // west slope
        mb.quad(xWa, yA, ez0, xWa, yA, ez1, xWb, yB, ez1, xWb, yB, ez0, shade(roofLo, f), shade(roofLo, f), shade(roofHi, f), shade(roofHi, f));
      }
      // gable triangle facing the camera (south) and its twin in the north
      mb.tri(x0, h, z1, x1, h, z1, xm, h + rise - 0.02, z1, wallCol);
      mb.tri(x1, h, z0, x0, h, z0, xm, h + rise - 0.02, z0, wallCol);
      mb.box(xm - 0.05, h + rise - 0.03, ez0, xm + 0.05, h + rise + 0.04, ez1, shade(base, 0.7), shade(base, 0.7));
      if (!thatch && D >= 3 && st.roofStyle === 'tile') this._chimney(mb, xm + 0.1, z0 + D * (0.55 + hash2(rc.r0, rc.c0, 3) * 0.2), h + rise * 0.72);
    }
  }

  _chimney(mb, x, z, y0) {
    const P = this.pal;
    mb.box(x - 0.14, y0, z - 0.14, x + 0.14, y0 + 0.62, z + 0.14, shade(P.chimney, 1.15), P.chimney, shade(P.chimney, 0.8));
    mb.top(x - 0.17, z - 0.17, x + 0.17, z + 0.17, y0 + 0.62, shade(P.chimney, 0.6));
  }

  _water(wb, r, c, t) {
    const P = this.pal, base = t === T.DEEP_WATER ? P.deep : P.water;
    let shore = 0;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = this._tileAt(r + dr, c + dc) | 0; if (n >= 0 && !isWater(n)) shore++; }
    const tile = shore ? mix(base, P.shore, 0.14 * shore) : base;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const f = (R, C) => shade(tile, 0.94 + hash2(R, C, 17) * 0.12);
      const R0 = r * 2 + i, C0 = c * 2 + j;
      wb.top(c + j * 0.5, r + i * 0.5, c + j * 0.5 + 0.5, r + i * 0.5 + 0.5, WATER_Y, f(R0, C0), f(R0 + 1, C0), f(R0 + 1, C0 + 1), f(R0, C0 + 1));
    }
  }

  /** Under a bridge: water, so the deck does not float over nothing. */
  _bridgeWater(wb, r, c) {
    let w = 0;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (isWater(this._tileAt(r + dr, c + dc) | 0)) w++;
    if (w >= 1) this._water(wb, r, c, T.WATER);
  }

  /** Rails along the sides of a bridge deck that face water. */
  _bridgeRails(mb, r, c, y) {
    const P = this.pal, wood = P.plankDark, post = shade(P.plank, 0.7);
    const sides = [[-1, 0, 'N'], [1, 0, 'S'], [0, -1, 'W'], [0, 1, 'E']];
    for (const [dr, dc, d] of sides) {
      if (!isWater(this._tileAt(r + dr, c + dc) | 0)) continue;
      const w = 0.05;
      if (d === 'N' || d === 'S') {
        const z = d === 'N' ? r + 0.03 : r + 0.97;
        mb.box(c, y + 0.24, z - w / 2, c + 1, y + 0.3, z + w / 2, wood, wood);
        mb.box(c + 0.02, y, z - w / 2, c + 0.02 + w, y + 0.3, z + w / 2, post, post);
        mb.box(c + 0.98 - w, y, z - w / 2, c + 0.98, y + 0.3, z + w / 2, post, post);
      } else {
        const x = d === 'W' ? c + 0.03 : c + 0.97;
        mb.box(x - w / 2, y + 0.24, r, x + w / 2, y + 0.3, r + 1, wood, wood);
        mb.box(x - w / 2, y, r + 0.02, x + w / 2, y + 0.3, r + 0.02 + w, post, post);
        mb.box(x - w / 2, y, r + 0.98 - w, x + w / 2, y + 0.3, r + 0.98, post, post);
      }
    }
  }

  /** Hazy ground all around the map so the edge never shows a void. */
  _buildRing() {
    const mb = new MeshBuilder(), P = this.pal, rows = this.rows, cols = this.cols;
    const far = shade(lin(this.style.skyHorizon), 0.8);
    const clampR = r => Math.max(0, Math.min(rows - 1, r)), clampC = c => Math.max(0, Math.min(cols - 1, c));
    const edgeCol = (r, c) => {
      const t = this._tileAt(clampR(r), clampC(c)) | 0;
      if (isWater(t)) return shade(P.water, 0.92);
      if (t === T.CLIFF || t === T.WALL || t === T.ROCK) return shade(P.stone, 0.66);
      if (isFootprint(t)) return shade(P.stone, 0.72);
      if (t === T.TREE || t === T.PINE) return shade(P.forest, 0.9);
      return shade(groundColor(P, t), 0.9);
    };
    const lvl = (r, c) => (isWater(this._tileAt(clampR(r), clampC(c)) | 0) ? WATER_Y : 0);
    const R = RING, M = 12;                       // the first M tiles stay almost clear, the rest fades into the haze
    const dist = (x, z) => Math.max(0, -x, x - cols, -z, z - rows);          // distance outside the map rectangle
    const fade = d => (d <= M ? 0.2 * d / M : 0.2 + 0.7 * Math.min(1, (d - M) / (R - M)));
    const vc = (x, z, e) => mix(e, far, fade(dist(x, z)));
    const quad = (x0, z0, x1, z1, y, e) => mb.top(x0, z0, x1, z1, y, vc(x0, z0, e), vc(x0, z1, e), vc(x1, z1, e), vc(x1, z0, e));
    for (let c = 0; c < cols; c++) {              // north and south strips, one quad pair per edge tile
      const n = edgeCol(0, c), yn = lvl(0, c), s = edgeCol(rows - 1, c), ys = lvl(rows - 1, c);
      quad(c, -M, c + 1, 0, yn, n); quad(c, -R, c + 1, -M, yn, n);
      quad(c, rows, c + 1, rows + M, ys, s); quad(c, rows + M, c + 1, rows + R, ys, s);
    }
    for (let r = 0; r < rows; r++) {              // west and east strips
      const w = edgeCol(r, 0), yw = lvl(r, 0), e = edgeCol(r, cols - 1), ye = lvl(r, cols - 1);
      quad(-M, r, 0, r + 1, yw, w); quad(-R, r, -M, r + 1, yw, w);
      quad(cols, r, cols + M, r + 1, ye, e); quad(cols + M, r, cols + R, r + 1, ye, e);
    }
    for (const [sx, sz, ec, er] of [[-1, -1, 0, 0], [1, -1, cols - 1, 0], [-1, 1, 0, rows - 1], [1, 1, cols - 1, rows - 1]]) {
      const e = edgeCol(er, ec), y = lvl(er, ec);
      const xs = sx < 0 ? [-R, -M, 0] : [cols, cols + M, cols + R], zs = sz < 0 ? [-R, -M, 0] : [rows, rows + M, rows + R];
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) quad(xs[i], zs[j], xs[i + 1], zs[j + 1], y, e);
    }
    const g = mb.toGeometry(false);
    if (!g) return;
    const m = new THREE.Mesh(g, this.mat);
    m.matrixAutoUpdate = false; m.receiveShadow = this.shadows; m.name = 'terrain-ring';
    this.group.add(m);
    this.ring = m;
    this.ringTris = mb.triangles;
  }

  // ── bookkeeping ────────────────────────────────────────
  _rescan() {
    this.portals = []; this.crops = [];
    let tris = this.ringTris || 0, inst = 0;
    const totals = {};
    for (const ch of this.chunks) {
      this.portals.push(...ch.portals); this.crops.push(...ch.crops);
      tris += ch.tris;
      for (const k of PROP_TYPES) totals[k] = (totals[k] || 0) + ch.props[k].n;
    }
    // (re)allocate the instanced prop meshes if the capacity is too small
    const shapes = propShapes(this.low);
    for (const k of PROP_TYPES) {
      const need = Math.max(1, totals[k] || 0);
      let pm = this.propMeshes.get(k);
      if (!pm || pm.cap < need) {
        if (pm) { this.group.remove(pm.mesh); pm.mesh.dispose(); }
        const geo = this._propGeometry(k, shapes[k]);
        const cap = Math.ceil(need * 1.25) + 8;
        const mesh = new THREE.InstancedMesh(geo, SWAY.has(k) ? this.swayMat : this.propMat, cap);
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3);
        mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
        mesh.count = 0; mesh.frustumCulled = false; mesh.castShadow = this.shadows && (k === 'tree' || k === 'pine' || k === 'rock');
        mesh.receiveShadow = false; mesh.name = 'prop-' + k;
        this.group.add(mesh);
        pm = { mesh, cap };
        this.propMeshes.set(k, pm);
      }
      pm.total = totals[k] || 0;
      inst += pm.total;
    }
    this.stats.triangles = tris; this.stats.chunks = this.chunks.length; this.stats.instances = inst;
    this._visKey = '';
    this._propsDirty = true;
    this._buildFxCapacity();
  }

  _propGeometry(k, builder) {
    const key = (this.low ? 'low:' : 'high:') + k;
    if (!PROP_GEOS_BY_TYPE[key]) PROP_GEOS_BY_TYPE[key] = builder.toGeometry(false);
    return PROP_GEOS_BY_TYPE[key];
  }

  // ── effects: portal rings / beam / sparks, ripe-crop orbs ──────────

  _buildFxCapacity() {
    const nP = this.portals.length, nC = this.crops.length;
    const fx = this.fx;
    const ensure = (key, geo, mat, count, build) => {
      const cur = fx[key];
      if (cur && cur.cap >= count) { cur.mesh.count = count; return; }
      if (cur) { this.group.remove(cur.mesh); cur.mesh.dispose(); delete fx[key]; }
      if (count <= 0) return;
      const mesh = new THREE.InstancedMesh(geo, mat, count + 4);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false; mesh.count = count; mesh.name = 'fx-' + key; mesh.renderOrder = 5;
      this.group.add(mesh);
      fx[key] = { mesh, cap: count + 4 };
    };
    if (!FX_GEO) {
      const ring = new THREE.TorusGeometry(0.36, 0.028, 5, 28); ring.rotateX(Math.PI / 2);
      const beam = new THREE.CylinderGeometry(0.3, 0.36, 2.4, 14, 1, true); beam.translate(0, 1.2, 0);
      const colors = []; const pos = beam.attributes.position;
      for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 2.4; const k = Math.pow(1 - y, 1.3) * 0.85; colors.push(0.6 * k, 0.25 * k, 1.0 * k); }
      beam.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      const disc = new THREE.CircleGeometry(0.8, 24); disc.rotateX(-Math.PI / 2);          // soft purple glow on the ground
      const dp = disc.attributes.position, dcol = [];
      for (let i = 0; i < dp.count; i++) { const k = Math.pow(Math.max(0, 1 - Math.hypot(dp.getX(i), dp.getZ(i)) / 0.8), 1.2); dcol.push(0.6 * k, 0.22 * k, 1.0 * k); }
      disc.setAttribute('color', new THREE.Float32BufferAttribute(dcol, 3));
      const orb = propShapes().crop.toGeometry(false), spark = propShapes().spark.toGeometry(false);
      FX_GEO = { ring, beam, disc, orb, spark };
    }
    ensure('glow', FX_GEO.disc, this.fxBeamMat, nP);
    ensure('ring', FX_GEO.ring, this.fxRingMat, nP * 2);
    ensure('beam', FX_GEO.beam, this.fxBeamMat, nP);
    ensure('spark', FX_GEO.spark, this.fxSparkMat, nP * 5);
    ensure('orb', FX_GEO.orb, this.fxOrbMat, nC);
  }

  /**
   * Per frame: pick the chunks that matter for the camera, fill the instanced props, animate the effects.
   * @param {number} frame running frame counter (drives all animation, so screenshots are repeatable)
   * @param {{x0:number,z0:number,x1:number,z1:number}} view visible rectangle in tile units
   */
  update(frame, view) {
    this.uniforms.uTime.value = frame / 60;
    const pad = 3;
    const vis = [];
    let key = '';
    const qkey = Math.floor(view.x0 / 2) + ',' + Math.floor(view.z0 / 2) + ',' + Math.floor(view.x1 / 2) + ',' + Math.floor(view.z1 / 2);
    for (const ch of this.chunks) {
      const on = !(ch.bx1 < view.x0 - pad || ch.bx0 > view.x1 + pad || ch.bz1 < view.z0 - pad || ch.bz0 > view.z1 + pad);
      if (ch.mesh) ch.mesh.visible = on;
      if (ch.water) ch.water.visible = on;
      if (on) { vis.push(ch); key += ch.key + ','; }
    }
    if (key !== this._visKey || this._propsDirty || qkey !== this._qKey) {
      this._visKey = key; this._qKey = qkey; this._propsDirty = false;
      const ix0 = Math.floor(view.x0 / 2) * 2 - 2, ix1 = (Math.floor(view.x1 / 2) + 1) * 2 + 2;
      const iz0 = Math.floor(view.z0 / 2) * 2 - 2, iz1 = (Math.floor(view.z1 / 2) + 1) * 2 + 2;
      let drawn = 0;
      for (const [k, pm] of this.propMeshes) {
        const ma = pm.mesh.instanceMatrix.array, ca = pm.mesh.instanceColor.array;
        let n = 0;
        for (const ch of vis) {
          const p = ch.props[k];
          if (!p || !p.n) continue;
          const pos = p.p, pmx = p.m, pcx = p.c;
          for (let i = 0; i < p.n; i++) {
            const x = pos[i * 2], z = pos[i * 2 + 1];
            if (x < ix0 || x > ix1 || z < iz0 || z > iz1) continue;   // only what is near the camera
            const o = n * 16, s = i * 16;
            for (let j = 0; j < 16; j++) ma[o + j] = pmx[s + j];
            const o3 = n * 3, s3 = i * 3;
            ca[o3] = pcx[s3]; ca[o3 + 1] = pcx[s3 + 1]; ca[o3 + 2] = pcx[s3 + 2];
            n++;
          }
        }
        pm.mesh.count = n; drawn += n;
        pm.mesh.instanceMatrix.needsUpdate = true; pm.mesh.instanceColor.needsUpdate = true;
      }
      this.stats.drawnInstances = drawn;
    }
    this._animateFx(frame, view);
  }

  _animateFx(frame, view) {
    const fx = this.fx; if (!fx) return;
    const t = frame / 60;
    const m = _m4, q = _q, p = _v3, s = _v3b;
    q.identity();
    if (fx.ring) {
      this.portals.forEach((po, i) => {
        for (let k = 0; k < 2; k++) {
          const sc = (k ? 0.62 : 1) * (1 + 0.07 * Math.sin(t * 3 + i + k * 1.7));
          p.set(po.x, po.y + 0.06 + 0.03 * Math.sin(t * 2.2 + k * 2), po.z); s.set(sc, 1, sc);
          m.compose(p, q, s); fx.ring.mesh.setMatrixAt(i * 2 + k, m);
        }
      });
      fx.ring.mesh.instanceMatrix.needsUpdate = true;
      this.fxRingMat.opacity = 0.65 + 0.3 * Math.sin(t * 3.4);
    }
    if (fx.glow) {
      this.portals.forEach((po, i) => {
        const sc = 1 + 0.12 * Math.sin(t * 2.4 + i * 0.9);
        p.set(po.x, po.y + 0.03, po.z); s.set(sc, 1, sc);
        m.compose(p, q, s); fx.glow.mesh.setMatrixAt(i, m);
      });
      fx.glow.mesh.instanceMatrix.needsUpdate = true;
    }
    if (fx.beam) {
      this.portals.forEach((po, i) => { p.set(po.x, po.y, po.z); s.set(1, 1, 1); m.compose(p, q, s); fx.beam.mesh.setMatrixAt(i, m); });
      fx.beam.mesh.instanceMatrix.needsUpdate = true;
      const k = 0.75 + 0.25 * Math.sin(t * 2.6); this.fxBeamMat.color.setRGB(k, k, k);
    }
    if (fx.spark) {
      this.portals.forEach((po, i) => {
        for (let k = 0; k < 5; k++) {
          const a = t * (1.6 + k * 0.17) + k * 1.25 + i, rr = 0.27 + 0.12 * Math.sin(t + k);
          const y = po.y + 0.1 + ((t * 0.35 + k * 0.21 + i * 0.13) % 1) * 1.7;
          p.set(po.x + Math.cos(a) * rr, y, po.z + Math.sin(a) * rr); s.set(1, 1, 1);
          m.compose(p, q, s); fx.spark.mesh.setMatrixAt(i * 5 + k, m);
        }
      });
      fx.spark.mesh.instanceMatrix.needsUpdate = true;
    }
    if (fx.orb) {
      this.crops.forEach((cr, i) => {
        const sc = 0.8 + 0.25 * Math.sin(t * 3.2 + i * 1.3);
        p.set(cr.x, 0.42 + 0.06 * Math.sin(t * 2.4 + i), cr.z); s.set(sc, sc, sc);
        m.compose(p, q, s); fx.orb.mesh.setMatrixAt(i, m);
      });
      fx.orb.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  // ── queries ────────────────────────────────────────────
  /** Ground height (tile units) at a world point given in tile units. */
  heightAt(x, z) {
    if (!this.height) return 0;
    const c = Math.floor(x), r = Math.floor(z);
    if (r < 0 || c < 0 || r >= this.rows || c >= this.cols) return 0;
    return this.height[r * this.cols + c];
  }

  dispose(all = true) {
    for (const ch of this.chunks) {
      if (ch.mesh) ch.mesh.geometry.dispose();
      if (ch.water) ch.water.geometry.dispose();
    }
    this.chunks = [];
    if (this.ring) { this.ring.geometry.dispose(); this.ring = null; }
    for (const pm of this.propMeshes.values()) pm.mesh.dispose();
    this.propMeshes.clear();
    if (this.fx) for (const k of Object.keys(this.fx)) { this.fx[k].mesh.dispose(); delete this.fx[k]; }
    while (this.group.children.length) this.group.remove(this.group.children[0]);
    this.rows = this.cols = 0; this.mapRef = null; this.eraId = -1;
    if (all) {
      this.mat.dispose(); this.waterMat.dispose(); this.propMat.dispose(); this.swayMat.dispose();
      this.fxRingMat.dispose(); this.fxBeamMat.dispose(); this.fxSparkMat.dispose(); this.fxOrbMat.dispose();
    }
  }
}

const PROP_GEOS_BY_TYPE = {};
let FX_GEO = null;
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _v3 = new THREE.Vector3(), _v3b = new THREE.Vector3();
