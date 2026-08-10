/**
 * Closet Types
 *
 * ClothingCategory: broad group (tops, bottoms, etc.)
 * ClothingSubcategory: specific type within a category (t-shirt, jeans, etc.)
 * 
 * To add a new category:
 *  1. Add to ClothingCategory union
 *  2. Add label in CATEGORY_LABELS
 *  3. Add to CATEGORY_ORDER
 *  4. Add subcategories in SUBCATEGORIES
 *  5. Add default Y/X in src/config.ts CATEGORY_Y_DEFAULTS / CATEGORY_X_DEFAULTS
 * 
 * To add a new subcategory:
 *  1. Add to the relevant array in SUBCATEGORIES
 */

export type ClothingCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'shoes'
  | 'accessories'
  | 'bags'
  | 'jewelry'
  | string; // allows custom main tags created by users. Feature: Custom Main Tags

/**
 * Image data for a clothing item with optional crop and alt text
 * Feature: Alt Images, Cropping & Compression
 */
export interface ClothingImage {
  imageData: string; // optimized image data URL (metadata stripped during processing)
  altText?: string;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number; // rotation in degrees
  };
  createdAt: number;
}

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  /** Subcategory tag — can be a built-in or user-created custom tag */
  subcategory?: string;
  /** User-created custom tags (free-form strings) */
  customTags?: string[];
  /** User-written description for this item */
  description?: string;
  imageData: string; // optimized image data URL (metadata stripped during processing) - kept for backward compatibility
  /** Multiple images with optional crop and alt text. Feature: Alt Images, Cropping & Compression */
  images?: ClothingImage[];
  color?: string;
  /** Brand of the item. Feature: Brand Tagging */
  brand?: string;
  /** ID of the item this was duplicated from. Feature: Duplicate Items (Phase 1) */
  duplicatedFromId?: string;
  /** Whether this item is a duplicate of another. Feature: Duplicate Items (Phase 1) */
  isDuplicate?: boolean;
  createdAt: number;
}

export interface OutfitItem {
  clothingId: string;
  category: ClothingCategory;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
  /** Which side of the person the item is on. Feature: Canvas: Back of Person (Phase 1) */
  side?: 'front' | 'back'; // defaults to 'front' for backward compatibility
  /** IDs of other items this is paired with for coordinated outfit building. Feature: Accessory Pairing */
  pairedToClothingIds?: string[]; // array allows accessories to be linked to multiple main items
}

export interface Outfit {
  id: string;
  name: string;
  items: OutfitItem[];
  createdAt: number;
}

/**
 * Custom main tag (category) created by users
 * Feature: Custom Main Tags
 */
export interface CustomMainTag {
  id: string;
  label: string;
  /** Subcategories available within this custom tag */
  subcategories?: string[];
  /** Default X position for items of this category on the outfit canvas */
  defaultX?: number;
  /** Default Y position for items of this category on the outfit canvas */
  defaultY?: number;
  createdAt: number;
}

/**
 * Pairing between an accessory and one or more main items
 * Feature: Accessory Pairing
 * Allows storing global pairings independent of specific outfits
 */
export interface Pairing {
  id: string;
  /** ID of the accessory being paired (jewelry, bag, or accessories category) */
  accessoryId: string;
  /** IDs of main items this accessory is paired with */
  linkedItemIds: string[];
  /** Notes about this pairing */
  notes?: string;
  createdAt: number;
}

/**
 * Complete closet state including all items, outfits, and user preferences
 * Feature: Custom Main Tags, Accessory Pairing
 */
export interface ClosetState {
  items: ClothingItem[];
  outfits: Outfit[];
  darkMode?: boolean;
  weatherCity?: string;
  weatherLat?: number;
  weatherLon?: number;
  /** Custom main tags (categories) created by the user */
  customMainTags?: CustomMainTag[];
  /** Global accessory pairings independent of outfits */
  pairings?: Pairing[];
}

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  dresses: 'Dresses',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessories: 'Accessories',
  bags: 'Bags',
  jewelry: 'Jewelry',
};

export const CATEGORY_ORDER: ClothingCategory[] = [
  'tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'bags', 'jewelry',
];

/**
 * Built-in subcategories for each clothing category.
 * Users can also create their own custom tags beyond these.
 * 
 * To add a built-in subcategory, add it to the relevant array below.
 */
export const SUBCATEGORIES: Record<ClothingCategory, string[]> = {
  tops: ['T-Shirt', 'Polo', 'Button-Up', 'Blouse', 'Tank Top', 'Crop Top', 'Hoodie', 'Sweater', 'Henley', 'Flannel'],
  bottoms: ['Jeans', 'Chinos', 'Sweats', 'Joggers', 'Shorts', 'Skirt', 'Cargo Pants', 'Dress Pants', 'Leggings'],
  dresses: ['Mini Dress', 'Midi Dress', 'Maxi Dress', 'Sundress', 'Cocktail Dress', 'Formal Gown', 'Romper', 'Jumpsuit'],
  outerwear: ['Jacket', 'Blazer', 'Coat', 'Windbreaker', 'Puffer', 'Bomber', 'Denim Jacket', 'Trench Coat', 'Vest', 'Parka'],
  shoes: ['Sneakers', 'Boots', 'Loafers', 'Sandals', 'Heels', 'Flats', 'Slides', 'Running Shoes', 'Dress Shoes', 'Platforms'],
  accessories: ['Hat', 'Beanie', 'Scarf', 'Belt', 'Sunglasses', 'Watch', 'Gloves', 'Tie', 'Hair Accessory'],
  bags: ['Backpack', 'Tote', 'Crossbody', 'Clutch', 'Messenger', 'Duffle', 'Fanny Pack', 'Shoulder Bag'],
  jewelry: ['Necklace', 'Bracelet', 'Earrings', 'Ring', 'Anklet', 'Brooch', 'Chain', 'Pendant'],
};
