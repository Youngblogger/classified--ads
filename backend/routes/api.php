<?php

use App\Http\Controllers\Api\AdController;
use App\Http\Controllers\Api\AdImageController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuthOtpController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\BroadcastController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CategoryFieldController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\FontController;
use App\Http\Controllers\Api\IconController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SellerReviewController;
use App\Http\Controllers\Api\WatermarkController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\PaymentWebhookController;
use App\Http\Controllers\Api\PaymentVerificationController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\CreditController;
use App\Http\Controllers\Api\SocialPostController;
use App\Http\Controllers\Api\SocialSettingsController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Middleware\AdminRateLimiter;
use App\Http\Middleware\SecureAdminAuth;
use App\Http\Controllers\Api\CloudinaryController;
use App\Http\Controllers\Api\AdModerationController;
use App\Http\Controllers\Api\GrowthController;
use App\Http\Controllers\Api\AdminAnalyticsController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/validate-referral-code', [ReferralController::class, 'validateCode']);
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::match(['get', 'post'], '/google', [AuthController::class, 'google']);
    Route::match(['get', 'post'], '/facebook', [AuthController::class, 'facebook']);

    // OTP Verification routes
    Route::post('/register-otp', [AuthOtpController::class, 'register']);
    Route::post('/verify-otp', [AuthOtpController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthOtpController::class, 'resendOtp']);
    Route::get('/check-otp-status', [AuthOtpController::class, 'checkStatus']);
});

// =====================================================
// STEALTH ADMIN ROUTES - Enterprise Security Enhanced
// Access via /secure-control-9ja/* instead of /admin/*
// =====================================================

// Admin Authentication Routes - Stealth Path
// IP restriction + Rate limiting applied
Route::prefix('secure-control-9ja')->middleware([\App\Http\Middleware\AdminIpRestriction::class])->group(function () {
    Route::post('/auth/login', [AdminAuthController::class, 'login'])
        ->middleware(AdminRateLimiter::class);
});

