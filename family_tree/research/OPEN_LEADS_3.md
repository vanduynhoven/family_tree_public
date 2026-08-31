# Open Leads — Round 3

**Research date:** 2026-08-31
**Method:** OpenArchieven API (`records/search.json`, `records/show.json` a2a detail), web_search.
**GEDCOM writes:** NONE. No new parent-verified fact met the family's evidence standard; fabrication avoided per protocol.

---

## LEAD 1 — Francina van Duijnhoven (@I007@, b.10 Apr 1907 Boekel) marriage — UNRESOLVED

- Birth date + Boekel place confirmed in GEDCOM already.
- No marriage record verifiable. A ~1930 marriage would fall just inside the Dutch
  marriage-index 75-year window (accessible ~2005), but no OpenArchieven/BHIC hit ties a
  "Francina van Duijnhoven" marriage to parents **Marianus van Duijnhoven × Anna Maria van den Elzen**.
- **Status:** No confident match. Same barrier as her siblings (see MARIANUS_CHILDREN_FATES.md).
- **Evidence strength:** n/a (nothing found).

## LEAD 2 — Martinus van Duijnhoven (@I008@, b.26 Mar 1908 Boekel) — ALREADY RESOLVED

- GEDCOM note already records: **married Woutera Barbara Janssen in 1949**, remained in the Uden area.
- No further action needed; no contradicting record surfaced.

## LEAD 3 — Johanna Maria van Duijnhoven (@I012@, b.14 Sep 1913) × Petrus van Rijbroek (@F011@) — UNRESOLVED (embargo)

- Marriage 29 Mar 1932 Uden already in GEDCOM (akte bhi:b7dac8be-4629-11e3-a747-d206bceb4d38).
- **Children:** none can be added. Confirmed in VAN_RIJBROEK_CHILDREN.md — the BHIC *BS Geboorte*
  index for "van Rijbroek" contains **no birth later than 1925** (927 records, place-wide);
  births 1933–1952 are under the Dutch ~100-year civil-records embargo (release ~2033–2052).
- **Death:** no death record verifiable for her (privacy + name-frequency false positives).
- **Status:** `@F011@` correctly has no CHIL. No writes.

## LEAD 4 — Emigration of Marianus's other children — NO NEW EMIGRANT (context corroborated)

- web_search confirms the strong, documented **Uden → Little Chute, Wisconsin** Dutch-Catholic
  migration corridor (led by Fr. van den Broek), which the family's own emigrant **Johan (1915, emigrated 1949)**
  fits. See JOHAN_SIBLINGS_FATES.md / MARIANUS_CHILDREN_FATES.md.
- No *additional* named sibling of the 12 (Francina, Martinus, Gerardus, Hubertus, Jan, Johanna Maria,
  Johanna, Johan, Antonius, Gerarda Maria, Marinus, Hendrica Maria) was found in emigration/passenger records.
  Martinus is documented as having stayed in Uden.
- **Status:** No new emigrant. Corridor context is background, not a GEDCOM fact.
- **Evidence strength:** moderate (migration corridor well-sourced; absence of new emigrant is a null result).

## LEAD 5 — Peter van Leuken (@I366@, b.~1740) parents — NO NEW GRANDPARENTS; existing family CORROBORATED (strong)

- The VAN_LEUKEN_CONNECTION already establishes **Petrus/Peter van Leuken × Jenneke Jan Bankers**,
  parents of Joanna Maria (@I385@), Jan, Cornelia, Antonetta, IJda. This round re-confirmed it from a2a detail:
  - **1816 BS Overlijden Boekel** (bhi:a49b6efc-3b39-5cc3-3366-ec50de2b7a48): deceased **Antonetta Peter van Leuken**,
    father = **Peter van Leuken**, mother = **Jenneke Jan Bankers**, spouse (Relatie) = **Jan Lamert Frenssen**.
    → NEW collateral detail: daughter Antonetta married **Jan Lamert Frenssen**.
  - **1817 BS Overlijden Boekel** (bhi:c93bd6ba-ef9f-0acd-a64f-fd15da8d2eed): deceased **Jennemie Jansse van Leuken**
    (= Joanna Maria @I385@), mother = Jenneke Jan Bankers, spouse = Dirk van den Elsen.
