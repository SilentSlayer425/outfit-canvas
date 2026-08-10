# Brand Tagging Dropdown

## Goal

Add brand tagging to closet items and show brand options in the closet filter area when users are working with category sub-tags.

## Current Code Anchors

- `src/types/closet.ts`: `ClothingItem` has category, subcategory, custom tags, and description.
- `src/components/UploadModal.tsx`: add brand input during item creation.
- `src/components/EditItemModal.tsx`: edit brand metadata.
- `src/components/ClothingGrid.tsx`: category and sub-tag filtering already lives here.
- `src/hooks/useCloset.ts`: update item allow-list needs to include the new field.

## Data Model

Add an optional brand field:

```ts
export interface ClothingItem {
  brand?: string;
}
```

No IndexedDB migration is required because missing `brand` means unbranded.

## Implementation Steps

1. Add `brand?: string` to `ClothingItem`.
2. Add `brand` to `UploadModal` submit data and reset state.
3. Add `brand` editing in `EditItemModal`.
4. Include `brand` in the `useCloset.updateItem()` allowed update fields.
5. In `ClothingGrid`, derive available brands from the currently visible category/tag result set.
6. Add a `Select` or dropdown next to the sub-tag pills:
   - `All brands`
   - One option per brand with item count
7. Show the brand in item cards and detail modal when present.

## Verification

- Brand can be added during upload and edited later.
- Brand filtering combines correctly with category and sub-tag filtering.
- Items without a brand still appear under `All brands`.
- Brand data syncs through Google Drive with no additional sync code.
