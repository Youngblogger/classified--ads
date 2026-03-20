<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Ad;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function __construct()
    {
        // Only apply admin middleware to specific methods
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ad_id' => 'required|exists:ads,id',
            'reason' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'pending';

        $report = Report::create($validated);

        return response()->json([
            'message' => 'Report submitted successfully',
            'report' => $report
        ], 201);
    }

    public function index(Request $request)
    {
        $query = Report::with(['user', 'ad']);

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->reason) {
            $query->where('reason', $request->reason);
        }

        $reports = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($reports);
    }

    public function resolve($id)
    {
        $report = Report::findOrFail($id);
        $report->update(['status' => 'resolved']);
        
        NotificationService::reportActioned($report, 'resolved');
        
        return response()->json(['message' => 'Report resolved', 'report' => $report]);
    }

    public function dismiss($id)
    {
        $report = Report::findOrFail($id);
        $report->update(['status' => 'dismissed']);
        
        NotificationService::reportActioned($report, 'dismissed');
        
        return response()->json(['message' => 'Report dismissed', 'report' => $report]);
    }

    public function destroy($id)
    {
        $report = Report::findOrFail($id);
        $report->delete();
        
        return response()->json(['message' => 'Report deleted']);
    }

    public function stats()
    {
        $stats = [
            'total' => Report::count(),
            'pending' => Report::where('status', 'pending')->count(),
            'resolved' => Report::where('status', 'resolved')->count(),
            'dismissed' => Report::where('status', 'dismissed')->count(),
        ];

        $byReason = Report::select('reason', DB::raw('COUNT(*) as count'))
            ->groupBy('reason')
            ->get();

        return response()->json([
            'stats' => $stats,
            'by_reason' => $byReason,
        ]);
    }
}
