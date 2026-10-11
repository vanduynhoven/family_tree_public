// ═══════════════════════════════════════════════════════════
//  EraStyle3D - how each era looks in the 3D renderer, and the day/night curve (G1)
//
//  One table row per era (ids 0..8, the same ids as ERAS in EraData.js). Sky and sun values start from the
//  Chronicles lighting palettes harvested in docs/game/era-lighting.md (the 8 old moods line up one to one
//  with eras 0..7: medieval, golden age, Napoleonic, industrial, ocean, Minnesota, suburban, modern; era 8 is
//  the present day and re-uses "modern" a little brighter). Ground colours follow the fallbacks and
//  procedural helpers of the 2D Renderer.js. This is a PLACEHOLDER style table: G2 builds the real one.
//
//  timeOfDay (view.timeOfDay, 0..1) is the game's own clock: the game starts at 0.3 (morning), 0.5 is noon,
//  the 2D sky shows stars from 0.72, so here 0.76 is sunset and 0.92..1.1 is night.
// ═══════════════════════════════════════════════════════════
import * as THREE from '../../../vendor/three/three.module.min.js';

export const ERA_STYLE = [
  // 0 · 1539 Aarle-Rixtel - warm morning, heath, thatch
  { year: '1539', skyTop: '#4a8ab8', skyHorizon: '#8abcd4', sun: '#ffdc8c', sunI: 1.9, hemSky: '#a8c8e0', hemGround: '#4a4a24', hemI: 1.45, ambI: 0.40,
    grass: '#6e9a3a', road: '#8f7a56', cobble: '#a89c7c', dirt: '#8a6a42', sand: '#d8c888', water: '#2f78a8', deep: '#1c4f7c', plank: '#a98550', steel: '#707880',
    wall: '#d4b880', brick: '#a8553a', roof: '#8a7048', roofStyle: 'thatch', stone: '#8a8478' },
  // 1 · 1660 Golden Age - bright noon, red brick and tile
  { year: '1660', skyTop: '#5a9ccc', skyHorizon: '#9acce4', sun: '#fff0b4', sunI: 2.0, hemSky: '#b4d8f0', hemGround: '#4c4a28', hemI: 1.45, ambI: 0.40,
    grass: '#68a038', road: '#9a8660', cobble: '#b0a488', dirt: '#8a6a42', sand: '#ddcc8a', water: '#2e78b4', deep: '#1c4f86', plank: '#a98550', steel: '#707880',
    wall: '#c8a870', brick: '#a0503a', roof: '#903030', roofStyle: 'tile', stone: '#8c8678' },
  // 2 · 1799 Napoleonic Uden - overcast, flat light
  { year: '1799', skyTop: '#607898', skyHorizon: '#9ab0c4', sun: '#c8d2dc', sunI: 1.35, hemSky: '#b0c0d0', hemGround: '#444838', hemI: 1.75, ambI: 0.55,
    grass: '#628a3c', road: '#8c7c60', cobble: '#a09882', dirt: '#826642', sand: '#d0c488', water: '#3a6a8a', deep: '#254a68', plank: '#9a7a4c', steel: '#6c747c',
    wall: '#c0a068', brick: '#9a5038', roof: '#7a3028', roofStyle: 'tile', stone: '#848074' },
  // 3 · 1872 Industrial Noord-Brabant - smoky sepia
  { year: '1872', skyTop: '#504038', skyHorizon: '#908070', sun: '#d8b078', sunI: 1.5, hemSky: '#a89880', hemGround: '#3c3024', hemI: 1.45, ambI: 0.45,
    grass: '#5f7d38', road: '#6e6454', cobble: '#8a8272', dirt: '#6e5236', sand: '#c4b27c', water: '#3a5a6a', deep: '#24404e', plank: '#8e7048', steel: '#646a70',
    wall: '#b89860', brick: '#8a4632', roof: '#703020', roofStyle: 'tile', stone: '#767064' },
  // 4 · 1950 emigrant ship - blue-grey ocean, plank deck
  { year: '1950', skyTop: '#2a5878', skyHorizon: '#6090b8', sun: '#b4dcff', sunI: 1.7, hemSky: '#90b8d8', hemGround: '#203850', hemI: 1.5, ambI: 0.45,
    grass: '#5a8a3a', road: '#5c6670', cobble: '#6a7480', dirt: '#6a5a44', sand: '#c0b890', water: '#1d5f8f', deep: '#103c66', plank: '#9a7a4c', steel: '#6c7a8a',
    wall: '#5c6c7c', brick: '#6a4a3a', roof: '#7a6a56', roofStyle: 'flat', stone: '#586878' },
  // 5 · 1955 Green Isle, Minnesota - clear summer prairie
  { year: '1955', skyTop: '#60aad0', skyHorizon: '#a0d4e8', sun: '#f8ffc8', sunI: 1.95, hemSky: '#b8e0f0', hemGround: '#58602c', hemI: 1.45, ambI: 0.40,
    grass: '#86a838', road: '#8a7c5e', cobble: '#a09a88', dirt: '#8c6a40', sand: '#e0d090', water: '#3a82b0', deep: '#235e8a', plank: '#b08a58', steel: '#788490',
    wall: '#c8b888', brick: '#a05840', roof: '#506040', roofStyle: 'shingle', stone: '#8c8a80' },
  // 6 · 1984 Wisconsin & Netherlands - dusk purple
  { year: '1984', skyTop: '#8878b0', skyHorizon: '#b8acd8', sun: '#e8d4f0', sunI: 1.65, hemSky: '#c4b4e0', hemGround: '#403858', hemI: 1.5, ambI: 0.46,
    grass: '#67a03f', road: '#4e4e58', cobble: '#9a98a0', dirt: '#7e6446', sand: '#d8c898', water: '#3d78b0', deep: '#274e84', plank: '#a8845a', steel: '#7a8498',
    wall: '#d0c8b0', brick: '#a05a46', roof: '#6a7c68', roofStyle: 'flat', stone: '#8a8892' },
  // 7 · 2020 Minnesota & Haarlem - clear modern sky
  { year: '2020', skyTop: '#90b8d8', skyHorizon: '#c0d8f0', sun: '#fff4e0', sunI: 2.0, hemSky: '#c8e0f4', hemGround: '#4c5638', hemI: 1.45, ambI: 0.40,
    grass: '#62a83a', road: '#4c4e56', cobble: '#a0a0a8', dirt: '#82664a', sand: '#dcd0a0', water: '#3a82bc', deep: '#245e92', plank: '#aa8858', steel: '#8a94a4',
    wall: '#c8c0b0', brick: '#a85a48', roof: '#667488', roofStyle: 'flat', stone: '#90909a' },
  // 8 · 2026 Haarlem & Mankato - the present day
  { year: '2026', skyTop: '#7eb0dc', skyHorizon: '#bcdcf4', sun: '#fff2d8', sunI: 2.05, hemSky: '#c4e0f6', hemGround: '#4c5a38', hemI: 1.45, ambI: 0.40,
    grass: '#66ab38', road: '#4e5058', cobble: '#b0a898', dirt: '#82664a', sand: '#dcd0a0', water: '#3a82bc', deep: '#245e92', plank: '#b08a58', steel: '#8a94a4',
    wall: '#c8b080', brick: '#a85a38', roof: '#903030', roofStyle: 'tile', stone: '#8c8c94' },
];

