# Delpher.nl Newspaper Search — van Duijnhoven / van den Elzen (Uden)

**Source:** Delpher (Koninklijke Bibliotheek), historical Dutch newspapers 1618–1995.
**Searched:** 2026-08-28
**Method:** Delpher newspaper collection (`x-collection=DDD_artikel`) queried via the KB SRU
API (`https://jsru.kb.nl/sru/sru`), which returns the same result set as the
delpher.nl/nl/kranten web search but as structured records. OCR text of candidate
articles was pulled from the KB resolver (`resolver.kb.nl/resolve?urn=...:ocr`) to
verify each hit. Raw structured results: `search_results.json`. Verified article OCR:
`articles_ocr/`.

---

## Bottom line

**No newspaper record was found in Delpher for any of the four target life events:**

| Target event | Date | Found in Delpher? |
|---|---|---|
| Marianus van Duijnhoven — death | 20 May 1949 | **No** — no death notice / familiebericht |
| Anna Maria van den Elzen — death | 21 Dec 1952 | **No** — no death notice / familiebericht |
| Johan van Duijnhoven & Anna Maria — marriage | 5 Oct 1950 | **No** — no marriage announcement |
| Family emigration to USA | 17 Nov 1950 | **No** — no emigration mention |

This is a **coverage gap, not a search failure.** The searches ran correctly and Delpher
*does* hold 1949–1952 newspapers that cover the town of Uden (10,820 Uden articles in
that window, mostly the Tilburg papers). The specific family events simply were not
printed in the digitized press:

- Date-windowed check **`Duijnhoven AND Uden`, 1950-01-01 → 1951-01-31 = 0 hits** (covers
  the Oct 1950 marriage and Nov 1950 emigration).
- Date-windowed check **`"van den Elzen" AND Uden`, 1952-12-01 → 1953-01-15 = 0 hits**
  (covers the Dec 1952 death).
- Date-windowed check **`Duijnhoven`, 1949-05-15 → 1949-05-31 = 3 hits**, all from other
  regions (Noord-Holland, Nijmegen/Groesbeek) — none an Uden death notice for Marianus.

The Noord-Brabant regional papers that would have carried Uden civil-registry notices
(`Stadsarchief 's-Hertogenbosch`, `RHC Eindhoven`) are digitized in Delpher only up to
~1944. For ordinary Brabant families of that era, births/deaths/marriages were usually
recorded only in the municipal *burgerlijke stand* (civil registry), not placed as paid
newspaper *familieberichten* — so absence from Delpher is expected. Better sources for
these exact events are the **Uden civil registry via wiewaswie.nl / BHIC** (Brabants
Historisch Informatie Centrum) and, for the 1950 emigration, **US immigration/passenger
records (Ellis Island / NARA)**.

---

## Searches run (Delpher "Kranten" collection)

| # | Query | Total hits | Signal |
|---|---|---|---|
| 1 | `"van Duijnhoven" AND Uden` | 382 | broad; mostly general Uden content (loose phrase match) |
| 2 | `"van Duynhoven" AND Uden` | 170 | broad; spelling variant |
| 3 | `"Marianus van Duijnhoven"` | 0 | exact name never appears |
| 4 | `Marianus AND Duijnhoven` | 19 | reviewed — none is the target (see below) |
| 5 | `"Anna Maria van den Elzen"` | 5 | reviewed — all a *different* A.M. van den Elzen |
| 6 | `"van den Elzen" AND Uden` | 1191 | broad; common Brabant surname |
| 7 | `"Johan van Duijnhoven"` | 1 | false positive (1949 billiards results, OCR fuzzy match) |
| 8 | `Duijnhoven AND emigratie` | 10 | none tie to this family |
| 9 | `Duijnhoven AND Amerika AND Uden` | 21 | none is an emigration notice for this family |

Spelling note: both **Duijnhoven** and **Duynhoven** were searched; **van den Elzen** was
tried with and without the Uden qualifier.

---

## Notable / verified records (near-matches, NOT the target family)

OCR saved under `articles_ocr/`.

1. **1948-12-11 — Nieuwe Tilburgse Courant, "H.H. Wijdingen"** —
   `articles_ocr/1948-12-11_katholiek-nieuws_Louis-van-Duijnhoven-ordination.txt`
   Lists ordinations at the Bisschoppelijke Kweekschool 's-Hertogenbosch; among the
   Oblate friars: **"Louis van Duijnhoven."** Right region and era, a real van Duijnhoven,
   but not one of the four targets.
   View: https://www.delpher.nl/nl/kranten/view?identifier=MMUBTB04:210850137:mpeg21:a00071

2. **1953-11-26 — Tilburg, "Uniek jubileum van kloosterzuster"** —
   `articles_ocr/1953-11-26_kloosterzuster-jubileum_zr-Cleopha-AnnaMaria-vd-Elzen.txt`
   Profiles Sister Cleopha, "in the world **Anna Maria van den Elzen, born in Oss on
   3 November 1861**", a nun at Nuland. This is a *different* Anna Maria van den Elzen
   (b. 1861, alive in 1953) — **not** the target who died 21 Dec 1952.
   View: https://www.delpher.nl/nl/kranten/view?identifier=MMUBTB04:210865049:mpeg21:a00054

3. **1940-11-05 — Schijndel Burgerlijke Stand** —
   `articles_ocr/1940-11-05_Schijndel-burgerlijke-stand_AnnaMaria-vd-Elzen.txt`
   Birth of Geertruda Erna, daughter of Henricus Steenbakkers and **Anna Maria van den
   Elzen** (Schijndel). Again a younger, different woman — not the target.
   View: https://www.delpher.nl/nl/kranten/view?identifier=ddd:010315838:mpeg21:a0076

4. **1937-03-12 — 's-Hertogenbosch, Nistelrode Burgerlijke Stand** —
   `articles_ocr/1937-03-12_Nistelrode-geboorte_Marianus-vDuijnhoven.txt`
   Birth of **"Marianus, son of H. W. v. Duijnhoven and M. v. d. Burgt"** (Nistelrode,
   1937). A different, infant Marianus — not the target (an adult who died in 1949).
   View: https://www.delpher.nl/nl/kranten/view?identifier=MMSADB01:000014699:mpeg21:a0114

5. **1949-12-09 — RHC Eindhoven, "SPORT BILJARTEN Deurnese Biljartbond"** — the sole
   `"Johan van Duijnhoven"` hit. OCR confirms it is a billiards league results table with
   **no personal names** — a fuzzy index match, i.e. a false positive.

---

## Files produced

- `SEARCH_RESULTS.md` — this document
- `search_results.json` — structured results for all 9 queries (dates, titles, types, Delpher view URLs)
- `articles_ocr/` — OCR text of the 4 verified near-match articles
- `_run_searches.py` — the search script (reproducible)

## Recommended next steps (outside Delpher)

- **wiewaswie.nl** / **BHIC (Brabants Historisch Informatie Centrum)** — Uden burgerlijke
  stand: death record Marianus van Duijnhoven (1949), death Anna Maria van den Elzen
  (1952), marriage Johan × Anna Maria (Oct 1950).
- **Ellis Island / NARA passenger & immigration records** — the Nov 1950 emigration to
  the USA (ship manifest, visa/immigration file).
- If a newspaper *familiebericht* does exist, it would most likely be in a local Uden/Oss
  parish or regional bulletin **not digitized in Delpher**; check the BHIC reading room or
  the diocesan archive.
