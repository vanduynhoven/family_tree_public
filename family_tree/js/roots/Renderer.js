// ═══════════════════════════════════════════════════════════
//  Renderer — Stardew Valley-quality canvas 2D drawing
//  Layered tiles, shaded sprites, character with walk cycle
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

/** Tiles that block movement. Import everywhere — do NOT duplicate. */
export const SOLID_TYPES = new Set([
  T.WALL, T.WATER, T.TREE, T.ROCK, T.BRICK, T.HOUSE_WALL,
  T.DEEP_WATER, T.CLIFF, T.PINE,
]);

/** Tiles adjacent to which fishing is allowed */
export const FISHABLE_WATER = new Set([T.WATER, T.DEEP_WATER, T.BRIDGE]);

// ── Era palettes ─────────────────────────────────────────
const ERA_PALETTES = [
  { skyTop:'#7aa060', skyBot:'#d4e8a0', ambient:'rgba(100,80,20,0.07)',  sunAngle:0.6  }, // 0 · 1539
  { skyTop:'#4870a8', skyBot:'#d8c070', ambient:'rgba(180,150,40,0.09)', sunAngle:0.7  }, // 1 · 1660
  { skyTop:'#5c7090', skyBot:'#a8b8c0', ambient:'rgba(50,70,90,0.11)',   sunAngle:0.5  }, // 2 · 1799
  { skyTop:'#605040', skyBot:'#b88050', ambient:'rgba(80,50,20,0.14)',   sunAngle:0.4  }, // 3 · 1872
  { skyTop:'#1c2c48', skyBot:'#2c5070', ambient:'rgba(20,40,80,0.14)',   sunAngle:0.3  }, // 4 · 1950
  { skyTop:'#70983a', skyBot:'#d8d060', ambient:'rgba(130,120,30,0.07)', sunAngle:0.65 }, // 5 · 1955
  { skyTop:'#2848a0', skyBot:'#9838b0', ambient:'rgba(50,30,100,0.09)',  sunAngle:0.5  }, // 6 · 1984
  { skyTop:'#3878c0', skyBot:'#78c0e0', ambient:'rgba(30,70,110,0.07)',  sunAngle:0.7  }, // 7 · 2020
];

let _eraId = 0;
export function setEra(id) { _eraId = Math.max(0, Math.min(7, id)); }
function pal() { return ERA_PALETTES[_eraId]; }

