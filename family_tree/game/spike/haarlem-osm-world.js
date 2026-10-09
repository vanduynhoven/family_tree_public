// haarlem-osm-world.js - G0b spike: a place built from map data instead of kit art.
// Map data (c) OpenStreetMap contributors, ODbL 1.0 - https://www.openstreetmap.org/copyright
//
// OsmWorld extends the G0 HaarlemWorld (haarlem-world.js, unchanged): renderer, scene, sky, fog,
// camera, characters, walk animation, water wobble, main loop and stats are inherited. What it
// replaces is everything tied to the 20x14 tile grid: the world builder, the lights' follow
// behaviour, collision, pathfinding (A* on a navigation grid rasterised from the footprints and
// the water) and the tap / keyboard controls.
//
// Input: the plain object made by scripts/g0b_osm_to_world.py (metres, x right, z down on screen).
// Metres are scaled by S so a G0 character (0.95 units) is a 1.66 m person.
import * as THREE from '../vendor/three/three.module.min.js';
import { HaarlemWorld } from './haarlem-world.js';

export const S = 1 / 1.75;     // metres -> world units
const CELL = 0.5;              // navigation cell in world units (0.875 m)
const WATER_Y = -0.32;         // canal surface (ground is y = 0)
const Y = { grass: 0, field: 0.01, f: 0.02, s: 0.04, kerb: 0.05, c: 0.06, r: 0.08, dash: 0.10 };

const col = (hex) => new THREE.Color(hex);
const WALL = [0xb4553a, 0xa84a30, 0xc4673f, 0x9a5a42, 0xd9c49b, 0xc8ae86, 0xe3dccb].map(col);
const ROOF = [0x7c3a2b, 0x5c4c46, 0x8e4c31].map(col);
const FLAT_ROOF = col(0x726d68);
const CHIMNEY = col(0x6a3a2c);
const GRASS = col(0x6fae45);
const GRASS_FAR = col(0x6a9f4b);
const ROAD_COL = { r: col(0x66655f), s: col(0x9b8c74), c: col(0xb55a45), f: col(0xcdc3ae) };
const DASH = col(0xe9e6dc);
const KERB = col(0xb8ae9c);
const QUAY_TOP = col(0x9a9082);
const QUAY_BOT = col(0x57524a);
const TREE_GREEN = [0x3f8a34, 0x4c9a3c, 0x367a30].map(col);

