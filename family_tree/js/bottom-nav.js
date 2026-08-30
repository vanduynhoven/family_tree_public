/*
 * Van Duynhoven Family Tree — Site Footer Navigation
 * ===================================================
 * Creates a fixed site footer with full-width navigation bar.
 * - Left side: Home, Info, and all nav links (Search, Generations, Visualizations, etc.)
 * - Right side: Kid Mode toggle with Achievements
 * - Generations and Visualizations have dropdown menus that expand upward
 */
(function () {
  'use strict';

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
    { href: 'visualizations/family_chart.html', label: 'Fan Chart', icon: '🥧', desc: 'Radial view' }
  ];

  function isKidModeOn() {
    try { return localStorage.getItem(KID_MODE_KEY) === '1'; } catch (e) { return false; }
  }
  function setKidModeStorage(on) {
    try { localStorage.setItem(KID_MODE_KEY, on ? '1' : '0'); } catch (e) { /* private mode */ }
  }

  function currentFile() {
    var p = window.location.pathname;
    var name = p.substring(p.lastIndexOf('/') + 1) || 'index.html';
    return name.toLowerCase();
  }

  function build() {
    if (document.getElementById('site-footer-nav')) return;

    var root = computeRoot();
    var here = currentFile();

    // Create the footer container
    var footer = document.createElement('footer');
    footer.id = 'site-footer-nav';
    footer.className = 'site-footer-nav';

    // Left section: nav links
    var navLeft = document.createElement('nav');
    navLeft.className = 'sfn-left';
    navLeft.setAttribute('aria-label', 'Site navigation');

    // Home link
    var homeLink = document.createElement('a');
    homeLink.href = root + 'index.html';
    homeLink.className = 'sfn-link sfn-home';
    homeLink.innerHTML = '🏠 <span>Home</span>';
    if (here === 'index.html') homeLink.classList.add('active');
    navLeft.appendChild(homeLink);

    // Search link
    var searchLink = document.createElement('a');
    searchLink.href = root + 'search.html';
    searchLink.className = 'sfn-link';
    searchLink.innerHTML = '🔍 <span>Search</span>';
    if (here === 'search.html') searchLink.classList.add('active');
    navLeft.appendChild(searchLink);

    // Generations dropdown
    var genDrop = createDropdown('generations', 'Generations', '👨‍👩‍👧', GENERATIONS, 'sfn-purple', root, here);
    navLeft.appendChild(genDrop.container);

    // Visualizations dropdown
    var vizDrop = createDropdown('visualizations', 'Visualizations', '🎨', VISUALIZATIONS, 'sfn-cyan', root, here);
    navLeft.appendChild(vizDrop.container);

    // Stories link
    var storiesLink = document.createElement('a');
    storiesLink.href = root + 'stories.html';
    storiesLink.className = 'sfn-link';
    storiesLink.innerHTML = '📖 <span>Stories</span>';
    if (here === 'stories.html') storiesLink.classList.add('active');
    navLeft.appendChild(storiesLink);

    // Dutch link
    var dutchLink = document.createElement('a');
    dutchLink.href = root + 'learn-dutch.html';
    dutchLink.className = 'sfn-link';
    dutchLink.innerHTML = '🇳🇱 <span>Dutch</span>';
    if (here === 'learn-dutch.html') dutchLink.classList.add('active');
    navLeft.appendChild(dutchLink);

    // Sitemap link
    var sitemapLink = document.createElement('a');
    sitemapLink.href = root + 'manifest.html';
    sitemapLink.className = 'sfn-link';
    sitemapLink.innerHTML = '🗺 <span>Sitemap</span>';
    if (here === 'manifest.html') sitemapLink.classList.add('active');
    navLeft.appendChild(sitemapLink);

    // Feedback link
    var feedbackLink = document.createElement('a');
    feedbackLink.href = root + 'feedback.html';
    feedbackLink.className = 'sfn-link';
    feedbackLink.innerHTML = '💬 <span>Feedback</span>';
    if (here === 'feedback.html') feedbackLink.classList.add('active');
    navLeft.appendChild(feedbackLink);

    // Info button
    var infoBtn = document.createElement('button');
    infoBtn.type = 'button';
    infoBtn.className = 'sfn-link sfn-info';
    infoBtn.innerHTML = 'ℹ️ <span>Info</span>';
    infoBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      showInfoPopup(root);
    });
    navLeft.appendChild(infoBtn);

    // Right section: Kid Mode
    var navRight = document.createElement('div');
    navRight.className = 'sfn-right';

    // Kid Mode toggle
    var kidBtn = document.createElement('button');
    kidBtn.type = 'button';
    kidBtn.className = 'sfn-kid-btn';
    kidBtn.setAttribute('title', 'Toggle Kid Mode');

    // Achievements button
    var achBtn = document.createElement('button');
    achBtn.type = 'button';
    achBtn.className = 'sfn-ach-btn';
    achBtn.setAttribute('title', 'View Achievements');
    achBtn.innerHTML = '🏅';
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
      kidBtn.innerHTML = on ? '👶 <span>Kid Mode ON</span>' : '👶 <span>Kid Mode</span>';
      document.body.classList.toggle('kid-mode', on);
      achBtn.style.display = on ? 'inline-flex' : 'none';
      document.dispatchEvent(new CustomEvent('kid-mode-changed', { detail: { enabled: on } }));
    }

    kidBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      setKidModeStorage(!isKidModeOn());
      syncKidMode();
    });

    navRight.appendChild(kidBtn);
    navRight.appendChild(achBtn);

    footer.appendChild(navLeft);
    footer.appendChild(navRight);
    document.body.appendChild(footer);

    // Initialize Kid Mode state
    syncKidMode();

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      if (!footer.contains(e.target)) {
        closeAllDropdowns();
      }
    });

    // Hide legacy elements
    var legacyKidMode = document.querySelector('.kid-mode-container');
    if (legacyKidMode) legacyKidMode.style.display = 'none';
    var legacyNav = document.querySelector('.bottom-nav:not(.site-footer-nav)');
    if (legacyNav) legacyNav.style.display = 'none';

    // Track open dropdowns
    var openDropdown = null;

    function closeAllDropdowns() {
      document.querySelectorAll('.sfn-dropdown-container.open').forEach(function(el) {
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

    // Wire up dropdown buttons
    genDrop.btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown(genDrop.container);
    });

    vizDrop.btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown(vizDrop.container);
    });
  }

  function createDropdown(id, label, icon, items, colorClass, root, here) {
    var container = document.createElement('div');
    container.className = 'sfn-dropdown-container ' + (colorClass || '');
    container.dataset.dropdown = id;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sfn-link sfn-dropdown-btn';
    btn.innerHTML = icon + ' <span>' + label + '</span> <span class="sfn-arrow">▲</span>';

    var menu = document.createElement('div');
    menu.className = 'sfn-dropdown-menu';

    items.forEach(function(item) {
      var a = document.createElement('a');
      a.href = root + item.href;
      a.className = 'sfn-dropdown-item';
      a.innerHTML = '<span class="sfn-item-icon">' + item.icon + '</span>' +
                    '<span class="sfn-item-label">' + item.label + '</span>' +
                    '<span class="sfn-item-desc">' + item.desc + '</span>';
      var target = item.href.substring(item.href.lastIndexOf('/') + 1).toLowerCase();
      if (target === here) a.classList.add('active');
      menu.appendChild(a);
    });

    container.appendChild(btn);
    container.appendChild(menu);

    return { container: container, btn: btn, menu: menu };
  }

  function showInfoPopup(root) {
    var existing = document.getElementById('sfn-info-popup');
    if (existing) {
      existing.classList.toggle('open');
      return;
    }

    var popup = document.createElement('div');
    popup.id = 'sfn-info-popup';
    popup.className = 'sfn-info-popup open';

    popup.innerHTML =
      '<button class="sfn-popup-close">×</button>' +
      '<div class="sfn-info-content">' +
      '<h3>🌳 Van Duynhoven Family Tree</h3>' +
      '<p class="sfn-info-sources">Compiled from family documents, FamilySearch, Open Archieven (BHIC), MyHeritage, FindAGrave & Dutch archives</p>' +
      '<p class="sfn-info-stats">' +
      '<span data-gedcom-stat="individuals">200</span> individuals · ' +
      '<span data-gedcom-stat="generationCount">17</span> generations · ' +
      '~<span data-gedcom-stat="earliestYear">1450</span>–present' +
      '</p>' +
      '<p class="sfn-info-updated">Last updated: August 2026</p>' +
      '</div>';

    document.body.appendChild(popup);

    popup.querySelector('.sfn-popup-close').addEventListener('click', function() {
      popup.classList.remove('open');
    });

    popup.addEventListener('click', function(e) {
      if (e.target === popup) popup.classList.remove('open');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
