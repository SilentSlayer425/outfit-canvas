# Custom Canvas Person Mask

## Goal

Add arms to the default canvas body and let users upload their own person image. The uploaded image should be compressed, converted into a mask/background asset, and replace the dummy mannequin in the outfit builder.

## Current Code Anchors

- `src/components/OutfitCanvas.tsx`: renders the current SVG mannequin at z-index `0`.
- `src/lib/image-processing.ts`: already provides upload normalization and compression.
- `src/hooks/useCloset.ts` and `src/lib/closet-storage.ts`: persist closet state and saved outfits.
- `src/hooks/useGoogleDrive.ts`: syncs app state as JSON.

## Data Model

Store canvas preferences separately from clothing items:

```ts
export interface CanvasProfile {
  mannequinImageData?: string;
  maskImageData?: string;
  showDefaultArms: boolean;
  updatedAt: number;
}
```

Add it to local state and Drive data as `canvasProfile?: CanvasProfile`.

## Implementation Steps

1. Replace the inline mannequin SVG in `OutfitCanvas.tsx` with a `CanvasBackground` component.
2. Update the default SVG to include simple arm shapes that sit behind clothing.
3. Add a "Person image" control near the builder canvas.
4. Reuse `normalizeImageFile()` for the uploaded person image.
5. Add a mask-generation helper in `src/lib/image-processing.ts`:
   - Draw the uploaded image to canvas.
   - Estimate transparent/background pixels where possible.
   - Output a WebP/PNG data URL for the visible person layer.
6. Persist `canvasProfile` locally and in Drive.
7. Render the uploaded person/mask at z-index `0`; keep outfit items at `MIN_Z = 1`.

## Notes

Client-only masking will be approximate. The first version should support manual crop/position plus compression; high-quality automatic background removal can be added later through a dedicated service.

## Verification

- Default mannequin includes arms and still stays behind clothing.
- User-uploaded person image survives reload and Drive sync.
- Clothing remains draggable above the custom image.
- Large phone photos are compressed before storage.
