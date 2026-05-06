<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\AdImage;
use App\Services\AdminEmailNotificationService;
use Illuminate\Http\Request;
use App\Services\CloudinaryService;
use App\Services\AdImageCacheService;
use App\Jobs\Cloudinary\DeleteCloudinaryFileJob;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdController extends Controller
{
    public function index(Request $request)
    {
        try {
            $limit = $request->input('limit', 20);
            $page = $request->input('page', 1);
            $offset = ($page - 1) * $limit;
            
            $query = Ad::with(['images', 'category', 'location'])
                ->where('status', 'active');

            if ($request->category) {
                $query->whereHas('category', function($q) use ($request) {
                    $q->where('slug', $request->category);
                });
            }

            if ($request->location) {
                $query->whereHas('location', function($q) use ($request) {
                    $q->where('slug', $request->location);
                });
            }

            if ($request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%');
                });
            }

            $totalCount = (clone $query)->count();
            $lastPage = $limit > 0 ? ceil($totalCount / $limit) : 1;

            $allAds = $query
                ->orderBy('created_at', 'desc')
                ->offset($offset)
                ->limit($limit)
                ->get()
                ->map(function($ad) {
                    $data = $ad->toArray();
                    $data['images'] = $ad->images->toArray();
                    
                    // Fetch attributes directly from DB to avoid Eloquent conflict
                    $dbAttrs = \Illuminate\Support\Facades\DB::table('ads')
                        ->where('id', $ad->id)
                        ->value('attributes');
                    $attrs = [];
                    if ($dbAttrs) {
                        $decoded = json_decode(html_entity_decode($dbAttrs, ENT_QUOTES, 'UTF-8'), true);
                        if (is_array($decoded)) {
                            $attrs = $decoded;
                        }
                    }
                    $data['attributes'] = $attrs;
                    
                    return $data;
                });

            return response()->json([
                'data' => $allAds->values(),
                'meta' => [
                    'total' => $totalCount,
                    'current_page' => $page,
                    'per_page' => $limit,
                    'last_page' => $lastPage,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch ads: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to load ads', 'message' => $e->getMessage()], 500);
        }
    }

    public function featured(Request $request)
    {
        try {
            $limit = $request->limit ?? 8;
            
            $featuredAds = Ad::with(['images', 'category', 'location'])
                ->where('status', 'active')
                ->where('is_featured', true)
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            return response()->json([
                'data' => $featuredAds->values(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch featured ads: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load featured ads'], 500);
        }
    }

    public function show(Request $request, $slug)
    {
        try {
            $ad = Ad::with(['category', 'location', 'user'])
                ->where('slug', $slug)
                ->where('status', 'active')
                ->first();

            if (!$ad) {
                return response()->json(['error' => 'Ad not found'], 404);
            }

            $cacheService = new AdImageCacheService();
            $cachedImages = $cacheService->getCachedUrls($ad->id);

            $ad->increment('views');

            // Fetch attributes column directly via DB to avoid Eloquent conflict with 'attributes' column name
            $dbAttrs = \Illuminate\Support\Facades\DB::table('ads')
                ->where('id', $ad->id)
                ->value('attributes');
            
            Log::info('Ad show - Raw attributes from DB:', ['slug' => $slug, 'raw' => $dbAttrs]);
            
            $attributes = [];
            if ($dbAttrs) {
                $decoded = json_decode(html_entity_decode($dbAttrs, ENT_QUOTES, 'UTF-8'), true);
                if (is_array($decoded)) {
                    $attributes = $decoded;
                }
            }
            Log::info('Ad show - Parsed attributes:', ['parsed' => $attributes]);

            $response = $ad->toArray();
            $response['images'] = $cachedImages;
            $response['attributes'] = $attributes;

            return response()->json([
                'data' => $response,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch ad: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to load ad', 'message' => $e->getMessage()], 500);
        }
    }

    public function showById(Request $request, $id)
    {
        try {
            $ad = Ad::with(['category', 'location', 'user'])->find($id);

            if (!$ad) {
                return response()->json(['error' => 'Ad not found'], 404);
            }

            $cacheService = new AdImageCacheService();
            $response = $ad->toArray();
            $response['images'] = $cacheService->getCachedUrls($ad->id);

            return response()->json([
                'data' => $response,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch ad: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load ad'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('=== Ad Store Request ===');
            Log::info('Request attributes:', ['raw' => $request->input('attributes')]);
            
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
            ]);

            Log::info('Validated attributes:', ['raw' => $validated['attributes']]);

            // Check auto-approval settings
            $autoApproval = $this->checkAutoApproval();
            
            $user = $request->user();
            
            // Resolve location_id: could be numeric ID or slug
            $locationId = null;
            if ($validated['location_id']) {
                if (is_numeric($validated['location_id'])) {
                    $locationId = (int) $validated['location_id'];
                } else {
                    // Try to find by slug
                    $loc = \App\Models\Location::where('slug', $validated['location_id'])->first();
                    if ($loc) {
                        $locationId = $loc->id;
                    } else {
                        // Try to find by name
                        $loc = \App\Models\Location::where('name', $validated['location_id'])->first();
                        if ($loc) {
                            $locationId = $loc->id;
                        }
                    }
                }
            }
            
            $attributes = null;
            if (!empty($validated['attributes'])) {
                try {
                    // HTML entity decode first (FormData may encode quotes as &quot;)
                    $raw = html_entity_decode($validated['attributes'], ENT_QUOTES, 'UTF-8');
                    $decoded = json_decode($raw, true);
                    Log::info('Ad store - Decoded attributes:', ['raw' => $raw, 'decoded' => $decoded]);
                    if (is_array($decoded)) {
                        $attributes = json_encode($decoded);
                        Log::info('Ad store - Attributes to save:', ['json' => $attributes]);
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to decode attributes: ' . $e->getMessage());
                }
            }
            
            Log::info('Attributes before save:', ['attributes' => $attributes]);
            
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
            ]);
            
            // Set attributes column directly via DB to avoid Eloquent conflict
            if ($attributes !== null) {
                \Illuminate\Support\Facades\DB::table('ads')
                    ->where('id', $ad->id)
                    ->update(['attributes' => $attributes]);
                Log::info('Attributes saved via direct DB update');
            }
            
            Log::info('Ad created:', ['id' => $ad->id]);

            if ($request->hasFile('images')) {
                $cloudinary = new CloudinaryService();
                $images = $request->file('images');
                $uploadErrors = [];

                foreach ($images as $index => $image) {
                    $validation = $cloudinary->validateImageFile($image->getPathname());
                    if (!$validation['valid']) {
                        $uploadErrors[] = $validation['error'];
                        continue;
                    }

                    $uploadResult = $cloudinary->uploadImage($image->getPathname(), [
                        'folder' => 'ads',
                        'user_id' => $user->id,
                        'tags' => ['ad', 'ad_' . $ad->id],
                    ]);

                    if (!$uploadResult['success']) {
                        Log::error('Cloudinary upload failed for ad image', [
                            'ad_id' => $ad->id,
                            'error' => $uploadResult['error'] ?? 'Unknown',
                        ]);
                        $uploadErrors[] = $uploadResult['error'] ?? 'Upload failed';
                        continue;
                    }

                    AdImage::create([
                        'ad_id' => $ad->id,
                        'url' => $uploadResult['secure_url'],
                        'original_url' => $uploadResult['secure_url'],
                        'thumbnail_url' => $uploadResult['thumbnail_url'],
                        'medium_url' => $uploadResult['optimized_url'] ?? null,
                        'public_id' => $uploadResult['public_id'],
                        'width' => $uploadResult['width'] ?? null,
                        'height' => $uploadResult['height'] ?? null,
                        'file_size' => $uploadResult['bytes'] ?? null,
                        'is_primary' => $index === 0,
                        'sort_order' => $index,
                    ]);
                }

                $cacheService = new AdImageCacheService();
                $cacheService->invalidateAdCache($ad->id);

                if (!empty($uploadErrors)) {
                    Log::warning('Some ad images failed to upload', [
                        'ad_id' => $ad->id,
                        'errors' => $uploadErrors,
                    ]);
                }
            }

            $ad->load(['images', 'category', 'location', 'user']);

            // Dispatch notification to followers (queued job - non-blocking)
            if ($autoApproval['should_auto_approve']) {
                try {
                    \App\Jobs\NotifyFollowersOfNewAdJob::dispatch($ad->id, $user->id);
                } catch (\Exception $e) {
                    Log::warning('Failed to dispatch follower notification job: ' . $e->getMessage());
                }
            }

            // Send notifications to admin ONLY if ad needs manual approval
            if (!$autoApproval['should_auto_approve']) {
                try {
                    // Save notification for admin bell - only for pending ads
                    \App\Models\AdminNotification::create([
                        'type' => 'new_ad_pending',
                        'title' => 'New Ad Pending Approval',
                        'message' => "New ad '{$ad->title}' by {$ad->user->name} needs your review",
                        'reference_type' => 'ad',
                        'reference_id' => $ad->id,
                        'is_read' => false,
                    ]);
                    
                    // Send email notification to admin
                    AdminEmailNotificationService::adApprovalRequired($ad);
                } catch (\Exception $e) {
                    Log::warning('Failed to send admin notification: ' . $e->getMessage());
                }
            }

            return response()->json([
                'message' => $autoApproval['should_auto_approve'] ? 'Ad created successfully and is now live!' : 'Ad created successfully and is pending approval.',
                'data' => $ad,
                'auto_approved' => $autoApproval['should_auto_approve'],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Failed to create ad: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create ad', 'message' => $e->getMessage()], 500);
        }
    }

    protected function checkAutoApproval(): array
    {
        try {
            $settings = DB::table('settings')->pluck('value', 'key')->toArray();
            $enabled = filter_var($settings['auto_approval_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
            
            if (!$enabled) {
                return ['should_auto_approve' => false, 'duration_minutes' => 0];
            }
            
            $durationMinutes = (int) ($settings['approval_duration_minutes'] ?? 0);
            
            // If duration is 0, auto-approve immediately
            if ($durationMinutes === 0) {
                return ['should_auto_approve' => true, 'duration_minutes' => $durationMinutes];
            }
            
            // For non-zero duration, ad goes to pending
            return ['should_auto_approve' => false, 'duration_minutes' => $durationMinutes];
        } catch (\Exception $e) {
            return ['should_auto_approve' => false, 'duration_minutes' => 0];
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
                'location_id' => 'sometimes|exists:locations,id',
                'state' => 'sometimes|string|max:100',
                'lga' => 'sometimes|string|max:100',
                'condition' => 'sometimes|in:new,like_new,good,fair',
                'phone' => 'sometimes|string|max:20',
                'whatsapp' => 'nullable|string|max:20',
            ]);

            $ad->update($validated);

            return response()->json([
                'message' => 'Ad updated successfully',
                'data' => $ad,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update ad: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update ad'], 500);
        }
    }

    public function updateById(Request $request, $id)
    {
        try {
            $ad = Ad::find($id);

            if (!$ad) {
                return response()->json(['error' => 'Ad not found'], 404);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string|max:5000',
                'price' => 'sometimes|numeric|min:0',
                'currency' => 'sometimes|string|in:NGN,USD,EUR,GBP',
                'category_id' => 'sometimes|exists:categories,id',
                'location_id' => 'sometimes|exists:locations,id',
                'state' => 'sometimes|string|max:100',
                'lga' => 'sometimes|string|max:100',
                'condition' => 'sometimes|in:new,like_new,good,fair',
                'phone' => 'sometimes|string|max:20',
                'whatsapp' => 'nullable|string|max:20',
                'status' => 'sometimes|in:active,pending,rejected,expired',
                'is_featured' => 'sometimes|boolean',
                'is_verified' => 'sometimes|boolean',
            ]);

            $ad->update($validated);
            $ad->refresh();
            $ad->load(['images', 'category', 'location', 'user']);

            return response()->json([
                'message' => 'Ad updated successfully',
                'data' => $ad,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Failed to update ad by ID: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update ad', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $ad = Ad::where('id', $id)->where('user_id', $request->user()->id)->first();

            if (!$ad) {
                return response()->json(['error' => 'Ad not found or unauthorized'], 404);
            }

            $cacheService = new AdImageCacheService();
            $cacheService->invalidateAdCache($ad->id);

            $cloudinary = new CloudinaryService();
            foreach ($ad->images as $image) {
                if ($image->public_id) {
                    DeleteCloudinaryFileJob::dispatch($image->public_id, 'ad_image');
                } elseif ($image->url && !str_starts_with($image->url, 'http')) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $image->url));
                }
            }

            $ad->delete();

            return response()->json(['message' => 'Ad deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to delete ad: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete ad'], 500);
        }
    }

    public function destroyById(Request $request, $id)
    {
        try {
            $ad = Ad::find($id);

            if (!$ad) {
                return response()->json(['error' => 'Ad not found'], 404);
            }

            $cacheService = new AdImageCacheService();
            $cacheService->invalidateAdCache($ad->id);

            $cloudinary = new CloudinaryService();
            foreach ($ad->images as $image) {
                if ($image->public_id) {
                    DeleteCloudinaryFileJob::dispatch($image->public_id, 'ad_image');
                } elseif ($image->url && !str_starts_with($image->url, 'http')) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $image->url));
                }
            }

            $ad->delete();

            return response()->json(['message' => 'Ad deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to delete ad by ID: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete ad'], 500);
        }
    }

    public function uploadImages(Request $request, $id)
    {
        try {
            $ad = Ad::find($id);

            if (!$ad) {
                return response()->json(['error' => 'Ad not found'], 404);
            }

            if (!$request->hasFile('images')) {
                return response()->json(['error' => 'No images uploaded'], 422);
            }

            $cloudinary = new CloudinaryService();
            $uploadedImages = [];
            $existingCount = $ad->images()->count();
            
            foreach ($request->file('images') as $index => $image) {
                $tempPath = $image->getPathname();
                $publicId = 'ads/' . Str::uuid()->toString();

                $uploadResult = $cloudinary->uploadImage($tempPath, [
                    'folder' => 'classified-ads/ads',
                    'public_id' => $publicId,
                ]);

                if (!$uploadResult['success']) {
                    Log::error('Cloudinary upload failed for ad image: ' . ($uploadResult['error'] ?? 'Unknown error'));
                    continue;
                }

                $adImage = AdImage::create([
                    'ad_id' => $ad->id,
                    'url' => $uploadResult['secure_url'],
                    'original_url' => $uploadResult['secure_url'],
                    'thumbnail_url' => $uploadResult['thumbnail_url'],
                    'public_id' => $uploadResult['public_id'],
                    'width' => $uploadResult['width'] ?? null,
                    'height' => $uploadResult['height'] ?? null,
                    'file_size' => $uploadResult['bytes'] ?? null,
                    'is_primary' => ($existingCount === 0 && $index === 0),
                    'sort_order' => $existingCount + $index,
                ]);
                $uploadedImages[] = $adImage;
            }

            $cacheService = new AdImageCacheService();
            $cacheService->invalidateAdCache($ad->id);

            return response()->json([
                'message' => 'Images uploaded successfully',
                'data' => $uploadedImages,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to upload images: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to upload images'], 500);
        }
    }

    public function deleteImage(Request $request, $id, $imageId)
    {
        try {
            $ad = Ad::find($id);

            if (!$ad) {
                return response()->json(['error' => 'Ad not found'], 404);
            }

            $image = AdImage::where('id', $imageId)->where('ad_id', $id)->first();

            if (!$image) {
                return response()->json(['error' => 'Image not found'], 404);
            }

            $cloudinary = new CloudinaryService();
            if ($image->public_id) {
                DeleteCloudinaryFileJob::dispatch($image->public_id, 'ad_image');
            } elseif ($image->url && !str_starts_with($image->url, 'http')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $image->url));
            }

            $image->delete();
            $cacheService = new AdImageCacheService();
            $cacheService->invalidateAdCache($id);
            $cacheService->invalidateImageCache($imageId);

            return response()->json(['message' => 'Image deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to delete image: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete image'], 500);
        }
    }

    public function similarAds(Request $request)
    {
        try {
            $adId = $request->input('ad_id');
            $limit = $request->input('limit', 8);
            $page = $request->input('page', 1);
            $offset = ($page - 1) * $limit;

            if (!$adId) {
                return response()->json(['error' => 'Ad ID is required'], 400);
            }

            $currentAd = Ad::find($adId);
            if (!$currentAd) {
                return response()->json(['error' => 'Ad not found'], 404);
            }

            $query = Ad::with(['images', 'category', 'location'])
                ->where('status', 'active')
                ->where('id', '!=', $adId);

            // Match by category if available
            if ($currentAd->category_id) {
                $query->where('category_id', $currentAd->category_id);
            }

            $similarAds = $query
                ->orderBy('created_at', 'desc')
                ->offset($offset)
                ->limit($limit)
                ->get();

            return response()->json([
                'data' => $similarAds->values(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch similar ads: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load similar ads', 'message' => $e->getMessage()], 500);
        }
    }
}
