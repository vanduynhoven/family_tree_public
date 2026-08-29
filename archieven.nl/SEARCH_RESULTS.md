# Archieven.nl — van Duijnhoven Family Record Search

**Search date:** 2026-08-28
**Region focus:** Uden, Noord-Brabant
**Target family:**
- Marianus van Duijnhoven (1872–1949)
- Johan van Duijnhoven (b. 1915)
- Family emigrated 17 Nov 1950 from Rotterdam

---

## How Archieven.nl is structured (important for follow-up)

Archieven.nl's person search is a **client-side (JavaScript) MAIS application**. Result rows
and record detail are rendered in the browser from a `data-json` payload; they are **not present
in the raw server HTML**, so `curl`/`web_fetch` return only the page shell. All record data below
was read from the live rendered search UI.

- **Persons category** (birth/marriage/death indexes, population registers, notarial deeds):
  `mizig=310`
- **Persons search entry point:** https://www.archieven.nl/nl/zoeken?mizig=310
- Archieven.nl's homepage name search **federates to WieWasWie.nl** (CBG), the national
  person index. A name search from the homepage box redirects there.
- Uden's civil registration and population registers are physically held by **BHIC**
  (Brabants Historisch Informatie Centrum), which is a participating archive feeding Archieven.nl.

---

## 1. Archieven.nl — Persons index (`van Duijnhoven`)

**Search URL (all persons, surname anywhere):**
https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=0&miview=tbl&milang=nl&mizk_alle=Duijnhoven

**Search URL (surname + Uden):**
https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=0&miview=tbl&milang=nl&mizk_alle=Duijnhoven+Uden

**Result:** The persons index returns records for the Duijnhoven surname. The combined
`Duijnhoven Uden` query returned a very large result set (**263 result pages, ~5,000+ index
entries** — this is a broad OR-style match across all fields, not a filtered match). Record types
returned in this category include:
- Geboorteakten (birth certificates)
- Huwelijksakten (marriage certificates)
- Overlijdensakten (death certificates)
- Bevolkingsregisters (population registers)
- Notariële akten (notarial deeds)

Detail records are addressed by an archive id (`miadt=<n>`) — e.g. `miadt=2231`, `miadt=235`,
`miadt=236` appeared among the top hits, indicating multiple holding institutions
(BHIC and others).

> **To narrow to the specific family**, use the **Uitgebreid zoeken (advanced)** form fields on
> the persons search rather than the free-text box:
> - Achternaam: `Duijnhoven`
> - Tussenvoegsel: `van`
> - Voornaam: `Marianus` (or `Johan` / `Johannes`)
> - Plaats: `Uden`
> - Periode: e.g. `1870–1950`

### Recommended targeted queries (persons index)
| Person | Query URL |
|---|---|
| Marianus van Duijnhoven | https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=0&miview=tbl&milang=nl&mizk_alle=Marianus+Duijnhoven |
| Johan van Duijnhoven | https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=0&miview=tbl&milang=nl&mizk_alle=Johan+Duijnhoven |
| Surname + Uden | https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=0&miview=tbl&milang=nl&mizk_alle=Duijnhoven+Uden |

---

## 2. WieWasWie.nl (federated person index — CBG)

Archieven.nl's homepage name search redirects to WieWasWie, which reported **19,460 documents**
mentioning the surname across all Dutch civil-registration and population indexes.

- **Simple search:** https://www.wiewaswie.nl/nl/zoeken/
- **Advanced search** (structured fields — the reliable path): open the search page → click
  **"Uitgebreid zoeken"**, then fill:
  - Achternaam: `Duijnhoven`
  - Tussenvoegsel: `van`
  - Voornaam: `Marianus` / `Johan`
  - Plaats: `Uden`

WieWasWie is the best structured source for the **birth, marriage and death index entries**
(BS akten) of Marianus (b. 1872) and Johan (b. 1915) and for their parents/spouses.

