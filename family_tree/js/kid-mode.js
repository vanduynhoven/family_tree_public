/*
 * Van Duynhoven Family Tree — Kid Mode
 * Shared across every page. Adds a "👶 Kid Mode" toggle that:
 *   1) increases font sizes (via body.kid-mode CSS in family-tree.css)
 *   2) sprinkles in more emojis on section titles / headings
 *   3) wraps hard vocabulary words with hover tooltips ("emigrated" -> "moved to another country")
 *   4) simplifies complex terms
 * Preference is stored in localStorage under KID_MODE_KEY and restored on load.
 */
(function () {
  'use strict';

  var KID_MODE_KEY = 'vdh-kid-mode';

  /* ── Vocabulary glossary: hard word -> kid-friendly explanation ── */
  var GLOSSARY = {
    'emigrated':      'moved to another country to live',
    'emigrate':       'move to another country to live',
    'emigration':     'moving to another country to live',
    'emigrants':      'people who moved to another country',
    'emigrant':       'a person who moved to another country',
    'immigration':    'coming into a new country to live',
    'naturalization': 'becoming a citizen of a new country',
    'naturalized':    'became a citizen of a new country',
    'ancestor':       'a family member from long ago (like a great-great-grandparent)',
    'ancestors':      'family members from long ago',
    'descendant':     'a family member born later (like a child or grandchild)',
    'descendants':    'family members born later — kids, grandkids and so on',
    'lineage':        'the line of family members from parents to children',
    'generation':     'one step in the family — grandparents, parents, then kids',
    'genealogy':      'the study of a family\u2019s history',
    'collateral':     'cousins and other relatives who are not straight up the family line',
    'baptism':        'a church ceremony welcoming a baby',
    'obituary':       'a newspaper story about someone who has died',
    'obituaries':     'newspaper stories about people who have died',
    'militia':        'ordinary people trained to help defend their town',
    'manifest':       'the ship\u2019s list of everyone on board',
    'manifests':      'ship lists of everyone on board',
    'deceased':       'has passed away',
    'spouse':         'a husband or wife',
    'spouses':        'husbands and wives',
    'archives':       'places that keep very old records safe',
    'vital records':  'official papers about births, marriages and deaths'
  };

  /* ── Extra emojis to prepend to headings while Kid Mode is on ── */
  var HEADING_EMOJI = ['\u2b50', '\uD83C\uDF08', '\uD83C\uDF89', '\uD83D\uDC9B', '\uD83E\uDD84', '\uD83C\uDF3B'];

  function isOn() {
    try { return localStorage.getItem(KID_MODE_KEY) === '1'; } catch (e) { return false; }
  }

  function persist(on) {
    try { localStorage.setItem(KID_MODE_KEY, on ? '1' : '0'); } catch (e) { /* private mode */ }
  }

  /* Build the toggle button and drop it in a fixed corner. */
  function makeButton() {
    var btn = document.createElement('button');
    btn.id = 'kidModeToggle';
    btn.type = 'button';
    btn.className = 'kid-mode-toggle';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('title', 'Kid Mode: bigger text, more emojis, and easy word helpers');
    btn.addEventListener('click', toggle);
    document.body.appendChild(btn);
    syncButton(btn);
    return btn;
  }

  function syncButton(btn) {
    var on = document.body.classList.contains('kid-mode');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.classList.toggle('on', on);
    btn.innerHTML = on ? '\uD83D\uDC76 Kid Mode: ON' : '\uD83D\uDC76 Kid Mode';
  }

  function toggle() {
    var on = !document.body.classList.contains('kid-mode');
    apply(on);
    persist(on);
  }

  function apply(on) {
    document.body.classList.toggle('kid-mode', on);
    var btn = document.getElementById('kidModeToggle');
    if (btn) syncButton(btn);
    if (on) {
      annotateGlossary();
      addHeadingEmojis();
    } else {
      removeHeadingEmojis();
      /* Tooltips are left in the DOM (harmless) but hidden by CSS when off. */
    }
    // Refresh achievements panel visibility (achievements only work in Kid Mode)
    if (window.Achievements) {
      var panel = document.getElementById('achievements-panel');
      if (panel) window.Achievements.renderPanel(panel);
    }
  }

  /* Prepend a friendly emoji to headings/section titles (idempotent). */
  function addHeadingEmojis() {
    var sel = 'h1, h2, h3, .section-title, .gen-title, .fun-facts-title';
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.getAttribute('data-kid-emoji') === '1') continue;
      if (el.closest && el.closest('.kid-mode-toggle')) continue;
      var emoji = HEADING_EMOJI[i % HEADING_EMOJI.length];
      var span = document.createElement('span');
      span.className = 'kid-emoji';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = emoji + ' ';
      el.insertBefore(span, el.firstChild);
      el.setAttribute('data-kid-emoji', '1');
    }
  }

  function removeHeadingEmojis() {
    var spans = document.querySelectorAll('.kid-emoji');
    for (var i = 0; i < spans.length; i++) {
      var s = spans[i];
      var host = s.parentNode;
      if (host) { host.removeChild(s); host.removeAttribute('data-kid-emoji'); }
    }
  }

  /* Walk text nodes and wrap known hard words in a tooltip <span>. Runs once. */
  var glossaryDone = false;
  function annotateGlossary() {
    if (glossaryDone) return;
    glossaryDone = true;

    var words = Object.keys(GLOSSARY).sort(function (a, b) { return b.length - a.length; });
    var pattern = new RegExp('\\b(' + words.map(escapeRe).join('|') + ')\\b', 'gi');

    var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, BUTTON: 1, SVG: 1, CODE: 1, PRE: 1, A: 0 };
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = node.parentNode;
        while (p && p !== document.body) {
          if (p.classList && (p.classList.contains('kid-term') || p.classList.contains('kid-mode-toggle'))) {
            return NodeFilter.FILTER_REJECT;
          }
          if (SKIP[p.nodeName] === 1) return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        pattern.lastIndex = 0;
        return pattern.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    var targets = [];
    var n;
    while ((n = walker.nextNode())) targets.push(n);

    for (var t = 0; t < targets.length; t++) wrapNode(targets[t], pattern);
  }

  function wrapNode(textNode, pattern) {
    var text = textNode.nodeValue;
    var frag = document.createDocumentFragment();
    var last = 0, m;
    pattern.lastIndex = 0;
    while ((m = pattern.exec(text))) {
      var word = m[0];
      var def = GLOSSARY[word.toLowerCase()];
      if (!def) continue;
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      var span = document.createElement('span');
      span.className = 'kid-term';
      span.setAttribute('tabindex', '0');
      span.setAttribute('data-def', def);
      span.setAttribute('aria-label', word + ': ' + def);
      span.textContent = word;
      frag.appendChild(span);
      last = m.index + word.length;
    }
    if (last === 0) return; // no match actually wrapped
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    textNode.parentNode.replaceChild(frag, textNode);
  }

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function init() {
    makeButton();
    apply(isOn());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
