// ═══════════════════════════════════════════════════════════
//  SaveManager — per-character localStorage saves
//  Key: vdh_roots_v1_char_{characterId}
//  One save slot per character — each kid has their own adventure.
//
//  Position (G2, one continuous map per era): `x`,`y` are the player's world pixels on the whole era map,
//  `screenRow`,`screenCol` the region (the old screen) the player is in. `playerX`,`playerY` keep their
//  old meaning, the position inside that region, and `visitedScreens` / `portalScreens` are still lists
//  of "row,col" region keys. Saves written before G2 have no x,y: resolvePosition() puts the player where
//  the old fields say, inside the same region of the new map.
// ═══════════════════════════════════════════════════════════
import { TILE } from './Renderer.js';

const PREFIX  = 'vdh_roots_v1_char_';
const VERSION = 1;

export class SaveManager {
  _key(charId) { return `${PREFIX}${charId}`; }

  hasSave(charId) {
    try { return !!localStorage.getItem(this._key(charId)); }
    catch { return false; }
  }

  save(game, slot = 0) {
    // slot param kept for API compat — actual key is always the characterId
    const charId = game.characterId || `slot${slot}`;
    try {
      const region = game.world.region;
      const data = {
        version:       VERSION,
        characterId:   charId,
        eraId:         game._eraId,
        screenRow:     game.world.screenRow,
        screenCol:     game.world.screenCol,
        playerX:       game.player.x - (region ? region.x0 * TILE : 0),   // inside the region, as before
        playerY:       game.player.y - (region ? region.y0 * TILE : 0),
        x:             game.player.x,                                     // on the whole era map
        y:             game.player.y,
        playerHP:      game.player.hp,
        playerStamina: game.player.stamina,
        inventory:     JSON.parse(JSON.stringify(game.player.inventory)),
        keyItems:      JSON.parse(JSON.stringify(game.player.keyItems || [])),
        collectedFacts:JSON.parse(JSON.stringify(game.player.collectedFacts)),
        questState:    game.quests?.serialize() || {},
        visitedScreens:Array.from(game.world.visitedSet),
        portalScreens: Array.from(game.world.portalSet),
        npcFriendship: Object.fromEntries(game._npcFriendship || []),
        npcTalkCount:  Object.fromEntries(game._npcTalkCount  || []),
        unlockedEras:  Array.from(game.unlockedEras || []),
        eraVisitCount: { ...(game._eraVisitCount || {}) },
        dutchWords:    JSON.parse(JSON.stringify(game.player.dutchWords || [])),
        savedAt:       new Date().toISOString(),
      };
      localStorage.setItem(this._key(charId), JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Save failed:', e);
      return false;
    }
  }

  load(charIdOrSlot = 0) {
    // Accept either a characterId string or legacy numeric slot
    const key = typeof charIdOrSlot === 'string'
      ? this._key(charIdOrSlot)
      : `${PREFIX.replace('char_', 'slot')}${charIdOrSlot}`;  // legacy compat
    try {
      // Try character-keyed save first, then legacy slot-keyed
      let raw = localStorage.getItem(this._key(typeof charIdOrSlot === 'string' ? charIdOrSlot : `slot${charIdOrSlot}`));
      if (!raw && typeof charIdOrSlot === 'number') {
        raw = localStorage.getItem(`vdh_roots_v1_slot${charIdOrSlot}`);
      }
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.version !== VERSION) {
        console.warn('Save version mismatch — discarding.');
        this.deleteSave(typeof charIdOrSlot === 'string' ? charIdOrSlot : charIdOrSlot);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  deleteSave(charIdOrSlot = 0) {
    try {
      if (typeof charIdOrSlot === 'string') {
        localStorage.removeItem(this._key(charIdOrSlot));
      } else {
        localStorage.removeItem(`vdh_roots_v1_slot${charIdOrSlot}`);
        localStorage.removeItem(this._key(`slot${charIdOrSlot}`));
      }
    } catch {}
  }

  /**
   * Where the player stands on the (already loaded) world for a loaded save, in world pixels.
   * New saves carry x,y. A save from before G2 has screenRow/screenCol and playerX/playerY inside that
   * screen; the screen is now the region with the same index, so the same spot is region origin + playerX/Y.
   * Anything that is not walkable (or missing) falls back to the region's spawn point.
   */
  resolvePosition(data, world) {
    const reg = world.regionAt(data.screenRow ?? 1, data.screenCol ?? 0) ?? world.region;
    const num = v => typeof v === 'number' && Number.isFinite(v);
    if (num(data.x) && num(data.y) && world.canStandAt(data.x, data.y)) return { x: data.x, y: data.y };
    if (reg && num(data.playerX) && num(data.playerY) &&
        data.playerX >= 0 && data.playerY >= 0 && data.playerX < reg.cols * TILE && data.playerY < reg.rows * TILE) {
      const x = reg.x0 * TILE + data.playerX, y = reg.y0 * TILE + data.playerY;
      if (world.canStandAt(x, y)) return { x, y };
    }
    return world.spawnPixel(reg);
  }

  /** List all saved characters */
  listSlots() {
    const chars = ['traveller','raven','starling','charlotte','tenley','knoxley','isabella','henry','maxwell'];
    return chars.map(charId => {
      const d = this.load(charId);
      return d ? { slot: charId, characterId: d.characterId, eraId: d.eraId, savedAt: d.savedAt } : null;
    }).filter(Boolean);
  }
}
