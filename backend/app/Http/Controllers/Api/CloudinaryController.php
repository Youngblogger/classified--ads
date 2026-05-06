<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class CloudinaryController extends Controller
{
    public function getSignedUploadParams(Request $request, CloudinaryService $cloudinary): JsonResponse
    {
        $request->validate([
            'folder' => 'nullable|string|in:ads,avatars,banners,proofs,documents,default',
            'public_id_prefix' => 'nullable|string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $user = $request->user();

        $options = [
            'folder' => $request->input('folder', 'default'),
            'user_id' => $user?->id,
        ];

        if ($request->filled('public_id_prefix')) {
            $options['public_id_prefix'] = $request->input('public_id_prefix');
        }

        if ($request->filled('tags')) {
            $options['tags'] = $request->input('tags');
        }

        $params = $cloudinary->generateSignedUploadParams($options);

        return response()->json([
            'success' => true,
            'data' => [
                'upload_url' => "https://api.cloudinary.com/v1_1/{$params['cloud_name']}/image/upload",
                'params' => [
                    'api_key' => $params['api_key'],
                    'timestamp' => $params['timestamp'],
                    'signature' => $params['signature'],
                    'folder' => $params['folder'],
                    'quality' => $params['quality'],
                    'fetch_format' => $params['fetch_format'],
                    'eager' => $params['eager'],
                    'eager_async' => $params['eager_async'],
                    'public_id' => $params['public_id'] ?? null,
                ],
            ],
        ]);
    }

    public function uploadCallback(Request $request, CloudinaryService $cloudinary): JsonResponse
    {
        $validated = $request->validate([
            'public_id' => 'required|string',
            'secure_url' => 'required|url',
            'width' => 'required|integer',
            'height' => 'required|integer',
            'format' => 'required|string',
            'bytes' => 'required|integer',
            'folder' => 'required|string',
        ]);

        $result = [
            'public_id' => $validated['public_id'],
            'secure_url' => $validated['secure_url'],
            'url' => str_replace('https://', 'http://', $validated['secure_url']),
            'width' => $validated['width'],
            'height' => $validated['height'],
            'format' => $validated['format'],
            'bytes' => $validated['bytes'],
            'thumbnail_url' => $cloudinary->getThumbnailUrl($validated['public_id']),
            'optimized_url' => $cloudinary->getOptimizedUrl($validated['public_id']),
            'blur_url' => $cloudinary->getBlurPlaceholderUrl($validated['public_id']),
        ];

        Log::info('Direct Cloudinary upload completed', [
            'public_id' => $validated['public_id'],
            'user_id' => $request->user()?->id,
            'folder' => $validated['folder'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    public function getConfig(CloudinaryService $cloudinary): JsonResponse
    {
        $config = $cloudinary->getCloudinaryConfig();

        return response()->json([
            'success' => true,
            'data' => [
                'cloud_name' => $config['cloud_name'],
                'folders' => $config['folders'],
                'max_file_size' => $config['max_file_size'],
                'allowed_mime_types' => $config['allowed_mime_types'],
                'max_uploads_per_minute' => $config['max_uploads_per_minute'],
            ],
        ]);
    }

    public function validateImage(Request $request, CloudinaryService $cloudinary): JsonResponse
    {
        $request->validate([
            'image' => 'required|file',
        ]);

        $file = $request->file('image');
        $tempPath = $file->getPathname();

        $validation = $cloudinary->validateImageFile($tempPath);

        if (!$validation['valid']) {
            return response()->json([
                'success' => false,
                'error' => $validation['error'],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'mime_type' => $validation['mime_type'],
                'width' => $validation['width'],
                'height' => $validation['height'],
                'size' => $validation['size'],
                'size_formatted' => number_format($validation['size'] / 1024, 2) . ' KB',
            ],
        ]);
    }
}
