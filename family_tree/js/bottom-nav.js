/*
 * Van Duynhoven Family Tree — Collapsible Bottom Navigation Bar
 * Shared across every page. Builds a fixed bottom-centre pill that:
 *   1) Collapsed: shows only a 🏠 Home button with an expand chevron.
 *   2) Expanded: reveals Search, Timeline, Tree, Chart, Stories, Sitemap, Feedback.
 * The expand/collapse preference is stored in localStorage and restored on load.
 * Styling lives in family-tree.css under `.bottom-nav`.
 *
 * Root-path resolution mirrors gedcom-lookup.js: derive depth from
 * window.GEDCOM_PATH (count of '..' segments) with a window.location.pathname
 * fallback, so links resolve from any subdirectory even if this IIFE runs
 * before GEDCOM_PATH is set (it then uses the pathname fallback).
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

  /* Nav items in expanded order. `home` is rendered separately as the toggle. */
  var ITEMS = [
    { href: 'index.html',                       label: 'Home',     icon: '\uD83C\uDFE0' },
    { href: 'search.html',                      label: 'Search',   icon: '\uD83D\uDD0D' },
    { href: 'timeline.html',                    label: 'Timeline', icon: '\uD83D\uDCC5' },
    { href: 'visualizations/tree.html',         label: 'Tree',     icon: '\uD83C\uDF3F' },
    { href: 'visualizations/family_chart.html', label: 'Chart',    icon: '\uD83E\uDD67' },
    { href: 'stories.html',                     label: 'Stories',  icon: '\uD83D\uDCD6' },
    { href: 'manifest.html',                    label: 'Sitemap',  icon: '\uD83D\uDDFA' },
    { href: 'feedback.html',                    label: 'Feedback', icon: '\uD83D\uDCAC' }
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

    var nav = document.createElement('nav');
    nav.id = 'bottom-nav';
    nav.className = 'bottom-nav';
    nav.setAttribute('aria-label', 'Site navigation');

    /* Home / toggle button */
    var home = document.createElement('button');
    home.type = 'button';
    home.className = 'bn-home';
    home.setAttribute('aria-controls', 'bn-items');
    home.innerHTML = '\uD83C\uDFE0 Home <span class="bn-chevron" aria-hidden="true">\u25B2</span>';

    /* Items group */
    var group = document.createElement('div');
    group.id = 'bn-items';
    group.className = 'bn-items';

    ITEMS.forEach(function (item) {
      // Skip the Home duplicate inside the expanded group — the toggle IS home.
      if (item.href === 'index.html') return;
      var a = document.createElement('a');
      a.href = root + item.href;
      a.innerHTML = '<span aria-hidden="true">' + item.icon + '</span>' + item.label;
      // active detection: match trailing filename (handles nested viz pages too)
      var target = item.href.substring(item.href.lastIndexOf('/') + 1).toLowerCase();
      if (target === here) a.classList.add('active');
      group.appendChild(a);
    });

    nav.appendChild(home);
    nav.appendChild(group);

    function setExpanded(expanded, save) {
      nav.classList.toggle('expanded', expanded);
      home.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      home.setAttribute('title', expanded ? 'Collapse navigation' : 'Expand navigation');
      if (save) persist(expanded);
      updateClearance();
    }

    home.addEventListener('click', function () {
      setExpanded(!nav.classList.contains('expanded'), true);
    });

    document.body.appendChild(nav);
    // Restore stored preference (default collapsed).
    setExpanded(isExpanded(), false);

    /* Keep the kid-mode toggle clear of the nav by publishing the nav's
       height (+ its offset from the viewport bottom) as a CSS variable. */
    function updateClearance() {
      // Defer to next frame so post-transition height is accurate enough.
      requestAnimationFrame(function () {
        var rect = nav.getBoundingClientRect();
        var fromBottom = window.innerHeight - rect.top; // px from viewport bottom to nav top
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
