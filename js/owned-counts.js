(() => {
  function normalizeOwnedCount(value) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return parsed;
  }

  function getOwnedCount(card) {
    return normalizeOwnedCount(card?.ownedCount);
  }

  function setOwnedCount(cardId, value) {
    const card = state.cards.find(item => item.id === cardId);
    if (!card) return 0;

    const ownedCount = normalizeOwnedCount(value);
    card.ownedCount = ownedCount;
    save();
    return ownedCount;
  }

  function createOwnedBadge(count, extraClass = '') {
    const badge = document.createElement('div');
    badge.className = `owned-badge ${extraClass}`.trim();
    badge.title = `Owned copies: ${count}`;
    badge.textContent = count;
    return badge;
  }

  const originalMakeCard = makeCard;
  makeCard = function makeOwnedCard(entry) {
    const card = originalMakeCard(entry);
    const source = Array.isArray(entry) ? {} : entry || {};
    card.ownedCount = normalizeOwnedCount(source.ownedCount ?? card.ownedCount);
    return card;
  };

  const originalEnsureState = ensureState;
  ensureState = function ensureOwnedState(nextState) {
    const normalized = originalEnsureState(nextState);
    normalized.cards.forEach(card => {
      card.ownedCount = normalizeOwnedCount(card.ownedCount);
    });
    return normalized;
  };

  const originalAddScryfallResult = addScryfallResult;
  addScryfallResult = function addOwnedScryfallResult(result, section) {
    originalAddScryfallResult(result, section);
    const card = state.cards.find(item => norm(item.name) === norm(result.name));
    if (card && typeof card.ownedCount !== 'number') {
      card.ownedCount = 0;
      save();
    }
  };

  const originalRenderCard = renderCard;
  renderCard = function renderOwnedCard(card, priority) {
    const element = originalRenderCard(card, priority);
    const ownedCount = getOwnedCount(card);

    if (ownedCount > 0) {
      element.appendChild(createOwnedBadge(ownedCount));
    }

    return element;
  };

  if (typeof renderNameStack === 'function') {
    const originalRenderNameStack = renderNameStack;
    renderNameStack = function renderOwnedNameStack(section, visible, total) {
      const stack = originalRenderNameStack(section, visible, total);

      stack.querySelectorAll('.visual-stack-card[data-id]').forEach(item => {
        const card = state.cards.find(candidate => candidate.id === item.dataset.id);
        const ownedCount = getOwnedCount(card);
        if (ownedCount > 0) item.appendChild(createOwnedBadge(ownedCount, 'visual-owned-badge'));
      });

      return stack;
    };
  }

  const originalRenderStats = renderStats;
  renderStats = function renderOwnedStats() {
    originalRenderStats();

    const ownedCards = state.cards.filter(card => getOwnedCount(card) > 0).length;
    const ownedCopies = state.cards.reduce((total, card) => total + getOwnedCount(card), 0);
    const missing = Math.max(0, state.cards.length - ownedCards);

    stats.insertAdjacentHTML(
      'beforeend',
      `<span class="pill">Owned: ${ownedCards}/${state.cards.length}</span><span class="pill">Copies: ${ownedCopies}</span><span class="pill">Missing: ${missing}</span>`
    );
  };

  const originalOpenModal = openModal;
  openModal = function openOwnedModal(id) {
    originalOpenModal(id);

    const card = state.cards.find(item => item.id === id);
    const actions = modalInfo.querySelector('.modal-actions');
    if (!card || !actions) return;

    const control = document.createElement('div');
    control.className = 'owned-control';
    control.innerHTML = `
      <label class="owned-label" for="ownedCountInput"><strong>Owned copies</strong></label>
      <input class="field owned-input" id="ownedCountInput" type="number" min="0" step="1" inputmode="numeric" value="${getOwnedCount(card)}">
    `;

    actions.before(control);

    const input = control.querySelector('#ownedCountInput');
    input.addEventListener('input', () => {
      const value = setOwnedCount(card.id, input.value);
      if (input.value !== String(value) && input.value !== '') input.value = String(value);
      render();
    });
    input.addEventListener('change', () => {
      const value = setOwnedCount(card.id, input.value);
      input.value = String(value);
      render();
    });
  };
})();
