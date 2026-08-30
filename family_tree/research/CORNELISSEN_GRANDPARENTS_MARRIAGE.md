# Marriage: Peter Cornelissen × Johanna Verhoeven (1874, Bakel en Milheeze)

**Status:** ✅ CONFIRMED — primary source (BHIC civil marriage akte)
**Researched:** 2026-08-30

## The record

**Marriage (BS Huwelijk), 11 February 1874, Bakel en Milheeze, Noord-Brabant, Netherlands**

- **Source:** https://www.openarchieven.nl/bhi:ef810162-969e-1c36-c5ae-90d4b5083bab
- **Original scan (BHIC):** https://www.bhic.nl/memorix/genealogy/search/deeds/ef810162-969e-1c36-c5ae-90d4b5083bab
- **Citation:** Huwelijksregister Bakel en Milheeze 1874, **akte no. 3**, Brabants Historisch Informatie Centrum (BHIC), **toegang 50, inventarisnummer 377**. Indexed record last changed 2015-07-03.
- **Record GUID:** {ef810162-969e-1c36-c5ae-90d4b5083bab}

### Persons named in the akte

| Role | Name |
|------|------|
| Bruidegom (groom) | **Peter Cornelissen** (b. Bakel en Milheeze) |
| Bruid (bride) | **Johanna Verhoeven** (b. Bakel en Milheeze) |
| Vader van de bruidegom | **Theodorus Cornelissen** |
| Moeder van de bruidegom | **Maria Werts** |
| Vader van de bruid | **Willem Verhoeven** |
| Moeder van de bruid | **Johanna van Duijnhoven** |

## Answers to the research questions

1. **Peter Cornelissen × Johanna Verhoeven marriage** — 11 Feb 1874, Bakel en Milheeze, akte no. 3. ✅
2. **Peter Cornelissen's parents** — Theodorus Cornelissen × Maria Werts. ✅
3. **Johanna Verhoeven's parents** — Willem Verhoeven × Johanna van Duijnhoven. ✅

The marriage date (1874) sits neatly before the birth of their son **Wilhelmus Cornelissen (7 Dec 1876, Bakel en Milheeze, @I162@)**, consistent with the family structure in `@F036@`.

## Notes

- The bride's mother carries the surname **"van Duijnhoven"** — this is on the maternal
  Verhoeven side and is **distinct** from the van Duijnhoven / van Duynhoven line that
  Anna Maria Cornelissen (the couple's great-granddaughter) later married into. Coincidental
  surname, not the same family branch.
- No birth records for Peter or Johanna were separately confirmed this cycle; their birthplace
  (Bakel en Milheeze) is asserted by the marriage akte's `a2a_BirthPlace` field. Birth akten
  (est. ~1848–1856) remain an open follow-up if exact birth dates are wanted.

## Verification method

Search via OpenArchieven API (`records/search.json`), filtered client-side on
`eventplace = "Bakel en Milheeze"`. Both Peter Cornelissen (Bruidegom) and Johanna
Verhoeven (Bruid) resolved to the SAME record identifier and event date, then confirmed
against the full A2A record (`records/show.json?archive=bhi`), which lists all six persons
and their relation types.

## GEDCOM changes applied

File: `vanduynhoven/family_tree/vanduynhoven_family.ged` (atomic write + timestamped .bak)

- **`@F036@`** (Peter × Johanna) — added `MARR` event: 11 FEB 1874, Bakel en Milheeze, with SOUR + akte citation note.
- **`@I160@`** (Peter Cornelissen) — added `FAMC @F141@` (link to his parents).
- **`@I161@`** (Johanna Verhoeven) — added `FAMC @F142@` (link to her parents).
- **`@I412@`** — NEW INDI: Theodorus Cornelissen (Peter's father).
- **`@I413@`** — NEW INDI: Maria Werts (Peter's mother).
- **`@I414@`** — NEW INDI: Willem Verhoeven (Johanna's father).
- **`@I415@`** — NEW INDI: Johanna van Duijnhoven (Johanna's mother).
- **`@F141@`** — NEW FAM: Theodorus Cornelissen × Maria Werts, child `@I160@`.
- **`@F142@`** — NEW FAM: Willem Verhoeven × Johanna van Duijnhoven, child `@I161@`.

Every new record cites the 1874 marriage akte as its source.
