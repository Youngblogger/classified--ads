<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Conversation;
use App\Models\Ad;
use App\Services\NotificationService;
use App\Services\SellerRatingService;
use Illuminate\Http\Request;

class SellerReviewController extends Controller
{
    public function index(Request $request, $sellerId)
    {
        $query = Review::where('target_user_id', $sellerId)
            ->with(['user:id,name,avatar,google_avatar,facebook_avatar,verified,created_at'])
            ->with(['ad:id,title,slug']);

        if ($request->has('rating') && $request->rating >= 1 && $request->rating <= 5) {
            $query->where('rating', $request->rating);
        }

        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'highest':
                $query->orderBy('rating', 'desc');
                break;
            case 'lowest':
                $query->orderBy('rating', 'asc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        $reviews = $query->paginate(10);
        
        $reviews->getCollection()->transform(function ($review) {
            if ($review->user) {
                $review->user->avatar_url = $review->user->avatar;
                $review->user->full_avatar_url = $review->user->avatar ? url('storage/' . $review->user->avatar) : null;
            }
            $review->reviewer = $review->user;
            unset($review->user);
            return $review;
        });

        return response()->json($reviews);
    }

    public function ratingSummary($sellerId)
    {
        $summary = SellerRatingService::getSummary($sellerId);
        return response()->json($summary);
    }

    public function latestReviews($sellerId)
    {
        $reviews = Review::where('target_user_id', $sellerId)
            ->with(['user:id,name,avatar,google_avatar,facebook_avatar,verified,created_at'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $reviews = $reviews->map(function ($review) {
            if ($review->user) {
                $review->user->avatar_url = $review->user->avatar;
                $review->user->full_avatar_url = $review->user->avatar ? url('storage/' . $review->user->avatar) : null;
            }
            $review->reviewer = $review->user;
            unset($review->user);
            return $review;
        });

        return response()->json(['data' => $reviews]);
    }

    public function store(Request $request, $sellerId)
    {
        logger("Review store called:", [
            'seller_id' => $sellerId,
            'request_data' => $request->all(),
        ]);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'ad_id' => 'nullable|exists:ads,id',
        ]);

        logger("Review validated:", [
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        $userId = $request->user()->id;
        $sellerId = (int) $sellerId;

        $canReview = $this->userCanReviewSeller($userId, $sellerId, $validated['ad_id'] ?? null);
        
        if (!$canReview['allowed']) {
            return response()->json([
                'error' => $canReview['reason'],
                'requires' => $canReview['requires']
            ], 403);
        }

        $existing = Review::where('user_id', $userId)
            ->where('target_user_id', $sellerId)
            ->whereNull('ad_id')
            ->first();

        if ($existing) {
            logger("Updating existing review:", [
                'existing_id' => $existing->id,
                'new_rating' => $validated['rating'],
            ]);
            
            $existing->update([
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]);

            SellerRatingService::clearCache($sellerId);

            return response()->json([
                'message' => 'Review updated successfully',
                'review' => $existing->fresh()->load('user:id,name,avatar,google_avatar,facebook_avatar,verified,created_at')
            ]);
        }

        $review = Review::create([
            'user_id' => $userId,
            'target_user_id' => $sellerId,
            'ad_id' => $validated['ad_id'] ?? null,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        logger("Review created:", [
            'review_id' => $review->id,
            'rating' => $review->rating,
            'target_user_id' => $review->target_user_id,
        ]);

        logger("Review created for seller {$sellerId}:", [
            'review_id' => $review->id,
            'rating' => $review->rating,
            'target_user_id' => $review->target_user_id,
        ]);

        SellerRatingService::clearCache($sellerId);
        NotificationService::reviewReceived($review);

        return response()->json([
            'message' => 'Review submitted successfully',
            'review' => $review->load('user:id,name,avatar,google_avatar,facebook_avatar,verified,created_at')
        ], 201);
    }

    public function userReview(Request $request, $sellerId)
    {
        $userId = $request->user()->id;
        $sellerId = (int) $sellerId;

        $review = Review::where('user_id', $userId)
            ->where('target_user_id', $sellerId)
            ->whereNull('ad_id')
            ->first();

        if (!$review) {
            return response()->json(['review' => null]);
        }

        return response()->json(['review' => $review]);
    }

    public function canReview(Request $request, $sellerId)
    {
        $userId = $request->user()->id;
        $sellerId = (int) $sellerId;

        $result = $this->userCanReviewSeller($userId, $sellerId, null);
        
        return response()->json($result);
    }

    private function userCanReviewSeller($userId, $sellerId, $adId = null)
    {
        if ($userId === $sellerId) {
            return [
                'allowed' => false,
                'reason' => 'You cannot review yourself',
                'requires' => []
            ];
        }

        $seller = \App\Models\User::find($sellerId);
        if (!$seller) {
            return [
                'allowed' => false,
                'reason' => 'Seller not found',
                'requires' => []
            ];
        }

        $requires = [];

        $hasChatted = Conversation::where(function ($query) use ($userId, $sellerId) {
            $query->where('sender_id', $userId)
                  ->where('receiver_id', $sellerId);
        })->orWhere(function ($query) use ($userId, $sellerId) {
            $query->where('sender_id', $sellerId)
                  ->where('receiver_id', $userId);
        })->exists();

        if ($hasChatted) {
            return [
                'allowed' => true,
                'reason' => 'You have chatted with this seller',
                'requires' => ['chatted' => true]
            ];
        }
        $requires[] = 'chatted';

        if ($adId) {
            $ad = Ad::where('id', $adId)
                ->where('user_id', $sellerId)
                ->exists();
            
            if ($ad) {
                return [
                    'allowed' => true,
                    'reason' => 'You can review this seller about this ad',
                    'requires' => ['ad_interaction' => true]
                ];
            }
        }

        $hasAdInteraction = Ad::where('user_id', $sellerId)
            ->whereHas('favorites', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->exists();

        if ($hasAdInteraction) {
            return [
                'allowed' => true,
                'reason' => 'You have favorited ads from this seller',
                'requires' => ['ad_favorited' => true]
            ];
        }

        return [
            'allowed' => false,
            'reason' => 'You must chat with this seller before reviewing',
            'requires' => $requires
        ];
    }

    public function update(Request $request, $reviewId)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $userId = $request->user()->id;
        
        $review = Review::where('id', $reviewId)
            ->where('user_id', $userId)
            ->first();

        if (!$review) {
            return response()->json(['error' => 'Review not found or unauthorized'], 404);
        }

        $review->update([
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        SellerRatingService::clearCache($review->target_user_id);

        return response()->json([
            'message' => 'Review updated successfully',
            'review' => $review->fresh()->load('user:id,name,avatar,avatar,google_avatar,facebook_avatar,verified,created_at')
        ]);
    }

    public function destroy(Request $request, $reviewId)
    {
        $userId = $request->user()->id;
        
        $review = Review::where('id', $reviewId)
            ->where('user_id', $userId)
            ->first();

        if (!$review) {
            return response()->json(['error' => 'Review not found or unauthorized'], 404);
        }

        $targetUserId = $review->target_user_id;
        $review->delete();

        SellerRatingService::clearCache($targetUserId);

        return response()->json(['message' => 'Review deleted successfully']);
    }

    public function markHelpful(Request $request, $reviewId)
    {
        $review = Review::findOrFail($reviewId);
        $review->increment('helpful_count');

        return response()->json([
            'message' => 'Review marked as helpful',
            'helpful_count' => $review->fresh()->helpful_count
        ]);
    }

    public function reportReview(Request $request, $reviewId)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $review = Review::findOrFail($reviewId);

        $report = \App\Models\Report::create([
            'user_id' => $request->user()->id,
            'ad_id' => $review->ad_id,
            'reason' => $validated['reason'],
            'description' => 'Review Report: ' . $review->comment,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Review reported successfully',
            'report' => $report
        ], 201);
    }

    public function sellerProfile($sellerId)
    {
        $seller = \App\Models\User::select([
            'id', 'name', 'avatar', 'google_avatar', 'facebook_avatar',
            'verified', 'phone', 'location', 'created_at'
        ])->find($sellerId);

        if (!$seller) {
            return response()->json(['error' => 'Seller not found'], 404);
        }

        $ratingSummary = SellerRatingService::getSummary($sellerId);
        $adsCount = Ad::where('user_id', $sellerId)
            ->where('status', 'active')
            ->count();
        $memberSince = \Carbon\Carbon::parse($seller->created_at)->format('M Y');

        $sellerArray = $seller->toArray();
        
        // Build full avatar URL - use backend URL from config
        $backendUrl = config('app.url', 'http://127.0.0.1:8000');
        if ($seller->avatar) {
            $sellerArray['avatar_url'] = $backendUrl . '/storage/' . $seller->avatar;
        } else {
            $sellerArray['avatar_url'] = null;
        }
        
        // Add full URLs for social avatars
        if ($seller->google_avatar) {
            $sellerArray['google_avatar'] = $seller->google_avatar;
        }
        if ($seller->facebook_avatar) {
            $sellerArray['facebook_avatar'] = $seller->facebook_avatar;
        }

        return response()->json([
            'seller' => $sellerArray,
            'rating' => $ratingSummary,
            'ads_count' => $adsCount,
            'member_since' => $memberSince,
        ]);
    }
}
