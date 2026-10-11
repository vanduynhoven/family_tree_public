// ═══════════════════════════════════════════════════════════
//  CharacterMesh - low-poly rigged character factory for G3/G4
//
//  Returns a THREE.Group for one character. Each figure shares a common rig
//  but appearance (skin tone, hair, outfit) comes from the GEDCOM id.
//  All geometry uses BufferGeometry via MeshBuilder3D; parts are merged per
//  material into as few draw calls as possible (body geometry + hair geometry).
//
//  G4: arms and legs are now separate THREE.Object3D pivot children of the group
//  so Entities3D can rotate them for the walk-cycle animation each frame.
//  group.userData.pivots = { armL, armR, legL, legR }
//
//  Age tiers (from birthYear + eraYear):
//    child  <13  : head 1.3x, limbs 0.7x
//    teen  13-17 : head 1.1x, limbs 0.85x
//    adult 18-59 : base proportions
//    elder  60+  : slightly hunched, head forward
//
//  Gender: female figures have ±10% shoulder/hip width difference.
//
//  Outfit eras (eraId 0-8, maps to ERA_STYLE.year 1539-2026):
//    eraId 0-1  : medieval/early-modern  – long tunic + hood
//    eraId 2    : late early-modern      – coat + hat
//    eraId 3-4  : industrial/emigrant    – Dutch traditional dress
//    eraId 5-8  : modern                 – casual jeans + shirt
//
//  Triangle budget per figure (G4):
//    Body geometry: ~100 tris  (head 24, torso 10, shoes 20, outfit details ~46)
//    Hair geometry:  ~56 tris  (cap + side locks + fringe + back)
//    Arm meshes: ~20 tris each × 2 = ~40 tris
//    Leg meshes: ~10 tris each × 2 = ~20 tris
//    Total:         ~216 tris
// ═══════════════════════════════════════════════════════════
import * as THREE from '../../../vendor/three/three.module.min.js';
import { MeshBuilder, lin, shade, mix } from './MeshBuilder3D.js';

// Pre-parse a hex colour into a linear [r,g,b] triple and cache it.
const _ccache = new Map(), _ctmp = new THREE.Color();
function toLinear(hex, fallback = '#808080') {
  let v = _ccache.get(hex);
  if (!v) {
    try { _ctmp.set(hex); } catch { _ctmp.set(fallback); }
    v = [_ctmp.r, _ctmp.g, _ctmp.b];
    _ccache.set(hex, v);
  }
  return v;
}

// Age tier from birth year and era year.
function ageTier(birthYear, eraYear) {
  if (birthYear == null || isNaN(birthYear)) return 'adult';
  const age = eraYear - birthYear;
  if (age < 13) return 'child';
  if (age < 18) return 'teen';
  if (age < 60) return 'adult';
  return 'elder';
}

// ── Geometry helpers ──────────────────────────────────────

/** Build the body geometry (skin + outfit), EXCLUDING the four limbs.
 *  Returns a MeshBuilder whose triangles carry per-vertex colours. */
