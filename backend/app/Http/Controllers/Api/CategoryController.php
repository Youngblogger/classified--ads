<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Icon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::where('is_active', true)
            ->whereNull('parent_id')
            ->with('children')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $categories->count(),
            'data' => $categories
        ]);
    }

    public function show($slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        return response()->json(['data' => $category]);
    }

    public function getAllCategories()
    {
        $categories = Category::with(['parent', 'children'])
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => $categories,
            'icons' => Icon::getAllIcons(),
            'iconCategories' => Icon::getIconCategories(),
        ]);
    }
}