// ── small helpers ─────────────────────────────────────────────────────────────
export function hash32(n) {
  let h = 2166136261;
  const s = String(n);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

// pts = flat [x, z, x, z, ...]
export function pointInPoly(x, z, pts) {
  let inside = false;
  const n = pts.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = pts[2 * i], zi = pts[2 * i + 1], xj = pts[2 * j], zj = pts[2 * j + 1];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

// Triangulate a flat [x,z,...] polygon (units). Returns triples of vertex indices, or [].
export function triangulate(pts, holes) {
  const v = [];
  for (let i = 0; i < pts.length; i += 2) {
    const last = v[v.length - 1];
    if (!last || Math.hypot(last.x - pts[i], last.y - pts[i + 1]) > 1e-6) v.push(new THREE.Vector2(pts[i], pts[i + 1]));
  }
  if (v.length > 1 && v[0].distanceTo(v[v.length - 1]) < 1e-6) v.pop();
  if (v.length < 3) return { verts: v, tris: [] };
  const h = (holes || []).map((hp) => {
    const hv = [];
    for (let i = 0; i < hp.length; i += 2) hv.push(new THREE.Vector2(hp[i], hp[i + 1]));
    return hv;
  });
  return { verts: v.concat(...h), tris: THREE.ShapeUtils.triangulateShape(v, h) };
}

// A triangle soup with flat normals; the winding is fixed up from a hint direction so a wall
// can never be built inside out.
export class Soup {
  constructor(withUV) { this.pos = []; this.nor = []; this.col = []; this.uv = withUV ? [] : null; }
  get triCount() { return this.pos.length / 9; }
  tri(a, b, c, hint, ca, cb, cc, ta, tb, tc) {
    cb = cb || ca; cc = cc || ca;
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz);
    if (l < 1e-9) return;
    nx /= l; ny /= l; nz /= l;
    if (nx * hint[0] + ny * hint[1] + nz * hint[2] < 0) {
      [b, c] = [c, b]; [cb, cc] = [cc, cb]; [tb, tc] = [tc, tb];
      nx = -nx; ny = -ny; nz = -nz;
    }
    const vs = [a, b, c], cs = [ca, cb, cc], ts = [ta, tb, tc];
    for (let i = 0; i < 3; i++) {
      this.pos.push(vs[i][0], vs[i][1], vs[i][2]);
      this.nor.push(nx, ny, nz);
      this.col.push(cs[i].r, cs[i].g, cs[i].b);
      if (this.uv) this.uv.push(ts[i] ? ts[i][0] : 0, ts[i] ? ts[i][1] : 0);
    }
  }
  quad(a, b, c, d, hint, ca, cb, cc, cd, ta, tb, tc, td) {
    cb = cb || ca; cc = cc || ca; cd = cd || ca;
    this.tri(a, b, c, hint, ca, cb, cc, ta, tb, tc);
    this.tri(a, c, d, hint, ca, cc, cd, ta, tc, td);
  }
  // a flat polygon at height y (flat [x,z,...] in units), facing up
  poly(pts, y, colour, holes) {
    const { verts, tris } = triangulate(pts, holes);
    for (const t of tris) {
      const p = (i) => [verts[i].x, y, verts[i].y];
      this.tri(p(t[0]), p(t[1]), p(t[2]), [0, 1, 0], colour);
    }
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    if (this.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.computeBoundingSphere();
    return g;
  }
}

// One tileable brick-and-window cell, multiplied by the vertex colour of the wall.
function makeWallTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(0,0,0,0.10)';
  for (let y = 3; y < 64; y += 4) g.fillRect(0, y, 64, 1);
  const gx = 19, gy = 12, gw = 26, gh = 34;
  g.fillStyle = '#f2efe6'; g.fillRect(gx - 2, gy - 2, gw + 4, gh + 4);
  const grad = g.createLinearGradient(0, gy, 0, gy + gh);
  grad.addColorStop(0, '#26364a'); grad.addColorStop(1, '#5b7791');
  g.fillStyle = grad; g.fillRect(gx, gy, gw, gh);
  g.fillStyle = '#f2efe6';
  g.fillRect(gx + gw / 2 - 1, gy, 2, gh);
  g.fillRect(gx, gy + Math.round(gh * 0.38), gw, 2);
  g.fillRect(gx - 3, gy + gh + 2, gw + 6, 3);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

// Light window frames, used as an emissive map so they stay pale on red brick.
function makeFrameTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 64, 64);
  const gx = 19, gy = 12, gw = 26, gh = 34;
  g.fillStyle = '#fff';
  g.fillRect(gx - 2, gy - 2, gw + 4, 2);
  g.fillRect(gx - 2, gy - 2, 2, gh + 4);
  g.fillRect(gx + gw, gy - 2, 2, gh + 4);
  g.fillRect(gx - 2, gy + gh, gw + 4, 2);
  g.fillRect(gx + gw / 2 - 1, gy, 2, gh);
  g.fillRect(gx, gy + Math.round(gh * 0.38), gw, 2);
  g.fillRect(gx - 3, gy + gh + 2, gw + 6, 3);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

// An open-bottomed box with flat normals.
export function box(soup, cx, y0, cz, sx, sy, sz, colour) {
  const x0 = cx - sx / 2, x1 = cx + sx / 2, z0 = cz - sz / 2, z1 = cz + sz / 2, y1 = y0 + sy;
  const f = (a, b, c, d, hint) => soup.quad(a, b, c, d, hint, colour);
  f([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]);
  f([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1]);
  f([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0]);
  f([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]);
  f([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0]);
}

// ── buildings ─────────────────────────────────────────────────────────────────
const BAY_M = 3.0;                 // one window bay per ~3 m of wall
const PLAIN_UV = [0.1, 0.94];      // a window-free corner of the wall texture

function tinted(base, k) { return new THREE.Color(base.r * k, base.g * k, base.b * k); }

// walls: textured soup; roofs: plain vertex-colour soup; glow: unlit warm lights
export function buildBuildings(list, walls, roofs, glow) {
  for (const b of list) {
    const n = b.p.length / 2;
    const px = [], pz = [];
    for (let i = 0; i < n; i++) { px.push(b.p[2 * i] * S); pz.push(b.p[2 * i + 1] * S); }
    let a2 = 0;
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; a2 += px[i] * pz[j] - px[j] * pz[i]; }
    const sgn = a2 > 0 ? 1 : -1;
    const H = b.e * S;
    const wc = tinted(WALL[b.c % WALL.length], 0.92 + (hash32(b.i) % 17) / 100);

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const dx = px[j] - px[i], dz = pz[j] - pz[i];
      const len = Math.hypot(dx, dz);
      if (len < 1e-4) continue;
      const hint = [sgn * dz / len, 0, -sgn * dx / len];
      const lm = len / S;
      let t0, t1, t2, t3;
      if (lm >= 1.8) {
        const nb = Math.max(1, Math.round(lm / BAY_M));
        t0 = [0, 0]; t1 = [nb, 0]; t2 = [nb, b.f]; t3 = [0, b.f];
      } else { t0 = t1 = t2 = t3 = PLAIN_UV; }
      walls.quad([px[i], 0, pz[i]], [px[j], 0, pz[j]], [px[j], H, pz[j]], [px[i], H, pz[i]],
        hint, wc, wc, wc, wc, t0, t1, t2, t3);
    }

    // flat cap at eave height: the whole roof of a flat building, the leftover of an L shape
    const flatCol = tinted(FLAT_ROOF, 0.9 + (hash32(b.i + 3) % 21) / 100);
    const capPts = [];
    for (let i = 0; i < n; i++) capPts.push(px[i], pz[i]);
    roofs.poly(capPts, H, b.r ? wc : flatCol);

    if (b.r && b.o) {
      const [cxm, czm, ux, uz, Lm, Wm] = b.o;
      const cx = cxm * S, cz = czm * S, L = Lm * S, W = Wm * S;
      const vx = -uz, vz = ux;
      const rise = Math.min(Wm * 0.36, 4.4) * S;
      const oh = 0.22 * S;
      const k = rise / (W / 2);
      const hl = L / 2;
      const E = (su, sv, hw, y) => [cx + ux * hl * su + vx * hw * sv, y, cz + uz * hl * su + vz * hw * sv];
      const rc = tinted(ROOF[b.q % ROOF.length], 0.9 + (hash32(b.i + 7) % 21) / 100);
      for (const sv of [-1, 1]) {
        roofs.quad(E(-1, sv, W / 2 + oh, H - oh * k), E(1, sv, W / 2 + oh, H - oh * k),
          E(1, 0, 0, H + rise), E(-1, 0, 0, H + rise), [sv * vx * 0.6, 1, sv * vz * 0.6], rc);
      }
      for (const su of [-1, 1]) {
        roofs.tri(E(su, -1, W / 2, H), E(su, 1, W / 2, H), E(su, 0, 0, H + rise),
          [ux * su, 0.2, uz * su], wc);
      }
      if (hash32(b.i + 11) % 100 < 55) {
        const su = 0.35 + (hash32(b.i + 13) % 30) / 100;
        box(roofs, cx + ux * hl * su, H + rise * 0.55, cz + uz * hl * su,
          0.55 * S, rise * 0.45 + 0.9 * S, 0.55 * S, CHIMNEY);
      }
    }

    if (b.hm) addHomeDoor(b, px, pz, sgn, n, walls, roofs, glow);
  }
}

