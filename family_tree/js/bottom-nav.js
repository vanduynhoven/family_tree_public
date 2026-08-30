/*
 * Van Duynhoven Family Tree — Collapsible Bottom Navigation Bar
 * Shared across every page. Builds a fixed bottom-centre split button:
 *   - Left side: 🏠 Home link (clicking navigates directly to home)
 *   - Middle: expand/collapse chevron (clicking toggles the nav items)
 *   - Right (when expanded): Generations dropdown button (expands vertically)
 *   - Expanded state shows: Search, Timeline, Tree, Chart, Stories, Sitemap, etc.
 * The expand/collapse preference is stored in localStorage and restored on load.
 * Styling lives in family-tree.css under `.bottom-nav`.
 */
(function () {
  'use strict';

  var NAV_STATE_KEY = 'vdh-bottom-nav-expanded';

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

  /* Nav items shown when expanded (Home is separate as the left split) */
  /* Order: Search, [Generations dropdown inserted here], Timeline, Tree, Chart, Stories, Dutch, Sitemap, Feedback */
  var ITEMS = [
    { href: 'search.html',                      label: 'Search',   icon: '\uD83D\uDD0D' },
    { type: 'generations' }, // Placeholder - generations dropdown inserted here
    { href: 'timeline.html',                    label: 'Timeline', icon: '\uD83D\uDCC5' },
    { href: 'visualizations/tree.html',         label: 'Tree',     icon: '\uD83C\uDF3F' },
    { href: 'visualizations/family_chart.html', label: 'Chart',    icon: '\uD83E\uDD67' },
    { href: 'stories.html',                     label: 'Stories',  icon: '\uD83D\uDCD6' },
    { href: 'learn-dutch.html',                 label: 'Dutch',    icon: '\uD83C\uDDF3\uD83C\uDDF1' },
    { href: 'manifest.html',                    label: 'Sitemap',  icon: '\uD83D\uDDFA' },
    { href: 'feedback.html',                    label: 'Feedback', icon: '\uD83D\uDCAC' }
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

  function isExpanded() {
    try { return localStorage.getItem(NAV_STATE_KEY) === '1'; } catch (e) { return false; }
  }
  function persist(expanded) {
    try { localStorage.setItem(NAV_STATE_KEY, expanded ? '1' : '0'); } catch (e) { /* private mode */ }
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

    var nav = document.createElement('nav');
    nav.id = 'bottom-nav';
    nav.className = 'bottom-nav';
    nav.setAttribute('aria-label', 'Site navigation');

    /* Split button container */
    var splitBtn = document.createElement('div');
    splitBtn.className = 'bn-split';

    /* Left side: Home link (navigates directly) */
    var homeLink = document.createElement('a');
    homeLink.href = root + 'index.html';
    homeLink.className = 'bn-home-link';
    homeLink.innerHTML = '\uD83C\uDFE0 <span class="bn-home-text">Home</span>';
    homeLink.setAttribute('title', 'Go to Home');
    if (here === 'index.html') homeLink.classList.add('active');

    /* Right side: Expand/collapse toggle button */
    var expandBtn = document.createElement('button');
    expandBtn.type = 'button';
    expandBtn.className = 'bn-expand';
    expandBtn.setAttribute('aria-controls', 'bn-items');
    expandBtn.innerHTML = '<span class="bn-chevron" aria-hidden="true">\u25B2</span>';

    splitBtn.appendChild(homeLink);
    splitBtn.appendChild(expandBtn);

    /* Items group (shown when expanded) */
    var group = document.createElement('div');
    group.id = 'bn-items';
    group.className = 'bn-items';

    /* Generations dropdown button (created ahead so we can insert it in position) */
    var genContainer = document.createElement('div');
    genContainer.className = 'bn-gen-container';

    var genBtn = document.createElement('button');
    genBtn.type = 'button';
    genBtn.className = 'bn-gen-btn';
    genBtn.innerHTML = '<span aria-hidden="true">\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67</span> Gens <span class="bn-gen-arrow">\u25B2</span>';
    genBtn.setAttribute('title', 'Select generation');

    var genDropdown = document.createElement('div');
    genDropdown.className = 'bn-gen-dropdown';

    GENERATIONS.forEach(function (gen) {
      var a = document.createElement('a');
      a.href = root + gen.href;
      a.className = 'bn-gen-item';
      a.innerHTML = '<span class="bn-gen-icon">' + gen.icon + '</span>' +
                    '<span class="bn-gen-label">' + gen.label + '</span>' +
                    '<span class="bn-gen-desc">' + gen.desc + '</span>';
      var target = gen.href.substring(gen.href.lastIndexOf('/') + 1).toLowerCase();
      if (target === here) a.classList.add('active');
      genDropdown.appendChild(a);
    });

    genContainer.appendChild(genBtn);
    genContainer.appendChild(genDropdown);

    /* Build nav items in order, inserting generations dropdown at placeholder */
    ITEMS.forEach(function (item) {
      if (item.type === 'generations') {
        group.appendChild(genContainer);
        return;
      }
      var a = document.createElement('a');
      a.href = root + item.href;
      a.innerHTML = '<span aria-hidden="true">' + item.icon + '</span> ' + item.label;
      var target = item.href.substring(item.href.lastIndexOf('/') + 1).toLowerCase();
      if (target === here) a.classList.add('active');
      group.appendChild(a);
    });

    nav.appendChild(splitBtn);
    nav.appendChild(group);

    function setExpanded(expanded, save) {
      nav.classList.toggle('expanded', expanded);
      expandBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      expandBtn.setAttribute('title', expanded ? 'Collapse navigation' : 'Expand navigation');
      if (!expanded) {
        // Close generations dropdown when collapsing nav
        setGenDropdown(false);
      }
      if (save) persist(expanded);
      updateClearance();
    }

    function setGenDropdown(open) {
      genDropdownOpen = open;
      genContainer.classList.toggle('open', open);
      genBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      updateClearance();
    }

    expandBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setExpanded(!nav.classList.contains('expanded'), true);
    });

    genBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setGenDropdown(!genDropdownOpen);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
      if (genDropdownOpen && !genContainer.contains(e.target)) {
        setGenDropdown(false);
      }
    });

    document.body.appendChild(nav);
    // Restore stored preference (default collapsed).
    setExpanded(isExpanded(), false);

    /* Keep the kid-mode toggle clear of the nav by publishing the nav's
       height (+ its offset from the viewport bottom) as a CSS variable. */
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
