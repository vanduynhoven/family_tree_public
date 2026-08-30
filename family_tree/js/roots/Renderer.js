// ═══════════════════════════════════════════════════════════
//  Renderer — LPC sprite sheet rendering (Stardew-quality)
//  Tiles from LPC terrain.png (32×32), characters from
//  character-body.png + outfit overlays (64×64 per frame)
//  Single source of truth for TILE_SIZE and SOLID_TYPES
// ═══════════════════════════════════════════════════════════

export const TILE = 48;  // render size (upscaled from 32px source)

// ── Tile IDs ──────────────────────────────────────────────
export const T = {
  GRASS:0, WALL:1, WATER:2, TREE:3, ROCK:4, COBBLE:5,
  WHEAT:6, FLOWER:7, CORN:8, ROAD:9, PLANK:10,
  STEEL:11, BRIDGE:12, HOUSE_WALL:13, HOUSE_ROOF:14,
  DOOR:15, PORTAL:16, DEEP_WATER:17, CLIFF:18,
  PINE:19, BRICK:20, DIRT:21, CROP_READY:22, CROP_SPENT:23,
  SAND:24, CIRCUIT:25,
};

export const SOLID_TYPES = new Set([
  T.WALL, T.WATER, T.TREE, T.ROCK, T.BRICK, T.HOUSE_WALL,
  T.DEEP_WATER, T.CLIFF, T.PINE,
]);

export const FISHABLE_WATER = new Set([T.WATER, T.DEEP_WATER, T.BRIDGE]);

// ── Era palettes (sky only — tiles handle ground) ────────
const ERA_SKY = [
  ['#7aa060','#d4e8a0'],  // 0 · 1539  earthy green
  ['#4870a8','#d8c070'],  // 1 · 1660  golden age
  ['#5c7090','#a8b8c0'],  // 2 · 1799  grey-blue
  ['#605040','#c09060'],  // 3 · 1872  smoky amber
  ['#1c2c48','#2c5070'],  // 4 · 1950  night ocean
  ['#70983a','#d8d060'],  // 5 · 1955  sunny prairie
  ['#2848a0','#9838b0'],  // 6 · 1984  synth purple
  ['#3878c0','#78c0e0'],  // 7 · 2020  bright blue
];
const ERA_AMBIENT = [
  'rgba(100,80,20,0.06)',  // 0
  'rgba(180,150,40,0.08)', // 1
  'rgba(50,70,90,0.10)',   // 2
  'rgba(80,50,20,0.13)',   // 3
  'rgba(20,40,80,0.13)',   // 4
  'rgba(130,120,30,0.06)', // 5
  'rgba(50,30,100,0.08)',  // 6
  'rgba(30,70,110,0.06)',  // 7
];

let _eraId = 0;
export function setEra(id) { _eraId = Math.max(0, Math.min(7, id)); }

// ── Sprite sheet image cache ──────────────────────────────
const _imgs = {};
let   _assetsPath = './assets/sprites/';

/**
 * Call once from Game.js before first render.
 * Returns a Promise that resolves when all sheets are loaded.
 */
export function loadSprites(basePath = './assets/sprites/') {
  _assetsPath = basePath;
  const sheets = {
    terrain:          'terrain.png',
    body:             'character-body.png',
    outfit_g:         'outfit-green.png',
    outfit_h:         'outfit-hunk.png',
    outfit_r:         'outfit-red.png',
    hair_m:           'hair-messy.png',
    hair_p:           'hair-princess.png',
    head:             'head.png',
    hair:             'hair.png',
    buildings_castle: 'buildings-castle.png',
    buildings_inside: 'buildings-inside.png',
  };
  const promises = Object.entries(sheets).map(([key, file]) => new Promise((resolve) => {
    if (_imgs[key]) { resolve(); return; }
    const img = new Image();
    img.onload  = () => { _imgs[key] = img; resolve(); };
    img.onerror = () => { console.warn(`Sprite failed: ${file}`); resolve(); };
    img.src = basePath + file;
  }));
  return Promise.all(promises);
}

// ── Building sprite definitions ───────────────────────────
// (sheet, sx, sy, sw, sh) in the source image
const BLDG = {
  //  from buildings-castle.png (544×352)
  church_front:        ['buildings_castle', 112,   0, 208, 224],
  gothic_window:       ['buildings_castle', 192,   0,  96,  96],
  church_door:         ['buildings_castle', 192,  96,  96, 128],
  stone_buttress:      ['buildings_castle', 112,   0,  80, 224],
  arch_right:          ['buildings_castle', 288,   0, 128, 224],
  market_door:         ['buildings_castle', 288,  96,  96, 128],
  //  from buildings-inside.png (320×320)
  hall_wall:           ['buildings_inside',   0,   0, 160,  96],
  hall_column:         ['buildings_inside',  96,   0,  32, 160],
  hall_columns:        ['buildings_inside',  96,  96, 192, 128],
  hall_door:           ['buildings_inside', 224,   0,  96, 160],
};

/** Draw a named building sprite at world-space pixel (wx, wy) scaled to renderW×renderH */
function _bldg(ctx, name, wx, wy, rw, rh, ox, oy) {
  const def = BLDG[name];
  if (!def) return;
  const [sheetKey, sx, sy, sw, sh] = def;
  const sheet = _imgs[sheetKey];
  if (!sheet) return;
  ctx.drawImage(sheet, sx, sy, sw, sh, Math.round(wx - ox), Math.round(wy - oy), rw, rh);
}

/**
 * Draw building overlays for the given era + screen.
 * Call this AFTER drawTiles() and BEFORE entity drawing.
 * Buildings are drawn as large sprites at specific pixel positions,
 * giving churches, market halls, and taverns real appearances.
 */