// The home building gets a door, a step and a warm light on its canal-side wall.
function addHomeDoor(b, px, pz, sgn, n, walls, roofs, glow) {
  let best = 0.5, bi = -1;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = px[j] - px[i], dz = pz[j] - pz[i], len = Math.hypot(dx, dz);
    if (len / S < 3) continue;
    const nz = -sgn * dx / len;
    if (nz > best) { best = nz; bi = i; }
  }
  if (bi < 0) return;
  const j = (bi + 1) % n;
  const dx = px[j] - px[bi], dz = pz[j] - pz[bi], len = Math.hypot(dx, dz);
  const ex = dx / len, ez = dz / len;
  const nx = sgn * dz / len, nz = -sgn * dx / len;
  const mx = px[bi] + dx * 0.5, mz = pz[bi] + dz * 0.5;
  const dw = 0.95 * S, dh = 2.15 * S, off = 0.012;
  const a = [mx - ex * dw / 2 + nx * off, 0, mz - ez * dw / 2 + nz * off];
  const c = [mx + ex * dw / 2 + nx * off, 0, mz + ez * dw / 2 + nz * off];
  const door = col(0x2f4a3b);
  roofs.quad(a, c, [c[0], dh, c[2]], [a[0], dh, a[2]], [nx, 0, nz], door);
  box(roofs, mx + nx * 0.18 * S, 0, mz + nz * 0.18 * S, 1.5 * S, 0.12 * S, 0.9 * S, KERB);
  box(glow, mx + nx * 0.1 * S, dh + 0.12 * S, mz + nz * 0.1 * S, 0.35 * S, 0.22 * S, 0.2 * S, col(0xffd27a));
}

// ── ground, roads, quay ───────────────────────────────────────────────────────
const TREE_TRUNK = col(0x5a3d24);
const LAMP_POLE = col(0x33383d);
const LAMP_GLOW = col(0xffe8a0);
const WATER_COL = 0x2878b8;

// A road or path as a ribbon with mitred joins (pts = flat [x,z,...] in units).
export function ribbon(soup, pts, hw, y, colour) {
  const n = pts.length / 2;
  if (n < 2) return;
  const Lp = [], Rp = [];
  for (let i = 0; i < n; i++) {
    let dx0 = 0, dz0 = 0, dx1 = 0, dz1 = 0;
    if (i > 0) { dx0 = pts[2 * i] - pts[2 * i - 2]; dz0 = pts[2 * i + 1] - pts[2 * i - 1]; const l = Math.hypot(dx0, dz0) || 1; dx0 /= l; dz0 /= l; }
    if (i < n - 1) { dx1 = pts[2 * i + 2] - pts[2 * i]; dz1 = pts[2 * i + 3] - pts[2 * i + 1]; const l = Math.hypot(dx1, dz1) || 1; dx1 /= l; dz1 /= l; }
    if (i === 0) { dx0 = dx1; dz0 = dz1; }
    if (i === n - 1) { dx1 = dx0; dz1 = dz0; }
    let mx = -(dz0 + dz1), mz = dx0 + dx1;
    const ml = Math.hypot(mx, mz);
    if (ml < 1e-6) { mx = -dz1; mz = dx1; } else { mx /= ml; mz /= ml; }
    const m = hw / Math.max(0.5, mx * -dz1 + mz * dx1);
    Lp.push([pts[2 * i] + mx * m, pts[2 * i + 1] + mz * m]);
    Rp.push([pts[2 * i] - mx * m, pts[2 * i + 1] - mz * m]);
  }
  for (let i = 0; i < n - 1; i++) {
    soup.quad([Lp[i][0], y, Lp[i][1]], [Rp[i][0], y, Rp[i][1]], [Rp[i + 1][0], y, Rp[i + 1][1]],
      [Lp[i + 1][0], y, Lp[i + 1][1]], [0, 1, 0], colour);
  }
}

// The land is the clip rectangle minus the water. Every bank polyline has the land on its
// right-hand side, so a land polygon is: the bank, then the rectangle edge clockwise on screen
// from the bank's end back to its start. A closed bank (a pond) is a hole.
export function landPolygons(banks, hx, hz) {
  const per = 4 * hx + 4 * hz;
  const corners = [[-hx, -hz, 0], [hx, -hz, 2 * hx], [hx, hz, 2 * hx + 2 * hz], [-hx, hz, 4 * hx + 2 * hz]];
  const onEdge = (x, z) => {
    const d = [Math.abs(z + hz), Math.abs(x - hx), Math.abs(z - hz), Math.abs(x + hx)];
    let k = 0;
    for (let i = 1; i < 4; i++) if (d[i] < d[k]) k = i;
    const cx = Math.max(-hx, Math.min(hx, x)), cz = Math.max(-hz, Math.min(hz, z));
    if (k === 0) return [cx + hx, cx, -hz];
    if (k === 1) return [2 * hx + cz + hz, hx, cz];
    if (k === 2) return [2 * hx + 2 * hz + (hx - cx), cx, hz];
    return [4 * hx + 2 * hz + (hz - cz), -hx, cz];
  };
  const open = [], holes = [];
  for (const b of banks) {
    const closed = Math.hypot(b[0] - b[b.length - 2], b[1] - b[b.length - 1]) < 1e-4;
    (closed ? holes : open).push(b);
  }
  const polys = [];
  for (const b of open) {
    const [t0, sx0, sz0] = onEdge(b[0], b[1]);
    const [t1, sx1, sz1] = onEdge(b[b.length - 2], b[b.length - 1]);
    const pts = b.slice();
    pts[0] = sx0; pts[1] = sz0; pts[pts.length - 2] = sx1; pts[pts.length - 1] = sz1;
    let tEnd = t0;
    if (tEnd <= t1) tEnd += per;
    const cs = [];
    for (let lap = 0; lap < 2; lap++) {
      for (const c of corners) {
        const tc = c[2] + lap * per;
        if (tc > t1 + 1e-6 && tc < tEnd - 1e-6) cs.push([tc, c[0], c[1]]);
      }
    }
    cs.sort((p, q) => p[0] - q[0]);
    for (const c of cs) pts.push(c[1], c[2]);
    polys.push({ pts, holes: [] });
  }
  if (!polys.length) polys.push({ pts: [-hx, -hz, hx, -hz, hx, hz, -hx, hz], holes: [] });
  for (const h of holes) {
    for (const p of polys) if (pointInPoly(h[0], h[1], p.pts)) { p.holes.push(h); break; }
  }
  return polys;
}

