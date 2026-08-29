/**
 * Ancestor Page Dynamic Loader
 * Loads ancestor data from GEDCOM to keep Gen 0 page in sync.
 * Enhances static content with live data from the GEDCOM file.
 */

const AncestorPage = {
    gedcom: null,
    
    /**
     * Initialize the ancestor page with GEDCOM data
     */
    async init() {
        try {
            const gedcomPath = window.GEDCOM_PATH || '../vanduynhoven_family.ged';
            const response = await fetch(gedcomPath);
            const text = await response.text();
            this.gedcom = this.parseGEDCOM(text);
            
            // Update dynamic elements
            this.updateStats();
            this.updateAncestorCards();
            this.updateTimeline();
            
            // Show sync indicator
            this.showSyncStatus();
            
        } catch (err) {
            console.error('Failed to load GEDCOM for ancestors:', err);
        }
    },
    
    /**
     * Parse GEDCOM file
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
                        sex: '', birth: {}, death: {}, notes: [],
                        famc: null, fams: [], occupation: '', generation: null
                    };
                    individuals[tag] = current;
                    currentType = 'INDI';
                } else if (tag.startsWith('@F') && value === 'FAM') {
                    current = { id: tag, husb: null, wife: null, children: [], marriage: {} };
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
                    if (tag === 'NAME') current.name = value ? value.replace(/\//g, '').trim() : '';
                    else if (tag === 'SEX') current.sex = value;
                    else if (tag === 'BIRT') current.birth = {};
                    else if (tag === 'DEAT') current.death = {};
                    else if (tag === 'NOTE') current.notes.push(value || '');
                    else if (tag === 'FAMC') current.famc = value;
                    else if (tag === 'FAMS') current.fams.push(value);
                    else if (tag === '_FSID') current.familySearchId = value;
                } else if (currentType === 'FAM') {
                    if (tag === 'HUSB') current.husb = value;
                    else if (tag === 'WIFE') current.wife = value;
                    else if (tag === 'CHIL') current.children.push(value);
                    else if (tag === 'MARR') current.marriage = {};
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
        
        // Extract generation from notes
        for (const ind of Object.values(individuals)) {
            for (const note of ind.notes) {
                const match = note.match(/Generation\s+(-?\d+)/i);
                if (match) {
                    ind.generation = parseInt(match[1]);
                    break;
                }
            }
        }
        
        return { individuals, families };
    },
    
    /**
     * Get all ancestors (negative generations)
     */
    getAncestors() {
        const ancestors = [];
        for (const [id, ind] of Object.entries(this.gedcom.individuals)) {
            if (ind.generation !== null && ind.generation < 0) {
                ancestors.push({ ...ind, id });
            }
        }
        // Sort by generation (most negative first = oldest)
        ancestors.sort((a, b) => a.generation - b.generation);
        return ancestors;
    },
    
    /**
     * Get ancestors for a specific generation
     */
    getGenerationAncestors(gen) {
        return this.getAncestors().filter(a => a.generation === gen);
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
     * Update page stats from GEDCOM
     */
    updateStats() {
        const ancestors = this.getAncestors();
        const generations = new Set(ancestors.map(a => a.generation));
        const years = ancestors.map(a => this.extractYear(a.birth?.date)).filter(y => y);
        const earliestYear = years.length ? Math.min(...years) : null;
        const latestYear = years.length ? Math.max(...years) : null;
        
        // Update stat boxes if they have data-stat attributes
        const statBoxes = document.querySelectorAll('.stat-box[data-stat]');
        statBoxes.forEach(box => {
            const stat = box.getAttribute('data-stat');
            const numEl = box.querySelector('.stat-number');
            if (!numEl) return;
            
            switch(stat) {
                case 'ancestors':
                    numEl.textContent = ancestors.length;
                    break;
                case 'generations':
                    numEl.textContent = generations.size + '+';
                    break;
                case 'earliest':
                    if (earliestYear) numEl.textContent = '~' + earliestYear;
                    break;
                case 'span':
                    if (earliestYear && latestYear) {
                        numEl.textContent = (latestYear - earliestYear) + '+';
                    }
                    break;
            }
        });
        
        // Also update any elements with specific IDs
        const ancestorCount = document.getElementById('ancestor-count');
        if (ancestorCount) ancestorCount.textContent = ancestors.length;
        
        const genCount = document.getElementById('generation-count');
        if (genCount) genCount.textContent = generations.size;
    },
    
    /**
     * Update ancestor cards with GEDCOM data
     */
    updateAncestorCards() {
        // Find all ancestor cards with data-person-id attribute
        const cards = document.querySelectorAll('[data-gedcom-id]');
        
        cards.forEach(card => {
            const gedcomId = card.getAttribute('data-gedcom-id');
            const ind = this.gedcom.individuals[gedcomId];
            if (!ind) return;
            
            // Update name if element exists
            const nameEl = card.querySelector('[data-field="name"]');
            if (nameEl && ind.name) nameEl.textContent = ind.name;
            
            // Update birth date
            const birthEl = card.querySelector('[data-field="birth"]');
            if (birthEl && ind.birth?.date) birthEl.textContent = ind.birth.date;
            
            // Update birth place
            const birthPlaceEl = card.querySelector('[data-field="birth-place"]');
            if (birthPlaceEl && ind.birth?.place) birthPlaceEl.textContent = ind.birth.place;
            
            // Update death date
            const deathEl = card.querySelector('[data-field="death"]');
            if (deathEl && ind.death?.date) deathEl.textContent = ind.death.date;
            
            // Update death place
            const deathPlaceEl = card.querySelector('[data-field="death-place"]');
            if (deathPlaceEl && ind.death?.place) deathPlaceEl.textContent = ind.death.place;
            
            // Update FamilySearch link
            const fsLink = card.querySelector('[data-field="familysearch"]');
            if (fsLink && ind.familySearchId) {
                fsLink.href = `https://www.familysearch.org/tree/person/details/${ind.familySearchId}`;
                fsLink.style.display = '';
            }
            
            // Calculate age at death if both dates available
            const ageEl = card.querySelector('[data-field="age"]');
            if (ageEl && ind.birth?.date && ind.death?.date) {
                const birthYear = this.extractYear(ind.birth.date);
                const deathYear = this.extractYear(ind.death.date);
                if (birthYear && deathYear) {
                    ageEl.textContent = (deathYear - birthYear) + ' years';
                }
            }
        });
        
        // Update any dynamic ancestor lists
        this.renderDynamicLists();
    },
    
    /**
     * Render dynamic ancestor lists
     */
    renderDynamicLists() {
        // Render Gen -1 ancestors
        this.renderGenerationList(-1, 'gen-minus-1-list');
        this.renderGenerationList(-2, 'gen-minus-2-list');
        this.renderGenerationList(-3, 'gen-minus-3-list');
        
        // Render siblings lists
        for (let gen = -1; gen >= -4; gen--) {
            this.renderSiblingsList(gen);
        }
    },
    
    /**
     * Render a list of ancestors for a specific generation
     */
    renderGenerationList(gen, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const ancestors = this.getGenerationAncestors(gen);
        if (ancestors.length === 0) return;
        
        container.innerHTML = ancestors.map(ind => `
            <div class="dynamic-ancestor-card" data-gedcom-id="${ind.id}">
                <div class="ancestor-info">
                    <strong>${this.escapeHtml(ind.name)}</strong>
                    <span class="dates">${this.formatYears(ind)}</span>
                </div>
                ${ind.birth?.place ? `<div class="place">📍 ${this.escapeHtml(ind.birth.place)}</div>` : ''}
                ${ind.familySearchId ? `
                    <a href="https://www.familysearch.org/tree/person/details/${ind.familySearchId}" 
                       target="_blank" class="fs-link">🔗 FamilySearch</a>
                ` : ''}
            </div>
        `).join('');
    },
    
    /**
     * Render siblings for a generation
     */
    renderSiblingsList(gen) {
        const container = document.getElementById(`gen-${gen}-siblings`);
        if (!container) return;
        
        // Find the main ancestor for this gen (our direct line)
        const mainAncestor = this.getGenerationAncestors(gen).find(a => 
            a.notes.some(n => n.toLowerCase().includes('direct line') || n.toLowerCase().includes('our direct'))
        ) || this.getGenerationAncestors(gen)[0];
        
        if (!mainAncestor || !mainAncestor.famc) return;
        
        // Get siblings from same family
        const fam = this.gedcom.families[mainAncestor.famc];
        if (!fam) return;
        
        const siblings = fam.children
            .map(id => this.gedcom.individuals[id])
            .filter(sib => sib && sib.id !== mainAncestor.id);
        
        if (siblings.length === 0) return;
        
        container.innerHTML = siblings.map(sib => `
            <div class="sibling-card ${sib.id === mainAncestor.id ? 'direct-line' : ''}">
                <h5>${this.escapeHtml(sib.givenName || sib.name)}</h5>
                <div class="dates">${this.formatYears(sib)}</div>
            </div>
        `).join('');
    },
    
    /**
     * Update timeline points with GEDCOM data
     */
    updateTimeline() {
        // Find specific ancestors for timeline
        const timelinePoints = {
            'oldest': this.findEarliestAncestor(),
            'gen-8': this.getGenerationAncestors(-8)[0],
            'gen-2': this.getGenerationAncestors(-2)[0],
            'gen-1': this.getGenerationAncestors(-1)[0]
        };
        
        for (const [key, ancestor] of Object.entries(timelinePoints)) {
            if (!ancestor) continue;
            
            const point = document.querySelector(`.timeline-point.${key}, .timeline-point[data-gen="${key}"]`);
            if (!point) continue;
            
            const yearEl = point.querySelector('.year');
            const labelEl = point.querySelector('.label');
            
            if (yearEl) {
                const year = this.extractYear(ancestor.birth?.date);
                if (year) yearEl.textContent = year < 1500 ? '~' + year : year;
            }
            
            if (labelEl && ancestor.givenName) {
                labelEl.innerHTML = `${this.escapeHtml(ancestor.givenName)}<br>van Duynhoven`;
            }
        }
    },
    
    /**
     * Find the earliest ancestor
     */
    findEarliestAncestor() {
        const ancestors = this.getAncestors();
        let earliest = null;
        let earliestYear = Infinity;
        
        for (const a of ancestors) {
            const year = this.extractYear(a.birth?.date);
            if (year && year < earliestYear) {
                earliestYear = year;
                earliest = a;
            }
        }
        
        return earliest;
    },
    
    /**
     * Format years display
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
     * Show sync status indicator
     */
    showSyncStatus() {
        const ancestors = this.getAncestors();
        const indicator = document.getElementById('gedcom-sync-status');
        
        if (indicator) {
            indicator.innerHTML = `
                <span class="sync-dot"></span>
                <span class="sync-text">Synced with GEDCOM · ${ancestors.length} ancestors loaded</span>
            `;
            indicator.classList.add('synced');
        }
        
        // Add last updated timestamp
        const timestampEl = document.getElementById('gedcom-timestamp');
        if (timestampEl) {
            timestampEl.textContent = new Date().toLocaleDateString();
        }
    }
};

// Initialize on page load
if (typeof window !== 'undefined') {
    window.AncestorPage = AncestorPage;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AncestorPage.init());
    } else {
        AncestorPage.init();
    }
}
