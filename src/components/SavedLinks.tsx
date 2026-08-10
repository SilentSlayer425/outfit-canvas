/**
 * Saved Links / Pairings
 *
 * Shows all accessory pairings (linked items) in one place.
 * Users can create, view, and delete pairings.
 *
 * Customization:
 *  - Card columns: change sm:grid-cols-2
 *  - Item thumbnail size: change h-12 w-12
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Link, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ItemDetailModal } from '@/components/ItemDetailModal';
import { LinkToItemModal } from '@/components/LinkToItemModal';
import type { ClothingItem, Pairing } from '@/types/closet';

interface SavedLinksProps {
  pairings: Pairing[];
  items: ClothingItem[];
  getItemById: (id: string) => ClothingItem | undefined;
  onCreatePairing: (accessoryId: string, linkedItemIds: string[]) => void;
  onUpdatePairing: (id: string, updates: { linkedItemIds?: string[] }) => void;
  onRemovePairing: (id: string) => void;
  onEditItem?: (item: ClothingItem) => void;
  onDeleteItem?: (id: string) => void;
}

export function SavedLinks({
  pairings,
  items,
  getItemById,
  onCreatePairing,
  onUpdatePairing,
  onRemovePairing,
  onEditItem,
  onDeleteItem,
}: SavedLinksProps) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<ClothingItem | null>(null);

  const confirmDelete = () => {
    if (deleteTarget) {
      onRemovePairing(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const pairingsWithItems = pairings.map((pairing) => {
    const accessoryItem = getItemById(pairing.accessoryId);
    const linkedItems = pairing.linkedItemIds
      .map((id) => getItemById(id))
      .filter((item): item is ClothingItem => item !== undefined);

    return {
      pairing,
      accessoryItem,
      linkedItems,
    };
  });

  const validPairings = pairingsWithItems.filter((p) => p.accessoryItem !== undefined);

  if (validPairings.length === 0) {
    return (
      <>
        <div className="text-center py-20 text-muted-foreground">
          <Link className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No item pairings yet</p>
          <p className="text-sm mt-1 mb-6">Create a pairing to link accessories with your favorite items</p>
          <Button onClick={() => setLinkModalOpen(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Create First Pairing
          </Button>
        </div>

        <LinkToItemModal
          open={linkModalOpen}
          onClose={() => setLinkModalOpen(false)}
          onConfirm={onCreatePairing}
          items={items}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header with create button */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Pairings</h2>
          <Button onClick={() => setLinkModalOpen(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Pairing
          </Button>
        </div>

        {/* Pairings count badge */}
        <div className="text-sm text-muted-foreground">
          {validPairings.length} pairing{validPairings.length !== 1 ? 's' : ''}
          {' • '}
          {validPairings.reduce((sum, p) => sum + p.linkedItems.length, 0)} total links
        </div>

        {/* Pairings grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {validPairings.map((pairingData, idx) => (
              <motion.div
                key={pairingData.pairing.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.03 }}
                className="group relative rounded-2xl bg-card shadow-soft overflow-hidden border border-border/50"
              >
                {/* Main pairing card */}
                <div className="p-4 space-y-3">
                  {/* Accessory */}
                  <div className="flex items-center gap-3 pb-3 border-b border-border/30">
                    <img
                      src={pairingData.accessoryItem!.imageData}
                      alt={pairingData.accessoryItem!.name}
                      className="w-12 h-12 object-contain rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {pairingData.accessoryItem!.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pairingData.accessoryItem!.category}
                      </p>
                    </div>
                  </div>

                  {/* Linked items */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Linked to ({pairingData.linkedItems.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pairingData.linkedItems.map((item) => (
                        <Tooltip key={item.id}>
                          <TooltipTrigger asChild>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => setViewItem(item)}
                              className="relative group/thumb"
                            >
                              <img
                                src={item.imageData}
                                alt={item.name}
                                className="h-12 w-12 object-contain rounded border border-border/50 hover:border-primary transition-colors cursor-pointer"
                              />
                            </motion.button>
                          </TooltipTrigger>
                          <TooltipContent side="top">{item.name}</TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2 border-t border-border/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => setViewItem(pairingData.accessoryItem!)}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(pairingData.pairing.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Item detail modal */}
      <ItemDetailModal
        open={!!viewItem}
        item={viewItem}
        onClose={() => setViewItem(null)}
        onEdit={onEditItem ? (item) => onEditItem(item) : undefined}
        onDelete={onDeleteItem ? (item) => onDeleteItem(item.id) : undefined}
      />

      {/* Link to item modal */}
      <LinkToItemModal
        open={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onConfirm={onCreatePairing}
        items={items}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Pairing"
        description="Are you sure you want to delete this pairing? This won't delete the items themselves."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isDangerous
      />
    </>
  );
}
