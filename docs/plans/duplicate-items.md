# Duplicate Items

## Goal

Allow users to quickly duplicate existing clothing items with optional customizations (size, color, wear count reset, link to original). This is useful for creating multiple variations of the same base item (e.g., "Black jeans - worn", "Black jeans - pristine") or bulk-creating similar items without re-uploading images.

## Current Code Anchors

- `src/hooks/useCloset.ts`: `addItem()`, `updateItem()`, `deleteItem()` operations.
- `src/types/closet.ts`: `ClothingItem` schema with all metadata fields.
- `src/components/ClothingGrid.tsx`: item display with context menu.
- `src/components/EditItemModal.tsx`: item details editor.
- `src/lib/closet-storage.ts`: IndexedDB operations.

## Data Model

Add optional reference to original item and duplication metadata:

```ts
export interface ClothingItem {
  // ... existing fields ...
  duplicatedFromId?: string;  // reference to original if this is a duplicate
  isDuplicate?: boolean;  // convenience flag
}

export interface DuplicateItemOptions {
  resetWearCount?: boolean;  // default: true
  resetFavorite?: boolean;  // default: false
  customizations?: {
    title?: string;
    colorVariant?: string;
    sizeVariant?: string;
    description?: string;
  };
  linkToOriginal?: boolean;  // keep reference for syncing later
}
```

No database migration needed; fields are optional.

## Implementation Steps

### Phase 1: Duplicate Actions

1. Add context menu to `ClothingGrid.tsx`:
   - Right-click or long-press item → show menu with:
     - Edit
     - Duplicate
     - Delete
     - Favorite
     - Add to outfit

2. Create `DuplicateItemModal.tsx`:
   - Shows preview of original item.
   - Checkboxes for customizations:
     - "Reset wear count" (default: checked).
     - "Keep as favorite" (default: unchecked).
     - "Link to original" (for syncing updates, default: unchecked).
   - Text fields for optional changes:
     - Title (e.g., "Black jeans - worn" → "Black jeans - pristine").
     - Size variant (e.g., "Size 30" → "Size 32").
     - Color variant (e.g., add to title: "- navy").
     - Description additions (e.g., "Great condition, no stains").
   - Preview of resulting duplicate.
   - "Create Duplicate" button.

3. Implement duplication logic in `useCloset.ts`:
   ```ts
   async function duplicateItem(
     itemId: string,
     options?: DuplicateItemOptions
   ): Promise<ClothingItem> {
     // Clone item
     // Apply customizations
     // Reset wear count if enabled
     // Clear favorite flag unless specified
     // Save as new item
     // Return new item ID
   }
   ```

### Phase 2: Customization Flow

1. **Quick duplicate** (keyboard shortcut):
   - `Ctrl+D` on selected item → instantly duplicate with defaults.
   - No modal; new item appears in grid immediately.

2. **Batch duplicate**:
   - Select multiple items (checkboxes in grid).
   - "Duplicate Selected" action.
   - Modal for: apply same changes to all, or customize each individually.

3. **Duplicate options**:
   - Preserve image(s): yes (always; images are shared by reference).
   - Preserve category/tags: yes (or customize).
   - Preserve price: yes (or customize).
   - Reset wear count: yes (configurable).
   - Reset last worn date: yes (configurable).
   - Reset favorite: yes (configurable).
   - Reset notes/custom fields: no (preserve by default).

### Phase 3: Linking & Syncing (Phase 2+)

If user enables "Link to original", track relationship:

1. When original item is updated:
   - Offer to sync duplicates: "Update wear count from Black jeans original?"
   - Allow batch sync of metadata changes (category, tags, description).
   - Never auto-sync images unless user opts in.

2. In item detail view:
   - Show "Duplicated from: [link to original]" if applicable.
   - Show list of duplicates: "This item has 3 duplicates".
   - Quick link to view/manage related items.

3. In grid:
   - Optional badge/icon on duplicates: "🔗 Duplicate".
   - Hover tooltip shows original item.

### Phase 4: Use Cases & Templates

1. **Size variations**:
   - User uploads "Blue shirt - M".
   - Duplicate as "Blue shirt - L", "Blue shirt - S".
   - Track fit notes on each size variant.

2. **Condition variants**:
   - "Black jeans - new".
   - Duplicate as "Black jeans - worn" (reset wear count).
   - Different notes for condition/care.

3. **Color variants**:
   - "Sweater - navy" (upload navy version).
   - Duplicate as "Sweater - gray", "Sweater - cream" (reuse image, customize title).
   - Note: user should ideally upload image for each color, but duplicate is quick placeholder.

4. **Seasonal duplicates**:
   - "Summer dress".
   - Duplicate as "Summer dress - backup" (in case of washing/damage).

### Phase 5: Bulk Templates (Phase 2+)

1. **Duplicate with presets**:
   - User creates a duplicate preset: "Size variants (S/M/L/XL)".
   - One click generates 4 duplicates with size-specific titles.

2. **Template management**:
   - Save/edit/delete duplicate presets.
   - Share presets with friends (optional).

## UI Notes

- **Context menu**: Right-click or three-dot menu on each grid item.
- **Keyboard shortcut**: `Ctrl+D` for quick duplicate with defaults.
- **Confirmation**: Show toast notification: "Item duplicated as 'Black jeans - pristine'".
- **Quick duplicate**: Duplicate appears in grid immediately; no page refresh needed.
- **Linking UI**: Use icons like 🔗 or 🔀 to show related items.
- **Mobile**: Long-press to open context menu with Duplicate action.

## Verification

- Duplicate creates new item with unique ID.
- Original item is unmodified.
- Images are reused (no additional storage).
- Customizations apply correctly (title, size, etc.).
- Wear count resets if enabled.
- Batch duplicate creates multiple items without lag.
- Linked duplicates sync metadata correctly.
- Duplicates appear in grid and can be filtered/searched.
- Duplicates sync to Google Drive as independent items.
- Deleting a duplicate doesn't affect original.
- Deleting original doesn't affect duplicates.

## Future Enhancements

- **Duplicate with variations**: Generate color/size matrix from single template image.
- **Undo duplicate**: Easily remove accidental duplicates.
- **Duplicate to outfit**: Create outfit from template item (e.g., all variants of a top).
- **Merge duplicates**: Combine multiple variants back into single item.
- **Statistics**: Show which duplicates are most worn.
- **Clone outfit**: Duplicate entire outfits with similar workflows.
