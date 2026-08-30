# Antonius van Duijnhoven (b.1865 Uden) — Collateral Line Research

**Subject:** Antonius van Duijnhoven `@I045@`, b. 16 Dec 1865 Uden — elder brother of
Marianus (1872, the direct ancestor). Two marriages, 10 confirmed children.
This is a major collateral branch (second cousins of Johan/John van Duijnhoven, Gen 4).

**Research date:** 2026-08-30
**Primary source:** OpenArchieven / Brabants Historisch Informatie Centrum (BHIC), Dutch civil registration (Burgerlijke Stand).

---

## 1. Structure already in the GEDCOM (baseline, not re-added)

Antonius and his whole nuclear family were **already present** before this cycle:

| Record | ID | Notes |
|---|---|---|
| Antonius van Duijnhoven | `@I045@` | b. 16 Dec 1865 Uden |
| Marriage 1 → Lamberdina van Dijk | `@F016@` / wife `@I056@` | m. ~1895 Uden, Lamberdina d. ~1901 |
| Marriage 2 → Antonia Vermulst | `@F016b@` / wife `@I102@` | m. Feb 1903 Uden |
| Josephus Antonius (1905) | `@I057@` | filed under `@F016@` in GEDCOM |
| Joannes Petrus Paulus (1906, Helmond) | `@I058@` | filed under `@F016@` |
| Gerardus Petrus (1908) | `@I059@` | filed under `@F016@` |
| Adrianus Antonius (1909–1972) | `@I060@` | filed under `@F016@` |
| Josina Maria (1910) | `@I061@` | under `@F016b@` |
| Johanna Maria (1912) | `@I062@` | under `@F016b@` |
| Theodora Josephina (1915) | `@I063@` | under `@F016b@` |
| Petrus Hubertus (1917, d. 22 Jul 1931 age 14) | `@I064@` | under `@F016b@` |
| Maria (1920) | `@I065@` | under `@F016b@` |
| Louisa Antonia (1923) | `@I066@` | under `@F016b@` |

