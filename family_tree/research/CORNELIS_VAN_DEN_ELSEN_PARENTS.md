# Parents of Cornelis van den Elsen (@I391@, b. ABT 1690, Gemert–Boekel area)

**Research date:** 2026-08-30
**Objective:** Identify the parents of Cornelis van den Elsen, the father of
Dirck Cornelis van den Elsen (@I384@), via primary DTB records on OpenArchieven / BHIC.

**Lineage under investigation (ascending):**
Anna Maria van den Elzen (Gen 3 wife, b.1878) ← Johannes ← Gerardus Cornelus ←
**Cornelius** van den Elsen (@I377@, bap. 18 Apr 1770 Boekel) ← **Dirck Cornelis**
van den Elsen (@I384@, m. 1768 Boekel) ← **Cornelis van den Elsen (@I391@)** ← **???**

---

## Result: PARENTS NOT ESTABLISHED — primary sources unavailable

No parents were added to the GEDCOM. Exhaustive searching found **no primary record
that names the parents of Cornelis van den Elsen (@I391@)**, and no record that could
be added with even *moderate* (single-source) confidence. The gap is a genuine record
survival/indexing gap, not a search failure. Details below.

---

## What Cornelis (@I391@) is anchored on

Cornelis himself is a **patronymic reconstruction** (already documented in
`DIRCK_VAN_DEN_ELSEN_PARENTS.md`). He is inferred from a consistent cohort of children
carrying the patronymic **"... Cornelis van den Elsen"** who marry in the Gemert–Boekel–
Erp–Oss region 1759–1810:

| Child (patronymic) | Event | Date | Place | Identifier (bhi:) |
|---|---|---|---|---|
| Dirck Cornelis van den Elsen | Trouwen (Bruidegom) | 15/5/1768 | Boekel | 67270964-4629-11e3-a747-d206bceb4d38 |
| Anna Cornelis van den Elsen | Trouwen (Bruid) | 7/11/1762 | Gemert | a0334f15-7895-2702-b634-976fd8248ecb |
| Elisabeth Cornelis van den Elsen | Trouwen (Bruid) | 28/1/1770 | Gemert | 678439e6-8b10-dc18-2bb1-b895219709cf |
| Petronilla Cornelis van den Elsen | Trouwen (Bruid) | 18/9/1768 | Gemert | f3b3d135-f831-47b4-fcf0-f30983800476 |
| Petrus Cornelis van den Elsen | Trouwen (Bruidegom) | 13/5/1782 | Boekel | 66ec1200-4629-11e3-a747-d206bceb4d38 |
| Hendrikus Cornelis van den Elsen | Trouwen (Bruidegom) | 25/11/1787 | Erp | 6f61ccfe-4629-11e3-a747-d206bceb4d38 |
| Francina Cornelis van den Elsen | Trouwen (Bruid) | 8/6/1795 | Boekel | 63f83312-4629-11e3-a747-d206bceb4d38 |

This confirms Cornelis existed and fathered many children c.1735–1760, but a patronymic
never names the *grandparents* — it points down, not up.

---

## Searches performed (OpenArchieven API, 2026-08-30)

All via `https://api.openarchieven.nl/1.0/records/search.json`. `eventplace` confirmed
to filter correctly; the free-text `place` parameter does **not** restrict results and
was discarded.

### 1. Cornelis's own baptism (would name his parents) — **0 results**
- `name=Cornelis van den Elsen, sourcetype=DTB Dopen, relationtype=Dopeling, year 1680–1705` → **0 records** (any place).
- No indexed baptism of a Cornelis van den Elsen exists in the birth window that fits
  a man fathering children c.1735–1760.

### 2. van den Elsen baptisms in Gemert during Cornelis's cohort — **0 results**
- `name=van den Elsen, eventplace=Gemert, sourcetype=DTB Dopen, relationtype=Dopeling, year 1683–1702` → **0 records**.
- There are **no indexed van den Elsen Dopelingen in Gemert for 1683–1702 at all** —
  a strong signal that the Gemert Catholic baptism registers for this period are lost
  or not digitized/indexed by BHIC.

### 3. Cornelis's own marriage (would name his parents/origin) — **not found**
- `name=Cornelis van den Elsen, sourcetype=DTB Trouwen, relationtype=Bruidegom, year 1710–1748` →
  only his *children* (patronymic, marrying 1759–1810 in Oss/Boekel/Erp/Gemert) match;
  **no marriage record for our Cornelis himself** (the two 1759 Oss "Cornelis van den Elsen ×
  Anna Maria Dirk Fransen" records — bhi:66e8dd26… / 7bae39a3… — are a *different*, later
  Cornelis in Oss and are chronologically too late to be @I391@).

### 4. Cornelis's own children's baptisms in Gemert 1728–1750 — effectively **0**
- `name=Cornelis van den Elsen, eventplace=Gemert, sourcetype=DTB Dopen, relationtype=Vader, year 1728–1750`
  → 1 hit, and it is dated **1799** (Joannes Cornelis van den Elsen, bhi:0613fdc9…), i.e. a grandson-era record, not our Cornelis.
- Even the baptisms of Cornelis's *own* children (who demonstrably existed) are absent
  from the index — confirming a **systemic gap in Gemert/Boekel DTB Dopen coverage
  c.1690–1750**, the same window that would hold Cornelis's parents.

### 5. Off-target hits (excluded)
- `Cornelis van den Elsen` as Vader in **Etten-Leur** 1705 (bhi:6dee9336…) — wrong region.
- `Cornelis van den Elsen` × Anna Maria Dirk Fransen in **Oss** 1759 — wrong generation/region.

---

## Conclusion & recommendation

The parents of Cornelis van den Elsen (@I391@) **cannot currently be established** from
primary records. The limiting factor is record survival/indexing: the BHIC/OpenArchieven
index contains **no van den Elsen baptisms in Gemert for c.1683–1702** and does not even
index Cornelis's own children's baptisms (c.1728–1750). Without his baptism or a marriage
record, no source names his father or mother.

**No individuals or families were added to the GEDCOM** — adding a speculative parent with
no source would be fabrication. Evidence strength for any candidate parentage is **none**.

**To break through this wall (future, off-line / on-site sources):**
1. **Gemert Rooms-Katholiek doop/trouw originals** at BHIC (Regionaal Archief) — the
   physical registers may cover 1690–1750 even where the online index does not; page-by-page
   review around the known children's births.
2. **Gemert schepenbank / notarial & estate records (Oud Rechterlijk Archief)** — land
   transfers and inheritance deeds routinely name a decedent's parents and heirs.
3. **`van den Elsen` one-name / Gemert-Bakel genealogical compilations** (e.g. published
   Gemert family reconstructions) that may have reconciled the DTB gaps from other sources.
4. Cross-check the **witnesses/godparents** on the children's records (once the originals
   are read) — a paternal grandparent or uncle often appears as a godparent, giving the
   father's name indirectly.

**Related files:** `DIRCK_VAN_DEN_ELSEN_PARENTS.md`, `CORNELIUS_VAN_DEN_ELSEN_DEEPER.md`.
