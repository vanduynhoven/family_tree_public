// g0b-page.js - page glue shared by the G0b spike pages (haarlem-osm.html, uden-1872.html).
// It is the inline script of haarlem-3d.html made reusable: WebGL2 check, the 2-second frame-rate
// probe that picks the quality tier, the stats panel toggle and window.__spike for
// scripts/g0b_check.js. Like G0 it has no top-level await (Safari 15) and never leaves a blank page.
const el = (id) => document.getElementById(id);

function emptySpike() {
  return { ready: false, stats: () => ({}), player: { x: 0, y: 0 }, tier: 'none', teleport() {},
    tapTile: () => Promise.resolve(false), tapNpc: () => Promise.resolve(false), pickTarget: () => null,
    info: () => ({}) };
}

export function showError(err, pageName) {
  el('loading').style.display = 'none';
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#111;color:#eee;font-size:1rem;text-align:center;padding:2rem;z-index:999';
  d.innerHTML = '<div><b>Could not load the 3D engine or the map data.</b><br><br>Serve the <code>game/</code> folder, not just <code>spike/</code>:<br><br>'
    + '<code style="background:#222;padding:4px 8px;border-radius:4px">python3 -m http.server 8000 --bind 127.0.0.1 --directory site/family_tree/game</code>'
    + '<br><br>Then open <code>http://127.0.0.1:8000/spike/' + pageName + '</code><br><br>'
    + '<small style="color:#888">Error: ' + String(err).replace(/</g, '&lt;') + '</small></div>';
  document.body.appendChild(d);
  window.__spike = emptySpike();
}

function probeTier(params) {
  const override = params.get('tier');
  if (override) return Promise.resolve(override);
  if (params.get('probe') === '0') return Promise.resolve('medium');
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve('low');
  return new Promise((resolve) => {
    let frames = 0, start = null;
    const budget = 2000;
    const tick = (t) => {
      if (!start) start = t;
      frames++;
      if (t - start >= budget) { const avg = budget / frames; resolve(avg > 24 ? 'low' : avg > 16 ? 'medium' : 'high'); }
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// makeWorld(canvas, tier) returns a world object with init() and the G0 public API.
export function boot(pageName, makeWorld) {
  const isPhone = window.innerWidth < 600;
  let gl2 = false;
  try { gl2 = !!document.createElement('canvas').getContext('webgl2'); } catch (e) { gl2 = false; }
  if (!gl2) {
    el('no-webgl').style.display = 'flex';
    el('loading').style.display = 'none';
    window.__spike = emptySpike();
    return;
  }
  el('loading-fill').style.width = '20%';
  probeTier(new URLSearchParams(location.search)).then((tier) => {
    el('loading-fill').style.width = '60%';
    const w = makeWorld(el('c'), tier);
    return w.init().then(() => {
      el('loading').style.display = 'none';
      const statsEl = el('stats');
      if (isPhone) statsEl.classList.add('hidden');
      const toggle = () => statsEl.classList.toggle('hidden');
      el('stats-toggle').addEventListener('click', toggle);
      document.addEventListener('keydown', (e) => { if (e.key === 'i' || e.key === 'I') toggle(); });
      el('bubble-close').addEventListener('click', () => { el('speech-bubble').style.display = 'none'; });
      const bi = w.buildInfo;
      if (bi && el('s-info')) {
        const tri = bi.triangles ? Object.values(bi.triangles).reduce((a, b) => a + b, 0) : 0;
        el('s-info').textContent = (bi.buildings || 0) + ' buildings, ' + Math.round(tri / 1000) + 'k scene tris';
      }
      window.__spike = {
        ready: true,
        stats: () => w.getStats(),
        get player() { return w.getPlayerTile(); },
        tier,
        teleport: (x, y) => w.teleport(x, y),
        tapTile: (x, y) => w.tapTile(x, y),
        tapNpc: () => w.tapNpc(),
        pickTarget: (n) => (w.pickTarget ? w.pickTarget(n) : null),
        info: () => w.buildInfo || {},
        world: w,
      };
    });
  }).catch((err) => showError(err, pageName));
}
