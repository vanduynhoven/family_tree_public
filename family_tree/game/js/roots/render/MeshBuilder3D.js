// ═══════════════════════════════════════════════════════════
//  MeshBuilder3D - a tiny flat-shaded, vertex-coloured mesh builder for the 3D renderer (G1)
//
//  Everything static in the 3D world (ground, walls, roofs, bridges, windows) and every prop shape is
//  poured into one of these and turned into a single BufferGeometry, so a whole map chunk is one draw
//  call. Colours are LINEAR rgb triples (use lin() from Terrain3D.js / THREE.Color), one per face or per
//  corner. Faces are not indexed: each triangle has its own flat normal. Winding is counter-clockwise
//  seen from the outside; the face helpers below already pick the right order.
//
//  World units: 1 unit = 1 tile (48 world pixels). +x east, +y up, +z south (the camera looks north).
// ═══════════════════════════════════════════════════════════
import * as THREE from '../../../vendor/three/three.module.min.js';

const ICO_T = (1 + Math.sqrt(5)) / 2;
const ICO_V = [[-1, ICO_T, 0], [1, ICO_T, 0], [-1, -ICO_T, 0], [1, -ICO_T, 0], [0, -1, ICO_T], [0, 1, ICO_T],
  [0, -1, -ICO_T], [0, 1, -ICO_T], [ICO_T, 0, -1], [ICO_T, 0, 1], [-ICO_T, 0, -1], [-ICO_T, 0, 1]]
  .map(v => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; });
const ICO_F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6],
  [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];

export class MeshBuilder {
  constructor() {
    this.pos = []; this.nor = []; this.col = []; this.glow = [];
    this.hasGlow = false;
  }

  get triangles() { return this.pos.length / 9; }
  get empty() { return this.pos.length === 0; }

