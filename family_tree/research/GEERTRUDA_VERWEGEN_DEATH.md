# Geertruda (Geertruij) Verwegen — Death Record Research

**Person:** `@I004@` Geertruda Verwegen
**Born:** 7 Sep 1833, Uden, Noord-Brabant
**Married:** 17 Feb 1858, Uden, to Martinus van Duijnhoven (b. 18 Dec 1829, Uden)
**Source consulted:** BHIC / OpenArchieven direct API search (`api.openarchieven.nl/1.0/records`)
**Date of research:** 2026-08-30

## Verdict

**Death record NOT FOUND in BHIC / OpenArchieven. GEDCOM left unchanged (no strong evidence to record).**

The FamilySearch death date of **9 Mar 1942 (G9QG-HXD) is rejected** — a woman born in 1833 dying in 1942 would be 108 years old; this is almost certainly a conflation with a descendant of the same name. WieWasWie's null result for 1890–1910 is consistent with the findings below.

## Identity confirmation (STRONG)

The 1858 marriage record was retrieved in full and confirms the exact person and canonical spelling used by BHIC:

- **bhi:056b95f5-6d55-d22a-95e7-1a87ac4d04c4** — BS Huwelijk, Uden, 17-2-1858, akte 9
  - Bride: **Geertruij Verwegen**, born **7-9-1833, Uden** (exact match to @I004@)
  - Groom: **Martinus van Duijnhoven**, born 18-12-1829, Uden
  - Her parents: father **Johannes Verwegen**, mother **Joanna van der Heijden**
  - Groom's parents: Petrus van Duijnhoven × Mechelina van den Berk

**Canonical BHIC first-name spelling is `Geertruij`** (not Geertruda/Geertrui/Geertruida). Her indexed surname as deceased would be the maiden name **Verwegen** (Dutch death acts index the maiden name).

## Latest confirmed-alive evidence (MODERATE)

She appears as mother in her children's marriage records through at least **1906**:

- **bhi:8fa5432c-ea3a-7dd1-ae83-212d1acf6c0d** — BS Huwelijk Uden 22-1-1904: daughter Petronella van Duijnhoven marries Franciscus van der Burgt; parents listed = Martinus van Duijnhoven × Geertruij Verwegen.
- **bhi:92ef5014-4911-89fe-9f0a-d2713aecdd63** — BS Huwelijk Uden 18-5-1906: son Marianus van Duijnhoven marries Anna Maria van den Elzen; parents = Martinus van Duijnhoven × Geertruij Verwegen.

(The index does not flag parents as living/deceased, so these do not *prove* she was alive, but they establish the family context. Her death is therefore most plausibly **after 1906**.)

## Searches performed (all negative for her death)

| # | Query | Result |
|---|-------|--------|
| 1 | `Geertruda Verwegen` BS Overlijden, Uden, 1895–1910 | 0 |
| 2 | `Geertrui Verwegen` BS Overlijden Overledene | only OTHER people (deceased were their children; "Geertrui" was the *Moeder*) |
| 3 | `Geertruda/Geertruij/Geertrui Verwegen` **Overledene** (any year, any place) | Only **1** hit: bhi:d6c3ced8… (29-1-1842 Uden) — a *different* Geertruij Verwegen who died in 1842, **before** our person married in 1858. Not her. |
| 4 | `Geertruda van Duijnhoven` / `Geertruij van Duijnhoven` Overledene (married name) | Hits are all other women (e.g. Veghel 1848, Spaarnwoude 1829) — none match b.1833 / spouse Martinus. |
| 5 | **ALL 316 `Verwegen` BS Overlijden Overledene records (entire OpenArchieven, any place)** — client-side filter for any first name starting `Geertru` | **ZERO matches.** No deceased Verwegen with a "Geertru*" given name exists in the index apart from the 1842 child. |
| 6 | `Geertruda Verwegen` all record types 1858–1910 | Only a Bevolkingsregister (Volkel 1840-49, a child aged 6 — likely a namesake) and unrelated Geboorte-as-Moeder entries. |

### Decisive negative
Search #5 is conclusive for this source: across **every** Verwegen death record indexed as *Overledene* anywhere in BHIC/OpenArchieven, **none** carries a "Geertru*" first name except the 1842 infant/child death. Our Geertruij Verwegen (b.1833) has **no death record indexed in OpenArchieven**.

## Interpretation

- Her death almost certainly occurred **after 1906** (children still marrying with her named as parent).
- BHIC's BS Overlijden index for Uden and neighbouring municipalities appears to **not contain her death act** in the currently-indexed/scanned range — either it falls in a period not yet digitised/indexed on OpenArchieven, was registered in a municipality not covered, or is mis-indexed under a spelling no reasonable variant search reaches.
- The FamilySearch 1942 date is spurious for a 1833-born person and should not be entered.

## Recommended next actions (outside OpenArchieven API)

1. **BHIC Uden death registers, post-1906** — browse the akte scans directly on bhic.nl / the Memorix deed viewer for Uden BS Overlijden ~1907–1925, filtered by the surviving-spouse/parent names (Martinus van Duijnhoven, Johannes Verwegen × Joanna van der Heijden). Index gaps are common for early-20th-century Uden.
2. **Find Martinus van Duijnhoven's (b.1829) death first** — his death act names her as spouse (living or "weduwe/widower of"), which brackets her death relative to his. His death was not located in this pass either and warrants a dedicated search.
3. **Bevolkingsregister Uden 1890–1920** — the household register records the last date she was recorded resident and often the "vertrek/overleden" annotation with a date.
4. Cross-check **WieWasWie** and **AlleFriezen/BrabantsErfgoed** with the exact spelling `Geertruij Verwegen` and the post-1906 window.

## GEDCOM status
`@I004@` death fields **NOT updated** — no record met the "strong evidence" bar. Do not enter the FamilySearch 1942 date.
