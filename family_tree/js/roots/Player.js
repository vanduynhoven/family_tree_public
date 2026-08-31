// ── Item catalog — descriptions, use effects, tooltips ───
// Shared by Player (useItem) and UI (tooltip).
// desc: what the item is / where it came from (kid-friendly)
// useLabel: what eating/using it does (shown in toast + tooltip)
// heal / stamina: numeric effects applied on use
export const ITEM_INFO = {
  // ── Fish ────────────────────────────────────────────────
  perch:        { desc: 'A small striped fish from the local river. Tasty fried with butter.', useLabel: 'Eat — restores +15 HP',           heal: 15 },
  bream:        { desc: 'A silvery flat fish. Common in Dutch rivers and ponds.',               useLabel: 'Eat — restores +15 HP',           heal: 15 },
  carp:         { desc: 'A big golden-brown carp. Very filling if you can cook it right.',      useLabel: 'Eat — restores +20 HP',           heal: 20 },
  eel:          { desc: 'A slippery dark eel from the river. Smoked eel is a Dutch delicacy.',  useLabel: 'Eat — restores +15 HP',           heal: 15 },
  flying:       { desc: 'A glittery blue flying fish from the open ocean. Rare!',               useLabel: 'Eat — restores +20 HP',           heal: 20 },
  walleye:      { desc: 'A Minnesota walleye with glassy yellow eyes. Grandpa\'s favourite.',   useLabel: 'Eat — restores +25 HP',           heal: 25 },
  bass:         { desc: 'A green-black bass from the Minnesota lake. Firm and tasty.',          useLabel: 'Eat — restores +20 HP',           heal: 20 },
  pike:         { desc: 'A big pike with a pointed snout. Takes skill to catch — worth it!',   useLabel: 'Eat — restores +30 HP',           heal: 30 },
  // ── Crops & food ────────────────────────────────────────
  wheat:        { desc: 'Golden wheat harvested from the Brabant fields in 1539.',              useLabel: 'Eat — restores +20 Stamina',      stamina: 20 },
  tulip:        { desc: 'A beautiful Dutch tulip from the Golden Age flower market.',           useLabel: 'Smell — restores +10 Stamina',    stamina: 10 },
  rye:          { desc: 'Rye grain from the Napoleonic-era fields. Tough times, tough grain.',  useLabel: 'Eat — restores +15 Stamina',      stamina: 15 },
  potato:       { desc: 'A big Brabant potato from 1872. Mashed potatoes tonight!',            useLabel: 'Eat — restores +25 Stamina',      stamina: 25 },
  corn:         { desc: 'Minnesota sweet corn from Grandpa\'s farm. Straight off the cob!',    useLabel: 'Eat — restores +20 Stamina',      stamina: 20 },
  tomato:       { desc: 'A ripe tomato from the 1984 garden. Warm from the sun.',              useLabel: 'Eat — restores +10 HP',           heal: 10 },
  coffee:       { desc: 'A strong coffee bean from 2020. The good stuff from the family café.', useLabel: 'Drink — restores +40 Stamina',   stamina: 40 },
  boterkoek:    { desc: 'Anna\'s Dutch butter cake recipe, carried from Boekel to Minnesota.', useLabel: 'Eat — restores +20 HP +30 Stamina', heal: 20, stamina: 30 },
  smoked_garlic:{ desc: 'Applewood-smoked garlic from Henk\'s market stall on the Grote Markt.', useLabel: 'Eat — restores +8 HP',         heal: 8 },
  // ── Quest / key items (no use effect — journal/gate items) ───────────
  family_seal:      { desc: 'The Van Duinhoven family seal from 1539. Proves who you are across time.',          useLabel: 'Key item — unlocks the next era' },
  prayer_book:      { desc: 'A well-worn Catholic prayer book from the Dutch Golden Age. Full of family names.', useLabel: 'Key item — unlocks the next era' },
  birth_record:     { desc: 'A Latin birth record from 1799. The priest wrote every name very carefully.',       useLabel: 'Key item — unlocks the next era' },
  train_ticket:     { desc: 'A train ticket from 1872. The first step on a very long journey to America.',       useLabel: 'Key item — unlocks the next era' },
  immigration_papers:{ desc: 'The papers that let Johan\'s family into America in 1950. Without these, no you!', useLabel: 'Key item — unlocks the next era' },
  floppy_disk:      { desc: 'A 1984 floppy disk. Holds the family tree database — all 449 ancestors.',          useLabel: 'Key item — unlocks the next era' },
  courthouse_record:{ desc: 'The courthouse record that changed the family name spelling. History in one stroke.',useLabel: 'Key item — story clue' },
  marriage_record:  { desc: 'A marriage record from 1858. Two Van Duijnhoven brothers married two Verwegen sisters the same year!', useLabel: 'Key item — story clue' },
  // ── Fishing curiosities (no use effect) ─────────────────
  old_boot:    { desc: 'Someone\'s old boot from the bottom of a 1539 river. Very old. Very smelly.',             useLabel: 'No use — just a curiosity' },
  voc_coin:    { desc: 'A VOC trading company coin from 1660. The Dutch East India Company was everywhere!',      useLabel: 'No use — collectible' },
  fr_button:   { desc: 'A button from a French soldier\'s coat, 1799. Someone left it in the river.',            useLabel: 'No use — collectible' },
  iron_gear:   { desc: 'An iron gear that fell into the canal near the factory in 1872.',                         useLabel: 'No use — collectible' },
  flotsam:     { desc: 'A piece of driftwood from the Atlantic crossing. A memory of the journey.',               useLabel: 'No use — collectible' },
  old_lure:    { desc: 'An old fishing lure from a Minnesota lake. Somebody lost their best one.',                useLabel: 'No use — collectible' },
  retro_lure:  { desc: 'A 1984 fishing lure. Neon colours — very fashionable at the time.',                      useLabel: 'No use — collectible' },
  smart_buoy:  { desc: 'A modern GPS smart buoy from 2020. Tracks fish with WiFi. Welcome to the future.',       useLabel: 'No use — collectible' },
  old_coin:    { desc: 'An old Dutch coin from the Leidsevaart canal. Could be hundreds of years old!',          useLabel: 'No use — collectible' },
};

