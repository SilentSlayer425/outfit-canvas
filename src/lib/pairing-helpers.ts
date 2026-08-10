/**
 * Pairing Helpers Library
 *
 * Utilities for managing accessory pairing in outfits.
 * Supports jewelry and accessories being paired with main items (tops, bottoms, etc.)
 */

import type { ClothingCategory, ClothingItem, Outfit, Pairing } from '@/types/closet';

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
  /** Items this is paired to (e.g., a necklace paired to multiple shirts) */
  pairedToItems: ClothingItem[];
  /** Items that are paired to this item (e.g., a shirt with multiple accessories paired to it) */
  pairedItems: ClothingItem[];
}

/**
 * Get pairing information for a specific item across all outfits and global pairings.
 * Returns:
 * - pairedToItems: items this is paired to (e.g., a necklace paired to multiple shirts)
 * - pairedItems: all items paired to this item (e.g., a shirt with multiple accessories paired to it)
 */
export function getPairingInfo(itemId: string, outfits: Outfit[], allItems: ClothingItem[], pairings: Pairing[] = []): PairingInfo {
  // Find what this item is paired to
  const pairedToIds = new Set<string>();

  // Look through all outfit items to find if this item is paired to something (outfit-based)
  for (const outfit of outfits) {
    for (const outfitItem of outfit.items) {
      if (outfitItem.clothingId === itemId && outfitItem.pairedToClothingIds) {
        for (const pairedId of outfitItem.pairedToClothingIds) {
          pairedToIds.add(pairedId);
        }
        break; // Only check first outfit where this item appears
      }
    }
    if (pairedToIds.size > 0) break;
  }

  // Look through global pairings to find if this item is paired to something (global pairing).
  // Only the accessory side is "paired to" its linked items — the linked (main) items are not
  // also considered "paired to" the accessory, otherwise both directions show the same items.
  for (const pairing of pairings) {
    if (pairing.accessoryId === itemId) {
      for (const linkedId of pairing.linkedItemIds) {
        pairedToIds.add(linkedId);
      }
    }
  }

  // Convert paired IDs to items
  const pairedToItems = Array.from(pairedToIds)
    .map((id) => allItems.find((item) => item.id === id))
    .filter((item): item is ClothingItem => item !== undefined);

  // Find all items that are paired to this item
  const pairedItems: ClothingItem[] = [];
  const seenIds = new Set<string>();

  // From outfit-based pairings
  for (const outfit of outfits) {
    for (const outfitItem of outfit.items) {
      if (outfitItem.pairedToClothingIds?.includes(itemId) && !seenIds.has(outfitItem.clothingId)) {
        seenIds.add(outfitItem.clothingId);
        const item = allItems.find((i) => i.id === outfitItem.clothingId);
        if (item) {
          pairedItems.push(item);
        }
      }
    }
  }

  // From global pairings. Only the linked (main) items get the accessory listed under
  // "paired items" — the accessory itself does not also list its linked items here,
  // since that relationship is already covered by pairedToItems above.
  for (const pairing of pairings) {
    if (pairing.linkedItemIds.includes(itemId) && !seenIds.has(pairing.accessoryId)) {
      seenIds.add(pairing.accessoryId);
      const item = allItems.find((i) => i.id === pairing.accessoryId);
      if (item) {
        pairedItems.push(item);
      }
    }
  }

  return {
    pairedToItems,
    pairedItems,
  };
}

/**
 * Check if an item is paired to anything or has anything paired to it.
 * Returns true if the item has any pairing relationship (paired to or paired from).
 * Checks both outfit-based pairings and global pairings.
 */
export function isItemPaired(itemId: string, outfits: Outfit[], pairings: Pairing[] = []): boolean {
  // Check outfit-based pairings
  for (const outfit of outfits) {
    for (const outfitItem of outfit.items) {
      // Check if this item is paired to something
      if (outfitItem.clothingId === itemId && outfitItem.pairedToClothingIds?.length) {
        return true;
      }
      // Check if something is paired to this item
      if (outfitItem.pairedToClothingIds?.includes(itemId)) {
        return true;
      }
    }
  }

  // Check global pairings
  for (const pairing of pairings) {
    // If this item is the accessory in a pairing
    if (pairing.accessoryId === itemId) {
      return true;
    }
    // If this item is one of the linked items
    if (pairing.linkedItemIds.includes(itemId)) {
      return true;
    }
  }

  return false;
}
