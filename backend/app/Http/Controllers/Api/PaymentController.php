<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class PaymentController extends Controller
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
        $query = Payment::with(['user', 'ad']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('reference', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function($uq) use ($request) {
                      $uq->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($payments);
    }

    public function show($id)
    {
        $payment = Payment::with(['user', 'ad'])->findOrFail($id);
        return response()->json($payment);
    }

    public function approve($id)
    {
        $payment = Payment::findOrFail($id);
        $payment->update(['status' => 'approved']);
        
        NotificationService::paymentApproved($payment);
        
        return response()->json(['message' => 'Payment approved', 'payment' => $payment]);
    }

    public function reject($id)
    {
        $payment = Payment::findOrFail($id);
        $reason = request('reason');
        $payment->update(['status' => 'rejected']);
        
        NotificationService::paymentRejected($payment, $reason);
        
        return response()->json(['message' => 'Payment rejected', 'payment' => $payment]);
    }

    public function stats()
    {
        $stats = [
            'total' => Payment::count(),
            'pending' => Payment::where('status', 'pending')->count(),
            'approved' => Payment::where('status', 'approved')->count(),
            'rejected' => Payment::where('status', 'rejected')->count(),
            'total_amount' => Payment::where('status', 'approved')->sum('amount'),
            'today_amount' => Payment::where('status', 'approved')
                ->whereDate('created_at', today())
                ->sum('amount'),
            'week_amount' => Payment::where('status', 'approved')
                ->where('created_at', '>=', now()->startOfWeek())
                ->sum('amount'),
            'month_amount' => Payment::where('status', 'approved')
                ->where('created_at', '>=', now()->startOfMonth())
                ->sum('amount'),
        ];

        return response()->json($stats);
    }

    public function financialSummary()
    {
        $summary = [
            'today' => Payment::where('status', 'approved')
                ->whereDate('created_at', today())
                ->selectRaw('SUM(amount) as total, COUNT(*) as count')
                ->first(),
            'this_week' => Payment::where('status', 'approved')
                ->where('created_at', '>=', now()->startOfWeek())
                ->selectRaw('SUM(amount) as total, COUNT(*) as count')
                ->first(),
            'this_month' => Payment::where('status', 'approved')
                ->where('created_at', '>=', now()->startOfMonth())
                ->selectRaw('SUM(amount) as total, COUNT(*) as count')
                ->first(),
            'this_year' => Payment::where('status', 'approved')
                ->where('created_at', '>=', now()->startOfYear())
                ->selectRaw('SUM(amount) as total, COUNT(*) as count')
                ->first(),
            'all_time' => Payment::where('status', 'approved')
                ->selectRaw('SUM(amount) as total, COUNT(*) as count')
                ->first(),
        ];

        return response()->json($summary);
    }
}
