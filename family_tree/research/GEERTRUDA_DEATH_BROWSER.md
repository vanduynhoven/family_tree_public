# Geertruda Verwegen (@I004@) — Death Record: BHIC / OpenArchieven Browser Search

**Date of research:** 2026-08-30
**Method:** playwright-cli attached Chrome session, browsing OpenArchieven (BHIC-indexed civil registration, `record_archive=bhi`).
**Subject:** Geertruda Verwegen (@I004@), b. 7 Sep 1833 Uden, dau. of **Johannes Verwegen × Mechelina van den Berk** (m. 31 Jan 1819 Uden). Married **Martinus van Duijnhoven** 17 Feb 1858 Uden.

## Verdict

**NO death record for Geertruda Verwegen was found in the BHIC/OpenArchieven online index under any name variant matching her documented parents.** Her death is firmly constrained to **after 1906** but no verified akte could be located online. **The GEDCOM death was NOT changed** — no fabricated date recorded.

## Confirmed constraint (strong)

- **Alive Feb 1906**: son's marriage (bhi:92ef5014).
- **Widowed 18 Jul 1903**: her husband Martinus van Duijnhoven (@I003@, b. 18 Dec 1829) died 18 Jul 1903 Uden. His death akte was positively identified and matches our GEDCOM exactly:
  - BHIC Overlijdensregister **Uden 1903, archive 550, inv. 3237, record number 96**
  - permalink **bhi:25c78f5e-d553-7759-cc3b-00270a326750**
  - Deceased: Martinus van Duijnhoven; Father **Petrus van Duijnhoven**, Mother **Joanna van der Heijden** (= @I001@ × @I002@ in GEDCOM ✓); Relation/spouse listed as **"Geertruij Verwegen"**.
- Therefore Geertruda **outlived her husband** and **died sometime after her son's 1906 marriage** (i.e. > 1906, as a widow). She was ~73 in 1906.
- The current GEDCOM death "1900" is **wrong** (predates 1903 widowhood and 1906 son's marriage). The FamilySearch "9 Mar 1942" (age 108) is implausible and unsourced.

## Candidates checked and REJECTED (all wrong parents)

Every "Deceased"-role death record for name variants in Uden was opened and eliminated by parent mismatch (our target parents = Johannes Verwegen × Mechelina van den Berk):

| Permalink (bhi:) | Name as indexed | Death date | Parents on record | Verdict |
|---|---|---|---|---|
| 35398daf-660c-6328-8d49-fa08116f5538 | Geertrui Verwegen | 29 Oct 1906 | Theodorus Verwegen × Jacomina Meulemeesters | ✗ different person |
| 5d9c9ecc-5d3c-9e64-a7a8-ea67b9ab3250 | Geertrui Verwegen | 1 Dec 1949 | Daniel Verwegen × Gerdina Verwegen | ✗ + age 116 impossible |
| a6c11cfd-6279-8214-fa50-6813480122c9 | Geertruida Verwegen | 24 Aug 1888 | — | ✗ pre-1906 |
| d6c3ced8-ff8d-391b-f492-53e23233e7ae | Geertruij Verwegen | 29 Jan 1842 | Arnoldus Verwegen | ✗ pre-marriage |
| 3520ee56-d8d5-5258-1261-91eaf633854f | Geertruda van Duijnhoven | 9 Nov 1908 | Petrus van Duijnhoven × Megchelina Verwegen | ✗ a descendant (Petrus @I352@ × Megchelina Verwegen m.1904) |

## Searches run (queries → outcome)

OpenArchieven `search.php`, `record_archive=bhi`, `eventplace=Uden`, `eventtype=Overlijden`:
- `Geertruda Verwegen` → 3 records total, **none a death** (a birth as Mother 1847, two population-register entries 1810/undated). No death akte under exact maiden name.
- `Geertrui Verwegen` → 9 deaths; only Deceased entries = 1875(Mother), 1888, 1906, 1949 → parents wrong.
- `Geertruida Verwegen` → 4 deaths; Mother/Relation roles, wrong.
- `Gertrudis Verwegen` → 0.
- `Geertruij Verwegen` → 8 deaths; only Deceased = 1842. Note: Mother-role deaths 22-10-1939 & 24-12-1939 (children dying elderly — could be her children but not her own death).
- `Geertruda van Duijnhoven` (Uden) → 1 death (1908, wrong parents); (any place) → 14, all other persons.
- `Geertru Duijnhoven`, `Geertruij Duijnhoven`, `Verwegen Berk`, `Geertruda Berk` → **0 results**.
- `Verwegen` deaths in Uden (all) → 755 (whole surname across all roles; not individually triaged — she is not among the Deceased-role Geertru* entries).

## Why the record is likely not online

1. Her death akte may be indexed only under her married name **"weduwe van Martinus van Duijnhoven"** without a searchable Verwegen/Duijnhoven given-name pairing, or under an OCR/transcription spelling not caught.
2. She may have died in a neighbouring municipality (not Uden) and be indexed there — not yet searched exhaustively.
3. The pervasive **Verwegen ↔ van Duijnhoven intermarriage** (two Verwegen sisters married two van Duijnhoven brothers; son Petrus married Megchelina Verwegen 1904) produces many identically-named women, so name-only matches are unreliable and MUST be parent-verified.

## Recommended next steps

- Search BHIC Uden BS Overlijden **1906–1925** by browsing the register scans directly (memorix viewer) for a widow "Geertruij Verwegen / weduwe van Duijnhoven".
- Open the two 1939 Mother-role records (bhi:786908dd..., bhi:7b08b63b...) — if the deceased children are hers, the akte text names her and may state "overleden" with a year, narrowing her death window.
- Check neighbouring municipalities (Zeeland, Boekel, Veghel) BS Overlijden 1906–1925.
- Do NOT enter a death date in the GEDCOM until an akte with matching parents/spouse is found.

## GEDCOM

**No change made.** `@I004@` DEAT remains as-is pending a verified record. Existing "1900" value is known-wrong (see constraint above) and should be corrected to an open range (e.g. "AFT 1906") in a separate cleanup if desired.
