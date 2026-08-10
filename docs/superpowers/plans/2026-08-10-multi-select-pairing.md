# Multi-Select Accessory Pairing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable users to link a single accessory (necklace, bag, earrings) to multiple clothing items (multiple shirts, multiple outfits) in one action, showing visual selection state and counts throughout the UI.

**Architecture:** Convert single-select modals to multi-select by tracking selected item IDs in state, rendering checkboxes/indicators, and updating handlers to pass arrays. The data model already supports `pairedToClothingIds: string[]` in OutfitItem, so we're primarily updating the UI and hook logic to leverage this existing structure.

**Tech Stack:** React 18, TypeScript, Framer Motion, Lucide icons, shadcn/ui components

## Global Constraints

- Data model: `OutfitItem.pairedToClothingIds` is already defined as `string[]` in src/types/closet.ts (line 79)
- Maintain backward compatibility where possible (check for both old `pairedToClothingId` and new `pairedToClothingIds`)
- All changes must compile with TypeScript strict mode
- No breaking changes to the Outfit/Closet export/import format

---

## File Structure & Responsibilities

```
src/components/
  LinkToItemModal.tsx          — Multi-select modal with checkboxes & count display
  ItemDetailModal.tsx           — Updated to show multi-select count in button text
  OutfitCanvas.tsx              — Pairing modal updated to multi-select

src/hooks/
  useCloset.ts                  — createOutfitWithPairing handles array of mainItemIds

src/lib/
  pairing-helpers.ts            — Helper to parse both old & new pairing formats

src/types/
  closet.ts                     — Already has pairedToClothingIds (no changes needed)
```

---

## Task 1: Update pairing-helpers.ts to Support Array-Based Pairing

**Files:**
- Modify: `src/lib/pairing-helpers.ts`
- Test: `src/lib/__tests__/pairing-helpers.test.ts`

**Interfaces:**
- Consumes: OutfitItem type with pairedToClothingIds: string[]
- Produces: Updated getPairingInfo() function that safely handles both old (pairedToClothingId: string) and new (pairedToClothingIds: string[]) formats

**Details:**

The current `getPairingInfo()` function looks for a single `pairedToClothingId`. We need to update it to:
1. Check for `pairedToClothingIds` (array) first
2. Fall back to `pairedToClothingId` (string) for backward compatibility
3. Handle the case where an item is paired to multiple items

- [ ] **Step 1: Update getPairingInfo return type**

Change the return type to properly reflect multiple pairing:

```typescript
// Old - singular pairedToItem
export interface PairingInfo {
  pairedToItems: ClothingItem[];    // What this item is paired to (e.g., accessory paired to multiple shirts)
  pairedItems: ClothingItem[];       // What is paired to this item (e.g., shirt with multiple accessories)
}
```

The interface is already correct (line 21-26). No change needed. Continue to Step 2.

- [ ] **Step 2: Update getPairingInfo function to handle array pairing**

Replace the entire `getPairingInfo()` function (lines 34-71) with:

