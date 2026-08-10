/**
 * Tests for auto-linking functionality when adding items to outfit builder
 */

import { describe, it, expect } from 'vitest';
import { getPairingInfo } from '../pairing-helpers';
import type { ClothingItem, Outfit, OutfitItem } from '@/types/closet';

describe('Auto-linking when adding items to outfit', () => {
  const mockItems: ClothingItem[] = [
    {
      id: 'shirt-1',
      name: 'Blue Shirt',
      category: 'tops',
      imageData: 'data:image/png;base64,test',
      createdAt: Date.now(),
    },
    {
      id: 'necklace-1',
      name: 'Gold Necklace',
      category: 'jewelry',
      imageData: 'data:image/png;base64,test',
      createdAt: Date.now(),
    },
    {
      id: 'watch-1',
      name: 'Silver Watch',
      category: 'accessories',
      imageData: 'data:image/png;base64,test',
      createdAt: Date.now(),
    },
    {
      id: 'bracelet-1',
      name: 'Gold Bracelet',
      category: 'jewelry',
      imageData: 'data:image/png;base64,test',
      createdAt: Date.now(),
    },
  ];

  it('should auto-add all accessories when adding a main item with multiple linked accessories', () => {
    const outfits: Outfit[] = [
      {
        id: 'outfit-1',
        name: 'Casual',
        items: [
          {
            clothingId: 'shirt-1',
            category: 'tops',
            x: 0,
            y: 0,
            scale: 1,
            zIndex: 1,
          },
          {
            clothingId: 'necklace-1',
            category: 'jewelry',
            x: 50,
            y: 50,
            scale: 1,
            zIndex: 2,
            pairedToClothingIds: ['shirt-1'],
          },
          {
            clothingId: 'watch-1',
            category: 'accessories',
            x: 100,
            y: 100,
            scale: 1,
            zIndex: 3,
            pairedToClothingIds: ['shirt-1'],
          },
          {
            clothingId: 'bracelet-1',
            category: 'jewelry',
            x: 150,
            y: 150,
            scale: 1,
            zIndex: 4,
            pairedToClothingIds: ['shirt-1'],
          },
        ],
        createdAt: Date.now(),
      },
    ];

    // Simulate adding the shirt - should auto-add necklace, watch, bracelet
    const pairingInfo = getPairingInfo('shirt-1', outfits, mockItems);

    // Should have 3 items paired to the shirt
    expect(pairingInfo.pairedItems).toHaveLength(3);
    expect(pairingInfo.pairedItems.map((i) => i.id).sort()).toEqual(['bracelet-1', 'necklace-1', 'watch-1'].sort());
  });

  it('should auto-add the main item when adding an accessory paired to it', () => {
    const outfits: Outfit[] = [
      {
        id: 'outfit-1',
        name: 'Casual',
        items: [
          {
            clothingId: 'shirt-1',
            category: 'tops',
            x: 0,
            y: 0,
            scale: 1,
            zIndex: 1,
          },
          {
            clothingId: 'necklace-1',
            category: 'jewelry',
            x: 50,
            y: 50,
            scale: 1,
            zIndex: 2,
            pairedToClothingIds: ['shirt-1'],
          },
        ],
        createdAt: Date.now(),
      },
    ];

    // Simulate adding the necklace - should auto-add shirt
    const pairingInfo = getPairingInfo('necklace-1', outfits, mockItems);

    // Should have the shirt as a paired-to item
    expect(pairingInfo.pairedToItems).toHaveLength(1);
    expect(pairingInfo.pairedToItems[0].id).toBe('shirt-1');
  });

  it('should not add duplicate items if they are already in the outfit', () => {
    const outfits: Outfit[] = [
      {
        id: 'outfit-1',
        name: 'Casual',
        items: [
          {
            clothingId: 'shirt-1',
            category: 'tops',
            x: 0,
            y: 0,
            scale: 1,
            zIndex: 1,
          },
          {
            clothingId: 'necklace-1',
            category: 'jewelry',
            x: 50,
            y: 50,
            scale: 1,
            zIndex: 2,
            pairedToClothingIds: ['shirt-1'],
          },
        ],
        createdAt: Date.now(),
      },
    ];

    const pairingInfo = getPairingInfo('necklace-1', outfits, mockItems);

    // Simulate current outfit state with necklace already added
    const currentOutfitItems: OutfitItem[] = [
      {
        clothingId: 'necklace-1',
        category: 'jewelry',
        x: 50,
        y: 50,
        scale: 1,
        zIndex: 1,
      },
    ];

    const linkedItems = [
      ...pairingInfo.pairedToItems,
      ...pairingInfo.pairedItems,
    ];

    const existingIds = new Set(currentOutfitItems.map((oi) => oi.clothingId));
    const itemsToAdd = linkedItems.filter((item) => !existingIds.has(item.id));

    // Should only add shirt, not necklace again
    expect(itemsToAdd).toHaveLength(1);
    expect(itemsToAdd[0].id).toBe('shirt-1');
  });

  it('should handle complex pairing relationships', () => {
    const outfits: Outfit[] = [
      {
        id: 'outfit-1',
        name: 'Complex',
        items: [
          {
            clothingId: 'shirt-1',
            category: 'tops',
            x: 0,
            y: 0,
            scale: 1,
            zIndex: 1,
          },
          {
            clothingId: 'necklace-1',
            category: 'jewelry',
            x: 50,
            y: 50,
            scale: 1,
            zIndex: 2,
            pairedToClothingIds: ['shirt-1'],
          },
          {
            clothingId: 'watch-1',
            category: 'accessories',
            x: 100,
            y: 100,
            scale: 1,
            zIndex: 3,
            pairedToClothingIds: ['necklace-1'], // watch paired to necklace, not shirt
          },
        ],
        createdAt: Date.now(),
      },
    ];

    // Adding shirt should auto-add necklace
    const shirtPairing = getPairingInfo('shirt-1', outfits, mockItems);
    expect(shirtPairing.pairedItems).toHaveLength(1);
    expect(shirtPairing.pairedItems[0].id).toBe('necklace-1');

    // Adding necklace should auto-add both shirt and watch
    const necklacePairing = getPairingInfo('necklace-1', outfits, mockItems);
    expect(necklacePairing.pairedToItems).toHaveLength(1);
    expect(necklacePairing.pairedToItems[0].id).toBe('shirt-1');
    expect(necklacePairing.pairedItems).toHaveLength(1);
    expect(necklacePairing.pairedItems[0].id).toBe('watch-1');
  });
});
