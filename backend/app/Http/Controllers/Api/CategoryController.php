<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Icon;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Cache::remember('categories_index', CacheService::TTL_CATEGORIES, function () {
            return Category::active()->parents()->ordered()
                ->with('activeChildren.activeChildren')
                ->get();
        });

        return response()->json([
            'success' => true,
            'count' => $categories->count(),
            'data' => $categories,
        ])->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }

    public function getAllCategories()
    {
        $categories = Cache::remember('categories_all', CacheService::TTL_CATEGORIES, function () {
            return Category::with(['parent', 'activeChildren.activeChildren'])
                ->ordered()
                ->get();
        });

        return response()->json([
            'data' => $categories,
            'icons' => Icon::getAllIcons(),
            'iconCategories' => Icon::getIconCategories(),
        ])->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }

    public function megaMenu()
    {
        $data = Cache::remember('categories_mega_menu', CacheService::TTL_CATEGORIES, function () {
            $main = Category::active()->parents()->ordered()
                ->with(['activeChildren' => function ($q) {
                    $q->with(['activeChildren' => function ($qq) {
                        $qq->with('activeChildren');
                    }]);
                }])
                ->get();

            $featured = Category::where('is_featured', true)->active()->ordered()->get();
            $trending = Category::where('is_trending', true)->active()->ordered()->get();
            $recentlyAdded = Category::where('created_at', '>=', now()->subDays(30))
                ->active()->ordered()->limit(10)->get();

            return [
                'tree' => $main,
                'featured' => $featured,
                'trending' => $trending,
                'recently_added' => $recentlyAdded,
            ];
        });

        return response()->json(['data' => $data])
            ->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }

    public function show($slug)
    {
        $category = Cache::remember('category_show_' . $slug, CacheService::TTL_CATEGORIES, function () use ($slug) {
            return Category::where('slug', $slug)
                ->with('activeChildren.activeChildren')
                ->first();
        });

        if (!$category) {
            return response()->json(['error' => 'Category not found'], 404);
        }

        return response()->json(['data' => $category])
            ->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }
}