function buildBodyGeometry({ tier, sex, skin, outfit, shoe, beltColor, legColor }) {
  const b = new MeshBuilder();
  const female = sex === 'F';

  // ── proportions ──
  const headR   = tier === 'child' ? 1.3  : tier === 'teen' ? 1.1 : 1.0;
  const hunch   = tier === 'elder' ? 0.06 : 0.0;
  const shoulderW = 0.20 * (female ? 0.90 : 1.0);

  // ── torso ──
  // (feet at 0; torso from 0.36 to 0.76)
  const torsoCol  = outfit;
  const torsoSide = shade(outfit, 0.85);
  const torsoDark = shade(outfit, 0.68);
  b.box(-shoulderW, 0.36, -0.12, shoulderW, 0.76, 0.12, torsoCol, torsoSide, torsoDark);

  // belt accent
  const beltH = 0.04;
  b.box(-shoulderW - 0.007, 0.36, -0.127, shoulderW + 0.007, 0.36 + beltH, 0.127, beltColor, shade(beltColor, 0.85));

  // ── era outfit details ──
  const outfitKind = outfit._kind;
  if (outfitKind === 'tunic' || outfitKind === 'coat') {
    const hemY0 = female ? 0.0  : 0.05;
    const hemY1 = 0.36;
    b.box(-shoulderW, hemY0, -0.11, shoulderW, hemY1, 0.11, torsoCol, torsoSide, torsoDark);
  }
  if (outfitKind === 'apron') {
    const apron = lin('#f0ece0');
    b.south(-shoulderW + 0.02, shoulderW - 0.02, 0.35, 0.72, 0.125, shade(apron, 0.92), apron);
  }
  if (outfitKind === 'jacket') {
    const lapel = shade(torsoCol, 0.72);
    b.south(-shoulderW + 0.02, -0.04, 0.55, 0.76, 0.125, lapel, shade(lapel, 0.9));
    b.south(0.04, shoulderW - 0.02, 0.55, 0.76, 0.125, lapel, shade(lapel, 0.9));
  }

  // ── head ──
  const hy0 = 0.76 + hunch;
  const hy1 = hy0 + 0.28 * headR;
  const hx  = 0.15 * headR;
  const hz  = 0.14 * headR;
  const hzF = 0.14 * headR + hunch;
  b.box(-hx, hy0, -hz, hx, hy1, hzF, skin, shade(skin, 0.88), shade(skin, 0.75));

  // eyes
  const eyeY0 = hy0 + (hy1 - hy0) * 0.46, eyeY1 = eyeY0 + 0.07 * headR;
  const dark = [0.07, 0.06, 0.06];
  b.south(-hx * 0.67, -hx * 0.2,  eyeY0, eyeY1, hzF, dark);
  b.south(hx * 0.2, hx * 0.67, eyeY0, eyeY1, hzF, dark);

  // mouth
  const mouthY0 = hy0 + (hy1 - hy0) * 0.27, mouthY1 = mouthY0 + 0.04 * headR;
  const mouth = shade(skin, 0.62);
  b.south(-hx * 0.32, hx * 0.32, mouthY0, mouthY1, hzF, mouth);

  // neck
  b.box(-0.04, 0.73, -0.04, 0.04, 0.78, 0.04, skin, shade(skin, 0.85));

  // NOTE: arms and legs are NOT added here — they live in separate pivot objects (G4).

  return b;
}

/** Build the arm geometry in local pivot space.
 *  Pivot is at the shoulder (y=0 in pivot space = shoulder attachment).
 *  The arm hangs down (-y direction from pivot).
 *  Returns a MeshBuilder. */
function buildArmGeometry({ tier, sex, skin, outfit, side }) {
  const b = new MeshBuilder();
  const limbR = tier === 'child' ? 0.7 : tier === 'teen' ? 0.85 : 1.0;
  const female = sex === 'F';
  const shoulderW = 0.20 * (female ? 0.90 : 1.0);
  const aW = 0.05 * limbR, aLen = 0.38 * limbR;
  // In the original code the arm box for side=-1 was:
  //   ax = (shoulderW + 0.03) * side  (e.g. -(shoulderW+0.03) for left)
  //   box: ax - aW*side*0.8  ..  ax + aW*side*0.2   (y: 0.74-aLen .. 0.74)
  // In pivot space: shoulder is at y=0, so y coords become: -(aLen) .. 0, etc.
  // x offset from the group's x-axis centre: side * (shoulderW+0.03)
  // We place the pivot itself at that x position so local x is symmetric around 0.
  const hw = aW * 0.5;  // half-width for symmetric placement
  // upper arm (outfit sleeve): y = -aLen*0.6 to 0
  b.box(-hw, -aLen * 0.6, -aW, hw, 0, aW,
    outfit, shade(outfit, 0.82), shade(outfit, 0.65));
  // forearm (skin): y = -aLen to -aLen*0.6
  b.box(-hw * 0.85, -aLen, -aW * 0.85, hw * 0.85, -aLen * 0.6, aW * 0.85,
    skin, shade(skin, 0.85), shade(skin, 0.68));
  // hand nub: y = -aLen - 0.04*limbR to -aLen+0.01
  b.box(-hw * 0.9, -aLen - 0.04 * limbR, -aW * 0.7,
    hw * 0.9, -aLen + 0.01, aW * 0.7,
    shade(skin, 1.15), shade(skin, 1.0));
  return b;
}

