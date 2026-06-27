(() => {
  function injectCommanderStyles() {
    if (document.getElementById('commanderCardStyles')) return;
    const style = document.createElement('style');
    style.id = 'commanderCardStyles';
    style.textContent = `
      .commander-badge{position:absolute;right:7px;bottom:7px;z-index:6;border:1px solid #ffffffaa;border-radius:999px;background:linear-gradient(#c4a85a,#7c641f);color:#fff;padding:5px 7px;font-size:.62rem;font-weight:1000;line-height:1;text-shadow:0 1px 2px #000;box-shadow:0 4px 12px #0009;pointer-events:none}
      .visual-commander-badge{right:6px;bottom:6px;font-size:.58rem;padding:4px 6px}
      .commander-control{margin:12px 0;padding:12px;border:1px solid #c4a85a55;border-radius:14px;background:#c4a85a18;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}
      .commander-control .modal-line{margin-bottom:0}
      @media(max-width:760px){.commander-control{grid-template-columns:1fr}.commander-control .btn{width:100%}}
    `;
    document.head.appendChild(style);
  }

  injectCommanderStyles();

  function normalizeCommanderFlags(nextState) {
    let commanderSeen = false;
    nextState.cards.forEach(card => {
      card.isCommander = Boolean(card.isCommander && !commanderSeen);
      if (card.isCommander) commanderSeen = true;
    });
    return nextState;
  }

  function getCommander() {
    return state.cards.find(card => card.isCommander) || null;
  }

  function setCommander(cardId) {
    const card = state.cards.find(item => item.id === cardId);
    if (!card) return;

    state.cards.forEach(item => {
      item.isCommander = item.id === cardId;
    });
    save();
    render();
    msg(`${card.name} set as commander.`);
  }

  function clearCommander(cardId) {
    const card = state.cards.find(item => item.id === cardId);
    if (!card) return;

    card.isCommander = false;
    save();
    render();
    msg(`${card.name} is no longer marked as commander.`);
  }

  const originalMakeCard = makeCard;
  makeCard = function makeCommanderAwareCard(entry) {
    const card = originalMakeCard(entry);
    const source = Array.isArray(entry) ? {} : entry || {};
    card.isCommander = Boolean(source.isCommander || card.isCommander);
    return card;
  };

  const originalEnsureState = ensureState;
  ensureState = function ensureCommanderAwareState(nextState) {
    return normalizeCommanderFlags(originalEnsureState(nextState));
  };

  const originalAddScryfallResult = addScryfallResult;
  addScryfallResult = function addCommanderAwareScryfallResult(result, section) {
    originalAddScryfallResult(result, section);
    const card = state.cards.find(item => norm(item.name) === norm(result.name));
    if (card && typeof card.isCommander !== 'boolean') {
      card.isCommander = false;
      save();
    }
  };

  const originalRenderCard = renderCard;
  renderCard = function renderCommanderCard(card, priority) {
    const element = originalRenderCard(card, priority);
    if (card.isCommander) {
      const badge = document.createElement('div');
      badge.className = 'commander-badge';
      badge.title = 'Commander';
      badge.textContent = 'CMD';
      element.appendChild(badge);
    }
    return element;
  };

  if (typeof renderNameStack === 'function') {
    const originalRenderNameStack = renderNameStack;
    renderNameStack = function renderCommanderNameStack(section, visible, total) {
      const stack = originalRenderNameStack(section, visible, total);
      stack.querySelectorAll('.visual-stack-card[data-id]').forEach(item => {
        const card = state.cards.find(candidate => candidate.id === item.dataset.id);
        if (card?.isCommander) {
          const badge = document.createElement('div');
          badge.className = 'commander-badge visual-commander-badge';
          badge.title = 'Commander';
          badge.textContent = 'CMD';
          item.appendChild(badge);
        }
      });
      return stack;
    };
  }

  const originalRenderStats = renderStats;
  renderStats = function renderCommanderStats() {
    originalRenderStats();
    const commander = getCommander();
    stats.insertAdjacentHTML('beforeend', `<span class="pill">Commander: ${esc(commander?.name || 'None')}</span>`);
  };

  const originalOpenModal = openModal;
  openModal = function openCommanderModal(id) {
    originalOpenModal(id);

    const card = state.cards.find(item => item.id === id);
    const actions = modalInfo.querySelector('.modal-actions');
    if (!card || !actions) return;

    const currentCommander = getCommander();
    const control = document.createElement('div');
    control.className = 'commander-control';
    control.innerHTML = `
      <div>
        <strong>Commander</strong>
        <p class="modal-line">${card.isCommander ? 'This card is marked as the commander.' : currentCommander ? `${esc(currentCommander.name)} is currently marked as commander.` : 'No commander is currently marked.'}</p>
      </div>
      <button class="btn ${card.isCommander ? 'red' : 'gold'}" type="button" id="commanderToggleBtn">${card.isCommander ? 'Unset commander' : 'Set as commander'}</button>
    `;

    actions.before(control);
    control.querySelector('#commanderToggleBtn').onclick = () => {
      if (card.isCommander) clearCommander(card.id);
      else setCommander(card.id);
      openModal(card.id);
    };
  };
})();
