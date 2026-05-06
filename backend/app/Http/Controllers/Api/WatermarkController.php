<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WatermarkSetting;
use App\Services\CloudinaryService;
use App\Jobs\RegenerateAllWatermarksJob;
use Illuminate\Http\Request;

class WatermarkController extends Controller
{
    public function index()
    {
        $settings = WatermarkSetting::getSettings();
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'enabled' => 'sometimes|boolean',
            'type' => 'sometimes|in:text,logo',
            'text' => 'sometimes|string|max:255',
            'logo_url' => 'nullable|string',
            'text_color' => 'sometimes|string|size:7',
            'shadow_color' => 'sometimes|string|size:7',
            'shadow_opacity' => 'sometimes|integer|min:0|max:100',
            'position' => 'sometimes|in:bottom_right,bottom_left,top_right,top_left,center',
            'opacity' => 'sometimes|integer|min:0|max:100',
            'font_size' => 'sometimes|integer|min:8|max:72',
            'font_family' => 'nullable|string',
            'font_path' => 'nullable|string',
            'margin' => 'sometimes|integer|min:0|max:100',
            'rotation' => 'sometimes|integer|min:-180|max:180',
            'show_ad_id' => 'sometimes|boolean',
            'apply_to_original' => 'sometimes|boolean',
            'apply_to_medium' => 'sometimes|boolean',
            'apply_to_thumbnail' => 'sometimes|boolean',
        ]);

        $settings = WatermarkSetting::getSettings();
        $settings->update($data);

        if ($request->boolean('regenerate_all')) {
            RegenerateAllWatermarksJob::dispatch();
        }

        return response()->json($settings);
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:png,gif,webp|max:5120',
        ]);

        $cloudinary = new CloudinaryService();
        $file = $request->file('logo');
        $tempPath = $file->getPathname();
        $publicId = 'watermark/logo_' . time();

        $uploadResult = $cloudinary->uploadImage($tempPath, [
            'folder' => 'classified-ads/watermarks',
            'public_id' => $publicId,
        ]);

        if (!$uploadResult['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload logo: ' . ($uploadResult['error'] ?? 'Unknown error'),
            ], 500);
        }

        $url = $uploadResult['secure_url'];

        $settings = WatermarkSetting::getSettings();
        $settings->update([
            'logo_url' => $url,
            'logo_public_id' => $uploadResult['public_id'],
        ]);

        return response()->json([
            'success' => true,
            'logo_url' => $url,
            'settings' => $settings,
        ]);
    }
}
