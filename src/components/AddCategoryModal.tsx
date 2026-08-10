/**
 * Add Category Modal
 *
 * Modal for users to create custom main tags/categories.
 * Takes a label input and adds the new category to the closet.
 * Shows existing custom categories with delete buttons.
 */
import { useState } from 'react';
import { Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { CustomMainTag } from '@/types/closet';

interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (label: string) => void;
  customCategories?: CustomMainTag[];
  onDeleteCategory?: (id: string) => void;
}

export function AddCategoryModal({ open, onClose, onCreate, customCategories = [], onDeleteCategory }: AddCategoryModalProps) {
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);

  const handleCreate = () => {
    const trimmed = label.trim();

    if (!trimmed) {
      setError('Category name is required');
      return;
    }

    if (trimmed.length > 50) {
      setError('Category name must be 50 characters or less');
      return;
    }

    onCreate(trimmed);
    setLabel('');
    setError(null);
  };

  const handleClose = () => {
    if (!confirmDelete) {
      setLabel('');
      setError(null);
      onClose();
    }
  };

  const handleDeleteClick = (id: string, label: string) => {
    setConfirmDelete({ id, label });
  };

  const handleConfirmDelete = () => {
    if (confirmDelete && onDeleteCategory) {
      onDeleteCategory(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <>
      <Dialog open={open && !confirmDelete} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Manage Categories
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Create new category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Add New Category
              </label>
              <Input
                type="text"
                placeholder="e.g., Formal, Gym, Casual"
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                autoFocus
                className="rounded-lg"
              />
              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </div>

            <Button
              onClick={handleCreate}
              disabled={!label.trim()}
              className="w-full rounded-lg"
            >
              Create
            </Button>

            {/* Existing custom categories */}
            {customCategories.length > 0 && (
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Custom Categories ({customCategories.length})
                </h3>
                <div className="space-y-2">
                  {customCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <span className="text-sm text-foreground">{category.label}</span>
                      <button
                        onClick={() => handleDeleteClick(category.id, category.label)}
                        className="p-1.5 rounded-md hover:bg-destructive/20 transition-colors text-destructive hover:text-destructive"
                        title={`Delete ${category.label}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="rounded-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for deletion */}
      {confirmDelete && (
        <ConfirmDialog
          open={true}
          title={`Delete Category`}
          message={`Are you sure you want to delete "${confirmDelete.label}"? Items assigned to this category will be reassigned to "Accessories".`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
