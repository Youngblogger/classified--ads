<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\AdListResource;
use App\Http\Resources\Api\AdDetailResource;
use App\Models\Ad;
use App\Models\AdImage;
use App\Models\BoostedAd;
use App\Models\PaymentIntent;
use App\Services\AdminEmailNotificationService;
use App\Services\BoostAdService;
use App\Services\PaymentService;
use App\Services\RecentlyViewedService;
use App\Services\CacheService;
use App\Services\BoostTierService;
use App\Services\SavedAdService;
use App\Services\CloudinaryService;
use App\Services\ImageProcessingService;
use App\Services\AdImageCacheService;
use App\Jobs\Cloudinary\DeleteCloudinaryFileJob;
use App\Jobs\ProcessAdImageJob;
use App\Events\AdSaved;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdController extends Controller
{
    public function index(Request $request)
    {
        try {
            $limit = min((int) $request->input('limit', 20), 50);
            $page = max((int) $request->input('page', 1), 1);

            $query = Ad::forListing();

            if ($request->category) {
                $query->byCategory($request->category);
            }
            if ($request->subcategory) {
                $query->bySubcategory($request->subcategory);
            }
            if ($request->location) {
                $query->byLocation($request->location);
            }
            if ($request->search) {
                $query->search($request->search);
            }

            $tierService = app(BoostTierService::class);
            $boostData = $tierService->getBoostedAdsForListing();
            $boostedIds = $boostData['boosted_ad_ids'] ?? [];

            $query->reorder();
            if (!empty($boostedIds)) {
                $idList = implode(',', array_map('intval', $boostedIds));
                $query->orderByRaw("FIELD(id, {$idList}) DESC");
            }
            $query->orderBy('created_at', 'desc');

            $totalCount = (clone $query)->count();
            $lastPage = (int) ceil($totalCount / $limit);

            $allAds = $query->paginate($limit, ['*'], 'page', $page);

            try {
                $sortCallback = $tierService->getPrioritySortCallback();
                $sorted = $allAds->getCollection()->sortByDesc($sortCallback)->values();
                $allAds->setCollection($sorted);
            } catch (\Exception $e) {
                Log::warning('Boost priority sort failed', ['error' => $e->getMessage()]);
            }

            return AdListResource::collection($allAds)
                ->response()
                ->setStatusCode(200)
                ->header('Cache-Control', 'public, max-age=120, s-maxage=120');
        } catch (\Exception $e) {
            Log::error('Failed to fetch ads: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load ads'], 500);
        }
    }

    public function recent(Request $request)
    {
        try {
            $limit = min((int) $request->input('limit', 20), 50);

            $ads = Ad::forListing()
                ->limit($limit)
                ->get();

            return AdListResource::collection($ads)
                ->response()
                ->header('Cache-Control', 'public, max-age=60, s-maxage=60');
        } catch (\Exception $e) {
            Log::error('Failed to fetch recent ads', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to load recent ads'], 500);
        }
    }

    public function featured(Request $request)
    {
        try {
            $limit = min((int) $request->input('limit', 20), 50);

            $ads = Ad::forListing()
                ->featured()
                ->limit($limit)
                ->get();

            return AdListResource::collection($ads)
                ->response()
                ->header('Cache-Control', 'public, max-age=120, s-maxage=120');
        } catch (\Exception $e) {
            Log::error('Failed to fetch featured ads', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to load featured ads'], 500);
        }
    }

    public function show(Request $request, $slug)
    {
        try {
            $cacheKey = 'ad_detail_slug_' . $slug;
            $cached = CacheService::get($cacheKey);
            if ($cached) {
                return response()->json(['data' => $cached])
                    ->header('Cache-Control', 'private, max-age=300');
            }

            $ad = Ad::with([
                'images' => fn($q) => $q->orderBy('sort_order')->orderBy('is_primary', 'desc'),
                'category.categoryFields',
                'location',
                'user',
                'activeBoost.plan',
            ])
                ->where('slug', $slug)
                ->active()
                ->first();

            if (!$ad) {
                return response()->json(['error' => 'Ad not found'], 404);
            }

            $ad->increment('views');

            $userId = $request->user()?->id;
            if ($userId) {
                app(RecentlyViewedService::class)->trackView($userId, $ad->id);
            }

            $response = new AdDetailResource($ad);

            $responseData = $response->toArray($request);
            CacheService::put($cacheKey, $responseData, 60);

            return response()->json(['data' => $responseData])
                ->header('Cache-Control', 'private, max-age=60');
        } catch (\Exception $e) {
            Log::error('Failed to fetch ad: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load ad'], 500);
        }
    }

    public function showById(Request $request, $id)
    {
        try {
            $ad = Ad::with(['images', 'category', 'location', 'user'])
                ->find($id);

            if (!$ad) {
                return response()->json(['error' => 'Ad not found'], 404);
            }

            return response()->json([
                'data' => new AdDetailResource($ad),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch ad by ID: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load ad'], 500);
        }
    }

    public function store(Request $request)
    {
        $startTime = microtime(true);

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string|max:5000',
                'price' => 'required|numeric|min:0',
                'currency' => 'nullable|string|in:NGN,USD,EUR,GBP',
                'category_id' => 'required|exists:categories,id',
                'location_id' => 'nullable',
                'state' => 'nullable|string|max:100',
                'lga' => 'nullable|string|max:100',
                'condition' => 'required|in:new,like_new,good,fair',
                'phone' => 'required|string|max:20',
                'whatsapp' => 'nullable|string|max:20',
                'attributes' => 'nullable|string',
                '_idempotency_key' => 'nullable|string|max:100',
            ]);

            // Server-side idempotency check (safe if column doesn't exist)
            if (!empty($validated['_idempotency_key'])) {
                try {
                    $existingAd = Ad::where('idempotency_key', $validated['_idempotency_key'])->first();
                    if ($existingAd) {
                        Log::info('Duplicate ad submission prevented by idempotency key', [
                            'idempotency_key' => $validated['_idempotency_key'],
                            'existing_ad_id' => $existingAd->id,
                            'user_id' => $request->user()?->id,
                        ]);
                        $existingAd->load(['images', 'category', 'location', 'user']);
                        return response()->json([
                            'message' => 'Ad already submitted',
                            'data' => new AdDetailResource($existingAd),
                        ], 200);
                    }
                } catch (\Exception $e) {
                    Log::warning('Idempotency key check failed (column may not exist yet)', [
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $autoApproval = $this->checkAutoApproval();
            $user = $request->user();

            $locationId = $this->resolveLocationId($validated['location_id'] ?? null);
            $attributes = $this->resolveAttributes($validated['attributes'] ?? null);

            $t0 = microtime(true);

            $ad = DB::transaction(function () use ($validated, $user, $locationId, $attributes, $autoApproval, $request) {
                $ad = Ad::create([
                    'user_id' => $user->id,
                    'title' => $validated['title'],
                    'description' => $validated['description'],
                    'short_description' => substr($validated['description'], 0, 150),
                    'price' => $validated['price'],
                    'currency' => $validated['currency'] ?? 'NGN',
                    'category_id' => $validated['category_id'],
                    'location_id' => $locationId,
                    'state' => $validated['state'] ?? null,
                    'lga' => $validated['lga'] ?? null,
                    'condition' => $validated['condition'],
                    'phone' => $validated['phone'],
                    'whatsapp' => $validated['whatsapp'] ?? null,
                    'slug' => Str::slug($validated['title']) . '-' . time(),
                    'status' => $autoApproval['should_auto_approve'] ? 'active' : 'pending',
                    'idempotency_key' => $validated['_idempotency_key'] ?? null,
                ]);

                if ($attributes !== null) {
                    DB::table('ads')->where('id', $ad->id)->update(['attributes' => $attributes]);
                }

                if ($request->has('image_urls')) {
                    $rawImageUrls = $request->input('image_urls');
                    $imageUrls = is_string($rawImageUrls) ? json_decode($rawImageUrls, true) : $rawImageUrls;
                    if (is_array($imageUrls)) {
                        foreach ($imageUrls as $index => $imageData) {
                            $mainUrl = is_string($imageData) ? $imageData : ($imageData['url'] ?? '');
                            $thumbnailUrl = is_string($imageData) ? $mainUrl : ($imageData['thumbnail_url'] ?? $mainUrl);
                            $mediumUrl = is_string($imageData) ? $mainUrl : ($imageData['medium_url'] ?? $mainUrl);
                            $originalUrl = is_string($imageData) ? $mainUrl : ($imageData['original_url'] ?? $mainUrl);

                            $storedMainUrl = $mainUrl;
                            $storedThumbnailUrl = $thumbnailUrl;
                            $storedMediumUrl = $mediumUrl;
                            $storedOriginalUrl = $originalUrl;

                            $tempPaths = $this->resolveTempPaths($mainUrl);
                            if ($tempPaths !== null) {
                                $adDir = "ads/{$ad->id}";
                                foreach ($tempPaths as $variant => $tempPath) {
                                    if (Storage::disk('public')->exists($tempPath)) {
                                        $newPath = str_replace('temp/', "{$adDir}/", $tempPath);
                                        Storage::disk('public')->copy($tempPath, $newPath);
                                        Storage::disk('public')->delete($tempPath);
                                        $variantUrl = url('/storage/' . $newPath);
                                        if ($variant === 'large') $storedMainUrl = $variantUrl;
                                        if ($variant === 'original') $storedOriginalUrl = $variantUrl;
                                        if ($variant === 'medium') $storedMediumUrl = $variantUrl;
                                        if ($variant === 'thumb') $storedThumbnailUrl = $variantUrl;
                                    }
                                }
                            }

                            $imageHash = is_string($imageData) ? null : ($imageData['image_hash'] ?? null);
                            AdImage::create([
                                'ad_id' => $ad->id,
                                'url' => $storedMainUrl,
                                'original_url' => $storedOriginalUrl,
                                'thumbnail_url' => $storedThumbnailUrl,
                                'medium_url' => $storedMediumUrl,
                                'image_hash' => $imageHash,
                                'is_primary' => $index === 0,
                                'sort_order' => $index,
                            ]);
                        }
                    }
                }

                // Handle raw file uploads ASYNC via job
                if ($request->hasFile('images')) {
                    foreach ($request->file('images') as $index => $image) {
                        $uuid = (string) Str::uuid();
                        $tempPath = $image->store("temp/{$uuid}", 'public');
                        ProcessAdImageJob::dispatch(
                            $ad->id,
                            $tempPath,
                            $index,
                            $index === 0
                        );
                    }
                }

                return $ad;
            });

            $t1 = microtime(true);
            Log::info('Ad created in DB', [
                'ad_id' => $ad->id,
                'db_time_ms' => round(($t1 - $t0) * 1000, 2),
            ]);

            $ad->load(['images', 'category', 'location', 'user']);

            $t2 = microtime(true);
            event(new AdSaved($ad));

            if ($autoApproval['should_auto_approve']) {
                try {
                    \App\Jobs\NotifyFollowersOfNewAdJob::dispatch($ad->id, $user->id);
                    \App\Jobs\CheckSavedSearchesJob::dispatch($ad->id);
                } catch (\Exception $e) {
                    Log::warning('Failed to dispatch notifications: ' . $e->getMessage());
                }
            }

            $t3 = microtime(true);
            $totalTime = round(($t3 - $startTime) * 1000, 2);
            Log::info('Ad creation completed', [
                'ad_id' => $ad->id,
                'total_time_ms' => $totalTime,
                'event_time_ms' => round(($t3 - $t2) * 1000, 2),
                'num_images' => $ad->images->count(),
            ]);

            if ($totalTime > 3000) {
                Log::warning('Ad creation exceeded 3s threshold', [
                    'ad_id' => $ad->id,
                    'total_time_ms' => $totalTime,
                ]);
            }

            return response()->json([
                'message' => $autoApproval['should_auto_approve']
                    ? 'Ad created successfully and is now live!'
                    : 'Ad created successfully and is pending approval.',
                'data' => new AdDetailResource($ad),
                'auto_approved' => $autoApproval['should_auto_approve'],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Failed to create ad: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ]);
            return response()->json(['error' => 'Failed to create ad. Please try again.'], 500);
        }
    }

    public function similarAds(Request $request)
    {
        try {
            $adId = (int) $request->input('ad_id');
            $limit = min((int) $request->input('limit', 8), 20);

            if (!$adId) {
                return response()->json(['error' => 'Ad ID is required'], 400);
            }

            $currentAd = Ad::select('id', 'category_id', 'subcategory_id', 'location_id')->find($adId);
            if (!$currentAd) {
                return response()->json(['error' => 'Ad not found'], 404);
            }

            $baseQuery = Ad::with(['images', 'category', 'location'])
                ->active()
                ->where('id', '!=', $adId);

            $merged = collect();
            $relatedIds = [];

            if ($currentAd->subcategory_id) {
                $subcategoryMatch = (clone $baseQuery)
                    ->where('subcategory_id', $currentAd->subcategory_id)
                    ->orderBy('created_at', 'desc')
                    ->limit($limit)
                    ->get();
                $merged = $subcategoryMatch;
                $relatedIds = $merged->pluck('id')->toArray();

                if ($merged->count() < $limit) {
                    $remaining = $limit - $merged->count();
                    $categoryMatch = (clone $baseQuery)
                        ->whereNotIn('id', $relatedIds)
                        ->where('category_id', $currentAd->category_id)
                        ->orderBy('created_at', 'desc')
                        ->limit($remaining)
                        ->get();
                    $merged = $merged->merge($categoryMatch);
                    $relatedIds = $merged->pluck('id')->toArray();
                }
            } elseif ($currentAd->category_id) {
                $categoryMatch = (clone $baseQuery)
                    ->where('category_id', $currentAd->category_id)
                    ->orderBy('created_at', 'desc')
                    ->limit($limit)
                    ->get();
                $merged = $categoryMatch;
                $relatedIds = $merged->pluck('id')->toArray();
            }

            if ($merged->count() < $limit) {
                $remaining = $limit - $merged->count();
                $locationMatch = (clone $baseQuery)
                    ->whereNotIn('id', $relatedIds)
                    ->where('location_id', $currentAd->location_id)
                    ->orderBy('created_at', 'desc')
                    ->limit($remaining)
                    ->get();
                $merged = $merged->merge($locationMatch);
                $relatedIds = $merged->pluck('id')->toArray();
            }

            if ($merged->count() < $limit) {
                $remaining = $limit - $merged->count();
                $fallback = (clone $baseQuery)
                    ->whereNotIn('id', $relatedIds)
                    ->orderBy('created_at', 'desc')
                    ->limit($remaining)
                    ->get();
                $merged = $merged->merge($fallback);
            }

            return response()->json([
                'data' => AdListResource::collection($merged->values()),
            ])->header('Cache-Control', 'public, max-age=300, s-maxage=300');
        } catch (\Exception $e) {
            Log::error('Failed to fetch similar ads: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load similar ads'], 500);
        }
    }

    public function myAds(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }
            $limit = min((int) $request->input('limit', 20), 50);
            $page = max((int) $request->input('page', 1), 1);

            $query = Ad::with(['images', 'category', 'location', 'activeBoost.plan', 'user'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc');

            if ($request->input('status')) {
                $query->where('status', $request->input('status'));
            }

            $ads = $query->paginate($limit, ['*'], 'page', $page);

            return AdListResource::collection($ads);
        } catch (\Exception $e) {
            Log::error('Failed to fetch my ads: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load ads'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $ad = Ad::where('id', $id)->where('user_id', $request->user()->id)->first();
            if (!$ad) {
                return response()->json(['error' => 'Ad not found or unauthorized'], 404);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string|max:5000',
                'price' => 'sometimes|numeric|min:0',
                'category_id' => 'sometimes|exists:categories,id',
                'condition' => 'sometimes|in:new,like_new,good,fair',
                'phone' => 'sometimes|string|max:20',
                'whatsapp' => 'nullable|string|max:20',
            ]);

            $ad->update($validated);
            event(new AdSaved($ad));

            return response()->json([
                'message' => 'Ad updated successfully',
                'data' => new AdDetailResource($ad->fresh()),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update ad: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update ad'], 500);
        }
    }

    public function updateById(Request $request, $id)
    {
        try {
            $ad = Ad::where('id', $id)->where('user_id', $request->user()->id)->first();
            if (!$ad) {
                return response()->json(['error' => 'Ad not found or unauthorized'], 404);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string|max:5000',
                'price' => 'sometimes|numeric|min:0',
                'negotiable' => 'sometimes|in:0,1,true,false,yes,no',
                'currency' => 'sometimes|string|in:NGN,USD,EUR,GBP',
                'category_id' => 'sometimes|exists:categories,id',
                'location_id' => 'sometimes|string|max:100',
                'condition' => 'sometimes|in:new,like_new,good,fair',
                'phone' => 'sometimes|string|max:20',
                'whatsapp' => 'nullable|string|max:20',
                'status' => 'sometimes|in:active,pending,rejected,expired',
                'is_featured' => 'sometimes|boolean',
                'removed_images' => 'sometimes|string',
                'images.*' => 'image|mimes:jpg,jpeg,png,webp,gif|max:5120',
            ]);

            $fillableData = array_intersect_key($validated, array_flip([
                'title', 'description', 'price', 'negotiable', 'currency',
                'category_id', 'condition', 'phone', 'whatsapp',
                'status', 'is_featured', 'state', 'lga',
            ]));

            if (isset($validated['negotiable'])) {
                $fillableData['negotiable'] = filter_var($validated['negotiable'], FILTER_VALIDATE_BOOLEAN);
            }
            if (isset($validated['location_id'])) {
                $fillableData['location_id'] = $this->resolveLocationId($validated['location_id']);
            }

            $ad->update($fillableData);

            if (isset($validated['removed_images'])) {
                $removedIds = json_decode($validated['removed_images'], true);
                if (is_array($removedIds)) {
                    AdImage::where('ad_id', $ad->id)
                        ->whereIn('id', $removedIds)
                        ->each(function ($image) {
                            $this->deleteImageResources($image);
                            $image->delete();
                        });
                }
            }

            if ($request->hasFile('images')) {
                $this->handleImageUploads($request, $ad);
            }

            event(new AdSaved($ad));

            $ad->refresh()->load(['images', 'category', 'location', 'user']);

            return response()->json([
                'message' => 'Ad updated successfully',
                'data' => new AdDetailResource($ad),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Failed to update ad: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update ad'], 500);
        }
    }

    public function destroy(Request $request, $slug)
    {
        try {
            $ad = is_numeric($slug)
                ? Ad::where('id', $slug)->where('user_id', $request->user()->id)->first()
                : Ad::where('slug', $slug)->where('user_id', $request->user()->id)->first();

            if (!$ad) {
                return response()->json(['error' => 'Ad not found or unauthorized'], 404);
            }

            CacheService::invalidateAdCache($ad->id, $ad->category?->slug);

            foreach ($ad->images as $image) {
                if ($image->public_id) {
                    DeleteCloudinaryFileJob::dispatch($image->public_id, 'ad_image');
                }
            }

            $ad->delete();

            return response()->json(['message' => 'Ad deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to delete ad: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete ad'], 500);
        }
    }

    public function closeAd(Request $request, int $id)
    {
        $user = $request->user();
        $ad = Ad::where('id', $id)->where('user_id', $user->id)->first();

        if (!$ad) {
            return response()->json(['error' => 'Ad not found or unauthorized'], 404);
        }
        if (!in_array($ad->status, ['active', 'pending'])) {
            return response()->json(['error' => 'Ad cannot be closed', 'current_status' => $ad->status], 400);
        }

        $ad->update(['status' => 'sold']);

        $activeBoost = $ad->activeBoost;
        if ($activeBoost) {
            $activeBoost->update(['status' => 'expired']);
        }

        CacheService::invalidateAdCache($ad->id, $ad->category?->slug);

        return response()->json([
            'success' => true,
            'message' => 'Ad closed successfully',
            'data' => ['status' => 'sold'],
        ]);
    }

    public function renewAd(Request $request, int $id)
    {
        $user = $request->user();
        $ad = Ad::where('id', $id)->where('user_id', $user->id)->first();

        if (!$ad) {
            return response()->json(['error' => 'Ad not found or unauthorized'], 404);
        }
        if (!in_array($ad->status, ['expired', 'sold'])) {
            return response()->json(['error' => 'Ad is already active', 'current_status' => $ad->status], 400);
        }

        $ad->update(['status' => 'pending']);
        CacheService::invalidateAdCache($ad->id, $ad->category?->slug);

        return response()->json([
            'success' => true,
            'message' => 'Ad submitted for re-approval',
            'data' => ['status' => 'pending'],
        ]);
    }

    public function pauseAd(Request $request, int $id)
    {
        $user = $request->user();
        $ad = Ad::where('id', $id)->where('user_id', $user->id)->first();

        if (!$ad) {
            return response()->json(['error' => 'Ad not found or unauthorized'], 404);
        }
        if ($ad->status !== 'active') {
            return response()->json(['error' => 'Only active ads can be paused', 'current_status' => $ad->status], 400);
        }

        $ad->update(['status' => 'paused']);
        CacheService::invalidateAdCache($ad->id, $ad->category?->slug);

        return response()->json([
            'success' => true,
            'message' => 'Ad paused successfully',
            'data' => ['status' => 'paused'],
        ]);
    }

    public function reactivateAd(Request $request, int $id)
    {
        $user = $request->user();
        $ad = Ad::where('id', $id)->where('user_id', $user->id)->first();

        if (!$ad) {
            return response()->json(['error' => 'Ad not found or unauthorized'], 404);
        }
        if ($ad->status !== 'paused') {
            return response()->json(['error' => 'Only paused ads can be reactivated', 'current_status' => $ad->status], 400);
        }

        $ad->update(['status' => 'active']);
        CacheService::invalidateAdCache($ad->id, $ad->category?->slug);

        return response()->json([
            'success' => true,
            'message' => 'Ad reactivated successfully',
            'data' => ['status' => 'active'],
        ]);
    }

    private function resolveLocationId($locationId): ?int
    {
        if (!$locationId) return null;
        if (is_numeric($locationId)) return (int) $locationId;

        $loc = \App\Models\Location::where('slug', $locationId)->first()
            ?? \App\Models\Location::where('name', $locationId)->first();
        return $loc?->id;
    }

    private function resolveAttributes($attributes): ?string
    {
        if (empty($attributes)) return null;
        try {
            $raw = html_entity_decode($attributes, ENT_QUOTES, 'UTF-8');
            $decoded = json_decode($raw, true);
            return is_array($decoded) ? json_encode($decoded) : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function resolveTempPaths(string $url): ?array
    {
        $path = parse_url($url, PHP_URL_PATH);
        if (!$path) return null;
        $path = ltrim($path, '/');
        // Remove 'storage/' prefix if present
        if (strpos($path, 'storage/') === 0) {
            $path = substr($path, 8);
        }
        // Only handle temp/ paths
        if (strpos($path, 'temp/') !== 0) return null;

        $filePart = basename($path);
        $baseName = pathinfo($filePart, PATHINFO_FILENAME);
        $uuid = preg_replace('/_(original|large|medium|thumb)$/', '', $baseName);

        if (!$uuid || $uuid === $baseName) return null;

        return [
            'original' => "temp/{$uuid}_original.webp",
            'large' => "temp/{$uuid}_large.webp",
            'medium' => "temp/{$uuid}_medium.webp",
            'thumb' => "temp/{$uuid}_thumb.webp",
        ];
    }

    private function uploadAdImages(Request $request, Ad $ad, $user): void
    {
        $useCloudinary = !empty(config('services.cloudinary.url'));
        $imageService = app(ImageProcessingService::class);

        foreach ($request->file('images') as $index => $image) {
            try {
                if ($useCloudinary) {
                    $cloudinary = new CloudinaryService();
                    $result = $cloudinary->uploadImage($image->getPathname(), [
                        'folder' => 'ads',
                        'user_id' => $user->id,
                        'tags' => ['ad', 'ad_' . $ad->id],
                    ]);
                    if ($result['success']) {
                        AdImage::create([
                            'ad_id' => $ad->id,
                            'url' => $result['secure_url'],
                            'original_url' => $result['secure_url'],
                            'thumbnail_url' => $result['thumbnail_url'],
                            'medium_url' => $result['optimized_url'] ?? null,
                            'public_id' => $result['public_id'],
                            'width' => $result['width'] ?? null,
                            'height' => $result['height'] ?? null,
                            'file_size' => $result['bytes'] ?? null,
                            'is_primary' => $index === 0,
                            'sort_order' => $index,
                        ]);
                        continue;
                    }
                }

                $result = $imageService->processAdImage($image, $ad->id);
                AdImage::create([
                    'ad_id' => $ad->id,
                    'url' => url($result['url']),
                    'original_url' => url($result['original_url']),
                    'thumbnail_url' => url($result['thumbnail_url']),
                    'medium_url' => url($result['medium_url']),
                    'public_id' => null,
                    'width' => $result['width'] ?? null,
                    'height' => $result['height'] ?? null,
                    'file_size' => $result['file_size'] ?? null,
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            } catch (\Exception $e) {
                Log::warning('Image upload failed', ['error' => $e->getMessage()]);
            }
        }
        app(AdImageCacheService::class)->invalidateAdCache($ad->id);
        CacheService::clearAdDetail($ad->id);
    }

    private function deleteImageResources($image): void
    {
        if ($image->public_id) {
            try {
                app(CloudinaryService::class)->deleteImage($image->public_id);
            } catch (\Exception $e) {
                Log::warning('Failed to delete Cloudinary image: ' . $e->getMessage());
            }
        }
    }

    protected function checkAutoApproval(): array
    {
        try {
            $settings = DB::table('settings')->pluck('value', 'key')->toArray();
            $enabled = filter_var($settings['auto_approval_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
            if (!$enabled) return ['should_auto_approve' => false, 'duration_minutes' => 0];

            $durationMinutes = (int) ($settings['approval_duration_minutes'] ?? 0);
            if ($durationMinutes === 0) return ['should_auto_approve' => true, 'duration_minutes' => $durationMinutes];

            return ['should_auto_approve' => false, 'duration_minutes' => $durationMinutes];
        } catch (\Exception $e) {
            return ['should_auto_approve' => false, 'duration_minutes' => 0];
        }
    }
}
