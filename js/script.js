const STORAGE_KEY = 'rotwood-accord-board-v2';

const sections = [
  { id: 'main', title: 'Main V1 Pool', subtitle: 'Cards still competing for the first version.' },
  { id: 'maybe', title: 'Maybeboard', subtitle: 'Good cards, meta cards, or cards waiting for testing.' },
  { id: 'module', title: 'Modules / Combo Packages', subtitle: 'Swap-in packages like Food, Morcant, Underrealm, or heavy graveyard.' },
  { id: 'cut', title: 'Cut / Avoid', subtitle: 'Removed from V1, off-color, too weak, or not fitting.' }
];

const seed = [
  ['Chatterfang, Squirrel General', 'main', 'Core / likely commander', 'Squirrel/token/sacrifice engine'],
  ['Llanowar Elves', 'main', 'Core', '1-mana ramp'], ['Elvish Mystic', 'main', 'Core', '1-mana ramp'], ['Fyndhorn Elves', 'main', 'Core', '1-mana ramp'], ['Arbor Elf', 'main', 'Strong candidate', 'Forest untap ramp'], ['Priest of Titania', 'main', 'Core', 'Massive Elf mana engine'], ['Elvish Archdruid', 'main', 'Core', 'Elf lord + huge mana'], ['Marwyn, the Nurturer', 'main', 'Strong V1', 'Scaling mana engine'], ['Imperious Perfect', 'main', 'Strong V1', 'Elf lord + token maker'], ["Dwynen's Elite", 'main', 'Strong V1', 'Cheap two-body Elf play'], ['Elvish Warmaster', 'main', 'Strong candidate', 'Elf token engine + pump'], ['Dionus, Elvish Archdruid', 'main', 'Strong candidate', 'Elf untap / counter synergy'], ['Leaf-Crowned Visionary', 'main', 'Strong V1', 'Elf lord + draw'], ['Tyvar Kell', 'main', 'Strong candidate', 'Elf planeswalker engine'], ['Dwynen, Gilt-Leaf Daen', 'main', 'Candidate', 'Elf lord, reach, lifegain'], ['Joraga Warcaller', 'main', 'Strong candidate', 'Scalable Elf anthem'], ['Elvish Champion', 'maybe', 'Maybe', 'Elf buff + forestwalk'],
  ['Ravenous Squirrel', 'main', 'Strong V1', 'Sacrifice payoff'], ['Drey Keeper', 'main', 'Strong V1', 'Squirrels + menace'], ['Deranged Hermit', 'main', 'Strong V1', 'ETB squirrel burst'], ['Deep Forest Hermit', 'main', 'Strong V1', 'ETB squirrel burst + vanishing'], ['Squirrel Nest', 'main', 'Strong candidate', 'Repeatable squirrel production'], ['Scurry of Squirrels', 'main', 'Strong candidate', 'Multiplayer squirrel scaling'], ['The Odd Acorn Gang', 'main', 'Strong candidate', 'Squirrel combat + draw'], ['Valley Rotcaller', 'main', 'Strong candidate', 'Squirrel attrition pressure'], ['Camellia, the Seedmiser', 'main', 'Strong V1 / module', 'Food/sacrifice/squirrel engine'], ['Squirrel Sovereign', 'main', 'Candidate', 'Squirrel lord'], ['Scurry Oak', 'main', 'Candidate', 'Counter/squirrel combo potential'], ['Chitterspitter', 'main', 'Candidate', 'Squirrel token scaling'], ['Chatter of the Squirrel', 'main', 'Maybe', 'Cheap squirrel + flashback'], ['Acorn Harvest', 'main', 'Maybe', 'Squirrel bodies + flashback'], ['Squirrel Mob', 'main', 'Finisher candidate', 'Huge squirrel; works with Taunting Elf/Jarad'],
  ["Nadier's Nightblade", 'main', 'Strong V1', 'Tokens leaving drain each opponent'], ['Poison-Tip Archer', 'main', 'Strong V1', 'Reach, deathtouch, death drain'], ['Prowess of the Fair', 'main', 'Strong V1', 'Nontoken Elf death creates Elf token'], ['Elderfang Venom', 'main', 'Strong candidate', 'Elf deathtouch + death drain'], ['Dictate of Erebos', 'main', 'Strong candidate', 'Sacrifice punishment'], ['Moldervine Reclamation', 'main', 'Strong candidate', 'Creature death draw + lifegain'], ['Jarad, Golgari Lich Lord', 'main', 'Strong V1 / finisher', 'Sacrifice big creatures for table damage'], ['Savra, Queen of the Golgari', 'maybe', 'Maybe', 'Color-based sacrifice payoff'],
  ['Skullclamp', 'main', 'Core', 'Token draw engine'], ['Beast Whisperer', 'main', 'Strong V1', 'Draw on creature casts'], ['Guardian Project', 'main', 'Strong candidate', 'Creature ETB draw'], ['Realmwalker', 'main', 'Strong candidate', 'Tribal top-deck casting'], ['Miara, Thorn of the Glade', 'main', 'Strong candidate', 'Optional draw when Elves die'], ['Skemfar Shadowsage', 'main', 'Strong candidate', 'Elf-count drain/lifegain'], ['Wardens of the Cycle', 'maybe', 'Maybe', 'Morbid draw/lifegain'],
  ['Meren of Clan Nel Toth', 'main', 'Strong V1', 'Long-game creature recursion'], ['Phyrexian Reclamation', 'main', 'Strong V1', 'Repeatable creature recursion'], ['Golgari Findbroker', 'main', 'Strong V1', 'Permanent recursion'], ['Eternal Witness', 'main', 'Strong candidate', 'Universal recursion'], ['Regrowth', 'main', 'Strong candidate', 'Universal card recovery'], ['Animate Dead', 'main', 'Strong candidate', 'Reanimation'], ['Necromancy', 'main', 'Strong candidate', 'Flexible reanimation'], ['Elderfang Ritualist', 'main', 'Strong candidate', 'Elf recursion on death'], ["Morcant's Loyalist", 'main', 'Strong candidate / verify', 'Elf recursion/support'],
  ['Heroic Intervention', 'main', 'Core', 'Hexproof + indestructible'], ['Golgari Charm', 'main', 'Strong V1', 'Regenerate / shrink / destroy enchantment'], ['Asceticism', 'main', 'Strong candidate', 'Team hexproof + regeneration'], ['Selfless Safewright', 'main', 'Strong candidate / verify', 'Flash/convoke tribal protection'], ['Swiftfoot Boots', 'main', 'Strong utility', 'Haste + hexproof'], ['Allosaurus Shepherd', 'main', 'Premium candidate', 'Anti-counterspell + Elf finisher'], ['Wrap in Vigor', 'maybe', 'Maybe', 'Team regeneration'], ['Veil of Summer', 'maybe', 'Meta candidate', 'Anti-blue/black protection'], ['Destiny Spinner', 'maybe', 'Meta candidate', 'Anti-counterspell protection'], ['Perpetual Timepiece', 'maybe', 'Maybe', 'Anti-graveyard exile'],
  ['Spidersilk Armor', 'main', 'Strong candidate', 'Team reach'], ['Sharpshooter Elf', 'main', 'Candidate / verify', 'Anti-flying Elf'], ['Elvish Skysweeper', 'main', 'Candidate', 'Reach + destroy flyer'], ['Jagged-Scar Archers', 'main', 'Candidate', 'Reach, scales with Elves'], ['Arachnogenesis', 'maybe', 'Strong maybe', 'Anti-combat blowout'], ['Gravity Well', 'maybe', 'Maybe', 'Punishes attacking flyers'], ['Galadhrim Ambush', 'maybe', 'Strong maybe', 'Elf token burst + combat prevention'],
  ['Craterhoof Behemoth', 'main', 'Strong finisher', 'Massive team pump + trample'], ['Beastmaster Ascension', 'main', 'Strong finisher', 'Go-wide pump'], ['Shaman of the Pack', 'main', 'Strong V1', 'Elf-count drain finisher'], ['Ezuri, Renegade Leader', 'main', 'Strong candidate', 'Elf regen + Overrun'], ['Abomination of Llanowar', 'main', 'Strong candidate', 'Huge Elf/graveyard threat'], ['Tyvar the Bellicose', 'main', 'Strong candidate', 'Elf combat scaling'], ['Ochran Assassin', 'main', 'Candidate', 'Deathtouch forced-block attacker'], ['Imaryll, Elfhame Elite', 'maybe', 'Maybe finisher', 'Elf-count combat threat'], ['Taunting Elf', 'main', 'Finisher package candidate', 'Pull blockers from Squirrel Mob'],
  ['Maskwood Nexus', 'main', 'Strong V1', 'All creatures are every creature type'], ['Conspiracy', 'maybe', 'Strong maybe', 'Name Elf; tribal conversion'], ['Beast Within', 'main', 'Strong V1', 'Universal permanent removal'], ['Deathrite Shaman', 'main', 'Strong utility', 'Graveyard hate, fixing, drain'], ["Conjurer's Closet", 'maybe', 'Maybe', 'Reuse ETB effects'], ['Eclipsed Elf', 'maybe', 'Maybe', 'Finds Elf, Swamp, or Forest'], ['Glissa, the Traitor', 'maybe', 'Maybe', 'Artifact recursion'], ['Glissa Sunslayer', 'maybe', 'Maybe', 'Combat value / removal'], ['Harald, King of Skemfar', 'maybe', 'Maybe', 'Finds Elf, Warrior, or Tyvar'],
  ['High Perfect Morcant', 'module', 'Combo module', 'Blight / proliferate Elf engine'], ['Flourishing Defenses', 'module', 'Combo module', '-1/-1 counter creates Elf token'], ["Hazel's Brewmaster", 'module', 'Food module', 'Food gains activated abilities'], ['Underrealm Lich', 'module', 'Value module', 'Draw replacement + graveyard filling'], ['Sylvan Library', 'module', 'Value module', 'Card selection'], ['Nath of the Gilt-Leaf', 'module', 'Discard module', 'Discard + Elf tokens'], ['Maralen of the Mornsong', 'module', 'High-risk module', 'Draw lock / forced tutor'], ['Kagha, Shadow Archdruid', 'module', 'Graveyard module', 'Self-mill + graveyard value'], ['Twilight Diviner', 'module', 'Graveyard module', 'Surveil + graveyard-copy value'], ['Izoni, Thousand-Eyed', 'module', 'Graveyard module', 'Token burst + sacrifice draw'], ['Izoni, Center of the Web', 'module', 'Token/value module', 'Tokens, reach, surveil, draw'], ['Shadowheart, Dark Justiciar', 'module', 'Sacrifice draw module', 'Sacrifice creature to draw'], ['Cloakwood Hermit', 'module', 'Background module', 'Squirrel generation'],
  ['Rofellos, Llanowar Emissary', 'cut', 'Cut', 'Banned in Commander'], ['Arcane Adaptation', 'cut', 'Cut', 'Blue; outside Golgari'], ['Archetype of Imagination', 'cut', 'Cut', 'Blue; outside Golgari'], ['Ilharg, the Raze-Boar', 'cut', 'Cut', 'Red; outside Golgari'], ['Elvish Piper', 'cut', 'Cut from V1', 'Not a creature-cheat deck'], ['Norwood Priestess', 'cut', 'Cut from V1', 'Too far from core plan'], ['Quicksilver Amulet', 'cut', 'Cut from V1', 'Not needed in V1'], ['Nut Collector', 'cut', 'Cut from V1', 'Too slow at six mana'], ['Acorn Catapult', 'cut', 'Cut from V1', 'Flavorful but slow'], ['Primal Vigor', 'cut', 'Cut from V1', 'Symmetrical doubler'], ['Skemfar Avenger', 'cut', 'Cut', 'Life loss + misses token deaths'], ['Twinblade Assassins', 'cut', 'Cut', 'Too slow'], ['Dark Ritual', 'cut', 'Cut from V1', 'One-shot burst'], ['Sandwurm Convergence', 'cut', 'Cut from V1', 'Too expensive'], ['Tower Defense', 'cut', 'Cut from V1', 'One-shot defense'], ['Elven Bow', 'cut', 'Cut from V1', 'Weaker flyer defense'], ['Creeping Renaissance', 'cut', 'Cut from V1', 'Too slow']
];

