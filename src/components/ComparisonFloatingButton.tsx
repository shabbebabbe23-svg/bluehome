import React from 'react';
import { Scale, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/contexts/ComparisonContext';

export function ComparisonFloatingButton() {
  const { comparisonList, removeFromComparison, setIsCompareModalOpen, clearComparison } = useComparison();

  if (comparisonList.length === 0) return null;

  const getShortAddress = (property: typeof comparisonList[0]) => {
    const address = property.address || property.title;
    return address.length > 15 ? address.slice(0, 15) + '...' : address;
  };

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-scale-in w-auto max-w-[calc(100%-1rem)] sm:max-w-lg">
      {/* Clear all button */}
      <button
        onClick={clearComparison}
        className="absolute -top-2 -right-2 w-6 h-6 bg-muted hover:bg-destructive text-muted-foreground hover:text-white rounded-full flex items-center justify-center shadow-md transition-colors z-10"
        aria-label="Rensa jämförelse"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-center gap-3 sm:gap-4">
        {/* Property thumbnails with addresses */}
        <div className="flex items-center gap-2 sm:gap-3">
          {comparisonList.map((property) => (
            <div key={property.id} className="relative group flex flex-col items-center">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-primary/50 shadow-md">
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFromComparison(property.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-destructive text-white rounded-full flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
                >
                  <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 max-w-[60px] sm:max-w-[80px] truncate text-center">
                {getShortAddress(property)}
              </span>
            </div>
          ))}
          {comparisonList.length < 2 && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-dashed border-muted-foreground/30 rounded-xl flex items-center justify-center bg-muted/30">
                <span className="text-muted-foreground text-xs sm:text-sm font-medium">+1</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground/50 mt-1">
                Lägg till
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-12 sm:h-16 bg-border/50" />

        {/* Compare button */}
        <Button
          onClick={() => setIsCompareModalOpen(true)}
          disabled={comparisonList.length < 2}
          size="lg"
          className="bg-hero-gradient text-white hover:opacity-90 gap-2 h-10 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm font-medium shadow-lg disabled:opacity-50"
        >
          <Scale className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="hidden sm:inline">Jämför</span>
          <span className="sm:hidden">Jämför</span>
        </Button>
      </div>
    </div>
  );
}
