<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Icon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class IconController extends Controller
{
    public function index(Request $request)
    {
        $category = $request->get('category');
        $search = $request->get('search');
        $perPage = $request->get('per_page', 50);

        if ($category && $category !== 'all') {
            $icons = Icon::getIconsByCategory($category);
        } else {
            $icons = Icon::getAllIcons();
        }

        if ($search) {
            $icons = array_filter($icons, function ($icon) use ($search) {
                return str_contains(strtolower($icon), strtolower($search));
            });
        }

        $total = count($icons);
        $icons = array_slice(array_values($icons), 0, $perPage);

        return response()->json([
            'icons' => $icons,
            'categories' => Icon::getIconCategories(),
            'total' => $total,
            'per_page' => $perPage,
        ]);
    }

    public function getAll(Request $request)
    {
        $icons = Icon::getAllIcons();
        $categories = Icon::getIconCategories();

        return response()->json([
            'icons' => $icons,
            'categories' => $categories,
        ]);
    }

    public function getByCategory(Request $request, string $category)
    {
        $search = $request->get('search');

        $icons = Icon::getIconsByCategory($category);

        if ($search) {
            $icons = array_filter($icons, function ($icon) use ($search) {
                return str_contains(strtolower($icon), strtolower($search));
            });
        }

        return response()->json([
            'category' => $category,
            'icons' => array_values($icons),
        ]);
    }

    public function search(Request $request)
    {
        $term = $request->get('q', '');
        $icons = Icon::getAllIcons();

        $results = array_filter($icons, function ($icon) use ($term) {
            return str_contains(strtolower($icon), strtolower($term));
        });

        return response()->json([
            'results' => array_slice(array_values($results), 0, 50),
        ]);
    }

    public function uploadCustom(Request $request)
    {
        $request->validate([
            'icon' => 'required|file|mimes:svg,png|max:1024',
            'name' => 'required|string|max:100|unique:icons,name',
        ]);

        $file = $request->file('icon');
        $extension = $file->getClientOriginalExtension();
        $filename = Str::slug($request->name) . '.' . $extension;

        $path = $file->storeAs('icons', $filename, 'public');

        $icon = Icon::create([
            'name' => $request->name,
            'path' => $path,
            'type' => 'custom',
            'category' => 'custom',
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'icon' => $icon,
            'url' => url('storage/' . $path),
        ]);
    }

    public function deleteCustom(int $id)
    {
        $icon = Icon::where('type', 'custom')->findOrFail($id);

        if ($icon->path) {
            Storage::disk('public')->delete($icon->path);
        }

        $icon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Icon deleted successfully',
        ]);
    }

    public function listCustom()
    {
        $icons = Icon::custom()->get();

        return response()->json([
            'icons' => $icons,
        ]);
    }
}
