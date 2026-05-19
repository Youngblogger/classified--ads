<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FilterMetaService;
use Illuminate\Http\Request;

class FilterMetaController extends Controller
{
    public function __construct(
        private FilterMetaService $filterMeta
    ) {}

    public function index(Request $request)
    {
        try {
            $meta = $this->filterMeta->getMeta(
                $request->get('category'),
                $request->get('subcategory')
            );

            return response()->json([
                'data' => $meta,
            ])->header('Cache-Control', 'public, max-age=120, s-maxage=120');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('FilterMeta failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load filters'], 500);
        }
    }
}
