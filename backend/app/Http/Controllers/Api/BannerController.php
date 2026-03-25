<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    public function index(Request $request)
    {
        $query = Banner::query();

        if ($request->position) {
            $query->where('position', $request->position);
        }

        if ($request->status) {
            $query->where('is_active', $request->status === 'active');
        }

        $banners = $query->orderBy('sort_order')->get();

        return response()->json($banners);
    }

    public function active(Request $request)
    {
        $query = Banner::where('is_active', true);

        if ($request->position) {
            $query->where('position', $request->position);
        }

        $now = now();
        $query->where(function ($q) use ($now) {
            $q->whereNull('starts_at')
              ->orWhere('starts_at', '<=', $now);
        })->where(function ($q) use ($now) {
            $q->whereNull('ends_at')
              ->orWhere('ends_at', '>=', $now);
        });

        $banners = $query->orderBy('sort_order')->get();

        return response()->json($banners);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'nullable|image|max:5120',
            'image_url' => 'nullable|string|max:500',
            'link_url' => 'nullable|string|max:500',
            'position' => 'required|string|max:50',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'sort_order' => 'integer',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('banners', 'public');
            $validated['image_url'] = url('storage/' . $path);
        } elseif (!empty($validated['image_url'])) {
            // image_url is already set from form
        }

        // Map fields
        $bannerData = [
            'title' => $validated['title'],
            'image_url' => $validated['image_url'] ?? null,
            'link_url' => $validated['link_url'] ?? null,
            'position' => $validated['position'],
            'is_active' => $validated['is_active'] ?? true,
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
        ];

        $banner = Banner::create($bannerData);

        return response()->json(['data' => $banner], 201);
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
            'image' => 'nullable|image|max:5120',
            'image_url' => 'nullable|string|max:500',
            'link_url' => 'nullable|string|max:500',
            'position' => 'sometimes|string|max:50',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'sort_order' => 'integer',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('banners', 'public');
            $validated['image_url'] = url('storage/' . $path);
        }

        // Map fields
        $updateData = [];
        if (isset($validated['title'])) $updateData['title'] = $validated['title'];
        if (isset($validated['image_url'])) $updateData['image_url'] = $validated['image_url'];
        if (isset($validated['link_url'])) $updateData['link_url'] = $validated['link_url'];
        if (isset($validated['position'])) $updateData['position'] = $validated['position'];
        if (isset($validated['is_active'])) $updateData['is_active'] = $validated['is_active'];
        if (isset($validated['starts_at'])) $updateData['starts_at'] = $validated['starts_at'];
        if (isset($validated['ends_at'])) $updateData['ends_at'] = $validated['ends_at'];
        if (isset($validated['sort_order'])) $updateData['sort_order'] = $validated['sort_order'];

        $banner->update($updateData);

        return response()->json(['data' => $banner]);
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
