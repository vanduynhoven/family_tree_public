# Vervoort Line Extended Upward — Grandparents of Anna Maria Vervoort (@I504@)

**Goal:** Find the parents of Johannes Vervoort (@I505@) and Barbara van der Brugge
(@I506@) — i.e. the four maternal grandparents of Anna Maria Vervoort (@I504@),
wife of Marinus van Duijnhoven (@I017@).

**Status:** ✅ RESOLVED — all four grandparents identified with **strong** evidence
from the primary civil marriage record.

---

## The source: 1914 marriage akte

The couple's own civil marriage record names both sets of parents in one document:

- **Veghel BS Huwelijk 1914, aktenummer 14** (archief 550, deel 3312)
- Reference: `bhi:4cd1a931-3c60-8865-b44e-8df8ef04fea4`
- URL: https://www.openarchieven.nl/bhi:4cd1a931-3c60-8865-b44e-8df8ef04fea4
- Event: Huwelijk, 11 May 1914, Veghel

The record's A2A `RelationType` fields make the parentage explicit and unambiguous
(fetched and verified via the OpenArchieven show API this cycle):

| Person | Role in akte | Confirmed relationship |
|--------|--------------|------------------------|
| Johannes Vervoort (age 28, b. Veghel) | Bruidegom (groom) | = @I505@ |
| Barbara van der Brugge (age 27, b. Veghel) | Bruid (bride) | = @I506@ |
| **Petrus Vervoort** | Vader van de bruidegom | Father of Johannes |
| **Johanna Maria Vogels** | Moeder van de bruidegom | Mother of Johannes |
| **Bastiaan van der Brugge** | Vader van de bruid | Father of Barbara |
| **Maria van Asseldonk** | Moeder van de bruid | Mother of Barbara |

Because the marriage akte carries both sets of parents, **both** lines of
grandparents are established from this single primary source.

---

## Grandparents identified

### Vervoort side (parents of Johannes Vervoort @I505@)
- **Petrus Vervoort** → GEDCOM **@I507@** (M)
- **Johanna Maria Vogels** → GEDCOM **@I508@** (F)
- Family: **@F177@** (Petrus × Johanna Maria; CHIL @I505@)

### van der Brugge side (parents of Barbara van der Brugge @I506@)
- **Bastiaan van der Brugge** → GEDCOM **@I509@** (M)
- **Maria van Asseldonk** → GEDCOM **@I510@** (F)
- Family: **@F178@** (Bastiaan × Maria; CHIL @I506@)

Evidence strength: **strong** — a primary civil-registration marriage record that
explicitly labels each parent by role (father/mother of groom/bride).

---

## GEDCOM changes applied

Added via `gedcom_update.py` (atomic write + timestamped backup):

- `@I507@` Petrus Vervoort (INDI, M)
- `@I508@` Johanna Maria Vogels (INDI, F)
- `@F177@` FAM: HUSB @I507@, WIFE @I508@, CHIL @I505@
- `@I509@` Bastiaan van der Brugge (INDI, M)
- `@I510@` Maria van Asseldonk (INDI, F)
- `@F178@` FAM: HUSB @I509@, WIFE @I510@, CHIL @I506@
- Link: `@I505@` FAMC → `@F177@`
- Link: `@I506@` FAMC → `@F178@`

Totals after update: 460 individuals, 151 families.

Each new INDI/FAM record carries a NOTE citing the 1914 akte and the A2A role that
established the relationship.

---

## Open leads (next cycles, not yet done)

The four grandparents currently have **names only** — no confirmed birth/death dates
or their own parents. Their own vital records exist but require akte-level
verification (both surname clusters are common in Veghel, so a free-text name match
alone is insufficient):

1. **Petrus Vervoort × Johanna Maria Vogels marriage** — would give both their birth
   dates/places and push the Vervoort line back another generation. Search Veghel
   BS Huwelijk ~1880–1900 for this couple by both names.
2. **Bastiaan van der Brugge × Maria van Asseldonk marriage** — same, for the van der
   Brugge / van Asseldonk lines. Note candidate Veghel death records under "Bastiaan
   van der Brugge" (e.g. `68e6d96a-...` d.1879, `13f80a0e-...` d.1932) surfaced in a
   name search but are **not yet confirmed** to be this individual.
3. Johannes Vervoort's own birth akte (~1886 Veghel per his stated age 28 in 1914)
   would independently confirm Petrus + Johanna Maria as parents and pin his exact
   birth date (currently ABT 1886).

These require opening each candidate akte and matching spouse/parent names — deferred;
the primary goal (identifying the grandparents) is complete.

---

*Verified: 2026-08-31. Marriage akte re-fetched from OpenArchieven show API this
cycle; A2A relation types confirmed. All records written to
`vanduynhoven_family.ged`.*
