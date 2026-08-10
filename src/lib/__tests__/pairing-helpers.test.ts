/**
 * Tests for pairing-helpers.ts
 */

import { describe, it, expect } from 'vitest';
import { isItemLinkable, getPairingInfo, isItemPaired } from '../pairing-helpers';
import type { ClothingItem, Outfit, ClothingCategory } from '@/types/closet';

describe('pairing-helpers', () => {
  describe('isItemLinkable', () => {
    it('should return true for accessories', () => {
      expect(isItemLinkable('accessories')).toBe(true);
    });

    it('should return true for bags', () => {
      expect(isItemLinkable('bags')).toBe(true);
    });

    it('should return true for jewelry', () => {
      expect(isItemLinkable('jewelry')).toBe(true);
    });

    it('should return false for tops', () => {
      expect(isItemLinkable('tops')).toBe(false);
    });

    it('should return false for bottoms', () => {
      expect(isItemLinkable('bottoms')).toBe(false);
    });

    it('should return false for shoes', () => {
      expect(isItemLinkable('shoes')).toBe(false);
    });

    it('should return false for custom categories', () => {
      expect(isItemLinkable('custom-tag' as ClothingCategory)).toBe(false);
    });
  });

  describe('getPairingInfo', () => {
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
        id: 'jeans-1',
        name: 'Jeans',
        category: 'bottoms',
        imageData: 'data:image/png;base64,test',
        createdAt: Date.now(),
      },
    ];

    it('should return empty pairing info when item has no pairings', () => {
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
          ],
          createdAt: Date.now(),
        },
      ];

      const info = getPairingInfo('shirt-1', outfits, mockItems);
      expect(info.pairedToItems).toEqual([]);
      expect(info.pairedItems).toEqual([]);
    });

    it('should find the items this item is paired to', () => {
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

      const info = getPairingInfo('necklace-1', outfits, mockItems);
      expect(info.pairedToItems).toHaveLength(1);
      expect(info.pairedToItems[0].id).toBe('shirt-1');
      expect(info.pairedItems).toEqual([]);
    });

    it('should find all items paired to this item', () => {
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
          ],
          createdAt: Date.now(),
        },
      ];

      const info = getPairingInfo('shirt-1', outfits, mockItems);
      expect(info.pairedToItems).toEqual([]);
      expect(info.pairedItems).toHaveLength(2);
      expect(info.pairedItems.map((i) => i.id).sort()).toEqual(['necklace-1', 'watch-1'].sort());
    });

    it('should handle items that are both paired to something and have things paired to them', () => {
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
              pairedToClothingIds: ['necklace-1'],
            },
          ],
          createdAt: Date.now(),
        },
      ];

      // Check necklace (paired to shirt AND has watch paired to it)
      const necklaceInfo = getPairingInfo('necklace-1', outfits, mockItems);
      expect(necklaceInfo.pairedToItems).toHaveLength(1);
      expect(necklaceInfo.pairedToItems[0].id).toBe('shirt-1');
      expect(necklaceInfo.pairedItems).toHaveLength(1);
      expect(necklaceInfo.pairedItems[0].id).toBe('watch-1');
    });

    it('should handle multiple outfits with same item paired differently', () => {
      const outfits: Outfit[] = [
        {
          id: 'outfit-1',
          name: 'Casual',
          items: [
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
        {
          id: 'outfit-2',
          name: 'Formal',
          items: [
            {
              clothingId: 'necklace-1',
              category: 'jewelry',
              x: 50,
              y: 50,
              scale: 1,
              zIndex: 2,
              pairedToClothingIds: ['jeans-1'],
            },
          ],
          createdAt: Date.now(),
        },
      ];

      // Should find the first pairing
      const info = getPairingInfo('necklace-1', outfits, mockItems);
      expect(info.pairedToItems).toHaveLength(1);
      expect(info.pairedToItems[0].id).toBe('shirt-1');
    });

    it('should deduplicate paired items across outfits', () => {
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
        {
          id: 'outfit-2',
          name: 'Casual 2',
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

      const info = getPairingInfo('shirt-1', outfits, mockItems);
      expect(info.pairedItems).toHaveLength(1);
      expect(info.pairedItems[0].id).toBe('necklace-1');
    });

    it('should support accessory paired to multiple items', () => {
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
              clothingId: 'jeans-1',
              category: 'bottoms',
              x: 0,
              y: 100,
              scale: 1,
              zIndex: 2,
            },
            {
              clothingId: 'watch-1',
              category: 'accessories',
              x: 50,
              y: 100,
              scale: 1,
              zIndex: 3,
              pairedToClothingIds: ['shirt-1', 'jeans-1'], // watch paired to both shirt and jeans
            },
          ],
          createdAt: Date.now(),
        },
      ];

      const watchInfo = getPairingInfo('watch-1', outfits, mockItems);
      expect(watchInfo.pairedToItems).toHaveLength(2);
      expect(watchInfo.pairedToItems.map((i) => i.id).sort()).toEqual(['jeans-1', 'shirt-1'].sort());

      expect(isItemPaired('watch-1', outfits)).toBe(true);
    });
  });

  describe('isItemPaired', () => {
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
    ];

    it('should return false when item has no pairings', () => {
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
          ],
          createdAt: Date.now(),
        },
      ];

      expect(isItemPaired('shirt-1', outfits)).toBe(false);
    });

    it('should return true when item is paired to something', () => {
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

      expect(isItemPaired('necklace-1', outfits)).toBe(true);
    });

    it('should return true when something is paired to item', () => {
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

      expect(isItemPaired('shirt-1', outfits)).toBe(true);
    });

    it('should return true for item with multiple pairings', () => {
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

      expect(isItemPaired('shirt-1', outfits)).toBe(true);
    });
  });
});
