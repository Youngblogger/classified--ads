<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
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
        $reviews = Review::where('target_user_id', $userId)
            ->with(['user', 'ad'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($reviews);
    }

    public function adReviews(Request $request, $adId)
    {
        $reviews = Review::where('ad_id', $adId)
            ->with(['user'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($reviews);
    }

    public function adReviewSummary(Request $request, $adId)
    {
        $ad = Ad::findOrFail($adId);
        
        $reviews = Review::where('ad_id', $adId)->get();
        
        $summary = [
            'total' => $reviews->count(),
            'average' => $reviews->count() > 0 ? round($reviews->avg('rating'), 1) : 0,
            'distribution' => [
                5 => $reviews->where('rating', 5)->count(),
                4 => $reviews->where('rating', 4)->count(),
                3 => $reviews->where('rating', 3)->count(),
                2 => $reviews->where('rating', 2)->count(),
                1 => $reviews->where('rating', 1)->count(),
            ],
        ];

        return response()->json($summary);
    }

    public function adLatestReviews(Request $request, $adId)
    {
        $reviews = Review::where('ad_id', $adId)
            ->with(['user'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json(['data' => $reviews]);
    }
}
