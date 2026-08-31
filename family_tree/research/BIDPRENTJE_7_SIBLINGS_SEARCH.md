# Bidprentje (Prayer Card) Search — 7 Blocked Siblings of Johan van Duijnhoven

**Date:** 2026-08-31
**Method:** Same bidprentje / prayer-card index method that confirmed Marinus (d.2014,
Heemkundekring Zeeland) and Gerarda 'Grada' (d.2002, Heemkundekring Weerderheem, Valkenswaard).
**Primary source:** OpenArchieven / OpenArch API (`api.openarch.nl/1.0/records/search.json`
and `.../show.json`), which aggregates the bidprentjesverzamelingen of ~40 Dutch
heemkundekringen (Weerderheem, Vehchele, De Kommanderij Gemert, Roerstreek, Erthepe,
De Goede Stede Hamont, Nederlands/Euregionaal Bidprentjes Archief, etc.) plus the
BS Overlijden / Huwelijk civil registries and bevolkingsregisters.

## Targets (children of Marianus van Duijnhoven × Anna Maria van den Elzen)

Birth data taken from the GEDCOM (`vanduynhoven_family.ged`), **not** the task prompt —
several prompt dates were wrong (corrected below).

| ID | Name | Birth (GEDCOM) | Status entering search |
|----|------|----------------|------------------------|
| @I007@ | Francina van Duijnhoven | **10 Apr 1907** Boekel (prompt said 5 Jun — wrong) | unknown death |
| @I008@ | Martinus 'Tinus' van Duijnhoven | 26 Mar 1908 Boekel | m. Woutera Barbara Janssen 1949; death unknown |
| @I009@ | Gerardus van Duijnhoven | 8 Sep 1909 Boekel | m. 1930; death unknown |
| @I010@ | Hubertus van Duijnhoven | 28 May 1911 Boekel | **already confirmed d.23 Nov 1945 — skipped** |
| @I011@ | Jan (Joannes) van Duijnhoven | **9 May 1912** Boekel (prompt said "1912") | death unknown |
| @I012@ | Johanna Maria van Duijnhoven | 14 Sep 1913 Boekel | m. Petrus Johannes van Rijbroek 1932; death unknown |
| @I013@ | Johanna van Duijnhoven | 26 Sep 1914 **Uden** | m. Karel Holleman 1942 — **already known, not van der Wijst** |

### Prompt correction
The prompt's target #7 ("Johanna b.1914 married van der Wijst 1940") does **not** match
the GEDCOM. `@I013@` Johanna (b.26 Sep 1914 Uden) married **Karel Holleman (1942)**, and
`@I012@` Johanna Maria (b.1913) married **Petrus Johannes van Rijbroek (1932)**. No child
of this couple married a van der Wijst. There is no `@I014b@`; `@I014@` is Johan/John
(emigrant, d.1985 Minnesota). Both Johanna's spouses are already recorded, so neither is a
research target.

**Five truly-unknown targets pursued:** Francina @I007@, Martinus @I008@,
Gerardus @I009@, Jan @I011@, Johanna Maria @I012@.

## Result: NO confirmed matches — 0 GEDCOM changes made

Searched every OpenArch-aggregated bidprentje collection + BS Overlijden + BS Huwelijk
for each target, across three surname spellings (Duijnhoven / Duynhoven / Duinhoven) and
name variants (Jan/Johannes), then fetched full A2A records to check the **deceased
person's own birth date and birthplace** against the GEDCOM. Match criterion: exact
birthdate OR (name + parents = Marianus × Anna Maria van den Elzen). Name-only hits were
rejected per the "do NOT add on name alone" rule — there are hundreds of van Duijnhovens
in this region.

### Candidates found and REJECTED (birthdate/birthplace mismatch)

1. **Jan van Duijnhoven** — bidprentje, Heemkundekring Weerderheem (Valkenswaard),
   d. 1 Nov 2001. Deceased b. **24 Mar 1912 in Cuijk**.
   `https://www.openarchieven.nl/hwh:2f47cd10-4c53-978d-3f94-65d3ee661a8c`
   → **REJECTED.** Our Jan @I011@ was born **9 May 1912 in Boekel**. Different birth date
   *and* birthplace (Cuijk ≠ Boekel). A namesake — tempting because Weerderheem/Valkenswaard
   also holds sibling Grada's card, but the birth data rules it out.

2. **Gerardus Petrus van Duijnhoven** — bidprentje, Heemkundekring Vehchele & Heemkunde-
   vereniging Roerstreek (Veghel), d. 4 May 1984. Deceased b. **29 Nov 1908 in Uden**.
   `https://www.openarchieven.nl/hkv:a4d61696-b729-f572-e0ec-434d5efa4b52`
   → **REJECTED.** Our Gerardus @I009@ was born **8 Sep 1909 in Boekel**, no middle name
   "Petrus". Different date, birthplace, and name. A namesake.

### No candidates at all
- **Francina @I007@** (b.1907): only 19th-century namesakes (e.g. Francina b.1813 Gemert,
  d.1882) — none near 1907.
- **Martinus @I008@** (b.1908): closest is a Martinus d.1952 Bakel (parents Theodorus ×
  Helena van Dijk — wrong parents) and an Adrianus Wilhelmus b.5 Apr 1908 Helmond (wrong
  name/place). No 26 Mar 1908 Boekel deceased.
- **Johanna Maria @I012@** (b.1913): no deceased with birth 14 Sep 1913.

## Why the searches came up empty (assessment)

1. **Privacy embargo.** BS Overlijden is closed 50 years, BS Huwelijk 75 years. The 1930
   (Gerardus), 1932 (Johanna Maria), 1942 (Johanna) and 1949 (Martinus) marriages are only
   just clearing the 75-year window and most Brabant municipalities have not yet published
   them to OpenArch. Deaths of siblings who lived into the 1980s-2000s are largely
   unindexed.
2. **Boekel → Uden move (1913-14).** Any record after ~1914 for this family is filed under
   **Uden**, not Boekel — future searches should weight Uden, Veghel, Meierijstad, and the
   Uden-area heemkundekringen.
3. **Bidprentje coverage is a sample, not a census.** A heemkundekring only holds the cards
   people donated. Absence of a card is not evidence the person is unrecorded elsewhere.

## Recommended next steps (not doable via the public OpenArch API this cycle)
- Query **Uden-area** heemkundekring bidprentje collections directly (Heemkundekring Uden,
  Heemkundekring Vehchele already checked, Meierijstad collections) for post-1914 cards.
- **WieWasWie** authenticated search (blocked to `web_fetch` — needs a logged-in session)
  for BS Overlijden Uden 1980-2015 on the surname.
- **BHIC bevolkingsregister Uden** (family card / gezinskaart) — would give each sibling's
  full life dates in one document; several Uden 1915/1927 registration hits already appeared
  and are worth pulling.
- **Delpher** newspaper death notices (overlijdensadvertenties) for Uden/Veghel.

## Verification of the two prompt-claimed prior confirmations
- The prompt states Grada was confirmed via Weerderheem (Valkenswaard). Consistent with the
  data seen: Weerderheem's bidprentje collection is in OpenArch and does hold van Duijnhoven
  cards. Not re-verified this cycle (out of scope — already recorded).

---
*Search log:* OpenArch `search.json` (name × eventtype, number_show up to 200) followed by
`show.json` A2A full-record fetch with per-person birthdate extraction; web_search for
Martinus/Woutera 1949 and Francina 1907 Boekel; WieWasWie fetch (auth-blocked). All URLs
above are live OpenArchieven permalinks. No `gedcom_update` calls made — nothing met the
confirmation bar.
