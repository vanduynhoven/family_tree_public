// aarle-rixtel-1539-world.js - G0b spike: Aarle-Rixtel, Noord-Brabant, 1539 (Era 0).
// Reconstructed from the 1811 cadastral survey and historical sources.
// No OSM data: hand-crafted inline scene data.
//
// AarleRixtel1539World extends MankWorld (same as UdenWorld extends MankWorld).
// Player: @I180@ Dirck van Duinhoven (b. ~1480, adult male, on dirt track).
// NPC:    @I178@ Thomas Diercx (b. ~1485, adult male, near church).
//
// Sint-Oda church (reconstructed): tower 6×6×15 m, nave 14×8 m, rounded apse
// 3 m radius east end. Mid-grey stone, dark roof.
// Six to eight longhouse farms ~8×20 m, thatched hip roof (brown), low eaves.
// Three to four standing stones (cylinders ~0.6 m radius, 1.5 m tall, dark grey)
// at south edge z~35-40, collision-blocked.
// Dirt track (earthy brown #5C4A2A, width ~4 m), no cobblestones.
// Field strips to the east (bk polygons encoded as buildings of type 'field').
// No water, no paved roads, heath on south edge.
//
// Coordinate system: x = east (right), z = south (down), origin at church centre.
// All values in metres.

import * as THREE from '../vendor/three/three.module.min.js';
import { MankWorld, S, hash32, box, Soup, buildGround, buildBuildings,
  buildTrees, buildLamps, NavGrid, ribbon } from './mankato-osm-world.js';

export { S, hash32, box, Soup, buildGround, buildBuildings,
  buildTrees, buildLamps, NavGrid, ribbon } from './mankato-osm-world.js';

const WINDOW_W = 120;
const WINDOW_H = 85;

// ── buildings ──────────────────────────────────────────────────────────────
// Schema matches UdenWorld: i, p (flat [x,z,...] polygon), e=eave height,
// f=floor count, r=gabled, c=wall colour index, q=roof colour index, t=type,
// o=[cx,cz, ux,uz, L,W] ridge axis.
// Colour indices (WALL palette in mankato-osm-world.js):
//   0=red brick, 1=pale orange, 2=ochre, 3=dark brick,
//   4=cream plaster, 5=warm grey (stone), 6=light plaster.
// For thatch: c=5 (warm grey wattle/daub), q=2 (ochre = straw-brown roof).

const BUILDINGS = [
  // ── Longhouse farms (8×20 m, thatched hip roof) ──────────────────────────
  // Farm 1: NW of church
  { i: 2001, e: 3.5, f: 1, r: 1, c: 5, q: 2, t: 'f',
    p: [-38, -24, -18, -24, -18, -4, -38, -4],
    o: [-28, -14, 1, 0, 20, 8] },
  // Farm 2: N of church
  { i: 2002, e: 3.5, f: 1, r: 1, c: 5, q: 2, t: 'f',
    p: [-12, -36, 8, -36, 8, -16, -12, -16],
    o: [-2, -26, 1, 0, 20, 8] },
  // Farm 3: NE of church
  { i: 2003, e: 3.5, f: 1, r: 1, c: 4, q: 2, t: 'f',
    p: [14, -32, 34, -32, 34, -12, 14, -12],
    o: [24, -22, 1, 0, 20, 8] },
  // Farm 4: E of church
  { i: 2004, e: 3.5, f: 1, r: 1, c: 5, q: 2, t: 'f',
    p: [30, -4, 50, -4, 50, 16, 30, 16],
    o: [40, 6, 1, 0, 20, 8] },
  // Farm 5: SE of church
  { i: 2005, e: 3.5, f: 1, r: 1, c: 4, q: 2, t: 'f',
    p: [18, 10, 38, 10, 38, 30, 18, 30],
    o: [28, 20, 1, 0, 20, 8] },
  // Farm 6: SW of church
  { i: 2006, e: 3.5, f: 1, r: 1, c: 5, q: 2, t: 'f',
    p: [-36, 8, -16, 8, -16, 28, -36, 28],
    o: [-26, 18, 1, 0, 20, 8] },
  // Farm 7: W of church (smaller ~8×14 m)
  { i: 2007, e: 3.5, f: 1, r: 1, c: 4, q: 2, t: 'f',
    p: [-50, -10, -30, -10, -30, 4, -50, 4],
    o: [-40, -3, 1, 0, 14, 8] },
  // Farm 8: far N
  { i: 2008, e: 3.5, f: 1, r: 1, c: 5, q: 2, t: 'f',
    p: [-8, -52, 12, -52, 12, -38, -8, -38],
    o: [2, -45, 1, 0, 20, 8] },
];

