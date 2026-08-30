// ═══════════════════════════════════════════════════════════
//  Renderer — canvas 2D tile & sprite drawing
//  Single source of truth for TILE_SIZE and SOLID_TYPES
// ═══════════════════════════════════════════════════════════

export const TILE = 48;

// Tile IDs
export const T = {
  GRASS:0, WALL:1, WATER:2, TREE:3, ROCK:4, COBBLE:5,
  WHEAT:6, FLOWER:7, CORN:8, ROAD:9, PLANK:10,
  STEEL:11, BRIDGE:12, HOUSE_WALL:13, HOUSE_ROOF:14,
  DOOR:15, PORTAL:16, DEEP_WATER:17, CLIFF:18,
  PINE:19, BRICK:20, DIRT:21, CROP_READY:22, CROP_SPENT:23,
  SAND:24, CIRCUIT:25,
};

/** Tiles that block movement. Import this everywhere — do NOT duplicate. */
export const SOLID_TYPES = new Set([
  T.WALL, T.WATER, T.TREE, T.ROCK, T.BRICK, T.HOUSE_WALL,
  T.DEEP_WATER, T.CLIFF, T.PINE,
]);

/** Tiles adjacent to which fishing is allowed */
export const FISHABLE_WATER = new Set([T.WATER, T.DEEP_WATER, T.BRIDGE]);

// ── Era colour tints ─────────────────────────────────────
const ERA_TINTS = [
  { sky:['#87a060','#c8d890'], ambient:'rgba(120,90,40,0.08)'   }, // 0 · 1539
  { sky:['#5580b0','#d4a840'], ambient:'rgba(180,160,60,0.10)'  }, // 1 · 1660
  { sky:['#607898','#a8b8c8'], ambient:'rgba(60,80,100,0.12)'   }, // 2 · 1799
  { sky:['#706050','#c09060'], ambient:'rgba(80,50,20,0.15)'    }, // 3 · 1872
  { sky:['#203050','#305880'], ambient:'rgba(20,40,80,0.15)'    }, // 4 · 1950
  { sky:['#80a040','#d4c060'], ambient:'rgba(140,120,40,0.08)'  }, // 5 · 1955
  { sky:['#3050a0','#a040c0'], ambient:'rgba(60,40,100,0.10)'   }, // 6 · 1984
  { sky:['#4080c0','#80c0e0'], ambient:'rgba(40,80,120,0.08)'   }, // 7 · 2020
];

let _eraId = 0;
export function setEra(id) { _eraId = Math.max(0, Math.min(7, id)); }

