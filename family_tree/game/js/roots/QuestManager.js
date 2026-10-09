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
      { id:'spelling_1660', trigger:'npc_talked', npcTarget:'@I010@',    desc:'See "Van Duijnhoven" written in the Golden Age (Era 1)' },
      { id:'spelling_1799', trigger:'npc_talked', npcTarget:'@I020@',    desc:'See the French-era spelling (Era 2)' },
      { id:'spelling_1984', trigger:'npc_talked', npcTarget:'@I080@',    desc:'Get the courthouse record from Wisconsin (Era 6)' },
    ],
  },

  // Tenley — women of the line
  womens_line: {
    id: 'womens_line', title: "The Women's Line",
    character: 'tenley',
    steps: [
      { id:'meet_anna_1906', trigger:'npc_talked', npcTarget:'@I042@',  desc:'Meet Marianus and ask about Anna (Era 3)' },
      { id:'meet_geertruda', trigger:'npc_talked', npcTarget:'@I931@',  desc:'Meet Geertruda Verwegen (Era 2)' },
      { id:'meet_anna_ship', trigger:'npc_talked', npcTarget:'@I019@',  desc:'Talk to Anna on the ship (Era 4)' },
      { id:'gen7_women',     trigger:'npc_talked', npcTarget:'@I091@',  desc:'Talk to Raven in Era 7' },
    ],
  },

  // Knoxley — find the deep roots
  deep_roots: {
    id: 'deep_roots', title: 'The Deep Roots',
    character: 'knoxley',
    steps: [
      { id:'meet_dirck', trigger:'npc_talked',      npcTarget:'@I001@',           desc:'Talk to Dirck van Duinhoven in 1539 (Era 0)' },
      { id:'stone_1',    trigger:'item_collected',  itemTarget:'ancient_stone_1', desc:'Find Ancient Stone I (hidden in Era 0)' },
      { id:'stone_2',    trigger:'item_collected',  itemTarget:'ancient_stone_2', desc:'Find Ancient Stone II (hidden in Era 0)' },
      { id:'stone_3',    trigger:'item_collected',  itemTarget:'ancient_stone_3', desc:'Find Ancient Stone III (hidden in Era 0)' },
      { id:'stone_4',    trigger:'item_collected',  itemTarget:'ancient_stone_4', desc:'Find Ancient Stone IV (hidden in Era 0)' },
      { id:'oldest_era', trigger:'npc_talked',      npcTarget:'@I002@',           desc:'Speak with Aelken — the oldest known relative' },
    ],
  },

  // Isabella — the crossing
  the_crossing: {
    id: 'the_crossing', title: 'The Crossing',
    character: 'isabella',
    steps: [
      { id:'young_johan', trigger:'npc_talked', npcTarget:'@I042@',  desc:'Meet Marianus and ask about young Johan (Era 3)' },
      { id:'ship_johan',  trigger:'npc_talked', npcTarget:'@I014@',  desc:'Talk to Johan on the ship (Era 4)' },
      { id:'ship_anna',   trigger:'npc_talked', npcTarget:'@I019@',  desc:'Talk to Anna on the ship (Era 4)' },
      { id:'fish_ocean',  trigger:'item_collected', itemTarget:'flying', desc:'Catch a flying fish from the Atlantic Ocean (Era 4)' },
    ],
  },

  // Henry — talk to everyone (milestones scale to actual NPC count)
  the_reunion: {
    id: 'the_reunion', title: 'The Reunion',
    character: 'henry',
    steps: [
      { id:'first_10',  trigger:'facts_milestone', milestone:10,  desc:'Meet your first 10 ancestors' },
      { id:'halfway',   trigger:'facts_milestone', milestone:25,  desc:'Meet 25 ancestors' },
      { id:'complete',  trigger:'facts_milestone', milestone:50,  desc:'Meet 50 ancestors — you\'re becoming a true family historian!' },
    ],
  },

  // Generic Traveller — explore every era, collect one fact from each
  great_journey: {
    id: 'great_journey', title: 'The Great Journey',
    character: 'traveller',
    steps: [
      { id:'era0', trigger:'npc_talked', npcTarget:'@I001@',  desc:'Meet an ancestor in 1539 (Era 0)' },
      { id:'era1', trigger:'npc_talked', npcTarget:'@I010@',  desc:'Meet an ancestor in 1660 (Era 1)' },
      { id:'era2', trigger:'npc_talked', npcTarget:'@I020@',  desc:'Meet an ancestor in 1799 (Era 2)' },
      { id:'era3', trigger:'npc_talked', npcTarget:'@I042@',  desc:'Meet an ancestor in 1872 (Era 3)' },
      { id:'era4', trigger:'npc_talked', npcTarget:'@I014@',  desc:'Meet an ancestor on the ship (Era 4)' },
      { id:'era5', trigger:'npc_talked', npcTarget:'@I023@',  desc:'Meet Peter John in Minnesota (Era 5)' },
      { id:'era6', trigger:'npc_talked', npcTarget:'@I080@',  desc:'Meet Chuck in 1984 (Era 6)' },
      { id:'era7', trigger:'npc_talked', npcTarget:'@I090@',  desc:'Meet Arthur in 2020 (Era 7)' },
    ],
  },

  // Maxwell — complete daily life encounters in every era
  day_in_their_life: {
    id: 'day_in_their_life', title: 'A Day in Their Life',
    character: 'maxwell',
    steps: [
      { id:'era0_crop',    trigger:'item_collected', itemTarget:'wheat',      desc:'Harvest wheat in the 1539 fields (Era 0)' },
      { id:'era1_npc',     trigger:'npc_talked',     npcTarget:'@I010@',      desc:'Talk to Johannes about Golden Age life (Era 1)' },
      { id:'era2_crop',    trigger:'item_collected', itemTarget:'rye',        desc:'Find rye grain in Napoleonic times (Era 2)' },
      { id:'era3_npc',     trigger:'npc_talked',     npcTarget:'@I042@',      desc:'Hear Marianus describe a day on the farm (Era 3)' },
      { id:'era4_fish',    trigger:'item_collected', itemTarget:'flying',     desc:'Catch a flying fish on the Atlantic crossing (Era 4)' },
      { id:'era5_crop',    trigger:'item_collected', itemTarget:'corn',       desc:'Pick corn from Grandpa\'s Minnesota farm (Era 5)' },
      { id:'era6_npc',     trigger:'npc_talked',     npcTarget:'@I080@',      desc:'Ask Chuck what daily life was like in 1984 (Era 6)' },
      { id:'era7_npc',     trigger:'npc_talked',     npcTarget:'@I090@',      desc:'Talk to Arthur about daily life in 2020 (Era 7)' },
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
