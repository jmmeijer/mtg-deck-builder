(() => {
  const DEFAULT_DECK_TITLE = 'The Rotwood Accord';
  let isEditingDeckTitle = false;
  let draftDeckTitle = '';

  function injectDeckTitleStyles() {
    if (document.getElementById('deckTitleStyles')) return;
    const style = document.createElement('style');
    style.id = 'deckTitleStyles';
    style.textContent = `
      .deck-title-display{display:inline-flex;align-items:center;gap:8px;border-radius:12px;cursor:pointer;padding:2px 6px;margin-left:-6px;transition:background .12s,outline-color .12s;max-width:100%;text-align:left}
      .deck-title-display:hover,.deck-title-display:focus{background:#ffffff10;outline:2px solid #ffffff22;outline-offset:2px}
      .deck-title-display::after{content:'✎';font-size:.85rem;color:var(--muted);opacity:.75;flex:0 0 auto}
      .deck-title-editor{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-left:-6px;max-width:100%}
      .deck-title-input{min-height:44px;min-width:min(560px,80vw);border:1px solid var(--line);border-radius:12px;background:#ffffff12;color:var(--text);padding:8px 11px;font:inherit;font-size:clamp(1.5rem,3vw,2.6rem);font-weight:800;line-height:1.1}
      .title-icon-btn{width:42px;height:42px;border-radius:12px;border:1px solid #ffffff22;background:#ffffff14;color:#fff;font-size:1.1rem;font-weight:900;cursor:pointer;display:grid;place-items:center}
      .title-icon-btn:hover{filter:brightness(1.12)}
      .title-icon-btn.save{background:linear-gradient(#58b85d,#2c7534)}
      .title-icon-btn.cancel{background:linear-gradient(#d55d4d,#943124)}
      @media(max-width:760px){.deck-title-display{width:100%;white-space:normal}.deck-title-editor{align-items:stretch;margin-left:0;width:100%;display:grid;grid-template-columns:1fr 46px 46px}.deck-title-input{grid-column:1 / -1;min-width:0;width:100%;font-size:1.6rem}.title-icon-btn{width:46px;height:42px}.title-icon-btn.save{grid-column:2}.title-icon-btn.cancel{grid-column:3}}
    `;
    document.head.appendChild(style);
  }

  function getDeckTitle() {
    const value = state?.ui?.deckTitle;
    return typeof value === 'string' && value.trim() ? value.trim() : DEFAULT_DECK_TITLE;
  }

  function getTitleElement() {
    return document.querySelector('.hero h1');
  }

  function renderDeckTitle() {
    if (isEditingDeckTitle) return;

    const title = getTitleElement();
    if (!title) return;

    title.innerHTML = '';
    const button = document.createElement('button');
    button.className = 'deck-title-display';
    button.type = 'button';
    button.title = 'Edit deck title';
    button.textContent = getDeckTitle();
    button.onclick = renderDeckTitleEditor;
    title.appendChild(button);
  }

  function finishDeckTitleEdit(value) {
    const nextTitle = value.trim() || DEFAULT_DECK_TITLE;
    state.ui = state.ui || {};
    state.ui.deckTitle = nextTitle;
    isEditingDeckTitle = false;
    draftDeckTitle = '';
    document.activeElement?.blur?.();
    save();
    renderDeckTitle();
    msg(`Deck title saved: ${nextTitle}`);
  }

  function cancelDeckTitleEdit() {
    isEditingDeckTitle = false;
    draftDeckTitle = '';
    document.activeElement?.blur?.();
    renderDeckTitle();
  }

  function renderDeckTitleEditor() {
    const title = getTitleElement();
    if (!title) return;

    isEditingDeckTitle = true;
    draftDeckTitle = draftDeckTitle || getDeckTitle();
    title.innerHTML = '';

    const form = document.createElement('form');
    form.className = 'deck-title-editor';
    form.innerHTML = `
      <input class="deck-title-input" type="text" value="${esc(draftDeckTitle)}" aria-label="Deck title" maxlength="80" enterkeyhint="done" autocomplete="off" />
      <button class="title-icon-btn save" type="submit" title="Save deck title" aria-label="Save deck title">💾</button>
      <button class="title-icon-btn cancel" type="button" title="Cancel" aria-label="Cancel deck title edit">×</button>
    `;

    const input = form.querySelector('.deck-title-input');
    const cancel = form.querySelector('.cancel');

    form.onsubmit = event => {
      event.preventDefault();
      finishDeckTitleEdit(input.value);
    };
    cancel.onclick = cancelDeckTitleEdit;
    input.oninput = () => {
      draftDeckTitle = input.value;
    };
    input.onkeydown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        cancelDeckTitleEdit();
      }
    };

    title.appendChild(form);
    input.focus({ preventScroll: true });
    input.select();
  }

  injectDeckTitleStyles();

  const originalEnsureState = ensureState;
  ensureState = function ensureDeckTitleState(nextState) {
    const ensured = originalEnsureState(nextState);
    ensured.ui = ensured.ui || {};
    if (!ensured.ui.deckTitle) ensured.ui.deckTitle = DEFAULT_DECK_TITLE;
    return ensured;
  };

  const originalRender = render;
  render = function renderDeckTitleAwareBoard() {
    originalRender();
    if (isEditingDeckTitle) {
      const title = getTitleElement();
      if (title && !title.querySelector('.deck-title-editor')) renderDeckTitleEditor();
      return;
    }
    renderDeckTitle();
  };
})();
