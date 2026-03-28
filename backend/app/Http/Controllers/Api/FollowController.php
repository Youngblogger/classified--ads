<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Follow;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FollowController extends Controller
{
    public function follow(Request $request)
    {
        $request->validate([
            'following_id' => 'required|integer|exists:users,id',
        ]);

        $follower = $request->user();
        $followingId = $request->following_id;

        // Cannot follow yourself
        if ($follower->id === $followingId) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot follow yourself'
            ], 400);
        }

        // Check if already following
        $existingFollow = Follow::where('follower_id', $follower->id)
            ->where('following_id', $followingId)
            ->first();

        if ($existingFollow) {
            // Unfollow
            $existingFollow->delete();
            
            return response()->json([
                'success' => true,
                'is_following' => false,
                'followers_count' => Follow::getFollowersCount($followingId),
                'following_count' => Follow::getFollowingCount($follower->id),
                'message' => 'Unfollowed successfully'
            ]);
        }

        // Follow
        Follow::create([
            'follower_id' => $follower->id,
            'following_id' => $followingId,
        ]);

        return response()->json([
            'success' => true,
            'is_following' => true,
            'followers_count' => Follow::getFollowersCount($followingId),
            'following_count' => Follow::getFollowingCount($follower->id),
            'message' => 'Following successfully'
        ]);
    }

    public function unfollow(Request $request)
    {
        $request->validate([
            'following_id' => 'required|integer|exists:users,id',
        ]);

        $follower = $request->user();
        $followingId = $request->following_id;

        $follow = Follow::where('follower_id', $follower->id)
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
            'following_count' => Follow::getFollowingCount($follower->id),
            'message' => 'Unfollowed successfully'
        ]);
    }

    public function checkFollow(Request $request)
    {
        $request->validate([
            'following_id' => 'required|integer|exists:users,id',
        ]);

        $follower = $request->user();
        $followingId = $request->following_id;

        $isFollowing = Follow::isFollowing($follower->id, $followingId);

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
        $user = $request->user();
        
        // Get IDs of users that this user follows
        $followingIds = Follow::where('follower_id', $user->id)
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
        $user = $request->user();
        
        // Get IDs of users that this user already follows
        $followingIds = Follow::where('follower_id', $user->id)
            ->pluck('following_id')
            ->toArray();
        
        $followingIds[] = $user->id; // Exclude self

        // Get top sellers with most ads (excluding already followed)
        $sellers = User::whereNotIn('id', $followingIds)
            ->withCount('ads')
            ->whereHas('ads', function ($query) {
                $query->where('status', 'active');
            })
            ->orderBy('ads_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($seller) use ($user) {
                return [
                    'id' => $seller->id,
                    'name' => $seller->name,
                    'avatar' => $seller->avatar_url,
                    'verified' => $seller->verified,
                    'ads_count' => $seller->ads_count,
                    'followers_count' => Follow::getFollowersCount($seller->id),
                    'is_following' => Follow::isFollowing($user->id, $seller->id),
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
        $isFollowing = false;
        if ($request->user()) {
            $isFollowing = Follow::isFollowing($request->user()->id, $userId);
        }

        return response()->json([
            'followers_count' => $followersCount,
            'following_count' => $followingCount,
            'ads_count' => $adsCount,
            'is_following' => $isFollowing,
        ]);
    }
}
