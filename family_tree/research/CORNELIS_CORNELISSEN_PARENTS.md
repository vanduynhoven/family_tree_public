# Parents of Cornelis Cornelissen (~1780 Bakel) & Ida van de Weijer

**Research goal:** Find the parents of Cornelis Cornelissen (@I418@, b. ~1780
Bakel en Milheeze) and his wife Ida van de Weijer (@I419@) — the great-great-
grandparents of Anna Maria Cornelissen (Gen 4).

**Result:** BOTH parent couples identified and added to the GEDCOM.

| Person | Father | Mother | Evidence |
|---|---|---|---|
| Cornelis Cornelissen (@I418@) | **Jan Cornelissen** (@I422@) | **Wilhelmina van de Meulenhof** (@I423@) | moderate |
| Ida van de Weijer (@I419@) | **Joost van de Weijer** (@I424@) | **Josina Biemans** (@I425@) | strong |

New GEDCOM families: `@F146@` (Cornelis's parents → child @I418@),
`@F147@` (Ida's parents → child @I419@). FAMC links added to @I418@ / @I419@.

---

## Method

OpenArchieven API (`api.openarchieven.nl/1.0/records/search.json` +
`records/show.json`). Note: the API's `place` parameter is **ignored** by the
search backend — place filtering must be done client-side on the `eventplace`
field. Names are matched fuzzily and the `year_from/year_to` window is loose, so
results were filtered in Python on `eventplace = "Bakel en Milheeze"` and
`relationtype = "Overledene"`.

The decisive sources were the couple's **death records (BS Overlijden)**, which
name the deceased's parents directly.

## Key evidence

### Cornelis Cornelissen — death record (parents named)
- **3 Mar 1858, Bakel en Milheeze** — Overlijdensregister Bakel en Milheeze 1858, akte 12.
- openarchieven: `bhi:0c2777d5-91cc-6935-8aea-7f3cedeb0f93`
  (https://www.openarchieven.nl/bhi:0c2777d5-91cc-6935-8aea-7f3cedeb0f93)
- Named: Overledene **Cornelis Cornelissen**; Vader **Jan Cornelissen**;
  Moeder **Wilhelmina van de Meulenhof**; also lists spouse **Ida van de Weijer**.
- The presence of Ida van de Weijer as his spouse in this record ties it firmly
  to the correct Cornelis. **Evidence: moderate** (single BS Overlijden instance
  naming his parents).

### Ida van de Weijer — death record (parents named, corroborated)
- **21 Jan 1842, Bakel en Milheeze** — Overlijdensregister Bakel en Milheeze 1842, akte 3.
- Instance 1 (BHIC): `bhi:3909870a-2c03-5c99-c400-75564c21a955`
  (https://www.openarchieven.nl/bhi:3909870a-2c03-5c99-c400-75564c21a955)
- Instance 2 (Gemeentearchief Gemert-Bakel, independent index of same event):
  `gmb:E2727BA0-A32B-4747-92C9-5972643DCFB1`
  (https://www.openarchieven.nl/gmb:E2727BA0-A32B-4747-92C9-5972643DCFB1) —
  this copy additionally names husband **Cornelis Cornelissen** as echtgenoot.
- Named in both: Overledene **Ida van de Weijer**; Vader **Joost van de Weijer**;
  Moeder **Josina Biemans**.
- **Evidence: strong** (2 independent index instances, one explicitly linking
  husband Cornelis Cornelissen).

## Corroborating family-unit evidence (already in tree, re-confirmed)
Two children's marriage records confirm the Cornelis × Ida couple:
- **20 Apr 1833, Bakel en Milheeze** — son **Theodorus Cornelissen** m. Maria Werts;
  parents = Cornelis Cornelissen & Ida van de Weijer.
  `gmb:1966D780-375C-4135-AEA9-ED5C821F7A0A`
- **30 Jan 1841, Bakel en Milheeze** — daughter **Johanna Cornelissen** m. Thomas
  Franssen; parents = Cornelis Cornelissen & Ida van de Weijer.
  `bhi:1e1a1e8b-93a0-b283-8aa3-89b348420491`

## Ruled out (different women named "Ida van de Weijer")
- Deurne, d. 1849, dtr of Thomas van de Weijer & Hendrina van den Broek — not ours.
- Deurne, d. 1855, dtr of Servaas van de Weijer & Henrica Bertrams — not ours.
Both wrong parents, wrong place, wrong spouses; excluded.

## Notes / next steps
- Surname "van de Meulenhof" also appears historically as Meulenhof / Molenhof —
  watch for variants when tracing Jan Cornelissen's line further back.
- Death dates found in this research were added to @I418@ (3 Mar 1858) and
  @I419@ (21 Jan 1842).
- Not yet found: baptisms of Cornelis (~1780) and Ida (~1782), and the Cornelis ×
  Ida marriage itself (~1805, likely DTB Trouwen or an early register) — these
  would let the two new parent couples be pushed a further generation back.

_Researched 2026-08-30. Sources: OpenArchieven (BHIC & Gemeentearchief Gemert-Bakel)._