export function drawBuildings(ctx, eraId, screenRow, screenCol, ox, oy) {
  const key = `${eraId}_${screenRow}_${screenCol}`;
  const T2  = TILE * 2;  // common shorthand

  switch (key) {

    // ── Era 0 · 1539 · Sint-Lambertus Church [1,0] ────────
    case '0_1_0': {
      // Church facade across the top-centre of the screen
      // Stone buttress left, gothic windows centre, arch right
      _bldg(ctx, 'stone_buttress', 1*TILE, 0,       TILE*1.6, TILE*4.5, ox, oy);
      _bldg(ctx, 'gothic_window',  2.6*TILE, TILE*0.5, TILE*2,   TILE*2,   ox, oy);
      _bldg(ctx, 'church_door',    3*TILE,   TILE*2.5, TILE*1.6, TILE*2.5, ox, oy);
      _bldg(ctx, 'arch_right',     4.6*TILE, 0,        TILE*2.6, TILE*4.5, ox, oy);
      break;
    }

    // ── Era 0 · 1539 · Ancient Shrine [0,3] ───────────────
    case '0_0_3': {
      // Ruined stone arches framing the stone circle portal area
      _bldg(ctx, 'stone_buttress', 1*TILE, TILE*0.5, TILE*1.4, TILE*3.5, ox, oy);
      _bldg(ctx, 'stone_buttress', 5.5*TILE, TILE*0.5, TILE*1.4, TILE*3.5, ox, oy);
      break;
    }

    // ── Era 1 · 1660 · Nieuwe Kerk [0,2] ──────────────────
    case '1_0_2': {
      // Protestant church with gothic windows
      _bldg(ctx, 'church_front',  2*TILE, 0, TILE*4.4, TILE*4.8, ox, oy);
      break;
    }

    // ── Era 1 · 1660 · Merchant hall [1,2] ────────────────
    case '1_1_2': {
      // Market hall — classical facade with columns
      _bldg(ctx, 'hall_wall',    3*TILE, TILE*0.5, TILE*3.5, TILE*2,   ox, oy);
      _bldg(ctx, 'hall_columns', 3*TILE, TILE*2.5, TILE*3.5, TILE*2.5, ox, oy);
      _bldg(ctx, 'hall_door',    4.5*TILE, TILE*2,  TILE*2,   TILE*3,   ox, oy);
      break;
    }

    // ── Era 2 · 1799 · Uden Church [2,1] ──────────────────
    case '2_2_1': {
      // Church with crypt entrance visible
      _bldg(ctx, 'church_front', 1.5*TILE, 0, TILE*3.5, TILE*4.5, ox, oy);
      _bldg(ctx, 'church_door',  2.8*TILE, TILE*2.8, TILE*1.5, TILE*2, ox, oy);
      break;
    }

    // ── Era 3 · 1872 · Boekel Church [1,0] ────────────────
    case '3_1_0': {
      _bldg(ctx, 'church_front', 1.5*TILE, 0, TILE*3.5, TILE*4.5, ox, oy);
      break;
    }

    // ── Era 3 · 1872 · Railway Station [0,2] ──────────────
    case '3_0_2': {
      // Station building — classical facade
      _bldg(ctx, 'hall_wall',    2*TILE,   TILE*0.5, TILE*5,   TILE*2,   ox, oy);
      _bldg(ctx, 'hall_columns', 2*TILE,   TILE*2.5, TILE*5,   TILE*2,   ox, oy);
      _bldg(ctx, 'hall_door',    3.8*TILE, TILE*2,   TILE*2.2, TILE*2.5, ox, oy);
      break;
    }

    // ── Era 5 · 1955 · Dutch Catholic Church [1,0] ────────
    case '5_1_0': {
      _bldg(ctx, 'church_front', 1.5*TILE, 0, TILE*3.5, TILE*4.5, ox, oy);
      break;
    }

    // ── Era 5 · 1955 · Dutch Lutheran Church [1,3] ────────
    case '5_1_3': {
      _bldg(ctx, 'church_front', 1.8*TILE, 0, TILE*3, TILE*4, ox, oy);
      break;
    }

    // ── Era 6 · 1984 · Courthouse [2,1] ───────────────────
    case '6_2_1': {
      // Courthouse — imposing classical columns
      _bldg(ctx, 'hall_wall',    2*TILE,   TILE*0.5, TILE*5,   TILE*2,   ox, oy);
      _bldg(ctx, 'hall_columns', 2*TILE,   TILE*2.5, TILE*5,   TILE*2.5, ox, oy);
      _bldg(ctx, 'hall_door',    4*TILE,   TILE*2,   TILE*2.2, TILE*2.5, ox, oy);
      break;
    }

    // ── Era 8 · 2026 Haarlem · Sint-Bavo Grote Kerk [3,3] ─
    case '8_3_3': {
      // The iconic Gothic Sint-Bavo church — full facade
      _bldg(ctx, 'stone_buttress', 0.5*TILE, 0,       TILE*1.8, TILE*5,   ox, oy);
      _bldg(ctx, 'church_front',   2.3*TILE, 0,       TILE*5,   TILE*5,   ox, oy);
      _bldg(ctx, 'arch_right',     7.3*TILE, 0,       TILE*3,   TILE*5,   ox, oy);
      // Large ornate church doors at entrance
      _bldg(ctx, 'church_door',    4*TILE,   TILE*2.5, TILE*2,   TILE*2.5, ox, oy);
      break;
    }

    // ── Era 8 · 2026 Haarlem · Grote Markt [3,2] ──────────
    case '8_3_2': {
      // Stadhuis (town hall) — classical
      _bldg(ctx, 'hall_wall',    0.2*TILE, TILE*0.3, TILE*4,   TILE*2,   ox, oy);
      _bldg(ctx, 'hall_columns', 0.2*TILE, TILE*2.3, TILE*4,   TILE*2.5, ox, oy);
      _bldg(ctx, 'hall_door',    1.5*TILE, TILE*2,   TILE*1.8, TILE*2.5, ox, oy);
      // Vleeshal (meat hall) east side — market arch
      _bldg(ctx, 'arch_right',   10*TILE,  0,        TILE*3,   TILE*4.5, ox, oy);
      _bldg(ctx, 'market_door',  10.8*TILE, TILE*2.5, TILE*1.8, TILE*2,  ox, oy);
      break;
    }

    // ── Era 8 · 2026 Haarlem · Tierney's pub area [3,2] ───
    // (Same screen as Grote Markt above — already covered)

    default:
      break;
  }
}

