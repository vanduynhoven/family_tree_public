/**
 * GEDCOM Stats Parser
 * Parses the GEDCOM file and provides live statistics for the family tree website.
 * 
 * Usage: Include this script in any HTML page, then call:
 *   GedcomStats.init('path/to/vanduynhoven_family.ged')
 *     .then(stats => console.log(stats))
 * 
 * Or let it auto-initialize by adding data attributes to your HTML elements.
 */

const GedcomStats = {
    data: null,
    gedcomPath: null,

    /**
     * Initialize the stats parser by loading and parsing the GEDCOM file
     * @param {string} gedcomPath - Path to the GEDCOM file (relative to HTML page)
     */
    async init(gedcomPath) {
        this.gedcomPath = gedcomPath;
        try {
            const response = await fetch(gedcomPath);
            if (!response.ok) {
                console.warn('GedcomStats: Could not load GEDCOM file from', gedcomPath);
                return null;
            }
            const text = await response.text();
            this.data = this.parse(text);
            this.updateAllElements();
            return this.data;
        } catch (error) {
            console.warn('GedcomStats: Error loading GEDCOM:', error);
            return null;
        }
    },

    /**
     * Parse GEDCOM text and extract statistics
     * @param {string} gedcomText - Raw GEDCOM file content
     */
    parse(gedcomText) {
        const lines = gedcomText.split('\n');
        
        const stats = {
            individuals: 0,
            families: 0,
            generations: new Set(),
            minGeneration: 0,
            maxGeneration: 0,
            generationCount: 0,
            earliestYear: 9999,
            latestYear: 0,
            yearSpan: '',
            males: 0,
            females: 0,
            living: 0,
            deceased: 0,
            marriages: 0,
            divorces: 0,
            byGeneration: {},
            emigrations: 0,
            ships: [],
            // Ship-specific info for RMS Queen Elizabeth
            rmsQueenElizabeth: {
                found: false,
                voyageDate: null,
                passengers: []
            }
        };

        let currentRecord = null;
        let currentType = null;
        let currentName = null;

        for (const line of lines) {
            const match = line.match(/^(\d+)\s+(@\w+@|\w+)\s*(.*)$/);
            if (!match) continue;

            const [, level, tag, value] = match;
            const lvl = parseInt(level);

            // New record
            if (lvl === 0) {
                if (tag.startsWith('@I')) {
                    stats.individuals++;
                    currentType = 'INDI';
                    currentRecord = tag;
                    currentName = null;
                } else if (tag.startsWith('@F')) {
                    stats.families++;
                    currentType = 'FAM';
                    currentRecord = tag;
                }
                continue;
            }

            // Individual details
            if (currentType === 'INDI') {
                if (tag === 'SEX') {
                    if (value === 'M') stats.males++;
                    else if (value === 'F') stats.females++;
                }
                
                if (tag === 'NAME') {
                    currentName = value.replace(/\//g, '').trim();
                }
                
                if (tag === 'DEAT') {
                    stats.deceased++;
                }

                if (tag === 'IMMI' || tag === 'EMIG') {
                    stats.emigrations++;
                }

                // Check for ship references
                if (tag === 'NOTE' && value) {
                    if (value.includes('RMS Queen Elizabeth') || value.includes('Queen Elizabeth')) {
                        stats.rmsQueenElizabeth.found = true;
                        if (currentName) {
                            stats.rmsQueenElizabeth.passengers.push(currentName);
                        }
                    }
                    if (value.includes('16 Nov 1950') || value.includes('November 1950')) {
                        stats.rmsQueenElizabeth.voyageDate = 'November 16, 1950';
                    }
                    
                    // Extract generation from NOTE
                    const genMatch = value.match(/Generation\s+(-?\d+)/);
                    if (genMatch) {
                        const gen = parseInt(genMatch[1]);
                        stats.generations.add(gen);
                        stats.byGeneration[gen] = (stats.byGeneration[gen] || 0) + 1;
                    }
                }
            }

            // Family details
            if (currentType === 'FAM') {
                if (tag === 'MARR') {
                    stats.marriages++;
                }
                if (tag === 'DIV') {
                    stats.divorces++;
                }
            }

            // Date extraction for any record
            if (tag === 'DATE' && value) {
                const yearMatch = value.match(/\b(\d{4})\b/);
                if (yearMatch) {
                    const year = parseInt(yearMatch[1]);
                    if (year >= 1400 && year <= 2100) {
                        if (year < stats.earliestYear) stats.earliestYear = year;
                        if (year > stats.latestYear) stats.latestYear = year;
                    }
                }
            }
        }

        // Calculate derived stats
        stats.living = stats.individuals - stats.deceased;
        
        if (stats.generations.size > 0) {
            stats.minGeneration = Math.min(...stats.generations);
            stats.maxGeneration = Math.max(...stats.generations);
            // Total span = from most negative to most positive, inclusive
            stats.generationCount = stats.maxGeneration - stats.minGeneration + 1;
            // Range string like "-11 to 7"
            stats.generationRange = `${stats.minGeneration} to ${stats.maxGeneration}`;
        }

        if (stats.earliestYear < 9999) {
            stats.yearSpan = `~${stats.earliestYear}–Present`;
        }
        
        // Last updated from HEAD commit date (approximated as today)
        stats.lastUpdated = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        return stats;
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
    // Look for a script tag or meta tag with the GEDCOM path
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
