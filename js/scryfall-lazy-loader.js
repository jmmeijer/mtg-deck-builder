(() => {
  const SCRYFALL_REQUEST_DELAY = 100;
  const OBSERVER_ROOT_MARGIN = '800px 0px';

  const queue = [];
  const queued = new Set();
  const loading = new Set();
  let queueRunning = false;
  let observer = null;

  function findCard(cardId) {
    return state.cards.find(card => card.id === cardId) || null;
  }

  function needsScryfall(card, { retry = false } = {}) {
    if (!card || card.scryfall) return false;
    return retry || !card.error;
  }

  function enqueueScryfallLoad(cardId, { priority = false, retry = false } = {}) {
    const card = findCard(cardId);
    if (!needsScryfall(card, { retry })) return false;
    if (queued.has(cardId) || loading.has(cardId)) return false;

    if (retry) card.error = null;
    queued.add(cardId);
    if (priority) queue.unshift({ cardId, retry });
    else queue.push({ cardId, retry });

    processScryfallQueue();
    return true;
  }

  function enqueueVisibleScryfallLoads() {
    if (!('IntersectionObserver' in window)) {
      state.cards.filter(card => needsScryfall(card)).slice(0, 8).forEach(card => enqueueScryfallLoad(card.id));
      return;
    }

    if (observer) observer.disconnect();
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const cardId = entry.target.dataset.id;
        if (enqueueScryfallLoad(cardId)) observer.unobserve(entry.target);
      });
    }, { rootMargin: OBSERVER_ROOT_MARGIN });

    document.querySelectorAll('.card[data-id], .visual-stack-card[data-id]').forEach(element => {
      const card = findCard(element.dataset.id);
      if (needsScryfall(card)) observer.observe(element);
    });
  }

  async function loadCardScryfallData(cardId, { retry = false } = {}) {
    const card = findCard(cardId);
    if (!needsScryfall(card, { retry })) return false;

    loading.add(cardId);
    queued.delete(cardId);
    render();

    try {
      try {
        card.scryfall = await sfNamed(card.name, true);
      } catch (exactError) {
        await wait(SCRYFALL_REQUEST_DELAY);
        card.scryfall = await sfNamed(card.name, false);
      }

      card.name = card.scryfall.name;
      card.error = null;
      save();
      render();
      if (modalCardId === cardId) openModal(cardId);
      return true;
    } catch (error) {
      card.error = error.message;
      save();
      render();
      if (modalCardId === cardId) openModal(cardId);
      return false;
    } finally {
      loading.delete(cardId);
    }
  }

  async function processScryfallQueue() {
    if (queueRunning) return;
    queueRunning = true;

    let processed = 0;
    let loaded = 0;
    let failed = 0;

    while (queue.length) {
      const next = queue.shift();
      const result = await loadCardScryfallData(next.cardId, { retry: next.retry });
      processed++;
      if (result) loaded++;
      else failed++;
      if (queue.length) await wait(SCRYFALL_REQUEST_DELAY);
    }

    queueRunning = false;
    if (processed > 1) msg(`Scryfall lazy load done. Loaded ${loaded}. Failed ${failed}.`);
  }

  function getLoadingMessage(card) {
    if (!card || card.scryfall) return '';
    if (loading.has(card.id)) return 'Loading Scryfall data...';
    if (queued.has(card.id)) return 'Queued for Scryfall loading...';
    if (card.error) return 'Click card to retry Scryfall loading.';
    return 'Waiting to lazy-load Scryfall data.';
  }

  const originalRenderCard = renderCard;
  renderCard = function renderLazyScryfallCard(card, priority) {
    const element = originalRenderCard(card, priority);
    const message = getLoadingMessage(card);
    if (!message) return element;

    element.classList.toggle('scryfall-loading', loading.has(card.id) || queued.has(card.id));
    element.classList.toggle('scryfall-error', Boolean(card.error));
    const placeholder = element.querySelector('.pic span');
    if (placeholder && (loading.has(card.id) || queued.has(card.id))) placeholder.textContent = message;
    return element;
  };

  if (typeof renderNameStack === 'function') {
    const originalRenderNameStack = renderNameStack;
    renderNameStack = function renderLazyScryfallNameStack(section, visible, total) {
      const stack = originalRenderNameStack(section, visible, total);
      stack.querySelectorAll('.visual-stack-card[data-id]').forEach(element => {
        const card = findCard(element.dataset.id);
        const message = getLoadingMessage(card);
        if (!message) return;
        element.classList.toggle('scryfall-loading', loading.has(card.id) || queued.has(card.id));
        element.classList.toggle('scryfall-error', Boolean(card.error));
        element.title = `${element.title} - ${message}`;
      });
      return stack;
    };
  }

  const originalRender = render;
  render = function renderWithLazyScryfall() {
    originalRender();
    queueMicrotask(enqueueVisibleScryfallLoads);
  };

  const originalOpenModal = openModal;
  openModal = function openModalWithLazyRetry(cardId) {
    const card = findCard(cardId);
    if (card && !card.scryfall) {
      enqueueScryfallLoad(cardId, { priority: true, retry: Boolean(card.error) });
    }

    originalOpenModal(cardId);

    const current = findCard(cardId);
    const message = getLoadingMessage(current);
    if (message && modalInfo) {
      const title = modalInfo.querySelector('#modalTitle');
      title?.insertAdjacentHTML('afterend', `<p class="modal-line scryfall-load-status"><strong>Scryfall:</strong> ${esc(message)}</p>`);
    }
  };

  loadImages = function queueRemainingScryfallData() {
    const missing = state.cards.filter(card => !card.scryfall);
    if (!missing.length) return msg('All cards already have Scryfall data loaded.');

    let added = 0;
    missing.forEach(card => {
      if (enqueueScryfallLoad(card.id, { retry: Boolean(card.error) })) added++;
    });

    msg(added ? `Queued ${added} cards for Scryfall loading.` : 'Scryfall loading is already queued.');
  };
})();
