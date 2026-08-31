# Open Genealogy Gaps — Research Round 2

_Researched 2026-08-31. Sources: OpenArchieven public JSON API (api.openarchieven.nl), web search._

**Outcome: 0 GEDCOM changes.** No gap produced evidence that meets the standard for
recording (confirmed source tied to the correct individual). All candidates were
either unconfirmable, privacy-restricted (living / <100-year records), or contradicted
by existing evidence. Per the project rule, conflicting/inferred data is documented
here and left OUT of the GEDCOM until resolved.

---

## GAP 1 — Carolyn Kay van Duynhoven (@I101@) × Craig Wilberts (@I201@) children — NOT FOUND

**Current GEDCOM state:** `@F053@` = Craig Wilberts (@I201@) × Carolyn Kay (@I101@),
**no CHIL**. Marriage ~1978–1985 in MN (family-sourced, no record on file).

**Searched:**
- Web: `Craig Wilberts Carolyn Van Duynhoven Minnesota children Green Isle Sibley County`
- Web: `Craig Wilberts obituary Minnesota Wilberts family Sibley County`

**Found:** Nothing usable. Results were unrelated Sibley County news (the 2025 Boelter
manhunt near Green Isle) and generic Minnesota obituary index pages. No Wilberts
obituary, no birth/marriage record, no genealogy profile for this couple surfaced.

**Assessment:** Any children of a couple married ~1978–1985 would be born ~1979–1995 —
**living private individuals** whose vital records are not publicly indexed. This gap
cannot be closed from public online sources.

**Lead / recommended next step:** Family contact only. Ask Arthur / the Green Isle MN
relatives directly for Carolyn & Craig's children's names. USCIS/vital records won't help
for living people.

**Data-hygiene note (unrelated to this gap):** `@I101@` currently has a **duplicate
`1 FAMS @F053@` line**. Harmless but worth de-duplicating in a future cleanup pass.

---

## GAP 2 — Gerarda Maria van Duijnhoven (@I016@, b.25 Sep 1919 Uden) fate — NOT RESOLVED

**Current GEDCOM state:** @I016@, 10th child of Marianus × Anna Maria van den Elzen.
Birth 25 Sep 1919 Uden. No death/marriage recorded.

**Searched (OpenArchieven):**
- `Gerarda Maria van Duijnhoven` + `eventtype=overlijden` → **0 hits**
- `Gerarda van Duijnhoven` (all) → 23 hits

**Found / matches:**
- **Birth confirmed:** BS Geboorte, Uden, **25 Sep 1919** (`bhi:d4551aed-951c-61cc-d4fd-407457628ee5`)
  + 3 matching Uden population-register (Bevolkingsregister) entries dated 25-9-1919.
  This exactly matches @I016@ — her existing birth date is corroborated by a civil record.
- **Possible lead — Veghel move:** two Bevolkingsregister registrations dated **28 Oct 1929, Veghel**
  (`bhi:9ebd4c5c…`, `bhi:f8c1a5e4…`) — could indicate the family (or Gerarda) registered in
  Veghel around 1929. Unverified as our person.
- **Death candidates (NONE confirmable as our Gerarda):** Oploo 1946, Oss 1944,
  Nijmegen 1966, Eindhoven 1957. The API's search response does not expose per-person
  parent/spouse fields, so none can be tied to our Gerarda without opening each akte scan
  (login required) or a WieWasWie cross-check.

**Assessment:** Born 1919 → likely died after ~1970, i.e. **within the 100-year Dutch
privacy window**, so a civil death record may not be openly available. Not resolved.

**Leads / next steps:**
1. Fetch the 1929 Veghel Bevolkingsregister entries (verify names/household) — could place
   the family and give a residence trail.
2. WieWasWie death search for `Gerarda Maria van Duijnhoven` 1919-parent Marianus.
3. Bidprentjes (memorial-card) search on OpenArchieven — often covers 20th-c. deaths.

---

## GAP 3 — Marinus van Duijnhoven (@I017@, b.10 Nov 1920 Uden) fate — NOT RESOLVED

**Current GEDCOM state:** @I017@, 11th child of Marianus × Anna Maria van den Elzen.
Birth 10 Nov 1920 Uden. No death/marriage recorded.

**Searched (OpenArchieven):**
- `Marinus van Duijnhoven` + `eventtype=overlijden` → **0 hits**
- `Marinus van Duijnhoven` (all) → 90 hits (name is common across Brabant; most are the
  Berghem/Erp/Mook Marinus lines, not ours). No hit is anchored to a 1920 Uden birth or to
  Marianus/Anna Maria as parents in the visible metadata.

**Assessment:** Same privacy-window problem as GAP 2 — born 1920, likely died post-~1970.
The `Marinus` name is also heavily reused in the region, so name-only hits are unreliable.
Not resolved.

**Leads / next steps:**
1. WieWasWie: `Marinus van Duijnhoven Boekel/Uden` filtered to parent = Marianus van Duijnhoven.
2. Uden Bevolkingsregister household card for the Marianus × Anna Maria family — would list
   all children and departure/death annotations in one place. Best single source for both
   GAP 2 and GAP 3.
3. Bidprentjes search.

---

## GAP 4 — Cornelis Verwegen parentage — STILL UNRESOLVED (do NOT link)

**Candidate:** `@I497@` Cornelis Verwegen, b.~1827 Uden, × Hester van Wijhoven
(confirmed via the 1868 Wassenberg marriage akte `bhi:093f9a8d`). A second stub `@I488@`
is the same person (duplicate — flagged below).

