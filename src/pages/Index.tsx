/**
 * Main App Page
 *
 * Four tabs: My Closet, Build Outfit, Saved Outfits, Support.
 * 
 * Customization:
 *  - Tab animation speed: change PAGE_TRANSITION_DURATION in src/config.ts
 *  - Max content width: change max-w-4xl below
 *  - Header blur: change backdrop-blur-md intensity
 *  - Footer text: change the analytics notice at the bottom
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Cloud, CloudOff, LogOut, Trash2, RefreshCw, Moon, Sun, FileText, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useCloset } from '@/hooks/useCloset';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppNav } from '@/components/AppNav';
import type { Tab } from '@/components/AppNav';
import { UploadModal } from '@/components/UploadModal';
import { EditItemModal } from '@/components/EditItemModal';
import { ItemDetailModal } from '@/components/ItemDetailModal';
import { ClothingGrid } from '@/components/ClothingGrid';
import { OutfitCanvas } from '@/components/OutfitCanvas';
import { RearCanvas } from '@/components/RearCanvas';
import { SavedOutfits } from '@/components/SavedOutfits';
import { DonationPage } from '@/components/DonationPage';
import { WeatherWidget } from '@/components/WeatherWidget';
import { CATEGORY_Y_DEFAULTS, CATEGORY_X_DEFAULTS, PAGE_TRANSITION_DURATION } from '@/config';
import type { ClothingCategory, ClothingItem, OutfitItem, Outfit } from '@/types/closet';
import type { GoogleUser } from '@/hooks/useGoogleAuth';
import { goToSubdomain } from '@/utils/navigation';
import { getCategoryDefaults } from '@/lib/category-helpers';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

interface IndexProps {
  user: GoogleUser;
  onSignOut: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
}

export default function Index({ user, onSignOut, darkMode, setDarkMode, toggleDarkMode }: IndexProps) {
  const { items, outfits, customMainTags, ready, addItem, updateItem, removeItem, saveOutfit, removeOutfit, getItemById, replaceAll, duplicateItem } = useCloset();
  const { saveToDrive, loadFromDrive, syncing, lastSync } = useGoogleDrive(user.accessToken);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'closet');  const [uploadOpen, setUploadOpen] = useState(false);
  const [editItem, setEditItem] = useState<ClothingItem | null>(null);
  const [viewItem, setViewItem] = useState<ClothingItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<ClothingCategory | 'all'>('all');
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);
  const [addToSide, setAddToSide] = useState<'front' | 'back'>('front');
  const [weatherCity, setWeatherCity] = useState<string | null>(null);
  const [weatherLat, setWeatherLat]   = useState<number | null>(null);
  const [weatherLon, setWeatherLon]   = useState<number | null>(null);
  const driveLoaded = useRef(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  // Handle tab navigation
  const handleTabChange = (newTab: Tab) => {
    if (newTab === 'home') {
      navigate('/');
    } else {
      setTab(newTab);
    }
  };

  // Load from Drive on mount
  useEffect(() => {
    if (!ready) return;
    loadFromDrive().then((data) => {
      if (data) {
        replaceAll(data.items || [], data.outfits || [], data.customMainTags || []);
        if (data.weatherCity) {
          setWeatherCity(data.weatherCity);
          setWeatherLat(data.weatherLat ?? null);
          setWeatherLon(data.weatherLon ?? null);
        }
        if (data.darkMode !== undefined) {
          setDarkMode(data.darkMode);
        }
      }
      driveLoaded.current = true;
    });
  }, [loadFromDrive, ready, replaceAll, setDarkMode]);

  // Auto-save to Drive
  useEffect(() => {
    if (!ready || !driveLoaded.current) return;
    const timer = setTimeout(() => {
      saveToDrive({ items, outfits, customMainTags, weatherCity, weatherLat, weatherLon, darkMode } as any);
    }, 2000);
    return () => clearTimeout(timer);
  }, [items, outfits, customMainTags, weatherCity, weatherLat, weatherLon, darkMode, saveToDrive, ready]);

  const handleUpload = useCallback((data: { name: string; category: ClothingCategory; subcategory?: string; customTags?: string[]; description?: string; brand?: string; imageData: string }) => {
    addItem(data);
  }, [addItem]);

  const addToOutfit = useCallback((item: ClothingItem) => {
    const defaults = getCategoryDefaults(
      item.category,
      customMainTags,
      CATEGORY_X_DEFAULTS[item.category] ?? 0,
      CATEGORY_Y_DEFAULTS[item.category] ?? 0
    );
    setOutfitItems((prev) => [
      ...prev,
      {
        clothingId: item.id,
        category: item.category,
        x: defaults.x,
        y: defaults.y,
        scale: 1,
        zIndex: prev.length + 1,
        side: addToSide,
      },
    ]);
  }, [addToSide, customMainTags]);

  const updateOutfitItem = useCallback((index: number, updates: Partial<OutfitItem>) => {
    setOutfitItems((prev) => prev.map((oi, i) => (i === index ? { ...oi, ...updates } : oi)));
  }, []);

  const removeOutfitItem = useCallback((index: number) => {
    setOutfitItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSaveOutfit = useCallback((name: string) => {
    saveOutfit({ name, items: outfitItems });
    setOutfitItems([]);
  }, [outfitItems, saveOutfit]);

  const handleLoadOutfit = useCallback((outfit: Outfit) => {
    setOutfitItems(outfit.items.map((oi) => ({ ...oi })));
    setTab('builder');
  }, []);

  const handleWeatherCityChange = useCallback((city: string, lat: number, lon: number) => {
    setWeatherCity(city);
    setWeatherLat(lat); // add
    setWeatherLon(lon); // add
  }, []);

  const handleDeleteAllData = useCallback(() => {
    replaceAll([], [], []);
    setConfirmDeleteAll(false);
  }, [replaceAll]);

  const handleSwitchAccount = useCallback(() => {
    onSignOut();
  }, [onSignOut]);

  const handleHardResync = useCallback(async () => {
    const data = await loadFromDrive({ forceRefresh: true });
    if (!data) {
      toast.error('No Google Drive closet data found.');
      return;
    }

    replaceAll(data.items || [], data.outfits || [], data.customMainTags || []);
    if (data.weatherCity) {
      setWeatherCity(data.weatherCity);
      setWeatherLat(data.weatherLat ?? null);
      setWeatherLon(data.weatherLon ?? null);
    }
    if (data.darkMode !== undefined) {
      setDarkMode(data.darkMode);
    }
    toast.success('Hard resync complete.');
  }, [loadFromDrive, replaceAll, setDarkMode]);

  const handleDuplicateItem = useCallback((itemId: string) => {
    const newItemId = duplicateItem(itemId);
    if (newItemId) {
      const item = items.find((i) => i.id === itemId);
      const itemName = item?.name || 'Item';
      toast.success(`${itemName} duplicated`);
    }
  }, [duplicateItem, items]);

  const headerTitle: Record<Tab, string> = {
    home: 'Home',
    closet: 'My Closet',
    builder: 'Build Outfit',
    outfits: 'Saved Outfits',
    donate: 'Support',
  };

  return (
    <div className="min-h-screen pb-20">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <motion.h1
            key={tab}
            className="text-2xl font-heading font-bold text-foreground"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {headerTitle[tab]}
          </motion.h1>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {syncing ? (
                <><Cloud className="h-3.5 w-3.5 animate-pulse" /> <span className="hidden sm:inline">Syncing...</span></>
              ) : lastSync ? (
                <><Cloud className="h-3.5 w-3.5 text-primary" /> <span className="hidden sm:inline">Synced</span></>
              ) : (
                <><CloudOff className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Local</span></>
              )}
            </span>
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="h-4 w-4 text-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-foreground" />
              )}
            </button>
            {tab === 'closet' && (
              <Button onClick={() => setUploadOpen(true)} className="gap-2 rounded-xl" size="sm">
                <Plus className="h-4 w-4" /> Add<span className="hidden sm:inline"> Item</span>
              </Button>
            )}
            {/* Profile avatar — opens dropdown menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen((p) => !p)}
                className="flex items-center gap-1 rounded-full p-1 transition-colors hover:bg-muted"
                title="Account menu"
              >
                <img src={user.picture} alt={user.name} className="h-7 w-7 rounded-full" />
              </button>
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl bg-card border border-border shadow-float overflow-hidden">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link to="/terms" onClick={() => setProfileMenuOpen(false)}>
                      <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <FileText className="w-4 h-4" /> Terms of Service
                      </button>
                    </Link>
                    <Link to="/privacy" onClick={() => setProfileMenuOpen(false)}>
                      <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <Shield className="w-4 h-4" /> Privacy Policy
                      </button>
                    </Link>
                    <button
                      onClick={async () => { setProfileMenuOpen(false); await handleHardResync(); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors border-t border-border"
                      disabled={syncing}
                    >
                      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /> Hard Resync
                    </button>
                    <button
                      onClick={() => { setProfileMenuOpen(false); handleSwitchAccount(); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors border-t border-border"
                    >
                      <RefreshCw className="w-4 h-4" /> Switch Account
                    </button>
                    <button
                      onClick={() => { setProfileMenuOpen(false); goToSubdomain('delete'); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete All Data
                    </button>
                    <button
                      onClick={() => { setProfileMenuOpen(false); onSignOut(); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors border-t border-border"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        <AnimatePresence mode="wait">
          {tab === 'closet' && (
            <motion.div key="closet" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: PAGE_TRANSITION_DURATION }}>
              <ClothingGrid
                items={items}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                onRemove={removeItem}
                onEdit={setEditItem}
                onView={setViewItem}
                onDuplicate={handleDuplicateItem}
                customMainTags={customMainTags}
              />
            </motion.div>
          )}

          {tab === 'builder' && (
            <motion.div key="builder" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: PAGE_TRANSITION_DURATION }}>
              {/* Weather widget — collapsible */}
              <WeatherWidget savedCity={weatherCity} savedLat={weatherLat} savedLon={weatherLon} onCityChange={handleWeatherCityChange} />

              {isMobile ? (
                <div className="flex flex-col gap-4">
                  {/* Side selector */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setAddToSide('front')}
                      variant={addToSide === 'front' ? 'default' : 'outline'}
                      className="flex-1 rounded-xl"
                    >
                      Front
                    </Button>
                    <Button
                      onClick={() => setAddToSide('back')}
                      variant={addToSide === 'back' ? 'default' : 'outline'}
                      className="flex-1 rounded-xl"
                    >
                      Back
                    </Button>
                  </div>

                  {/* Front canvas */}
                  <div className="rounded-2xl border border-border p-4">
                    <h3 className="mb-3 font-heading font-semibold text-foreground">Front View</h3>
                    <OutfitCanvas
                      outfitItems={outfitItems}
                      getItemById={getItemById}
                      onUpdateItem={updateOutfitItem}
                      onRemoveItem={removeOutfitItem}
                      onSave={handleSaveOutfit}
                    />
                  </div>

                  {/* Back canvas */}
                  <div className="rounded-2xl border border-border p-4">
                    <h3 className="mb-3 font-heading font-semibold text-foreground">Back View</h3>
                    <RearCanvas
                      outfitItems={outfitItems}
                      getItemById={getItemById}
                      onUpdateItem={updateOutfitItem}
                      onRemoveItem={removeOutfitItem}
                    />
                  </div>

                  <div>
                    <h3 className="mb-3 font-heading font-semibold text-foreground">Add from closet</h3>
                    <ClothingGrid
                      items={items}
                      activeCategory={activeCategory}
                      onCategoryChange={setActiveCategory}
                      onRemove={removeItem}
                      onSelect={addToOutfit}
                      selectable
                      showItemHoverText
                      customMainTags={customMainTags}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <div className="w-2/3 overflow-y-auto">
                    {/* Side selector */}
                    <div className="flex gap-2 mb-4">
                      <Button
                        onClick={() => setAddToSide('front')}
                        variant={addToSide === 'front' ? 'default' : 'outline'}
                        className="flex-1 rounded-xl"
                      >
                        Front
                      </Button>
                      <Button
                        onClick={() => setAddToSide('back')}
                        variant={addToSide === 'back' ? 'default' : 'outline'}
                        className="flex-1 rounded-xl"
                      >
                        Back
                      </Button>
                    </div>
                    <h3 className="mb-3 font-heading font-semibold text-foreground">Add from closet</h3>
                    <ClothingGrid
                      items={items}
                      activeCategory={activeCategory}
                      onCategoryChange={setActiveCategory}
                      onRemove={removeItem}
                      onSelect={addToOutfit}
                      selectable
                      showItemHoverText
                      customMainTags={customMainTags}
                    />
                  </div>
                  <div className="w-1/3 flex flex-col gap-4 sticky top-24 self-start h-fit">
                    {/* Front canvas */}
                    <div className="rounded-2xl border border-border p-4">
                      <h3 className="mb-3 font-heading font-semibold text-foreground">Front</h3>
                      <OutfitCanvas
                        outfitItems={outfitItems}
                        getItemById={getItemById}
                        onUpdateItem={updateOutfitItem}
                        onRemoveItem={removeOutfitItem}
                        onSave={handleSaveOutfit}
                      />
                    </div>

                    {/* Back canvas */}
                    <div className="rounded-2xl border border-border p-4">
                      <h3 className="mb-3 font-heading font-semibold text-foreground">Back</h3>
                      <RearCanvas
                        outfitItems={outfitItems}
                        getItemById={getItemById}
                        onUpdateItem={updateOutfitItem}
                        onRemoveItem={removeOutfitItem}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'outfits' && (
            <motion.div key="outfits" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: PAGE_TRANSITION_DURATION }}>
              <SavedOutfits outfits={outfits} getItemById={getItemById} onRemove={removeOutfit} onLoad={handleLoadOutfit} onEditItem={setEditItem} onDeleteItem={removeItem} />
            </motion.div>
          )}

          {tab === 'donate' && (
            <motion.div key="donate" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: PAGE_TRANSITION_DURATION }}>
              <DonationPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} customMainTags={customMainTags} onUpload={handleUpload} />
      <EditItemModal open={!!editItem} item={editItem} onClose={() => setEditItem(null)} customMainTags={customMainTags} onSave={updateItem} />
      <ItemDetailModal
        open={!!viewItem}
        item={viewItem}
        onClose={() => setViewItem(null)}
        onEdit={(item) => { setViewItem(null); setEditItem(item); }}
        onDelete={(item) => { setViewItem(null); removeItem(item.id); }}
      />
      <ConfirmDialog
        open={confirmDeleteAll}
        title="Delete All Data"
        message="Are you sure you want to delete ALL your closet items and saved outfits? This cannot be undone."
        onConfirm={handleDeleteAllData}
        onCancel={() => setConfirmDeleteAll(false)}
      />
      <AppNav active={tab} onChange={handleTabChange} />
    </div>
  );
}
