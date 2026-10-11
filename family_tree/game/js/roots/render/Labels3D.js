// ═══════════════════════════════════════════════════════════
//  Labels3D - name tags and pick-up icons as camera-facing sprites (G1 placeholder)
//
//  The 2D game paints a name above every person and enemy and an emoji for every pick-up. In 3D each of
//  those is a THREE.Sprite with a small canvas texture. Textures are cached by their content (text, colour,
//  hearts, hp) so a name is drawn once; sprites are pooled and re-used every frame. Sprites do not use the
//  depth buffer, so a name stays readable when somebody stands behind a house.
// ═══════════════════════════════════════════════════════════
import * as THREE from '../../../vendor/three/three.module.min.js';

const FONT = 'bold 26px "Segoe UI", system-ui, -apple-system, sans-serif';

export class LabelPool {
  constructor(scene) {
    this.scene = scene;
    this.sprites = [];
    this.used = 0;
    this.cache = new Map();         // key -> { tex, aspect, last }
    this.tick = 0;
  }

  begin() { this.used = 0; this.tick++; }

  end() {
    for (let i = this.used; i < this.sprites.length; i++) this.sprites[i].visible = false;
    if (this.cache.size > 220) this._trim();
  }

  _sprite() {
    let s = this.sprites[this.used];
    if (!s) {
      const mat = new THREE.SpriteMaterial({ transparent: true, depthTest: false, depthWrite: false, fog: false });
      s = new THREE.Sprite(mat);
      s.center.set(0.5, 0);
      s.renderOrder = 20;
      s.frustumCulled = false;
      this.scene.add(s);
      this.sprites[this.used] = s;
    }
    this.used++;
    s.visible = true;
    return s;
  }

  _place(s, entry, x, y, z, height) {
    if (s.material.map !== entry.tex) {
      const hadMap = !!s.material.map;
      s.material.map = entry.tex;
      if (!hadMap) s.material.needsUpdate = true;
    }
    s.scale.set(entry.aspect * height, height, 1);
    s.position.set(x, y, z);
    entry.last = this.tick;
  }

  /** A name tag: text, optional second line (hearts), optional bar (0..1, e.g. hit points). */
  tag(x, y, z, { text, color = '#ffffff', sub = '', subColor = '#f060a0', bar = null, height = 0.3 }) {
    const key = `T|${text}|${color}|${sub}|${bar == null ? '' : Math.round(bar * 10)}`;
    let e = this.cache.get(key);
    if (!e) { e = this._drawTag(text, color, sub, subColor, bar); this.cache.set(key, e); }
    const s = this._sprite();
    this._place(s, e, x, y, z, height * (e.h / 44));
  }

  /** An emoji icon (pick-ups, animals). size = world units. */
  icon(x, y, z, emoji, size = 0.5) {
    const key = 'I|' + emoji;
    let e = this.cache.get(key);
    if (!e) { e = this._drawIcon(emoji); this.cache.set(key, e); }
    const s = this._sprite();
    this._place(s, e, x, y, z, size);
  }

  _drawTag(text, color, sub, subColor, bar) {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    ctx.font = FONT;
    const tw = Math.ceil(ctx.measureText(text).width);
    let sw = 0;
    if (sub) { ctx.font = 'bold 22px sans-serif'; sw = Math.ceil(ctx.measureText(sub).width); }
    const w = Math.max(tw, sw) + 22, lineH = 44, subH = sub ? 26 : 0, barH = bar != null ? 14 : 0;
    const h = lineH + subH + barH;
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.clearRect(0, 0, w, h);
    // text pill
    const top = subH;
    g.fillStyle = 'rgba(0,0,0,0.58)';
    roundRect(g, 0, top, w, lineH - 4, 12); g.fill();
    g.font = FONT; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = color; g.fillText(text, w / 2, top + (lineH - 4) / 2 + 1);
    if (sub) {
      g.font = 'bold 22px sans-serif'; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillText(sub, w / 2 + 1, 14);
      g.fillStyle = subColor; g.fillText(sub, w / 2, 13);
    }
    if (bar != null) {
      const by = top + lineH - 2, bw = w - 12;
      g.fillStyle = '#500'; g.fillRect(6, by, bw, 9);
      g.fillStyle = '#f40'; g.fillRect(6, by, bw * Math.max(0, Math.min(1, bar)), 9);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    return { tex, aspect: w / h, h, last: this.tick };
  }

  _drawIcon(emoji) {
    const c = document.createElement('canvas');
    c.width = c.height = 72;
    const g = c.getContext('2d');
    g.font = '52px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 6;
    g.fillText(emoji, 36, 39);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    return { tex, aspect: 1, h: 72, last: this.tick };
  }

  _trim() {
    let drop = this.cache.size - 160;
    for (const [k, e] of this.cache) {
      if (drop <= 0) break;
      if (e.last >= this.tick - 2) continue;
      e.tex.dispose(); this.cache.delete(k); drop--;
    }
  }

  dispose() {
    for (const s of this.sprites) { this.scene.remove(s); s.material.dispose(); }
    this.sprites = [];
    for (const e of this.cache.values()) e.tex.dispose();
    this.cache.clear();
  }
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y);
  g.closePath();
}
