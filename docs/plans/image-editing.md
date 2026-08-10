# Image Editing

## Goal

Provide in-app image editing tools so users can refine clothing item photos after upload—crop, rotate, adjust brightness/contrast, remove blemishes, and annotate. This improves consistency and visual quality across the closet without requiring external tools.

## Current Code Anchors

- `src/lib/image-processing.ts`: existing image normalization and compression.
- `src/components/UploadModal.tsx`: image preview during upload.
- `src/components/EditItemModal.tsx`: item metadata editing.
- `src/types/closet.ts`: `ClothingImage` with optional crop data.
- `src/components/ClothingGrid.tsx`, `OutfitCanvas.tsx`: image rendering.

## Data Model

Extend `ClothingImage` to store editing history:

```ts
export interface ImageEdit {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;  // degrees
  };
  adjust?: {
    brightness?: number;  // -100 to 100
    contrast?: number;    // -100 to 100
    saturation?: number;  // -100 to 100
    hue?: number;         // 0 to 360
    blur?: number;        // 0 to 20 (optional)
  };
  removeBackground?: boolean;
  appliedAt: number;
}

export interface ClothingImage {
  id: string;
  imageData: string;  // final compressed output
  originalData?: string;  // preserve original for non-destructive editing
  altText?: string;
  edits?: ImageEdit[];  // history of edits
  crop?: ImageEdit['crop'];
  adjust?: ImageEdit['adjust'];
  createdAt: number;
}
```

## Implementation Steps

### Phase 1: Image Editor Component

1. Create `ImageEditor.tsx` (modal/fullscreen):
   ```
   - Canvas area with image preview
   - Toolbar with edit tools
   - Live preview of adjustments
   - Undo/redo stack
   - Apply / Cancel buttons
   ```

2. Implement editing features:

   **Crop Tool**
   - Freeform or preset aspect ratios (1:1, 16:9, 4:3).
   - Drag corners/edges to resize; drag center to pan.
   - Rotate with slider or arrow buttons (0–360°).
   - Show grid overlay (rule of thirds, thirds, or no grid).

   **Brightness / Contrast / Saturation**
   - Three sliders (-100 to 100).
   - Real-time preview.
   - Reset to defaults button.

   **Hue Adjustment**
   - Rotate hue 0–360°.
   - Useful for minor color corrections.

   **Blur (Optional)**
   - Gaussian blur slider (0–20px).
   - Use for de-emphasizing background (e.g., if background removal incomplete).

   **Filters (Optional, Phase 2)**
   - Preset filters: Warm, Cool, B&W, Sepia.
   - Stored as preset adjustments.

3. Implement using canvas API:
   ```ts
   export async function applyEdits(
     imageData: string,
     edits: ImageEdit
   ): Promise<string> {
     // Load image → apply edits → render to canvas → compress → return data URL
   }
   ```

4. Performance optimization:
   - Debounce slider updates to avoid re-rendering on every event.
   - Use a Web Worker for heavy edit operations.
   - Cache intermediate results.

### Phase 2: Integration Points

1. Update `UploadModal.tsx`:
   - After image selection, show "Edit Image" button before save.
   - Opens `ImageEditor.tsx` in a modal.
   - User edits, then confirms to finalize.
   - Edited image is passed to compression pipeline.

2. Update `EditItemModal.tsx`:
   - Add "Edit Image" button next to each stored image.
   - Opens editor with current image.
   - Save revisions or revert to original.
   - Show edit history/timeline (optional).

3. Update `ClothingGrid.tsx`:
   - Add small edit icon overlay on hover.
   - Quick-access edit without opening full modal.

### Phase 3: Non-Destructive Editing

1. Preserve original image:
   - Store original as `originalData` when first edited.
   - Edits stored in `edits[]` array.
   - User can "Revert to Original" at any time.

2. Edit history timeline (optional):
   - Show thumbnails of edit states.
   - Allow user to jump to any previous version.
   - Merge or discard edit history before saving.

3. Export/Save Options:
   - "Save edits" → apply and overwrite `imageData`.
   - "Save as new version" → keep both original and edited as separate images.
   - "Discard edits" → revert without saving.

### Phase 4: Batch Editing (Phase 2+)

1. Create `BatchEditModal.tsx`:
   - Select multiple images from closet.
   - Apply same edits to all (crop aspect, brightness, etc.).
   - Preview all results.
   - Confirm batch apply.

2. Use cases:
   - Normalize lighting across closet photos.
   - Crop all items to consistent aspect ratio.
   - Apply brand-consistent filter/look.

### Phase 5: AI-Powered Enhancements (Phase 3+)

1. Auto-enhance:
   - "Enhance" button that applies smart brightness/contrast.
   - Uses histogram analysis or simple ML model.
   - User can then fine-tune.

2. Remove wrinkles/blemishes (optional):
   - Integration with inpainting model (e.g., MediaPipe, TensorFlow.js).
   - Users can paint areas to remove wrinkles on displayed item.

3. Straighten/perspective correction:
   - Auto-detect item boundaries and straighten.
   - Useful for clothing photos taken at angles.

## UI Notes

- **Undo/Redo**: Stack of edits with keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z).
- **Presets**: "Quick adjustments" bar with common presets (Warm, Cool, Brighten, Darken).
- **Aspect ratio lock**: Default crop to item's natural aspect; toggle to free-form.
- **Keyboard shortcuts**:
  - `Enter` to apply.
  - `Escape` to cancel.
  - Arrow keys to nudge crop.
  - `R` to rotate.
- **Responsive**: Editor must work on mobile (touch-friendly crop handles).
- **Accessibility**: Ensure sliders are keyboard-navigable; provide numeric input as alternative.

## Verification

- Edits apply correctly and preview in real-time.
- Edited image compresses without re-applying previous edits.
- Undo/redo stack works correctly (up to ~20 steps).
- Original image is preserved if `originalData` enabled.
- Batch edits apply to multiple images without UI freeze.
- Edited images render correctly across grid, canvas, and outfit views.
- Performance remains acceptable on large closets (no jank).
- Mobile touch controls work smoothly.

## Storage Considerations

- **Disk space**: Storing original + edited versions can double storage per image.
  - Recommend: only store original for edited images (can regenerate edited version from edit ops).
  - Or: auto-delete original after 30 days if user confirms final edit.
  - Or: compress originals more aggressively (lossy) if storage tight.

- **Sync to Drive**: Edit history increases JSON size.
  - Recommendation: sync `originalData` + `edits` as separate fields.
  - Or: compress `edits` array on save (JSON + gzip).

## Future Enhancements

- **Style transfer**: Apply outfit aesthetic to new item photos (e.g., "Make this look like my summer items").
- **Color matching**: Auto-adjust new item colors to match closet palette.
- **Remove wrinkles/shine**: Advanced blemish removal with AI inpainting.
- **Virtual fitting**: Preview item on model/user silhouette.
- **Comparison tool**: Side-by-side edit before/after.
- **Edit templates**: Save and apply edit settings to other items.
