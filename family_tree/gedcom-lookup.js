/**
 * gedcom-lookup.js
 * Person pop-ups for the Van Duynhoven Family Tree, built on the shared GEDCOM model
 * (js/gedcom-model.js: the only GEDCOM parser of the site).
 *
 * Usage: include this script in any page. Names wrapped in
 * <span class="person-link" data-gedcom-id="@I001@">Name</span>   (preferred: an id is exact)
 * <span class="person-link" data-name="Firstname Lastname">Name</span>
 * become clickable and show a popup with GEDCOM data.
 *
 * A name is NOT an id: when several people share a name, a data-name link opens a chooser and the
 * auto-detection below leaves the text alone (audit FT-009: 80 popups opened the wrong person).
 *
 * Auto-detection: names in .child-name, .person-name, .badge, .family-member ... are made clickable
 * only when exactly one person has that name. Headings are never auto-linked.
 */

(function() {
    'use strict';

    // Path to the GEDCOM, only used when the page has no inline copy (source checkout).
    const GEDCOM_DEFAULT = './vanduynhoven_family.ged';
    const SELF = document.currentScript && document.currentScript.src;

    let model = null;
    let overlay = null;
    let lastFocus = null;

    // Root path of the family_tree folder, for links (derived from the page depth).
    const pageDepth = (window.GEDCOM_PATH || '').split('/').filter(p => p === '..').length;
    const rootPath = pageDepth === 0 ? './' : '../'.repeat(pageDepth);

    function ensureModel() {
        if (window.GedcomModel) return Promise.resolve(window.GedcomModel);
        return new Promise((resolve, reject) => {
            if (!SELF) { reject(new Error('gedcom-model.js is not loaded')); return; }
            const s = document.createElement('script');
            s.src = SELF.replace(/gedcom-lookup\.js.*$/, 'js/gedcom-model.js');
            s.onload = () => resolve(window.GedcomModel);
            s.onerror = () => reject(new Error('could not load gedcom-model.js'));
            document.head.appendChild(s);
        });
    }

    function escHtml(s) {
        return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    // ── Name matching: never guess ───────────────────────────────────────────
    let firstLast = null;
    function firstLastIndex() {
        if (firstLast) return firstLast;
        firstLast = {};
        model.people.forEach(p => {
            const t = window.GedcomModel.nameTokens(p.name.full);
            if (t.length < 2) return;
            const key = t[0] + ' ' + t[t.length - 1];
            (firstLast[key] = firstLast[key] || []).push(p);
        });
        return firstLast;
    }

    /** People this text could mean: exact full name, else first + last name, else the start of a name. */
    function candidates(text) {
        if (!model || !text) return [];
        const exact = model.findByName(text);
        if (exact.length) return exact;
        const t = window.GedcomModel.nameTokens(String(text).replace(/["'\u2018\u201c][^"'\u2019\u201d]*["'\u2019\u201d]/g, ' '));
        if (!t.length) return [];
        if (t.length >= 2) {
            const fl = firstLastIndex()[t[0] + ' ' + t[t.length - 1]];
            if (fl && fl.length) return fl;
        }
        // Last resort: the text is the beginning of the name ("Peter John" for "Peter John van Duynhoven").
        // A single first name is too weak a signal to guess from. Two or more matches stay ambiguous.
        if (t.length < 2) return [];
        return model.people.filter(p => {
            const pt = window.GedcomModel.nameTokens(p.name.full);
            return pt.length >= t.length && t.every((x, i) => pt[i] === x);
        });
    }

    /** The id for a name, or null when the name is unknown or shared by several people. */
    function findId(nameText) {
        const c = candidates(nameText);
        return c.length === 1 ? c[0].id : null;
    }

    // ── Popup ────────────────────────────────────────────────────────────────
    function buildOverlay() {
        const div = document.createElement('div');
        div.id = 'gedcom-popup-overlay';
        div.style.cssText = `
            display:none; position:fixed; top:0; right:0; bottom:0; left:0; z-index:9999;
            background:rgba(0,0,0,0.55); -webkit-backdrop-filter:blur(3px); backdrop-filter:blur(3px);
            align-items:center; justify-content:center;
        `;
        div.innerHTML = `
            <div id="gedcom-popup-box" role="dialog" aria-modal="true" aria-labelledby="gedcom-popup-title" style="
                background:#16213e; color:#e8e8e8;
                border:1px solid rgba(255,255,255,0.15);
                border-radius:18px; padding:28px; max-width:480px; width:90%;
                max-height:80vh; overflow-y:auto;
                box-shadow:0 20px 60px rgba(0,0,0,0.5);
                position:relative;
            ">
                <button id="gedcom-popup-close" type="button" aria-label="Close" style="
                    position:absolute; top:6px; right:8px; width:44px; height:44px;
                    background:none; border:none; color:#aaa;
                    font-size:1.6em; cursor:pointer; line-height:1;
                " title="Close">&times;</button>
                <div id="gedcom-popup-body"></div>
            </div>
        `;
        document.body.appendChild(div);

        div.addEventListener('click', e => { if (e.target === div) hidePopup(); });
        document.getElementById('gedcom-popup-close').addEventListener('click', hidePopup);
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay && overlay.style.display !== 'none') hidePopup(); });
        // Relatives inside the popup open their own popup (by id).
        document.getElementById('gedcom-popup-body').addEventListener('click', e => {
            const a = e.target.closest('[data-popup-id]');
            if (!a) return;
            e.preventDefault();
            showPopup(a.getAttribute('data-popup-id'), true);
        });
        return div;
    }

    function openOverlay(html, keepFocus) {
        if (!overlay) overlay = buildOverlay();
        if (!keepFocus || overlay.style.display === 'none') lastFocus = document.activeElement;
        document.getElementById('gedcom-popup-body').innerHTML = html;
        document.getElementById('gedcom-popup-box').scrollTop = 0;
        overlay.style.display = 'flex';
        document.documentElement.style.overflow = 'hidden';
        document.getElementById('gedcom-popup-close').focus();
    }

    function who(id) {
        const p = model.person(id);
        if (!p) return '';
        return `<a href="#" data-popup-id="${escHtml(id)}" style="color:#7fb8ff">${escHtml(p.name.full)}</a>`;
    }

    function placeSuffix(ev) { return ev && ev.place ? ', ' + escHtml(ev.place) : ''; }

    function showPopup(id, keepFocus) {
        if (!model) return;
        const ind = model.person(id);
        if (!ind) return;

        const lines = [];
        if (ind.birth && ind.birth.date) lines.push(`<li>🎂 Born: <strong>${escHtml(model.fmtDate(ind.birth.date))}</strong>${placeSuffix(ind.birth)}</li>`);
        if (ind.death && ind.death.date) lines.push(`<li>✝ Died: <strong>${escHtml(model.fmtDate(ind.death.date))}</strong>${placeSuffix(ind.death)}</li>`);

        // Marriages and children, through every family the model links to this person.
        ind.families.forEach(famId => {
            const fam = model.family(famId);
            const partnerId = [fam.husb, fam.wife].filter(x => x && x !== id && model.has(x))[0];
            const m = fam.marriage;
            if (partnerId || (m && m.date)) {
                lines.push(`<li>💍 Married${partnerId ? ' <strong>' + who(partnerId) + '</strong>' : ''}${m && m.date ? ' ' + escHtml(model.fmtDate(m.date)) + placeSuffix(m) : ''}</li>`);
            }
            if (fam.kids.length) lines.push(`<li>👶 Children: ${fam.kids.map(who).join(', ')}</li>`);
        });

        const parents = model.parents(id);
        if (parents.length) lines.push(`<li>👨‍👩‍👧 Parents: ${parents.map(who).join(' &amp; ')}</li>`);

        // Key facts from the note (first 3 sentences max)
        const noteText = ind.note.replace(/\s+/g, ' ');
        const noteSummary = noteText.replace(/CORRECTION.*$/, '').replace(/Source:.*$/, '').trim().split(/\.\s+/).slice(0, 3).join('. ');
        if (noteSummary.length > 10) lines.push(`<li style="color:#aaa;font-size:0.9em">${escHtml(noteSummary.substring(0, 300))}${noteSummary.length > 300 ? '…' : ''}</li>`);

        const labels = { OCCU: 'Occupation', EDUC: 'Education', MILI: 'Military' };
        ind.facts.filter(f => labels[f.tag]).forEach(f => lines.push(`<li>📋 ${escHtml(labels[f.tag])}: ${escHtml(f.value)}</li>`));

        const genBadge = ind.generation !== null
            ? `<span style="background:rgba(243,156,18,0.2);color:#f39c12;padding:2px 10px;border-radius:12px;font-size:0.8em;margin-left:8px">Gen ${ind.generation}</span>`
            : '';
        const sex = ind.sex === 'M' ? '<span style="color:#88aaff;font-size:0.85em">♂ Male</span>'
            : ind.sex === 'F' ? '<span style="color:#ffaacc;font-size:0.85em">♀ Female</span>' : '';

        openOverlay(`
            <h2 id="gedcom-popup-title" style="margin:0 36px 6px 0;font-size:1.4em;color:#f1c40f">${escHtml(ind.name.full)}${genBadge}</h2>
            ${sex}
            <ul style="list-style:none;padding:0;margin:14px 0 0;display:flex;flex-direction:column;gap:8px">
                ${lines.length ? lines.join('') : '<li style="color:#888">No additional information recorded.</li>'}
            </ul>
            <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);font-size:0.8em;color:#888">
                GEDCOM ID: ${escHtml(id)} · <a href="${rootPath}visualizations/tree.html?person=${encodeURIComponent(id)}" style="color:#3498db">View in tree →</a>
            </div>
        `, keepFocus);
    }

    /** Several people share this name: let the visitor pick (never guess). */
    function showChooser(name, people) {
        openOverlay(`
            <h2 id="gedcom-popup-title" style="margin:0 36px 6px 0;font-size:1.3em;color:#f1c40f">Which ${escHtml(name)}?</h2>
            <p style="color:#aaa;font-size:0.9em;margin:0 0 12px">${people.length} people in the tree have this name.</p>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px">
                ${people.map(p => `<li><a href="#" data-popup-id="${escHtml(p.id)}" style="display:block;padding:10px 12px;min-height:44px;box-sizing:border-box;border-radius:10px;background:rgba(255,255,255,0.06);color:#7fb8ff;text-decoration:none">
                    ${escHtml(p.name.full)} <span style="color:#aaa">${escHtml(model.fmtLife(p.id))}${p.generation !== null ? ' · Gen ' + p.generation : ''}</span></a></li>`).join('')}
            </ul>
        `);
    }

    function hidePopup() {
        if (!overlay) return;
        overlay.style.display = 'none';
        document.documentElement.style.overflow = '';
        if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* element gone */ } }
    }

    // ── Activate links ───────────────────────────────────────────────────────
    function activateNames() {
        // 1. Explicit person-link spans: an id is exact, a name may need a chooser.
        document.querySelectorAll('.person-link[data-gedcom-id], .person-link[data-name]').forEach(el => {
            if (el.classList.contains('gedcom-linked')) return;
            const id = el.dataset.gedcomId;
            if (id) {
                if (model.has(id)) makeLinkable(el, () => showPopup(id), model.name(id));
                return;
            }
            const found = candidates(el.dataset.name);
            if (found.length === 1) makeLinkable(el, () => showPopup(found[0].id), found[0].name.full);
            else if (found.length > 1) makeLinkable(el, () => showChooser(el.dataset.name, found), el.dataset.name);
        });

        // 2. Auto-detect: only when exactly one person has this name. Headings are never linked.
        const autoSelectors = [
            '.child-name', '.person-name', '.node-name-text',
            '.badge:not(.status-badge):not(.branch-count)',
            '.family-member', '.person-badge', '.chip'
        ];
        document.querySelectorAll(autoSelectors.join(',')).forEach(el => {
            if (el.closest('#gedcom-popup-overlay')) return;
            if (el.querySelector('a') || el.classList.contains('gedcom-linked')) return;
            if (/[×&+•|]|\b(and|en)\b/.test(el.textContent)) return;   // "A × B": a label for two people
            const text = el.textContent.replace(/\([^)]*\)/g, ' ').replace(/[🏠🇺🇸🇳🇱💍✝🎂👶★⭐†\d]/g, '').replace(/\s+/g, ' ').trim();
            if (text.length < 3 || text.length > 60) return;
            const id = findId(text);
            if (id) makeLinkable(el, () => showPopup(id), model.name(id));
        });
    }

    function makeLinkable(el, open, label) {
        el.classList.add('gedcom-linked');
        el.style.cursor = 'pointer';
        el.style.textDecoration = 'underline dotted rgba(255,255,255,0.4)';
        el.title = 'Click to view ' + (label || '') + ' info';
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
        el.addEventListener('click', e => { e.stopPropagation(); open(); });
        el.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); open(); }
        });
    }

    // ── Init ─────────────────────────────────────────────────────────────────
    async function init() {
        try {
            const GM = await ensureModel();
            model = await GM.load({ path: window.GEDCOM_PATH || GEDCOM_DEFAULT });
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

    // Expose for manual use (related.html calls showPopup by id)
    // refresh(): pages that build their cards after load call it so the new names become links.
    window.gedcomLookup = { findId, candidates, showPopup, individuals: () => model ? model.people : [],
        refresh: () => { if (model) activateNames(); } };
})();

