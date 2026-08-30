# Geertruda Verwegen (@I004@) — Check of the two 1939 Uden Mother-role death records

**Date:** 2026-08-30
**Question:** Do the two ~1939 Uden death records that show "Verwegen" in a *Mother* role list
Geertruda Verwegen as a **deceased** mother (i.e. do they date/pin her own death)?
**Source:** OpenArchieven / BHIC index (`record_archive=bhi`), full `records/show.json` payloads.

## Short answer

**No.** In both records Geertruij Verwegen appears as the **mother of the deceased child**, not as
the deceased person. The BHIC death index carries **no alive/deceased flag on the parent roles**, so
these records do **not** state that the mother was already dead, and they do **not** provide a death
date for her. They are therefore *not* death records for Geertruda herself.

**BUT** — this is a strong positive genealogical finding: both deceased are **her children**. Both
records name the parent couple **Geertruij Verwegen × Martinus van Duijnhoven**, which is exactly
our target's marriage (Geertruda Verwegen × Martinus van Duijnhoven, m. 17 Feb 1858 Uden). This
confirms two of her children and their death dates, and gives a firm new **lower bound** context
(children still being born/living into adulthood, dying 1939).

## The two records, fully decoded

### Record A — 22 Oct 1939 (bhi:7b08b63b-e50c-7c6e-4e0e-74d4694c5ba2)
- **Deceased (Overledene):** **Antonius van Duijnhoven** (male), spouse **Maria van Schijndel**
- **Mother (Moeder):** Geertruij Verwegen
- **Father (Vader):** Martinus van Duijnhoven
- Source: BS Overlijden Uden 1939, BHIC archive 405, Overlijdensregister 1939, deel/registry **568**, **akte no. 80**
- Scan: https://images.memorix.nl/bhic/thumb/640x480/7cb65992-ae8e-519a-3245-458c293da078.jpg

### Record B — 24 Dec 1939 (bhi:786908dd-bb58-acdd-6144-60b047801cb6)
- **Deceased (Overledene):** **Petronella van Duijnhoven** (female), spouse **Franciscus van der Burgt**
- **Mother (Moeder):** Geertruij Verwegen
- **Father (Vader):** Martinus van Duijnhoven
- Source: BS Overlijden Uden 1939, BHIC archive 405, Overlijdensregister 1939, deel/registry **568**, **akte no. 98**
- Scan: https://images.memorix.nl/bhic/thumb/640x480/d10c5fda-3ce7-8465-d9e0-d50e12f7b761.jpg

## Interpretation

1. **These are deaths of Geertruda's adult children, not of Geertruda.** The parent-pair
   `Geertruij Verwegen × Martinus van Duijnhoven` matches our @I004@ × @I003@ couple. Antonius
   (d. 1939, m. Maria van Schijndel) and Petronella (d. 1939, m. Franciscus van der Burgt) are her
   son and daughter.
2. **No death date for Geertruda is derivable here.** The BHIC index lists parents by name only;
   it does not record whether a named parent was living or deceased at the child's death, so the
   role "Moeder" is *not* evidence that she was already dead by 1939 (nor that she was alive).
3. **The 1939 dates do NOT extend her known lifespan.** Her children dying in 1939 says nothing
   about when she died; she could have predeceased them (she was b. 1833, so ~106 in 1939 —
   almost certainly already dead) or, far less plausibly, still been alive. The established
   constraint from prior research stands: she was alive Feb 1906 (son's marriage), widowed
   18 Jul 1903, so **died after 1906**, with a realistic upper practical bound well before 1939.

## Verification against the parent couple

- Prior confirmed anchor (husband's death akte bhi:25c78f5e): Martinus van Duijnhoven, parents
  Petrus van Duijnhoven × Joanna van der Heijden, spouse "Geertruij Verwegen" — matches GEDCOM @I003@/@I004@. ✓
- Both 1939 records reuse the identical spouse-pair `Geertruij Verwegen × Martinus van Duijnhoven`,
  consistent with that anchor. ✓ (Note: name-only match; not cross-checked against Geertruda's own
  parents Johannes Verwegen × Mechelina van den Berk, because parent-of-parent data is not in the
  child death index. Confidence: **moderate–strong** on the couple identity, given the exact
  Martinus van Duijnhoven pairing in the same municipality.)

## New genealogical leads (worth following separately)

- **Antonius van Duijnhoven** (son, d. 22 Oct 1939 Uden, m. Maria van Schijndel) — search his
  birth/marriage to confirm he is @I004@'s child and to date his birth.
- **Petronella van Duijnhoven** (daughter, d. 24 Dec 1939 Uden, m. Franciscus van der Burgt) —
  likewise. Petronella's own death akte (no. 98) or her marriage akte may explicitly state whether
  her mother was "wijlen" (late/deceased) — that phrasing on the *full scan* could finally pin
  Geertruda's death to "before 24 Dec 1939". **Recommend reading the memorix scans directly.**

## GEDCOM

**No change made.** Neither 1939 record is a death record for Geertruda Verwegen, and neither
provides a death date for her. `@I004@` DEAT remains unchanged pending an akte in which she is the
*Overledene* with matching parents/spouse. (The known-wrong "1900" value should still be corrected
to an open range such as "AFT 1906" in a separate cleanup.)

## Next step to actually date her death

Read the two 1939 full-page scans (and/or Petronella's & Antonius's marriage aktes) for the Dutch
word **"wijlen"** or **"overleden"** before the mother's name — that is the only place in this
document set that would state she was already deceased and thereby set an upper bound
("before 22 Oct 1939"). Absent that, pursue her own Overlijden akte in Uden 1906–1939 or in a
neighbouring municipality.
