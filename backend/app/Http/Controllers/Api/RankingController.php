<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\AdListResource;
use App\Services\RankingService;
use App\Services\MonitoringService;
use Illuminate\Http\Request;

class RankingController extends Controller
{
    public function __construct(
        private RankingService $rankingService,
        private MonitoringService $monitoring
    ) {}

    public function feed(Request $request)
    {
        $start = microtime(true);

        $params = [
            'page' => $request->get('page', 1),
            'per_page' => min((int) $request->get('per_page', 20), 50),
            'category_id' => $request->get('category_id'),
            'location_id' => $request->get('location_id'),
            'user_id' => $request->user()?->id,
        ];

        $result = $this->rankingService->getRankedFeed($params);

        $duration = (microtime(true) - $start) * 1000;
        $this->monitoring->recordRequest($request->method(), $request->path(), 200, $duration);

        return response()->json([
            'success' => true,
            'data' => AdListResource::collection(collect($result['data'])),
            'meta' => $result['meta'],
        ]);
    }
}
