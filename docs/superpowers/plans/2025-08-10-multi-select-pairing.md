# Multi-Select Pairing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable users to link a single accessory to multiple main items (tops, bottoms, shoes, etc.) in a single action, replacing the current one-at-a-time pairing flow.

**Architecture:** Convert the single-select `LinkToItemModal` to multi-select with checkboxes. Update `createOutfitWithPairing` in `useCloset.ts` to accept an array of main item IDs instead of a single ID. Update callers in `ItemDetailModal`, `OutfitCanvas`, and `Index.tsx` to pass arrays. The data model already supports `pairedToClothingIds: string[]`, so no schema changes needed.

**Tech Stack:** React 18, TypeScript, Framer Motion (animations), Lucide React (icons), Sonner (toasts)

## Global Constraints

- Do not modify test files during implementation (tests can be added after feature is working)
- Maintain existing animation/motion effects (Framer Motion)
- Keep existing toast notification patterns (Sonner)
- Use existing Tailwind classes and shadcn/ui components
- Already-linked items in the modal should be highlighted visually

---

### Task 1: Update LinkToItemModal to Multi-Select with Checkboxes

**Files:**
- Modify: `src/components/LinkToItemModal.tsx`

**Interfaces:**
- Consumes: `ClothingItem`, `CATEGORY_LABELS` from `src/types/closet`
- Produces: Component with new props:
  - `selectedItemIds: string[]` (array of selected IDs, replaces single-item selection)
  - `onSelectionChange: (ids: string[]) => void` (replaces `onSelect`)
  - `linkedItemIds?: string[]` (optional: IDs already linked to highlight)
- Button behavior: disabled if selectedItemIds.length === 0, text changes to "Link to X items"

- [ ] **Step 1: Read current LinkToItemModal and understand structure**

Open `/Users/sai/Documents/GitHub/outfit-canvas/src/components/LinkToItemModal.tsx` to review the current interface.

- [ ] **Step 2: Update component props interface**

Replace the `LinkToItemModalProps` interface:

```typescript
interface LinkToItemModalProps {
  open: boolean;
  accessoryItem: ClothingItem | null;
  availableItems: ClothingItem[];
  onClose: () => void;
  selectedItemIds: string[];  // NEW: array of selected IDs
  onSelectionChange: (ids: string[]) => void;  // NEW: callback for selection changes
  linkedItemIds?: string[];  // NEW: optional already-linked items to highlight
  isLoading?: boolean;
}
```

- [ ] **Step 3: Update component state**

Replace the `searchQuery` state management. After the existing `const [searchQuery, setSearchQuery] = useState('')` line, keep it. Remove the old `onSelect` from destructuring and add the new props.

- [ ] **Step 4: Add checkbox toggle handler**

After the `filteredItems` useMemo, add this handler function:

```typescript
const toggleSelection = (itemId: string) => {
  if (selectedItemIds.includes(itemId)) {
    onSelectionChange(selectedItemIds.filter(id => id !== itemId));
  } else {
    onSelectionChange([...selectedItemIds, itemId]);
  }
};
```

- [ ] **Step 5: Update description text**

In the description paragraph (currently "Select an item to pair..."), change to:

```jsx
<p className="mb-4 text-sm text-muted-foreground">
  Select items to pair with <span className="font-medium">{accessoryItem.name}</span>
  {selectedItemIds.length > 0 && <span className="ml-2 font-medium">({selectedItemIds.length} selected)</span>}
</p>
```

- [ ] **Step 6: Add checkbox to each item row**

In the ScrollArea, replace the button for each item with a checkbox-enabled version:

```jsx
<div className="space-y-1">
  {filteredItems.map((item) => {
    const isSelected = selectedItemIds.includes(item.id);
    const isAlreadyLinked = linkedItemIds?.includes(item.id);
    return (
      <button
        key={item.id}
        onClick={() => toggleSelection(item.id)}
        disabled={isLoading}
        className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
          isSelected ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-muted'
        } ${isAlreadyLinked ? 'opacity-60' : ''} disabled:opacity-50`}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          disabled={isLoading}
          className="mt-1 shrink-0"
          aria-label={`Select ${item.name}`}
        />
        {/* Item thumbnail */}
        <div className="h-12 w-12 rounded bg-muted/50 flex-shrink-0 overflow-hidden">
          <img
            src={item.imageData}
            alt={item.name}
            className="w-full h-full object-contain"
          />
        </div>
        {/* Item info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {item.name}
            </p>
            {isAlreadyLinked && (
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Linked
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{CATEGORY_LABELS[item.category]}</span>
            {item.subcategory && (
              <>
                <span>·</span>
                <span>{item.subcategory}</span>
              </>
            )}
          </div>
          {item.brand && (
            <p className="text-xs text-muted-foreground">{item.brand}</p>
          )}
        </div>
      </button>
    );
  })}
</div>
```

- [ ] **Step 7: Add Link button at bottom**

Before the closing `</motion.div>`, add an action bar with the Link button:

```jsx
{selectedItemIds.length > 0 && (
  <div className="flex gap-2 mt-4 pt-3 border-t border-border">
    <button
      onClick={onClose}
      className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
    >
      Cancel
    </button>
    <button
      onClick={() => {
        onSelectionChange(selectedItemIds);
        setSearchQuery('');
        onClose();
      }}
      className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
    >
      Link to {selectedItemIds.length} item{selectedItemIds.length !== 1 ? 's' : ''}
    </button>
  </div>
)}
```

- [ ] **Step 8: Commit changes**

```bash
cd /Users/sai/Documents/GitHub/outfit-canvas
git add src/components/LinkToItemModal.tsx
git commit -m "feat: convert LinkToItemModal to multi-select with checkboxes"
```

---

### Task 2: Update createOutfitWithPairing in useCloset.ts

**Files:**
- Modify: `src/hooks/useCloset.ts:161-197` (the createOutfitWithPairing function)

**Interfaces:**
- Consumes: `items` state, `ClothingItem`, `Outfit` types
- Produces: Updated function signature:
  - `createOutfitWithPairing(accessoryId: string, mainItemIds: string[]): Outfit | null`
  - Must handle empty array (returns null)
  - Must handle multiple main items

- [ ] **Step 1: Review current createOutfitWithPairing implementation**

Read lines 161-197 to understand current single-item logic.

- [ ] **Step 2: Update function signature**

Change the function declaration from:

```typescript
const createOutfitWithPairing = useCallback((accessoryId: string, mainItemId: string) => {
```

to:

```typescript
const createOutfitWithPairing = useCallback((accessoryId: string, mainItemIds: string[]) => {
```

- [ ] **Step 3: Add validation for empty array**

At the start of the function body, after the signature, add:

```typescript
if (mainItemIds.length === 0) return null;

const accessoryItem = items.find((i) => i.id === accessoryId);
if (!accessoryItem) return null;
```

- [ ] **Step 4: Build outfit items array dynamically**

Replace the entire `const newOutfit: Outfit` block with:

```typescript
const outfitItemsToCreate: OutfitItem[] = [];

// Add all main items
mainItemIds.forEach((mainItemId, index) => {
  const mainItem = items.find((i) => i.id === mainItemId);
  if (!mainItem) return; // Skip if not found
  
  outfitItemsToCreate.push({
    clothingId: mainItemId,
    category: mainItem.category,
    x: index * 80, // Offset each main item slightly
    y: 0,
    scale: 1,
    zIndex: index + 1,
    side: 'front',
  });
});

// Add accessory paired to all of them
outfitItemsToCreate.push({
  clothingId: accessoryId,
  category: accessoryItem.category,
  x: 100,
  y: -50,
  scale: 1,
  zIndex: mainItemIds.length + 1,
  side: 'front',
  pairedToClothingIds: mainItemIds, // Link to all main items
});

// Create outfit with generated name
const mainItemNames = mainItemIds
  .map(id => items.find(i => i.id === id)?.name || '')
  .filter(Boolean);
const outfitName = mainItemNames.length > 0 
  ? `${mainItemNames.join(' + ')} + ${accessoryItem.name}`
  : accessoryItem.name;

const newOutfit: Outfit = {
  id: crypto.randomUUID(),
  name: outfitName,
  items: outfitItemsToCreate,
  createdAt: Date.now(),
};
```

- [ ] **Step 5: Commit changes**

```bash
cd /Users/sai/Documents/GitHub/outfit-canvas
git add src/hooks/useCloset.ts
git commit -m "feat: update createOutfitWithPairing to accept array of main items"
```

---

### Task 3: Update ItemDetailModal to Pass Array to Handler

**Files:**
- Modify: `src/components/ItemDetailModal.tsx:33-61` (props and handler)

**Interfaces:**
- Consumes: Updated `createOutfitWithPairing` signature from Task 2
- Produces: Updated `onCreatePairing?: (accessoryId: string, mainItemIds: string[]) => void` prop signature

- [ ] **Step 1: Update component props interface**

Change the `ItemDetailModalProps` interface:

```typescript
onCreatePairing?: (accessoryId: string, mainItemIds: string[]) => void; // Updated to array
```

- [ ] **Step 2: Update handlePairItem handler**

Replace the current `handlePairItem` function (lines 57-61) with:

```typescript
const handlePairItem = (selectedItemIds: string[]) => {
  if (selectedItemIds.length === 0) {
    toast.error('Please select at least one item');
    return;
  }
  onCreatePairing?.(item.id, selectedItemIds);
  const count = selectedItemIds.length;
  toast.success(`Linked ${item.name} to ${count} item${count !== 1 ? 's' : ''}`);
  setLinkModalOpen(false);
};
```

- [ ] **Step 3: Update LinkToItemModal component call**

Replace the LinkToItemModal usage (around line 211-217) with:

```typescript
<LinkToItemModal
  open={linkModalOpen}
  accessoryItem={item}
  availableItems={mainItems}
  selectedItemIds={[]} // Start with empty selection
  onSelectionChange={handlePairItem}
  linkedItemIds={pairingInfo.pairedItems.map(i => i.id)} // Show already-linked items
  onClose={() => setLinkModalOpen(false)}
/>
```

- [ ] **Step 4: Commit changes**

```bash
cd /Users/sai/Documents/GitHub/outfit-canvas
git add src/components/ItemDetailModal.tsx
git commit -m "feat: update ItemDetailModal to pass array of IDs to pairing handler"
```

---

### Task 4: Update OutfitCanvas Pairing Modal

**Files:**
- Modify: `src/components/OutfitCanvas.tsx:46-52` (props), `158-172` (handlers), `300-342` (modal)

**Interfaces:**
- Consumes: Updated `createOutfitWithPairing` signature
- Produces: No new exports; internal refactor of pairing modal

- [ ] **Step 1: Update handlePairing function**

Replace the `handlePairing` function (lines 158-166) with:

```typescript
const handlePairing = (selectedItemIds: string[]) => {
  if (pairingSelectedIdx === null || selectedItemIds.length === 0) {
    setPairingModalOpen(false);
    setPairingSelectedIdx(null);
    return;
  }
  const pairingItem = outfitItems[pairingSelectedIdx];
  if (pairingItem) {
    // Update the selected accessory with paired item IDs
    onUpdateItem(pairingSelectedIdx, { pairedToClothingIds: selectedItemIds });
  }
  setPairingModalOpen(false);
  setPairingSelectedIdx(null);
};
```

- [ ] **Step 2: Replace Dialog with LinkToItemModal**

First, add import at top of file:

```typescript
import { LinkToItemModal } from '@/components/LinkToItemModal';
```

Then replace the `<Dialog>` block (lines 300-342) with:

```typescript
{pairingSelectedIdx !== null && (
  <LinkToItemModal
    open={pairingModalOpen}
    accessoryItem={getItemById(outfitItems[pairingSelectedIdx]?.clothingId)}
    availableItems={outfitItems
      .map((oi, idx) => {
        if (idx === pairingSelectedIdx || isPairableCategory(oi.category)) {
          return null;
        }
        return getItemById(oi.clothingId);
      })
      .filter((item): item is ClothingItem => item !== null)}
    selectedItemIds={outfitItems[pairingSelectedIdx]?.pairedToClothingIds ?? []}
    onSelectionChange={handlePairing}
    linkedItemIds={outfitItems[pairingSelectedIdx]?.pairedToClothingIds}
    onClose={() => setPairingModalOpen(false)}
  />
)}
```

Also remove the Dialog import if no longer used in the file.

- [ ] **Step 3: Commit changes**

```bash
cd /Users/sai/Documents/GitHub/outfit-canvas
git add src/components/OutfitCanvas.tsx
git commit -m "feat: update OutfitCanvas pairing modal to use LinkToItemModal multi-select"
```

---

### Task 5: Update Index.tsx to Handle Array Calls

**Files:**
- Modify: `src/pages/Index.tsx:555` (onCreatePairing prop)

**Interfaces:**
- Consumes: Updated `onCreatePairing` signature from Task 3
- Produces: No changes needed to createOutfitWithPairing usage (already passed directly)

- [ ] **Step 1: Verify current usage**

Check line 555 where `onCreatePairing={createOutfitWithPairing}` is passed. No changes needed since the function signature was updated in Task 2 and will now expect the array.

- [ ] **Step 2: No changes required**

The Index.tsx file passes `createOutfitWithPairing` directly to ItemDetailModal. Since the function signature was updated in useCloset.ts to accept an array, this will work automatically.

- [ ] **Step 3: Verify all imports are correct**

Ensure that ItemDetailModal is imported and LinkToItemModal is imported in OutfitCanvas.

- [ ] **Step 4: Commit (no-op for Index.tsx)**

```bash
cd /Users/sai/Documents/GitHub/outfit-canvas
git status
# If no changes, skip this commit - Task 3 and 4 handle all necessary changes
```

---

### Task 6: Test Multi-Select Pairing Flow

**Files:**
- No new files; manual testing only

**Interfaces:**
- Tests the complete flow: LinkToItemModal → ItemDetailModal → OutfitCanvas

- [ ] **Step 1: Start dev server**

```bash
cd /Users/sai/Documents/GitHub/outfit-canvas
npm run dev
```

Wait for the server to start on http://localhost:8080

- [ ] **Step 2: Upload test items**

Add these items to your closet:
- 3 different tops (e.g., "Red T-Shirt", "Blue Blouse", "White Polo")
- 1 accessory (e.g., "Gold Necklace")

- [ ] **Step 3: Test ItemDetailModal pairing**

1. Navigate to My Closet tab
2. Click on the Gold Necklace to open ItemDetailModal
3. Click "Link to Item" button
4. Verify the modal shows checkboxes next to each top
5. Select all 3 tops by clicking checkboxes
6. Verify button shows "Link to 3 items"
7. Click the button
8. Verify toast says "Linked Gold Necklace to 3 items"
9. Verify ItemDetailModal shows "Linked Items (3)" section with all 3 tops

- [ ] **Step 4: Test OutfitCanvas pairing**

1. Navigate to Build Outfit tab
2. Add one of the tops to the canvas
3. Add the Gold Necklace to the canvas
4. Select the necklace and click the Link button (chain icon)
5. Verify LinkToItemModal opens with the top item showing
6. Click the checkbox to pair them
7. Click "Link to 1 item"
8. Verify the necklace's pairedToClothingIds now shows [topId]

- [ ] **Step 5: Test no duplicates**

1. In Build Outfit, add all 3 tops to the canvas
2. Add the Gold Necklace
3. Select the necklace, click Link button
4. Select all 3 tops
5. Click "Link to 3 items"
6. Verify the necklace now shows pairedToClothingIds with all 3 top IDs
7. Verify no duplicate items on the canvas

- [ ] **Step 6: Test already-linked highlighting**

1. In ItemDetailModal for the necklace, click "Link to Item" again
2. Verify the 3 tops that are already linked show "Linked" badge
3. Verify they appear slightly faded (opacity-60)
4. Verify you can uncheck them to remove the pairing

- [ ] **Step 7: Run build to verify no TypeScript errors**

```bash
cd /Users/sai/Documents/GitHub/outfit-canvas
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 8: Run linter to verify code quality**

```bash
npm run lint
```

Expected: No linting errors (may have warnings, but no errors)

- [ ] **Step 9: Commit successful tests**

```bash
cd /Users/sai/Documents/GitHub/outfit-canvas
git log --oneline -5
# Verify all 3 commits are present:
# - feat: convert LinkToItemModal to multi-select with checkboxes
# - feat: update createOutfitWithPairing to accept array of main items
# - feat: update ItemDetailModal to pass array of IDs to pairing handler
# - feat: update OutfitCanvas pairing modal to use LinkToItemModal multi-select
```

---

## Implementation Checklist

- [ ] Task 1: LinkToItemModal multi-select (8 steps)
- [ ] Task 2: useCloset.ts function update (5 steps)
- [ ] Task 3: ItemDetailModal updates (4 steps)
- [ ] Task 4: OutfitCanvas pairing modal (3 steps)
- [ ] Task 5: Index.tsx verification (4 steps)
- [ ] Task 6: Testing and verification (9 steps)

---

## Success Criteria

✓ Users can select multiple items in LinkToItemModal with checkboxes
✓ Modal shows selected count and updates button text dynamically
✓ Already-linked items are highlighted with "Linked" badge
✓ Single accessory can be linked to 2+ main items simultaneously
✓ Toast notification shows correct count
✓ No duplicate items added to canvas
✓ Build passes with no TypeScript errors
✓ All pairing relationships persist across save/load cycles