export function buildGround(data, ground) {
  const wc = data.meta.water_clip_m || [data.meta.window_m.w / 2 + 75, data.meta.window_m.h / 2 + 75];
  const banks = data.bk.map((b) => b.map((v) => v * S));
  for (const L of landPolygons(banks, wc[0] * S, wc[1] * S)) ground.poly(L.pts, Y.grass, GRASS, L.holes);

  // paths and roads, lowest first so a road crossing a path lies on top
  const order = { f: 0, s: 1, c: 2, r: 3 };
  const roads = data.r.slice().sort((a, b) => order[a.k] - order[b.k]);
  for (const rd of roads) ribbon(ground, rd.p.map((v) => v * S), rd.w * S / 2, Y[rd.k], ROAD_COL[rd.k]);

  // quay: a vertical wall down to the water and a pale kerb on the land side
  for (const b of banks) {
    for (let i = 0; i < b.length / 2 - 1; i++) {
      const x0 = b[2 * i], z0 = b[2 * i + 1], x1 = b[2 * i + 2], z1 = b[2 * i + 3];
      const len = Math.hypot(x1 - x0, z1 - z0);
      if (len < 1e-4) continue;
      const dx = (x1 - x0) / len, dz = (z1 - z0) / len;
      const yb = WATER_Y - 0.12;
      ground.quad([x0, 0, z0], [x1, 0, z1], [x1, yb, z1], [x0, yb, z0], [dz, 0, -dx],
        QUAY_TOP, QUAY_TOP, QUAY_BOT, QUAY_BOT);
      const kw = 0.2, nx = -dz * kw, nz = dx * kw;
      ground.quad([x0, Y.kerb, z0], [x1, Y.kerb, z1], [x1 + nx, Y.kerb, z1 + nz], [x0 + nx, Y.kerb, z0 + nz],
        [0, 1, 0], KERB);
    }
  }
}

// ── water: one flat piece for the whole canal and an animated, facetted piece near the player
function clipRing(ring, x0, z0, x1, z1) {
  const stages = [
    [(p) => p[0] >= x0, (a, b) => [x0, a[1] + (b[1] - a[1]) * (x0 - a[0]) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + (b[1] - a[1]) * (x1 - a[0]) / (b[0] - a[0])]],
    [(p) => p[1] >= z0, (a, b) => [a[0] + (b[0] - a[0]) * (z0 - a[1]) / (b[1] - a[1]), z0]],
    [(p) => p[1] <= z1, (a, b) => [a[0] + (b[0] - a[0]) * (z1 - a[1]) / (b[1] - a[1]), z1]],
  ];
  let pts = ring;
  for (const [inside, inter] of stages) {
    if (!pts.length) break;
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const cur = pts[i], prev = pts[(i + pts.length - 1) % pts.length];
      if (inside(cur)) { if (!inside(prev)) out.push(inter(prev, cur)); out.push(cur); }
      else if (inside(prev)) out.push(inter(prev, cur));
    }
    pts = out;
  }
  return pts;
}

export function buildWater(data, cell, extentU) {
  const flatSoup = new Soup(false);
  const pos = [];
  for (const w of data.w) {
    const ring = [];
    for (let i = 0; i < w.length; i += 2) ring.push([w[i] * S, w[i + 1] * S]);
    flatSoup.poly(ring.flat(), WATER_Y - 0.02, col(WATER_COL));
    let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
    for (const p of ring) { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minZ = Math.min(minZ, p[1]); maxZ = Math.max(maxZ, p[1]); }
    const gx0 = Math.floor(Math.max(minX, -extentU) / cell), gx1 = Math.ceil(Math.min(maxX, extentU) / cell);
    const gz0 = Math.floor(Math.max(minZ, -extentU) / cell), gz1 = Math.ceil(Math.min(maxZ, extentU) / cell);
    for (let gz = gz0; gz < gz1; gz++) {
      for (let gx = gx0; gx < gx1; gx++) {
        const piece = clipRing(ring, gx * cell, gz * cell, (gx + 1) * cell, (gz + 1) * cell);
        if (piece.length < 3) continue;
        for (let k = 1; k < piece.length - 1; k++) {
          const a = piece[0], b = piece[k], c = piece[k + 1];
          const cr = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
          if (Math.abs(cr) < 1e-9) continue;
          // y-up normal needs the (a,c,b) order when the x/z cross product is positive
          if (cr > 0) pos.push(a[0], WATER_Y, a[1], c[0], WATER_Y, c[1], b[0], WATER_Y, b[1]);
          else pos.push(a[0], WATER_Y, a[1], b[0], WATER_Y, b[1], c[0], WATER_Y, c[1]);
        }
      }
    }
  }
  const animGeo = new THREE.BufferGeometry();
  animGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  animGeo.computeVertexNormals();
  const baseY = new Array(pos.length / 3).fill(WATER_Y);
  return { flatGeo: flatSoup.pos.length ? flatSoup.geometry() : null, animGeo: pos.length ? animGeo : null, baseY };
}

// ── trees and lamps ───────────────────────────────────────────────────────────
const ICO = (() => {
  const t = (1 + Math.sqrt(5)) / 2;
  const raw = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
  const v = raw.map((p) => { const l = Math.hypot(p[0], p[1], p[2]); return [p[0] / l, p[1] / l, p[2] / l]; });
  const f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  return { v, f };
})();

