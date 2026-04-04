<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\ReviewLike;
use App\Models\Ad;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ad_id' => 'required_without:user_id|exists:ads,id',
            'user_id' => 'required_without:ad_id|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $userId = $request->user()->id;
        $targetUserId = isset($validated['user_id']) ? $validated['user_id'] : Ad::find($validated['ad_id'])->user_id;

        $existing = Review::where('user_id', $userId)
            ->where('ad_id', $validated['ad_id'] ?? null)
            ->where('target_user_id', $targetUserId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already reviewed this ad'], 400);
        }

        $review = Review::create([
            'user_id' => $userId,
            'target_user_id' => $targetUserId,
            'ad_id' => $validated['ad_id'] ?? null,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        NotificationService::reviewReceived($review);

        return response()->json(['message' => 'Review submitted', 'review' => $review], 201);
    }

    public function storeAdReview(Request $request, $adId)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $userId = $request->user()->id;
        $ad = Ad::findOrFail($adId);
        $targetUserId = $ad->user_id;

        if ($userId === $targetUserId) {
            return response()->json(['error' => 'You cannot review your own ad'], 403);
        }

        $existing = Review::where('user_id', $userId)
            ->where('ad_id', $adId)
            ->where('target_user_id', $targetUserId)
            ->first();

        if ($existing) {
            return response()->json(['error' => 'You have already reviewed this ad'], 400);
        }

        $review = Review::create([
            'user_id' => $userId,
            'target_user_id' => $targetUserId,
            'ad_id' => $adId,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        NotificationService::reviewReceived($review);

        return response()->json(['message' => 'Review submitted', 'review' => $review], 201);
    }

    public function myReviews(Request $request)
    {
        $reviews = $request->user()
            ->givenReviews()
            ->with(['ad', 'targetUser'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($reviews);
    }

    public function userReviews(Request $request, $userId)
    {
        $currentUserId = $request->user() ? $request->user()->id : null;

        $reviews = Review::where('target_user_id', $userId)
            ->with(['user', 'ad'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $reviews->getCollection()->transform(function ($review) use ($currentUserId) {
            $review->like_count = $review->likeCount();
            $review->is_liked_by_user = $currentUserId ? $review->isLikedByUser($currentUserId) : false;
            return $review;
        });

        return response()->json($reviews);
    }

    public function adReviews(Request $request, $adId)
    {
        $limit = $request->input('limit');
        $currentUserId = $request->user() ? $request->user()->id : null;

        $query = Review::where('ad_id', $adId)
            ->with(['user'])
            ->orderBy('created_at', 'desc');

        if ($limit) {
            $reviews = $query->limit($limit)->get();
            $reviews->transform(function ($review) use ($currentUserId) {
                $review->like_count = $review->likeCount();
                $review->is_liked_by_user = $currentUserId ? $review->isLikedByUser($currentUserId) : false;
                return $review;
            });
            return response()->json(['data' => $reviews]);
        }
        
        $reviews = $query->paginate(20);
        $reviews->getCollection()->transform(function ($review) use ($currentUserId) {
            $review->like_count = $review->likeCount();
            $review->is_liked_by_user = $currentUserId ? $review->isLikedByUser($currentUserId) : false;
            return $review;
        });

        return response()->json($reviews);
    }

    public function adReviewSummary(Request $request, $adId)
    {
        $ad = Ad::findOrFail($adId);

        $reviews = Review::where('ad_id', $adId)->get();

        $total = $reviews->count();
        $average = $total > 0 ? round($reviews->avg('rating'), 1) : 0;

        // Calculate distribution percentages
        $calcPercent = function($count) use ($total) {
            return $total > 0 ? round(($count / $total) * 100) : 0;
        };

        $summary = [
            'average_rating' => $average,
            'total_reviews' => $total,
            'distribution' => [
                5 => $calcPercent($reviews->where('rating', 5)->count()),
                4 => $calcPercent($reviews->where('rating', 4)->count()),
                3 => $calcPercent($reviews->where('rating', 3)->count()),
                2 => $calcPercent($reviews->where('rating', 2)->count()),
                1 => $calcPercent($reviews->where('rating', 1)->count()),
            ],
        ];

        return response()->json($summary);
    }

    public function adLatestReviews(Request $request, $adId)
    {
        $limit = $request->input('limit', 3);
        $currentUserId = $request->user() ? $request->user()->id : null;
        
        $reviews = Review::where('ad_id', $adId)
            ->with(['user'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        $reviews->transform(function ($review) use ($currentUserId) {
            $review->like_count = $review->likeCount();
            $review->is_liked_by_user = $currentUserId ? $review->isLikedByUser($currentUserId) : false;
            return $review;
        });

        return response()->json(['data' => $reviews]);
    }

    public function markHelpful(Request $request, $reviewId)
    {
        $review = Review::findOrFail($reviewId);

        // Increment helpful count
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

        // Create a report for this review
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

    public function likeReview(Request $request, $reviewId)
    {
        $userId = $request->user()->id;

        $review = Review::findOrFail($reviewId);

        $existingLike = ReviewLike::where('review_id', $reviewId)
            ->where('user_id', $userId)
            ->first();

        if ($existingLike) {
            return response()->json(['message' => 'You have already liked this review'], 400);
        }

        ReviewLike::create([
            'review_id' => $reviewId,
            'user_id' => $userId,
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Review liked successfully',
            'like_count' => $review->fresh()->likeCount(),
            'is_liked_by_user' => true,
        ]);
    }

    public function unlikeReview(Request $request, $reviewId)
    {
        $userId = $request->user()->id;

        $review = Review::findOrFail($reviewId);

        $like = ReviewLike::where('review_id', $reviewId)
            ->where('user_id', $userId)
            ->first();

        if (!$like) {
            return response()->json(['message' => 'You have not liked this review'], 400);
        }

        $like->delete();

        return response()->json([
            'message' => 'Review unliked successfully',
            'like_count' => $review->fresh()->likeCount(),
            'is_liked_by_user' => false,
        ]);
    }
}
