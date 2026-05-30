import type {
  ClothingItem,
  Outfit,
  ScheduleRecord,
  RandomizerLockState,
} from '@/types/closet';
import { DEFAULT_RANDOMIZER_LOCK_STATE } from '@/types/closet';

interface ClosetState {
  items: ClothingItem[];
  outfits: Outfit[];
  schedules: ScheduleRecord[];
  randomizer: RandomizerLockState;
}

// Browser database name — change this to rename the local IndexedDB store
const DB_NAME = 'closet-studio-db';
const DB_VERSION = 1;
const STORE_NAME = 'closet-state';
const STATE_KEY = 'current';

// Legacy localStorage keys — kept for one-time migration from older versions
const LEGACY_ITEMS_KEY = 'closet-items';
const LEGACY_OUTFITS_KEY = 'closet-outfits';

const ensureImages = (item: ClothingItem): ClothingItem => {
  const hasImages = item.images && item.images.length > 0;
  const createdAt = item.createdAt ?? Date.now();
  if (!item.createdAt) {
    console.warn('Missing createdAt for clothing item during legacy migration; using current time for ordering.', item.id);
  }
  const images = hasImages
    ? item.images
    : item.imageData
      ? [{
        id: crypto.randomUUID(),
        data: item.imageData,
        createdAt,
      }]
      : [];
  return {
    ...item,
    images,
    primaryImageId: item.primaryImageId ?? images[0]?.id,
    imageData: item.imageData ?? images[0]?.data,
  };
};

const normalizeRandomizerState = (state?: RandomizerLockState): RandomizerLockState => ({
  ...DEFAULT_RANDOMIZER_LOCK_STATE,
  ...(state ?? {}),
  lockedItemIds: state?.lockedItemIds ?? DEFAULT_RANDOMIZER_LOCK_STATE.lockedItemIds,
});

export const normalizeClosetState = (state?: Partial<ClosetState> | null): ClosetState => ({
  items: (state?.items ?? []).map(ensureImages),
  outfits: state?.outfits ?? [],
  schedules: state?.schedules ?? [],
  randomizer: normalizeRandomizerState(state?.randomizer),
});

const EMPTY_STATE: ClosetState = normalizeClosetState({});

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

export const readLegacyClosetState = (): ClosetState =>
  normalizeClosetState({
    items: loadLegacyValue(LEGACY_ITEMS_KEY, []),
    outfits: loadLegacyValue(LEGACY_OUTFITS_KEY, []),
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
      resolve(normalizeClosetState(request.result as ClosetState | undefined));
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
