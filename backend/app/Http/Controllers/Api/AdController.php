<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use Illuminate\Http\Request;

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
        ]);

        $data['slug'] = \Illuminate\Support\Str::slug($request->title) . '-' . time();
        $data['user_id'] = $request->user()->id;
        $data['status'] = 'active';

        $ad = Ad::create($data);

        return response()->json(['data' => $ad], 201);
    }
}
