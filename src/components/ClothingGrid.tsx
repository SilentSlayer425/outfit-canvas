/**
 * Clothing Grid
 * 
 * Displays uploaded clothing items in a filterable grid.
 * Supports subcategory + custom tag filtering and confirm-on-delete.
 * 
 * Customization:
 *  - Grid columns: change GRID_COLS in src/config.ts
 *  - Item animation speed: change GRID_ITEM_STAGGER in src/config.ts
 *  - Card shape: change rounded-xl below for more/less rounding
 *  - Card shadow: change shadow-soft to shadow-card or shadow-float
 *  - Image aspect ratio: change aspect-square to aspect-[3/4] for taller cards
 *  - Category pill colors: change bg-primary / bg-secondary in CategoryPill
 */
import { useState, useMemo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Pencil, Copy, Link2 } from 'lucide-react';
import type { ClothingItem, ClothingCategory, CustomMainTag, Outfit } from '@/types/closet';
import { CATEGORY_LABELS, CATEGORY_ORDER, SUBCATEGORIES } from '@/types/closet';
import { GRID_COLS, GRID_ITEM_STAGGER } from '@/config';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMergedCategoryOrder, getCategoryLabel } from '@/lib/category-helpers';
import { isItemPaired } from '@/lib/pairing-helpers';

interface ClothingGridProps {
  items: ClothingItem[];
  activeCategory: ClothingCategory | 'all';
  onCategoryChange: (cat: ClothingCategory | 'all') => void;
  onRemove: (id: string) => void;
  onSelect?: (item: ClothingItem) => void;
  onEdit?: (item: ClothingItem) => void;
  onView?: (item: ClothingItem) => void;
  onDuplicate?: (id: string) => void;
  selectable?: boolean;
  showItemHoverText?: boolean;
  customMainTags?: CustomMainTag[];
  outfits?: Outfit[];
}

