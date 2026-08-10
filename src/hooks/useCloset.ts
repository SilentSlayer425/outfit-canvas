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
import type { ClothingItem, Outfit, OutfitItem, ClothingCategory, CustomMainTag, Pairing, ClosetState } from '@/types/closet';
import {
  clearLegacyClosetState,
  readClosetState,
  readLegacyClosetState,
  writeClosetState,
} from '@/lib/closet-storage';
import { CATEGORY_X_DEFAULTS, CATEGORY_Y_DEFAULTS } from '@/config';

export function useCloset() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [customMainTags, setCustomMainTags] = useState<CustomMainTag[]>([]);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadState = async () => {
      try {
        const stored = await readClosetState();

        if (!cancelled && (stored.items.length > 0 || stored.outfits.length > 0 || (stored.customMainTags?.length ?? 0) > 0 || (stored.pairings?.length ?? 0) > 0)) {
          setItems(stored.items);
          setOutfits(stored.outfits);
          setCustomMainTags(stored.customMainTags ?? []);
          setPairings(stored.pairings ?? []);
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
        setPairings(legacy.pairings ?? []);
        setReady(true);
      }

      if (legacy.items.length > 0 || legacy.outfits.length > 0) {
        writeClosetState({ items: legacy.items, outfits: legacy.outfits, customMainTags: legacy.customMainTags ?? [], pairings: legacy.pairings ?? [] })
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

    writeClosetState({ items, outfits, customMainTags, pairings }).catch((error) => {
      console.error('Failed to persist closet state:', error);
    });
  }, [items, outfits, customMainTags, pairings, ready]);

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
    // Remove item from pairings
    setPairings((prev) =>
      prev
        .map((p) => ({
          ...p,
          linkedItemIds: p.linkedItemIds.filter((itemId) => itemId !== id),
        }))
        .filter((p) => p.linkedItemIds.length > 0 && p.accessoryId !== id) // Remove pairing if no linked items or if accessory was deleted
    );
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

  const replaceAll = useCallback((newItems: ClothingItem[], newOutfits: Outfit[], newCustomMainTags?: CustomMainTag[], newPairings?: Pairing[]) => {
    setItems(newItems);
    setOutfits(newOutfits);
    if (newCustomMainTags) {
      setCustomMainTags(newCustomMainTags);
    }
    if (newPairings) {
      setPairings(newPairings);
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

  const createOutfitWithPairing = useCallback((accessoryId: string, mainItemIds: string[]) => {
    const accessoryItem = items.find((i) => i.id === accessoryId);

    // Validate all main items exist
    const mainItems = mainItemIds
      .map((id) => items.find((i) => i.id === id))
      .filter((item): item is ClothingItem => item !== undefined);

    if (!accessoryItem || mainItems.length === 0) return null;

    // Build outfit items array
    const outfitItems: OutfitItem[] = [];

    // Add main items with default category positioning
    let zIndex = 1;
    mainItems.forEach((mainItem) => {
      outfitItems.push({
        clothingId: mainItem.id,
        category: mainItem.category,
        x: CATEGORY_X_DEFAULTS[mainItem.category] ?? 0,
        y: CATEGORY_Y_DEFAULTS[mainItem.category] ?? 0,
        scale: 1,
        zIndex: zIndex++,
        side: 'front',
      });
    });

    // Add accessory item linked to all main items
    outfitItems.push({
      clothingId: accessoryId,
      category: accessoryItem.category,
      x: CATEGORY_X_DEFAULTS[accessoryItem.category] ?? 40,
      y: CATEGORY_Y_DEFAULTS[accessoryItem.category] ?? -200,
      scale: 1,
      zIndex: zIndex,
      side: 'front',
      pairedToClothingIds: mainItemIds,
    });

    // Create outfit name
    const mainItemNames = mainItems.map((i) => i.name).slice(0, 2);
    const extraCount = mainItemIds.length - 2;
    const nameParts = [`${accessoryItem.name} + ${mainItemNames.join(', ')}`];
    if (extraCount > 0) {
      nameParts[0] += ` + ${extraCount} more`;
    }
    const name = nameParts[0];

    const newOutfit: Outfit = {
      id: crypto.randomUUID(),
      name,
      items: outfitItems,
      createdAt: Date.now(),
    };

    setOutfits((prev) => [newOutfit, ...prev]);
    return newOutfit;
  }, [items]);

  // Pairing management methods
  const createPairing = useCallback((accessoryId: string, linkedItemIds: string[], notes?: string) => {
    const newPairing: Pairing = {
      id: crypto.randomUUID(),
      accessoryId,
      linkedItemIds,
      notes,
      createdAt: Date.now(),
    };
    setPairings((prev) => [newPairing, ...prev]);
    return newPairing;
  }, []);

  const updatePairing = useCallback((id: string, updates: Partial<Pick<Pairing, 'linkedItemIds' | 'notes'>>) => {
    setPairings((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const removePairing = useCallback((id: string) => {
    setPairings((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getPairingsByAccessory = useCallback((accessoryId: string) => {
    return pairings.find((p) => p.accessoryId === accessoryId);
  }, [pairings]);

  const getAllPairingsWithItems = useCallback(() => {
    return pairings.map((pairing) => {
      const accessoryItem = items.find((i) => i.id === pairing.accessoryId);
      const linkedItems = pairing.linkedItemIds
        .map((id) => items.find((i) => i.id === id))
        .filter((item): item is ClothingItem => item !== undefined);
      return {
        pairing,
        accessoryItem,
        linkedItems,
      };
    });
  }, [pairings, items]);

  return {
    items,
    outfits,
    customMainTags,
    pairings,
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
    createPairing,
    updatePairing,
    removePairing,
    getPairingsByAccessory,
    getAllPairingsWithItems,
  };
}
