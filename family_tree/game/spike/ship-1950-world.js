// ship-1950-world.js - G0b spike: RMS Queen Elizabeth Atlantic Crossing, Era 4 (1950).
//
// ShipWorld extends HaarlemWorld with ship-specific 3D rendering:
// deep blue-grey ocean surroundings, two black funnels with Cunard bands, warm plank deck,
// subtle ship rocking, and steel/metal areas. Everything else inherited from HaarlemWorld.
import * as THREE from '../vendor/three/three.module.min.js';
import { HaarlemWorld } from './haarlem-world.js';

const OCEAN_EXTEND = 30;           // tiles of ocean beyond the ship map on all sides
const FUNNEL_HEIGHT = 8.0;         // tall funnels visible above deck
const FUNNEL_RADIUS_TOP = 1.2;
const FUNNEL_RADIUS_BOT = 1.5;
const FUNNEL_BAND_Y = 5.5;         // Cunard band position from bottom
const FUNNEL_BAND_HEIGHT = 1.5;
const ROCK_PERIOD = 4.0;           // seconds for one full roll cycle
const ROCK_AMPLITUDE = 0.5 * Math.PI / 180;  // ±0.5 degrees in radians

const col = (hex) => new THREE.Color(hex);
const OCEAN = col(0x1a3a5c);              // deep blue-grey ocean
const FUNNEL_BLACK = col(0x0a0a0a);
const FUNNEL_GOLD = col(0xd4a850);        // Cunard gold band
const FUNNEL_RED = col(0x9a2828);         // Cunard red band
const PLANK_LIGHT = col(0xa67548);        // warm brown deck plank (light stripe)
const PLANK_DARK = col(0x8a5f38);         // warm brown deck plank (dark stripe)
const STEEL_GREY = col(0x8899aa);         // lighter grey-blue for metal tiles

