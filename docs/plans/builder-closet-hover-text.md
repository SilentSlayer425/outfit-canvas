# Builder Closet Hover Text

## Goal

Show helpful hover text for closet items while adding them from the builder page, without making the closet page noisier.

## Current Code Anchors

- `src/pages/Index.tsx`: builder tab renders `ClothingGrid` with `selectable`.
- `src/components/ClothingGrid.tsx`: item card click behavior changes when `selectable` is true.
- `src/components/ui/tooltip.tsx`: Tooltip components already exist and are used in `SavedOutfits.tsx`.

## Implementation Steps

1. Add an optional prop to `ClothingGrid`, such as `showItemHoverText?: boolean`.
2. Pass `showItemHoverText` only from the builder tab.
3. Wrap selectable item cards or their images in `Tooltip`.
4. Tooltip content should include:
   - item name
   - category/subcategory
   - brand when the brand-tagging feature exists
   - short description when present
5. Keep mobile behavior unchanged; tapping should still add the item to the outfit.

## Verification

- Hovering a builder closet item shows the item metadata.
- Clicking still adds the item to the outfit.
- Closet tab cards are unchanged unless the prop is enabled.
- Tooltip remains readable in dark mode.
