# van der Wijst × daughters of Lambertus van Duijnhoven — marriage research

**Goal:** Add the 1932 and 1940 van der Wijst × van Duijnhoven daughter marriages to the GEDCOM.
Two van der Wijst brothers (sons of Johannes van der Wijst × Francina van den Biggelaar)
married two daughters of Lambertus van Duijnhoven `@I166@` × Maria van Deursen `@I392@`
(family `@F039@`).

## Verification 1 — Are the daughters already in the GEDCOM as children of Lambertus (`@F039@`)?

Yes, both are existing children of `@F039@`:

| Child | Name | Birth | Existing FAMS |
|-------|------|-------|---------------|
| `@I170@` | Francisca van Duijnhoven | 1904 (akte: 18 Nov 1904, Uden) | `@F129@` |
| `@I172@` | Johanna van Duijnhoven | 1911 | (none) |

## Verification 2 — Groom names from the aktes

### 1932 akte — `bhi:1ace3557-dd92-3032-074e-7ca299390070` ✅ CONFIRMED
Full akte retrieved from OpenArchieven (Brabants Historisch Informatie Centrum, BS Huwelijk):
- **Event:** Huwelijk, 22 Apr 1932, Boekel
- **Bruidegom (groom):** **Cornelis van der Wijst**, b. 23 Mar 1900, Erp
- **Bruid (bride):** Francisca van Duijnhoven, b. 18 Nov 1904, Uden
- **Vader/Moeder van de bruidegom:** Johannes van der Wijst × Francina van den Biggelaar
- **Vader/Moeder van de bruid:** Lambertus van Duijnhoven × Maria van Deursen ✓

Source: https://www.openarchieven.nl/bhi:1ace3557-dd92-3032-074e-7ca299390070

### 1940 akte — `bhi:98cb6bb8...` ❌ NOT VERIFIABLE
The identifier supplied in the task is **truncated** (only the first 8 hex characters `98cb6bb8`).
The full UUID is required to retrieve the akte from the OpenArchieven API.

Exhaustive index search performed and could not locate it:
- Scanned **all 278** "Johanna van Duijnhoven" `BS Huwelijk` records: **no** record with
  identifier prefix `98cb6bb8`, and **none** dated 1939–1941.
- The bride in the 1940 akte is therefore not indexed under the plain name
  "Johanna van Duijnhoven" (likely a compound given name, a spelling variant such as
  "Duinhoven", or the record is indexed under the groom).
- The groom is a son of Johannes van der Wijst × Francina van den Biggelaar
  (a brother of Cornelis), per the task context — but the specific brother's name
  **cannot be confirmed** without the akte.

**Decision:** Not added. Fabricating the groom's name or the marriage details would corrupt
the tree. This finding is left open pending the full `bhi:98cb6bb8-…` identifier.

## GEDCOM changes applied

The 1932 marriage was **already present** in the GEDCOM as family `@F129@`, and the groom
Cornelis van der Wijst already existed as individual `@I396@`. However two data-integrity
bugs were found and fixed:

1. **`@F129@` HUSB/WIFE were swapped** — `HUSB` pointed to Francisca `@I170@` (SEX F, the bride)
   and `WIFE` pointed to Cornelis `@I396@` (SEX M, the groom). Corrected to
   `HUSB @I396@` / `WIFE @I170@`.
2. **Cornelis `@I396@` was missing `FAMS @F129@`** — added, so the spouse↔family link is
   now reciprocal.

Post-fix validation confirms `@F129@` is consistent:
`HUSB @I396@` (Cornelis van der Wijst, SEX M) ↔ `WIFE @I170@` (Francisca van Duijnhoven, SEX F),
both carrying `FAMS @F129@`.

## Status
- ✅ 1932 Francisca × Cornelis van der Wijst — present and corrected in GEDCOM (`@F129@`).
- ⏸️ 1940 Johanna × [van der Wijst brother] — **blocked**, awaiting the full akte identifier
  (`bhi:98cb6bb8-…`). Johanna is `@I172@`, currently with no FAMS.

## Next step to unblock 1940
Provide the complete `bhi:98cb6bb8-xxxx-xxxx-xxxx-xxxxxxxxxxxx` UUID. With it the akte can be
retrieved, the groom (van der Wijst brother) confirmed, and a new individual + family
(`WIFE @I172@`) added.