// Protected Admin Routes - Stealth Path
// Full security: Auth + Admin Role + IP Restriction
Route::prefix('secure-control-9ja')->middleware([\App\Http\Middleware\SecureAdminAuth::class, \App\Http\Middleware\AdminIpRestriction::class])->group(function () {
    // Auth management
    Route::post('/auth/logout', [AdminAuthController::class, 'logout']);
    Route::get('/auth/me', [AdminAuthController::class, 'me']);
    Route::post('/auth/refresh', [AdminAuthController::class, 'refresh']);
    Route::get('/auth/activity-logs', [AdminAuthController::class, 'activityLogs']);
    Route::get('/auth/suspicious-activity', [AdminAuthController::class, 'suspiciousActivity']);
    
    // Admin dashboard & management
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/notifications', [AdminController::class, 'notifications']);
    Route::put('/notifications/{id}/read', [AdminController::class, 'markNotificationRead']);
    
    // Ads management
    Route::get('/ads', [AdminController::class, 'ads']);
    Route::get('/ads/flagged', [AdminController::class, 'flaggedAds']);
    Route::get('/ad/{id}', [AdminController::class, 'getAd']);
    Route::put('/ad/{id}', [AdminController::class, 'updateAd']);
    Route::post('/ads/{id}/approve', [AdminController::class, 'approveAd']);
    Route::post('/ads/{id}/reject', [AdminController::class, 'rejectAd']);
    Route::post('/ads/{id}/verify', [AdminController::class, 'verifyAd']);
    Route::post('/ads/{id}/feature', [AdminController::class, 'featureAd']);
    Route::post('/ads/{id}/promote', [AdminController::class, 'promoteAd']);
    Route::post('/ads/{id}/reprocess', [AdminController::class, 'reprocessAd']);
    Route::delete('/ads/{id}', [AdminController::class, 'deleteAd']);
    Route::post('/ads/bulk-delete', [AdminController::class, 'bulkDeleteAds']);
    
    // Ad Image Management
    Route::post('/ad/{id}/images', [AdminController::class, 'uploadImages']);
    Route::put('/ad/{id}/images/order', [AdminController::class, 'updateImageOrder']);
    Route::delete('/ad/{id}/image/{imageId}', [AdminController::class, 'deleteImage']);
    
    // Ad Moderation
    Route::get('/ads/moderation', [AdModerationController::class, 'index']);
    Route::get('/ads/moderation/stats', [AdModerationController::class, 'stats']);
    Route::post('/ads/moderation/analyze', [AdModerationController::class, 'analyzeAll']);
    Route::post('/ads/moderation/fix-all', [AdModerationController::class, 'fixAllFlagged']);
    Route::post('/ads/moderation/bulk-fix', [AdModerationController::class, 'fixBulk']);
    Route::get('/ads/moderation/logs', [AdModerationController::class, 'logs']);
    Route::get('/ads-moderation/{id}', [AdModerationController::class, 'analyze']);
    Route::post('/ads-moderation/{id}/fix', [AdModerationController::class, 'fix']);
    Route::post('/ads/{id}/delete-images', [AdModerationController::class, 'deleteImages']);
    Route::post('/ads/{id}/replace-images', [AdModerationController::class, 'replaceImages']);
    
    // Users management
    Route::get('/users', [AdminController::class, 'users']);
    Route::put('/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    Route::post('/users/{id}/suspend', [AdminController::class, 'suspendUser']);
    Route::post('/users/{id}/ban', [AdminController::class, 'banUser']);
    Route::post('/users/{id}/activate', [AdminController::class, 'activateUser']);
    
    // Categories
    Route::get('/categories', [AdminController::class, 'categories']);
    Route::post('/categories', [AdminController::class, 'createCategory']);
    Route::put('/categories/{id}', [AdminController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [AdminController::class, 'deleteCategory']);
    
    // Locations
    Route::get('/locations', [AdminController::class, 'locations']);
    Route::post('/locations', [AdminController::class, 'createLocation']);
    Route::put('/locations/{id}', [AdminController::class, 'updateLocation']);
    Route::delete('/locations/{id}', [AdminController::class, 'deleteLocation']);
    
    // Reports
    Route::get('/reports', [AdminController::class, 'reports']);
    Route::post('/reports/{id}/resolve', [AdminController::class, 'resolveReport']);
    
    // Analytics
    Route::get('/analytics', [AdminController::class, 'analytics']);
    Route::get('/analytics/states', [AdminController::class, 'statesAnalytics']);
    
    // Messages
    Route::get('/messages', [AdminController::class, 'messages']);
    Route::get('/broadcasts', [BroadcastController::class, 'index']);
    Route::post('/broadcast', [AdminController::class, 'broadcast']);
    
    // Settings
    Route::get('/settings', [AdminController::class, 'settings']);
    Route::put('/settings', [AdminController::class, 'updateSettings']);
    Route::get('/watermark', [WatermarkController::class, 'index']);
    Route::put('/watermark', [WatermarkController::class, 'update']);
    Route::post('/watermark/logo', [WatermarkController::class, 'uploadLogo']);
    Route::get('/fonts', [FontController::class, 'index']);
    Route::post('/fonts', [FontController::class, 'store']);
    Route::delete('/fonts/{id}', [FontController::class, 'destroy']);
    Route::post('/fonts/{id}/default', [FontController::class, 'setDefault']);
    
    // Bank Transfers
    Route::get('/bank-transfers', [AdminController::class, 'bankTransfers']);
    Route::get('/bank-transfers/stats', [AdminController::class, 'getBankTransferStats']);
    Route::post('/bank-transfers/{id}/approve', [AdminController::class, 'approveBankTransfer']);
    Route::post('/bank-transfers/{id}/reject', [AdminController::class, 'rejectBankTransfer']);
    
    // Banners
    Route::get('/banners', [BannerController::class, 'index']);
    Route::post('/banners', [BannerController::class, 'store']);
    Route::put('/banners/{id}', [BannerController::class, 'update']);
    Route::delete('/banners/{id}', [BannerController::class, 'destroy']);
    Route::post('/banners/reorder', [BannerController::class, 'reorder']);
    
    // Social Media
    Route::post('/social/post-ad', [SocialPostController::class, 'postAd']);
    Route::post('/social/post-ads-batch', [SocialPostController::class, 'postAdsBatch']);
    Route::get('/social/posts', [SocialPostController::class, 'index']);
    Route::get('/social/scheduled', [SocialPostController::class, 'scheduled']);
    Route::post('/social/retry/{id}', [SocialPostController::class, 'retry']);
    Route::post('/social/cancel/{id}', [SocialPostController::class, 'cancel']);
    Route::get('/social/stats', [SocialPostController::class, 'stats']);
    Route::get('/social/settings', [SocialSettingsController::class, 'index']);
    Route::post('/social/settings', [SocialSettingsController::class, 'store']);
    Route::post('/social/settings/test', [SocialSettingsController::class, 'test']);
    Route::delete('/social/settings/{platform}', [SocialSettingsController::class, 'destroy']);

    // Payments Management
    Route::get('/payments', [AdminController::class, 'payments']);
    Route::get('/payments/summary', [AdminController::class, 'paymentSummary']);

    // Boost Management
    Route::get('/boosts', [AdminController::class, 'boosts']);
    Route::get('/boosts/active-ads', [AdminController::class, 'adsWithBoosts']);
    Route::post('/boosts/{id}/deactivate', [AdminController::class, 'deactivateBoost']);
    Route::post('/boosts/{id}/extend', [AdminController::class, 'extendBoost']);

    // Analytics
    Route::get('/analytics/summary', [AdminAnalyticsController::class, 'summary']);
    Route::get('/analytics/trends', [AdminAnalyticsController::class, 'trends']);
    Route::get('/analytics/revenue', [AdminAnalyticsController::class, 'revenueBreakdown']);
});

// =====================================================
// LEGACY ADMIN ROUTES - Kept for backward compatibility
// =====================================================
Route::prefix('admin')->middleware([\App\Http\Middleware\AdminIpRestriction::class])->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login'])
        ->middleware(AdminRateLimiter::class);
});

