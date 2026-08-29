/**
 * gedcom-lookup.js
 * Shared GEDCOM name lookup for Van Duynhoven Family Tree.
 * 
 * Usage: Include this script in any page. Names wrapped in
 * <span class="person-link" data-name="Firstname Lastname">Name</span>
 * or <span class="person-link" data-gedcom-id="@I001@">Name</span>
 * become clickable and show a popup with GEDCOM data.
 *
 * Auto-detection: names in .child-name, .person-name, .badge, .family-member
 * elements are also made clickable if they match a GEDCOM entry.
 */

(function() {
    'use strict';

    // ── Config ──────────────────────────────────────────────────────────────
    // Path to GEDCOM relative to this script (in the family_tree root)
    // Pages at different depths override via window.GEDCOM_PATH
    const GEDCOM_DEFAULT = '../vanduynhoven_family.ged';
    
    // ── State ────────────────────────────────────────────────────────────────
    let individuals = {};
    let families = {};
    let nameIndex = {}; // lowercase name → id[]
    let loaded = false;
    
    // ── GEDCOM Mini-Parser ───────────────────────────────────────────────────
    function parseGEDCOM(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        let current = null, currentType = null, subRecord = null;

        for (const line of lines) {
            const m = line.match(/^(\d+)\s+(@\S+@|\w+)\s*(.*)?$/);
            if (!m) continue;
            const [, lvl, tag, val] = m;
            const level = parseInt(lvl);

            if (level === 0) {
                if (tag.startsWith('@I') && val === 'INDI') {
                    current = { id: tag, name: '', sex: '', birth: {}, death: {}, facts: [], famc: null, fams: [] };
                    individuals[tag] = current;
                    currentType = 'INDI';
                } else if (tag.startsWith('@F') && val === 'FAM') {
                    current = { id: tag, husb: null, wife: null, children: [], marriage: {} };
                    families[tag] = current;
                    currentType = 'FAM';
                } else { current = null; currentType = null; }
                subRecord = null;
            } else if (current && level === 1) {
                subRecord = tag;
                if (currentType === 'INDI') {
                    if (tag === 'NAME') current.name = val ? val.replace(/\//g, '').trim() : '';
                    else if (tag === 'SEX') current.sex = val;
                    else if (tag === 'BIRT') current.birth = {};
                    else if (tag === 'DEAT') current.death = {};
                    else if (tag === 'FAMC') current.famc = val;
                    else if (tag === 'FAMS') current.fams.push(val);
                    else if (tag === 'NOTE') current.facts.push(val || '');
                    else if (tag === 'OCCU') current.facts.push('Occupation: ' + (val || ''));
                    else if (tag === 'EDUC') current.facts.push('Education: ' + (val || ''));
                    else if (tag === 'MILI') current.facts.push('Military: ' + (val || ''));
                } else if (currentType === 'FAM') {
                    if (tag === 'HUSB') current.husb = val;
                    else if (tag === 'WIFE') current.wife = val;
                    else if (tag === 'CHIL') current.children.push(val);
                }
            } else if (current && level === 2) {
                if (currentType === 'INDI') {
                    if (subRecord === 'BIRT') {
                        if (tag === 'DATE') current.birth.date = val;
                        else if (tag === 'PLAC') current.birth.place = val;
                    } else if (subRecord === 'DEAT') {
                        if (tag === 'DATE') current.death.date = val;
                        else if (tag === 'PLAC') current.death.place = val;
                    } else if (subRecord === 'NOTE') {
                        if (tag === 'CONT' && current.facts.length) current.facts[current.facts.length - 1] += ' ' + (val || '');
                    }
                } else if (currentType === 'FAM') {
                    if (subRecord === 'MARR') {
                        if (tag === 'DATE') current.marriage.date = val;
                        else if (tag === 'PLAC') current.marriage.place = val;
                    }
                }
            }
        }

        // Build name index (fuzzy matching)
        Object.entries(individuals).forEach(([id, ind]) => {
            if (!ind.name) return;
            const key = ind.name.toLowerCase().replace(/[^a-z\s]/g, '').trim();
            if (!nameIndex[key]) nameIndex[key] = [];
            nameIndex[key].push(id);
            // Also index first+last only
            const parts = key.split(/\s+/);
            if (parts.length > 2) {
                const short = parts[0] + ' ' + parts[parts.length - 1];
                if (!nameIndex[short]) nameIndex[short] = [];
                if (!nameIndex[short].includes(id)) nameIndex[short].push(id);
            }
        });
    }

    // ── Popup HTML ───────────────────────────────────────────────────────────
    function buildPopupHTML() {
        const div = document.createElement('div');
        div.id = 'gedcom-popup-overlay';
        div.style.cssText = `
            display:none; position:fixed; inset:0; z-index:9999;
            background:rgba(0,0,0,0.55); backdrop-filter:blur(3px);
            align-items:center; justify-content:center;
        `;
        div.innerHTML = `
            <div id="gedcom-popup-box" style="
                background:#16213e; color:#e8e8e8;
                border:1px solid rgba(255,255,255,0.15);
                border-radius:18px; padding:28px; max-width:480px; width:90%;
                max-height:80vh; overflow-y:auto;
                box-shadow:0 20px 60px rgba(0,0,0,0.5);
                position:relative;
            ">
                <button id="gedcom-popup-close" style="
                    position:absolute; top:14px; right:16px;
                    background:none; border:none; color:#aaa;
                    font-size:1.4em; cursor:pointer; line-height:1;
                " title="Close">&times;</button>
                <div id="gedcom-popup-body"></div>
            </div>
        `;
        document.body.appendChild(div);

        div.addEventListener('click', e => { if (e.target === div) hidePopup(); });
        document.getElementById('gedcom-popup-close').addEventListener('click', hidePopup);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') hidePopup(); });
        return div;
    }

    let overlay = null;

    function showPopup(id) {
        if (!overlay) overlay = buildPopupHTML();
        const ind = individuals[id];
        if (!ind) return;

        // Build info
        const lines = [];
        if (ind.birth?.date) lines.push(`<li>🎂 Born: <strong>${ind.birth.date}</strong>${ind.birth.place ? ', ' + ind.birth.place : ''}</li>`);
        if (ind.death?.date) lines.push(`<li>✝ Died: <strong>${ind.death.date}</strong>${ind.death.place ? ', ' + ind.death.place : ''}</li>`);

        // Marriages
        ind.fams.forEach(famId => {
            const fam = families[famId];
            if (!fam) return;
            const partnerId = fam.husb === id ? fam.wife : fam.husb;
            const partner = partnerId && individuals[partnerId];
            const partnerName = partner ? partner.name : '';
            if (partnerName || fam.marriage?.date) {
                const mdate = fam.marriage?.date ? fam.marriage.date : '';
                const mplace = fam.marriage?.place ? ', ' + fam.marriage.place : '';
                lines.push(`<li>💍 Married${partnerName ? ' <strong>' + escHtml(partnerName) + '</strong>' : ''}${mdate ? ' ' + mdate + mplace : ''}</li>`);
            }
            // Children
            if (fam.children.length) {
                const childNames = fam.children.map(cid => individuals[cid] ? individuals[cid].name : '').filter(Boolean);
                if (childNames.length) {
                    lines.push(`<li>👶 Children: ${childNames.map(escHtml).join(', ')}</li>`);
                }
            }
        });

        // Parents
        if (ind.famc) {
            const fam = families[ind.famc];
            if (fam) {
                const dad = fam.husb && individuals[fam.husb];
                const mom = fam.wife && individuals[fam.wife];
                if (dad || mom) {
                    lines.push(`<li>👨‍👩‍👧 Parents: ${[dad?.name, mom?.name].filter(Boolean).map(escHtml).join(' & ')}</li>`);
                }
            }
        }

        // Key facts from NOTE (first 3 sentences max)
        const noteText = ind.facts.filter(f => f && !f.startsWith('Born:') && !f.startsWith('Died:') && !f.startsWith('Occupation:') && !f.startsWith('Education:') && !f.startsWith('Military:')).join(' ');
        const noteSummary = noteText.replace(/CORRECTION.*?$/s, '').replace(/Source:.*?$/gm, '').trim().split(/\.\s+/).slice(0, 3).join('. ');
        if (noteSummary.length > 10) lines.push(`<li style="color:#aaa;font-size:0.9em">${escHtml(noteSummary.substring(0, 300))}${noteSummary.length > 300 ? '…' : ''}</li>`);

        // Occupation/Education/Military
        ind.facts.filter(f => f && (f.startsWith('Occupation:') || f.startsWith('Education:') || f.startsWith('Military:'))).forEach(f => {
            lines.push(`<li>📋 ${escHtml(f)}</li>`);
        });

        const genMatch = ind.facts.join(' ').match(/Generation\s+(\d+|[-][\d]+)/i);
        const genBadge = genMatch ? `<span style="background:rgba(243,156,18,0.2);color:#f39c12;padding:2px 10px;border-radius:12px;font-size:0.8em;margin-left:8px">Gen ${genMatch[1]}</span>` : '';

        document.getElementById('gedcom-popup-body').innerHTML = `
            <h2 style="margin:0 0 6px;font-size:1.4em;color:#f1c40f">${escHtml(ind.name)}${genBadge}</h2>
            ${ind.sex === 'M' ? '<span style="color:#88aaff;font-size:0.85em">♂ Male</span>' : ind.sex === 'F' ? '<span style="color:#ffaacc;font-size:0.85em">♀ Female</span>' : ''}
            <ul style="list-style:none;padding:0;margin:14px 0 0;display:flex;flex-direction:column;gap:8px">
                ${lines.length ? lines.join('') : '<li style="color:#888">No additional information recorded.</li>'}
            </ul>
            <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);font-size:0.8em;color:#666">
                GEDCOM ID: ${escHtml(id)} · <a href="visualizations/tree.html" style="color:#3498db" onclick="this.closest('#gedcom-popup-overlay').style.display='none'">View in tree →</a>
            </div>
        `;
        overlay.style.display = 'flex';
    }

    function hidePopup() {
        if (overlay) overlay.style.display = 'none';
    }

    function escHtml(s) {
        return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    // ── Name matching ────────────────────────────────────────────────────────
    function findId(nameText) {
        if (!nameText) return null;
        const key = nameText.toLowerCase().replace(/[^a-z\s]/g, '').trim()
            .replace(/\s*"[^"]*"\s*/g, ' ')  // remove nicknames
            .replace(/\s+/g, ' ').trim();
        // Exact match
        if (nameIndex[key] && nameIndex[key].length === 1) return nameIndex[key][0];
        // Try first+last
        const parts = key.split(/\s+/);
        if (parts.length >= 2) {
            const short = parts[0] + ' ' + parts[parts.length - 1];
            if (nameIndex[short] && nameIndex[short].length === 1) return nameIndex[short][0];
        }
        // Try just first name with surname matching
        for (const [k, ids] of Object.entries(nameIndex)) {
            if (k.includes(key) || key.includes(k)) return ids[0];
        }
        return null;
    }

    // ── Activate links ───────────────────────────────────────────────────────
    function activateNames() {
        // 1. Explicit person-link spans (data-name or data-gedcom-id)
        document.querySelectorAll('.person-link[data-gedcom-id], .person-link[data-name]').forEach(el => {
            const id = el.dataset.gedcomId || findId(el.dataset.name);
            if (id && individuals[id]) {
                makeLinkable(el, id);
            }
        });

        // 2. Auto-detect: .child-name, .person-name, .badge (not already linked)
        const autoSelectors = [
            '.child-name', '.person-name', '.node-name-text',
            '.badge:not(.status-badge):not(.branch-count)',
            '.family-member', '.person-badge', '.chip',
            'h3.card-title', 'h2.person-name', 'h3'
        ];
        document.querySelectorAll(autoSelectors.join(',')).forEach(el => {
            if (el.closest('#gedcom-popup-overlay')) return;
            if (el.querySelector('a') || el.classList.contains('gedcom-linked')) return;
            const text = el.textContent.replace(/[🏠🇺🇸🇳🇱💍✝🎂👶★⭐†\(\)]/g, '').trim();
            if (text.length < 3 || text.length > 60) return;
            const id = findId(text);
            if (id) makeLinkable(el, id);
        });
    }

    function makeLinkable(el, id) {
        el.classList.add('gedcom-linked');
        el.style.cursor = 'pointer';
        el.style.textDecoration = 'underline dotted rgba(255,255,255,0.4)';
        el.style.textDecorationStyle = 'dotted';
        el.title = 'Click to view ' + (individuals[id]?.name || '') + ' info';
        el.addEventListener('click', e => {
            e.stopPropagation();
            showPopup(id);
        });
    }

    // ── Init ─────────────────────────────────────────────────────────────────
    async function init() {
        const gedcomPath = window.GEDCOM_PATH || GEDCOM_DEFAULT;
        try {
            const res = await fetch(gedcomPath);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const text = await res.text();
            parseGEDCOM(text);
            loaded = true;
            activateNames();
            // Re-run after dynamic content might load
            setTimeout(activateNames, 800);
        } catch (e) {
            console.warn('[gedcom-lookup] Could not load GEDCOM:', e.message);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for manual use
    window.gedcomLookup = { findId, showPopup, individuals: () => individuals };
})();

// ── Global Footer Quick Nav ──────────────────────────────────────────
(function injectFooterNav() {
    if (document.getElementById('site-footer-nav')) return;
    
    // Detect page depth from GEDCOM_PATH or current URL
    const depth = (window.GEDCOM_PATH || '').split('/').filter(p => p === '..').length;
    const root = depth === 0 ? './' : '../'.repeat(depth);
    
    const nav = document.createElement('nav');
    nav.id = 'site-footer-nav';
    nav.className = 'site-footer-nav';
    nav.innerHTML = `
        <a href="${root}index.html" class="nav-home">🏠 Home</a>
        <span class="nav-sep">·</span>
        <a href="${root}generation_0_ancestors/index.html">~1450</a>
        <a href="${root}generation_1_1799/index.html">Gen 1</a>
        <a href="${root}generation_2_1829/index.html">Gen 2</a>
        <a href="${root}generation_3_1872/index.html">Gen 3</a>
        <a href="${root}generation_4_1915/index.html">Gen 4</a>
        <a href="${root}generation_5_1951/index.html">Gen 5</a>
        <a href="${root}generation_6_1980s/index.html">Gen 6</a>
        <a href="${root}generation_7_2000s/index.html">Gen 7</a>
        <span class="nav-sep">·</span>
        <a href="${root}visualizations/tree.html">🌿 Tree</a>
        <a href="${root}visualizations/family_chart.html">🥧 Chart</a>
        <a href="${root}manifest.html">🗂 Site Map</a>
        <a href="${root}changelog.html">📋 Changelog</a>
    `;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => document.body.appendChild(nav));
    } else {
        document.body.appendChild(nav);
    }
})();