**Question:** Is he a child of `@F026@` = Johannes/Joannes Verwegen (@I121@) ×
Mechelina/Michaelina van den Berk (@I122@), married 31 Jan 1819 Uden?

**Checked GEDCOM:** `@F026@` has 15 children on file spanning **1820–1842** (@I004@ Geertruda
1833, plus @I260@–@I269@: Adriana 1820, Ardina 1821, Arnoldus 1822, Petronella 1824,
Antonius 1826, Allegonda 1830, Cornelia 1834, Adrianus 1835, Johanna Maria 1837,
Martinus 1842). **There is a "Cornelia" (1834) but no "Cornelis" among them**, and a
~1827 slot is plausible between Antonius (1826) and Allegonda (1830).

**Searched (OpenArchieven):**
- `Cornelis Verwegen` births/baptisms 1815–1835 Uden. **The only birth hit is 9 Feb 1815
  Uden** (`bhi:7f5ddc3e…`) — and fetching the akte shows it is the **birth of _Gerardus_
  Verwegen, whose FATHER is a Cornelis Verwegen (× Johanna Maria de Groot)**. So that
  Cornelis is an *older, different* Cornelis (an adult father in 1815), NOT our @I497@
  candidate, and it predates the 1819 Johannes×Mechelina marriage — cannot be their child.
- **No birth/baptism record for a Cornelis Verwegen b.~1827 Uden was found.**

**Assessment:** No source links @I497@ to @F026@. Note also the standing
`CORNELIS_VERWEGEN_WASSENBERG.md` / `VERWEGEN_3GEN.md` analysis kept him unlinked. The
1819-marriage patronymic discrepancy referenced in @I497@'s note is now itself resolved
(@I121@'s parents = Arnoldus Verwegen × Adriana Klaassen, per @F173@), but that does NOT
by itself make @I497@ their son. **No FAMC link added** — per project rule, no inferred
parentage without a birth/baptism record naming the parents.

**Leads / next steps:**
1. Find the ~1827 Uden birth/doop akte for Cornelis Verwegen naming his parents — that is
   the single record that would settle it.
2. The 1868 Wassenberg marriage akte (`bhi:093f9a8d`) itself may name Cornelis's own parents
   (bride's grandparents) — worth reading the full scan.
3. **Cleanup:** `@I488@` and `@I497@` are duplicate records for the same Cornelis Verwegen
   (both "father of Joanna Maria Verwegen, × Hester van Wijhoven"). Merge into one.

---

## GAP 5 — Johanna van der Heijden (@I002@) death — NOT FOUND (confirmed absent, not the wrong record)

**Current GEDCOM state:** @I002@, wife of Petrus van Duijnhoven (@I001@), b.13 Oct 1798,
death **ABT 1875** Uden. Note already records that the Uden 1872 death akte (26 Apr 1872,
akte 56) is a **DIFFERENT** Johanna — that one's parents were Antoon van der Heijden ×
Anna van der Rijt and spouse Johannes **van der Pol**. Our Johanna's parents were Joannes
Henrici van der Heijden × Anna Maria Pittens; spouse Petrus van Duijnhoven.

**Searched (OpenArchieven), 1865–1885 window:**
- `Johanna van der Heijden` + `eventtype=overlijden` → no death in Uden/Veghel in range.
- `Johanna van der Heijden` (all) → only a 1880 Waalwijk **birth** (unrelated person).
- Variants `Johanna Heijden`, `Johanna van der Heyden`, `Johanna van der Heijen`
  + deaths 1865–1885 → **none in range**.

**Assessment:** No death record matching our Johanna surfaced in OpenArchieven, and the
previously-flagged wrong record (van der Pol) was correctly avoided. The "ABT 1875" estimate
stands (bounded below by husband Petrus surviving her, d.1882). Not resolved.

**Leads / next steps:**
1. She may have died **outside Uden** (e.g. with a married child) — broaden place; try
   Veghel, Boekel, Zeeland, Nistelrode.
2. WieWasWie / BHIC direct search filtered by parents (Joannes van der Heijden × Anna Maria
   Pittens) or spouse (Petrus van Duijnhoven) rather than by name+place — the akte index at
   BHIC studiezaal is the authoritative source.
3. Cross-check the Uden death register 1870–1882 directly for any "van der Heijden" female
   ~age 77.

---

## Summary table

| Gap | Person | Result | GEDCOM change |
|-----|--------|--------|---------------|
| 1 | Carolyn Kay × Craig Wilberts children | Not found — living/private, no public records | none |
| 2 | Gerarda Maria (b.1919) fate | Birth re-confirmed (Uden 25-9-1919); death unresolved (privacy window) | none |
| 3 | Marinus (b.1920) fate | Unresolved (privacy window; common name) | none |
| 4 | Cornelis Verwegen (@I497@) parentage | No birth akte found; NOT linked to @F026@; found a *different* older Cornelis | none |
| 5 | Johanna van der Heijden (@I002@) death | No matching record; wrong 1872 record correctly avoided; "ABT 1875" stands | none |

## Cross-cutting cleanups spotted (not applied)
- `@I101@` Carolyn: duplicate `1 FAMS @F053@` line.
- `@I488@` and `@I497@`: duplicate Cornelis Verwegen records — merge.

## Highest-leverage single next action
Obtain the **Uden Bevolkingsregister household card for the Marianus van Duijnhoven ×
Anna Maria van den Elzen family** — it would list all 12 children with departure/death
annotations in one document, likely closing GAP 2 and GAP 3 together. (Requires
logged-in BHIC / WieWasWie access, not the public JSON API.)
