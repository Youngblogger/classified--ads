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
use App\Http\Controllers\Api\AdminBoostController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\SavedSearchController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\BusinessVerificationController;
use Illuminate\Support\Facades\Route;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

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
    Route::post('/ads/{id}/deactivate', [AdminController::class, 'deactivateAd']);
    Route::post('/ads/{id}/suspend', [AdminController::class, 'suspendAd']);
    Route::post('/ads/{id}/remove', [AdminController::class, 'removeAd']);
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
    Route::post('/categories/upload-image', [AdminController::class, 'uploadCategoryImage']);
    Route::post('/categories/reorder', [AdminController::class, 'reorderCategories']);
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

    // Boost Management
    Route::get('/boost/plans', [AdminBoostController::class, 'plans']);
    Route::post('/boost/plans', [AdminBoostController::class, 'createPlan']);
    Route::put('/boost/plans/{id}', [AdminBoostController::class, 'updatePlan']);
    Route::delete('/boost/plans/{id}', [AdminBoostController::class, 'deletePlan']);
    Route::get('/boost/boosts', [AdminBoostController::class, 'allBoosts']);
    Route::get('/boost/summary', [AdminBoostController::class, 'boostSummary']);
    Route::post('/boost/boosts/{id}/deactivate', [AdminBoostController::class, 'deactivateBoost']);
    Route::post('/boost/boosts/{id}/extend', [AdminBoostController::class, 'extendBoost']);

    // Analytics
    Route::get('/analytics/summary', [AdminAnalyticsController::class, 'summary']);
    Route::get('/analytics/trends', [AdminAnalyticsController::class, 'trends']);
    Route::get('/analytics/revenue', [AdminAnalyticsController::class, 'revenueBreakdown']);

    // Store Management
    Route::get('/stores', [StoreController::class, 'adminIndex']);
    Route::get('/stores/{id}', [StoreController::class, 'showById']);
    Route::post('/stores/{id}/verify', [StoreController::class, 'adminVerify']);
    Route::post('/stores/{id}/suspend', [StoreController::class, 'adminSuspend']);
    Route::post('/stores/{id}/activate', [StoreController::class, 'adminActivate']);
    Route::delete('/stores/{id}', [StoreController::class, 'adminDelete']);

    // Personal Verification Management
    Route::get('/verifications', [AdminController::class, 'verifications']);
    Route::get('/verifications/{id}', [AdminController::class, 'verificationDetail']);
    Route::post('/verifications/{id}/approve', [AdminController::class, 'approveVerification']);
    Route::post('/verifications/{id}/reject', [AdminController::class, 'rejectVerification']);
    Route::get('/verifications/stats', [AdminController::class, 'verificationStats']);

    // Business Verification Management
    Route::get('/business-verifications', [AdminController::class, 'businessVerifications']);
    Route::get('/business-verifications/{id}', [AdminController::class, 'businessVerificationDetail']);
    Route::post('/business-verifications/{id}/approve', [AdminController::class, 'approveBusinessVerification']);
    Route::post('/business-verifications/{id}/reject', [AdminController::class, 'rejectBusinessVerification']);
    Route::get('/business-verifications/stats', [AdminController::class, 'businessVerificationStats']);
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

Route::prefix('categories')->middleware('cache-response:3600')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/all', [CategoryController::class, 'getAllCategories']);
    Route::get('/mega-menu', [CategoryController::class, 'megaMenu']);
    Route::get('/{slug}', [CategoryController::class, 'show']);
    
    // Category fields (public - for dynamic forms)
    Route::get('/{category}/fields', [CategoryFieldController::class, 'forCategory']);
});

// Filter metadata (public - dynamic filter configuration per category)
Route::get('/filters/meta', [\App\Http\Controllers\Api\FilterMetaController::class, 'index'])
    ->middleware('cache-response:120');

// Category fields management (protected - admin only)
Route::prefix('category-fields')->middleware('auth.api')->group(function () {
    Route::get('/', [CategoryFieldController::class, 'index']);
    Route::post('/', [CategoryFieldController::class, 'store']);
    Route::put('/{field}', [CategoryFieldController::class, 'update']);
    Route::delete('/{field}', [CategoryFieldController::class, 'destroy']);
    Route::post('/reorder', [CategoryFieldController::class, 'reorder']);
});

Route::prefix('locations')->middleware('cache-response:3600')->group(function () {
    Route::get('/', [LocationController::class, 'index']);
    Route::get('/{slug}', [LocationController::class, 'show']);
});

// Public Store Routes
Route::prefix('stores')->group(function () {
    Route::get('/{slug}', [StoreController::class, 'show']);
    Route::get('/by-user/{userId}', [StoreController::class, 'getByUser']);
    Route::get('/check-slug', [StoreController::class, 'checkSlug']);
});

