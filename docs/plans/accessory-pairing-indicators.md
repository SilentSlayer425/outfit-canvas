# Accessory Pairing Indicators

## Goal

Show when an accessory is intentionally paired with a specific clothing item, so users can tell that an accessory belongs with a shirt, jacket, dress, bag, or other outfit piece instead of floating as a separate item.

## Current Code Anchors

- `src/types/closet.ts`: `OutfitItem` stores each item on the canvas but has no relationship to other outfit items.
- `src/components/OutfitCanvas.tsx`: renders draggable outfit items and already handles selection, z-index, movement, and item controls.
- `src/components/ClothingGrid.tsx`: lets users add closet items to the builder.
- `src/components/SavedOutfits.tsx`: previews saved outfit items but does not show item relationships.

## Data Model

Add an optional pairing field to `OutfitItem`:

```ts
export interface OutfitItem {
  pairedToClothingId?: string;
}
```

This keeps pairing outfit-specific. A necklace may pair with one dress in one outfit, but with a different top in another outfit.

If the app later needs multiple instances of the same clothing item in one outfit, use a generated `outfitItemId` instead of `clothingId` for pair links.

## Implementation Steps

1. Add `pairedToClothingId?: string` to `OutfitItem` in `src/types/closet.ts`.
2. In `OutfitCanvas`, add a pairing control when an accessory item is selected.
3. Let the user choose which existing non-accessory outfit item the accessory is paired to.
4. Show a small visual indicator on paired accessories:
   - link icon badge
   - subtle connector line
   - matching outline color on the accessory and target item
5. Add paired item text to hover/details, such as `Paired with: Denim Jacket`.
6. Include pairing information in saved outfits automatically because outfit items are already serialized.
7. In `SavedOutfits`, show a tiny link badge or grouped preview for paired accessories.

## UI Notes

The first version should avoid automatic movement. Pairing should communicate relationship only. Later, the app can optionally move paired accessories together with their target item.

Recommended first interaction:

- Select an accessory on the canvas.
- Click a link/pair button in the selected item controls.
- Pick a target clothing item from a small menu.
- Show the accessory as paired until the user clears it.

## Verification

- User can pair an accessory with a clothing item in the builder.
- Pair indicator remains visible after selecting other items.
- Saved outfits preserve and reload pair relationships.
- Deleting a target item clears or hides pair links gracefully.
- Accessories can still be moved, resized, layered, and deleted normally.
