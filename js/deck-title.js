(() => {
  const DEFAULT_DECK_TITLE = 'The Rotwood Accord';
  let isEditingDeckTitle = false;
  let draftDeckTitle = '';

  function injectDeckTitleStyles() {
    if (document.getElementById('deckTitleStyles')) return;
    const style = document.createElement('style');
    style.id = 'deckTitleStyles';
    style.textContent = `
      .deck-title-view{display:inline-flex;align-items:center;gap:8px;max-width:100%}
      .deck-title-text{min-width:0;overflow-wrap:anywhere}
      .deck-title-edit-btn{width:34px;height:34px;border-radius:10px;border:1px solid #ffffff22;background:#ffffff12;color:var(--muted);font-size:.9rem;font-weight:900;cursor:pointer;display:grid;place-items:center;opacity:0;transition:opacity .12s,background .12s,color .12s;flex:0 0 auto}
      .deck-title-view:hover .deck-title-edit-btn,.deck-title-edit-btn:focus{opacity:1;background:#ffffff18;color:#fff}
      .deck-title-editor{display:flex;gap:8px;align-items:center;flex-wrap:wrap;max-width:100%}
      .deck-title-input{min-height:44px;min-width:min(560px,80vw);border:1px solid var(--line);border-radius:12px;background:#ffffff12;color:var(--text);padding:8px 11px;font:inherit;font-size:clamp(1.5rem,3vw,2.6rem);font-weight:800;line-height:1.1}
      .title-icon-btn{width:42px;height:42px;border-radius:12px;border:1px solid #ffffff22;background:#ffffff14;color:#fff;font-size:1.1rem;font-weight:900;cursor:pointer;display:grid;place-items:center;flex:0 0 auto}
      .title-icon-btn:hover,.title-icon-btn:focus{filter:brightness(1.12)}
      .title-icon-btn.save{background:linear-gradient(#58b85d,#2c7534)}
      .title-icon-btn.cancel{background:linear-gradient(#d55d4d,#943124)}
      @media(hover:none){.deck-title-edit-btn{opacity:1}}
      @media(max-width:760px){.deck-title-view{display:grid;grid-template-columns:minmax(0,1fr) 38px;width:100%;align-items:start}.deck-title-edit-btn{width:38px;height:38px}.deck-title-editor{width:100%;display:grid;grid-template-columns:1fr 46px 46px;align-items:stretch}.deck-title-input{grid-column:1 / -1;min-width:0;width:100%;font-size:1.6rem}.title-icon-btn{width:46px;height:42px}.title-icon-btn.save{grid-column:2}.title-icon-btn.cancel{grid-column:3}}
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

    const wrapper = document.createElement('span');
    wrapper.className = 'deck-title-view';

    const text = document.createElement('span');
    text.className = 'deck-title-text';
    text.textContent = getDeckTitle();

    const editButton = document.createElement('button');
    editButton.className = 'deck-title-edit-btn';
    editButton.type = 'button';
    editButton.title = 'Edit deck title';
    editButton.setAttribute('aria-label', 'Edit deck title');
    editButton.textContent = '✎';
    editButton.onclick = renderDeckTitleEditor;

    wrapper.append(text, editButton);
    title.appendChild(wrapper);
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

    const wrapper = document.createElement('span');
    wrapper.className = 'deck-title-editor';

    const input = document.createElement('input');
    input.className = 'deck-title-input';
    input.type = 'text';
    input.value = draftDeckTitle;
    input.setAttribute('aria-label', 'Deck title');
    input.maxLength = 80;
    input.enterKeyHint = 'done';
    input.autocomplete = 'off';

    const saveButton = document.createElement('button');
    saveButton.className = 'title-icon-btn save';
    saveButton.type = 'button';
    saveButton.title = 'Save deck title';
    saveButton.setAttribute('aria-label', 'Save deck title');
    saveButton.textContent = '💾';

    const cancelButton = document.createElement('button');
    cancelButton.className = 'title-icon-btn cancel';
    cancelButton.type = 'button';
    cancelButton.title = 'Cancel';
    cancelButton.setAttribute('aria-label', 'Cancel deck title edit');
    cancelButton.textContent = '×';

    input.oninput = () => {
      draftDeckTitle = input.value;
    };
    input.onkeydown = event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        finishDeckTitleEdit(input.value);
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        cancelDeckTitleEdit();
      }
    };
    saveButton.onclick = () => finishDeckTitleEdit(input.value);
    cancelButton.onclick = cancelDeckTitleEdit;

    wrapper.append(input, saveButton, cancelButton);
    title.appendChild(wrapper);

    requestAnimationFrame(() => {
      input.focus({ preventScroll: true });
      input.select();
    });
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