// Analytics tracking routes (no auth required - used by frontend tracking)
Route::post('/analytics/record-view/{adId}', [AnalyticsController::class, 'recordView']);
Route::post('/analytics/record-click/{adId}', [AnalyticsController::class, 'recordClick']);
Route::post('/analytics/record-share/{adId}', [AnalyticsController::class, 'recordShare']);

// Icons (read-only public, write operations protected)
Route::prefix('icons')->group(function () {
    Route::get('/', [IconController::class, 'getAll']);
    Route::get('/search', [IconController::class, 'search']);
    Route::get('/category/{category}', [IconController::class, 'getByCategory']);
    Route::get('/custom', [IconController::class, 'listCustom']);
});
Route::prefix('icons')->middleware('auth.api')->group(function () {
    Route::post('/upload', [IconController::class, 'uploadCustom']);
    Route::delete('/custom/{id}', [IconController::class, 'deleteCustom']);
});

// Search routes
Route::get('/search', [SearchController::class, 'search'])->middleware('throttle:search');
Route::get('/search/advanced', [SearchController::class, 'advancedSearch'])->middleware('throttle:search');
Route::get('/search/suggestions', [SearchController::class, 'suggestions'])->middleware('throttle:search');
Route::get('/search/trending', [SearchController::class, 'trending'])->middleware('throttle:search');
Route::get('/search/recent', [SearchController::class, 'recentSearches'])->middleware('throttle:search');

// Public banners
Route::get('/banners/active', [BannerController::class, 'active']);

// Cloudinary routes - get config and signed upload params
Route::get('/cloudinary/config', [CloudinaryController::class, 'getConfig']);

Route::middleware('auth.api')->group(function () {
    Route::get('/cloudinary/upload-params', [CloudinaryController::class, 'getSignedUploadParams']);
    Route::post('/cloudinary/upload-callback', [CloudinaryController::class, 'uploadCallback']);
    Route::post('/cloudinary/validate-image', [CloudinaryController::class, 'validateImage']);
});
Route::get('/homepage', [App\Http\Controllers\Api\HomepageController::class, 'index'])->middleware(['throttle:homepage', 'cache-response:600']);
Route::get('/homepage/clear-cache', [App\Http\Controllers\Api\HomepageController::class, 'clearCache'])->middleware('auth.api');

