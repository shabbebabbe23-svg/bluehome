import React from 'react';
import { Scale, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/contexts/ComparisonContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function ComparisonFloatingButton() {
  const { comparisonList, removeFromComparison, setIsCompareModalOpen } = useComparison();

  if (comparisonList.length === 0) return null;

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-scale-in w-auto max-w-[calc(100%-1rem)] sm:max-w-md">
      <div className="bg-card border border-border shadow-lg rounded-full px-2.5 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-3">
        {/* Property thumbnails */}
        <div className="flex items-center gap-1 sm:gap-2">
          {comparisonList.map((property) => (
            <div key={property.id} className="relative group">
              <Avatar className="w-7 h-7 sm:w-10 sm:h-10 border-2 border-primary">
                <AvatarImage src={property.image} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] sm:text-xs">
                  {property.title.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => removeFromComparison(property.id)}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-destructive text-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>
            </div>
          ))}
          {comparisonList.length < 2 && (
            <div className="w-7 h-7 sm:w-10 sm:h-10 border-2 border-dashed border-muted-foreground/30 rounded-full flex items-center justify-center">
              <span className="text-muted-foreground text-[10px] sm:text-xs">+1</span>
            </div>
          )}
        </div>

        {/* Compare button */}
        <Button
          onClick={() => setIsCompareModalOpen(true)}
          disabled={comparisonList.length < 2}
          className="bg-hero-gradient text-white hover:opacity-90 gap-1 sm:gap-2 h-7 sm:h-10 px-2.5 sm:px-4 text-[11px] sm:text-sm"
        >
          <Scale className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
          Jämför ({comparisonList.length}/2)
        </Button>
      </div>
    </div>
  );
}
