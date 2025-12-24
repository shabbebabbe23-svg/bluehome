import React from 'react';
import { Scale, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/contexts/ComparisonContext';
import { ComparisonProperty } from '@/hooks/usePropertyComparison';
import { toast } from 'sonner';

interface CompareButtonProps {
  property: ComparisonProperty;
  className?: string;
}

export function CompareButton({ property, className }: CompareButtonProps) {
  const { toggleComparison, isInComparison, canAddMore } = useComparison();
  const isSelected = isInComparison(property.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSelected && !canAddMore) {
      toast.error('Du kan endast jämföra 2 fastigheter åt gången');
      return;
    }
    
    toggleComparison(property);
  };

  return (
    <Button
      variant={isSelected ? 'default' : 'secondary'}
      size="icon"
      className={`${className} ${isSelected ? 'bg-primary' : 'bg-white/90 hover:bg-white'} transition-colors`}
      onClick={handleClick}
      title={isSelected ? 'Ta bort från jämförelse' : 'Lägg till i jämförelse'}
    >
      {isSelected ? (
        <Check className="w-4 h-4 text-white" />
      ) : (
        <Scale className="w-4 h-4 text-muted-foreground" />
      )}
    </Button>
  );
}
