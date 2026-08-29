# Verwegen Ancestor Line — Geertruij Verwegen and Her Family

Research into the Verwegen line: **Geertruij (Geertruda) Verwegen**, wife of Martinus van Duijnhoven and great-great-grandmother of Arthur van Duynhoven.

Source: [Open Archieven](https://www.openarchieven.nl/) public JSON API (Brabants Historisch Informatie Centrum / BHIC civil-registry records), queried 2026-08-28. All linked records are BHIC (`bhi:`) unless noted.

---

## Key Finding — Geertruij's Parents Identified

The definitive source is the **civil marriage record of Geertruij Verwegen and Martinus van Duijnhoven**, which names both sets of parents.

**Marriage: 17 February 1858, Uden**
🔗 https://www.openarchieven.nl/bhi:056b95f5-6d55-d22a-95e7-1a87ac4d04c4

| Role | Name | Birth (per record) |
|------|------|--------------------|
| Bride (Bruid) | **Geertruij Verwegen** | 7 September 1833, Uden |
| Groom (Bruidegom) | Martinus van Duijnhoven | 18 December 1829, Uden |
| **Father of the bride** | **Johannes Verwegen** | — |
| **Mother of the bride** | **Mechelina van den Berk** | — |
| Father of the groom | Petrus van Duijnhoven | — |
| Mother of the groom | Joanna van der Heijden | — |

> This confirms and refines the FamilySearch data:
> - Name in Dutch civil records is spelled **"Geertruij"** (the record's exact form); FamilySearch and family documents use **"Geertruda"/"Geertruij"** interchangeably.
> - Precise birth: **7 September 1833, Uden** (previously only the year 1833 was recorded).
> - The groom's own birth date is given as **18 Dec 1829, Uden** (family/FamilySearch had 1829).

---

## The Verwegen Family (Geertruij's parents)

**Geertruij's father:** Johannes Verwegen (of Uden)
**Geertruij's mother:** Mechelina van den Berk

These are Arthur's **3rd-great-grandparents** (parents of great-great-grandmother Geertruij).

### Parents' marriage — NOT located
No indexed civil-registry marriage record for **Johannes Verwegen × Mechelina van den Berk** was found in Open Archieven. Given a first child around the late 1820s–early 1830s, their marriage likely occurred **c. 1820–1828**, possibly:
- before Dutch civil registration was consistently kept for this area, or
- indexed under a spelling variant (`Verweegen`, `van de Berk`), or
- simply not yet digitized/indexed by BHIC.
This is the primary research gap — see below.

---

## Siblings of Geertruij (confirmed children of Johannes Verwegen × Mechelina van den Berk)

Confirmed by fetching each birth record and verifying **both** parents match. Because the Open Archieven search API returns results by relevance (not exhaustively by date), this list is **partial** — additional siblings very likely exist.

| Birth date | Name | Record |
|------------|------|--------|
| 8 Sep 1835 | Adrianus Verwegen | https://www.openarchieven.nl/bhi:c47afc55-ddc5-acb1-e7c5-d4be64c5fa0f |
| 9 Aug 1837 | Johanna Maria Verwegen | https://www.openarchieven.nl/bhi:1ff4f2cc-c6c8-9776-f996-f56217ed7151 |
| 3 Jan 1841 | Anna Maria Verwegen | https://www.openarchieven.nl/bhi:fda07c41-6e77-6312-0bcb-cedbaa9feaa7 |

- **Adrianus Verwegen** (b. 1835) is further corroborated by his own marriage record (7 Feb 1863, Uden), which lists his parents as Johannes Verwegen × Mechelina van den Berk:
  🔗 https://www.openarchieven.nl/bhi:443e7400-41ca-b6d1-ea8d-c2fead8d2327

> Note: The Uden civil registry contains **many** Verwegen births 1810s–1880s from several distinct Verwegen couples. Given names such as "Adriana", "Anna Maria" and "Adrianus" recur across families, so a name match alone is NOT sufficient — every candidate above was verified against the two parent names.

---

## Reconstructed Verwegen Line

```
Petrus van Duijnhoven (1799–1882) ═╗
Johanna van der Heijden (1798–1875) ╠═ Martinus van Duijnhoven (b. 18 Dec 1829 Uden, d. 1903)
                                    ║      ║
                                    ║      ╠══ married 17 Feb 1858, Uden
                                    ║      ║
Johannes Verwegen ══════════════════╬══════╣
Mechelina van den Berk ═════════════╝      ║
   │  (Geertruij's parents = Arthur's      ║
   │   3rd-great-grandparents)             ║
   │                                       ▼
   ├─ Geertruij (Geertruda) Verwegen (b. 7 Sep 1833 Uden, d. 1900) ── wife of Martinus
   ├─ Adrianus Verwegen (b. 8 Sep 1835 Uden)
   ├─ Johanna Maria Verwegen (b. 9 Aug 1837 Uden)
   └─ Anna Maria Verwegen (b. 3 Jan 1841 Uden)
        (sibling list partial — more expected)
```

---

## FamilySearch IDs

| Person | FamilySearch ID | Notes |
|--------|-----------------|-------|
| Geertruij / Geertruda Verwegen (1833–1900) | **G9QG-HXD** | Confirmed via 1858 marriage record |
| Martinus van Duijnhoven (1829–1903) | G9QL-NJ8 | Spouse |
| Petrus van Duijnhoven (1799–1882) | GMKY-26P | Martinus's father |
| Johanna van der Heijden (1798–1875) | GMKB-4Y4 | Martinus's mother |
| **Johannes Verwegen** (Geertruij's father) | *not yet located* | New — no FS ID captured; search FamilySearch for a match |
| **Mechelina van den Berk** (Geertruij's mother) | *not yet located* | New — no FS ID captured; search FamilySearch for a match |

---

## Research Gaps & Next Steps

1. **Johannes Verwegen × Mechelina van den Berk marriage record — not found.**
   Search BHIC/Open Archieven with spelling variants (`Verweegen`, `Verwege`, `van de Berk`, `Berken`) and nearby parishes (Boekel, Veghel, Zeeland, Volkel). Estimated c. 1820–1828. This record would name **Geertruij's grandparents** (the next generation back on both the Verwegen and van den Berk sides).

2. **Complete the sibling list.** The Open Archieven search API paginates by relevance and truncates, so the three siblings above are a floor, not a ceiling. To enumerate exhaustively, retrieve the full Uden `BS Geboorte` index 1824–1852 and filter by the two parent names, or consult the BHIC scans of the Uden birth registers directly.

3. **Geertruij's own birth record (7 Sep 1833, Uden) is not separately indexed** as a standalone searchable "Kind" record in Open Archieven — the date comes from the 1858 marriage record. The original 1833 Uden birth act should exist in the BHIC register and can be pulled directly for primary confirmation of parents.

4. **Parents' death records — unconfirmed.** A "Mechelina van den Berk" death dated 18 Feb 1859, Uden exists (https://www.openarchieven.nl/bhi:01b717c1-0203-b4f0-b241-a97841a26537) but the record names **no parents or spouse**, so it cannot be tied to this family with confidence (multiple women shared the name). Johannes Verwegen's death was likewise not confirmed. Locate death acts to establish birth years and grandparents.

5. **Add FamilySearch profiles** for Johannes Verwegen and Mechelina van den Berk once located, and link them as parents of G9QG-HXD.

### Useful re-run queries (Open Archieven API)
```bash
# The marriage that anchors this whole line (parents named):
curl -s "https://api.openarchieven.nl/1.0/records/show.json?archive=bhi&identifier=056b95f5-6d55-d22a-95e7-1a87ac4d04c4"

# Hunt the parents' marriage (try variants):
curl -s "https://api.openarchieven.nl/1.0/records/search.json?name=Johannes%20Verwegen&eventtype=Huwelijk&number_show=40"
curl -s "https://api.openarchieven.nl/1.0/records/search.json?name=Mechelina%20van%20den%20Berk&eventtype=Huwelijk&number_show=40"

# Enumerate Verwegen births in Uden (then verify parents per record):
curl -s "https://api.openarchieven.nl/1.0/records/search.json?name=Verwegen&place=Uden&eventtype=Geboorte&number_show=900"
```
> Note: the API rate-limits (HTTP 429) under rapid record-detail fetches; throttle to ~1 request/second.

---

*Compiled 2026-08-28 from Open Archieven / BHIC civil-registry data. Confirmed parents of Geertruij Verwegen: **Johannes Verwegen** and **Mechelina van den Berk**, both of Uden.*