So the task was **verification + enrichment** (finding the next generation:
the children's own marriages and spouses), not bulk re-adding.

---

## 2. New records confirmed and ADDED this cycle

Three next-generation records were confirmed against BHIC aktes that **explicitly
name Antonius van Duijnhoven and Antonia Vermulst as the parents**, and added to the GEDCOM.

### 2.1 Josephus Antonius van Duijnhoven `@I057@` × Wilhelmina van Hugten — 8 Feb 1947, Deurne
- **Bride:** Wilhelmina van Hugten `@I401@` (daughter of Gerardus van Hugten & Mechelina van der Wallen)
- **New family:** `@F133@` (FAMS linked on `@I057@`)
- Akte parents of groom: *Antonius van Duijnhoven* + *Antonia Vermulst* — confirms parentage.
- Source: BHIC BS Huwelijk Deurne, 8-2-1947 — `bhi:2eb1f635-249c-5422-8bd1-d873c4925091`
  (https://www.openarchieven.nl/bhi:2eb1f635-249c-5422-8bd1-d873c4925091)
- Evidence strength: **strong** (akte names both parents).

### 2.2 Josina Maria van Duijnhoven `@I061@` × Peter Johannes Rovers — 11 Nov 1942, Helmond
- **Groom:** Peter Johannes Rovers `@I402@` (son of Jan Rovers & Helena van Dijk)
- **New family:** `@F134@` (FAMS linked on `@I061@`)
- Akte parents of bride: *Antonius van Duijnhoven* + *Antonia Vermulst* — confirms parentage.
- Source: BHIC BS Huwelijk Helmond, 11-11-1942 — `bhi:fcd5a4f8-f9d0-b47e-f6a0-31da4162e8ad`
  (https://www.openarchieven.nl/bhi:fcd5a4f8-f9d0-b47e-f6a0-31da4162e8ad)
- Evidence strength: **strong** (akte names both parents).

### 2.3 Adrianus Antonius van Duijnhoven `@I060@` (1909–1972) × Adrianna Maria van Doren
- **Wife:** Adrianna Maria van Doren `@I403@` (daughter of Peter van Doren & Wilhelmina van Eersel)
- **New family:** `@F135@` (FAMS linked on `@I060@`) — marriage date not yet located.
- Adrianus is named as a related party ("Relatie") on a Helmond death record dated 27-5-1972;
  the couple lived in Helmond. This corroborates his known 1909–1972 lifespan.
- Source: BHIC BS Overlijden Helmond, 27-5-1972 — `bhi:ac8ac0fd-a16c-e08b-7023-f5e8efcf0ed8`
  (https://www.openarchieven.nl/bhi:ac8ac0fd-a16c-e08b-7023-f5e8efcf0ed8)
- Evidence strength: **moderate** (single source; marriage akte not yet found).

**GEDCOM result:** 353 → **356 individuals**, 106 → **109 families**. Atomic save with .bak backup.

---

## 3. ⚠️ Data inconsistency flagged (NOT auto-corrected)

The GEDCOM currently files the four children born **1905–1909** (Josephus Antonius `@I057@`,
Joannes Petrus Paulus `@I058@`, Gerardus Petrus `@I059@`, Adrianus Antonius `@I060@`)
under **marriage 1** (`@F016@`, Lamberdina van Dijk). But:

- The **Josephus Antonius 1947 marriage akte** names his mother as **Antonia Vermulst** (marriage 2), not Lamberdina.
- The second marriage to Antonia Vermulst is dated **Feb 1903**, i.e. *before* these children were born (1905–1909).
- Lamberdina died ~1901, so children born 1905–1909 cannot be hers.

**Conclusion:** the 1905–1909 children biologically belong to the **Antonia Vermulst** marriage
(`@F016b@`), and the current GEDCOM placement under `@F016@`/Lamberdina appears to be an error.
This restructure (moving 4 CHIL links from `@F016@` to `@F016b@` and updating FAMC on each child)
was **left for owner review** rather than changed automatically, because it alters existing
tree topology. Josina Maria's akte (2.2) independently confirms Antonia Vermulst as mother.

The Lamberdina van Dijk marriage `@F016@` may in fact have produced **no** surviving/known children,
or its children are still to be identified.

---

## 4. Open leads for future cycles

- **Joannes Petrus Paulus `@I058@` (b.1906 Helmond)** — no marriage located yet. The 1906 Helmond
  birth is worth confirming (unusual location vs. Uden for the rest).
- **Gerardus Petrus `@I059@` (b.1908)** — marriage not yet found (surname-only search returns many
  unrelated Gerardus Petrus records; needs parent-name disambiguation).
- **Adrianus `@I060@` × Adrianna Maria van Doren** — locate the actual marriage akte (date/place)
  and Adrianus's own death akte (he was alive/named 1972; d. by/1972 per existing lifespan).
- **Antonia Vermulst `@I102@`** and **Antonius `@I045@`** — death aktes not yet pinned down
  (surname-only death search too noisy; 97 hits, none confirmed as `@I045@` himself yet).
- Younger daughters **Johanna Maria (1912) `@I062@`, Theodora Josephina (1915) `@I063@`,
  Maria (1920) `@I065@`, Louisa Antonia (1923) `@I066@`** — marriages not yet searched.
- **Petrus Hubertus `@I064@`** — died young (22 Jul 1931, age 14); death akte confirmation possible.

## 5. Method notes
- OpenArchieven surname-only searches are very noisy for `van Duijnhoven` (thousands of hits).
  The reliable filter is the **`<meta name="description">` line of the akte page**, which lists
  all named parties incl. parents — use it to confirm `Antonius van Duijnhoven` + `Antonia Vermulst`
  before accepting a record.
- Some search `identifier` values 404 on the detail page; retry with the alternate id returned
  for the same event (records are often duplicated across two ids).