export function buildTrees(data, soup) {
  for (const [xm, zm, hm] of data.t) {
    const x = xm * S, z = zm * S, h = hm * S;
    const hs = hash32(Math.round(xm * 10) * 31 + Math.round(zm * 10));
    const colour = tinted(TREE_GREEN[hs % TREE_GREEN.length], 0.9 + ((hs >> 3) % 20) / 100);
    box(soup, x, 0, z, 0.2, h * 0.5, 0.2, TREE_TRUNK);
    const rc = h * 0.3, cy = h * 0.62;
    const vv = ICO.v.map((p) => [x + p[0] * rc, cy + p[1] * rc * 0.88, z + p[2] * rc]);
    for (const f of ICO.f) {
      const a = vv[f[0]], b = vv[f[1]], c = vv[f[2]];
      const hint = [(a[0] + b[0] + c[0]) / 3 - x, (a[1] + b[1] + c[1]) / 3 - cy, (a[2] + b[2] + c[2]) / 3 - z];
      soup.tri(a, b, c, hint, colour);
    }
  }
}

export function buildLamps(data, soup, glow) {
  for (const [xm, zm] of data.l) {
    const x = xm * S, z = zm * S;
    box(soup, x, 0, z, 0.07, 2.35, 0.07, LAMP_POLE);
    box(glow, x, 2.3, z, 0.2, 0.2, 0.2, LAMP_GLOW);
  }
}

