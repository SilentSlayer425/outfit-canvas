/**
 * Item Detail Modal
 *
 * View modal for clothing items. Shows full image, name, category, subcategory, brand, description, tags.
 * Optionally shows Edit and Delete buttons when callbacks are provided.
 *
 * Customization:
 *  - Modal width: change max-w-sm
 *  - Image height: change h-64
 *  - Tag pill colors: change bg-primary/10 text-primary
 *  - Delete button color: change bg-destructive
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil, Trash2, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LinkToItemModal } from '@/components/LinkToItemModal';
import type { ClothingItem, Outfit } from '@/types/closet';
import { CATEGORY_LABELS } from '@/types/closet';
import { getPairingInfo, isItemLinkable } from '@/lib/pairing-helpers';
import type { Pairing } from '@/types/closet';

interface ItemDetailModalProps {
  open: boolean;
  item: ClothingItem | null;
  onClose: () => void;
  onEdit?: (item: ClothingItem) => void;
  onDelete?: (item: ClothingItem) => void;
  outfits?: Outfit[];
  allItems?: ClothingItem[];
  pairings?: Pairing[];
  onViewPairedItem?: (item: ClothingItem) => void;
  onCreatePairing?: (accessoryId: string, mainItemIds: string[]) => void;
  onUnlink?: (itemId: string, pairedItemId: string) => void;
}

export function ItemDetailModal({
  open,
  item,
  onClose,
  onEdit,
  onDelete,
  outfits,
  allItems,
  pairings,
  onViewPairedItem,
  onCreatePairing,
  onUnlink,
}: ItemDetailModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [unlinkConfirm, setUnlinkConfirm] = useState<{ itemId: string; pairedItemId: string } | null>(null);

  if (!item) return null;

  // Defensive: ensure outfits, allItems, and pairings are always arrays (handles undefined from parent)
  const safeOutfits = outfits ?? [];
  const safeAllItems = allItems ?? [];
  const safePairings = pairings ?? [];

  const pairingInfo = getPairingInfo(item.id, safeOutfits, safeAllItems, safePairings);

  // Get main items (non-accessory items) for pairing
  const mainItems = safeAllItems.filter((i) => !['accessories', 'jewelry', 'bags'].includes(i.category));

  const handlePairItems = (accessoryId: string, selectedIds: string[]) => {
    if (selectedIds.length === 0) return;

    // Create outfit with pairings for all selected items at once
    onCreatePairing?.(accessoryId, selectedIds);

    const count = selectedIds.length;
    toast.success(
      `Linked ${item.name} to ${count} item${count !== 1 ? 's' : ''}`
    );
    setLinkModalOpen(false);
  };

  const handleConfirmUnlink = () => {
    if (!unlinkConfirm) return;

    const pairedItem = safeAllItems.find((i) => i.id === unlinkConfirm.pairedItemId);
    onUnlink?.(unlinkConfirm.itemId, unlinkConfirm.pairedItemId);

    if (pairedItem) {
      toast.success(`Unlinked ${item?.name || 'item'} from ${pairedItem.name}`);
    }

    setUnlinkConfirm(null);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
            <motion.div
              className="relative z-10 w-full max-w-sm rounded-2xl bg-card p-5 shadow-float max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-heading font-semibold text-foreground truncate pr-4">{item.name}</h2>
                <button onClick={onClose} className="shrink-0 rounded-full p-1 transition-colors hover:bg-muted">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Full image preview — change h-64 for taller/shorter */}
              <div className="mb-4 flex justify-center rounded-xl bg-muted/30 p-4 h-64">
                <img src={item.imageData} alt={item.name} className="h-full w-auto object-contain" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {CATEGORY_LABELS[item.category]}
                  {item.subcategory && <span className="text-muted-foreground ml-1">· {item.subcategory}</span>}
                </p>

                {/* Brand */}
                {item.brand && (
                  <p className="text-sm text-muted-foreground"><span className="font-medium">Brand:</span> {item.brand}</p>
                )}

                {/* Description */}
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}

                {item.customTags && item.customTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.customTags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Pairing information — show for ALL items that have pairings */}
                {(pairingInfo.pairedToItems.length > 0 || pairingInfo.pairedItems.length > 0) && (safeOutfits.length > 0) && (
                  <div className="space-y-3 pt-3 border-t border-border">
                    {/* PAIRED WITH section — for items paired to something else */}
                    {pairingInfo.pairedToItems.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Paired With ({pairingInfo.pairedToItems.length})</p>
                        <div className="space-y-1">
                          {pairingInfo.pairedToItems.map((pairedToItem) => (
                            <div key={pairedToItem.id} className="group flex items-start gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                              <button
                                onClick={() => onViewPairedItem?.(pairedToItem)}
                                className="w-full flex items-start gap-2 text-left"
                              >
                                <div className="h-12 w-12 rounded bg-muted/50 flex-shrink-0">
                                  <img src={pairedToItem.imageData} alt={pairedToItem.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{pairedToItem.name}</p>
                                  <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[pairedToItem.category]}</p>
                                </div>
                                <Link2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              </button>
                              <button
                                onClick={() => setUnlinkConfirm({ itemId: item.id, pairedItemId: pairedToItem.id })}
                                className="ml-auto flex-shrink-0 p-1 rounded-md hover:bg-destructive/20 transition-colors opacity-0 group-hover:opacity-100"
                                title="Unlink from this item"
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* LINKED ITEMS section — for items that have things paired to them */}
                    {pairingInfo.pairedItems.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Linked Items ({pairingInfo.pairedItems.length})</p>
                        <div className="space-y-1">
                          {pairingInfo.pairedItems.map((pairedItem) => (
                            <div
                              key={pairedItem.id}
                              className="group flex items-start gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                              <button
                                onClick={() => onViewPairedItem?.(pairedItem)}
                                className="w-full flex items-start gap-2 text-left"
                              >
                                <div className="h-10 w-10 rounded bg-muted/50 flex-shrink-0">
                                  <img src={pairedItem.imageData} alt={pairedItem.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">{pairedItem.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[pairedItem.category]}</p>
                                </div>
                                <Link2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                              </button>
                              <button
                                onClick={() => setUnlinkConfirm({ itemId: pairedItem.id, pairedItemId: item.id })}
                                className="ml-auto flex-shrink-0 p-1 rounded-md hover:bg-destructive/20 transition-colors opacity-0 group-hover:opacity-100"
                                title="Unlink from this item"
                              >
                                <X className="h-3.5 w-3.5 text-destructive" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons — only shown when callbacks provided */}
              {(onEdit || onDelete || (isItemLinkable(item.category) && mainItems.length > 0)) && (
                <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-border">
                  {isItemLinkable(item.category) && mainItems.length > 0 && onCreatePairing && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl"
                      onClick={() => setLinkModalOpen(true)}
                    >
                      <Link2 className="w-3.5 h-3.5 mr-1.5" /> Link to Item
                    </Button>
                  )}
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setConfirmDelete(true)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LinkToItemModal
        open={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onConfirm={handlePairItems}
        items={safeAllItems}
        preselectedAccessoryId={item.id}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${item.name}"? This cannot be undone.`}
        onConfirm={() => { setConfirmDelete(false); onDelete?.(item); }}
        onCancel={() => setConfirmDelete(false)}
      />

      {unlinkConfirm && (
        <ConfirmDialog
          open={true}
          title="Unlink Items"
          message={`Unlink ${item?.name} from ${safeAllItems.find((i) => i.id === unlinkConfirm.pairedItemId)?.name}?`}
          onConfirm={handleConfirmUnlink}
          onCancel={() => setUnlinkConfirm(null)}
        />
      )}
    </>
  );
}
