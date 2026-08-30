# Johanna van den Elzen (@I421@) — Parents Research

**Date:** 2026-08-30
**Target:** the parents (and baptism) of **Johanna van den Elzen / van den Elsen**
(@I421@, b. ~1788 Gemert area), wife of **Willem Werts** (@I420@) and mother of
**Maria Werts** (b. 10 Sep 1814 Gemert → m. Theodorus Cornelissen 1833 Bakel).

> This is the **Gemert/Bakel "van den Elsen"** line. It is DISTINCT from the
> well-documented **Boekel "van den Elsen"** family (Anna Maria van den Elzen, wife of
> Marianus van Duijnhoven). Do NOT borrow parents from the Boekel line — coincidental
> surname only.

---

## Result: parents still NOT individually named — but father's given name established

No record naming both of Johanna's parents was located. However this cycle produced a
**new, concrete constraint** not previously nailed down:

### NEW FINDING — Father's given name = **Joannes (Jan) van den Elsen** — MODERATE

The couple's own marriage record was **re-located and read** this cycle:

- **Trouwen, 4 March 1810, Bakel en Milheeze** (BHIC, DTB Trouwen — RK church register)
- Identifier: `bhi:352e7dec-2f8c-8595-b34b-d9d0608e5a15`
- URL: https://www.openarchieven.nl/bhi:352e7dec-2f8c-8595-b34b-d9d0608e5a15
- Bruidegom: **Wilhelmus Henrici Werts** (→ father *Henricus* Werts)
- Bruid: **Johanna Joannis van den Elsen**

The bride's patronymic **"Joannis"** means her father was **Joannes (Jan) van den
Elsen**. This is a pre-1811 church marriage that records only the patronymic, not the
parents' full names or the mother — so the mother remains unnamed. Evidence is
**moderate** (single source, but a primary church record; the patronymic convention is
unambiguous).

Two corrections to the working assumptions also fall out of this record:
- The **marriage was in Bakel en Milheeze, 4 Mar 1810** — NOT Gemert. Johanna was
  likely living in the Bakel/Milheeze parish, so her baptism may be there rather than
  in Gemert.
- Surname is consistently **"van den Elsen"** in the primary sources (GEDCOM's
  "van den Elzen" is a variant spelling).

---

## What is firmly established (anchor records)

| Fact | Record | Strength |
|------|--------|----------|
| Willem Werts × Johanna van den Elsen married 4 Mar 1810 Bakel en Milheeze | bhi:352e7dec-... (DTB Trouwen) | strong |
| Johanna's father was named **Joannes** (patronymic "Joannis") | same marriage record | moderate |
| Daughter Maria Werts b. 10 Sep 1814 Gemert, parents Willem Werts × Joanna van den Elsen | Geboorteregister Gemert 1814 nr. 64 (per GEMERT_WERTS_DTB.md) | strong |
| 1833 Bakel marriage of Maria names parents Willem Werts × Johanna van der Elzen | bhi:ed1ecde7-3191-66bb-28c2-546ed7e13e0e | strong |

---

## Searches performed this cycle — all NEGATIVE for a parent-naming record

1. **Johanna van den Elsen / van den Elzen baptism, ~1783–1796, Gemert & Bakel**
   (DTB Dopen). Gemert returned 6 "Johanna van den Elsen" baptisms, all 1765–1786 and
   with WRONG patronymics (Gerits, Dirkx/Derk, Lamberts) or wrong role (witness) — none
   is a Johanna b.~1788 with father *Joannes*. Bakel returned 0.
2. **"Johanna van den Elsen" dopen nationwide, filtered to 1783–1796** — nearest hits
   (Boekel 22-3-1793 "Johanna Maria Derk van den Elsen"; Bakel 1800/1806 "Johanna
   Jacobi van den Elsen") have the wrong father (Derk/Jacobi, not Joannes) → not her.
3. **Willem Werts death** (would name wife/confirm couple): the Bakel 17-1-1833 death
   is a *different* Willem Werts (wife **Gordina Verbaarschot**, parents Hendricus Werts
   × Gordina Verbaarschot) — NOT our line.
4. **Johanna van den Elsen / van der Elzen death** (would name her parents directly):
   363 "Johanna van den Elsen" and 45 "Johanna van der Elzen" death records scanned
   nationwide; none matches a Johanna b.~1788, widow/wife of Willem Werts, in
   Bakel/Gemert. No BS Overlijden for this specific Johanna surfaced.

### Data limitation (confirms prior notes)
The OpenArchieven API's `place`, `year_from/to`, `relation1_name`, `relation_name`,
and `name_2` filters are **NOT honoured** — searches return nationwide, out-of-range,
single-person results regardless. Two-person / parent-linked filtering is impossible via
this API; all filtering had to be client-side by scanning rows, which caps recall.
Pre-1811 Bakel/Gemert DTB coverage is thin in this index.

---

## Recommended next steps (for manual research / future cycle)

1. **Bakel en Milheeze DTB Dopen ~1785–1793** — look for a baptism of *Joanna*, father
   *Joannes van den Elsen*. Now that the marriage is placed in Bakel (not Gemert), the
   baptism is more likely in the **Bakel/Milheeze RK doopboek**. Best pursued directly
   on the **BHIC website** or **FamilySearch** browsable Bakel church registers — the
   OpenArchieven API's place filter cannot target this.
2. **Identify a marriage of a "Joannes van den Elsen" in Bakel/Gemert ~1780–1788** whose
   children include a Joanna — this would give the mother's name and Johanna's baptism.
3. **Johanna's BS Overlijden (post-1810, Bakel/Gemert/Deurne)** — a civil death akte
   would name both her parents outright; search BHIC/WieWasWie by hand for a Johanna
   Werts-van den Elsen death, widow of Willem Werts.
4. Cross-check **WieWasWie** for the Bakel/Milheeze van den Elsen family of the 1780s.

---

## Sources checked
- OpenArchieven API `records/search.json` — Johanna van den Elsen/Elzen (dopen &
  overlijden), Willem/Wilhelmus Werts (overlijden), Maria Werts, two-person attempts.
- OpenArchieven record pages `https://www.openarchieven.nl/bhi:<id>` (meta descriptions).
- **Marriage re-verified & read:** bhi:352e7dec-2f8c-8595-b34b-d9d0608e5a15 (1810 Bakel).
- Prior local notes: `WERTS_VAN_DEN_ELZEN_PARENTS.md`, `GEMERT_WERTS_DTB.md`.

**Evidence strength — "father named Joannes": moderate. "full parents unknown": strong**
(multiple independent negative searches + structural pre-1811 DTB gap).
**New GEDCOM individuals added this cycle: 0** (father's full name/dates still
insufficient to create a reliable @I@ record — only the given name "Joannes" is known).
