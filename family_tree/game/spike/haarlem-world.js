// haarlem-world.js — G0 Spike (revised pass 2)
// Three.js 3D world for the Haarlem home screen.
// Imports three from the vendored relative path (no import map, Safari 15 compat).
import * as THREE from '../vendor/three/three.module.min.js';
import { GRID, COLS, ROWS, T, SOLID, PLAYER_START, NPC_SPAWN, NPC } from './haarlem-screen.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const TILE = 1;
const HALF = TILE / 2;

// Era-8 lighting palette (era-lighting.md row 7: "modern / clear sky")
const ERA8 = {
  skyTop:       new THREE.Color(0x3870b8),  // rich mid-blue
  skyHorizon:   new THREE.Color(0x90c8e8),  // pale horizon
  sunColor:     new THREE.Color(0xfff0d8),
  sunIntensity: 1.6,
  hemSky:       new THREE.Color(0xb8d8f0),
  hemGnd:       new THREE.Color(0x405030),
  hemIntensity: 0.55,
  ambIntensity: 0.30,
  fogColor:     new THREE.Color(0x7aaad8),
  fogNear:      46,
  fogFar:       95,
};

// Tile colours — linear values (Three.js Color() does sRGB→linear automatically)
const TILE_COLOR = {
  [T.GRASS]:      0x66aa30,
  [T.WATER]:      0x1a60a8,
  [T.COBBLE]:     0xc0aa80,
  [T.ROAD]:       0x706858,
  [T.HOUSE_WALL]: 0xc0aa80,   // cobble beneath building
  [T.HOUSE_ROOF]: 0xc0aa80,
  [T.BRICK]:      0xb06038,
  [T.DOOR]:       0x5a2808,
  [T.BRIDGE]:     0xc8a060,
  [T.FLOWER]:     0xf0c020,
  [T.PORTAL]:     0x7030d0,
  [T.TREE]:       0x66aa30,
  [T.ROCK]:       0x787060,
  [T.PINE]:       0x2a5820,
  [T.DIRT]:       0x986838,
  [T.WHEAT]:      0xe8c040,
  [T.CROP_READY]: 0xd0a828,
  [T.CROP_SPENT]: 0x806858,
  [T.SAND]:       0xe8d080,
  [T.CIRCUIT]:    0x304858,
  [T.WALL]:       0x585040,
  [T.DEEP_WATER]: 0x103060,
  [T.CLIFF]:      0x605848,
  [T.PLANK]:      0xb89060,
  [T.STEEL]:      0x607080,
  [T.CORN]:       0xd0a830,
};

// Height offsets — water sunken, paths/cobble slightly raised
const TILE_HEIGHT = {
  [T.WATER]:      -0.10,
  [T.DEEP_WATER]: -0.16,
  [T.ROAD]:        0.04,
  [T.COBBLE]:      0.05,
  [T.BRIDGE]:      0.07,
  [T.PORTAL]:      0.06,
  [T.FLOWER]:      0.03,
  [T.GRASS]:       0.02,
};

function tileH(id) { return TILE_HEIGHT[id] !== undefined ? TILE_HEIGHT[id] : 0; }
function tileColor(id) {
  const c = TILE_COLOR[id];
  return (c !== undefined && c !== 0) ? c : 0x888880;
}

// A* pathfinding (unchanged)
function astar(grid, sr, sc, er, ec) {
  const rows = grid.length, cols = grid[0].length;
  function key(r, c) { return r * 100 + c; }
  function h(r, c)   { return Math.abs(r-er) + Math.abs(c-ec); }
  const open = [{ r:sr, c:sc, g:0, f:h(sr,sc), parent:null }];
  const closed = new Set(), best = new Map();
  best.set(key(sr,sc), 0);
  while (open.length) {
    open.sort((a,b) => a.f - b.f);
    const cur = open.shift();
    if (cur.r === er && cur.c === ec) {
      const path = []; let n = cur;
      while (n) { path.unshift({r:n.r,c:n.c}); n = n.parent; }
      return path;
    }
    const ck = key(cur.r, cur.c);
    if (closed.has(ck)) continue;
    closed.add(ck);
    for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = cur.r+dr, nc = cur.c+dc;
      if (nr<0||nr>=rows||nc<0||nc>=cols) continue;
      if (SOLID.has(grid[nr][nc])) continue;
      const nk = key(nr,nc);
      if (closed.has(nk)) continue;
      const ng = cur.g + 1;
      if ((best.get(nk)||Infinity) <= ng) continue;
      best.set(nk, ng);
      open.push({ r:nr, c:nc, g:ng, f:ng+h(nr,nc), parent:cur });
    }
  }
  return null;
}

