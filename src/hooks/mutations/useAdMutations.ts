'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adsApi, adminApi, growthApi } from '@/lib/api';
import { adKeys } from '@/lib/query-keys';
import {
  syncAllCaches,
  syncAdListCaches,
  syncAdDetailCache,
  syncAdminCaches,
  updateAdInListCaches,
  updateAdInSwrCaches,
  removeAdFromListCaches,
  invalidateSwrCache,
  invalidateSwrExact,
  broadcastCacheInvalidation,
} from '@/lib/cache-sync';
import { handleMutationError } from '@/lib/query-client';
import toast from 'react-hot-toast';

function invalidateSwrQueries(): void {
  invalidateSwrCache(/^ads\?/);
  invalidateSwrCache('homepage_data');
  invalidateSwrCache('boosted_ads_listing');
  invalidateSwrCache(/^search/);
  invalidateSwrCache('categories');
  invalidateSwrCache(/^secure-control-9ja/);
  broadcastCacheInvalidation();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ilist:cache-invalidate'));
  }
}

// ─── Mark Ad as Sold ───────────────────────────────────────────────
export function useCloseAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adId: number) => adsApi.sold(adId),
    onMutate: async (adId) => {
      await queryClient.cancelQueries({ queryKey: adKeys.all });
      const snapshot = queryClient.getQueriesData({ queryKey: adKeys.all });
      updateAdInListCaches(queryClient, adId, { status: 'sold' });
      return { snapshot };
    },
    onSuccess: (_data, adId) => {
      toast.success('Ad marked as sold');
      syncAdListCaches(queryClient);
    },
    onError: (error, _adId, context) => {
      if (context?.snapshot) {
        for (const [key, data] of context.snapshot) {
          queryClient.setQueryData(key, data);
        }
      }
      handleMutationError(error);
    },
    onSettled: () => {
      invalidateSwrQueries();
    },
  });
}

// ─── Delete Ad ─────────────────────────────────────────────────────
export function useDeleteAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, id }: { slug: string; id?: number }) =>
      adsApi.delete(slug).catch(() => {
        if (id) return adsApi.deleteById(id);
        throw new Error('Failed to delete ad');
      }),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: adKeys.all });
      const snapshot = queryClient.getQueriesData({ queryKey: adKeys.all });
      if (id) {
        removeAdFromListCaches(queryClient, id);
      }
      return { snapshot };
    },
    onSuccess: () => {
      toast.success('Ad deleted successfully');
      syncAdListCaches(queryClient);
    },
    onError: (error, _vars, context) => {
      if (context?.snapshot) {
        for (const [key, data] of context.snapshot) {
          queryClient.setQueryData(key, data);
        }
      }
      handleMutationError(error);
    },
    onSettled: () => {
      invalidateSwrQueries();
    },
  });
}

// ─── Pause Ad ──────────────────────────────────────────────────────
export function usePauseAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adId: number) => adsApi.pause(adId),
    onMutate: async (adId) => {
      await queryClient.cancelQueries({ queryKey: adKeys.all });
      const snapshot = queryClient.getQueriesData({ queryKey: adKeys.all });
      updateAdInListCaches(queryClient, adId, { status: 'paused' });
      return { snapshot };
    },
    onSuccess: () => {
      toast.success('Ad paused successfully');
      syncAdListCaches(queryClient);
    },
    onError: (error, _adId, context) => {
      if (context?.snapshot) {
        for (const [key, data] of context.snapshot) {
          queryClient.setQueryData(key, data);
        }
      }
      handleMutationError(error);
    },
    onSettled: () => {
      invalidateSwrQueries();
    },
  });
}

// ─── Reactivate Ad ─────────────────────────────────────────────────
export function useReactivateAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adId: number) => adsApi.reactivate(adId),
    onMutate: async (adId) => {
      await queryClient.cancelQueries({ queryKey: adKeys.all });
      const snapshot = queryClient.getQueriesData({ queryKey: adKeys.all });
      updateAdInListCaches(queryClient, adId, { status: 'active' });
      return { snapshot };
    },
    onSuccess: () => {
      toast.success('Ad reactivated successfully');
      syncAdListCaches(queryClient);
    },
    onError: (error, _adId, context) => {
      if (context?.snapshot) {
        for (const [key, data] of context.snapshot) {
          queryClient.setQueryData(key, data);
        }
      }
      handleMutationError(error);
    },
    onSettled: () => {
      invalidateSwrQueries();
    },
  });
}

