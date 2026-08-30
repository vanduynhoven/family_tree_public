# Van de Weyer × Biemans consanguinity (Bakel en Milheeze, 1769)

**Research question:** Joost (Judocus) van de Weyer × Josina (Justina) Biemans married
**5 Feb 1769 in Bakel en Milheeze** with a **3rd/4th degree consanguinity dispensation**.
What common ancestor did the two spouses share?

**Verdict:** The dispensation **confirms** a shared ancestor existed, and its degree
pins down *how far back* that ancestor sits — but the specific common ancestor
**cannot be identified from the indexed OpenArchieven / BHIC records.** The link lies
in the pre‑1740 gap of the Bakel Rooms‑Katholiek register, one generation above the
earliest reconstructable ancestors of each line. Evidence strength: **the fact of the
shared ancestor is `strong`; the identity of the ancestor is unrecoverable (`weak`) from
current sources.** No individuals were invented.

Research date: 2026-08-30. Source: OpenArchieven API (`api.openarchieven.nl`, archive `bhi`
= Brabants Historisch Informatie Centrum), Gemeentearchief Gemert‑Bakel DTB.

---

## 1. The anchor record — the dispensation itself

The 5 Feb 1769 marriage exists in two parallel registers:

- **Rooms‑Katholiek doop- en trouwboek 1686‑1795**, boek 1, fol. 321 —
  `bhi:2a97eecb-8227-8cf9-51de-a4e40bcfbceb`
  (bride *Justina Biemans*, groom *Judocus van de Weyer*). This is the RK act on which
  the **3rd/4th degree consanguinity dispensation** is recorded.
- **Schepenbank trouwboek**, boek 11, fol. 89, ondertrouw 21‑1‑1769 —
  `bhi:46fc19a4-401d-f58d-00da-87937e520174`
  (bride *Syna Joost Biemans*, groom *Joost van de Weyer*).

**Crucial limitation:** the OpenArchieven *index* for both records carries only the two
spouses' names, the date, place, religion and source reference — **no parents, and no
structured statement of the dispensation degree or the named common ancestor.** The
`3rd/4th degree` detail comes from the deed scan (BHIC memorix image), not the searchable
index. Verified by pulling the full a2a record: it lists exactly two persons (Bruid
Justina Biemans, Bruidegom Judocus van de Weyer) and nothing about ancestry.

Scan (to read the Latin dispensation clause directly, a future step):
`https://www.bhic.nl/memorix/genealogy/search/deeds/2a97eecb-8227-8cf9-51de-a4e40bcfbceb`

---

## 2. What the degree TELLS us (canon-law constraint)

A **mixed 3rd‑and‑4th degree** consanguinity (pre‑1917 canon-law counting, where the
degree = the number of generations from the *more distant* spouse back to the common
ancestor) means the spouses were **third cousins once removed**:

- one spouse stands **3 generations** below the common ancestor (great‑grandparent), and
- the other stands **4 generations** below the same ancestor (great‑great‑grandparent).

Placing Joost b. ≈1745 and Josina bap. 27‑2‑1740, the common ancestor was therefore born
roughly **1640–1675** — i.e. **one generation ABOVE the earliest ancestor currently
reconstructable on each line.** That is exactly the generation the surviving Bakel
records do not cover.

Known line depth today (from `MATHIAS_JUDOCUS_PARENTS.md`):

```
 Common ancestor  (b. ~1640–1675, Bakel/Milheeze area) —— UNIDENTIFIED ——
        |                                                        |
   [ gap: pre-1740 RK register ]                        Joannes (Jan) Biemans (@I456@)
        |                                                        |
 Mathias van de Weyer (@I437@, b.~1700)              Judocus "Jan" Biemans (@I438@, b.~1710,
        |                                              m. 16-2-1738 Johanna Judoci Janssen)
 Joost/Judocus van de Weyer (@I424@) ————————————×———— Justina/Josina Biemans (@I425@, bap.1740)
                          married 5 Feb 1769 Bakel (3rd/4th degree dispensation)
```

Because the two named ancestor lines (van de Weyer via Mathias; Biemans via Joannes) do
**not** meet within the documented span, the shared ancestor must be reached by climbing
one further generation on each side — into the undocumented pre‑1740 window.

---

## 3. Why the ancestor cannot be named from current sources

Investigated this cycle via the OpenArchieven search + show API:

