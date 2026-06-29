(() => {
  const DEFAULT_DECK_TITLE = 'The Rotwood Accord';
  const TITLE_ROW_ID = 'deckTitleRow';
  const TITLE_TEXT_ID = 'deckTitleText';
  const TITLE_EDIT_ID = 'deckTitleEditBtn';

  let isEditingDeckTitle = false;
  let draftDeckTitle = null;

  function injectDeckTitleStyles() {
    if (document.getElementById('deckTitleStyles')) return;
    const style = document.createElement('style');
    style.id = 'deckTitleStyles';
    style.textContent = `
      .deck-title-row{display:inline-grid;grid-template-columns:minmax(0,auto) 38px;align-items:start;gap:8px;max-width:100%}
      .deck-title-row h1{min-width:0;overflow-wrap:anywhere}
      .deck-title-edit-btn{width:38px;height:38px;border-radius:10px;border:1px solid #ffffff22;background:#ffffff12;color:var(--muted);font-size:.95rem;font-weight:900;cursor:pointer;display:grid;place-items:center;opacity:1;transition:opacity .12s,background .12s,color .12s;touch-action:manipulation;-webkit-user-select:none;user-select:none}
      .deck-title-edit-btn:hover,.deck-title-edit-btn:focus{background:#ffffff18;color:#fff}
      .deck-title-editor{display:grid;grid-template-columns:minmax(0,1fr) 42px 42px;gap:8px;align-items:center;max-width:min(680px,100%)}
      .deck-title-input{min-height:44px;min-width:0;border:1px solid var(--line);border-radius:12px;background:#ffffff12;color:var(--text);padding:8px 11px;font:inherit;font-size:clamp(1.5rem,3vw,2.6rem);font-weight:800;line-height:1.1;width:100%}
      .title-icon-btn{width:42px;height:42px;border-radius:12px;border:1px solid #ffffff22;background:#ffffff14;color:#fff;font-size:1.1rem;font-weight:900;cursor:pointer;display:grid;place-items:center;touch-action:manipulation;-webkit-user-select:none;user-select:none}
      .title-icon-btn:hover,.title-icon-btn:focus{filter:brightness(1.12)}
      .title-icon-btn.save{background:linear-gradient(#58b85d,#2c7534)}
      .title-icon-btn.cancel{background:linear-gradient(#d55d4d,#943124)}
      @media(hover:hover) and (pointer:fine){.deck-title-edit-btn{opacity:0}.deck-title-row:hover .deck-title-edit-btn,.deck-title-edit-btn:focus{opacity:1}}
      @media(max-width:760px){.deck-title-row{display:grid;grid-template-columns:minmax(0,1fr) 42px;width:100%;align-items:start}.deck-title-edit-btn{width:42px;height:42px}.deck-title-editor{width:100%;max-width:100%;grid-template-columns:minmax(0,1fr) 46px 46px}.deck-title-input{grid-column:1 / -1;font-size:1.6rem}.title-icon-btn{width:46px;height:42px}.title-icon-btn.save{grid-column:2}.title-icon-btn.cancel{grid-column:3}}
    `;
    document.head.appendChild(style);
  }

  function getDeckTitle() {
    const value = state?.ui?.deckTitle;
    return typeof value === 'string' && value.trim() ? value.trim() : DEFAULT_DECK_TITLE;
  }

  function setBrowserTitle(nextTitle) {
    document.title = `${nextTitle} - Scryfall Candidate Board`;
  }

  function getTitleRow() {
    return document.getElementById(TITLE_ROW_ID);
  }

  function ensureTitleRow() {
    const existing = getTitleRow();
    if (existing) return existing;

    const oldTitle = document.querySelector('.hero h1');
    if (!oldTitle) return null;

    const row = document.createElement('div');
    row.className = 'deck-title-row';
    row.id = TITLE_ROW_ID;
    oldTitle.replaceWith(row);
    return row;
  }

  function bindEditButton(button) {
    if (!button) return;
    button.onclick = startDeckTitleEdit;
  }

  function renderDeckTitle() {
    if (isEditingDeckTitle) return;

    const row = ensureTitleRow();
    if (!row) return;

    const titleText = getDeckTitle();
    row.className = 'deck-title-row';
    row.innerHTML = '';

    const heading = document.createElement('h1');
    heading.id = TITLE_TEXT_ID;
    heading.textContent = titleText;

    const editButton = document.createElement('button');
    editButton.className = 'deck-title-edit-btn';
    editButton.id = TITLE_EDIT_ID;
    editButton.type = 'button';
    editButton.title = 'Edit deck title';
    editButton.setAttribute('aria-label', 'Edit deck title');
    editButton.textContent = '✎';
    bindEditButton(editButton);

    row.append(heading, editButton);
    setBrowserTitle(titleText);
  }

  function focusTitleInput(input) {
    input.focus({ preventScroll: true });
    const isFinePointer = window.matchMedia?.('(pointer:fine)').matches;
    if (isFinePointer) {
      input.select();
      return;
    }
    const end = input.value.length;
    input.setSelectionRange?.(end, end);
  }

  function finishDeckTitleEdit(value) {
    const nextTitle = value.trim() || DEFAULT_DECK_TITLE;
    state.ui = state.ui || {};
    state.ui.deckTitle = nextTitle;
    isEditingDeckTitle = false;
    draftDeckTitle = null;
    document.activeElement?.blur?.();
    save();
    renderDeckTitle();
    msg(`Deck title saved: ${nextTitle}`);
  }

  function cancelDeckTitleEdit() {
    isEditingDeckTitle = false;
    draftDeckTitle = null;
    document.activeElement?.blur?.();
    renderDeckTitle();
  }

  function renderDeckTitleEditor() {
    const row = ensureTitleRow();
    if (!row) return;

    if (draftDeckTitle === null) draftDeckTitle = getDeckTitle();
    row.className = 'deck-title-row deck-title-editor';
    row.innerHTML = '';

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

    row.append(input, saveButton, cancelButton);
    focusTitleInput(input);
  }

  function startDeckTitleEdit() {
    if (isEditingDeckTitle) return;
    draftDeckTitle = getDeckTitle();
    isEditingDeckTitle = true;
    renderDeckTitleEditor();
  }

  injectDeckTitleStyles();
  bindEditButton(document.getElementById(TITLE_EDIT_ID));

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
      const row = ensureTitleRow();
      if (row && !row.querySelector('.deck-title-input')) renderDeckTitleEditor();
      return;
    }
    renderDeckTitle();
  };
})();