---

## 3. Delpher (newspapers/periodicals) — CONFIRMED HITS

Delpher (KB) newspaper search for **"van Duijnhoven" + Uden** returned real hits, including
**Burgerlijke Stand van Uden** (civil-registry) notices — these list births/marriages/deaths
by name and date and are directly useful.

**Search URL:** https://www.delpher.nl/nl/kranten/results?query=%22van+Duijnhoven%22+Uden&coll=ddd

Sample hits (from *De Zuid-Willemsvaart* and *Provinciale Noordbrabantsche en 's Hertogenbossche courant*):
| Article | Newspaper | Date |
|---|---|---|
| "BURGERLIJKE STAND VAN UDEN. van 18 tot en met 24 April 1924. Geboren." | Provinciale Noordbrabantsche courant | 26-04-1924 |
| "Burgerlijke Stand." | De Zuid-Willemsvaart | 28-04-1924 |
| "BURGERLIJKE STAND." | De Zuid-Willemsvaart | 11-10-1932 |
| "LIESHOUT. Over de maand September." | De Zuid-Willemsvaart | 05-10-1933 |

### Emigration (1950) — NEGATIVE FINDING
**Search URL (filtered to 1950):**
https://www.delpher.nl/nl/kranten/results?query=%22van+Duijnhoven%22+Uden&facets%5Bperiode%5D%5B%5D=2%7C20e_eeuw%7C1950-1959%7C1950%7C&coll=ddd

**Result: "Geen resultaten gevonden"** — no newspaper hits for the emigration in 1950
(1 tijdschrift + 3 Google Books hits only). Delpher newspaper coverage of the early 1950s is
limited by copyright cutoffs, so the absence is expected and does **not** disprove the emigration.

---

## 4. Emigration records (1950, Noord-Brabant, from Rotterdam) — where to look next

Emigration from Rotterdam in Nov 1950 is **not** indexed in Archieven.nl's newspaper/person
free-text search. The authoritative sources are:
- **Nationaal Archief / Emigratie 1945–1969** — the Netherlands Emigration Service
  (Nederlandse Emigratie Dienst) card indexes; search person by name.
- **BHIC population registers / persoonskaarten for Uden** — the *vertrek* (departure) entry in
  the Uden bevolkingsregister / gezinskaart records the emigration date and destination country.
  Held by BHIC, surfaced on Archieven.nl under `mizig=310`.
- **Passenger manifests** — the ship departing Rotterdam ~17 Nov 1950 (Holland-America Line for
  Canada/USA, or Trans-Ocean/other for Australia). Manifests are digitized at the destination
  country's archives (e.g. Library and Archives Canada; NARA; NAA Australia), not on Archieven.nl.
- **CBG persoonskaarten** — the central population card (persoonskaart) for a person who left the
  Netherlands after 1939 is held by CBG and records emigration.

---

## Summary

| Source | Status | Value |
|---|---|---|
| Archieven.nl persons index (`mizig=310`) | Records exist for surname + Uden (large set) | Primary — narrow with advanced-form fields |
| WieWasWie.nl (federated) | 19,460 surname documents | Primary for BS akten of the named individuals |
| Delpher newspapers | Confirmed Uden Burgerlijke Stand notices (1924, 1932, 1933) | Good for BS notices; **no 1950 emigration hit** |
| Emigration 1950 | Not in Archieven.nl free-text | Use Nationaal Archief NED index + BHIC persoonskaart + destination-country manifests |

**Key takeaway:** Archieven.nl *does* hold van Duijnhoven / Uden person records, but the free-text
surname+place search over-matches. The productive next step is the **advanced (Uitgebreid) form**
with Voornaam = Marianus / Johan and Plaats = Uden, on both Archieven.nl (`mizig=310`) and
WieWasWie, plus the Uden **bevolkingsregister/persoonskaart** at BHIC for the emigration record.
