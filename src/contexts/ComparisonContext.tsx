import React, { createContext, useContext, ReactNode } from 'react';
import { usePropertyComparison, ComparisonProperty } from '@/hooks/usePropertyComparison';

interface ComparisonContextType {
  comparisonList: ComparisonProperty[];
  addToComparison: (property: ComparisonProperty) => void;
  removeFromComparison: (propertyId: string) => void;
  isInComparison: (propertyId: string) => boolean;
  toggleComparison: (property: ComparisonProperty) => void;
  clearComparison: () => void;
  canAddMore: boolean;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;
  maxComparison: number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const comparison = usePropertyComparison();

  return (
    <ComparisonContext.Provider value={comparison}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
