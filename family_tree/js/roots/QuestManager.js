// ═══════════════════════════════════════════════════════════
//  QuestManager — per-character quest state machine
//  Quests are triggered by EventBus events from Game.js
// ═══════════════════════════════════════════════════════════

const QUEST_DEFS = {

  // Raven — collect 8 Dutch words, one per era
  learning_dutch: {
    id: 'learning_dutch', title: 'Learning Dutch',
    character: 'raven',
    steps: [
      { id:'word_era0', era:0, trigger:'dutch_word_found', eraTarget:0, desc:'Find the Dutch word in Era 0 (1539)' },
      { id:'word_era1', era:1, trigger:'dutch_word_found', eraTarget:1, desc:'Find the Dutch word in Era 1 (1660)' },
      { id:'word_era2', era:2, trigger:'dutch_word_found', eraTarget:2, desc:'Find the Dutch word in Era 2 (1799)' },
      { id:'word_era3', era:3, trigger:'dutch_word_found', eraTarget:3, desc:'Find the Dutch word in Era 3 (1872)' },
      { id:'word_era4', era:4, trigger:'dutch_word_found', eraTarget:4, desc:'Find the Dutch word in Era 4 (1950)' },
      { id:'word_era5', era:5, trigger:'dutch_word_found', eraTarget:5, desc:'Find the Dutch word in Era 5 (1955)' },
      { id:'word_era6', era:6, trigger:'dutch_word_found', eraTarget:6, desc:'Find the Dutch word in Era 6 (1984)' },
      { id:'word_era7', era:7, trigger:'dutch_word_found', eraTarget:7, desc:'Find the Dutch word in Era 7 (2020)' },
    ],
  },

  // Starling — collect 8 era treasures
  youngest_voyager: {
    id: 'youngest_voyager', title: 'The Youngest Voyager',
    character: 'starling',
    steps: [
      { id:'treasure_era0', trigger:'item_collected', itemTarget:'pebble',        desc:'Find the smooth pebble (Era 0)' },
      { id:'treasure_era1', trigger:'item_collected', itemTarget:'dried_tulip',   desc:'Find the dried tulip (Era 1)' },
      { id:'treasure_era2', trigger:'item_collected', itemTarget:'copper_coin',   desc:'Find the copper coin (Era 2)' },
      { id:'treasure_era3', trigger:'item_collected', itemTarget:'iron_bolt',     desc:'Find the iron bolt (Era 3)' },
      { id:'treasure_era4', trigger:'item_collected', itemTarget:'driftwood',     desc:'Find the driftwood plank (Era 4)' },
      { id:'treasure_era5', trigger:'item_collected', itemTarget:'corn_husk_doll',desc:'Find the corn husk doll (Era 5)' },
      { id:'treasure_era6', trigger:'item_collected', itemTarget:'cassette_tape', desc:'Find the cassette tape (Era 6)' },
      { id:'treasure_era7', trigger:'item_collected', itemTarget:'usb_drive',     desc:'Find the USB drive (Era 7)' },
    ],
  },

  // Charlotte — trace name spellings
  the_name: {
    id: 'the_name', title: 'The Name',
    character: 'charlotte',
    steps: [
      { id:'spelling_1539', trigger:'npc_talked', npcTarget:'@I001@',    desc:'Learn the original name from Dirck (Era 0)' },
      { id:'spelling_1799', trigger:'npc_talked', npcTarget:'@I020@',    desc:'See the French-era spelling (Era 2)' },
      { id:'spelling_1984', trigger:'npc_talked', npcTarget:'@I080@',    desc:'Get the courthouse record from Wisconsin (Era 6)' },
      { id:'motto',         trigger:'npc_talked', npcTarget:'@I001@_2',  desc:'Learn the family motto from Dirck' },
    ],
  },

  // Tenley — women of the line
  womens_line: {
    id: 'womens_line', title: "The Women's Line",
    character: 'tenley',
    steps: [
      { id:'meet_anna_1906', trigger:'npc_talked', npcTarget:'@I042@',  desc:'Meet Marianus and ask about Anna (Era 3)' },
      { id:'meet_geertruda', trigger:'npc_talked', npcTarget:'@I031@',  desc:'Meet Geertruda Verwegen (Era 2)' },
      { id:'meet_anna_ship', trigger:'npc_talked', npcTarget:'@I061@',  desc:'Talk to Anna on the ship (Era 4)' },
      { id:'gen7_women',     trigger:'npc_talked', npcTarget:'@I091@',  desc:'Talk to Raven in Era 7' },
    ],
  },

  // Knoxley — find the deep roots
  deep_roots: {
    id: 'deep_roots', title: 'The Deep Roots',
    character: 'knoxley',
    steps: [
      { id:'meet_dirck',     trigger:'npc_talked', npcTarget:'@I001@',         desc:'Get Dirck to name his father (Era 0)' },
      { id:'stone_1',        trigger:'item_collected', itemTarget:'ancient_stone_1', desc:'Find ancient stone 1 (Era 0)' },
      { id:'stone_2',        trigger:'item_collected', itemTarget:'ancient_stone_2', desc:'Find ancient stone 2 (Era 0)' },
      { id:'stone_3',        trigger:'item_collected', itemTarget:'ancient_stone_3', desc:'Find ancient stone 3 (Era 0)' },
      { id:'stone_4',        trigger:'item_collected', itemTarget:'ancient_stone_4', desc:'Find ancient stone 4 (Era 0)' },
      { id:'hidden_era',     trigger:'portal_activated', eraTarget:-1,              desc:'Bring all 4 stones to the Ancient Shrine' },
    ],
  },

  // Isabella — the crossing
  the_crossing: {
    id: 'the_crossing', title: 'The Crossing',
    character: 'isabella',
    steps: [
      { id:'young_johan', trigger:'npc_talked', npcTarget:'@I042@',  desc:'Meet Marianus and ask about young Johan (Era 3)' },
      { id:'ship_johan',  trigger:'npc_talked', npcTarget:'@I060@',  desc:'Talk to Johan on the ship (Era 4)' },
      { id:'ship_anna',   trigger:'npc_talked', npcTarget:'@I061@',  desc:'Talk to Anna on the ship (Era 4)' },
      { id:'all_aboard',  trigger:'era_full_npc_talked', eraTarget:4, desc:'Talk to all 7 family members aboard (Era 4)' },
    ],
  },

  // Henry — talk to everyone
  the_reunion: {
    id: 'the_reunion', title: 'The Reunion',
    character: 'henry',
    steps: [
      { id:'halfway',  trigger:'facts_milestone', milestone:65,  desc:'Meet 65 ancestors' },
      { id:'complete', trigger:'facts_milestone', milestone:130, desc:'Meet all 130 ancestors' },
    ],
  },

  // Maxwell — complete all side quests
  day_in_their_life: {
    id: 'day_in_their_life', title: 'A Day in Their Life',
    character: 'maxwell',
    steps: [
      { id:'era0_sidequest', trigger:'sidequest_complete', eraTarget:0, desc:'Complete Era 0 side quest: The Church Roof' },
      { id:'era1_sidequest', trigger:'sidequest_complete', eraTarget:1, desc:'Complete Era 1 side quest: The Lost Tulip' },
      { id:'era2_sidequest', trigger:'sidequest_complete', eraTarget:2, desc:'Complete Era 2 side quest: The Deserter' },
      { id:'era3_sidequest', trigger:'sidequest_complete', eraTarget:3, desc:'Complete Era 3 side quest: The Strike' },
      { id:'era4_sidequest', trigger:'sidequest_complete', eraTarget:4, desc:'Complete Era 4 side quest: The Sick Child' },
      { id:'era5_sidequest', trigger:'sidequest_complete', eraTarget:5, desc:'Complete Era 5 side quest: The Church Picnic' },
      { id:'era6_sidequest', trigger:'sidequest_complete', eraTarget:6, desc:'Complete Era 6 side quest: The Pen Pal' },
      { id:'era7_sidequest', trigger:'sidequest_complete', eraTarget:7, desc:'Complete Era 7 side quest: The Family Zoom' },
    ],
  },
};

