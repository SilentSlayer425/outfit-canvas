# Canvas: Back of Person (Rear View Builder)

## Goal

Add a rear-view silhouette builder alongside the front-view canvas so users can visualize and place accessories on the back of their outfit (backpacks, bags, back jewelry, hair clips, lower back bags, etc.). This provides a complete 360° outfit view and prevents the "back of outfit" from being forgotten.

## Current Code Anchors

- `src/components/OutfitCanvas.tsx`: front-view canvas with mannequin and draggable items.
- `src/pages/Index.tsx`: main layout and state management.
- `src/components/custom-canvas-person-mask.tsx`: person silhouette rendering.
- `src/types/closet.ts`: `Outfit`, `OutfitItem` with position/size data.
- CSS layout for canvas area.

## Data Model

Extend `OutfitItem` to track front/back placement:

```ts
export interface OutfitItem {
  // ... existing fields ...
  clothingId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  side: 'front' | 'back';  // NEW: which view is this on?
  locked?: boolean;
  hidden?: boolean;
  opacity?: number;
}

export interface Outfit {
  // ... existing fields ...
  items: OutfitItem[];  // now includes both front & back items
  canvasProfile?: CanvasProfile;
}
```

When side is not specified, default to 'front' for backward compatibility.

## Implementation Steps

### Phase 1: Dual Canvas Layout

1. Update layout in `Index.tsx`:
   - Change from single canvas to side-by-side layout:
     ```
     ┌─────────────────────────┐
     │  OUTFIT CANVAS BUILDER  │
     ├────────────┬────────────┤
     │  FRONT     │   BACK     │
     │  View      │   View     │
     │  ┌───────┐ │ ┌───────┐  │
     │  │Manniq│ │ │Manniq │  │
     │  │+ items│ │ │+ items│  │
     │  └───────┘ │ └───────┘  │
     └────────────┴────────────┘
     ```

2. Create `RearCanvas.tsx`:
   - Mirror of `OutfitCanvas.tsx` but for back-view items.
   - Displays rear-facing silhouette (mirrored person image or "back" variant).
   - Allows drag-and-drop of items.
   - Shared selection state with front canvas.

3. Styling:
   - Equal width for both canvases (50% each).
   - Labels: "Front" and "Back" above each.
   - Responsive: stack vertically on mobile (front → back).
   - Tab toggle for mobile: "Show Front / Show Back" tabs instead of side-by-side.

### Phase 2: Silhouette Management

1. **Person/Mannequin images**:
   - Store front and back images separately in `CanvasProfile`:
     ```ts
     export interface CanvasProfile {
       mannequinImageDataFront?: string;
       mannequinImageDataBack?: string;
       maskImageDataFront?: string;
       maskImageDataBack?: string;
       showDefaultArms: boolean;
     }
     ```

2. **Default silhouettes**:
   - Create "back" SVG mannequin (or flip front if symmetrical).
   - Show arms and general body shape (shoulders, waist, legs).

3. **User uploads**:
   - In person image settings, allow separate front/back uploads.
   - If user only uploads front, auto-flip or show warning.
   - Show preview of both sides before saving.

### Phase 3: Item Placement & Transfer

1. **Add items to back**:
   - Users can drag items from the closet/grid to the back canvas.
   - Or, select item on front canvas and move to back (right-click → "Move to back").
   - Item placement independent; same item can't be on both front & back simultaneously (unless duplicated).

2. **Quick transfer buttons**:
   - Right-click context menu on canvas items:
     - "Move to back"
     - "Move to front"
   - Keyboard shortcut: `X` to toggle between front/back.

3. **Item list with side indicator**:
   - Layers panel shows which side each item is on.
   - Small badge: "Front" or "Back" label next to item.
   - Can drag layer to different side (or use "Move to back" action).

### Phase 4: Shared Interaction State

1. **Selection sync**:
   - When user selects item on front canvas, show it's selected on back too (if applicable).
   - If item is only on one side, show only on that side.

2. **Properties panel**:
   - Single properties panel for the selected item (regardless of side).
   - Shows: position, size, rotation, opacity, z-index, side.
   - Adjusting properties updates the item instantly on its canvas.

3. **Item controls**:
   - Canvas controls (delete, duplicate, rotate, resize) work same on both canvases.
   - Copy/paste items: `Ctrl+C` (front) → switch to back → `Ctrl+V` creates copy on back.

### Phase 5: Layering Across Sides (Optional)

1. **Global z-index**:
   - By default, front and back have separate z-index stacks (0–1000 each).
   - Optional: unified z-index across both sides for advanced users.
   - Show "Global layers" toggle in settings.

2. **Layers panel expansion**:
   - Layers panel groups items by side: "Front items" / "Back items".
   - Or: flat list with "Front" / "Back" badges.

### Phase 6: Outfit Preview & Rotation (Phase 2+)

1. **3D rotation preview** (ambitious):
   - Show combined front + back view in a rotatable 3D model.
   - User can drag to rotate and see both sides together.
   - Requires more complex rendering (Babylon.js, Three.js).

2. **Animation preview**:
   - Auto-rotate between front and back every 3 seconds in outfit preview.
   - "Play" button to auto-rotate on demand.

3. **360° view** (Phase 3, requires 3D):
   - If user uploads left/right side views, show full 360° rotation.
   - Requires 4 silhouettes (front, back, left, right) or 3D model.

## UI Notes

- **Canvas sizing**: Keep both canvases equal size for symmetry. On mobile, use tabs or stack vertically.
- **Item badges**: Show "Front" / "Back" label on items in closet grid to indicate if already placed.
- **Quick switch**: Keyboard shortcut `Tab` to switch focus between front/back canvas.
- **Undo/redo**: Affects both canvases; undo a back placement undoes it completely.
- **Zoom**: Apply same zoom level to both canvases for consistent view.
- **Keyboard shortcuts**:
  - `X` – toggle item between front/back.
  - `Tab` – switch focus canvas.
  - `Ctrl+C` / `Ctrl+V` – copy/paste items across sides.
  - `1` – focus front canvas.
  - `2` – focus back canvas.
- **Accessibility**: Ensure both canvases are keyboard-navigable and screen-reader friendly.

## Verification

- Front and back canvases render simultaneously without performance issues.
- Items can be placed on either front or back independently.
- Item placement persists when outfit is saved and reloaded.
- Moving item from front to back works correctly.
- Layers panel accurately shows items on both sides.
- Person silhouettes load for both front and back.
- Custom person images work for both sides.
- Outfit sync to Drive includes both front and back items.
- Mobile layout gracefully stacks or tabs.
- Undo/redo affects both canvases correctly.
- Copy/paste works across sides.

## Performance Considerations

- **Dual rendering**: Two canvases means 2× render calls; optimize to avoid lag.
  - Consider: shared render loop, batch updates, or canvas virtualization.
  - Test with large outfits (20+ items) to ensure smooth interactions.

## Storage Impact

- **Item count**: Adds potential for more items per outfit (double, if users fill both sides).
- **Outfit JSON size**: Increases proportionally; ensure Drive sync can handle it.
- **IndexedDB**: May need to adjust compression if outfits become too large.

## Future Enhancements

- **360° spin preview**: Rotate model to view from any angle.
- **Mirror mode**: Automatically mirror front items to back (for symmetrical outfits).
- **Left/right side views**: If user uploads left and right profile photos.
- **Accessory recommendations**: AI suggests back accessories based on front outfit.
- **Animation preview**: Show dressing sequence (front to back).
- **Fitting room mode**: Preview outfit on real body 3D model (requires AI body scan or uploaded photo).
