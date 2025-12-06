import React from 'react';
import { Scale, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/contexts/ComparisonContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function ComparisonFloatingButton() {
  const { comparisonList, removeFromComparison, setIsCompareModalOpen } = useComparison();

  if (comparisonList.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-scale-in">
      <div className="bg-card border border-border shadow-lg rounded-full px-4 py-3 flex items-center gap-3">
        {/* Property thumbnails */}
        <div className="flex items-center gap-2">
          {comparisonList.map((property) => (
            <div key={property.id} className="relative group">
              <Avatar className="w-10 h-10 border-2 border-primary">
                <AvatarImage src={property.image} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {property.title.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => removeFromComparison(property.id)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {comparisonList.length < 2 && (
            <div className="w-10 h-10 border-2 border-dashed border-muted-foreground/30 rounded-full flex items-center justify-center">
              <span className="text-muted-foreground text-xs">+1</span>
            </div>
          )}
        </div>

        {/* Compare button */}
        <Button
          onClick={() => setIsCompareModalOpen(true)}
          disabled={comparisonList.length < 2}
          className="bg-hero-gradient text-white hover:opacity-90 gap-2"
        >
          <Scale className="w-4 h-4" />
          Jämför ({comparisonList.length}/2)
        </Button>
      </div>
    </div>
  );
}
