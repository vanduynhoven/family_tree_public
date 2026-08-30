# 1769 dispensation deed scan — access attempt (van de Weyer × Biemans common ancestor)

**Task:** Access the scan of the 1769 Joost (Judocus) van de Weyer × Josina (Justina)
Biemans marriage deed (Bakel en Milheeze, 5 Feb 1769), which carries a **3rd/4th-degree
consanguinity dispensation**, to read the deed text and identify the shared common ancestor.

**Verdict:** The deed record and its dispensation clause were **located and confirmed**,
but the **actual page-image scan is gated behind a FamilySearch free-account sign-in wall**
and could not be opened anonymously via the browser. Independently of access, the record's
own **full index transcription names no ancestor** — Dutch RK marriage acts of this period
record the *fact and grade* of the impediment but do **not** name the linking forebear.
The common ancestor therefore remains **unidentifiable from this document**; identifying it
requires the diocesan ('s-Hertogenbosch officialaat) dispensation register, not this parish act.

Research date: 2026-08-30. Method: BHIC memorix + OpenArchieven via attached Chrome (playwright-cli).

---

## 1. What was accessed and confirmed

**Record (RK marriage act):** `bhi:2a97eecb-8227-8cf9-51de-a4e40bcfbceb`
- OpenArchieven detail page: `https://www.openarchieven.nl/bhi:2a97eecb-8227-8cf9-51de-a4e40bcfbceb`
- BHIC memorix deed page: `https://www.bhic.nl/memorix/genealogy/search/deeds/2a97eecb-8227-8cf9-51de-a4e40bcfbceb`

Both pages loaded successfully and display the complete indexed content of the deed:

| Field | Value |
|---|---|
| Type | DTB trouwakte (RK marriage act) |
| Date | 05-02-1769 |
| Place | Bakel en Milheeze |
| Source | Rooms-Katholiek doop- en trouwboek 1686-1795, **folio 321**, inv. nr. 1 |
| Repository | Gemeentearchief Gemert-Bakel |
| Bruidegom (groom) | **Judocus van de Weyer** |
| Bruid (bride) | **Justina Biemans** |
| **Impediment clause** | **"Dispensatie in de 3e en 4e graad van bloedverwantschap."** |

The dispensation clause is present **verbatim in the searchable index/transcription itself**
— it is not hidden in the image. It states only the *grade* (3rd/4th degree consanguinity),
**not** the name of the common ancestor.

## 2. The actual page-image scan — access blocked

BHIC does not host the page image itself. Its memorix deed page routes to FamilySearch:

> "Blader hier door het gescande register met daarin deze akte op de website van Familysearch"
> ("Browse the scanned register containing this act on the FamilySearch website")

**Scan (register film) link:**
`https://familysearch.org/pal:/MM9.3.1/TH-1961-31040-17086-92?cc=2037960&wc=MMBZ-QMS:907330168`
→ redirects to image ARK `https://www.familysearch.org/ark:/61903/3:1:3QS7-89QX-2V1N?cc=2037960`

Attempting to open the ARK anonymously in the attached browser returned only the site
chrome/footer — the image-viewer body is an **authentication-gated SPA**. FamilySearch
requires a (free) signed-in account to view DTB record images; without a logged-in session
the viewer does not render, and repeated loads dropped the browser relay (heavy auth-gated
JS). **No image bytes were retrievable in this session.**

The "Scanned records" block on OpenArchieven points to the same FamilySearch film browsers
(Bakel en Milheeze RK "Trouwen 1686-1795", and the 1748-178x film), all requiring the same
FamilySearch login.

## 3. Why the scan would not name the ancestor anyway

Even with a FamilySearch login to open folio 321, the **parish (RK) marriage act** of this
era in the Meierij typically records, for a dispensed marriage, only:
- the two spouses' names,
- the marriage date and witnesses,
- a marginal/inline note of the impediment and its grade (exactly the "3e en 4e graad
  van bloedverwantschap" already transcribed in the index).

Parish acts of 1769 Bakel do **not** spell out the intervening lineage. The document that
records the *gradus consanguinitatis* **with the connecting names** is the separate
**diocesan dispensation register** kept by the ‘s-Hertogenbosch officialaat / apostolic
vicariate — which is a different archive series, not this Gemert-Bakel parish film.

This corroborates the prior conclusion in
`research/VAN_DE_WEYER_BIEMANS_CONSANGUINITY.md`: the fact of a shared ancestor is `strong`;
the ancestor's identity is unrecoverable from the parish/index sources.

## 4. Answer

- The 1769 dispensation deed record **was accessed** (index + BHIC deed page): it confirms a
  **3rd/4th-degree consanguinity dispensation** for Judocus van de Weyer × Justina Biemans,
  Bakel, 5 Feb 1769, RK trouwboek folio 321.
- The **page-image scan is only on FamilySearch behind a free sign-in wall** and could not be
  opened anonymously in this session.
- **The common ancestor is NOT named** in this deed / its index, and per the record type would
  not be named even in the image. It remains unidentified.
- **No GEDCOM change** is warranted — adding a common-ancestor individual would require
  inventing an unsourced person. (Setup harness `GEDCOMUpdater` was not invoked; no `add_individual`.)

## 5. Concrete next steps to actually name the ancestor

1. **Log in to FamilySearch (free account)** and open folio 321 on film
   `TH-1961-31040-17086-92` (cc=2037960) to read the Latin marginal dispensation note — low
   probability of naming the ancestor, but it may cite the officialaat dispensation number.
2. **‘s-Hertogenbosch diocesan / officialaat dispensation registers, 1768-1769** (via BHIC
   studiezaal, toegang for the bisdom 's-Hertogenbosch / vicariate) — the single document type
   that records consanguinity dispensations *with the intervening lineage*. This is the
   authoritative source to name the ancestor.
3. Fill the pre-1740 Bakel RK gap for **Mathias van de Weyer's marriage (~1720s)** and
   **Judocus Biemans's baptism (~1705-1712)** — the two links that, climbed one generation,
   meet at the c. 1640-1675 common ancestor.

---
*Sources: openarchieven.nl (`bhi:2a97eecb-8227-8cf9-51de-a4e40bcfbceb`); bhic.nl memorix deed
page; familysearch.org film TH-1961-31040-17086-92 (login-gated). Prior:
`research/VAN_DE_WEYER_BIEMANS_CONSANGUINITY.md`, `research/MATHIAS_JUDOCUS_PARENTS.md`.
Researched 2026-08-30 via attached-browser BHIC access.*
