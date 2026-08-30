# Woutrina van Duijnhoven — parentage (narrowing which Woutrina)

**Goal:** Using Peter van der Voort's 1826 birth record (parents Joannes van der
Voort × Woutrina van Duijnhoven), narrow WHICH Woutrina van Duijnhoven she was —
her birth year (~1795–1810) and her own parents — to disambiguate the two women
of that name found in `WOUTRINA_VD_IDENTIFIED.md`.

**Verdict:** **NOT NARROWABLE from the indexed civil registry.** Woutrina's own
birth/baptism, her marriage to Joannes van der Voort, and any death record naming
her parents are all **absent from the OpenArchieven / BHIC A2A index.** Her
parentage cannot be established from online indexed records; it requires the
scanned 1859 marriage supplement (huwelijksbijlagen) or the original Uden DTB
registers. Evidence strength on parentage: **cannot be determined (no source).**

The endogamy finding of `WOUTRINA_VD_IDENTIFIED.md` is unaffected — it never
depended on her parentage.

## What the 1826 birth record actually contains

`bhi:27776cb5-6989-b032-793f-5adfe84508a0` — BS Geboorte, Uden, 13-9-1826.
Full A2A `show.json` was pulled. It names exactly three persons and their roles:

| Role   | Name                       | Age? | Parents? |
|--------|----------------------------|------|----------|
| Kind   | Peter van der Voort (b. 13-9-1826) | — | — |
| Moeder | Woutrina van Duijnhoven    | **none** | **none** |
| Vader  | Joannes van der Voort      | none | none |

The BHIC birth index does **not** carry the mother's age or her parents — so the
birth record alone cannot date Woutrina or name her parents. (This is typical of
the BHIC A2A extract: only names + roles are indexed, not the ages written in the
akte body.)

## Systematic search for a record that WOULD name her parents (all negative)

All via the OpenArchieven API (`search.json` / `show.json`), 2–3 s throttled.

1. **Her own marriage** (Joannes van der Voort × Woutrina van Duijnhoven, implied
   c. 1820–1826): `name="Woutrina van Duijnhoven" sourcetype="BS Huwelijk"` returns
   **exactly 1 hit — the 1859 record of her SON's wedding** (she is
   "Moeder van de bruidegom"). Her *own* marriage is **not indexed.**
   - The two 3-5-1826 "Joannes Bapt. van der Voort" marriages that looked timed to
     Peter's birth were checked in full: both are the same event with bride
     **Pitronella de Swart** (parents Joannes de Swart × Cornelia Jansen) — a
     different couple, not Woutrina. (`bhi:3a2ed932-…`; `43080482-…` now HTTP 410.)

2. **A death record naming her parents:** a `"Woutrina van Duijnhoven"` +
   `Overlijden` search returns only 4 records, none of which is the elder Woutrina
   dying with parents named:
   - `1d7eeb73…` 11-7-1835 — she is *Moeder* (death of her daughter **Maria van de
     Voort**; confirms the couple, adds no parentage). Verified via `show.json`:
     Overledene Maria van de Voort; Moeder Woutrina van Duijnhoven; Vader Johannes
     van de Voort — no ages, no grandparents.
   - `612d4b30…` 1-7-1865 "Relatie" and `fdf6c733…` 25-2-1834 "Overledene" belong
     to **Woman B** (the van Duijnhoven × van Duijnhoven household) — see
     `WOUTRINA_VD_IDENTIFIED.md`.
   - `91f307fd…` 19-2-1917 is the **granddaughter** named after her.
   She was alive at the 1859 wedding, so her own death is post-1859 — and it is
   simply **not in the index** (a broad post-1859 Uden death scan surfaces
   thousands of unrelated "Woutrina" entries but not her).