/** Build the leg geometry in local pivot space.
 *  Pivot is at the hip (y=0 in pivot space = hip attachment, feet at y=-0.36).
 *  The leg hangs down (-y direction from pivot).
 *  Returns a MeshBuilder. */
function buildLegGeometry({ tier, sex, legColor, shoe }) {
  const b = new MeshBuilder();
  const limbR = tier === 'child' ? 0.7 : tier === 'teen' ? 0.85 : 1.0;
  const female = sex === 'F';
  const hipW = 0.085 * (female ? 1.10 : 1.0);
  const lW = hipW * 0.95;
  // In pivot space the leg hangs from y=0 (hip) to y=-0.36 (feet).
  // Horizontal extent is symmetric around x=0 (pivot placed at ±hipW in group space).
  b.box(-lW, -0.36 * limbR, -lW * 0.9, lW, 0, lW * 0.9,
    legColor, shade(legColor, 0.82), shade(legColor, 0.65));
  // shoe: y = -0.36*limbR - 0.04 to -0.36*limbR
  const shoeY0 = -0.36 * limbR - 0.04;
  b.box(-lW * 1.1, shoeY0, -lW * 0.9, lW * 1.1, -0.36 * limbR, lW * 1.4,
    shoe, shade(shoe, 0.75));
  return b;
}

/** Build the hair geometry for one character variant.
 *  Returns a MeshBuilder coloured by hairColorHex. */
function buildHairGeometry({ tier, sex, hairColor, outfitKind }) {
  const h = new MeshBuilder();
  const female = sex === 'F';
  const headR = tier === 'child' ? 1.3 : tier === 'teen' ? 1.1 : 1.0;
  const hx = 0.168 * headR, hy0 = 0.76, hy1 = hy0 + 0.28 * headR;
  const dark = shade(hairColor, 0.75);
  const top  = shade(hairColor, 1.05);

  // cap on top of head
  b_cap(h, hx, hy0, hy1, hairColor, dark, top, outfitKind, female);

  // back of hair
  h.box(-hx, hy0 + (hy1 - hy0) * 0.1, -hx * 1.08, hx, hy1 - 0.01, -0.1 * headR, hairColor, shade(hairColor, 0.88), dark);

  // sideburns
  for (const side of [-1, 1]) {
    const sx0 = side * (hx - 0.03 * headR), sx1 = side * (hx + 0.008);
    h.box(Math.min(sx0, sx1), hy0 + (hy1 - hy0) * 0.2, -0.1 * headR, Math.max(sx0, sx1), hy1 - 0.04, 0.14 * headR, hairColor, shade(hairColor, 0.82));
  }

  // fringe at front
  if (!['hood', 'coif'].includes(outfitKind)) {
    h.south(-hx * 0.85, hx * 0.85, hy1 - 0.08 * headR, hy1 + 0.01, (0.142 + 0.01) * headR, hairColor, shade(hairColor, 0.9));
  }

  return h;
}

/** Build the hat/hood accessory as part of hair geometry. */
function b_cap(h, hx, hy0, hy1, hairColor, dark, top, outfitKind, female) {
  const hy = hy1 - 0.02;
  if (outfitKind === 'tunic' || outfitKind === 'coif') {
    const cc = lin('#d8d0b8'), ccD = shade(cc, 0.82);
    h.box(-hx * 1.05, hy, -hx * 1.05, hx * 1.05, hy + 0.09, hx * 1.05, cc, ccD, shade(cc, 0.72));
    return;
  }
  if (outfitKind === 'coat') {
    const hc = lin('#2a2420'), hcD = shade(hc, 0.7);
    h.box(-hx * 1.35, hy - 0.01, -hx * 1.35, hx * 1.35, hy + 0.02, hx * 1.35, hcD, hcD);
    h.box(-hx * 0.85, hy + 0.02, -hx * 0.85, hx * 0.85, hy + 0.18, hx * 0.85, hc, shade(hc, 0.82));
    return;
  }
  if (outfitKind === 'apron') {
    const mc = lin('#f0ece0'), mcD = shade(mc, 0.82);
    h.box(-hx * 1.02, hy - 0.01, -hx * 1.02, hx * 1.02, hy + 0.09, hx * 1.02, mc, mcD, shade(mc, 0.72));
    return;
  }
  if (outfitKind === 'jacket') {
    const cc2 = lin('#1c1c28'), cc2D = shade(cc2, 0.72);
    h.box(-hx * 1.08, hy, -hx * 1.08, hx * 1.08, hy + 0.05, hx * 1.08, cc2, cc2D);
    return;
  }
  // modern: flat cap
  h.box(-hx * 1.08, hy, -hx * 1.08, hx * 1.08, hy + 0.04, hx * 1.08, hairColor, dark, shade(dark, 0.85));
}

