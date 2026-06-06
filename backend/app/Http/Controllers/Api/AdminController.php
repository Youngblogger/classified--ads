<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\User;
use App\Models\Category;
use App\Models\Location;
use App\Models\Notification;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Models\PaymentIntent;
use App\Models\BoostedAd;
use App\Models\Store;
use App\Models\UserVerification;
use App\Models\BusinessVerification;
use App\Services\NotificationService;
use App\Services\AdminEmailNotificationService;
use App\Services\CacheService;
use App\Services\AuditService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminController extends Controller
{

    // Dashboard Stats
    public function dashboard()
    {
        // Auto-approve pending ads based on settings
        $this->autoApprovePendingAds();

        $stats = [
            'total_users' => User::count(),
            'total_ads' => Ad::count(),
            'active_ads' => Ad::where('status', 'active')->count(),
            'pending_ads' => Ad::where('status', 'pending')->count(),
            'flagged_ads' => Ad::where('verification_status', 'flagged')->count(),
            'processing_ads' => Ad::where('processing_status', 'processing')->count(),
            'total_views' => Ad::sum('views'),
            'new_users_today' => User::whereDate('created_at', today())->count(),
            'new_ads_today' => Ad::whereDate('created_at', today())->count(),
            'active_boosts' => BoostedAd::active()->count(),
            'total_revenue' => PaymentIntent::where('status', 'paid')->sum('amount'),
            'pending_payments' => PaymentIntent::where('status', 'pending')->count(),
        ];

        $recentAds = Ad::with(['user', 'category', 'location'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentUsers = User::orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'recent_ads' => $recentAds,
            'recent_users' => $recentUsers,
        ]);
    }

    // Ads Management
    public function ads(Request $request)
    {
        // Auto-approve pending ads based on settings
        $this->autoApprovePendingAds();
        
        $query = Ad::with(['user', 'category', 'location', 'images']);

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->verification_status && $request->verification_status !== 'all') {
            $query->where('verification_status', $request->verification_status);
        }

        if ($request->processing_status && $request->processing_status !== 'all') {
            $query->where('processing_status', $request->processing_status);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $ads = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($ads);
    }

    // Auto-approve pending ads based on settings
    protected function autoApprovePendingAds(): void
    {
        try {
            $settings = DB::table('settings')->pluck('value', 'key')->toArray();
            $enabled = filter_var($settings['auto_approval_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
            
            if (!$enabled) {
                return;
            }
            
            $durationMinutes = (int) ($settings['approval_duration_minutes'] ?? 2);
            
            // Skip if duration is 0 (handled in store)
            if ($durationMinutes === 0) {
                return;
            }
            
            $cutoffTime = now()->subMinutes($durationMinutes);
            
            // Find and auto-approve pending ads older than duration
            Ad::where('status', 'pending')
                ->where('created_at', '<=', $cutoffTime)
                ->update(['status' => 'active']);
        } catch (\Exception $e) {
            // Silently fail - don't break the main functionality
        }
    }

    public function flaggedAds(Request $request)
    {
        $query = Ad::with(['user', 'category', 'location', 'images'])
            ->where('verification_status', 'flagged');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $ads = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($ads);
    }

    public function approveAd($id)
    {
        $ad = Ad::findOrFail($id);
        $ad->update(['status' => 'active']);
        
        NotificationService::adApproved($ad);
        NotificationService::notifyFollowersOfNewAd($ad);
        
        return response()->json(['message' => 'Ad approved', 'ad' => $ad]);
    }

    public function rejectAd($id)
    {
        $ad = Ad::findOrFail($id);
        $rejectionReason = request('reason', 'Your ad does not meet our listing guidelines.');
        $ad->update([
            'status' => 'rejected',
            'rejection_reason' => $rejectionReason,
        ]);
        
        NotificationService::adRejected($ad, $rejectionReason);
        
        return response()->json(['message' => 'Ad rejected', 'ad' => $ad]);
    }

    public function verifyAd($id)
    {
        $ad = Ad::findOrFail($id);
        
        // Toggle verification status
        $newStatus = !$ad->is_verified;
        $ad->update([
            'verification_status' => $newStatus ? 'verified' : 'pending',
            'is_verified' => $newStatus,
        ]);
        
        return response()->json([
            'message' => $newStatus ? 'Ad verified' : 'Verification removed', 
            'ad' => $ad,
            'is_verified' => $newStatus
        ]);
    }

    public function reprocessAd($id)
    {
        $ad = Ad::findOrFail($id);
        $ad->update([
            'processing_status' => 'pending',
            'verification_status' => 'pending',
        ]);
        
        \App\Jobs\ProcessAdJob::dispatch($ad->id);
        
        return response()->json(['message' => 'Ad queued for reprocessing', 'ad' => $ad]);
    }

    public function deleteAd($id)
    {
        $ad = Ad::findOrFail($id);
        $ad->delete();
        return response()->json(['success' => true, 'message' => 'Ad deleted']);
    }

    public function deactivateAd($id)
    {
        $ad = Ad::findOrFail($id);
        $ad->update(['status' => 'paused']);
        CacheService::invalidateAdCache($ad->id, $ad->category?->slug);
        return response()->json(['success' => true, 'message' => 'Ad deactivated', 'status' => 'paused']);
    }

    public function suspendAd($id)
    {
        $ad = Ad::findOrFail($id);
        $ad->update(['status' => 'suspended']);
        CacheService::invalidateAdCache($ad->id, $ad->category?->slug);
        return response()->json(['success' => true, 'message' => 'Ad suspended', 'status' => 'suspended']);
    }

    public function removeAd($id)
    {
        $ad = Ad::findOrFail($id);
        $ad->update(['status' => 'suspended']);
        CacheService::invalidateAdCache($ad->id, $ad->category?->slug);
        return response()->json(['success' => true, 'message' => 'Ad removed from listings', 'status' => 'suspended']);
    }

    public function getAd($id)
    {
        $ad = Ad::with(['user', 'category', 'subcategory', 'location', 'images'])->findOrFail($id);
        return response()->json(['data' => $ad]);
    }

    public function updateAd(Request $request, $id)
    {
        $ad = Ad::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric',
            'category_id' => 'sometimes|exists:categories,id',
            'location_id' => 'sometimes|exists:locations,id',
            'state' => 'sometimes|string|max:100',
            'lga' => 'sometimes|string|max:100',
            'attributes' => 'sometimes|array',
            'edited_by_admin' => 'sometimes|boolean',
        ]);

        $validated['edited_by_admin'] = true;
        
        // Handle attributes - convert to JSON if array
        if (isset($validated['attributes']) && is_array($validated['attributes'])) {
            $validated['attributes'] = json_encode($validated['attributes']);
        } elseif (isset($request['attributes']) && is_array($request['attributes'])) {
            $validated['attributes'] = json_encode($request['attributes']);
        }
        
        // If location_id is provided, use it
        // Otherwise, try to find location by state/lga
        if (!isset($validated['location_id']) && isset($validated['state'])) {
            $stateLoc = Location::where('name', $validated['state'])->first();
            if ($stateLoc) {
                if (!empty($validated['lga'])) {
                    $lgaLoc = Location::where('parent_id', $stateLoc->id)
                        ->where('name', $validated['lga'])
                        ->first();
                    if ($lgaLoc) {
                        $validated['location_id'] = $lgaLoc->id;
                    }
                }
                // If no LGA found, use state as location
                if (!isset($validated['location_id'])) {
                    $validated['location_id'] = $stateLoc->id;
                }
            }
        }
        
        $ad->update($validated);
        
        // Reload relationships
        $ad->load(['category', 'subcategory', 'location', 'images', 'user']);
        
        // Build a clean response with all needed data
        $response = [
            'id' => $ad->id,
            'title' => $ad->title,
            'slug' => $ad->slug,
            'description' => $ad->description,
            'price' => $ad->price,
            'status' => $ad->status,
            'edited_by_admin' => true,
            'category' => $ad->category ? [
                'id' => $ad->category->id,
                'name' => $ad->category->name,
                'slug' => $ad->category->slug,
            ] : null,
            'subcategory' => $ad->subcategory ? [
                'id' => $ad->subcategory->id,
                'name' => $ad->subcategory->name,
                'slug' => $ad->subcategory->slug,
            ] : null,
            'location' => $ad->location ? [
                'id' => $ad->location->id,
                'name' => $ad->location->name,
            ] : null,
            'state' => $ad->state,
            'lga' => $ad->lga,
            'attributes' => $ad->attributes ? (is_string($ad->attributes) ? json_decode($ad->attributes, true) : $ad->attributes) : null,
            'images' => $ad->images->map(function($img) {
                return [
                    'id' => $img->id,
                    'url' => $img->url,
                    'display_url' => $img->display_url,
                    'thumbnail_url' => $img->thumbnail_url,
                    'full_url' => $img->full_url,
                    'full_thumbnail_url' => $img->full_thumbnail_url,
                    'is_primary' => $img->is_primary,
                ];
            }),
            'user' => $ad->user ? [
                'id' => $ad->user->id,
                'name' => $ad->user->name,
            ] : null,
        ];
        
        return response()->json([
            'success' => true,
            'message' => 'Ad updated',
            'data' => $response
        ]);
    }

    public function uploadImages(Request $request, $id)
    {
        $ad = Ad::findOrFail($id);
        
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $uploadedImages = [];
        
        foreach ($request->file('images') as $imageFile) {
            $path = $imageFile->store('ads/' . $ad->id, 'public');
            $fullUrl = \Storage::url($path);
            
            $adImage = $ad->images()->create([
                'url' => $fullUrl,
                'display_url' => $fullUrl,
                'thumbnail_url' => $fullUrl,
                'full_url' => $fullUrl,
                'full_thumbnail_url' => $fullUrl,
                'is_primary' => $ad->images()->count() === 0,
            ]);
            
            $uploadedImages[] = $adImage;
        }
        
        $ad->load('images');
        
        // Return full URLs in the response
        $images = $ad->images->map(function ($img) {
            return [
                'id' => $img->id,
                'url' => $img->url,
                'display_url' => $img->display_url,
                'thumbnail_url' => $img->thumbnail_url,
                'full_url' => $img->full_url,
                'full_thumbnail_url' => $img->full_thumbnail_url,
                'is_primary' => $img->is_primary,
            ];
        });
        
        return response()->json([
            'success' => true,
            'message' => 'Images uploaded',
            'images' => $images
        ]);
    }

    public function deleteImage($id, $imageId)
    {
        $ad = Ad::findOrFail($id);
        $image = $ad->images()->findOrFail($imageId);
        
        // Delete file if exists
        if ($image->url && \Storage::disk('public')->exists($image->url)) {
            \Storage::disk('public')->delete($image->url);
        }
        
        $image->delete();
        
        // If deleted image was primary, make another image primary
        if ($image->is_primary) {
            $firstImage = $ad->images()->first();
            if ($firstImage) {
                $firstImage->update(['is_primary' => true]);
            }
        }
        
        $ad->load('images');
        
        // Return full URLs
        $images = $ad->images->map(function ($img) {
            return [
                'id' => $img->id,
                'url' => $img->url,
                'display_url' => $img->display_url,
                'thumbnail_url' => $img->thumbnail_url,
                'full_url' => $img->full_url,
                'full_thumbnail_url' => $img->full_thumbnail_url,
                'is_primary' => $img->is_primary,
            ];
        });
        
        return response()->json([
            'success' => true,
            'message' => 'Image deleted',
            'images' => $images
        ]);
    }

    public function updateImageOrder(Request $request, $id)
    {
        $ad = Ad::findOrFail($id);
        
        $validated = $request->validate([
            'image_ids' => 'required|array',
            'image_ids.*' => 'integer|exists:ad_images,id'
        ]);
        
        // Update order - first image becomes primary
        $firstImage = true;
        foreach ($validated['image_ids'] as $imageId) {
            $ad->images()->where('id', $imageId)->update([
                'is_primary' => $firstImage,
                'sort_order' => $firstImage ? 0 : array_search($imageId, $validated['image_ids']) + 1
            ]);
            $firstImage = false;
        }
        
        $ad->load('images');
        
        // Return full URLs
        $images = $ad->images->map(function ($img) {
            return [
                'id' => $img->id,
                'url' => $img->url,
                'display_url' => $img->display_url,
                'thumbnail_url' => $img->thumbnail_url,
                'full_url' => $img->full_url,
                'full_thumbnail_url' => $img->full_thumbnail_url,
                'is_primary' => $img->is_primary,
            ];
        });
        
        return response()->json([
            'success' => true,
            'message' => 'Image order updated',
            'images' => $images
        ]);
    }

    public function featureAd($id)
    {
        $ad = Ad::findOrFail($id);
        $ad->update(['is_featured' => !$ad->is_featured]);
        
        return response()->json([
            'message' => $ad->is_featured ? 'Ad featured' : 'Ad unfeatured',
            'ad' => $ad,
            'is_featured' => $ad->is_featured
        ]);
    }

    public function promoteAd($id)
    {
        $ad = Ad::findOrFail($id);
        // Toggle promoted status (you might want to add a separate column for this)
        $ad->update(['is_featured' => true]);
        
        return response()->json([
            'message' => 'Ad promoted',
            'ad' => $ad
        ]);
    }

    public function bulkDeleteAds(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:ads,id'
        ]);

        Ad::whereIn('id', $validated['ids'])->delete();

        return response()->json(['message' => 'Ads deleted successfully', 'count' => count($validated['ids'])]);
    }

    // Users Management
    public function users(Request $request)
    {
        $query = User::query();

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->role) {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($users);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $wasVerified = $user->verified;
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $id,
            'role' => 'sometimes|in:user,admin,moderator',
            'status' => 'sometimes|in:active,suspended,banned',
            'verified' => 'sometimes|boolean',
        ]);

        $user->update($validated);
        
        if (isset($validated['verified']) && $validated['verified'] && !$wasVerified) {
            NotificationService::accountVerified($user);
        }
        
        return response()->json($user);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }

    public function suspendUser($id)
    {
        $user = User::findOrFail($id);
        $user->update([
            'status' => 'suspended',
            'suspended_at' => now(),
        ]);
        
        NotificationService::accountSuspended($user);
        
        return response()->json(['message' => 'User suspended', 'user' => $user]);
    }

    public function banUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $reason = $request->reason ?? 'Violation of terms';
        $user->update([
            'status' => 'banned',
            'banned_at' => now(),
            'ban_reason' => $reason,
        ]);
        
        NotificationService::accountBanned($user, $reason);
        
        return response()->json(['message' => 'User banned', 'user' => $user]);
    }

    public function activateUser($id)
    {
        $user = User::findOrFail($id);
        $wasStatus = $user->status;
        $user->update([
            'status' => 'active',
            'suspended_at' => null,
            'banned_at' => null,
            'ban_reason' => null,
        ]);
        
        if ($wasStatus === 'suspended' || $wasStatus === 'banned') {
            NotificationService::accountUnsuspended($user);
        }
        
        return response()->json(['message' => 'User activated', 'user' => $user]);
    }

    // Categories Management
    public function categories(Request $request)
    {
        $all = Category::with(['children' => function ($q) {
            $q->with(['children' => function ($qq) {
                $qq->orderBy('sort_order')->orderBy('name');
            }])->orderBy('sort_order')->orderBy('name');
        }])->orderBy('sort_order')->orderBy('name')->get();

        $parents = $all->whereNull('parent_id')->values();
        return response()->json([
            'tree' => $parents,
            'all' => $all,
        ]);
    }

    public function reorderCategories(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:categories,id',
            'items.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($request->items as $item) {
            Category::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        Cache::forget('categories_mega_menu');
        return response()->json(['message' => 'Categories reordered']);
    }

    public function createCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories',
            'icon' => 'nullable|string',
            'image' => 'nullable|string',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'is_trending' => 'sometimes|boolean',
            'category_badge' => 'nullable|string|max:50',
            'sort_order' => 'sometimes|integer',
        ]);

        $category = Category::create($validated);
        return response()->json($category, 201);
    }

    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:categories,slug,' . $id,
            'icon' => 'nullable|string',
            'image' => 'nullable|string',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'is_trending' => 'sometimes|boolean',
            'category_badge' => 'nullable|string|max:50',
            'sort_order' => 'sometimes|integer',
        ]);

        $category->update($validated);
        return response()->json($category);
    }

    public function deleteCategory($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }

    public function uploadCategoryImage(Request $request)
    {
        $request->validate([
            'image' => 'required|file|mimes:jpeg,png,jpg,webp,svg|max:2048',
        ]);

        $file = $request->file('image');
        $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('categories', $filename, 'public');

        return response()->json([
            'url' => Storage::url($path),
            'path' => $path,
        ]);
    }

    // Locations Management
    public function locations(Request $request)
    {
        $locations = Location::where('is_active', true)
            ->whereNull('parent_id')
            ->with(['children' => function ($query) {
                $query->where('is_active', true)->orderBy('name');
            }])
            ->orderBy('name')
            ->get()
            ->map(function ($state) {
                return [
                    'id' => $state->id,
                    'name' => $state->name,
                    'slug' => $state->slug,
                    'lgas' => $state->children->map(function ($lga) {
                        return [
                            'id' => $lga->id,
                            'name' => $lga->name
                        ];
                    })
                ];
            });
        
        return response()->json(['data' => $locations]);
    }

    public function createLocation(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:locations',
            'parent_id' => 'nullable|exists:locations,id',
        ]);

        $location = Location::create($validated);
        return response()->json($location, 201);
    }

    public function updateLocation(Request $request, $id)
    {
        $location = Location::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:locations,slug,' . $id,
            'is_active' => 'sometimes|boolean',
        ]);

        $location->update($validated);
        return response()->json($location);
    }

    public function deleteLocation($id)
    {
        $location = Location::findOrFail($id);
        $location->delete();
        return response()->json(['message' => 'Location deleted']);
    }

    // Reports
    public function reports(Request $request)
    {
        $reports = DB::table('reports')
            ->join('users', 'reports.user_id', '=', 'users.id')
            ->join('ads', 'reports.ad_id', '=', 'ads.id')
            ->select('reports.*', 'users.name as reporter_name', 'ads.title as ad_title')
            ->orderBy('reports.created_at', 'desc')
            ->paginate(20);

        return response()->json($reports);
    }

    public function resolveReport($id)
    {
        DB::table('reports')->where('id', $id)->update(['status' => 'resolved']);
        return response()->json(['message' => 'Report resolved']);
    }

    // Analytics
    public function analytics(Request $request)
    {
        $days = match($request->period) {
            '7days' => 7,
            '30days' => 30,
            '90days' => 90,
            'year' => 365,
            default => 7,
        };
        
        $adsByDay = Ad::select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $usersByDay = User::select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $categoryStats = Category::withCount('ads')
            ->orderBy('ads_count', 'desc')
            ->limit(10)
            ->get();

        // Transform data for frontend charts
        $userGrowth = $usersByDay->map(function($item) {
            return [
                'name' => Carbon::parse($item->date)->format('M d'),
                'users' => (int) $item->count
            ];
        })->toArray();

        $adsPosted = $adsByDay->map(function($item) {
            return [
                'name' => Carbon::parse($item->date)->format('M d'),
                'ads' => (int) $item->count
            ];
        })->toArray();

        $categoryColorsArr = ['#0ea5e9', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#64748b', '#f97316', '#a855f7', '#3b82f6'];
        $categoryDistribution = $categoryStats->map(function($cat, $index) use ($categoryColorsArr) {
            return [
                'name' => $cat->name,
                'value' => (int) $cat->ads_count,
                'color' => $categoryColorsArr[$index % count($categoryColorsArr)]
            ];
        })->toArray();

        // Ad status distribution
        $adStatusCounts = Ad::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();
        
        $statusColors = [
            'active' => '#10b981',
            'pending' => '#f59e0b',
            'rejected' => '#ef4444',
            'expired' => '#6b7280',
        ];
        
        $adStatus = $adStatusCounts->map(function($status) use ($statusColors) {
            return [
                'name' => ucfirst($status->status),
                'value' => (int) $status->count,
                'color' => $statusColors[$status->status] ?? '#64748b'
            ];
        })->toArray();

        return response()->json([
            'user_growth' => $userGrowth,
            'ads_posted' => $adsPosted,
            'category_distribution' => $categoryDistribution,
            'ad_status' => $adStatus,
        ]);
    }

    // Top States by Ad Posts with Categories
    public function statesAnalytics(Request $request)
    {
        $limit = $request->limit ?? 20;
        $sortBy = $request->sort_by ?? 'total_ads';
        $sortOrder = $request->sort_order ?? 'desc';

        $statesData = Ad::select('locations.name as state_name', 'locations.id as location_id')
            ->join('locations', 'ads.location_id', '=', 'locations.id')
            ->where('ads.status', 'active')
            ->groupBy('locations.id', 'locations.name')
            ->selectRaw('COUNT(ads.id) as total_ads')
            ->orderBy('total_ads', 'desc')
            ->limit($limit)
            ->get();

        $result = [];
        foreach ($statesData as $state) {
            $topCategories = Ad::select('categories.name', 'categories.id')
                ->join('categories', 'ads.category_id', '=', 'categories.id')
                ->where('ads.location_id', $state->location_id)
                ->where('ads.status', 'active')
                ->groupBy('categories.id', 'categories.name')
                ->selectRaw('COUNT(ads.id) as ad_count')
                ->orderBy('ad_count', 'desc')
                ->limit(3)
                ->pluck('name')
                ->toArray();

            $result[] = [
                'state' => $state->state_name,
                'total_ads' => (int) $state->total_ads,
                'top_categories' => $topCategories,
            ];
        }

        if ($sortBy === 'total_ads') {
            usort($result, function ($a, $b) use ($sortOrder) {
                return $sortOrder === 'desc' ? $b['total_ads'] - $a['total_ads'] : $a['total_ads'] - $b['total_ads'];
            });
        }

        return response()->json($result);
    }

    // Messages (Admin view)
    public function messages()
    {
        $messages = DB::table('conversations')
            ->join('users as sender', 'conversations.sender_id', '=', 'sender.id')
            ->join('users as receiver', 'conversations.receiver_id', '=', 'receiver.id')
            ->select('conversations.*', 'sender.name as sender_name', 'receiver.name as receiver_name')
            ->orderBy('conversations.updated_at', 'desc')
            ->paginate(20);

        return response()->json($messages);
    }

    // Broadcast
    public function broadcast(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'recipient_type' => 'required|in:all,users,admins',
        ]);

        // Get users to notify
        $users = User::query();
        
        if ($validated['recipient_type'] === 'admins') {
            $users->where('role', 'admin');
        } elseif ($validated['recipient_type'] === 'users') {
            $users->where('role', 'user');
        }
        
        $recipients = $users->get();
        $count = 0;
        
        foreach ($recipients as $user) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'broadcast',
                'title' => $validated['title'],
                'message' => $validated['message'],
                'data' => ['broadcast' => true],
            ]);
            $count++;
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Broadcast sent successfully',
            'recipients' => $count,
        ]);
    }

    // Settings
    public function settings()
    {
        $settings = DB::table('settings')->pluck('value', 'key');
        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        foreach ($request->all() as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $value, 'updated_at' => now()]
            );
        }
        return response()->json(['message' => 'Settings updated']);
    }

    // Bank Transfer Management
    public function bankTransfers(Request $request)
    {
        $query = Transaction::with(['user', 'wallet'])
            ->where('payment_method', 'bank_transfer')
            ->where('type', 'credit');

        // Filter by status
        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by user email or reference
        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('email', 'like', "%{$search}%")
                               ->orWhere('name', 'like', "%{$search}%");
                  });
            });
        }

        $transfers = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($transfers);
    }

    public function approveBankTransfer(Request $request, $id)
    {
        $request->validate([
            'admin_note' => 'nullable|string|max:500',
        ]);

        $transaction = Transaction::with(['user', 'wallet'])->findOrFail($id);

        // Check if already processed
        if ($transaction->status !== 'pending') {
            return response()->json([
                'message' => 'Transaction has already been processed',
            ], 400);
        }

        // Use DB transaction for atomicity
        DB::transaction(function () use ($transaction, $request) {
            $wallet = $transaction->wallet;
            $balanceBefore = $wallet->balance;

            // Credit wallet
            $wallet->increment('balance', $transaction->amount);
            $wallet->refresh();

            // Update transaction
            $transaction->update([
                'status' => 'success',
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->balance,
                'processed_at' => now(),
                'processed_by' => $request->user()->id,
                'admin_note' => $request->admin_note,
                'is_suspicious' => false, // Clear suspicious flag after manual review
            ]);

            // Log the action
            \Illuminate\Support\Facades\Log::info('Bank transfer approved', [
                'transaction_id' => $transaction->id,
                'admin_id' => $request->user()->id,
                'amount' => $transaction->amount,
            ]);
        });

        // Send notification to user
        $transaction->user->notify(new \App\Notifications\WalletFundedNotification(
            $transaction->amount,
            'Bank transfer approved'
        ));

        return response()->json([
            'message' => 'Bank transfer approved successfully',
            'transaction' => $transaction->fresh(),
        ]);
    }

    public function rejectBankTransfer(Request $request, $id)
    {
        $request->validate([
            'admin_note' => 'required|string|max:500',
        ]);

        $transaction = Transaction::with(['user', 'wallet'])->findOrFail($id);

        // Check if already processed
        if ($transaction->status !== 'pending') {
            return response()->json([
                'message' => 'Transaction has already been processed',
            ], 400);
        }

        // Update transaction
        $transaction->update([
            'status' => 'failed',
            'processed_at' => now(),
            'processed_by' => $request->user()->id,
            'admin_note' => $request->admin_note,
        ]);

        // Log the action
        \Illuminate\Support\Facades\Log::info('Bank transfer rejected', [
            'transaction_id' => $transaction->id,
            'admin_id' => $request->user()->id,
            'reason' => $request->admin_note,
        ]);

        return response()->json([
            'message' => 'Bank transfer rejected',
            'transaction' => $transaction->fresh(),
        ]);
    }

    public function getBankTransferStats()
    {
        $stats = [
            'pending' => Transaction::where('payment_method', 'bank_transfer')
                ->where('status', 'pending')
                ->count(),
            'approved' => Transaction::where('payment_method', 'bank_transfer')
                ->where('status', 'success')
                ->count(),
            'rejected' => Transaction::where('payment_method', 'bank_transfer')
                ->where('status', 'failed')
                ->count(),
            'suspicious' => Transaction::where('payment_method', 'bank_transfer')
                ->where('is_suspicious', true)
                ->where('status', 'pending')
                ->count(),
            'total_amount_pending' => Transaction::where('payment_method', 'bank_transfer')
                ->where('status', 'pending')
                ->sum('amount'),
            'total_amount_approved' => Transaction::where('payment_method', 'bank_transfer')
                ->where('status', 'success')
                ->sum('amount'),
        ];

        return response()->json($stats);
    }

    // Admin Notifications - Get recent admin-relevant notifications
    public function notifications(Request $request)
    {
        // Get notifications from admin_notifications table (only pending ads and reports)
        $notifications = \App\Models\AdminNotification::orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'is_read' => $notification->is_read,
                    'created_at' => $notification->created_at->toISOString(),
                    'data' => [
                        'reference_type' => $notification->reference_type,
                        'reference_id' => $notification->reference_id,
                    ],
                ];
            });
        
        // Get pending ads count for badge
        $pendingAdsCount = \App\Models\AdminNotification::where('type', 'new_ad_pending')
            ->where('is_read', false)
            ->count();
        
        return response()->json([
            'data' => $notifications,
            'pending_ads_count' => $pendingAdsCount,
        ]);
    }
    
    // Mark admin notification as read
    public function markNotificationRead($id)
    {
        $notification = \App\Models\AdminNotification::findOrFail($id);
        $notification->update(['is_read' => true]);
        
        return response()->json(['success' => true]);
    }

    public function payments(Request $request)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:pending,paid,failed,expired,cancelled',
            'type' => 'nullable|in:boost,wallet,other',
            'limit' => 'integer|min:1|max:100',
            'page' => 'integer|min:1',
        ]);

        $query = PaymentIntent::with(['user', 'ad']);

        if ($validated['status'] ?? null) {
            $query->where('status', $validated['status']);
        }

        if ($validated['type'] ?? null) {
            $query->where('type', $validated['type']);
        }

        $limit = $validated['limit'] ?? 20;
        $page = $validated['page'] ?? 1;

        $payments = $query->orderBy('created_at', 'desc')
            ->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'data' => $payments->items(),
            'meta' => [
                'total' => $payments->total(),
                'current_page' => $payments->currentPage(),
                'per_page' => $payments->perPage(),
                'last_page' => $payments->lastPage(),
            ],
        ]);
    }

    public function paymentSummary()
    {
        $totalRevenue = PaymentIntent::where('status', 'paid')->sum('amount');
        $pendingCount = PaymentIntent::where('status', 'pending')->count();
        $failedCount = PaymentIntent::where('status', 'failed')->count();
        $paidCount = PaymentIntent::where('status', 'paid')->count();

        $revenueByType = PaymentIntent::where('status', 'paid')
            ->selectRaw('type, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('type')
            ->get()
            ->pluck('total', 'type')
            ->toArray();

        $recentPayments = PaymentIntent::with(['user', 'ad'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => [
                'total_revenue' => $totalRevenue,
                'currency' => 'NGN',
                'payments' => [
                    'total' => $paidCount + $pendingCount + $failedCount,
                    'paid' => $paidCount,
                    'pending' => $pendingCount,
                    'failed' => $failedCount,
                ],
                'revenue_by_type' => $revenueByType,
                'recent_payments' => $recentPayments,
            ],
        ]);
    }

    public function boosts(Request $request)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:active,expired,cancelled',
            'boost_type' => 'nullable|in:top,featured,highlight',
            'limit' => 'integer|min:1|max:100',
            'page' => 'integer|min:1',
        ]);

        $query = BoostedAd::with(['ad' => function ($q) {
            $q->with(['images', 'category', 'location']);
        }, 'user']);

        if ($validated['status'] ?? null) {
            $query->where('status', $validated['status']);
        }

        if ($validated['boost_type'] ?? null) {
            $query->where('boost_type', $validated['boost_type']);
        }

        $limit = $validated['limit'] ?? 20;
        $page = $validated['page'] ?? 1;

        $boosts = $query->orderBy('created_at', 'desc')
            ->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'data' => $boosts->items(),
            'meta' => [
                'total' => $boosts->total(),
                'current_page' => $boosts->currentPage(),
                'per_page' => $boosts->perPage(),
                'last_page' => $boosts->lastPage(),
            ],
        ]);
    }

    public function deactivateBoost($id)
    {
        $boost = BoostedAd::findOrFail($id);

        if ($boost->status === 'expired' || $boost->status === 'cancelled') {
            return response()->json(['error' => 'Boost is already inactive'], 400);
        }

        $boost->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Boost deactivated']);
    }

    public function extendBoost(Request $request, $id)
    {
        $validated = $request->validate([
            'days' => 'required|integer|min:1|max:365',
        ]);

        $boost = BoostedAd::findOrFail($id);

        if ($boost->status === 'cancelled') {
            return response()->json(['error' => 'Cannot extend cancelled boost'], 400);
        }

        if ($boost->status === 'expired') {
            $boost->update([
                'status' => 'active',
                'end_time' => now()->addDays($validated['days']),
            ]);
        } else {
            $boost->update([
                'end_time' => $boost->end_time->copy()->addDays($validated['days']),
            ]);
        }

        return response()->json([
            'message' => 'Boost extended',
            'new_end_time' => $boost->end_time->toISOString(),
        ]);
    }

    public function adsWithBoosts(Request $request)
    {
        $query = Ad::with(['activeBoost', 'images'])
            ->whereHas('activeBoost')
            ->orderBy('created_at', 'desc');

        $limit = $request->input('limit', 20);
        $page = $request->input('page', 1);

        $ads = $query->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'data' => $ads->items(),
            'meta' => [
                'total' => $ads->total(),
                'current_page' => $ads->currentPage(),
                'per_page' => $ads->perPage(),
                'last_page' => $ads->lastPage(),
            ],
        ]);
    }

    // Verification Management
    public function verifications(Request $request)
    {
        $query = UserVerification::with(['user', 'verifiedBy']);

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $verifications = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($verifications);
    }

    public function verificationDetail($id)
    {
        $verification = UserVerification::with(['user', 'verifiedBy'])->findOrFail($id);
        return response()->json($verification);
    }

    public function approveVerification(Request $request, $id)
    {
        $verification = UserVerification::findOrFail($id);

        if ($verification->status !== 'pending') {
            return response()->json(['message' => 'Verification is not pending'], 400);
        }

        $admin = $request->user();
        $verification->approve($admin->id);

        $verification->user->refresh();
        if ($verification->user->verification_progress['is_full_verified_seller']) {
            $verification->user->update([
                'is_verified_seller' => true,
                'seller_verified_at' => now(),
            ]);
            NotificationService::sellerBadgeActivated($verification->user);
        }

        NotificationService::send(
            $verification->user_id,
            'verification_approved',
            'Verification Approved ✅',
            "Your {$verification->type} verification has been approved!",
            ['type' => $verification->type]
        );

        AuditService::verificationApproved($verification->id, $admin->id, $verification->user_id, $verification->type);

        return response()->json(['message' => 'Verification approved', 'verification' => $verification]);
    }

    public function rejectVerification(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string']);

        $verification = UserVerification::findOrFail($id);

        if ($verification->status !== 'pending') {
            return response()->json(['message' => 'Verification is not pending'], 400);
        }

        $admin = $request->user();
        $verification->reject($request->reason, $admin->id);

        $verification->user->update([
            'is_verified_seller' => false,
            'seller_verified_at' => null,
        ]);

        NotificationService::send(
            $verification->user_id,
            'verification_rejected',
            'Verification Rejected ❌',
            "Your {$verification->type} verification was not approved. Reason: {$request->reason}",
            ['type' => $verification->type, 'reason' => $request->reason]
        );

        AuditService::verificationRejected($verification->id, $admin->id, $verification->user_id, $verification->type, $request->reason);

        return response()->json(['message' => 'Verification rejected', 'verification' => $verification]);
    }

    public function verificationStats(Request $request)
    {
        $stats = [
            'total' => UserVerification::count(),
            'pending' => UserVerification::where('status', 'pending')->count(),
            'approved' => UserVerification::where('status', 'approved')->count(),
            'rejected' => UserVerification::where('status', 'rejected')->count(),
            'by_type' => UserVerification::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
            'pending_by_type' => UserVerification::where('status', 'pending')
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
        ];

        return response()->json($stats);
    }

    // Business Verification Management
    public function businessVerifications(Request $request)
    {
        $query = BusinessVerification::with(['user', 'reviewedBy']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $verifications = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($verifications);
    }

    public function businessVerificationDetail($id)
    {
        $verification = BusinessVerification::with(['user', 'reviewedBy'])->findOrFail($id);
        return response()->json($verification);
    }

    public function approveBusinessVerification(Request $request, $id)
    {
        $verification = BusinessVerification::findOrFail($id);

        if ($verification->status !== 'pending') {
            return response()->json(['message' => 'Verification is not pending'], 400);
        }

        $admin = $request->user();
        $verification->approve($admin->id);

        NotificationService::businessBadgeActivated($verification->user, $verification->business_name);

        AuditService::businessVerificationApproved($verification->id, $admin->id, $verification->user_id, $verification->business_name);

        return response()->json(['message' => 'Business verification approved', 'verification' => $verification]);
    }

    public function rejectBusinessVerification(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string']);

        $verification = BusinessVerification::findOrFail($id);

        if ($verification->status !== 'pending') {
            return response()->json(['message' => 'Verification is not pending'], 400);
        }

        $admin = $request->user();
        $verification->reject($request->reason, $admin->id);

        NotificationService::send(
            $verification->user_id,
            'business_verification_rejected',
            'Business Verification Rejected ❌',
            "Your business verification was not approved. Reason: {$request->reason}",
            ['business_name' => $verification->business_name, 'reason' => $request->reason]
        );

        AuditService::businessVerificationRejected($verification->id, $admin->id, $verification->user_id, $verification->business_name, $request->reason);

        return response()->json(['message' => 'Business verification rejected', 'verification' => $verification]);
    }

    public function businessVerificationStats(Request $request)
    {
        $stats = [
            'total' => BusinessVerification::count(),
            'pending' => BusinessVerification::where('status', 'pending')->count(),
            'approved' => BusinessVerification::where('status', 'approved')->count(),
            'rejected' => BusinessVerification::where('status', 'rejected')->count(),
        ];

        return response()->json($stats);
    }
}
