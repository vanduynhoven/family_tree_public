/**
 * Dynamic Generation Page Renderer
 * Renders one generation page from the shared GEDCOM model (js/gedcom-model.js).
 *
 * Usage: include this script in a generation page, set window.GENERATION_CONFIG,
 * then call GenerationPage.init()
 *
 * What changed with the model (audit FT-007/008/009/014/027/042):
 *  - the generation of a person is the model's (computed from the parent/child links, never read from notes);
 *  - "the family" is structural: the line below Dirck van Duinhoven (blood descendants through either parent),
 *    not a surname match; the choice is remembered;
 *  - relatives come from links in both directions, so nobody is missing because of a one-way link;
 *  - dates keep their qualifier ("c. 1783", "before 1939"); notes keep every line.
 */

const GENERATION_PAGE_SELF = document.currentScript && document.currentScript.src;
const GENERATION_FILTER_KEY = 'vdh-gen-filter';
const ME_KEY = 'vdh-me';

const GenerationPage = {
    model: null,
    config: null,
    filter: 'family',      // 'family' | 'spouses' | 'all'
    meId: null,
    ancestorsOfMe: {},

    ensureModel() {
        if (window.GedcomModel) return Promise.resolve(window.GedcomModel);
        return new Promise((resolve, reject) => {
            if (!GENERATION_PAGE_SELF) { reject(new Error('gedcom-model.js is not loaded')); return; }
            const s = document.createElement('script');
            s.src = GENERATION_PAGE_SELF.replace(/generation-page\.js.*$/, 'gedcom-model.js');
            s.onload = () => resolve(window.GedcomModel);
            s.onerror = () => reject(new Error('could not load gedcom-model.js'));
            document.head.appendChild(s);
        });
    },

    /**
     * Initialize the generation page
     * @param {Object} config - Configuration object with generation number, title, etc.
     */
    async init(config) {
        this.config = config || window.GENERATION_CONFIG || {};
        try {
            this.filter = localStorage.getItem(GENERATION_FILTER_KEY) || 'family';
        } catch (e) { this.filter = 'family'; }
        if (['family', 'spouses', 'all'].indexOf(this.filter) < 0) this.filter = 'family';

        try {
            const GM = await this.ensureModel();
            this.model = await GM.load({ path: this.config.gedcomPath });
            let stored = null;
            try { stored = localStorage.getItem(ME_KEY); } catch (e) { /* private mode */ }
            this.meId = this.model.resolveMe(stored);
            this.ancestorsOfMe = this.meId ? this.model.ancestorSet(this.meId) : {};

            this.renderFilterControls();
            this.renderPage();

            const loading = document.getElementById('loading');
            if (loading) loading.style.display = 'none';
            const content = document.getElementById('dynamic-content');
            if (content) content.style.display = 'block';
        } catch (err) {
            console.error('Failed to load GEDCOM:', err);
            const loading = document.getElementById('loading');
            if (loading) loading.textContent = 'Error loading family data: ' + err.message;
        }
    },

    // ── filter ───────────────────────────────────────────────────────────────
    renderFilterControls() {
        let filterContainer = document.getElementById('filter-controls');
        if (!filterContainer) {
            const peopleCards = document.getElementById('people-cards');
            const insertBefore = peopleCards && peopleCards.parentElement;
            if (insertBefore) {
                filterContainer = document.createElement('div');
                filterContainer.id = 'filter-controls';
                filterContainer.className = 'filter-controls';
                const sectionTitle = insertBefore.querySelector('.section-title');
                if (sectionTitle) sectionTitle.parentNode.insertBefore(filterContainer, sectionTitle.nextSibling);
                else insertBefore.insertBefore(filterContainer, peopleCards);
            }
        }
        if (!filterContainer) return;

        const modes = [
            ['family', '👨‍👩‍👧‍👦', 'Family', 'Blood descendants of Dirck van Duinhoven, the top of the recorded line'],
            ['spouses', '💍', 'Family + spouses', 'Also the husbands and wives who married in'],
            ['all', '🌍', 'Everyone connected', 'Everyone in this generation of the connected tree, including married-in families']
        ];
        const hints = {
            family: '🔹 Showing the blood family only',
            spouses: '👥 Showing the family and the people who married in',
            all: '🌍 Showing everyone in this generation, including the married-in families'
        };
        filterContainer.innerHTML = `
            <div class="filter-toggle-group" role="group" aria-label="Who to show">
                ${modes.map(m => `<button type="button" class="filter-btn ${this.filter === m[0] ? 'active' : ''}"
                        aria-pressed="${this.filter === m[0]}" data-filter="${m[0]}" title="${m[3]}">
                    <span class="filter-icon">${m[1]}</span> ${m[2]}
                </button>`).join('')}
            </div>
            <div class="filter-hint">${hints[this.filter]}</div>
        `;
        filterContainer.querySelectorAll('[data-filter]').forEach(b => {
            b.addEventListener('click', () => this.setFilter(b.getAttribute('data-filter')));
        });

        if (!document.getElementById('filter-styles')) {
            const style = document.createElement('style');
            style.id = 'filter-styles';
            style.textContent = `
                .filter-controls { margin: 20px 0; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
                .filter-toggle-group { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
                .filter-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; min-height: 44px; border: 2px solid rgba(255,255,255,0.2);
                    border-radius: 25px; background: rgba(255,255,255,0.05); color: #bbb; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s ease; }
                .filter-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); color: #fff; }
                .filter-btn.active { background: linear-gradient(135deg, #3498db, #2980b9); border-color: #3498db; color: #fff; box-shadow: 0 4px 15px rgba(52,152,219,0.3); }
                .filter-icon { font-size: 16px; }
                .filter-hint { text-align: center; margin-top: 12px; font-size: 13px; color: #999; }
                .person-card-fun.spouse-card { border-left: 4px solid #9b59b6; opacity: 0.95; }
                .person-card-fun.spouse-card .card-header { position: relative; }
                .person-card-fun.spouse-card::before { content: '💍 Spouse'; position: absolute; top: 12px; right: 12px; background: rgba(155,89,182,0.3);
                    color: #bb8fce; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
                .person-card-fun.other-card { border-left: 4px solid #555; opacity: 0.9; }
                .person-card-fun.other-card::before { content: 'Other line'; position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.08);
                    color: #aaa; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
                .story-text p { color: #bbb; line-height: 1.7; margin: 0 0 10px; }
                .gen-empty { text-align: center; color: #aaa; padding: 30px 10px; }
            `;
            document.head.appendChild(style);
        }
    },

    setFilter(mode) {
        this.filter = mode;
        try { localStorage.setItem(GENERATION_FILTER_KEY, mode); } catch (e) { /* private mode */ }
        this.renderFilterControls();
        this.renderPage();
    },

    // ── data (all from the model) ───────────────────────────────────────────
    birthYear(p) { return p.birth && p.birth.year !== null && p.birth.year !== undefined ? p.birth.year : null; },

    byBirth(a, b) { return (this.birthYear(a) || 9999) - (this.birthYear(b) || 9999); },

    /** People of this generation to show under the current filter. */
    getGenerationMembers(genNum) {
        const m = this.model;
        const blood = m.familyIds();
        const withSpouses = m.familyIds({ spouses: true });
        const out = [];
        m.people.forEach(p => {
            if (p.generation !== genNum) return;
            if (this.filter === 'family' && !blood[p.id]) return;
            if (this.filter === 'spouses' && !withSpouses[p.id]) return;
            out.push({ person: p, kind: blood[p.id] ? 'family' : (withSpouses[p.id] ? 'spouse' : 'other') });
        });
        out.sort((a, b) => this.byBirth(a.person, b.person));
        return out;
    },

    isDirectAncestor(p) { return !!this.ancestorsOfMe[p.id]; },

    getSpouses(p) {
        const out = [];
        p.families.forEach(fx => {
            const fam = this.model.family(fx);
            const sid = [fam.husb, fam.wife].filter(x => x && x !== p.id && this.model.has(x))[0];
            if (sid) out.push({ person: this.model.person(sid), marriage: fam.marriage, divorced: !!fam.divorce });
        });
        return out;
    },

    getChildren(p) { return this.model.children(p.id).map(id => this.model.person(id)).sort((a, b) => this.byBirth(a, b)); },

    getParents(p) {
        const out = [];
        const f = this.model.father(p.id), mo = this.model.mother(p.id);
        if (f) out.push({ person: this.model.person(f), relation: 'Father' });
        if (mo) out.push({ person: this.model.person(mo), relation: 'Mother' });
        return out;
    },

    getSiblings(p) { return this.model.siblings(p.id).map(id => this.model.person(id)).sort((a, b) => this.byBirth(a, b)); },

    // ── formatting ───────────────────────────────────────────────────────────
    years(p) { return this.model.fmtLife(p.id); },

    formatPlaceShort(place) {
        if (!place) return '';
        return place.split(',').map(x => x.trim()).slice(0, 2).join(', ');
    },

    eventText(ev) {
        if (!ev || !ev.date) return '';
        return this.model.fmtDate(ev.date) + (ev.place ? ', ' + this.formatPlaceShort(ev.place) : '');
    },

    fact(p, tag) { const f = p.facts.filter(x => x.tag === tag)[0]; return f ? f.value : ''; },

    getPersonEmoji(p) { return p.sex === 'M' ? '👨' : p.sex === 'F' ? '👩' : '👤'; },

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    displayName(p) {
        return this.escapeHtml(p.name.full.replace(/\s*["'\u201c][^"'\u201d]*["'\u201d]\s*/g, ' ').replace(/\s+/g, ' ').trim());
    },

    /** A name that opens the person's popup, by id. */
    nameLink(p, cls) {
        return `<span class="${cls} person-link" data-gedcom-id="${this.escapeHtml(p.id)}">${this.escapeHtml(p.name.given.split(' ')[0] || p.name.full)}</span>`;
    },

    // ── render ───────────────────────────────────────────────────────────────
    renderPage() {
        const gen = this.config.generation;
        const members = this.getGenerationMembers(gen);

        this.renderStats(members);

        const container = document.getElementById('people-cards');
        if (container) {
            container.innerHTML = members.length
                ? members.map(m => this.renderPersonCard(m.person, m.kind)).join('')
                : '<p class="gen-empty">Nobody in this generation fits the current choice. Try “Everyone connected”.</p>';
        }

        if (this.config.showChildren !== false) this.renderChildrenSection(members.map(m => m.person));

        // Names inside the cards open their popups (the lookup script made links once, before these cards existed).
        if (window.gedcomLookup && window.gedcomLookup.refresh) window.gedcomLookup.refresh();
    },

    renderStats(members) {
        const statsContainer = document.getElementById('dynamic-stats');
        if (!statsContainer) return;
        const seen = {};
        members.forEach(m => this.getChildren(m.person).forEach(c => { seen[c.id] = true; }));
        const years = members.map(m => this.birthYear(m.person)).filter(y => y);
        const earliest = years.length ? Math.min.apply(null, years) : '?';
        statsContainer.innerHTML = `
            <div class="stat-box"><div class="stat-number">${members.length}</div><div class="stat-label">People</div></div>
            <div class="stat-box"><div class="stat-number">${Object.keys(seen).length}</div><div class="stat-label">Children</div></div>
            <div class="stat-box"><div class="stat-number">${earliest}</div><div class="stat-label">Earliest Birth</div></div>
        `;
    },

    miniCard(p, extraClass, extraStyle, emoji, tail) {
        return `
            <div class="child-preview-card ${extraClass || ''}" ${extraStyle ? `style="${extraStyle}"` : ''}>
                <div class="child-emoji">${emoji || this.getPersonEmoji(p)}</div>
                ${this.nameLink(p, 'child-name')}
                <div class="child-years">${this.escapeHtml(this.years(p))}${tail || ''}</div>
            </div>`;
    },

    renderPersonCard(p, kind) {
        const spouses = this.getSpouses(p);
        const children = this.getChildren(p);
        const parents = this.getParents(p);
        const siblings = this.getSiblings(p);
        const isAncestor = this.isDirectAncestor(p);
        const emoji = this.getPersonEmoji(p);
        const cardClass = kind === 'spouse' ? ' spouse-card' : kind === 'other' ? ' other-card' : '';
        const birthInfo = this.eventText(p.birth);
        const deathInfo = this.eventText(p.death);
        const occupation = this.fact(p, 'OCCU');
        const religion = this.fact(p, 'RELI');
        const meName = this.meId ? this.model.person(this.meId).name.given : '';

        // The story: every note that is long enough to be one (the first line is no longer the only line).
        const story = p.notes.filter(n => !/^(Generation|Wife of|Husband of)/.test(n) && n.length > 50)[0] || '';
        const paragraphs = story.split(/\n+/).map(x => x.trim()).filter(Boolean);
        const sid = this.escapeHtml(p.id);
        const section = (key, emojiTxt, label, inner) => `
                <div class="expandable-section" id="${key}-${sid}">
                    <button class="expand-btn" type="button" aria-expanded="false" onclick="GenerationPage.toggleSection('${key}-${sid}')">
                        <span><span class="btn-emoji">${emojiTxt}</span> ${label}</span>
                        <span class="arrow">▼</span>
                    </button>
                    <div class="expand-content">${inner}</div>
                </div>`;

        return `
        <article class="person-card-fun${cardClass}" data-id="${sid}">
            <div class="card-header">
                <div class="avatar ${isAncestor ? 'ancestor' : (p.sex === 'F' ? 'female' : '')}">${emoji}</div>
                <div class="name-area">
                    <h2 class="person-name">${this.displayName(p)}${p.name.nick ? ` “${this.escapeHtml(p.name.nick)}”` : ''}</h2>
                    <p class="person-subtitle">${this.escapeHtml(this.years(p))}</p>
                </div>
                ${isAncestor ? `<span class="ancestor-badge" title="A direct ancestor of ${this.escapeHtml(meName)}">⭐ Direct Ancestor${meName ? ' of ' + this.escapeHtml(meName) : ''}</span>` : ''}
            </div>
            <div class="card-body">
                <div class="quick-facts">
                    ${birthInfo ? `<span class="fact-pill"><span class="pill-emoji">🎂</span> Born: ${this.escapeHtml(birthInfo)}</span>` : ''}
                    ${deathInfo ? `<span class="fact-pill"><span class="pill-emoji">✝️</span> Died: ${this.escapeHtml(deathInfo)}</span>` : ''}
                    ${occupation ? `<span class="fact-pill"><span class="pill-emoji">💼</span> ${this.escapeHtml(occupation)}</span>` : ''}
                    ${religion ? `<span class="fact-pill"><span class="pill-emoji">⛪</span> ${this.escapeHtml(religion)}</span>` : ''}
                </div>

                ${spouses.length ? section('spouse', '💍', `${spouses.length === 1 ? 'Spouse' : 'Spouses'} (${spouses.length})`,
                    spouses.map(sp => `
                            <div class="quick-facts" style="margin-bottom: 12px;">
                                <span class="fact-pill highlight"><span class="pill-emoji">${this.getPersonEmoji(sp.person)}</span> ${this.nameLink(sp.person, 'spouse-name')} ${this.escapeHtml(sp.person.name.full.split(' ').slice(1).join(' '))}</span>
                                <span class="fact-pill"><span class="pill-emoji">📅</span> ${this.escapeHtml(this.years(sp.person))}</span>
                                ${sp.marriage && sp.marriage.date ? `<span class="fact-pill"><span class="pill-emoji">💒</span> Married: ${this.escapeHtml(this.model.fmtDate(sp.marriage.date))}</span>` : ''}
                                ${sp.marriage && sp.marriage.place ? `<span class="fact-pill"><span class="pill-emoji">📍</span> ${this.escapeHtml(this.formatPlaceShort(sp.marriage.place))}</span>` : ''}
                                ${sp.divorced ? '<span class="fact-pill" style="background:rgba(231,76,60,0.2);"><span class="pill-emoji">💔</span> Divorced</span>' : ''}
                            </div>`).join('')) : ''}

                ${parents.length ? section('parents', '👨‍👩‍👦', 'Parents',
                    `<div class="quick-facts">${parents.map(pr => `
                                <span class="fact-pill"><span class="pill-emoji">${pr.relation === 'Father' ? '👨' : '👩'}</span> ${pr.relation}: ${this.nameLink(pr.person, 'parent-name')} ${this.escapeHtml(pr.person.name.full.split(' ').slice(1).join(' '))} (${this.escapeHtml(this.years(pr.person))})</span>`).join('')}</div>`) : ''}

                ${siblings.length ? section('siblings', '👨‍👩‍👧‍👦', `Siblings (${siblings.length})`,
                    `<div class="children-preview-grid">${siblings.map(s => this.miniCard(s)).join('')}</div>`) : ''}

                ${children.length ? section('children', '👶', `Children (${children.length})`,
                    `<div class="children-preview-grid">${children.map(c => {
                        const anc = this.isDirectAncestor(c);
                        return this.miniCard(c, anc ? 'ancestor' : '', anc ? 'background: rgba(243,156,18,0.2); border: 2px solid #f39c12;' : '', anc ? '⭐' : '');
                    }).join('')}</div>`) : ''}

                ${paragraphs.length ? section('story', '📖', 'Their Story',
                    `<div class="story-text">${paragraphs.map(t => `<p>${this.escapeHtml(t)}</p>`).join('')}</div>`) : ''}

                <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px;">
                    ${p.fsid ? `<a href="https://www.familysearch.org/tree/person/details/${encodeURIComponent(p.fsid)}" target="_blank" rel="noopener" class="explore-btn">
                        <span class="btn-icon">🔗</span> FamilySearch</a>` : ''}
                    <a href="../visualizations/tree.html?person=${encodeURIComponent(p.id)}" class="explore-btn" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">
                        <span class="btn-icon">🌳</span> View in Tree</a>
                </div>
            </div>
        </article>`;
    },

    renderChildrenSection(members) {
        const container = document.getElementById('children-section');
        if (!container) return;
        const seen = {}, all = [];
        members.forEach(m => this.getChildren(m).forEach(c => { if (!seen[c.id]) { seen[c.id] = true; all.push(c); } }));
        if (!all.length) { container.innerHTML = ''; return; }
        all.sort((a, b) => this.byBirth(a, b));
        const nextGen = this.config.generation === -1 ? 1 : this.config.generation + 1;

        container.innerHTML = `
            <h2 class="section-title">👶 Their Children (Generation ${nextGen})</h2>
            <div class="children-preview-grid">
                ${all.map(c => {
                    const anc = this.isDirectAncestor(c);
                    const by = this.birthYear(c), dy = c.death && c.death.year;
                    const young = by && dy && !c.death.date.qualifier && !c.birth.date.qualifier && (dy - by) < 18;
                    return this.miniCard(c, anc ? 'ancestor' : '',
                        (anc ? 'background: rgba(243,156,18,0.2); border: 2px solid #f39c12;' : '') + (young ? 'opacity: 0.6;' : ''),
                        anc ? '⭐' : '', young ? ' 😢' : '');
                }).join('')}
            </div>
            ${this.config.nextGenLink ? `
                <div style="text-align: center; margin-top: 20px;">
                    <a href="${this.config.nextGenLink}" class="explore-btn" style="background: linear-gradient(135deg, #00bcd4, #0097a7);">
                        <span class="btn-icon">➡️</span> Meet Generation ${nextGen}
                    </a>
                </div>` : ''}
        `;
    },

    toggleSection(id) {
        const section = document.getElementById(id);
        if (!section) return;
        section.classList.toggle('open');
        const btn = section.querySelector('.expand-btn');
        if (btn) btn.setAttribute('aria-expanded', String(section.classList.contains('open')));
    }
};

if (typeof window !== 'undefined') {
    window.GenerationPage = GenerationPage;
}