// ── navigation grid ───────────────────────────────────────────────────────────
// The walkable window (data.meta.window_m) is rasterised into CELL-sized cells. A cell is blocked
// by a building footprint, by the water, by a tree trunk or a lamp post, each with a little
// padding so the figure never stands on a wall or a quay edge.
function distToSeg(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

function minDistToPoly(x, z, pts) {
  const n = pts.length / 2;
  let m = 1e9;
  for (let i = 0, j = n - 1; i < n; j = i++) m = Math.min(m, distToSeg(x, z, pts[2 * j], pts[2 * j + 1], pts[2 * i], pts[2 * i + 1]));
  return m;
}

export class NavGrid {
  constructor(data) {
    const w = data.meta.window_m;
    this.x0 = -(w.w / 2) * S;
    this.z0 = -(w.h / 2) * S;
    this.nx = Math.ceil(w.w * S / CELL);
    this.nz = Math.ceil(w.h * S / CELL);
    this.blocked = new Uint8Array(this.nx * this.nz);
    const stamp = (pts, pad, solidInside) => {
      let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
      for (let i = 0; i < pts.length; i += 2) {
        minX = Math.min(minX, pts[i]); maxX = Math.max(maxX, pts[i]);
        minZ = Math.min(minZ, pts[i + 1]); maxZ = Math.max(maxZ, pts[i + 1]);
      }
      const c0 = Math.max(0, Math.floor((minX - pad - this.x0) / CELL)), c1 = Math.min(this.nx - 1, Math.floor((maxX + pad - this.x0) / CELL));
      const r0 = Math.max(0, Math.floor((minZ - pad - this.z0) / CELL)), r1 = Math.min(this.nz - 1, Math.floor((maxZ + pad - this.z0) / CELL));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const x = this.x0 + (c + 0.5) * CELL, z = this.z0 + (r + 0.5) * CELL;
          if ((solidInside && pointInPoly(x, z, pts)) || minDistToPoly(x, z, pts) < pad) this.blocked[r * this.nx + c] = 1;
        }
      }
    };
    for (const b of data.b) stamp(b.p.map((v) => v * S), 0.3, true);
    for (const wr of data.w) stamp(wr.map((v) => v * S), 0.42, true);
    const dot = (x, z, rad) => {
      const c0 = Math.max(0, Math.floor((x - rad - this.x0) / CELL)), c1 = Math.min(this.nx - 1, Math.floor((x + rad - this.x0) / CELL));
      const r0 = Math.max(0, Math.floor((z - rad - this.z0) / CELL)), r1 = Math.min(this.nz - 1, Math.floor((z + rad - this.z0) / CELL));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          if (Math.hypot(this.x0 + (c + 0.5) * CELL - x, this.z0 + (r + 0.5) * CELL - z) < rad) this.blocked[r * this.nx + c] = 1;
        }
      }
    };
    for (const t of data.t) dot(t[0] * S, t[1] * S, 0.32);
    for (const l of data.l) dot(l[0] * S, l[1] * S, 0.2);
  }

  cellOf(x, z) { return { c: Math.floor((x - this.x0) / CELL), r: Math.floor((z - this.z0) / CELL) }; }
  centre(c, r) { return { x: this.x0 + (c + 0.5) * CELL, z: this.z0 + (r + 0.5) * CELL }; }
  inRange(c, r) { return c >= 0 && r >= 0 && c < this.nx && r < this.nz; }
  free(c, r) { return this.inRange(c, r) && !this.blocked[r * this.nx + c]; }
  isWalkable(x, z) { const k = this.cellOf(x, z); return this.free(k.c, k.r); }

  // nearest free cell to (c, r) within maxR cells, or null
  nearestFree(c, r, maxR) {
    if (this.free(c, r)) return { c, r };
    let best = null, bd = 1e9;
    for (let rr = r - maxR; rr <= r + maxR; rr++) {
      for (let cc = c - maxR; cc <= c + maxR; cc++) {
        if (!this.free(cc, rr)) continue;
        const d = (cc - c) * (cc - c) + (rr - r) * (rr - r);
        if (d < bd) { bd = d; best = { c: cc, r: rr }; }
      }
    }
    return best;
  }

  // a clear straight line, with a little width either side
  los(ax, az, bx, bz) {
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 1e-6) return true;
    const dx = (bx - ax) / len, dz = (bz - az) / len, nx = -dz * 0.14, nz = dx * 0.14;
    const steps = Math.ceil(len / (CELL / 3));
    for (let i = 0; i <= steps; i++) {
      const x = ax + dx * len * i / steps, z = az + dz * len * i / steps;
      if (!this.isWalkable(x, z) || !this.isWalkable(x + nx, z + nz) || !this.isWalkable(x - nx, z - nz)) return false;
    }
    return true;
  }

  // A* over 8 neighbours without corner cutting, then string-pulled. Returns waypoints [{x,z}].
  findPath(sx, sz, ex, ez) {
    const s0 = this.cellOf(sx, sz), e0 = this.cellOf(ex, ez);
    const start = this.nearestFree(s0.c, s0.r, 6), goal = this.nearestFree(e0.c, e0.r, 8);
    if (!start || !goal) return null;
    const nx = this.nx, N = nx * this.nz;
    const f = new Float32Array(N), g = new Float32Array(N).fill(1e9), came = new Int32Array(N).fill(-1), done = new Uint8Array(N);
    const heap = [];
    const push = (i) => {
      heap.push(i);
      let k = heap.length - 1;
      while (k > 0) {
        const p = (k - 1) >> 1;
        if (f[heap[p]] <= f[heap[k]]) break;
        [heap[p], heap[k]] = [heap[k], heap[p]]; k = p;
      }
    };
    const pop = () => {
      const top = heap[0], last = heap.pop();
      if (heap.length) {
        heap[0] = last;
        let k = 0;
        for (;;) {
          const l = 2 * k + 1, r = l + 1;
          let m = k;
          if (l < heap.length && f[heap[l]] < f[heap[m]]) m = l;
          if (r < heap.length && f[heap[r]] < f[heap[m]]) m = r;
          if (m === k) break;
          [heap[m], heap[k]] = [heap[k], heap[m]]; k = m;
        }
      }
      return top;
    };
    const h = (c, r) => { const dx = Math.abs(c - goal.c), dz = Math.abs(r - goal.r); return dx + dz - 0.5858 * Math.min(dx, dz); };
    const si = start.r * nx + start.c, gi = goal.r * nx + goal.c;
    g[si] = 0; f[si] = h(start.c, start.r); push(si);
    const DIRS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];
    let found = false;
    while (heap.length) {
      const cur = pop();
      if (done[cur]) continue;
      done[cur] = 1;
      if (cur === gi) { found = true; break; }
      const cc = cur % nx, cr = (cur - cc) / nx;
      for (const [dc, dr, cost] of DIRS) {
        const c2 = cc + dc, r2 = cr + dr;
        if (!this.free(c2, r2)) continue;
        if (dc !== 0 && dr !== 0 && (!this.free(cc + dc, cr) || !this.free(cc, cr + dr))) continue;
        const ni = r2 * nx + c2, ng = g[cur] + cost;
        if (ng < g[ni]) { g[ni] = ng; came[ni] = cur; f[ni] = ng + h(c2, r2); push(ni); }
      }
    }
    if (!found) return null;
    const cells = [];
    for (let i = gi; i !== -1; i = came[i]) cells.push(i);
    cells.reverse();
    const pts = cells.map((i) => { const c = i % nx; return this.centre(c, (i - c) / nx); });
    const out = [];
    let a = 0;
    while (a < pts.length - 1) {
      let b = pts.length - 1;
      while (b > a + 1 && !this.los(pts[a].x, pts[a].z, pts[b].x, pts[b].z)) b--;
      out.push(pts[b]);
      a = b;
    }
    return out;
  }

  // a reachable cell at least `minSteps` away from (x, z) (breadth first, deterministic)
  reachableFrom(x, z, minSteps) {
    const s0 = this.cellOf(x, z), s = this.nearestFree(s0.c, s0.r, 6);
    if (!s) return null;
    const dist = new Int16Array(this.nx * this.nz).fill(-1);
    const q = [s.r * this.nx + s.c];
    dist[q[0]] = 0;
    for (let qi = 0; qi < q.length; qi++) {
      const cur = q[qi], cc = cur % this.nx, cr = (cur - cc) / this.nx;
      if (dist[cur] >= minSteps) return { c: cc, r: cr };
      for (const [dc, dr] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        if (!this.free(cc + dc, cr + dr)) continue;
        const ni = (cr + dr) * this.nx + cc + dc;
        if (dist[ni] < 0) { dist[ni] = dist[cur] + 1; q.push(ni); }
      }
    }
    return null;
  }

  get walkableShare() {
    let n = 0;
    for (let i = 0; i < this.blocked.length; i++) if (!this.blocked[i]) n++;
    return n / this.blocked.length;
  }
}

