# Alt Images, Cropping, And Compression

## Goal

Let a clothing item store more than one image, let the user crop before saving, and keep all stored image data compressed enough for IndexedDB and Google Drive sync.

## Current Code Anchors

- `src/types/closet.ts`: `ClothingItem.imageData` stores one optimized data URL.
- `src/lib/image-processing.ts`: `normalizeImageFile()` converts HEIC/HEIF, resizes large images, strips metadata, and outputs WebP.
- `src/components/UploadModal.tsx`: upload flow and image preview.
- `src/components/EditItemModal.tsx`: currently edits metadata only.
- `src/components/ClothingGrid.tsx`, `src/components/OutfitCanvas.tsx`, `src/components/SavedOutfits.tsx`: render `item.imageData`.

## Data Model

Add an image array while keeping `imageData` for backward compatibility:

```ts
export interface ClothingImage {
  id: string;
  imageData: string;
  altText?: string;
  crop?: { x: number; y: number; width: number; height: number; rotation?: number };
  createdAt: number;
}

export interface ClothingItem {
  imageData: string;
  images?: ClothingImage[];
}
```

Use the first image as the primary image. Migrate old items lazily with `images ?? [{ id, imageData, createdAt }]`.

## Implementation Steps

1. Add `ClothingImage` to `src/types/closet.ts`.
2. Extend `normalizeImageFile()` so it can accept an optional crop rectangle before the compression pass.
3. Add a lightweight crop step in `UploadModal` after file selection and before submit.
4. Add photo management to `EditItemModal`: add image, choose primary, edit alt text, remove image.
5. Update renderers to call a helper like `getPrimaryImage(item)` instead of reading `item.imageData` directly.
6. Keep Drive sync unchanged structurally, because it already serializes the full item object.

## Verification

- Existing one-photo items still render after load.
- New uploads save a cropped WebP and preserve transparency where possible.
- Multiple images sync to Drive and return intact after reload.
- Builder, closet grid, saved outfits, detail modal, and edit modal all show the primary image.
