<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::where('is_active', true)
            ->with('children')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $categories]);
    }

    public function show($slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        return response()->json(['data' => $category]);
    }
}
