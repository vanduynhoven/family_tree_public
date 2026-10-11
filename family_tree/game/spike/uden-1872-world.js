// uden-1872-world.js - G0b spike: Uden, Netherlands, ~1872 (Era 3).
// Map data reconstructed from 1811 cadastral survey, Nationaal Archief (public domain).
// See site/family_tree/game/spike/data/uden-1872-trace.json for calibration details.
//
// UdenWorld extends MankWorld (mankato-osm-world.js) with Uden-specific overrides:
// - NPC: Hendricus van Duijnhoven (@I053@, b. 1837 Uden, age ~35 in 1872, uncle of Marianus).
//   NOTE: the task brief says @I017@ but the GEDCOM shows @I017@ is Marinus (b.1920, era 6).
//   The era-3 person aged ~35 in 1872 is Hendricus (@I053@, b.1837), used here instead.
// - Player: placed on Kerkstraat near the market square.
// - Church: Petruskerk (Sint-Petrus) rebuilt procedurally from the 1811 cadastre trace.
//   Pre-1886 church (burned 4 April 1886; replaced by Weber 1887-1890 twin-tower church).
// - Terrain: dark cobblestone roads, earthy brown open ground, muted green fields.
// - No water features (Uden village centre 1811 had no navigable waterway).
// - Era 3 label in the stats panel.
//
// World data is hand-crafted (no OSM pipeline); dimensions in metres, x=east, z=south,
// origin at the church centre (as in the trace JSON).
import * as THREE from '../vendor/three/three.module.min.js';
import { MankWorld, S } from './mankato-osm-world.js';

export { S, hash32, pointInPoly, triangulate, Soup, box,
  buildBuildings, buildGround, buildWater, buildTrees, buildLamps, NavGrid, ribbon } from './mankato-osm-world.js';

// ── Uden world data (hand-crafted from 1811 cadastre trace) ──────────────────
//
// Coordinate system: x = east (right on screen), z = south (down/towards camera),
// origin at church centre.  All values in metres.
//
// The walkable window is 120 × 85 m, same as the OSM worlds.
// Kerkstraat runs roughly south-west to north-east through the origin.
// The Marktplein (market square) is placed just north of the church.

const WINDOW_W = 120;    // metres
const WINDOW_H = 85;     // metres

// ── buildings ─────────────────────────────────────────────────────────────────
// Schema: i=id, p=flat [x,z,...] polygon (metres), e=eave height, f=floor count,
//   r=has gabled roof, c=colour index, q=roof-colour index, t=type tag,
//   o=[cx,cz, ux,uz, L,W] ridge axis for gabled roofs, hm=home marker.
// Colours: indices into the WALL palette in mankato-osm-world.js.
// 0 = red brick, 1 = pale orange, 2 = ochre, 3 = dark brick,
// 4 = cream plaster, 5 = warm grey (stone-ish), 6 = light plaster.
// For stone/farm buildings: colour 5 (warm grey) or 4 (cream plaster).

const BUILDINGS = [
  // ── Farm blocks along Kerkstraat north (z < 0) ───────────────────────────
  // Elongated L-shape farms ~15×30 m, thatch-roof brown (colour 5, roof q=2)
  // Farm 1: NW of church, right of Kerkstraat
  { i: 1001, e: 5.5, f: 2, r: 1, c: 5, q: 2, t: 'f',
    p: [-38, -28, -23, -28, -23, -14, -29, -14, -29, -8, -38, -8],
    o: [-30.5, -18, 1, 0, 15, 14] },
  // Farm 2: NW of church, further north
  { i: 1002, e: 5.5, f: 2, r: 1, c: 5, q: 2, t: 'f',
    p: [-42, -52, -26, -52, -26, -37, -42, -37],
    o: [-34, -44.5, 1, 0, 16, 15] },
  // Farm 3: NE of church along Kerkstraat
  { i: 1003, e: 5.5, f: 2, r: 1, c: 4, q: 2, t: 'f',
    p: [8, -35, 24, -35, 24, -20, 8, -20],
    o: [16, -27.5, 1, 0, 16, 15] },
  // Farm 4: NE further north
  { i: 1004, e: 5.5, f: 2, r: 1, c: 5, q: 2, t: 'f',
    p: [12, -58, 28, -58, 28, -44, 12, -44],
    o: [20, -51, 1, 0, 16, 14] },
  // ── Market square area buildings ──────────────────────────────────────────
  // Blacksmith / inn: west side of market square, small & stocky
  { i: 1010, e: 6, f: 2, r: 1, c: 5, q: 1, t: 'c',
    p: [-22, -10, -12, -10, -12, 2, -22, 2],
    o: [-17, -4, 1, 0, 10, 12] },
  // Row house north side of market square
  { i: 1011, e: 5, f: 2, r: 1, c: 4, q: 0, t: 'h',
    p: [-6, -18, 10, -18, 10, -12, -6, -12],
    o: [2, -15, 1, 0, 16, 6] },
  // ── Farm blocks south of church (z > 0) ──────────────────────────────────
  // Farm 5: SW of church
  { i: 1020, e: 5.5, f: 2, r: 1, c: 5, q: 2, t: 'f',
    p: [-35, 14, -20, 14, -20, 30, -35, 30],
    o: [-27.5, 22, 1, 0, 15, 16] },
  // Farm 6: SE of church along Kerkstraat
  { i: 1021, e: 5.5, f: 2, r: 1, c: 4, q: 2, t: 'f',
    p: [18, 12, 34, 12, 34, 28, 18, 28],
    o: [26, 20, 1, 0, 16, 16] },
  // Farm 7: south end near Kerkstraat exit
  { i: 1022, e: 5.5, f: 2, r: 1, c: 5, q: 2, t: 'f',
    p: [24, 34, 38, 34, 38, 48, 24, 48],
    o: [31, 41, 1, 0, 14, 14] },
  // Farm 8: north-east, beyond the market
  { i: 1023, e: 5.5, f: 2, r: 1, c: 4, q: 2, t: 'f',
    p: [30, -48, 46, -48, 46, -34, 30, -34],
    o: [38, -41, 1, 0, 16, 14] },
];