function mulberry32(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── the world ─────────────────────────────────────────────────────────────────
export class OsmWorld extends HaarlemWorld {
  constructor(canvas, tier, data) {
    super(canvas, tier);
    this._data = data;
    this._nav = new NavGrid(data);
    const phone = window.innerWidth < 600;
    this._camZoom = phone ? 30 : 36;
    this._camZoomMin = 12;
    this._camZoomMax = 72;
    this._followPlayer = true;
    this._playerSpeed = 3.2;
    this._npcRand = mulberry32(20261009);
    const place = (p) => {
      const k = this._nav.cellOf(p[0] * S, p[1] * S);
      const f = this._nav.nearestFree(k.c, k.r, 10) || k;
      return this._nav.centre(f.c, f.r);
    };
    const sp = place(data.start), np = place(data.npc);
    this._playerPos.set(sp.x, 0, sp.z);
    this._npcPos.set(np.x, 0, np.z);
    this._npcHome = { x: np.x, z: np.z };
    this._camTarget.set(sp.x, 0, sp.z);
    this._playerPath = [];
    this._npcPath = [];
    this._ringTarget = null;
    this.buildInfo = null;
  }

  _setupScene() {
    super._setupScene();
    // the world is metres-big, so the camera needs a larger depth range than the G0 screen
    this._camera.near = 1;
    this._camera.far = 170;
    this._camera.updateProjectionMatrix();
  }

  _setupLights() {
    super._setupLights();
    const sun = this._sun;
    this._scene.add(sun.target);
    if (this._tier !== 'low') {
      const cam = sun.shadow.camera;
      cam.left = -28; cam.right = 28; cam.top = 28; cam.bottom = -28; cam.near = 1; cam.far = 90;
      cam.updateProjectionMatrix();
      sun.shadow.bias = -0.0006;
      sun.shadow.normalBias = 0.04;
    }
  }

  _buildWorld() {
    const d = this._data;
    const shadows = this._tier !== 'low';
    const ground = new Soup(false), walls = new Soup(true), roofs = new Soup(false), glow = new Soup(false);
    buildGround(d, ground);
    buildBuildings(d.b, walls, roofs, glow);
    buildTrees(d, roofs);
    buildLamps(d, roofs, glow);

    const lam = (o) => new THREE.MeshLambertMaterial(o);
    const gMesh = new THREE.Mesh(ground.geometry(), lam({ vertexColors: true }));
    gMesh.receiveShadow = shadows;
    const wallMat = lam({
      vertexColors: true, map: makeWallTexture(),
      emissive: new THREE.Color(0xffffff), emissiveMap: makeFrameTexture(), emissiveIntensity: 0.6,
    });
    const wMesh = new THREE.Mesh(walls.geometry(), wallMat);
    const rMesh = new THREE.Mesh(roofs.geometry(), lam({ vertexColors: true }));
    wMesh.castShadow = wMesh.receiveShadow = rMesh.castShadow = rMesh.receiveShadow = shadows;
    const glMesh = new THREE.Mesh(glow.geometry(), new THREE.MeshBasicMaterial({ vertexColors: true }));
    this._scene.add(gMesh, wMesh, rMesh, glMesh);

    const water = buildWater(d, 1.1, 36);
    if (water.flatGeo) this._scene.add(new THREE.Mesh(water.flatGeo, lam({ color: new THREE.Color(WATER_COL) })));
    if (water.animGeo) {
      this._scene.add(new THREE.Mesh(water.animGeo, lam({ color: new THREE.Color(WATER_COL) })));
      this._waterGeom = water.animGeo;
      this._waterBaseY = water.baseY;
    }
    this.buildInfo = {
      buildings: d.b.length, gabled: d.b.filter((b) => b.r).length, roads: d.r.length,
      trees: d.t.length, lamps: d.l.length,
      triangles: { ground: ground.triCount, walls: walls.triCount, roofs: roofs.triCount,
        glow: glow.triCount, water: (water.animGeo ? water.animGeo.attributes.position.count / 3 : 0) +
          (water.flatGeo ? water.flatGeo.attributes.position.count / 3 : 0) },
      walkableShare: this._nav.walkableShare, navCells: this._nav.nx * this._nav.nz,
    };
  }

  // same 46 degree tilt as G0; the look-at point is just above the ground so a figure stays centred
  _positionCamera() {
    const pitch = Math.PI * 46 / 180, d = this._camZoom, ly = 0.9;
    this._camera.position.set(this._camTarget.x, ly + Math.sin(pitch) * d, this._camTarget.z + Math.cos(pitch) * d);
    this._camera.lookAt(this._camTarget.x, ly, this._camTarget.z);
  }

  _updateCamera() {
    super._updateCamera();
    const sun = this._sun;
    if (sun) {
      sun.position.set(this._camTarget.x + 10, 24, this._camTarget.z + 7);
      sun.target.position.set(this._camTarget.x, 0, this._camTarget.z);
      sun.target.updateMatrixWorld();
    }
  }

  // ── controls (tap-to-walk, keys, wheel, pinch) on the navigation grid ───────
  _setupControls() {
    const canvas = this._canvas;
    const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const ray = (px, py) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((px - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((py - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, this._camera);
    };
    const handleTap = (px, py) => {
      ray(px, py);
      if (this._npcMesh && raycaster.ray.intersectsBox(new THREE.Box3().setFromObject(this._npcMesh))) { this._showBubble(); return; }
      const pt = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(plane, pt)) return;
      this._followPlayer = true;
      this._walkTo(pt.x, pt.z, null);
    };
    canvas.addEventListener('click', (e) => { if (e.button === 0) handleTap(e.clientX, e.clientY); });
    canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length !== 1) return;
      e.preventDefault();
      handleTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }, { passive: false });
    const MOVE_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'];
    document.addEventListener('keydown', (e) => { this._keys.add(e.code); if (MOVE_KEYS.includes(e.code)) this._followPlayer = true; });
    document.addEventListener('keyup', (e) => this._keys.delete(e.code));
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this._camZoom = Math.max(this._camZoomMin, Math.min(this._camZoomMax, this._camZoom + e.deltaY * 0.05));
    }, { passive: false });
    let pinch = null;
    canvas.addEventListener('touchstart', (e) => { if (e.touches.length === 2) pinch = null; });
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const dd = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (pinch !== null) this._camZoom = Math.max(this._camZoomMin, Math.min(this._camZoomMax, this._camZoom - (dd - pinch) * 0.06));
      pinch = dd;
    }, { passive: false });
  }

  _walkTo(x, z, resolve) {
    const path = this._nav.findPath(this._playerPos.x, this._playerPos.z, x, z);
    if (!path || !path.length) { if (resolve) resolve(false); return false; }
    for (const p of this._tapResolvers) p.resolve(false);
    this._tapResolvers = [];
    this._playerPath = path;
    this._ringTarget = path[path.length - 1];
    this._ringEl.style.display = 'block';
    if (resolve) this._tapResolvers.push({ resolve });
    return true;
  }

  _updateKeys(dt) {
    let dr = 0, dc = 0;
    if (this._keys.has('ArrowUp') || this._keys.has('KeyW')) dr -= 1;
    if (this._keys.has('ArrowDown') || this._keys.has('KeyS')) dr += 1;
    if (this._keys.has('ArrowLeft') || this._keys.has('KeyA')) dc -= 1;
    if (this._keys.has('ArrowRight') || this._keys.has('KeyD')) dc += 1;
    if (dr === 0 && dc === 0) return;
    this._playerPath = [];
    this._ringEl.style.display = 'none';
    const len = Math.hypot(dc, dr), step = 3.6 * dt;
    const nx = this._playerPos.x + (dc / len) * step, nz = this._playerPos.z + (dr / len) * step;
    if (this._nav.isWalkable(nx, this._playerPos.z)) this._playerPos.x = nx;
    if (this._nav.isWalkable(this._playerPos.x, nz)) this._playerPos.z = nz;
    this._playerFacing = Math.atan2(dc, dr);
    this._walkTime += dt;
    this._applyWalkAnim(this._armL, this._armR, this._legL, this._legR, this._walkTime, true);
    this._playerMesh.position.copy(this._playerPos);
    this._playerMesh.rotation.y = this._playerFacing;
  }

  _updatePlayer(dt, t) {
    if (this._playerPath.length === 0) {
      if (!this._keys.size) {
        const df = Math.PI - this._playerMesh.rotation.y;
        this._playerMesh.rotation.y += (((df + Math.PI) % (2 * Math.PI)) - Math.PI) * 0.1;
      }
      this._applyWalkAnim(this._armL, this._armR, this._legL, this._legR, t * 0.6, false);
      return;
    }
    const next = this._playerPath[0];
    const dx = next.x - this._playerPos.x, dz = next.z - this._playerPos.z;
    const dist = Math.hypot(dx, dz), step = this._playerSpeed * dt;
    if (dist <= step) {
      this._playerPos.x = next.x; this._playerPos.z = next.z;
      this._playerPath.shift();
      if (this._playerPath.length === 0) {
        this._ringEl.style.display = 'none';
        this._ringTarget = null;
        for (const p of this._tapResolvers) p.resolve(true);
        this._tapResolvers = [];
      }
    } else {
      this._playerPos.x += (dx / dist) * step;
      this._playerPos.z += (dz / dist) * step;
      this._playerFacing = Math.atan2(dx, dz);
    }
    this._playerMesh.position.copy(this._playerPos);
    this._playerMesh.rotation.y = this._playerFacing;
    this._walkTime += dt;
    this._applyWalkAnim(this._armL, this._armR, this._legL, this._legR, this._walkTime, true);
  }

  _updateNPC(dt, t) {
    this._npcWanderTimer -= dt;
    if (this._npcWanderTimer <= 0 && this._npcPath.length === 0) {
      this._npcWanderTimer = 2.5 + this._npcRand() * 3.5;
      for (let i = 0; i < 10; i++) {
        const a = this._npcRand() * Math.PI * 2, r = 3 + this._npcRand() * 9;
        const tx = this._npcHome.x + Math.cos(a) * r, tz = this._npcHome.z + Math.sin(a) * r;
        if (!this._nav.isWalkable(tx, tz)) continue;
        const p = this._nav.findPath(this._npcPos.x, this._npcPos.z, tx, tz);
        if (p && p.length) { this._npcPath = p; break; }
      }
    }
    if (this._npcPath.length === 0) {
      this._applyWalkAnim(this._npcArmL, this._npcArmR, this._npcLegL, this._npcLegR, t * 0.6, false);
      return;
    }
    const next = this._npcPath[0];
    const dx = next.x - this._npcPos.x, dz = next.z - this._npcPos.z;
    const dist = Math.hypot(dx, dz), step = 1.8 * dt;
    if (dist <= step) {
      this._npcPos.x = next.x; this._npcPos.z = next.z;
      this._npcPath.shift();
    } else {
      this._npcPos.x += (dx / dist) * step;
      this._npcPos.z += (dz / dist) * step;
      this._npcMesh.rotation.y = Math.atan2(dx, dz);
    }
    this._npcMesh.position.copy(this._npcPos);
    this._applyWalkAnim(this._npcArmL, this._npcArmR, this._npcLegL, this._npcLegR, t * 2.8, this._npcPath.length > 0);
  }

  _updateDomLabels() {
    super._updateDomLabels();
    if (this._ringTarget && this._ringEl.style.display === 'block') {
      const p = new THREE.Vector3(this._ringTarget.x, 0.05, this._ringTarget.z).project(this._camera);
      const rect = this._canvas.getBoundingClientRect();
      this._ringEl.style.left = ((p.x * 0.5 + 0.5) * rect.width) + 'px';
      this._ringEl.style.top = ((-p.y * 0.5 + 0.5) * rect.height) + 'px';
    }
  }

  // ── public API (same names as G0; x / y are navigation cells = column / row) ──
  getPlayerTile() { const k = this._nav.cellOf(this._playerPos.x, this._playerPos.z); return { x: k.c, y: k.r }; }

  teleport(x, y) {
    const f = this._nav.nearestFree(Math.floor(x), Math.floor(y), 6);
    if (!f) return;
    const p = this._nav.centre(f.c, f.r);
    this._playerPos.set(p.x, 0, p.z);
    this._playerMesh.position.copy(this._playerPos);
    this._playerPath = [];
    this._ringEl.style.display = 'none';
    this._followPlayer = true;
    this._camTarget.set(p.x, 0, p.z);
    this._positionCamera();
  }

  tapTile(x, y) {
    const c = Math.floor(x), r = Math.floor(y);
    if (!this._nav.free(c, r)) return Promise.resolve(false);
    const p = this._nav.centre(c, r);
    return new Promise((resolve) => this._walkTo(p.x, p.z, resolve));
  }

  tapNpc() { this._showBubble(); return Promise.resolve(true); }

  // a free cell about `steps` cells from the player, for automated checks
  pickTarget(steps) {
    const k = this._nav.reachableFrom(this._playerPos.x, this._playerPos.z, steps || 16);
    return k ? { x: k.c, y: k.r } : null;
  }
}
