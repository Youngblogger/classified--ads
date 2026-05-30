<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\ReviewLike;
use App\Models\Ad;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\AdminEmailNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'ad_id' => 'required_without:user_id|exists:ads,id',
                'user_id' => 'required_without:ad_id|exists:users,id',
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|max:1000',
            ]);

            $userId = $request->user()?->id;
            if (!$userId) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $ad = isset($validated['ad_id']) ? Ad::find($validated['ad_id']) : null;
            if (isset($validated['ad_id']) && !$ad) {
                return response()->json(['error' => 'Ad not found'], 404);
            }

            $targetUserId = isset($validated['user_id']) ? $validated['user_id'] : $ad->user_id;

            $existing = Review::where('user_id', $userId)
                ->where('ad_id', $validated['ad_id'] ?? null)
                ->where('target_user_id', $targetUserId)
                ->first();

            if ($existing) {
                return response()->json(['error' => 'You have already reviewed this ad'], 409);
            }

            $review = Review::create([
                'user_id' => $userId,
                'target_user_id' => $targetUserId,
                'ad_id' => $validated['ad_id'] ?? null,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? '',
            ]);

            $review->load(['user', 'ad']);
            NotificationService::reviewReceived($review);

            try {
                AdminEmailNotificationService::newReviewSubmitted($review);
            } catch (\Exception $e) {
                Log::warning('Admin email notification failed: ' . $e->getMessage());
            }

            return response()->json(['message' => 'Review submitted', 'review' => $review], 201);
        } catch (\Throwable $e) {
            Log::error('Review store failed: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function storeAdReview(Request $request, $adId)
    {
        try {
            $validated = $request->validate([
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|max:1000',
                'user_id' => 'required',
            ]);

            // Convert user_id to numeric ID matching JS uuidToNumericId (DJB2 hash)
            $userId = $validated['user_id'];
            if (!is_numeric($userId)) {
                $hash = 5381;
                for ($i = 0; $i < strlen($userId); $i++) {
                    $hash = (($hash << 5) + $hash) + ord($userId[$i]);
                    $hash = unpack('l', pack('l', $hash))[1]; // force signed 32-bit
                }
                $userId = abs($hash) ?: 1;
            } else {
                $userId = (int) $userId;
            }
            Log::info('storeAdReview called', ['adId' => $adId, 'user_id_raw' => $validated['user_id'], 'type' => gettype($validated['user_id']), 'user_id_casted' => $userId, 'rating' => $validated['rating'] ?? null]);

            $userName = $request->input('user_name', $validated['user_id'] ?? 'User');
            $user = User::find($userId);
            if (!$user) {
                // Fallback: look up by UUID string in name (user created in prior failed attempt)
                $rawUuid = $validated['user_id'];
                if (is_string($rawUuid) && !is_numeric($rawUuid)) {
                    $user = User::where('name', $rawUuid)->first();
                }
            }
            if (!$user) {
                // Auto-create user from Supabase auth (not yet synced to Laravel users table)
                try {
                    $user = new User();
                    $user->id = $userId;
                    $user->name = $userName;
                    $user->email = ($validated['user_id'] ?? 'user') . '@placeholder.local';
                    $user->password = bcrypt(Str::random(32));
                    $user->save();
                    Log::info('Auto-created user for review', ['user_id' => $userId, 'name' => $userName]);
                } catch (\Illuminate\Database\QueryException $e) {
                    $user = User::find($userId) ?? User::where('email', ($validated['user_id'] ?? 'user') . '@placeholder.local')->first();
                    if (!$user) {
                        throw $e;
                    }
                }
            }
            // Sync userId to actual DB id and always update name from frontend
            $userId = (int) $user->id;
            if ($user->name !== $userName) {
                $user->name = $userName;
                $user->save();
                Log::info('Synced user name from review submission', ['user_id' => $userId, 'name' => $userName]);
            }

            // Try URL param first, then fall back to request body ad_id
            $adIdToUse = $adId;
            if ((!is_numeric($adId) || (int)$adId <= 0) && $request->input('ad_id')) {
                $adIdToUse = $request->input('ad_id');
            }

            $adIdInt = is_numeric($adIdToUse) ? (int) $adIdToUse : 0;

            // Check using query builder for isolation
            $adFromDb = \Illuminate\Support\Facades\DB::table('ads')->where('id', $adIdInt)->first();
            $ad = Ad::find($adIdInt);

            Log::info('Ad lookup for review', [
                'adId_param' => $adId, 'adId_type' => gettype($adId),
                'adId_used' => $adIdToUse, 'adId_int' => $adIdInt,
                'ad_found_eloquent' => $ad ? 'yes' : 'no',
                'ad_found_raw' => $adFromDb ? 'yes' : 'no',
                'ad_id_value' => $ad?->id,
                'ad_db_id' => $adFromDb->id ?? null,
            ]);

            if (!$ad) {
                Log::warning('Ad not found for review', ['adId_param' => $adId, 'type' => gettype($adId), 'adIdInt' => $adIdInt]);
                return response()->json(['error' => 'Ad not found'], 404);
            }

            $targetUserId = $ad->user_id;

            if ((int)$userId === (int)$targetUserId) {
                return response()->json(['error' => 'You cannot review your own ad'], 403);
            }

            $existing = Review::where('user_id', $userId)
                ->where('ad_id', $adId)
                ->where('target_user_id', $targetUserId)
                ->first();

            if ($existing) {
                $existing->update([
                    'rating' => $validated['rating'],
                    'comment' => $validated['comment'] ?? '',
                ]);
                return response()->json(['message' => 'Review updated successfully', 'review' => $existing->fresh()], 200);
            }

            $review = Review::create([
                'user_id' => $userId,
                'target_user_id' => $targetUserId,
                'ad_id' => $adId,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? '',
            ]);

            NotificationService::reviewReceived($review);

            return response()->json(['message' => 'Review submitted successfully', 'review' => $review], 201);
        } catch (\Throwable $e) {
            Log::error('Review submission failed: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function myReviews(Request $request)
    {
        try {
            $userId = $request->input('user_id') ?? $request->user()?->id;
            if (!$userId) {
                return response()->json(['data' => []]);
            }

            $reviews = Review::where('user_id', $userId)
                ->with(['ad', 'targetUser'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json($reviews);
        } catch (\Throwable $e) {
            Log::error('myReviews failed: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
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
        $rawUserId = $request->input('user_id');
        if (!$rawUserId) {
            return response()->json(['error' => 'user_id is required'], 400);
        }

        $userName = $request->input('user_name');
        $userId = $this->resolveUserId($rawUserId, $userName);

        $review = Review::findOrFail($reviewId);

        $existingLike = ReviewLike::where('review_id', $reviewId)
            ->where('user_id', $userId)
            ->first();

        if ($existingLike) {
            // Unlike (Instagram-style toggle)
            $existingLike->delete();
            return response()->json([
                'message' => 'Review unliked successfully',
                'like_count' => $review->fresh()->likeCount(),
                'is_liked_by_user' => false,
            ]);
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
        $rawUserId = $request->input('user_id');
        if (!$rawUserId) {
            return response()->json(['error' => 'user_id is required'], 400);
        }

        $userName = $request->input('user_name');
        $userId = $this->resolveUserId($rawUserId, $userName);

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

    private function resolveUserId($rawUserId, ?string $displayName = null): int
    {
        $userId = $rawUserId;
        if (!is_numeric($userId)) {
            $hash = 5381;
            for ($i = 0; $i < strlen($userId); $i++) {
                $hash = (($hash << 5) + $hash) + ord($userId[$i]);
                $hash = unpack('l', pack('l', $hash))[1];
            }
            $userId = abs($hash) ?: 1;
        } else {
            $userId = (int) $userId;
        }

        $user = User::find($userId);
        $resolvedName = $displayName ?? $rawUserId;
        if (!$user) {
            // Fallback: look up by UUID string in name (user created in prior failed attempt)
            if (is_string($rawUserId) && !is_numeric($rawUserId)) {
                $user = User::where('name', $rawUserId)->first();
            }
        }
        if (!$user) {
            try {
                $user = new User();
                $user->id = $userId;
                $user->name = $resolvedName;
                $user->email = $rawUserId . '@like.placeholder.local';
                $user->password = bcrypt(Str::random(32));
                $user->save();
            } catch (\Illuminate\Database\QueryException $e) {
                $user = User::find($userId) ?? User::where('email', $rawUserId . '@like.placeholder.local')->first();
                if (!$user) throw $e;
            }
        }

        // Always sync name if provided
        if ($displayName && $user->name !== $displayName) {
            $user->name = $displayName;
            $user->save();
        }

        return (int) $user->id;
    }
}
