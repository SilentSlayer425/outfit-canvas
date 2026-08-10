/**
 * Outfit Canvas
 * 
 * Drag-and-drop canvas for building outfits.
 * Items follow the mouse exactly (no snapping) and can't leave the canvas.
 * Arrow keys move the selected item. Items are placed at smart positions
 * based on their clothing category.
 * 
 * Layering: Use the up/down arrows on the selected item to bring forward
 * or send backward. Items always stay above the mannequin silhouette.
 * 
 * Customization:
 *  - Canvas height: change CANVAS_MIN_HEIGHT in src/config.ts
 *  - Arrow key speed: change ARROW_KEY_STEP in src/config.ts
 *  - Item size: change ITEM_BASE_SIZE in src/config.ts
 *  - Zoom range: change ITEM_MIN_SCALE / ITEM_MAX_SCALE in src/config.ts
 *  - Smart placement positions: change CATEGORY_Y_DEFAULTS in src/config.ts
 *  - Canvas background color: change bg-card below
 *  - Canvas corner roundness: change rounded-2xl below
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2, Plus, ZoomIn, ZoomOut, ArrowUp, ArrowDown, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  CANVAS_MIN_HEIGHT,
  ARROW_KEY_STEP,
  ITEM_MIN_SCALE,
  ITEM_MAX_SCALE,
  SCALE_STEP,
  ITEM_BASE_SIZE,
} from '@/config';
import type { ClothingItem, OutfitItem } from '@/types/closet';

/** Minimum zIndex for outfit items — keeps them above the mannequin */
const MIN_Z = 1;

interface OutfitCanvasProps {
  outfitItems: OutfitItem[];
  getItemById: (id: string) => ClothingItem | undefined;
  onUpdateItem: (index: number, updates: Partial<OutfitItem>) => void;
  onRemoveItem: (index: number) => void;
  onSave: (name: string) => void;
}

