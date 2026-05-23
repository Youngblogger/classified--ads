<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\StoreFollower;
use App\Models\StoreAnalytic;
use App\Models\Ad;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class StoreController extends Controller
{
    public function myStore(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated. Please login.'
                ], 401);
            }

            $store = Store::where('user_id', $user->id)->first();

            if (!$store) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have a store yet.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'store' => $store->load(['user', 'location']),
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('My store failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'You do not have a store yet.'
            ], 404);
        }
    }

    public function show($slug)
    {
        $store = Store::where('slug', $slug)->firstOrFail();

        $ads = Ad::where('store_id', $store->id)
            ->where('status', 'active')
            ->with(['user:id,name,avatar,google_avatar,facebook_avatar,verified', 'images', 'category', 'location'])
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return response()->json([
            'store' => $store->load(['user', 'location']),
            'ads' => $ads
        ]);
    }

    public function showById($id)
    {
        $store = Store::with(['user', 'location'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'store' => $store,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please login.'
            ], 401);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:stores,name',
            'description' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'website' => 'nullable|url|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $slug = Str::slug($request->name) . '-' . Str::random(5);

        $store = Store::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'website' => $request->website,
            'status' => 'active',
        ]);

        Log::info('Store created', [
            'user_id' => $user->id,
            'store_id' => $store->id,
            'store_name' => $store->name,
            'slug' => $store->slug,
        ]);

        return response()->json([
            'success' => true,
            'store' => $store,
            'message' => 'Store created successfully'
        ], 201);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please login.'
            ], 401);
        }

        $store = Store::where('user_id', $user->id)->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have a store yet.'
            ], 404);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:stores,name,' . $store->id,
            'description' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'website' => 'nullable|url|max:255',
            'social_links' => 'nullable|array',
            'settings' => 'nullable|array',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'banner' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only([
            'name', 'description', 'phone', 'email', 'address', 'website', 'social_links', 'settings'
        ]);

        if ($request->hasFile('logo')) {
            if ($store->logo) {
                Storage::disk('public')->delete($store->logo);
            }
            $data['logo'] = $request->file('logo')->store('stores/logos', 'public');
        }

        if ($request->hasFile('banner')) {
            if ($store->banner) {
                Storage::disk('public')->delete($store->banner);
            }
            $data['banner'] = $request->file('banner')->store('stores/banners', 'public');
        }

        if ($request->name !== $store->name) {
            $data['slug'] = Str::slug($request->name) . '-' . Str::random(5);
        }

        $store->update($data);

        Log::info('Store updated', [
            'user_id' => $user->id,
            'store_id' => $store->id,
        ]);

        return response()->json([
            'success' => true,
            'store' => $store->fresh()->load(['user', 'location']),
            'message' => 'Store updated successfully'
        ]);
    }

    public function uploadLogo(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please login.'
            ], 401);
        }

        $store = Store::where('user_id', $user->id)->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have a store yet.'
            ], 404);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($store->logo) {
            Storage::disk('public')->delete($store->logo);
        }

        $path = $request->file('logo')->store('stores/logos', 'public');
        $store->update(['logo' => $path]);

        return response()->json([
            'success' => true,
            'logo_url' => $store->fresh()->logo_url,
            'message' => 'Logo uploaded successfully'
        ]);
    }

    public function uploadBanner(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please login.'
            ], 401);
        }

        $store = Store::where('user_id', $user->id)->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have a store yet.'
            ], 404);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'banner' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($store->banner) {
            Storage::disk('public')->delete($store->banner);
        }

        $path = $request->file('banner')->store('stores/banners', 'public');
        $store->update(['banner' => $path]);

        return response()->json([
            'success' => true,
            'banner_url' => $store->fresh()->banner_url,
            'message' => 'Banner uploaded successfully'
        ]);
    }

    public function follow($storeId, Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please login.'
            ], 401);
        }

        $store = Store::findOrFail($storeId);

        if ($store->user_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot follow your own store'
            ], 400);
        }

        $existingFollow = StoreFollower::where('store_id', $storeId)
            ->where('user_id', $user->id)
            ->first();

        if ($existingFollow) {
            return response()->json([
                'success' => true,
                'is_following' => true,
                'followers_count' => StoreFollower::getFollowersCount($storeId),
                'message' => 'Already following this store'
            ]);
        }

        StoreFollower::create([
            'store_id' => $storeId,
            'user_id' => $user->id,
        ]);

        Log::info('Store followed', [
            'user_id' => $user->id,
            'store_id' => $storeId,
        ]);

        return response()->json([
            'success' => true,
            'is_following' => true,
            'followers_count' => StoreFollower::getFollowersCount($storeId),
            'message' => 'Store followed successfully'
        ]);
    }

    public function unfollow($storeId, Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please login.'
            ], 401);
        }

        $store = Store::findOrFail($storeId);

        $follow = StoreFollower::where('store_id', $storeId)
            ->where('user_id', $user->id)
            ->first();

        if (!$follow) {
            return response()->json([
                'success' => false,
                'message' => 'You are not following this store'
            ], 400);
        }

        $follow->delete();

        return response()->json([
            'success' => true,
            'is_following' => false,
            'followers_count' => StoreFollower::getFollowersCount($storeId),
            'message' => 'Store unfollowed successfully'
        ]);
    }

    public function checkFollow($storeId, Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please login.'
            ], 401);
        }

        $store = Store::findOrFail($storeId);

        $isFollowing = StoreFollower::isFollowing($storeId, $user->id);

        return response()->json([
            'is_following' => $isFollowing,
            'followers_count' => StoreFollower::getFollowersCount($storeId),
        ]);
    }

    public function followers($storeId, Request $request)
    {
        $store = Store::findOrFail($storeId);

        $followers = StoreFollower::where('store_id', $storeId)
            ->with('user:id,name,avatar,google_avatar,facebook_avatar,verified')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($followers);
    }

    public function analytics(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please login.'
            ], 401);
        }

        $store = Store::where('user_id', $user->id)->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have a store yet.'
            ], 404);
        }

        $period = $request->get('period', '30d');

        $days = match ($period) {
            '7d' => 7,
            '90d' => 90,
            default => 30,
        };

        $startDate = now()->subDays($days)->toDateString();
        $endDate = now()->toDateString();

        $dailyStats = StoreAnalytic::getPeriodStats($store->id, $startDate, $endDate);

        $summary = [
            'total_views' => $dailyStats->sum('views'),
            'total_unique_visitors' => $dailyStats->sum('unique_visitors'),
            'total_contact_clicks' => $dailyStats->sum('contact_clicks'),
            'total_whatsapp_clicks' => $dailyStats->sum('whatsapp_clicks'),
            'total_phone_clicks' => $dailyStats->sum('phone_clicks'),
            'current_followers' => StoreFollower::getFollowersCount($store->id),
            'current_active_ads' => $store->active_ads_count,
            'period' => $period,
        ];

        return response()->json([
            'success' => true,
            'summary' => $summary,
            'daily' => $dailyStats,
        ]);
    }

    public function dashboardAnalytics(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please login.'
            ], 401);
        }

        $store = Store::where('user_id', $user->id)->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have a store yet.'
            ], 404);
        }

        $startDate = now()->subDays(7)->toDateString();
        $endDate = now()->toDateString();

        $thisWeekStats = StoreAnalytic::getPeriodStats($store->id, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'total_views' => StoreAnalytic::where('store_id', $store->id)->sum('views'),
            'total_followers' => StoreFollower::getFollowersCount($store->id),
            'total_ads' => Ad::where('store_id', $store->id)->where('status', 'active')->count(),
            'this_week_views' => $thisWeekStats->sum('views'),
            'this_week_followers' => $thisWeekStats->sum('followers_count'),
        ]);
    }

    public function getByUser($userId)
    {
        $store = Store::with(['user', 'location'])
            ->where('user_id', $userId)
            ->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Store not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'store' => $store,
        ]);
    }

    public function checkSlug(Request $request)
    {
        $slug = $request->get('slug');

        if (!$slug) {
            return response()->json([
                'success' => false,
                'message' => 'Slug parameter is required'
            ], 422);
        }

        $exists = Store::where('slug', $slug)->exists();

        return response()->json([
            'available' => !$exists,
            'slug' => $slug,
        ]);
    }

    // Admin Methods
    public function adminIndex(Request $request)
    {
        $query = Store::with(['user', 'location']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('slug', 'like', "%{$request->search}%");
            });
        }

        $stores = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($stores);
    }

    public function adminVerify(Request $request, $id)
    {
        $store = Store::findOrFail($id);

        $store->update([
            'is_verified' => true,
            'verification_status' => 'verified',
            'verified_at' => now(),
            'verified_by' => $request->user()->id,
        ]);

        NotificationService::send(
            $store->user_id,
            'store_verified',
            'Store Verified ✅',
            "Congratulations! Your store '{$store->name}' has been verified.",
            ['store_id' => $store->id, 'store_slug' => $store->slug]
        );

        return response()->json(['message' => 'Store verified', 'store' => $store]);
    }

    public function adminSuspend(Request $request, $id)
    {
        $store = Store::findOrFail($id);
        $store->update(['status' => 'suspended']);

        NotificationService::send(
            $store->user_id,
            'store_suspended',
            'Store Suspended ⚠️',
            "Your store '{$store->name}' has been suspended. Contact support for details.",
            ['store_id' => $store->id]
        );

        return response()->json(['message' => 'Store suspended', 'store' => $store]);
    }

    public function adminActivate(Request $request, $id)
    {
        $store = Store::findOrFail($id);
        $store->update(['status' => 'active']);

        NotificationService::send(
            $store->user_id,
            'store_activated',
            'Store Activated ✅',
            "Your store '{$store->name}' has been reactivated.",
            ['store_id' => $store->id]
        );

        return response()->json(['message' => 'Store activated', 'store' => $store]);
    }

    public function adminDelete($id)
    {
        $store = Store::findOrFail($id);

        if ($store->logo) {
            Storage::disk('public')->delete($store->logo);
        }
        if ($store->banner) {
            Storage::disk('public')->delete($store->banner);
        }

        $store->delete();

        return response()->json(['message' => 'Store deleted']);
    }
}
