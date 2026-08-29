# WieWasWie / archieven.nl — van Duijnhoven family search

_Generated: 2026-08-28_

## Summary

WieWasWie.nl's person search has been migrated onto the **archieven.nl** platform
(operated by the same body, CBG / DE REE). When you run a name search on
`wiewaswie.nl/nl/zoeken/`, the front-end calls `archieven.nl`'s person index
(`mizig=310`) behind the scenes. The stable, linkable search endpoint is therefore:

```
https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=0&miview=tbl&milang=nl&mizk_alle=<query>
```

- `mizig=310` = Personen (person records) source
- `miview=tbl` = table view (Voornaam / Achternaam columns)
- `mizk_alle=` = free-text "all fields" query (space-separated terms are AND-ed)
- `mistart=N` = pagination offset (rows per page = 20)

A broad `Duijnhoven Uden` person query returns **~263 pages** of hits, confirming the
family surname is well represented in the Uden registers.

## ⚠️ Automated extraction blocker (read this)

I could NOT scrape the individual record rows automatically in this environment.
The person-result rows are injected by JavaScript (AJAX) into a `[beacon]`
placeholder **after** page load, so:

- `web_fetch` returns only the pre-JS page shell + pagination — no record rows.
- The in-panel browser renders the rows visually, but they are non-semantic
  markup that does not surface in the accessibility snapshot, and the panel
  navigation was unstable (repeatedly bounced to archieven.nl / delpher.nl).
- `playwright-cli`'s bundled Chromium crashed on launch in this sandbox.

In addition, full record detail (scans, exact dates, parents) on archieven.nl
often sits behind **"Mijn Studiezaal (inloggen)"** — a free CBG/archieven.nl
account. Open the URLs below in your own logged-in browser to read the actual
records and akte scans.

## Ready-to-open search URLs (per target person)

Open each in a browser (log in to Mijn Studiezaal / CBG for scans):

### Johan van Duijnhoven — b. 12 Nov 1915, Uden
- Broad: https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=0&miview=tbl&milang=nl&mizk_alle=Johan+Duijnhoven+Uden
- With year: https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=0&miview=tbl&milang=nl&mizk_alle=Johan+Duijnhoven+Uden+1915
- WieWasWie front-end: https://www.wiewaswie.nl/nl/zoeken/ (search: achternaam=Duijnhoven, tussenvoegsel=van, voornaam=Johan, plaats=Uden)

### Marianus van Duijnhoven — b. 24 Apr 1872 Uden, d. 20 May 1949
- Broad: https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=0&miview=tbl&milang=nl&mizk_alle=Marianus+Duijnhoven+Uden
- Birth 1872: https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=0&miview=tbl&milang=nl&mizk_alle=Marianus+Duijnhoven+Uden+1872
- Death 1949: https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=0&miview=tbl&milang=nl&mizk_alle=Marianus+Duijnhoven+1949+overlijden

### Anna Maria van den Elzen — d. 21 Dec 1952
- Broad: https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=0&miview=tbl&milang=nl&mizk_alle=Anna+Maria+van+den+Elzen
- Death 1952: https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=0&miview=tbl&milang=nl&mizk_alle=Anna+Maria+Elzen+1952+overlijden

### Anna Maria Cornelissen — b. 30 Sep 1916, Bakel
- Broad: https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=0&miview=tbl&milang=nl&mizk_alle=Anna+Maria+Cornelissen+Bakel
- Birth 1916: https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=0&miview=tbl&milang=nl&mizk_alle=Anna+Maria+Cornelissen+Bakel+1916

## Recommended search strategy on the live site

For Uden / Bakel records the responsible archive is **BHIC** (Brabants Historisch
Informatie Centrum). Fastest reliable path:

1. Go to **https://www.bhic.nl** → "Zoeken in personen" (the BHIC has the Uden and
   Bakel burgerlijke stand + DTB registers directly, with free scan viewing).
2. Or use archieven.nl advanced person search and filter by:
   - Achternaam: `Duijnhoven` (also try variant `Duinhoven`, `van Duijnhoven`)
   - Plaats: `Uden` (Marianus, Johan) / `Bakel` (Anna Maria Cornelissen)
   - Periode: narrow to the known year ±1 to cut the ~263 pages down.
3. Record types to expect:
   - **Geboorteakte** (birth) — Johan 1915 Uden; Marianus 1872 Uden; A.M. Cornelissen 1916 Bakel
   - **Huwelijksakte** (marriage) — Marianus × Anna Maria van den Elzen; Johan × A.M. Cornelissen
   - **Overlijdensakte** (death) — Marianus 1949; A.M. van den Elzen 1952

## Records actually confirmed via automated run

None of the individual record rows could be read automatically (see blocker above).
Only the search-result *counts* were observable (e.g. `Duijnhoven Uden` → ~263
pages of person hits). No akte numbers, archive inventory numbers, or scan URLs
were retrievable without a rendering browser + Mijn Studiezaal login.

## Next steps to complete this

- Log in to Mijn Studiezaal (free) and open the per-person URLs above; each hit
  row links to a detail page with the akte, archive (toegang/inventaris nr) and scan.
- Alternatively run this from a machine where `playwright-cli` / a headed browser
  works, and I can extract the rendered rows and akte URLs directly.
