# Gemert / Bakel DTB & BS Records — Willem Werts × Johanna van den Elsen

Research target: parents of **Maria Werts** (b. 10 Sep 1814 Gemert), who married
Theodorus Cornelissen in 1833 Bakel.

- **Willem Werts** — GEDCOM `@I420@`
- **Johanna van den Elsen** — GEDCOM `@I421@`

Source archive: **BHIC / Gemeentearchief Gemert-Bakel**, via OpenArchieven
(`https://www.openarchieven.nl`). Retrieved 2026-08-30.

---

## Key correction

The mother's surname is recorded as **van den ELSEN** (not "van den Elzen") in every
primary source found. Prior GEDCOM used "van den Elzen"; the notes now flag the
correct spelling. This spelling difference is why earlier searches under "Elzen"
returned nothing.

Willem's birth was previously estimated ~1785 Gemert; the primary record places his
baptism **9 Mar 1780 in Bakel en Milheeze** — 5 years earlier and a different parish.

---

## CONFIRMED records

### 1. Marriage of the parents — STRONG
**Wilhelmus Henrici Werts × Johanna Joannis van den Elsen**
- Date: **4 March 1810**
- Place: **Bakel en Milheeze** (Rooms-Katholiek trouwboek) — NOT Gemert
- Record: `bhi:352e7dec-2f8c-8595-b34b-d9d0608e5a15`
  - https://www.openarchieven.nl/bhi:352e7dec-2f8c-8595-b34b-d9d0608e5a15
- Citation: BHIC, Church records marriages, Gemeentearchief Gemert-Bakel,
  **archive 8009, inventory 25**, RK trouwboek 1795–1854, Bakel en Milheeze.
- Patronymics in the record: groom **Henrici** (son of Henricus), bride **Joannis**
  (daughter of Joannes/Jan).

### 2. Willem Werts — baptism — STRONG
**Wilhelmus Werts**, baptized (RK) **9 March 1780, Bakel en Milheeze**
- Record: `bhi:ad649d5d-3062-b691-d751-37974b1e3a77`
  - https://www.openarchieven.nl/bhi:ad649d5d-3062-b691-d751-37974b1e3a77
- **Father: Henricus Willem Werts**  → matches "Henrici" patronymic in the 1810 marriage
- **Mother: Godefrida Henrici van de Goir**
- Disambiguation: three "Wilhelmus Werts (Child)" baptisms exist 1780–1790. The
  14-8-1782 Gemert one has father *Gerardus* Werts; the 23-12-1788 Bakel one has
  father *Thomas* Werts. Only the **9-3-1780 Bakel** record has father **Henricus**,
  matching the marriage patronymic — this is the correct Willem.

### 3. Daughter Maria Werts — birth (anchor record) — STRONG
**Maria Werts**, born **10 September 1814, Gemert**
- Record: `bhi:3d201711-c4ac-0834-43f4-59de01bd377e`
  - https://www.openarchieven.nl/bhi:3d201711-c4ac-0834-43f4-59de01bd377e
- Citation: BHIC, Civil registration births, **archive 50, inventory 2843**,
  Geboorteregister Gemert 1814, **record number 64**.
- Father: **Willem Werts**; Mother: **Joanna van den Elsen**. Confirms the couple.

### 4. Other children of the couple (from the family search) — MODERATE→STRONG
From the two-person search `Werts & van den Elsen` (26 results total):
- **Guillaume / Jean (Jan) Werts** — b. **29 Jul 1812 Gemert** (BS births).
  `bhi:a9f286d9-7369-438f-d89d-65e1bbb47b88` (twins; "Guillaume" = French form of
  Willem, used in the 1810–1813 French annexation-era registers).
- **Hendrik Werts** — death **6 Apr 1815 Gemert** (BS deaths, child).
  `bhi:fc50f583-f05d-51bb-636a-6bbbe75be780`
- **Godefridus Werts** — baptism **26 Jun 1810 Bakel en Milheeze** (RK dopen).
  `bhi:4117418d-6154-dcd2-74b8-1add5ac282e2`

Record-type counts for `Werts & van den Elsen`: 8 BS births, 7 BS deaths,
5 DTB baptisms, 3 BS marriages, 1 DTB marriage, 2 notarial.

---

## Paternal grandparents identified

**Henricus Willem Werts × Godefrida Henrici van de Goir** (parents of Willem).
Added to GEDCOM as `@I430@` / `@I431@`, family `@F149@`, with Willem `@I420@` as child.

---

## OPEN LEADS (not yet resolved)

1. **Johanna van den Elsen's own baptism** — NOT located. Estimated ~1788.
   Searched Gemert DTB dopen 1780–1795 under both "Elsen" and "Elzen"; the only hits
   are witnesses with wrong patronymics (Derk/Dirkx/Matthiae), none a child of a
   *Joannes*. Her patronymic is **Joannis** (daughter of Joannes/Jan van den Elsen).
   Next steps:
   - Follow the grandparent links from the `Werts & van den Elsen` family cluster on
     OpenArchieven (logged-in "related documents" would surface her parents directly).
   - Try nearby parishes (Bakel, Beek en Donk, Aarle-Rixtel, Boekel) — she may not be
     Gemert-born.
   - Try given-name variant "Joanna" and check her BS death record (would state age +
     parents) via a two-person search with husband Willem to narrow the 310 hits.
2. **Willem's & Johanna's own death records** — not pursued this pass.
3. Note the stale akte id `bhi:ed1ecde7-...` in the prior GEDCOM/notes for the 1833
   Bakel marriage now **redirects to an unrelated Uden 1859 record** on OpenArchieven —
   it should be re-verified / re-sourced.

---

## GEDCOM changes applied (`vanduynhoven_family.ged`)

- `@I420@` Willem Werts: birth corrected to **9 MAR 1780, Bakel en Milheeze**;
  note updated with baptism, parents, marriage, and source akte ids; `FAMC @F149@`.
- `@I421@` Johanna van den Elsen: note updated (correct "Elsen" spelling, patronymic
  Joannis, marriage akte, open baptism lead).
- `@F145@` (Willem × Johanna): added `MARR 4 MAR 1810, Bakel en Milheeze` + sourced note.
- `@I430@` Henricus Willem Werts (new) — paternal grandfather.
- `@I431@` Godefrida Henrici van de Goir (new) — paternal grandmother.
- `@F149@` (new): Henricus × Godefrida, child Willem `@I420@`.
