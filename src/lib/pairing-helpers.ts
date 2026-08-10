/**
 * Pairing Helpers Library
 *
 * Utilities for managing accessory pairing in outfits.
 * Supports jewelry and accessories being paired with main items (tops, bottoms, etc.)
 */

import type { ClothingCategory, ClothingItem, Outfit } from '@/types/closet';

/**
 * Check if an item's category can be linked/paired with other items.
 * Only accessories, bags, and jewelry can be paired.
 */
export function isItemLinkable(category: ClothingCategory): boolean {
  return ['accessories', 'bags', 'jewelry'].includes(category);
}

/**
 * Pairing info for an item
 */
export interface PairingInfo {
  /** The item this is paired to, if any */
  pairedToItem?: ClothingItem;
  /** Items that are paired to this item */
  pairedItems: ClothingItem[];
}

/**
 * Get pairing information for a specific item across all outfits.
 * Returns:
 * - pairedToItem: the item this is paired to (if this item is an accessory paired to something)
 * - pairedItems: all items paired to this item (if other items are paired to this)
 */
export function getPairingInfo(itemId: string, outfits: Outfit[], allItems: ClothingItem[]): PairingInfo {
  // Find what this item is paired to
  let pairedToItem: ClothingItem | undefined;
  let pairedToClothingId: string | undefined;

  // Look through all outfit items to find if this item is paired to something
  for (const outfit of outfits) {
    for (const outfitItem of outfit.items) {
      if (outfitItem.clothingId === itemId && outfitItem.pairedToClothingId) {
        pairedToClothingId = outfitItem.pairedToClothingId;
        pairedToItem = allItems.find((item) => item.id === pairedToClothingId);
        break;
      }
    }
    if (pairedToItem) break;
  }

  // Find all items that are paired to this item
  const pairedItems: ClothingItem[] = [];
  const seenIds = new Set<string>();

  for (const outfit of outfits) {
    for (const outfitItem of outfit.items) {
      if (outfitItem.pairedToClothingId === itemId && !seenIds.has(outfitItem.clothingId)) {
        seenIds.add(outfitItem.clothingId);
        const item = allItems.find((i) => i.id === outfitItem.clothingId);
        if (item) {
          pairedItems.push(item);
        }
      }
    }
  }

  return {
    pairedToItem,
    pairedItems,
  };
}

/**
 * Check if an item is paired to anything or has anything paired to it.
 * Returns true if the item has any pairing relationship (paired to or paired from).
 */
export function isItemPaired(itemId: string, outfits: Outfit[]): boolean {
  for (const outfit of outfits) {
    for (const outfitItem of outfit.items) {
      // Check if this item is paired to something
      if (outfitItem.clothingId === itemId && outfitItem.pairedToClothingId) {
        return true;
      }
      // Check if something is paired to this item
      if (outfitItem.pairedToClothingId === itemId) {
        return true;
      }
    }
  }
  return false;
}
