<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedSearch;
use App\Models\Ad;
use Illuminate\Http\Request;

class SavedSearchController extends Controller
{
    public function index(Request $request)
    {
        try {
            $searches = $request->user()
                ->savedSearches()
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json($searches);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Saved searches failed: ' . $e->getMessage());
            return response()->json([
                'data' => [],
                'total' => 0,
            ]);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'search_params' => 'required|array',
            'search_params.keyword' => 'sometimes|string',
            'search_params.category_id' => 'sometimes|exists:categories,id',
            'search_params.location_id' => 'sometimes|exists:locations,id',
            'search_params.min_price' => 'sometimes|numeric',
            'search_params.max_price' => 'sometimes|numeric',
            'search_params.condition' => 'sometimes|string',
            'frequency' => 'sometimes|in:instant,daily,weekly',
            'notify_email' => 'sometimes|boolean',
            'notify_in_app' => 'sometimes|boolean',
        ]);

        $search = SavedSearch::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'search_params' => $validated['search_params'],
            'frequency' => $validated['frequency'] ?? 'instant',
            'notify_email' => $validated['notify_email'] ?? false,
            'notify_in_app' => $validated['notify_in_app'] ?? false,
        ]);

        return response()->json(['message' => 'Saved search created', 'saved_search' => $search], 201);
    }

    public function show($id, Request $request)
    {
        $search = SavedSearch::where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json($search);
    }

    public function update($id, Request $request)
    {
        $search = SavedSearch::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'search_params' => 'sometimes|array',
            'search_params.keyword' => 'sometimes|string',
            'search_params.category_id' => 'sometimes|exists:categories,id',
            'search_params.location_id' => 'sometimes|exists:locations,id',
            'search_params.min_price' => 'sometimes|numeric',
            'search_params.max_price' => 'sometimes|numeric',
            'search_params.condition' => 'sometimes|string',
            'frequency' => 'sometimes|in:instant,daily,weekly',
            'notify_email' => 'sometimes|boolean',
            'notify_in_app' => 'sometimes|boolean',
        ]);

        $search->update($validated);

        return response()->json(['message' => 'Saved search updated', 'saved_search' => $search]);
    }

    public function destroy($id, Request $request)
    {
        $search = SavedSearch::where('user_id', $request->user()->id)
            ->find($id);

        if (!$search) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $search->delete();

        return response()->json(['message' => 'Saved search deleted']);
    }

    public function search($id, Request $request)
    {
        $savedSearch = SavedSearch::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $params = $savedSearch->search_params;

        $query = Ad::with(['images', 'user', 'category', 'location'])
            ->where('status', 'active');

        if (!empty($params['keyword'])) {
            $keyword = $params['keyword'];
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'like', "%{$keyword}%")
                  ->orWhere('description', 'like', "%{$keyword}%");
            });
        }

        if (!empty($params['category_id'])) {
            $query->where('category_id', $params['category_id']);
        }

        if (!empty($params['location_id'])) {
            $query->where('location_id', $params['location_id']);
        }

        if (!empty($params['min_price'])) {
            $query->where('price', '>=', $params['min_price']);
        }

        if (!empty($params['max_price'])) {
            $query->where('price', '<=', $params['max_price']);
        }

        if (!empty($params['condition'])) {
            $query->where('condition', $params['condition']);
        }

        $results = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($results);
    }
}
