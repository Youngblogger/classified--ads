<?php

use App\Http\Controllers\Api\AdController;
use App\Http\Controllers\Api\AdImageController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuthOtpController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\FontController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\WatermarkController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::match(['get', 'post'], '/google', [AuthController::class, 'google']);
    
    // OTP Verification routes
    Route::post('/register-otp', [AuthOtpController::class, 'register']);
    Route::post('/verify-otp', [AuthOtpController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthOtpController::class, 'resendOtp']);
    Route::get('/check-otp-status', [AuthOtpController::class, 'checkStatus']);
});

// Protected auth routes
Route::prefix('auth')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::match(['put', 'post'], '/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/avatar', [AuthController::class, 'updateAvatar']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});

Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/{slug}', [CategoryController::class, 'show']);
});

Route::prefix('locations')->group(function () {
    Route::get('/', [LocationController::class, 'index']);
    Route::get('/{slug}', [LocationController::class, 'show']);
});

Route::prefix('ads')->group(function () {
    Route::get('/', [AdController::class, 'index']);
    Route::get('/featured', [AdController::class, 'featured']);
    Route::get('/recent', [AdController::class, 'recent']);
    Route::get('/{slug}', [AdController::class, 'show']);
});

Route::middleware('auth:sanctum')->group(function () {
    // Reports
    Route::post('/reports', [ReportController::class, 'store']);
    
    // Ads
    Route::post('/ads', [AdController::class, 'store']);
    Route::put('/ads/{slug}', [AdController::class, 'update']);
    Route::delete('/ads/{slug}', [AdController::class, 'destroy']);
    Route::get('/ads/my-ads', [AdController::class, 'myAds']);
    
    Route::post('/ads/{adId}/images', [AdImageController::class, 'store']);
    Route::put('/ads/{adId}/images/{imageId}', [AdImageController::class, 'update']);
    Route::delete('/ads/{adId}/images/{imageId}', [AdImageController::class, 'destroy']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    
    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{adId}', [FavoriteController::class, 'destroy']);
    Route::get('/favorites/check/{adId}', [FavoriteController::class, 'check']);
    
    // Messages
    Route::get('/messages/conversations', [MessageController::class, 'conversations']);
    Route::get('/messages/conversation/get-or-create', [MessageController::class, 'getOrCreateConversation']);
    Route::get('/messages/{conversationId}', [MessageController::class, 'messages']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::post('/messages/{conversationId}', [MessageController::class, 'sendMessage']);
    Route::post('/messages/start', [MessageController::class, 'startConversation']);
    Route::post('/messages/{conversationId}/read', [MessageController::class, 'markAsRead']);
    Route::delete('/messages/message/{messageId}', [MessageController::class, 'deleteMessage']);
    
    // Reviews
    Route::get('/reviews/my-reviews', [ReviewController::class, 'myReviews']);
    Route::get('/reviews/user/{userId}', [ReviewController::class, 'userReviews']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    
    // Ad Reviews
    Route::post('/ads/{adId}/reviews', [ReviewController::class, 'storeAdReview']);
    Route::get('/ads/{adId}/reviews', [ReviewController::class, 'adReviews']);
    Route::get('/ads/{adId}/reviews/summary', [ReviewController::class, 'adReviewSummary']);
    Route::get('/ads/{adId}/reviews/latest', [ReviewController::class, 'adLatestReviews']);
    
    // Wallet
    Route::get('/wallet', [WalletController::class, 'index']);
    Route::post('/wallet/fund', [WalletController::class, 'fund']);
    Route::post('/wallet/verify', [WalletController::class, 'verify']);
});

Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/ads', [AdminController::class, 'ads']);
    Route::post('/ads/{id}/approve', [AdminController::class, 'approveAd']);
    Route::post('/ads/{id}/reject', [AdminController::class, 'rejectAd']);
    Route::delete('/ads/{id}', [AdminController::class, 'deleteAd']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::put('/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    Route::post('/users/{id}/suspend', [AdminController::class, 'suspendUser']);
    Route::post('/users/{id}/ban', [AdminController::class, 'banUser']);
    Route::post('/users/{id}/activate', [AdminController::class, 'activateUser']);
    Route::get('/categories', [AdminController::class, 'categories']);
    Route::post('/categories', [AdminController::class, 'createCategory']);
    Route::put('/categories/{id}', [AdminController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [AdminController::class, 'deleteCategory']);
    Route::get('/locations', [AdminController::class, 'locations']);
    Route::post('/locations', [AdminController::class, 'createLocation']);
    Route::put('/locations/{id}', [AdminController::class, 'updateLocation']);
    Route::delete('/locations/{id}', [AdminController::class, 'deleteLocation']);
    Route::get('/reports', [AdminController::class, 'reports']);
    Route::post('/reports/{id}/resolve', [AdminController::class, 'resolveReport']);
    Route::get('/analytics', [AdminController::class, 'analytics']);
    Route::get('/messages', [AdminController::class, 'messages']);
    Route::post('/broadcast', [AdminController::class, 'broadcast']);
    Route::get('/settings', [AdminController::class, 'settings']);
    Route::put('/settings', [AdminController::class, 'updateSettings']);
    Route::get('/watermark', [WatermarkController::class, 'index']);
    Route::put('/watermark', [WatermarkController::class, 'update']);
    Route::post('/watermark/logo', [WatermarkController::class, 'uploadLogo']);
    Route::get('/fonts', [FontController::class, 'index']);
    Route::post('/fonts', [FontController::class, 'store']);
    Route::delete('/fonts/{id}', [FontController::class, 'destroy']);
    Route::post('/fonts/{id}/default', [FontController::class, 'setDefault']);
});