```typescript
export function getPairingInfo(itemId: string, outfits: Outfit[], allItems: ClothingItem[]): PairingInfo {
  // Find what this item is paired to (support both old single-ID and new multi-ID format)
  const pairedToIds = new Set<string>();

  // Look through all outfit items to find if this item is paired to something
  for (const outfit of outfits) {
    for (const outfitItem of outfit.items) {
      if (outfitItem.clothingId === itemId) {
        // New format: pairedToClothingIds array
        if (outfitItem.pairedToClothingIds && Array.isArray(outfitItem.pairedToClothingIds)) {
          outfitItem.pairedToClothingIds.forEach((id) => pairedToIds.add(id));
        }
        // Old format: single pairedToClothingId (backward compatibility)
        else if ((outfitItem as any).pairedToClothingId) {
          pairedToIds.add((outfitItem as any).pairedToClothingId);
        }
      }
    }
  }

  // Build the pairedToItems array
  const pairedToItems = Array.from(pairedToIds)
    .map((id) => allItems.find((item) => item.id === id))
    .filter((item) => item !== undefined) as ClothingItem[];

  // Find all items that are paired to this item
  const pairedItems: ClothingItem[] = [];
  const seenIds = new Set<string>();

  for (const outfit of outfits) {
    for (const outfitItem of outfit.items) {
      // Check new format: pairedToClothingIds array
      if (outfitItem.pairedToClothingIds?.includes(itemId) && !seenIds.has(outfitItem.clothingId)) {
        seenIds.add(outfitItem.clothingId);
        const item = allItems.find((i) => i.id === outfitItem.clothingId);
        if (item) {
          pairedItems.push(item);
        }
      }
      // Check old format: single pairedToClothingId (backward compatibility)
      else if ((outfitItem as any).pairedToClothingId === itemId && !seenIds.has(outfitItem.clothingId)) {
        seenIds.add(outfitItem.clothingId);
        const item = allItems.find((i) => i.id === outfitItem.clothingId);
        if (item) {
          pairedItems.push(item);
        }
      }
    }
  }

  return {
    pairedToItems,
    pairedItems,
  };
}
```

- [ ] **Step 3: Update isItemPaired to handle array format**

Replace the `isItemPaired()` function (lines 77-91) with:

```typescript
export function isItemPaired(itemId: string, outfits: Outfit[]): boolean {
  for (const outfit of outfits) {
    for (const outfitItem of outfit.items) {
      // Check if this item is paired to something (new format: array)
      if (outfitItem.pairedToClothingIds && outfitItem.pairedToClothingIds.length > 0 && outfitItem.clothingId === itemId) {
        return true;
      }
      // Check if this item is paired to something (old format: single ID)
      if ((outfitItem as any).pairedToClothingId && outfitItem.clothingId === itemId) {
        return true;
      }
      // Check if something is paired to this item (new format: array)
      if (outfitItem.pairedToClothingIds?.includes(itemId)) {
        return true;
      }
      // Check if something is paired to this item (old format: single ID)
      if ((outfitItem as any).pairedToClothingId === itemId) {
        return true;
      }
    }
  }
  return false;
}
```

- [ ] **Step 4: Run tests to verify backward compatibility**

Run: `npm run test -- src/lib/__tests__/pairing-helpers.test.ts -v`

Expected: All existing tests pass (tests should cover both old single-ID and new multi-ID formats)

- [ ] **Step 5: Commit**

```bash
git add src/lib/pairing-helpers.ts
git commit -m "feat: update pairing-helpers to support array-based pairing with backward compatibility"
```

---

## Task 2: Update LinkToItemModal to Multi-Select

**Files:**
- Modify: `src/components/LinkToItemModal.tsx`

**Interfaces:**
- Consumes: ClothingItem[], accessoryItem: ClothingItem
- Produces: onSelect callback that receives array of selected items OR an object with selectedIds: string[]

**Details:**

Replace the single-select onClick with multi-select state tracking and checkboxes.

- [ ] **Step 1: Update component props to support multi-select callback**

Replace the onSelect prop (line 25):

```typescript
interface LinkToItemModalProps {
  open: boolean;
  accessoryItem: ClothingItem | null;
  availableItems: ClothingItem[];
  onClose: () => void;
  onSelect: (mainItems: ClothingItem[]) => void;  // Changed from (mainItem: ClothingItem) to array
  isLoading?: boolean;
  alreadyLinkedIds?: string[];  // New prop: show which items are already paired
}
```

- [ ] **Step 2: Add selected state and handlers**

Add after the searchQuery state (line 37):