// ─────────────────────────────────────────────────────────

export class QuestManager {
  constructor(characterId, eventBus) {
    this.characterId = characterId;
    this.bus         = eventBus;
    this._state      = {};   // questId → { stepId → completed:bool }
    this._unsubs     = [];

    this._initQuests();
    this._bindEvents();
  }

  _initQuests() {
    const char = this.characterId;
    for (const [qid, def] of Object.entries(QUEST_DEFS)) {
      if (def.character && def.character !== char) continue;
      this._state[qid] = {};
      def.steps.forEach(s => { this._state[qid][s.id] = false; });
    }
  }

  _bindEvents() {
    const events = ['npc_talked','item_collected','dutch_word_found','facts_milestone',
                    'sidequest_complete','portal_activated','era_full_npc_talked'];
    events.forEach(ev => {
      const unsub = this.bus.on(ev, data => this._handleEvent(ev, data));
      this._unsubs.push(unsub);
    });
  }

  _handleEvent(ev, data) {
    for (const [qid, def] of Object.entries(QUEST_DEFS)) {
      if (!this._state[qid]) continue;
      for (const step of def.steps) {
        if (this._state[qid][step.id]) continue; // already done
        if (step.trigger !== ev) continue;
        if (this._stepMatches(step, ev, data)) {
          this._state[qid][step.id] = true;
          this.bus.emit('quest_step_done', { questId:qid, stepId:step.id, desc:step.desc });
          if (this.isComplete(qid)) {
            this.bus.emit('quest_complete', { questId:qid, title:def.title });
          }
        }
      }
    }
  }

  _stepMatches(step, ev, data) {
    switch (ev) {
      case 'npc_talked':          return step.npcTarget && data?.npcId === step.npcTarget;
      case 'item_collected':      return step.itemTarget && data?.itemId === step.itemTarget;
      case 'dutch_word_found':    return step.eraTarget !== undefined && data?.era === step.eraTarget;
      case 'facts_milestone':     return step.milestone !== undefined && data?.count >= step.milestone;
      case 'sidequest_complete':  return step.eraTarget !== undefined && data?.era === step.eraTarget;
      case 'portal_activated':    return step.eraTarget !== undefined && data?.era === step.eraTarget;
      case 'era_full_npc_talked': return step.eraTarget !== undefined && data?.era === step.eraTarget;
      default: return false;
    }
  }

  isComplete(questId) {
    const s = this._state[questId];
    if (!s) return false;
    return Object.values(s).every(Boolean);
  }

  stepsFor(questId) {
    const def = QUEST_DEFS[questId];
    const s   = this._state[questId] || {};
    return (def?.steps || []).map(step => ({ ...step, completed: !!s[step.id] }));
  }

  activeQuests() {
    return Object.keys(this._state).map(qid => ({
      id: qid,
      title:    QUEST_DEFS[qid]?.title || qid,
      steps:    this.stepsFor(qid),
      complete: this.isComplete(qid),
    }));
  }

  serialize()      { return JSON.parse(JSON.stringify(this._state)); }
  restore(data)    { if (data) this._state = data; }

  destroy() { this._unsubs.forEach(u => u()); }
}
