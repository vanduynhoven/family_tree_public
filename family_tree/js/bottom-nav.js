/*
 * Van Duynhoven Family Tree — Bottom Navigation Bar
 * ==================================================
 * Shared across every page. Builds a fixed bottom-left navigation system:
 *   - Home button (always visible)
 *   - Kid Mode toggle (always visible)
 *   - Expand toggle to show/hide nav items
 *   - Dropdowns for Generations and Visualizations (expand upward)
 *
 * Kid Mode and Home button are abstracted here for site-wide consistency.
 * Styling lives in family-tree.css under `.bottom-nav`.
 */
(function () {
  'use strict';

  var NAV_STATE_KEY = 'vdh-bottom-nav-expanded';
  var KID_MODE_KEY = 'vdh-kid-mode';

  function computeRoot() {
    var depth = 0;
    if (window.GEDCOM_PATH) {
      depth = String(window.GEDCOM_PATH).split('/').filter(function (p) { return p === '..'; }).length;
    } else {
      var path = window.location.pathname;
      var m = path.match(/\/family_tree\/(.+)/);
      if (m) {
        depth = (m[1].match(/\//g) || []).length;
      }
    }
    return depth === 0 ? './' : new Array(depth + 1).join('../');
  }

  /* Nav items shown when expanded */
  /* Order: Search, Generations (dropdown), Visualizations (dropdown), Stories, Dutch, Sitemap, Feedback */
  var ITEMS = [
    { href: 'search.html',      label: 'Search',   icon: '\uD83D\uDD0D' },
    { type: 'generations' },    // Dropdown placeholder
    { type: 'visualizations' }, // Dropdown placeholder
    { href: 'stories.html',     label: 'Stories',  icon: '\uD83D\uDCD6' },
    { href: 'learn-dutch.html', label: 'Dutch',    icon: '\uD83C\uDDF3\uD83C\uDDF1' },
    { href: 'manifest.html',    label: 'Sitemap',  icon: '\uD83D\uDDFA' },
    { href: 'feedback.html',    label: 'Feedback', icon: '\uD83D\uDCAC' }
  ];

  /* Generation links */
  var GENERATIONS = [
    { href: 'branches/nl/early_ancestors.html', label: 'Ancestors', icon: '\uD83D\uDCDC', desc: '~1450-1799' },
    { href: 'generation_1_1799/index.html',     label: 'Gen 1',     icon: '1\uFE0F\u20E3', desc: '1799' },
    { href: 'generation_2_1829/index.html',     label: 'Gen 2',     icon: '2\uFE0F\u20E3', desc: '1829' },
    { href: 'generation_3_1872/index.html',     label: 'Gen 3',     icon: '3\uFE0F\u20E3', desc: '1872' },
    { href: 'generation_4_1915/index.html',     label: 'Gen 4',     icon: '4\uFE0F\u20E3', desc: '1915' },
    { href: 'generation_5_1951/index.html',     label: 'Gen 5',     icon: '5\uFE0F\u20E3', desc: '1951' },
    { href: 'generation_6_1980s/index.html',    label: 'Gen 6',     icon: '6\uFE0F\u20E3', desc: '1980s' },
    { href: 'generation_7_2000s/index.html',    label: 'Gen 7',     icon: '7\uFE0F\u20E3', desc: '2000s' }
  ];

  /* Visualization links */
  var VISUALIZATIONS = [
    { href: 'timeline.html',                    label: 'Timeline', icon: '\uD83D\uDCC5', desc: 'Events over time' },
    { href: 'visualizations/tree.html',         label: 'Tree',     icon: '\uD83C\uDF3F', desc: 'Collapsible tree' },
    { href: 'visualizations/family_chart.html', label: 'Fan Chart',icon: '\uD83E\uDD67', desc: 'Radial view' }
  ];

  function isExpanded() {
    try { return localStorage.getItem(NAV_STATE_KEY) === '1'; } catch (e) { return false; }
  }
  function persist(expanded) {
    try { localStorage.setItem(NAV_STATE_KEY, expanded ? '1' : '0'); } catch (e) { /* private mode */ }
  }

  function isKidModeOn() {
    try { return localStorage.getItem(KID_MODE_KEY) === '1'; } catch (e) { return false; }
  }
  function setKidModeStorage(on) {
    try { localStorage.setItem(KID_MODE_KEY, on ? '1' : '0'); } catch (e) { /* private mode */ }
  }

  /* Which item (if any) matches the current page, so we can mark it active. */
  function currentFile() {
    var p = window.location.pathname;
    var name = p.substring(p.lastIndexOf('/') + 1) || 'index.html';
    return name.toLowerCase();
  }

  function build() {
    if (document.getElementById('bottom-nav')) return;

    var root = computeRoot();
    var here = currentFile();
    var genDropdownOpen = false;
    var vizDropdownOpen = false;

    var nav = document.createElement('nav');
    nav.id = 'bottom-nav';
    nav.className = 'bottom-nav';
    nav.setAttribute('aria-label', 'Site navigation');

    /* ─── Fixed buttons (always visible): Home + Info ─── */
    var fixedBtns = document.createElement('div');
    fixedBtns.className = 'bn-fixed';

    /* Home link */
    var homeLink = document.createElement('a');
    homeLink.href = root + 'index.html';
    homeLink.className = 'bn-home-link';
    homeLink.innerHTML = '\uD83C\uDFE0';
    homeLink.setAttribute('title', 'Home');
    if (here === 'index.html') homeLink.classList.add('active');
    
    /* Info/Footer button */
    var infoBtn = document.createElement('button');
    infoBtn.type = 'button';
    infoBtn.className = 'bn-info-btn';
    infoBtn.innerHTML = '\u2139\uFE0F';
    infoBtn.setAttribute('title', 'Site info & sources');
    infoBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      showInfoPopup();
    });
    
    function showInfoPopup() {
      var existing = document.getElementById('bn-info-popup');
      if (existing) {
        existing.classList.toggle('open');
        return;
      }
      
      var popup = document.createElement('div');
      popup.id = 'bn-info-popup';
      popup.className = 'bn-info-popup open';
      
      popup.innerHTML = 
        '<button class="bn-popup-close">\u00D7</button>' +
        '<div class="bn-info-content">' +
        '<h3>\uD83C\uDF33 Van Duynhoven Family Tree</h3>' +
        '<p class="bn-info-sources">Compiled from family documents, FamilySearch, Open Archieven (BHIC), MyHeritage, FindAGrave & Dutch archives</p>' +
        '<p class="bn-info-stats">' +
        '<span data-gedcom-stat="individuals">200</span> individuals · ' +
        '<span data-gedcom-stat="generationCount">17</span> generations · ' +
        '~<span data-gedcom-stat="earliestYear">1450</span>–present' +
        '</p>' +
        '<p class="bn-info-updated">Last updated: August 2026</p>' +
        '<div class="bn-info-links">' +
        '<a href="' + root + 'feedback.html">\uD83D\uDCAC Feedback</a>' +
        '<a href="' + root + 'manifest.html">\uD83D\uDDFA Sitemap</a>' +
        '</div>' +
        '</div>';
      
      document.body.appendChild(popup);
      
      popup.querySelector('.bn-popup-close').addEventListener('click', function() {
        popup.classList.remove('open');
      });
      
      popup.addEventListener('click', function(e) {
        if (e.target === popup) popup.classList.remove('open');
      });
    }

    /* Expand toggle */
    var expandBtn = document.createElement('button');
    expandBtn.type = 'button';
    expandBtn.className = 'bn-expand';
    expandBtn.setAttribute('aria-controls', 'bn-items');
    expandBtn.innerHTML = '<span class="bn-chevron" aria-hidden="true">\u25B6</span>';

    fixedBtns.appendChild(homeLink);
    fixedBtns.appendChild(infoBtn);
    fixedBtns.appendChild(expandBtn);

    /* ═══════════════════════════════════════════════════════════════════
       Kid Mode widget (separate, bottom-right)
       ═══════════════════════════════════════════════════════════════════ */
    var kidWidget = document.createElement('div');
    kidWidget.id = 'kid-mode-widget';
    kidWidget.className = 'kid-mode-widget';
    
    /* Kid Mode toggle */
    var kidBtn = document.createElement('button');
    kidBtn.type = 'button';
    kidBtn.className = 'kmw-toggle';
    kidBtn.setAttribute('title', 'Toggle Kid Mode');
    
    /* Achievements button (only visible when Kid Mode is ON) */
    var achBtn = document.createElement('button');
    achBtn.type = 'button';
    achBtn.className = 'kmw-ach';
    achBtn.setAttribute('title', 'View Achievements');
    achBtn.innerHTML = '\uD83C\uDFC5';
    achBtn.style.display = 'none';
    achBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (window.showAchievementsPopup) {
        window.showAchievementsPopup();
      }
    });
    
    function syncKidMode() {
      var on = isKidModeOn();
      kidBtn.classList.toggle('on', on);
      kidBtn.innerHTML = on ? '\uD83D\uDC76 ON' : '\uD83D\uDC76';
      kidWidget.classList.toggle('active', on);
      document.body.classList.toggle('kid-mode', on);
      achBtn.style.display = on ? 'inline-flex' : 'none';
      // Fire event for achievements and other listeners
      document.dispatchEvent(new CustomEvent('kid-mode-changed', { detail: { enabled: on } }));
    }
    
    kidBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setKidModeStorage(!isKidModeOn());
      syncKidMode();
    });
    
    kidWidget.appendChild(kidBtn);
    kidWidget.appendChild(achBtn);
    document.body.appendChild(kidWidget);

    /* ─── Items group (shown when expanded) ─── */
    var group = document.createElement('div');
    group.id = 'bn-items';
    group.className = 'bn-items';

    /* Helper: create a dropdown container */
    function createDropdown(id, btnLabel, btnIcon, items, colorClass) {
      var container = document.createElement('div');
      container.className = 'bn-dropdown-container ' + (colorClass || '');
      container.dataset.dropdown = id;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bn-dropdown-btn';
      btn.innerHTML = '<span aria-hidden="true">' + btnIcon + '</span> ' + btnLabel + ' <span class="bn-dd-arrow">\u25B2</span>';
      btn.setAttribute('title', 'Show ' + btnLabel.toLowerCase());

      var dropdown = document.createElement('div');
      dropdown.className = 'bn-dropdown';

      items.forEach(function (item) {
        var a = document.createElement('a');
        a.href = root + item.href;
        a.className = 'bn-dropdown-item';
        a.innerHTML = '<span class="bn-dd-icon">' + item.icon + '</span>' +
                      '<span class="bn-dd-label">' + item.label + '</span>' +
                      '<span class="bn-dd-desc">' + item.desc + '</span>';
        var target = item.href.substring(item.href.lastIndexOf('/') + 1).toLowerCase();
        if (target === here) a.classList.add('active');
        dropdown.appendChild(a);
      });

      container.appendChild(btn);
      container.appendChild(dropdown);
      return { container: container, btn: btn };
    }

    /* Build nav items */
    var genDropdown = createDropdown('generations', 'Generations', '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67', GENERATIONS, 'bn-purple');
    var vizDropdown = createDropdown('visualizations', 'Visualizations', '\uD83C\uDFA8', VISUALIZATIONS, 'bn-cyan');

    ITEMS.forEach(function (item) {
      if (item.type === 'generations') {
        group.appendChild(genDropdown.container);
        return;
      }
      if (item.type === 'visualizations') {
        group.appendChild(vizDropdown.container);
        return;
      }
      var a = document.createElement('a');
      a.href = root + item.href;
      a.innerHTML = '<span aria-hidden="true">' + item.icon + '</span> ' + item.label;
      var target = item.href.substring(item.href.lastIndexOf('/') + 1).toLowerCase();
      if (target === here) a.classList.add('active');
      group.appendChild(a);
    });

    nav.appendChild(fixedBtns);
    nav.appendChild(group);

    /* ─── State management ─── */
    function closeAllDropdowns() {
      genDropdownOpen = false;
      vizDropdownOpen = false;
      genDropdown.container.classList.remove('open');
      vizDropdown.container.classList.remove('open');
    }

    function setExpanded(expanded, save) {
      nav.classList.toggle('expanded', expanded);
      expandBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      expandBtn.setAttribute('title', expanded ? 'Collapse navigation' : 'Expand navigation');
      if (!expanded) closeAllDropdowns();
      if (save) persist(expanded);
      updateClearance();
    }

    function toggleDropdown(which) {
      if (which === 'generations') {
        genDropdownOpen = !genDropdownOpen;
        vizDropdownOpen = false;
        genDropdown.container.classList.toggle('open', genDropdownOpen);
        vizDropdown.container.classList.remove('open');
      } else {
        vizDropdownOpen = !vizDropdownOpen;
        genDropdownOpen = false;
        vizDropdown.container.classList.toggle('open', vizDropdownOpen);
        genDropdown.container.classList.remove('open');
      }
      updateClearance();
    }

    expandBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setExpanded(!nav.classList.contains('expanded'), true);
    });

    genDropdown.btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown('generations');
    });

    vizDropdown.btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown('visualizations');
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function (e) {
      if ((genDropdownOpen || vizDropdownOpen) && !group.contains(e.target)) {
        closeAllDropdowns();
        updateClearance();
      }
    });

    document.body.appendChild(nav);

    // Initialize states
    setExpanded(isExpanded(), false);
    syncKidMode();

    /* ─── Clearance for other fixed elements ─── */
    function updateClearance() {
      requestAnimationFrame(function () {
        var rect = nav.getBoundingClientRect();
        var fromBottom = window.innerHeight - rect.top;
        var clearance = Math.max(58, Math.round(fromBottom) + 8);
        document.documentElement.style.setProperty('--bottom-nav-clearance', clearance + 'px');
      });
    }
    window.addEventListener('resize', updateClearance);
    updateClearance();

    // Hide the legacy kid-mode-container if it exists (now handled by bottom-nav)
    var legacyKidMode = document.querySelector('.kid-mode-container:not(.bn-kid-btn)');
    if (legacyKidMode) legacyKidMode.style.display = 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
