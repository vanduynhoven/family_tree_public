# Van Duynhoven Family Tree — Project Status Report

**Generated:** 2026-08-31
**Base:** `/Users/arthur.vanduynhoven/code/private/vanduynhoven/family_tree/vanduynhoven/family_tree/`
**GEDCOM:** `vanduynhoven_family.ged` (GEDCOM 7.0, source v2.0)

---

## GEDCOM STATUS

- **Individuals:** 461 (`@I001@` …)
- **Families:** 152 (`@F001@` …)
- **Generation span:** 9 documented generations. Date range in records runs **1450 → 2026**. Named backbone traced from **Petrus van Duijnhoven (b.1799, Uden)** back through Generation −1/−2 (Petrus Joannis van Duijnhoven × Elisabeth van Boxtel, m.1796) and collateral lines reaching Aarle-Rixtel in the 1600s; deep ancestor chains (van de Weyer / Biemans / van den Elsen) now touch the mid-1500s.
- **Most recent additions (this research wave, Aug 30–31):**
  - **Gerarda Maria (@I016@, b.1919):** fate RESOLVED — DEAT **30 Apr 2002, Velp**, via Heemkundekring Weerderheem bidprentje 038658. *Incorporated in GEDCOM.*
  - **Marinus (@I017@, b.1920):** death **2014** confirmed via bidprentje (Heemkundekring Zeeland). *Incorporated.*
  - Cornelissen × Werts siblings (@I434@ Johanna, @I435@ Mathias, @I436@ Ida) added to `@F141@`.
  - Jaspers × Verwegen: Adriana Verwegen (@I260@) DEAT corrected to **28 Jan 1896, Uden** (was erroneously "~1865"); "remarried 1868" claim withdrawn.
  - Joost van de Weyer line pushed back a generation: Mathias van de Weyer (@I437@), Judocus Biemans (@I438@) + six siblings of Ida (@I439@–@I444@) added.
  - 4 death dates in the 2002/2014 range now present.

### Known open gaps (all currently unresolved)
1. **Carolyn Kay × Craig Wilberts children** (`@F053@`, no CHIL) — living/private, no public records; family contact only.
2. **Marinus's father-line spouses / Vervoort grandparents** — parents of Johannes Vervoort (@I505@) & Barbara van der Brugge (@I506@) not yet found.
3. **Cornelis Verwegen (@I497@) parentage** — no birth akte links him to `@F026@`; deliberately NOT linked.
4. **Johanna van der Heijden (@I002@) death** — "ABT 1875" estimate stands; no matching civil record found (may have died outside Uden).
5. **7 "blocked" siblings of Johan (@I014@)** — Gerardus 1909, Hubertus 1911, Johanna Maria 1913, Antonius 1916 etc. — fates still being run through the bidprentje index.
6. **Jan van Duijnhoven (@I011@, b.1912) "Oblate friar" lead** — DISCONFIRMED this wave; his actual fate still open.
7. **Marianus × Anna Maria (@F003@) 12 children** — several intermediate children's death/marriage fates remain open (best single source: the Uden/Volkel gezinskaart, partly consulted).
8. **Pre-1811 DTB depth** — Elisabeth van Boxtel's parents, Johannes Verwegen × Mechelina van den Berk marriage, Gen −2 registers.

### Data-hygiene items (spotted, not yet applied)
- **`@I101@` Carolyn** — duplicate `1 FAMS @F053@` line (confirmed still present: 2 occurrences).
- **`@I488@` / `@I497@`** — duplicate Cornelis Verwegen records; merge into one. (Currently only one of the two INDI headers matched on re-scan — verify before merge.)

---

## SITE PAGES

**Top-level HTML (complete unless noted):**

| Page | Status |
|------|--------|
| `index.html` | Complete — main navigator |
| `generation_0_ancestors/index.html` … `generation_7_2000s/index.html` | Complete (Gen 0–7). Gen 5 & Gen 6 recently rebuilt; Gen 6 updated 08-31 |
| `branches/index.html` + `branches/nl/*` (van_der_wijst, verwegen_branch, early_ancestors, dutch_cousins, spouse_families_extended, van_der_heijden_branch, van_leuken_collapse, etc.) | Complete |
| `branches/us/*` (campbell_branch, new_york_branch, wisconsin_branch, other_states) | Complete |
| `branches/international/*` | Complete |
| `timeline.html`, `stories.html`, `changelog.html`, `manifest.html`, `master_count.html` | Complete |
| `search.html`, `family_chart.html`, `visualizations/tree.html`, `visualizations/family_chart.html` | Complete (JS-driven) |
| `learn-dutch.html` | Complete |
| `findagrave.html`, `obituaries.html`, `military.html`, `emigration.html`, `international.html`, `dutch_connections.html`, `related.html` | Complete |
| `verwegen.html`, `cornelissen.html`, `van_den_elzen.html`, `new_york_branch.html`, `wisconsin_branch.html`, `other_states.html` | **Likely OUTDATED / duplicated** — these root-level copies predate the `branches/` reorg (dated Aug 29) and are superseded by `branches/nl/*` and `branches/us/*`. Candidates for redirect or removal. |
| `research/records/*.html` (endogamy, endogamy_network, emigration, master_count, documents, obituaries, findagrave, military) | Complete |
| `game.html` (old top-down game), `game-design.html` (102 KB design doc), `roots.html` (current game) | See GAME section |
| `master_count.html` (root, 310 bytes) | **STUB** — near-empty; real content lives at `research/records/master_count.html` |
| `feedback.html` | Complete (small) |

