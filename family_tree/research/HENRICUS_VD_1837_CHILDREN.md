# Children of Hendricus van Duijnhoven (1837) × Anna Maria van der Wijst

**GEDCOM refs:** Father `@I053@` · Mother `@I411@` · Marriage family `@F140@`
**Source:** Brabants Historisch Informatie Centrum (BHIC) BS Geboorte, via OpenArchieven.
**Evidence strength:** `strong` — all 8 births are primary civil-registration birth aktes
(BS Geboorte) that name BOTH parents as *Vader* = Hendricus van Duijnhoven and
*Moeder* = Anna Maria van der Wijst, in Uden, across the couple's fertile window
(1867–1879), immediately following their marriage.

## The couple
- **Hendricus van Duijnhoven** (`@I053@`, b.1837 Uden, d.1910) — brother of Martinus
  (`@I003@`, our direct ancestor), son of Petrus van Duijnhoven (Gen1) × Johanna van
  der Heijden.
- **Anna Maria van der Wijst** (`@I411@`, F) — daughter of Albertus van der Wijst &
  Wilhelmina Ketelaars.
- **Marriage:** 16 Jun 1866, Uden (akte `bhi:6e97dead-495c-43d2-bafe-8b172cd57263`).
  Note: the task brief cited "12 June 1866"; the existing GEDCOM marriage record and
  the marriage akte record 16 Jun 1866 — kept as recorded (16 JUN 1866). No
  independent source found supporting the 12th; treat 16 Jun as authoritative.

## Confirmed children (8)
All born in Uden, Noord-Brabant. Each verified via the OpenArchieven `records/show`
API confirming `Vader`/`Moeder`/`Kind` roles on the akte.

| # | Child | Sex | Birth | Akte (Uden) | OpenArchieven identifier | GEDCOM |
|---|-------|-----|-------|-------------|--------------------------|--------|
| 1 | Willem van Duijnhoven | M | 16 Jun 1867 | 65/1867 | `bhi:57dfebfc-d86c-edd7-3944-83aa4f8a15ce` | `@I465@` (new) |
| 2 | Lambertus van Duijnhoven | M | 20 Jan 1869 | 11/1869 | `bhi:e802e21a-8369-9d49-ed3e-a95611cd3a04` | `@I466@` (new) |
| 3 | Ardina van Duijnhoven | F | 28 Oct 1870 | 132/1870 | `bhi:4588505c-22f0-4b36-8800-905bc853a209` | `@I467@` (new) |
| 4 | Adrianus van Duijnhoven | M | 12 Nov 1871 | 120/1871 | `bhi:ee7e8baf-c7fb-72fb-8e8f-7f9a0685dff7` | `@I468@` (new) |
| 5 | Hendrica van Duijnhoven | F | 2 Feb 1873 | 19/1873 | `bhi:07d6e155-35b0-3363-2d4c-878450e0f6f4` | `@I469@` (new) |
| 6 | **Johanna van Duijnhoven** | F | **12 Mar 1875** | 29/1875 | `bhi:8850fac1-9be3-ace5-ae04-3a35a4d43d94` | `@I410@` (existing — birth added) |
| 7 | Peter van Duijnhoven | M | 21 Jun 1877 | 81/1877 | `bhi:e7768f71-1361-83d4-fb14-32a9538d9660` | `@I470@` (new) |
| 8 | Franciscus van Duijnhoven | M | 26 Nov 1879 | 167/1879 | `bhi:d40f1e38-4955-9f3f-281e-128b9a5790a2` | `@I471@` (new) |

### Johanna (#6) — the endogamy link
Johanna (`@I410@`) already existed in the GEDCOM as the confirmed daughter who married
Hendricus Wassenberg (12 Feb 1909, Uden). Her birth (12 Mar 1875, akte Uden 29/1875)
was previously unrecorded and has now been added, confirming her as the 6th child of
this couple. Her son Hendricus Johannes Wassenberg (`@I041@`) married Riek van
Duijnhoven (`@I018@`) in 1946 — the confirmed second-cousin (endogamous) marriage
within the van Duijnhoven line. See `research/WASSENBERG_VD_CONNECTION.md`.

## Search methodology
1. Broad `van Duijnhoven` births in Uden returned 492 hits — too coarse.
2. Filtered by `relationtype=Moeder`, `name=Anna Maria van der Wijst`, `eventplace=Uden`.
   "Anna Maria van der Wijst" is a common name (83 mother-records nationally; 39 in
   Uden), so metadata descriptions and the `records/show` API were used to confirm the
   father on every candidate.
3. Cross-checked with `relationtype=Vader`, `name=Hendricus van Duijnhoven`,
   `eventplace=Uden` (25 hits) → the "Wijst"-mother subset returned exactly the same
   8 children, confirming completeness (no additional births in 1866 or 1880+).
   Other Uden "Anna Maria van der Wijst" mother-records in this window belonged to a
   different couple (father **Martinus** van der Wijst) and were correctly excluded.

## GEDCOM changes applied
- Added 7 new INDI records `@I465@`–`@I471@`, each with `SEX`, `BIRT` (date + Uden),
  a sourced `NOTE` citing the birth akte, and `FAMC @F140@`.
- Added 7 reciprocal `CHIL` links to family `@F140@` (now lists all 8 children:
  `@I410@`, `@I465@`–`@I471@`).
- Added birth (`12 MAR 1875`, Uden) to existing `@I410@` Johanna and appended a
  sourcing note.
- Integrity re-verified: no dangling INDI/FAM references; reciprocal FAMC⇄CHIL intact.

## Open / not pursued
- Death dates, later marriages, and descendants of children 1–5, 7, 8 (Willem,
  Lambertus, Ardina, Adrianus, Hendrica, Peter, Franciscus) were not researched —
  out of scope for this task (adding the children). These are candidate follow-ups.
