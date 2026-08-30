# Henricus (Peters) van Boxtel — Baptism Search in Neighbouring Parishes

**Target:** Henricus Peters van Boxtel, d. 21 Feb 1789 Uden — father of Elisabeth van Boxtel (d. 1789 Uden). GEDCOM `@I188@`.
**Problem:** Baptism NOT found in Uden DTB 1720–1755. Searched adjacent parishes for a male van Boxtel baptism whose parentage/dates fit.
**Source:** OpenArchieven API (`api.openarchieven.nl`), DTB Dopen. Filters `relationtype=Kind`, `eventtype=Doop`, `eventplace=<parish>` (server-side; note the `place` param is silently ignored — only `eventplace` filters).
**Date:** 2026-08-30.

## Method
- Searched `van Boxtel` child-baptisms (role `Kind`) 1710–1770 per parish: Boekel, Zeeland, Volkel, Erp, Gemert, Oirschot, Veghel, Uden, Nistelrode, Sint-Oedenrode.
- For every `Henricus`/`Hendricus` van Boxtel baptism 1718–1770, pulled the full record to read `Vader`/`Moeder`.
- Cross-checked against the target's **patronymic "Peters"**, which points to a father/grandfather named **Petrus**.
- Searched for Henricus's own marriage (to Joanna van Ham, ~1764–1768) — the record that would prove parentage.

## Per-parish result (van Boxtel `Kind`-baptisms 1710–1770)
| Parish | total Kind-baptisms | in 1710–1770 | male "Henricus" candidates |
|---|---|---|---|
| Boekel | 0 | 0 | — |
| Zeeland | 8 | 0 | — |
| Volkel | 0 | 0 | — |
| Erp | 3 | 3 | none (all Aert/Peters children 1756–59) |
| Gemert | 0 | 0 | — |
| Oirschot | 269 | 38 | **YES — see below** |
| Veghel | 45 | 20 | only female "Henrica" (1720, 1728, 1755) |
| Uden | 95 | 11 | none male Henricus |
| Nistelrode | 1 | 1 | — |
| Sint-Oedenrode | 80 | 44 | 2 male Henricus (1719, 1746) |

## Candidate baptisms named "Henricus van Boxtel"

### ★ PRIMARY — Oirschot: Henricus van Boxtel (father Adrianus **Petrus** van Boxtel)
Two baptisms of a son named Henricus to the **same couple**, the classic "name reused after an infant death" pattern:

1. **18 Aug 1724, Oirschot** — Kind: Henricus van Boxtel · Vader: **Adrianus Petrus van Boxtel** · Moeder: Catharina Adrianus van de Loo · witnesses incl. **Petrus van Boxtel** (paternal grandfather) — bhi `C1AE00B5-EAFD-41BD-8413-350B895878B3` / rhe dup `cbdcfa89-7063-aa1e-1c5e-c0397a4c52bb`
2. **26 May 1736, Oirschot** — Kind: Henricus van Boxtel · Vader: **Adrianus Petrus van Boxtel** · Moeder: Catharina Adrianus van de Loo — bhi `1E98E80F-BBB2-4EB7-8DE8-DB137DD94B2E` / dup `51939106-ac9e-3c50-6b3a-adbd0869c58b`

Why this fits the target:
- Father's name carries **Petrus** → matches the target's patronymic **"Peters"** van Boxtel.
- A **Petrus van Boxtel** stands godfather in 1724 → the "Peters" line is real in this family.
- The couple had a large Oirschot family (baptisms 1723–1736+), and Oirschot is a documented van Boxtel stronghold.
- Either birth year (1724 or 1736) is consistent with a death in 1789 and a daughter Elisabeth born in Uden.

### Secondary — Sint-Oedenrode (do NOT match the "Peters" patronymic)
- **15 May 1719** — Henricus, Vader **Lambertus** van Boxtel, Moeder Catarina — bhi `fb69dd8c-4628-11e3-a747-d206bceb4d38`
- **14 Nov 1746** — Henricus, Vader **Rutgerus** van Boxtel, Moeder Hendrina Sleurs — bhi `d681999a-402a-da5f-0770-7d35ffae946a`

Neither father is a Petrus, so neither explains the "Peters" patronymic. Retained as fallbacks only.

## Marriage search (would confirm parentage) — NOT FOUND
- `Henricus van Boxtel` marriage 1748–1775: **0** records.
- `Hendrik van Boxtel` marriages 1748–1775: only Tilburg (Geertruijd, bride) and Boxtel (1765, "eerdere man") — none is our man.
- `van Boxtel` × `van Ham`: **0** records (the wife's surname "van Ham" may be mis-transcribed or the marriage is not indexed on OpenArchieven).
- No van Boxtel groom marriage in Uden / Boekel / Zeeland / Nistelrode / Erp 1750–1772 matching Henricus.

## Assessment
- **Best hypothesis:** Henricus (Peters) van Boxtel = son of **Adrianus Petrus van Boxtel × Catharina van de Loo of Oirschot**, baptised either 18 Aug 1724 or 26 May 1736 in Oirschot.
- **Evidence strength: WEAK–MODERATE (circumstantial).** Match rests on surname + "Peters" patronymic + plausible dates + Oirschot proximity. It is NOT confirmed by a marriage or death record naming his parents, and there are two same-named baptisms so even the exact date is ambiguous.
- Baptism confirmed ABSENT from Boekel, Zeeland, Volkel, Gemert; and no male-Henricus match in Erp, Veghel, Uden, Nistelrode.

## GEDCOM
**Not modified.** Link is too weak to write into the tree. Do NOT set birth/parents on `@I188@` until confirmed.

## Next steps to confirm
1. Find Henricus's **marriage record** (bride "van Ham" or variant: van Hamme, van Haren, Verhaghe) — the surest proof; try WieWasWie and BHI parish registers directly, and Uden/Boekel marriage banns 1758–1770.
2. Read the **Uden 1789 burial** entry for Henricus for any stated age → back-calculates birth year and disambiguates 1724 vs 1736.
3. Check the Oirschot family reconstruction (Adrianus Petrus van Boxtel × Catharina van de Loo) for whether a Henricus survived to adulthood and left Oirschot.
