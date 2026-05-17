import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getCookie, setCookie, deleteCookie, getUserToken, getAdminToken, getAuthToken } from '@/lib/cookies';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
}

class ApiClient {
    private client: AxiosInstance;
    private csrfFetched: boolean = false;

    constructor() {
      this.client = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 30000,
        withCredentials: true,
      });

      // Fetch CSRF cookie lazily — first POST request will trigger it
      this.csrfFetched = false;

      // Setup request interceptor
      this.client.interceptors.request.use((config) => {
        const token = getUserToken();
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (token && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
          config.headers['Cache-Control'] = 'no-cache';
        }
        return config;
      });

      // Setup response interceptor
      this.client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
          const axiosError = error as AxiosError<{ message?: string; success?: boolean; errors?: any }>;
          
          // Rate limiting - show toast on 429
          if (axiosError.response?.status === 429) {
            const data = axiosError.response?.data as any;
            const msg = data?.message || 'Too many requests. Please slow down.';
            toast.error(msg);
            return Promise.reject(error);
          }
          
          // Retry logic for 5xx errors (server errors)
          const config = axiosError.config as any;
          if (
            axiosError.response?.status &&
            axiosError.response.status >= 500 &&
            axiosError.response.status < 600 &&
            config &&
            !config._retryCount
          ) {
            config._retryCount = (config._retryCount || 0) + 1;
            const maxRetries = 2;
            if (config._retryCount <= maxRetries) {
              const delay = config._retryCount * 1000;
              await new Promise(resolve => setTimeout(resolve, delay));
              return this.client(config);
            }
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.error('[API Error]', {
              url: axiosError.config?.url,
              method: axiosError.config?.method,
              status: axiosError.response?.status,
              data: axiosError.response?.data,
              message: axiosError.message,
            });
          }
          
          if (axiosError.response?.status === 401) {
            deleteCookie('token');
            
            if (typeof window !== 'undefined') {
              const isAlreadyRedirecting = (window as any).__userAuthRedirecting;
              if (!isAlreadyRedirecting) {
                (window as any).__userAuthRedirecting = true;
                setTimeout(() => {
                  window.location.href = '/login';
                }, 500);
              }
            }
          }
          
          if (axiosError.code === 'ECONNABORTED') {
            if (process.env.NODE_ENV === 'development') {
              console.error('[API] Request timeout');
            }
            toast.error('Request timed out. Please try again.');
          }
          
          if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
            if (process.env.NODE_ENV === 'development') {
              console.error('[API] Network error - backend may not be running');
            }
            toast.error('Cannot connect to server. Please ensure the backend is running.');
          }
          
          return Promise.reject(error);
        }
      );
    }

    private async fetchCsrfToken(): Promise<void> {
      if (this.csrfFetched) return;
      
      try {
        await axios.get(`${API_BASE_URL.replace('/api', '')}/sanctum/csrf-cookie`, {
          withCredentials: true,
        });
        this.csrfFetched = true;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[API] Failed to fetch CSRF token:', error);
        }
      }
    }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  async upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<AxiosResponse<T>> {
    const token = getUserToken();
    return this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }
}

export const api = new ApiClient();

// Admin API Client - completely separate from user ApiClient
// Uses admin_token cookie instead of user token
class AdminApiClient {
    private client: AxiosInstance;