// Procedural plank texture: dark/light brown horizontal stripes
function makePlankTexture() {
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 64;
  const g = c.getContext('2d');
  const stripe = (y, dark) => {
    g.fillStyle = dark ? '#8a5f38' : '#a67548';
    g.fillRect(0, y, 8, 4);
  };
  for (let y = 0; y < 64; y += 4) stripe(y, (y / 4) % 2 === 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

export class ShipWorld extends HaarlemWorld {
  constructor(canvas, data, tier) {
    super(canvas, data, tier);
    this._rockTime = 0;                    // for gentle rocking animation
    this._plankTex = makePlankTexture();
  }

  // ── Override: build custom ship geometry ───────────────────────────────────
  _buildWorld() {
    const d = this._data;
    const shadows = this._tier !== 'low';

    // Build base geometry (ground, walls, roofs) from parent
    super._buildWorld();

    // ── 1. Add ocean surroundings ──
    this._buildOcean(d, shadows);

    // ── 2. Add ship funnels ──
    this._buildFunnels(d, shadows);
  }

  _buildOcean(d, shadows) {
    // Determine map bounds in world units (d.b holds building data with x/z coords if available;
    // fallback to assuming a centered map)
    const mapMinX = d.b.length ? Math.min(...d.b.map(b => b.x)) : -20;
    const mapMaxX = d.b.length ? Math.max(...d.b.map(b => b.x)) : 20;
    const mapMinZ = d.b.length ? Math.min(...d.b.map(b => b.z)) : -14;
    const mapMaxZ = d.b.length ? Math.max(...d.b.map(b => b.z)) : 14;

    const oceanMinX = mapMinX - OCEAN_EXTEND;
    const oceanMaxX = mapMaxX + OCEAN_EXTEND;
    const oceanMinZ = mapMinZ - OCEAN_EXTEND;
    const oceanMaxZ = mapMaxZ + OCEAN_EXTEND;

    // Create four ocean strips around the ship: north, south, east, west
    const oceanY = -0.12;  // water surface level (same as Terrain3D.js WATER_Y)
    const oceanGeo = new THREE.PlaneGeometry(
      oceanMaxX - oceanMinX,
      oceanMaxZ - oceanMinZ
    );
    oceanGeo.rotateX(-Math.PI / 2);
    oceanGeo.translate(
      (oceanMinX + oceanMaxX) / 2,
      oceanY,
      (oceanMinZ + oceanMaxZ) / 2
    );

    const oceanMat = new THREE.MeshLambertMaterial({ color: OCEAN });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.receiveShadow = shadows;
    this._scene.add(oceanMesh);
    this._oceanMesh = oceanMesh;
  }

  _buildFunnels(d, shadows) {
    // Place two funnels behind the superstructure area (approximating aft of First Class)
    // Assume ship center is near (0, 0) and funnels are at (-8, -4) and (-8, 4) in world units
    const funnel1X = -8;
    const funnel1Z = -4;
    const funnel2X = -8;
    const funnel2Z = 4;

    this._buildFunnel(funnel1X, funnel1Z, shadows);
    this._buildFunnel(funnel2X, funnel2Z, shadows);
  }

  _buildFunnel(x, z, shadows) {
    // Funnel: black cylinder with gold and red Cunard bands
    const segments = this._tier === 'low' ? 12 : 24;

    // Main funnel body (black)
    const bodyGeo = new THREE.CylinderGeometry(
      FUNNEL_RADIUS_TOP,
      FUNNEL_RADIUS_BOT,
      FUNNEL_HEIGHT,
      segments
    );
    bodyGeo.translate(x, FUNNEL_HEIGHT / 2, z);
    const bodyMat = new THREE.MeshLambertMaterial({ color: FUNNEL_BLACK });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = bodyMesh.receiveShadow = shadows;
    this._scene.add(bodyMesh);

    // Gold band
    const goldGeo = new THREE.CylinderGeometry(
      FUNNEL_RADIUS_TOP + 0.02,
      FUNNEL_RADIUS_BOT + 0.02,
      FUNNEL_BAND_HEIGHT * 0.5,
      segments
    );
    goldGeo.translate(x, FUNNEL_BAND_Y, z);
    const goldMat = new THREE.MeshLambertMaterial({ color: FUNNEL_GOLD });
    const goldMesh = new THREE.Mesh(goldGeo, goldMat);
    this._scene.add(goldMesh);

    // Red band (below gold)
    const redGeo = new THREE.CylinderGeometry(
      FUNNEL_RADIUS_TOP + 0.02,
      FUNNEL_RADIUS_BOT + 0.02,
      FUNNEL_BAND_HEIGHT * 0.5,
      segments
    );
    redGeo.translate(x, FUNNEL_BAND_Y - FUNNEL_BAND_HEIGHT * 0.5, z);
    const redMat = new THREE.MeshLambertMaterial({ color: FUNNEL_RED });
    const redMesh = new THREE.Mesh(redGeo, redMat);
    this._scene.add(redMesh);
  }

  // ── Override: material for tiles ───────────────────────────────────────────
  _getMaterialForTile(tileType) {
    // Ship deck tiles: warm brown plank
    // Steel/metal tiles: lighter grey-blue
    // Water tiles: deep blue (if any onboard water features)
    // Default: delegate to parent

    const isPlankDeck = (tileType === 'plank' || tileType === 'deck' || tileType === 'walkway');
    const isSteelArea = (tileType === 'steel' || tileType === 'metal' || tileType === 'pipe');
    const isWaterTile = (tileType === 'water');

    if (isPlankDeck) {
      return new THREE.MeshLambertMaterial({
        map: this._plankTex,
        color: PLANK_LIGHT
      });
    } else if (isSteelArea) {
      return new THREE.MeshLambertMaterial({ color: STEEL_GREY });
    } else if (isWaterTile) {
      return new THREE.MeshLambertMaterial({ color: OCEAN });
    }

    // Delegate to parent for other tile types
    return super._getMaterialForTile ? super._getMaterialForTile(tileType) : null;
  }

  // ── Override: update per frame (add gentle rocking) ────────────────────────
  _updateScene(dt, t) {
    super._updateScene(dt, t);
    this._rockTime += dt;

    // Apply gentle roll to the entire scene (x-axis rotation)
    const rockAngle = Math.sin((this._rockTime / ROCK_PERIOD) * 2 * Math.PI) * ROCK_AMPLITUDE;
    this._scene.rotation.x = rockAngle;
  }

  // ── Overrides: NPC bubble and era label ────────────────────────────────────
  _showBubble() {
    const head = this._npcMesh.position.clone();
    head.y += 1.1;
    const proj = head.clone().project(this._camera);
    const rect = this._canvas.getBoundingClientRect();
    const sx = (proj.x * 0.5 + 0.5) * rect.width + rect.left;
    const sy = (-proj.y * 0.5 + 0.5) * rect.height + rect.top;
    this._bubbleEl.style.left = sx + 'px';
    this._bubbleEl.style.top = (sy - 10) + 'px';
    this._bubbleText.textContent = "This crossing will change everything. Ten days to America.";
    this._bubbleEl.style.display = 'block';
  }

  // Era label override (shown in HUD or attribution)
  get eraLabel() {
    return '1950 · RMS Queen Elizabeth — Atlantic Crossing';
  }
}
