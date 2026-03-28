<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SocialSetting;
use App\Services\SocialMediaService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Social Settings Controller
 * 
 * Handles API endpoints for managing social media credentials:
 * - Get settings (with masked credentials)
 * - Save/update settings
 * - Test connection
 */
class SocialSettingsController extends Controller
{
    protected SocialMediaService $socialService;

    public function __construct(SocialMediaService $socialService)
    {
        $this->socialService = $socialService;
    }

    /**
     * GET /api/social/settings
     * 
     * Get all social platform settings (with masked credentials)
     */
    public function index(): JsonResponse
    {
        $settings = SocialSetting::all()->map(function ($setting) {
            return [
                'id' => $setting->id,
                'platform' => $setting->platform,
                'app_id' => $setting->app_id,
                'app_secret' => $setting->app_secret ? '***' : null,
                'access_token' => $setting->masked_access_token,
                'page_id' => $setting->page_id,
                'instagram_business_id' => $setting->instagram_business_id,
                'is_enabled' => $setting->is_enabled,
                'has_credentials' => $setting->has_credentials,
            ];
        });

        // If no settings exist, return defaults
        if ($settings->isEmpty()) {
            $settings = collect([
                ['platform' => 'facebook', 'has_credentials' => false, 'is_enabled' => true],
                ['platform' => 'instagram', 'has_credentials' => false, 'is_enabled' => true],
            ]);
        }

        return response()->json([
            'success' => true,
            'settings' => $settings,
        ]);
    }

    /**
     * POST /api/social/settings
     * 
     * Save or update social platform settings
     * 
     * @bodyParam platform string required Platform name (facebook, instagram)
     * @bodyParam app_id string optional App ID
     * @bodyParam app_secret string optional App Secret
     * @bodyParam access_token string optional Access Token
     * @bodyParam page_id string optional Page ID (for Facebook)
     * @bodyParam instagram_business_id string optional Instagram Business ID
     * @bodyParam is_enabled boolean optional Enable/disable platform
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'platform' => 'required|in:facebook,instagram',
            'app_id' => 'nullable|string',
            'app_secret' => 'nullable|string',
            'access_token' => 'nullable|string',
            'page_id' => 'nullable|string',
            'instagram_business_id' => 'nullable|string',
            'is_enabled' => 'nullable|boolean',
        ]);

        $platform = $validated['platform'];

        // Check if settings exist for this platform
        $settings = SocialSetting::where('platform', $platform)->first();

        if (!$settings) {
            $settings = new SocialSetting();
            $settings->platform = $platform;
        }

        // Update only provided fields (don't overwrite with empty strings)
        foreach (['app_id', 'app_secret', 'access_token', 'page_id', 'instagram_business_id'] as $field) {
            if (isset($validated[$field]) && !empty($validated[$field])) {
                $settings->$field = $validated[$field];
            }
        }

        if (isset($validated['is_enabled'])) {
            $settings->is_enabled = $validated['is_enabled'];
        }

        $settings->save();

        return response()->json([
            'success' => true,
            'message' => ucfirst($platform) . ' settings saved successfully',
            'settings' => [
                'id' => $settings->id,
                'platform' => $settings->platform,
                'app_id' => $settings->app_id,
                'app_secret' => $settings->app_secret ? '***' : null,
                'access_token' => $settings->masked_access_token,
                'page_id' => $settings->page_id,
                'instagram_business_id' => $settings->instagram_business_id,
                'is_enabled' => $settings->is_enabled,
                'has_credentials' => $settings->has_credentials,
            ],
        ]);
    }

    /**
     * POST /api/social/settings/test
     * 
     * Test connection to a specific platform
     * 
     * @bodyParam platform string required Platform to test
     */
    public function test(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'platform' => 'required|in:facebook,instagram',
        ]);

        $platform = $validated['platform'];

        $result = $this->socialService->testConnection($platform);

        return response()->json([
            'success' => $result['success'],
            'platform' => $platform,
            'message' => $result['message'],
            'data' => $result['data'] ?? null,
        ]);
    }

    /**
     * DELETE /api/social/settings/{platform}
     * 
     * Delete settings for a specific platform
     */
    public function destroy(string $platform): JsonResponse
    {
        $settings = SocialSetting::where('platform', $platform)->first();

        if (!$settings) {
            return response()->json([
                'success' => false,
                'message' => 'Settings not found',
            ], 404);
        }

        $settings->delete();

        return response()->json([
            'success' => true,
            'message' => ucfirst($platform) . ' settings deleted',
        ]);
    }
}