/** Return a formatted tooltip string for an inventory item */
export function itemTooltip(item) {
  const info = ITEM_INFO[item.id];
  const count = (item.count || 1) > 1 ? ` ×${item.count}` : '';
  if (!info) return `${item.label}${count}`;
  return `${item.label}${count}\n${info.desc}\n\n💡 ${info.useLabel}`;
}

// ═══════════════════════════════════════════════════════════
//  Player — movement, attack, fishing, inventory, stats
// ═══════════════════════════════════════════════════════════
import { Entity } from './Entity.js';
import { TILE, drawPlayer } from './Renderer.js';

export class Player extends Entity {
  constructor(x, y, charConfig = {}) {
    super(x, y, TILE * 0.52, TILE * 0.72);
    this.speed      = 180;
    this.hp         = 100;
    this.maxHp      = 100;
    this.stamina    = 100;
    this.maxStamina = 100;
    this.inventory      = [];   // max 12 slots
    this.collectedFacts = [];   // { npcId, name, text }
    this.walkCycle      = 0;
    this.hurtTimer      = 0;
    this.swingTimer     = 0;
    this.fishTimer      = 0;    // >0 = bobber in water
    this.fishDipped     = false;
    this.fishWindowSecs = 0.7;
    this.bobberX        = 0;
    this.bobberY        = 0;
    this.pose           = 'idle'; // idle | reading | sleeping | pointing | surprised

    // Appearance from CharacterData
    this.hairColor = charConfig.hairColor || '#c07830';
    this.bodyColor = charConfig.bodyColor || '#3060a0';
    this.skinColor = charConfig.skinColor || '#f0c080';
  }

  get inventoryFull() { return this.inventory.length >= 12; }
  hasItem(id)         { return this.inventory.some(i => i.id === id); }
  countItem(id)       { return this.inventory.find(i => i.id === id)?.count ?? 0; }

  collectItem(item) {
    if (!item) return false;
    // Check if item is stackable (most items are; key/quest items are not)
    const existing = this.inventory.find(i => i.id === item.id);
    if (existing) {
      existing.count = (existing.count || 1) + 1;
      return true;
    }
    if (this.inventoryFull) return false;
    this.inventory.push({ ...item, count: 1 });
    return true;
  }

  removeItem(id, count = 1) {
    const slot = this.inventory.find(i => i.id === id);
    if (!slot) return false;
    slot.count = (slot.count || 1) - count;
    if (slot.count <= 0) this.inventory = this.inventory.filter(i => i.id !== id);
    return true;
  }

  /** Use an item from inventory. Returns { used, effect } or null if not usable. */
  useItem(id) {
    const item = this.inventory.find(i => i.id === id);
    if (!item) return null;

    const fx = ITEM_INFO[id];
    if (!fx?.heal && !fx?.stamina) return { used: false, reason: 'no effect' };

    if (fx.heal)    this.heal(fx.heal);
    if (fx.stamina) this.restoreStamina(fx.stamina);
    this.removeItem(id, 1);
    return { used: true, label: fx.useLabel, emoji: item.emoji };
  }

  takeDamage(amt) {
    if (this.hurtTimer > 0) return;
    this.hp = Math.max(0, this.hp - amt);
    this.hurtTimer = 1.2;
    const el = document.getElementById('rt-damage-flash');
    if (el) { el.style.background = 'rgba(255,0,0,0.4)'; setTimeout(() => el.style.background = '', 200); }
  }