```typescript
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

const toggleSelection = (itemId: string) => {
  const newSelected = new Set(selectedIds);
  if (newSelected.has(itemId)) {
    newSelected.delete(itemId);
  } else {
    newSelected.add(itemId);
  }
  setSelectedIds(newSelected);
};

const handleConfirm = () => {
  const selectedItems = availableItems.filter((item) => selectedIds.has(item.id));
  if (selectedItems.length > 0) {
    onSelect(selectedItems);
    setSelectedIds(new Set());
    setSearchQuery('');
    onClose();
  }
};
```

- [ ] **Step 3: Update description text**

Replace line 79 with:

```typescript
<p className="mb-4 text-sm text-muted-foreground">
  Select items to pair with <span className="font-medium">{accessoryItem.name}</span>
  {selectedIds.size > 0 && <span className="ml-2 font-medium">— Selected: {selectedIds.size}</span>}
</p>
```

- [ ] **Step 4: Update items list to show checkboxes**

Replace the item button rendering (lines 104-141) with:

```typescript
<div className="space-y-1">
  {filteredItems.map((item) => {
    const isSelected = selectedIds.has(item.id);
    const isAlreadyLinked = alreadyLinkedIds?.includes(item.id) ?? false;
    
    return (
      <button
        key={item.id}
        onClick={() => !isAlreadyLinked && toggleSelection(item.id)}
        disabled={isLoading || isAlreadyLinked}
        className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
          isAlreadyLinked
            ? 'opacity-50 cursor-not-allowed'
            : isSelected
              ? 'bg-primary/10'
              : 'hover:bg-muted'
        }`}
      >
        {/* Checkbox indicator */}
        <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
          isSelected
            ? 'bg-primary border-primary'
            : isAlreadyLinked
              ? 'border-muted-foreground/30'
              : 'border-muted-foreground/50'
        }`}>
          {isSelected && (
            <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {isAlreadyLinked && !isSelected && (
            <svg className="w-3 h-3 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {item.name}
            {isAlreadyLinked && <span className="text-xs text-muted-foreground ml-1">(already linked)</span>}
          </p>
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

- [ ] **Step 5: Add confirm button to modal footer**

Replace the closing button section (lines 67-77) and add button group before it:

```typescript
<div className="mb-4 flex items-center justify-between">
  <h2 className="text-lg font-heading font-semibold text-foreground">
    Link to Items
  </h2>
  <button
    onClick={onClose}
    className="shrink-0 rounded-full p-1 transition-colors hover:bg-muted"
  >
    <X className="h-5 w-5 text-muted-foreground" />
  </button>
</div>