function makeCard([name, section, status, role]) {
  return { id: crypto.randomUUID(), name, section, status, role, scryfall: null, error: null };
}

let state = load();
let dragged = null;
let modalCardId = null;

const board = document.getElementById('board');
const search = document.getElementById('search');
const filter = document.getElementById('filter');
const stats = document.getElementById('stats');
const toast = document.getElementById('toast');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalInfo = document.getElementById('modalInfo');
const searchPanel = document.getElementById('searchPanel');
const searchResults = document.getElementById('searchResults');
const searchTitle = document.getElementById('searchTitle');

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.cards)) return ensureState(parsed);
    }
  } catch (error) {
    console.warn('Could not load saved board state.', error);
  }
  return ensureState({ cards: seed.map(makeCard) });
}

function ensureState(nextState) {
  nextState.cards = Array.isArray(nextState.cards) ? nextState.cards : seed.map(makeCard);
  nextState.ui = nextState.ui || {};
  nextState.ui.stacked = nextState.ui.stacked || { cut: true };
  for (const section of sections) {
    if (typeof nextState.ui.stacked[section.id] !== 'boolean') {
      nextState.ui.stacked[section.id] = section.id === 'cut';
    }
  }
  return nextState;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function norm(value) {
  return String(value || '').toLowerCase().trim();
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function img(card, size = 'normal') {
  const scryfall = card?.scryfall;
  if (!scryfall) return null;
  return scryfall.image_uris?.[size]
    || scryfall.image_uris?.normal
    || scryfall.image_uris?.small
    || scryfall.card_faces?.[0]?.image_uris?.[size]
    || scryfall.card_faces?.[0]?.image_uris?.normal
    || scryfall.card_faces?.[0]?.image_uris?.small
    || null;
}

function tagClass(status) {
  const normalized = norm(status);
  if (normalized.includes('core') || normalized.includes('strong') || normalized.includes('premium')) return 'strong';
  if (normalized.includes('module')) return 'module';
  if (normalized.includes('maybe') || normalized.includes('candidate') || normalized.includes('verify')) return 'maybe';
  return '';
}

function sectionTitle(id) {
  return sections.find(section => section.id === id)?.title || id;
}

function getSectionCards(sectionId) {
  return state.cards.filter(card => card.section === sectionId);
}

function getPriority(card) {
  return getSectionCards(card.section).findIndex(item => item.id === card.id) + 1;
}

function render() {
  const query = norm(search.value);
  const sectionFilter = filter.value;
  board.innerHTML = '';

  sections.forEach(section => {
    const col = document.createElement('section');
    col.className = 'col';
    col.dataset.sec = section.id;

    const all = getSectionCards(section.id);
    const visible = all.filter(card =>
      (sectionFilter === 'all' || card.section === sectionFilter)
      && (!query || [
        card.name,
        card.status,
        card.role,
        card.scryfall?.type_line,
        card.scryfall?.oracle_text,
        card.scryfall?.set_name
      ].some(value => norm(value).includes(query)))
    );

    const isStacked = state.ui.stacked[section.id];
    col.innerHTML = `<div class="col-head"><div class="col-title"><h2>${section.title}</h2><div class="head-actions"><span class="count">${all.length}</span><button class="btn stack-toggle" data-stack="${section.id}">${isStacked ? 'Unstack' : 'Stack'}</button></div></div><p>${section.subtitle}</p></div><div class="cards ${isStacked ? 'stacked' : ''}"></div>`;
    col.querySelector('[data-stack]').onclick = () => {
      state.ui.stacked[section.id] = !state.ui.stacked[section.id];
      save();
      render();
    };

    const cards = col.querySelector('.cards');
    if (isStacked) {
      cards.appendChild(renderStack(section, visible, all.length));
    } else {
      visible.forEach(card => cards.appendChild(renderCard(card, getPriority(card))));
    }

    enableDrop(col, section.id);
    board.appendChild(col);
  });

  renderStats();
}

function renderStack(section, visible, total) {
  const el = document.createElement('div');
  el.className = 'stack-card';
  el.title = 'Click to unstack this pile';
  el.innerHTML = `<div class="stack-count">${total}</div><div class="stack-label">${section.title}</div><div class="stack-hint">Stacked pile. Click to unstack. Drag cards here to add to this section.</div>`;
  el.onclick = () => {
    state.ui.stacked[section.id] = false;
    save();
    render();
  };
  return el;
}

function renderCard(card, priority) {
  const el = document.createElement('article');
  el.className = 'card';
  el.draggable = true;
  el.dataset.id = card.id;
  el.dataset.priority = priority;

  const imageUrl = img(card);
  const type = card.scryfall?.type_line || 'Not loaded yet';
  const mana = card.scryfall?.mana_cost || '';

  el.innerHTML = `<div class="priority-badge" title="Priority in this section">#${priority}</div><div class="pic">${imageUrl ? `<img src="${imageUrl}" alt="${esc(card.name)}" loading="lazy">` : `<span>${esc(card.error || 'Image not loaded')}</span>`}</div><div class="quick"><button class="icon" title="Open on Scryfall">↗</button><button class="icon" title="Delete">×</button></div><div class="foot"><div class="name">${esc(card.name)}</div><div class="tags">${mana ? `<span class="tag">${esc(mana)}</span>` : ''}<span class="tag ${tagClass(card.status)}">${esc(card.status)}</span><span class="tag">${esc(type)}</span></div></div>`;

  el.addEventListener('click', event => {
    if (event.target.closest('.quick')) return;
    openModal(card.id);
  });
  el.addEventListener('dragstart', event => {
    dragged = card.id;
    el.classList.add('dragging');
    event.dataTransfer.setData('text/plain', card.id);
    event.dataTransfer.effectAllowed = 'move';
  });
  el.addEventListener('dragover', event => {
    if (!dragged || dragged === card.id) return;
    event.preventDefault();
    event.stopPropagation();
    showCardDropIndicator(el, getCardDropPosition(event, el));
  });
  el.addEventListener('dragleave', () => clearCardDropIndicator(el));
  el.addEventListener('drop', event => {
    if (!dragged || dragged === card.id) return;
    event.preventDefault();
    event.stopPropagation();
    const position = getCardDropPosition(event, el);
    cleanupDropIndicators();
    const moved = moveCard(dragged, card.section, card.id, position);
    if (moved) msg(`${moved.name} moved ${position} ${card.name}.`);
  });
  el.addEventListener('dragend', () => {
    dragged = null;
    el.classList.remove('dragging');
    document.querySelectorAll('.col.over').forEach(column => column.classList.remove('over'));
    cleanupDropIndicators();
  });

  const [openBtn, deleteBtn] = el.querySelectorAll('.icon');
  openBtn.onclick = event => {
    event.stopPropagation();
    window.open(card.scryfall?.scryfall_uri || `https://scryfall.com/search?q=${encodeURIComponent('!"' + card.name + '"')}`, '_blank', 'noopener,noreferrer');
  };
  deleteBtn.onclick = event => {
    event.stopPropagation();
    if (confirm(`Delete ${card.name}?`)) {
      state.cards = state.cards.filter(item => item.id !== card.id);
      save();
      render();
    }
  };

  return el;
}

function getCardDropPosition(event, cardElement) {
  const rect = cardElement.getBoundingClientRect();
  return event.clientY > rect.top + rect.height / 2 ? 'after' : 'before';
}

function showCardDropIndicator(cardElement, position) {
  cardElement.classList.toggle('drop-before', position === 'before');
  cardElement.classList.toggle('drop-after', position === 'after');
}

function clearCardDropIndicator(cardElement) {
  cardElement.classList.remove('drop-before', 'drop-after');
}

function cleanupDropIndicators() {
  document.querySelectorAll('.card.drop-before, .card.drop-after').forEach(clearCardDropIndicator);
}

function moveCard(cardId, targetSection, targetId = null, position = 'end') {
  if (!cardId || cardId === targetId) return null;

  const sourceIndex = state.cards.findIndex(card => card.id === cardId);
  if (sourceIndex < 0) return null;

  const [card] = state.cards.splice(sourceIndex, 1);
  card.section = targetSection;

  let insertIndex = state.cards.length;
  if (targetId) {
    const targetIndex = state.cards.findIndex(item => item.id === targetId);
    if (targetIndex >= 0) {
      insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
    }
  } else {
    const lastInSection = state.cards.map((item, index) => item.section === targetSection ? index : -1).filter(index => index >= 0).at(-1);
    insertIndex = typeof lastInSection === 'number' ? lastInSection + 1 : state.cards.length;
  }

  state.cards.splice(insertIndex, 0, card);
  save();
  render();
  return card;
}

function enableDrop(col, sectionId) {
  col.addEventListener('dragover', event => {
    event.preventDefault();
    col.classList.add('over');
  });
  col.addEventListener('dragleave', event => {
    if (!col.contains(event.relatedTarget)) col.classList.remove('over');
  });
  col.addEventListener('drop', event => {
    event.preventDefault();
    cleanupDropIndicators();
    const id = event.dataTransfer.getData('text/plain') || dragged;
    const moved = moveCard(id, sectionId);
    if (moved) msg(`${moved.name} moved to the end of ${sectionTitle(sectionId)}.`);
  });
}

function renderStats() {
  const counts = Object.fromEntries(sections.map(section => [section.id, state.cards.filter(card => card.section === section.id).length]));
  const loaded = state.cards.filter(card => card.scryfall).length;
  stats.innerHTML = `<span class="pill">Total: ${state.cards.length}</span><span class="pill">Main: ${counts.main}</span><span class="pill">Maybe: ${counts.maybe}</span><span class="pill">Modules: ${counts.module}</span><span class="pill">Cut: ${counts.cut}</span><span class="pill">Images: ${loaded}/${state.cards.length}</span>`;
}

async function sfNamed(name, exact = true) {
  const mode = exact ? 'exact' : 'fuzzy';
  const response = await fetch(`https://api.scryfall.com/cards/named?${mode}=${encodeURIComponent(name)}`);
  if (!response.ok) {
    let json = null;
    try { json = await response.json(); } catch {}
    throw new Error(json?.details || `Scryfall could not find ${name}`);
  }
  return response.json();
}

async function sfSearch(query) {
  const clean = query.trim();
  if (!clean) return [];
  const q = /[!:<>=]/.test(clean) ? `game:paper (${clean})` : `game:paper ${clean}`;
  const response = await fetch(`https://api.scryfall.com/cards/search?unique=cards&order=name&q=${encodeURIComponent(q)}`);
  if (!response.ok) {
    let json = null;
    try { json = await response.json(); } catch {}
    throw new Error(json?.details || 'No Scryfall results.');
  }
  const data = await response.json();
  return data.data || [];
}

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function loadImages() {
  const list = state.cards.filter(card => !card.scryfall);
  if (!list.length) return msg('All cards already have Scryfall data loaded.');
  msg(`Loading ${list.length} cards from Scryfall...`);
  let ok = 0;
  let bad = 0;

  for (const card of list) {
    try {
      card.scryfall = await sfNamed(card.name, true);
      card.name = card.scryfall.name;
      card.error = null;
      ok++;
    } catch (exactError) {
      try {
        card.scryfall = await sfNamed(card.name, false);
        card.name = card.scryfall.name;
        card.error = null;
        ok++;
      } catch (fuzzyError) {
        card.error = fuzzyError.message;
        bad++;
      }
    }
    save();
    render();
    await wait(80);
  }

  msg(`Done. Loaded ${ok}. Failed ${bad}.`);
}

async function quickAddCard() {
  const input = document.getElementById('quickAdd');
  const name = input.value.trim();
  if (!name) return;
  if (state.cards.some(card => norm(card.name) === norm(name))) return msg(`${name} is already on the board.`);

  const card = makeCard([name, 'main', 'New candidate', 'Added manually']);
  state.cards.unshift(card);
  save();
  render();

  try {
    card.scryfall = await sfNamed(name, false);
    card.name = card.scryfall.name;
    card.error = null;
    msg(`Added ${card.name}.`);
  } catch (error) {
    card.error = error.message;
    msg(error.message);
  }

  input.value = '';
  save();
  render();
}

async function searchScryfall() {
  const query = document.getElementById('scrySearch').value.trim();
  if (!query) return;

  searchPanel.classList.add('show');
  searchResults.innerHTML = '<div class="pill">Searching Scryfall...</div>';
  searchTitle.textContent = `Scryfall results for “${query}”`;

  try {
    const results = (await sfSearch(query)).slice(0, 18);
    if (!results.length) {
      searchResults.innerHTML = '<p class="modal-line">No results.</p>';
      return;
    }
    searchResults.innerHTML = '';
    results.forEach(result => searchResults.appendChild(renderResult(result)));
  } catch (error) {
    searchResults.innerHTML = `<p class="modal-line">${esc(error.message)}</p>`;
  }
}

function renderResult(result) {
  const el = document.createElement('article');
  el.className = 'result';
  const imageUrl = result.image_uris?.small || result.card_faces?.[0]?.image_uris?.small || '';
  el.innerHTML = `${imageUrl ? `<img src="${imageUrl}" alt="${esc(result.name)}">` : '<div></div>'}<div class="result-body"><div class="result-name">${esc(result.name)}</div><div class="result-type">${esc(result.type_line || '')}</div><div class="result-actions"><button class="mini-btn" data-sec="main">Main</button><button class="mini-btn" data-sec="maybe">Maybe</button><button class="mini-btn" data-sec="module">Module</button><button class="mini-btn" data-open="1">Open</button></div></div>`;
  el.querySelectorAll('[data-sec]').forEach(button => {
    button.onclick = () => addScryfallResult(result, button.dataset.sec);
  });
  el.querySelector('[data-open]').onclick = () => window.open(result.scryfall_uri, '_blank', 'noopener,noreferrer');
  return el;
}

function addScryfallResult(result, section) {
  if (state.cards.some(card => norm(card.name) === norm(result.name))) return msg(`${result.name} is already on the board.`);
  state.cards.unshift({
    id: crypto.randomUUID(),
    name: result.name,
    section,
    status: 'New candidate',
    role: 'Added from Scryfall search',
    scryfall: result,
    error: null
  });
  save();
  render();
  msg(`Added ${result.name} to ${sectionTitle(section)}.`);
}

function openModal(id) {
  const card = state.cards.find(item => item.id === id);
  if (!card) return;
  modalCardId = id;

  const imageUrl = img(card, 'large') || img(card, 'normal');
  modalImage.innerHTML = imageUrl ? `<img src="${imageUrl}" alt="${esc(card.name)}">` : `<div class="pic"><span>${esc(card.error || 'Image not loaded')}</span></div>`;

  const scryfall = card.scryfall || {};
  const oracle = scryfall.oracle_text || scryfall.card_faces?.map(face => `${face.name}\n${face.oracle_text || ''}`).join('\n\n') || 'No Oracle text loaded yet. Use “Load Scryfall data”.';

  modalInfo.innerHTML = `
    <h2 id="modalTitle">${esc(card.name)}</h2>
    <div class="tags"><span class="tag ${tagClass(card.status)}">${esc(card.status)}</span><span class="tag">${esc(sectionTitle(card.section))}</span><span class="tag">Priority #${getPriority(card)}</span>${scryfall.mana_cost ? `<span class="tag">${esc(scryfall.mana_cost)}</span>` : ''}</div>
    <p class="modal-line"><strong>Role:</strong> ${esc(card.role)}</p>
    <p class="modal-line"><strong>Type:</strong> ${esc(scryfall.type_line || 'Not loaded')}</p>
    <p class="modal-line"><strong>Set:</strong> ${esc(scryfall.set_name || 'Not loaded')} ${scryfall.released_at ? `(${esc(scryfall.released_at)})` : ''}</p>
    <div class="oracle">${esc(oracle)}</div>
    <div class="modal-actions">
      <select class="select" id="modalMove"><option value="main">Main V1 Pool</option><option value="maybe">Maybeboard</option><option value="module">Modules</option><option value="cut">Cut / Avoid</option></select>
      <button class="btn green" id="modalMoveBtn">Move card</button>
      <button class="btn blue" id="modalOpenBtn">Open on Scryfall</button>
      <button class="btn red" id="modalDeleteBtn">Delete</button>
    </div>`;

  document.getElementById('modalMove').value = card.section;
  document.getElementById('modalMoveBtn').onclick = () => {
    moveCard(card.id, document.getElementById('modalMove').value);
    openModal(card.id);
  };
  document.getElementById('modalOpenBtn').onclick = () => window.open(card.scryfall?.scryfall_uri || `https://scryfall.com/search?q=${encodeURIComponent('!"' + card.name + '"')}`, '_blank', 'noopener,noreferrer');
  document.getElementById('modalDeleteBtn').onclick = () => {
    if (confirm(`Delete ${card.name}?`)) {
      state.cards = state.cards.filter(item => item.id !== card.id);
      save();
      closeModal();
      render();
    }
  };

  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  modalCardId = null;
}

function exportJsonDownload() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const anchor = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `rotwood-accord-board-${stamp}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
  msg('JSON download created.');
}

function importJsonFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed.cards)) throw new Error('JSON must contain a cards array.');
      state = ensureState(parsed);
      save();
      render();
      msg('Imported board from JSON.');
    } catch (error) {
      msg('Import failed: ' + error.message);
    }
  };
  reader.readAsText(file);
}

function reset() {
  if (confirm('Reset to default board? This will clear local changes.')) {
    localStorage.removeItem(STORAGE_KEY);
    state = ensureState({ cards: seed.map(makeCard) });
    render();
    msg('Board reset.');
  }
}

function msg(text) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(msg.t);
  msg.t = setTimeout(() => toast.classList.remove('show'), 3600);
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('./sw.js');
  } catch (error) {
    console.warn('Service worker registration failed.', error);
  }
}

function bindEvents() {
  document.getElementById('loadBtn').onclick = loadImages;
  document.getElementById('addBtn').onclick = quickAddCard;
  document.getElementById('quickAdd').addEventListener('keydown', event => {
    if (event.key === 'Enter') quickAddCard();
  });
  document.getElementById('scrySearchBtn').onclick = searchScryfall;
  document.getElementById('scrySearch').addEventListener('keydown', event => {
    if (event.key === 'Enter') searchScryfall();
  });
  document.getElementById('clearResultsBtn').onclick = () => {
    searchResults.innerHTML = '';
    searchPanel.classList.remove('show');
  };
  document.getElementById('exportBtn').onclick = exportJsonDownload;
  document.getElementById('importBtn').onclick = () => document.getElementById('importFile').click();
  document.getElementById('importFile').onchange = event => {
    const file = event.target.files?.[0];
    if (file) importJsonFile(file);
    event.target.value = '';
  };
  document.getElementById('resetBtn').onclick = reset;
  document.getElementById('modalClose').onclick = closeModal;
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('show')) closeModal();
  });
  search.oninput = render;
  filter.onchange = render;
}

bindEvents();
registerServiceWorker();
render();