// ── roads / paths ─────────────────────────────────────────────────────────
// Dirt track only (type 'f' = earthy brown #5C4A2A), ~4 m wide.
// Override road colour via the 'f' type in ROAD_COL in mankato-osm-world.js
// (earthy brown). No cobblestone roads in 1539.
const ROADS = [
  // Main track through the village, N–S
  { k: 'f', w: 4.0, p: [4, -90, 6, -50, 8, -12, 10, 0, 12, 28, 14, 55] },
  // Cross track W–E through village centre
  { k: 'f', w: 3.5, p: [-55, -2, -35, -1, -8, 0, 10, 0, 28, 2, 50, 5] },
  // Path to NW farms
  { k: 'f', w: 2.5, p: [-18, -4, -26, -14, -38, -16] },
  // Path to NE farm
  { k: 'f', w: 2.5, p: [14, -12, 22, -22, 32, -24] },
  // Path to SE/S farms
  { k: 'f', w: 2.5, p: [12, 28, 18, 16, 26, 8] },
];

// ── world data ────────────────────────────────────────────────────────────
export const AARLE_1539_DATA = {
  meta: {
    source: 'Reconstructed from 1811 cadastral survey and historical sources',
    attribution: 'Reconstructed from 1811 cadastral survey and historical sources',
    unit: 'metre',
    axes: 'x right (east), z down (south), origin = Sint-Oda church centre',
    window_m: { w: WINDOW_W, h: WINDOW_H },
    margin_m: 0,
    water_clip_m: [WINDOW_W / 2 + 10, WINDOW_H / 2 + 10],
    era: 0,
    era_year: 1539,
    place: 'Aarle-Rixtel, Noord-Brabant',
  },
  b: BUILDINGS,
  r: ROADS,
  w: [],          // no water
  bk: [],         // no quay banks
  t: [            // a few trees (heathland edge and field borders)
    [-48, -26, 5.0],
    [-50, 32, 4.5],
    [48, -10, 4.8],
    [46, 28, 4.2],
    [-40, 38, 4.5],
    [38, -36, 4.0],
  ],
  l: [],          // no street lamps in 1539
  start: [8, -12],   // Dirck on dirt track near church
  npc: [6, 4],       // Thomas near church entrance
};

// ── the world ─────────────────────────────────────────────────────────────
export class AarleRixtel1539World extends MankWorld {
  constructor(canvas, tier, data) {
    super(canvas, tier, data || AARLE_1539_DATA);
    this._churchLabelEl  = null;
    this._churchLabelPos = null;
    this._stonesBlocked  = [];   // standing-stone nav-block positions
  }

  // ── overrides ────────────────────────────────────────────────────────────

  _buildWorld() {
    super._buildWorld();

    // ── church DOM label ─────────────────────────────────────────────────
    const el = document.createElement('div');
    el.id = 'church-label';
    el.style.cssText = [
      'position:absolute',
      'background:rgba(0,0,0,.70)',
      'color:#fff',
      'font-size:11px',
      'padding:2px 7px',
      'border-radius:10px',
      'white-space:nowrap',
      'pointer-events:none',
      'transform:translate(-50%,-100%)',
      'display:none',
    ].join(';');
    document.getElementById('ui').appendChild(el);
    this._churchLabelEl = el;

    // ── Sint-Oda church (reconstructed) ──────────────────────────────────
    this._addSintOdaKerk(this._scene);

    // ── standing stones ───────────────────────────────────────────────────
    this._addStandingStones(this._scene);

    // ── era label ─────────────────────────────────────────────────────────
    const note = document.getElementById('s-note');
    if (note) note.textContent = 'G0b spike (Reconstructed · Era 0 · 1539 · Aarle-Rixtel, NL) — not part of the game';

    // ── landmark (church) for g0b_check screenshot ───────────────────────
    const k = this._nav.cellOf(0, 0);
    if (this.buildInfo) this.buildInfo.landmark = { x: k.c, y: k.r, zoom: 28 };
  }