// ── LPC terrain tile source map (32×32 tiles in terrain.png) ──
// sx, sy = source pixel in terrain.png
const TS = 32;  // source tile size
const TILE_SRC = {
  [T.GRASS]:      [32,  320],   // Grass center
  [T.WALL]:       [416, 96],    // Rock_Gray (solid wall)
  [T.WATER]:      [128, 544],   // Water
  [T.TREE]:       [32,  320],   // will be drawn on top of grass
  [T.ROCK]:       [416, 96],    // Rock_Gray
  [T.COBBLE]:     [800, 320],   // Gravel_1
  [T.WHEAT]:      [416, 320],   // Soil (wheat drawn procedurally on top)
  [T.FLOWER]:     [32,  320],   // Grass base (flowers drawn on top)
  [T.CORN]:       [416, 320],   // Soil base
  [T.ROAD]:       [128, 96],    // Dirt_Brown
  [T.PLANK]:      [128, 96],    // Dirt_Brown (plank ships)
  [T.STEEL]:      [416, 96],    // Rock_Gray (steel floor)
  [T.BRIDGE]:     [128, 96],    // Dirt_Brown
  // HOUSE_WALL and HOUSE_ROOF are drawn procedurally — no LPC terrain mapping
  [T.DOOR]:       [128, 96],    // Dirt_Brown
  [T.PORTAL]:     [128, 544],   // Water (portal glows over it)
  [T.DEEP_WATER]: [224, 544],   // Water_Deep
  [T.CLIFF]:      [416, 96],    // Rock_Gray
  [T.PINE]:       [32,  320],   // Grass base
  [T.BRICK]:      [416, 96],    // Rock_Gray (brick)
  [T.DIRT]:       [128, 96],    // Dirt_Brown
  [T.CROP_READY]: [416, 320],   // Soil
  [T.CROP_SPENT]: [416, 320],   // Soil (duller, tinted)
  [T.SAND]:       [512, 320],   // Sand
  [T.CIRCUIT]:    [224, 544],   // Deep water (dark circuit floor)
};

// Variant tiles: alternate positions for variety (same tile, different fill patch)
const TILE_VARIANTS = {
  [T.GRASS]:  [[32,320],[128,320],[224,320]],  // Grass, Grass_Light, Grass_Dark
  [T.COBBLE]: [[800,320],[32,96],[416,96]],    // Gravel, Dirt_Tan, Rock
  [T.DIRT]:   [[128,96],[32,96],[896,96]],     // Dirt_Brown, Dirt_Tan, Mud
};