**Missing pages that should exist:**
- A **dedicated Vervoort line page** (Marinus's wife's family) — researched but no branch page.
- A **"living descendants / privacy" page** documenting why `@F053@` and modern branches are intentionally sparse.
- A **research-provenance / sources index page** surfacing the 177 research `.md` files to site visitors (only `RESEARCH_INDEX.md` exists as markdown).
- **Gen 6 / Gen 7 person detail pages** comparable to `generation_5_1951/peter_john.html` (only Gen 5 has a person-level page).

**Known content issues:**
- Root-level branch pages vs `branches/` copies create **duplicate, drifting content** (two sources of truth for Verwegen/Cornelissen/NY/WI).
- `generation_5_1951/` and `generation_4_1915/` retain `index-static-backup.html` files alongside the live dynamic `index.html` — leftover backups.
- `master_count.html` root stub should redirect to the records copy.

---

## RESEARCH

- **Research files:** **177 markdown files** in `research/` (plus `research/records/` HTML dashboards, `research/ancestors/`, and per-generation research under `generation_5_1951/`).
- **Topics covered:** Dutch civil-registry (BS) & DTB parish sweeps per surname (van Duijnhoven, Verwegen, van den Elzen/Elsen, Cornelissen, van Boxtel, van der Wijst, van der Heijden, van Leuken, van de Weyer, Biemans, Werts, Vervoort); endogamy/consanguinity analysis (incl. 1769 dispensation); emigration & US vital records (MN/WI/NY); Campbell maternal line (US); obituary & Find-A-Grave databases; military records; bidprentje (prayer-card) death index method; news/notable-persons scans.

### Open leads still needing archival (login/scan) access
These are documented as blocked on **BHIC studiezaal / WieWasWie logged-in access or unindexed page scans**, not the public JSON API:
1. **Uden/Volkel Bevolkingsregister / gezinskaart household card for Marianus × Anna Maria (@F003@)** — the single highest-leverage document; would resolve multiple children's fates at once. (Partially consulted for Gerarda; full card not yet pulled.)
2. **Cornelis Verwegen ~1827 Uden birth/doop akte** (settles GAP re @I497@).
3. **Johanna van der Heijden death register 1870–1882**, broadened beyond Uden.
4. **Pre-1811 DTB registers** (Gen −2): Elisabeth van Boxtel parents, Verwegen×van den Berk marriage.
5. **Bakel DTB scans** for Mathias van de Weyer (~1740s baptism) and Judocus Biemans (~1735–1750) — to parent the new deep lines.
6. Unindexed scans flagged in COLLATERAL_LINES_2: Joannes Cornelissen ~1750, Willemijn van de Meulenhof, Cornelis van den Elsen (Boekel), Henricus Peters van Boxtel, Willem Werts parents.
7. **US: Morris Van Duynhoven obituary (2014, Chaska Herald)**, MN marriage records for the 4 Gen-5 siblings, St. Brendan's (New Ulm) sacramental records; 1960 US Census opens 2032.

### Confirmed findings vs incorporation status
- **Gerarda (d.2002 Velp) and Marinus (d.2014):** confirmed AND already written into the GEDCOM (verified `2 DATE 30 APR 2002` on `@I016@`). No pending write.
- **Jaspers/Verwegen death correction & van de Weyer generation:** per the collateral-lines log, already added to GEDCOM.
- **Net:** the current wave's confirmed findings appear incorporated; remaining research is either unresolved (open gaps above) or blocked on archive access. The main *un-applied* items are the two **data-hygiene cleanups** (duplicate `@I101@` FAMS line; Cornelis Verwegen dup records).

---

## GAME (roots.html)

**Architecture:** ES-module engine loaded via single entry `js/roots/Game.js`; ~18 modules (Engine, World, Renderer, Player, Enemy, NPC, NpcData, EraData, QuestManager, Music, SaveManager, UI, CharacterData, EventBus, Entity, DroppedItem…). Portrait-canvas game (`#rt-canvas`) with rotate hint for mobile.

