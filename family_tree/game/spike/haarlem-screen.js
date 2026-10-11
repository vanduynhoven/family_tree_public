// haarlem-screen.js
// Extracted from EraData.js _buildHaarlemWorld(), screen [1,0]:
//   "2026 · A canal house in Haarlem" — the Era 8 HOME screen.
// 20 columns × 14 rows (SCREEN_COLS × SCREEN_ROWS).
// This module has NO imports from the existing game — pure data, no DOM side-effects.

// Tile IDs (matches Renderer.js export const T)
export const T = {
  GRASS:0, WALL:1, WATER:2, TREE:3, ROCK:4, COBBLE:5,
  WHEAT:6, FLOWER:7, CORN:8, ROAD:9, PLANK:10,
  STEEL:11, BRIDGE:12, HOUSE_WALL:13, HOUSE_ROOF:14,
  DOOR:15, PORTAL:16, DEEP_WATER:17, CLIFF:18,
  PINE:19, BRICK:20, DIRT:21, CROP_READY:22, CROP_SPENT:23,
  SAND:24, CIRCUIT:25,
};

// Which tile IDs are solid (player cannot walk through)
export const SOLID = new Set([
  T.WALL, T.WATER, T.TREE, T.ROCK, T.BRICK, T.HOUSE_WALL,
  T.DEEP_WATER, T.CLIFF, T.PINE,
]);

// PORTAL tiles are walkable (they just trigger an era transition)
// BRIDGE, DOOR, ROAD, COBBLE, GRASS, FLOWER, WHEAT, CROP_READY, PLANK = walkable

export const COLS = 20;
export const ROWS = 14;

// Build the 14×20 tile grid (row-major) for the HOME screen [1,0].
// Faithfully reconstructed from _buildHaarlemWorld block [1,0] in EraData.js.
function buildGrid() {
  // H=14, W=20
  const H = 14, W = 20;
  const m = Array.from({length: H}, () => new Uint8Array(W).fill(T.COBBLE));

  const fill = (r1, c1, r2, c2, t) => {
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++)
        if (r >= 0 && r < H && c >= 0 && c < W) m[r][c] = t;
  };
  const set = (r, c, t) => { if (r >= 0 && r < H && c >= 0 && c < W) m[r][c] = t; };

  // Canal on left (cols 0-4)
  fill(0, 0, H-1, 4, T.WATER);

  // Bridge to house (rows 6-7, col 4)
  set(6, 4, T.BRIDGE);
  set(7, 4, T.BRIDGE);

  // Bike path (cols 5-6)
  fill(0, 5, H-1, 6, T.ROAD);

  // House body: 3-story Dutch brick house (rows 1-7, cols 7-13)
  fill(1, 7, 7, 13, T.HOUSE_WALL);

  // Roof (row 0, cols 7-13)
  fill(0, 7, 0, 13, T.HOUSE_ROOF);

  // Front door (row 7, col 10) — faces canal
  set(7, 10, T.DOOR);

  // Garden behind (rows 1-13, cols 14-19)
  fill(1, 14, H-1, W-1, T.GRASS);

  // Garden flowers (rows 3-6, cols 14-17)
  fill(3, 14, 6, 17, T.FLOWER);

  // Window box flowers on roof row (row 0, every other col 8-12)
  for (let c = 8; c <= 13; c += 2) set(0, c, T.FLOWER);

  // Bicycle parked outside (row 8, col 6 — already ROAD)
  set(8, 6, T.ROAD);

  // Time Portal hidden in the attic (row 2, cols 10-11)
  set(2, 10, T.PORTAL);
  set(2, 11, T.PORTAL);

  // Clear a 2×2 player-spawn zone (row 8, col 8) — walkable cobble
  // (clearZone from EraData sets these to COBBLE — already the base fill)
  set(8, 8, T.COBBLE);
  set(8, 9, T.COBBLE);
  set(9, 8, T.COBBLE);
  set(9, 9, T.COBBLE);

  return m;
}

export const GRID = buildGrid();

// Player start tile (from makeScreen call: {r:8,c:8})
export const PLAYER_START = { r: 8, c: 8 };

// NPC spawn tile (from NPC_DATA '8_1_0': spawnR:9, spawnC:9)
export const NPC_SPAWN = { r: 9, c: 9 };

// NPC dialog (first line from NPC_DATA['8_1_0'] Arthur Van Duynhoven)
export const NPC = {
  name: 'Arthur Van Duynhoven',
  given: 'Arthur',
  bodyColor: '#2050a0',
  hairColor: '#1a1a2a',
  skinColor: '#c89050',
  line: 'A canal house in Haarlem. We\'ve lived here three years now. It still feels like a dream.',
};