{/* After ScrollArea closes, add buttons */}
{selectedIds.size > 0 && (
  <div className="flex gap-2 mt-4 pt-3 border-t border-border">
    <Button
      variant="outline"
      size="sm"
      className="flex-1 rounded-xl"
      onClick={() => {
        setSelectedIds(new Set());
        setSearchQuery('');
      }}
    >
      Clear ({selectedIds.size})
    </Button>
    <Button
      size="sm"
      className="flex-1 rounded-xl"
      onClick={handleConfirm}
      disabled={isLoading}
    >
      Link to {selectedIds.size} {selectedIds.size === 1 ? 'Item' : 'Items'}
    </Button>
  </div>
)}
```

- [ ] **Step 6: Verify imports**

Ensure Button is imported (add to line 15 if not present):

```typescript
import { Button } from '@/components/ui/button';
```

- [ ] **Step 7: Commit**

```bash
git add src/components/LinkToItemModal.tsx
git commit -m "feat: update LinkToItemModal to multi-select with checkboxes and item count"
```

---

## Task 3: Update ItemDetailModal to Handle Multi-Select

**Files:**
- Modify: `src/components/ItemDetailModal.tsx`

**Interfaces:**
- Consumes: LinkToItemModal multi-select (array of ClothingItem)
- Produces: onCreatePairing callback receives (accessoryId: string, mainItemIds: string[])

**Details:**

Update ItemDetailModal to collect selected items from LinkToItemModal and pass them as an array.

- [ ] **Step 1: Update handlePairItem to accept array**

Replace the handlePairItem function (lines 57-61) with:

```typescript
const handlePairItem = (mainItems: ClothingItem[]) => {
  if (mainItems.length === 0) return;
  
  const mainItemIds = mainItems.map((item) => item.id);
  onCreatePairing?.(item.id, mainItemIds);
  
  const count = mainItems.length;
  const names = mainItems.length <= 2 
    ? mainItems.map((m) => m.name).join(' and ')
    : `${mainItems.length} items`;
  
  toast.success(`Linked ${item.name} to ${names}`);
  setLinkModalOpen(false);
};
```

- [ ] **Step 2: Update onCreatePairing prop type**

Change the prop definition (line 33):

```typescript
onCreatePairing?: (accessoryId: string, mainItemIds: string[]) => void;  // Changed to array
```

- [ ] **Step 3: Get already-linked items to pass to LinkToItemModal**

Add this before the return statement (around line 51):

```typescript
// Get IDs of items already linked to this accessory
const alreadyLinkedIds = pairingInfo.pairedToItems.map((item) => item.id);
```

- [ ] **Step 4: Update LinkToItemModal props to include alreadyLinkedIds**

Replace the LinkToItemModal component props (lines 211-217) with:

```typescript
<LinkToItemModal
  open={linkModalOpen}
  accessoryItem={item}
  availableItems={mainItems}
  onClose={() => setLinkModalOpen(false)}
  onSelect={handlePairItem}
  alreadyLinkedIds={alreadyLinkedIds}
/>
```

- [ ] **Step 5: Update "Link to Item" button text to show count**

Replace the button rendering (lines 172-180):

```typescript
{isItemLinkable(item.category) && mainItems.length > 0 && onCreatePairing && (
  <Button
    variant="outline"
    size="sm"
    className="w-full rounded-xl"
    onClick={() => setLinkModalOpen(true)}
  >
    <Link2 className="w-3.5 h-3.5 mr-1.5" />
    {pairingInfo.pairedToItems.length > 0 
      ? `Link to Items (${pairingInfo.pairedToItems.length} linked)`
      : 'Link to Items'}
  </Button>
)}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/ItemDetailModal.tsx
git commit -m "feat: update ItemDetailModal to handle multi-select pairing with count display"
```

---

## Task 4: Update OutfitCanvas Pairing Modal to Multi-Select

**Files:**
- Modify: `src/components/OutfitCanvas.tsx`

**Interfaces:**
- Consumes: onUpdateItem(index, updates) where updates.pairedToClothingIds: string[]
- Produces: handlePairing function that accepts array of paired item indices

**Details:**

Convert the OutfitCanvas pairing modal from single-select to multi-select.

- [ ] **Step 1: Add selected state for pairing modal**

Add after line 59 (pairingSelectedIdx):

```typescript
const [pairingSelectedIndices, setPairingSelectedIndices] = useState<Set<number>>(new Set());

