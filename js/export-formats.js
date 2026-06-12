function getExportTimestamp() {
  return new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
}

function downloadTextFile(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
}

function getMainDecklistText() {
  const cards = Array.isArray(state?.cards) ? state.cards : [];
  const mainCards = cards.filter(card => card.section === 'main');

  return mainCards
    .map(card => `1 ${card.name}`)
    .join('\n');
}

function exportBoardJson() {
  const stamp = getExportTimestamp();
  const data = JSON.stringify(state, null, 2);
  downloadTextFile(`rotwood-accord-board-${stamp}.json`, data, 'application/json');
  msg('Board JSON export created.');
}

function exportMainDecklist() {
  const stamp = getExportTimestamp();
  const decklist = getMainDecklistText();

  if (!decklist.trim()) {
    msg('No cards found in Main V1 Pool.');
    return;
  }

  downloadTextFile(`rotwood-accord-main-decklist-${stamp}.txt`, decklist, 'text/plain');
  msg('Main decklist export created.');
}

function exportFormat(format = 'board-json') {
  if (format === 'main-decklist') {
    exportMainDecklist();
    return;
  }

  exportBoardJson();
}

function exportSelectedFormat(format) {
  const selectedFormat = format || document.getElementById('exportFormat')?.value || 'board-json';
  exportFormat(selectedFormat);
}

function bindExportFormats() {
  const menu = document.getElementById('exportMenu');
  const toggle = document.getElementById('exportMenuBtn');
  const list = document.getElementById('exportMenuList');

  function closeMenu() {
    menu?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu(event) {
    event.stopPropagation();
    const isOpen = menu?.classList.toggle('open');
    toggle?.setAttribute('aria-expanded', String(Boolean(isOpen)));
  }

  if (toggle && list) {
    toggle.onclick = toggleMenu;
    list.addEventListener('click', event => {
      const item = event.target.closest('[data-export-format]');
      if (!item) return;
      closeMenu();
      exportFormat(item.dataset.exportFormat);
    });

    document.addEventListener('click', event => {
      if (!menu?.contains(event.target)) closeMenu();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });

    return;
  }

  const exportButton = document.getElementById('exportBtn');
  if (exportButton) exportButton.onclick = () => exportSelectedFormat();
}

bindExportFormats();