// ─── Renew Ad ──────────────────────────────────────────────────────
export function useRenewAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adId: number) => adsApi.renew(adId),
    onMutate: async (adId) => {
      await queryClient.cancelQueries({ queryKey: adKeys.all });
      const snapshot = queryClient.getQueriesData({ queryKey: adKeys.all });
      updateAdInListCaches(queryClient, adId, { status: 'pending' });
      return { snapshot };
    },
    onSuccess: () => {
      toast.success('Ad submitted for re-approval');
      syncAdListCaches(queryClient);
    },
    onError: (error, _adId, context) => {
      if (context?.snapshot) {
        for (const [key, data] of context.snapshot) {
          queryClient.setQueryData(key, data);
        }
      }
      handleMutationError(error);
    },
    onSettled: () => {
      invalidateSwrQueries();
    },
  });
}

// ─── Create Ad ─────────────────────────────────────────────────────
export function useCreateAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => adsApi.create(formData),
    onSuccess: (res) => {
      toast.success('Ad created successfully');
      syncAllCaches(queryClient);
      queryClient.invalidateQueries({ queryKey: adKeys.user(0) });
      queryClient.invalidateQueries({ queryKey: adKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: adKeys.admin() });
      invalidateSwrCache('my-ads');
      invalidateSwrCache('dashboard');
      invalidateSwrCache(/^secure-control-9ja/);
      invalidateSwrCache('homepage_data');
      invalidateSwrCache('boosted_ads_listing');
      broadcastCacheInvalidation();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ilist:cache-invalidate'));
        window.dispatchEvent(new CustomEvent('ilist:ad-created', { detail: { ad: res?.data } }));
      }
      return res;
    },
    onError: (error) => {
      handleMutationError(error);
    },
  });
}

// ─── Update Ad ─────────────────────────────────────────────────────
export function useUpdateAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      adsApi.update(id, formData),
    onSuccess: (res, { id }) => {
      toast.success('Ad updated successfully');
      syncAllCaches(queryClient);
    },
    onError: (error) => {
      handleMutationError(error);
    },
  });
}

// ─── Admin Actions ─────────────────────────────────────────────────

export function useAdminApproveAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adId: number) => adminApi.approveAd(adId),
    onMutate: async (adId) => {
      await queryClient.cancelQueries({ queryKey: adKeys.all });
      const snapshot = queryClient.getQueriesData({ queryKey: adKeys.all });
      updateAdInListCaches(queryClient, adId, { status: 'active', admin_status: 'approved' });
      return { snapshot };
    },
    onSuccess: () => {
      toast.success('Ad approved');
      syncAllCaches(queryClient);
    },
    onError: (error, _adId, context) => {
      if (context?.snapshot) {
        for (const [key, data] of context.snapshot) {
          queryClient.setQueryData(key, data);
        }
      }
      handleMutationError(error);
    },
    onSettled: () => {
      syncAdminCaches(queryClient);
      invalidateSwrQueries();
    },
  });
}

export function useAdminRejectAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adId: number) => adminApi.rejectAd(adId),
    onMutate: async (adId) => {
      await queryClient.cancelQueries({ queryKey: adKeys.all });
      const snapshot = queryClient.getQueriesData({ queryKey: adKeys.all });
      updateAdInListCaches(queryClient, adId, { status: 'rejected', admin_status: 'rejected' });
      return { snapshot };
    },
    onSuccess: () => {
      toast.success('Ad rejected');
      syncAllCaches(queryClient);
    },
    onError: (error, _adId, context) => {
      if (context?.snapshot) {
        for (const [key, data] of context.snapshot) {
          queryClient.setQueryData(key, data);
        }
      }
      handleMutationError(error);
    },
    onSettled: () => {
      syncAdminCaches(queryClient);
      invalidateSwrQueries();
    },
  });
}