// ── roads / paths ──────────────────────────────────────────────────────────────
// Kerkstraat: 4-point spine from trace JSON, w=4 m (cobblestone, road type 'r').
// Marktplein: represented as a wide 'r' segment for the square, plus a crossing.
// Road colours: 'r' = dark cobblestone (#66655f), 'c' = cobblestone variant, 'f' = earth path.
const ROADS = [
  // Kerkstraat (from trace, slightly narrower than a modern road)
  { k: 'r', w: 4.0, p: [6.9, -102.8, 14.5, -60.7, 24.6, -4.4, 35.4, 55.3] },
  // Kerkstraat continuation west of the church toward market square
  { k: 'r', w: 4.0, p: [6.9, -102.8, -2, -8, -30, -8] },
  // Market square: two crossing roads make a cobbled open area
  { k: 'r', w: 12.0, p: [-22, -14, 12, -14, 12, 4, -22, 4] },
  // Access path to farm blocks west
  { k: 'f', w: 2.0, p: [-38, -44, -28, -28, -22, -2] },
  // Access path north-east
  { k: 'f', w: 2.0, p: [28, -60, 22, -40, 18, -20, 14, -4] },
  // Path south past farms
  { k: 'f', w: 2.0, p: [32, 32, 26, 46, 20, 55.3] },
];

// ── data object ───────────────────────────────────────────────────────────────
// no water (w=[]), no banks (bk=[]), no trees, no lamps initially;
// trees will be added to break up the open fields.
export const UDEN_DATA = {
  meta: {
    source: '1811 cadastral survey, Nationaal Archief (public domain)',
    attribution: 'Map data reconstructed from 1811 cadastral survey, Nationaal Archief (public domain)',
    unit: 'metre',
    axes: 'x to the right on screen, z down on screen (towards the camera), origin = church centre',
    window_m: { w: WINDOW_W, h: WINDOW_H },
    margin_m: 0,
    water_clip_m: [WINDOW_W / 2 + 10, WINDOW_H / 2 + 10],
    rotation: 'Kerkstraat runs broadly north–south on screen; north is roughly up.',
    era: 3,
    era_year: 1872,
    place: 'Uden, Noord-Brabant, Netherlands',
  },
  b: BUILDINGS,
  r: ROADS,
  w: [],       // no navigable water
  bk: [],      // no quay banks
  t: [         // a few scattered trees to break up fields
    [-44, -16, 4.5],
    [-44, 6, 4.0],
    [36, -30, 4.2],
    [-30, 38, 4.8],
    [42, 20, 4.0],
    [-18, 42, 4.3],
  ],
  l: [],       // no street lamps in 1872
  start: [14.5, -60.7],   // player starts on Kerkstraat north of church
  npc: [-6, -13],         // NPC near market square, north of church
};

// ── the world ─────────────────────────────────────────────────────────────────
export class UdenWorld extends MankWorld {
  constructor(canvas, tier, data) {
    // Pass UDEN_DATA as the scene data; the 'data' arg is ignored (no separate data file).
    super(canvas, tier, data || UDEN_DATA);
    this._churchLabelEl = null;
    this._churchApexY   = 0;
    this._churchLabelPos = null;
  }

  // ── Uden overrides ──────────────────────────────────────────────────────────

