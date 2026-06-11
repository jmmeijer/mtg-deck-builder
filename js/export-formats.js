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

function exportSelectedFormat() {
  const format = document.getElementById('exportFormat')?.value || 'board-json';

  if (format === 'main-decklist') {
    exportMainDecklist();
    return;
  }

  exportBoardJson();
}

function bindExportFormats() {
  const exportButton = document.getElementById('exportBtn');
  if (!exportButton) return;
  exportButton.onclick = exportSelectedFormat;
}

bindExportFormats();
