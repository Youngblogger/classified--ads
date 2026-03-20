<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\AdImage;
use App\Services\ImageProcessingService;
use App\Jobs\ProcessAdImageJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AdController extends Controller
{
    public function index(Request $request)
    {
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
    }

    public function featured(Request $request)
    {
        $limit = $request->limit ?? 8;
        $ads = Ad::with(['images', 'category', 'location'])
            ->where('status', 'active')
            ->where('is_featured', true)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json(['data' => $ads]);
    }

    public function recent(Request $request)
    {
        $limit = $request->limit ?? 8;
        $ads = Ad::with(['images', 'category', 'location'])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json(['data' => $ads]);
    }

    public function show($slug)
    {
        $ad = Ad::with(['images', 'category', 'location', 'user'])
            ->where('slug', $slug)
            ->firstOrFail();

        $ad->increment('views');

        return response()->json(['data' => $ad]);
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
            'images' => 'sometimes|array|max:6',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp,gif,heic,heif|max:5120',
        ]);

        $data['slug'] = \Illuminate\Support\Str::slug($request->title) . '-' . time();
        $data['user_id'] = $request->user()->id;
        $data['status'] = 'pending';

        $ad = Ad::create($data);

        if ($request->hasFile('images')) {
            $imageService = new ImageProcessingService();

            foreach ($request->file('images') as $index => $file) {
                try {
                    $imageService->validateImage($file);
                    
                    $result = $imageService->processAdImage($file, $ad->id);

                    AdImage::create([
                        'ad_id' => $ad->id,
                        'url' => $result['url'],
                        'original_url' => $result['original_url'],
                        'thumbnail_url' => $result['thumbnail_url'],
                        'file_size' => $result['file_size'],
                        'is_primary' => $index === 0,
                        'sort_order' => $index,
                    ]);
                } catch (\Exception $e) {
                    Log::error("Failed to process image {$index} for ad {$ad->id}: " . $e->getMessage());
                }
            }

            return response()->json([
                'data' => $ad->load('images'),
                'message' => 'Ad posted successfully! Pending approval from admin.',
            ], 201);
        }

        return response()->json([
            'data' => $ad, 
            'message' => 'Ad posted successfully! Pending approval from admin.'
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

        if ($request->user()->id !== $ad->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ad->delete();

        return response()->json(['message' => 'Ad deleted successfully']);
    }

    public function myAds(Request $request)
    {
        $query = Ad::with(['images', 'category', 'location'])
            ->where('user_id', $request->user()->id);

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $ads = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($ads);
    }
}
