// ═══════════════════════════════════════════════════════════
//  SaveManager — per-character localStorage saves
//  Key: vdh_roots_v1_char_{characterId}
//  One save slot per character — each kid has their own adventure.
// ═══════════════════════════════════════════════════════════

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
      const data = {
        version:       VERSION,
        characterId:   charId,
        eraId:         game._eraId,
        screenRow:     game.world.screenRow,
        screenCol:     game.world.screenCol,
        playerX:       game.player.x,
        playerY:       game.player.y,
        playerHP:      game.player.hp,
        playerStamina: game.player.stamina,
        inventory:     JSON.parse(JSON.stringify(game.player.inventory)),
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

  /** List all saved characters */
  listSlots() {
    const chars = ['traveller','raven','starling','charlotte','tenley','knoxley','isabella','henry','maxwell'];
    return chars.map(charId => {
      const d = this.load(charId);
      return d ? { slot: charId, characterId: d.characterId, eraId: d.eraId, savedAt: d.savedAt } : null;
    }).filter(Boolean);
  }
}
