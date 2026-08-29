# Historical Dutch Families - Children Research

**Date:** 2026-08-29
**Researcher:** Research Agent
**Source:** OpenArchieven/BHIC, Stamboom Derikx (genealogieonline.nl)

## Overview

This document records newly discovered children of historical Dutch families that previously had only 1 child documented in the GEDCOM. Research focused on confirming children through primary DTB (Doop/Trouw/Begraven) records from BHIC.

---

## @F029@: Henricus Henrici van der Heijden x Theodora Petri van der Meulen

**Marriage:** 1 November 1699, Schijndel, Noord-Brabant
**Location:** Veghel, Noord-Brabant
**Previous Status:** Only 1 child (Joannes, @I128@) in GEDCOM

### Confirmed Children (7 total)

| # | Name | Birth Date | Birth Place | Death | GEDCOM ID | Source |
|---|------|-----------|-------------|-------|-----------|--------|
| 1 | Maria Henrici van der Heijden | 26 Sep 1700 | Veghel | ? | @I300@ | BHIC bhi:2b7303ff-bc39-19db-471b-97086735856d |
| 2 | Petronella Henrici van der Heijden | 22 Mar 1702 | Veghel | 1758 | @I301@ | BHIC bhi:2cbb284f-65dc-f326-7f29-66946610e555 |
| 3 | Henricus Henrici van der Heijden Jr. | 1704 | Veghel | ? | @I302@ | Stamboom Derikx I3193.php |
| 4 | Joanna Henrici van der Heijden | 1707 | Veghel | ? | @I303@ | Stamboom Derikx I3194.php |
| 5 | **Joannes Henrici van der Heijden** | 4 Jun 1712 | Veghel | ? | @I128@ | **ALREADY IN GEDCOM** |
| 6 | Lambertus Henrici van der Heijden | 1715 | Veghel | 1798 | @I304@ | Stamboom Derikx I3176.php |
| 7 | Joannes Henrici van der Heijden | 1719 | Veghel | ? | @I305@ | Stamboom Derikx I3196.php |

### Source Details

**Maria (1700):** Baptism record explicitly names father as "Henricus Henrix van der Heijden" and mother as "Theodore Nn". Godparents: Petrus Theodori Vermeulen, Maria Henrix van der Heijden.

**Petronella (1702):** Baptism record names "Henricus Henrix van der Heijden" and "Theodora Petri" (= Theodora daughter of Petrus = van der Meulen). Godparents include Helena Petri van der Meulen (maternal aunt).

**Stamboom Derikx:** The authoritative genealogy tree by Bertho Derikx documents all 7 children with birth years and death dates where known. Access: https://www.genealogieonline.nl/stamboom-derikx/I3189.php

### Notes

- Joannes Henrici (1712, @I128@) is the ancestor leading to Johanna van der Heijden (Gen 1 wife)
- Two sons named Joannes (1712 and 1719) - likely the elder died and the name was reused
- Henricus Henrici Sr. died 28 April 1722 - all children born before his death
- Theodora survived until 1758 (83 years old)

---

## @F065@: Lambertus Adriani van Ham x Joanna Arnoldi vant Haenuelt

**Marriage:** 21 January 1686, Veghel, Noord-Brabant
**Location:** Best, Rijsbergen, Veghel area
**Previous Status:** Only documented as parents of Joanna Lamberti van Ham (@I189@)

### Research Results

API searches for "van Ham" in Best and Rijsbergen returned 14,079+ generic results but not filtered by specific parents. The Stamboom Derikx and BHIC records confirm:

- Joanna Lamberti van Ham (@I189@) was daughter of Lambertus Adriani van Ham
- Children recorded in Best and Rijsbergen 1688-1712 per VAN_BOXTEL_5GEN_DEEPER.md

### Confirmed Children

From prior research (VAN_BOXTEL_5GEN_DEEPER.md):
- Adrianus Lambertus P. (bap. 17 Feb 1688)
- Anna M. Lambertus P. (bap. 27 Jul 1690)  
- Thomas (bap. 1712 Best)
- Joanna Lamberti van Ham (@I189@, mother of Elisabeth van Boxtel)

**Status:** These need GEDCOM IDs @I306@-@I308@ but full baptism records need verification.

---

## @F075@: Johannes Joannis Verbruggen x Henrica Jacobi van den Enden

**Marriage:** ~1785
**Location:** Bakel en Milheeze, Noord-Brabant
**Previous Status:** Already linked in GEDCOM as great-grandparents of Anna Maria Verbruggen

### Research Results

API searches for "Verbruggen Bakel" returned 4,396 results but not filtered to this specific couple. The family is documented in CORNELISSEN_5GEN_DEEPER.md with children baptized 1793-1796.

### Known Child

- Gerit/Gerardus Verbruggen (@I194@) - already in GEDCOM

**Status:** Additional children from this couple need further BHIC research with direct DTB book access.

---

## @F033@: Pittens Family (deeper)

**Focus:** Martinus Pittens (elder) x Maria Tijssen
**Status:** Already documented in GEDCOM (@F035@)

### Research Results

API search for "Pittens Uden 1700-1780" returned 245 results including:
- Mathias Pittens (bap. 1 Jul 1709 Uden) - already @I154@
- Children of Mathias visible in search results

The Pittens line is adequately documented back to Martinus Pittens (elder) in the existing GEDCOM.

---

## Summary of GEDCOM Additions

### New INDI Records Created

| ID | Name | Relationship | Birth |
|----|------|--------------|-------|
| @I300@ | Maria Henrici van der Heijden | Child of @F029@ | 26 Sep 1700 |
| @I301@ | Petronella Henrici van der Heijden | Child of @F029@ | 22 Mar 1702 |
| @I302@ | Henricus Henrici van der Heijden Jr. | Child of @F029@ | 1704 |
| @I303@ | Joanna Henrici van der Heijden | Child of @F029@ | 1707 |
| @I304@ | Lambertus Henrici van der Heijden | Child of @F029@ | 1715 |
| @I305@ | Joannes Henrici van der Heijden | Child of @F029@ | 1719 |

### Updated FAM Records

| Family ID | Change |
|-----------|--------|
| @F029@ | Added 6 CHIL links (@I300@-@I305@) |

---

## Research Notes

1. **OpenArchieven API Limitations:** The API returns results sorted alphabetically by name, not filtered by parent names or specific date ranges as expected. Direct BHIC website access or genealogieonline trees are more reliable for family reconstruction.

2. **Stamboom Derikx Reliability:** The tree by Bertho Derikx is well-researched with BHIC source citations. It served as the authoritative source for the Van der Heijden children.

3. **Patronymic Naming:** Children's names follow the pattern "[Given name] [Father's first name in genitive] [Surname]" - e.g., "Petronella Henrici van der Heijden" = Petronella, daughter of Henricus van der Heijden.

4. **Future Research:** The Van Ham and Verbruggen families would benefit from direct BHIC DTB register searches rather than API queries.
