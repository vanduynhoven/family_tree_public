// ship-1950-data.js - Minimal data structure for RMS Queen Elizabeth (Era 4, 1950)
// This is a stub - the real ship has a tile map in EraData.js
export default {
  // Start position (deck center, in world units)
  start: [0, 0],
  
  // NPC position (Johan van Duijnhoven, emigrating)
  npc: [8, 12],
  
  // Ship bounds (approximation of deck area)
  bounds: { minX: -20, maxX: 20, minZ: -14, maxZ: 14 },
  
  // Buildings array (minimal - would come from tile map in real game)
  b: [],
  
  // Roads/paths (deck planking areas)
  r: [],
  
  // Trees (none on ship)
  t: [],
  
  // Lamps (ship lighting)
  l: [],
  
  // Label
  label: '1950 · RMS Queen Elizabeth — Atlantic Crossing',
  attribution: 'Historical ocean liner crossing'
};
