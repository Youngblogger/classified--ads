import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getCookie, setCookie, deleteCookie, getAuthToken } from '@/lib/cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Accept': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      // Try multiple ways to get the token
      let token = getAuthToken();
      
      if (!token) {
        // Try direct cookie access
        token = getCookie('token');
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Only prevent caching for authenticated POST/PUT/PATCH/DELETE requests
      if (token && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
        config.headers['Cache-Control'] = 'no-cache';
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const url = error.config?.url || '';
          if (!url.startsWith('/auth/login') && !url.startsWith('/admin')) {
            deleteCookie('token');
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          }
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
    const token = getAuthToken() || getCookie('token');
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
  update: (id: number, data: FormData) => api.post(`/ads/${id}`, data),
  delete: (id: number) => api.delete(`/ads/${id}`),
  incrementViews: (id: number) => api.post(`/ads/${id}/views`),
  getMyAds: (params?: Record<string, any>) => api.get('/my-ads', { params }),
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
    formData.append('content', 'Voice message');
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
    return api.post('/messages', formData);
  },
  startConversation: (adId: number, content: string) => 
    api.post('/messages/start', { ad_id: adId, content }),
  markAsRead: (conversationId: number) => api.post(`/messages/${conversationId}/read`),
  deleteMessage: (messageId: number) => api.delete(`/messages/message/${messageId}`),
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

// Admin API
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Users
  getUsers: (params?: Record<string, any>) => api.get('/admin/users', { params }),
  suspendUser: (id: number) => api.post(`/admin/users/${id}/suspend`),
  banUser: (id: number, reason: string) => api.post(`/admin/users/${id}/ban`, { reason }),
  activateUser: (id: number) => api.post(`/admin/users/${id}/activate`),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),

  // Ads
  getAds: (params?: Record<string, any>) => api.get('/admin/ads', { params }),

  // Public ads
  getPublicAds: (params?: Record<string, any>) => api.get('/ads', { params }),
  approveAd: (id: number) => api.post(`/admin/ads/${id}/approve`),
  rejectAd: (id: number) => api.post(`/admin/ads/${id}/reject`),
  verifyAd: (id: number) => api.post(`/admin/ads/${id}/verify`),
  featureAd: (id: number) => api.post(`/admin/ads/${id}/feature`),
  promoteAd: (id: number) => api.post(`/admin/ads/${id}/promote`),
  deleteAd: (id: number) => api.delete(`/admin/ads/${id}`),
  bulkDeleteAds: (ids: number[]) => api.post('/admin/ads/bulk-delete', { ids }),
  updateAd: (id: number, data: any) => api.put(`/admin/ads/${id}`, data),

  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data: any) => api.post('/admin/categories', data),
  updateCategory: (id: number, data: any) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`),

  // Reports
  getReports: (params?: Record<string, any>) => api.get('/admin/reports', { params }),
  resolveReport: (id: number) => api.post(`/admin/reports/${id}/resolve`),
  dismissReport: (id: number) => api.post(`/admin/reports/${id}/dismiss`),

  // Payments
  getPayments: (params?: Record<string, any>) => api.get('/admin/payments', { params }),
  getPaymentStats: () => api.get('/admin/payment-stats'),
  getFinancialSummary: () => api.get('/admin/financial-summary'),
  approvePayment: (id: number) => api.post(`/admin/payments/${id}/approve`),
  rejectPayment: (id: number) => api.post(`/admin/payments/${id}/reject`),

  // Admin Wallet
  getAdminWallet: () => api.get('/admin/wallet'),
  creditUser: (userId: number, amount: number, description: string) =>
    api.post('/admin/wallets/credit', { user_id: userId, amount, description }),
  debitUser: (userId: number, amount: number, description: string) =>
    api.post('/admin/wallets/debit', { user_id: userId, amount, description }),
  adminWithdraw: (amount: number, bankName: string, accountNumber: string, accountName: string, description?: string) =>
    api.post('/admin/withdraw', { amount, bank_name: bankName, account_number: accountNumber, account_name: accountName, description }),
  getTransactions: (params?: Record<string, any>) => api.get('/admin/transactions', { params }),

  // Wallets
  getWallets: (params?: Record<string, any>) => api.get('/admin/wallets', { params }),
  creditWallet: (id: number, amount: number, description: string) => 
    api.post(`/admin/wallets/${id}/credit`, { amount, description }),
  debitWallet: (id: number, amount: number, description: string) => 
    api.post(`/admin/wallets/${id}/debit`, { amount, description }),

  // Promotions
  getPromotions: () => api.get('/admin/promotions'),
  createPromotion: (data: any) => api.post('/admin/promotions', data),
  updatePromotion: (id: number, data: any) => api.put(`/admin/promotions/${id}`, data),
  deletePromotion: (id: number) => api.delete(`/admin/promotions/${id}`),

  // Promotion Plans
  getPromotionPlans: () => api.get('/admin/promotion-plans'),
  createPromotionPlan: (data: any) => api.post('/admin/promotion-plans', data),
  updatePromotionPlan: (id: number, data: any) => api.put(`/admin/promotion-plans/${id}`, data),
  deletePromotionPlan: (id: number) => api.delete(`/admin/promotion-plans/${id}`),

  // Banners
  getBanners: () => api.get('/admin/banners'),
  createBanner: (data: FormData) => api.upload('/admin/banners', data),
  updateBanner: (id: number, data: FormData) => api.post(`/admin/banners/${id}`, data),
  deleteBanner: (id: number) => api.delete(`/admin/banners/${id}`),

  // Broadcasts
  getBroadcasts: (params?: Record<string, any>) => api.get('/admin/broadcasts', { params }),
  getBroadcast: (id: number) => api.get(`/admin/broadcasts/${id}`),
  createBroadcast: (data: { title: string; message: string; recipient_type: string }) => 
    api.post('/admin/broadcast', data),
  resendBroadcast: (id: number) => api.post(`/admin/broadcasts/${id}/resend`),
  deleteBroadcast: (id: number) => api.delete(`/admin/broadcasts/${id}`),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: any) => api.put('/admin/settings', data),

  // Watermark
  getWatermarkSettings: () => api.get('/admin/watermark'),
  updateWatermarkSettings: (data: any) => api.put('/admin/watermark', data),
  uploadWatermarkLogo: (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.upload('/admin/watermark/logo', formData);
  },

  // Fonts
  getFonts: () => api.get('/admin/fonts'),
  uploadFont: (file: File, name: string) => {
    const formData = new FormData();
    formData.append('font', file);
    formData.append('name', name);
    return api.post('/admin/fonts', formData);
  },
  deleteFont: (id: number) => api.delete(`/admin/fonts/${id}`),
  setDefaultFont: (id: number) => api.post(`/admin/fonts/${id}/default`),

  // Ad Images
  addAdImages: (adId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images[]', file));
    return api.upload(`/ads/${adId}/images`, formData);
  },
  updateAdImage: (adId: number, imageId: number, data: { is_primary?: boolean; sort_order?: number }) =>
    api.put(`/ads/${adId}/images/${imageId}`, data),
  deleteAdImage: (adId: number, imageId: number) => api.delete(`/ads/${adId}/images/${imageId}`),

  // Analytics
  getAnalytics: (params?: Record<string, any>) => api.get('/admin/analytics', { params }),

  // Reviews
  getReviewSummary: (adId: number) => api.get(`/ads/${adId}/reviews/summary`),
  getLatestReviews: (adId: number) => api.get(`/ads/${adId}/reviews/latest`),
  getReviews: (adId: number, params?: Record<string, any>) => api.get(`/ads/${adId}/reviews`, { params }),
  createReview: (adId: number, data: { rating: number; comment?: string }) => 
    api.post(`/ads/${adId}/reviews`, data),
  updateReview: (id: number, data: { rating?: number; comment?: string }) => 
    api.put(`/reviews/${id}`, data),
  deleteReview: (id: number) => api.delete(`/reviews/${id}`),
  markReviewHelpful: (id: number) => api.post(`/reviews/${id}/helpful`),
  reportReview: (id: number, reason: string) => api.post(`/reviews/${id}/report`, { reason }),
};

// Payments API
export const paymentsApi = {
  initialize: (data: { ad_id: number; plan_id: number; method: string }) =>
    api.post('/payments/initialize', data),
  
  verify: (reference: string) => 
    api.post('/payments/verify', { reference }),
  
  getStatus: (reference: string) => 
    api.get(`/payments/status/${reference}`),
  
  resendVirtualAccount: (paymentId: number) => 
    api.post('/payments/resend-virtual-account', { payment_id: paymentId }),
  
  checkBankPayment: (reference: string) => 
    api.post('/payments/check-bank-payment', { reference }),
  
  getMyPayments: () => api.get('/payments/my-payments'),
  
  getPublicKey: () => api.get('/payments/public-key'),
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

// Wallet API additions
export const walletApi = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: () => api.get('/wallet'),
};

export default api;
