(() => {
  const DB_NAME = 'rotwood-accord-db';
  const DB_VERSION = 1;
  const STORE_NAME = 'board-state';
  const BOARD_ID = 'current';
  const LOCAL_BACKUP_KEY = `${STORAGE_KEY}-backup-before-indexeddb`;

  let dbPromise = null;
  let lastSavedState = null;
  let saveChain = Promise.resolve();

  function cloneState(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function supportsIndexedDb() {
    return 'indexedDB' in window;
  }

  function openBoardDb() {
    if (!supportsIndexedDb()) return Promise.reject(new Error('IndexedDB is not available.'));
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return dbPromise;
  }

  async function readIndexedDbState() {
    const db = await openBoardDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(BOARD_ID);

      request.onsuccess = () => resolve(request.result?.state || null);
      request.onerror = () => reject(request.error);
    });
  }

  async function writeIndexedDbState(nextState) {
    const db = await openBoardDb();
    const snapshot = cloneState(nextState);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({
        id: BOARD_ID,
        state: snapshot,
        updatedAt: new Date().toISOString()
      });

      request.onsuccess = () => resolve(snapshot);
      request.onerror = () => reject(request.error);
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
      const indexedDbState = await readIndexedDbState();
      if (indexedDbState && Array.isArray(indexedDbState.cards)) {
        lastSavedState = indexedDbState;
        return ensureState(indexedDbState);
      }

      const localStorageState = readLocalStorageState();
      const migratedState = localStorageState ? ensureState(localStorageState) : loadDefaultState();

      preserveLocalStorageBackup();
      await writeIndexedDbState(migratedState);
      lastSavedState = migratedState;

      if (localStorageState) msg('Migrated board storage to IndexedDB. localStorage backup kept.');
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

    const snapshot = cloneState(state);
    lastSavedState = snapshot;

    saveChain = saveChain
      .catch(() => {})
      .then(() => writeIndexedDbState(snapshot))
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