    constructor() {
      this.client = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 30000,
        withCredentials: true,
      });

      this.client.interceptors.request.use((config) => {
        const token = getAdminToken();
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (token && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
          config.headers['Cache-Control'] = 'no-cache';
        }
        return config;
      });

      this.client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
          const axiosError = error as AxiosError<{ message?: string; success?: boolean; errors?: any }>;
          
          if (axiosError.response?.status === 429) {
            const data = axiosError.response?.data as any;
            const msg = data?.message || 'Too many requests. Please slow down.';
            toast.error(msg);
            return Promise.reject(error);
          }

          const config = axiosError.config as any;
          if (
            axiosError.response?.status &&
            axiosError.response.status >= 500 &&
            axiosError.response.status < 600 &&
            config &&
            !config._retryCount
          ) {
            config._retryCount = (config._retryCount || 0) + 1;
            const maxRetries = 2;
            if (config._retryCount <= maxRetries) {
              const delay = config._retryCount * 1000;
              await new Promise(resolve => setTimeout(resolve, delay));
              return this.client(config);
            }
          }

          if (process.env.NODE_ENV === 'development') {
            console.error('[Admin API Error]', {
              url: axiosError.config?.url,
              method: axiosError.config?.method,
              status: axiosError.response?.status,
              data: axiosError.response?.data,
              message: axiosError.message,
            });
          }

          if (axiosError.response?.status === 401) {
            deleteCookie('admin_token');

            if (typeof window !== 'undefined') {
              const isAlreadyRedirecting = (window as any).__adminAuthRedirecting;
              if (!isAlreadyRedirecting) {
                (window as any).__adminAuthRedirecting = true;
                setTimeout(() => {
                  window.location.href = '/session-expired?admin=true';
                }, 500);
              }
            }
          }

          if (axiosError.code === 'ECONNABORTED') {
            if (process.env.NODE_ENV === 'development') {
              console.error('[Admin API] Request timeout');
            }
            toast.error('Request timed out. Please try again.');
          }

          if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
            if (process.env.NODE_ENV === 'development') {
              console.error('[Admin API] Network error - backend may not be running');
            }
            toast.error('Cannot connect to server. Please ensure the backend is running.');
          }

          return Promise.reject(error);
        }
      );
    }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  async upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<AxiosResponse<T>> {
    const token = getAdminToken();
    return this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }
}

export const adminApiClient = new AdminApiClient();

// Auth API
export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { login: email, password }),
  
  register: (name: string, email: string, password: string, phone?: string) =>
    api.post('/auth/register', { name, email, password, phone }),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get('/auth/me'),
  
  updateProfile: (data: { name?: string; phone?: string; location?: string; avatar?: File }) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    return api.post('/auth/profile', formData);
  },

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword }),

  setup2FA: () => api.post('/auth/2fa/setup'),
  
  enable2FA: (code: string) => api.post('/auth/2fa/enable', { code }),
  
  disable2FA: (code: string) => api.post('/auth/2fa/disable', { code }),
  
  verify2FA: (code: string) => api.post('/auth/2fa/verify', { code }),

  deleteAccount: (password: string) => api.delete('/auth/account', { data: { password } }),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
  getSubcategories: (parentId: number) => api.get(`/categories/${parentId}/subcategories`),
};

// Locations API
export const locationsApi = {
  getAll: () => api.get('/locations'),
  getById: (id: number) => api.get(`/locations/${id}`),
  getBySlug: (slug: string) => api.get(`/locations/${slug}`),
  getChildren: (parentId: number) => api.get(`/locations/${parentId}/children`),
};

