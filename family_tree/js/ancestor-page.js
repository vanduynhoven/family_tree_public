/**
 * Ancestor Page Dynamic Loader
 * Keeps the numbers on the "Extended Ancestors" page (generation_0_ancestors) in sync with the GEDCOM,
 * through the shared model (js/gedcom-model.js). The hand-written biographies on the page stay as written.
 *
 * What changed with the model (audit FT-007/008/014):
 *  - nothing is read from "Generation N" notes; ancestors are found by walking the parent links from Petrus;
 *  - the "Generations" box used to print a head count of people; it now prints how many generations of
 *    recorded ancestors there are before Petrus;
 *  - the timeline is hand-curated on the page; the old code overwrote its labels (it could print
 *    "Ariaen Jan van Duynhoven", a Blaffarts) and is gone;
 *  - dates keep their qualifier: no age is ever computed from "about" or "before" dates.
 */

const ANCESTOR_PAGE_SELF = document.currentScript && document.currentScript.src;

const AncestorPage = {
    model: null,

    ensureModel() {
        if (window.GedcomModel) return Promise.resolve(window.GedcomModel);
        return new Promise((resolve, reject) => {
            if (!ANCESTOR_PAGE_SELF) { reject(new Error('gedcom-model.js is not loaded')); return; }
            const s = document.createElement('script');
            s.src = ANCESTOR_PAGE_SELF.replace(/ancestor-page\.js.*$/, 'gedcom-model.js');
            s.onload = () => resolve(window.GedcomModel);
            s.onerror = () => reject(new Error('could not load gedcom-model.js'));
            document.head.appendChild(s);
        });
    },

    async init() {
        try {
            const GM = await this.ensureModel();
            this.model = await GM.load({ path: window.GEDCOM_PATH });
            this.updateStats();
            this.updateAncestorCards();
            this.showSyncStatus();
        } catch (err) {
            console.error('Failed to load GEDCOM for ancestors:', err);
        }
    },

    /** Everyone linked above Petrus (generation 1): parents, grandparents ... on every side. */
    directAncestors() {
        const m = this.model, root = m.rootId;
        const set = m.ancestorSet(root);
        return Object.keys(set).map(id => m.person(id));
    },

    /** Everyone with a negative generation: the direct ancestors and the families they married into. */
    allEarlyPeople() {
        return this.model.people.filter(p => p.generation !== null && p.generation < 0);
    },

    /** Longest recorded chain of parents above Petrus. */
    chainLength() {
        const m = this.model;
        let frontier = [m.rootId], depth = 0;
        const seen = {};
        seen[m.rootId] = true;
        while (frontier.length) {
            const next = [];
            frontier.forEach(id => m.parents(id).forEach(pid => { if (!seen[pid]) { seen[pid] = true; next.push(pid); } }));
            if (next.length) depth++;
            frontier = next;
        }
        return depth;
    },

    updateStats() {
        const m = this.model;
        const direct = this.directAncestors();
        const years = direct.map(p => p.birth && p.birth.year).filter(y => y);
        const earliest = years.length ? Math.min.apply(null, years) : null;
        const root = m.person(m.rootId);
        const rootBirth = root && root.birth && root.birth.year;
        const early = this.allEarlyPeople();

        document.querySelectorAll('.stat-box[data-stat]').forEach(box => {
            const numEl = box.querySelector('.stat-number');
            if (!numEl) return;
            switch (box.getAttribute('data-stat')) {
                case 'ancestors': numEl.textContent = this.chainLength() + '+'; break;
                case 'earliest': if (earliest) numEl.textContent = '~' + earliest; break;
                case 'span': if (earliest && rootBirth) numEl.textContent = (rootBirth - earliest) + '+'; break;
            }
        });
        const ancestorCount = document.getElementById('ancestor-count');
        if (ancestorCount) ancestorCount.textContent = this.chainLength() + '+';
        const genCount = document.getElementById('generation-count');
        if (genCount) genCount.textContent = this.chainLength();
        this.earlyPeople = early.length;
    },

    /** Cards with data-gedcom-id and data-field children are filled from the model (none on the page today). */
    updateAncestorCards() {
        const m = this.model;
        document.querySelectorAll('[data-gedcom-id]').forEach(card => {
            const p = m.person(card.getAttribute('data-gedcom-id'));
            if (!p) return;
            const set = (field, text) => {
                const el = card.querySelector('[data-field="' + field + '"]');
                if (el && text) el.textContent = text;
            };
            set('name', p.name.full);
            set('birth', p.birth && p.birth.date ? m.fmtDate(p.birth.date) : '');
            set('birth-place', p.birth && p.birth.place);
            set('death', p.death && p.death.date ? m.fmtDate(p.death.date) : '');
            set('death-place', p.death && p.death.place);
            const fs = card.querySelector('[data-field="familysearch"]');
            if (fs && p.fsid) { fs.href = 'https://www.familysearch.org/tree/person/details/' + encodeURIComponent(p.fsid); fs.style.display = ''; }
            const age = m.age(p.id);      // null for any "about" / "before" date: the field stays as written
            if (age !== null) set('age', age + ' years');
        });
    },

    showSyncStatus() {
        const indicator = document.getElementById('gedcom-sync-status');
        if (indicator) {
            const rev = this.model.revision ? ' · revision ' + this.model.revision : '';
            indicator.innerHTML = `
                <span class="sync-dot"></span>
                <span class="sync-text">Synced with GEDCOM · ${this.directAncestors().length} direct ancestors, ${this.allEarlyPeople().length} people before Petrus${rev}</span>
            `;
            indicator.classList.add('synced');
        }
        const stamp = document.getElementById('gedcom-timestamp');
        if (stamp) stamp.textContent = new Date().toLocaleDateString();
    }
};

if (typeof window !== 'undefined') {
    window.AncestorPage = AncestorPage;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AncestorPage.init());
    } else {
        AncestorPage.init();
    }
}
