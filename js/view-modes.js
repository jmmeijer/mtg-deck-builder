const VIEW_MODES = ['full', 'name-stack', 'count-stack'];
const VIEW_LABELS = {
  full: 'Full card view',
  'name-stack': 'Compact stack view',
  'count-stack': 'Count-only stack view'
};
const VIEW_ICONS = {
  full: '▦',
  'name-stack': '▤',
  'count-stack': '●'
};

function ensureViewModes(targetState = state) {
  targetState.ui = targetState.ui || {};
  targetState.ui.viewMode = targetState.ui.viewMode || {};

  for (const section of sections) {
    if (!VIEW_MODES.includes(targetState.ui.viewMode[section.id])) {
      targetState.ui.viewMode[section.id] = targetState.ui.stacked?.[section.id] ? 'count-stack' : 'full';
    }
  }

  return targetState;
}

const originalEnsureState = ensureState;
ensureState = function ensureStateWithViewModes(nextState) {
  return ensureViewModes(originalEnsureState(nextState));
};

const originalRenderCard = renderCard;
renderCard = function renderCardWithMinimalImage(card, priority) {
  const imageUrl = img(card);
  const el = originalRenderCard(card, priority);

  if (!imageUrl) {
    el.classList.add('no-image');
    return el;
  }

  el.classList.add('has-image');
  el.querySelector('.foot')?.remove();
  el.querySelector('.pic')?.classList.add('image-loaded');
  return el;
};

function getFilteredCards(cards, query, sectionFilter, sectionId) {
  return cards.filter(card =>
    (sectionFilter === 'all' || sectionId === sectionFilter)
    && (!query || [
      card.name,
      card.status,
      card.role,
      card.scryfall?.type_line,
      card.scryfall?.oracle_text,
      card.scryfall?.set_name
    ].some(value => norm(value).includes(query)))
  );
}

function viewModeControls(section, currentMode) {
  const name = `view-${section.id}`;
  return `<fieldset class="view-modes" aria-label="${esc(section.title)} view mode">${VIEW_MODES.map(mode => `
    <label class="view-mode ${currentMode === mode ? 'active' : ''}" title="${VIEW_LABELS[mode]}">
      <input type="radio" name="${name}" value="${mode}" ${currentMode === mode ? 'checked' : ''} data-view-mode="${section.id}">
      <span class="view-icon" aria-hidden="true">${VIEW_ICONS[mode]}</span>
      <span class="sr-only">${VIEW_LABELS[mode]}</span>
    </label>`).join('')}</fieldset>`;
}

render = function renderWithViewModes() {
  ensureViewModes();

  const query = norm(search.value);
  const sectionFilter = filter.value;
  board.innerHTML = '';

  sections.forEach(section => {
    const col = document.createElement('section');
    col.className = 'col';
    col.dataset.sec = section.id;

    const all = state.cards.filter(card => card.section === section.id);
    const visible = getFilteredCards(all, query, sectionFilter, section.id);
    const mode = state.ui.viewMode[section.id];

    col.innerHTML = `<div class="col-head"><div class="col-title"><h2>${section.title}</h2><div class="head-actions"><span class="count">${all.length}</span>${viewModeControls(section, mode)}</div></div><p>${section.subtitle}</p></div><div class="cards ${mode === 'full' ? '' : 'stacked'} ${mode === 'name-stack' ? 'name-stacked' : ''}"></div>`;

    col.querySelectorAll('[data-view-mode]').forEach(input => {
      input.onchange = () => {
        state.ui.viewMode[section.id] = input.value;
        state.ui.stacked[section.id] = input.value !== 'full';
        save();
        render();
      };
    });

    const cards = col.querySelector('.cards');
    if (mode === 'count-stack') {
      cards.appendChild(renderCountStack(section, all.length));
    } else if (mode === 'name-stack') {
      cards.appendChild(renderNameStack(section, visible, all.length));
    } else {
      visible.forEach(card => cards.appendChild(renderCard(card, getPriority(card))));
    }

    enableDrop(col, section.id);
    board.appendChild(col);
  });

  renderStats();
};

function renderCountStack(section, total) {
  const el = document.createElement('div');
  el.className = 'stack-card';
  el.title = 'Count-only stack. Use the view icons to switch display mode.';
  el.innerHTML = `<div class="stack-count">${total}</div><div class="stack-label">${section.title}</div><div class="stack-hint">Count-only stack. Use the view icons to show card names or full cards.</div>`;
  return el;
}

function renderNameStack(section, visible, total) {
  const stack = document.createElement('div');
  stack.className = 'visual-stack';
  stack.setAttribute('role', 'list');
  stack.setAttribute('aria-label', `${section.title} compact card stack`);

  if (!visible.length) {
    const empty = document.createElement('div');
    empty.className = 'visual-stack-empty';
    empty.textContent = total ? 'No cards match the current filter.' : 'No cards in this section.';
    stack.appendChild(empty);
    return stack;
  }

  visible.forEach((card, index) => {
    const item = document.createElement('article');
    item.className = 'visual-stack-card';
    item.dataset.id = card.id;
    item.draggable = true;
    item.style.setProperty('--stack-index', index);
    item.title = `Open ${card.name}`;

    const mana = card.scryfall?.mana_cost || '';
    const type = card.scryfall?.type_line || 'Not loaded yet';
    const imageUrl = img(card, 'small') || img(card);

    item.innerHTML = `
      <div class="visual-stack-art">${imageUrl ? `<img src="${imageUrl}" alt="${esc(card.name)}" loading="lazy">` : ''}</div>
      <div class="visual-stack-bar">
        <div class="visual-stack-main"><strong>${esc(card.name)}</strong>${mana ? `<span class="mana-cost">${esc(mana)}</span>` : ''}</div>
        <div class="visual-stack-sub"><span>${esc(card.status)}</span><span>${esc(type)}</span></div>
      </div>`;

    item.addEventListener('click', () => openModal(card.id));
    item.addEventListener('dragstart', event => {
      dragged = card.id;
      item.classList.add('dragging');
      event.dataTransfer.setData('text/plain', card.id);
      event.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => {
      dragged = null;
      item.classList.remove('dragging');
      document.querySelectorAll('.col.over').forEach(column => column.classList.remove('over'));
      cleanupDropIndicators();
    });

    stack.appendChild(item);
  });

  return stack;
}

ensureViewModes();
save();
render();