Route::prefix('ads')->middleware(['throttle:public-api', 'cache-response:300'])->group(function () {
    Route::get('/', [AdController::class, 'index']);
    Route::get('/ranking', [App\Http\Controllers\Api\RankingController::class, 'feed'])->middleware('cache-response:300');
    Route::get('/featured', [AdController::class, 'featured']);
    Route::get('/recent', [AdController::class, 'recent']);
    Route::get('/similar', [AdController::class, 'similarAds']);
    Route::get('/boost-prices', [GrowthController::class, 'getBoostPrices']);
    Route::get('/boost-plans', [GrowthController::class, 'getBoostPlans']);
    Route::post('/{id}/track-click', [GrowthController::class, 'trackClick']);
    Route::get('/{id}/share-link', [GrowthController::class, 'getShareLink']);
    Route::get('/{slug}', [AdController::class, 'show'])->where('slug', '^(?=.*[a-z])[a-z0-9\-]+$');
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
    Route::post('/ads', [AdController::class, 'store'])->middleware('throttle:post-ad');
    Route::post('/ads/boost-on-publish', [AdController::class, 'boostOnPublish'])->middleware('throttle:post-ad');
    Route::get('/ads/{id}', [AdController::class, 'showById'])->where('id', '[0-9]+');
    Route::match(['post', 'put'], '/ads/{id}', [AdController::class, 'updateById'])->where('id', '[0-9]+');
    Route::put('/ads/{slug}', [AdController::class, 'update']);
    Route::delete('/ads/{slug}', [AdController::class, 'destroy']);
    Route::get('/my-ads', [AdController::class, 'myAds']);
    Route::post('/ads/{id}/close', [AdController::class, 'closeAd']);
    Route::post('/ads/{id}/sold', [AdController::class, 'closeAd']);
    Route::post('/ads/{id}/pause', [AdController::class, 'pauseAd']);
    Route::post('/ads/{id}/reactivate', [AdController::class, 'reactivateAd']);
    Route::post('/ads/{id}/renew', [AdController::class, 'renewAd']);

    Route::post('/ads/{adId}/images', [AdImageController::class, 'store']);
    Route::put('/ads/{adId}/images/{imageId}', [AdImageController::class, 'update']);
    Route::delete('/ads/{adId}/images/{imageId}', [AdImageController::class, 'destroy']);

    // Growth & Monetization
    Route::get('/my-boosts', [GrowthController::class, 'myBoosts']);
    Route::post('/ads/{id}/boost', [GrowthController::class, 'boostAd'])->middleware('throttle:boost');
    Route::get('/ads/{id}/boost-status', [GrowthController::class, 'getBoostStatus']);
    Route::post('/ads/{id}/boost-renew', [GrowthController::class, 'renewBoost'])->middleware('throttle:boost');
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
    Route::post('/messages', [MessageController::class, 'store'])->middleware('throttle:messages');
    Route::post('/messages/{conversationId}', [MessageController::class, 'sendMessage'])->middleware('throttle:messages');
    Route::post('/messages/start', [MessageController::class, 'startConversation'])->middleware('throttle:messages');
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

    // Pending Payment Management
    Route::get('/payments/pending', [PaymentVerificationController::class, 'pendingPayments']);
    Route::post('/payments/{paymentIntentId}/cancel', [PaymentVerificationController::class, 'cancelPayment']);

    // Store Management
    Route::get('/my-store', [StoreController::class, 'myStore']);
    Route::post('/stores', [StoreController::class, 'store']);
    Route::match(['post', 'put'], '/stores/update', [StoreController::class, 'update']);
    Route::post('/stores/upload-logo', [StoreController::class, 'uploadLogo']);
    Route::post('/stores/upload-banner', [StoreController::class, 'uploadBanner']);
    Route::post('/stores/{storeId}/follow', [StoreController::class, 'follow']);
    Route::delete('/stores/{storeId}/unfollow', [StoreController::class, 'unfollow']);
    Route::get('/stores/{storeId}/check-follow', [StoreController::class, 'checkFollow']);
    Route::get('/stores/{storeId}/followers', [StoreController::class, 'followers']);
    Route::get('/store/analytics', [StoreController::class, 'analytics']);
    Route::get('/store/dashboard-analytics', [StoreController::class, 'dashboardAnalytics']);

    // Saved Searches
    Route::get('/saved-searches', [SavedSearchController::class, 'index']);
    Route::post('/saved-searches', [SavedSearchController::class, 'store']);
    Route::get('/saved-searches/{id}', [SavedSearchController::class, 'show']);
    Route::put('/saved-searches/{id}', [SavedSearchController::class, 'update']);
    Route::delete('/saved-searches/{id}', [SavedSearchController::class, 'destroy']);
    Route::get('/saved-searches/{id}/search', [SavedSearchController::class, 'search']);

    // Verification Center (Personal)
    Route::get('/verifications', [VerificationController::class, 'myVerifications']);
    Route::post('/verifications/phone', [VerificationController::class, 'submitPhone']);
    Route::post('/verifications/email', [VerificationController::class, 'submitEmail']);
    Route::post('/verifications/identity', [VerificationController::class, 'submitIdentity']);
    Route::get('/verifications/status', [VerificationController::class, 'getStatus']);
    Route::post('/verifications/upload', [VerificationController::class, 'uploadDocument']);

    // Email Verification Flow (link-based)
    Route::post('/email-verification/send', [EmailVerificationController::class, 'sendVerificationEmail']);
    Route::post('/email-verification/resend', [EmailVerificationController::class, 'resendVerificationEmail']);
    Route::get('/email-verification/status', [EmailVerificationController::class, 'status']);

    // Business Verification (separate from personal)
    Route::get('/business-verification', [BusinessVerificationController::class, 'myBusinessVerification']);
    Route::post('/business-verification', [BusinessVerificationController::class, 'submit']);
    Route::get('/business-verification/status', [BusinessVerificationController::class, 'getStatus']);
    Route::post('/business-verification/upload', [BusinessVerificationController::class, 'uploadDocument']);

    // Seller Analytics
    Route::get('/analytics/overview', [AnalyticsController::class, 'overview']);
    Route::get('/analytics/ad-performance', [AnalyticsController::class, 'adPerformance']);
    Route::get('/analytics/ad/{adId}', [AnalyticsController::class, 'singleAdPerformance']);
    Route::get('/analytics/daily', [AnalyticsController::class, 'dailyBreakdown']);
    Route::get('/analytics/trends', [AnalyticsController::class, 'trends']);
    Route::get('/analytics/top-ads', [AnalyticsController::class, 'topAds']);
    Route::get('/analytics/store', [AnalyticsController::class, 'storePerformance']);
});

// Email verification callback (no auth - user clicks link from email)
Route::post('/email-verification/verify', [EmailVerificationController::class, 'verify']);

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