const togglePairingSelection = (idx: number) => {
  const newSelected = new Set(pairingSelectedIndices);
  if (newSelected.has(idx)) {
    newSelected.delete(idx);
  } else {
    newSelected.add(idx);
  }
  setPairingSelectedIndices(newSelected);
};
```

- [ ] **Step 2: Update handlePairing to accept multiple indices**

Replace the handlePairing function (lines 158-166) with:

```typescript
const handlePairing = () => {
  if (pairingSelectedIdx === null || pairingSelectedIndices.size === 0) return;
  
  const pairedIds = Array.from(pairingSelectedIndices)
    .map((idx) => outfitItems[idx].clothingId)
    .filter((id) => id !== null);
  
  if (pairedIds.length > 0) {
    onUpdateItem(pairingSelectedIdx, { pairedToClothingIds: pairedIds });
  }
  
  setPairingModalOpen(false);
  setPairingSelectedIdx(null);
  setPairingSelectedIndices(new Set());
};
```

- [ ] **Step 3: Update pairing modal dialog content**

Replace the Dialog content (lines 301-342) with:

```typescript
{/* Pairing selection modal */}
<Dialog open={pairingModalOpen} onOpenChange={(open) => {
  setPairingModalOpen(open);
  if (!open) {
    setPairingSelectedIdx(null);
    setPairingSelectedIndices(new Set());
  }
}}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Link to Items</DialogTitle>
      <DialogDescription>
        Select items to pair this accessory with
        {pairingSelectedIndices.size > 0 && (
          <span className="block text-sm font-medium mt-1">
            Selected: {pairingSelectedIndices.size}
          </span>
        )}
      </DialogDescription>
    </DialogHeader>
    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
      {outfitItems.map((oi, idx) => {
        // Skip the item being paired and other pairable items
        if (idx === pairingSelectedIdx || isPairableCategory(oi.category)) {
          return null;
        }
        const item = getItemById(oi.clothingId);
        if (!item) return null;
        
        const isSelected = pairingSelectedIndices.has(idx);
        const wasPreviouslyPaired = outfitItems[pairingSelectedIdx]?.pairedToClothingIds?.includes(oi.clothingId) ?? false;
        
        return (
          <button
            key={idx}
            onClick={() => togglePairingSelection(idx)}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
              isSelected
                ? 'bg-primary/10'
                : wasPreviouslyPaired
                  ? 'bg-muted/50'
                  : 'hover:bg-accent'
            }`}
          >
            {/* Checkbox indicator */}
            <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-primary border-primary'
                : wasPreviouslyPaired
                  ? 'border-muted-foreground/30'
                  : 'border-muted-foreground/50'
            }`}>
              {isSelected && (
                <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {wasPreviouslyPaired && !isSelected && (
                <svg className="w-3 h-3 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
            <div className="flex-1">
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[item.category]}</p>
              {wasPreviouslyPaired && <p className="text-xs text-muted-foreground">(already linked)</p>}
            </div>
          </button>
        );
      })}
      {outfitItems.filter((_, idx) => idx !== pairingSelectedIdx && !isPairableCategory(outfitItems[idx].category)).length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No items available to pair with
        </p>
      )}
    </div>
    {pairingSelectedIndices.size > 0 && (
      <div className="flex gap-2 pt-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setPairingSelectedIndices(new Set())}
        >
          Clear ({pairingSelectedIndices.size})
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={handlePairing}
        >
          Link to {pairingSelectedIndices.size} {pairingSelectedIndices.size === 1 ? 'Item' : 'Items'}
        </Button>
      </div>
    )}
  </DialogContent>
