# Werts × van den Elzen — Parents Research

Research into the **parents** (i.e. the next generation up) of:

- **Willem Werts** (@I420@, b. ~1785 Gemert)
- **Johanna van den Elzen / van der Elzen** (@I421@, b. ~1788 Gemert)

They are the maternal great-great-grandparents of Anna Maria Cornelissen, via:
Willem Werts × Johanna van den Elzen → **Maria Werts** (b. 10 Sep 1814 Gemert) →
m. Theodorus Cornelissen (1833 Bakel) → Peter Cornelissen (m. Johanna Verhoeven
1874 Bakel) → Anna Maria Cornelissen (m. Johan van Duijnhoven 1950).

## Result: parents NOT found (this generation is a documented dead-end for now)

After systematic searching of OpenArchieven (BHIC), **no record was found that names
the parents of either Willem Werts or Johanna van den Elzen.** The couple's own
marriage record — the document that would state each spouse's parents — could not be
located, and neither spouse's baptism record surfaced under any tried spelling. No new
GEDCOM individuals were added.

## What IS firmly established (anchor record, re-verified this cycle)

The couple themselves are confirmed by the **1833 marriage of their daughter Maria**:

- **Huwelijk, 20-04-1833, Bakel en Milheeze** (BHIC, BS Huwelijk)
- Identifier: `ed1ecde7-3191-66bb-28c2-546ed7e13e0e`
- URL: https://www.openarchieven.nl/bhi:ed1ecde7-3191-66bb-28c2-546ed7e13e0e
- Persons named in the record:
  - Bruidegom: **Theodorus Cornelissen** (parents Cornelis Cornelissen × Ida van de Weijer)
  - Bruid: **Maria Werts**, birthplace *Gemert*
  - Vader van de bruid: **Willem Werts**
  - Moeder van de bruid: **Johanna van der Elzen**

This record names Maria's parents but — as is normal for a BS Huwelijk — it does **not**
name the grandparents (Willem's and Johanna's own parents). It gives no birth/baptism
dates for Willem or Johanna either.

## Searches performed (OpenArchieven API + web pages), all NEGATIVE for parents

1. **Couple's own marriage** (would name the grandparents), tried as:
   - `Willem Werts` / `Wilhelmus Werts` as Bruidegom, all sources — only 18th-c. Bakel
     DTB Trouwen for a *different* "Willem Jan Werts" (1742, 1750) and 19th-c. grooms
     elsewhere (Asten 1861, Helmond 1828, Herpen 1843). None ~1805–1814 Gemert.
   - `Johanna van der Elzen`, `Joanna van den Elsen` as Bruid, all sources — no
     ~1800–1816 marriage matching a Johanna b.~1788.
   - Surname variants `Willem Wers`, `Wilhelmus Weerts` — no Gemert match.
   - **A civil (BS) marriage for this couple was likely never registered**: BS began
     only in 1811 in this region, and Maria was already born (10 Sep 1814) — the couple
     most probably married in the **DTB (church) register ~1805–1811**, before civil
     registration, which is thinly indexed for Gemert in OpenArchieven.

2. **Willem Werts baptism** (~1780–1795): DTB Dopen "Willem Werts" in Gemert returned
   nothing for the person himself. The name "Willem Werts" appears in Bakel en Milheeze
   DTB records only as a **patronymic given-name component** — e.g. "Godefridus Willem
   Werts", "Henricus Willem Werts" (children/adults *named after* a father Willem), not
   as our subject's own baptism.

3. **Johanna van den Elzen baptism** (~1782–1798 Gemert/Boekel): no direct baptism found.
   The "van den Elsen" surname does occur in **Gemert DTB** (e.g. "Joanna Ansems van den
   Elsen" 1720, "Joanna Antoni van den Elsen" as witness 1765/1809 Gemert), and in Uden
   ("Joanna Andreae van den Elsen", m. 1800 Uden), but none is a clean match for a
   Johanna born ~1788 in Gemert who married Willem Werts.

## Important caveat — do NOT conflate with the Boekel van den Elzen line

The GEDCOM already warns of this and it held up: **this Gemert "van der Elzen / van den
Elzen" line is DISTINCT** from the well-documented **Boekel "van den Elsen" family** that
produced Anna Maria van den Elzen (Gen-3 wife of Marianus van Duijnhoven). Do not borrow
parents from the Boekel line (Dirck Cornelis van den Elsen, Cornelius van den Elsen ×
Wilhelmina Bevers, etc.) for this Johanna — they are unrelated families with a
coincidentally similar surname.

## Data limitations / why the API kept returning noise

- The OpenArchieven API's `place`, `year_from/to`, and `relation_name` filters were
  **not honoured reliably** in this session — searches returned nationwide, out-of-range
  results (Venray, Tilburg, Cuijk, etc.) regardless of a `place=Gemert` or year window.
  Filtering therefore had to be done client-side by scanning result rows, which limits
  recall. Pre-1811 Gemert church (DTB) coverage is sparse in this index.

## Recommended next steps (for a future cycle / manual research)

1. **Find the couple's marriage in the Gemert DTB Trouwen ~1805–1811** — the single
   record most likely to name both sets of grandparents. Best pursued directly on the
   BHIC website (Brabants Historisch Informatie Centrum, toegang for Gemert DTB) or via
   FamilySearch's indexed/browsable Gemert church registers, rather than the OpenArchieven
   API whose place filter is unreliable.
2. **Maria Werts's 1814 birth (Geboorte) akte, Gemert** — locate the exact akte (it will
   restate Willem + Johanna and may give Willem's occupation/age, narrowing his birth year
   and hinting at his origin). Note the disambiguation already recorded in
   `CORNELISSEN_GREAT_GRANDPARENTS.md`: a *different* Maria/Joanna Maria Werts was born
   28-11-1815 Gemert to a **Cornelus** Werts — not our line.
3. **Death records of Willem Werts and Johanna van der Elzen (post-1833)** — a BS
   Overlijden akte would state each one's parents and confirm birth year/place, and is
   often the easiest route to the grandparents when a pre-1811 marriage is elusive.
4. Search **FamilySearch** and **WieWasWie** for the Gemert Werts and van den Elsen/Elzen
   families of the 1780s–1810s; cross-check any Werts baptism ~1785 Gemert against a
   plausible father.

## Sources checked

- OpenArchieven API `records/search.json` — multiple queries (Willem/Wilhelmus Werts,
  Willem Wers, Wilhelmus Weerts, Johanna van der Elzen, Joanna van den Elsen, Maria Werts).
- OpenArchieven record pages (`https://www.openarchieven.nl/bhi:<id>`) for metadata.
- Anchor record re-verified: bhi:`ed1ecde7-3191-66bb-28c2-546ed7e13e0e` (1833 Bakel marriage).
- Local: `vanduynhoven_family.ged` (@I420@/@I421@/@F145@) and existing research file
  `CORNELISSEN_GREAT_GRANDPARENTS.md`.

**Evidence strength for "parents unknown": strong** (multiple independent negative searches
+ structural reason: pre-1811 DTB gap). **New findings this cycle: 0 new individuals.**
