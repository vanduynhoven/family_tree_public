// ═══════════════════════════════════════════════════════════
//  SaveManager — localStorage save/load, 3 slots
//  Key: vdh_roots_v1_slot{0|1|2}
// ═══════════════════════════════════════════════════════════

const PREFIX  = 'vdh_roots_v1_slot';
const VERSION = 1;

export class SaveManager {
  hasSave(slot = 0) {
    try { return !!localStorage.getItem(`${PREFIX}${slot}`); }
    catch { return false; }
  }

  save(game, slot = 0) {
    try {
      const data = {
        version:       VERSION,
        characterId:   game.characterId,
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
        // Persistent NPC state — hearts + talk counts
        npcFriendship: Object.fromEntries(game._npcFriendship || []),
        npcTalkCount:  Object.fromEntries(game._npcTalkCount  || []),
        unlockedEras:  Array.from(game.unlockedEras || []),
        savedAt:       new Date().toISOString(),
      };
      localStorage.setItem(`${PREFIX}${slot}`, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Save failed:', e);
      return false;
    }
  }

  load(slot = 0) {
    try {
      const raw = localStorage.getItem(`${PREFIX}${slot}`);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.version !== VERSION) {
        console.warn('Save version mismatch — discarding.');
        this.deleteSave(slot);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  deleteSave(slot = 0) {
    try { localStorage.removeItem(`${PREFIX}${slot}`); } catch {}
  }

  listSlots() {
    return [0, 1, 2].map(slot => {
      const d = this.load(slot);
      return d ? { slot, characterId: d.characterId, eraId: d.eraId, savedAt: d.savedAt } : null;
    });
  }
}
