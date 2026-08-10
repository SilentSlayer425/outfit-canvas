# Custom Main Tags

## Goal

Let users add custom main tags/categories beyond the fixed built-in clothing categories.

## Current Code Anchors

- `src/types/closet.ts`: `ClothingCategory` is a strict union and powers labels/order/subcategories.
- `src/config.ts`: category placement defaults for the builder.
- `src/components/UploadModal.tsx` and `src/components/EditItemModal.tsx`: category selectors.
- `src/components/ClothingGrid.tsx`: category filter pills.
- `src/pages/Index.tsx`: builder placement uses `CATEGORY_X_DEFAULTS` and `CATEGORY_Y_DEFAULTS`.

## Data Model

The current strict union makes custom categories awkward. Introduce a string id model:

```ts
export type BuiltInClothingCategory = 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories' | 'bags' | 'jewelry';
export type ClothingCategory = BuiltInClothingCategory | string;

export interface CustomMainTag {
  id: string;
  label: string;
  subcategories?: string[];
  defaultX?: number;
  defaultY?: number;
  createdAt: number;
}
```

Persist `customMainTags` with closet state and Drive data.

## Implementation Steps

1. Add custom category/tag types to `src/types/closet.ts`.
2. Add `customMainTags` to `useCloset`, `closet-storage`, and `useGoogleDrive` data shapes.
3. Create helpers that merge built-in category definitions with user-created categories.
4. Replace direct `CATEGORY_ORDER`, `CATEGORY_LABELS`, and `SUBCATEGORIES` usage in selectors/grids with merged helper output.
5. Add an "Add category" action in closet or upload flow.
6. Default custom category canvas placement to center until the user picks better defaults.
7. Guard against duplicate labels by normalizing ids from trimmed lowercase labels.

## Verification

- User-created main tags appear in upload/edit selectors and closet filters.
- Items assigned to custom main tags render in grid and builder.
- Saved outfits with custom-category items load correctly.
- Drive sync preserves custom main tags and assigned items.