// ── Outfit/colour scheme per era ─────────────────────────────

function outfitScheme(eraId, sex, outfitHex) {
  const female = sex === 'F';
  const col = toLinear(outfitHex);

  if (eraId <= 1) {
    col._kind = 'tunic';
    const belt = toLinear('#5a3a18');
    const leg  = toLinear(eraId === 0 ? '#5a4a2a' : '#6a3a22');
    const shoe = toLinear('#2a1a0a');
    return { outfit: col, beltColor: belt, legColor: leg, shoe };
  }
  if (eraId === 2) {
    col._kind = 'coat';
    const belt = shade(col, 0.6);
    const leg  = toLinear('#3a3428');
    const shoe = toLinear('#181210');
    return { outfit: col, beltColor: belt, legColor: leg, shoe };
  }
  if (eraId <= 4) {
    col._kind = female ? 'apron' : 'jacket';
    const belt = female ? toLinear('#2a2440') : shade(col, 0.55);
    const leg  = female ? toLinear('#2a2440') : toLinear('#282420');
    const shoe = toLinear('#151010');
    return { outfit: col, beltColor: belt, legColor: leg, shoe };
  }
  // eraId 5-8 – modern casual
  col._kind = 'jacket';
  const belt = toLinear('#303030');
  const leg  = toLinear('#2e3545');
  const shoe = toLinear('#202020');
  return { outfit: col, beltColor: belt, legColor: leg, shoe };
}

// ── Public factory ─────────────────────────────────────────

// G4: cache key versioned with |v2 to invalidate old single-mesh geometry entries.
const _geomCache = new Map();   // key '<tier>|<sex>|<outfitHex>|<hairHex>|<skinHex>|<eraId>|v2' -> geoms

/**
 * Build (or return cached geometry for) a THREE.Group for one character.
 * The group has children:
 *   - 'char-body'  THREE.Mesh  (head, torso, shoes, outfit details — no limbs)
 *   - 'char-hair'  THREE.Mesh
 *   - 'armL'       THREE.Object3D pivot  (shoulder at y=0.74; arm mesh child)
 *   - 'armR'       THREE.Object3D pivot
 *   - 'legL'       THREE.Object3D pivot  (hip at y=0; leg mesh child)
 *   - 'legR'       THREE.Object3D pivot
 *
 * group.userData.pivots = { armL, armR, legL, legR }
 *
 * @param {{gedcomId:string, sex:string, birthYear:number|null, eraYear:number,
 *          eraId:number, hairColorHex:string, skinColorHex:string, outfitColorHex:string}} opts
 * @returns {THREE.Group}
 */
