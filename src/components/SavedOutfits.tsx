/**
 * Saved Outfits
 *
 * Shows saved outfits as cards with items wrapping into rows.
 * Hovering items shows their name. Tap on mobile opens detail.
 * "Load" button reloads the outfit into the builder.
 * Delete has confirm dialog.
 *
 * Customization:
 *  - Card columns: change sm:grid-cols-2
 *  - Preview min height: change min-h-[120px]
 *  - Card corners: change rounded-2xl
 *  - Item thumbnail size: change h-16 w-16
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Calendar, Heart, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ItemDetailModal } from '@/components/ItemDetailModal';
import type { Outfit, ClothingItem } from '@/types/closet';
import { getItemPrimaryImageData } from '@/types/closet';

interface SavedOutfitsProps {
  outfits: Outfit[];
  getItemById: (id: string) => ClothingItem | undefined;
  onRemove: (id: string) => void;
  onLoad?: (outfit: Outfit) => void;
  onEditItem?: (item: ClothingItem) => void;
  onDeleteItem?: (id: string) => void;
}

export function SavedOutfits({ outfits, getItemById, onRemove, onLoad, onEditItem, onDeleteItem }: SavedOutfitsProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<ClothingItem | null>(null);

  if (outfits.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium">No saved outfits yet</p>
        <p className="text-sm mt-1">Build and save outfits in the builder!</p>
      </div>
    );
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      onRemove(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {outfits.map((outfit, i) => (
          <motion.div
            key={outfit.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative rounded-2xl bg-card shadow-soft overflow-hidden"
          >
            {/* Outfit preview — items wrap into multiple rows, change h-16 w-16 for thumb size */}
            <div className="relative min-h-[120px] bg-muted/30 flex flex-wrap items-center justify-center gap-2 p-4">
              {outfit.items.map((oi, idx) => {
                const item = getItemById(oi.clothingId);
                if (!item) return null;
                const imageSrc = getItemPrimaryImageData(item);
                return (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <img
                        src={imageSrc ?? ''}
                        alt={item.name}
                        className="h-16 w-16 object-contain cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => setViewItem(item)}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs font-medium">{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              {outfit.items.length === 0 && <p className="text-xs text-muted-foreground">Empty outfit</p>}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-semibold text-foreground">{outfit.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(outfit.createdAt).toLocaleDateString()}
                  <span className="mx-1">·</span>
                  {outfit.items.length} items
                </p>
              </div>
              <div className="flex gap-1">
                {/* Load into builder button */}
                {onLoad && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLoad(outfit)}
                    className="rounded-full px-3"
                    title="Load into builder"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" /> Load
                  </Button>
                )}
                {/* Delete button — always visible (no hover-only on mobile) */}
                <button
                  onClick={() => setDeleteTarget(outfit.id)}
                  className="p-2 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Outfit"
        message="Are you sure you want to delete this saved outfit? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ItemDetailModal
        open={!!viewItem}
        item={viewItem}
        onClose={() => setViewItem(null)}
        onEdit={onEditItem ? (item) => { setViewItem(null); onEditItem(item); } : undefined}
        onDelete={onDeleteItem ? (item) => { setViewItem(null); onDeleteItem(item.id); } : undefined}
      />
    </>
  );
}