Route::prefix('admin')->middleware([\App\Http\Middleware\SecureAdminAuth::class, \App\Http\Middleware\AdminIpRestriction::class])->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me', [AdminAuthController::class, 'me']);
    Route::post('/refresh', [AdminAuthController::class, 'refresh']);
    Route::get('/activity-logs', [AdminAuthController::class, 'activityLogs']);
});

// Protected auth routes
Route::prefix('auth')->middleware('auth.api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::match(['put', 'post'], '/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/avatar', [AuthController::class, 'updateAvatar']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/delete-account', [AuthController::class, 'deleteAccount']);
});

Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/all', [CategoryController::class, 'getAllCategories']);
    Route::get('/{slug}', [CategoryController::class, 'show']);
    
    // Category fields (public - for dynamic forms)
    Route::get('/{category}/fields', [CategoryFieldController::class, 'forCategory']);
});

// Category fields management
Route::prefix('category-fields')->group(function () {
    Route::get('/', [CategoryFieldController::class, 'index']);
    Route::post('/', [CategoryFieldController::class, 'store']);
    Route::put('/{field}', [CategoryFieldController::class, 'update']);
    Route::delete('/{field}', [CategoryFieldController::class, 'destroy']);
    Route::post('/reorder', [CategoryFieldController::class, 'reorder']);
});

Route::prefix('locations')->group(function () {
    Route::get('/', [LocationController::class, 'index']);
    Route::get('/{slug}', [LocationController::class, 'show']);
});

// Icons
Route::prefix('icons')->group(function () {
    Route::get('/', [IconController::class, 'getAll']);
    Route::get('/search', [IconController::class, 'search']);
    Route::get('/category/{category}', [IconController::class, 'getByCategory']);
    Route::get('/custom', [IconController::class, 'listCustom']);
    Route::post('/upload', [IconController::class, 'uploadCustom']);
    Route::delete('/custom/{id}', [IconController::class, 'deleteCustom']);
});

// Search routes
Route::get('/search', [SearchController::class, 'search']);
Route::get('/search/advanced', [SearchController::class, 'advancedSearch']);
Route::get('/search/suggestions', [SearchController::class, 'suggestions']);
Route::get('/search/trending', [SearchController::class, 'trending']);
Route::get('/search/recent', [SearchController::class, 'recentSearches']);

// Public banners
Route::get('/banners/active', [BannerController::class, 'active']);

// Cloudinary routes - get config and signed upload params
Route::get('/cloudinary/config', [CloudinaryController::class, 'getConfig']);

Route::middleware('auth.api')->group(function () {
    Route::get('/cloudinary/upload-params', [CloudinaryController::class, 'getSignedUploadParams']);
    Route::post('/cloudinary/upload-callback', [CloudinaryController::class, 'uploadCallback']);
    Route::post('/cloudinary/validate-image', [CloudinaryController::class, 'validateImage']);
});
Route::get('/homepage/clear-cache', [App\Http\Controllers\Api\HomepageController::class, 'clearCache']);

