<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\AdImage;
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
                ->get();

            $allAds->each(function($ad) {
                $ad->setRelation('images', $ad->images);
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
            $ad = Ad::with(['images', 'category', 'location', 'user'])
                ->where('slug', $slug)
                ->where('status', 'active')
                ->first();

            if (!$ad) {
                return response()->json(['error' => 'Ad not found'], 404);
            }

            $ad->increment('views');

            return response()->json([
                'data' => $ad,
            ]);
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
                'data' => $ad,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch ad: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load ad'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string|max:5000',
                'price' => 'required|numeric|min:0',
                'currency' => 'required|string|in:NGN,USD,EUR,GBP',
                'category_id' => 'required|exists:categories,id',
                'location_id' => 'required|exists:locations,id',
                'state' => 'nullable|string|max:100',
                'lga' => 'nullable|string|max:100',
                'condition' => 'required|in:new,like_new,good,fair',
                'phone' => 'required|string|max:20',
                'whatsapp' => 'nullable|string|max:20',
            ]);

            // Check auto-approval settings
            $autoApproval = $this->checkAutoApproval();
            
            $user = $request->user();
            
            $ad = Ad::create([
                'user_id' => $user->id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'short_description' => substr($validated['description'], 0, 150),
                'price' => $validated['price'],
                'currency' => $validated['currency'],
                'category_id' => $validated['category_id'],
                'location_id' => $validated['location_id'],
                'state' => $validated['state'] ?? null,
                'lga' => $validated['lga'] ?? null,
                'condition' => $validated['condition'],
                'phone' => $validated['phone'],
                'whatsapp' => $validated['whatsapp'] ?? null,
                'slug' => Str::slug($validated['title']) . '-' . time(),
                'status' => $autoApproval['should_auto_approve'] ? 'active' : 'pending',
            ]);

            if ($request->hasFile('images')) {
                $images = $request->file('images');
                foreach ($images as $index => $image) {
                    $path = $image->store('ads', 'public');
                    AdImage::create([
                        'ad_id' => $ad->id,
                        'url' => '/storage/' . $path,
                        'original_url' => '/storage/' . $path,
                        'is_primary' => $index === 0,
                        'sort_order' => $index,
                    ]);
                }
            }

            $ad->load(['images', 'category', 'location']);

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

            foreach ($ad->images as $image) {
                if ($image->url) {
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

            foreach ($ad->images as $image) {
                if ($image->url) {
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

            $uploadedImages = [];
            $existingCount = $ad->images()->count();
            
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('ads', 'public');
                $adImage = AdImage::create([
                    'ad_id' => $ad->id,
                    'url' => '/storage/' . $path,
                    'original_url' => '/storage/' . $path,
                    'is_primary' => ($existingCount === 0 && $index === 0),
                    'sort_order' => $existingCount + $index,
                ]);
                $uploadedImages[] = $adImage;
            }

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

            if ($image->url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $image->url));
            }

            $image->delete();

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
