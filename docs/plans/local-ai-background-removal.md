# Local AI Background Removal (DelphiTools)

## Goal

Enable users to remove backgrounds from clothing item photos directly in the browser using DelphiTools' ONNX model, providing instant, privacy-preserving image processing without server calls. This creates clean product-like images for better visual consistency in outfit previews.

## Current Code Anchors

- `src/lib/image-processing.ts`: `normalizeImageFile()` handles HEIC conversion, resizing, and compression.
- `src/components/UploadModal.tsx`: upload flow and image preview before save.
- `src/components/EditItemModal.tsx`: metadata editing interface.
- `src/types/closet.ts`: `ClothingImage` stores compressed image data.
- `package.json`: project dependencies.

## Data Model

No schema changes required. Background removal outputs a PNG/WebP with transparency, which fits into the existing `ClothingImage.imageData` as a data URL. Optionally track processing:

```ts
export interface ClothingImage {
  id: string;
  imageData: string;
  altText?: string;
  crop?: { x: number; y: number; width: number; height: number; rotation?: number };
  backgroundRemoved?: boolean;  // Optional: track if BG was processed
  createdAt: number;
}
```

## Implementation Steps

### Phase 1: Setup DelphiTools

1. Install dependencies:
   ```bash
   npm install @onnxruntime/web canvas-related-libs
   # DelphiTools uses ONNX Runtime; bundle the model locally or fetch from CDN
   ```

2. Create `src/lib/background-removal.ts`:
   - Initialize ONNX Runtime inference session on first use (lazy load).
   - Download or bundle the DelphiTools segmentation model (~20–50 MB).
   - Implement a worker thread pattern to avoid blocking the UI during inference.
   - Export `removeBackground(imageData: string): Promise<string>` that returns PNG data URL with transparency.

3. Handle ONNX model caching:
   - Store model in IndexedDB to avoid re-downloading.
   - Provide a "Clear AI Model Cache" option in settings if storage is tight.

### Phase 2: Integrate into Upload Flow

1. Update `UploadModal.tsx`:
   - After image selection and optional crop, show a preview.
   - Add toggle: "Remove background?" (off by default).
   - If enabled, show a spinner and call background removal.
   - Display before/after preview so user can accept or retry.

2. Add error handling:
   - Graceful fallback if ONNX Runtime fails to load (user gets original image).
   - Show informative message if model download times out.
   - Allow user to skip or disable background removal and proceed.

### Phase 3: Reuse in Edit Flow

1. Update `EditItemModal.tsx`:
   - Add "Remove background from this image" button for existing photos.
   - Create a new image variant or overwrite (user choice).
   - Show processing spinner and result preview.

### Phase 4: Performance Optimization

1. Implement a service worker or Web Worker to:
   - Run inference off-main-thread.
   - Queue multiple background removal requests if user uploads batch.

2. Resize images before inference:
   - DelphiTools works best on 512×512 or similar; resize down, process, then scale back.
   - Saves memory and speeds up inference by ~2–3×.

3. Add user preference:
   - Remember "always remove backgrounds" setting.
   - Store toggle state in localStorage or user profile.

## UI Notes

- Show a small badge or label on cards if background was removed: "✨ Cleaned image".
- In edit modal, allow users to toggle between original and processed versions.
- Provide a "Retry" button if the first attempt doesn't look good.
- Offer a manual editor (mask brush) as a future enhancement for fine-tuning.

## Verification

- ONNX Runtime loads without blocking page render.
- DelphiTools model downloads/caches successfully on first use.
- Background removal completes within 3–5 seconds for typical clothing photos.
- Processed images with transparency display correctly across all UI components.
- Original image is preserved; user can revert if needed.
- Batch uploads queue background removals without UI freeze.
- Works offline after model is cached.

## Future Enhancements

- Integration with edge ML (WebGPU) for faster GPU-accelerated inference.
- Batch processing for multiple items.
- Manual mask refinement UI for edge cases.
- Option to use server-based removal for higher quality (user opt-in).
