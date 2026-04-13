<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\ScheduledPost;
use App\Models\SocialPostLog;
use App\Services\SocialMediaService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Social Media Post Controller
 * 
 * Handles all social media posting operations:
 * - Manual single ad posting
 * - Batch posting multiple ads
 * - Scheduling posts for later
 * - Retrying failed posts
 * - Viewing post history
 */
class SocialPostController extends Controller
{
    protected SocialMediaService $socialService;

    public function __construct(SocialMediaService $socialService)
    {
        $this->socialService = $socialService;
    }

    /**
     * POST /api/social/post-ad
     * 
     * Post a single ad to social media immediately
     * 
     * @bodyParam ad_id int required The ID of the ad to post
     * @bodyParam platforms array optional Specific platforms to post to (facebook, instagram)
     * @bodyParam schedule_at string optional Schedule for later (Y-m-d H:i:s)
     */
    public function postAd(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ad_id' => 'required|exists:ads,id',
            'platforms' => 'nullable|array',
            'platforms.*' => 'in:facebook,instagram',
            'schedule_at' => 'nullable|date',
        ]);

        $ad = Ad::with(['images', 'location', 'category'])->findOrFail($validated['ad_id']);
        $platforms = $validated['platforms'] ?? [];
        $scheduleAt = $validated['schedule_at'] ?? null;

        // If schedule_at is provided, create a scheduled post
        if ($scheduleAt) {
            $scheduledPost = ScheduledPost::create([
                'ad_id' => $ad->id,
                'scheduled_time' => $scheduleAt,
                'status' => 'pending',
                'platform_statuses' => array_fill_keys($platforms ?: ['facebook', 'instagram'], 'pending'),
                'created_by' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Post scheduled successfully',
                'scheduled_post' => $scheduledPost,
            ]);
        }

        // Post immediately
        $results = $this->socialService->postAd($ad, $platforms);

        // Determine overall status
        $status = 'posted';
        if (in_array('failed', array_column($results, 'status'))) {
            $status = 'partial';
        }
        if (count(array_filter($results, fn($r) => $r['status'] === 'skipped')) === count($results)) {
            $status = 'no_platforms';
        }

        return response()->json([
            'success' => true,
            'message' => 'Ad posted to social media',
            'status' => $status,
            'results' => $results,
        ]);
    }

    /**
     * POST /api/social/post-ads-batch
     * 
     * Post multiple ads to social media
     * 
     * @bodyParam ad_ids array required List of ad IDs to post
     * @bodyParam platforms array optional Specific platforms to post to
     * @bodyParam schedule_at string optional Schedule for later
     */
    public function postAdsBatch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ad_ids' => 'required|array',
            'ad_ids.*' => 'integer',
            'platforms' => 'nullable|array',
            'platforms.*' => 'in:facebook,instagram,x,whatsapp',
            'schedule_at' => 'nullable|date',
        ]);

        $adIds = $validated['ad_ids'];
        $platforms = $validated['platforms'] ?? ['facebook', 'instagram'];
        $scheduleAt = $validated['schedule_at'] ?? null;

        $results = [];
        $createdScheduledPosts = [];
        $successCount = 0;

        foreach ($adIds as $adId) {
            $ad = Ad::with(['images', 'location'])->find($adId);
            
            if (!$ad) {
                $results[$adId] = [
                    'success' => false,
                    'error' => 'Ad not found',
                ];
                continue;
            }

            if ($scheduleAt) {
                // Create scheduled post
                $scheduledPost = ScheduledPost::create([
                    'ad_id' => $ad->id,
                    'scheduled_time' => $scheduleAt,
                    'status' => 'pending',
                    'platform_statuses' => array_fill_keys($platforms, 'pending'),
                    'created_by' => $request->user()->id,
                ]);

                $createdScheduledPosts[] = $scheduledPost;
                $results[$adId] = [
                    'success' => true,
                    'scheduled_post_id' => $scheduledPost->id,
                ];
                $successCount++;
            } else {
                // Post immediately
                $postResults = $this->socialService->postAd($ad, $platforms);
                
                // Check if any platform was posted successfully
                $anySuccess = collect($postResults)->contains('status', 'success');
                
                $results[$adId] = [
                    'success' => $anySuccess,
                    'results' => $postResults,
                ];
                
                if ($anySuccess) {
                    $successCount++;
                }
            }
        }

        $message = $scheduleAt 
            ? "{$successCount} posts scheduled successfully"
            : "{$successCount} ads posted to social media";

        return response()->json([
            'success' => true,
            'message' => $message,
            'results' => $results,
            'scheduled_posts' => $createdScheduledPosts,
            'posted_count' => $successCount,
            'total_count' => count($adIds),
        ]);
    }

    /**
     * GET /api/social/posts
     * 
     * Get list of all social posts with their status
     * 
     * @queryParam status string optional Filter by status (pending, posted, failed)
     * @queryParam platform string optional Filter by platform
     * @queryParam per_page int optional Number of results per page
     */
    public function index(Request $request): JsonResponse
    {
        $query = SocialPostLog::with(['ad:id,title,slug', 'scheduledPost'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by platform
        if ($request->has('platform')) {
            $query->where('platform', $request->platform);
        }

        // Filter by ad_id
        if ($request->has('ad_id')) {
            $query->where('ad_id', $request->ad_id);
        }

        $perPage = $request->input('per_page', 20);
        $posts = $query->paginate($perPage);

        return response()->json($posts);
    }

    /**
     * GET /api/social/scheduled
     * 
     * Get list of scheduled posts
     */
    public function scheduled(Request $request): JsonResponse
    {
        $query = ScheduledPost::with(['ad:id,title,slug,status', 'creator:id,name'])
            ->orderBy('scheduled_time', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->input('per_page', 20);
        $posts = $query->paginate($perPage);

        return response()->json($posts);
    }

    /**
     * POST /api/social/retry/{id}
     * 
     * Retry a failed social post
     * 
     * @param int $id The social post log ID
     */
    public function retry(int $id): JsonResponse
    {
        $log = SocialPostLog::findOrFail($id);

        if ($log->status === 'success') {
            return response()->json([
                'success' => false,
                'message' => 'This post was already successful',
            ], 400);
        }

        if ($log->attempt_count >= 3) {
            return response()->json([
                'success' => false,
                'message' => 'Maximum retry attempts (3) reached',
            ], 400);
        }

        try {
            $result = $this->socialService->retryPost($log);

            return response()->json([
                'success' => $result['status'] === 'success',
                'message' => $result['status'] === 'success' ? 'Post retry successful' : 'Post retry failed',
                'result' => $result,
            ]);
        } catch (\Exception $e) {
            Log::error('Social post retry failed', [
                'log_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Retry failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/social/cancel/{id}
     * 
     * Cancel a scheduled post
     */
    public function cancel(int $id): JsonResponse
    {
        $scheduledPost = ScheduledPost::findOrFail($id);

        if ($scheduledPost->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending posts can be cancelled',
            ], 400);
        }

        $scheduledPost->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Scheduled post cancelled',
        ]);
    }

    /**
     * GET /api/social/stats
     * 
     * Get posting statistics
     */
    public function stats(): JsonResponse
    {
        $totalPosts = SocialPostLog::count();
        $successfulPosts = SocialPostLog::where('status', 'success')->count();
        $failedPosts = SocialPostLog::where('status', 'failed')->count();
        $pendingScheduled = ScheduledPost::where('status', 'pending')->count();

        // Posts by platform
        $byPlatform = SocialPostLog::select('platform')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('SUM(CASE WHEN status = "success" THEN 1 ELSE 0 END) as successful')
            ->selectRaw('SUM(CASE WHEN status = "failed" THEN 1 ELSE 0 END) as failed')
            ->groupBy('platform')
            ->get();

        return response()->json([
            'total_posts' => $totalPosts,
            'successful_posts' => $successfulPosts,
            'failed_posts' => $failedPosts,
            'success_rate' => $totalPosts > 0 ? round(($successfulPosts / $totalPosts) * 100, 2) : 0,
            'pending_scheduled' => $pendingScheduled,
            'by_platform' => $byPlatform,
        ]);
    }
}