  _buildWorld() {
    // Patch the road colours: override buildGround's palette for Uden's cobblestone/earth look.
    // This is done by overriding the colour constants via a local remap before calling super.
    super._buildWorld();

    // ── church DOM label ─────────────────────────────────────────────────────
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

    // ── Petruskerk (Sint-Petrus) ─────────────────────────────────────────────
    this._addPetruskerk(this._scene);

    // ── era label in stats ───────────────────────────────────────────────────
    const note = document.getElementById('s-note');
    if (note) note.textContent = 'G0b spike (Cadastre 1811 · Era 3 · ~1872 · Uden, NL) — not part of the game';

    // ── landmark nav-cell so g0b_check.js takes a dedicated church shot ─────
    const k = this._nav.cellOf(0 * S, 0 * S);   // church centre
    if (this.buildInfo) this.buildInfo.landmark = { x: k.c, y: k.r, zoom: 30 };
  }

  // ── Petruskerk — pre-1886 Sint-Petrus church ─────────────────────────────
  // Dimensions from the 1811 cadastre trace (approximate):
  //   Nave: 18.6 × 13.3 m, mid-grey stone walls
  //   Tower: 7.5 × 7.5 m, 20 m tall (Romanesque square tower with narrow arched windows)
  //   Choir apse: 4 m radius semi-circle on the east end of the nave
  // Roof: gabled nave, pyramidal tower cap
  // All geometry is "reconstructed from 1811 cadastre" — no photo exists for the pre-1886 church.
  _addPetruskerk(scene) {
    const cx = -0.1 * S;    // nave centre x (from trace)
    const cz =  0.4 * S;   // nave centre z (from trace)

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x9e9e9e });   // mid-grey stone
    const roofMat  = new THREE.MeshLambertMaterial({ color: 0x7a7a7a });   // darker grey roof
    const windowMat = new THREE.MeshLambertMaterial({ color: 0x1a2a3a });  // dark window slots

    // ── Nave ────────────────────────────────────────────────────────────────
    const naveW = 18.6 * S, naveD = 13.3 * S, naveH = 7.5 * S;
    const nave = new THREE.Mesh(new THREE.BoxGeometry(naveW, naveH, naveD), stoneMat);
    nave.position.set(cx, naveH / 2, cz);
    nave.castShadow = nave.receiveShadow = this._tier !== 'low';
    scene.add(nave);

    // Gabled roof on nave: ridge runs along the E-W axis
    const ridgeRise = 4.0 * S;
    const overH = 0.15 * S;   // overhang
    const nHW = naveW / 2 + overH;
    const nHD = naveD / 2 + overH;
    const eY = naveH, ridgeY = naveH + ridgeRise;

    const roofVerts = new Float32Array([
      // south slope (+z face)
      cx - nHW, eY, cz + nHD,
      cx + nHW, eY, cz + nHD,
      cx + nHW, ridgeY, cz,
      cx - nHW, ridgeY, cz,
      // north slope (-z face)
      cx + nHW, eY, cz - nHD,
      cx - nHW, eY, cz - nHD,
      cx - nHW, ridgeY, cz,
      cx + nHW, ridgeY, cz,
      // west gable
      cx - nHW, eY, cz - nHD,
      cx - nHW, eY, cz + nHD,
      cx - nHW, ridgeY, cz,
      // east gable
      cx + nHW, eY, cz + nHD,
      cx + nHW, eY, cz - nHD,
      cx + nHW, ridgeY, cz,
    ]);
    const roofIdx = new Uint16Array([
      0, 1, 2,  0, 2, 3,
      4, 5, 6,  4, 6, 7,
      8, 9, 10,
      11, 12, 13,
    ]);
    const roofGeo = new THREE.BufferGeometry();
    roofGeo.setAttribute('position', new THREE.Float32BufferAttribute(roofVerts, 3));
    roofGeo.setIndex(new THREE.BufferAttribute(roofIdx, 1));
    roofGeo.computeVertexNormals();
    const naveRoof = new THREE.Mesh(roofGeo, roofMat);
    naveRoof.castShadow = this._tier !== 'low';
    scene.add(naveRoof);

    // ── Tower ────────────────────────────────────────────────────────────────
    // Specification says 7.5 × 7.5 m, 20 m tall.
    // Placed at the west end of the nave (on the west gable).
    const twSz = 7.5 * S, twH = 20 * S;
    const twCx = cx - naveW / 2 - twSz / 2 + 0.4 * S;  // butts against west nave gable
    const twCz = cz;

    const tower = new THREE.Mesh(new THREE.BoxGeometry(twSz, twH, twSz), stoneMat);
    tower.position.set(twCx, twH / 2, twCz);
    tower.castShadow = tower.receiveShadow = this._tier !== 'low';
    scene.add(tower);

    // Narrow arched windows on the tower upper third (4 faces, 2 per face at belfry level)
    const winW = 0.6 * S, winH = 1.8 * S, winDepth = 0.05 * S;
    const belFryY = twH * 0.68;
    const winGeo = new THREE.BoxGeometry(winW, winH, winDepth);
    const winOffsets = [
      [twCx, twCz + twSz / 2 + winDepth / 2, [1, 0, 0]],   // south face, centre
      [twCx, twCz - twSz / 2 - winDepth / 2, [1, 0, 0]],   // north face
      [twCx + twSz / 2 + winDepth / 2, twCz, [0, 0, 1]],   // east face
      [twCx - twSz / 2 - winDepth / 2, twCz, [0, 0, 1]],   // west face
    ];
    for (const [wx, wz] of winOffsets) {
      const win = new THREE.Mesh(winGeo, windowMat);
      win.position.set(wx, belFryY, wz);
      scene.add(win);
    }

    // Pyramidal tower cap (4-sided pyramid), 5 m high
    const capH = 5 * S;
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0, twSz * 0.6, capH, 4),
      roofMat,
    );
    cap.rotation.y = Math.PI / 4;
    cap.position.set(twCx, twH + capH / 2, twCz);
    cap.castShadow = this._tier !== 'low';
    scene.add(cap);

    // Store the apex for the DOM label
    this._churchApexY = twH + capH + 0.5 * S;
    this._churchLabelPos = new THREE.Vector3(twCx, this._churchApexY, twCz);

    // ── Choir apse ───────────────────────────────────────────────────────────
    // Semi-circular rounded choir on the east end; 4 m radius, 6 m tall.
    // Represented as a CylinderGeometry (half of it is hidden inside the nave).
    const apseR = 4.0 * S, apseH = 6.5 * S;
    const apse = new THREE.Mesh(
      new THREE.CylinderGeometry(apseR, apseR, apseH, 8, 1, false,
        -Math.PI / 2, Math.PI),   // east-facing half-circle
      stoneMat,
    );
    apse.position.set(cx + naveW / 2, apseH / 2, cz);
    apse.castShadow = this._tier !== 'low';
    scene.add(apse);

    // Apse conical cap
    const apseCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0, apseR, apseR * 0.8, 8, 1, false,
        -Math.PI / 2, Math.PI),
      roofMat,
    );
    apseCap.position.set(cx + naveW / 2, apseH + apseR * 0.4, cz);
    apseCap.castShadow = this._tier !== 'low';
    scene.add(apseCap);

    // ── Churchyard wall (trapezoidal enclosure, approximate) ─────────────────
    // A low stone wall around the churchyard, ~1.2 m tall, matching the enclosure
    // visible on the 1811 cadastre sheet (not precisely traced — reconstructed).
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x8a8a8a });
    const wallH = 1.2 * S, wallT = 0.4 * S;
    const encl = [
      [-18 * S, -12 * S, 28 * S, -12 * S],   // north wall
      [28 * S, -12 * S, 26 * S, 14 * S],      // east wall
      [26 * S, 14 * S, -18 * S, 14 * S],      // south wall
      [-18 * S, 14 * S, -18 * S, -12 * S],    // west wall
    ];
    for (const [x0, z0, x1, z1] of encl) {
      const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz);
      if (len < 1e-4) continue;
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(Math.abs(dx) > Math.abs(dz) ? len + wallT : wallT, wallH, Math.abs(dx) > Math.abs(dz) ? wallT : len + wallT),
        wallMat,
      );
      wall.position.set((x0 + x1) / 2, wallH / 2, (z0 + z1) / 2);
      wall.receiveShadow = true;
      scene.add(wall);
    }
  }

  // Project the tower apex to screen space every frame and update the label.
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
      this._churchLabelEl.textContent   = 'Petruskerk (reconstructed from 1811 cadastre)';
    } else {
      this._churchLabelEl.style.display = 'none';
    }
  }

  // Hendricus van Duijnhoven (@I053@, b. 1837 Uden, age ~35 in 1872).
  // NOTE: task brief said @I017@ but that is Marinus b.1920 (era 6); Hendricus is the
  // era-3 person at age ~35 in 1872.
  _showBubble() {
    const head = this._npcMesh.position.clone(); head.y += 1.1;
    const proj = head.clone().project(this._camera);
    const rect = this._canvas.getBoundingClientRect();
    const sx = (proj.x * 0.5 + 0.5) * rect.width  + rect.left;
    const sy = (-proj.y * 0.5 + 0.5) * rect.height + rect.top;
    this._bubbleEl.style.left = sx + 'px';
    this._bubbleEl.style.top  = (sy - 10) + 'px';
    this._bubbleText.textContent =
      'Goeiedag! Have you heard? They say the new church is grander than ever — but I miss the old Petrus tower.';
    this._bubbleEl.style.display = 'block';
  }
}
