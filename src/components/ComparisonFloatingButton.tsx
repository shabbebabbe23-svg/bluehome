import React from 'react';
import { Scale, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/contexts/ComparisonContext';
import { useLocation } from 'react-router-dom';

export function ComparisonFloatingButton() {
  const { comparisonList, removeFromComparison, setIsCompareModalOpen, clearComparison } = useComparison();
  const location = useLocation();

  // Visa endast jämförelseknappen på startsidan
  const isStartPage = location.pathname === '/' || location.pathname === '';

  if (comparisonList.length === 0 || !isStartPage) return null;

  const getShortAddress = (property: typeof comparisonList[0]) => {
    const address = property.address || property.title;
    return address.length > 15 ? address.slice(0, 15) + '...' : address;
  };

  return (
    <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-scale-in w-auto max-w-[calc(100%-1rem)] sm:max-w-2xl">
      {/* Clear all button */}
      <button
        onClick={clearComparison}
        className="absolute -top-3 -right-3 w-8 h-8 bg-destructive hover:bg-destructive/80 text-white rounded-full flex items-center justify-center shadow-md transition-colors z-10"
        aria-label="Rensa jämförelse"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl px-5 sm:px-8 py-5 sm:py-6 flex items-center justify-center gap-4 sm:gap-6">
        {/* Property thumbnails with addresses */}
        <div className="flex items-center gap-3 sm:gap-5">
          {comparisonList.map((property) => (
            <div key={property.id} className="relative group flex flex-col items-center">
              <div className="relative">
                <div className="rounded-xl overflow-hidden border-2 border-primary/50 shadow-md" style={{ width: '86px', height: '86px' }}>
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFromComparison(property.id)}
                  className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-destructive text-white rounded-full flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>
              </div>
              <span className="text-[11px] sm:text-xs text-muted-foreground mt-1.5 max-w-[90px] sm:max-w-[110px] truncate text-center">
                {getShortAddress(property)}
              </span>
            </div>
          ))}
          {comparisonList.length < 2 && (
            <div className="flex flex-col items-center">
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl flex items-center justify-center bg-muted/30" style={{ width: '86px', height: '86px' }}>
                <span className="text-muted-foreground text-sm sm:text-base font-medium">+1</span>
              </div>
              <span className="text-[11px] sm:text-xs text-muted-foreground/50 mt-1.5">
                Lägg till
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px bg-border/50" style={{ height: '86px' }} />

        {/* Compare button */}
        <Button
          onClick={() => setIsCompareModalOpen(true)}
          disabled={comparisonList.length < 2}
          size="lg"
          className="bg-hero-gradient text-white hover:opacity-90 gap-3 h-14 sm:h-16 px-6 sm:px-8 text-sm sm:text-base font-medium shadow-lg disabled:opacity-50"
        >
          <Scale className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span className="hidden sm:inline">Jämför</span>
          <span className="sm:hidden">Jämför</span>
        </Button>
      </div>
    </div>
  );
}
