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
            id: 'globe_trotter',
            icon: '🌍',
            title: 'Globe Trotter',
            desc: 'Found family in 3 countries',
            check: function (s) {
                var n = s.countries.length;
                return { earned: n >= 3, progress: Math.min(n, 3), goal: 3 };
            }
        }
    ];

    function defaultState() {
        return { peopleViewed: [], years: [], countries: [], earned: [] };
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
                earned: Array.isArray(parsed.earned) ? parsed.earned : d.earned
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
        paint(el);
    }

    function refreshPanels() {
        panels.forEach(paint);
    }

    function paint(el) {
        var earnedCount = state.earned.length;
        var total = DEFINITIONS.length;

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
            '<div class="vdh-ach-head">' +
            '<h2 class="section-title" style="color:#f39c12;">🏅 Discovery Achievements</h2>' +
            '<span class="vdh-ach-count">' + earnedCount + ' / ' + total + ' unlocked</span>' +
            '</div>' +
            '<p class="vdh-ach-sub">Explore the family tree to earn badges — progress is saved on this device.</p>' +
            '<div class="vdh-ach-grid">' + cards + '</div>' +
            '<button type="button" class="vdh-ach-reset">Reset progress</button>';

        var resetBtn = el.querySelector('.vdh-ach-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', function () { reset(); });
        }
    }

    // ── Auto-wiring: make browsing count ─────────────────────
    function autoScan() {
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

    var api = {
        trackPersonView: trackPersonView,
        trackYear: trackYear,
        trackCountry: trackCountry,
        renderPanel: renderPanel,
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
