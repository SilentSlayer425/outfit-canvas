/**
 * Bottom Navigation
 *
 * Customization:
 *  - Icon size: change w-5 h-5
 *  - Active color: uses text-primary token
 *  - Background blur: change backdrop-blur-md
 *  - Background opacity: change bg-card/90
 */
import { Shirt, Palette, Heart, Link as LinkIcon, Gift, Home } from 'lucide-react';

export type Tab = 'closet' | 'builder' | 'outfits' | 'pairings' | 'donate' | 'home';

interface AppNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export function AppNav({ active, onChange }: AppNavProps) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'closet', label: 'My Closet', icon: <Shirt className="w-5 h-5" /> },
    { id: 'builder', label: 'Build Outfit', icon: <Palette className="w-5 h-5" /> },
    { id: 'outfits', label: 'Saved', icon: <Heart className="w-5 h-5" /> },
    { id: 'pairings', label: 'Pairings', icon: <LinkIcon className="w-5 h-5" /> },
    { id: 'donate', label: 'Support', icon: <Gift className="w-5 h-5" /> },
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border shadow-float">
      <div className="max-w-2xl mx-auto flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              active === tab.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            <span className="text-xs font-semibold">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}