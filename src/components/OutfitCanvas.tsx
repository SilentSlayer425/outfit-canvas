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
import { Save, Trash2, Plus, ZoomIn, ZoomOut, ArrowUp, ArrowDown, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  const [outfitName, setOutfitName] = useState('');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [dragging, setDragging] = useState<{ idx: number; startX: number; startY: number; itemX: number; itemY: number } | null>(null);
  const [pairingModalOpen, setPairingModalOpen] = useState(false);
  const [pairingSelectedIdx, setPairingSelectedIdx] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Mouse / touch drag (no snapping, stays under cursor) ──
  const handlePointerDown = useCallback((e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIdx(idx);
    setDragging({
      idx,
      startX: e.clientX,
      startY: e.clientY,
      itemX: outfitItems[idx].x,
      itemY: outfitItems[idx].y,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [outfitItems]);

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
      const item = outfitItems[selectedIdx];
      if (!item) return;

      let dx = 0, dy = 0;
      if (e.key === 'ArrowLeft') dx = -ARROW_KEY_STEP;
      else if (e.key === 'ArrowRight') dx = ARROW_KEY_STEP;
      else if (e.key === 'ArrowUp') dy = -ARROW_KEY_STEP;
      else if (e.key === 'ArrowDown') dy = ARROW_KEY_STEP;
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        onRemoveItem(selectedIdx);
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
      onUpdateItem(selectedIdx, { x: newX, y: newY });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, outfitItems, onUpdateItem, onRemoveItem]);

  const handleScale = (index: number, delta: number) => {
    const current = outfitItems[index].scale;
    onUpdateItem(index, { scale: Math.max(ITEM_MIN_SCALE, Math.min(ITEM_MAX_SCALE, current + delta)) });
  };

  // ── Layering: bring forward / send backward ──
  // Items always stay >= MIN_Z so they remain above the mannequin silhouette
  const bringForward = (index: number) => {
    const maxZ = Math.max(...outfitItems.map((oi) => oi.zIndex));
    onUpdateItem(index, { zIndex: maxZ + 1 });
  };

  const sendBackward = (index: number) => {
    const current = outfitItems[index].zIndex;
    const minZ = Math.min(...outfitItems.map((oi) => oi.zIndex));
    const newZ = minZ - 1;
    onUpdateItem(index, { zIndex: Math.max(MIN_Z, newZ) });
  };

  // Check if an item can be paired (is an accessory, jewelry, or bag)
  const isPairableCategory = (category: string): boolean => {
    return ['accessories', 'jewelry', 'bags'].includes(category);
  };

  // Handle pairing: link the selected accessory to another item
  const handlePairing = (itemToPairWithIdx: number) => {
    if (pairingSelectedIdx === null) return;
    const itemToPairWith = outfitItems[itemToPairWithIdx];
    if (itemToPairWith) {
      onUpdateItem(pairingSelectedIdx, { pairedToClothingIds: [itemToPairWith.clothingId] });
    }
    setPairingModalOpen(false);
    setPairingSelectedIdx(null);
  };

  // Open pairing modal for the selected item
  const openPairingModal = (index: number) => {
    setPairingSelectedIdx(index);
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

        {outfitItems.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground" style={{ zIndex: 1 }}>
            <Plus className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm font-medium">Select items from your closet</p>
            <p className="text-xs mt-1">Drag to position · Arrow keys to nudge · Delete to remove</p>
          </div>
        )}

        {outfitItems.map((oi, idx) => {
          const item = getItemById(oi.clothingId);
          if (!item) return null;
          const isSelected = selectedIdx === idx;
          const size = ITEM_BASE_SIZE * oi.scale;
          // Ensure zIndex is always at least MIN_Z
          const effectiveZ = Math.max(MIN_Z, oi.zIndex);

          return (
            <div
              key={`${oi.clothingId}-${idx}`}
              className={`absolute cursor-grab active:cursor-grabbing select-none ${
                isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
              }`}
              style={{
                left: `calc(50% + ${oi.x}px - ${size / 2}px)`,
                top: `calc(50% + ${oi.y}px - ${size / 2}px)`,
                width: `${size}px`,
                zIndex: effectiveZ + (dragging?.idx === idx ? 1000 : 0),
                touchAction: 'none',
              }}
              onPointerDown={(e) => handlePointerDown(e, idx)}
              onClick={(e) => { e.stopPropagation(); setSelectedIdx(idx); }}
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
                  <button onClick={(e) => { e.stopPropagation(); sendBackward(idx); }}
                    className="p-1 rounded-full hover:bg-muted" title="Send backward">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  {/* Bring forward — moves item in front of others */}
                  <button onClick={(e) => { e.stopPropagation(); bringForward(idx); }}
                    className="p-1 rounded-full hover:bg-muted" title="Bring forward">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  {/* Zoom out button */}
                  <button onClick={(e) => { e.stopPropagation(); handleScale(idx, -SCALE_STEP); }}
                    className="p-1 rounded-full hover:bg-muted" title="Zoom out">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  {/* Zoom in button */}
                  <button onClick={(e) => { e.stopPropagation(); handleScale(idx, SCALE_STEP); }}
                    className="p-1 rounded-full hover:bg-muted" title="Zoom in">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  {/* Pairing button — only for accessories, jewelry, and bags */}
                  {isPairableCategory(oi.category) && (
                    <button onClick={(e) => { e.stopPropagation(); openPairingModal(idx); }}
                      className="p-1 rounded-full hover:bg-muted" title="Link to item">
                      <Link2 className="w-4 h-4" />
                    </button>
                  )}
                  {/* Delete button — change hover:bg-destructive for different delete color */}
                  <button onClick={(e) => { e.stopPropagation(); onRemoveItem(idx); setSelectedIdx(null); }}
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
            <DialogTitle>Link to Item</DialogTitle>
            <DialogDescription>
              Select an item to pair this accessory with
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
              return (
                <button
                  key={idx}
                  onClick={() => handlePairing(idx)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <img
                    src={item.imageData}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