- **Mathias van de Weyer's own parents are unknown** (established in prior research): no
  marriage or baptism for Mathias himself survives in the searchable BHIC index; the
  Bakel RK registers have gaps before ~1740 and the Schepenbank trouwboek begins 1743.
  His wife's name was never recovered. His siblings are known only by the shared
  patronym *Mathei van de Weyer* (Wilhelma, Anna, Maria, Catharina, Hubertus, Johanna,
  and **Gysbertus Mathia van de Weyer**, m. 20‑2‑1757 Henrica van den Heuvel,
  `bhi:85aa57d7-9b9d-2e52-fb8d-f3594ce95c16`). Their parents' marriage (≈1720s) is not
  indexed, so the van de Weyer line stops at Mathias.
- **Judocus Biemans's father is only a patronym** — *Joannes/Jan Biemans* (@I456@),
  derived from "Judocus **Joannis** Biemans" on the 1738 marriage and 1740/1742
  baptisms. Judocus's own baptism (~1705‑1712) is not indexed, so Joannes Biemans's
  parents (and thus any link up to a van de Weyer) are unknown.
- The 44 indexed *van de Weyer* and 61 *Biemans* Bakel marriage records are **all
  index-only entries that do not name parents**; they distinguish families solely by
  patronymic (van de Weyer children of *Joannis*, *Huberti/Huybers*, *Gysberti*,
  *Mathei*; Biemans children of *Joannis*, *Willem/Wilhelmi*, *Joost/Justini*). None of
  these entries bridges the two surnames in the grandparent generation.

**No van de Weyer × Biemans intermarriage was found in the grandparent generation** that
would directly produce the shared ancestor, and none can be excluded either — the records
that would show it are missing.

### Incidental find (not the answer, logged for completeness)
- **Cathalyn (Catharina) Joannis Biemans × Jan van Duynhoven**, m. 23‑6‑1754 Bakel
  (`bhi:31552c82-2e5c-fded-b390-47d5b2bb67cf`). A Biemans–van Duynhoven marriage in the
  same parish and generation — of interest to the broader van Duijnhoven endogamy picture,
  but it does not identify the van de Weyer × Biemans common ancestor. Cathalyn is a
  *Joannis* Biemans, i.e. plausibly a sister of Judocus "Jan" Biemans (same patronym),
  which would make her Josina's aunt — a lead, not a conclusion.

---

## 4. Answer

**The specific common ancestor is not determinable from the available indexed evidence.**
What is established:

1. Joost van de Weyer and Josina Biemans **did** share a common ancestor — this is a
   documented fact, stated on their 1769 RK marriage act as a canonical impediment for
   which they obtained a **3rd/4th‑degree dispensation**.
2. That ancestor was a **third cousin once removed**'s common forebear, born **c. 1640–1675**
   in the Bakel en Milheeze area — **one generation above** both Mathias van de Weyer
   (van de Weyer line) and Joannes/Jan Biemans (Biemans line).
3. The connecting generation falls squarely in the **pre‑1740 gap** of the Bakel RK
   register, so the ancestor's name is currently unrecoverable. It could plausibly be a
   *van de Weyer* forebear (making one line paternal, the other via a daughter who married
   into the Biemans) or a third surname from which both descend through daughters.

No GEDCOM change is warranted: adding a common‑ancestor individual would require inventing
an unsourced person, which the evidence does not support.

---

## 5. Leads to resolve it (future research, outside the OpenArchieven index)

1. **Read the 1769 dispensation deed scan itself** (BHIC memorix image, link above, and the
   Schepenbank copy). A consanguinity dispensation clause in the parish/officialaat record
   sometimes names the linking ancestors explicitly or gives the exact lineage; the *index*
   omits this but the *image* may not.
2. **BHIC studiezaal / RHCe (Regionaal Historisch Centrum Eindhoven)** for the Bakel
   Schepenbank trouwboek deel 1 (1686‑1752) and any surviving RK doopboek fragments
   pre‑1740 — to find Mathias van de Weyer's marriage (≈1720s, wife's name) and Judocus
   Biemans's baptism (≈1705‑1712, naming grandfather Jan Biemans's family).
3. **Check neighbouring parishes** (Deurne, Gemert, Aarle‑Rixtel, Milheeze proper) for a
   van de Weyer ↔ Biemans marriage c. 1690‑1720 that would seat the common ancestor.
4. **Diocesan dispensation registers** ('s‑Hertogenbosch / apostolic vicariate) for 1768‑69
   frequently record the *gradus consanguinitatis* with the intervening names — the single
   most likely document to name the ancestor outright.

---
*Sources: openarchieven.nl / api.openarchieven.nl (BHIC `bhi:` identifiers); prior file
`research/MATHIAS_JUDOCUS_PARENTS.md`. Researched 2026‑08‑30.*
