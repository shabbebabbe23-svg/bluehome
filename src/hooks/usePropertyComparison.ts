import { useState, useCallback } from 'react';

export interface ComparisonProperty {
  id: string;
  title: string;
  price: string;
  location: string;
  address?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  fee?: number;
  image: string;
  additionalImages?: string[];
  type: string;
  soldPrice?: string;
  newPrice?: string;
  isSold?: boolean;
  hasElevator?: boolean;
  hasBalcony?: boolean;
  constructionYear?: number;
  operatingCost?: number;
  brfDebtPerSqm?: number;
}

const MAX_COMPARISON = 2;

export function usePropertyComparison() {
  const [comparisonList, setComparisonList] = useState<ComparisonProperty[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const addToComparison = useCallback((property: ComparisonProperty) => {
    setComparisonList(prev => {
      if (prev.length >= MAX_COMPARISON) {
        return prev;
      }
      if (prev.some(p => p.id === property.id)) {
        return prev;
      }
      return [...prev, property];
    });
  }, []);

  const removeFromComparison = useCallback((propertyId: string) => {
    setComparisonList(prev => prev.filter(p => p.id !== propertyId));
  }, []);

  const isInComparison = useCallback((propertyId: string) => {
    return comparisonList.some(p => p.id === propertyId);
  }, [comparisonList]);

  const toggleComparison = useCallback((property: ComparisonProperty) => {
    if (isInComparison(property.id)) {
      removeFromComparison(property.id);
    } else {
      addToComparison(property);
    }
  }, [isInComparison, removeFromComparison, addToComparison]);

  const clearComparison = useCallback(() => {
    setComparisonList([]);
  }, []);

  const canAddMore = comparisonList.length < MAX_COMPARISON;

  return {
    comparisonList,
    addToComparison,
    removeFromComparison,
    isInComparison,
    toggleComparison,
    clearComparison,
    canAddMore,
    isCompareModalOpen,
    setIsCompareModalOpen,
    maxComparison: MAX_COMPARISON,
  };
}
