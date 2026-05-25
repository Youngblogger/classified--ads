<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdImage;
use App\Services\ImageProcessingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;

class ImageUploadController extends Controller
{
    private ImageProcessingService $imageService;

    public function __construct(ImageProcessingService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
        ]);

        $file = $request->file('image');
        $imageHash = hash_file('sha256', $file->getPathname());

        // Server-side duplicate detection
        $existing = AdImage::where('image_hash', $imageHash)->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'This image has already been uploaded.',
            ], 409);
        }

        try {
            $result = $this->imageService->processAdImage($file);

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'data' => [
                    'url' => url($result['url']),
                    'thumbnail_url' => url($result['thumbnail_url']),
                    'medium_url' => url($result['medium_url']),
                    'original_url' => url($result['original_url']),
                    'image_hash' => $imageHash,
                    'width' => $result['width'] ?? 0,
                    'height' => $result['height'] ?? 0,
                    'file_size' => $result['file_size'] ?? 0,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Image upload failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process image: ' . $e->getMessage(),
            ], 500);
        }
    }
}