export function buildCharacter({ gedcomId, sex, birthYear, eraYear, eraId, hairColorHex, skinColorHex, outfitColorHex }) {
  const tier   = ageTier(birthYear, eraYear);
  const cacheKey = `${tier}|${sex}|${outfitColorHex}|${hairColorHex}|${skinColorHex}|${eraId}|v2`;

  let geoms = _geomCache.get(cacheKey);
  if (!geoms) {
    const skin   = toLinear(skinColorHex);
    const hair   = toLinear(hairColorHex);
    const { outfit, beltColor, legColor, shoe } = outfitScheme(eraId, sex, outfitColorHex);
    const female = sex === 'F';
    const hipW   = 0.085 * (female ? 1.10 : 1.0);
    const shoulderW = 0.20 * (female ? 0.90 : 1.0);

    const bodyB = buildBodyGeometry({ tier, sex, skin, outfit, shoe, beltColor, legColor });
    const hairB = buildHairGeometry({ tier, sex, hairColor: hair, outfitKind: outfit._kind });
    const armLB = buildArmGeometry({ tier, sex, skin, outfit, side: -1 });
    const armRB = buildArmGeometry({ tier, sex, skin, outfit, side:  1 });
    const legLB = buildLegGeometry({ tier, sex, legColor, shoe });
    const legRB = buildLegGeometry({ tier, sex, legColor, shoe });

    const totalTris = bodyB.triangles + hairB.triangles +
                      armLB.triangles + armRB.triangles +
                      legLB.triangles + legRB.triangles;

    geoms = {
      body: bodyB.toGeometry(false),
      hair: hairB.toGeometry(false),
      armL: armLB.toGeometry(false),
      armR: armRB.toGeometry(false),
      legL: legLB.toGeometry(false),
      legR: legRB.toGeometry(false),
      triangles: totalTris,
      // pivot positions (world y in group-local space, before FIGURE_SCALE)
      shoulderY: 0.74,
      shoulderXL: -(shoulderW + 0.03),   // left shoulder x
      shoulderXR:  (shoulderW + 0.03),   // right shoulder x
      hipXL: -hipW,                       // left hip x
      hipXR:  hipW,                       // right hip x
    };
    _geomCache.set(cacheKey, geoms);
  }

  const mat     = new THREE.MeshLambertMaterial({ vertexColors: true });
  const hairMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const limbMat = new THREE.MeshLambertMaterial({ vertexColors: true });

  const bodyMesh = new THREE.Mesh(geoms.body, mat);
  bodyMesh.castShadow = true;
  bodyMesh.name = 'char-body';

  const hairMesh = new THREE.Mesh(geoms.hair, hairMat);
  hairMesh.name = 'char-hair';

  // ── gait pivots: each holds one arm + its opposite leg (natural walking gait) ──
  // phaseA pivot: left arm + right leg (swing forward together)
  // phaseB pivot: right arm + left leg (swing backward together)
  // Two Object3D pivots → two extra draw calls (was 4; reduces era-3 desktop from 138 to ~106)

  const phaseA = new THREE.Object3D();
  phaseA.name = 'phaseA';  // armL + legR share this pivot (rotate.x = +swing)

  const armLMesh = new THREE.Mesh(geoms.armL, limbMat);
  armLMesh.castShadow = true;
  armLMesh.name = 'char-armL';
  // arm pivot at shoulder: translate mesh to shoulder position
  armLMesh.position.set(geoms.shoulderXL, geoms.shoulderY, 0);
  phaseA.add(armLMesh);

  const legRMesh = new THREE.Mesh(geoms.legR, limbMat);
  legRMesh.castShadow = true;
  legRMesh.name = 'char-legR';
  // leg pivot at hip: translate mesh to right hip position
  legRMesh.position.set(geoms.hipXR, 0, 0);
  phaseA.add(legRMesh);

  const phaseB = new THREE.Object3D();
  phaseB.name = 'phaseB';  // armR + legL share this pivot (rotate.x = -swing)

  const armRMesh = new THREE.Mesh(geoms.armR, limbMat);
  armRMesh.castShadow = true;
  armRMesh.name = 'char-armR';
  armRMesh.position.set(geoms.shoulderXR, geoms.shoulderY, 0);
  phaseB.add(armRMesh);

  const legLMesh = new THREE.Mesh(geoms.legL, limbMat);
  legLMesh.castShadow = true;
  legLMesh.name = 'char-legL';
  legLMesh.position.set(geoms.hipXL, 0, 0);
  phaseB.add(legLMesh);

  const group = new THREE.Group();
  group.add(bodyMesh);
  group.add(hairMesh);
  group.add(phaseA);
  group.add(phaseB);

  group.userData.triCount = geoms.triangles;
  // G4: expose gait pivots so Entities3D can rotate them without scene traversal each frame
  // phaseA rotates +swing (armL swings forward, legR swings forward — natural gait)
  // phaseB rotates -swing (armR swings backward, legL swings backward)
  group.userData.pivots = { phaseA, phaseB };

  return group;
}

/** Dispose all cached geometries (call on era unload if needed). */
export function clearCharacterCache() {
  for (const g of _geomCache.values()) {
    g.body?.dispose();
    g.hair?.dispose();
    g.armL?.dispose();
    g.armR?.dispose();
    g.legL?.dispose();
    g.legR?.dispose();
  }
  _geomCache.clear();
}