export function ClothingGrid({
  items, activeCategory, onCategoryChange, onRemove, onSelect, onEdit, onView, onDuplicate, selectable, showItemHoverText, customMainTags = [], outfits = [],
}: ClothingGridProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const mergedCategoryOrder = getMergedCategoryOrder(customMainTags);

  // Get all tags (built-in subs + custom) for the active category
  const availableTags = useMemo(() => {
    if (activeCategory === 'all') return [];
    const catItems = items.filter((i) => i.category === activeCategory);
    const builtIn = SUBCATEGORIES[activeCategory] || [];
    const customSet = new Set<string>();
    catItems.forEach((i) => {
      i.customTags?.forEach((t) => customSet.add(t));
    });
    // Merge: built-in subs that have items + all custom tags with items
    const tags: { label: string; count: number }[] = [];
    builtIn.forEach((sub) => {
      const count = catItems.filter((i) => i.subcategory === sub).length;
      if (count > 0) tags.push({ label: sub, count });
    });
    customSet.forEach((tag) => {
      const count = catItems.filter((i) => i.customTags?.includes(tag)).length;
      if (count > 0 && !tags.some((t) => t.label === tag)) tags.push({ label: tag, count });
    });
    return tags;
  }, [items, activeCategory]);

  // Filter items by category and active tag
  const filtered = useMemo(() => {
    let list = activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory);
    if (activeTag) {
      list = list.filter((i) => i.subcategory === activeTag || i.customTags?.includes(activeTag));
    }
    if (activeBrand) {
      list = list.filter((i) => i.brand === activeBrand);
    }
    return list;
  }, [items, activeCategory, activeTag, activeBrand]);

  // Get all brands for the currently visible items (after category/tag filtering, before brand filtering)
  const availableBrands = useMemo(() => {
    let list = activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory);
    if (activeTag) {
      list = list.filter((i) => i.subcategory === activeTag || i.customTags?.includes(activeTag));
    }
    const brandSet = new Set<string>();
    list.forEach((i) => {
      if (i.brand) {
        brandSet.add(i.brand);
      }
    });
    const brands: { label: string; count: number }[] = [];
    brandSet.forEach((brand) => {
      const count = list.filter((i) => i.brand === brand).length;
      if (count > 0) brands.push({ label: brand, count });
    });
    // Sort brands alphabetically
    return brands.sort((a, b) => a.label.localeCompare(b.label));
  }, [items, activeCategory, activeTag]);

  // Reset tag and brand when category changes
  const handleCategoryChange = (cat: ClothingCategory | 'all') => {
    setActiveTag(null);
    setActiveBrand(null);
    onCategoryChange(cat);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      onRemove(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      {/* Category filter pills — scrollable row */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <CategoryPill label="All" active={activeCategory === 'all'} onClick={() => handleCategoryChange('all')} />
        {mergedCategoryOrder.map((cat) => (
          <CategoryPill
            key={cat}
            label={getCategoryLabel(cat, customMainTags)}
            active={activeCategory === cat}
            onClick={() => handleCategoryChange(cat)}
            count={items.filter(i => i.category === cat).length}
          />
        ))}
      </div>

      {/* Sub-tag pills when a category is selected */}
      {activeCategory !== 'all' && availableTags.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-hide">
          <button
            onClick={() => setActiveTag(null)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !activeTag ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          {availableTags.map(({ label, count }) => (
            <button
              key={label}
              onClick={() => setActiveTag(activeTag === label ? null : label)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeTag === label ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {label} <span className="opacity-60">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Brand filter dropdown */}
      {availableBrands.length > 0 && (
        <div className="flex gap-2 mb-4">
          <Select value={activeBrand || ''} onValueChange={(value) => setActiveBrand(value || null)}>
            <SelectTrigger className="w-40 rounded-xl bg-background text-xs">
              <SelectValue placeholder="All brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All brands</SelectItem>
              {availableBrands.map(({ label, count }) => (
                <SelectItem key={label} value={label}>
                  {label} <span className="text-muted-foreground">({count})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Nothing here yet</p>
          <p className="text-sm mt-1">Upload some items to get started!</p>
        </div>
      ) : (
        <div className={`grid ${GRID_COLS} gap-3`}>
          {filtered.map((item, i) => (
            <ItemHoverTooltip key={item.id} item={item} enabled={!!showItemHoverText && !!selectable}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * GRID_ITEM_STAGGER }}
              className={`group relative rounded-xl overflow-hidden bg-card shadow-soft ${
                selectable ? 'cursor-pointer hover:shadow-card transition-shadow' : ''
              }`}
              onClick={() => {
                if (selectable) { onSelect?.(item); return; }
                onView?.(item);
              }}
            >
              {/* Image container */}
              <div className="aspect-square p-2 relative">
                <img src={item.imageData} alt={item.name} className="w-full h-full object-contain" />
                {/* Pairing icon badge */}
                {isItemPaired(item.id, outfits) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute top-3 right-3 p-1.5 rounded-full bg-primary/90 text-primary-foreground">
                        <Link2 className="w-3.5 h-3.5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" align="start">
                      This item is linked with another
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="px-3 pb-3">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_LABELS[item.category]}
                  {item.subcategory && <span className="ml-1">· {item.subcategory}</span>}
                  {item.brand && <span className="ml-1">· {item.brand}</span>}
                </p>
                {/* Custom tags */}
                {item.customTags && item.customTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.customTags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {!selectable && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {/* Edit button */}
                  {onEdit && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                      className="p-1.5 rounded-full bg-card/80 backdrop-blur-sm hover:bg-muted"
                      title="Edit item"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {/* Duplicate button */}
                  {onDuplicate && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDuplicate(item.id); }}
                      className="p-1.5 rounded-full bg-card/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground"
                      title="Duplicate item"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {/* Delete button — triggers confirm dialog */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(item.id); }}
                    className="p-1.5 rounded-full bg-card/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
            </ItemHoverTooltip>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Item"
        message="Are you sure you want to delete this item? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function ItemHoverTooltip({ item, enabled, children }: {
  item: ClothingItem;
  enabled: boolean;
  children: ReactNode;
}) {
  if (!enabled) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top" align="center" className="max-w-64 space-y-1">
        <p className="text-xs font-semibold">{item.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {CATEGORY_LABELS[item.category]}
          {item.subcategory && <span> · {item.subcategory}</span>}
          {item.brand && <span> · {item.brand}</span>}
        </p>
        {item.description && (
          <p className="line-clamp-3 text-[11px]">{item.description}</p>
        )}
        {item.customTags && item.customTags.length > 0 && (
          <p className="text-[11px] text-muted-foreground">{item.customTags.join(', ')}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Category filter pill
 * Customization:
 *  - Active color: change bg-primary
 *  - Inactive color: change bg-secondary
 *  - Shape: change rounded-full
 */
function CategoryPill({ label, active, onClick, count }: {
  label: string; active: boolean; onClick: () => void; count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
        active
          ? 'bg-primary text-primary-foreground shadow-soft'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-1.5 text-xs opacity-70">{count}</span>
      )}
    </button>
  );
}
