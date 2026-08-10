/**
 * Edit Item Modal
 * 
 * Lets users change an item's name, description, category, subcategory, and custom tags.
 * Does NOT edit the photo — only metadata.
 *
 * Customization:
 *  - Modal width: change max-w-md below
 *  - Modal corners: change rounded-2xl
 *  - Tag pill colors: change bg-primary/10 and text-primary
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ClothingItem, ClothingCategory, CustomMainTag } from '@/types/closet';
import { CATEGORY_LABELS, CATEGORY_ORDER, SUBCATEGORIES } from '@/types/closet';
import { getMergedCategoryOptions, getCategorySubcategories } from '@/lib/category-helpers';

interface EditItemModalProps {
  open: boolean;
  item: ClothingItem | null;
  onClose: () => void;
  customMainTags?: CustomMainTag[];
  onSave: (id: string, updates: Partial<Pick<ClothingItem, 'name' | 'category' | 'subcategory' | 'customTags' | 'description' | 'brand'>>) => void;
}

export function EditItemModal({ open, item, onClose, customMainTags = [], onSave }: EditItemModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('tops');
  const [subcategory, setSubcategory] = useState<string>('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const categoryOptions = getMergedCategoryOptions(customMainTags);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setSubcategory(item.subcategory || '');
      setCustomTags(item.customTags || []);
      setDescription(item.description || '');
      setBrand(item.brand || '');
      setNewTag('');
    }
  }, [item]);

  if (!item) return null;

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !customTags.includes(tag)) {
      setCustomTags((prev) => [...prev, tag]);
    }
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    setCustomTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSave = () => {
    onSave(item.id, {
      name: name.trim() || item.name,
      category,
      subcategory: subcategory || undefined,
      customTags: customTags.length > 0 ? customTags : undefined,
      description: description.trim() || undefined,
      brand: brand.trim() || undefined,
    });
    onClose();
  };

  const availableSubs = getCategorySubcategories(category, customMainTags);

  return (
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
            className="relative z-10 w-full max-w-md rounded-2xl bg-card p-6 shadow-float max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-heading font-semibold text-foreground">Edit Item</h2>
              <button onClick={onClose} className="rounded-full p-1 transition-colors hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Thumbnail preview */}
            <div className="mb-4 flex justify-center">
              <div className="h-28 w-28 rounded-xl bg-muted/30 p-2">
                <img src={item.imageData} alt={item.name} className="h-full w-full object-contain" />
              </div>
            </div>

            <div className="space-y-3">
              {/* Item name */}
              <Input
                placeholder="Item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl bg-background"
              />

              {/* Description */}
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl bg-background text-sm min-h-[60px] resize-none"
                rows={2}
              />

              {/* Category selector */}
              <Select value={category} onValueChange={(v) => { setCategory(v as ClothingCategory); setSubcategory(''); }}>
                <SelectTrigger className="rounded-xl bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Subcategory selector */}
              {availableSubs.length > 0 && (
                <Select value={subcategory} onValueChange={setSubcategory}>
                  <SelectTrigger className="rounded-xl bg-background">
                    <SelectValue placeholder="Subcategory (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {availableSubs.map((sub) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Brand — optional text input */}
              <Input
                placeholder="Brand (optional)"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="rounded-xl bg-background"
              />

              {/* Custom tags */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  <Tag className="w-3 h-3 inline mr-1" />
                  Custom Tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {customTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a custom tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    className="rounded-xl bg-background text-sm flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={addTag} className="rounded-xl" disabled={!newTag.trim()}>
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full rounded-xl font-semibold">
                Save Changes
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