</Dialog>
```

- [ ] **Step 4: Add CATEGORY_LABELS import**

Add to imports (line 23):

```typescript
import { CATEGORY_LABELS } from '@/types/closet';
```

- [ ] **Step 5: Import Button component**

Add to imports if not present:

```typescript
import { Button } from '@/components/ui/button';
```

- [ ] **Step 6: Commit**

```bash
git add src/components/OutfitCanvas.tsx
git commit -m "feat: update OutfitCanvas pairing modal to multi-select with checkboxes"
```

---

## Task 5: Update useCloset.ts createOutfitWithPairing Hook

**Files:**
- Modify: `src/hooks/useCloset.ts`

**Interfaces:**
- Consumes: accessoryId: string, mainItemIds: string[] (changed from mainItemId: string)
- Produces: Outfit with all pairing relationships set correctly in pairedToClothingIds arrays

**Details:**

Update the createOutfitWithPairing function to accept an array of main item IDs and create outfit items with proper pairing.

- [ ] **Step 1: Update createOutfitWithPairing signature and implementation**

Replace the function (lines 161-197) with:

```typescript
const createOutfitWithPairing = useCallback((accessoryId: string, mainItemIds: string | string[]) => {
  const accessoryItem = items.find((i) => i.id === accessoryId);
  
  // Handle both single ID (backward compatibility) and array of IDs
  const mainIds = Array.isArray(mainItemIds) ? mainItemIds : [mainItemIds];
  
  if (!accessoryItem) return null;

  // Find all main items
  const mainItems = mainIds
    .map((id) => items.find((i) => i.id === id))
    .filter((item) => item !== undefined) as ClothingItem[];

  if (mainItems.length === 0) return null;

  // Create outfit with all main items and the accessory paired to each
  const outfitItems: OutfitItem[] = [];
  let zIndex = 1;

  // Add all main items first
  mainItems.forEach((mainItem) => {
    outfitItems.push({
      clothingId: mainItem.id,
      category: mainItem.category,
      x: 0,
      y: 0,
      scale: 1,
      zIndex: zIndex++,
      side: 'front',
    });
  });

  // Add accessory paired to all main items
  outfitItems.push({
    clothingId: accessoryId,
    category: accessoryItem.category,
    x: 100,
    y: -50,
    scale: 1,
    zIndex: zIndex,
    side: 'front',
    pairedToClothingIds: mainIds,  // Pair to all main items
  });

  // Create outfit name based on count
  const outfitName = mainIds.length === 1
    ? `${mainItems[0].name} + ${accessoryItem.name}`
    : `${mainItems[0].name} + ${accessoryItem.name} (+ ${mainIds.length - 1} more)`;

  const newOutfit: Outfit = {
    id: crypto.randomUUID(),
    name: outfitName,
    items: outfitItems,
    createdAt: Date.now(),
  };

  setOutfits((prev) => [newOutfit, ...prev]);
  return newOutfit;
}, [items]);
```

- [ ] **Step 2: Verify imports**

Check that OutfitItem is imported (line 11). Should be:

```typescript
import type { ClothingItem, Outfit, ClothingCategory, CustomMainTag, ClosetState, OutfitItem } from '@/types/closet';
```

- [ ] **Step 3: Test backward compatibility**

The function now accepts both string (old) and string[] (new). Verify it works with:
- Single ID: `createOutfitWithPairing('accessory-id', 'main-id')`
- Multiple IDs: `createOutfitWithPairing('accessory-id', ['main-id-1', 'main-id-2'])`

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCloset.ts
git commit -m "feat: update createOutfitWithPairing to support array of main item IDs"
```

---

## Task 6: Update Component Handlers to Pass Arrays

**Files:**
- Modify: `src/pages/Index.tsx` (where ItemDetailModal is used)
- Modify: `src/components/ClothingGrid.tsx` (if it uses LinkToItemModal)

**Interfaces:**
- Consumes: ItemDetailModal onCreatePairing prop
- Produces: Handlers that call createOutfitWithPairing with arrays

**Details:**

Find where ItemDetailModal's onCreatePairing is called and update handlers.

- [ ] **Step 1: Find ItemDetailModal usage in Index.tsx**

Run: `grep -n "onCreatePairing" /Users/sai/Documents/GitHub/outfit-canvas/src/pages/Index.tsx`

This will show where the handler is defined.

- [ ] **Step 2: Update the onCreatePairing handler**

The handler should look like (update as needed based on current implementation):

```typescript
const handleCreatePairing = (accessoryId: string, mainItemIds: string[]) => {
  createOutfitWithPairing(accessoryId, mainItemIds);
};
```

And pass it to ItemDetailModal:

```typescript
<ItemDetailModal
  // ... other props ...
  onCreatePairing={handleCreatePairing}
/>
```

- [ ] **Step 3: Check ClothingGrid.tsx for similar changes**

Run: `grep -n "LinkToItemModal\|onCreatePairing" /Users/sai/Documents/GitHub/outfit-canvas/src/components/ClothingGrid.tsx`

Update any handlers there as well to pass arrays.

