/**
 * Item Detail Modal
 *
 * View modal for clothing items. Shows full image, name, category, subcategory, description, tags.
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
import { X, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { ClothingItem } from '@/types/closet';
import { CATEGORY_LABELS, getItemPrimaryImageData } from '@/types/closet';

interface ItemDetailModalProps {
  open: boolean;
  item: ClothingItem | null;
  onClose: () => void;
  onEdit?: (item: ClothingItem) => void;
  onDelete?: (item: ClothingItem) => void;
}

export function ItemDetailModal({ open, item, onClose, onEdit, onDelete }: ItemDetailModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!item) return null;
  const imageSrc = getItemPrimaryImageData(item);

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
                <img src={imageSrc ?? ''} alt={item.name} className="h-full w-auto object-contain" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {CATEGORY_LABELS[item.category]}
                  {item.subcategory && <span className="text-muted-foreground ml-1">· {item.subcategory}</span>}
                </p>

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
              </div>

              {/* Action buttons — only shown when callbacks provided */}
              {(onEdit || onDelete) && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-border">
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
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${item.name}"? This cannot be undone.`}
        onConfirm={() => { setConfirmDelete(false); onDelete?.(item); }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
