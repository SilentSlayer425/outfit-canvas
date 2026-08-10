import { describe, it, expect } from 'vitest';
import {
  getCategoryLabel,
  getMergedCategoryOptions,
  getCategorySubcategories,
  getCategoryDefaults,
  getMergedCategoryOrder,
} from './category-helpers';
import type { CustomMainTag, ClothingCategory } from '@/types/closet';

describe('Category Helpers', () => {
  const mockCustomTag: CustomMainTag = {
    id: 'athletic-wear-123',
    label: 'Athletic Wear',
    subcategories: ['Sports Shoes', 'Sports Top'],
    defaultX: 150,
    defaultY: 200,
    createdAt: Date.now(),
  };

  describe('getCategoryLabel', () => {
    it('should return label for built-in category', () => {
      const label = getCategoryLabel('tops', []);
      expect(label).toBe('Tops');
    });

    it('should return label for custom tag', () => {
      const customId = mockCustomTag.id as ClothingCategory;
      const label = getCategoryLabel(customId, [mockCustomTag]);
      expect(label).toBe('Athletic Wear');
    });

    it('should return category string as fallback if not found', () => {
      const unknownCat = 'unknown' as ClothingCategory;
      const label = getCategoryLabel(unknownCat, []);
      expect(label).toBe('unknown');
    });
  });

  describe('getMergedCategoryOptions', () => {
    it('should include all built-in categories', () => {
      const options = getMergedCategoryOptions([]);
      const builtInCount = options.filter((opt) => !opt.isCustom).length;
      expect(builtInCount).toBe(8); // tops, bottoms, dresses, outerwear, shoes, accessories, bags, jewelry
    });

    it('should include custom tags', () => {
      const options = getMergedCategoryOptions([mockCustomTag]);
      const customId = mockCustomTag.id as ClothingCategory;
      expect(options).toContainEqual({
        value: customId,
        label: 'Athletic Wear',
        isCustom: true,
      });
    });

    it('should mark built-in categories as not custom', () => {
      const options = getMergedCategoryOptions([]);
      const topsOption = options.find((opt) => opt.value === 'tops');
      expect(topsOption?.isCustom).toBe(false);
    });

    it('should return all categories in correct order', () => {
      const options = getMergedCategoryOptions([mockCustomTag]);
      // First should be built-in categories in order, then custom
      expect(options[0].value).toBe('tops');
      const customId = mockCustomTag.id as ClothingCategory;
      expect(options[options.length - 1].value).toBe(customId);
    });
  });

  describe('getCategorySubcategories', () => {
    it('should return built-in subcategories for built-in category', () => {
      const subcats = getCategorySubcategories('tops', []);
      expect(subcats).toContain('T-Shirt');
      expect(subcats).toContain('Polo');
    });

    it('should return custom subcategories for custom tag', () => {
      const customId = mockCustomTag.id as ClothingCategory;
      const subcats = getCategorySubcategories(customId, [mockCustomTag]);
      expect(subcats).toEqual(['Sports Shoes', 'Sports Top']);
    });

    it('should return empty array for category without subcategories', () => {
      const customTagNoSubcats: CustomMainTag = {
        id: 'test-123',
        label: 'Test',
        createdAt: Date.now(),
      };
      const noSubcatId = customTagNoSubcats.id as ClothingCategory;
      const subcats = getCategorySubcategories(noSubcatId, [customTagNoSubcats]);
      expect(subcats).toEqual([]);
    });
  });

  describe('getCategoryDefaults', () => {
    it('should return custom tag defaults if available', () => {
      const customId = mockCustomTag.id as ClothingCategory;
      const defaults = getCategoryDefaults(customId, [mockCustomTag], 100, 100);
      expect(defaults).toEqual({ x: 150, y: 200 });
    });

    it('should return provided defaults if custom tag has no defaults', () => {
      const customTagNoDefaults: CustomMainTag = {
        id: 'test-123',
        label: 'Test',
        createdAt: Date.now(),
      };
      const noDefaultId = customTagNoDefaults.id as ClothingCategory;
      const defaults = getCategoryDefaults(
        noDefaultId,
        [customTagNoDefaults],
        100,
        200
      );
      expect(defaults).toEqual({ x: 100, y: 200 });
    });

    it('should use provided defaults for built-in categories', () => {
      const defaults = getCategoryDefaults('tops', [mockCustomTag], 100, 200);
      expect(defaults).toEqual({ x: 100, y: 200 });
    });
  });

  describe('getMergedCategoryOrder', () => {
    it('should include all built-in categories in order', () => {
      const order = getMergedCategoryOrder([]);
      expect(order.slice(0, 8)).toEqual(['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'bags', 'jewelry']);
    });

    it('should add custom tags at the end', () => {
      const customTag2: CustomMainTag = {
        id: 'formal-wear-456',
        label: 'Formal Wear',
        createdAt: Date.now(),
      };
      const order = getMergedCategoryOrder([mockCustomTag, customTag2]);
      const customId = mockCustomTag.id as ClothingCategory;
      const customId2 = customTag2.id as ClothingCategory;
      expect(order[order.length - 2]).toBe(customId);
      expect(order[order.length - 1]).toBe(customId2);
    });
  });
});
