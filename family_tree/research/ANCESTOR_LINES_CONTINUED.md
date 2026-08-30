# Ancestor Lines Continued — 3 New Areas

Date: 2026-08-30
Source: OpenArchieven API (`api.openarchieven.nl/1.0/records/search.json`) + record meta descriptions (`openarchieven.nl/bhi:<id>`)

## ⚠️ Methodological note (important for next cycles)
The OpenArchieven search API **ignored the `year_from`/`year_to` and `place` filters** in every query this session. Evidence: identical queries against `place=Bakel en Milheeze` and `place=Gemert` returned the *same* alphabetically-sorted result set, and `year_from:1655/year_to:1695` queries returned only post-1750 records. **Date/place-bounded API queries are unreliable on this endpoint** — the results are alpha-sorted by personname across the full corpus. Use the browser (openarchieven.nl / wiewaswie.nl faceted UI) for date/place-filtered work, or filter results client-side after fetching. No records could be confirmed strongly enough to add to the GEDCOM this round.

---

## AREA 1 — Henricus (Hendricus) van Duijnhoven (b.1837, `@I053@`)
Goal: his marriage, wife, children (he is Martinus's brother, believed father of a Johanna VD).

Searched: `name=Henricus van Duijnhoven, eventtype=Huwelijk, relationtype=Bruidegom`.
- **No marriage record for the 1837 Henricus was confirmed.** Bruidegom hits were all either 20th-century namesakes (Mierlo 1937, Helmond 1950, Wanroij 1927, Heumen 1930) or *earlier* Uden Henricus marriages (1820, 1829, 1830) — none matches a man born 1837.
- **Collateral (already in tree context):** Lambertus van Duijnhoven × Wilhelma van Leuken, 17-5-1829 Uden, **witness Henricus van Duijnhoven** — confirms an older Henricus active in Uden pre-1837 (a different individual; the Lambertus/Van Leuken line is documented in `LAMBERTUS_LINE.md`, `VAN_LEUKEN_CONNECTION.md`).
- Uden VD births search (`3642 hits`) was unusable — alpha-sorted, dominated by an unrelated "Adriaan van Duijnhoven" family (× Adriana van de Leemput, Uden 1835–43).

**Status: OPEN / no data.** Requires a date-filtered UI search on Uden BS Huwelijk 1857–1875 for a groom Henricus VD b.1837, and Uden BS Geboorte with him as *Vader*.

## AREA 2 — Johanna van Duijnhoven, wife of Willem Verhoeven (`@F142@` → daughter Johanna Verhoeven `@I161@`)
Goal: her parents / siblings (Bakel line).

Searched: `Johanna van Duijnhoven, Bruid, 1835–1875` (89 hits, alpha-sorted, all 20th-c) and `Willem Verhoeven, Bruidegom` (204 hits, all 20th-c namesakes, e.g. Tilburg 1946, Rotterdam/Andel 1907–13).
- **No match for the target Willem Verhoeven × Johanna VD couple.** The corpus surfaced only modern "Willem"-compound names (Cornelis Willem, Arie Willem, Aloijsius Willem Jacobus).
- Bakel Johanna VD birth hits were later-generation children (Christina Johanna 1911, Cornelia Johanna 1918, Helena Hendrika Johanna 1899) — none is a Johanna VD born ~1820–1850.

**Status: OPEN / no data.** Willem Verhoeven is too common for a name-only query; needs his own birth/marriage date + place to disambiguate, then pull his marriage record for the wife's parents. Cross-reference `INLAW_LINES_RESEARCH.md`.

## AREA 3 — Van Grootel deep line (Tonies/Antonius van Grootel ~1670, `find his parents`)
Goal: parents of Tonies (Antonius) van Grootel (~1670), the GEDCOM's oldest Van Grootel node (currently a patronymic-derived placeholder — line 3430, sourced only from `CORNELISSEN_5GEN_DEEPER.md`, **no baptism record on file**).

Searched: `Antonius van Grootel, Doop` and `Tonis van Grootel, Doop` (63 / 0 hits, date filter ignored → all post-1750).
- **No baptism found for the ~1670 Antonius** (the target). Confirmed date filter failure — cannot reach pre-1700 dopen via this API path.
- **New collateral Van Grootel families surfaced in Bakel en Milheeze (18th c., NOT the target generation but useful for future disambiguation of the Bakel Van Grootel cluster):**
  - **Jacobus Antony van Grootel × Johanna van den Eynden** — children bp. Bakel 1764, 1765. (`bhi:39b09229-3554-b2c4-6638-4a9fda30ab5d`, `bhi:983eb0e1-f1a6-9ad7-d29a-3a3d37696533`) — "Jacobus *Antony*" = son of an Antonius, a candidate descendant of the target line.
  - **Antonius Jansse van Grootel × Maria Huberti van Leyenburgh** — children bp. Bakel 1768–1783 (Petrus 1779, Andreas 1783, Francisca 1774). (`bhi:17aebcb8-8170-9dfa-b0cb-c7f5133a6340`, `bhi:1da7d45a-1aa9-d881-40f1-f3569910e1ff`, `bhi:316a9567-e7f7-2307-f945-e5e44648c35a`)
  - **Antonius Janse van Grootel × Joanna Janse van de Wassenbergh** — Gemert 1767, witness Petronella Janse van Grootel. (`bhi:3083c159-bbbd-3f16-dcf9-19df0e320bef`) — ties to the Wassenberg/VD connection noted in `WASSENBERG_VD_CONNECTION.md`.

**Status: OPEN / no data for the target.** The ~1670 Antonius parents remain unproven. Next: use the openarchieven browser UI faceted on Gemert/Bakel DTB Dopen **1660–1690** for a baptism of Antonius van Grootel, or work forward from Petrus Tonies van Grootel (`@` line 3441) to find *his* baptism (which would name Tonies + a mother).

---

## GEDCOM impact this round
**No individuals or families added.** No record met the "confirmed by record meta" bar for any of the three targets — every match was either a modern namesake or a collateral 18th-c family, not the specific ancestor sought. Adding placeholders would degrade the tree; the collateral Van Grootel families above are logged as leads only.

## Recommended next steps (highest-value first)
1. **Area 3 — Petrus Tonies van Grootel baptism:** search his baptism directly; it names Tonies (father) and the mother — closing the ~1670 generation with a real record instead of a patronymic inference.
2. **Area 1 — Henricus VD b.1837:** browser UI, Uden BS Huwelijk 1857–1875, groom Henricus VD; then Uden BS Geboorte, vader Henricus VD.
3. **Area 2 — Willem Verhoeven:** first nail down his own birth date/place from the daughter Johanna Verhoeven's (`@I161@`) birth record, then his marriage record yields Johanna VD's parents.
4. **Tooling:** stop relying on API `year_from/year_to/place`; they are silently ignored on this endpoint.
