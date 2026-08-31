# Verwegen 1819 Akte Discrepancy — RESOLVED

**Date resolved:** 2026-08-30
**Subject:** @I121@ Johannes Verwegen (b. 18 Apr 1795 Uden), father of Geertruda Verwegen
**Question:** Are @I121@'s parents Geurt Peter Verwegen × Helena Gielens (@F027@), or
Arnoldus Verweegen × Adriana Klaassen (as the 1819 marriage akte states)?

## Verdict: (B) — Parents are Arnoldus Verwegen × Adriana Klaassen

The prior @F027@ linkage (Geurt Peter Verwegen × Helena Gielens) was **WRONG**. Two
independent primary sources agree that @I121@'s parents are **Arnoldus Verwegen ×
Adriana Klaassen**. The GEDCOM has been corrected: @I121@ FAMC now points to a new
family @F173@ (Arnoldus @I498@ × Adriana @I500@); the erroneous @F027@ child link was
removed.

## Evidence (two independent primary sources — evidence strength: STRONG)

### Source 1 — Baptism, 18 Apr 1795, Uden (bhi:26554f57-fbc5-e1d0-7d22-479c923319d3)
Structured roles from the openarchieven a2a record (`records/show.json`, archive `bhi`):

| Role (a2a RelationType) | Person |
|---|---|
| Kind (child) | **Joannes Verwegen** |
| Vader (father) | **Arnoldus Verwegen** |
| Moeder (mother) | **Adriana Joannis Nicolai** |
| Getuige (witness) | Nicolaus Joannis |
| Getuige (witness) | Maria Joannis Nicolai |

This is the exact birth date and place of @I121@ (18 Apr 1795, Uden). The father is
recorded as **Arnoldus Verwegen**, NOT Geurt Peter. The mother "Adriana Joannis
Nicolai" is the Latin patronymic form — *Adriana, daughter of Jan(nis), son of
Nicolaas/Claes* — which vernacularises exactly to **Adriana Klaassen**.

URL: https://www.openarchieven.nl/bhi:26554f57-fbc5-e1d0-7d22-479c923319d3

### Source 2 — Marriage, 31 Jan 1819, Uden (bhi:0f3848b2-7473-84ee-895e-fa2c98028e37)
Structured roles from the openarchieven a2a record:

| Role | Person |
|---|---|
| Bruidegom (groom) | Joannes Verweegen, b. 18 Apr 1795 Uden |
| Bruid (bride) | Michaelina van den Berk |
| Vader van de bruidegom | **Arnoldus Verweegen** |
| Moeder van de bruidegom | **Adriana Klaassen** |
| Vader van de bruid | Arnoldus van den Berk |
| Moeder van de bruid | Petronella van de Voort |

The groom's recorded birth (18 Apr 1795 Uden) matches Source 1 exactly, and both
sources name the same parents. Corroboration is complete.

URL: https://www.openarchieven.nl/bhi:0f3848b2-7473-84ee-895e-fa2c98028e37

## Why @F027@ was wrong — two distinct Joannes Verwegen men

@F027@ = Geurt Peter Verwegen × Helena Gielens, married 31 Jan 1773 Boekel. They did
have descendants in Uden, but their son named Joannes/Johannes is a *different* person
from @I121@. The DTB Dopen index for Uden 1790–1802 contains multiple men named
Joannes Verwegen (e.g. a second baptism 23 Aug 1795, and a Joannes "Godefridi/Geurt"
Verwegen line appearing as a father in 1805–1810 baptisms). The 18 Apr 1795 baptism —
the one whose date matches @I121@ — belongs unambiguously to Arnoldus × Adriana. The
original tree conflated the two.

## GEDCOM changes applied (`vanduynhoven_family.ged`)

- **@I121@**: FAMC changed from @F027@ to **@F173@**; NOTE updated to point to @F173@
  and cite both aktes. (`1 FAMC @F173@`)
- **@F027@** (Geurt Peter × Helena Gielens): @I121@ removed as child — retained as a
  valid family in its own right, just no longer @I121@'s parents.
- **@F173@** (new): `HUSB @I498@` (Arnoldus Verwegen, b. abt 1765 Uden) ×
  `WIFE @I500@` (Adriana Klaassen, b. abt 1768 Uden), `CHIL @I121@`.
- **@I498@** Arnoldus Verwegen, **@I500@** Adriana Klaassen — new parent individuals.
  Note: this Arnoldus is NOT the Arnoldus Verwegen (m. Jaspers 1849) who is a *son* of
  @I121@ and brother of Geertruda.
- **@I499@** (duplicate Adriana Klaassen) — removed as an orphan; @I500@ is the
  canonical mother record linked into @F173@.

## Referential-integrity check (post-edit)
- Single `0 TRLR`; no dangling xref pointers.
- @I121@ → @F173@ → @I498@ / @I500@ chain resolves.
- @F027@ no longer lists @I121@ as a child.

## Note on evidence limits
Birth years for @I498@ (abt 1765) and @I500@ (abt 1768) are estimates, not from a
located baptism. A follow-up could locate the Arnoldus Verwegen × Adriana Klaassen
marriage akte (expected ~1790–1794, Uden) to fix their vitals and confirm the maternal
"Klaassen" surname against the patronymic. This does not affect the parentage verdict,
which is already corroborated by two independent sources.