  /** One triangle, one colour (or three, if cb/cc are given). glow = [r,g,b] light the face gives off at night. */
  tri(ax, ay, az, bx, by, bz, cx, cy, cz, ca, cb = ca, cc = ca, glow = null) {
    const ux = bx - ax, uy = by - ay, uz = bz - az;
    const vx = cx - ax, vy = cy - ay, vz = cz - az;
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz);
    if (l < 1e-9) return;                       // degenerate
    nx /= l; ny /= l; nz /= l;
    this.pos.push(ax, ay, az, bx, by, bz, cx, cy, cz);
    this.nor.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
    this.col.push(ca[0], ca[1], ca[2], cb[0], cb[1], cb[2], cc[0], cc[1], cc[2]);
    if (glow) {
      this.hasGlow = true;
      this.glow.push(glow[0], glow[1], glow[2], glow[0], glow[1], glow[2], glow[0], glow[1], glow[2]);
    } else {
      this.glow.push(0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
  }

  /** Quad a-b-c-d (counter-clockwise from outside), split a-b-c + a-c-d. One colour, or one per corner. */
  quad(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, ca, cb = ca, cc = ca, cd = ca, glow = null) {
    this.tri(ax, ay, az, bx, by, bz, cx, cy, cz, ca, cb, cc, glow);
    this.tri(ax, ay, az, cx, cy, cz, dx, dy, dz, ca, cc, cd, glow);
  }

  /** Same as tri(), but flips the winding when the face would look into the solid around `center`. */
  triOut(ax, ay, az, bx, by, bz, cx, cy, cz, center, col, glow = null) {
    const ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const mx = (ax + bx + cx) / 3 - center[0], my = (ay + by + cy) / 3 - center[1], mz = (az + bz + cz) / 3 - center[2];
    if (nx * mx + ny * my + nz * mz >= 0) this.tri(ax, ay, az, bx, by, bz, cx, cy, cz, col, col, col, glow);
    else this.tri(ax, ay, az, cx, cy, cz, bx, by, bz, col, col, col, glow);
  }

  // ── axis-aligned faces ────────────────────────────────────
  /** Upward face; the four corner colours run (x0,z0) (x0,z1) (x1,z1) (x1,z0). */
  top(x0, z0, x1, z1, y, c00, c01 = c00, c11 = c00, c10 = c00, glow = null) {
    this.quad(x0, y, z0, x0, y, z1, x1, y, z1, x1, y, z0, c00, c01, c11, c10, glow);
  }
  /** Face looking south (+z, towards the camera). cBot/cTop are the colours at the bottom/top edge. */
  south(x0, x1, y0, y1, z, cTop, cBot = cTop, glow = null) {
    this.quad(x0, y0, z, x1, y0, z, x1, y1, z, x0, y1, z, cBot, cBot, cTop, cTop, glow);
  }
  /** Face looking north (-z). */
  north(x0, x1, y0, y1, z, cTop, cBot = cTop, glow = null) {
    this.quad(x1, y0, z, x0, y0, z, x0, y1, z, x1, y1, z, cBot, cBot, cTop, cTop, glow);
  }
  /** Face looking east (+x). */
  east(z0, z1, y0, y1, x, cTop, cBot = cTop, glow = null) {
    this.quad(x, y0, z1, x, y0, z0, x, y1, z0, x, y1, z1, cBot, cBot, cTop, cTop, glow);
  }
  /** Face looking west (-x). */
  west(z0, z1, y0, y1, x, cTop, cBot = cTop, glow = null) {
    this.quad(x, y0, z0, x, y0, z1, x, y1, z1, x, y1, z0, cBot, cBot, cTop, cTop, glow);
  }

  /** Box without a bottom. */
  box(x0, y0, z0, x1, y1, z1, cTop, cSide = cTop, cBot = cSide) {
    this.top(x0, z0, x1, z1, y1, cTop);
    this.south(x0, x1, y0, y1, z1, cSide, cBot);
    this.north(x0, x1, y0, y1, z0, cSide, cBot);
    this.east(z0, z1, y0, y1, x1, cSide, cBot);
    this.west(z0, z1, y0, y1, x0, cSide, cBot);
  }

  /** Box centred on cx,cz standing on y0, rotated about Y (used by the figure parts). */
  boxC(cx, y0, cz, w, h, d, rotY, cTop, cSide = cTop, cBot = cSide) {
    const c = Math.cos(rotY), s = Math.sin(rotY), hw = w / 2, hd = d / 2, y1 = y0 + h;
    const P = (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c];
    const p00 = P(-hw, -hd), p10 = P(hw, -hd), p11 = P(hw, hd), p01 = P(-hw, hd);
    this.quad(p00[0], y1, p00[1], p01[0], y1, p01[1], p11[0], y1, p11[1], p10[0], y1, p10[1], cTop);
    const side = (a, b) => this.quad(a[0], y0, a[1], b[0], y0, b[1], b[0], y1, b[1], a[0], y1, a[1], cBot, cBot, cSide, cSide);
    side(p01, p11); side(p11, p10); side(p10, p00); side(p00, p01);
  }

  // ── round-ish solids ──────────────────────────────────────
  /** Low-poly blob: an icosahedron (20 faces) with radii rx,ry,rz around cx,cy,cz. Optional lighter top colour. */
  ico(cx, cy, cz, rx, ry, rz, rotY, col, colTop = col) {
    const c = Math.cos(rotY), s = Math.sin(rotY);
    const V = ICO_V.map(v => {
      const x = v[0] * rx, y = v[1] * ry, z = v[2] * rz;
      return [cx + x * c + z * s, cy + y, cz - x * s + z * c];
    });
    const center = [cx, cy, cz];
    for (const f of ICO_F) {
      const a = V[f[0]], b = V[f[1]], d = V[f[2]];
      const up = (ICO_V[f[0]][1] + ICO_V[f[1]][1] + ICO_V[f[2]][1]) / 3;
      const k = Math.max(0, Math.min(1, up * 1.4));
      const colr = colTop === col ? col : [col[0] + (colTop[0] - col[0]) * k, col[1] + (colTop[1] - col[1]) * k, col[2] + (colTop[2] - col[2]) * k];
      this.triOut(a[0], a[1], a[2], b[0], b[1], b[2], d[0], d[1], d[2], center, colr);
    }
  }

  /** Cone / pyramid on the ground disc: base y0, apex y0+h, `sides` facets. Colour fades from cBase to cTip. */
  cone(cx, y0, cz, r, h, sides, cBase, cTip = cBase) {
    const A = [cx, y0 + h, cz];
    for (let i = 0; i < sides; i++) {
      const a0 = (i / sides) * Math.PI * 2, a1 = ((i + 1) / sides) * Math.PI * 2;
      this.tri(cx + Math.cos(a0) * r, y0, cz + Math.sin(a0) * r, A[0], A[1], A[2], cx + Math.cos(a1) * r, y0, cz + Math.sin(a1) * r, cBase, cTip, cBase);
    }
  }

  /** Tapered cylinder (no caps except an optional top): radius r0 at y0, r1 at y0+h. */
  cyl(cx, y0, cz, r0, r1, h, sides, cBot, cTop = cBot, cap = false) {
    const y1 = y0 + h;
    for (let i = 0; i < sides; i++) {
      const a0 = (i / sides) * Math.PI * 2, a1 = ((i + 1) / sides) * Math.PI * 2;
      const x00 = cx + Math.cos(a0) * r0, z00 = cz + Math.sin(a0) * r0, x01 = cx + Math.cos(a1) * r0, z01 = cz + Math.sin(a1) * r0;
      const x10 = cx + Math.cos(a0) * r1, z10 = cz + Math.sin(a0) * r1, x11 = cx + Math.cos(a1) * r1, z11 = cz + Math.sin(a1) * r1;
      this.quad(x00, y0, z00, x10, y1, z10, x11, y1, z11, x01, y0, z01, cBot, cTop, cTop, cBot);
      if (cap) this.tri(cx, y1, cz, x11, y1, z11, x10, y1, z10, cTop);
    }
  }

  /** Thin double-sided blade (for grass, wheat leaves): base centre (x,y0,z), width w, height h, bend dx at the tip. */
  blade(x, y0, z, w, h, rotY, bend, cBase, cTip = cBase) {
    const c = Math.cos(rotY), s = Math.sin(rotY), hw = w / 2;
    const bx0 = x - hw * c, bz0 = z + hw * s, bx1 = x + hw * c, bz1 = z - hw * s;
    const tx = x + bend * s, tz = z + bend * c;
    this.tri(bx0, y0, bz0, bx1, y0, bz1, tx, y0 + h, tz, cBase, cBase, cTip);
    this.tri(bx1, y0, bz1, bx0, y0, bz0, tx, y0 + h, tz, cBase, cBase, cTip);
  }

  /** Diamond (octahedron), used for pick-ups and sparks. */
  octa(cx, cy, cz, rx, ry, rz, col, colTop = col) {
    const P = [[cx + rx, cy, cz], [cx - rx, cy, cz], [cx, cy, cz + rz], [cx, cy, cz - rz]];
    const T = [cx, cy + ry, cz], B = [cx, cy - ry, cz];
    const ring = [0, 2, 1, 3];
    for (let i = 0; i < 4; i++) {
      const a = P[ring[i]], b = P[ring[(i + 1) % 4]];
      this.triOut(a[0], a[1], a[2], b[0], b[1], b[2], T[0], T[1], T[2], [cx, cy, cz], colTop);
      this.triOut(a[0], a[1], a[2], b[0], b[1], b[2], B[0], B[1], B[2], [cx, cy, cz], col);
    }
  }

  /** Copy another builder's triangles, moved/rotated/scaled (used to place a prop shape into a mesh). */
  append(other, ox = 0, oy = 0, oz = 0, rotY = 0, sx = 1, sy = sx, sz = sx) {
    const c = Math.cos(rotY), s = Math.sin(rotY);
    for (let i = 0; i < other.pos.length; i += 3) {
      const x = other.pos[i] * sx, y = other.pos[i + 1] * sy, z = other.pos[i + 2] * sz;
      this.pos.push(ox + x * c + z * s, oy + y, oz - x * s + z * c);
      const nx = other.nor[i], ny = other.nor[i + 1], nz = other.nor[i + 2];
      this.nor.push(nx * c + nz * s, ny, -nx * s + nz * c);
      this.col.push(other.col[i], other.col[i + 1], other.col[i + 2]);
      this.glow.push(other.glow[i], other.glow[i + 1], other.glow[i + 2]);
    }
    if (other.hasGlow) this.hasGlow = true;
  }

  /** @returns {THREE.BufferGeometry|null} */
  toGeometry(withGlow = false) {
    if (!this.pos.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.pos), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(this.nor), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.col), 3));
    if (withGlow) g.setAttribute('aGlow', new THREE.BufferAttribute(new Float32Array(this.glow), 3));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }
}

/** Linear rgb helpers (THREE.Color converts sRGB hex to linear working space). */
const _tmp = new THREE.Color();
export function lin(hex) { _tmp.set(hex); return [_tmp.r, _tmp.g, _tmp.b]; }
export function shade(c, f) { return [c[0] * f, c[1] * f, c[2] * f]; }
export function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
