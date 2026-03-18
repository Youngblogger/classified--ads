import useSWR from 'swr';
import { adsApi, categoriesApi, locationsApi } from './api';

const fetcher = async (key: string) => {
  const [apiName, method, ...args] = key.split(':');
  
  switch (apiName) {
    case 'ads':
      if (method === 'featured') return adsApi.getFeatured(Number(args[0]) || 10).then(r => r.data);
      if (method === 'recent') return adsApi.getRecent(Number(args[0]) || 20).then(r => r.data);
      if (method === 'bySlug') return adsApi.getBySlug(args[0]).then(r => r.data);
      return adsApi.getAll().then(r => r.data);
    case 'categories':
      return categoriesApi.getAll().then(r => r.data?.data || r.data);
    case 'locations':
      return locationsApi.getAll().then(r => r.data);
    default:
      return null;
  }
};

export function useFeaturedAds(limit = 10) {
  const { data, error, isLoading, mutate } = useSWR(
    `ads:featured:${limit}`,
    () => adsApi.getFeatured(limit as number).then(r => r.data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      fallbackData: null
    }
  );
  
  return {
    ads: data || [],
    isLoading,
    isError: error,
    mutate
  };
}

export function useRecentAds(limit = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    `ads:recent:${limit}`,
    () => adsApi.getRecent(limit as number).then(r => r.data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      fallbackData: null
    }
  );
  
  return {
    ads: data || [],
    isLoading,
    isError: error,
    mutate
  };
}

export function useAdBySlug(slug: string) {
  const { data, error, isLoading, mutate } = useSWR(
    slug ? `ads:bySlug:${slug}` : null,
    () => adsApi.getBySlug(slug).then(r => r.data),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      fallbackData: null
    }
  );
  
  return {
    ad: data,
    isLoading,
    isError: error,
    mutate
  };
}

export function useCategories() {
  const { data, error, isLoading } = useSWR(
    'categories:all',
    () => categoriesApi.getAll().then(r => r.data?.data || r.data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
      fallbackData: []
    }
  );
  
  return {
    categories: data || [],
    isLoading,
    isError: error
  };
}

export function useLocations() {
  const { data, error, isLoading } = useSWR(
    'locations:all',
    () => locationsApi.getAll().then(r => r.data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
      fallbackData: []
    }
  );
  
  return {
    locations: data || [],
    isLoading,
    isError: error
  };
}