// Build a sky gradient canvas texture (top→horizon gradient)
function makeSkyTexture() {
  const c = document.createElement('canvas');
  c.width = 1; c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0,   '#' + ERA8.skyTop.getHexString());
  g.addColorStop(1,   '#' + ERA8.skyHorizon.getHexString());
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class HaarlemWorld {
  constructor(canvas, tier) {
    this._canvas = canvas;
    this._tier   = tier;
    this._renderer = null;
    this._scene    = null;
    this._camera   = null;
    this._clock    = new THREE.Clock();

    // Player
    this._playerTile  = { r: PLAYER_START.r, c: PLAYER_START.c };
    this._playerPos   = new THREE.Vector3(
      PLAYER_START.c * TILE + HALF, 0, PLAYER_START.r * TILE + HALF
    );
    this._playerPath   = [];
    this._playerSpeed  = 3.5;
    this._playerFacing = Math.PI;  // face south (toward camera) at idle
    this._walkTime     = 0;
    this._playerMesh   = null;
    this._armL = this._armR = this._legL = this._legR = null;

    // NPC
    this._npcTile  = { r: NPC_SPAWN.r, c: NPC_SPAWN.c };
    this._npcPos   = new THREE.Vector3(
      NPC_SPAWN.c * TILE + HALF, 0, NPC_SPAWN.r * TILE + HALF
    );
    this._npcPath  = [];
    this._npcWanderTimer = 1.5;
    this._npcMesh  = null;
    this._npcArmL = this._npcArmR = this._npcLegL = this._npcLegR = null;

    this._npcLabelEl = document.getElementById('npc-label');
    this._bubbleEl   = document.getElementById('speech-bubble');
    this._bubbleText = document.getElementById('bubble-text');
    this._ringEl     = document.getElementById('target-ring');

    // Stats
    this._fpsFrames   = [];
    this._lastFrameMs = 0;

    // Camera — desktop: frame most of the 20×14 screen.
    // Phone: follow player, ~10×12 tiles visible.
    const isPhone = window.innerWidth < 600;
    this._camZoom    = isPhone ? 24 : 34;   // distance in tiles: desktop frames the whole 20x14 screen
    this._camZoomMin = 9;
    this._camZoomMax = 48;
    this._dpr        = 1;

    // Desktop: target row 6 so the house front (row 5) + cobble area (rows 7-13) both show
    this._followPlayer = isPhone;
    this._camTarget    = new THREE.Vector3(10 * TILE, 0, 6 * TILE);

    // Water
    this._waterGeom  = null;
    this._waterBaseY = [];

    // Tap-to-walk resolve hooks
    this._tapResolvers = [];
    this._keys = new Set();
  }

  async init() {
    this._setupRenderer();
    this._setupScene();
    this._buildWorld();
    this._buildPlayer();
    this._buildNPC();
    this._setupLights();
    this._setupControls();
    // Prime camera before first frame
    if (this._followPlayer)
      this._camTarget.set(this._playerPos.x, 0, this._playerPos.z);
    this._positionCamera();
    window.addEventListener('resize', () => this._onResize());
    this._loop();
  }

  // ── Renderer ───────────────────────────────────────────────────────────────
  _setupRenderer() {
    const c = this._canvas;
    this._dpr = this._tier === 'low'    ? 1
              : this._tier === 'medium' ? Math.min(window.devicePixelRatio, 1.5)
              :                           Math.min(window.devicePixelRatio, 2);
    this._renderer = new THREE.WebGLRenderer({
      canvas: c,
      antialias: this._tier !== 'low',
      powerPreference: 'high-performance',
    });
    this._renderer.setPixelRatio(this._dpr);
    this._renderer.setSize(c.clientWidth, c.clientHeight, false);
    // sRGB output — Three.js Color() inputs are in sRGB and convert correctly
    this._renderer.outputColorSpace = THREE.SRGBColorSpace;
    this._renderer.setClearColor(new THREE.Color(0x3870b8), 1);  // fallback sky colour
    this._renderer.shadowMap.enabled = (this._tier !== 'low');
    if (this._tier === 'high') this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  // ── Scene ──────────────────────────────────────────────────────────────────
  _setupScene() {
    this._scene = new THREE.Scene();
    this._scene.fog = new THREE.Fog(ERA8.fogColor, ERA8.fogNear, ERA8.fogFar);
    // Sky gradient background texture (no sphere — avoids depth issues)
    this._scene.background = makeSkyTexture();

    this._camera = new THREE.PerspectiveCamera(30, 1, 0.1, 120);
    this._onResize();
  }

  // ── Camera ─────────────────────────────────────────────────────────────────
  _positionCamera() {
    // 35° pitch, but look at y=1.5 (partway up the facade) so the gable fits in frame
    const pitch  = Math.PI * 46 / 180;
    const d      = this._camZoom;
    // Look at a point ~1.5m up on the facade rather than ground level
    const lookAt = new THREE.Vector3(this._camTarget.x, 1.5, this._camTarget.z);
    this._camera.position.set(
      this._camTarget.x,
      1.5 + Math.sin(pitch) * d,
      this._camTarget.z + Math.cos(pitch) * d
    );
    this._camera.lookAt(lookAt);
  }

  _updateCamera() {
    if (this._followPlayer) {
      this._camTarget.x += (this._playerPos.x - this._camTarget.x) * 0.07;
      this._camTarget.z += (this._playerPos.z - this._camTarget.z) * 0.07;
    }
    // Desktop: target stays at screen centre (10,7) — already set
    this._positionCamera();
  }

  // ── Lights ─────────────────────────────────────────────────────────────────
  _setupLights() {
    // Ambient: fills shadows, keeps unlit faces visible
    this._scene.add(new THREE.AmbientLight(0xffffff, ERA8.ambIntensity));

    // Hemisphere: sky tint from above, earth from below
    const hem = new THREE.HemisphereLight(ERA8.hemSky, ERA8.hemGnd, ERA8.hemIntensity);
    this._scene.add(hem);

    // Directional sun — Dutch afternoon from SW
    const sun = new THREE.DirectionalLight(ERA8.sunColor, ERA8.sunIntensity);
    sun.position.set(6, 16, 4);
    if (this._tier !== 'low') {
      sun.castShadow = true;
      const sz = this._tier === 'high' ? 2048 : 1024;
      sun.shadow.mapSize.set(sz, sz);
      sun.shadow.camera.near   =  1;
      sun.shadow.camera.far    = 60;
      sun.shadow.camera.left   = -14;
      sun.shadow.camera.right  =  14;
      sun.shadow.camera.top    =  14;
      sun.shadow.camera.bottom = -14;
    }
    this._scene.add(sun);
    this._sun = sun;
  }

  // ── World ──────────────────────────────────────────────────────────────────
  _buildWorld() {
    this._buildGroundMesh();
    this._buildWaterMesh();
    this._buildHouse();
    this._buildProps();
  }

  _buildGroundMesh() {
    // Single merged mesh with vertex colours + height variation.
    // Uses MeshLambertMaterial so lights affect the colours naturally.
    // Winding: CCW from above (+Y) so normals face up toward camera.
    const positions = [], colours = [], normals = [], indices = [];
    let vi = 0;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const id = GRID[row][col];
        if (id === T.WATER || id === T.DEEP_WATER) continue;  // separate mesh
        const displayId = (id === T.HOUSE_WALL || id === T.HOUSE_ROOF) ? T.COBBLE : id;
        const hy = tileH(displayId !== T.COBBLE ? id : T.COBBLE);
        const x  = col * TILE, z = row * TILE;
        const c  = new THREE.Color(tileColor(displayId));
        // Small per-tile variance for organic look
        const v  = 0.96 + ((row * 11 + col * 7) % 8) * 0.005;
        positions.push(x,      hy, z,
                       x+TILE, hy, z,
                       x+TILE, hy, z+TILE,
                       x,      hy, z+TILE);
        normals.push(0,1,0, 0,1,0, 0,1,0, 0,1,0);
        colours.push(c.r*v, c.g*v, c.b*v,
                     c.r*v, c.g*v, c.b*v,
                     c.r*v, c.g*v, c.b*v,
                     c.r*v, c.g*v, c.b*v);
        // CCW from +Y: v0→v3→v2, v0→v2→v1
        indices.push(vi, vi+3, vi+2,  vi, vi+2, vi+1);
        vi += 4;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal',   new THREE.Float32BufferAttribute(normals,   3));
    geo.setAttribute('color',    new THREE.Float32BufferAttribute(colours,   3));
    geo.setIndex(indices);

    // MeshLambertMaterial with vertexColors — lit by hemisphere + sun
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = (this._tier !== 'low');
    this._scene.add(mesh);
  }

  _buildWaterMesh() {
    const WATER_Y = -0.10;
    const positions = [], indices = [], baseY = [];
    let vi = 0;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const id = GRID[row][col];
        if (id !== T.WATER && id !== T.DEEP_WATER) continue;
        const hy = WATER_Y + (id === T.DEEP_WATER ? -0.06 : 0);
        const x0 = col * TILE, z0 = row * TILE;
        const tileVi = vi;
        for (let si = 0; si <= 2; si++) {
          for (let sj = 0; sj <= 2; sj++) {
            positions.push(x0 + sj * TILE/2, hy, z0 + si * TILE/2);
            baseY.push(hy);
            vi++;
          }
        }
        // CCW from +Y
        for (let si = 0; si < 2; si++) {
          for (let sj = 0; sj < 2; sj++) {
            const b = tileVi + si*3 + sj;
            indices.push(b, b+3, b+4,  b, b+4, b+1);
          }
        }
      }
    }

    if (positions.length === 0) return;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mat = new THREE.MeshLambertMaterial({
      color: new THREE.Color(0x2878b8),
      transparent: true,
      opacity: 0.85,
    });
    const mesh = new THREE.Mesh(geo, mat);
    this._scene.add(mesh);
    this._waterGeom  = geo;
    this._waterBaseY = baseY;
  }

  // ── Dutch canal house ──────────────────────────────────────────────────────
  // Rendered as a FACADE (thin, tall) that faces the camera (south).
  // The house is at rows 1-7, cols 7-13 of the tile grid.
  // The camera looks NORTH (decreasing Z). The south face is at z0=1 (row 1).
  // We build the visible south-facing facade only — the body extends northward
  // (increasing Z) but is narrow so it doesn't occlude the facade from the camera.
  //
  // Key insight: the facade itself IS the south face. Put it at z=z0+0.1
  // (slightly south of row 1 = z=1) so it renders in front of the tile ground.
  // The body box starts at z=z0 and goes only 1.0 deep (to z=2).
  _buildHouse() {
    const x0 = 7 * TILE;   // col 7
    const z0 = 5 * TILE;   // MOVED SOUTH to row 5 — visible from the tilted camera
    const W  = 7 * TILE;   // 7 cols wide
    const H  = 4.5;        // height in world units
    const D  = 1.2;        // body depth (shallow so roof doesn't block facade)
    const cx = x0 + W / 2;
    const shadow = this._tier !== 'low';

    const lam = (hex, emissive, emissiveIntensity) => {
      const m = new THREE.MeshLambertMaterial({ color: new THREE.Color(hex) });
      if (emissive) { m.emissive = new THREE.Color(emissive); m.emissiveIntensity = emissiveIntensity; }
      return m;
    };

    // ── Body: a box slightly NORTH of z0, shallow depth ─────────────────────
    // Body center at (cx, H/2, z0 + D/2) — starts exactly at z0 going north
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), lam(0xb85030));
    body.position.set(cx, H / 2, z0 + D / 2);
    body.castShadow = body.receiveShadow = shadow;
    this._scene.add(body);

    // ── Pitched roof: a prism on top of the body ─────────────────────────────
    // Triangular cross-section, extruded depth D + a bit of overhang
    const roofH = 1.8;
    const roofD = D + 0.3;
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-W / 2 - 0.2, 0);
    roofShape.lineTo(W / 2 + 0.2, 0);
    roofShape.lineTo(0, roofH);
    roofShape.closePath();
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: roofD, bevelEnabled: false });
    const roofMesh = new THREE.Mesh(roofGeo, lam(0x703020));
    roofMesh.position.set(cx, H, z0 - 0.15);  // sits on top of body, slightly south overhang
    roofMesh.castShadow = shadow;
    this._scene.add(roofMesh);

    // ── Facade panel — visible south face at z = z0 + 0.05 ──────────────────
    // A thin slab covering the entire south face, slightly lighter than body
    const facadePanel = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.08), lam(0xc05830));
    facadePanel.position.set(cx, H / 2, z0 + 0.04);
    this._scene.add(facadePanel);

    // ── Stepped gable: cream blocks on the SOUTH face above the roof line ────
    // Position at z = z0 + 0.15 (in front of facade panel, facing camera)
    const gabMat = lam(0xead8b0);
    const steps = [
      [W * 0.88, 0.55],
      [W * 0.68, 0.46],
      [W * 0.50, 0.40],
      [W * 0.34, 0.34],
      [W * 0.20, 0.28],
    ];
    let gy = H;
    for (const [sw, sh] of steps) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, 0.22), gabMat);
      m.position.set(cx, gy + sh / 2, z0 + 0.30);
      m.castShadow = shadow;
      this._scene.add(m);
      gy += sh;
    }
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.55, 7), gabMat);
    fin.position.set(cx, gy + 0.28, z0 + 0.30);
    this._scene.add(fin);

    // ── String courses: white horizontal bands between floors ────────────────
    const courseMat = lam(0xf0ece0);
    for (const cy of [1.9, 3.4]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(W + 0.1, 0.10, 0.14), courseMat);
      m.position.set(cx, cy, z0 + 0.14);
      this._scene.add(m);
    }

    // ── Windows: bright frames + warm orange-lit glass ───────────────────────
    // Use renderOrder+depthTest=false to guarantee visibility over the facade.
    const frameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff), depthTest: false });
    const glassMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xe8a040),
      side: THREE.DoubleSide,
      depthTest: false,
    });
    const floorYs = [0.65, 2.3, 3.75];
    const wCols   = [0.13, 0.42, 0.71];
    for (const fy of floorYs) {
      for (const wf of wCols) {
        const wx = x0 + W * wf + 0.28;
        const wz = z0 + 0.35;
        const fr = new THREE.Mesh(new THREE.BoxGeometry(0.88, 1.08, 0.16), frameMat);
        fr.position.set(wx, fy + 0.54, wz);
        fr.renderOrder = 2;
        this._scene.add(fr);
        const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.86), glassMat);
        gl.position.set(wx, fy + 0.54, wz + 0.05);
        gl.renderOrder = 3;
        this._scene.add(gl);
      }
    }

    // ── Front door + stoop ───────────────────────────────────────────────────
    const doorMat  = lam(0x3a1808);
    const stoopMat = lam(0xb09060);
    const stoop = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 0.4), stoopMat);
    stoop.position.set(cx, 0.06, z0 + 0.38);
    this._scene.add(stoop);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.68, 1.15, 0.12), doorMat);
    door.position.set(cx, 0.58, z0 + 0.30);
    this._scene.add(door);
    // Door light
    const doorLight = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14),
      lam(0xffd070, 0xffe090, 1.3));
    doorLight.position.set(cx, 1.28, z0 + 0.30);
    this._scene.add(doorLight);

    // ── Bridge railing ───────────────────────────────────────────────────────
    const railMat = lam(0x383838);
    for (const bz of [6.2, 7.2]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.65, 0.08), railMat);
      p.position.set(4.5, 0.33, bz);
      this._scene.add(p);
    }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.1), railMat);
    rail.position.set(4.5, 0.65, 6.7);
    this._scene.add(rail);
  }
  // ── Props ──────────────────────────────────────────────────────────────────
  _buildProps() {
    const shadow = this._tier !== 'low';

    // 1. Canal-side ornamental trees (lime trees / lindens)
    const treePts = [
      {x:5.5,z:1.5}, {x:5.5,z:4.0}, {x:5.5,z:6.5},
      {x:5.5,z:9.0}, {x:5.5,z:11.5}, {x:5.5,z:13.2},
    ];
    {
      const trunkIM = new THREE.InstancedMesh(
        new THREE.CylinderGeometry(0.07, 0.13, 0.9, 6),
        new THREE.MeshLambertMaterial({ color: new THREE.Color(0x6a4020) }),
        treePts.length
      );
      const crownIM = new THREE.InstancedMesh(
        new THREE.ConeGeometry(0.52, 1.4, 8),
        new THREE.MeshLambertMaterial({ color: new THREE.Color(0x3a8030) }),
        treePts.length
      );
      trunkIM.castShadow = crownIM.castShadow = shadow;
      const d = new THREE.Object3D();
      treePts.forEach((p, i) => {
        const sc = 0.85 + (i % 3) * 0.12;
        d.position.set(p.x, 0.45*sc, p.z); d.scale.setScalar(sc); d.rotation.y = i*1.4; d.updateMatrix();
        trunkIM.setMatrixAt(i, d.matrix);
        d.position.set(p.x, (0.9 + 0.70)*sc, p.z); d.updateMatrix();
        crownIM.setMatrixAt(i, d.matrix);
      });
      this._scene.add(trunkIM, crownIM);
    }

    // 2. Bicycles
    const bikePts = [
      {x:6.3, z:8.3}, {x:6.6, z:9.2}, {x:6.1, z:10.4},
    ];
    {
      const bikeIM = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.14, 0.45, 0.72),
        new THREE.MeshLambertMaterial({ color: new THREE.Color(0xc84020) }),
        bikePts.length
      );
      const wIM = new THREE.InstancedMesh(
        new THREE.TorusGeometry(0.20, 0.04, 5, 12),
        new THREE.MeshLambertMaterial({ color: new THREE.Color(0x181818) }),
        bikePts.length * 2
      );
      const d = new THREE.Object3D();
      bikePts.forEach((p, i) => {
        const ang = i * 0.7;
        d.position.set(p.x, 0.38, p.z); d.scale.set(1,1,1); d.rotation.set(0, ang, 0); d.updateMatrix();
        bikeIM.setMatrixAt(i, d.matrix);
        d.position.set(p.x + Math.sin(ang)*0.33, 0.20, p.z + Math.cos(ang)*0.33);
        d.rotation.set(Math.PI/2, ang, 0); d.updateMatrix();
        wIM.setMatrixAt(i*2, d.matrix);
        d.position.set(p.x - Math.sin(ang)*0.33, 0.20, p.z - Math.cos(ang)*0.33);
        d.updateMatrix(); wIM.setMatrixAt(i*2+1, d.matrix);
      });
      this._scene.add(bikeIM, wIM);
    }

    // 3. Lamp posts
    const lampPts = [
      {x:5.9,z:2.3}, {x:5.9,z:5.2}, {x:5.9,z:8.5}, {x:5.9,z:12.0},
      {x:15.5,z:3.5}, {x:15.5,z:8.5},
    ];
    {
      const poleIM = new THREE.InstancedMesh(
        new THREE.CylinderGeometry(0.04, 0.05, 2.2, 5),
        new THREE.MeshLambertMaterial({ color: new THREE.Color(0x383838) }),
        lampPts.length
      );
      const headIM = new THREE.InstancedMesh(
        new THREE.SphereGeometry(0.16, 7, 5),
        new THREE.MeshLambertMaterial({
          color: new THREE.Color(0xffffcc),
          emissive: new THREE.Color(0x888840),
          emissiveIntensity: 0.7,
        }),
        lampPts.length
      );
      poleIM.castShadow = shadow;
      const d = new THREE.Object3D();
      lampPts.forEach((p, i) => {
        d.position.set(p.x, 1.1, p.z); d.scale.setScalar(1); d.rotation.y = 0; d.updateMatrix();
        poleIM.setMatrixAt(i, d.matrix);
        d.position.set(p.x, 2.35, p.z); d.updateMatrix();
        headIM.setMatrixAt(i, d.matrix);
      });
      this._scene.add(poleIM, headIM);
    }

    // ── Quay wall at canal east edge (col 5, all rows) ───────────────────────
    // A thin stone wall strip shows the canal-to-path level transition.
    {
      const quayMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(0x9a8870) });
      const wallH   = Math.abs(tileH(T.ROAD) - (-0.10)) + 0.02;  // road height minus water height
      const wall    = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, wallH, ROWS * TILE),
        quayMat
      );
      wall.position.set(5 * TILE - 0.09, -0.10 + wallH/2, ROWS * TILE / 2);
      wall.receiveShadow = shadow;
      this._scene.add(wall);

      // Mooring posts along the quay
      const postMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(0x4a3020) });
      for (let r = 1; r < ROWS; r += 3) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.7, 6), postMat);
        post.position.set(5 * TILE - 0.12, 0.04 + tileH(T.ROAD), r * TILE + HALF);
        this._scene.add(post);
      }
    }

    // Tulip beds in garden (rows 3-6, cols 14-17)
    const bloomColors = [0xff3060, 0xff9020, 0xffec30, 0xe830a0];
    let bi = 0;
    for (let row = 3; row <= 6; row++) {
      for (let col = 14; col <= 17; col++) {
        if (GRID[row][col] !== T.FLOWER) continue;
        const x = col * TILE + HALF, z = row * TILE + HALF;
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 0.34, 4),
          new THREE.MeshLambertMaterial({ color: new THREE.Color(0x38a028) })
        );
        stem.position.set(x, 0.17 + tileH(T.FLOWER), z);
        const bloom = new THREE.Mesh(
          new THREE.ConeGeometry(0.12, 0.24, 6),
          new THREE.MeshLambertMaterial({ color: new THREE.Color(bloomColors[bi % bloomColors.length]) })
        );
        bloom.position.set(x, 0.46 + tileH(T.FLOWER), z);
        this._scene.add(stem, bloom);
        bi++;
      }
    }
  }

  // ── Player ─────────────────────────────────────────────────────────────────
  _buildPlayer() {
    const grp  = new THREE.Group();
    const skin = 0xc89050, hair = 0x1a1a2a, shirt = 0x2858c0, pant = 0x181838;

    const add = (geo, col, x, y, z) => {
      const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: new THREE.Color(col) }));
      m.position.set(x, y, z); m.castShadow = (this._tier !== 'low'); grp.add(m); return m;
    };

    add(new THREE.BoxGeometry(0.32, 0.42, 0.20), shirt, 0, 0.46, 0);
    add(new THREE.BoxGeometry(0.22, 0.22, 0.20), skin,  0, 0.77, 0);
    add(new THREE.BoxGeometry(0.25, 0.09, 0.22), hair,  0, 0.89, 0);
    this._armL = add(new THREE.BoxGeometry(0.10, 0.32, 0.10), skin, -0.21, 0.44, 0);
    this._armR = add(new THREE.BoxGeometry(0.10, 0.32, 0.10), skin,  0.21, 0.44, 0);
    this._legL = add(new THREE.BoxGeometry(0.12, 0.34, 0.12), pant, -0.09, 0.17, 0);
    this._legR = add(new THREE.BoxGeometry(0.12, 0.34, 0.12), pant,  0.09, 0.17, 0);

    // Blob shadow (all tiers)
    const sh = new THREE.Mesh(
      new THREE.CircleGeometry(0.25, 8),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false })
    );
    sh.rotation.x = -Math.PI / 2; sh.position.y = tileH(T.COBBLE) + 0.01;
    grp.add(sh);

    this._playerMesh = grp;
    this._playerMesh.position.copy(this._playerPos);
    this._playerMesh.rotation.y = this._playerFacing;  // face south (camera) at idle
    this._scene.add(grp);
  }

  // ── NPC (orange jacket, brown hair — visually distinct from player) ──────
  _buildNPC() {
    const grp  = new THREE.Group();
    const skin = parseInt(NPC.skinColor.replace('#',''), 16);
    // Override: orange jacket, brown hair (not dark navy like player)
    const jacket    = 0xe06010;   // vivid orange
    const trousers  = 0x4a3828;   // warm dark brown
    const hairColor = 0x6a3010;   // medium brown hair

    const add = (geo, col, x, y, z) => {
      const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: new THREE.Color(col) }));
      m.position.set(x, y, z); m.castShadow = (this._tier !== 'low'); grp.add(m); return m;
    };

    add(new THREE.BoxGeometry(0.32, 0.42, 0.20), jacket,    0, 0.46, 0);
    add(new THREE.BoxGeometry(0.22, 0.22, 0.20), skin,      0, 0.77, 0);
    add(new THREE.BoxGeometry(0.25, 0.09, 0.22), hairColor, 0, 0.89, 0);
    this._npcArmL = add(new THREE.BoxGeometry(0.10, 0.32, 0.10), skin,     -0.21, 0.44, 0);
    this._npcArmR = add(new THREE.BoxGeometry(0.10, 0.32, 0.10), skin,      0.21, 0.44, 0);
    this._npcLegL = add(new THREE.BoxGeometry(0.12, 0.34, 0.12), trousers, -0.09, 0.17, 0);
    this._npcLegR = add(new THREE.BoxGeometry(0.12, 0.34, 0.12), trousers,  0.09, 0.17, 0);

    const sh = new THREE.Mesh(
      new THREE.CircleGeometry(0.25, 8),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18, depthWrite: false })
    );
    sh.rotation.x = -Math.PI / 2; sh.position.y = tileH(T.COBBLE) + 0.01;
    grp.add(sh);

    this._npcMesh = grp;
    this._npcMesh.position.copy(this._npcPos);
    this._scene.add(grp);
  }

  // ── Controls ───────────────────────────────────────────────────────────────
  _setupControls() {
    const canvas = this._canvas;
    const raycaster  = new THREE.Raycaster();
    const mouse      = new THREE.Vector2();
    const groundPlane= new THREE.Plane(new THREE.Vector3(0,1,0), 0);

    const getTile = (px, py) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x =  ((px - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((py - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, this._camera);
      const pt = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(groundPlane, pt)) return null;
      const col = Math.floor(pt.x / TILE);
      const row = Math.floor(pt.z / TILE);
      if (col < 0||col>=COLS||row<0||row>=ROWS) return null;
      return { row, col };
    };

    const isNpcTap = (px, py) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x =  ((px - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((py - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, this._camera);
      if (!this._npcMesh) return false;
      return raycaster.ray.intersectsBox(new THREE.Box3().setFromObject(this._npcMesh));
    };

    const handleTap = (px, py) => {
      if (isNpcTap(px, py)) { this._showBubble(); return; }
      const tile = getTile(px, py);
      if (!tile) return;
      if (SOLID.has(GRID[tile.row][tile.col])) return;
      // On desktop, switch to follow-player mode when tapped
      this._followPlayer = true;
      this._startWalk(tile.row, tile.col, null);
    };

    canvas.addEventListener('click',    e => { if (e.button === 0) handleTap(e.clientX, e.clientY); });
    canvas.addEventListener('touchend', e => {
      if (e.changedTouches.length !== 1) return;
      e.preventDefault();
      const t = e.changedTouches[0];
      handleTap(t.clientX, t.clientY);
    }, { passive: false });

    document.addEventListener('keydown', e => {
      this._keys.add(e.code);
      if (e.code === 'ArrowUp'||e.code === 'ArrowDown'||e.code === 'ArrowLeft'||e.code === 'ArrowRight'
        ||e.code === 'KeyW'||e.code === 'KeyS'||e.code === 'KeyA'||e.code === 'KeyD')
        this._followPlayer = true;
    });
    document.addEventListener('keyup',  e => this._keys.delete(e.code));

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this._camZoom = Math.max(this._camZoomMin, Math.min(this._camZoomMax, this._camZoom + e.deltaY * 0.05));
    }, { passive: false });

    let pinchDist = null;
    canvas.addEventListener('touchstart', e => { if (e.touches.length === 2) pinchDist = null; });
    canvas.addEventListener('touchmove',  e => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dd = Math.sqrt(dx*dx + dy*dy);
      if (pinchDist !== null)
        this._camZoom = Math.max(this._camZoomMin, Math.min(this._camZoomMax, this._camZoom - (dd - pinchDist)*0.06));
      pinchDist = dd;
    }, { passive: false });
  }

  _startWalk(row, col, resolve) {
    const path = astar(GRID, this._playerTile.r, this._playerTile.c, row, col);
    if (!path || path.length < 2) { if (resolve) resolve(false); return; }
    this._playerPath = path.slice(1);
    this._ringEl.style.display = 'block';
    if (resolve) this._tapResolvers.push({ row, col, resolve });
  }

  _showBubble() {
    const head = this._npcMesh.position.clone(); head.y += 1.1;
    const proj = head.clone().project(this._camera);
    const rect = this._canvas.getBoundingClientRect();
    const sx = (proj.x * 0.5 + 0.5) * rect.width  + rect.left;
    const sy = (-proj.y * 0.5 + 0.5) * rect.height + rect.top;
    this._bubbleEl.style.left = sx + 'px';
    this._bubbleEl.style.top  = (sy - 10) + 'px';
    this._bubbleText.textContent = NPC.line;
    this._bubbleEl.style.display = 'block';
  }

  // ── Main loop ──────────────────────────────────────────────────────────────
  _loop() {
    requestAnimationFrame(() => this._loop());
    const dt  = Math.min(this._clock.getDelta(), 0.1);
    const now = this._clock.elapsedTime;
    this._updateKeys(dt);
    this._updatePlayer(dt, now);
    this._updateNPC(dt, now);
    this._animateWater(now);
    this._updateCamera();
    this._updateDomLabels();
    this._renderer.render(this._scene, this._camera);
    this._collectStats(dt);
  }

  _updateKeys(dt) {
    let dr = 0, dc = 0;
    if (this._keys.has('ArrowUp')   ||this._keys.has('KeyW')) dr -= 1;
    if (this._keys.has('ArrowDown') ||this._keys.has('KeyS')) dr += 1;
    if (this._keys.has('ArrowLeft') ||this._keys.has('KeyA')) dc -= 1;
    if (this._keys.has('ArrowRight')||this._keys.has('KeyD')) dc += 1;
    if (dr === 0 && dc === 0) return;
    this._playerPath = [];
    const spd = 4.0;
    const nx = this._playerPos.x + dc * spd * dt;
    const nz = this._playerPos.z + dr * spd * dt;
    const nc = Math.floor(nx / TILE), nr = Math.floor(nz / TILE);
    if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && !SOLID.has(GRID[nr][nc])) {
      this._playerPos.x = nx; this._playerPos.z = nz;
      this._playerTile  = { r: nr, c: nc };
    }
    this._playerFacing = Math.atan2(dc, dr);
    this._walkTime += dt;
    this._applyWalkAnim(this._armL, this._armR, this._legL, this._legR, this._walkTime, true);
    this._playerMesh.position.copy(this._playerPos);
    this._playerMesh.rotation.y = this._playerFacing;
  }

  _updatePlayer(dt, t) {
    if (this._playerPath.length === 0) {
      // Idle: face south (toward camera) — only if no key movement happened this frame
      if (this._playerFacing !== undefined && !this._keys.size) {
        const targetFacing = Math.PI;
        const df = targetFacing - this._playerMesh.rotation.y;
        const wrap = ((df + Math.PI) % (2*Math.PI)) - Math.PI;
        this._playerMesh.rotation.y += wrap * 0.1;
      }
      this._applyWalkAnim(this._armL, this._armR, this._legL, this._legR, t*0.6, false);
      return;
    }
    const next = this._playerPath[0];
    const tx   = next.c * TILE + HALF;
    const tz   = next.r * TILE + HALF;
    const dx   = tx - this._playerPos.x;
    const dz   = tz - this._playerPos.z;
    const dist = Math.sqrt(dx*dx + dz*dz);
    const step = this._playerSpeed * dt;
    if (dist <= step) {
      this._playerPos.x = tx; this._playerPos.z = tz;
      this._playerTile  = { r: next.r, c: next.c };
      this._playerPath.shift();
      if (this._playerPath.length === 0) {
        this._ringEl.style.display = 'none';
        const done = this._tapResolvers.filter(p => p.row === next.r && p.col === next.c);
        done.forEach(p => p.resolve(true));
        this._tapResolvers = this._tapResolvers.filter(p => !done.includes(p));
      }
    } else {
      this._playerPos.x += (dx/dist) * step;
      this._playerPos.z += (dz/dist) * step;
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
      this._npcWanderTimer = 2.5 + Math.random() * 3.5;
      for (let i = 0; i < 12; i++) {
        const tr = Math.floor(Math.random() * ROWS);
        const tc = Math.floor(Math.random() * COLS);
        if (!SOLID.has(GRID[tr][tc])) {
          const path = astar(GRID, this._npcTile.r, this._npcTile.c, tr, tc);
          if (path && path.length > 1) { this._npcPath = path.slice(1); break; }
        }
      }
    }
    if (this._npcPath.length === 0) {
      this._applyWalkAnim(this._npcArmL, this._npcArmR, this._npcLegL, this._npcLegR, t*0.6, false);
      return;
    }
    const next = this._npcPath[0];
    const tx   = next.c * TILE + HALF, tz = next.r * TILE + HALF;
    const dx   = tx - this._npcPos.x,  dz = tz - this._npcPos.z;
    const dist = Math.sqrt(dx*dx + dz*dz);
    const step = 1.8 * dt;
    if (dist <= step) {
      this._npcPos.x = tx; this._npcPos.z = tz;
      this._npcTile  = { r: next.r, c: next.c };
      this._npcPath.shift();
    } else {
      this._npcPos.x += (dx/dist) * step;
      this._npcPos.z += (dz/dist) * step;
      this._npcMesh.rotation.y = Math.atan2(dx, dz);
    }
    this._npcMesh.position.copy(this._npcPos);
    this._applyWalkAnim(this._npcArmL, this._npcArmR, this._npcLegL, this._npcLegR, t*2.8, this._npcPath.length > 0);
  }

  _applyWalkAnim(armL, armR, legL, legR, t, walking) {
    if (!armL) return;
    if (walking) {
      const sw = Math.sin(t * Math.PI * 2.2) * 0.48;
      armL.rotation.x =  sw; armR.rotation.x = -sw;
      legL.rotation.x = -sw * 0.65; legR.rotation.x = sw * 0.65;
    } else {
      const br = Math.sin(t * 1.6) * 0.018;
      armL.rotation.x = br; armR.rotation.x = -br * 0.5;
      legL.rotation.x = 0;  legR.rotation.x = 0;
    }
  }

  _animateWater(t) {
    if (!this._waterGeom) return;
    const pos = this._waterGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      pos.setY(i, this._waterBaseY[i]
        + Math.sin(t*2.1 + x*1.4 + z*0.7) * 0.038
        + Math.sin(t*1.4 + x*0.8 + z*1.5) * 0.022);
    }
    pos.needsUpdate = true;
    this._waterGeom.computeVertexNormals();
  }

  _updateDomLabels() {
    if (!this._npcMesh) return;
    const head = this._npcMesh.position.clone(); head.y += 1.1;
    const proj = head.clone().project(this._camera);
    const rect = this._canvas.getBoundingClientRect();
    if (proj.z < 1) {
      const sx = (proj.x*0.5+0.5) * rect.width;
      const sy = (-proj.y*0.5+0.5) * rect.height;
      this._npcLabelEl.style.left    = sx + 'px';
      this._npcLabelEl.style.top     = sy + 'px';
      this._npcLabelEl.style.display = 'block';
      this._npcLabelEl.textContent   = NPC.given;
    } else {
      this._npcLabelEl.style.display = 'none';
    }
  }

  _collectStats(dt) {
    const now = performance.now();
    this._fpsFrames.push(now);
    while (this._fpsFrames.length > 1 && now - this._fpsFrames[0] > 1000)
      this._fpsFrames.shift();
    this._lastFrameMs = dt * 1000;
    const info = this._renderer.info;
    const gl   = this._renderer.getContext();
    const glV  = (gl.getParameter(gl.VERSION) || 'WebGL2').split(' ');
    const W    = this._canvas.width, H = this._canvas.height;
    document.getElementById('s-fps').textContent  = 'fps '        + this._fpsFrames.length;
    document.getElementById('s-ms').textContent   = 'frame ms '   + this._lastFrameMs.toFixed(1);
    document.getElementById('s-dc').textContent   = 'draw calls ' + info.render.calls;
    document.getElementById('s-tri').textContent  = 'triangles '  + info.render.triangles;
    document.getElementById('s-geo').textContent  = 'geometries ' + info.memory.geometries;
    document.getElementById('s-tex').textContent  = 'textures '   + info.memory.textures;
    document.getElementById('s-tier').textContent = 'tier '       + this._tier;
    document.getElementById('s-res').textContent  = 'canvas '     + W + '×' + H;
    document.getElementById('s-dpr').textContent  = 'dpr '        + this._dpr;
    document.getElementById('s-gl').textContent   = glV[0] + ' '  + (glV[1]||'');
  }

  _onResize() {
    const w = this._canvas.clientWidth, h = this._canvas.clientHeight;
    this._renderer.setSize(w, h, false);
    this._camera.aspect = w / h;
    // portrait phones: a wider vertical field of view so ~8-10 tiles fit across
    this._camera.fov = (w / h) < 0.8 ? 44 : 30;
    this._camera.updateProjectionMatrix();
  }

  // ── Public API ────────────────────────────────────────────────────────────
  getStats() {
    const info = this._renderer.info;
    return {
      fps: this._fpsFrames.length,
      frameMs: this._lastFrameMs,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      tier: this._tier,
    };
  }
  getPlayerTile() { return { x: this._playerTile.c, y: this._playerTile.r }; }

  teleport(x, y) {
    const col = Math.floor(x), row = Math.floor(y);
    if (col<0||col>=COLS||row<0||row>=ROWS) return;
    this._playerTile  = { r: row, c: col };
    this._playerPos.x = col*TILE + HALF;
    this._playerPos.z = row*TILE + HALF;
    this._playerMesh.position.copy(this._playerPos);
    this._playerPath  = [];
    this._followPlayer = true;
    this._camTarget.set(this._playerPos.x, 0, this._playerPos.z);
    this._positionCamera();
  }

  tapTile(x, y) {
    const col = Math.floor(x), row = Math.floor(y);
    if (col<0||col>=COLS||row<0||row>=ROWS) return Promise.resolve(false);
    if (SOLID.has(GRID[row][col]))           return Promise.resolve(false);
    return new Promise(resolve => this._startWalk(row, col, resolve));
  }

  tapNpc() {
    this._showBubble();
    return Promise.resolve(true);
  }
}
