// aarle-rixtel-1660-world.js - G0b spike: Aarle-Rixtel, Noord-Brabant, 1660 (Era 1).
// Extends AarleRixtel1539World — same layout, with changes for the Generality Land era.
// Reconstructed from historical sources (Generality Land of Brabant, 1648-1795).
//
// Key differences from 1539:
// - Player: @I084@ Jan Dircx (b. ~1610, age ~50 in 1660), adult male.
// - NPCs: @I177@ Magdalena (b. ~1633, wife), @I176@ Jan Jansen (b. 1660, baby).
// - Church relabelled "Hervormde Kerk (formerly Sint-Oda, reconstructed)":
//   after 1648, the Generality Lands forced Reformed services in former Catholic churches.
// - Schuilkerk: plain barn ~10×6 m, no windows, hidden behind farm buildings.
//   Code comment only — no DOM label (hidden Catholic chapel).
// - Two extra farm blocks vs Era 0.
// - Era 1, year 1660.
//
// Attribution: "Reconstructed from historical sources (Generality Land of Brabant, 1648-1795)"

import * as THREE from '../vendor/three/three.module.min.js';
import { AarleRixtel1539World, AARLE_1539_DATA, S } from './aarle-rixtel-1539-world.js';

export { S } from './aarle-rixtel-1539-world.js';

// ── 1660 overrides to the 1539 data ──────────────────────────────────────
// Deep-copy buildings and add 2 extra farms; update meta.
const EXTRA_FARMS = [
  // Extra farm 9: SW corner
  { i: 2009, e: 3.5, f: 1, r: 1, c: 5, q: 2, t: 'f',
    p: [-42, 30, -22, 30, -22, 50, -42, 50],
    o: [-32, 40, 1, 0, 20, 8] },
  // Extra farm 10: far NE
  { i: 2010, e: 3.5, f: 1, r: 1, c: 4, q: 2, t: 'f',
    p: [34, -50, 54, -50, 54, -30, 34, -30],
    o: [44, -40, 1, 0, 20, 8] },
  // Schuilkerk: plain barn ~10×6 m, hidden behind farm 5 to the SE.
  // No windows, no special materials — indistinguishable from a barn.
  // schuilkerk -- hidden Catholic chapel
  { i: 2099, e: 3.0, f: 1, r: 0, c: 5, q: 2, t: 'f',
    p: [40, 16, 50, 16, 50, 22, 40, 22],
    o: [45, 19, 1, 0, 10, 6] },
];

export const AARLE_1660_DATA = {
  meta: {
    ...AARLE_1539_DATA.meta,
    source: 'Reconstructed from historical sources (Generality Land of Brabant, 1648-1795)',
    attribution: 'Reconstructed from historical sources (Generality Land of Brabant, 1648-1795)',
    era: 1,
    era_year: 1660,
  },
  b: [...AARLE_1539_DATA.b, ...EXTRA_FARMS],
  r: AARLE_1539_DATA.r,
  w: [],
  bk: [],
  t: AARLE_1539_DATA.t,
  l: [],
  start: [8, -12],    // Jan Dircx on dirt track near church
  npc: [6, 4],        // Magdalena near church entrance
};

// ── the world ─────────────────────────────────────────────────────────────
export class AarleRixtel1660World extends AarleRixtel1539World {
  constructor(canvas, tier, data) {
    super(canvas, tier, data || AARLE_1660_DATA);
  }

  _buildWorld() {
    super._buildWorld();

    // ── update era label ──────────────────────────────────────────────────
    const note = document.getElementById('s-note');
    if (note) note.textContent = 'G0b spike (Reconstructed · Era 1 · 1660 · Aarle-Rixtel, NL) — not part of the game';

    // ── update DOM church label to Hervormde Kerk ─────────────────────────
    // _churchLabelEl is already created by the 1539 parent; we override the
    // text in _updateDomLabels() below.
  }

  // Project church tower apex and show the updated label for 1660.
  _updateDomLabels() {
    // Call grandparent (_updateDomLabels on MankWorld → HaarlemWorld), then
    // re-use the already-positioned churchLabelEl.
    super._updateDomLabels();
    if (this._churchLabelEl && this._churchLabelEl.style.display !== 'none') {
      this._churchLabelEl.textContent = 'Hervormde Kerk (formerly Sint-Oda, reconstructed)';
    }
  }

  // @I084@ Jan Dircx (b. ~1610, age ~50 in 1660).
  // NPC near church is Magdalena (@I177@, b. ~1633).
  _showBubble() {
    const head = this._npcMesh.position.clone(); head.y += 1.1;
    const proj = head.clone().project(this._camera);
    const rect = this._canvas.getBoundingClientRect();
    const sx = (proj.x * 0.5 + 0.5) * rect.width  + rect.left;
    const sy = (-proj.y * 0.5 + 0.5) * rect.height + rect.top;
    this._bubbleEl.style.left = sx + 'px';
    this._bubbleEl.style.top  = (sy - 10) + 'px';
    this._bubbleText.textContent =
      'De Hervormden gebruiken nu onze kerk. Maar het geloof leeft voort — weet u waar?';
    this._bubbleEl.style.display = 'block';
  }
}
