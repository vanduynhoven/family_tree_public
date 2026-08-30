# Children of Johanna Maria van Duijnhoven × Petrus Johannes van Rijbroek

**Parents:** Petrus Johannes van Rijbroek (@I039@, b.5 Sep 1902 Veghel) × Johanna Maria van Duijnhoven (@I012@, b.14 Sep 1913 Boekel)
**Marriage:** 29 Mar 1932, Uden — akte bhi:b7dac8be-4629-11e3-a747-d206bceb4d38 (BHIC BS Huwelijk Uden)
**Family record:** `@F011@` (HUSB @I039@ × WIFE @I012@) — currently **no children linked**
**Research date:** 2026-08-30

## Conclusion: NO CHILDREN ADDED — records under privacy embargo

The task premise ("6 births found 1933–1952, Uden, not yet added to GEDCOM") **could not be
verified against any public source**. No birth records for these children exist in the
OpenArchieven / BHIC index, and none can — they fall under the Dutch civil-records privacy
embargo. **Zero individuals were added to the GEDCOM.** Adding six children would have
required fabricating names, dates, and akte identifiers.

## Evidence

### 1. The BHIC birth index for "van Rijbroek" in Uden stops at 1925
Query: `name=van Rijbroek, eventplace=Uden, sourcetype=BS Geboorte` → **33 records total**,
none dated after **1925**. The latest Uden van Rijbroek births in the index:

| Date | Child | relationtype | identifier |
|------|-------|--------------|------------|
| 23/5/1913 | Hendricus Gerardus van Rijbroek | Kind | bhi:119ecb85-885d-68f2-9f7e-68eeda7e323d |
| (mother-role records only 1914–1925) | — | Moeder | — |

There are **0 records** with `relationtype=Kind` in the range 1933–1952.

### 2. Across the ENTIRE index, no van Rijbroek birth is later than 1925
Query: `name=van Rijbroek, sourcetype=BS Geboorte` (no place filter) → **927 records**,
**maximum birth year = 1925**, **0 records dated 1926 or later**.

### 3. Cause — Dutch civil-record privacy embargo
Netherlands civil-registration **birth records (geboorteakten)** are released to the public
archives only **~100 years after the event**. In 2026 the public boundary sits at roughly
1925/1926. Births from **1933–1952 are still closed** and will not appear in OpenArchieven /
BHIC / WieWasWie for decades:

- Births from 1933 → publicly available ~2033
- Births from 1952 → publicly available ~2052

This fully explains the absence: it is not a search-parameter problem (marriages for
van Rijbroek in Uden return 34 hits; the collection is well-indexed), it is a legal
release restriction on the birth series.

## Where the "6 births" figure likely came from

The prior "6 births found" was **not** sourced from OpenArchieven public birth records
(they cannot be). Possible real origins to chase via a non-embargoed channel:
- **Family knowledge / oral history** (living relatives) — the most likely and appropriate source
- **CBG / Centraal Bureau voor Genealogie** persoonskaarten / persoonslijsten (some accessible
  to next-of-kin on request)
- **Bevolkingsregister / gezinskaarten (population/family cards)** for Uden, which sometimes
  extend past the birth-akte embargo and list household children
- **Parish (RK) baptism registers** for Uden — often held by the parish/BHIC with different
  (sometimes shorter, sometimes longer) access rules than civil birth aktes
- **Death records or memorial cards (bidprentjes)** of the children, if any have died —
  death aktes have a much shorter (~50 yr / on-request) embargo and would confirm names/dates

## Recommended next action

Do **not** enter any children into `@F011@` from the public archive — the data is not
retrievable there. To populate these six children with citable evidence, obtain them from
a **non-embargoed source**: family records/oral history, an Uden gezinskaart, RK baptism
registers, or bidprentjes. When a name + date is confirmed from such a source, add each
child with a NOTE citing that specific source (not a BHIC birth akte, which does not exist
publicly).

### Template for when real (non-embargoed) evidence is obtained
```python
child_id = ged.add_individual(
    name='<given> /van Rijbroek/', sex='M/F',
    birth_date='DD MON YYYY', birth_place='Uden, Noord-Brabant, Netherlands',
    note='Child of Petrus Johannes van Rijbroek (@I039@) x Johanna Maria van Duijnhoven (@I012@). '
         'Source: <family record / Uden gezinskaart / RK doopregister / bidprentje — NOT a public '
         'BS Geboorte akte; those are under privacy embargo until ~20XX>.',
    famc='@F011@')
ged.add_link('@F011@', 'CHIL', child_id)
ged.save()
```

## Queries run (reproducible)
- `GET api.openarchieven.nl/1.0/records/search.json?name=van Rijbroek&eventplace=Uden&sourcetype=BS Geboorte&number_show=100` → 33 found, max year 1925
- `GET …?name=van Rijbroek&sourcetype=BS Geboorte&number_show=100` → 927 found, max year 1925, 0 records ≥1926
- `GET …?name=van Rijbroek&eventplace=Uden&sourcetype=BS Huwelijk` → 34 found (collection is indexed; only births are embargoed)
