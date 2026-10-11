/**
 * gedcom-model.js - the ONE GEDCOM reader of the Van Duynhoven site.
 *
 * Plain script (sets window.GedcomModel) and CommonJS module (node --test).
 * No DOM access in parse(); no regex lookbehind, no ??=, no .at(): it must also
 * parse on Safari 15 (audit FT-021).
 *
 *   var model = GedcomModel.parse(text, {revision: '554ee90420d4'});   // pure
 *   GedcomModel.load().then(function (model) { ... });                  // pages
 *
 * Rules (docs/research/family-tree-audit.md section 6):
 *  1. Links are the union of both directions (FAM lists and FAMC/FAMS). Conflicts
 *     are kept in model.issues, never hidden. A FAM whose NOTE says DEPRECATED is ignored.
 *  2. Ids are opaque strings (^@[^@\s]+@$); never sorted or padded.
 *  3. Generation is computed once (see computeGenerations); notes are never parsed.
 *  4. Dates keep their qualifier: {raw, year, month, day, qualifier, endYear}.
 *  5. Names: surnameKey() makes Duijnhoven/Duynhoven/Duinhoven/"Van Dyn Hoven" equal,
 *     for search and grouping only. "Family" is structural: blood descendants of ROOT_ID.
 *  6. Branch: connected component of the tree.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.GedcomModel = factory();
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    var ROOT_ID = '@I001@';              // generation 1 (Petrus b.1799)
    var FAMILY_ROOT_ID = '@I179@';       // top of the recorded Van Duynhoven line: "the family" starts here
    // Same pattern as scripts/gedcom_check.py LINE_RE: both must count the same lines.
    var LINE_RE = /^(\d+)\s+(@[^@\s]+@|[A-Za-z_][A-Za-z0-9_]*)\s*(.*)$/;
    var MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var QUALIFIERS = { ABT: 'ABT', ABOUT: 'ABT', CAL: 'CAL', EST: 'EST', BEF: 'BEF', BEFORE: 'BEF',
                       AFT: 'AFT', AFTER: 'AFT', BET: 'BET', FROM: 'AFT', TO: 'BEF' };

    // ── small helpers ────────────────────────────────────────────────────────
    function isPointer(v) { return typeof v === 'string' && v.charAt(0) === '@'; }

    function stripAccents(s) {
        s = String(s || '');
        return s.normalize ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s;
    }

    /** Spelling-insensitive form of one word: duijnhoven, duynhoven, duinhoven -> dynhoven. */
    function spellKey(s) {
        return stripAccents(s).toLowerCase().replace(/ij/g, 'y').replace(/\u00ff/g, 'y')
            .replace(/ui/g, 'uy').replace(/uy/g, 'y').replace(/[^a-z]/g, '');
    }
    function surnameKey(surname) { return spellKey(surname); }
    function nameTokens(s) {
        return stripAccents(s).toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/)
            .filter(Boolean).map(spellKey).filter(Boolean);
    }

    // ── dates ────────────────────────────────────────────────────────────────
    function parseDatePart(s) {
        var m = /^(?:(\d{1,2})\s+)?(?:([A-Z]{3})\s+)?(\d{3,4})$/.exec(s.trim());
        if (!m) return null;
        var month = m[2] ? MONTHS.indexOf(m[2]) + 1 : 0;
        if (m[2] && !month) return null;
        return { day: m[1] ? parseInt(m[1], 10) : 0, month: month, year: parseInt(m[3], 10) };
    }

    /** "ABT 1783" -> {raw, year:1783, month:0, day:0, qualifier:'ABT', endYear:null}; null for no date. */
    function parseDate(raw) {
        if (raw === undefined || raw === null) return null;
        var s = String(raw).trim();
        if (!s) return null;
        var up = s.toUpperCase();
        var qualifier = '', rest = up, endYear = null;
        var bet = /^BET\s+(.*?)\s+AND\s+(.*)$/.exec(up);
        if (bet) {
            qualifier = 'BET';
            var b2 = parseDatePart(bet[2]);
            endYear = b2 ? b2.year : null;
            rest = bet[1];
        } else {
            var qm = /^([A-Z]+)\b\s*(.*)$/.exec(up);
            if (qm && QUALIFIERS[qm[1]]) { qualifier = QUALIFIERS[qm[1]]; rest = qm[2]; }
        }
        var p = parseDatePart(rest);
        var year = null, month = 0, day = 0;
        if (p) { year = p.year; month = p.month; day = p.day; }
        else {
            var y = /\b(\d{4})\b/.exec(rest);   // last resort: odd text such as "1750?" keeps its year
            if (y) year = parseInt(y[1], 10);
        }
        return { raw: s, year: year, month: month, day: day, qualifier: qualifier, endYear: endYear };
    }

    function fmtDate(d) {
        if (!d) return '';
        if (typeof d === 'string') d = parseDate(d);
        if (!d || d.year === null) return d && d.raw ? d.raw : '';
        var core = (d.day ? d.day + ' ' : '') + (d.month ? MONTH_NAMES[d.month - 1] + ' ' : '') + d.year;
        switch (d.qualifier) {
            case 'ABT': case 'CAL': case 'EST': return 'c. ' + core;
            case 'BEF': return 'before ' + core;
            case 'AFT': return 'after ' + core;
            case 'BET': return 'between ' + d.year + (d.endYear ? ' and ' + d.endYear : '');
            default: return core;
        }
    }

    // ── GEDCOM text -> tree of nodes ─────────────────────────────────────────
    function node(level, tag, value, line) { return { level: level, tag: tag, value: value, line: line, children: [] }; }
    function child(n, tag) { for (var i = 0; i < n.children.length; i++) if (n.children[i].tag === tag) return n.children[i]; return null; }
    function children(n, tag) { return n.children.filter(function (c) { return c.tag === tag; }); }
    function childValue(n, tag) { var c = n ? child(n, tag) : null; return c ? c.value : ''; }

    /** Text of a NOTE-like node: value + CONT lines (new line) + CONC lines (no separator). */
    function textOf(n) {
        var out = n.value || '';
        for (var i = 0; i < n.children.length; i++) {
            var c = n.children[i];
            if (c.tag === 'CONT') out += '\n' + (c.value || '');
            else if (c.tag === 'CONC') out += (c.value || '');
        }
        return out;
    }

    function tokenize(text) {
        var records = [], dupXrefs = [], junk = [], seen = {}, cur = null, stack = [];
        var lines = String(text).split(/\r?\n/);
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line) continue;
            var m = LINE_RE.exec(line);
            if (!m) { junk.push(i + 1); continue; }
            var level = parseInt(m[1], 10), tag = m[2], value = m[3];
            if (level === 0) {
                cur = null; stack = [];
                if (tag.charAt(0) === '@') {
                    if (Object.prototype.hasOwnProperty.call(seen, tag)) dupXrefs.push(tag);
                    cur = { id: tag, kind: value.trim(), line: i + 1, node: node(0, tag, value, i + 1) };
                    seen[tag] = true;
                    records.push(cur);
                    stack = [cur.node];
                }
            } else if (cur) {
                var n = node(level, tag, value, i + 1);
                while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
                var parent = stack.length ? stack[stack.length - 1] : cur.node;
                parent.children.push(n);
                stack.push(n);
            }
        }
        return { records: records, dupXrefs: dupXrefs, junk: junk };
    }

    // ── person / family objects ──────────────────────────────────────────────
    function event(n) {
        if (!n) return null;
        var d = parseDate(childValue(n, 'DATE'));
        return { date: d, raw: d ? d.raw : '', year: d ? d.year : null, qualifier: d ? d.qualifier : '',
                 place: childValue(n, 'PLAC'), note: childValue(n, 'NOTE') };
    }

    function buildPerson(rec) {
        var n = rec.node, nameNode = child(n, 'NAME'), raw = nameNode ? nameNode.value : '';
        var slash = /^(.*?)\/(.*?)\/(.*)$/.exec(raw);
        var given = childValue(nameNode, 'GIVN') || (slash ? slash[1] : raw).trim();
        var surname = childValue(nameNode, 'SURN') || (slash ? slash[2] : '').trim();
        var nickM = /["'\u2018\u201c]([^"'\u2019\u201d]+)["'\u2019\u201d]/.exec(raw);
        var full = raw.replace(/\//g, ' ').replace(/\s+/g, ' ').trim();
        var notes = children(n, 'NOTE').map(textOf);
        var events = [];
        n.children.forEach(function (c) {
            if (c.tag === 'BIRT' || c.tag === 'DEAT' || c.tag === 'MARR') return;
            if (child(c, 'DATE') || child(c, 'PLAC')) {
                var e = event(c); e.tag = c.tag; e.value = c.value; events.push(e);
            }
        });
        var facts = [];
        ['OCCU', 'EDUC', 'MILI', 'RELI'].forEach(function (t) {
            children(n, t).forEach(function (c) { if (c.value) facts.push({ tag: t, value: c.value }); });
        });
        var files = [];
        children(n, 'OBJE').forEach(function (o) { var f = childValue(o, 'FILE'); if (f) files.push(f); });
        return {
            id: rec.id, line: rec.line,
            name: { full: full, given: given, surname: surname, nick: childValue(nameNode, 'NICK') || (nickM ? nickM[1] : '') },
            surnameKey: surnameKey(surname), sex: childValue(n, 'SEX'),
            birth: event(child(n, 'BIRT')), death: event(child(n, 'DEAT')),
            events: events, facts: facts, notes: notes, note: notes.join('\n\n'),
            sources: children(n, 'SOUR').map(function (c) { return c.value.trim(); }).filter(isPointer),
            files: files, fsid: childValue(n, '_FSID'),
            declaredFamc: children(n, 'FAMC').map(function (c) { return c.value.trim(); }).filter(isPointer),
            declaredFams: children(n, 'FAMS').map(function (c) { return c.value.trim(); }).filter(isPointer),
            // filled by reconcile():
            parentFamily: null, altParentFamilies: [], families: [], generation: null, branch: null, living: null
        };
    }

    function buildFamily(rec) {
        var n = rec.node, notes = children(n, 'NOTE').map(textOf);
        return {
            id: rec.id, line: rec.line,
            husb: (childValue(n, 'HUSB') || '').trim() || null, wife: (childValue(n, 'WIFE') || '').trim() || null,
            listedChildren: children(n, 'CHIL').map(function (c) { return c.value.trim(); }).filter(isPointer),
            marriage: event(child(n, 'MARR')), divorce: event(child(n, 'DIV')),
            notes: notes, deprecated: notes.some(function (t) { return /DEPRECATED/i.test(t); }),
            father: null, mother: null, kids: []
        };
    }

    // ── the model ────────────────────────────────────────────────────────────
    function Model(parsed, opts) {
        opts = opts || {};
        var self = this;
        this.rootId = opts.rootId || ROOT_ID;
        this.revision = opts.revision || null;
        this.issues = [];
        this._persons = {};
        this._fams = {};
        this.sourceRecords = {};
        this.people = [];       // persons in file order
        this.families = [];     // live families in file order
        this.deprecatedFamilies = [];

        var recs = parsed.records;
        recs.forEach(function (r) {
            if (r.kind === 'INDI') { var p = buildPerson(r); self._persons[p.id] = p; self.people.push(p); }
            else if (r.kind === 'FAM') { var f = buildFamily(r); self._fams[f.id] = f; }
            else if (r.kind === 'SOUR') {
                var nn = r.node;
                self.sourceRecords[r.id] = { id: r.id, title: childValue(nn, 'TITL'), publ: childValue(nn, 'PUBL'),
                    refn: childValue(nn, 'REFN'), files: children(nn, 'OBJE').map(function (o) { return childValue(o, 'FILE'); }).filter(Boolean) };
            }
        });
        Object.keys(this._fams).forEach(function (id) {
            var f = self._fams[id];
            (f.deprecated ? self.deprecatedFamilies : self.families).push(f);
        });
        this.counts = { individuals: this.people.length, families: Object.keys(this._fams).length,
                        liveFamilies: this.families.length, deprecatedFamilies: this.deprecatedFamilies.length };
        this._issue = function (severity, code, message, ids) {
            self.issues.push({ severity: severity, code: code, message: message, ids: ids || [] });
        };
        this._issue('INFO', 'COUNTS', this.counts.individuals + ' INDI, ' + this.counts.families + ' FAM', []);
        if (parsed.dupXrefs.length) this._issue('ERROR', 'XREF-DUP', 'duplicate record ids', parsed.dupXrefs);
        if (parsed.junk.length) this._issue('WARN', 'NON-GEDCOM-LINES', parsed.junk.length + ' lines are not GEDCOM',
            parsed.junk.map(String));
        this._reconcile();
        this._computeGenerations();
        this._computeBranches();
        this._computeLiving();
        this._bySpell = null;
    }

    var P = Model.prototype;

    P._reconcile = function () {
        var self = this, persons = this._persons, fams = this._fams, live = this.families;
        var liveSet = {};
        live.forEach(function (f) { liveSet[f.id] = f; });
        var depSet = {};
        this.deprecatedFamilies.forEach(function (f) { depSet[f.id] = f; });
        var bad = { dangling: [], husbNoFams: [], chilNoFamc: [], famcNotListed: [], famsNotListed: [], pointsAtDeprecated: [] };

        // dangling pointers (all FAMs, like gedcom_check.py)
        this.people.forEach(function (p) {
            p.declaredFamc.concat(p.declaredFams).forEach(function (fx, i) {
                if (!fams[fx]) bad.dangling.push(p.id + ' ' + (i < p.declaredFamc.length ? 'FAMC' : 'FAMS') + ' ' + fx);
            });
        });
        Object.keys(fams).forEach(function (fx) {
            var f = fams[fx];
            [['HUSB', f.husb ? [f.husb] : []], ['WIFE', f.wife ? [f.wife] : []], ['CHIL', f.listedChildren]].forEach(function (pair) {
                pair[1].forEach(function (pid) { if (!persons[pid]) bad.dangling.push(fx + ' ' + pair[0] + ' ' + pid); });
            });
        });

        // reciprocity (live FAMs only)
        live.forEach(function (f) {
            [['HUSB', f.husb], ['WIFE', f.wife]].forEach(function (pr) {
                var p = pr[1] && persons[pr[1]];
                if (p && p.declaredFams.indexOf(f.id) < 0) bad.husbNoFams.push(pr[1] + ' (' + pr[0] + ') in ' + f.id);
            });
            f.listedChildren.forEach(function (cid) {
                var c = persons[cid];
                if (c && c.declaredFamc.indexOf(f.id) < 0) bad.chilNoFamc.push(cid + ' in ' + f.id);
            });
        });
        this.people.forEach(function (p) {
            p.declaredFamc.forEach(function (fx) {
                if (liveSet[fx] && liveSet[fx].listedChildren.indexOf(p.id) < 0) bad.famcNotListed.push(p.id + ' -> ' + fx);
            });
            p.declaredFams.forEach(function (fx) {
                var f = liveSet[fx];
                if (f && f.husb !== p.id && f.wife !== p.id) bad.famsNotListed.push(p.id + ' -> ' + fx);
            });
            p.declaredFamc.concat(p.declaredFams).forEach(function (fx) {
                if (depSet[fx]) bad.pointsAtDeprecated.push(p.id + ' ' + fx);
            });
        });

        // partner families of each person: declared (and listing them) first, then the rest
        this.people.forEach(function (p) { p.families = []; p.altParentFamilies = []; p.parentFamily = null; });
        this.people.forEach(function (p) {
            p.declaredFams.forEach(function (fx) {
                var f = liveSet[fx];
                if (f && (f.husb === p.id || f.wife === p.id) && p.families.indexOf(fx) < 0) p.families.push(fx);
            });
        });
        live.forEach(function (f) {
            [f.husb, f.wife].forEach(function (pid) {
                var p = pid && persons[pid];
                if (p && p.families.indexOf(f.id) < 0) p.families.push(f.id);
            });
        });

        // parent family of each person: declared + listed > listed > declared only
        var listedBy = {};
        live.forEach(function (f) {
            f.listedChildren.forEach(function (cid) { (listedBy[cid] = listedBy[cid] || []).push(f.id); });
        });
        var multi = [];
        this.people.forEach(function (p) {
            var declared = p.declaredFamc.filter(function (fx) { return !!liveSet[fx]; });
            var listed = listedBy[p.id] || [];
            var both = declared.filter(function (fx) { return listed.indexOf(fx) >= 0; });
            var ordered = [];
            both.concat(listed, declared).forEach(function (fx) { if (ordered.indexOf(fx) < 0) ordered.push(fx); });
            if (ordered.length) { p.parentFamily = ordered[0]; p.altParentFamilies = ordered.slice(1); }
            if (p.declaredFamc.length > 1) multi.push(p.id);
        });

        // fill family roles and kids
        live.forEach(function (f) {
            var h = f.husb && persons[f.husb], w = f.wife && persons[f.wife];
            f.father = f.husb; f.mother = f.wife;
            if (h && w && h.sex === 'F' && w.sex === 'M') { f.father = f.wife; f.mother = f.husb; }
            else if (h && !w && h.sex === 'F') { f.father = null; f.mother = f.husb; }
            else if (w && !h && w.sex === 'M') { f.mother = null; f.father = f.wife; }
            f.kids = [];
        });
        live.forEach(function (f) {
            f.listedChildren.forEach(function (cid) {
                var c = persons[cid];
                if (c && c.parentFamily === f.id && f.kids.indexOf(cid) < 0) f.kids.push(cid);
            });
        });
        this.people.forEach(function (p) {
            var f = p.parentFamily && liveSet[p.parentFamily];
            if (f && f.kids.indexOf(p.id) < 0) f.kids.push(p.id);
        });

        var orphans = this.people.filter(function (p) { return !p.declaredFamc.length && !p.declaredFams.length; }).map(function (p) { return p.id; });
        var noName = this.people.filter(function (p) { return !p.name.full; }).map(function (p) { return p.id; });
        var noSex = this.people.filter(function (p) { return p.sex !== 'M' && p.sex !== 'F'; }).map(function (p) { return p.id; });

        var add = function (sev, code, msg, ids) { if (ids.length) self._issue(sev, code, msg, ids); };
        add('ERROR', 'DANGLING', 'pointers to missing records', bad.dangling);
        add('ERROR', 'HUSB-WIFE-NO-FAMS', 'live FAM HUSB/WIFE whose person has no matching FAMS', bad.husbNoFams);
        add('ERROR', 'CHIL-NO-FAMC', 'live CHIL entries without FAMC on the child', bad.chilNoFamc);
        add('ERROR', 'FAMC-NOT-LISTED', 'FAMC pointers to a live FAM that does not list the child', bad.famcNotListed);
        add('ERROR', 'FAMS-NOT-LISTED', 'FAMS pointers to a live FAM that does not list the person', bad.famsNotListed);
        add('ERROR', 'POINTS-AT-DEPRECATED', 'INDI pointers into deprecated FAMs', bad.pointsAtDeprecated);
        add('ERROR', 'ORPHANS', 'individuals with neither FAMC nor FAMS', orphans);
        add('WARN', 'MULTI-FAMC', 'individuals with more than one FAMC', multi);
        add('WARN', 'NO-NAME', 'individuals without a usable NAME', noName);
        add('WARN', 'NO-SEX', 'individuals without SEX M/F', noSex);
    };

    // generation: see docs. Couples (spouse clusters) share a layer; child layer >= parent layer + 1.
    P._computeGenerations = function () {
        var self = this, persons = this._persons;
        var uf = {};
        function find(x) { while (uf[x] !== x) { uf[x] = uf[uf[x]]; x = uf[x]; } return x; }
        function union(a, b) { a = find(a); b = find(b); if (a !== b) uf[a] = b; }
        this.people.forEach(function (p) { uf[p.id] = p.id; });
        this.families.forEach(function (f) {
            if (f.husb && f.wife && persons[f.husb] && persons[f.wife]) union(f.husb, f.wife);
        });
        var up = {}, down = {}, ids = {};   // cluster edges parent-cluster -> child-cluster
        this.people.forEach(function (p) { ids[find(p.id)] = true; up[find(p.id)] = up[find(p.id)] || {}; down[find(p.id)] = down[find(p.id)] || {}; });
        var selfLoops = [];
        this.people.forEach(function (c) {
            self.parents(c.id).forEach(function (pid) {
                var a = find(pid), b = find(c.id);
                if (a === b) { selfLoops.push(c.id + ' < ' + pid); return; }
                up[b][a] = true; down[a][b] = true;
            });
        });
        if (selfLoops.length) this._issue('ERROR', 'GENERATION-SAME-COUPLE', 'a parent and child sit in the same couple', selfLoops);

        // reachable from the root couple (undirected over cluster edges)
        var rootP = persons[this.rootId] || this.people[0];
        this.rootId = rootP ? rootP.id : null;
        if (!rootP) return;
        var comp = {}, stack = [find(rootP.id)];
        comp[stack[0]] = true;
        while (stack.length) {
            var x = stack.pop();
            Object.keys(up[x]).concat(Object.keys(down[x])).forEach(function (y) { if (!comp[y]) { comp[y] = true; stack.push(y); } });
        }
        // longest path from the sources (Kahn)
        var indeg = {}, layer = {}, queue = [], keys = Object.keys(comp);
        keys.forEach(function (k) { indeg[k] = Object.keys(up[k]).length; layer[k] = 0; if (!indeg[k]) queue.push(k); });
        var order = [];
        while (queue.length) {
            var k = queue.shift(); order.push(k);
            Object.keys(down[k]).forEach(function (c) {
                if (layer[c] < layer[k] + 1) layer[c] = layer[k] + 1;
                if (--indeg[c] === 0) queue.push(c);
            });
        }
        var unlayered = keys.filter(function (k) { return indeg[k] > 0; });
        if (unlayered.length) {
            this._issue('ERROR', 'ANCESTRY-CYCLE', unlayered.length + ' couples sit in an ancestry cycle: no generation',
                unlayered);
        }
        // Then pull every couple down to just above its first child (as late as possible), so that a
        // short side chain (a bride's parents) does not float up to the top of the longest chain.
        for (var oi = order.length - 1; oi >= 0; oi--) {
            var ck = order[oi], kids = Object.keys(down[ck]).filter(function (c) { return indeg[c] === 0; });
            if (kids.length) layer[ck] = Math.min.apply(null, kids.map(function (c) { return layer[c]; })) - 1;
        }
        var base = layer[find(rootP.id)];
        this.people.forEach(function (p) {
            var c = find(p.id);
            if (!comp[c] || indeg[c] > 0) { p.generation = null; return; }
            var n = layer[c] - base;
            p.generation = n >= 0 ? n + 1 : n;
        });
        // Parent/child pairs that are not exactly one generation apart (endogamy and in-law lines of
        // different length force slack). Informational: the UI may show such a link as approximate.
        var slack = [];
        this.people.forEach(function (c) {
            if (c.generation === null) return;
            self.parents(c.id).forEach(function (pid) {
                var g = persons[pid].generation;
                if (g !== null && c.generation !== (g === -1 ? 1 : g + 1)) slack.push(pid + ' > ' + c.id);
            });
        });
        if (slack.length) this._issue('INFO', 'GENERATION-SLACK', slack.length + ' parent/child pairs are not one generation apart', slack);
    };

    P._computeBranches = function () {
        // Components over live FAM members, exactly as scripts/gedcom_check.py computes them.
        var persons = this._persons, adj = {}, seen = {}, comps = [], self = this;
        this.families.forEach(function (f) {
            var members = [f.husb, f.wife].concat(f.listedChildren).filter(function (x) { return !!x; });
            members.forEach(function (m) {
                adj[m] = adj[m] || {};
                members.forEach(function (o) { if (o !== m) adj[m][o] = true; });
            });
        });
        this.people.forEach(function (p) {
            if (seen[p.id]) return;
            var comp = [], st = [p.id];
            seen[p.id] = true;
            while (st.length) {
                var n = st.pop(); comp.push(n);
                Object.keys(adj[n] || {}).forEach(function (o) { if (!seen[o] && persons[o]) { seen[o] = true; st.push(o); } });
            }
            comps.push(comp);
        });
        comps.sort(function (a, b) { return b.length - a.length; });
        this.components = comps;
        var mainIdx = 0;
        comps.forEach(function (c, i) { if (c.indexOf(self.rootId) >= 0) mainIdx = i; });
        comps.forEach(function (c, i) {
            var counts = {}, best = '', bestN = 0;
            c.forEach(function (id) {
                var s = persons[id].name.surname;
                if (!s) return;
                var k = persons[id].surnameKey;
                counts[k] = counts[k] || { n: 0, name: s };
                if (++counts[k].n > bestN) { bestN = counts[k].n; best = counts[k].name; }
            });
            var label = i === mainIdx ? 'Main tree' : (best ? best + ' line' : 'Related people') + ' (' + c.length + ')';
            c.forEach(function (id) { persons[id].branch = { index: i, size: c.length, main: i === mainIdx, label: label }; });
        });
        this.mainComponentSize = comps.length ? comps[mainIdx].length : 0;
    };

    P._computeLiving = function () {
        // null = unknown. Living: no death event and born in the last 110 years (or only a recent child/parent).
        var year = new Date().getFullYear();
        this.people.forEach(function (p) {
            if (p.death) { p.living = false; return; }
            var b = p.birth && p.birth.year;
            if (b) p.living = (year - b) <= 110;
            else p.living = null;
        });
    };

    // ── queries ──────────────────────────────────────────────────────────────
    P.person = function (id) { return this._persons[id] || null; };
    P.has = function (id) { return !!this._persons[id]; };
    P.family = function (id) { return this._fams[id] || null; };
    P.name = function (id) { var p = this._persons[id]; return p ? p.name.full : ''; };

    P.parents = function (id) {
        var p = this._persons[id], f = p && p.parentFamily && this._fams[p.parentFamily];
        if (!f) return [];
        return [f.father, f.mother].filter(function (x) { return !!x && !!this._persons[x]; }, this);
    };
    P.father = function (id) { var p = this._persons[id], f = p && p.parentFamily && this._fams[p.parentFamily]; return f && f.father && this._persons[f.father] ? f.father : null; };
    P.mother = function (id) { var p = this._persons[id], f = p && p.parentFamily && this._fams[p.parentFamily]; return f && f.mother && this._persons[f.mother] ? f.mother : null; };

    P.spouses = function (id) {
        var p = this._persons[id], out = [];
        if (!p) return out;
        p.families.forEach(function (fx) {
            var f = this._fams[fx];
            [f.husb, f.wife].forEach(function (x) { if (x && x !== id && this._persons[x] && out.indexOf(x) < 0) out.push(x); }, this);
        }, this);
        return out;
    };

    /** Children through any partner family, in file order of the families and their CHIL lines. */
    P.children = function (id) {
        var p = this._persons[id], out = [];
        if (!p) return out;
        p.families.forEach(function (fx) {
            this._fams[fx].kids.forEach(function (c) { if (out.indexOf(c) < 0) out.push(c); });
        }, this);
        return out;
    };

    /** Full siblings (same parent family). {half: true} adds children of either parent's other families. */
    P.siblings = function (id, opts) {
        var p = this._persons[id], out = [];
        if (!p) return out;
        var f = p.parentFamily && this._fams[p.parentFamily];
        if (f) f.kids.forEach(function (c) { if (c !== id) out.push(c); });
        if (opts && opts.half) {
            this.parents(id).forEach(function (par) {
                this.children(par).forEach(function (c) { if (c !== id && out.indexOf(c) < 0) out.push(c); });
            }, this);
        }
        return out;
    };

    /** Slot-indexed pedigree: [self, father, mother, ff, fm, mf, mm, ...] to `depth` generations back (null = unknown). */
    P.ancestors = function (id, depth) {
        var out = [id], n = 1;
        for (var d = 0; d < depth; d++) {
            for (var i = 0; i < n; i++) {
                var slot = n - 1 + i, who = out[slot];
                out[2 * slot + 1] = who ? this.father(who) : null;
                out[2 * slot + 2] = who ? this.mother(who) : null;
            }
            n *= 2;
        }
        return out;
    };

    /** Breadth-first descendants: [{id, depth}] (depth 1 = children), each person once. */
    P.descendants = function (id, depth) {
        var out = [], seen = {}, frontier = [id], d = 0;
        seen[id] = true;
        while (frontier.length && (depth === undefined || d < depth)) {
            d++;
            var next = [];
            frontier.forEach(function (x) {
                this.children(x).forEach(function (c) {
                    if (!seen[c]) { seen[c] = true; out.push({ id: c, depth: d }); next.push(c); }
                }, this);
            }, this);
            frontier = next;
        }
        return out;
    };

    /**
     * Ids of "the family": FAMILY_ROOT_ID (the top of the recorded line, Dirck van Duinhoven) and every blood
     * descendant through either parent (decision T2). {spouses:true} adds partners. {root:id} picks another root.
     */
    P.familyIds = function (opts) {
        var set = {}, root = (opts && opts.root) || FAMILY_ROOT_ID;
        if (!this._persons[root]) root = this.rootId;
        if (!this._persons[root]) return set;
        set[root] = true;
        this.descendants(root).forEach(function (d) { set[d.id] = true; });
        if (opts && opts.spouses) {
            Object.keys(set).forEach(function (id) { this.spouses(id).forEach(function (s) { set[s] = true; }); }, this);
        }
        return set;
    };

    /** Everyone above `id` (parents, grandparents ...) as a set, optionally `id` itself. */
    P.ancestorSet = function (id, includeSelf) {
        var out = {}, frontier = [id];
        if (includeSelf) out[id] = true;
        while (frontier.length) {
            var next = [];
            for (var i = 0; i < frontier.length; i++) {
                var ps = this.parents(frontier[i]);
                for (var j = 0; j < ps.length; j++) if (!out[ps[j]]) { out[ps[j]] = true; next.push(ps[j]); }
            }
            frontier = next;
        }
        return out;
    };

    /** Default "me": a living family member called Raven (decision T1), else null. */
    P.defaultMeId = function () {
        var fam = this.familyIds(), found = null;
        this.people.forEach(function (p) {
            if (!found && fam[p.id] && p.living !== false && /(^|\s)Raven(\s|$)/i.test(p.name.given)) found = p.id;
        });
        return found;
    };

    /** "Me" from a stored choice: any living member of the family, else the default (Raven). */
    P.resolveMe = function (storedId) {
        var p = storedId && this._persons[storedId];
        if (p && p.living !== false && this.familyIds()[storedId]) return storedId;
        return this.defaultMeId();
    };

    // ── search ───────────────────────────────────────────────────────────────
    P._spellIndex = function () {
        if (this._bySpell) return this._bySpell;
        this._bySpell = this.people.map(function (p) {
            // The joined surname lets "duynhoven" find "Van Dyn Hoven" (three words).
            return { p: p, tokens: nameTokens(p.name.full + ' ' + p.name.nick).concat(p.surnameKey ? [p.surnameKey] : []) };
        });
        return this._bySpell;
    };

    /** Accent- and spelling-insensitive: every query word must start a word of the name (or be inside it). */
    P.search = function (query, opts) {
        var q = nameTokens(query), limit = (opts && opts.limit) || 25;
        if (!q.length) return [];
        var scored = [];
        this._spellIndex().forEach(function (e) {
            var score = 0;
            for (var i = 0; i < q.length; i++) {
                var best = -1;
                for (var j = 0; j < e.tokens.length; j++) {
                    var t = e.tokens[j];
                    if (t === q[i]) { best = Math.max(best, 3); }
                    else if (t.indexOf(q[i]) === 0) { best = Math.max(best, 2); }
                    else if (t.indexOf(q[i]) > 0) { best = Math.max(best, 1); }
                }
                if (best < 0) return;
                score += best;
            }
            scored.push({ p: e.p, score: score });
        });
        scored.sort(function (a, b) {
            return (b.score - a.score) || ((a.p.birth && a.p.birth.year || 9999) - (b.p.birth && b.p.birth.year || 9999));
        });
        return scored.slice(0, limit).map(function (s) { return s.p; });
    };

    /** People whose full name equals `name` (spelling-insensitive, nick names ignored). */
    P.findByName = function (name) {
        var key = nameTokens(String(name || '').replace(/["'\u2018\u201c][^"'\u2019\u201d]*["'\u2019\u201d]/g, ' ')).join(' ');
        if (!key) return [];
        return this.people.filter(function (p) {
            return nameTokens(p.name.full.replace(/["'\u2018\u201c][^"'\u2019\u201d]*["'\u2019\u201d]/g, ' ')).join(' ') === key;
        });
    };

    // ── formatting ───────────────────────────────────────────────────────────
    P.fmtDate = fmtDate;
    P.fmtLife = function (id) {
        var p = this._persons[id];
        if (!p) return '';
        var b = p.birth && p.birth.date, d = p.death && p.death.date;
        var by = b && b.year !== null ? fmtYear(b) : '', dy = d && d.year !== null ? fmtYear(d) : '';
        if (by && dy) return by + '\u2013' + dy;
        if (by) return p.living === false ? by + '\u2013?' : 'b. ' + by;
        if (dy) return '?\u2013' + dy;
        return '';
    };
    function fmtYear(d) {
        var y = String(d.year);
        if (d.qualifier === 'ABT' || d.qualifier === 'CAL' || d.qualifier === 'EST') return 'c. ' + y;
        if (d.qualifier === 'BEF') return 'before ' + y;
        if (d.qualifier === 'AFT') return 'after ' + y;
        return y;
    }

    /** Age in whole years, or null when either date is missing or qualified (no ages from ABT/BEF/AFT). */
    P.age = function (id, atYear) {
        var p = this._persons[id];
        if (!p || !p.birth || !p.birth.date || p.birth.date.qualifier || p.birth.year === null) return null;
        var end = null;
        if (p.death) {
            if (!p.death.date || p.death.date.qualifier || p.death.year === null) return null;
            end = p.death.year;
        } else if (atYear) end = atYear;
        else if (p.living) end = new Date().getFullYear();
        return end === null ? null : end - p.birth.year;
    };

    // ── relationship ─────────────────────────────────────────────────────────
    var ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
    function greats(n) { var s = ''; for (var i = 0; i < n; i++) s += 'great-'; return s; }
    function gendered(sex, m, f, n) { return sex === 'M' ? m : sex === 'F' ? f : n; }

    function kinLabel(da, db, sex, half) {
        // What B is to A. da = steps from A up to the common ancestor, db = steps from B up.
        if (da === 0 && db === 0) return 'the same person';
        if (da === 0) {   // B is a descendant of A
            if (db === 1) return gendered(sex, 'son', 'daughter', 'child');
            return greats(db - 2) + gendered(sex, 'grandson', 'granddaughter', 'grandchild');
        }
        if (db === 0) {   // B is an ancestor of A
            if (da === 1) return gendered(sex, 'father', 'mother', 'parent');
            return greats(da - 2) + gendered(sex, 'grandfather', 'grandmother', 'grandparent');
        }
        if (da === 1 && db === 1) return (half ? 'half-' : '') + gendered(sex, 'brother', 'sister', 'sibling');
        if (da === 1) return greats(db - 2) + gendered(sex, 'nephew', 'niece', 'nephew/niece');   // db>=2
        if (db === 1) return greats(da - 2) + gendered(sex, 'uncle', 'aunt', 'uncle/aunt');       // da>=2
        var k = Math.min(da, db) - 1, removed = Math.abs(da - db);
        var s = (ORD[k] || (k + 'th')) + ' cousin';
        if (removed) s += ' ' + (removed === 1 ? 'once' : removed === 2 ? 'twice' : removed + ' times') + ' removed';
        return s;
    }

    P._upDistances = function (id) {
        // BFS up through primary parents: {ancestorId: {d, via}} with via = child on the way.
        var out = {}, frontier = [id];
        out[id] = { d: 0, via: null };
        var d = 0;
        while (frontier.length) {
            d++;
            var next = [];
            for (var i = 0; i < frontier.length; i++) {
                var ps = this.parents(frontier[i]);
                for (var j = 0; j < ps.length; j++) {
                    if (!out[ps[j]]) { out[ps[j]] = { d: d, via: frontier[i] }; next.push(ps[j]); }
                }
            }
            frontier = next;
        }
        return out;
    };

    /** Closest common ancestor(s) of x and y through primary parents: {da, db, commons, path} or null. */
    P._bloodInfo = function (x, y) {
        var ua = this._upDistances(x), ub = this._upDistances(y), best = null, commons = [];
        Object.keys(ua).forEach(function (k) {
            if (!ub[k]) return;
            var sum = ua[k].d + ub[k].d;
            if (best === null || sum < best) { best = sum; commons = [k]; }
            else if (sum === best) commons.push(k);
        });
        if (best === null) return null;
        var c = commons[0], walkA = [], walkB = [], n = c;
        while (n !== null && n !== undefined) { walkA.push(n); n = ua[n].via; }   // c ... x
        n = c;
        while (n !== null && n !== undefined) { walkB.push(n); n = ub[n].via; }   // c ... y
        return { da: ua[c].d, db: ub[c].d, commons: commons, path: walkA.slice().reverse().concat(walkB.slice(1)) };
    };

    /**
     * How is B related to A?  -> {label, sentence, kind: 'self'|'spouse'|'blood'|'marriage'|'none',
     *                             path: [ids], commonAncestors: [ids]}
     * label is what B is to A ("second cousin once removed", "mother-in-law"); path runs A -> ... -> B.
     */
    P.relationship = function (a, b) {
        var A = this._persons[a], B = this._persons[b];
        if (!A || !B) return { label: '', sentence: '', kind: 'none', path: [], commonAncestors: [] };
        var self = this;
        function sentence(label) { return B.name.given + ' is ' + A.name.given + "'s " + label + '.'; }
        function result(label, kind, path, commons) {
            return { label: label, sentence: sentence(label), kind: kind, path: path, commonAncestors: commons || [] };
        }
        if (a === b) return { label: 'the same person', sentence: 'That is the same person.', kind: 'self', path: [a], commonAncestors: [] };
        if (this.spouses(a).indexOf(b) >= 0) return result(gendered(B.sex, 'husband', 'wife', 'spouse'), 'spouse', [a, b]);

        var blood = this._bloodInfo(a, b);
        if (blood) {
            var half = blood.da === 1 && blood.db === 1 && blood.commons.length === 1;
            return result(kinLabel(blood.da, blood.db, B.sex, half), 'blood', blood.path, blood.commons);
        }

        // In-laws, case 1: B is a blood relative of A's spouse.
        var sps = this.spouses(a), i, r;
        for (i = 0; i < sps.length; i++) {
            r = this._bloodInfo(sps[i], b);
            if (!r) continue;
            var label;
            if (r.db === 0 && r.da === 1) label = gendered(B.sex, 'father-in-law', 'mother-in-law', 'parent-in-law');
            else if (r.db === 0 && r.da >= 2) label = greats(r.da - 2) + 'grand' + gendered(B.sex, 'father-in-law', 'mother-in-law', 'parent-in-law');
            else if (r.da === 1 && r.db === 1) label = gendered(B.sex, 'brother-in-law', 'sister-in-law', 'sibling-in-law');
            else if (r.da === 0 && r.db === 1) label = gendered(B.sex, 'stepson', 'stepdaughter', 'stepchild');
            else label = "spouse's " + kinLabel(r.da, r.db, B.sex);
            return result(label, 'marriage', [a].concat(r.path), r.commons);
        }
        // In-laws, case 2: B's spouse is a blood relative of A.
        var bsp = this.spouses(b);
        for (i = 0; i < bsp.length; i++) {
            r = this._bloodInfo(a, bsp[i]);
            if (!r) continue;
            var lab2;
            if (r.da === 0 && r.db === 1) lab2 = gendered(B.sex, 'son-in-law', 'daughter-in-law', 'child-in-law');
            else if (r.da === 1 && r.db === 1) lab2 = gendered(B.sex, 'brother-in-law', 'sister-in-law', 'sibling-in-law');
            else if (r.db === 0 && r.da === 1) lab2 = gendered(B.sex, 'stepfather', 'stepmother', 'stepparent');
            else lab2 = 'spouse of ' + A.name.given + "'s " + kinLabel(r.da, r.db, this._persons[bsp[i]].sex);
            return result(lab2, 'marriage', r.path.concat([b]), r.commons);
        }

        // Otherwise: shortest path over parent/child/spouse edges
        var prev = {}, seen = {}, queue = [a];
        seen[a] = true;
        while (queue.length && !seen[b]) {
            var cur = queue.shift();
            var nb = self.parents(cur).concat(self.children(cur), self.spouses(cur));
            for (var j = 0; j < nb.length; j++) if (!seen[nb[j]]) { seen[nb[j]] = true; prev[nb[j]] = cur; queue.push(nb[j]); }
        }
        if (!seen[b]) return { label: '', sentence: A.name.given + ' and ' + B.name.given + ' are not connected in this tree.', kind: 'none', path: [], commonAncestors: [] };
        var pth = [b];
        while (pth[0] !== a) pth.unshift(prev[pth[0]]);
        return { label: 'related by marriage', sentence: B.name.given + ' is related to ' + A.name.given + ' by marriage.', kind: 'marriage', path: pth, commonAncestors: [] };
    };

    // ── statistics (replaces gedcom-stats.js parsing) ────────────────────────
    P.stats = function () {
        var gens = {}, years = [], males = 0, females = 0, living = 0, deceased = 0, unknownLife = 0;
        var emigrations = 0, ship = { found: false, voyageDate: null, passengers: [] };
        this.people.forEach(function (p) {
            if (p.generation !== null) gens[p.generation] = (gens[p.generation] || 0) + 1;
            if (p.sex === 'M') males++; else if (p.sex === 'F') females++;
            if (p.living === true) living++; else if (p.living === false) deceased++; else unknownLife++;
            [p.birth, p.death].forEach(function (e) { if (e && e.year !== null && e.year >= 1400 && e.year <= 2100) years.push(e.year); });
            p.events.forEach(function (e) {
                if (e.tag === 'IMMI' || e.tag === 'EMIG') emigrations++;
                if (e.year !== null && e.year >= 1400 && e.year <= 2100) years.push(e.year);
            });
            if (/Queen Elizabeth/.test(p.note)) { ship.found = true; ship.passengers.push(p.name.full); }
            if (/16 Nov 1950|November 1950/.test(p.note)) ship.voyageDate = 'November 16, 1950';
        });
        this.families.forEach(function (f) {
            [f.marriage, f.divorce].forEach(function (e) { if (e && e.year !== null && e.year >= 1400 && e.year <= 2100) years.push(e.year); });
        });
        var genKeys = Object.keys(gens).map(Number).sort(function (a, b) { return a - b; });
        return {
            individuals: this.counts.individuals, families: this.counts.families,
            generations: genKeys, byGeneration: gens,
            minGeneration: genKeys.length ? genKeys[0] : 0, maxGeneration: genKeys.length ? genKeys[genKeys.length - 1] : 0,
            generationCount: genKeys.length,
            earliestYear: years.length ? Math.min.apply(null, years) : null, latestYear: years.length ? Math.max.apply(null, years) : null,
            males: males, females: females, living: living, deceased: deceased, livingUnknown: unknownLife,
            marriages: this.families.filter(function (f) { return !!f.marriage; }).length,
            divorces: this.families.filter(function (f) { return !!f.divorce; }).length,
            emigrations: emigrations, mainComponent: this.mainComponentSize, rmsQueenElizabeth: ship
        };
    };

    /** Counts per issue code for the Python/JS agreement check. */
    P.issueCounts = function () {
        var out = {};
        this.issues.forEach(function (i) { if (i.code !== 'COUNTS') out[i.code] = i.ids.length; });
        return out;
    };

    // ── public API ───────────────────────────────────────────────────────────
    function parse(text, opts) { return new Model(tokenize(text), opts); }

    var cache = null;
    /**
     * Browser: one fetch + one parse per page. Uses the copy the build inlined
     * (window.__GEDCOM__ = {rev, text}); only a local source checkout falls back to fetch().
     */
    function load(opts) {
        opts = opts || {};
        if (cache && !opts.fresh) return cache;
        cache = new Promise(function (resolve, reject) {
            var inline = typeof window !== 'undefined' && window.__GEDCOM__;
            if (inline && inline.text) { resolve(parse(inline.text, { revision: inline.rev, rootId: opts.rootId })); return; }
            if (typeof window === 'undefined' || typeof fetch !== 'function') { reject(new Error('no GEDCOM available')); return; }
            var meta = document.querySelector('meta[name="gedcom-path"]');
            var path = opts.path || window.GEDCOM_PATH || (meta && meta.getAttribute('content')) || './vanduynhoven_family.ged';
            fetch(path).then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.text();
            }).then(function (t) { resolve(parse(t, { rootId: opts.rootId })); }).catch(reject);
        });
        cache.catch(function () { cache = null; });
        return cache;
    }

    return {
        ROOT_ID: ROOT_ID, FAMILY_ROOT_ID: FAMILY_ROOT_ID, parse: parse, load: load, parseDate: parseDate, fmtDate: fmtDate,
        spellKey: spellKey, surnameKey: surnameKey, nameTokens: nameTokens, Model: Model
    };
}));
