<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\PromotionPlan;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = $request->user();
            if (!$user || $user->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            return $next($request);
        });
    }

    public function index(Request $request)
    {
        $query = Promotion::with(['ad', 'plan']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->ad_id) {
            $query->where('ad_id', $request->ad_id);
        }

        $promotions = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($promotions);
    }

    public function plans()
    {
        $plans = PromotionPlan::orderBy('price')->get();
        return response()->json($plans);
    }

    public function createPlan(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $plan = PromotionPlan::create($validated);
        return response()->json($plan, 201);
    }

    public function updatePlan(Request $request, $id)
    {
        $plan = PromotionPlan::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'duration_days' => 'sometimes|integer|min:1',
            'features' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $plan->update($validated);
        return response()->json($plan);
    }

    public function deletePlan($id)
    {
        $plan = PromotionPlan::findOrFail($id);
        $plan->delete();
        return response()->json(['message' => 'Plan deleted']);
    }

    public function approve($id)
    {
        $promotion = Promotion::with(['ad', 'plan'])->findOrFail($id);
        $promotion->update(['status' => 'active']);
        
        NotificationService::promotionActivated($promotion);
        
        return response()->json($promotion);
    }

    public function cancel($id)
    {
        $promotion = Promotion::with(['ad'])->findOrFail($id);
        $promotion->update(['status' => 'cancelled']);
        
        return response()->json($promotion);
    }

    public function delete($id)
    {
        $promotion = Promotion::findOrFail($id);
        $promotion->delete();
        return response()->json(['message' => 'Promotion deleted']);
    }

    public function stats()
    {
        $stats = [
            'total' => Promotion::count(),
            'active' => Promotion::where('status', 'active')->count(),
            'expired' => Promotion::where('status', 'expired')->count(),
            'cancelled' => Promotion::where('status', 'cancelled')->count(),
            'total_revenue' => Promotion::where('status', 'active')->sum('amount_paid'),
        ];

        return response()->json($stats);
    }
}
