import type { ClosetState } from '@/types/closet';

// Browser database name — change this to rename the local IndexedDB store
const DB_NAME = 'closet-studio-db';
const DB_VERSION = 1;
const STORE_NAME = 'closet-state';
const STATE_KEY = 'current';

// Legacy localStorage keys — kept for one-time migration from older versions
const LEGACY_ITEMS_KEY = 'closet-items';
const LEGACY_OUTFITS_KEY = 'closet-outfits';

const EMPTY_STATE: ClosetState = { items: [], outfits: [], customMainTags: [] };

const hasIndexedDb = () => typeof window !== 'undefined' && 'indexedDB' in window;

const loadLegacyValue = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(new Error('IndexedDB is not available.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open local database.'));
  });

export const readLegacyClosetState = (): ClosetState => ({
  items: loadLegacyValue(LEGACY_ITEMS_KEY, []),
  outfits: loadLegacyValue(LEGACY_OUTFITS_KEY, []),
  customMainTags: [],
});

export const clearLegacyClosetState = () => {
  try {
    localStorage.removeItem(LEGACY_ITEMS_KEY);
    localStorage.removeItem(LEGACY_OUTFITS_KEY);
  } catch {
    // Ignore browsers that block localStorage cleanup.
  }
};

export const readClosetState = async (): Promise<ClosetState> => {
  if (!hasIndexedDb()) return EMPTY_STATE;

  const db = await openDatabase();

  return new Promise<ClosetState>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(STATE_KEY);

    request.onsuccess = () => {
      resolve((request.result as ClosetState | undefined) ?? EMPTY_STATE);
    };
    request.onerror = () => reject(request.error ?? new Error('Failed to read local closet data.'));
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error ?? new Error('Failed to complete local read transaction.'));
  });
};

export const writeClosetState = async (state: ClosetState) => {
  if (!hasIndexedDb()) return;

  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(state, STATE_KEY);

    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error ?? new Error('Failed to save local closet data.'));
  });
};
