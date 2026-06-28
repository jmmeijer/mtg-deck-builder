(() => {
  const EDHREC_BASE = 'https://json.edhrec.com/pages';
  const MAX_SUGGESTIONS = 12;
  const cache = new Map();
  const inFlight = new Map();
  const scryfallCache = new Map();

  function injectEdhrecCarouselStyles() {
    if (document.getElementById('edhrecCarouselStyles')) return;
    const style = document.createElement('style');
    style.id = 'edhrecCarouselStyles';
    style.textContent = `
      .edhrec-carousel{display:flex;gap:12px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;padding:4px 2px 12px;margin-top:8px;scrollbar-width:thin}
      .edhrec-suggestion-card{flex:0 0 158px;scroll-snap-align:start;border:1px solid #ffffff18;border-radius:14px;background:#00000028;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 12px 24px #0005}
      .edhrec-image{aspect-ratio:488/680;background:#ffffff10;display:grid;place-items:center;color:var(--muted);font-size:.72rem;text-align:center;padding:8px}
      .edhrec-image img{width:100%;height:100%;object-fit:cover;display:block}
      .edhrec-card-body{padding:8px;display:flex;flex-direction:column;gap:6px;min-height:162px}
      .edhrec-card-body .edhrec-name{min-height:2.25em}
      .edhrec-add-row{display:grid;grid-template-columns:1fr auto;gap:6px;margin-top:auto;align-items:center}
      .edhrec-section{min-height:30px;border-radius:999px;padding:4px 7px;font-size:.68rem;font-weight:800}
      .edhrec-add-row .mini-btn{min-height:30px;padding:4px 8px}
      @media(max-width:760px){.edhrec-suggestion-card{flex-basis:145px}.edhrec-card-body{min-height:170px}.edhrec-add-row{grid-template-columns:1fr}.edhrec-add-row .mini-btn{width:100%}}
    `;
    document.head.appendChild(style);
  }

  injectEdhrecCarouselStyles();

  function primaryCardName(name) {
    return String(name || '').split('//')[0].trim();
  }

  function edhrecSlug(name) {
    return primaryCardName(name)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function getEndpoint(card, slug) {
    const type = card.isCommander ? 'Commander' : 'Card';
    const path = card.isCommander ? 'commanders' : 'cards';
    return {
      type,
      path,
      url: `${EDHREC_BASE}/${path}/${slug}.json`,
      pageUrl: `https://edhrec.com/${path}/${slug}`
    };
  }

  function parseNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return null;
    const parsed = Number.parseFloat(value.replace(/,/g, '').replace('%', ''));
    return Number.isFinite(parsed) ? parsed : null;
  }

  function formatPercent(value) {
    const parsed = parseNumber(value);
    if (parsed === null) return '';
    return `${Math.round(parsed * 10) / 10}%`;
  }

  function formatDecks(value) {
    const parsed = parseNumber(value);
    if (parsed === null) return '';
    if (parsed >= 1000) return `${Math.round(parsed / 100) / 10}K decks`;
    return `${Math.round(parsed)} decks`;
  }

  function getField(source, names) {
    for (const name of names) {
      if (source?.[name] !== undefined && source?.[name] !== null && source?.[name] !== '') return source[name];
    }
    return null;
  }

  function extractName(item) {
    const source = item?.card || item?.cardview || item;
    return getField(source, ['name', 'card_name', 'display_name']);
  }

  function contextFromObject(object, fallback = '') {
    return getField(object, ['header', 'title', 'label', 'description', 'cardlist_name', 'name']) || fallback;
  }

  function contextFromKey(key, fallback = '') {
    return String(key || fallback || '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, letter => letter.toUpperCase())
      .trim();
  }

  function extractSuggestion(item, context) {
    if (!item || typeof item !== 'object') return null;
    const source = item.card || item.cardview || item;
    const name = extractName(source);
    if (!name) return null;

    const hasEdhrecSignal = [
      'synergy', 'synergy_score', 'synergy_percent', 'inclusion', 'inclusion_rate', 'percentage',
      'num_decks', 'deck_count', 'potential_decks', 'url', 'sanitized'
    ].some(key => source[key] !== undefined || item[key] !== undefined);

    if (!hasEdhrecSignal) return null;

    const synergy = getField(source, ['synergy', 'synergy_score', 'synergy_percent']) ?? getField(item, ['synergy', 'synergy_score', 'synergy_percent']);
    const inclusion = getField(source, ['inclusion', 'inclusion_rate', 'percentage']) ?? getField(item, ['inclusion', 'inclusion_rate', 'percentage']);
    const decks = getField(source, ['num_decks', 'deck_count', 'deck_count_card']) ?? getField(item, ['num_decks', 'deck_count', 'deck_count_card']);
    const potentialDecks = getField(source, ['potential_decks', 'deck_count_total']) ?? getField(item, ['potential_decks', 'deck_count_total']);

    return {
      name: String(name),
      context: context || 'EDHREC suggestion',
      synergy: parseNumber(synergy),
      synergyLabel: formatPercent(synergy),
      inclusion: parseNumber(inclusion),
      inclusionLabel: formatPercent(inclusion),
      decksLabel: formatDecks(decks),
      potentialDecksLabel: formatDecks(potentialDecks),
      scryfall: null,
      scryfallError: null
    };
  }

  function collectSuggestions(data, sourceCardName) {
    const suggestions = new Map();
    const visited = new WeakSet();
    const sourceName = norm(sourceCardName);

    function addSuggestion(suggestion) {
      if (!suggestion || norm(suggestion.name) === sourceName) return;
      const key = norm(suggestion.name);
      const existing = suggestions.get(key);
      if (!existing || (suggestion.synergy ?? -999) > (existing.synergy ?? -999)) {
        suggestions.set(key, suggestion);
      }
    }

    function walk(node, context = '') {
      if (!node || typeof node !== 'object') return;
      if (visited.has(node)) return;
      visited.add(node);

      if (Array.isArray(node)) {
        const extracted = node.map(item => extractSuggestion(item, context)).filter(Boolean);
        if (extracted.length) extracted.forEach(addSuggestion);
        node.forEach(item => walk(item, context));
        return;
      }

      const nextContext = contextFromObject(node, context);
      Object.entries(node).forEach(([key, value]) => {
        const keyContext = contextFromKey(key, nextContext);
        if (Array.isArray(value)) {
          value.map(item => extractSuggestion(item, keyContext || nextContext)).filter(Boolean).forEach(addSuggestion);
        }
        walk(value, keyContext || nextContext);
      });
    }

    walk(data);

    return [...suggestions.values()]
      .filter(suggestion => !state.cards.some(card => norm(card.name) === norm(suggestion.name)))
      .sort((left, right) => (right.synergy ?? -999) - (left.synergy ?? -999) || (right.inclusion ?? -999) - (left.inclusion ?? -999) || left.name.localeCompare(right.name))
      .slice(0, MAX_SUGGESTIONS);
  }

  async function fetchJson(url) {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`EDHREC returned ${response.status}`);
    return response.json();
  }

  async function loadEdhrecSuggestions(card) {
    const slug = edhrecSlug(card.name);
    if (!slug) return [];
    const endpoint = getEndpoint(card, slug);
    const cacheKey = `${endpoint.path}:${slug}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    if (inFlight.has(cacheKey)) return inFlight.get(cacheKey);

    const task = (async () => {
      const data = await fetchJson(endpoint.url);
      const suggestions = collectSuggestions(data, card.name);
      if (!suggestions.length) throw new Error(`No EDHREC suggestions found on the ${endpoint.type.toLowerCase()} page.`);
      cache.set(cacheKey, { suggestions, source: endpoint });
      return cache.get(cacheKey);
    })().finally(() => inFlight.delete(cacheKey));

    inFlight.set(cacheKey, task);
    return task;
  }

  async function loadSuggestionScryfall(suggestion) {
    const key = norm(suggestion.name);
    if (scryfallCache.has(key)) return scryfallCache.get(key);

    const task = sfNamed(suggestion.name, false)
      .then(result => {
        suggestion.scryfall = result;
        suggestion.name = result.name;
        suggestion.scryfallError = null;
        return result;
      })
      .catch(error => {
        suggestion.scryfall = null;
        suggestion.scryfallError = error.message;
        throw error;
      });

    scryfallCache.set(key, task);
    return task;
  }

  function suggestionImageUrl(suggestion) {
    const card = suggestion.scryfall;
    if (!card) return '';
    return card.image_uris?.normal || card.image_uris?.small || card.card_faces?.[0]?.image_uris?.normal || card.card_faces?.[0]?.image_uris?.small || '';
  }

  function renderSuggestionMeta(suggestion) {
    const parts = [];
    if (suggestion.synergyLabel) parts.push(`${suggestion.synergyLabel} synergy`);
    if (suggestion.inclusionLabel) parts.push(`${suggestion.inclusionLabel} inclusion`);
    if (suggestion.decksLabel) parts.push(suggestion.decksLabel);
    if (suggestion.potentialDecksLabel) parts.push(`of ${suggestion.potentialDecksLabel}`);
    return parts.join(' · ');
  }

  async function addEdhrecSuggestion(suggestion, sourceCard, button, section) {
    if (state.cards.some(card => norm(card.name) === norm(suggestion.name))) {
      msg(`${suggestion.name} is already on the board.`);
      button.disabled = true;
      button.textContent = 'On board';
      return;
    }

    button.disabled = true;
    button.textContent = 'Adding...';

    try {
      const result = suggestion.scryfall || await loadSuggestionScryfall(suggestion);
      state.cards.unshift({
        id: crypto.randomUUID(),
        name: result.name,
        section,
        status: 'New candidate',
        role: `EDHREC suggestion for ${sourceCard.name}`,
        scryfall: result,
        error: null,
        ownedCount: 0,
        isCommander: false
      });
      msg(`Added ${result.name} to ${sectionTitle(section)}.`);
    } catch (error) {
      state.cards.unshift({
        id: crypto.randomUUID(),
        name: suggestion.name,
        section,
        status: 'New candidate',
        role: `EDHREC suggestion for ${sourceCard.name}`,
        scryfall: null,
        error: error.message,
        ownedCount: 0,
        isCommander: false
      });
      msg(`Added ${suggestion.name} to ${sectionTitle(section)} without Scryfall data.`);
    }

    save();
    render();
    button.textContent = 'Added';
  }

  function createEdhrecPanel(card) {
    const actions = modalInfo.querySelector('.modal-actions');
    if (!actions) return null;

    const slug = edhrecSlug(card.name);
    const endpoint = getEndpoint(card, slug);
    const panel = document.createElement('section');
    panel.className = 'edhrec-panel';
    panel.innerHTML = `
      <div class="edhrec-header">
        <h3>EDHREC synergy suggestions</h3>
        <a href="${endpoint.pageUrl}" target="_blank" rel="noopener noreferrer">Open EDHREC ${endpoint.type}</a>
      </div>
      <div class="edhrec-body"><p class="modal-line">Loading EDHREC ${endpoint.type.toLowerCase()} suggestions...</p></div>
    `;
    actions.before(panel);
    return panel;
  }

  function updateSuggestionCard(cardElement, suggestion) {
    const imageWrap = cardElement.querySelector('.edhrec-image');
    const name = cardElement.querySelector('.edhrec-name');
    const imageUrl = suggestionImageUrl(suggestion);

    name.textContent = suggestion.name;
    imageWrap.innerHTML = imageUrl
      ? `<img src="${imageUrl}" alt="${esc(suggestion.name)}">`
      : `<span>${esc(suggestion.scryfallError || 'No image')}</span>`;
  }

  function renderSuggestionCard(suggestion, sourceCard) {
    const item = document.createElement('article');
    item.className = 'edhrec-suggestion-card';
    const meta = renderSuggestionMeta(suggestion);
    item.innerHTML = `
      <div class="edhrec-image"><span>Loading image...</span></div>
      <div class="edhrec-card-body">
        <div class="edhrec-name">${esc(suggestion.name)}</div>
        <div class="edhrec-meta">${esc(meta || suggestion.context)}</div>
        <div class="edhrec-add-row">
          <select class="select edhrec-section" aria-label="Add ${esc(suggestion.name)} to section">
            <option value="main">Main</option>
            <option value="maybe" selected>Maybe</option>
            <option value="module">Module</option>
            <option value="cut">Cut</option>
          </select>
          <button class="mini-btn" type="button">Add</button>
        </div>
      </div>
    `;

    const select = item.querySelector('.edhrec-section');
    const button = item.querySelector('button');
    button.onclick = () => addEdhrecSuggestion(suggestion, sourceCard, button, select.value);

    loadSuggestionScryfall(suggestion)
      .then(() => updateSuggestionCard(item, suggestion))
      .catch(() => updateSuggestionCard(item, suggestion));

    return item;
  }

  function renderEdhrecSuggestions(panel, card, result) {
    const body = panel.querySelector('.edhrec-body');
    const sourceLabel = result.source?.type ? `${result.source.type} page` : 'EDHREC';
    body.innerHTML = `<p class="modal-line">From ${esc(sourceLabel)}. Swipe or scroll horizontally. Choose a board before adding a card.</p>`;

    const carousel = document.createElement('div');
    carousel.className = 'edhrec-carousel';
    carousel.setAttribute('aria-label', 'EDHREC synergy card suggestions');
    result.suggestions.forEach(suggestion => carousel.appendChild(renderSuggestionCard(suggestion, card)));
    body.appendChild(carousel);
  }

  function renderEdhrecError(panel, error) {
    const body = panel.querySelector('.edhrec-body');
    body.innerHTML = `<p class="modal-line">Could not load EDHREC suggestions: ${esc(error.message)}</p>`;
  }

  const originalOpenModal = openModal;
  openModal = function openModalWithEdhrec(id) {
    originalOpenModal(id);
    const card = state.cards.find(item => item.id === id);
    if (!card) return;

    const panel = createEdhrecPanel(card);
    if (!panel) return;

    loadEdhrecSuggestions(card)
      .then(result => renderEdhrecSuggestions(panel, card, result))
      .catch(error => renderEdhrecError(panel, error));
  };
})();
