/**
 * Closet Data Hook
 *
 * Manages all clothing items and saved outfits.
 * Data persists in IndexedDB so high-quality photos don't hit localStorage quotas.
 *
 * Customization:
 *  - Change DB_NAME / STORE_NAME in src/lib/closet-storage.ts to rename local storage buckets
 */
import { useState, useEffect, useCallback } from 'react';
import type {
  ClothingItem,
  Outfit,
  ClothingCategory,
  ScheduleRecord,
  RandomizerLockState,
  NewClothingItemInput,
} from '@/types/closet';
import { DEFAULT_RANDOMIZER_LOCK_STATE } from '@/types/closet';
import {
  clearLegacyClosetState,
  readClosetState,
  readLegacyClosetState,
  writeClosetState,
  normalizeClosetState,
} from '@/lib/closet-storage';

export function useCloset() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [randomizerState, setRandomizerState] = useState<RandomizerLockState>(DEFAULT_RANDOMIZER_LOCK_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadState = async () => {
      try {
        const stored = await readClosetState();

        if (!cancelled && (stored.items.length > 0 || stored.outfits.length > 0 || stored.schedules.length > 0)) {
          setItems(stored.items);
          setOutfits(stored.outfits);
          setSchedules(stored.schedules);
          setRandomizerState(stored.randomizer);
          setReady(true);
          return;
        }
      } catch (error) {
        console.error('Failed to load IndexedDB closet state:', error);
      }

      const legacy = readLegacyClosetState();
      if (!cancelled) {
        setItems(legacy.items);
        setOutfits(legacy.outfits);
        setSchedules(legacy.schedules);
        setRandomizerState(legacy.randomizer);
        setReady(true);
      }

      if (legacy.items.length > 0 || legacy.outfits.length > 0 || legacy.schedules.length > 0) {
        writeClosetState(legacy)
          .then(() => clearLegacyClosetState())
          .catch((error) => console.error('Failed to migrate legacy closet state:', error));
      }
    };

    loadState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    writeClosetState({ items, outfits, schedules, randomizer: randomizerState }).catch((error) => {
      console.error('Failed to persist closet state:', error);
    });
  }, [items, outfits, schedules, randomizerState, ready]);

  const addItem = useCallback((item: NewClothingItemInput) => {
    const createdAt = Date.now();
    const images = item.images?.length
      ? item.images.map((image) => {
        if (!image.createdAt) {
          console.warn('Missing createdAt for clothing image.', image.id);
        }
        return { ...image, createdAt: image.createdAt ?? createdAt };
      })
      : item.imageData
        ? [{
          id: crypto.randomUUID(),
          data: item.imageData,
          createdAt,
        }]
        : [];
    const newItem: ClothingItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt,
      images,
      primaryImageId: item.primaryImageId ?? images[0]?.id,
      imageData: item.imageData ?? images[0]?.data,
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Pick<ClothingItem, 'name' | 'category' | 'subcategory' | 'customTags' | 'description'>>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setOutfits((prev) => prev.map((o) => ({ ...o, items: o.items.filter((oi) => oi.clothingId !== id) })));
    setRandomizerState((prev) => ({
      ...prev,
      lockedItemIds: prev.lockedItemIds.filter((lockedId) => lockedId !== id),
    }));
  }, []);

  const getItemsByCategory = useCallback((category: ClothingCategory) => {
    return items.filter((i) => i.category === category);
  }, [items]);

  const saveOutfit = useCallback((outfit: Omit<Outfit, 'id' | 'createdAt'>) => {
    const newOutfit: Outfit = { ...outfit, id: crypto.randomUUID(), createdAt: Date.now() };
    setOutfits((prev) => [newOutfit, ...prev]);
    return newOutfit;
  }, []);

  const removeOutfit = useCallback((id: string) => {
    setOutfits((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const getItemById = useCallback((id: string) => items.find((i) => i.id === id), [items]);

  const replaceAll = useCallback((
    newItems: ClothingItem[],
    newOutfits: Outfit[],
    newSchedules: ScheduleRecord[] = [],
    newRandomizer: RandomizerLockState = DEFAULT_RANDOMIZER_LOCK_STATE,
  ) => {
    const normalized = normalizeClosetState({
      items: newItems,
      outfits: newOutfits,
      schedules: newSchedules,
      randomizer: newRandomizer,
    });
    setItems(normalized.items);
    setOutfits(normalized.outfits);
    setSchedules(normalized.schedules);
    setRandomizerState(normalized.randomizer);
  }, []);

  return {
    items,
    outfits,
    schedules,
    randomizerState,
    ready,
    addItem,
    updateItem,
    removeItem,
    getItemsByCategory,
    saveOutfit,
    removeOutfit,
    getItemById,
    replaceAll,
  };
}
