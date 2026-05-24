import { QueryClient } from '@tanstack/react-query';
import { adKeys } from './query-keys';

let swrMutateGlobal: ((key: string | ((key: string) => boolean), data?: any, opts?: boolean) => Promise<any>) | null = null;

export function setSwrMutate(mutate: any): void {
  swrMutateGlobal = mutate;
}

function getSwrMutate(): any {
  if (typeof window !== 'undefined' && (window as any).__swrMutate) {
    return (window as any).__swrMutate;
  }
  return swrMutateGlobal;
}

export function invalidateSwrCache(keyPattern: string | RegExp): void {
  const mutate = getSwrMutate();
  if (!mutate) return;
  if (typeof keyPattern === 'string') {
    mutate((key: string) => typeof key === 'string' && key.startsWith(keyPattern));
  } else {
    mutate((key: string) => typeof key === 'string' && keyPattern.test(key));
  }
}

export function invalidateSwrAdDetail(slug: string): void {
  const mutate = getSwrMutate();
  if (!mutate) return;
  mutate(`ads/${slug}`);
}

export function invalidateSwrExact(key: string): void {
  const mutate = getSwrMutate();
  if (!mutate) return;
  mutate(key);
}

export function syncAllCaches(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: adKeys.all });
  invalidateSwrCache(/^ads/);
  invalidateSwrCache('homepage_data');
  invalidateSwrCache('boosted_ads_listing');
  invalidateSwrCache('search');
  invalidateSwrCache(/^search/);
  invalidateSwrCache('categories');
}

export function syncAdListCaches(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: adKeys.lists() });
  queryClient.invalidateQueries({ queryKey: adKeys.infinite() });
  queryClient.invalidateQueries({ queryKey: adKeys.homepage() });
  queryClient.invalidateQueries({ queryKey: adKeys.trending() });
  invalidateSwrCache(/^ads\?/);
  invalidateSwrCache('homepage_data');
  invalidateSwrCache('boosted_ads_listing');
  invalidateSwrCache(/^search\?/);
}

export function syncAdDetailCache(queryClient: QueryClient, slug: string): void {
  queryClient.invalidateQueries({ queryKey: adKeys.detail(slug) });
  invalidateSwrAdDetail(slug);
}

export function syncAdminCaches(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: adKeys.admin() });
  invalidateSwrCache(/^secure-control-9ja/);
}

export function updateAdInListCaches(queryClient: QueryClient, adId: number, updates: Partial<any>): void {
  const listKeys = [
    adKeys.lists(),
    adKeys.infinite(),
    adKeys.homepage(),
    adKeys.trending(),
    adKeys.boosted(),
    adKeys.user(0),
    adKeys.admin(),
  ];

  for (const key of listKeys) {
    const queries = queryClient.getQueriesData<any>({ queryKey: key });
    for (const [queryKey, data] of queries) {
      if (!data) continue;
      if (Array.isArray(data)) {
        queryClient.setQueryData(queryKey, (old: any[]) =>
          old?.map((item: any) =>
            item.id === adId || item?.ad?.id === adId
              ? { ...item, ...updates, ad: item.ad ? { ...item.ad, ...updates } : undefined }
              : item
          )
        );
      } else if (data?.pages) {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data?.map((item: any) =>
                item.id === adId ? { ...item, ...updates } : item
              ),
            })),
          };
        });
      }
    }
  }
}

export function removeAdFromListCaches(queryClient: QueryClient, adId: number): void {
  const listKeys = [
    adKeys.lists(),
    adKeys.infinite(),
    adKeys.homepage(),
    adKeys.trending(),
    adKeys.boosted(),
    adKeys.user(0),
    adKeys.admin(),
  ];

  for (const key of listKeys) {
    const queries = queryClient.getQueriesData<any>({ queryKey: key });
    for (const [queryKey, data] of queries) {
      if (!data) continue;
      if (Array.isArray(data)) {
        queryClient.setQueryData(queryKey, (old: any[]) =>
          old?.filter((item: any) => item.id !== adId && item?.ad?.id !== adId)
        );
      } else if (data?.pages) {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data?.filter((item: any) => item.id !== adId),
            })),
          };
        });
      }
    }
  }
}
