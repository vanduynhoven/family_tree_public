# Parents of Joannes Cornelissen (~1750 Bakel) — @I428@

**Goal:** Find the parents of Joannes Cornelissen (@I428@, b. ABT 1750, Bakel en Milheeze),
husband of Willemijn van de Meulenhof (@I429@) and father of Jan (Joannes) Cornelissen (@I422@).
Joannes is the great-great-grandfather of Anna Maria Cornelissen.

**Status: NOT FOUND — no source located that names Joannes Cornelissen's parents.**

Date of research: 2026-08-30
Source system: OpenArchieven (api.openarchieven.nl + www.openarchieven.nl), archive `bhi`
(Brabants Historisch Informatie Centrum).

---

## What is confirmed

The couple @I428@ × @I429@ is **independently corroborated** by a collateral record:

- **1815-05-07 BS Huwelijk, Bakel en Milheeze** — `bhi:5154a458-01dd-da70-6ccb-9746ebbd49ed`
  (also `bhi:3E54E19C-5FB3-4978-8AF1-5EC5CB2ADFD0`).
  Groom **Theodorus Cornelissen** (b. Bakel); his parents named in the akte as
  **Joannes Cornelissen** and **Willemijn van de Meulenhof**.
  Bride Joanna Maria van Leunen (parents Willem van Leunen + Ida Sterken).
  <https://www.openarchieven.nl/bhi:5154a458-01dd-da70-6ccb-9746ebbd49ed>

  This is a **sibling record**: Theodorus Cornelissen is a brother of Jan/Joannes Cornelissen
  (@I422@), both children of the same couple. It confirms the *spelling and pairing* of the
  parent couple (Joannes Cornelissen + Willemijn "van de" Meulenhof, Bakel) but does **not**
  reach one generation higher — it does not name Joannes's own parents.

- Prior confirmation of the couple (already in GEDCOM notes): the 1808 baptism of grandson
  Cornelis (`bhi:bfa01ade`), father "Cornelius Cornelissen", godparent
  "Theodorus Joannis Cornelissen". Source: `JAN_CORNELISSEN_JOOST_WEIJER_PARENTS.md`.

So the couple is solid. The missing link is **the generation above Joannes**.

---

## Searches performed (all negative for Joannes's parents)

1. **Marriage of Joannes Cornelissen × Willemijn van de Meulenhof** (DTB Trouwen, would name
   both spouses' parents):
   - All `van de Meulenhof` persons in DTB Trouwen, archive bhi: **only 39 records total**,
     of which **7 in Bakel en Milheeze**. None is a Willemijn/Wilhelmina van de Meulenhof
     marrying a Joannes/Jan Cornelissen. The single Cornelissen-adjacent hit was unrelated
     (Cornelis van de Meulenhof as groom, 1806-05-18, `bhi:d9f52979-893c-7a9f-b75a-38c53fbae208`).
   - `Cornelissen` grooms in DTB Trouwen 1770–1785 (2466 records): no Joannes/Jan Cornelissen
     × Meulenhof marriage in Bakel surfaced.
   - **Conclusion:** the DTB marriage of this couple is not indexed in OpenArchieven's Bakel
     Trouwen set (may be unindexed, illegible, or performed in another parish).

2. **Baptism of Joannes Cornelissen** (DTB Dopen, would name his father + mother):
   - `Joannes Cornelissen` as Dopeling, Bakel, 1743–1762: **0 records**.
   - Reason: in mid-18th-c. Bakel, a child's surname was typically the father's patronymic. A
     boy baptized ~1750 whose father was "Cornelis …" would be indexed under the father's
     surname, not "Cornelissen", so a fixed-surname search cannot find him. First-name-only
     searches (`Joannes` / `Jan` Dopeling) with a year filter returned 0 via this API.

3. **Death records** (BS Overlijden, would give age → birth year and sometimes parents):
   - `Cornelissen` Overledene: 1945 records, none resolved to Bakel in the retrievable pages.
   - `van de Meulenhof` Overledene: 201 records, 17 in Bakel, none matching a Willemijn/
     Wilhelmina in the first retrievable page.

---

## Why the API could not close this

Two hard limitations of the OpenArchieven search API were confirmed during this research and
should inform future cycles:

- **Server-side place filtering does not work.** The `place=` parameter is effectively ignored
  (identical `number_found` with/without it in some queries, and results include Geldrop,
  Veghel, Deurne, Mierlo when Bakel was requested); `eventplace=` is an invalid parameter and
  forces `number_found = 0`. Place must be filtered **client-side** from each doc's
  `eventplace` field.
- **Result pages are capped (~100–200 docs) and unsorted by relevance/place**, so for a common
  surname like "Cornelissen" (thousands of hits) the correct Bakel record is statistically
  unlikely to appear in a retrievable page. Only *rare* surnames (e.g. "van de Meulenhof",
  39 marriage records total) can be scanned exhaustively.
- The `name=` field matches a person token/surname prefix; multi-token full-name queries and
  first-name-only + year-range queries frequently return 0.

---

## Recommended next steps (outside this API)

1. **Read the actual DTB Dopen register scans for Bakel en Milheeze, ~1745–1758** directly at
   the source (BHIC / RHC Eindhoven, or the parish register images on `www.rhc-eindhoven.nl` /
   FamilySearch), searching for a **Joannes baptized to a father named Cornelis** — that father
   is almost certainly Joannes's father, and the mother would be named alongside.
2. **Find the DTB marriage of Joannes Cornelissen × Willemijn van de Meulenhof (~1773–1778)**
   by browsing the Bakel Trouwen register images for that window; the akte names both sets of
   parents. If not in Bakel, check neighbouring parishes (Deurne, Gemert, Beek en Donk).
3. **Cross-check with published Bakel genealogies / the BHIC person index** for the
   "van de Meulenhof" and "Cornelissen" families of Bakel, which may already link this couple.
4. Given records use both fixed surnames and patronymics, expect Joannes's father as
   **"Cornelis <patronymic/surname>"** and search on that basis.

---

## GEDCOM

**No change made.** @I428@ (Joannes Cornelissen) still has **no FAMC** — parents remain
unlinked because no source was found to support a parent link. Adding speculative parents
would violate the "never fabricate" rule. The couple @I428@ × @I429@ itself was re-confirmed
by the 1815 sibling record above; that citation can optionally be appended to the @I428@ /
@I429@ notes if desired, but it adds no new genealogical fact beyond what is already noted.

### Key IDs for future lookup
| Item | Identifier |
|---|---|
| 1815 marriage (Theodorus Cornelissen, sibling) confirming the parent couple | `bhi:5154a458-01dd-da70-6ccb-9746ebbd49ed` |
| Duplicate of above | `bhi:3E54E19C-5FB3-4978-8AF1-5EC5CB2ADFD0` |
| 1808 baptism grandson Cornelis (prior confirmation) | `bhi:bfa01ade` |
| Unrelated Meulenhof marriage (ruled out) | `bhi:d9f52979-893c-7a9f-b75a-38c53fbae208` |