// ── Sky ───────────────────────────────────────────────────
export function drawSky(ctx, w, h, frame, tod = 0.5) {
  const [top, bot] = ERA_SKY[_eraId];
  const g = ctx.createLinearGradient(0, 0, 0, h * 0.65);
  g.addColorStop(0, top);
  g.addColorStop(0.45, _lerpHex(top, bot, 0.55));
  g.addColorStop(1, bot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Sun glow
  const sx = w * 0.65, sy = h * 0.15;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, w * 0.25);
  sg.addColorStop(0, 'rgba(255,240,160,0.4)');
  sg.addColorStop(1, 'rgba(255,240,160,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, w, h * 0.45);

  // Horizon haze
  const hg = ctx.createLinearGradient(0, h*0.45, 0, h*0.65);
  hg.addColorStop(0, 'rgba(255,255,220,0)');
  hg.addColorStop(1, 'rgba(255,255,220,0.12)');
  ctx.fillStyle = hg; ctx.fillRect(0, h*0.45, w, h*0.2);

  // Clouds (deterministic per era)
  const r = _rng(17 + _eraId * 5);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  for (let i = 0; i < 4; i++) {
    const cx = r() * w, cy = r() * h * 0.3 + h * 0.05;
    const cw = r() * 90 + 50, ch = r() * 14 + 8;
    ctx.beginPath(); ctx.ellipse(cx, cy, cw, ch, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + cw*0.25, cy - ch*0.4, cw*0.55, ch*0.75, 0, 0, Math.PI*2); ctx.fill();
  }

  // Stars at night
  if (tod > 0.72) {
    const alpha = Math.min((tod - 0.72) / 0.28, 1) * 0.9;
    const sr = _rng(42);
    for (let i = 0; i < 70; i++) {
      const nx = sr()*w, ny = sr()*h*0.5, nr = sr()*1.2+0.4;
      ctx.fillStyle = `rgba(255,255,255,${alpha * (0.5 + sr()*0.5)})`;
      ctx.beginPath(); ctx.arc(nx, ny, nr, 0, Math.PI*2); ctx.fill();
    }
  }
}

// ── Tile drawing ──────────────────────────────────────────
export function drawTiles(ctx, map, rows, cols, ox, oy, w, h) {
  const startC = Math.max(0, Math.floor(ox / TILE));
  const startR = Math.max(0, Math.floor(oy / TILE));
  const endC   = Math.min(cols-1, Math.ceil((ox+w) / TILE));
  const endR   = Math.min(rows-1, Math.ceil((oy+h) / TILE));
  const now    = performance.now();

  for (let r = startR; r <= endR; r++) {
    for (let c = startC; c <= endC; c++) {
      const tile = map[r]?.[c] ?? T.GRASS;
      const px   = Math.round(c * TILE - ox);
      const py   = Math.round(r * TILE - oy);
      _drawTile(ctx, tile, px, py, r, c, now);
    }
  }

  // Pass 2: draw solid-tile edge shadows for visual clarity
  // A thin dark shadow on the south/east face of solid tiles makes
  // walls and obstacles read clearly against the ground.
  for (let r = startR; r <= endR; r++) {
    for (let c = startC; c <= endC; c++) {
      const tile = map[r]?.[c] ?? T.GRASS;
      const px = Math.round(c * TILE - ox);
      const py = Math.round(r * TILE - oy);

      if (SOLID_TYPES.has(tile)) {
        // Bottom shadow (cast onto tile below)
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(px, py + TILE - 4, TILE, 4);
        // Right shadow
        ctx.fillStyle = 'rgba(0,0,0,0.20)';
        ctx.fillRect(px + TILE - 3, py, 3, TILE);
        // Top highlight (makes obstacle feel 3D)
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(px, py, TILE, 2);
      } else if (tile === T.ROAD || tile === T.COBBLE) {
        // Subtle edge line to separate road from surrounding terrain
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      }
    }
  }

  // Era ambient tint
  ctx.fillStyle = ERA_AMBIENT[_eraId];
  ctx.fillRect(0, 0, w, h);
}

function _drawTile(ctx, tile, px, py, r, c, now) {
  const terrain = _imgs.terrain;
  const seed    = r * 97 + c * 31 + _eraId * 7;
  const tr      = _rng(seed);

  // ── HOUSE_WALL and HOUSE_ROOF drawn procedurally (no LPC terrain mapping) ──
  if (tile === T.HOUSE_WALL) {
    _drawHouseWall(ctx, px, py, _eraId, seed);
    return;
  }
  if (tile === T.HOUSE_ROOF) {
    _drawHouseRoof(ctx, px, py, _eraId, seed);
    return;
  }

  if (terrain) {
    // Pick source coords — use variants for natural variety
    let [sx, sy] = TILE_SRC[tile] ?? [32, 320];
    const variants = TILE_VARIANTS[tile];
    if (variants) {
      [sx, sy] = variants[Math.floor(tr() * variants.length)];
    }
    // Draw the LPC 32×32 tile scaled to TILE×TILE
    ctx.drawImage(terrain, sx, sy, TS, TS, px, py, TILE, TILE);
  } else {
    // Fallback solid colour while images load
    ctx.fillStyle = _FALLBACK[tile] ?? '#5a8a3a';
    ctx.fillRect(px, py, TILE, TILE);
  }

  // ── Overlays for tiles that need additional decoration ──
  switch (tile) {
    case T.TREE:   _drawTree(ctx, px, py, tr, now); break;
    case T.PINE:   _drawPine(ctx, px, py); break;
    case T.WHEAT:  _drawWheat(ctx, px, py, tr, now); break;
    case T.FLOWER: _drawFlowers(ctx, px, py, tr); break;
    case T.CORN:   _drawCorn(ctx, px, py, tr, now); break;
    case T.PORTAL: _drawPortal(ctx, px, py, now); break;
    // HOUSE_WALL and HOUSE_ROOF are handled before this switch in _drawTile
    case T.CROP_READY: _drawCropReady(ctx, px, py, now); break;
    case T.WATER:  _drawWaterShimmer(ctx, px, py, seed, now); break;
    case T.DEEP_WATER: _drawWaterShimmer(ctx, px, py, seed, now, true); break;
    case T.BRIDGE: _drawBridgePlanks(ctx, px, py); break;
    case T.WALL:   _drawWallTop(ctx, px, py); break;
    case T.DOOR:   _drawDoor(ctx, px, py); break;
  }
}

// ── Tile overlay helpers ──────────────────────────────────

function _drawTree(ctx, px, py, tr, now) {
  const s = TILE;
  // Shadow
  ctx.fillStyle = 'rgba(0,30,0,0.28)';
  ctx.beginPath(); ctx.ellipse(px+s*.5, py+s*.9, s*.38, s*.12, 0, 0, Math.PI*2); ctx.fill();
  // Trunk
  ctx.fillStyle = '#5a3a10';
  ctx.fillRect(px+s*.42, py+s*.58, s*.16, s*.42);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(px+s*.44, py+s*.60, 2, s*.36);
  // Canopy layers
  [[.50,.40,'#1e5010'],[.38,.32,'#2a6018'],[.30,.22,'#388020'],[.22,.12,'#48a028']].forEach(([r2,y2,col])=>{
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(px+s*.5, py+s*y2, s*r2, 0, Math.PI*2); ctx.fill();
  });
  // Highlight specks
  ctx.fillStyle = 'rgba(120,255,60,0.18)';
  for (let i=0;i<4;i++) ctx.fillRect(px+s*(0.35+tr()*0.3), py+s*(0.06+tr()*0.1), 2, 2);
}

function _drawPine(ctx, px, py) {
  const s = TILE;
  ctx.fillStyle = 'rgba(0,30,0,0.22)';
  ctx.beginPath(); ctx.ellipse(px+s*.5, py+s*.9, s*.28, s*.09, 0, 0, Math.PI*2); ctx.fill();
  [[.82,.28,'#1a4010'],[.55,.36,'#244e18'],[.28,.42,'#2e6020']].forEach(([ty,tw,tc])=>{
    ctx.fillStyle=tc; ctx.beginPath();
    ctx.moveTo(px+s*.5, py+s*(ty-tw*.7));
    ctx.lineTo(px+s*(.5-tw), py+s*ty);
    ctx.lineTo(px+s*(.5+tw), py+s*ty);
    ctx.fill();
  });
}

function _drawWheat(ctx, px, py, tr, now) {
  const s = TILE;
  for (let i = 0; i < 5; i++) {
    const bx = px + (i/5)*s + tr()*(s/5*.5);
    const sway = Math.sin(now/1200 + i) * 2;
    ctx.fillStyle = '#c89830'; ctx.fillRect(bx+sway, py+s*.35, 3, s*.6);
    ctx.fillStyle = '#e8b840'; ctx.fillRect(bx+sway-1, py+s*.08, 5, s*.3);
    ctx.fillStyle = '#c08020';
    for (let j=0;j<3;j++) ctx.fillRect(bx+sway, py+s*(.10+j*.09), 3, 3);
  }
}

function _drawFlowers(ctx, px, py, tr) {
  const s = TILE;
  const cols = ['#ff6090','#ffcc40','#8080ff','#ff9040','#ff4060'];
  const count = 2 + Math.floor(tr()*3);
  for (let i=0;i<count;i++) {
    const fx=px+(0.1+tr()*0.8)*s, fy=py+(0.2+tr()*0.45)*s;
    const fc=cols[Math.floor(tr()*cols.length)];
    ctx.fillStyle=fc;
    for (let p=0;p<5;p++) {
      const a=(p/5)*Math.PI*2;
      ctx.beginPath(); ctx.arc(fx+Math.cos(a)*4, fy+Math.sin(a)*4, 3, 0, Math.PI*2); ctx.fill();
    }
    ctx.fillStyle='#ffff80'; ctx.beginPath(); ctx.arc(fx,fy,2.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#3a7020'; ctx.fillRect(fx-1, fy+3, 2, s*.28);
  }
}

function _drawCorn(ctx, px, py, tr, now) {
  const s = TILE;
  for (let i=0;i<3;i++) {
    const cx=px+(i/3)*s+s*.08;
    const sw=Math.sin(now/1500+i)*1.5;
    ctx.fillStyle='#4a9020'; ctx.fillRect(cx+sw, py+s*.05, 4, s*.88);
    ctx.fillStyle='#60b030';
    ctx.beginPath(); ctx.moveTo(cx+sw+2, py+s*.35); ctx.lineTo(cx+sw+s*.18, py+s*.25); ctx.lineTo(cx+sw+2, py+s*.55); ctx.fill();
    ctx.fillStyle='#e8c040'; ctx.fillRect(cx+sw-1, py+s*.3, 6, s*.22);
  }
}

function _drawPortal(ctx, px, py, now) {
  const s=TILE, phase=(now/800)%(Math.PI*2);
  const g=ctx.createRadialGradient(px+s/2,py+s/2,0,px+s/2,py+s/2,s*.5);
  g.addColorStop(0,`rgba(160,60,255,${.35+Math.sin(phase)*.1})`);
  g.addColorStop(.6,'rgba(100,20,200,0.2)'); g.addColorStop(1,'rgba(80,0,160,0)');
  ctx.fillStyle=g; ctx.fillRect(px,py,s,s);
  for (let i=0;i<3;i++) {
    const r=s*(.22+i*.1+Math.sin(phase+i*1.1)*.04);
    ctx.strokeStyle=`rgba(180,80,255,${.5+Math.sin(phase+i*.9)*.25})`;
    ctx.lineWidth=2.5-i*.5; ctx.beginPath(); ctx.arc(px+s/2,py+s/2,r,0,Math.PI*2); ctx.stroke();
  }
  ctx.fillStyle='rgba(220,160,255,0.8)';
  for (let i=0;i<6;i++) {
    const a=phase+i*Math.PI/3, pr=s*.3;
    ctx.beginPath(); ctx.arc(px+s/2+Math.cos(a)*pr, py+s/2+Math.sin(a)*pr, 2, 0, Math.PI*2); ctx.fill();
  }
}

function _drawHouseWall(ctx, px, py, eraId, seed) {
  const s = TILE;
  const wallColors = ['#d4b880','#c8a870','#c0a068','#b89860','#d0c0a0','#c8b888','#d0c8b0','#c8c0b0','#c8b080'];
  const brickEras  = new Set([1, 3, 8]);
  const wallColor  = wallColors[Math.min(eraId, wallColors.length-1)];

  ctx.fillStyle = wallColor;
  ctx.fillRect(px, py, s, s);

  // Brick courses for brick eras
  if (brickEras.has(eraId)) {
    for (let row = 0; row < 4; row++) {
      const ry = py + Math.round(row * s / 4);
      const offset = (row % 2) * Math.round(s * 0.25);
      ctx.fillStyle = 'rgba(0,0,0,0.10)';
      ctx.fillRect(px, ry, s, 1); // mortar line
      for (let bx = -s*0.25; bx < s; bx += s * 0.5) {
        ctx.fillRect(px + Math.round(bx + offset), ry, 1, Math.round(s / 4));
      }
    }
  } else {
    // Plaster/wattle — subtle horizontal lines
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for (let i = 1; i < 4; i++) ctx.fillRect(px, py + Math.round(i * s / 4), s, 1);
  }

  // Window on some tiles
  if ((seed * 7919) % 3 === 0) {
    const wx = px + Math.round(s * 0.22);
    const wy = py + Math.round(s * 0.18);
    const ww = Math.round(s * 0.56);
    const wh = Math.round(s * 0.36);
    ctx.fillStyle = eraId <= 2 ? 'rgba(255,220,140,0.55)' : 'rgba(180,220,255,0.50)';
    ctx.fillRect(wx, wy, ww, wh);
    ctx.strokeStyle = 'rgba(60,40,15,0.7)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(wx, wy, ww, wh);
    ctx.beginPath(); ctx.moveTo(wx + ww/2, wy); ctx.lineTo(wx + ww/2, wy + wh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx, wy + wh/2); ctx.lineTo(wx + ww, wy + wh/2); ctx.stroke();
  }

  // Shading
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.fillRect(px + s - 3, py, 3, s); // right shadow
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(px, py, s, 2); // top highlight
}

function _drawHouseRoof(ctx, px, py, eraId, seed) {
  const s = TILE;
  const roofStyles = [
    { color:'#786050', style:'thatch' },
    { color:'#903030', style:'tile'   },
    { color:'#7a3028', style:'tile'   },
    { color:'#703020', style:'tile'   },
    { color:'#605040', style:'plank'  },
    { color:'#506040', style:'shingle'},
    { color:'#405040', style:'flat'   },
    { color:'#404858', style:'flat'   },
    { color:'#903030', style:'tile'   },
  ];
  const rs = roofStyles[Math.min(eraId, roofStyles.length-1)];

  ctx.fillStyle = rs.color;
  ctx.fillRect(px, py, s, s);

  if (rs.style === 'tile') {
    for (let i = 0; i < 5; i++) {
      const ry2 = py + Math.round(i * s / 5);
      const rh2 = Math.round(s / 5);
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.12)';
      ctx.fillRect(px, ry2, s, rh2);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(px, ry2 + rh2 - 2, s, 2);
    }
  } else if (rs.style === 'thatch') {
    ctx.fillStyle = '#8a7048';
    for (let i = 0; i < 6; i++) ctx.fillRect(px, py + Math.round(i * s / 6), s, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i < 8; i++) ctx.fillRect(px + Math.round(i * s / 8), py, 1, s);
  } else if (rs.style === 'shingle') {
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    for (let row = 0; row < 4; row++) {
      const ry2 = py + row * Math.round(s / 4);
      const off = (row % 2) * Math.round(s / 4);
      for (let col = -1; col < 5; col++) {
        ctx.fillRect(px + col * Math.round(s / 4) + off, ry2, Math.round(s / 4) - 1, Math.round(s / 4));
      }
    }
  } else { // flat / plank
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let i = 1; i < 5; i++) ctx.fillRect(px, py + Math.round(i * s / 5), s, 1);
  }

  ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(px, py, s, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';       ctx.fillRect(px, py + s - 4, s, 4);
}

function _drawRoof(ctx, px, py) {
  const s=TILE;
  // Dark tile rows over the terrain tile
  ctx.fillStyle='rgba(100,20,10,0.55)'; ctx.fillRect(px,py,s,s);
  for (let i=0;i<5;i++) {
    ctx.fillStyle=i%2?'rgba(180,60,40,0.6)':'rgba(120,30,20,0.5)';
    ctx.fillRect(px, py+i*(s/5), s, s/5-1);
    ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(px, py+i*(s/5)+s/5-2, s, 2);
    ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.fillRect(px, py+i*(s/5), s, 1);
  }
}

function _drawCropReady(ctx, px, py, now) {
  const s=TILE, phase=(now/800)%(Math.PI*2);
  ctx.fillStyle=`rgba(100,255,60,${.25+Math.sin(phase)*.12})`;
  ctx.beginPath(); ctx.arc(px+s*.5, py+s*.42, s*.3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#80e840'; ctx.beginPath(); ctx.arc(px+s*.5, py+s*.42, s*.16, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle=`rgba(200,255,100,${.7+Math.sin(phase*2)*.3})`;
  [[-10,-8],[8,-10],[10,6],[-8,8]].forEach(([dx,dy])=>{
    ctx.beginPath(); ctx.arc(px+s*.5+dx, py+s*.42+dy, 2, 0, Math.PI*2); ctx.fill();
  });
}

function _drawWaterShimmer(ctx, px, py, seed, now, deep=false) {
  const s=TILE, phase=(now/1800+seed*.1)%1;
  ctx.fillStyle=deep?'rgba(10,20,60,0.35)':'rgba(80,160,220,0.22)';
  for (let i=0;i<3;i++) {
    const wy=py+((phase+i*.33)%1)*s;
    ctx.fillRect(px+s*.1, wy, s*.55, 2.5);
  }
  ctx.fillStyle='rgba(200,240,255,0.12)';
  ctx.beginPath(); ctx.ellipse(px+s*.33, py+s*.28, s*.2, s*.06, 0.2, 0, Math.PI*2); ctx.fill();
}

function _drawBridgePlanks(ctx, px, py) {
  const s=TILE;
  for (let i=0;i<4;i++) {
    ctx.fillStyle=i%2?'rgba(160,120,50,0.4)':'rgba(100,70,20,0.35)';
    ctx.fillRect(px, py+i*(s/4), s, s/4-1);
    ctx.fillStyle='rgba(0,0,0,0.1)'; ctx.fillRect(px, py+i*(s/4)+s/4-2, s, 2);
  }
}

function _drawWallTop(ctx, px, py) {
  const s=TILE;
  ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(px, py+s-5, s, 5);
  ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(px+2, py+2, s-4, 3);
}

function _drawDoor(ctx, px, py) {
  const s=TILE;
  ctx.fillStyle='rgba(90,40,8,0.65)'; ctx.fillRect(px+s*.12, py, s*.76, s);
  ctx.fillStyle='rgba(60,30,5,0.5)';
  ctx.fillRect(px+s*.18, py+s*.08, s*.28, s*.38); ctx.fillRect(px+s*.54, py+s*.08, s*.28, s*.38);
  ctx.fillRect(px+s*.18, py+s*.52, s*.28, s*.38); ctx.fillRect(px+s*.54, py+s*.52, s*.28, s*.38);
  ctx.fillStyle='rgba(220,180,30,0.9)';
  ctx.beginPath(); ctx.arc(px+s*.62, py+s*.5, 3, 0, Math.PI*2); ctx.fill();
}

// ── Player / character sprite ─────────────────────────────
// LPC sheet layout:
//   body/outfit: 64×64 per frame, 14 cols × 12 rows
//     Rows 0=walk-up, 1=walk-left, 2=walk-down, 3=walk-right
//   head: 32×32 per frame, 3 cols × 4 rows
//     Rows: 0=back, 1=left, 2=front, 3=right  Cols: 0=idle,1=walk1,2=walk2
//   hair: 48×48 per frame, 1 col × 6 rows
//     Rows: 0=back, 1=left-walk, 2=front, 3=right-walk, 4=walk-anim1, 5=walk-anim2

const CHAR_FRAME_W = 64, CHAR_FRAME_H = 64;
const HEAD_FRAME   = 32;  // head sprite is 32×32 per frame
const HAIR_FRAME   = 48;  // hair sprite is 48×48 per frame

// Body/outfit row per facing direction
const WALK_ROW = { up:0, left:1, down:2, right:3 };
// Head sheet row per facing direction (3 cols × 4 rows)
const HEAD_DIR_ROW = { up:0, left:1, down:2, right:3 };
// Hair sheet row per facing direction (1 col × 6 rows)
const HAIR_DIR_ROW = { up:0, left:1, down:2, right:3 };

export function drawPlayer(ctx, x, y, opts = {}) {
  const {
    facing    = 'down',
    walkCycle = 0,
    hurt      = false,
    hairColor = '#c07830',
    bodyColor = '#3060a0',
    skinColor = '#f0c080',
    pose      = 'idle',
  } = opts;

  if (hurt && (Math.floor(Date.now() / 80) % 2 === 0)) return;

  const body   = _imgs.body;
  const head   = _imgs.head;
  const hair   = _imgs.hair;
  const outfit = bodyColor.includes('green') || bodyColor.includes('#306') ? _imgs.outfit_g
               : bodyColor.includes('red')   || bodyColor.includes('#a03') ? _imgs.outfit_r
               : _imgs.outfit_h;

  if (!body) {
    _drawPlayerFallback(ctx, x, y, opts);
    return;
  }

  // Walk frame: cycle through frames 1-4 in each body row
  const row = WALK_ROW[facing] ?? WALK_ROW.down;
  let frameIdx = 0;
  if (pose !== 'sleeping' && pose !== 'reading') {
    const cycle = Math.abs(Math.sin(walkCycle));
    frameIdx = Math.floor(cycle * 4) % 4 + 1;
  }

  // Render dimensions — scale 64px frame up to TILE size
  const renderW = TILE * 0.95;
  const renderH = TILE * 1.1;
  const rx = x + (TILE - renderW) / 2;
  const ry = y + TILE - renderH;

  ctx.globalAlpha = hurt ? 0.55 : 1.0;

  // ── Layer 1: Ground shadow ────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(x + TILE/2, y + TILE*0.96, TILE*0.32, TILE*0.07, 0, 0, Math.PI*2);
  ctx.fill();

  // ── Layer 2: Body (legs, arms, torso base) ────────────
  const bsx = frameIdx * CHAR_FRAME_W;
  const bsy = row * CHAR_FRAME_H;
  ctx.drawImage(body, bsx, bsy, CHAR_FRAME_W, CHAR_FRAME_H, rx, ry, renderW, renderH);

  // ── Layer 3: Outfit overlay ───────────────────────────
  if (outfit) {
    ctx.drawImage(outfit, bsx, bsy, CHAR_FRAME_W, CHAR_FRAME_H, rx, ry, renderW, renderH);
  }

  // ── Layer 4: Head ─────────────────────────────────────
  // Head sprite: 32×32 per cell, 3 cols × 4 rows
  // Push head down so it sits ON the body shoulders, not floating above.
  // The LPC body's shoulder/collar area is at ~40% down the rendered height.
  if (head) {
    const headRow = HEAD_DIR_ROW[facing] ?? 2;
    const headCol = frameIdx > 0 ? (frameIdx % 2) : 1;
    const hsx = headCol * HEAD_FRAME;
    const hsy = headRow * HEAD_FRAME;
    const headRenderW = renderW * 0.62;
    const headRenderH = renderH * 0.54;            // tall enough to overlap shoulders
    const headRx = rx + (renderW - headRenderW) / 2;
    const headRy = ry + renderH * 0.12;            // 12% down — neck sits on collar
    ctx.drawImage(head, hsx, hsy, HEAD_FRAME, HEAD_FRAME, headRx, headRy, headRenderW, headRenderH);
  }

  // ── Layer 5: Hair ─────────────────────────────────────
  // Hair sprite: 48×48 per cell, 1 col × 6 rows
  // Hair anchors to same position as head, slightly wider for crown overhang.
  if (hair) {
    const hairRow = HAIR_DIR_ROW[facing] ?? 2;
    const hrsy = hairRow * HAIR_FRAME;
    const hairRenderW = renderW * 0.74;
    const hairRenderH = renderH * 0.58;
    const hairRx = rx + (renderW - hairRenderW) / 2;
    const hairRy = ry + renderH * 0.10;            // slightly above head anchor for crown
    ctx.drawImage(hair, 0, hrsy, HAIR_FRAME, HAIR_FRAME, hairRx, hairRy, hairRenderW, hairRenderH);
  }

  // ── Hurt tint ─────────────────────────────────────────
  if (hurt) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(255,60,60,0.4)';
    ctx.fillRect(rx, ry, renderW, renderH);
    ctx.globalCompositeOperation = 'source-over';
  }

  ctx.globalAlpha = 1.0;
}

// Fallback procedural character (shown while sprites load)
function _drawPlayerFallback(ctx, x, y, opts) {
  const { hairColor='#c07830', bodyColor='#3060a0', skinColor='#f0c080' } = opts;
  const H=TILE*.9, W=TILE*.65, hx=x+W/2;
  ctx.fillStyle='rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(hx, y+H*.96, W*.4, H*.05, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle=bodyColor; ctx.fillRect(hx-W*.36, y+H*.3, W*.72, H*.4);
  ctx.fillStyle=skinColor; ctx.beginPath(); ctx.arc(hx, y+H*.15, W*.28, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle=hairColor; ctx.beginPath(); ctx.arc(hx, y+H*.07, W*.28, Math.PI*1.1, Math.PI*1.9); ctx.fill();
}

// ── NPC portrait ──────────────────────────────────────────
export function drawNPCPortrait(ctx, opts = {}) {
  const { skinColor='#f0c080', hairColor='#804020', bodyColor='#806040', era=0, w=64, h=64 } = opts;
  ctx.clearRect(0, 0, w, h);

  const [t, b] = ERA_SKY[era] || ERA_SKY[0];
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, b); g.addColorStop(1, t);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  // Check if body sprite is loaded — use it for portrait
  const body = _imgs.body;
  if (body) {
    // Draw idle front-facing frame (row 2, frame 0) scaled
    ctx.drawImage(body, 0, 2*CHAR_FRAME_H, CHAR_FRAME_W, CHAR_FRAME_H, 2, 4, w-4, h-4);

    // Determine outfit by era
    const outfit = era <= 2 ? _imgs.outfit_g : era <= 5 ? _imgs.outfit_h : _imgs.outfit_r;
    if (outfit) {
      ctx.drawImage(outfit, 0, 2*CHAR_FRAME_H, CHAR_FRAME_W, CHAR_FRAME_H, 2, 4, w-4, h-4);
    }
    return;
  }

  // Fallback
  ctx.fillStyle=bodyColor; ctx.beginPath(); ctx.ellipse(w/2, h*.9, w*.46, h*.28, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle=skinColor; ctx.beginPath(); ctx.arc(w/2, h*.38, w*.28, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle=hairColor; ctx.beginPath(); ctx.arc(w/2, h*.26, w*.29, Math.PI*1.08, Math.PI*1.92); ctx.fill();
  ctx.beginPath(); ctx.arc(w/2, h*.26, w*.29, Math.PI*1.08, Math.PI*1.92); ctx.fill();
  ctx.fillStyle='#202020';
  ctx.beginPath(); ctx.arc(w*.38, h*.38, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(w*.62, h*.38, 2.5, 0, Math.PI*2); ctx.fill();
}

// ── Enemy sprite ──────────────────────────────────────────
export function drawEnemy(ctx, x, y, opts = {}) {
  const { color='#a03020', accent='#c05040', emoji='👹', size=TILE*.65 } = opts;
  const cx2=x+size/2, cy2=y+size*.5;
  ctx.fillStyle='rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(cx2, y+size*.92, size*.36, size*.09, 0, 0, Math.PI*2); ctx.fill();
  const bg=ctx.createRadialGradient(cx2-size*.12,cy2-size*.12,0,cx2,cy2,size*.5);
  bg.addColorStop(0,accent); bg.addColorStop(1,color);
  ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(cx2,cy2,size*.42,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=_darken(color,.4); ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(cx2,cy2,size*.42,0,Math.PI*2); ctx.stroke();
  ctx.font=`${Math.floor(size*.38)}px serif`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(emoji, cx2, cy2-size*.02);
  ctx.textBaseline='alphabetic';
}

// ── Dropped item ──────────────────────────────────────────
export function drawDroppedItem(ctx, x, y, emoji, frame) {
  const s=TILE*.5, bob=Math.sin(frame/28)*3, glow=.32+Math.sin(frame/18)*.15;
  const gg=ctx.createRadialGradient(x+s/2,y+s/2+bob,0,x+s/2,y+s/2+bob,s*.5);
  gg.addColorStop(0,`rgba(255,220,80,${glow})`); gg.addColorStop(1,'rgba(255,220,80,0)');
  ctx.fillStyle=gg; ctx.fillRect(x,y-4,s,s+8);
  ctx.font=`${Math.floor(s*.62)}px serif`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(emoji, x+s/2, y+s/2+bob);
  ctx.textBaseline='alphabetic';
}

// ── Fishing bobber ────────────────────────────────────────
export function drawBobber(ctx, x, y, dipped, frame) {
  const bob=dipped?5:Math.sin(frame/22)*2.5;
  ctx.strokeStyle='rgba(180,160,100,0.5)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(x-30,y-30); ctx.lineTo(x,y+bob); ctx.stroke();
  ctx.fillStyle=dipped?'#cc2020':'#e8e8e8';
  ctx.beginPath(); ctx.ellipse(x,y+bob,5,7,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#ff4040';
  ctx.beginPath(); ctx.ellipse(x,y+bob-2,5,4,0,0,Math.PI); ctx.fill();
  ctx.fillStyle='#404040'; ctx.beginPath(); ctx.arc(x,y+bob+6,1.5,0,Math.PI*2); ctx.fill();
}

// ── Minimap ───────────────────────────────────────────────
export function drawMinimap(ctx, worldCols, worldRows, visitedSet, currentR, currentC, x, y, cellSize=8) {
  const W2=worldCols*cellSize+6, H2=worldRows*cellSize+6;
  ctx.fillStyle='rgba(0,0,0,0.7)';
  ctx.beginPath(); ctx.roundRect(x-3,y-3,W2,H2,4); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.roundRect(x-3,y-3,W2,H2,4); ctx.stroke();
  for (let r=0;r<worldRows;r++) for (let c=0;c<worldCols;c++) {
    const key=`${r},${c}`, cur=r===currentR&&c===currentC;
    ctx.fillStyle=cur?'#f0c040':visitedSet.has(key)?'#6a9050':'#252525';
    ctx.beginPath(); ctx.roundRect(x+c*cellSize,y+r*cellSize,cellSize-1,cellSize-1,1); ctx.fill();
    if (cur) { ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(x+c*cellSize,y+r*cellSize,cellSize-1,cellSize-1,1); ctx.stroke(); }
  }
}

// ── Helpers ───────────────────────────────────────────────
function _lerpHex(a, b, t) {
  const ah=parseInt(a.slice(1),16), bh=parseInt(b.slice(1),16);
  const r=Math.round(((ah>>16)&0xff)+(((bh>>16)&0xff)-((ah>>16)&0xff))*t);
  const g=Math.round(((ah>>8)&0xff)+(((bh>>8)&0xff)-((ah>>8)&0xff))*t);
  const bl=Math.round((ah&0xff)+((bh&0xff)-(ah&0xff))*t);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bl.toString(16).padStart(2,'0')}`;
}

function _darken(hex, f) {
  const h=parseInt(hex.replace('#',''),16);
  const r=Math.round(((h>>16)&0xff)*(1-f)), g=Math.round(((h>>8)&0xff)*(1-f)), b=Math.round((h&0xff)*(1-f));
  return `rgb(${r},${g},${b})`;
}

function _rng(seed) {
  let s=seed;
  return ()=>{ s=s*1664525+1013904223&0xffffffff; return(s>>>0)/0xffffffff; };
}

const _FALLBACK = {
  [T.GRASS]:'#5a9a3a',[T.WALL]:'#606058',[T.WATER]:'#2060a0',
  [T.TREE]:'#2a5a1a',[T.ROCK]:'#606058',[T.COBBLE]:'#7a7060',
  [T.WHEAT]:'#a88020',[T.FLOWER]:'#5a9a3a',[T.CORN]:'#5a8028',
  [T.ROAD]:'#a09070',[T.PLANK]:'#907040',[T.STEEL]:'#505868',
  [T.BRIDGE]:'#806030',[T.HOUSE_WALL]:'#d4b880',[T.HOUSE_ROOF]:'#8c3020',
  [T.DOOR]:'#5a2808',[T.PORTAL]:'#2060a0',[T.DEEP_WATER]:'#14305a',
  [T.CLIFF]:'#504030',[T.PINE]:'#1a4a1a',[T.BRICK]:'#a85a38',
  [T.DIRT]:'#907060',[T.CROP_READY]:'#5a9a3a',[T.CROP_SPENT]:'#7a6040',
  [T.SAND]:'#d4b870',[T.CIRCUIT]:'#0a1e10',
};
