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
    'vital records':  'official papers about births, marriages and deaths',

    /* ── More genealogy & record words ── */
    'immigrant':      'someone who comes to live in a new country',
    'immigrants':     'people who come to live in a new country',
    'census':         'a count of all the people living somewhere',
    'parish':         'a local church area',
    'parishes':       'local church areas',
    'christening':    'a ceremony where a baby is given their name',
    'christened':     'given a name in a church ceremony as a baby',
    'burial':         'when someone who has died is put in the ground',
    'buried':         'put in the ground after they have died',
    'ship manifest':  'a list of everyone on a ship',
    'ship manifests': 'lists of everyone on a ship',
    'patron saint':   'a special saint that watches over a place or family',
    'baptized':       'welcomed into the church as a baby',
    'baptised':       'welcomed into the church as a baby',
    'marriage':       'when two people join together as husband and wife',
    'wedlock':        'being married',
    'widow':          'a woman whose husband has died',
    'widower':        'a man whose wife has died',
    'orphan':         'a child whose parents have died',
    'godparent':      'a grown-up who promises to help raise a child',
    'godparents':     'grown-ups who promise to help raise a child',
    'sponsor':        'a person who stands up for a baby at their christening',
    'sponsors':       'people who stand up for a baby at their christening',
    'patronymic':     'a name made from your father\u2019s first name',
    'surname':        'a family\u2019s last name',
    'maiden name':    'the last name a woman had before she married',
    'homestead':      'a family\u2019s house and land',
    'parochial':      'to do with a local church',
    'sacrament':      'a special church ceremony',
    'confirmation':   'a church ceremony for older children',
    'catholic':       'a member of the Catholic Christian church',
    'protestant':     'a member of a Christian church that is not Catholic',
    'passenger list': 'a list of everyone travelling on a ship',
    'steamship':      'a big ship powered by steam',
    'port':           'a place where ships come in to land',
    'voyage':         'a long trip by ship',
    'settler':        'someone who moves to a new place to live and work',
    'settlers':       'people who move to a new place to live and work',
    'farmstead':      'a farm and its buildings',

    /* ── Dutch places ── */
    'Noord-Brabant':  'a province in the southern Netherlands',
    'Brabant':        'a region in the southern Netherlands',
    'Netherlands':    'a country in Europe, also called Holland',
    'Holland':        'another name for the Netherlands',
    'Uden':           'a town in the Netherlands where the family lived',
    'Aarle-Rixtel':   'a village in the Netherlands',
    'Boekel':         'a village in the Netherlands',
    'Gemert':         'a town in the Netherlands',
    'Beek en Donk':   'a village in the Netherlands',
    'Bakel':          'a village in the Netherlands',
    'Deurne':         'a town in the Netherlands',
    'Helmond':        'a city in the Netherlands',
    'Eindhoven':      'a big city in the Netherlands',
    'Volkel':         'a small place in the Netherlands near Uden',
    'Zeeland':        'a village in the Netherlands (also a Dutch province)',
    'Sint-Oedenrode': 'a town in the Netherlands',
    'Veghel':         'a town in the Netherlands',
    'Erp':            'a village in the Netherlands',
    'Mierlo':         'a village in the Netherlands',
    'Lieshout':       'a village in the Netherlands',
    'Nuenen':         'a village in the Netherlands (where the painter Van Gogh once lived)',
    'Asten':          'a village in the Netherlands',
    'Someren':        'a village in the Netherlands',
    'Rotterdam':      'a big Dutch city with a harbour where ships sailed to America',
    'Antwerp':        'a port city in Belgium where some ships to America left from',
    'province':       'a big area of a country, a bit like a state',

    /* ── US places ── */
    'Minnesota':      'a state in the northern United States',
    'Wisconsin':      'a state in the northern United States',
    'New York':       'a state and a big city in the United States',
    'America':        'the United States of America',
    'Iowa':           'a farming state in the middle of the United States',
    'Michigan':       'a state in the northern United States',
    'Illinois':       'a state in the middle of the United States',
    'Ohio':           'a state in the middle of the United States',
    'Nebraska':       'a farming state in the middle of the United States',
    'South Dakota':   'a state in the northern middle of the United States',
    'Grand Rapids':   'a city in Michigan in the United States',
    'Hoboken':        'a city in New Jersey where ships from Europe arrived',
    'Pella':          'a town in Iowa first settled by Dutch families',
    'Ellis Island':   'the place in New York where ships full of newcomers arrived',

    /* ── Records & institutions ── */
    'BHIC':           'Brabants Historisch Informatie Centrum \u2014 a place that keeps old Dutch records',
    'SS Volendam':    'the ship that brought some of the family to America',
    'Volendam':       'the ship that brought some of the family to America',

    /* ── Time & history words ── */
    'century':        'one hundred years',
    'decade':         'ten years',
    'era':            'a long stretch of time in history',
    'World War':      'a huge war that many countries fought in',
    'Great Depression':'a time long ago when many people had very little money',
    'famine':         'a time when there is not enough food',
    'plague':         'a very bad sickness that spreads to many people',
    'inheritance':    'money or things passed down when someone dies',
    'estate':         'all the land and money a person owns',
    'occupation':     'the job someone does',
    'trade':          'a job you learn to do with your hands, like carpentry',
    'farmer':         'a person who grows crops and raises animals',
    'laborer':        'a person who does hard work with their hands',
    'labourer':       'a person who does hard work with their hands'
  };

  /* ── Extra emojis to prepend to headings while Kid Mode is on ── */
  var HEADING_EMOJI = ['\u2b50', '\uD83C\uDF08', '\uD83C\uDF89', '\uD83D\uDC9B', '\uD83E\uDD84', '\uD83C\uDF3B'];

  function isOn() {
    try { return localStorage.getItem(KID_MODE_KEY) === '1'; } catch (e) { return false; }
  }

  function persist(on) {
    try { localStorage.setItem(KID_MODE_KEY, on ? '1' : '0'); } catch (e) { /* private mode */ }
  }

  /* Build the toggle button and drop it in a fixed corner.
     Now skipped if bottom-nav handles Kid Mode. */
  function makeButton() {
    // If bottom-nav already provides Kid Mode, don't create a duplicate
    if (document.getElementById('bottom-nav')) return null;
    
    // Create container for the split button
    var container = document.createElement('div');
    container.id = 'kidModeContainer';
    container.className = 'kid-mode-container';

    // Main kid mode toggle button
    var btn = document.createElement('button');
    btn.id = 'kidModeToggle';
    btn.type = 'button';
    btn.className = 'kid-mode-toggle';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('title', 'Kid Mode: bigger text, more emojis, and easy word helpers');
    btn.addEventListener('click', toggle);

    // Achievements badge (only visible when kid mode is ON)
    var achBtn = document.createElement('button');
    achBtn.id = 'kidModeAchievements';
    achBtn.type = 'button';
    achBtn.className = 'kid-mode-achievements';
    achBtn.setAttribute('title', 'View your Discovery Achievements');
    achBtn.innerHTML = '\uD83C\uDFC5';
    achBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      showAchievementsPopup();
    });

    container.appendChild(btn);
    container.appendChild(achBtn);
    document.body.appendChild(container);
    syncButton(btn);
    return btn;
  }

  function syncButton(btn) {
    if (!btn) return;
    var on = document.body.classList.contains('kid-mode');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.classList.toggle('on', on);
    btn.innerHTML = on ? '\uD83D\uDC76 Kid Mode: ON' : '\uD83D\uDC76 Kid Mode';
    
    // Show/hide achievements badge based on kid mode state
    var container = document.getElementById('kidModeContainer');
    if (container) {
      container.classList.toggle('kid-mode-active', on);
    }
    
    // Update achievements count if available
    updateAchievementsBadge();
  }

  function updateAchievementsBadge() {
    var achBtn = document.getElementById('kidModeAchievements');
    if (!achBtn || !window.Achievements) return;
    
    var state = window.Achievements.getState ? window.Achievements.getState() : null;
    var defs = window.Achievements.definitions || [];
    if (!state) return;
    
    var earned = 0;
    for (var i = 0; i < defs.length; i++) {
      var result = defs[i].check(state);
      if (result && result.earned) earned++;
    }
    
    // Show count badge if any earned
    if (earned > 0) {
      achBtn.innerHTML = '\uD83C\uDFC5<span class="ach-count">' + earned + '</span>';
    } else {
      achBtn.innerHTML = '\uD83C\uDFC5';
    }
  }
  // Export so achievements.js can call it from evaluate() to refresh badge count
  window.updateAchievementsBadge = updateAchievementsBadge;

  function showAchievementsPopup() {
    // Check if popup already exists
    var existing = document.getElementById('kid-achievements-popup');
    if (existing) {
      existing.classList.toggle('open');
      return;
    }

    // Create popup
    var popup = document.createElement('div');
    popup.id = 'kid-achievements-popup';
    popup.className = 'kid-achievements-popup open';
    
    var closeBtn = document.createElement('button');
    closeBtn.className = 'popup-close';
    closeBtn.innerHTML = '\u00D7';
    closeBtn.addEventListener('click', function() {
      popup.classList.remove('open');
    });
    
    var content = document.createElement('div');
    content.className = 'popup-content';
    content.id = 'kid-achievements-content';
    
    popup.appendChild(closeBtn);
    popup.appendChild(content);
    document.body.appendChild(popup);
    
    // Render achievements into the popup
    if (window.Achievements && window.Achievements.renderPanel) {
      window.Achievements.renderPanel(content);
    } else {
      content.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">Achievements loading...</p>';
    }
    
    // Close when clicking outside
    popup.addEventListener('click', function(e) {
      if (e.target === popup) {
        popup.classList.remove('open');
      }
    });
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
      startGlossaryObserver(); // Watch for dynamically added content
    } else {
      removeHeadingEmojis();
      glossaryDone = false; // Allow re-annotation next time Kid Mode is enabled
      stopGlossaryObserver(); // Stop watching for dynamic content
      /* Tooltips are left in the DOM (harmless) but hidden by CSS when off. */
    }
    // Notify other modules (e.g. Achievements) that Kid Mode changed.
    // Skip if bottom-nav already fired the event (to avoid double-firing).
    if (!document.getElementById('bottom-nav')) {
      try {
        document.dispatchEvent(new CustomEvent('kid-mode-changed', { detail: { on: on, enabled: on } }));
      } catch (e) { /* CustomEvent unsupported — ignore */ }
    }

    // Also refresh directly if Achievements is already present (belt and braces).
    if (window.Achievements) {
      var panel = document.getElementById('achievements-panel');
      if (panel) window.Achievements.renderPanel(panel);
      // Also refresh popup panel if open
      var popupPanel = document.getElementById('kid-achievements-content');
      if (popupPanel) window.Achievements.renderPanel(popupPanel);
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

  /* Walk text nodes and wrap known hard words in a tooltip <span>. Resets when Kid Mode is turned off. */
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

  // MutationObserver: re-annotate newly added text nodes when Kid Mode is on
  var _mutationObserver = null;
  function startGlossaryObserver() {
    if (_mutationObserver) return;
    var words = Object.keys(GLOSSARY).sort(function(a,b){ return b.length - a.length; });
    var pattern = new RegExp('\\b(' + words.map(escapeRe).join('|') + ')\\b', 'gi');
    _mutationObserver = new MutationObserver(function(mutations) {
      if (!isOn()) return;
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === Node.TEXT_NODE) {
            wrapNode(node, pattern);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
              acceptNode: function(n) {
                if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                var p = n.parentNode;
                while (p && p !== document.body) {
                  if (p.classList && p.classList.contains('kid-term')) return NodeFilter.FILTER_REJECT;
                  if (['SCRIPT','STYLE','TEXTAREA','INPUT','BUTTON','SVG','CODE','PRE'].indexOf(p.nodeName) !== -1) return NodeFilter.FILTER_REJECT;
                  p = p.parentNode;
                }
                pattern.lastIndex = 0;
                return pattern.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
              }
            });
            var targets = [];
            var t;
            while ((t = walker.nextNode())) targets.push(t);
            targets.forEach(function(t) { wrapNode(t, pattern); });
          }
        });
      });
    });
    _mutationObserver.observe(document.body, { childList: true, subtree: true });
  }
  function stopGlossaryObserver() {
    if (_mutationObserver) { _mutationObserver.disconnect(); _mutationObserver = null; }
  }

  function init() {
    makeButton();
    // Apply current state (for glossary/emojis)
    apply(isOn());
    
    // Listen for kid-mode-changed events from bottom-nav
    document.addEventListener('kid-mode-changed', function(e) {
      var on = e.detail && (e.detail.enabled || e.detail.on);
      // Apply the visual changes (glossary, emojis)
      if (on) {
        annotateGlossary();
        addHeadingEmojis();
      } else {
        removeHeadingEmojis();
      }
      // Refresh achievements panel if open
      if (window.Achievements) {
        var popupPanel = document.getElementById('kid-achievements-content');
        if (popupPanel) window.Achievements.renderPanel(popupPanel);
      }
    });
  }

  // Export badge update function globally so achievements.js can call it
  window.updateAchievementsBadge = updateAchievementsBadge;
  // Export showAchievementsPopup so bottom-nav can use it
  window.showAchievementsPopup = showAchievementsPopup;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