Route::prefix('ads')->group(function () {
    Route::get('/', [AdController::class, 'index']);
    Route::get('/featured', [AdController::class, 'featured']);
    Route::get('/recent', [AdController::class, 'recent']);
    Route::get('/similar', [AdController::class, 'similarAds']);
    Route::get('/{slug}', [AdController::class, 'show'])->where('slug', '^(?=.*[a-z])[a-z0-9\-]+$');

    Route::get('/{id}/share-link', [GrowthController::class, 'getShareLink']);
    Route::get('/boost-prices', [GrowthController::class, 'getBoostPrices']);
});

// Public seller reviews endpoints (read-only)
Route::prefix('sellers')->group(function () {
    Route::get('/{sellerId}/reviews', [SellerReviewController::class, 'index']);
    Route::get('/{sellerId}/reviews/latest', [SellerReviewController::class, 'latestReviews']);
    Route::get('/{sellerId}/rating', [SellerReviewController::class, 'ratingSummary']);
    Route::get('/{sellerId}/profile', [SellerReviewController::class, 'sellerProfile']);
});

// Public ad reviews endpoints (read-only)
Route::prefix('ads')->group(function () {
    Route::get('/{adId}/reviews', [ReviewController::class, 'adReviews']);
    Route::get('/{adId}/reviews/summary', [ReviewController::class, 'adReviewSummary']);
    Route::get('/{adId}/reviews/latest', [ReviewController::class, 'adLatestReviews']);
});

