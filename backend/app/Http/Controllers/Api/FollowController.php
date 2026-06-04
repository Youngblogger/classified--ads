<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Follow;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\ReviewerNameUtility;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FollowController extends Controller
{
    private function resolveUserId($rawUserId, ?string $displayName = null): ?int
    {
        if (!$rawUserId) return null;

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
        if (!$user) {
            if (is_string($rawUserId) && !is_numeric($rawUserId)) {
                $user = User::where('name', $rawUserId)->first();
            }
        }

        if (!$user) {
            try {
                $resolvedName = $displayName ? ReviewerNameUtility::normalize($displayName) : 'FollowUser';
                $user = new User();
                $user->id = $userId;
                $user->name = $resolvedName;
                $user->email = $rawUserId . '@follow.placeholder.local';
                $user->password = bcrypt(Str::random(32));
                $user->save();
            } catch (\Illuminate\Database\QueryException $e) {
                $user = User::find($userId);
                if (!$user) throw $e;
            }
        }

        return $user ? (int) $user->id : null;
    }

    private function getAuthUserId(Request $request): ?int
    {
        $sanctumUser = $request->user();
        if ($sanctumUser) return (int) $sanctumUser->id;
        $userId = $request->input('user_id');
        $userName = $request->input('user_name');
        return $this->resolveUserId($userId, $userName);
    }

    public function follow(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'following_id' => 'required|integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $followerId = $this->getAuthUserId($request);
        
        if (!$followerId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please login.'
            ], 401);
        }

        $followingId = (int) $request->following_id;

        // Cannot follow yourself
        if ($followerId === $followingId) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot follow yourself'
            ], 400);
        }

        // Check if already following
        $existingFollow = Follow::where('follower_id', $followerId)
            ->where('following_id', $followingId)
            ->first();

        if ($existingFollow) {
            // Already following - just return success
            return response()->json([
                'success' => true,
                'is_following' => true,
                'followers_count' => Follow::getFollowersCount($followingId),
                'following_count' => Follow::getFollowingCount($followerId),
                'message' => 'Already following'
            ]);
        }

        // Follow
        $follow = Follow::create([
            'follower_id' => $followerId,
            'following_id' => $followingId,
        ]);

        Log::info('User followed', [
            'follower_id' => $followerId,
            'following_id' => $followingId,
            'follow_id' => $follow->id
        ]);

        return response()->json([
            'success' => true,
            'is_following' => true,
            'followers_count' => Follow::getFollowersCount($followingId),
            'following_count' => Follow::getFollowingCount($followerId),
            'message' => 'Following successfully'
        ]);
    }

    public function unfollow(Request $request)
    {
        $request->validate([
            'following_id' => 'required|integer|exists:users,id',
        ]);

        $followerId = $this->getAuthUserId($request);
        if (!$followerId) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $followingId = $request->following_id;

        $follow = Follow::where('follower_id', $followerId)
            ->where('following_id', $followingId)
            ->first();

        if (!$follow) {
            return response()->json([
                'success' => false,
                'message' => 'You are not following this user'
            ], 400);
        }

        $follow->delete();

        return response()->json([
            'success' => true,
            'is_following' => false,
            'followers_count' => Follow::getFollowersCount($followingId),
            'following_count' => Follow::getFollowingCount($followerId),
            'message' => 'Unfollowed successfully'
        ]);
    }

    public function checkFollow(Request $request)
    {
        $request->validate([
            'following_id' => 'required|integer|exists:users,id',
        ]);

        $followerId = $this->getAuthUserId($request);
        if (!$followerId) {
            return response()->json(['is_following' => false], 200);
        }

        $followingId = $request->following_id;

        $isFollowing = Follow::isFollowing($followerId, $followingId);

        return response()->json([
            'is_following' => $isFollowing,
            'followers_count' => Follow::getFollowersCount($followingId),
            'following_count' => Follow::getFollowingCount($followingId),
        ]);
    }

    public function followers(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $followers = Follow::where('following_id', $userId)
            ->with('follower:id,name,avatar,google_avatar,facebook_avatar,verified')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($followers);
    }

    public function following(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $following = Follow::where('follower_id', $userId)
            ->with('following:id,name,avatar,google_avatar,facebook_avatar,verified')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($following);
    }

    public function followingFeed(Request $request)
    {
        $userId = $this->getAuthUserId($request);
        if (!$userId) {
            return response()->json(['data' => [], 'message' => 'Unauthenticated'], 401);
        }
        
        // Get IDs of users that this user follows
        $followingIds = Follow::where('follower_id', $userId)
            ->pluck('following_id')
            ->toArray();

        if (empty($followingIds)) {
            return response()->json([
                'data' => [],
                'message' => 'You are not following anyone yet'
            ]);
        }

        // Get ads from followed users
        $ads = Ad::with(['user:id,name,avatar,google_avatar,facebook_avatar,verified', 'images', 'category', 'location'])
            ->whereIn('user_id', $followingIds)
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($ads);
    }

    public function suggestedSellers(Request $request)
    {
        $userId = $this->getAuthUserId($request);
        if (!$userId) {
            return response()->json(['data' => [], 'message' => 'Unauthenticated'], 401);
        }
        
        // Get IDs of users that this user already follows
        $followingIds = Follow::where('follower_id', $userId)
            ->pluck('following_id')
            ->toArray();
        
        $followingIds[] = $userId; // Exclude self

        // Get top sellers with most ads (excluding already followed)
        $sellers = User::whereNotIn('id', $followingIds)
            ->withCount('ads')
            ->whereHas('ads', function ($query) {
                $query->where('status', 'active');
            })
            ->orderBy('ads_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($seller) use ($userId) {
                return [
                    'id' => $seller->id,
                    'name' => $seller->name,
                    'avatar' => $seller->avatar_url,
                    'verified' => $seller->verified,
                    'ads_count' => $seller->ads_count,
                    'followers_count' => Follow::getFollowersCount($seller->id),
                    'is_following' => Follow::isFollowing($userId, $seller->id),
                ];
            });

        return response()->json($sellers);
    }

    public function userStats(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        
        $followersCount = Follow::getFollowersCount($userId);
        $followingCount = Follow::getFollowingCount($userId);
        $adsCount = Ad::where('user_id', $userId)->where('status', 'active')->count();
        
        // Check if current user is following
        $currentUserId = $this->getAuthUserId($request);
        $isFollowing = $currentUserId ? Follow::isFollowing($currentUserId, $userId) : false;

        return response()->json([
            'followers_count' => $followersCount,
            'following_count' => $followingCount,
            'ads_count' => $adsCount,
            'is_following' => $isFollowing,
        ]);
    }
}
