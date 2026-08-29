/**
 * Dynamic Generation Page Renderer
 * Loads person data from GEDCOM and renders generation pages dynamically.
 * 
 * Usage: Include this script in a generation page, set window.GENERATION_CONFIG,
 * then call GenerationPage.init()
 */

const GenerationPage = {
    gedcom: null,
    config: null,
    
    /**
     * Initialize the generation page
     * @param {Object} config - Configuration object with generation number, title, etc.
     */
    async init(config) {
        this.config = config || window.GENERATION_CONFIG || {};
        
        try {
            // Load GEDCOM
            const gedcomPath = this.config.gedcomPath || '../vanduynhoven_family.ged';
            const response = await fetch(gedcomPath);
            const text = await response.text();
            this.gedcom = this.parseGEDCOM(text);
            
            // Render the page
            this.renderPage();
            
            // Hide loading, show content
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
    
    /**
     * Parse GEDCOM file into structured data
     */
    parseGEDCOM(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        const individuals = {};
        const families = {};
        let current = null;
        let currentType = null;
        let subRecord = null;
        
        for (const line of lines) {
            const match = line.match(/^(\d+)\s+(@\w+@|\w+)\s*(.*)?$/);
            if (!match) continue;
            const [, levelStr, tag, value] = match;
            const level = parseInt(levelStr);
            
            if (level === 0) {
                if (tag.startsWith('@I') && value === 'INDI') {
                    current = { 
                        id: tag, name: '', givenName: '', surname: '', nickname: '',
                        sex: '', birth: {}, death: {}, facts: [], notes: [],
                        famc: null, fams: [], occupation: '', religion: ''
                    };
                    individuals[tag] = current;
                    currentType = 'INDI';
                } else if (tag.startsWith('@F') && value === 'FAM') {
                    current = { id: tag, husb: null, wife: null, children: [], marriage: {}, divorce: null };
                    families[tag] = current;
                    currentType = 'FAM';
                } else {
                    current = null;
                    currentType = null;
                }
                subRecord = null;
            } else if (current && level === 1) {
                subRecord = tag;
                if (currentType === 'INDI') {
                    if (tag === 'NAME') {
                        current.name = value ? value.replace(/\//g, '').trim() : '';
                    } else if (tag === 'SEX') current.sex = value;
                    else if (tag === 'BIRT') current.birth = {};
                    else if (tag === 'DEAT') current.death = {};
                    else if (tag === 'OCCU') current.occupation = value || '';
                    else if (tag === 'RELI') current.religion = value || '';
                    else if (tag === 'NOTE') current.notes.push(value || '');
                    else if (tag === 'FAMC') current.famc = value;
                    else if (tag === 'FAMS') current.fams.push(value);
                    else if (tag === '_FSID') current.familySearchId = value;
                } else if (currentType === 'FAM') {
                    if (tag === 'HUSB') current.husb = value;
                    else if (tag === 'WIFE') current.wife = value;
                    else if (tag === 'CHIL') current.children.push(value);
                    else if (tag === 'MARR') current.marriage = {};
                    else if (tag === 'DIV') current.divorce = {};
                }
            } else if (current && level === 2) {
                if (currentType === 'INDI') {
                    if (subRecord === 'NAME') {
                        if (tag === 'GIVN') current.givenName = value;
                        else if (tag === 'SURN') current.surname = value;
                        else if (tag === 'NICK') current.nickname = value;
                    } else if (subRecord === 'BIRT') {
                        if (tag === 'DATE') current.birth.date = value;
                        else if (tag === 'PLAC') current.birth.place = value;
                    } else if (subRecord === 'DEAT') {
                        if (tag === 'DATE') current.death.date = value;
                        else if (tag === 'PLAC') current.death.place = value;
                    }
                } else if (currentType === 'FAM') {
                    if (subRecord === 'MARR') {
                        if (tag === 'DATE') current.marriage.date = value;
                        else if (tag === 'PLAC') current.marriage.place = value;
                    }
                }
            }
        }
        
        return { individuals, families };
    },
    
    /**
     * Extract generation number from individual's notes
     */
    getGeneration(ind) {
        if (!ind || !ind.notes) return null;
        for (const note of ind.notes) {
            const match = note.match(/Generation\s+(-?\d+)/i);
            if (match) return parseInt(match[1]);
        }
        return null;
    },
    
    /**
     * Calculate generation for all individuals based on family relationships
     * This is more reliable than parsing NOTE text
     */
    calculateGenerations() {
        if (this._generationsCalculated) return;
        this._generations = {};
        
        // Find root ancestor (someone with Generation -4 or earliest known)
        let rootId = null;
        let rootGen = null;
        
        for (const [id, ind] of Object.entries(this.gedcom.individuals)) {
            const gen = this.getGeneration(ind);
            if (gen !== null) {
                if (rootGen === null || gen < rootGen) {
                    rootGen = gen;
                    rootId = id;
                }
                this._generations[id] = gen;
            }
        }
        
        // Propagate generations through family relationships
        const visited = new Set();
        const queue = Object.keys(this._generations).map(id => ({ id, gen: this._generations[id] }));
        
        while (queue.length > 0) {
            const { id, gen } = queue.shift();
            if (visited.has(id)) continue;
            visited.add(id);
            
            this._generations[id] = gen;
            const ind = this.gedcom.individuals[id];
            if (!ind) continue;
            
            // Children are gen + 1
            for (const famId of (ind.fams || [])) {
                const fam = this.gedcom.families[famId];
                if (!fam) continue;
                for (const childId of (fam.children || [])) {
                    if (!visited.has(childId) && this._generations[childId] === undefined) {
                        this._generations[childId] = gen + 1;
                        queue.push({ id: childId, gen: gen + 1 });
                    }
                }
            }
            
            // Parents are gen - 1
            if (ind.famc) {
                const fam = this.gedcom.families[ind.famc];
                if (fam) {
                    if (fam.husb && !visited.has(fam.husb) && this._generations[fam.husb] === undefined) {
                        this._generations[fam.husb] = gen - 1;
                        queue.push({ id: fam.husb, gen: gen - 1 });
                    }
                    if (fam.wife && !visited.has(fam.wife) && this._generations[fam.wife] === undefined) {
                        this._generations[fam.wife] = gen - 1;
                        queue.push({ id: fam.wife, gen: gen - 1 });
                    }
                }
            }
            
            // Siblings are same gen
            if (ind.famc) {
                const fam = this.gedcom.families[ind.famc];
                if (fam) {
                    for (const sibId of (fam.children || [])) {
                        if (sibId !== id && !visited.has(sibId) && this._generations[sibId] === undefined) {
                            this._generations[sibId] = gen;
                            queue.push({ id: sibId, gen });
                        }
                    }
                }
            }
        }
        
        this._generationsCalculated = true;
    },
    
    /**
     * Get calculated generation for an individual
     */
    getCalculatedGeneration(indOrId) {
        this.calculateGenerations();
        const id = typeof indOrId === 'string' ? indOrId : indOrId.id;
        return this._generations[id] || null;
    },
    
    /**
     * Get all individuals for a specific generation
     */
    getGenerationMembers(genNum) {
        this.calculateGenerations();
        const members = [];
        for (const [id, ind] of Object.entries(this.gedcom.individuals)) {
            const gen = this._generations[id];
            if (gen === genNum) {
                members.push({ ...ind, id });
            }
        }
        // Sort by birth year
        members.sort((a, b) => {
            const ya = this.extractYear(a.birth?.date);
            const yb = this.extractYear(b.birth?.date);
            return (ya || 9999) - (yb || 9999);
        });
        return members;
    },
    
    /**
     * Get spouse(s) for an individual
     */
    getSpouses(ind) {
        const spouses = [];
        for (const famId of (ind.fams || [])) {
            const fam = this.gedcom.families[famId];
            if (!fam) continue;
            const spouseId = fam.husb === ind.id ? fam.wife : fam.husb;
            const spouse = this.gedcom.individuals[spouseId];
            if (spouse) {
                spouses.push({
                    ...spouse,
                    id: spouseId,
                    marriage: fam.marriage,
                    divorced: !!fam.divorce
                });
            }
        }
        return spouses;
    },
    
    /**
     * Get children for an individual
     */
    getChildren(ind) {
        const children = [];
        for (const famId of (ind.fams || [])) {
            const fam = this.gedcom.families[famId];
            if (!fam) continue;
            for (const childId of (fam.children || [])) {
                const child = this.gedcom.individuals[childId];
                if (child && !children.find(c => c.id === childId)) {
                    children.push({ ...child, id: childId });
                }
            }
        }
        // Sort by birth year
        children.sort((a, b) => {
            const ya = this.extractYear(a.birth?.date);
            const yb = this.extractYear(b.birth?.date);
            return (ya || 9999) - (yb || 9999);
        });
        return children;
    },
    
    /**
     * Get parents for an individual
     */
    getParents(ind) {
        if (!ind.famc) return [];
        const fam = this.gedcom.families[ind.famc];
        if (!fam) return [];
        const parents = [];
        if (fam.husb && this.gedcom.individuals[fam.husb]) {
            parents.push({ ...this.gedcom.individuals[fam.husb], id: fam.husb, relation: 'Father' });
        }
        if (fam.wife && this.gedcom.individuals[fam.wife]) {
            parents.push({ ...this.gedcom.individuals[fam.wife], id: fam.wife, relation: 'Mother' });
        }
        return parents;
    },
    
    /**
     * Get siblings for an individual
     */
    getSiblings(ind) {
        if (!ind.famc) return [];
        const fam = this.gedcom.families[ind.famc];
        if (!fam) return [];
        const siblings = [];
        for (const childId of (fam.children || [])) {
            if (childId === ind.id) continue;
            const sib = this.gedcom.individuals[childId];
            if (sib) siblings.push({ ...sib, id: childId });
        }
        siblings.sort((a, b) => {
            const ya = this.extractYear(a.birth?.date);
            const yb = this.extractYear(b.birth?.date);
            return (ya || 9999) - (yb || 9999);
        });
        return siblings;
    },
    
    /**
     * Format years display (e.g., "1915-1985" or "b.1915")
     */
    formatYears(ind) {
        const birthYear = this.extractYear(ind.birth?.date);
        const deathYear = this.extractYear(ind.death?.date);
        if (birthYear && deathYear) return `${birthYear}–${deathYear}`;
        if (birthYear) return `b.${birthYear}`;
        if (deathYear) return `d.${deathYear}`;
        return '';
    },
    
    /**
     * Extract year from date string
     */
    extractYear(dateStr) {
        if (!dateStr) return null;
        const match = dateStr.match(/\d{4}/);
        return match ? parseInt(match[0]) : null;
    },
    
    /**
     * Format a date for display
     */
    formatDate(dateStr) {
        if (!dateStr) return '';
        return dateStr;
    },
    
    /**
     * Format place for display (short version)
     */
    formatPlaceShort(place) {
        if (!place) return '';
        const parts = place.split(',').map(p => p.trim());
        return parts.slice(0, 2).join(', ');
    },
    
    /**
     * Check if individual is a direct ancestor (has the ⭐ marker in notes)
     */
    isDirectAncestor(ind) {
        if (!ind.notes) return false;
        return ind.notes.some(n => 
            n.includes('direct ancestor') || 
            n.includes('Direct Ancestor') ||
            n.includes('our direct') ||
            n.includes('patriarch') ||
            n.includes('Patriarch')
        );
    },
    
    /**
     * Get emoji for person based on sex
     */
    getPersonEmoji(ind) {
        return ind.sex === 'M' ? '👨' : ind.sex === 'F' ? '👩' : '👤';
    },
    
    /**
     * Escape HTML
     */
    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },
    
    /**
     * Render the full page
     */
    renderPage() {
        const gen = this.config.generation;
        const members = this.getGenerationMembers(gen);
        
        // Update stats
        this.renderStats(members);
        
        // Render main people cards
        const container = document.getElementById('people-cards');
        if (container) {
            container.innerHTML = members.map(m => this.renderPersonCard(m, true)).join('');
        }
        
        // Render children section if configured
        if (this.config.showChildren !== false) {
            this.renderChildrenSection(members);
        }
        
        // Set up expand/collapse handlers
        this.setupExpandHandlers();
    },
    
    /**
     * Render stats row
     */
    renderStats(members) {
        const statsContainer = document.getElementById('dynamic-stats');
        if (!statsContainer) return;
        
        // Count children across all members
        let totalChildren = 0;
        const childrenSeen = new Set();
        members.forEach(m => {
            this.getChildren(m).forEach(c => {
                if (!childrenSeen.has(c.id)) {
                    childrenSeen.add(c.id);
                    totalChildren++;
                }
            });
        });
        
        // Get earliest birth year
        const years = members.map(m => this.extractYear(m.birth?.date)).filter(y => y);
        const earliestYear = years.length > 0 ? Math.min(...years) : '?';
        
        statsContainer.innerHTML = `
            <div class="stat-box">
                <div class="stat-number">${members.length}</div>
                <div class="stat-label">People</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">${totalChildren}</div>
                <div class="stat-label">Children</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">${earliestYear}</div>
                <div class="stat-label">Earliest Birth</div>
            </div>
        `;
    },
    
    /**
     * Render a person card
     */
    renderPersonCard(ind, isMain = false) {
        const spouses = this.getSpouses(ind);
        const children = this.getChildren(ind);
        const parents = this.getParents(ind);
        const siblings = this.getSiblings(ind);
        const isAncestor = this.isDirectAncestor(ind);
        const emoji = this.getPersonEmoji(ind);
        
        const birthInfo = ind.birth?.date ? 
            `${this.formatDate(ind.birth.date)}${ind.birth.place ? ', ' + this.formatPlaceShort(ind.birth.place) : ''}` : '';
        const deathInfo = ind.death?.date ?
            `${this.formatDate(ind.death.date)}${ind.death.place ? ', ' + this.formatPlaceShort(ind.death.place) : ''}` : '';
        
        // Extract first interesting note (skip generation markers)
        const storyNote = (ind.notes || []).find(n => 
            !n.startsWith('Generation') && 
            !n.startsWith('Wife of') && 
            !n.startsWith('Husband of') &&
            n.length > 50
        );
        
        return `
        <article class="person-card-fun" data-id="${ind.id}">
            <div class="card-header">
                <div class="avatar ${isAncestor ? 'ancestor' : (ind.sex === 'F' ? 'female' : '')}">${emoji}</div>
                <div class="name-area">
                    <h2 class="person-name">${this.escapeHtml(ind.name)}${ind.nickname ? ` "${this.escapeHtml(ind.nickname)}"` : ''}</h2>
                    <p class="person-subtitle">${this.formatYears(ind)}</p>
                </div>
                ${isAncestor ? '<span class="ancestor-badge">⭐ Direct Ancestor</span>' : ''}
            </div>
            <div class="card-body">
                <div class="quick-facts">
                    ${birthInfo ? `<span class="fact-pill"><span class="pill-emoji">🎂</span> Born: ${this.escapeHtml(birthInfo)}</span>` : ''}
                    ${deathInfo ? `<span class="fact-pill"><span class="pill-emoji">✝️</span> Died: ${this.escapeHtml(deathInfo)}</span>` : ''}
                    ${ind.occupation ? `<span class="fact-pill"><span class="pill-emoji">💼</span> ${this.escapeHtml(ind.occupation)}</span>` : ''}
                    ${ind.religion ? `<span class="fact-pill"><span class="pill-emoji">⛪</span> ${this.escapeHtml(ind.religion)}</span>` : ''}
                </div>
                
                ${spouses.length > 0 ? `
                <div class="expandable-section" id="spouse-${ind.id}">
                    <button class="expand-btn" onclick="GenerationPage.toggleSection('spouse-${ind.id}')">
                        <span><span class="btn-emoji">💍</span> ${spouses.length === 1 ? 'Spouse' : 'Spouses'} (${spouses.length})</span>
                        <span class="arrow">▼</span>
                    </button>
                    <div class="expand-content">
                        ${spouses.map(sp => `
                            <div class="quick-facts" style="margin-bottom: 12px;">
                                <span class="fact-pill highlight"><span class="pill-emoji">${this.getPersonEmoji(sp)}</span> ${this.escapeHtml(sp.name)}</span>
                                <span class="fact-pill"><span class="pill-emoji">📅</span> ${this.formatYears(sp)}</span>
                                ${sp.marriage?.date ? `<span class="fact-pill"><span class="pill-emoji">💒</span> Married: ${this.escapeHtml(sp.marriage.date)}</span>` : ''}
                                ${sp.marriage?.place ? `<span class="fact-pill"><span class="pill-emoji">📍</span> ${this.escapeHtml(this.formatPlaceShort(sp.marriage.place))}</span>` : ''}
                                ${sp.divorced ? '<span class="fact-pill" style="background:rgba(231,76,60,0.2);"><span class="pill-emoji">💔</span> Divorced</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${parents.length > 0 ? `
                <div class="expandable-section" id="parents-${ind.id}">
                    <button class="expand-btn" onclick="GenerationPage.toggleSection('parents-${ind.id}')">
                        <span><span class="btn-emoji">👨‍👩‍👦</span> Parents</span>
                        <span class="arrow">▼</span>
                    </button>
                    <div class="expand-content">
                        <div class="quick-facts">
                            ${parents.map(p => `
                                <span class="fact-pill"><span class="pill-emoji">${p.relation === 'Father' ? '👨' : '👩'}</span> ${p.relation}: ${this.escapeHtml(p.name)} (${this.formatYears(p)})</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}
                
                ${siblings.length > 0 ? `
                <div class="expandable-section" id="siblings-${ind.id}">
                    <button class="expand-btn" onclick="GenerationPage.toggleSection('siblings-${ind.id}')">
                        <span><span class="btn-emoji">👨‍👩‍👧‍👦</span> Siblings (${siblings.length})</span>
                        <span class="arrow">▼</span>
                    </button>
                    <div class="expand-content">
                        <div class="children-preview-grid">
                            ${siblings.map(sib => `
                                <div class="child-preview-card">
                                    <div class="child-emoji">${this.getPersonEmoji(sib)}</div>
                                    <div class="child-name">${this.escapeHtml(sib.givenName || sib.name.split(' ')[0])}</div>
                                    <div class="child-years">${this.formatYears(sib)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}
                
                ${children.length > 0 ? `
                <div class="expandable-section" id="children-${ind.id}">
                    <button class="expand-btn" onclick="GenerationPage.toggleSection('children-${ind.id}')">
                        <span><span class="btn-emoji">👶</span> Children (${children.length})</span>
                        <span class="arrow">▼</span>
                    </button>
                    <div class="expand-content">
                        <div class="children-preview-grid">
                            ${children.map(child => {
                                const childIsAncestor = this.isDirectAncestor(child);
                                return `
                                <div class="child-preview-card ${childIsAncestor ? 'ancestor' : ''}" ${childIsAncestor ? 'style="background: rgba(243,156,18,0.2); border: 2px solid #f39c12;"' : ''}>
                                    <div class="child-emoji">${childIsAncestor ? '⭐' : this.getPersonEmoji(child)}</div>
                                    <div class="child-name">${this.escapeHtml(child.givenName || child.name.split(' ')[0])}</div>
                                    <div class="child-years">${this.formatYears(child)}</div>
                                </div>
                            `}).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}
                
                ${storyNote ? `
                <div class="expandable-section" id="story-${ind.id}">
                    <button class="expand-btn" onclick="GenerationPage.toggleSection('story-${ind.id}')">
                        <span><span class="btn-emoji">📖</span> Their Story</span>
                        <span class="arrow">▼</span>
                    </button>
                    <div class="expand-content">
                        <p style="color: #bbb; line-height: 1.7;">${this.escapeHtml(storyNote)}</p>
                    </div>
                </div>
                ` : ''}
                
                <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px;">
                    ${ind.familySearchId ? `
                        <a href="https://www.familysearch.org/tree/person/details/${ind.familySearchId}" target="_blank" class="explore-btn">
                            <span class="btn-icon">🔗</span> FamilySearch
                        </a>
                    ` : ''}
                    <a href="../visualizations/tree.html?person=${encodeURIComponent(ind.id)}" class="explore-btn" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">
                        <span class="btn-icon">🌳</span> View in Tree
                    </a>
                </div>
            </div>
        </article>
        `;
    },
    
    /**
     * Render the children section showing next generation
     */
    renderChildrenSection(members) {
        const container = document.getElementById('children-section');
        if (!container) return;
        
        // Collect all unique children
        const allChildren = [];
        const seen = new Set();
        members.forEach(m => {
            this.getChildren(m).forEach(c => {
                if (!seen.has(c.id)) {
                    seen.add(c.id);
                    allChildren.push(c);
                }
            });
        });
        
        if (allChildren.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        // Sort by birth year
        allChildren.sort((a, b) => {
            const ya = this.extractYear(a.birth?.date);
            const yb = this.extractYear(b.birth?.date);
            return (ya || 9999) - (yb || 9999);
        });
        
        const nextGen = this.config.generation + 1;
        
        container.innerHTML = `
            <h2 class="section-title">👶 Their Children (Generation ${nextGen})</h2>
            <div class="children-preview-grid">
                ${allChildren.map(child => {
                    const isAncestor = this.isDirectAncestor(child);
                    const isDead = !!child.death?.date;
                    const birthYear = this.extractYear(child.birth?.date);
                    const deathYear = this.extractYear(child.death?.date);
                    const youngDeath = birthYear && deathYear && (deathYear - birthYear) < 18;
                    
                    return `
                    <div class="child-preview-card ${isAncestor ? 'ancestor' : ''}" 
                         style="${isAncestor ? 'background: rgba(243,156,18,0.2); border: 2px solid #f39c12;' : ''}${youngDeath ? 'opacity: 0.6;' : ''}">
                        <div class="child-emoji">${isAncestor ? '⭐' : this.getPersonEmoji(child)}</div>
                        <div class="child-name">${this.escapeHtml(child.givenName || child.name.split(' ')[0])}</div>
                        <div class="child-years">${this.formatYears(child)}${youngDeath ? ' 😢' : ''}</div>
                    </div>
                `}).join('')}
            </div>
            ${this.config.nextGenLink ? `
                <div style="text-align: center; margin-top: 20px;">
                    <a href="${this.config.nextGenLink}" class="explore-btn" style="background: linear-gradient(135deg, #00bcd4, #0097a7);">
                        <span class="btn-icon">➡️</span> Meet Generation ${nextGen}
                    </a>
                </div>
            ` : ''}
        `;
    },
    
    /**
     * Toggle expandable section
     */
    toggleSection(id) {
        const section = document.getElementById(id);
        if (section) {
            section.classList.toggle('open');
        }
    },
    
    /**
     * Set up expand handlers
     */
    setupExpandHandlers() {
        // Already handled via onclick in the HTML
    }
};

// Export for use
if (typeof window !== 'undefined') {
    window.GenerationPage = GenerationPage;
}
