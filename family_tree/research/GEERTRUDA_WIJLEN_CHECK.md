# Geertruda Verwegen (@I004@) — "wijlen"/deceased check on the two 1939 Uden death scans

**Date:** 2026-08-30
**Question:** On the two 1939 Uden death aktes that name Geertruij Verwegen as *mother*, does the
scan mark her as **deceased** (the word "wijlen", or an equivalent) before her name — thereby
pinning an upper bound on her own death?

## Verdict: YES — both scans confirm the mother was already deceased. ✅

Neither akte uses the literal word **"wijlen"**. Instead both use the standard Dutch civil-registry
equivalent, **"beiden overleden"** ("both [parents] deceased"), placed immediately after the parent
couple's names. This is the definitive deceased-flag the check was looking for.

**Result: Geertruda Verwegen died BEFORE 22 October 1939.** This is now a *corroborated* (2
independent sources), not inferred, upper bound.

## The scans, read directly (full-page, 2000px renditions)

### Akte Nr. 80 — 22 Oct 1939 — son Antonius van Duijnhoven
- **BHI:** `bhi:7b08b63b-e50c-7c6e-4e0e-74d4694c5ba2`
- Deceased: van Duijnhoven, Antonius, widower of van Schijndel, Maria, age 73, b./res. Uden.
- **Parentage line (verbatim):**
  > "zoon van: van Duijnhoven, Martinus **en van: Verwegen, Geertruij, beiden overleden**"
- Scan: `https://images.memorix.nl/bhic/thumb/2000x2000/7cb65992-ae8e-519a-3245-458c293da078.jpg`

### Akte Nr. 98 — 24 Dec 1939 — daughter Petronella van Duijnhoven
- **BHI:** `bhi:786908dd-bb58-acdd-6144-60b047801cb6`
- Deceased: van Duijnhoven, Petronella, spouse (echtgenoote) of van der Burgt, Franciscus,
  age 20, b./res. Uden, landbouwster.
- **Parentage line (verbatim):**
  > "dochter van: van Duijnhoven, Martinus **en van: Verwegen, Geertruij, beiden overleden**"
- Scan: `https://images.memorix.nl/bhic/thumb/2000x2000/d10c5fda-3ce7-8465-d9e0-d50e12f7b761.jpg`

(Note: BHI IDs in the seed task were transposed between the two records; the values above are the
authoritative ones read off `GEERTRUDA_1939_SCAN_CHECK.md` and the record payloads.)

## Why the index alone could not answer this

The OpenArchieven / BHIC a2a index payload lists the mother only as a bare relation
(`<a2a:RelationType>Moeder</a2a:RelationType>`) with **no living/deceased attribute**, and neither
"wijlen" nor "in leven" appears anywhere in the index text. The deceased status exists ONLY on the
handwritten scan ("beiden overleden") — confirming the prior cycle's recommendation to read the
memorix scans directly was the correct and necessary step.

## Evidence strength

**strong** — two independent death aktes (different deceased child, different date, different
declarant and signature), both explicitly stating both parents deceased.

## GEDCOM

`@I004@` DEAT was already set to `BEF 22 OCT 1939` (Uden) in a prior cycle from akte Nr. 80.
This cycle the source NOTE was **upgraded** to cite BOTH akten and to record that the visual read
(not just OCR) confirms "beiden overleden" on each. No date change — the confirmation reinforces
the existing value.

## Lower bound reminder (unchanged)

Prior research established she was still alive after 1903 (widowed 18 Jul 1903) / into 1906 (son's
marriage). Combined with this finding:

> **Geertruda Verwegen: died between 1906 and 22 Oct 1939, in Uden.**

## Remaining lead (optional, to narrow the ~1906–1939 window)

Her own *Overlijden* akte in Uden (or a neighbouring municipality) 1906–1939, where she is the
*Overledene*, would give the exact date. Not required to close this check — the deceased-status
question is definitively answered.
