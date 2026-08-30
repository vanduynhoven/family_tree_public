/*
 * Van Duynhoven Family Tree — Bottom Navigation Bar
 * ==================================================
 * Expandable/collapsible nav on bottom-left, Kid Mode widget on bottom-right.
 * Dropdowns for Generations and Visualizations expand upward.
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

  /* Generation links */
  var GENERATIONS = [
    { href: 'branches/nl/early_ancestors.html', label: 'Ancestors', icon: '📜', desc: '~1450-1799' },
    { href: 'generation_1_1799/index.html',     label: 'Gen 1',     icon: '1️⃣', desc: '1799' },
    { href: 'generation_2_1829/index.html',     label: 'Gen 2',     icon: '2️⃣', desc: '1829' },
    { href: 'generation_3_1872/index.html',     label: 'Gen 3',     icon: '3️⃣', desc: '1872' },
    { href: 'generation_4_1915/index.html',     label: 'Gen 4',     icon: '4️⃣', desc: '1915' },
    { href: 'generation_5_1951/index.html',     label: 'Gen 5',     icon: '5️⃣', desc: '1951' },
    { href: 'generation_6_1980s/index.html',    label: 'Gen 6',     icon: '6️⃣', desc: '1980s' },
    { href: 'generation_7_2000s/index.html',    label: 'Gen 7',     icon: '7️⃣', desc: '2000s' }
  ];

  /* Visualization links */
  var VISUALIZATIONS = [
    { href: 'timeline.html',                    label: 'Timeline',  icon: '📅', desc: 'Events over time' },
    { href: 'visualizations/tree.html',         label: 'Tree',      icon: '🌿', desc: 'Collapsible tree' },
    { href: 'visualizations/family_chart.html', label: 'Fan Chart', icon: '🥧', desc: 'Radial view' },
    { href: 'game.html',                        label: 'Chronicles', icon: '🎮', desc: 'Time-travel adventure' },
    { href: 'roots.html',                        label: 'Roots Across Time', icon: '🌳', desc: 'New Stardew-style family RPG' }
  ];

  function isExpanded() {
    try { return localStorage.getItem(NAV_STATE_KEY) === '1'; } catch (e) { return false; }
  }
  function persist(expanded) {
    try { localStorage.setItem(NAV_STATE_KEY, expanded ? '1' : '0'); } catch (e) {}
  }

  function isKidModeOn() {
    try { return localStorage.getItem(KID_MODE_KEY) === '1'; } catch (e) { return false; }
  }
  function setKidModeStorage(on) {
    try { localStorage.setItem(KID_MODE_KEY, on ? '1' : '0'); } catch (e) {}
  }

  function currentFile() {
    var p = window.location.pathname;
    var name = p.substring(p.lastIndexOf('/') + 1) || 'index.html';
    return name.toLowerCase();
  }

  function build() {
    if (document.getElementById('bottom-nav')) return;

    var root = computeRoot();
    var here = currentFile();
    var openDropdown = null;

    // ═══════════════════════════════════════════════════════════════
    // Bottom-left: Expandable navigation bar
    // ═══════════════════════════════════════════════════════════════
    var nav = document.createElement('nav');
    nav.id = 'bottom-nav';
    nav.className = 'bottom-nav';

    // Fixed part: Home + Expand toggle
    var fixedPart = document.createElement('div');
    fixedPart.className = 'bn-fixed';

    var homeLink = document.createElement('a');
    homeLink.href = root + 'index.html';
    homeLink.className = 'bn-home';
    homeLink.innerHTML = '🏠';
    homeLink.title = 'Home';
    if (here === 'index.html') homeLink.classList.add('active');

    var expandBtn = document.createElement('button');
    expandBtn.type = 'button';
    expandBtn.className = 'bn-expand';
    expandBtn.innerHTML = '▶';
    expandBtn.title = 'Expand navigation';

    fixedPart.appendChild(homeLink);
    fixedPart.appendChild(expandBtn);

    // Expandable items
    var items = document.createElement('div');
    items.className = 'bn-items';

    // Search
    var searchLink = document.createElement('a');
    searchLink.href = root + 'search.html';
    searchLink.className = 'bn-link';
    searchLink.innerHTML = '🔍 Search';
    if (here === 'search.html') searchLink.classList.add('active');
    items.appendChild(searchLink);

    // Generations dropdown
    var genDrop = createDropdown('gen', 'Generations', '👨‍👩‍👧', GENERATIONS, 'bn-purple', root, here);
    items.appendChild(genDrop.container);

    // Visualizations dropdown
    var vizDrop = createDropdown('viz', 'Visualizations', '🎨', VISUALIZATIONS, 'bn-cyan', root, here);
    items.appendChild(vizDrop.container);

    // Other links
    [
      { href: 'stories.html', label: 'Stories', icon: '📖' },
      { href: 'learn-dutch.html', label: 'Dutch', icon: '🇳🇱' },
      { href: 'manifest.html', label: 'Sitemap', icon: '🗺' },
      { href: 'feedback.html', label: 'Feedback', icon: '💬' }
    ].forEach(function(item) {
      var a = document.createElement('a');
      a.href = root + item.href;
      a.className = 'bn-link';
      a.innerHTML = item.icon + ' ' + item.label;
      if (here === item.href) a.classList.add('active');
      items.appendChild(a);
    });

    nav.appendChild(fixedPart);
    nav.appendChild(items);
    document.body.appendChild(nav);

    // Expand/collapse logic
    function setExpanded(exp, save) {
      nav.classList.toggle('expanded', exp);
      expandBtn.innerHTML = exp ? '◀' : '▶';
      expandBtn.title = exp ? 'Collapse navigation' : 'Expand navigation';
      if (!exp) closeAllDropdowns();
      if (save) persist(exp);
    }

    expandBtn.onclick = function(e) {
      e.stopPropagation();
      setExpanded(!nav.classList.contains('expanded'), true);
    };

    // Dropdown logic
    function closeAllDropdowns() {
      document.querySelectorAll('.bn-dropdown-wrap.open').forEach(function(el) {
        el.classList.remove('open');
      });
      openDropdown = null;
    }

    function toggleDropdown(container) {
      var wasOpen = container.classList.contains('open');
      closeAllDropdowns();
      if (!wasOpen) {
        container.classList.add('open');
        openDropdown = container;
      }
    }

    genDrop.btn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); toggleDropdown(genDrop.container); };
    vizDrop.btn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); toggleDropdown(vizDrop.container); };

    document.addEventListener('click', function(e) {
      if (openDropdown && !openDropdown.contains(e.target)) {
        closeAllDropdowns();
      }
    });

    setExpanded(isExpanded(), false);

    // ═══════════════════════════════════════════════════════════════
    // Bottom-right: Kid Mode widget
    // ═══════════════════════════════════════════════════════════════
    var kidWidget = document.createElement('div');
    kidWidget.id = 'kid-mode-widget';
    kidWidget.className = 'kid-widget';

    var kidBtn = document.createElement('button');
    kidBtn.type = 'button';
    kidBtn.className = 'kw-toggle';
    kidBtn.title = 'Toggle Kid Mode';

    var achBtn = document.createElement('button');
    achBtn.type = 'button';
    achBtn.className = 'kw-ach';
    achBtn.title = 'View Achievements';
    achBtn.innerHTML = '🏅';
    achBtn.style.display = 'none';
    achBtn.onclick = function(e) {
      e.stopPropagation();
      if (window.showAchievementsPopup) window.showAchievementsPopup();
    };

    function syncKidMode() {
      var on = isKidModeOn();
      kidBtn.classList.toggle('on', on);
      kidBtn.innerHTML = on ? '👶 ON' : '👶';
      kidWidget.classList.toggle('active', on);
      document.body.classList.toggle('kid-mode', on);
      achBtn.style.display = on ? 'inline-flex' : 'none';
      document.dispatchEvent(new CustomEvent('kid-mode-changed', { detail: { enabled: on } }));
    }

    kidBtn.onclick = function(e) {
      e.stopPropagation();
      setKidModeStorage(!isKidModeOn());
      syncKidMode();
    };

    kidWidget.appendChild(kidBtn);
    kidWidget.appendChild(achBtn);
    document.body.appendChild(kidWidget);
    syncKidMode();

    // Hide legacy elements
    var legacy = document.querySelector('.kid-mode-container');
    if (legacy) legacy.style.display = 'none';
  }

  function createDropdown(id, label, icon, items, colorClass, root, here) {
    var container = document.createElement('div');
    container.className = 'bn-dropdown-wrap ' + colorClass;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bn-dropdown-btn';
    btn.innerHTML = icon + ' ' + label + ' <span class="arrow">▲</span>';

    var menu = document.createElement('div');
    menu.className = 'bn-dropdown-menu';

    items.forEach(function(item) {
      var a = document.createElement('a');
      a.href = root + item.href;
      a.className = 'bn-dropdown-item';
      a.innerHTML = '<span class="dd-icon">' + item.icon + '</span>' +
                    '<span class="dd-label">' + item.label + '</span>' +
                    '<span class="dd-desc">' + item.desc + '</span>';
      var target = item.href.substring(item.href.lastIndexOf('/') + 1).toLowerCase();
      if (target === here) a.classList.add('active');
      menu.appendChild(a);
    });

    container.appendChild(btn);
    container.appendChild(menu);
    return { container: container, btn: btn };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
