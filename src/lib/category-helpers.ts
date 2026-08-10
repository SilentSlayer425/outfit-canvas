import type { ClothingCategory, CustomMainTag } from '@/types/closet';
import { CATEGORY_LABELS, CATEGORY_ORDER, SUBCATEGORIES } from '@/types/closet';

/**
 * Get the label for a category (built-in or custom)
 */
export function getCategoryLabel(category: ClothingCategory, customTags: CustomMainTag[]): string {
  // Check built-in categories first
  if (category in CATEGORY_LABELS) {
    return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS];
  }

  // Check custom tags
  const customTag = customTags.find((tag) => tag.id === category);
  if (customTag) {
    return customTag.label;
  }

  // Fallback to the category string itself if not found
  return category;
}

/**
 * Get all category options, merging built-in categories with custom tags
 */
export function getMergedCategoryOptions(customTags: CustomMainTag[]): Array<{
  value: ClothingCategory;
  label: string;
  isCustom: boolean;
}> {
  const options: Array<{ value: ClothingCategory; label: string; isCustom: boolean }> = [];

  // Add built-in categories in order
  for (const category of CATEGORY_ORDER) {
    options.push({
      value: category,
      label: CATEGORY_LABELS[category],
      isCustom: false,
    });
  }

  // Add custom tags
  for (const tag of customTags) {
    options.push({
      value: tag.id as ClothingCategory,
      label: tag.label,
      isCustom: true,
    });
  }

  return options;
}

/**
 * Get subcategories for a given category
 */
export function getCategorySubcategories(category: ClothingCategory, customTags: CustomMainTag[]): string[] {
  // Check built-in categories first
  if (category in SUBCATEGORIES) {
    return SUBCATEGORIES[category as keyof typeof SUBCATEGORIES];
  }

  // Check custom tags for custom subcategories
  const customTag = customTags.find((tag) => tag.id === category);
  if (customTag?.subcategories) {
    return customTag.subcategories;
  }

  // Return empty array if not found
  return [];
}

/**
 * Get default X and Y positions for a category on the outfit canvas
 */
export function getCategoryDefaults(
  category: ClothingCategory,
  customTags: CustomMainTag[],
  defaultX: number,
  defaultY: number
): { x: number; y: number } {
  // Check if it's a custom tag with defaults
  const customTag = customTags.find((tag) => tag.id === category);
  if (customTag?.defaultX !== undefined && customTag.defaultY !== undefined) {
    return {
      x: customTag.defaultX,
      y: customTag.defaultY,
    };
  }

  // Use provided defaults
  return { x: defaultX, y: defaultY };
}

/**
 * Merge category order (built-in + custom)
 */
export function getMergedCategoryOrder(customTags: CustomMainTag[]): ClothingCategory[] {
  return [...CATEGORY_ORDER, ...customTags.map((tag) => tag.id as ClothingCategory)];
}
