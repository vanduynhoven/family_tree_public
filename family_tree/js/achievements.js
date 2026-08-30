/**
 * Discovery Achievements / Badges
 * ---------------------------------
 * Tracks exploration of the Van Duynhoven family tree and unlocks badges.
 * Progress persists in localStorage. Earned achievements pop up a toast, and
 * an achievements panel can be rendered on any page (see Achievements.renderPanel).
 *
 * Public API:
 *   Achievements.trackPersonView(id)   – record that a person was viewed (deduped by id)
 *   Achievements.trackYear(year)       – record a discovered year (numbers or "1823" strings)
 *   Achievements.trackCountry(code)    – record a discovered country (e.g. 'NL', 'US')
 *   Achievements.renderPanel(el)       – render/refresh the badge panel into an element
 *   Achievements.reset()               – clear all progress (used by the panel's reset link)
 *
 * The module auto-wires itself on DOMContentLoaded: it scans the page for
 * person badges, country flags, and year mentions so that simply browsing the
 * site makes progress. Individual generation/person pages can also call the
 * track* helpers directly for more precise tracking.
 */
(function (global) {
    'use strict';

    var STORAGE_KEY = 'vdh_achievements_v1';
    var KID_MODE_KEY = 'vdh-kid-mode';

    // Check if Kid Mode is enabled - achievements only work in Kid Mode
    function isKidModeOn() {
        try { return global.localStorage.getItem(KID_MODE_KEY) === '1'; } catch (e) { return false; }
    }

    // Map flag emoji -> country name (used when auto-scanning pages for flags)
    var FLAG_COUNTRIES = {
        '🇳🇱': 'Netherlands',
        '🇺🇸': 'United States',
        '🇨🇦': 'Canada',
        '🇳🇿': 'New Zealand',
        '🇦🇺': 'Australia',
        '🇩🇪': 'Germany',
        '🇧🇪': 'Belgium',
        '🇬🇧': 'United Kingdom',
        '🇮🇪': 'Ireland'
    };

    // Achievement definitions. `check(state)` returns { earned, progress, goal }.
    var DEFINITIONS = [
        // ── Exploration achievements ──
        {
            id: 'explorer',
            icon: '🧭',
            title: 'Explorer',
            desc: 'Viewed 5 people',
            check: function (s) {
                var n = s.peopleViewed.length;
                return { earned: n >= 5, progress: Math.min(n, 5), goal: 5 };
            }
        },
        {
            id: 'adventurer',
            icon: '🎒',
            title: 'Adventurer',
            desc: 'Viewed 15 people',
            check: function (s) {
                var n = s.peopleViewed.length;
                return { earned: n >= 15, progress: Math.min(n, 15), goal: 15 };
            }
        },
        {
            id: 'super_explorer',
            icon: '🦸',
            title: 'Super Explorer',
            desc: 'Viewed 30 people!',
            check: function (s) {
                var n = s.peopleViewed.length;
                return { earned: n >= 30, progress: Math.min(n, 30), goal: 30 };
            }
        },
        
        // ── Time travel achievements ──
        {
            id: 'historian',
            icon: '📜',
            title: 'Historian',
            desc: 'Found someone from the 1800s',
            check: function (s) {
                var hit = s.years.some(function (y) { return y >= 1800 && y <= 1899; });
                return { earned: hit, progress: hit ? 1 : 0, goal: 1 };
            }
        },
        {
            id: 'time_traveler',
            icon: '⏰',
            title: 'Time Traveler',
            desc: 'Found someone from the 1700s',
            check: function (s) {
                var hit = s.years.some(function (y) { return y >= 1700 && y <= 1799; });
                return { earned: hit, progress: hit ? 1 : 0, goal: 1 };
            }
        },
        {
            id: 'ancient_finder',
            icon: '🏛️',
            title: 'Ancient Finder',
            desc: 'Found someone from the 1500s or earlier!',
            check: function (s) {
                var hit = s.years.some(function (y) { return y <= 1599; });
                return { earned: hit, progress: hit ? 1 : 0, goal: 1 };
            }
        },
        {
            id: 'century_hopper',
            icon: '🦘',
            title: 'Century Hopper',
            desc: 'Found people from 4 different centuries',
            check: function (s) {
                var centuries = {};
                s.years.forEach(function (y) { centuries[Math.floor(y / 100)] = true; });
                var n = Object.keys(centuries).length;
                return { earned: n >= 4, progress: Math.min(n, 4), goal: 4 };
            }
        },
        
        // ── Geography achievements ──
        {
            id: 'globe_trotter',
            icon: '🌍',
            title: 'Globe Trotter',
            desc: 'Found family in 3 countries',
            check: function (s) {
                var n = s.countries.length;
                return { earned: n >= 3, progress: Math.min(n, 3), goal: 3 };
            }
        },
        {
            id: 'world_traveler',
            icon: '✈️',
            title: 'World Traveler',
            desc: 'Found family in 5 countries',
            check: function (s) {
                var n = s.countries.length;
                return { earned: n >= 5, progress: Math.min(n, 5), goal: 5 };
            }
        },
        {
            id: 'dutch_roots',
            icon: '🌷',
            title: 'Dutch Roots',
            desc: 'Found family in the Netherlands',
            check: function (s) {
                var hit = s.countries.indexOf('Netherlands') !== -1;
                return { earned: hit, progress: hit ? 1 : 0, goal: 1 };
            }
        },
        {
            id: 'american_dream',
            icon: '🗽',
            title: 'American Dream',
            desc: 'Found family in the United States',
            check: function (s) {
                var hit = s.countries.indexOf('United States') !== -1;
                return { earned: hit, progress: hit ? 1 : 0, goal: 1 };
            }
        },
        
        // ── Story achievements ──
        {
            id: 'story_reader',
            icon: '📖',
            title: 'Story Reader',
            desc: 'Read a family story',
            check: function (s) {
                var hit = s.storiesRead && s.storiesRead.length >= 1;
                return { earned: hit, progress: hit ? 1 : 0, goal: 1 };
            }
        },
        {
            id: 'bookworm',
            icon: '🐛',
            title: 'Bookworm',
            desc: 'Read 5 family stories',
            check: function (s) {
                var n = s.storiesRead ? s.storiesRead.length : 0;
                return { earned: n >= 5, progress: Math.min(n, 5), goal: 5 };
            }
        },
        {
            id: 'master_storyteller',
            icon: '👑',
            title: 'Master Storyteller',
            desc: 'Read 10 family stories!',
            check: function (s) {
                var n = s.storiesRead ? s.storiesRead.length : 0;
                return { earned: n >= 10, progress: Math.min(n, 10), goal: 10 };
            }
        },
        
        // ── Special achievements ──
        {
            id: 'ship_spotter',
            icon: '🚢',
            title: 'Ship Spotter',
            desc: 'Learned about the ocean voyage',
            check: function (s) {
                return { earned: !!s.sawShipStory, progress: s.sawShipStory ? 1 : 0, goal: 1 };
            }
        },
        {
            id: 'family_tree_fan',
            icon: '🌳',
            title: 'Family Tree Fan',
            desc: 'Visited the interactive tree view',
            check: function (s) {
                return { earned: !!s.visitedTree, progress: s.visitedTree ? 1 : 0, goal: 1 };
            }
        },
        {
            id: 'chart_champion',
            icon: '🥧',
            title: 'Chart Champion',
            desc: 'Visited the fan chart',
            check: function (s) {
                return { earned: !!s.visitedChart, progress: s.visitedChart ? 1 : 0, goal: 1 };
            }
        },
        {
            id: 'timeline_tracker',
            icon: '📅',
            title: 'Timeline Tracker',
            desc: 'Visited the interactive timeline',
            check: function (s) {
                return { earned: !!s.visitedTimeline, progress: s.visitedTimeline ? 1 : 0, goal: 1 };
            }
        },
        {
            id: 'generation_jumper',
            icon: '🔢',
            title: 'Generation Jumper',
            desc: 'Visited 5 different generation pages',
            check: function (s) {
                var n = s.generationsVisited ? s.generationsVisited.length : 0;
                return { earned: n >= 5, progress: Math.min(n, 5), goal: 5 };
            }
        },
        {
            id: 'completionist',
            icon: '🏆',
            title: 'Completionist',
            desc: 'Visited all 7 generation pages!',
            check: function (s) {
                var n = s.generationsVisited ? s.generationsVisited.length : 0;
                return { earned: n >= 7, progress: Math.min(n, 7), goal: 7 };
            }
        }
    ];

    function defaultState() {
        return { 
            peopleViewed: [], 
            years: [], 
            countries: [], 
            earned: [],
            storiesRead: [],
            generationsVisited: [],
            sawShipStory: false,
            visitedTree: false,
            visitedChart: false,
            visitedTimeline: false
        };
    }

    function load() {
        try {
            var raw = global.localStorage.getItem(STORAGE_KEY);
            if (!raw) return defaultState();
            var parsed = JSON.parse(raw);
            var d = defaultState();
            return {
                peopleViewed: Array.isArray(parsed.peopleViewed) ? parsed.peopleViewed : d.peopleViewed,
                years: Array.isArray(parsed.years) ? parsed.years : d.years,
                countries: Array.isArray(parsed.countries) ? parsed.countries : d.countries,
                earned: Array.isArray(parsed.earned) ? parsed.earned : d.earned,
                storiesRead: Array.isArray(parsed.storiesRead) ? parsed.storiesRead : d.storiesRead,
                generationsVisited: Array.isArray(parsed.generationsVisited) ? parsed.generationsVisited : d.generationsVisited,
                sawShipStory: !!parsed.sawShipStory,
                visitedTree: !!parsed.visitedTree,
                visitedChart: !!parsed.visitedChart,
                visitedTimeline: !!parsed.visitedTimeline
            };
        } catch (e) {
            return defaultState();
        }
    }

    function save(state) {
        try {
            global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) { /* storage unavailable / full — ignore */ }
    }

    var state = load();

    function addUnique(arr, val) {
        if (val === null || val === undefined || val === '') return false;
        if (arr.indexOf(val) === -1) { arr.push(val); return true; }
        return false;
    }

    // Evaluate all definitions, fire toasts for newly-earned ones, persist, refresh panels.
    function evaluate() {
        var newlyEarned = [];
        DEFINITIONS.forEach(function (def) {
            var res = def.check(state);
            if (res.earned && state.earned.indexOf(def.id) === -1) {
                state.earned.push(def.id);
                newlyEarned.push(def);
            }
        });
        save(state);
        newlyEarned.forEach(showToast);
        refreshPanels();
        return newlyEarned;
    }

    // ── Public tracking helpers ──────────────────────────────
    function trackPersonView(id) {
        if (addUnique(state.peopleViewed, String(id))) { evaluate(); }
    }
    function trackYear(year) {
        var y = parseInt(year, 10);
        if (!isNaN(y) && addUnique(state.years, y)) { evaluate(); }
    }
    function trackCountry(name) {
        if (addUnique(state.countries, name)) { evaluate(); }
    }
    function trackStoryRead(storyId) {
        if (addUnique(state.storiesRead, String(storyId))) { evaluate(); }
    }
    function trackGenerationVisit(gen) {
        if (addUnique(state.generationsVisited, String(gen))) { evaluate(); }
    }
    function trackShipStory() {
        if (!state.sawShipStory) { state.sawShipStory = true; evaluate(); }
    }
    function trackTreeVisit() {
        if (!state.visitedTree) { state.visitedTree = true; evaluate(); }
    }
    function trackChartVisit() {
        if (!state.visitedChart) { state.visitedChart = true; evaluate(); }
    }
    function trackTimelineVisit() {
        if (!state.visitedTimeline) { state.visitedTimeline = true; evaluate(); }
    }

    function reset() {
        state = defaultState();
        save(state);
        refreshPanels();
    }

    // ── Toast popups ─────────────────────────────────────────
    function ensureToastHost() {
        var host = document.getElementById('vdh-ach-toasts');
        if (!host) {
            host = document.createElement('div');
            host.id = 'vdh-ach-toasts';
            document.body.appendChild(host);
        }
        return host;
    }

    function showToast(def) {
        // Only show toasts when Kid Mode is enabled
        if (!isKidModeOn()) return;
        
        var host = ensureToastHost();
        var el = document.createElement('div');
        el.className = 'vdh-ach-toast';
        el.setAttribute('role', 'status');
        el.innerHTML =
            '<div class="vdh-ach-toast-icon">' + def.icon + '</div>' +
            '<div class="vdh-ach-toast-body">' +
            '<div class="vdh-ach-toast-kicker">🏆 Achievement Unlocked!</div>' +
            '<div class="vdh-ach-toast-title">' + def.title + '</div>' +
            '<div class="vdh-ach-toast-desc">' + def.desc + '</div>' +
            '</div>';
        host.appendChild(el);
        // trigger enter animation
        requestAnimationFrame(function () { el.classList.add('show'); });
        setTimeout(function () {
            el.classList.remove('show');
            setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
        }, 4600);
    }

    // ── Panel rendering ──────────────────────────────────────
    var panels = [];

    function renderPanel(el) {
        if (typeof el === 'string') el = document.querySelector(el);
        if (!el) return;
        if (panels.indexOf(el) === -1) panels.push(el);
        
        // Hide panel entirely when Kid Mode is off
        if (!isKidModeOn()) {
            el.style.display = 'none';
            return;
        }
        el.style.display = '';
        paint(el);
    }

    function refreshPanels() {
        panels.forEach(paint);
    }

    function paint(el) {
        var earnedCount = state.earned.length;
        var total = DEFINITIONS.length;
        
        // Check if already collapsed (preserve state on refresh)
        var wasOpen = el.classList.contains('vdh-ach-open');

        var cards = DEFINITIONS.map(function (def) {
            var res = def.check(state);
            var isEarned = res.earned;
            var pct = res.goal ? Math.round((res.progress / res.goal) * 100) : 0;
            return (
                '<div class="vdh-ach-card' + (isEarned ? ' earned' : '') + '">' +
                '<div class="vdh-ach-card-icon">' + def.icon + '</div>' +
                '<div class="vdh-ach-card-main">' +
                '<div class="vdh-ach-card-title">' + def.title +
                (isEarned ? ' <span class="vdh-ach-check">✓</span>' : '') + '</div>' +
                '<div class="vdh-ach-card-desc">' + def.desc + '</div>' +
                '<div class="vdh-ach-bar"><div class="vdh-ach-bar-fill" style="width:' + pct + '%"></div></div>' +
                '<div class="vdh-ach-progress">' + res.progress + ' / ' + res.goal + '</div>' +
                '</div>' +
                '</div>'
            );
        }).join('');

        el.innerHTML =
            '<div class="vdh-ach-header" onclick="Achievements.togglePanel(this.parentElement)">' +
            '<div class="vdh-ach-header-left">' +
            '<span class="vdh-ach-toggle-icon">▶</span>' +
            '<h2 class="section-title" style="color:#f39c12; margin:0; display:inline;">🏅 Discovery Achievements</h2>' +
            '</div>' +
            '<span class="vdh-ach-count">' + earnedCount + ' / ' + total + ' unlocked</span>' +
            '</div>' +
            '<div class="vdh-ach-content">' +
            '<p class="vdh-ach-sub">Explore the family tree to earn badges — progress is saved on this device.</p>' +
            '<div class="vdh-ach-grid">' + cards + '</div>' +
            '<button type="button" class="vdh-ach-reset">Reset progress</button>' +
            '</div>';
        
        // Restore open state if it was open before refresh
        if (wasOpen) {
            el.classList.add('vdh-ach-open');
        }

        var resetBtn = el.querySelector('.vdh-ach-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', function () { reset(); });
        }
    }

    // ── Auto-wiring: make browsing count ─────────────────────
    function autoScan() {
        // Only track achievements when Kid Mode is enabled
        if (!isKidModeOn()) return;
        
        var path = global.location.pathname;
        
        // Track page type visits
        if (path.indexOf('/visualizations/tree') !== -1) {
            trackTreeVisit();
        }
        if (path.indexOf('/visualizations/family_chart') !== -1 || path.indexOf('/family_chart') !== -1) {
            trackChartVisit();
        }
        if (path.indexOf('/timeline') !== -1) {
            trackTimelineVisit();
        }
        
        // Track generation page visits
        var genMatch = path.match(/generation_(\d+)/);
        if (genMatch) {
            trackGenerationVisit(genMatch[1]);
        }
        // Also track gen 0 (ancestors)
        if (path.indexOf('generation_0') !== -1 || path.indexOf('early_ancestors') !== -1) {
            trackGenerationVisit('0');
        }
        
        // Track stories page interactions
        if (path.indexOf('/stories') !== -1) {
            // Wire up story card clicks
            setTimeout(function() {
                var storyCards = document.querySelectorAll('.story-card');
                storyCards.forEach(function(card, i) {
                    card.addEventListener('click', function() {
                        var title = card.querySelector('h3');
                        var storyId = title ? title.textContent.trim() : ('story-' + i);
                        trackStoryRead(storyId);
                        // Check for ship story
                        if (storyId.toLowerCase().indexOf('ocean') !== -1 || 
                            storyId.toLowerCase().indexOf('ship') !== -1 ||
                            storyId.toLowerCase().indexOf('crossing') !== -1) {
                            trackShipStory();
                        }
                    });
                });
            }, 100);
        }
        
        // 1) Person badges — clicking (or their presence) counts as viewing a person.
        //    On the index, .badge / .people-list span elements represent people.
        var personEls = document.querySelectorAll('.people-list .badge, [data-person-id]');
        personEls.forEach(function (node, i) {
            var id = node.getAttribute('data-person-id') || ('badge:' + (node.textContent || '').trim() || 'p' + i);
            node.style.cursor = node.style.cursor || 'pointer';
            node.addEventListener('click', function () { trackPersonView(id); });
        });

        // 2) Country flags anywhere on the page.
        var flags = Object.keys(FLAG_COUNTRIES);
        var bodyText = document.body ? document.body.innerText : '';
        flags.forEach(function (flag) {
            if (bodyText.indexOf(flag) !== -1) { trackCountry(FLAG_COUNTRIES[flag]); }
        });

        // 3) Years — scan visible year mentions (4-digit 1400–2099).
        var yearRe = /\b(1[4-9]\d{2}|20\d{2})\b/g;
        var m;
        var seen = {};
        while ((m = yearRe.exec(bodyText)) !== null) {
            var y = parseInt(m[1], 10);
            if (!seen[y]) { seen[y] = true; state.years.indexOf(y) === -1 && state.years.push(y); }
        }

        // 4) When live GEDCOM stats arrive, fold in earliest year too.
        document.addEventListener('gedcom-stats-loaded', function (ev) {
            if (ev.detail && ev.detail.earliestYear && ev.detail.earliestYear < 9999) {
                trackYear(ev.detail.earliestYear);
            }
        });

        evaluate();
    }

    function togglePanel(el) {
        if (el) el.classList.toggle('vdh-ach-open');
    }

    var api = {
        trackPersonView: trackPersonView,
        trackYear: trackYear,
        trackCountry: trackCountry,
        trackStoryRead: trackStoryRead,
        trackGenerationVisit: trackGenerationVisit,
        trackShipStory: trackShipStory,
        trackTreeVisit: trackTreeVisit,
        trackChartVisit: trackChartVisit,
        trackTimelineVisit: trackTimelineVisit,
        renderPanel: renderPanel,
        togglePanel: togglePanel,
        reset: reset,
        getState: function () { return JSON.parse(JSON.stringify(state)); },
        definitions: DEFINITIONS
    };
    global.Achievements = api;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            autoScan();
            var panel = document.getElementById('achievements-panel');
            if (panel) renderPanel(panel);
        });
    } else {
        autoScan();
        var panel0 = document.getElementById('achievements-panel');
        if (panel0) renderPanel(panel0);
    }

})(window);