// Ads API
export const adsApi = {
  get: (id: number) => api.get(`/ads/${id}`),
  getAll: (params?: Record<string, any>) => api.get('/ads', { params }),
  getById: (id: number) => api.get(`/ads/${id}`),
  getBySlug: (slug: string) => api.get(`/ads/${slug}`),
  getFeatured: (limit?: number) => api.get('/ads/featured', { params: { limit } }),
  getRecent: (limit?: number) => api.get('/ads/recent', { params: { limit } }),
  getSimilar: (adId: number, limit?: number) => api.get(`/ads/${adId}/similar`, { params: { limit } }),
  create: (data: FormData) => api.upload('/ads', data),
  update: (id: number, data: FormData) => {
    const token = getAuthToken() || getCookie('token');
    return api.post(`/ads/${id}`, data, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  },
  delete: (slug: string) => api.delete(`/ads/${slug}`),
  deleteById: (id: number) => api.delete(`/ads/${id}`),
  incrementViews: (id: number) => api.post(`/ads/${id}/views`),
  getMyAds: (params?: Record<string, any>) => api.get('/my-ads', { params }),
  pause: (id: number) => api.post(`/ads/${id}/pause`),
  reactivate: (id: number) => api.post(`/ads/${id}/reactivate`),
  sold: (id: number) => api.post(`/ads/${id}/sold`),
  renew: (id: number) => api.post(`/ads/${id}/renew`),
};

// Favorites API
export const favoritesApi = {
  getAll: () => api.get('/favorites'),
  add: (adId: number) => api.post('/favorites', { ad_id: adId }),
  remove: (adId: number) => api.delete(`/favorites/${adId}`),
  check: (adId: number) => api.get(`/favorites/check/${adId}`),
};

// Messages API
export const messagesApi = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId: number) => api.get(`/messages/${conversationId}`),
  sendMessage: (conversationId: number, content: string, attachment?: File | Blob, messageType?: string) => {
    const formData = new FormData();
    formData.append('content', content);
    if (attachment) {
      formData.append('attachment', attachment);
      formData.append('message_type', messageType || 'file');
    }
    return api.post(`/messages/${conversationId}`, formData);
  },
  sendVoiceMessage: (conversationId: number, audioBlob: Blob, duration: number, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('content', '');
    formData.append('attachment', audioBlob, `voice_${Date.now()}.webm`);
    formData.append('message_type', 'voice');
    formData.append('duration', duration.toString());
    return api.post(`/messages/${conversationId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },
  sendMessageNew: (receiverId: number, adId: number | null, content: string, messageType?: string, attachment?: File | Blob, duration?: number) => {
    const formData = new FormData();
    formData.append('receiver_id', receiverId.toString());
    if (adId) formData.append('ad_id', adId.toString());
    formData.append('message', content);
    if (messageType) formData.append('message_type', messageType);
    if (attachment) formData.append('attachment', attachment);
    if (duration) formData.append('duration', duration.toString());
    return api.post('/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  startConversation: (adId: number, content: string) => 
    api.post('/messages/start', { ad_id: adId, content }),
  markAsRead: (conversationId: number) => api.post(`/messages/${conversationId}/read`),
  deleteMessage: (messageId: number) => api.delete(`/messages/message/${messageId}`),
};

// Follow API
export const followApi = {
  follow: (followingId: number) => api.post('/follow', { following_id: followingId }),
  unfollow: (followingId: number) => api.delete('/unfollow', { data: { following_id: followingId } }),
  checkFollow: (followingId: number) => api.get('/follow/check', { params: { following_id: followingId } }),
  getFollowers: (userId: number, page = 1) => api.get(`/users/${userId}/followers`, { params: { page } }),
  getFollowing: (userId: number, page = 1) => api.get(`/users/${userId}/following`, { params: { page } }),
  getUserStats: (userId: number) => api.get(`/users/${userId}/stats`),
  getFollowingFeed: (page = 1) => api.get('/feed/following', { params: { page } }),
  getSuggestedSellers: () => api.get('/sellers/suggested'),
};

// Reviews API
export const reviewsApi = {
  getUserReviews: (userId: number) => api.get(`/reviews/user/${userId}`),
  create: (data: { user_id: number; rating: number; comment: string; ad_id?: number }) =>
    api.post('/reviews', data),
  getMyReviews: () => api.get('/reviews/my-reviews'),
  getAdReviews: (adId: number) => api.get(`/ads/${adId}/reviews`),
  getAdReviewSummary: (adId: number) => api.get(`/ads/${adId}/reviews/summary`),
  getAdLatestReviews: (adId: number) => api.get(`/ads/${adId}/reviews/latest`),
};

// Seller Reviews API
export const sellerReviewsApi = {
  getReviews: (sellerId: number, params?: { rating?: number; sort?: string; page?: number }) =>
    api.get(`/sellers/${sellerId}/reviews`, { params }),
  getLatestReviews: (sellerId: number) => api.get(`/sellers/${sellerId}/reviews/latest`),
  getRatingSummary: (sellerId: number) => api.get(`/sellers/${sellerId}/rating`),
  getSellerProfile: (sellerId: number) => api.get(`/sellers/${sellerId}/profile`),
  canReview: (sellerId: number) => api.get(`/sellers/${sellerId}/can-review`),
  getMyReview: (sellerId: number) => api.get(`/sellers/${sellerId}/my-review`),
  submitReview: (sellerId: number, data: { rating: number; comment?: string; ad_id?: number }) =>
    api.post(`/sellers/${sellerId}/reviews`, data),
  updateReview: (reviewId: number, data: { rating: number; comment?: string }) =>
    api.put(`/seller-reviews/${reviewId}`, data),
  deleteReview: (reviewId: number) => api.delete(`/seller-reviews/${reviewId}`),
  markHelpful: (reviewId: number) => api.post(`/seller-reviews/${reviewId}/helpful`),
  reportReview: (reviewId: number, reason: string) => api.post(`/seller-reviews/${reviewId}/report`, { reason }),
};

// Reports API
export const reportsApi = {
  create: (data: { ad_id: number; reason: string; description: string }) =>
    api.post('/reports', data),
  getMyReports: () => api.get('/reports/my-reports'),
};

// Notifications API
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: number) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Banners API
export const bannersApi = {
  getAll: (position?: string) => api.get('/banners', { params: { position } }),
  getActive: (position?: string) => api.get('/banners/active', { params: { position } }),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentAds: () => api.get('/dashboard/recent-ads'),
  getAnalytics: (period?: string) => api.get('/dashboard/analytics', { params: { period } }),
};

// Search API
export const searchApi = {
  search: (params: Record<string, any>) => api.get('/search', { params }),
  suggestions: (keyword: string) => api.get('/search/suggestions', { params: { q: keyword } }),
  trending: () => api.get('/search/trending'),
};

// Admin API - Using stealth route
const STEALTH_PREFIX = '/secure-control-9ja';

export const adminApi = {
  // Dashboard
  getDashboard: () => adminApiClient.get(`${STEALTH_PREFIX}/dashboard`),
  getPaymentStats: () => adminApiClient.get(`${STEALTH_PREFIX}/payments/stats`),
  getPayments: (params?: Record<string, any>) => adminApiClient.get(`${STEALTH_PREFIX}/payments`, { params }),
  getFinancialSummary: () => adminApiClient.get(`${STEALTH_PREFIX}/payments/summary`),
  approvePayment: (id: number) => adminApiClient.post(`${STEALTH_PREFIX}/payments/${id}/approve`),
  rejectPayment: (id: number) => adminApiClient.post(`${STEALTH_PREFIX}/payments/${id}/reject`),

  // Boosts
  getBoosts: (params?: Record<string, any>) => adminApiClient.get(`${STEALTH_PREFIX}/boosts`, { params }),
  getBoostActiveAds: () => adminApiClient.get(`${STEALTH_PREFIX}/boosts/active-ads`),
  deactivateBoost: (id: number) => adminApiClient.post(`${STEALTH_PREFIX}/boosts/${id}/deactivate`),
  extendBoost: (id: number, days: number) => adminApiClient.post(`${STEALTH_PREFIX}/boosts/${id}/extend`, { days }),

  // Users
  getUsers: (params?: Record<string, any>) => adminApiClient.get(`${STEALTH_PREFIX}/users`, { params }),
  suspendUser: (id: number) => adminApiClient.post(`${STEALTH_PREFIX}/users/${id}/suspend`),
  banUser: (id: number, reason: string) => adminApiClient.post(`${STEALTH_PREFIX}/users/${id}/ban`, { reason }),
  activateUser: (id: number) => adminApiClient.post(`${STEALTH_PREFIX}/users/${id}/activate`),
  deleteUser: (id: number) => adminApiClient.delete(`${STEALTH_PREFIX}/users/${id}`),

  // Ads
  getAds: (params?: Record<string, any>) => adminApiClient.get(`${STEALTH_PREFIX}/ads`, { params }),

  // Public ads
  getPublicAds: (params?: Record<string, any>) => adminApiClient.get('/ads', { params }),
  approveAd: (id: number) => adminApiClient.post(`${STEALTH_PREFIX}/ads/${id}/approve`),
  rejectAd: (id: number) => adminApiClient.post(`${STEALTH_PREFIX}/ads/${id}/reject`),
  verifyAd: (id: number) => adminApiClient.post(`${STEALTH_PREFIX}/ads/${id}/verify`),
  featureAd: (id: number) => adminApiClient.post(`${STEALTH_PREFIX}/ads/${id}/feature`),
  promoteAd: (id: number) => adminApiClient.post(`${STEALTH_PREFIX}/ads/${id}/promote`),
  deleteAd: (id: number) => adminApiClient.delete(`${STEALTH_PREFIX}/ads/${id}`),
  bulkDeleteAds: (ids: number[]) => adminApiClient.post(`${STEALTH_PREFIX}/ads/bulk-delete`, { ids }),
  updateAd: (id: number, data: any) => adminApiClient.put(`${STEALTH_PREFIX}/ads/${id}`, data),

  // Categories
  getCategories: () => adminApiClient.get(`${STEALTH_PREFIX}/categories`),
  createCategory: (data: any) => adminApiClient.post(`${STEALTH_PREFIX}/categories`, data),
  updateCategory: (id: number, data: any) => adminApiClient.put(`${STEALTH_PREFIX}/categories/${id}`, data),
  deleteCategory: (id: number) => adminApiClient.delete(`${STEALTH_PREFIX}/categories/${id}`),

  // Reports
  getReports: (params?: Record<string, any>) => adminApiClient.get(`${STEALTH_PREFIX}/reports`, { params }),
  resolveReport: (id: number) => adminApiClient.post(`${STEALTH_PREFIX}/reports/${id}/resolve`),
  dismissReport: (id: number) => adminApiClient.post(`${STEALTH_PREFIX}/reports/${id}/dismiss`),

  // Admin Wallet
  getAdminWallet: () => adminApiClient.get(`${STEALTH_PREFIX}/wallet`),
  creditUser: (userId: number, amount: number, description: string) =>
    adminApiClient.post(`${STEALTH_PREFIX}/wallets/credit`, { user_id: userId, amount, description }),
  debitUser: (userId: number, amount: number, description: string) =>
    adminApiClient.post(`${STEALTH_PREFIX}/wallets/debit`, { user_id: userId, amount, description }),
  adminWithdraw: (amount: number, bankName: string, accountNumber: string, accountName: string, description?: string) =>
    adminApiClient.post(`${STEALTH_PREFIX}/withdraw`, { amount, bank_name: bankName, account_number: accountNumber, account_name: accountName, description }),
  getTransactions: (params?: Record<string, any>) => adminApiClient.get(`${STEALTH_PREFIX}/transactions`, { params }),

  // Wallets
  getWallets: (params?: Record<string, any>) => adminApiClient.get(`${STEALTH_PREFIX}/wallets`, { params }),
  creditWallet: (id: number, amount: number, description: string) => 
    adminApiClient.post(`${STEALTH_PREFIX}/wallets/${id}/credit`, { amount, description }),
  debitWallet: (id: number, amount: number, description: string) => 
    adminApiClient.post(`${STEALTH_PREFIX}/wallets/${id}/debit`, { amount, description }),

  // Promotions
  getPromotions: () => adminApiClient.get(`${STEALTH_PREFIX}/promotions`),
  createPromotion: (data: any) => adminApiClient.post(`${STEALTH_PREFIX}/promotions`, data),
  updatePromotion: (id: number, data: any) => adminApiClient.put(`${STEALTH_PREFIX}/promotions/${id}`, data),
  deletePromotion: (id: number) => adminApiClient.delete(`${STEALTH_PREFIX}/promotions/${id}`),

  // Promotion Plans
  getPromotionPlans: () => adminApiClient.get(`${STEALTH_PREFIX}/promotion-plans`),
  createPromotionPlan: (data: any) => adminApiClient.post(`${STEALTH_PREFIX}/promotion-plans`, data),
  updatePromotionPlan: (id: number, data: any) => adminApiClient.put(`${STEALTH_PREFIX}/promotion-plans/${id}`, data),
  deletePromotionPlan: (id: number) => adminApiClient.delete(`${STEALTH_PREFIX}/promotion-plans/${id}`),

  // Banners
  getBanners: () => adminApiClient.get(`${STEALTH_PREFIX}/banners`),
  createBanner: (data: FormData) => adminApiClient.upload(`${STEALTH_PREFIX}/banners`, data),
  updateBanner: (id: number, data: FormData) => adminApiClient.post(`${STEALTH_PREFIX}/banners/${id}`, data),
  deleteBanner: (id: number) => adminApiClient.delete(`${STEALTH_PREFIX}/banners/${id}`),

  // Broadcasts
  getBroadcasts: (params?: Record<string, any>) => adminApiClient.get(`${STEALTH_PREFIX}/broadcasts`, { params }),
  getBroadcast: (id: number) => adminApiClient.get(`${STEALTH_PREFIX}/broadcasts/${id}`),
  createBroadcast: (data: { title: string; message: string; recipient_type: string }) => 
    adminApiClient.post(`${STEALTH_PREFIX}/broadcast`, data),
  resendBroadcast: (id: number) => adminApiClient.post(`${STEALTH_PREFIX}/broadcasts/${id}/resend`),
  deleteBroadcast: (id: number) => adminApiClient.delete(`${STEALTH_PREFIX}/broadcasts/${id}`),

  // Settings
  getSettings: () => adminApiClient.get(`${STEALTH_PREFIX}/settings`),
  updateSettings: (data: any) => adminApiClient.put(`${STEALTH_PREFIX}/settings`, data),

  // Watermark
  getWatermarkSettings: () => adminApiClient.get(`${STEALTH_PREFIX}/watermark`),
  updateWatermarkSettings: (data: any) => adminApiClient.put(`${STEALTH_PREFIX}/watermark`, data),
  uploadWatermarkLogo: (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return adminApiClient.upload(`${STEALTH_PREFIX}/watermark/logo`, formData);
  },

  // Category Fields
  getCategoryFields: (params?: Record<string, any>) => adminApiClient.get('/category-fields', { params }),
  createCategoryField: (categoryId: number, data: any) => adminApiClient.post('/category-fields', { ...data, category_id: categoryId }),
  updateCategoryField: (id: number, data: any) => adminApiClient.put(`/category-fields/${id}`, data),
  deleteCategoryField: (id: number) => adminApiClient.delete(`/category-fields/${id}`),

  // Fonts
  getFonts: () => adminApiClient.get(`${STEALTH_PREFIX}/fonts`),
  uploadFont: (file: File, name: string) => {
    const formData = new FormData();
    formData.append('font', file);
    formData.append('name', name);
    return adminApiClient.post(`${STEALTH_PREFIX}/fonts`, formData);
  },
  deleteFont: (id: number) => adminApiClient.delete(`${STEALTH_PREFIX}/fonts/${id}`),
  setDefaultFont: (id: number) => adminApiClient.post(`${STEALTH_PREFIX}/fonts/${id}/default`),

  // Ad Images
  addAdImages: (adId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images[]', file));
    return adminApiClient.upload(`${STEALTH_PREFIX}/ad/${adId}/images`, formData);
  },
  updateAdImage: (adId: number, imageId: number, data: { is_primary?: boolean; sort_order?: number }) =>
    adminApiClient.put(`${STEALTH_PREFIX}/ad/${adId}/images/${imageId}`, data),
  deleteAdImage: (adId: number, imageId: number) => adminApiClient.delete(`${STEALTH_PREFIX}/ad/${adId}/images/${imageId}`),

  // Analytics
  getAnalytics: (params?: Record<string, any>) => adminApiClient.get(`${STEALTH_PREFIX}/analytics`, { params }),
  getStatesAnalytics: (params?: Record<string, any>) => adminApiClient.get('/admin/analytics/states', { params }),

  // Reviews
  getReviewSummary: (adId: number) => adminApiClient.get(`/ads/${adId}/reviews/summary`),
  getLatestReviews: (adId: number) => adminApiClient.get(`/ads/${adId}/reviews/latest`),
  getReviews: (adId: number, params?: Record<string, any>) => adminApiClient.get(`/ads/${adId}/reviews`, { params }),
  createReview: (adId: number, data: { rating: number; comment?: string }) => 
    adminApiClient.post(`/ads/${adId}/reviews`, data),
  updateReview: (id: number, data: { rating?: number; comment?: string }) => 
    adminApiClient.put(`/reviews/${id}`, data),
  deleteReview: (id: number) => adminApiClient.delete(`/reviews/${id}`),
  markReviewHelpful: (id: number) => adminApiClient.post(`/reviews/${id}/helpful`),
  reportReview: (id: number, reason: string) => adminApiClient.post(`/reviews/${id}/report`, { reason }),
};

// Promotions API
export const promotionsApi = {
  getPlans: () => api.get('/promotions/plans'),
  
  buy: (data: { ad_id: number; plan_id: number; payment_method: string }) =>
    api.post('/promotions/buy', data),
  
  verifyPayment: (reference: string) => 
    api.post('/promotions/verify', { reference }),
  
  getMyPromotions: () => api.get('/promotions/my-promotions'),
  
  getAdPromotions: (adId: number) => api.get(`/promotions/ad/${adId}`),
  
  cancel: (promotionId: number) => 
    api.post('/promotions/cancel', { promotion_id: promotionId }),
};

// Wallet API
export const walletApi = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: () => api.get('/wallet'),
  fundWallet: (amount: number, method: string) => 
    api.post('/wallet/fund', { amount, method }),
  verifyPayment: (reference: string) => 
    api.post('/wallet/verify', { reference }),
  checkBalance: (amount: number) => 
    api.post('/wallet/check-balance', { amount }),
  uploadBankProof: (reference: string, proof: File) => {
    const formData = new FormData();
    formData.append('reference', reference);
    formData.append('proof', proof);
    return api.post('/wallet/bank-transfer-proof', formData);
  },
};

// Growth & Boost API
export const growthApi = {
  getBoostPrices: () => api.get('/ads/boost-prices'),
  myBoosts: () => api.get('/my-boosts'),
  boostAd: (adId: number, data: { boost_type: string; duration_days: number }) =>
    api.post(`/ads/${adId}/boost`, data),
  getBoostStatus: (adId: number) => api.get(`/ads/${adId}/boost-status`),
  saveAd: (adId: number) => api.post(`/ads/${adId}/save`),
  unsaveAd: (adId: number) => api.delete(`/ads/${adId}/unsave`),
  checkSavedStatus: (adId: number) => api.get(`/ads/${adId}/saved-check`),
  getSavedAds: (params?: { limit?: number; page?: number }) => api.get('/user/saved-ads', { params }),
  getShareLink: (adId: number) => api.get(`/ads/${adId}/share-link`),
  getRecentlyViewed: (params?: { limit?: number }) => api.get('/user/recently-viewed', { params }),
  clearRecentlyViewed: () => api.delete('/user/recently-viewed'),
};

// Payment API
export const paymentApi = {
  verifyPayment: (reference: string) => api.post('/payments/verify', { reference }),
  getPaystackPublicKey: () => api.get('/payments/config'),
  getPendingPayments: () => api.get('/payments/pending'),
  cancelPayment: (paymentIntentId: number) => api.post(`/payments/${paymentIntentId}/cancel`),
};

// Admin Bank Transfers API
export const adminBankTransfersApi = {
  getTransfers: (status?: string) => api.get('/admin/bank-transfers', { params: { status } }),
  getStats: () => api.get('/admin/bank-transfers/stats'),
  approve: (id: number) => api.post(`/admin/bank-transfers/${id}/approve`),
  reject: (id: number, note?: string) => api.post(`/admin/bank-transfers/${id}/reject`, { note }),
};

export default api;
