import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

interface UsePaginatedPropertiesResult<T> {
  data: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  totalCount: number;
}

/**
 * Hook för paginerad hämtning av fastigheter
 * Förhindrar att alla fastigheter laddas på en gång
 */
export function usePaginatedProperties<T = any>(
  options: PaginationOptions = {}
): UsePaginatedPropertiesResult<T> {
  const { pageSize = 20, initialPage = 0 } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const currentPage = useRef(initialPage);
  const isFetching = useRef(false);

  const fetchPage = useCallback(async (page: number, append: boolean = false) => {
    if (isFetching.current) return;
    
    isFetching.current = true;
    
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const start = page * pageSize;
      const end = start + pageSize - 1;

      // Hämta fastigheter med pagination
      const { data: properties, error: fetchError, count } = await supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(start, end);

      if (fetchError) throw fetchError;

      if (properties) {
        if (append) {
          setData(prev => [...prev, ...properties as T[]]);
        } else {
          setData(properties as T[]);
        }
        
        setHasMore(properties.length === pageSize);
        
        if (count !== null) {
          setTotalCount(count);
        }
      }

      currentPage.current = page;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetching.current = false;
    }
  }, [pageSize]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    await fetchPage(currentPage.current + 1, true);
  }, [hasMore, isLoadingMore, fetchPage]);

  const refresh = useCallback(async () => {
    currentPage.current = 0;
    await fetchPage(0, false);
  }, [fetchPage]);

  // Initial load
  useEffect(() => {
    fetchPage(0);
  }, [fetchPage]);

  return {
    data,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    totalCount,
  };
}

/**
 * Hook för infinite scroll
 * Laddar automatiskt mer data när användaren scrollar nära botten
 */
export function useInfiniteScroll(
  loadMore: () => Promise<void>,
  hasMore: boolean,
  isLoading: boolean
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px',
    });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [loadMore, hasMore, isLoading]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return loadMoreRef;
}

/**
 * Cache för databas-queries
 * Minskar antal anrop till databasen
 */
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minuter

export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  const cached = queryCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }

  const data = await queryFn();
  queryCache.set(key, { data, timestamp: Date.now() });
  
  return data;
}

export function invalidateCache(keyPattern?: string): void {
  if (keyPattern) {
    for (const key of queryCache.keys()) {
      if (key.includes(keyPattern)) {
        queryCache.delete(key);
      }
    }
  } else {
    queryCache.clear();
  }
}
