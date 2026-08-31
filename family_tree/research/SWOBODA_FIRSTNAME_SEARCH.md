# Swoboda First-Name Search — Anna Maria van Duynhoven's Husband

**Status:** UNRESOLVED — first name not confirmed. GEDCOM left unchanged.
**Last searched:** 2026-08-31

## Target
- **Bride:** Anna Maria van Duynhoven (`@I022@`), b. 19 Dec 1954, Green Isle, Sibley County, MN.
- **Groom:** surname **Swoboda**, nickname **"Boda"**. First name unknown (`@I199@`, current NAME = `[First name unknown] /Swoboda/`).
- **Estimated marriage:** ~1975–1985, any MN county (likely Sibley or an adjacent county — Green Isle sits on the Sibley/Carver/McLeod line).

## What was tried

### 1. Minnesota Official Marriage System (moms.mn.gov)
- Home page and `/Search` form load fine via `web_fetch` (headless render bypasses the site's Cloudflare challenge).
- The search is a **JavaScript-driven POST** that renders results into a client-side grid. It does **not** accept GET query parameters (`?LastName=...` returns the blank form), so `web_fetch` cannot retrieve results.
- Drove the form with the native **browser** tool: successfully typed `Van Duynhoven` into Last Name and clicked Search, but:
  - the results grid is **not exposed in the accessibility/ARIA snapshot**, and
  - the native browser panel **repeatedly crashed** on `screenshot`/results-read (HTTP 504 / "target closed"), likely due to the Cloudflare-protected heavy client app.
- `playwright-cli` fallback: its bundled Chromium **crashes on launch** ("Target crashed / Assertion error") in this environment.
- `curl` is blocked by Cloudflare ("Just a moment…" challenge).
- **Per the MOMS FAQ, the index only identifies the custodial county** — it is designed to point you to the county recorder, and certified certificates do **not** list parents. So even a successful MOMS hit gives the couple + date + county, from which the groom's first name IS visible on the results row, but the row could not be captured here.

### 2. Web searches (no hits)
- `Anna Maria Van Duynhoven Swoboda married Minnesota site:moms.mn.gov` → only the generic Search page.
- `"Swoboda" "Van Duynhoven" marriage` → no matching record.
- `"Boda" Swoboda Minnesota Green Isle Sibley` → no person match.
- `Anna Maria Swoboda born 1954 Minnesota Sibley County` → unrelated Swobodas only.
- `"Van Duynhoven" Swoboda marriage FamilySearch Minnesota` → only FamilySearch help/wiki pages (the MN Marriage Index 1958–2001 collection exists but is behind login).
- No obituary, FindAGrave, or public tree surfaced the couple.

## Recommended next steps (for a human / logged-in session)

1. **MOMS interactive search** (best): open https://moms.mn.gov/Search in a normal desktop browser and search:
   - Last Name: `Van Duynhoven` (also try `Van Duijnhoven`, `Vanduynhoven`), Search Option **Name Sounds Like**, Search By **Applicant 2 (Bride, pre-8/1/2013)**, County **All Participating Counties**, date range **1972–1990**.
   - The results row shows both applicants' names → read the Swoboda groom's first name there. If nothing, repeat with County = **SIBLEY**, then **CARVER**, **McLEOD**, **HENNEPIN**.
2. **FamilySearch** Minnesota Marriage Index 1958–2001 (logged-in playwright-cli chrome session): search bride *Anna Maria Van Duynhoven* b.1954, or groom surname *Swoboda* spouse *Van Duynhoven*.
3. **Sibley County Recorder** (custodian if married locally): sibleycounty.gov — request the marriage certificate.
4. **Family knowledge** — Arthur likely knows "Boda" Swoboda's given name directly; this is the fastest confirmation and (per project lessons) family-provided facts trump inferred data.

## GEDCOM
No change made. `@I199@` remains `[First name unknown] /Swoboda/` pending a confirmed first name. Do **not** guess a first name into the GEDCOM.
