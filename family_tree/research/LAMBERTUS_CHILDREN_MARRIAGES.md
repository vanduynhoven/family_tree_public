# Marriages of Lambertus van Duijnhoven's Children

**Parents:** Lambertus van Duijnhoven (@I166@, b.1861 Uden, d.1932) × Maria van Deursen (@I392@, b.1868, d.1947)
**Family record:** @F039@
**Research date:** 2026-08-30
**Primary source:** OpenArchieven / Brabants Historisch Informatie Centrum (BHIC), BS Huwelijk (civil marriage registers). Each marriage act names BOTH parents of the bride/groom, which is how each match to Lambertus + Maria van Deursen was positively confirmed.

## Method note
The OpenArchieven API (`records/search.json`) honours only `name` + `sourcetype`; the `place`, `year_from/to`, and `relationname` parameters were ignored, and each name query returns at most ~25 alphabetically-sorted records. Matches were therefore confirmed by fetching each candidate record's meta description (which lists both spouses' parents) and keeping only those naming **Lambertus van Duijnhoven & Maria van Deursen**. The family clearly clustered its marriages in **Boekel** (adjacent to Uden).

## Confirmed marriages (added to GEDCOM)

| Child | GEDCOM | Spouse | Date | Place | Spouse's parents | Source (bhi:) |
|-------|--------|--------|------|-------|------------------|---------------|
| Geertruda van Duijnhoven (b.1901) | @I168@ → fam @F128@ | **Petrus Janssen** (@I395@) | 11 May 1928 | Boekel | Martinus Janssen & Antonetta Timmers | 82722acb-333f-0a6e-5502-463d2a151db1 |
| Francisca van Duijnhoven (b.1904) | @I170@ → fam @F129@ | **Cornelis van der Wijst** (@I396@) | 22 Apr 1932 | Boekel | Johannes van der Wijst & Francina van den Biggelaar | 1ace3557-dd92-3032-074e-7ca299390070 |
| Martina van Duijnhoven (b.1903) | @I169@ → fam @F130@ | **Wilhelmus van den Heuvel** (@I397@) | 11 May 1937 | Boekel | Johannes Hendricus van den Heuvel & Maria van Dijk | 98c1289c-4629-11e3-a747-d206bceb4d38 |
| Martinus van Duijnhoven (b.1912) | @I173@ → fam @F131@ | **Ardina van Melis** (@I398@) | 25 Apr 1945 | Boekel | Gijsbertus van Melis & Petronella Gijsbers | 05313ef6-c209-3b03-3c36-021a9a9f4718 |
| **Antonia van Duijnhoven** (NEW, @I399@) → fam @F132@ | added as CHIL of @F039@ | **Johannis Sleegers** (@I400@) | 13 Apr 1944 | Boekel | Martinus Johannes Sleegers (+ mother not captured) | da72f1af-75eb-37e2-50a2-88db4bd46d9c |

### Already in GEDCOM before this research
| Child | GEDCOM | Spouse | Date | Place |
|-------|--------|--------|------|-------|
| Petrus Johannes "Piet" van Duijnhoven (b.1908) | @I171@ → fam @F127@ | Johanna Wilhelmina van Lankvelt (@I394@) | 1 May 1945 | Erp |

## The "Antonia" finding
The 13 Apr 1944 Boekel act names a bride **Antonia van Duijnhoven**, daughter of **Lambertus van Duijnhoven & Maria van Deursen** — positively the same parents. She was **not** among the 7 previously-recorded surviving children (Adriana, Geertruda, Martina, Francisca, Petrus Johannes, Johanna, Martinus). She has been added as an 8th child (@I399@) of @F039@ with a NOTE flagging the ambiguity. Two possibilities:
1. She is a genuine additional child not previously captured; **or**
2. She is a name variant / registration name of one of the listed daughters — most plausibly **Johanna (b.1911)**, given the 1944 marriage date fits a younger daughter and Johanna otherwise has no located marriage.

This should be reconciled against a baptism/birth record or the Teunissen genealogy before treating @I399@ as definitively distinct from @I172@ (Johanna).

## Not yet located
| Child | GEDCOM | b. | Status |
|-------|--------|----|--------|
| Adriana van Duijnhoven | @I167@ | 1898 | **No marriage confirmed.** All "Adriana van Duijnhoven" marriage acts reachable via the API named different parents (e.g. Antonius v.D. × Maria van Schijndel, 1922 Uden; Adriana Gijsberdina, mother Johanna van Doorn, 1936 Erp). May have married outside the API's returned window, married elsewhere, remained unmarried, or died young. |
| Johanna van Duijnhoven | @I172@ | 1911 | **No marriage confirmed under the name "Johanna."** See the Antonia finding above — the 1944 Sleegers marriage may in fact be hers. |

## Ruled OUT (different parents)
- Adriana Gijsberdina v.D. × Michiel Verbakel, 24 Jan 1936 Erp — parents Petrus v.D. × Johanna van Doorn.
- Adriana v.D. × Johannes Verwegen, 3 Feb 1922 Uden — parents Antonius v.D. × Maria van Schijndel.
- Antonia v.D. × Cornelus van den Brand, 6 May 1927 Uden — parents Johannes v.D. × Ardina van den Bogert.
- Theodora Francisca v.D. × Johannes van den Elzen, 6 May 1932 Uden — parents Johannes v.D. × Ardina van den Bogert.
- Martinus v.D. × Theodora Hendrina Janssen, 20 Dec 1946 Uden — parents Jan v.D. × Antonetta van Berlo.

## Next steps
1. Resolve whether Antonia (@I399@) = Johanna (@I172@) — check baptism records / Teunissen tree (genealogieonline.nl).
2. Locate Adriana's (@I167@) marriage or death record — try FamilySearch and BHIC Uden/Zeeland/Volkel registers directly (the OpenArchieven API's 25-record cap hides many hits).
3. Optionally research grandchildren (births in Boekel 1928-1955 to these couples).