// ── Sky ──────────────────────────────────────────────────
export function drawSky(ctx, w, h, frame, timeOfDay = 0.5) {
  const t = ERA_TINTS[_eraId];
  const g = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  g.addColorStop(0, t.sky[0]);
  g.addColorStop(1, t.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Stars at night (timeOfDay > 0.75)
  if (timeOfDay > 0.7) {
    const alpha = Math.min((timeOfDay - 0.7) / 0.3, 1) * 0.8;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    const rng = mulberry32(42);
    for (let i = 0; i < 60; i++) {
      const sx = rng() * w, sy = rng() * h * 0.5;
      const r  = rng() * 1.5 + 0.5;
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
    }
  }
}

// ── Tile colours & patterns ───────────────────────────────
const TILE_COLORS = {
  [T.GRASS]:     '#5a8a3a', [T.WALL]:      '#888070', [T.WATER]:     '#3070b0',
  [T.TREE]:      '#2a5a1a', [T.ROCK]:      '#707060', [T.COBBLE]:    '#8a8070',
  [T.WHEAT]:     '#c0a030', [T.FLOWER]:    '#d04080', [T.CORN]:      '#80b040',
  [T.ROAD]:      '#a09070', [T.PLANK]:     '#a07040', [T.STEEL]:     '#606880',
  [T.BRIDGE]:    '#907850', [T.HOUSE_WALL]:'#c0a070', [T.HOUSE_ROOF]:'#903030',
  [T.DOOR]:      '#60300a', [T.PORTAL]:    '#8040ff', [T.DEEP_WATER]:'#1a3a70',
  [T.CLIFF]:     '#605040', [T.PINE]:      '#1a4a1a', [T.BRICK]:     '#b06040',
  [T.DIRT]:      '#907060', [T.CROP_READY]:'#40c040', [T.CROP_SPENT]:'#806040',
  [T.SAND]:      '#d4b870', [T.CIRCUIT]:   '#104020',
};

export function drawTiles(ctx, map, rows, cols, ox, oy, w, h) {
  const startC = Math.max(0, Math.floor(ox / TILE));
  const startR = Math.max(0, Math.floor(oy / TILE));
  const endC   = Math.min(cols - 1, Math.ceil((ox + w) / TILE));
  const endR   = Math.min(rows - 1, Math.ceil((oy + h) / TILE));

  for (let r = startR; r <= endR; r++) {
    for (let c = startC; c <= endC; c++) {
      const tile = map[r]?.[c] ?? T.GRASS;
      const px   = c * TILE - ox;
      const py   = r * TILE - oy;
      _drawTile(ctx, tile, px, py, TILE);
    }
  }

  // Era ambient overlay
  const tint = ERA_TINTS[_eraId];
  if (tint.ambient !== 'none') {
    ctx.fillStyle = tint.ambient;
    ctx.fillRect(0, 0, w, h);
  }
}

function _drawTile(ctx, tile, px, py, s) {
  ctx.fillStyle = TILE_COLORS[tile] ?? '#5a8a3a';
  ctx.fillRect(px, py, s, s);

  switch (tile) {
    case T.GRASS:
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      ctx.fillRect(px + s*0.1, py + s*0.3, s*0.05, s*0.4);
      ctx.fillRect(px + s*0.4, py + s*0.2, s*0.05, s*0.45);
      ctx.fillRect(px + s*0.7, py + s*0.3, s*0.05, s*0.35);
      break;
    case T.WATER: case T.DEEP_WATER:
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(px + s*0.1, py + s*0.4, s*0.35, s*0.05);
      ctx.fillRect(px + s*0.55, py + s*0.6, s*0.3, s*0.05);
      break;
    case T.PORTAL:
      _drawPortal(ctx, px, py, s, Date.now());
      break;
    case T.CROP_READY:
      ctx.fillStyle = '#80ff40';
      ctx.fillRect(px + s*0.3, py + s*0.1, s*0.4, s*0.05);  // glow line
      break;
    case T.TREE:
      ctx.fillStyle = '#1a4a0a';
      ctx.beginPath();
      ctx.arc(px + s/2, py + s*0.45, s*0.38, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#5a3010';
      ctx.fillRect(px + s*0.42, py + s*0.7, s*0.16, s*0.28);
      break;
    case T.HOUSE_ROOF:
      ctx.fillStyle = '#601818';
      ctx.beginPath();
      ctx.moveTo(px, py + s); ctx.lineTo(px + s/2, py); ctx.lineTo(px + s, py + s);
      ctx.fill();
      break;
    default: break;
  }
}

function _drawPortal(ctx, px, py, s, now) {
  const phase = (now / 900) % (Math.PI * 2);
  const rings = 3;
  for (let i = 0; i < rings; i++) {
    const r = s * (0.25 + i * 0.12 + Math.sin(phase + i * 1.2) * 0.05);
    const alpha = 0.4 + Math.sin(phase + i * 0.8) * 0.2;
    ctx.strokeStyle = `rgba(160, 80, 255, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px + s/2, py + s/2, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(100,40,200,${0.15 + Math.sin(phase) * 0.05})`;
  ctx.beginPath();
  ctx.arc(px + s/2, py + s/2, s * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

// ── Player sprite ─────────────────────────────────────────
export function drawPlayer(ctx, x, y, opts = {}) {
  const {
    facing = 'down', walkCycle = 0, hurt = false,
    hairColor = '#c07830', bodyColor = '#3060a0', skinColor = '#f0c080',
    pose = 'idle', // idle | reading | sleeping | pointing | surprised
  } = opts;

  if (hurt && Math.sin(Date.now() / 50) > 0) return;

  const s  = TILE * 0.55;
  const hs = s / 2;
  const bob = pose === 'sleeping' ? 0 : (pose === 'idle' ? Math.sin(walkCycle) * 1.5 : 0);

  ctx.save();
  ctx.translate(x + hs, y + bob);

  if (pose === 'sleeping') {
    ctx.rotate(Math.PI / 2 * 0.9);
  }

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.45, hs * 0.7, hs * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-hs * 0.55, -s * 0.05, s * 0.55 * 2 * 0.55, s * 0.5);

  // Legs (walk animation)
  const legSwing = pose === 'idle' ? Math.sin(walkCycle) * 4 : 0;
  ctx.fillStyle = '#303040';
  ctx.fillRect(-hs * 0.4, s * 0.35, hs * 0.35, s * 0.25);
  ctx.fillRect( hs * 0.05, s * 0.35, hs * 0.35, s * 0.25);

  // Head
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(0, -s * 0.15, hs * 0.42, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.arc(0, -s * 0.22, hs * 0.42, Math.PI, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#202020';
  if (pose === 'sleeping') {
    ctx.fillStyle = '#303030';
    ctx.fillRect(-hs * 0.18, -s * 0.18, hs * 0.12, hs * 0.04); // closed eyes
    ctx.fillRect( hs * 0.06, -s * 0.18, hs * 0.12, hs * 0.04);
  } else if (pose === 'surprised') {
    ctx.beginPath(); ctx.arc(-hs*0.15, -s*0.17, hs*0.1, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc( hs*0.15, -s*0.17, hs*0.1, 0, Math.PI*2); ctx.fill();
  } else {
    const eyeDir = facing === 'left' ? -1 : facing === 'right' ? 1 : 0;
    ctx.beginPath(); ctx.arc(-hs*0.12 + eyeDir*2, -s*0.15, hs*0.07, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc( hs*0.12 + eyeDir*2, -s*0.15, hs*0.07, 0, Math.PI*2); ctx.fill();
  }

  // Arm (pointing/reading)
  if (pose === 'pointing') {
    ctx.fillStyle = skinColor;
    ctx.fillRect(hs * 0.4, -s * 0.05, s * 0.35, hs * 0.14);
  } else if (pose === 'reading') {
    ctx.fillStyle = '#c09060'; // journal
    ctx.fillRect(-hs * 0.5, s * 0.15, s * 0.6, s * 0.3);
    ctx.strokeStyle = '#7a5030'; ctx.lineWidth = 1;
    ctx.strokeRect(-hs * 0.5, s * 0.15, s * 0.6, s * 0.3);
  }

  ctx.restore();
}

// ── NPC portrait canvas ───────────────────────────────────
export function drawNPCPortrait(ctx, opts = {}) {
  const {
    skinColor = '#f0c080', hairColor = '#804020', bodyColor = '#806040',
    era = 0, w = 64, h = 64,
  } = opts;
  ctx.clearRect(0, 0, w, h);

  // Background tint
  ctx.fillStyle = ERA_TINTS[era].sky[0];
  ctx.fillRect(0, 0, w, h);

  // Body
  ctx.fillStyle = bodyColor;
  ctx.fillRect(w*0.2, h*0.55, w*0.6, h*0.45);

  // Head
  ctx.fillStyle = skinColor;
  ctx.beginPath(); ctx.arc(w/2, h*0.38, w*0.26, 0, Math.PI*2); ctx.fill();

  // Hair
  ctx.fillStyle = hairColor;
  ctx.beginPath(); ctx.arc(w/2, h*0.28, w*0.26, Math.PI, Math.PI*2); ctx.fill();

  // Eyes
  ctx.fillStyle = '#202020';
  ctx.beginPath(); ctx.arc(w*0.38, h*0.37, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(w*0.62, h*0.37, 2.5, 0, Math.PI*2); ctx.fill();
}

// ── Enemy sprite ──────────────────────────────────────────
export function drawEnemy(ctx, x, y, opts = {}) {
  const { color = '#a03020', accent = '#c05040', emoji = '👹', size = TILE * 0.65 } = opts;
  const cx = x + size / 2, cy = y + size / 2;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(cx, y + size * 0.9, size * 0.35, size * 0.1, 0, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy - size * 0.05, size * 0.38, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = accent;
  ctx.beginPath(); ctx.arc(cx, cy - size * 0.1, size * 0.22, 0, Math.PI*2); ctx.fill();

  ctx.font      = `${Math.floor(size * 0.4)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, cx, cy - size * 0.05);
}

// ── Dropped item sparkle ──────────────────────────────────
export function drawDroppedItem(ctx, x, y, emoji, frame) {
  const s   = TILE * 0.5;
  const bob = Math.sin(frame / 30) * 3;
  const glow = 0.4 + Math.sin(frame / 20) * 0.2;

  ctx.fillStyle = `rgba(255,220,80,${glow})`;
  ctx.beginPath(); ctx.arc(x + s/2, y + s/2 + bob, s * 0.38, 0, Math.PI*2); ctx.fill();

  ctx.font = `${Math.floor(s * 0.6)}px serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x + s/2, y + s/2 + bob);
}

// ── Fishing bobber ────────────────────────────────────────
export function drawBobber(ctx, x, y, dipped, frame) {
  const bob = dipped ? 4 : Math.sin(frame / 25) * 2;
  ctx.fillStyle = dipped ? '#ff3030' : '#ffffff';
  ctx.strokeStyle = '#404040';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y + bob, 5, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
}

// ── Mini-map ──────────────────────────────────────────────
export function drawMinimap(ctx, worldCols, worldRows, visitedSet, currentR, currentC, x, y, cellSize = 8) {
  const W = worldCols * cellSize + 4;
  const H = worldRows * cellSize + 4;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(x - 2, y - 2, W, H);
  for (let r = 0; r < worldRows; r++) {
    for (let c = 0; c < worldCols; c++) {
      const key = `${r},${c}`;
      const isCurrent = r === currentR && c === currentC;
      ctx.fillStyle = isCurrent ? '#f0c040' : visitedSet.has(key) ? '#80a060' : '#303030';
      ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize - 1, cellSize - 1);
    }
  }
}

// ── Simple seeded RNG (for deterministic stars) ───────────
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
