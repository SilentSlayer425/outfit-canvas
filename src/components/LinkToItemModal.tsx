/**
 * Link To Item Modal
 *
 * Modal for creating new pairings between accessories and main items.
 * Users select an accessory and the items to link it to.
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Check, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { ClothingItem } from '@/types/closet';
import { isItemLinkable } from '@/lib/pairing-helpers';

interface LinkToItemModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (accessoryId: string, linkedItemIds: string[]) => void;
  items: ClothingItem[];
  preselectedAccessoryId?: string;
}

type Step = 'select-accessory' | 'select-items';

export function LinkToItemModal({
  open,
  onClose,
  onConfirm,
  items,
  preselectedAccessoryId,
}: LinkToItemModalProps) {
  const [step, setStep] = useState<Step>(preselectedAccessoryId ? 'select-items' : 'select-accessory');
  const [selectedAccessoryId, setSelectedAccessoryId] = useState<string | null>(preselectedAccessoryId ?? null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Accessories that can be paired
  const linkableAccessories = useMemo(
    () => items.filter((item) => isItemLinkable(item.category)),
    [items]
  );

  // Main items (everything except accessories/bags/jewelry) or those not already heavily paired
  const mainItems = useMemo(
    () => items.filter((item) => !isItemLinkable(item.category)),
    [items]
  );

  // Filtered items based on search
  const filteredAccessories = useMemo(() => {
    return linkableAccessories.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [linkableAccessories, searchQuery]);

  const filteredMainItems = useMemo(() => {
    return mainItems.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mainItems, searchQuery]);

  const selectedAccessory = selectedAccessoryId
    ? items.find((i) => i.id === selectedAccessoryId)
    : null;

  const handleToggleItem = (itemId: string) => {
    const newSet = new Set(selectedItemIds);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    setSelectedItemIds(newSet);
  };

  const handleConfirm = () => {
    if (selectedAccessoryId && selectedItemIds.size > 0) {
      onConfirm(selectedAccessoryId, Array.from(selectedItemIds));
      setStep(preselectedAccessoryId ? 'select-items' : 'select-accessory');
      setSelectedAccessoryId(preselectedAccessoryId ?? null);
      setSelectedItemIds(new Set());
      setSearchQuery('');
      onClose();
    }
  };

  const handleCancel = () => {
    setStep(preselectedAccessoryId ? 'select-items' : 'select-accessory');
    setSelectedAccessoryId(preselectedAccessoryId ?? null);
    setSelectedItemIds(new Set());
    setSearchQuery('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 'select-accessory' ? 'Select Accessory' : 'Link to Items'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search bar */}
          <div>
            <Input
              placeholder={
                step === 'select-accessory'
                  ? 'Search accessories, bags, jewelry...'
                  : 'Search items to link...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
          </div>

          {/* Step 1: Select Accessory */}
          {step === 'select-accessory' && (
            <ScrollArea className="h-80 pr-4 border rounded-lg">
              <div className="space-y-1 p-4">
                {filteredAccessories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No accessories found</p>
                  </div>
                ) : (
                  filteredAccessories.map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        setSelectedAccessoryId(item.id);
                        setSelectedItemIds(new Set());
                        setSearchQuery('');
                        setStep('select-items');
                      }}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        selectedAccessoryId === item.id
                          ? 'bg-primary/10'
                          : 'hover:bg-muted'
                      }`}
                      whileHover={{ x: 2 }}
                    >
                      <img
                        src={item.imageData}
                        alt={item.name}
                        className="w-12 h-12 object-contain rounded"
                      />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  ))
                )}
              </div>
            </ScrollArea>
          )}

          {/* Step 2: Select Items */}
          {step === 'select-items' && selectedAccessory && (
            <div className="space-y-4">
              {/* Selected accessory display */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <img
                  src={selectedAccessory.imageData}
                  alt={selectedAccessory.name}
                  className="w-12 h-12 object-contain rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{selectedAccessory.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedAccessory.category}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedAccessoryId(null);
                    setSelectedItemIds(new Set());
                    setSearchQuery('');
                    setStep('select-accessory');
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Selected items chips */}
              {selectedItemIds.size > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedItemIds).map((itemId) => {
                    const item = items.find((i) => i.id === itemId);
                    if (!item) return null;
                    return (
                      <Badge key={itemId} variant="secondary" className="gap-1">
                        {item.name}
                        <button
                          onClick={() => handleToggleItem(itemId)}
                          className="ml-1 hover:text-foreground transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Items to link */}
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Select items to link ({selectedItemIds.size} selected)
                </Label>
                <ScrollArea className="h-80 pr-4 border rounded-lg">
                  <div className="space-y-2 p-4">
                    {filteredMainItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No items found</p>
                      </div>
                    ) : (
                      filteredMainItems.map((item) => (
                        <motion.div
                          key={item.id}
                          className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors"
                          whileHover={{ x: 2 }}
                        >
                          <Checkbox
                            checked={selectedItemIds.has(item.id)}
                            onCheckedChange={() => handleToggleItem(item.id)}
                          />
                          <img
                            src={item.imageData}
                            alt={item.name}
                            className="w-10 h-10 object-contain rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {step === 'select-items' && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedAccessoryId(null);
                  setSelectedItemIds(new Set());
                  setSearchQuery('');
                  setStep('select-accessory');
                }}
              >
                Back
              </Button>
            )}
            {step === 'select-items' && (
              <Button
                onClick={handleConfirm}
                disabled={selectedItemIds.size === 0}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                Link Items
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
