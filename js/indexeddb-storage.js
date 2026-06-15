(() => {
  const DB_NAME = 'rotwood-accord-db';
  const DB_VERSION = 2;
  const BOARD_STORE = 'boards';
  const CARD_STORE = 'cards';
  const LEGACY_STORE = 'board-state';
  const BOARD_ID = 'current';
  const LOCAL_BACKUP_KEY = `${STORAGE_KEY}-backup-before-indexeddb`;

  let dbPromise = null;
  let saveChain = Promise.resolve();

  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function supportsIndexedDb() {
    return 'indexedDB' in window;
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function ensureCardIndexes(store) {
    if (!store.indexNames.contains('boardId')) {
      store.createIndex('boardId', 'boardId', { unique: false });
    }
    if (!store.indexNames.contains('boardSection')) {
      store.createIndex('boardSection', ['boardId', 'section'], { unique: false });
    }
  }

  function openBoardDb() {
    if (!supportsIndexedDb()) return Promise.reject(new Error('IndexedDB is not available.'));
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        const transaction = request.transaction;

        if (!db.objectStoreNames.contains(BOARD_STORE)) {
          db.createObjectStore(BOARD_STORE, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(CARD_STORE)) {
          const cardStore = db.createObjectStore(CARD_STORE, { keyPath: 'id' });
          ensureCardIndexes(cardStore);
        } else {
          ensureCardIndexes(transaction.objectStore(CARD_STORE));
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return dbPromise;
  }

  async function getBoardRecord() {
    const db = await openBoardDb();
    const transaction = db.transaction(BOARD_STORE, 'readonly');
    return requestToPromise(transaction.objectStore(BOARD_STORE).get(BOARD_ID));
  }

  async function getCardRecordsForBoard(boardId = BOARD_ID) {
    const db = await openBoardDb();
    const transaction = db.transaction(CARD_STORE, 'readonly');
    const index = transaction.objectStore(CARD_STORE).index('boardId');
    return requestToPromise(index.getAll(boardId));
  }

  function stripStorageFields(card) {
    const copy = { ...card };
    delete copy.boardId;
    delete copy.sortIndex;
    delete copy.updatedAt;
    return copy;
  }

  async function readStructuredBoardState() {
    const boardRecord = await getBoardRecord();
    if (!boardRecord) return null;

    const cards = await getCardRecordsForBoard(boardRecord.id);
    cards.sort((left, right) => (left.sortIndex ?? 0) - (right.sortIndex ?? 0));

    return {
      cards: cards.map(stripStorageFields),
      ui: boardRecord.ui || {}
    };
  }

  async function readLegacyIndexedDbState() {
    const db = await openBoardDb();
    if (!db.objectStoreNames.contains(LEGACY_STORE)) return null;

    const transaction = db.transaction(LEGACY_STORE, 'readonly');
    const legacy = await requestToPromise(transaction.objectStore(LEGACY_STORE).get(BOARD_ID));
    return legacy?.state || null;
  }

  async function writeStructuredBoardState(nextState) {
    const db = await openBoardDb();
    const snapshot = cloneValue(nextState);
    const existingCards = await getCardRecordsForBoard(BOARD_ID);
    const updatedAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BOARD_STORE, CARD_STORE], 'readwrite');
      const boardStore = transaction.objectStore(BOARD_STORE);
      const cardStore = transaction.objectStore(CARD_STORE);

      boardStore.put({
        id: BOARD_ID,
        ui: cloneValue(snapshot.ui || {}),
        updatedAt
      });

      existingCards.forEach(card => cardStore.delete(card.id));
      snapshot.cards.forEach((card, sortIndex) => {
        cardStore.put({
          ...cloneValue(card),
          boardId: BOARD_ID,
          sortIndex,
          updatedAt
        });
      });

      transaction.oncomplete = () => resolve(snapshot);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted.'));
    });
  }

  function readLocalStorageState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.cards) ? parsed : null;
    } catch (error) {
      console.warn('Could not read localStorage board backup.', error);
      return null;
    }
  }

  function preserveLocalStorageBackup() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && !localStorage.getItem(LOCAL_BACKUP_KEY)) {
        localStorage.setItem(LOCAL_BACKUP_KEY, raw);
      }
    } catch (error) {
      console.warn('Could not create localStorage migration backup.', error);
    }
  }

  function loadDefaultState() {
    return ensureState({ cards: seed.map(makeCard) });
  }

  const loadFromLocalStorage = load;
  load = async function loadBoardState() {
    if (!supportsIndexedDb()) return loadFromLocalStorage();

    try {
      const structuredState = await readStructuredBoardState();
      if (structuredState && Array.isArray(structuredState.cards)) {
        return ensureState(structuredState);
      }

      const legacyIndexedDbState = await readLegacyIndexedDbState();
      const localStorageState = readLocalStorageState();
      const sourceState = legacyIndexedDbState || localStorageState;
      const migratedState = sourceState ? ensureState(sourceState) : loadDefaultState();

      preserveLocalStorageBackup();
      await writeStructuredBoardState(migratedState);

      if (sourceState) msg('Migrated board storage to per-card IndexedDB records. localStorage backup kept.');
      return migratedState;
    } catch (error) {
      console.warn('IndexedDB load failed. Falling back to localStorage.', error);
      return loadFromLocalStorage();
    }
  };

  save = function saveBoardState() {
    if (!supportsIndexedDb()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return;
    }

    const snapshot = cloneValue(state);
    saveChain = saveChain
      .catch(() => {})
      .then(() => writeStructuredBoardState(snapshot))
      .catch(error => {
        console.warn('IndexedDB save failed. Writing emergency localStorage copy.', error);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      });
  };

  const originalImportJsonFile = importJsonFile;
  importJsonFile = function importJsonFileIntoIndexedDb(file) {
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
    reader.onerror = () => originalImportJsonFile(file);
    reader.readAsText(file);
  };

  reset = function resetIndexedDbBoard() {
    if (confirm('Reset to default board? This will clear local changes in IndexedDB.')) {
      state = loadDefaultState();
      save();
      render();
      msg('Board reset. localStorage backup was kept.');
    }
  };

  async function initWithIndexedDbStorage() {
    await loadSeedData();
    state = await load();
    bindEvents();
    await registerServiceWorker();
    render();
  }

  document.removeEventListener('DOMContentLoaded', init);
  init = initWithIndexedDbStorage;
  document.addEventListener('DOMContentLoaded', init);
})();
