<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CategoryField;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CategoryFieldController extends Controller
{
    public function index(Request $request)
    {
        try {
            $categoryId = $request->category_id;
            
            $fields = CategoryField::when($categoryId, function ($query) use ($categoryId) {
                return $query->where('category_id', $categoryId);
            })
            ->ordered()
            ->get()
            ->groupBy('group_name')
            ->map(function ($group) {
                return $group->values();
            });

            return response()->json([
                'fields' => $fields,
                'flat' => CategoryField::when($categoryId, function ($query) use ($categoryId) {
                    return $query->where('category_id', $categoryId);
                })->ordered()->get(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch category fields: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load fields', 'message' => $e->getMessage()], 500);
        }
    }

    public function forCategory(Category $category)
    {
        try {
            $fields = CategoryField::forCategory($category->id)
                ->ordered()
                ->get()
                ->groupBy('group_name')
                ->map(function ($group) {
                    return $group->values();
                });

            return response()->json([
                'category_id' => $category->id,
                'category_name' => $category->name,
                'fields' => $fields,
                'flat' => CategoryField::forCategory($category->id)->ordered()->get(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch fields for category: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load fields', 'message' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'category_id' => 'required|exists:categories,id',
                'name' => 'required|string|max:255|regex:/^[a-z_]+$/',
                'label' => 'required|string|max:255',
                'type' => 'required|in:text,number,select,multi_select,boolean',
                'options' => 'nullable|array',
                'is_required' => 'boolean',
                'sort_order' => 'integer|min:0',
                'group_name' => 'nullable|string|max:255',
            ]);

            $field = CategoryField::create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'label' => $validated['label'],
                'type' => $validated['type'],
                'options' => $validated['options'] ?? null,
                'is_required' => $validated['is_required'] ?? false,
                'sort_order' => $validated['sort_order'] ?? 0,
                'group_name' => $validated['group_name'] ?? null,
            ]);

            return response()->json([
                'message' => 'Field created successfully',
                'field' => $field,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create category field: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create field', 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, CategoryField $field)
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255|regex:/^[a-z_]+$/',
                'label' => 'sometimes|string|max:255',
                'type' => 'sometimes|in:text,number,select,multi_select,boolean',
                'options' => 'nullable|array',
                'is_required' => 'boolean',
                'sort_order' => 'integer|min:0',
                'group_name' => 'nullable|string|max:255',
            ]);

            $field->update($validated);

            return response()->json([
                'message' => 'Field updated successfully',
                'field' => $field,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update category field: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update field', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(CategoryField $field)
    {
        try {
            $field->delete();

            return response()->json([
                'message' => 'Field deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete category field: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete field', 'message' => $e->getMessage()], 500);
        }
    }

    public function reorder(Request $request)
    {
        try {
            $order = $request->input('order', []);

            foreach ($order as $index => $fieldId) {
                CategoryField::where('id', $fieldId)->update(['sort_order' => $index]);
            }

            return response()->json(['message' => 'Fields reordered successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to reorder fields: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to reorder fields', 'message' => $e->getMessage()], 500);
        }
    }
}