- **Eras:** **9** (id 0–8): 1539 Aarle-Rixtel → 1660 Dutch Golden Age → 1799 Napoleonic Uden → 1872 Industrial Noord-Brabant → 1950 Emigrant Ship → 1955 Moorhead MN → 1984 Wisconsin & Netherlands → 2020 Minnesota & Haarlem → 2026 Present Day (Haarlem & Mankato). Each era (0–6) has a **gate item** (Family Seal, Prayer Book, Birth Record, Train Ticket, Immigration Papers, Boterkoek Recipe, Floppy Disk); eras 7–8 are gate-less.
- **Enemies:** ~19 era-themed types (tax_collector, plague_rat, inquisitor, spanish_soldier, u_boat, mccarthyist, tornado, cold_war_spy, computer_virus, misinfo_bot…), several `peaceful` steal-type NPCs.
- **NPCs:** **28** defined in `NpcData.js` (talkable, with friendship hearts + talk counts persisted).
- **Quests:** **52** quest entries in `QuestManager.js`, including Raven's Dutch-vocabulary collection quest.
- **Playable characters:** **9** — Time Traveller + 8 named family kids (Raven, Starling, Charlotte, Tenley, Knoxley, Isabella, Henry, Maxwell).
- **Save system:** `SaveManager` — localStorage, **3 slots** (`vdh_roots_v1_slot{0|1|2}`), version-gated (v1, mismatched saves discarded). Persists character, era, screen/pos, HP/stamina, inventory, collected facts, quest state, visited/portal screens, NPC friendship & talk counts, unlocked eras, era-visit music-variant counters, and collected Dutch words.
- **Systems present:** fishing (era-specific catch tables — Perch/Bream/Carp/Walleye/Bass/Pike/Leidsevaart Pike etc.), item gate-unlocking, A/B era music variants, GEDCOM-fact collection tied to real ancestors, kid-friendly dialogue variants (loc = ship/us/nl).

**Known issues:**
- Sepia **portrait placeholder** in `UI.js:825` (character portraits not final).
- **ROCK placeholder** props in `EraData.js:2176` ("Old boxes and items").
- An **older, separate game** exists (`game.html` + `js/game/*`, top-down) parallel to `roots.html` + `js/roots/*` — two game codebases; the older one is likely deprecated but not removed.

**Potential improvements:**
- Replace portrait/prop placeholders with real sprite art (sprite sheets already present under `assets/sprites/`).
- Retire or clearly archive the legacy `js/game/*` codebase to avoid confusion.
- Add a save-version migration path (currently mismatched saves are silently discarded).
- Surface collected GEDCOM facts into a persistent in-game "family codex" screen.
- Eras 7–8 have no gate item / boss — consider a capstone objective for narrative closure.

---

## TOP 10 HIGHEST-VALUE NEXT TASKS

1. **Pull the Uden/Volkel gezinskaart household card for Marianus × Anna Maria (@F003@).** Single document likely resolving several of the 12 children's fates at once. *(ARCHIVE — BHIC/WieWasWie login)*
2. **Apply the two data-hygiene fixes:** de-duplicate `@I101@`'s `FAMS @F053@` line and merge the `@I488@`/`@I497@` Cornelis Verwegen records. *(DIGITAL — local GEDCOM edit; quick, zero-risk)*
3. **Consolidate duplicate branch pages:** redirect/remove root-level `verwegen.html`, `cornelissen.html`, `van_den_elzen.html`, `new_york_branch.html`, `wisconsin_branch.html`, `other_states.html` in favor of `branches/*`. *(DIGITAL)*
4. **Finish the "7 blocked siblings of Johan" bidprentje sweep** (Gerardus 1909, Hubertus 1911, Johanna Maria 1913, Antonius 1916…) using the proven prayer-card method. *(DIGITAL — OpenArchieven API)*
5. **Resolve Vervoort grandparents** (parents of Johannes Vervoort @I505@ & Barbara van der Brugge @I506@) and build a Vervoort branch page. *(DIGITAL first, ARCHIVE if unindexed)*
6. **Find Cornelis Verwegen's ~1827 Uden birth/doop akte** to confirm-or-refute the `@F026@` link. *(ARCHIVE — akte scan/login)*
7. **Broaden Johanna van der Heijden (@I002@) death search** beyond Uden (Veghel, Boekel, Zeeland, Nistelrode) via WieWasWie by parents/spouse. *(ARCHIVE — WieWasWie login)*
8. **Obtain Morris Van Duynhoven's 2014 Chaska Herald obituary** + MN marriage records for the 4 Gen-5 siblings (St. Brendan's, New Ulm). *(DIGITAL/OFFLINE — newspaper archive + diocese contact; some US archive access)*
9. **Remove stale backups & stub:** delete `generation_*/index-static-backup.html` and redirect the 310-byte `master_count.html` stub to `research/records/master_count.html`. *(DIGITAL)*
10. **Game polish:** replace the sepia portrait + ROCK prop placeholders with real sprite art and archive the legacy `js/game/*` codebase. *(DIGITAL)*

*Legend: ARCHIVE = needs logged-in BHIC/WieWasWie or physical/scan access; DIGITAL = doable from public web/API or local files.*
