# Van Leuken Sisters — CONFIRMED

*Research date: 30 Aug 2026*

## Conclusion

**Joanna Maria (Peter) van Leuken (`@I385@`) and Cornelia (Peter) van Leuken
(`@I387@`) are sisters** — both daughters of **Peter (Petrus) van Leuken
(`@I366@`)** and **Jenneke Jan Bankers (`@I386@`)** of Boekel, Noord-Brabant.

**Evidence strength: STRONG** (corroborated by multiple independent civil and
church records that name the same parental couple).

---

## How the linkage is anchored

The two sisters are tied to the *same* couple by chaining three record facts:

1. **Cornelia → father Peter van Leuken.** Her 1858 death record names her father.
2. **Antonetta (a third sibling) → parents Peter van Leuken × Jenneke Jan Bankers.**
   Her 1816 death record names *both* parents, fixing the couple's exact names.
3. **Joanna Maria → mother Jenneke Jan Bankers.** Her 1817 death record names her
   mother as "Jenneke Jan Bankers" — identical to Antonetta's mother — placing
   Joanna Maria in the same sibling group as Antonetta and Cornelia.

Because Joanna Maria and Antonetta share the mother *Jenneke Jan Bankers*, and
Antonetta and Cornelia share the father *Peter van Leuken*, and Antonetta's record
names that couple together, all three are children of Peter van Leuken × Jenneke
Jan Bankers. Hence **Joanna Maria and Cornelia are full sisters.**

### Note on patronymics
Joanna Maria's 1817 death record clerk wrote her as "Jennemie **Jansse** van
Leuken" (with a brother "Jan Jansse van Leuken" present). This *Jansse* form
conflicts with the *Peters* patronymic in her 1768 marriage ("Jennemij **Peters**
van Leucken"). The marriage-record patronymic (Peters → father Peter) and the
1817 record's **mother = Jenneke Jan Bankers** are the load-bearing facts; the
stray *Jansse* is a late civil-registration inconsistency, not a second family.

---

## Source records (OpenArchieven / BHIC)

| Fact | Record | Description (as returned) |
|------|--------|---------------------------|
| Cornelia's father = Peter van Leuken | `bhi:46b921ce-f9e0-cb29-bbc6-2474f97e47c2` | Overlijden 10-2-1858 Boekel — *Cornelia Peter van Leuken*, father *Peter van Leuken*, husband *Huibert Dapperens* |
| Antonetta's parents (couple anchor) | `bhi:a49b6efc-3b39-5cc3-3366-ec50de2b7a48` | Overlijden 4-4-1816 Boekel — *Antonetta Peter van Leuken*, mother *Jenneke Jan Bankers*, father *Peter van Leuken* |
| Joanna Maria's mother = Jenneke Jan Bankers | `bhi:c93bd6ba-ef9f-0acd-a64f-fd15da8d2eed` | Overlijden 24-5-1817 Boekel — *Jennemie Jansse van Leuken*, mother *Jenneke Jan Bankers*, present *Jan Jansse van Leuken*, *Dirk van den Elsen* (widower) |
| Joanna Maria's patronymic (father Peter) | `bhi:67270964-4629-11e3-a747-d206bceb4d38` | Trouwen 15-5-1768 Boekel — *Jennemij **Peters** van Leucken* × *Dirck Cornelis van den Elsen* |
| Cornelia's marriage | `bhi:6935bf5c-4629-11e3-a747-d206bceb4d38` | Trouwen 25-2-1800 Boekel — *Cornelia van Leuken* × *Hubertus Dapperen* |
| Sibling cross-witness | `bhi:e784bc7a-bf78-ffa7-48ec-44c89dde3c39` | Doop 18-4-1770 Boekel — child *Cornelius van den Elsen*, mother *Joanna Maria Peter van Leuken*, witness *Jan Peter van Leuken* (her brother) |

All records: Brabants Historisch Informatie Centrum (BHIC), via OpenArchieven.nl.

---

## GEDCOM state — verified, no change needed

The target structure was **already present** in
`vanduynhoven/family_tree/vanduynhoven_family.ged`. Verified 30 Aug 2026:

```
0 @F125@ FAM
1 HUSB @I366@   (Petrus van Leuken)
1 WIFE @I386@   (Jenneke Jan Bankers)
1 CHIL @I385@   (Joanna Maria Peter van Leuken)
1 CHIL @I388@   (Jan van Leuken)
1 CHIL @I387@   (Cornelia van Leuken)
1 CHIL @I389@   (Antonetta van Leuken)
1 CHIL @I390@   (IJda van Leuken)
```

- `@I385@` (Joanna Maria) → `FAMC @F125@` ✓
- `@I387@` (Cornelia) → `FAMC @F125@` ✓

The requested `add_link(@F125@, CHIL, @I385@)` and
`add_link(@F125@, CHIL, @I387@)` are **idempotent no-ops** (both links already
exist); the updater reported `dirty=False`, so **no `save()` was performed and the
GEDCOM was not modified**. The family is correctly built.

---

## Significance

Peter van Leuken × Jenneke Jan Bankers being the parents of *both* Joanna Maria
(→ van den Elsen line) and Cornelia (→ Dapperen / van der Horst line) produces a
**pedigree collapse** in the ancestry of Anna Maria van den Elzen (`@I006@`), who
descends from this couple through both daughters. See `VAN_LEUKEN_CONNECTION.md`.