export function eraStyle(eraId) {
  const i = Number.isFinite(eraId) ? Math.max(0, Math.min(ERA_STYLE.length - 1, eraId | 0)) : 0;
  return ERA_STYLE[i];
}

// ── day / night ───────────────────────────────────────────
// [timeOfDay, daylight 0..1, warmth 0..1 (sunrise / sunset glow)]
const TOD_KEYS = [
  [0.00, 0.10, 0.00], [0.12, 0.12, 0.00], [0.20, 0.42, 0.90], [0.28, 0.86, 0.35], [0.36, 1.00, 0.00],
  [0.62, 1.00, 0.00], [0.70, 0.90, 0.35], [0.76, 0.56, 0.90], [0.84, 0.22, 0.40], [0.92, 0.10, 0.00], [1.00, 0.10, 0.00],
];

/** @returns {{light:number, warm:number, night:number, sunAngle:number}} light 1 = full day, night 1 = dark. */
export function dayCycle(tod, out = {}) {
  const t = ((tod % 1) + 1) % 1;
  let i = 0;
  while (i < TOD_KEYS.length - 2 && t > TOD_KEYS[i + 1][0]) i++;
  const a = TOD_KEYS[i], b = TOD_KEYS[i + 1];
  const k = b[0] === a[0] ? 0 : (t - a[0]) / (b[0] - a[0]);
  const s = k * k * (3 - 2 * k);
  out.light = a[1] + (b[1] - a[1]) * s;
  out.warm = a[2] + (b[2] - a[2]) * s;
  out.night = 1 - smoothstep(0.14, 0.55, out.light);
  out.sunAngle = ((t - 0.25) / 0.5);          // 0 at sunrise .. 1 at sunset (outside 0..1 = night)
  return out;
}

