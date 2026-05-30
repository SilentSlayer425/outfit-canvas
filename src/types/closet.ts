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
  | 'jewelry';

export interface AiTag {
  label: string;
  score: number;
  source?: 'local' | 'cloud';
}

export interface NsfwAttestation {
  accepted: boolean;
  acceptedAt: number;
  confirmationText?: string;
}

export interface NsfwMetadata {
  score: number;
  blocked: boolean;
  attestation?: NsfwAttestation;
}

export interface BackgroundMetadata {
  removed?: boolean;
  confidence?: number;
}

export interface ClothingAiMetadata {
  tags?: AiTag[];
  nsfw?: NsfwMetadata;
  background?: BackgroundMetadata;
  lastUpdated?: number;
}

export interface ClothingImage {
  id: string;
  data: string;
  createdAt: number;
  ai?: ClothingAiMetadata;
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
  /** Legacy single-image field (kept for backwards compatibility; populated during normalization from the primary/first image when available, otherwise left undefined) */
  imageData?: string;
  /** Multi-image support */
  images?: ClothingImage[];
  /** Primary image id when multiple images exist */
  primaryImageId?: string;
  /** AI metadata for this item */
  ai?: ClothingAiMetadata;
  color?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface OutfitItem {
  clothingId: string;
  category: ClothingCategory;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

export interface Outfit {
  id: string;
  name: string;
  items: OutfitItem[];
  createdAt: number;
}

export interface ScheduleRecord {
  id: string;
  outfitId: string;
  startAt: number;
  endAt?: number;
  createdAt: number;
  calendarEventIds?: {
    google?: string;
    apple?: string;
    icsFileName?: string;
  };
  notes?: string;
}

export interface RandomizerLockState {
  lockedItemIds: string[];
  lockedCategories?: Partial<Record<ClothingCategory, boolean>>;
  lastUpdated?: number;
}

export const DEFAULT_RANDOMIZER_LOCK_STATE: RandomizerLockState = {
  lockedItemIds: [],
};

export interface NewClothingItemInput {
  name: string;
  category: ClothingCategory;
  subcategory?: string;
  customTags?: string[];
  description?: string;
  imageData?: string;
  images?: ClothingImage[];
  primaryImageId?: string;
  color?: string;
  ai?: ClothingAiMetadata;
}

export const getItemPrimaryImageData = (item: ClothingItem): string | undefined => {
  const images = item.images ?? [];
  const primary = item.primaryImageId
    ? images.find((img) => img.id === item.primaryImageId)
    : images[0];
  return primary?.data ?? item.imageData;
};

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
