<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = $request->user();
            if (!$user || $user->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            return $next($request);
        });
    }

    public function index(Request $request)
    {
        $query = Banner::query();

        if ($request->position) {
            $query->where('position', $request->position);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $banners = $query->orderBy('sort_order')->get();

        return response()->json($banners);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'required|image|max:5120',
            'link' => 'nullable|url|max:500',
            'position' => 'required|in:home,category,sidebar',
            'status' => 'in:active,inactive',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'sort_order' => 'integer',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('banners', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $banner = Banner::create($validated);

        return response()->json($banner, 201);
    }

    public function show($id)
    {
        $banner = Banner::findOrFail($id);
        return response()->json($banner);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'image' => 'sometimes|image|max:5120',
            'link' => 'nullable|url|max:500',
            'position' => 'sometimes|in:home,category,sidebar',
            'status' => 'sometimes|in:active,inactive',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'sort_order' => 'integer',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($banner->image) {
                $oldPath = str_replace('/storage/', '', $banner->image);
                Storage::disk('public')->delete($oldPath);
            }
            
            $path = $request->file('image')->store('banners', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $banner->update($validated);

        return response()->json($banner);
    }

    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);

        // Delete image
        if ($banner->image) {
            $path = str_replace('/storage/', '', $banner->image);
            Storage::disk('public')->delete($path);
        }

        $banner->delete();

        return response()->json(['message' => 'Banner deleted']);
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'banners' => 'required|array',
            'banners.*.id' => 'required|exists:banners,id',
            'banners.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['banners'] as $item) {
            Banner::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Banners reordered']);
    }
}
