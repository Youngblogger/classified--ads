<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        try {
            $query = Ad::with(['images', 'category', 'location', 'user'])
                ->where('status', 'active');

            // Keyword search
            if ($request->has('q') && $request->q) {
                $searchTerm = $request->q;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('title', 'LIKE', '%' . $searchTerm . '%')
                      ->orWhere('description', 'LIKE', '%' . $searchTerm . '%');
                });
            }

            // Location filter (state)
            if ($request->has('location') && $request->location) {
                $locationSlug = $request->location;
                $query->whereHas('location', function($q) use ($locationSlug) {
                    $q->where('slug', $locationSlug);
                });
            }

            // LGA filter
            if ($request->has('lga') && $request->lga) {
                $query->where('lga', $request->lga);
            }

            // Category filter
            if ($request->has('category') && $request->category) {
                $categorySlug = $request->category;
                $query->whereHas('category', function($q) use ($categorySlug) {
                    $q->where('slug', $categorySlug);
                });
            }

            // Category ID filter
            if ($request->has('category_id') && $request->category_id) {
                $query->where('category_id', $request->category_id);
            }

            // Price range
            if ($request->has('min_price') && $request->min_price) {
                $query->where('price', '>=', $request->min_price);
            }
            if ($request->has('max_price') && $request->max_price) {
                $query->where('price', '<=', $request->max_price);
            }

            // Condition filter
            if ($request->has('condition') && $request->condition) {
                $query->where('condition', $request->condition);
            }

            // Sort by
            $sortBy = $request->sort_by ?? 'created_at';
            $sortOrder = $request->sort_order ?? 'desc';
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->per_page ?? 20;
            $ads = $query->paginate($perPage);

            return response()->json($ads);
        } catch (\Exception $e) {
            Log::error('Search failed: ' . $e->getMessage());
            return response()->json(['error' => 'Search failed', 'message' => $e->getMessage()], 500);
        }
    }

    public function suggestions(Request $request)
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json([
                'ads' => [],
                'categories' => [],
            ]);
        }

        // Search ads
        $ads = Ad::with(['images'])
            ->where('status', 'active')
            ->where(function($q) use ($query) {
                $q->where('title', 'LIKE', '%' . $query . '%')
                  ->orWhere('description', 'LIKE', '%' . $query . '%');
            })
            ->limit(5)
            ->get();

        // Search categories
        $categories = Category::where('name', 'LIKE', '%' . $query . '%')
            ->limit(5)
            ->get();

        return response()->json([
            'ads' => $ads,
            'categories' => $categories,
        ]);
    }

    public function trending(Request $request)
    {
        // Get trending ads based on views in the last 7 days
        $trendingAds = Ad::with(['images', 'category', 'location'])
            ->where('status', 'active')
            ->where('created_at', '>=', now()->subDays(7))
            ->orderBy('views', 'desc')
            ->limit(10)
            ->get();

        return response()->json($trendingAds);
    }

    public function recentSearches(Request $request)
    {
        // This would typically come from user history
        // For now, return popular searches
        return response()->json([
            'searches' => [
                'iPhone 15',
                'Toyota Camry',
                'Laptop',
                'House for rent',
                'Samsung Galaxy',
            ],
        ]);
    }
}
