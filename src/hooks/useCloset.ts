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
import type { ClothingItem, Outfit, ClothingCategory, CustomMainTag, ClosetState } from '@/types/closet';
import {
  clearLegacyClosetState,
  readClosetState,
  readLegacyClosetState,
  writeClosetState,
} from '@/lib/closet-storage';

export function useCloset() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [customMainTags, setCustomMainTags] = useState<CustomMainTag[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadState = async () => {
      try {
        const stored = await readClosetState();

        if (!cancelled && (stored.items.length > 0 || stored.outfits.length > 0 || (stored.customMainTags?.length ?? 0) > 0)) {
          setItems(stored.items);
          setOutfits(stored.outfits);
          setCustomMainTags(stored.customMainTags ?? []);
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
        setCustomMainTags(legacy.customMainTags ?? []);
        setReady(true);
      }

      if (legacy.items.length > 0 || legacy.outfits.length > 0) {
        writeClosetState({ items: legacy.items, outfits: legacy.outfits, customMainTags: legacy.customMainTags ?? [] })
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

    writeClosetState({ items, outfits, customMainTags }).catch((error) => {
      console.error('Failed to persist closet state:', error);
    });
  }, [items, outfits, customMainTags, ready]);

  const addItem = useCallback((item: Omit<ClothingItem, 'id' | 'createdAt'>) => {
    const newItem: ClothingItem = { ...item, id: crypto.randomUUID(), createdAt: Date.now() };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Pick<ClothingItem, 'name' | 'category' | 'subcategory' | 'customTags' | 'description' | 'brand'>>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setOutfits((prev) => prev.map((o) => ({ ...o, items: o.items.filter((oi) => oi.clothingId !== id) })));
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

  const replaceAll = useCallback((newItems: ClothingItem[], newOutfits: Outfit[], newCustomMainTags?: CustomMainTag[]) => {
    setItems(newItems);
    setOutfits(newOutfits);
    if (newCustomMainTags) {
      setCustomMainTags(newCustomMainTags);
    }
  }, []);

  const addCustomTag = useCallback((label: string, options?: { defaultX?: number; defaultY?: number; subcategories?: string[] }) => {
    const newTag: CustomMainTag = {
      id: crypto.randomUUID(),
      label,
      createdAt: Date.now(),
      ...options,
    };
    setCustomMainTags((prev) => [newTag, ...prev]);
    return newTag;
  }, []);

  const deleteCustomTag = useCallback((id: string) => {
    // Find the custom tag being deleted to get its label
    const tagToDelete = customMainTags.find((tag) => tag.id === id);
    if (!tagToDelete) return;

    // Reassign any items using this custom category to 'accessories' (default fallback)
    setItems((prev) =>
      prev.map((item) => {
        // If item's category matches the deleted custom tag's label, reassign to accessories
        if (item.category === tagToDelete.label) {
          return { ...item, category: 'accessories' as ClothingCategory };
        }
        return item;
      })
    );

    // Remove the tag from customMainTags
    setCustomMainTags((prev) => prev.filter((tag) => tag.id !== id));
  }, [customMainTags]);

  const duplicateItem = useCallback((itemId: string, customizations?: { name?: string; description?: string }) => {
    const original = items.find((i) => i.id === itemId);
    if (!original) return null;

    const newItem: ClothingItem = {
      ...original,
      id: crypto.randomUUID(),
      duplicatedFromId: original.id,
      isDuplicate: true,
      name: customizations?.name !== undefined ? customizations.name : original.name,
      description: customizations?.description !== undefined ? customizations.description : original.description,
      createdAt: Date.now(),
    };

    setItems((prev) => [newItem, ...prev]);
    return newItem.id;
  }, [items]);

  const createOutfitWithPairing = useCallback((accessoryId: string, mainItemId: string) => {
    const accessoryItem = items.find((i) => i.id === accessoryId);
    const mainItem = items.find((i) => i.id === mainItemId);

    if (!accessoryItem || !mainItem) return null;

    // Create outfit with both items
    const newOutfit: Outfit = {
      id: crypto.randomUUID(),
      name: `${mainItem.name} + ${accessoryItem.name}`,
      items: [
        {
          clothingId: mainItemId,
          category: mainItem.category,
          x: 0,
          y: 0,
          scale: 1,
          zIndex: 1,
          side: 'front',
        },
        {
          clothingId: accessoryId,
          category: accessoryItem.category,
          x: 100,
          y: -50,
          scale: 1,
          zIndex: 2,
          side: 'front',
          pairedToClothingIds: [mainItemId],
        },
      ],
      createdAt: Date.now(),
    };

    setOutfits((prev) => [newOutfit, ...prev]);
    return newOutfit;
  }, [items]);

  return {
    items,
    outfits,
    customMainTags,
    ready,
    addItem,
    updateItem,
    removeItem,
    getItemsByCategory,
    saveOutfit,
    removeOutfit,
    getItemById,
    replaceAll,
    duplicateItem,
    addCustomTag,
    deleteCustomTag,
    createOutfitWithPairing,
  };
}