  heal(amt)           { this.hp = Math.min(this.maxHp, this.hp + amt); }
  restoreStamina(amt) { this.stamina = Math.min(this.maxStamina, this.stamina + amt); }

  drainStamina(amt) {
    this.stamina = Math.max(0, this.stamina - amt);
    return this.stamina > 0;
  }

  /** Returns arc hitbox in world coords for current swing */
  getSwingHitbox() {
    const reach = TILE * 1.3, cx = this.cx, cy = this.cy;
    switch (this.facing) {
      case 'right': return { x: cx,         y: cy - TILE*0.3, w: reach,    h: TILE*0.6 };
      case 'left':  return { x: cx - reach, y: cy - TILE*0.3, w: reach,    h: TILE*0.6 };
      case 'up':    return { x: cx - TILE*0.3, y: cy - reach, w: TILE*0.6, h: reach    };
      default:      return { x: cx - TILE*0.3, y: cy,         w: TILE*0.6, h: reach    };
    }
  }

  hitboxOverlaps(hb, entity) {
    return hb.x < entity.x + entity.w && hb.x + hb.w > entity.x &&
           hb.y < entity.y + entity.h && hb.y + hb.h > entity.y;
  }

  startFishing(bx, by) {
    this.fishTimer  = 2 + Math.random() * 3;
    this.fishDipped = false;
    this.bobberX    = bx;
    this.bobberY    = by;
    this.pose = 'pointing';
    return true;
  }

  tryReel() {
    if (this.fishTimer <= 0) return 'idle';
    if (this.fishDipped) {
      this.fishTimer  = 0;
      this.fishDipped = false;
      this.pose       = 'idle';
      return 'caught';
    }
    // Pressed too early — miss, reset
    this.fishTimer  = 0;
    this.pose       = 'idle';
    return 'miss';
  }

  update(dt, keys, world) {
    if (this.hurtTimer > 0) this.hurtTimer -= dt;
    if (this.swingTimer > 0) this.swingTimer -= dt;

    // Stamina recharge when stationary
    if (!keys.up && !keys.down && !keys.left && !keys.right) {
      this.stamina = Math.min(this.maxStamina, this.stamina + dt * 8);
    }

    // Fishing tick
    if (this.fishTimer > 0) {
      this.fishTimer -= dt;
      // Random dip trigger in second half of wait
      if (!this.fishDipped && this.fishTimer < 2 && Math.random() < dt * 0.8) {
        this.fishDipped = true;
        setTimeout(() => { this.fishDipped = false; this.fishTimer = 0; this.pose = 'idle'; },
                   this.fishWindowSecs * 1000);
      }
      return; // no movement while fishing
    }

    // Movement
    let dx = 0, dy = 0;
    if (keys.left)  dx = -1;
    if (keys.right) dx =  1;
    if (keys.up)    dy = -1;
    if (keys.down)  dy =  1;
    if (dx && dy)   { dx *= 0.707; dy *= 0.707; }

    if (dx < 0) this.facing = 'left';
    if (dx > 0) this.facing = 'right';
    if (dy < 0) this.facing = 'up';
    if (dy > 0) this.facing = 'down';

    if (dx !== 0 || dy !== 0) this.walkCycle += dt * 9;

    const spd = this.speed * dt;
    const nx  = this.x + dx * spd;
    const ny  = this.y + dy * spd;
    const pad = 3;

    // ── Foot-based collision ──────────────────────────────
    // Only the bottom ~35% of the sprite (where the feet are) checks for
    // solid tiles. The head and torso can overlap tree canopies, roof tiles,
    // and building tops — matching standard top-down RPG behaviour.
    const footTop    = this.y + this.h * 0.65;  // top edge of foot hitbox
    const footBottom = this.y + this.h - pad;   // bottom edge

    if (dx !== 0 &&
        !world.solidAt(nx + pad,            footTop) &&
        !world.solidAt(nx + this.w - pad,   footTop) &&
        !world.solidAt(nx + pad,            footBottom) &&
        !world.solidAt(nx + this.w - pad,   footBottom)) {
      this.x = nx;
    }

    const newFootTop    = ny + this.h * 0.65;
    const newFootBottom = ny + this.h - pad;

    if (dy !== 0 &&
        !world.solidAt(this.x + pad,          newFootTop) &&
        !world.solidAt(this.x + this.w - pad, newFootTop) &&
        !world.solidAt(this.x + pad,          newFootBottom) &&
        !world.solidAt(this.x + this.w - pad, newFootBottom)) {
      this.y = ny;
    }
  }

  draw(ctx, ox, oy, frame) {
    drawPlayer(ctx, this.x - ox, this.y - oy, {
      facing:    this.facing,
      walkCycle: this.walkCycle,
      hurt:      this.hurtTimer > 0,
      hairColor: this.hairColor,
      bodyColor: this.bodyColor,
      skinColor: this.skinColor,
      pose:      this.pose,
    });
  }
}
