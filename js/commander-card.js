(() => {
  function injectCommanderStyles() {
    if (document.getElementById('commanderCardStyles')) return;
    const style = document.createElement('style');
    style.id = 'commanderCardStyles';
    style.textContent = `
      .commander-badge{position:absolute;right:7px;bottom:7px;z-index:6;border:1px solid #ffffffaa;border-radius:999px;background:linear-gradient(#c4a85a,#7c641f);color:#fff;padding:5px 7px;font-size:.62rem;font-weight:1000;line-height:1;text-shadow:0 1px 2px #000;box-shadow:0 4px 12px #0009;pointer-events:none}
      .visual-commander-badge{right:6px;bottom:6px;font-size:.58rem;padding:4px 6px}
      .commander-panel{margin-bottom:14px;padding:14px;border:1px solid #c4a85a66;border-radius:18px;background:linear-gradient(135deg,#c4a85a1f,#111f16 58%);box-shadow:var(--shadow);display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,auto);gap:14px;align-items:center}
      .commander-panel-current{display:flex;gap:12px;align-items:center;min-width:0}
      .commander-panel-icon{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto;background:linear-gradient(#c4a85a,#7c641f);font-weight:1000;box-shadow:0 8px 18px #0007}
      .commander-panel-copy{min-width:0}
      .commander-panel-label{font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);font-weight:1000}
      .commander-panel-name{font-size:1.05rem;font-weight:1000;overflow-wrap:anywhere}
      .commander-panel-detail{margin-top:3px;color:var(--muted);font-size:.82rem;line-height:1.35}
      .commander-panel-warning{color:#f0b6aa}
      .commander-panel-actions{display:grid;grid-template-columns:minmax(190px,1fr) auto;gap:8px;align-items:center}
      .commander-panel-buttons{display:flex;gap:8px;justify-content:flex-end;grid-column:1 / -1}
      .commander-panel-note{grid-column:1 / -1;color:var(--muted);font-size:.76rem;line-height:1.35}
      .commander-control{margin:12px 0;padding:12px;border:1px solid #c4a85a55;border-radius:14px;background:#c4a85a18;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}
      .commander-control.ineligible{border-color:#d55d4d55;background:#d55d4d12}
      .commander-control.unknown{border-color:#4f85d855;background:#4f85d812}
      .commander-control .modal-line{margin-bottom:0}
      @media(max-width:900px){.commander-panel{grid-template-columns:1fr}.commander-panel-actions{grid-template-columns:minmax(0,1fr) auto}}
      @media(max-width:760px){.commander-panel-current{align-items:flex-start}.commander-panel-actions{grid-template-columns:1fr}.commander-panel-actions .btn,.commander-panel-actions .select{width:100%}.commander-panel-buttons{display:grid;grid-template-columns:1fr;grid-column:1}.commander-control{grid-template-columns:1fr}.commander-control .btn{width:100%}}
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

  function getScryfallFaces(scryfall) {
    const faces = Array.isArray(scryfall?.card_faces) ? scryfall.card_faces : [];
    return [scryfall, ...faces].filter(Boolean);
  }

  function getCommanderEligibility(card) {
    const scryfall = card?.scryfall;
    if (!scryfall) {
      return {
        status: 'unknown',
        reason: card?.error
          ? 'Scryfall data could not be loaded, so commander eligibility cannot be verified.'
          : 'Load Scryfall data to verify whether this card can be a commander.'
      };
    }

    const commanderLegality = scryfall.legalities?.commander;
    if (!commanderLegality) {
      return {
        status: 'unknown',
        reason: 'Commander legality is unavailable in the loaded card data.'
      };
    }

    if (commanderLegality !== 'legal') {
      return {
        status: 'ineligible',
        reason: commanderLegality === 'banned'
          ? 'This card is banned in Commander.'
          : 'This card is not legal in Commander.'
      };
    }

    const faces = getScryfallFaces(scryfall);
    const legendaryCreature = faces.some(face => {
      const typeLine = face.type_line || '';
      return /\bLegendary\b/i.test(typeLine) && /\bCreature\b/i.test(typeLine);
    });

    const explicitlyAllowed = faces.some(face =>
      /\bcan be your commander\b/i.test(face.oracle_text || '')
    );

    const legendaryVehicleOrSpacecraft = faces.some(face => {
      const typeLine = face.type_line || '';
      const hasPowerToughness = face.power !== undefined
        && face.power !== null
        && face.toughness !== undefined
        && face.toughness !== null;
      return /\bLegendary\b/i.test(typeLine)
        && /\b(?:Vehicle|Spacecraft)\b/i.test(typeLine)
        && hasPowerToughness;
    });

    if (legendaryCreature || explicitlyAllowed || legendaryVehicleOrSpacecraft) {
      return {
        status: 'eligible',
        reason: legendaryCreature
          ? 'Legendary creature'
          : explicitlyAllowed
            ? 'Oracle text allows this card to be your commander'
            : 'Legendary Vehicle or Spacecraft with power and toughness'
      };
    }

    return {
      status: 'ineligible',
      reason: 'This card is not a legendary creature and does not otherwise qualify as a commander.'
    };
  }

  function getEligibleCommanderCards() {
    return state.cards
      .filter(card => getCommanderEligibility(card).status === 'eligible')
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function setCommander(cardId) {
    const card = state.cards.find(item => item.id === cardId);
    if (!card) return false;

    const eligibility = getCommanderEligibility(card);
    if (eligibility.status !== 'eligible') {
      msg(eligibility.reason);
      return false;
    }

    state.cards.forEach(item => {
      item.isCommander = item.id === cardId;
    });
    save();
    render();
    msg(`${card.name} set as commander.`);
    return true;
  }

  function clearCommander(cardId) {
    const card = state.cards.find(item => item.id === cardId);
    if (!card) return false;

    card.isCommander = false;
    save();
    render();
    msg(`${card.name} is no longer marked as commander.`);
    return true;
  }

  function ensureCommanderPanel() {
    let panel = document.getElementById('commanderPanel');
    if (panel) return panel;

    const toolbar = document.querySelector('.toolbar');
    if (!toolbar?.parentNode) return null;

    panel = document.createElement('section');
    panel.id = 'commanderPanel';
    panel.className = 'commander-panel';
    toolbar.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function renderCommanderPanel() {
    const panel = ensureCommanderPanel();
    if (!panel) return;

    const commander = getCommander();
    const commanderEligibility = commander ? getCommanderEligibility(commander) : null;
    const eligibleCards = getEligibleCommanderCards();
    const unknownCount = state.cards.filter(card => getCommanderEligibility(card).status === 'unknown').length;

    const candidateOptions = eligibleCards.length
      ? eligibleCards.map(card => `<option value="${esc(card.id)}">${esc(card.name)} — ${esc(sectionTitle(card.section))}</option>`).join('')
      : '<option value="">No eligible loaded cards</option>';

    const currentDetail = commander
      ? `${esc(sectionTitle(commander.section))}${commanderEligibility?.status !== 'eligible' ? ` · <span class="commander-panel-warning">${esc(commanderEligibility.reason)}</span>` : ''}`
      : 'No commander selected';

    panel.innerHTML = `
      <div class="commander-panel-current">
        <div class="commander-panel-icon" aria-hidden="true">CMD</div>
        <div class="commander-panel-copy">
          <div class="commander-panel-label">Commander</div>
          <div class="commander-panel-name">${esc(commander?.name || 'Choose a commander')}</div>
          <div class="commander-panel-detail">${currentDetail}</div>
        </div>
      </div>
      <div class="commander-panel-actions">
        <select class="select" id="commanderCandidateSelect" aria-label="Choose an eligible commander" ${eligibleCards.length ? '' : 'disabled'}>
          ${candidateOptions}
        </select>
        <button class="btn gold" id="commanderSetBtn" type="button" ${eligibleCards.length ? '' : 'disabled'}>${commander ? 'Change commander' : 'Set commander'}</button>
        <div class="commander-panel-buttons">
          ${commander ? '<button class="btn blue" id="commanderOpenBtn" type="button">Open commander</button><button class="btn red" id="commanderUnsetBtn" type="button">Unset commander</button>' : ''}
        </div>
        <div class="commander-panel-note">${unknownCount ? `${unknownCount} card${unknownCount === 1 ? '' : 's'} still need Scryfall data before eligibility can be checked.` : 'Only commander-eligible cards are listed.'}</div>
      </div>
    `;

    const select = panel.querySelector('#commanderCandidateSelect');
    const setButton = panel.querySelector('#commanderSetBtn');

    if (commander && eligibleCards.some(card => card.id === commander.id)) {
      select.value = commander.id;
      setButton.disabled = true;
    }

    select?.addEventListener('change', () => {
      setButton.disabled = !select.value || select.value === commander?.id;
    });

    setButton?.addEventListener('click', () => {
      if (select?.value) setCommander(select.value);
    });

    panel.querySelector('#commanderOpenBtn')?.addEventListener('click', () => {
      if (commander) openModal(commander.id);
    });

    panel.querySelector('#commanderUnsetBtn')?.addEventListener('click', () => {
      if (commander) clearCommander(commander.id);
    });
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
    renderCommanderPanel();
  };

  const originalOpenModal = openModal;
  openModal = function openCommanderModal(id) {
    originalOpenModal(id);

    const card = state.cards.find(item => item.id === id);
    const actions = modalInfo.querySelector('.modal-actions');
    if (!card || !actions) return;

    const currentCommander = getCommander();
    const eligibility = getCommanderEligibility(card);
    const control = document.createElement('div');
    control.className = `commander-control ${eligibility.status}`;

    let description = eligibility.reason;
    let buttonHtml = '';

    if (card.isCommander) {
      description = 'This card is currently marked as the commander.';
      buttonHtml = '<button class="btn red" type="button" id="commanderToggleBtn">Unset commander</button>';
    } else if (eligibility.status === 'eligible') {
      description = currentCommander
        ? `${currentCommander.name} is currently marked as commander. Selecting this card will replace it.`
        : eligibility.reason;
      buttonHtml = '<button class="btn gold" type="button" id="commanderToggleBtn">Set as commander</button>';
    }

    control.innerHTML = `
      <div>
        <strong>Commander eligibility</strong>
        <p class="modal-line">${esc(description)}</p>
      </div>
      ${buttonHtml}
    `;

    actions.before(control);
    control.querySelector('#commanderToggleBtn')?.addEventListener('click', () => {
      const changed = card.isCommander
        ? clearCommander(card.id)
        : setCommander(card.id);
      if (changed) openModal(card.id);
    });
  };
})();