export function useAdminDeleteAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adId: number) => adminApi.deleteAd(adId),
    onMutate: async (adId) => {
      await queryClient.cancelQueries({ queryKey: adKeys.all });
      const snapshot = queryClient.getQueriesData({ queryKey: adKeys.all });
      removeAdFromListCaches(queryClient, adId);
      return { snapshot };
    },
    onSuccess: () => {
      toast.success('Ad deleted');
      syncAllCaches(queryClient);
    },
    onError: (error, _adId, context) => {
      if (context?.snapshot) {
        for (const [key, data] of context.snapshot) {
          queryClient.setQueryData(key, data);
        }
      }
      handleMutationError(error);
    },
    onSettled: () => {
      syncAdminCaches(queryClient);
      invalidateSwrQueries();
    },
  });
}

export function useAdminFeatureAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adId: number) => adminApi.featureAd(adId),
    onSuccess: () => {
      toast.success('Ad featured');
      syncAllCaches(queryClient);
    },
    onError: (error) => {
      handleMutationError(error);
    },
    onSettled: () => {
      syncAdminCaches(queryClient);
      invalidateSwrQueries();
    },
  });
}

export function useAdminPromoteAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adId: number) => adminApi.promoteAd(adId),
    onSuccess: () => {
      toast.success('Ad promoted');
      syncAllCaches(queryClient);
    },
    onError: (error) => {
      handleMutationError(error);
    },
    onSettled: () => {
      syncAdminCaches(queryClient);
      invalidateSwrQueries();
    },
  });
}

export function useAdminUpdateAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminApi.updateAd(id, data),
    onSuccess: () => {
      toast.success('Ad updated');
      syncAllCaches(queryClient);
    },
    onError: (error) => {
      handleMutationError(error);
    },
    onSettled: () => {
      syncAdminCaches(queryClient);
      invalidateSwrQueries();
    },
  });
}

// ─── User Boost Ad ─────────────────────────────────────────────────
export function useBoostAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ adId, boost_type, duration_days }: { adId: number; boost_type: string; duration_days: number }) =>
      growthApi.boostAd(adId, { boost_type, duration_days }),
    onMutate: async ({ adId, boost_type }) => {
      await queryClient.cancelQueries({ queryKey: adKeys.all });
      const snapshot = queryClient.getQueriesData({ queryKey: adKeys.all });
      updateAdInListCaches(queryClient, adId, { is_boosted: true, boost_type, boost_status: 'active' });
      return { snapshot };
    },
    onSuccess: () => {
      toast.success('Ad boosted');
      syncAllCaches(queryClient);
      syncAdListCaches(queryClient);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['boost', 'status'] });
    },
    onError: (error, _vars, context) => {
      if (context?.snapshot) {
        for (const [key, data] of context.snapshot) {
          queryClient.setQueryData(key, data);
        }
      }
      handleMutationError(error);
    },
    onSettled: () => {
      invalidateSwrExact('boosted_ads_listing');
      invalidateSwrCache('homepage_data');
      invalidateSwrCache(/^ads/);
      invalidateSwrCache(/^search/);
      invalidateSwrCache('search/trending');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ilist:cache-invalidate'));
        window.dispatchEvent(new CustomEvent('ilist:boost-activated'));
      }
    },
  });
}

// ─── Combined hook for convenience ─────────────────────────────────
export function useAdMutations() {
  return {
    closeAd: useCloseAd(),
    deleteAd: useDeleteAd(),
    pauseAd: usePauseAd(),
    reactivateAd: useReactivateAd(),
    renewAd: useRenewAd(),
    createAd: useCreateAd(),
    updateAd: useUpdateAd(),
    approveAd: useAdminApproveAd(),
    rejectAd: useAdminRejectAd(),
    deleteAdAdmin: useAdminDeleteAd(),
    featureAd: useAdminFeatureAd(),
    promoteAd: useAdminPromoteAd(),
    updateAdAdmin: useAdminUpdateAd(),
    boostAd: useBoostAd(),
  };
}