// ── Seeded RNG ────────────────────────────────────────────
function rng(seed) {
  let s = seed;
  return () => {
    s = s * 1664525 + 1013904223 & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ── Sky ───────────────────────────────────────────────────
export function drawSky(ctx, w, h, frame, tod = 0.5) {
  const p = pal();
  // Multi-stop gradient sky
  const g = ctx.createLinearGradient(0, 0, 0, h * 0.65);
  g.addColorStop(0,   p.skyTop);
  g.addColorStop(0.5, lerpColor(p.skyTop, p.skyBot, 0.5));
  g.addColorStop(1,   p.skyBot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Sun/moon glow
  const sunX = w * (0.3 + p.sunAngle * 0.4);
  const sunY = h * 0.18;
  const sunG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, w * 0.22);
  sunG.addColorStop(0, 'rgba(255,240,160,0.45)');
  sunG.addColorStop(1, 'rgba(255,240,160,0)');
  ctx.fillStyle = sunG;
  ctx.fillRect(0, 0, w, h * 0.5);

  // Horizon haze
  const hazeG = ctx.createLinearGradient(0, h * 0.45, 0, h * 0.65);
  hazeG.addColorStop(0, 'rgba(255,255,220,0.0)');
  hazeG.addColorStop(1, 'rgba(255,255,220,0.15)');
  ctx.fillStyle = hazeG;
  ctx.fillRect(0, h * 0.45, w, h * 0.2);

  // Soft clouds
  const r = rng(13 + _eraId * 7);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  for (let i = 0; i < 5; i++) {
    const cx = r() * w, cy = r() * h * 0.35 + h * 0.05;
    const cw = r() * 80 + 60, ch = r() * 16 + 10;
    ctx.beginPath();
    ctx.ellipse(cx, cy, cw, ch, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + cw * 0.3, cy - ch * 0.4, cw * 0.6, ch * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stars at night
  if (tod > 0.72) {
    const alpha = Math.min((tod - 0.72) / 0.28, 1) * 0.9;
    const sr = rng(42);
    for (let i = 0; i < 70; i++) {
      const sx = sr() * w, sy = sr() * h * 0.5;
      const sz = sr() * 1.2 + 0.4;
      ctx.fillStyle = `rgba(255,255,255,${alpha * (0.5 + sr() * 0.5)})`;
      ctx.beginPath(); ctx.arc(sx, sy, sz, 0, Math.PI * 2); ctx.fill();
    }
  }
}

// ── Tile drawing ──────────────────────────────────────────
export function drawTiles(ctx, map, rows, cols, ox, oy, w, h) {
  const startC = Math.max(0, Math.floor(ox / TILE));
  const startR = Math.max(0, Math.floor(oy / TILE));
  const endC   = Math.min(cols - 1, Math.ceil((ox + w) / TILE));
  const endR   = Math.min(rows - 1, Math.ceil((oy + h) / TILE));

  const now = performance.now();

  for (let r = startR; r <= endR; r++) {
    for (let c = startC; c <= endC; c++) {
      const tile = map[r]?.[c] ?? T.GRASS;
      const px   = Math.round(c * TILE - ox);
      const py   = Math.round(r * TILE - oy);
      _tile(ctx, tile, px, py, TILE, r, c, now);
    }
  }

  // Era ambient colour grade
  const amb = pal().ambient;
  if (amb) { ctx.fillStyle = amb; ctx.fillRect(0, 0, w, h); }
}

function _tile(ctx, tile, px, py, s, r, c, now) {
  const seed = r * 97 + c * 31 + _eraId * 7;
  const tr = rng(seed);

  switch (tile) {

    case T.GRASS: {
      // Base — three-tone layered grass like Stardew
      const v = tr() * 0.06 - 0.03;
      ctx.fillStyle = shiftColor('#5a9a3a', v);
      ctx.fillRect(px, py, s, s);
      // Darker ground layer (shadow under blades)
      ctx.fillStyle = '#4a7a2e';
      ctx.fillRect(px, py + s*0.6, s, s*0.4);
      // Individual grass blades — 5-8 per tile
      const blades = 6 + Math.floor(tr() * 4);
      for (let i = 0; i < blades; i++) {
        const bx  = px + tr() * s;
        const by  = py + s * 0.2 + tr() * s * 0.5;
        const bh  = s * (0.18 + tr() * 0.14);
        const lx  = tr() * s * 0.08 - s * 0.04;
        const col = tr() > 0.5 ? '#70c048' : '#4a8a2a';
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(bx - 1, by + bh);
        ctx.lineTo(bx + lx, by);
        ctx.lineTo(bx + 1, by + bh);
        ctx.fill();
      }
      // Sparse bright highlight specks
      if (tr() > 0.7) {
        ctx.fillStyle = 'rgba(180,255,100,0.18)';
        ctx.fillRect(px + tr()*s, py + tr()*s*0.8, 2, 2);
      }
      break;
    }

    case T.DIRT: {
      ctx.fillStyle = '#907060';
      ctx.fillRect(px, py, s, s);
      // Grain texture
      ctx.fillStyle = 'rgba(0,0,0,0.07)';
      for (let i = 0; i < 6; i++) ctx.fillRect(px + tr()*s, py + tr()*s, 2, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (let i = 0; i < 4; i++) ctx.fillRect(px + tr()*s, py + tr()*s, 3, 1);
      break;
    }

    case T.COBBLE: {
      // Stone fill + individual cobblestone pattern
      ctx.fillStyle = '#7a7060';
      ctx.fillRect(px, py, s, s);
      // 3×3 grid of rounded stones
      const cols3 = 3, rows3 = 3;
      const sw = s / cols3, sh = s / rows3;
      for (let ri = 0; ri < rows3; ri++) {
        for (let ci = 0; ci < cols3; ci++) {
          const sr2 = rng(seed + ri * 13 + ci * 7);
          const sx2 = px + ci * sw + 1 + sr2() * 1;
          const sy2 = py + ri * sh + 1 + sr2() * 1;
          const sw2 = sw - 3 + sr2() * 2;
          const sh2 = sh - 3 + sr2() * 2;
          const shade = sr2() * 0.12 - 0.06;
          ctx.fillStyle = shiftColor('#8a8070', shade);
          ctx.beginPath();
          ctx.roundRect(sx2, sy2, sw2, sh2, 2);
          ctx.fill();
          // Top-left highlight
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.fillRect(sx2 + 1, sy2 + 1, sw2 * 0.5, 1);
          // Bottom-right shadow
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.fillRect(sx2, sy2 + sh2 - 1, sw2, 1);
          ctx.fillRect(sx2 + sw2 - 1, sy2, 1, sh2);
        }
      }
      break;
    }

    case T.ROAD: {
      ctx.fillStyle = '#a09070';
      ctx.fillRect(px, py, s, s);
      // Wheel-rut lines
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(px + s*0.2, py, 3, s);
      ctx.fillRect(px + s*0.75, py, 3, s);
      // Pebble scatter
      ctx.fillStyle = 'rgba(150,140,110,0.6)';
      for (let i = 0; i < 5; i++) ctx.fillRect(px + tr()*s, py + tr()*s, 2, 2);
      break;
    }

    case T.WATER: {
      // Deep base
      ctx.fillStyle = '#2060a0';
      ctx.fillRect(px, py, s, s);
      // Animated shimmer bands
      const wphase = (now / 1800 + seed * 0.1) % 1;
      ctx.fillStyle = 'rgba(80,160,220,0.25)';
      for (let i = 0; i < 3; i++) {
        const wy = py + ((wphase + i * 0.33) % 1) * s;
        ctx.fillRect(px + s*0.1, wy, s * 0.6, 3);
      }
      // Surface highlight
      ctx.fillStyle = 'rgba(200,240,255,0.15)';
      ctx.beginPath();
      ctx.ellipse(px + s*0.35, py + s*0.3, s*0.22, s*0.06, 0.2, 0, Math.PI*2);
      ctx.fill();
      // Edge darkening
      ctx.fillStyle = 'rgba(0,0,60,0.2)';
      ctx.fillRect(px, py, 3, s);
      ctx.fillRect(px, py, s, 3);
      break;
    }

    case T.DEEP_WATER: {
      ctx.fillStyle = '#14305a';
      ctx.fillRect(px, py, s, s);
      ctx.fillStyle = 'rgba(30,80,150,0.3)';
      const dp = (now / 2200 + seed * 0.07) % 1;
      ctx.fillRect(px + s*0.15, py + dp * s * 0.8, s*0.5, 2);
      ctx.fillRect(px + s*0.45, py + ((dp + 0.4) % 1) * s * 0.8, s*0.35, 2);
      break;
    }

    case T.TREE: {
      // Ground shadow first
      ctx.fillStyle = 'rgba(0,40,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(px + s*0.5, py + s*0.88, s*0.42, s*0.14, 0, 0, Math.PI*2);
      ctx.fill();
      // Trunk
      ctx.fillStyle = '#5a3a10';
      ctx.fillRect(px + s*0.4, py + s*0.55, s*0.2, s*0.44);
      // Dark bark lines
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(px + s*0.44, py + s*0.58, 2, s*0.38);
      // Canopy layers (back to front, darker to lighter)
      const layers = [
        { y: 0.48, r: 0.40, col: '#1e5010' },
        { y: 0.32, r: 0.38, col: '#2a6018' },
        { y: 0.20, r: 0.32, col: '#388020' },
        { y: 0.10, r: 0.24, col: '#48a028' },
      ];
      layers.forEach(l => {
        ctx.fillStyle = l.col;
        ctx.beginPath();
        ctx.arc(px + s*0.5, py + s*l.y, s*l.r, 0, Math.PI*2);
        ctx.fill();
      });
      // Highlight specks on top canopy
      ctx.fillStyle = 'rgba(120,255,60,0.2)';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(px + s*(0.35 + tr()*0.3), py + s*(0.06 + tr()*0.12), 2, 2);
      }
      break;
    }

    case T.PINE: {
      ctx.fillStyle = 'rgba(0,30,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(px + s*0.5, py + s*0.9, s*0.3, s*0.1, 0, 0, Math.PI*2);
      ctx.fill();
      // Three tiers
      [[0.82,0.30,'#1a4010'],[0.55,0.38,'#244e18'],[0.28,0.44,'#2e6020']].forEach(([ty,tw,tc]) => {
        ctx.fillStyle = tc;
        ctx.beginPath();
        ctx.moveTo(px + s*0.5, py + s*(ty - tw * 0.7));
        ctx.lineTo(px + s*(0.5 - tw), py + s*ty);
        ctx.lineTo(px + s*(0.5 + tw), py + s*ty);
        ctx.fill();
      });
      break;
    }

    case T.ROCK: {
      ctx.fillStyle = '#606058';
      ctx.fillRect(px, py, s, s);
      // Main rock shape
      ctx.fillStyle = '#787068';
      ctx.beginPath();
      ctx.ellipse(px + s*0.5, py + s*0.6, s*0.38, s*0.3, 0, 0, Math.PI*2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = '#989080';
      ctx.beginPath();
      ctx.ellipse(px + s*0.42, py + s*0.48, s*0.18, s*0.12, -0.3, 0, Math.PI*2);
      ctx.fill();
      // Shadow base
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(px + s*0.5, py + s*0.82, s*0.34, s*0.09, 0, 0, Math.PI*2);
      ctx.fill();
      break;
    }

    case T.WHEAT: {
      ctx.fillStyle = '#a88020';
      ctx.fillRect(px, py, s, s);
      // Stalks
      const stalks = 5;
      for (let i = 0; i < stalks; i++) {
        const sx2 = px + (i / stalks) * s + tr() * (s / stalks * 0.5);
        const sway = Math.sin(now / 1200 + seed + i) * 2;
        ctx.fillStyle = '#c89830';
        ctx.fillRect(sx2, py + s*0.4, 2, s*0.58);
        // Wheat head
        ctx.fillStyle = '#e8b840';
        ctx.fillRect(sx2 + sway - 1, py + s*0.1, 4, s*0.32);
        // Seed dots
        ctx.fillStyle = '#c89030';
        for (let j = 0; j < 3; j++) ctx.fillRect(sx2 + sway, py + s*(0.12 + j*0.09), 2, 2);
      }
      break;
    }

    case T.FLOWER: {
      ctx.fillStyle = '#5a9a3a';
      ctx.fillRect(px, py, s, s);
      // Grass base (reuse)
      ctx.fillStyle = '#4a7a2e';
      ctx.fillRect(px, py + s*0.65, s, s*0.35);
      // Flowers
      const fcount = 2 + Math.floor(tr() * 3);
      const fcols = ['#ff6090','#ffcc40','#8080ff','#ff9040','#ff4060'];
      for (let i = 0; i < fcount; i++) {
        const fx = px + (0.1 + tr() * 0.8) * s;
        const fy = py + (0.15 + tr() * 0.5) * s;
        const fc = fcols[Math.floor(tr() * fcols.length)];
        // 5 petals
        ctx.fillStyle = fc;
        for (let p = 0; p < 5; p++) {
          const angle = (p / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(fx + Math.cos(angle)*4, fy + Math.sin(angle)*4, 3, 0, Math.PI*2);
          ctx.fill();
        }
        // Centre
        ctx.fillStyle = '#ffff80';
        ctx.beginPath(); ctx.arc(fx, fy, 2.5, 0, Math.PI*2); ctx.fill();
        // Stem
        ctx.fillStyle = '#3a7020';
        ctx.fillRect(fx - 1, fy + 3, 2, s*0.3);
      }
      break;
    }

    case T.CORN: {
      ctx.fillStyle = '#5a8028';
      ctx.fillRect(px, py, s, s);
      const cs = 3 + Math.floor(tr() * 2);
      for (let i = 0; i < cs; i++) {
        const cx2 = px + (i / cs) * s + s * 0.1;
        const sway = Math.sin(now / 1500 + i) * 1.5;
        ctx.fillStyle = '#4a9020';
        ctx.fillRect(cx2 + sway, py + s * 0.05, 4, s * 0.88);
        // Leaf
        ctx.fillStyle = '#60b030';
        ctx.beginPath();
        ctx.moveTo(cx2 + sway + 2, py + s * 0.35);
        ctx.lineTo(cx2 + sway + s*0.18, py + s * 0.25);
        ctx.lineTo(cx2 + sway + 2, py + s * 0.55);
        ctx.fill();
        // Corn cob
        ctx.fillStyle = '#e8c040';
        ctx.fillRect(cx2 + sway - 1, py + s * 0.3, 6, s * 0.22);
      }
      break;
    }

    case T.PLANK: {
      ctx.fillStyle = '#907040';
      ctx.fillRect(px, py, s, s);
      // Plank lines
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(px, py + s*0.33, s, 2);
      ctx.fillRect(px, py + s*0.66, s, 2);
      ctx.fillRect(px + s*0.5, py, 1, s);
      // Wood grain
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      for (let i = 0; i < 3; i++) ctx.fillRect(px + tr()*s, py + tr()*s, s*0.4, 1);
      break;
    }

    case T.BRICK: {
      ctx.fillStyle = '#a85a38';
      ctx.fillRect(px, py, s, s);
      // Brick rows — offset alternating
      const brows = 4;
      for (let ri = 0; ri < brows; ri++) {
        const by2 = py + (ri / brows) * s;
        const bh2 = s / brows - 2;
        const offset = (ri % 2) * s * 0.25;
        for (let bi = -1; bi < 4; bi++) {
          const bx2 = px + bi * s * 0.5 + offset;
          const bw2 = s * 0.48;
          ctx.fillStyle = ri % 2 ? '#b86040' : '#a05030';
          ctx.beginPath();
          ctx.roundRect(bx2 + 1, by2 + 1, bw2, bh2, 1);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          ctx.fillRect(bx2 + 2, by2 + 2, bw2 - 4, 1);
        }
        // Mortar line
        ctx.fillStyle = '#804028';
        ctx.fillRect(px, by2 + bh2 + 1, s, 2);
      }
      break;
    }

    case T.STEEL: {
      ctx.fillStyle = '#505868';
      ctx.fillRect(px, py, s, s);
      // Brushed metal horizontal bands
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
        ctx.fillRect(px, py + i * s / 8, s, s / 8);
      }
      // Rivet dots
      ctx.fillStyle = '#406070';
      [[0.1,0.1],[0.9,0.1],[0.1,0.9],[0.9,0.9]].forEach(([rx,ry]) => {
        ctx.beginPath(); ctx.arc(px + s*rx, py + s*ry, 2.5, 0, Math.PI*2); ctx.fill();
      });
      break;
    }

    case T.BRIDGE: {
      ctx.fillStyle = '#806030';
      ctx.fillRect(px, py, s, s);
      // Plank boards running left-right
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i%2 ? '#907040' : '#786030';
        ctx.fillRect(px, py + i*(s/4), s, s/4 - 1);
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(px, py + i*(s/4) + s/4 - 2, s, 2);
      }
      // Rope rail hints
      ctx.fillStyle = 'rgba(120,80,20,0.5)';
      ctx.fillRect(px, py + 2, s, 2);
      ctx.fillRect(px, py + s - 4, s, 2);
      break;
    }

    case T.HOUSE_WALL: {
      // Warm plastered wall
      const walV = tr() * 0.04 - 0.02;
      ctx.fillStyle = shiftColor('#d4b880', walV);
      ctx.fillRect(px, py, s, s);
      // Faint horizontal stone courses
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      for (let i = 1; i < 4; i++) ctx.fillRect(px, py + i*(s/4), s, 1);
      // Bottom shadow
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(px, py + s - 4, s, 4);
      break;
    }

    case T.HOUSE_ROOF: {
      // Terracotta roof tile
      ctx.fillStyle = '#8c3020';
      ctx.fillRect(px, py, s, s);
      // Ridge tiles
      const rrows = 5;
      for (let ri = 0; ri < rrows; ri++) {
        const ry2 = py + ri * (s / rrows);
        const rh2 = s / rrows;
        ctx.fillStyle = ri % 2 ? '#a03828' : '#7c2818';
        ctx.fillRect(px, ry2, s, rh2 - 1);
        // Tile overlap shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(px, ry2 + rh2 - 2, s, 2);
        // Highlight top edge
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(px, ry2, s, 1);
      }
      break;
    }

    case T.DOOR: {
      ctx.fillStyle = '#5a2808';
      ctx.fillRect(px, py, s, s);
      // Door frame
      ctx.fillStyle = '#8a6030';
      ctx.fillRect(px + s*0.08, py, s*0.84, s);
      // Door panels
      ctx.fillStyle = '#7a5028';
      ctx.fillRect(px + s*0.15, py + s*0.08, s*0.3, s*0.38);
      ctx.fillRect(px + s*0.55, py + s*0.08, s*0.3, s*0.38);
      ctx.fillRect(px + s*0.15, py + s*0.52, s*0.3, s*0.38);
      ctx.fillRect(px + s*0.55, py + s*0.52, s*0.3, s*0.38);
      // Doorknob
      ctx.fillStyle = '#d4b020';
      ctx.beginPath(); ctx.arc(px + s*0.62, py + s*0.5, 3, 0, Math.PI*2); ctx.fill();
      break;
    }

    case T.SAND: {
      ctx.fillStyle = '#d4b870';
      ctx.fillRect(px, py, s, s);
      ctx.fillStyle = 'rgba(255,255,200,0.15)';
      for (let i = 0; i < 8; i++) ctx.fillRect(px + tr()*s, py + tr()*s, 2, 1);
      ctx.fillStyle = 'rgba(100,80,0,0.08)';
      for (let i = 0; i < 5; i++) ctx.fillRect(px + tr()*s, py + tr()*s, 3, 2);
      break;
    }

    case T.CIRCUIT: {
      ctx.fillStyle = '#0a1e10';
      ctx.fillRect(px, py, s, s);
      // PCB traces
      ctx.strokeStyle = '#20a040';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px+s*0.1,py+s*0.5); ctx.lineTo(px+s*0.9,py+s*0.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px+s*0.5,py+s*0.1); ctx.lineTo(px+s*0.5,py+s*0.9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px+s*0.1,py+s*0.2); ctx.lineTo(px+s*0.4,py+s*0.2); ctx.lineTo(px+s*0.4,py+s*0.5); ctx.stroke();
      // Solder points
      ctx.fillStyle = '#30c060';
      [[0.5,0.5],[0.1,0.5],[0.9,0.5],[0.5,0.1],[0.5,0.9]].forEach(([cx2,cy2]) => {
        ctx.beginPath(); ctx.arc(px+s*cx2, py+s*cy2, 2.5, 0, Math.PI*2); ctx.fill();
      });
      break;
    }

    case T.WALL: {
      ctx.fillStyle = '#606058';
      ctx.fillRect(px, py, s, s);
      // Stone texture
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(px + 2, py + 2, s - 4, s * 0.45);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(px, py + s - 4, s, 4);
      break;
    }

    case T.CROP_READY: {
      // Green glowing sparkle crop
      ctx.fillStyle = '#5a9a3a';
      ctx.fillRect(px, py, s, s);
      const phase = (now / 800 + seed) % (Math.PI * 2);
      ctx.fillStyle = `rgba(100,255,60,${0.3 + Math.sin(phase)*0.15})`;
      ctx.beginPath();
      ctx.arc(px + s*0.5, py + s*0.4, s*0.32, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#80e840';
      ctx.beginPath();
      ctx.arc(px + s*0.5, py + s*0.4, s*0.18, 0, Math.PI*2);
      ctx.fill();
      // Sparkle dots
      ctx.fillStyle = `rgba(200,255,100,${0.7+Math.sin(phase*2)*0.3})`;
      [[-10,-8],[8,-10],[10,6],[-8,8]].forEach(([dx,dy]) => {
        ctx.beginPath(); ctx.arc(px+s*0.5+dx, py+s*0.4+dy, 2, 0, Math.PI*2); ctx.fill();
      });
      break;
    }

    case T.CROP_SPENT: {
      ctx.fillStyle = '#7a6040';
      ctx.fillRect(px, py, s, s);
      ctx.fillStyle = '#5a4028';
      ctx.fillRect(px + s*0.3, py + s*0.3, s*0.4, s*0.5);
      break;
    }

    case T.PORTAL: {
      _drawPortal(ctx, px, py, s, now);
      break;
    }

    case T.CLIFF: {
      ctx.fillStyle = '#504030';
      ctx.fillRect(px, py, s, s);
      ctx.fillStyle = '#403020';
      ctx.fillRect(px, py + s*0.55, s, s*0.45);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let i = 0; i < 3; i++) ctx.fillRect(px + tr()*s, py + tr()*s*0.5, s*0.3, 1);
      break;
    }

    default: {
      // Unknown tile — magenta so it's obvious
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(px, py, s, s);
      break;
    }
  }
}

function _drawPortal(ctx, px, py, s, now) {
  const phase = (now / 800) % (Math.PI * 2);
  // Ground glow
  const g = ctx.createRadialGradient(px+s/2, py+s/2, 0, px+s/2, py+s/2, s*0.5);
  g.addColorStop(0, `rgba(160,60,255,${0.35+Math.sin(phase)*0.1})`);
  g.addColorStop(0.6, `rgba(100,20,200,0.2)`);
  g.addColorStop(1, `rgba(80,0,160,0)`);
  ctx.fillStyle = g; ctx.fillRect(px, py, s, s);
  // Rings
  for (let i = 0; i < 3; i++) {
    const r = s*(0.22 + i*0.1 + Math.sin(phase + i*1.1)*0.04);
    const alpha = 0.5 + Math.sin(phase + i*0.9)*0.25;
    ctx.strokeStyle = `rgba(180,80,255,${alpha})`;
    ctx.lineWidth = 2.5 - i * 0.5;
    ctx.beginPath(); ctx.arc(px+s/2, py+s/2, r, 0, Math.PI*2); ctx.stroke();
  }
  // Particle sparkles rotating
  ctx.fillStyle = 'rgba(220,160,255,0.8)';
  for (let i = 0; i < 6; i++) {
    const a = phase + i * Math.PI / 3;
    const pr = s * 0.3;
    ctx.beginPath();
    ctx.arc(px+s/2 + Math.cos(a)*pr, py+s/2 + Math.sin(a)*pr, 2, 0, Math.PI*2);
    ctx.fill();
  }
}

// ── Character sprite (Stardew proportions) ────────────────
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

  // Stardew-style proportions: head is large, body square, legs short
  const H  = TILE * 0.9;   // total sprite height
  const W  = TILE * 0.65;  // sprite width
  const hx = x + W / 2;    // centre x

  // Walk bounce
  const walking = Math.abs(Math.sin(walkCycle)) > 0.05;
  const bob     = pose === 'sleeping' ? 0 : walking ? Math.abs(Math.sin(walkCycle)) * 3 : 0;

  ctx.save();
  if (hurt) ctx.globalAlpha = 0.6;
  if (pose === 'sleeping') { ctx.translate(x + H*0.5, y + W*0.5); ctx.rotate(Math.PI/2); ctx.translate(-W/2, -H*0.2); }

  // ── Ground shadow ──
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(hx, y + H * 0.97, W*0.42, H*0.05, 0, 0, Math.PI*2);
  ctx.fill();

  // ── Legs ──
  const legSwing = walking ? Math.sin(walkCycle) * 6 : 0;
  const legY     = y + H * 0.64 - bob;
  const legH     = H * 0.26;
  const legW     = W * 0.22;

  // Shoe soles (dark)
  ctx.fillStyle = darken(bodyColor, 0.5);
  ctx.fillRect(hx - W*0.28 + legSwing,     legY + legH - 4, legW + 4, 5);
  ctx.fillRect(hx + W*0.06 - legSwing,     legY + legH - 4, legW + 4, 5);

  // Pants
  ctx.fillStyle = darken(bodyColor, 0.35);
  ctx.beginPath();
  ctx.roundRect(hx - W*0.30 + legSwing,   legY, legW + 2, legH, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(hx + W*0.08 - legSwing,   legY, legW + 2, legH, 2);
  ctx.fill();
  // Leg highlight
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(hx - W*0.28 + legSwing + 1, legY + 2, legW*0.4, legH - 6);
  ctx.fillRect(hx + W*0.10 - legSwing + 1, legY + 2, legW*0.4, legH - 6);

  // ── Body / torso ──
  const bodyY = y + H * 0.30 - bob;
  const bodyH = H * 0.37;
  const bodyW = W * 0.72;

  // Shirt base
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(hx - bodyW/2, bodyY, bodyW, bodyH, 4);
  ctx.fill();
  // Shirt shading — left dark, right highlight
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.roundRect(hx - bodyW/2, bodyY, bodyW*0.25, bodyH, [4,0,0,4]);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.roundRect(hx + bodyW*0.15, bodyY, bodyW*0.2, bodyH, [0,4,4,0]);
  ctx.fill();

  // Arms
  const armY    = bodyY + H * 0.04;
  const armH    = bodyH * 0.65;
  const armW    = W * 0.18;
  const armSwing = walking ? Math.sin(walkCycle) * 5 : 0;

  ctx.fillStyle = bodyColor;
  // Left arm (back arm when facing right)
  ctx.beginPath();
  ctx.roundRect(hx - bodyW/2 - armW + 2, armY + armSwing, armW, armH, 3);
  ctx.fill();
  // Right arm
  ctx.beginPath();
  ctx.roundRect(hx + bodyW/2 - 2, armY - armSwing, armW, armH, 3);
  ctx.fill();

  // Tool in hand (pointing pose)
  if (pose === 'pointing') {
    ctx.fillStyle = skinColor;
    ctx.fillRect(hx + bodyW/2 + armW - 2, armY - armSwing + armH * 0.3, W*0.28, armH*0.15);
  }

  // Held journal (reading pose)
  if (pose === 'reading') {
    ctx.fillStyle = '#b07838';
    ctx.beginPath();
    ctx.roundRect(hx - W*0.4, armY + armH * 0.3, W*0.6, bodyH*0.5, 3);
    ctx.fill();
    ctx.fillStyle = '#f0e8c8';
    ctx.fillRect(hx - W*0.34, armY + armH*0.36, W*0.24, bodyH*0.38);
    ctx.fillRect(hx - W*0.04, armY + armH*0.36, W*0.24, bodyH*0.38);
    // Lines on page
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    for (let i = 0; i < 3; i++) ctx.fillRect(hx - W*0.32, armY + armH*0.42 + i*5, W*0.2, 1);
  }

  // ── Head ──
  const headR = W * 0.29;
  const headX = hx;
  const headY = y + H * 0.10 - bob;

  // Neck
  ctx.fillStyle = skinColor;
  ctx.fillRect(headX - W*0.1, bodyY - 4, W*0.2, 8);

  // Head base with outline for crispness
  ctx.fillStyle = skinColor;
  ctx.beginPath(); ctx.arc(headX, headY + headR, headR, 0, Math.PI*2); ctx.fill();

  // Head shading (right side darker)
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.beginPath(); ctx.arc(headX + headR*0.2, headY + headR, headR, 0, Math.PI*2); ctx.fill();
  // Head highlight (left-top)
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.arc(headX - headR*0.25, headY + headR*0.5, headR*0.55, 0, Math.PI*2); ctx.fill();

  // Hair
  ctx.fillStyle = hairColor;
  ctx.beginPath(); ctx.arc(headX, headY + headR * 0.35, headR * 1.05, Math.PI * 1.1, Math.PI * 1.9); ctx.fill();
  // Side hair
  ctx.fillRect(headX - headR * 1.0, headY + headR * 0.3, headR*0.3, headR*0.7);
  ctx.fillRect(headX + headR * 0.7, headY + headR * 0.3, headR*0.3, headR*0.7);

  // ── Face ──
  const faceDir = facing === 'left' ? -1 : facing === 'right' ? 1 : 0;
  const eyeY    = headY + headR * 0.8;

  if (facing === 'up') {
    // Facing away — just back of hair
  } else if (pose === 'sleeping') {
    // Closed eyes (— —)
    ctx.fillStyle = darken(skinColor, 0.3);
    ctx.fillRect(headX - headR*0.38, eyeY, headR*0.28, 2);
    ctx.fillRect(headX + headR*0.10, eyeY, headR*0.28, 2);
  } else if (pose === 'surprised') {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(headX - headR*0.3 + faceDir*3, eyeY, headR*0.18, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(headX + headR*0.3 + faceDir*3, eyeY, headR*0.18, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath(); ctx.arc(headX - headR*0.3 + faceDir*5, eyeY, headR*0.1, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(headX + headR*0.3 + faceDir*5, eyeY, headR*0.1, 0, Math.PI*2); ctx.fill();
  } else {
    // Normal eyes with whites + iris
    const ex1 = headX - headR*0.32 + faceDir * 4;
    const ex2 = headX + headR*0.32 + faceDir * 4;
    // Whites
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(ex1, eyeY, headR*0.16, headR*0.13, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(ex2, eyeY, headR*0.16, headR*0.13, 0, 0, Math.PI*2); ctx.fill();
    // Iris
    ctx.fillStyle = '#303880';
    ctx.beginPath(); ctx.arc(ex1 + faceDir*1, eyeY, headR*0.1, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex2 + faceDir*1, eyeY, headR*0.1, 0, Math.PI*2); ctx.fill();
    // Pupils
    ctx.fillStyle = '#101020';
    ctx.beginPath(); ctx.arc(ex1 + faceDir*1.5, eyeY, headR*0.05, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex2 + faceDir*1.5, eyeY, headR*0.05, 0, Math.PI*2); ctx.fill();
    // Eyelid line
    ctx.strokeStyle = darken(skinColor, 0.25); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(ex1, eyeY, headR*0.16, Math.PI*1.1, Math.PI*1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(ex2, eyeY, headR*0.16, Math.PI*1.1, Math.PI*1.9); ctx.stroke();
    // Mouth (subtle smile)
    ctx.strokeStyle = darken(skinColor, 0.3); ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(headX + faceDir*3, eyeY + headR*0.4, headR*0.2, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── NPC portrait ──────────────────────────────────────────
export function drawNPCPortrait(ctx, opts = {}) {
  const { skinColor='#f0c080', hairColor='#804020', bodyColor='#806040', era=0, w=64, h=64 } = opts;
  ctx.clearRect(0, 0, w, h);

  // Background — era gradient
  const p = ERA_PALETTES[era] || ERA_PALETTES[0];
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, p.skyBot); g.addColorStop(1, p.skyTop);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  // Shoulders / clothing
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(w/2, h*0.9, w*0.46, h*0.28, 0, 0, Math.PI*2);
  ctx.fill();
  // Shoulder highlight
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(w*0.22, h*0.72, w*0.2, h*0.08);

  // Neck
  ctx.fillStyle = skinColor;
  ctx.fillRect(w*0.40, h*0.50, w*0.20, h*0.16);

  // Head
  ctx.fillStyle = skinColor;
  ctx.beginPath(); ctx.arc(w/2, h*0.38, w*0.28, 0, Math.PI*2); ctx.fill();
  // Head shading
  ctx.fillStyle = 'rgba(0,0,0,0.07)';
  ctx.beginPath(); ctx.arc(w*0.58, h*0.40, w*0.28, 0, Math.PI*2); ctx.fill();

  // Hair
  ctx.fillStyle = hairColor;
  ctx.beginPath(); ctx.arc(w/2, h*0.26, w*0.29, Math.PI*1.08, Math.PI*1.92); ctx.fill();
  ctx.fillRect(w*0.22, h*0.26, w*0.1, h*0.16); // left side
  ctx.fillRect(w*0.68, h*0.26, w*0.1, h*0.16); // right side

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(w*0.38, h*0.38, 3.5, 2.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(w*0.62, h*0.38, 3.5, 2.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#304080';
  ctx.beginPath(); ctx.arc(w*0.38, h*0.38, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(w*0.62, h*0.38, 2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#101020';
  ctx.beginPath(); ctx.arc(w*0.38, h*0.38, 1, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(w*0.62, h*0.38, 1, 0, Math.PI*2); ctx.fill();

  // Smile
  ctx.strokeStyle = darken(skinColor, 0.3); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(w/2, h*0.44, w*0.1, 0.1, Math.PI-0.1); ctx.stroke();
}

// ── Enemy sprite ──────────────────────────────────────────
export function drawEnemy(ctx, x, y, opts = {}) {
  const { color='#a03020', accent='#c05040', emoji='👹', size=TILE*0.65 } = opts;
  const cx2 = x + size/2;
  const cy2 = y + size*0.5;

  // Ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(cx2, y + size*0.92, size*0.38, size*0.09, 0, 0, Math.PI*2); ctx.fill();

  // Body with gradient shading
  const bg = ctx.createRadialGradient(cx2 - size*0.15, cy2 - size*0.15, 0, cx2, cy2, size*0.5);
  bg.addColorStop(0, accent);
  bg.addColorStop(1, color);
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.arc(cx2, cy2, size*0.42, 0, Math.PI*2); ctx.fill();

  // Outline
  ctx.strokeStyle = darken(color, 0.4); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx2, cy2, size*0.42, 0, Math.PI*2); ctx.stroke();

  // Emoji face / icon
  ctx.font = `${Math.floor(size*0.38)}px serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(emoji, cx2, cy2 - size*0.02);
  ctx.textBaseline = 'alphabetic';
}

// ── Dropped item ──────────────────────────────────────────
export function drawDroppedItem(ctx, x, y, emoji, frame) {
  const s   = TILE * 0.5;
  const bob = Math.sin(frame / 28) * 3;
  const glow = 0.35 + Math.sin(frame / 18) * 0.18;

  // Outer glow ring
  const gg = ctx.createRadialGradient(x+s/2, y+s/2+bob, 0, x+s/2, y+s/2+bob, s*0.48);
  gg.addColorStop(0, `rgba(255,220,80,${glow})`);
  gg.addColorStop(1, `rgba(255,220,80,0)`);
  ctx.fillStyle = gg; ctx.fillRect(x, y - 4, s, s + 8);

  ctx.font = `${Math.floor(s * 0.62)}px serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x + s/2, y + s/2 + bob);
  ctx.textBaseline = 'alphabetic';
}

// ── Fishing bobber ────────────────────────────────────────
export function drawBobber(ctx, x, y, dipped, frame) {
  const bob = dipped ? 5 : Math.sin(frame / 22) * 2.5;

  // Line from shore (approximate)
  ctx.strokeStyle = 'rgba(180,160,100,0.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - 30, y - 30); ctx.lineTo(x, y + bob); ctx.stroke();

  // Float body
  ctx.fillStyle = dipped ? '#cc2020' : '#e8e8e8';
  ctx.beginPath(); ctx.ellipse(x, y + bob, 5, 7, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = dipped ? '#ff4040' : '#ff4040';
  ctx.beginPath(); ctx.ellipse(x, y + bob - 2, 5, 4, 0, 0, Math.PI); ctx.fill();
  // Tip
  ctx.fillStyle = '#404040';
  ctx.beginPath(); ctx.arc(x, y + bob + 6, 1.5, 0, Math.PI*2); ctx.fill();
}

// ── Minimap ───────────────────────────────────────────────
export function drawMinimap(ctx, worldCols, worldRows, visitedSet, currentR, currentC, x, y, cellSize=8) {
  const W2 = worldCols * cellSize + 6;
  const H2 = worldRows * cellSize + 6;
  // Panel background
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.beginPath(); ctx.roundRect(x-3, y-3, W2, H2, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(x-3, y-3, W2, H2, 4); ctx.stroke();
  // Cells
  for (let r = 0; r < worldRows; r++) {
    for (let c = 0; c < worldCols; c++) {
      const key = `${r},${c}`;
      const cur = r === currentR && c === currentC;
      ctx.fillStyle = cur ? '#f0c040' : visitedSet.has(key) ? '#6a9050' : '#252525';
      ctx.beginPath(); ctx.roundRect(x + c*cellSize, y + r*cellSize, cellSize-1, cellSize-1, 1); ctx.fill();
      if (cur) {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(x + c*cellSize, y + r*cellSize, cellSize-1, cellSize-1, 1); ctx.stroke();
      }
    }
  }
}

// ── Colour helpers ────────────────────────────────────────
function lerpColor(a, b, t) {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah>>16)&0xff, ag=(ah>>8)&0xff, ab2=ah&0xff;
  const br = (bh>>16)&0xff, bg2=(bh>>8)&0xff, bb=(bh)&0xff;
  const rr = Math.round(ar+(br-ar)*t);
  const rg = Math.round(ag+(bg2-ag)*t);
  const rb = Math.round(ab2+(bb-ab2)*t);
  return `#${rr.toString(16).padStart(2,'0')}${rg.toString(16).padStart(2,'0')}${rb.toString(16).padStart(2,'0')}`;
}

function shiftColor(hex, v) {
  const h = parseInt(hex.slice(1),16);
  const r = Math.min(255,Math.max(0,((h>>16)&0xff)+Math.round(v*255)));
  const g = Math.min(255,Math.max(0,((h>>8) &0xff)+Math.round(v*255)));
  const b = Math.min(255,Math.max(0,( h     &0xff)+Math.round(v*255)));
  return `rgb(${r},${g},${b})`;
}

function darken(hex, factor) {
  const h = parseInt(hex.replace('#',''),16);
  const r = Math.round(((h>>16)&0xff)*(1-factor));
  const g = Math.round(((h>>8) &0xff)*(1-factor));
  const b = Math.round(( h     &0xff)*(1-factor));
  return `rgb(${r},${g},${b})`;
}

// ── Seeded RNG ────────────────────────────────────────────
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