// Protected ad routes - define before wildcard to avoid route conflicts
Route::middleware('auth.api')->group(function () {
    // Reports
    Route::post('/reports', [ReportController::class, 'store']);

    // Ads - protected routes (must be before /{slug} wildcard)
    Route::post('/ads', [AdController::class, 'store']);
    Route::get('/ads/{id}', [AdController::class, 'getById'])->where('id', '[0-9]+');
    Route::put('/ads/{id}', [AdController::class, 'updateById'])->where('id', '[0-9]+');
    Route::put('/ads/{slug}', [AdController::class, 'update']);
    Route::delete('/ads/{slug}', [AdController::class, 'destroy']);
    Route::get('/my-ads', [AdController::class, 'myAds']);
    Route::post('/ads/{id}/close', [AdController::class, 'closeAd']);
    Route::post('/ads/{id}/renew', [AdController::class, 'renewAd']);

    Route::post('/ads/{adId}/images', [AdImageController::class, 'store']);
    Route::put('/ads/{adId}/images/{imageId}', [AdImageController::class, 'update']);
    Route::delete('/ads/{adId}/images/{imageId}', [AdImageController::class, 'destroy']);

    // Growth & Monetization
    Route::post('/ads/{id}/boost', [GrowthController::class, 'boostAd']);
    Route::get('/ads/{id}/boost-status', [GrowthController::class, 'getBoostStatus']);
    Route::post('/ads/{id}/boost-renew', [GrowthController::class, 'renewBoost']);
    Route::get('/ads/{id}/boost-renewal-check', [GrowthController::class, 'checkRenewal']);
    Route::post('/ads/{id}/save', [GrowthController::class, 'saveAd']);
    Route::delete('/ads/{id}/unsave', [GrowthController::class, 'unsaveAd']);
    Route::get('/ads/{id}/saved-check', [GrowthController::class, 'checkSavedStatus']);
    Route::get('/user/saved-ads', [GrowthController::class, 'getSavedAds']);
    Route::get('/user/recently-viewed', [GrowthController::class, 'getRecentlyViewed']);
    Route::delete('/user/recently-viewed', [GrowthController::class, 'clearRecentlyViewed']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::post('/notifications/delete-all', [NotificationController::class, 'deleteAll']);

    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{adId}', [FavoriteController::class, 'destroy']);
    Route::get('/favorites/check/{adId}', [FavoriteController::class, 'check']);

    // Messages - Protected routes
    Route::get('/messages/conversations', [MessageController::class, 'conversations']);
    Route::get('/messages/conversation/get-or-create', [MessageController::class, 'getOrCreateConversation']);
    Route::get('/messages/{conversationId}', [MessageController::class, 'messages']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::post('/messages/{conversationId}', [MessageController::class, 'sendMessage']);
    Route::post('/messages/start', [MessageController::class, 'startConversation']);
    Route::post('/messages/{conversationId}/read', [MessageController::class, 'markAsRead']);
    Route::delete('/messages/message/{messageId}', [MessageController::class, 'deleteMessage']);

    // Follow System
    Route::post('/follow', [FollowController::class, 'follow']);
    Route::delete('/unfollow', [FollowController::class, 'unfollow']);
    Route::get('/follow/check', [FollowController::class, 'checkFollow']);
    Route::get('/users/{userId}/followers', [FollowController::class, 'followers']);
    Route::get('/users/{userId}/following', [FollowController::class, 'following']);
    Route::get('/users/{userId}/stats', [FollowController::class, 'userStats']);
    Route::get('/feed/following', [FollowController::class, 'followingFeed']);
    Route::get('/sellers/suggested', [FollowController::class, 'suggestedSellers']);

    // Reviews
    Route::get('/reviews/my-reviews', [ReviewController::class, 'myReviews']);
    Route::get('/reviews/user/{userId}', [ReviewController::class, 'userReviews']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Ad Reviews
    Route::post('/ads/{adId}/reviews', [ReviewController::class, 'storeAdReview']);

    // Review Actions
    Route::post('/reviews/{reviewId}/helpful', [ReviewController::class, 'markHelpful']);
    Route::post('/reviews/{reviewId}/report', [ReviewController::class, 'reportReview']);
    Route::post('/reviews/{reviewId}/like', [ReviewController::class, 'likeReview']);
    Route::delete('/reviews/{reviewId}/like', [ReviewController::class, 'unlikeReview']);

    // Seller Reviews (for sellers, not ads) - write operations require auth
    Route::get('/sellers/{sellerId}/can-review', [SellerReviewController::class, 'canReview']);
    Route::get('/sellers/{sellerId}/my-review', [SellerReviewController::class, 'userReview']);
    Route::post('/sellers/{sellerId}/reviews', [SellerReviewController::class, 'store']);
    Route::put('/seller-reviews/{reviewId}', [SellerReviewController::class, 'update']);
    Route::delete('/seller-reviews/{reviewId}', [SellerReviewController::class, 'destroy']);
    Route::post('/seller-reviews/{reviewId}/helpful', [SellerReviewController::class, 'markHelpful']);
    Route::post('/seller-reviews/{reviewId}/report', [SellerReviewController::class, 'reportReview']);

    // Wallet
    Route::get('/wallet', [WalletController::class, 'index']);
    Route::get('/wallet/balance', [WalletController::class, 'balance']);
    Route::post('/wallet/fund', [WalletController::class, 'fund']);
    Route::post('/wallet/verify', [WalletController::class, 'verify']);
    Route::post('/wallet/check-balance', [WalletController::class, 'checkBalance']);
    Route::post('/wallet/bank-transfer-proof', [WalletController::class, 'bankTransferProof']);

    // Referral System
    Route::get('/referral/my-code', [ReferralController::class, 'myCode']);
    Route::get('/referral/my-referrals', [ReferralController::class, 'myReferrals']);
    Route::get('/referral/referred-by-me', [ReferralController::class, 'referredByMe']);
    Route::get('/referral/stats', [ReferralController::class, 'stats']);
    Route::get('/referral/leaderboard', [ReferralController::class, 'leaderboard']);
    Route::post('/referral/apply', [ReferralController::class, 'apply']);
    Route::post('/referral/reward', [ReferralController::class, 'reward']);
    Route::post('/referral/validate', [ReferralController::class, 'validateCode']);

    // Credit System
    Route::get('/credits/balance', [CreditController::class, 'balance']);
    Route::get('/credits/history', [CreditController::class, 'history']);
    Route::get('/credits/features', [CreditController::class, 'features']);
    Route::post('/credits/use', [CreditController::class, 'use']);
    Route::post('/credits/check-balance', [CreditController::class, 'checkBalance']);
});

// Webhook routes (no auth required)
Route::post('/webhooks/paystack', [PaymentWebhookController::class, 'handlePaystackWebhook']);

// Payment verification routes (no auth - callback polling)
Route::post('/payments/verify', [PaymentVerificationController::class, 'verify']);
Route::get('/payments/status/{reference}', [PaymentVerificationController::class, 'status']);

// Payment callback (redirect from Paystack)
Route::get('/payments/callback', function () {
    return response()->json(['message' => 'Payment processed. Check your dashboard.']);
})->name('payments.callback');

Route::get('/test', function () {
    return response()->json(['success' => true, 'message' => 'API is working!']);
});

Route::post('/test', function () {
    return response()->json(['success' => true, 'message' => 'POST works!']);
});
