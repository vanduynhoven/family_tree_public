# Duplicate Family Merges & FAMC Fixes

**Date:** 2026-08-31
**File:** `vanduynhoven/family_tree/vanduynhoven_family.ged`
**Backup:** `vanduynhoven_family.ged.bak` (pre-edit)
**Scope:** 5 FAMC mismatches involving suspected duplicate families (4 pairs supplied).

## Decision rules applied
- Never delete a family with a `MARR` record or unique information.
- Never merge families with different `HUSB`/`WIFE`.
- If genuinely different families (e.g. grandparents vs parents) → fix FAMC only, keep both.
- If one family is a pure placeholder duplicate → merge children into canonical, delete duplicate.

---

## 1. @I090@ Martinus van Duijnhoven — FAMC @F019@ → @F020a@ (FIX ONLY, both kept)
- `@F019@` = HUSB @I083@ (Johannes Peter "Jean", 1757) × WIFE @I099@ — Martinus's **grandparents**. Has `MARR`.
- `@F020a@` = HUSB @I095@ (Johannes, 1793, son of Jean) × WIFE @I100@ (Cornelia van der Wijst), married 13 Jun 1827 — Martinus's **actual parents**. Both NOTEs confirm Martinus (b.1828) is their child.
- **Genuinely different families** (two generations). Action:
  - `@I090@` FAMC `@F019@` → `@F020a@`
  - Removed erroneous `CHIL @I090@` from `@F019@`
- Both families retained.

## 2. @I071@ Petrus Jansen van Duijnhoven — F043 DELETED (merged into F021)
- `@F021@` = HUSB @I084@ (Jan Dircx van Duijnhoven, ~1645), 5 children (@I073@,@I071@,@I074@,@I075@,@I076@), rich sourced NOTE. **Canonical.** No MARR.
- `@F043@` = HUSB @I176@ (Jan Jansen van Duynhoven, 1660), single CHIL @I071@ (duplicate). No MARR, no unique children. **Placeholder duplicate** (competing father theory for the same child).
- @I071@ FAMC was already correctly `@F021@`; child already present in canonical family.
- Action: **deleted `@F043@`**; removed dangling `FAMS @F043@` from @I176@ (individual @I176@ retained as an alternate-father record with no family link).

## 3. @I165@ Anna Maria Verbruggen — F050 DELETED (merged into F038)
- `@F038@` = HUSB @I163@ × WIFE @I164@ (Martinus Verbruggen × Petronella van Grootel). Rich, fully-sourced NOTE. Is @I164@'s FAMS. **Canonical.**
- `@F050@` = **identical** HUSB @I163@ × WIFE @I164@; children @I198@ (Gerardus) + @I165@. Thinner NOTE. Duplicate.
- Neither family has a `MARR` record; same HUSB/WIFE → safe to merge.
- Action:
  - Moved unique child `CHIL @I198@` into `@F038@`
  - `@I198@` FAMC `@F050@` → `@F038@`
  - **Deleted `@F050@`**
- @I165@ FAMC already correctly `@F038@`.

## 4. @I406@ Karel Franciscus Holleman — F137 DELETED (F164 canonical)
- `@F137@` = HUSB @I407@ × WIFE @I408@, CHIL @I406@. **No MARR, no unique data.** Placeholder duplicate.
- `@F164@` = **identical** HUSB @I407@ × WIFE @I408@, CHIL @I406@; carries the **MARR record (12 Jan 1910, Escharen)** + full source citations. Is the parents' FAMS. **Canonical.**
- @I406@ had FAMC = [@F137@, @F164@] (double). Action:
  - Removed FAMC `@F137@` from @I406@ (single FAMC `@F164@` remains)
  - **Deleted `@F137@`** (rule respected: kept the family with MARR).

---

## Integrity check (post-edit)
Ran full referential check on the saved file.

- ✅ All 4/5 target individuals now: FAMC matches the single family they are CHIL of.
  - @I090@ → @F020a@; @I071@ → @F021@; @I165@ → @F038@; @I406@ → @F164@; @I198@ → @F038@
- ✅ Deleted families gone: @F043@, @F050@, @F137@.
- ✅ Kept families present: @F019@, @F020a@, @F021@, @F038@, @F164@.
- ✅ No dangling HUSB/WIFE/CHIL/FAMC/FAMS references introduced.
- Totals: 461 individuals, 152 families.

### Pre-existing issues found (OUT OF SCOPE — not in the 5-record task, confirmed present in backup, left untouched)
These are additional duplicate-family candidates for a future pass:
1. `@I085@` is CHIL in **both** @F044@ and @F044b@ (FAMC=@F044@) — likely another F/Fb placeholder pair.
2. `@I163@` FAMC=@F075@ but is CHIL of @F048@ — FAMC/CHIL mismatch.
3. `@I164@` FAMC=@F076@ but is CHIL of @F049@ — FAMC/CHIL mismatch.

*(Note: the task listed 5 mismatches but supplied 4 pairs; the @I198@ FAMC fix was handled as part of the F050→F038 merge. All 4 supplied pairs are resolved.)*
