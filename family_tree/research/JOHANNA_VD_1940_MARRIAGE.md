# Johanna van Duijnhoven — 1940 Marriage (BHI identifier resolved)

## Result

**Full BHI identifier:** `bhi:98cb6bb8-4629-11e3-a747-d206bceb4d38`

**Record URL:** https://www.openarchieven.nl/bhi:98cb6bb8-4629-11e3-a747-d206bceb4d38

The truncated prefix `bhi:98cb6bb8` from prior research is confirmed complete.

## Marriage record (BHIC — BS Huwelijk)

| Field | Value |
|-------|-------|
| Event | Huwelijk (civil marriage) |
| Date | **1 May 1940** (1-5-1940) |
| Place | **Boekel**, Noord-Brabant |
| Bride | **Johanna van Duijnhoven** (@I172@, b.~1911, d.1984) |
| Bride's father | Lambertus van Duijnhoven (@I166@) ✓ |
| Bride's mother | Maria van Deursen ✓ |
| Groom | **Johannes van der Wijst** |
| Groom's father | Marinus van der Wijst |
| Groom's mother | Francina van den Biggelaar |
| Source repository | Brabants Historisch Informatie Centrum (BHIC) |

Full source description string:
> Huwelijk, 1-5-1940, Boekel, Johanna van Duijnhoven, Lambertus van Duijnhoven, Johannes van der Wijst, Francina van den Biggelaar, Maria van Deursen, Marinus van der Wijst, Brabants Historisch Informatie Centrum: BS Huwelijk

## How it was found

1. Direct name searches for "Johanna van Duijnhoven" BS Huwelijk 1937–1943 returned only compound-named individuals (Johanna Maria, Johanna Catharina, etc.) — none with the `98cb6bb8` prefix.
2. Pivoted to search on the **father**: `name=Lambertus van Duijnhoven, sourcetype=BS Huwelijk, year 1938–1943`.
3. Among the "Vader van de bruid" hits was one dated **1/5/1940** with identifier `98cb6bb8-4629-11e3-a747-d206bceb4d38` — an exact match to the truncated prefix.
4. Fetched the record's meta description, which confirmed bride Johanna van Duijnhoven, father Lambertus, mother Maria van Deursen, groom Johannes van der Wijst.

All three identity anchors (father Lambertus, mother Maria van Deursen, ~1940 date) corroborate. **Evidence strength: strong** (primary civil marriage record + matching parents).

## GEDCOM changes applied

File: `/Users/arthur.vanduynhoven/code/private/vanduynhoven/family_tree/vanduynhoven/family_tree/vanduynhoven_family.ged`

- **New individual `@I433@`** — Johannes van der Wijst (M), groom. Note records parents Marinus van der Wijst & Francina van den Biggelaar and the source; `SOUR` = record URL.
- **New family `@F151@`** — HUSB @I433@ × WIFE @I172@; MARR 1 MAY 1940, Boekel, Noord-Brabant, Netherlands; NOTE cites the BHI record.
- **`@I172@`** — added `FAMS @F151@` (Johanna now linked as wife in the new marriage family; her `FAMC @F039@` child link is unchanged).

Individual count 385 → 386, family count 124 → 125.

Note: the groom's parents (Marinus van der Wijst, Francina van den Biggelaar) were recorded in the notes but not added as separate individuals — they can be created and linked in a follow-up if desired.
