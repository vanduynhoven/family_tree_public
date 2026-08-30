# Stiphout Baptism Search — Johanna van Duijnhoven (@I415@)

## Objective
Find the DTB baptism (doop) record for **Johanna (Joanna) van Duijnhoven** (@I415@),
born Stiphout c.1798–1802, daughter of **Joannis van Duijnhoven × Catharina Verbakel**
(Stiphout/Peelland line). Prior evidence was only the 1822 Bakel en Milheeze marriage
akte, which named the parents but gave no birth date.

## RESULT — ✅ BAPTISM FOUND (exact match)

**Doop, 18-1-1798, Stiphout**
- Child (Kind): **Joanna van Duijnhoven**
- Father (Vader): **Joannis Jan van Duijnhoven**
- Mother (Moeder): **Catrina Verbakel**
- Witnesses (Getuigen): Wilhelmus Verberne, Maria Verbakel
- Source: DTB Dopen, Regionaal Historisch Centrum Eindhoven (RHCe)
- OpenArchieven identifier: `rhe:18478871-4F9D-473B-9960-1E9642491D11`
- URL: https://www.openarchieven.nl/rhe:18478871-4F9D-473B-9960-1E9642491D11

Match confidence: **STRONG** — name, place (Stiphout), both parent names, and date
(within the estimated 1798–1802 window) all align with @I415@ and its 1822-marriage
parentage. The mother appears as "Catrina Verbakel" (Latinized DTB variant of the
1822 akte's "Catharina Verbakel"); father "Joannis Jan van Duijnhoven".

## Corroborating family record (same couple, sibling)
**Doop, 27-1-1800, Stiphout — Antonia van Duijnhoven**
- Father: Joannes Jan van Duijnhoven; Mother: Catrina Verbakel
- Witnesses: Leonardus Cuijpers, Maria Verbakel
- `rhe:0E43D3D5-A4AF-49ED-821E-F9A2899A09C9`
- https://www.openarchieven.nl/rhe:0E43D3D5-A4AF-49ED-821E-F9A2899A09C9

This second child of the identical parent pair in Stiphout independently confirms the
Joannis van Duijnhoven × Catrina Verbakel family was established there, strengthening
the identification of the 1798 Johanna as our @I415@.

## Search method (OpenArchieven API)
- `api.openarchieven.nl/1.0/records/search.json`
- The `place` parameter is silently ignored; the effective filter is **`eventplace`**
  (returned as a list, e.g. `["Stiphout"]`). Use `eventplace=Stiphout`.
- Records from this parish are held by **RHCe** (`rhe:` prefix), NOT BHIC (`bhi:`).
  Detail-page metadata fetches with the wrong prefix return HTTP 404.
- Winning query: name `Verbakel` / `Joannis van Duijnhoven`, `sourcetype=DTB Dopen`,
  `eventplace=Stiphout`, `year_from=1793`, `year_to=1808`, then matched the
  father="Joannis Jan van Duijnhoven" + mother="Catrina Verbakel" pair.

## GEDCOM changes applied
- `@I415@` (Johanna van Duijnhoven): added `BIRT` → `DATE 18 JAN 1798`,
  `PLAC Stiphout, Noord-Brabant, Netherlands` (place previously present, date new).
- Parents `@I416@` (Joannis) / `@I417@` (Catharina) and family `@F143@`
  (HUSB @I416@ / WIFE @I417@ / CHIL @I415@) were **already linked** from the 1822
  marriage work — no structural change needed.

## Suggested follow-ups (not yet done)
- Add sibling **Antonia van Duijnhoven** (b. 27-1-1800 Stiphout) as a CHIL of `@F143@`.
- Search Stiphout DTB Trouwen for the **Joannis van Duijnhoven × Catharina Verbakel
  marriage** (likely c.1795–1797, before the Jan 1798 first child) to date/place the
  union and capture the couple's own parents.
- Look for further siblings 1801–1815 in Stiphout under the same parent pair.

---
_Search run: 2026-08-30. Source portal: OpenArchieven (openarchieven.nl / RHCe DTB Dopen Stiphout)._