export function OutfitCanvas({ outfitItems, getItemById, onUpdateItem, onRemoveItem, onSave }: OutfitCanvasProps) {
  const { toast } = useToast();
  const [outfitName, setOutfitName] = useState('');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [dragging, setDragging] = useState<{ idx: number; startX: number; startY: number; itemX: number; itemY: number } | null>(null);
  const [pairingModalOpen, setPairingModalOpen] = useState(false);
  const [pairingSelectedIdx, setPairingSelectedIdx] = useState<number | null>(null);
  const [selectedPairingItems, setSelectedPairingItems] = useState<Set<number>>(new Set());
  const canvasRef = useRef<HTMLDivElement>(null);

  // Filter for front items only
  const frontItems = outfitItems.filter((oi) => !oi.side || oi.side === 'front');
  const frontItemIndices = outfitItems
    .map((_, i) => i)
    .filter((i) => !outfitItems[i].side || outfitItems[i].side === 'front');

  // ── Mouse / touch drag (no snapping, stays under cursor) ──
  const handlePointerDown = useCallback((e: React.PointerEvent, frontIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIdx(frontIdx);
    const actualIdx = frontItemIndices[frontIdx];
    setDragging({
      idx: actualIdx,
      startX: e.clientX,
      startY: e.clientY,
      itemX: outfitItems[actualIdx].x,
      itemY: outfitItems[actualIdx].y,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [outfitItems, frontItemIndices]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !canvasRef.current) return;
    const canvas = canvasRef.current.getBoundingClientRect();
    const item = outfitItems[dragging.idx];
    const halfW = (ITEM_BASE_SIZE * item.scale) / 2;
    const halfH = (ITEM_BASE_SIZE * item.scale) / 2;

    let newX = dragging.itemX + (e.clientX - dragging.startX);
    let newY = dragging.itemY + (e.clientY - dragging.startY);

    const maxX = canvas.width / 2 - halfW;
    const maxY = canvas.height / 2 - halfH;
    newX = Math.max(-maxX, Math.min(maxX, newX));
    newY = Math.max(-maxY, Math.min(maxY, newY));

    onUpdateItem(dragging.idx, { x: newX, y: newY });
  }, [dragging, outfitItems, onUpdateItem]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  // ── Arrow key movement ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null || !canvasRef.current) return;
      const actualIdx = frontItemIndices[selectedIdx];
      const item = outfitItems[actualIdx];
      if (!item) return;

      let dx = 0, dy = 0;
      if (e.key === 'ArrowLeft') dx = -ARROW_KEY_STEP;
      else if (e.key === 'ArrowRight') dx = ARROW_KEY_STEP;
      else if (e.key === 'ArrowUp') dy = -ARROW_KEY_STEP;
      else if (e.key === 'ArrowDown') dy = ARROW_KEY_STEP;
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        onRemoveItem(actualIdx);
        setSelectedIdx(null);
        return;
      }
      else return;

      e.preventDefault();
      const canvas = canvasRef.current.getBoundingClientRect();
      const halfW = (ITEM_BASE_SIZE * item.scale) / 2;
      const halfH = (ITEM_BASE_SIZE * item.scale) / 2;
      const maxX = canvas.width / 2 - halfW;
      const maxY = canvas.height / 2 - halfH;
      const newX = Math.max(-maxX, Math.min(maxX, item.x + dx));
      const newY = Math.max(-maxY, Math.min(maxY, item.y + dy));
      onUpdateItem(actualIdx, { x: newX, y: newY });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, outfitItems, onUpdateItem, onRemoveItem, frontItemIndices]);

  const handleScale = (frontIdx: number, delta: number) => {
    const actualIdx = frontItemIndices[frontIdx];
    const current = outfitItems[actualIdx].scale;
    onUpdateItem(actualIdx, { scale: Math.max(ITEM_MIN_SCALE, Math.min(ITEM_MAX_SCALE, current + delta)) });
  };

  // ── Layering: bring forward / send backward ──
  // Items always stay >= MIN_Z so they remain above the mannequin silhouette
  const bringForward = (frontIdx: number) => {
    const maxZ = Math.max(...frontItems.map((oi) => oi.zIndex), MIN_Z);
    const actualIdx = frontItemIndices[frontIdx];
    onUpdateItem(actualIdx, { zIndex: maxZ + 1 });
  };

  const sendBackward = (frontIdx: number) => {
    const actualIdx = frontItemIndices[frontIdx];
    const current = outfitItems[actualIdx].zIndex;
    const minZ = Math.min(...frontItems.map((oi) => oi.zIndex), MIN_Z + 1);
    const newZ = minZ - 1;
    onUpdateItem(actualIdx, { zIndex: Math.max(MIN_Z, newZ) });
  };

  // Check if an item can be paired (is an accessory, jewelry, or bag)
  const isPairableCategory = (category: string): boolean => {
    return ['accessories', 'jewelry', 'bags'].includes(category);
  };

  // Handle pairing: link the selected accessory to multiple items
  const handlePairingConfirm = () => {
    if (pairingSelectedIdx === null) return;
    const actualIdx = frontItemIndices[pairingSelectedIdx];
    const selectedIds = Array.from(selectedPairingItems)
      .map(frontIdx => outfitItems[frontItemIndices[frontIdx]].clothingId)
      .filter(Boolean);

    onUpdateItem(actualIdx, { pairedToClothingIds: selectedIds });
    toast({
      title: 'Linked successfully',
      description: `Linked to ${selectedIds.length} item${selectedIds.length === 1 ? '' : 's'}`,
    });
    setPairingModalOpen(false);
    setPairingSelectedIdx(null);
    setSelectedPairingItems(new Set());
  };

  // Toggle selection of an item in the pairing modal
  const togglePairingSelection = (frontIdx: number) => {
    const newSelected = new Set(selectedPairingItems);
    if (newSelected.has(frontIdx)) {
      newSelected.delete(frontIdx);
    } else {
      newSelected.add(frontIdx);
    }
    setSelectedPairingItems(newSelected);
  };

  // Open pairing modal for the selected item
  const openPairingModal = (frontIndex: number) => {
    setPairingSelectedIdx(frontIndex);
    // Initialize with already paired items if any
    const actualIdx = frontItemIndices[frontIndex];
    const currentItem = outfitItems[actualIdx];
    if (currentItem?.pairedToClothingIds && currentItem.pairedToClothingIds.length > 0) {
      const alreadyPaired = new Set<number>();
      frontItems.forEach((oi, frontIdx) => {
        if (frontIdx !== frontIndex && currentItem.pairedToClothingIds?.includes(oi.clothingId)) {
          alreadyPaired.add(frontIdx);
        }
      });
      setSelectedPairingItems(alreadyPaired);
    } else {
      setSelectedPairingItems(new Set());
    }
    setPairingModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Canvas area — change bg-card for background, rounded-2xl for corners */}
      <div
        ref={canvasRef}
        className="relative flex-1 rounded-2xl bg-card shadow-soft overflow-hidden"
        style={{ minHeight: `${CANVAS_MIN_HEIGHT}px` }}
        onClick={() => setSelectedIdx(null)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Mannequin silhouette — z-index 0, items always above */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]" style={{ zIndex: 0 }}>
          <svg viewBox="0 0 200 500" className="h-[80%]">
            <ellipse cx="100" cy="50" rx="30" ry="40" fill="currentColor" />
            <rect x="70" y="90" width="60" height="120" rx="10" fill="currentColor" />
            <rect x="50" y="210" width="40" height="140" rx="8" fill="currentColor" />
            <rect x="110" y="210" width="40" height="140" rx="8" fill="currentColor" />
            <rect x="55" y="350" width="35" height="30" rx="6" fill="currentColor" />
            <rect x="110" y="350" width="35" height="30" rx="6" fill="currentColor" />
          </svg>
        </div>

        {frontItems.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground" style={{ zIndex: 1 }}>
            <Plus className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm font-medium">Select items from your closet</p>
            <p className="text-xs mt-1">Drag to position · Arrow keys to nudge · Delete to remove</p>
          </div>
        )}

        {frontItems.map((oi, frontIdx) => {
          const item = getItemById(oi.clothingId);
          if (!item) return null;
          const isSelected = selectedIdx === frontIdx;
          const size = ITEM_BASE_SIZE * oi.scale;
          const actualIdx = frontItemIndices[frontIdx];
          // Ensure zIndex is always at least MIN_Z
          const effectiveZ = Math.max(MIN_Z, oi.zIndex);

          return (
            <div
              key={`${oi.clothingId}-front-${frontIdx}`}
              className={`absolute cursor-grab active:cursor-grabbing select-none ${
                isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
              }`}
              style={{
                left: `calc(50% + ${oi.x}px - ${size / 2}px)`,
                top: `calc(50% + ${oi.y}px - ${size / 2}px)`,
                width: `${size}px`,
                zIndex: effectiveZ + (dragging?.idx === actualIdx ? 1000 : 0),
                touchAction: 'none',
              }}
              onPointerDown={(e) => handlePointerDown(e, frontIdx)}
              onClick={(e) => { e.stopPropagation(); setSelectedIdx(frontIdx); }}
            >
              <img
                src={item.imageData}
                alt={item.name}
                className="w-full h-auto object-contain pointer-events-none"
                draggable={false}
              />
              {/* Item controls — appear when selected */}
              {isSelected && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-1 bg-card rounded-full shadow-float p-1" style={{ zIndex: 9999 }}>
                  {/* Send backward — moves item behind others */}
                  <button onClick={(e) => { e.stopPropagation(); sendBackward(frontIdx); }}
                    className="p-1 rounded-full hover:bg-muted" title="Send backward">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  {/* Bring forward — moves item in front of others */}
                  <button onClick={(e) => { e.stopPropagation(); bringForward(frontIdx); }}
                    className="p-1 rounded-full hover:bg-muted" title="Bring forward">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  {/* Zoom out button */}
                  <button onClick={(e) => { e.stopPropagation(); handleScale(frontIdx, -SCALE_STEP); }}
                    className="p-1 rounded-full hover:bg-muted" title="Zoom out">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  {/* Zoom in button */}
                  <button onClick={(e) => { e.stopPropagation(); handleScale(frontIdx, SCALE_STEP); }}
                    className="p-1 rounded-full hover:bg-muted" title="Zoom in">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  {/* Pairing button — only for accessories, jewelry, and bags */}
                  {isPairableCategory(oi.category) && (
                    <button onClick={(e) => { e.stopPropagation(); openPairingModal(frontIdx); }}
                      className="p-1 rounded-full hover:bg-muted" title="Link to item">
                      <Link2 className="w-4 h-4" />
                    </button>
                  )}
                  {/* Delete button — change hover:bg-destructive for different delete color */}
                  <button onClick={(e) => { e.stopPropagation(); onRemoveItem(actualIdx); setSelectedIdx(null); }}
                    className="p-1 rounded-full hover:bg-destructive hover:text-destructive-foreground" title="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save bar — appears when items are on canvas */}
      {outfitItems.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex gap-2 mt-4"
        >
          <Input
            placeholder="Name this outfit..."
            value={outfitName}
            onChange={(e) => setOutfitName(e.target.value)}
            className="rounded-xl bg-card flex-1"
          />
          <Button
            onClick={() => { if (outfitName.trim()) { onSave(outfitName.trim()); setOutfitName(''); } }}
            disabled={!outfitName.trim()}
            className="rounded-xl px-6"
          >
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
        </motion.div>
      )}

      {/* Pairing selection modal */}
      <Dialog open={pairingModalOpen} onOpenChange={setPairingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link to Items</DialogTitle>
            <DialogDescription>
              Select items to pair this accessory with
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {/* Selection count */}
            {selectedPairingItems.size > 0 && (
              <div className="text-sm font-medium text-primary">
                Selected: {selectedPairingItems.size} item{selectedPairingItems.size === 1 ? '' : 's'}
              </div>
            )}

            {/* Items list */}
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {frontItems.map((oi, frontIdx) => {
                // Skip the item being paired and other pairable items
                if (frontIdx === pairingSelectedIdx || isPairableCategory(oi.category)) {
                  return null;
                }
                const item = getItemById(oi.clothingId);
                if (!item) return null;
                const isSelected = selectedPairingItems.has(frontIdx);

                return (
                  <button
                    key={frontIdx}
                    onClick={() => togglePairingSelection(frontIdx)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      isSelected
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-accent border border-transparent'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => togglePairingSelection(frontIdx)}
                      className="mt-0"
                    />
                    <img
                      src={item.imageData}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-primary flex-shrink-0" />}
                  </button>
                );
              })}
              {frontItems.filter((_, frontIdx) => frontIdx !== pairingSelectedIdx && !isPairableCategory(frontItems[frontIdx].category)).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No items available to pair with
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setPairingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePairingConfirm}
                disabled={selectedPairingItems.size === 0}
              >
                Link to {selectedPairingItems.size > 0 ? selectedPairingItems.size : 0} item{selectedPairingItems.size === 1 ? '' : 's'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
