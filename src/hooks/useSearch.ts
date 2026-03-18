'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import useDebounce from './useDebounce';

export interface SearchResult {
  ads: {
    id: number;
    title: string;
    slug: string;
    price: number;
    currency: string;
    thumbnail?: string;
    location?: string;
    category?: string;
  }[];
  categories: {
    id: number;
    name: string;
    slug: string;
    icon: string;
  }[];
  locations: {
    id: number;
    name: string;
    slug: string;
    state?: string;
  }[];
}

export interface SearchOptions {
  query?: string;
  categoryId?: number;
  locationId?: number;
  limit?: number;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 400);

  const search = useCallback(async (options: SearchOptions = {}) => {
    if (!options.query && !debouncedQuery) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.query || debouncedQuery) {
        params.append('q', options.query || debouncedQuery);
      }
      if (options.categoryId) {
        params.append('category', options.categoryId.toString());
      }
      if (options.locationId) {
        params.append('location', options.locationId.toString());
      }
      if (options.limit) {
        params.append('limit', options.limit.toString());
      }

      const response = await api.get(`/search?${params.toString()}`);
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    search,
    clearSearch,
  };
}

export default useSearch;