<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\AdImage;
use App\Services\ImageStorageService;
use Illuminate\Http\Request;

class AdImageController extends Controller
{
    public function __construct(
        protected ImageStorageService $storage,
    ) {}

    public function store(Request $request, int $adId)
    {
        $ad = Ad::findOrFail($adId);

        if ($request->user()->id !== $ad->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $existingCount = $ad->images()->count();
        $maxImages = ImageStorageService::getMaxImagesPerAd();

        $request->validate([
            'images' => 'required|array|min:1|max:' . ($maxImages - $existingCount),
            'images.*' => 'image|mimes:jpg,jpeg,png,webp,gif,heic,heif|max:5120',
        ]);

        $createdImages = [];

        foreach ($request->file('images') as $index => $file) {
            $this->storage->validateImage($file);

            $result = $this->storage->upload($file, [
                'folder' => 'ads',
                'user_id' => $request->user()->id,
                'tags' => ['ad', 'ad_' . $ad->id],
                'check_rate_limit' => false,
            ]);

            $isPrimary = ($existingCount === 0 && $index === 0);

            $image = AdImage::create([
                'ad_id' => $ad->id,
                'url' => $result['url'],
                'original_url' => $result['original_url'],
                'medium_url' => $result['medium_url'],
                'thumbnail_url' => $result['thumbnail_url'],
                'public_id' => $result['public_id'],
                'width' => $result['width'],
                'height' => $result['height'],
                'file_size' => $result['file_size'],
                'is_primary' => $isPrimary,
                'sort_order' => $existingCount + $index,
            ]);

            $createdImages[] = $image;
        }

        return response()->json([
            'message' => 'Images uploaded successfully',
            'images' => $createdImages,
        ]);
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

        if ($image->public_id) {
            $this->storage->delete($image->public_id);
        }

        $image->delete();

        return response()->json(['message' => 'Image deleted successfully']);
    }
}
