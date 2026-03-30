<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\AdImage;
use App\Services\ImageProcessingService;
use App\Services\NotificationService;
use App\Jobs\ProcessAdImageJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AdController extends Controller
{
    public function index(Request $request)
    {
        try {
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

            $ads = $query->orderBy('created_at', 'desc')->paginate(20);

            return response()->json($ads);
        } catch (\Exception $e) {
            Log::error('Failed to fetch ads: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load ads', 'message' => $e->getMessage()], 500);
        }
    }

    public function featured(Request $request)
    {
        try {
            $limit = $request->limit ?? 8;
            $ads = Ad::with(['images', 'category', 'location'])
                ->where('status', 'active')
                ->where('is_featured', true)
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            return response()->json(['data' => $ads]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch featured ads: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load featured ads', 'message' => $e->getMessage()], 500);
        }
    }

    public function recent(Request $request)
    {
        try {
            $limit = $request->limit ?? 8;
            $ads = Ad::with(['images', 'category', 'location'])
                ->where('status', 'active')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            return response()->json(['data' => $ads]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch recent ads: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load recent ads', 'message' => $e->getMessage()], 500);
        }
    }

    public function show($slug)
    {
        try {
            $ad = Ad::with(['images', 'category', 'location', 'user'])
                ->where('slug', $slug)
                ->firstOrFail();

            $ad->increment('views');

            // Explicitly add avatar fields to ensure they're in response
            if ($ad->user) {
                $ad->user->makeVisible(['avatar', 'google_avatar', 'facebook_avatar', 'verified']);
            }

            return response()->json(['data' => $ad]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Ad not found'], 404);
        } catch (\Exception $e) {
            Log::error('Failed to fetch ad: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load ad', 'message' => $e->getMessage()], 500);
        }
    }
    
    public function getById($id)
    {
        try {
            $ad = Ad::with(['images', 'category', 'location', 'user'])
                ->where('id', $id)
                ->first();
            
            if (!$ad) {
                return response()->json(['error' => 'Ad not found'], 404);
            }
            
            // Check ownership
            $user = request()->user();
            if ($user && $ad->user_id !== $user->id && $user->role !== 'admin') {
                return response()->json(['error' => 'You do not have permission to edit this ad'], 403);
            }

            return response()->json(['data' => $ad]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch ad by ID: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load ad', 'message' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'location_id' => 'required|exists:locations,id',
            'condition' => 'required|in:new,like_new,good,fair',
            'currency' => 'sometimes|string|size:3',
            'phone' => 'sometimes|string|max:30',
            'whatsapp' => 'sometimes|string|max:30',
            'lga' => 'sometimes|string|max:100',
        ]);

        $data['slug'] = \Illuminate\Support\Str::slug($request->title) . '-' . time();
        $data['user_id'] = $request->user()->id;
        
        // Check if admin approval is required (default: true for moderation)
        $requiresApproval = true;
        
        if ($requiresApproval) {
            $data['status'] = 'pending';
        } else {
            $data['status'] = 'active';
        }
        
        // Save LGA separately if provided
        $lga = $request->input('lga');
        unset($data['lga']);

        $ad = Ad::create($data);
        
        if ($lga) {
            $ad->update(['lga' => $lga]);
        }
        
        // Send notification to user about ad status
        if ($ad->status === 'pending') {
            NotificationService::adPendingReview($ad);
        } else {
            NotificationService::adPublished($ad);
            // Notify followers of new ad
            NotificationService::notifyFollowersOfNewAd($ad);
        }

        // Handle images - Laravel receives 'images[]' as 'images' in FormData
        $files = $request->file('images') ?: $request->file('images[]');
        
        Log::info('Image upload - files received: ' . ($files ? 'yes (' . count($files) . ')' : 'none'));
        
        if ($files) {
            $files = is_array($files) ? $files : [$files];
            $imageService = new ImageProcessingService();

            foreach ($files as $index => $file) {
                try {
                    // Validate first
                    $imageService->validateImage($file);
                    
                    // Process image
                    $result = $imageService->processAdImage($file, $ad->id);

                    // Create image record
                    AdImage::create([
                        'ad_id' => $ad->id,
                        'url' => $result['url'],
                        'original_url' => $result['original_url'],
                        'thumbnail_url' => $result['thumbnail_url'],
                        'file_size' => $result['file_size'],
                        'is_primary' => $index === 0,
                        'sort_order' => $index,
                    ]);
                    
                    Log::info("Image {$index} saved successfully: " . $result['url']);
                } catch (\Exception $e) {
                    Log::error("Failed to process image {$index} for ad {$ad->id}: " . $e->getMessage() . " - File: " . ($file ? $file->getClientOriginalName() : 'null'));
                }
            }
        }

        $message = $ad->status === 'pending' 
            ? 'Ad posted successfully! Pending approval from admin.'
            : 'Ad posted successfully and is now live!';
            
        return response()->json([
            'data' => $ad->load('images'),
            'message' => $message,
            'status' => $ad->status
        ], 201);
    }

    public function update(Request $request, $slug)
    {
        $ad = Ad::where('slug', $slug)->firstOrFail();

        if ($request->user()->id !== $ad->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'location_id' => 'sometimes|exists:locations,id',
            'condition' => 'sometimes|in:new,like_new,good,fair',
            'status' => 'sometimes|in:active,inactive,pending,sold',
            'phone' => 'sometimes|string|max:30',
            'whatsapp' => 'sometimes|string|max:30',
        ]);

        if (isset($data['title'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['title']) . '-' . time();
        }

        $ad->update($data);

        return response()->json(['data' => $ad]);
    }

    public function destroy(Request $request, $slug)
    {
        $ad = Ad::where('slug', $slug)->firstOrFail();

        // Allow admin to delete any ad, or owner to delete their own ad
        $isAdmin = $request->user()->role === 'admin';
        $isOwner = $request->user()->id === $ad->user_id;
        
        if (!$isAdmin && !$isOwner) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ad->delete();

        return response()->json(['message' => 'Ad deleted successfully']);
    }

    public function myAds(Request $request)
    {
        $query = Ad::with(['images', 'category', 'location']);
        
        // Admins can see all ads, regular users see only their own
        if ($request->user()->role !== 'admin') {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $ads = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($ads);
    }

    public function similarAds(Request $request)
    {
        try {
            $adId = $request->ad_id;
            $limit = $request->limit ?? 12;
            $page = $request->page ?? 1;

            $currentAd = Ad::find($adId);
            
            if (!$currentAd) {
                return response()->json(['error' => 'Ad not found'], 404);
            }

            $keywords = $this->extractKeywords($currentAd->title . ' ' . $currentAd->description);
            
            $query = Ad::with(['images', 'category', 'location'])
                ->where('status', 'active')
                ->where('id', '!=', $adId);

            $query->where(function($q) use ($currentAd) {
                $q->where('category_id', $currentAd->category_id);
                
                if ($currentAd->category && $currentAd->category->parent_id) {
                    $q->orWhereHas('category', function($catQuery) use ($currentAd) {
                        $catQuery->where('parent_id', $currentAd->category->parent_id);
                    });
                }
            });

            if (!empty($keywords)) {
                $query->where(function($q) use ($keywords) {
                    foreach ($keywords as $keyword) {
                        if (strlen($keyword) >= 2) {
                            $q->orWhere(function($subQ) use ($keyword) {
                                $subQ->where('title', 'like', '%' . $keyword . '%')
                                     ->orWhere('description', 'like', '%' . $keyword . '%');
                            });
                        }
                    }
                });
            }

            $priceMin = $currentAd->price * 0.5;
            $priceMax = $currentAd->price * 2;
            $query->whereBetween('price', [$priceMin, $priceMax]);

            $ads = $query->orderBy('created_at', 'desc')
                ->skip(($page - 1) * $limit)
                ->take($limit)
                ->get();

            return response()->json([
                'data' => $ads,
                'meta' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $ads->count()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch similar ads: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load similar ads', 'message' => $e->getMessage()], 500);
        }
    }

    private function extractKeywords($text)
    {
        $text = strtolower($text);
        $text = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $text);
        $words = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        
        $stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
            'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
            'may', 'might', 'must', 'shall', 'can', 'need', 'this', 'that', 'these', 'those',
            'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom',
            'their', 'its', 'very', 'just', 'also', 'now', 'here', 'there', 'then', 'so',
            'not', 'no', 'yes', 'all', 'any', 'some', 'much', 'many', 'more', 'most', 'other',
            'such', 'only', 'own', 'same', 'than', 'too', 'very', 's', 't', 'can', 'will',
            'just', 'don', 'should', 'now', 'your', 'my', 'our', 'his', 'her', 'product'];
        
        $filteredWords = array_filter($words, function($word) use ($stopWords) {
            return strlen($word) >= 2 && !in_array($word, $stopWords);
        });

        usort($filteredWords, function($a, $b) {
            return strlen($b) - strlen($a);
        });

        return array_slice($filteredWords, 0, 10);
    }
}
