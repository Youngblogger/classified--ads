<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdImage;
use App\Services\ImageStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ImageUploadController extends Controller
{
    public function __construct(
        protected ImageStorageService $storage,
    ) {}

    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
        ]);

        $file = $request->file('image');
        $imageHash = hash_file('sha256', $file->getPathname());

        $existing = AdImage::where('image_hash', $imageHash)->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'This image has already been uploaded.',
            ], 409);
        }

        try {
            $this->storage->validateImage($file);

            $result = $this->storage->upload($file, [
                'folder' => 'ads',
                'user_id' => $request->user()?->id,
                'tags' => ['temp'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'data' => [
                    'url' => $result['url'],
                    'thumbnail_url' => $result['thumbnail_url'],
                    'medium_url' => $result['medium_url'],
                    'original_url' => $result['original_url'],
                    'public_id' => $result['public_id'],
                    'image_hash' => $imageHash,
                    'width' => $result['width'] ?? 0,
                    'height' => $result['height'] ?? 0,
                    'file_size' => $result['file_size'] ?? 0,
                ],
            ]);
        } catch (\RuntimeException $e) {
            Log::error('Image upload failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process image: ' . $e->getMessage(),
            ], 500);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
