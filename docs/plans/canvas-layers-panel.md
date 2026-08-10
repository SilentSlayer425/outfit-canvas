# Canvas Layers Panel

## Goal

Add a visual layers panel to the outfit canvas builder that shows all items in the current outfit stacked by z-index. Users can reorder layers, toggle visibility, lock/unlock items, and quickly select items from the list. This provides better control and clarity when working with many overlapping items.

## Current Code Anchors

- `src/components/OutfitCanvas.tsx`: main canvas component, manages item rendering and selection.
- `src/types/closet.ts`: `OutfitItem` with position, size, z-index data.
- `src/pages/Index.tsx`: layout and state management.
- `src/hooks/useOutfitState.ts` (or similar): outfit item state.
- CSS/styling for canvas area.

## Data Model

Extend outfit item metadata for layer management:

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
  opacity?: number;  // 0–1, for blend/transparency control
  locked?: boolean;  // prevent accidental movement
  hidden?: boolean;  // toggle visibility
}

export interface CanvasLayer {
  id: string;  // same as outfitItemId
  title: string;  // derived from clothing item name
  zIndex: number;
  visible: boolean;
  locked: boolean;
  thumbnail?: string;  // small preview image
}
```

## Implementation Steps

### Phase 1: Layer Panel UI Component

1. Create `LayersPanel.tsx`:
   - Vertical panel (right or left side of canvas).
   - Shows stack of items from top to bottom (highest z-index at top).
   - Each layer item displays:
     - **Thumbnail**: small preview image of clothing item (~40px).
     - **Title**: item name/category (e.g., "Blue jacket").
     - **Visibility toggle**: eye icon, click to hide/show item on canvas.
     - **Lock toggle**: lock icon, click to lock/unlock movement.
     - **Z-index controls**: up/down arrows to move layer up/down in stack.
   - Selected layer is highlighted (matches current canvas selection).

2. Layer interaction:
   - Click layer to select item on canvas.
   - Drag layer to reorder z-index.
   - Double-click title to rename (optional, non-destructive).
   - Right-click → context menu: Delete, Duplicate, Move to top/bottom.

3. Styling:
   - Compact design; don't take up excessive space.
   - Use icons (Font Awesome, Lucide) for visibility, lock, move controls.
   - Hover effects for clarity.
   - Color-code selected layer (highlight or outline).

### Phase 2: Integrate with Canvas

1. Update `OutfitCanvas.tsx`:
   - Render `LayersPanel.tsx` alongside canvas.
   - Sync selection state: clicking layer selects item; selecting item on canvas highlights layer.
   - Sync visibility state: toggling eye icon hides item on canvas.
   - Sync lock state: locked items show different cursor and reject drag.

2. Z-index management:
   - Up/down arrow buttons in layer panel adjust z-index.
   - Reorder items in stack; update underlying `OutfitItem.zIndex` value.
   - Preserve relative z-index (e.g., if stacks are 1, 5, 10, moving "5" up to "7" is OK).
   - Min z-index should be above background person (0) and below UI (1000+).

3. Visibility toggle:
   - Eye icon for each layer.
   - Hides item on canvas without deleting it.
   - State stored in `OutfitItem.hidden`.
   - Keyboard shortcut: `H` to toggle visibility of selected layer.

4. Lock toggle:
   - Lock icon for each layer.
   - Locked items can't be dragged or resized.
   - Still selectable; can delete or adjust via properties panel.
   - State stored in `OutfitItem.locked`.
   - Keyboard shortcut: `L` to toggle lock on selected layer.

### Phase 3: Layer Controls & Actions

1. **Reorder/Z-index**:
   - Up/down arrows move layer one step in stack.
   - "Bring to front" / "Send to back" buttons (keyboard: `Home` / `End`).
   - Drag-to-reorder in panel (drag layer in list to new position).

2. **Delete layer**:
   - Delete button or right-click menu.
   - Confirmation: "Remove {item name}?"

3. **Duplicate layer**:
   - Right-click → "Duplicate".
   - Creates copy of item at same position (slightly offset to avoid exact overlap).

4. **Color coding** (optional):
   - Assign color tags to layers (e.g., top/bottom/accessory).
   - Small color dot next to thumbnail.

### Phase 4: Advanced Features (Phase 2+)

1. **Opacity/blend control**:
   - Slider in layer panel to adjust opacity (0–100%).
   - Useful for previewing layering or adjusting transparency.
   - State stored in `OutfitItem.opacity`.

2. **Layer groups** (optional):
   - Group related layers (e.g., "Accessories", "Top", "Bottom").
   - Collapse/expand groups.
   - Move entire group's z-index.

3. **Blend modes** (advanced):
   - Dropdown for blend mode: Normal, Multiply, Screen, Overlay, etc.
   - Canvas uses CSS `mix-blend-mode`.
   - Useful for artistic layering.

4. **Layer visibility history**:
   - Remember which layers were visible last session.
   - Quick toggle presets: "Show all", "Hide accessories", "Hide layers except top".

5. **Search in layers**:
   - Search/filter box at top of panel: "Find layer by name".
   - Highlights matching layers.

## UI Layout

```
┌─────────────────────────┐
│  Canvas Area            │┌──────────────────┐
│                         ││  LAYERS          │
│  [outfit preview]       ││  ┌─────────────┐ │
│                         ││  │ 👁️ 🔓 ↑↓   │ │
│                         ││  │ [Jacket]    │ │
│                         ││  │ Blue Denim  │ │
│                         ││  ├─────────────┤ │
│                         ││  │ 👁️ 🔓 ↑↓   │ │
│                         ││  │ [Shirt]     │ │
│                         ││  │ White Cotton│ │
│                         ││  ├─────────────┤ │
│                         ││  │ 👁️ 🔒 ↑↓   │ │ (locked)
│                         ││  │ [Pants]     │ │
│                         ││  │ Black Jeans │ │
│                         ││  └─────────────┘ │
│                         ││ [-] [+] [×]     │
│                         ││ Delete Dup Move │
│                         └──────────────────┘
└─────────────────────────┘
```

## UI Notes

- **Compact panel**: Width ~200–250px; collapsible on mobile.
- **Icons**: Use clear, recognizable icons (eye, lock, arrows).
- **Hover tooltips**: "Bring to front (Home)", "Delete (Del)", etc.
- **Keyboard shortcuts**:
  - `H` – toggle visibility
  - `L` – toggle lock
  - `Delete` – delete layer
  - `Ctrl+D` – duplicate layer
  - `Home` – bring to front
  - `End` – send to back
  - `↑ / ↓` – move up/down one layer (when layer selected)
- **Touch-friendly**: Large enough touch targets on mobile.
- **Responsive**: Hide layers panel on very small screens; add hamburger menu to toggle.

## Verification

- Layers panel displays all items in current outfit.
- Order matches canvas z-index (top item in panel = highest z-index).
- Clicking layer selects item on canvas immediately.
- Visibility toggle hides/shows item on canvas.
- Lock toggle prevents item movement.
- Z-index controls reorder items correctly.
- Drag-to-reorder in panel works smoothly.
- Right-click context menu appears correctly.
- Selected layer is visually highlighted.
- Keyboard shortcuts work as expected.
- Delete/duplicate actions complete without lag.
- Layers persist when outfit is saved and reloaded.
- Panel is accessible (keyboard navigation, screen readers).

## Performance Considerations

- **Large outfits**: If outfit has 20+ items, panel should still be responsive.
  - Virtualize list if needed (only render visible items).
  - Debounce z-index reordering to avoid excessive re-renders.

## Future Enhancements

- **Layer effects**: Add blur, shadow, or glow to individual items.
- **Clipping masks**: Mask one layer to the shape of another (e.g., pattern overlay).
- **Non-destructive filters**: Store layer-specific adjustments (brightness, hue shift).
- **Layer presets**: Save/load layer configurations for quick outfit variations.
- **Collaborative layers**: Show which team member edited each layer (if multiplayer).
- **Animated preview**: Play through layers one-by-one to show dressing sequence.