// ── Global loaders ───────────────────────────────────────────────────
// Every page that includes this script also gets the collapsible bottom nav (js/bottom-nav.js), the
// Kid Mode achievements (js/achievements.js) and Kid Mode itself (js/kid-mode.js: glossary tooltips,
// heading emojis, achievements popup). The root path is derived from the page depth so the scripts
// resolve from any subdirectory; a page that already has its own <script src> for one is left alone.
(function loadGlobalScripts() {
    let depth = 0;
    if (window.GEDCOM_PATH) {
        depth = String(window.GEDCOM_PATH).split('/').filter(p => p === '..').length;
    } else {
        const m = window.location.pathname.match(/\/family_tree\/(.+)/);
        if (m) depth = (m[1].match(/\//g) || []).length;
    }
    const root = depth === 0 ? './' : '../'.repeat(depth);

    [['bottom-nav-loader', 'bottom-nav'], ['achievements-loader', 'achievements'], ['kid-mode-loader', 'kid-mode']].forEach(pair => {
        const id = pair[0], file = pair[1];
        if (document.getElementById(id)) return;
        const already = Array.prototype.some.call(
            document.querySelectorAll('script[src]'),
            s => new RegExp('js/' + file + '\\.js(\\?|$)').test(s.getAttribute('src') || '')
        );
        if (already) return;
        const s = document.createElement('script');
        s.id = id;
        s.src = root + 'js/' + file + '.js';
        s.defer = true;
        document.head.appendChild(s);
    });
})();
