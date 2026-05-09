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
            return Category::where('is_active', true)
                ->whereNull('parent_id')
                ->with(['children' => fn($q) => $q->where('is_active', true)->orderBy('name')])
                ->orderBy('sort_order')
                ->orderBy('name')
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
            return Category::with(['parent', 'children'])
                ->orderBy('id')
                ->get();
        });

        return response()->json([
            'data' => $categories,
            'icons' => Icon::getAllIcons(),
            'iconCategories' => Icon::getIconCategories(),
        ])->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }

    public function show($slug)
    {
        $category = Cache::remember('category_show_' . $slug, CacheService::TTL_CATEGORIES, function () use ($slug) {
            return Category::where('slug', $slug)->first();
        });

        if (!$category) {
            return response()->json(['error' => 'Category not found'], 404);
        }

        return response()->json(['data' => $category])
            ->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }
}