export function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

const NIGHT = {
  skyTop: new THREE.Color('#0a1230'), skyHorizon: new THREE.Color('#1c2c50'),
  hemSky: new THREE.Color('#4a5c9a'), hemGround: new THREE.Color('#1c2230'),
  moon: new THREE.Color('#8aa4ff'), ambient: new THREE.Color('#6070b0'),
};
const WARM = new THREE.Color('#ff9a50');
const WHITE = new THREE.Color('#ffffff');

/** Fill `out` (THREE.Colors and numbers) with the lighting for an era at a time of day. Allocation free after the first call. */
export function lightingFor(style, tod, out) {
  const c = out._cyc || (out._cyc = {});
  dayCycle(tod, c);
  const L = c.light, W = c.warm;
  out.light = L; out.night = c.night; out.warm = W; out.sunAngle = c.sunAngle;
  const col = k => out[k] || (out[k] = new THREE.Color());
  const sky = (out._skyTop || (out._skyTop = new THREE.Color())).set(style.skyTop);
  const hor = (out._skyHor || (out._skyHor = new THREE.Color())).set(style.skyHorizon);
  col('skyTop').copy(NIGHT.skyTop).lerp(sky, L);
  col('skyHorizon').copy(NIGHT.skyHorizon).lerp(hor, L).lerp(WARM, W * 0.5);
  col('fog').copy(out.skyHorizon).multiplyScalar(0.96);
  const hs = (out._hs || (out._hs = new THREE.Color())).set(style.hemSky);
  const hg = (out._hg || (out._hg = new THREE.Color())).set(style.hemGround);
  col('hemSky').copy(NIGHT.hemSky).lerp(hs, L);
  col('hemGround').copy(NIGHT.hemGround).lerp(hg, L);
  out.hemI = 1.3 + (style.hemI - 1.3) * L;
  col('ambient').copy(NIGHT.ambient).lerp(WHITE, L);
  out.ambI = 0.9 + (style.ambI - 0.9) * L;
  // one directional light is the sun by day and the moon by night
  const sun = (out._sun || (out._sun = new THREE.Color())).set(style.sun);
  const k = smoothstep(0.16, 0.6, L);
  col('lightColor').copy(NIGHT.moon).lerp(sun, k).lerp(WARM, W * 0.55 * k);
  out.lightI = 0.9 + (style.sunI - 0.9) * k;
  out.sunUp = k;
  return out;
}
