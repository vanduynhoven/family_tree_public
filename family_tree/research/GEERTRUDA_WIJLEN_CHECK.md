# Geertruda Verwegen (@I004@) — "wijlen" check on the two 1939 Uden death records

**Date:** 2026-08-30
**Question:** Do the two ~1939 Uden death records that list Geertruij Verwegen as *Mother*
carry the word **"wijlen"** (or "in leven" / any deceased marker) before her name — which
would prove she was already dead by that date and let us set a `BEF` death bound?

## Short answer

**No.** Neither record contains "wijlen", "in leven", or any deceased flag on the mother role.
There is **no basis to set a death date** for Geertruda from these records. No GEDCOM change made.

## What was checked

Fetched both records in full — the OpenArchieven HTML page **and** the raw `records/show.json`
(a2a XML) payload — and scanned case-insensitively for `wijlen`, `in leven`, `overleden`,
`reeds overleden`, and every `Geertru*` mention.

### Record A — 22 Oct 1939 (bhi:7b08b63b-e50c-7c6e-4e0e-74d4694c5ba2)
- DESC: `Overlijden, 22-10-1939, Uden, Geertruij Verwegen, Antonius van Duijnhoven, Martinus van Duijnhoven, Maria van Schijndel, BHIC: BS Overlijden`
- **Deceased (Overledene):** Antonius van Duijnhoven — her son
- **"wijlen":** not present · **"in leven":** not present
- `overleden` matched ONCE — only as `<a2a:RelationType>Overledene</a2a:RelationType>`, the
  role tag on the **deceased child**, not on the mother.

### Record B — 24 Dec 1939 (bhi:786908dd-bb58-acdd-6144-60b047801cb6)
- DESC: `Overlijden, 24-12-1939, Uden, Geertruij Verwegen, Petronella van Duijnhoven, Martinus van Duijnhoven, Franciscus van der Burgt, BHIC: BS Overlijden`
- **Deceased (Overledene):** Petronella van Duijnhoven — her daughter
- **"wijlen":** not present · **"in leven":** not present
- `overleden` again only as the `Overledene` role tag on the deceased child.

## Why "wijlen" was never going to be there

These are the **BHIC death INDEX** entries (a2a transcription), not the scanned akte text.
The index records parent names as flat role fields (`Moeder` / `Vader`) and carries **no
alive/deceased attribute** on those roles. The living-vs-dead distinction ("wijlen X", "in
leven X") lives only in the **handwritten original akte**. So the absence of "wijlen" here is
a property of the index format — it neither confirms nor denies she was alive; it simply
cannot say either way.

## Conclusion & next step

- The 1939 records confirm two of her children (Antonius, Petronella) and their death dates,
  but give **no death date for Geertruda herself**.
- To resolve her death date, the only path is the **actual scanned akte** for one of these two
  records (Record A scan: `https://images.memorix.nl/bhic/thumb/640x480/7cb65992-ae8e-519a-3245-458c293da078.jpg`)
  — read whether the mother is written as "wijlen Geertruij Verwegen" vs "Geertruij Verwegen".
  That requires human/OCR reading of the image, not the index API.
- **No GEDCOM update performed** — `@I004@` death field left unchanged.