  // ── Sint-Oda church (reconstructed from typological sources) ─────────
  // Tower 6×6×15 m. Nave 14×8 m. Rounded apse 3 m radius east end.
  // Mid-grey stone (#909090), dark grey roof (#5a5a5a).
  _addSintOdaKerk(scene) {
    const cx = 0, cz = 0;

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x909090 });
    const roofMat  = new THREE.MeshLambertMaterial({ color: 0x5a5a5a });
    const winMat   = new THREE.MeshLambertMaterial({ color: 0x1a2a3a });

    // ── Tower ────────────────────────────────────────────────────────────
    const twSz = 6 * S, twH = 15 * S;
    // Placed west of nave: nave starts at cx, tower to the west
    const twCx = cx - (14 * S) / 2 - twSz / 2;
    const twCz = cz;

    const tower = new THREE.Mesh(new THREE.BoxGeometry(twSz, twH, twSz), stoneMat);
    tower.position.set(twCx, twH / 2, twCz);
    tower.castShadow = tower.receiveShadow = this._tier !== 'low';
    scene.add(tower);

    // Narrow window slits on the tower upper half (belfry)
    const winGeo = new THREE.BoxGeometry(0.5 * S, 1.5 * S, 0.05 * S);
    const belfryY = twH * 0.72;
    const winFaces = [
      [twCx, twCz + twSz / 2 + 0.04],
      [twCx, twCz - twSz / 2 - 0.04],
    ];
    for (const [wx, wz] of winFaces) {
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(wx, belfryY, wz);
      scene.add(win);
    }

    // Pyramidal tower cap
    const capH = 4 * S;
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0, twSz * 0.62, capH, 4),
      roofMat,
    );
    cap.rotation.y = Math.PI / 4;
    cap.position.set(twCx, twH + capH / 2, twCz);
    cap.castShadow = this._tier !== 'low';
    scene.add(cap);

    // ── Nave ─────────────────────────────────────────────────────────────
    const naveW = 14 * S, naveD = 8 * S, naveH = 6 * S;
    const nave = new THREE.Mesh(new THREE.BoxGeometry(naveW, naveH, naveD), stoneMat);
    nave.position.set(cx, naveH / 2, cz);
    nave.castShadow = nave.receiveShadow = this._tier !== 'low';
    scene.add(nave);

    // Gabled roof: ridge along east-west (x) axis
    const ridgeRise = 3.0 * S, oh = 0.15 * S;
    const nHW = naveW / 2 + oh, nHD = naveD / 2 + oh;
    const eY = naveH, ridgeY = naveH + ridgeRise;

    const rv = new Float32Array([
      // south slope
      cx - nHW, eY, cz + nHD,  cx + nHW, eY, cz + nHD,
      cx + nHW, ridgeY, cz,     cx - nHW, ridgeY, cz,
      // north slope
      cx + nHW, eY, cz - nHD,  cx - nHW, eY, cz - nHD,
      cx - nHW, ridgeY, cz,     cx + nHW, ridgeY, cz,
      // west gable
      cx - nHW, eY, cz - nHD,  cx - nHW, eY, cz + nHD,  cx - nHW, ridgeY, cz,
      // east gable
      cx + nHW, eY, cz + nHD,  cx + nHW, eY, cz - nHD,  cx + nHW, ridgeY, cz,
    ]);
    const ri = new Uint16Array([
      0, 1, 2,  0, 2, 3,
      4, 5, 6,  4, 6, 7,
      8, 9, 10,
      11, 12, 13,
    ]);
    const rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.Float32BufferAttribute(rv, 3));
    rg.setIndex(new THREE.BufferAttribute(ri, 1));
    rg.computeVertexNormals();
    const naveRoof = new THREE.Mesh(rg, roofMat);
    naveRoof.castShadow = this._tier !== 'low';
    scene.add(naveRoof);

    // ── Rounded apse east end ─────────────────────────────────────────────
    const apseR = 3 * S, apseH = 5 * S;
    const apse = new THREE.Mesh(
      new THREE.CylinderGeometry(apseR, apseR, apseH, 8, 1, false, -Math.PI / 2, Math.PI),
      stoneMat,
    );
    apse.position.set(cx + naveW / 2, apseH / 2, cz);
    apse.castShadow = this._tier !== 'low';
    scene.add(apse);

    // Conical apse cap
    const apseCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0, apseR, apseR * 0.8, 8, 1, false, -Math.PI / 2, Math.PI),
      roofMat,
    );
    apseCap.position.set(cx + naveW / 2, apseH + apseR * 0.4, cz);
    apseCap.castShadow = this._tier !== 'low';
    scene.add(apseCap);

    // Store label position
    this._churchLabelPos = new THREE.Vector3(twCx, twH + capH + 0.6 * S, twCz);
  }

  // ── standing stones — 3 stones at south edge ──────────────────────────
  // Cylinders ~0.6 m radius, 1.5 m tall, dark grey. Collision-blocked via
  // the nav-grid dot() method not available here — we add them as small
  // building footprint squares so NavGrid stamps them blocked.
  // They are added as THREE.Mesh objects for rendering.
  _addStandingStones(scene) {
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const stones = [
      [-16, 37],
      [-8, 39],
      [2, 36],
      [10, 38],   // 4 stones
    ];
    for (const [xm, zm] of stones) {
      const geo = new THREE.CylinderGeometry(0.6 * S, 0.6 * S, 1.5 * S, 8);
      const mesh = new THREE.Mesh(geo, stoneMat);
      mesh.position.set(xm * S, 0.75 * S, zm * S);
      mesh.castShadow = this._tier !== 'low';
      scene.add(mesh);

      // Block nav cells under each stone (2×2 m square footprint)
      const rad = 0.9 * S;  // slightly larger than the stone radius for safety
      const { c, r } = this._nav.cellOf(xm * S, zm * S);
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nc = c + dc, nr = r + dr;
          if (this._nav.inRange(nc, nr)) this._nav.blocked[nr * this._nav.nx + nc] = 1;
        }
      }
    }
  }

  // Project church tower apex to screen and show the DOM label.
  _updateDomLabels() {
    super._updateDomLabels();
    if (!this._churchLabelEl || !this._churchLabelPos) return;
    const proj = this._churchLabelPos.clone().project(this._camera);
    const rect = this._canvas.getBoundingClientRect();
    if (proj.z < 1) {
      const sx = (proj.x * 0.5 + 0.5) * rect.width;
      const sy = (-proj.y * 0.5 + 0.5) * rect.height;
      this._churchLabelEl.style.left    = sx + 'px';
      this._churchLabelEl.style.top     = sy + 'px';
      this._churchLabelEl.style.display = 'block';
      this._churchLabelEl.textContent   = 'Sint-Oda kerk (reconstructed)';
    } else {
      this._churchLabelEl.style.display = 'none';
    }
  }

  // Dirck van Duinhoven (@I180@, b. ~1480, on the dirt track near the church).
  _showBubble() {
    const head = this._npcMesh.position.clone(); head.y += 1.1;
    const proj = head.clone().project(this._camera);
    const rect = this._canvas.getBoundingClientRect();
    const sx = (proj.x * 0.5 + 0.5) * rect.width  + rect.left;
    const sy = (-proj.y * 0.5 + 0.5) * rect.height + rect.top;
    this._bubbleEl.style.left = sx + 'px';
    this._bubbleEl.style.top  = (sy - 10) + 'px';
    this._bubbleText.textContent =
      'Goedendag! Sint-Oda waakt over ons dorp. Ziet u de kerktoren al van ver?';
    this._bubbleEl.style.display = 'block';
  }
}
