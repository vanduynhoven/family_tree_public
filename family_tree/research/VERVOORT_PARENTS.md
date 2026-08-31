# Parents of Anna Maria Vervoort (@I504@)

**Goal:** add Johannes Vervoort × Barbara van der Brugge to the GEDCOM as parents of
Anna Maria Vervoort (@I504@, b. 14 Apr 1922, Zijtaart/Veghel; d. 3 Jul 1999, Volkel).

**Result:** added and cross-linked.

| Record | ID | Detail |
|--------|----|--------|
| Father | `@I505@` | Johannes Vervoort, b. c.1886 Veghel |
| Mother | `@I506@` | Barbara van der Brugge, b. c.1887 Veghel |
| Family | `@F176@` | Marriage 11 May 1914, Veghel; child `@I504@` |

`@I504@` now carries `1 FAMC @F176@`; `@F176@` carries `1 CHIL @I504@`; both parents
carry `1 FAMS @F176@`. GEDCOM totals after edit: **456 individuals, 149 families.**

## Evidence — strength: STRONG (corroborated by 3 independent civil records)

### 1. Birth akte of Anna Maria (the seed)
- Geboorte 14 Apr 1922, Veghel. Vader **Johannes Vervoort**, Moeder **Barbara van der Brugge**.
- Brabants Historisch Informatie Centrum, BS Geboorte, Deel 3302, Periode 1922, archief 550, aktenummer 58 (registered 15 Apr 1922).
- https://www.openarchieven.nl/bhi:843dd36b-b970-819f-25da-40df144b3d68
- Note: the akte lists only the parents' names — no ages/birth years.

### 2. Marriage akte (source of dates & grandparents)
- Huwelijk **11 May 1914, Veghel**, aktenummer 14 (BS Huwelijk, archief 550, deel 3312).
- **Bruidegom:** Johannes Vervoort, *geboren te Veghel, 28 jaar oud* → b. c.1886.
  - Parents (paternal grandparents of Anna Maria): **Petrus Vervoort × Johanna Maria Vogels**.
- **Bruid:** Barbara van der Brugge, *geboren te Veghel, 27 jaar oud* → b. c.1887.
  - Parents (maternal grandparents): **Bastiaan van der Brugge × Maria van Asseldonk**.
- https://www.openarchieven.nl/bhi:4cd1a931-3c60-8865-b44e-8df8ef04fea4

### 3. Corroborating child births (same couple, Veghel)
The couple search `Johannes Vervoort & Barbara van der Brugge` returned 20 Veghel
person-mentions for this pair. Confirmed sibling of Anna Maria:
- **Leonardus Ambrosius Vervoort**, b. 1 Nov 1919, Veghel, akte 174
  (https://www.openarchieven.nl/bhi:0385c733-2836-073b-61cc-41aaf6e9df94).
- Additional Vervoort births with father Johannes Vervoort at Veghel appear
  15 Mar 1915, 18 Mar 1916, 12 Dec 1920 — consistent with a growing family
  1915–1922, giving Anna Maria several older siblings (not yet added).

## Method
1. `web_fetch` on the 1922 birth akte confirmed the parent names verbatim.
2. Two-person search `Johannes Vervoort & Barbara van der Brugge` on openarchieven
   (the `&` operator does relational person search) located the 1914 marriage and
   the sibling births.
3. `scripts/gedcom_update.py` `GEDCOMUpdater` used to add two individuals, the
   marriage family, and the FAMC/FAMS/CHIL links. Atomic write with timestamped `.bak`.
4. Post-write regex verification confirmed all cross-links and the intact `0 TRLR`.

## Open leads (not yet actioned)
- Add the confirmed sibling Leonardus Ambrosius Vervoort (b.1919) and the other
  1915–1920 Vervoort children as children of `@F176@`.
- Extend the tree upward: paternal grandparents Petrus Vervoort × Johanna Maria Vogels,
  and maternal grandparents Bastiaan van der Brugge × Maria van Asseldonk (both Veghel).
- Locate individual birth akten for Johannes (c.1886) and Barbara (c.1887) to firm up
  the estimated birth years to exact dates.
