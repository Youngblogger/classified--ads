<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\AdFixLog;
use App\Services\AdQualityService;
use App\Services\AutoFixService;
use App\Jobs\AutoFixAdJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdModerationController extends Controller
{
    private AdQualityService $qualityService;
    private AutoFixService $autoFixService;

    public function __construct(AdQualityService $qualityService, AutoFixService $autoFixService)
    {
        $this->qualityService = $qualityService;
        $this->autoFixService = $autoFixService;
    }

    public function index(Request $request)
    {
        $query = Ad::with(['images', 'category', 'user']);

        // Filter by quality
        if ($request->filter === 'flagged') {
            $query->where('is_flagged', true);
        } elseif ($request->filter === 'clean') {
            $query->where('is_flagged', false);
        }

        // Filter by quality score range
        if ($request->score_range) {
            switch ($request->score_range) {
                case 'good':
                    $query->where('quality_score', '>=', 80);
                    break;
                case 'fair':
                    $query->whereBetween('quality_score', [50, 79]);
                    break;
                case 'poor':
                    $query->where('quality_score', '<', 50);
                    break;
            }
        }

        // Filter by seeded
        if ($request->has('seeded')) {
            $query->where('is_seeded', filter_var($request->seeded, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by category
        if ($request->category) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        $perPage = $request->input('per_page', 20);
        $ads = $query->orderBy('quality_score', 'asc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($ads);
    }

    public function stats()
    {
        $stats = $this->qualityService->getQualityStats();
        $imageStats = $this->autoFixService->getImageUsageStats();

        return response()->json([
            'quality' => $stats,
            'images' => $imageStats,
        ]);
    }

    public function analyze(Ad $ad)
    {
        $result = $this->qualityService->analyzeAndUpdate($ad);

        return response()->json([
            'ad' => $ad->fresh(['images', 'category', 'user']),
            'analysis' => $result,
        ]);
    }

    public function analyzeAll()
    {
        $results = $this->qualityService->analyzeAll();

        return response()->json([
            'total_analyzed' => count($results),
            'flagged_count' => collect($results)->where('is_flagged', true)->count(),
            'average_score' => round(collect($results)->avg('score'), 1),
            'results' => $results,
        ]);
    }

    public function fix(Request $request, $id)
    {
        // Fetch ad directly instead of using route model binding
        $ad = Ad::find($id);
        
        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Ad not found',
            ], 404);
        }
        
        $userId = $request->user()?->id;

        // Safety check: only auto-fix seeded ads
        if (!$ad->is_seeded) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot auto-fix non-seeded ads. Manual approval required.',
            ], 403);
        }

        $result = $this->autoFixService->fix($ad, $userId);

        return response()->json($result);
    }

    public function fixBulk(Request $request)
    {
        $request->validate([
            'ad_ids' => 'required|array',
            'ad_ids.*' => 'integer|exists:ads,id',
        ]);

        $userId = $request->user()?->id;
        $adIds = $request->ad_ids;

        // Verify all ads are seeded
        $nonSeededCount = Ad::whereIn('id', $adIds)->where('is_seeded', false)->count();
        if ($nonSeededCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot auto-fix {$nonSeededCount} non-seeded ad(s). Only seeded ads can be auto-fixed.",
            ], 403);
        }

        $results = $this->autoFixService->fixBulk($adIds, $userId);

        return response()->json([
            'success' => true,
            'total' => count($results),
            'succeeded' => collect($results)->where('success', true)->count(),
            'failed' => collect($results)->where('success', false)->count(),
            'results' => $results,
        ]);
    }

    public function fixAllFlagged(Request $request)
    {
        $userId = $request->user()?->id;
        $useQueue = $request->boolean('queue', false);

        if ($useQueue) {
            $this->autoFixService->dispatchFixAllFlagged($userId);
            return response()->json([
                'success' => true,
                'message' => 'Auto-fix jobs dispatched to queue',
            ]);
        }

        $results = $this->autoFixService->fixAllFlagged($userId);

        return response()->json([
            'success' => true,
            'total' => count($results),
            'succeeded' => collect($results)->where('success', true)->count(),
            'failed' => collect($results)->where('success', false)->count(),
            'results' => $results,
        ]);
    }

    public function deleteImages(Request $request, $id)
    {
        // Fetch ad directly instead of using route model binding
        $ad = Ad::find($id);
        
        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Ad not found',
            ], 404);
        }
        
        $userId = $request->user()?->id;
        $result = $this->autoFixService->deleteImages($ad, $userId);

        return response()->json($result);
    }

    public function replaceImages(Request $request, $id)
    {
        // Fetch ad directly instead of using route model binding
        $ad = Ad::with('category')->find($id);
        
        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Ad not found',
                'ad_id' => null,
            ], 404);
        }
        
        \Illuminate\Support\Facades\Log::info('replaceImages controller', [
            'ad_id' => $ad->id,
            'ad_title' => $ad->title ?? 'no title',
        ]);
        
        $userId = $request->user()?->id;
        $result = $this->autoFixService->replaceImages($ad, $userId);

        return response()->json($result);
    }

    public function logs(Request $request)
    {
        $adId = $request->input('ad_id');
        $limit = $request->input('limit', 50);

        $logs = $this->autoFixService->getFixLogs($adId, $limit);

        return response()->json($logs);
    }
}
