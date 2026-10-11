/**
 * GEDCOM Stats
 * Fills every element that has a data-gedcom-stat attribute with a number computed by the shared
 * GEDCOM model (js/gedcom-model.js). This file no longer parses GEDCOM itself.
 *
 * Usage: include this script; it initialises itself on DOMContentLoaded. Or call
 *   GedcomStats.init('path/to/vanduynhoven_family.ged').then(stats => console.log(stats))
 * (the path is only used when the page carries no inline GEDCOM, i.e. in a source checkout).
 */

// The model script sits next to this file; load it if the page did not.
const GEDCOM_STATS_SELF = document.currentScript && document.currentScript.src;

const GedcomStats = {
    data: null,
    model: null,
    gedcomPath: null,

    ensureModel() {
        if (window.GedcomModel) return Promise.resolve(window.GedcomModel);
        return new Promise((resolve, reject) => {
            if (!GEDCOM_STATS_SELF) { reject(new Error('gedcom-model.js is not loaded')); return; }
            const s = document.createElement('script');
            s.src = GEDCOM_STATS_SELF.replace(/gedcom-stats\.js.*$/, 'gedcom-model.js');
            s.onload = () => resolve(window.GedcomModel);
            s.onerror = () => reject(new Error('could not load gedcom-model.js'));
            document.head.appendChild(s);
        });
    },

    /**
     * Load the model (one fetch + one parse per page, shared with the person popups) and fill the page.
     * @param {string} [gedcomPath] - only used when the page has no inline GEDCOM
     */
    async init(gedcomPath) {
        this.gedcomPath = gedcomPath || null;
        try {
            const GM = await this.ensureModel();
            this.model = await GM.load(gedcomPath ? { path: gedcomPath } : {});
            this.data = this.fromModel(this.model);
            this.updateAllElements();
            return this.data;
        } catch (error) {
            console.warn('GedcomStats: Error loading GEDCOM:', error);
            return null;
        }
    },

    /** Statistics in the shape the pages have always used, computed by the model. */
    fromModel(model) {
        const s = model.stats();
        s.generations = new Set(s.generations);
        s.generationRange = `${s.minGeneration} to ${s.maxGeneration}`;
        if (s.earliestYear === null) s.earliestYear = 9999;
        s.yearSpan = s.earliestYear < 9999 ? `~${s.earliestYear}–Present` : '';
        s.lastUpdated = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        return s;
    },

    /**
     * Update all HTML elements with data-gedcom-stat attributes
     */
    updateAllElements() {
        if (!this.data) return;

        // Find all elements with data-gedcom-stat attribute
        document.querySelectorAll('[data-gedcom-stat]').forEach(el => {
            const stat = el.getAttribute('data-gedcom-stat');
            const value = this.getStat(stat);
            if (value !== null && value !== undefined) {
                el.textContent = value;
                el.classList.add('gedcom-loaded');
            }
        });

        // Dispatch event for custom handling
        document.dispatchEvent(new CustomEvent('gedcom-stats-loaded', { detail: this.data }));
    },

    /**
     * Get a specific statistic value
     * @param {string} key - The stat key (e.g., 'individuals', 'families', 'generationCount')
     */
    getStat(key) {
        if (!this.data) return null;

        switch (key) {
            case 'individuals':
            case 'people':
            case 'persons':
                return this.data.individuals;
            case 'families':
            case 'familyUnits':
                return this.data.families;
            case 'generations':
            case 'generationCount':
                return this.data.generationCount;
            case 'earliestYear':
                return this.data.earliestYear < 9999 ? this.data.earliestYear : '~1450';
            case 'latestYear':
                return this.data.latestYear || 'Present';
            case 'yearSpan':
                return this.data.yearSpan;
            case 'generationRange':
                return this.data.generationRange || `${this.data.minGeneration} to ${this.data.maxGeneration}`;
            case 'lastUpdated':
                return this.data.lastUpdated;
            case 'males':
                return this.data.males;
            case 'females':
                return this.data.females;
            case 'living':
                return this.data.living;
            case 'deceased':
                return this.data.deceased;
            case 'marriages':
                return this.data.marriages;
            case 'divorces':
                return this.data.divorces;
            case 'emigrations':
                return this.data.emigrations;
            case 'minGeneration':
                return this.data.minGeneration;
            case 'maxGeneration':
                return this.data.maxGeneration;
            default:
                // Support generation-specific counts like 'gen3', 'gen_3', 'generation-3', 'generation_3'
                const genMatch = key.match(/gen(?:eration)?[_-]?(-?\d+)/i);
                if (genMatch) {
                    const gen = parseInt(genMatch[1]);
                    return this.data.byGeneration[gen] || 0;
                }
                return this.data[key];
        }
    },

    /**
     * Get formatted string for display
     * @param {string} key - The stat key
     * @param {string} format - Format string (e.g., '{value} people')
     */
    getFormatted(key, format) {
        const value = this.getStat(key);
        if (value === null) return '';
        return format.replace('{value}', value);
    }
};

// Auto-initialize if a gedcom path is specified in the page
document.addEventListener('DOMContentLoaded', () => {
    // Built site: the GEDCOM is inlined in the page, no path needed.
    if (window.__GEDCOM__) { GedcomStats.init(); return; }
    // Source checkout: look for a script tag or meta tag with the GEDCOM path
    const gedcomMeta = document.querySelector('meta[name="gedcom-path"]');
    const gedcomScript = document.querySelector('script[data-gedcom-path]');
    
    let path = null;
    if (gedcomMeta) {
        path = gedcomMeta.getAttribute('content');
    } else if (gedcomScript) {
        path = gedcomScript.getAttribute('data-gedcom-path');
    } else {
        // Default path relative to various page locations
        const possiblePaths = [
            'vanduynhoven_family.ged',
            '../vanduynhoven_family.ged',
            '../../vanduynhoven_family.ged',
            '../../../vanduynhoven_family.ged'
        ];
        
        // Try each path
        (async () => {
            for (const p of possiblePaths) {
                try {
                    const response = await fetch(p, { method: 'HEAD' });
                    if (response.ok) {
                        path = p;
                        break;
                    }
                } catch (e) {
                    // Continue to next path
                }
            }
            if (path) {
                GedcomStats.init(path);
            }
        })();
        return;
    }
    
    if (path) {
        GedcomStats.init(path);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GedcomStats;
}