3. **Her baptism (pre-1811, DTB Dopen):** THE decisive negative.
   - `name="Woutrina van Duijnhoven" sourcetype="DTB Dopen"` → **0 hits** (any years).
   - `"Woutrina Duijnhoven"` DTB → **0**; `"Woutrina van Duijnhoven" DTB` (all) → **0**.
   - Latin/variant given-name forms all tried, all **0** except unrelated hits:
     `Woutera` → 0, `Wouterke` → 0, `Wouterina` → 0, `Waltera` → 0,
     `Wilhelmina van Duijnhoven` → 6 (none Uden ~1800: they are Maarheeze 1760,
     Aarle-Rixtel 1782/1785 witnesses, Veghel 1806 witness — none is our subject).
   There is **no indexed baptism** for a Woutrina van Duijnhoven in the ~1793–1810
   window anywhere in the BHIC DTB collection.

4. **Web / aggregators:** `"Joannes van der Voort" "Woutrina van Duijnhoven" Uden`
   returns no family reconstruction tying her to parents (genealogieonline hits are
   unrelated van Duijnhoven/van der Voort lines).

### Note on the API `place` filter
The `place=Uden` parameter is **not honoured** by this `search.json` endpoint —
constrained queries returned 6,000–8,000 alphabetically-sorted, unfiltered rows.
Place-narrowing must be done client-side on `eventplace`. This does not change the
negatives above (the name+sourcetype counts are exact and small: 1 marriage,
4 deaths, 0 baptisms).

## Why the parentage can't be narrowed

To pick between "two Woutrinas" you need a record that states either her age
(→ birth year) or her parents. The three record types that carry that
information — her baptism, her marriage, her death — are each **either
unindexed or absent** from OpenArchieven/BHIC for this woman. The 1826 birth and
1835 daughter-death records that DO exist name her only as a parent, with no age
and no grandparents. So the online index is exhausted.

What we CAN still say with confidence (from the existing records): she was the
wife of **Joannes van der Voort**, resident in **Uden**, bore Peter on 13-9-1826
and a daughter Maria (d. 1835), and was still living on 21-5-1859. A mother in
1826 was plausibly born **c. 1795–1806**. That is the tightest bracket the
indexed evidence supports — it does **not** single out one of the two Woutrinas.

## Concrete next step to resolve (off-index)

The answer is almost certainly in the **1859 marriage supplement**
(*huwelijksbijlagen*, akte nr 27, Uden 1859, BHIC toegang 50, inv. 8037): Dutch
marriage files of this period include a certified extract of the groom's birth
record and often of the parents' status, and the akte body itself states each
parent's age/residence. Options:
- View/order the scan: `https://www.bhic.nl/memorix/genealogy/search/deeds/70470602-c8b9-2b5a-e042-f39ff1d68936`
- Or read the original **Uden DTB doopregister ~1795–1806** page-by-page for a
  Woutrina/Woutera d.v. a van Duijnhoven father (the name is unindexed, so it must
  be read manually).
These are image-only sources, not reachable through the A2A index used here.

## GEDCOM impact
**No GEDCOM edit made.** Woutrina remains a collateral in-law-of-in-law with
unconfirmed parents; adding a birth year or parents now would be speculation.
Recommendation stands with `WOUTRINA_VD_IDENTIFIED.md`: keep her as a research
note, do not add a parented INDI node.

## Sources
- `https://www.openarchieven.nl/bhi:27776cb5-6989-b032-793f-5adfe84508a0` (1826 birth of Peter — mother named, no age/parents)
- `https://www.openarchieven.nl/bhi:70470602-c8b9-2b5a-e042-f39ff1d68936` (1859 marriage — parents named, no ages; supplement not indexed)
- `bhi:1d7eeb73-43d8-364d-cb9c-25b186100be5` (1835 death of daughter Maria — confirms couple, no grandparents)
- `bhi:3a2ed932-701c-7aa0-7674-2ab73c94daeb` (3-5-1826 marriage — different couple, van der Voort × de Swart)
- OpenArchieven API `search.json` / `show.json` — name-index counts:
  Woutrina van Duijnhoven → 1 marriage, 4 deaths, **0 baptisms**.