- **Discrepancy resolved:** the 1817 record indexes the father as *"Jan Jansse van Leuken"*, but every other
  record (1768 & 1770 baptisms, 1783 burial of son "Jan Peter van Leuken", 1816 death, 1858 death of
  "Cornelia Peter van Leuken") uses the patronymic **Peter/Peters**. The 1817 "Jan Jansse" is an isolated
  indexing variant/error; father is **Peter van Leuken** (@I366@). No correction to GEDCOM needed.
- **Peter's OWN parents:** NOT found. He died before 1811 (no BS record; his own death record does not surface),
  and pre-1811 Boekel DTB *Trouwen*/burial index entries do not name parents. His grandparents remain unknown.
- **Evidence strength:** strong (existing family), null (Peter's parents).

## LEAD 6 — Dirck Cornelis van den Elsen (@I384@, b.~1740) parents — father CONFIRMED, mother UNFINDABLE

- Father = **Cornelis van den Elsen** (from consistent patronymic "Dirck/Theodorus Cornelis"), already
  captured in DIRCK_VAN_DEN_ELSEN_PARENTS.md and CORNELIS_VAN_DEN_ELSEN_PARENTS.md.
- His **1768 Boekel marriage** (bhi:67270964-4629-11e3-a747-d206bceb4d38) a2a detail lists only bride,
  groom, and witnesses (Joannes van der Wijst, Gerardus Schmitz) — **no parents**, as is standard for
  pre-1811 DTB *Trouwen*. The 1810 Gemert marriage of sibling Huibert Cornelis van den Elsen likewise
  indexes no parents.
- Numerous "Cornelis van den Elsen" siblings marry in Gemert/Boekel 1762–1810 (Anna, Elisabeth, Petronilla,
  Petrus, Francina, Huibert, Joanna) — all patronymic "Cornelis", consistent with one father Cornelis,
  but **Dirck's mother's name is not recoverable** from the indexed records.
- **Status:** No new data. Mother unknown.
- **Evidence strength:** strong (father/patronymic), null (mother).

---

## Summary

| Lead | Subject | Outcome | GEDCOM write |
|------|---------|---------|--------------|
| 1 | Francina 1907 marriage | Unresolved (index/embargo) | none |
| 2 | Martinus 1908 | Already resolved (m. Woutera Janssen 1949) | none |
| 3 | Johanna Maria 1913 children/death | Unresolved — births embargoed to ~2033+ | none |
| 4 | Sibling emigration | No new emigrant; Wisconsin corridor context only | none |
| 5 | Peter van Leuken parents | Family corroborated (strong); Peter's parents not found | none |
| 6 | Dirck v.d. Elsen parents | Father confirmed; mother unfindable | none |

**Net new datum:** daughter **Antonetta Peter van Leuken married Jan Lamert Frenssen** (1816 death record) —
a collateral spouse detail, not added as a standalone person this round.

## Recommended next steps (require non-embargoed / manual channels)
1. **Boekel Bevolkingsregister 1920–1938 household folio** for Marianus van Duijnhoven — records each child's
   departure (marriage/emigration destination) or death, pointing to exact aktes for Leads 1 & 3.
2. **Wisconsin (Little Chute / Brown & Outagamie Co.) passenger & naturalization records** for any earlier
   van Duijnhoven emigrant (Lead 4) — Ellis Island / FamilySearch, not the Dutch archives.
3. **Boekel DTB Dopen pre-1740** for the baptism of Peter van Leuken (Lead 5) and for Cornelis van den Elsen's
   marriage naming Dirck's mother (Lead 6) — many pre-1740 Boekel DTB pages are unindexed; direct scan review needed.

## Sources
- OpenArchieven API — https://api.openarch.nl/1.0/records/search.json & show.json (BHIC, archive_code `bhi`)
- Records cited by identifier above.
- Web: en.wikipedia.org/wiki/Uden (van den Broek Uden→Little Chute WI migration); historiek.net; dbnl.org (Swierenga).
