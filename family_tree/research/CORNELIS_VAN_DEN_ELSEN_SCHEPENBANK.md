# Cornelis van den Elsen (@I391@) — Parents via BHIC Schepenbank / Notarial Archives

**Subject:** Cornelis van den Elsen, b. ABT 1690 (Gemert/Boekel area, Noord-Brabant), father of
Dirck Cornelis (m.1768 Boekel), Anna (m.1762), Elisabeth (m.1770), Petronilla (m.1768),
Hendrikus (m.1787), Francina (m.1795), Aldegondis (mother 1772+), et al.
**Goal of this cycle:** find Cornelis's own parents via schepenbank (Oud Rechterlijk Archief)
or notarial deeds, since his DTB baptism is absent from OpenArchieven.
**Date:** 2026-08-30
**Result: NEGATIVE — no parents identified. GEDCOM NOT modified.**

## Important caveat on the subject himself
Cornelis @I391@ is itself a **patronymic-derived reconstruction** with no primary source
(see `DIRCK_VAN_DEN_ELSEN_PARENTS.md`). He was inferred purely from the shared patronymic
"Cornelis" carried by a cluster of van den Elsen children marrying 1762–1787 in Gemert/Boekel.
Establishing *his* parents therefore requires a source that names Cornelis directly — which
this search did not find.

## Searches performed (OpenArchieven API, archive=bhi / BHIC)

| # | Query | Result |
|---|-------|--------|
| 1 | name="van den Elsen", sourcetype=Schepenbank, place=Boekel, 1680–1750 | **0 records** |
| 2 | name="van den Elsen", sourcetype="Oud Rechterlijk Archief", place=Boekel, 1680–1750 | **0 records** |
| 3 | name="van den Elsen", sourcetype=Schepenbank, no place, 1650–1760 | **0 records** |
| 4 | name="van den Elsen", sourcetype="Oud rechterlijk archief", no place, 1650–1760 | **0 records** |
| 5 | name="van den Elsen", sourcetype=Notarieel, 1700–1780 | **0 records** |
| 6 | name="van den Elsen", place=Gemert, all types, 1680–1750 | 17,729 hits — all BS/DTB/bidprentjes/bevolkingsregister; **no rechterlijk/notarial** |
| 7 | name="Cornelis van den Elsen", DTB Dopen, relationtype=Kind, 1685–1710 | **0 records** (no baptism of Cornelis as a child) |

**Finding:** OpenArchieven indexes **no schepenbank (ORA) or notarial records** at all for the
surname van den Elsen in this period/region. The BHIC rechterlijke and notariële archieven for
Boekel and Gemert are simply **not name-indexed on OpenArchieven** — they exist only as
scanned, un-indexed inventories at BHIC (`www.bhic.nl`), searchable only by leafing through
scans, not by person name via this API.

## Children's marriage records — do they name Cornelis (the father)?
Fetched full A2A person/relation detail for each child's marriage. **None names a parent.**
These Gemert/Boekel DTB Trouwen entries list only bride, groom, and lay witnesses:

- **Dirck Cornelis** m. 15-5-1768 Boekel → bride Jennemij Peters van Leucken; witnesses
  Joannes van der Wijst, Gerardus Schmitz. No parents. (bhi:67270964-4629-11e3-a747-d206bceb4d38)
- **Elisabeth Cornelis** m. 28-1-1770 Gemert → groom Jacobus Janse van de Laer. No parents.
  (bhi:678439e6-8b10-dc18-2bb1-b895219709cf)
- **Petronilla Cornelis** m. 18-9-1768 Gemert → groom Henricus van Uden. No parents.
  (bhi:f3b3d135-f831-47b4-fcf0-f30983800476)
- **Anna Cornelis** m. 7-11-1762 Gemert → groom Jacobus Hoevenaers. No parents.
  (bhi:a0334f15-7895-2702-b634-976fd8248ecb)
- **Hendrikus Cornelis** m. 25-11-1787 Erp → bride Geertruij Hendrik van der Meer. No parents.
  (bhi:6f61ccfe-4629-11e3-a747-d206bceb4d38)
- **Francina Cornelis** m. 8-6-1795 Boekel → groom Gerardus Nicolai Jan Hermens; witnesses
  Joannes van der Wijst, Joannes Jansen. No parents.
  (bhi:63f83312-4629-11e3-a747-d206bceb4d38)

The patronym on each child ("Cornelis") confirms the father was named Cornelis but gives
**no grandfather's name**. No van den Elsen kin appear as witnesses to point at a family.

## Published trees
- Web search (genealogieonline / geneanet, Aug 2026): no tree contains a Cornelis van den
  Elsen b. ~1685–1700 Boekel/Gemert with parents attached. The one Boekel-born match
  ("Cornelis Dirk van den Elzen", stamboom-geerts I3311) is a **later** generation, not this man.
- Stamboom Derikx search URL returned HTTP 404 (site structure changed); no data retrieved.

## Conclusion & recommendation
No source at even **moderate** evidence strength names Cornelis van den Elsen's father.
Per the identification bar, **no parent individual/family was added to the GEDCOM.**

The DTB gap plus the un-indexed rechterlijk/notarial archives mean the only realistic paths
forward are **offline / scan-level**, not API:
1. **BHIC scans directly** (`www.bhic.nl`): browse the Oud Rechterlijk Archief and Notariële
   Archieven inventories for **Boekel** (which belonged to the Land van Ravenstein / duchy of
   Cleves jurisdiction) and **Gemert** (a sovereign commandery of the Teutonic Order with its
   own schepenbank) c. 1690–1740 — transports, estate divisions (deling), and guardianship
   (momboirschap) deeds are where a "Cornelis, son of X van den Elsen" would surface.
2. **Gemert schepenprotocollen** — Gemert's independent status means its 17th–18th c. court
   records are a distinct, deep series held at BHIC/Gemert heritage; a deling among Cornelis's
   generation could name his father.
3. **DTB Gemert/Boekel dopen 1685–1705** — re-check the *scanned* (not indexed) baptism
   registers directly for a Cornelis child of a van den Elsen; OpenArchieven's index has a
   known gap here.

## Research State
- **Answered:** OpenArchieven holds no schepenbank/ORA/notarial index for van den Elsen;
  children's marriages name no grandparent; no published tree supplies Cornelis's father.
- **Open / next leads:** BHIC scan-level search of Boekel & Gemert ORA + notarial + the
  1685–1705 dopen registers (requires manual scan reading, outside the API).
- **Dead-ends this cycle:** API sourcetype filters Schepenbank/ORA/Notarieel (all 0);
  Derikx tree URL (404).
- **Evidence strength for any parent claim:** none — no candidate to even rate.