- [ ] **Step 4: Verify the handler signature matches**

The callback signature should be:
- Old: `(accessoryId: string, mainItemId: string) => void`
- New: `(accessoryId: string, mainItemIds: string[]) => void`

- [ ] **Step 5: Commit**

```bash
git add src/pages/Index.tsx src/components/ClothingGrid.tsx
git commit -m "feat: update component handlers to pass array of IDs to createOutfitWithPairing"
```

---

## Task 7: Test Multi-Select Pairing End-to-End

**Files:**
- Test: Manual testing in app
- Reference: `src/lib/__tests__/pairing-helpers.test.ts` for unit tests

**Interfaces:**
- Consumes: All modified components and hooks
- Produces: Verified user flows

**Details:**

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

Expected: App opens on http://localhost:8080

- [ ] **Step 2: Navigate to the app and upload a test accessory (necklace)**

- Create/ensure you have an item in the "Jewelry" category with an image

- [ ] **Step 3: Open ItemDetailModal for the accessory**

- Click the item to open its detail modal
- Verify the "Link to Items" button shows (not "Link to Item")

- [ ] **Step 4: Click "Link to Items" button**

- Modal opens with a list of main items (tops, bottoms, etc.)
- Verify items show checkboxes (unchecked state)
- Search filters work correctly

- [ ] **Step 5: Select multiple items**

- Click 2-3 items to select them
- Verify checkboxes show checked state
- Verify count shows "Selected: 2" (or 3)
- Verify "Link to N Items" button updates

- [ ] **Step 6: Click "Link to 2 Items" button**

- Modal closes
- Toast shows "Linked [accessory] to [item1 name] and [item2 name]"
- ItemDetailModal "Linked Accessories" section shows all newly linked items

- [ ] **Step 7: Go to OutfitCanvas and add the accessory**

- Select the accessory from closet
- Click the Link icon on the accessory
- Verify the pairing modal shows all items on canvas
- Select multiple items
- Verify they all get paired

- [ ] **Step 8: Save the outfit and reload**

- Name the outfit and save it
- Close and reopen the app (or do a hard refresh)
- Open the saved outfit
- Verify all pairings are preserved

- [ ] **Step 9: Run unit tests**

Run: `npm run test -- pairing-helpers`

Expected: All tests pass (both old single-ID and new multi-ID formats)

- [ ] **Step 10: Run type check**

Run: `npm run lint`

Expected: No TypeScript errors

- [ ] **Step 11: Build for production**

Run: `npm run build`

Expected: Build succeeds with no errors

- [ ] **Step 12: Commit final changes**

```bash
git add .
git commit -m "feat: complete multi-select pairing implementation with full end-to-end testing"
```

---

## Verification Checklist

After all tasks complete, verify:

- [ ] LinkToItemModal shows checkboxes for all items
- [ ] Item count displays as "Selected: N"
- [ ] Button text changes to "Link to N Items"
- [ ] Already-linked items show a checkmark but are disabled
- [ ] OutfitCanvas pairing modal has multi-select
- [ ] ItemDetailModal "Link to Items" button shows count of linked items
- [ ] Toast messages correctly pluralize when linking multiple items
- [ ] Saved outfits preserve all pairings
- [ ] Both old (single ID) and new (array) pairing formats work
- [ ] All tests pass
- [ ] TypeScript strict mode passes
- [ ] Production build succeeds

---

## Spec Coverage Summary

✓ Task 1-2: LinkToItemModal multi-select with checkboxes and count display
✓ Task 4: OutfitCanvas pairing modal multi-select
✓ Task 5: useCloset.ts createOutfitWithPairing handles array of IDs
✓ Task 3: ItemDetailModal shows paired count in button
✓ Task 6: All handlers updated to pass arrays
✓ Task 1: pairing-helpers.ts updated for array-based format with backward compatibility
✓ Task 7: Full end-to-end testing and verification
