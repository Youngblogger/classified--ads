<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\AdImage;
use App\Services\ImageProcessingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdImageController extends Controller
{
    public function store(Request $request, int $adId)
    {
        $ad = Ad::findOrFail($adId);

        if ($request->user()->id !== $ad->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $existingCount = $ad->images()->count();
        $maxImages = ImageProcessingService::getMaxImagesPerAd();
        
        $request->validate([
            'images' => 'required|array|min:1|max:' . ($maxImages - $existingCount),
            'images.*' => 'image|mimes:jpg,jpeg,png,webp,gif,heic,heif|max:5120',
        ]);

        $imageService = new ImageProcessingService();
        $createdImages = [];

        foreach ($request->file('images') as $index => $file) {
            $imageService->validateImage($file);
            
            $tempFilename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $tempPath = 'temp/' . $tempFilename;
            
            Storage::disk('public')->put($tempPath, file_get_contents($file->getPathname()));

            $isPrimary = ($existingCount === 0 && $index === 0);

            \App\Jobs\ProcessAdImageJob::dispatch(
                $ad->id,
                $tempPath,
                $existingCount + $index,
                $isPrimary
            );

            $createdImages[] = [
                'temp_path' => $tempPath,
                'sort_order' => $existingCount + $index,
                'is_primary' => $isPrimary,
            ];
        }

        return response()->json([
            'message' => 'Images queued for processing',
            'images' => $createdImages,
        ], 202);
    }

    public function update(Request $request, int $adId, int $imageId)
    {
        $ad = Ad::findOrFail($adId);
        $image = AdImage::where('ad_id', $adId)->findOrFail($imageId);

        if ($request->user()->id !== $ad->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'is_primary' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        if (isset($data['is_primary']) && $data['is_primary']) {
            AdImage::where('ad_id', $adId)->update(['is_primary' => false]);
        }

        $image->update($data);

        return response()->json($image);
    }

    public function destroy(Request $request, int $adId, int $imageId)
    {
        $ad = Ad::findOrFail($adId);
        $image = AdImage::where('ad_id', $adId)->findOrFail($imageId);

        if ($request->user()->id !== $ad->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->deleteImageFiles($image);
        $image->delete();

        return response()->json(['message' => 'Image deleted successfully']);
    }

    private function deleteImageFiles(AdImage $image): void
    {
        $paths = array_filter([
            $image->url,
            $image->original_url,
            $image->thumbnail_url,
        ]);

        foreach ($paths as $path) {
            $storagePath = str_replace('/storage/', '', parse_url($path, PHP_URL_PATH));
            if (Storage::disk('public')->exists($storagePath)) {
                Storage::disk('public')->delete($storagePath);
            }
        }
    }
}
