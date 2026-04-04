<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\User;
use App\Models\Category;
use App\Models\Location;
use App\Models\Notification;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{

    // Dashboard Stats
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_ads' => Ad::count(),
            'active_ads' => Ad::where('status', 'active')->count(),
            'pending_ads' => Ad::where('status', 'pending')->count(),
            'flagged_ads' => Ad::where('verification_status', 'flagged')->count(),
            'processing_ads' => Ad::where('processing_status', 'processing')->count(),
            'total_views' => Ad::sum('views'),
            'new_users_today' => User::whereDate('created_at', today())->count(),
            'new_ads_today' => Ad::whereDate('created_at', today())->count(),
        ];

        $recentAds = Ad::with(['user', 'category', 'location'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentUsers = User::orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'recent_ads' => $recentAds,
            'recent_users' => $recentUsers,
        ]);
    }

    // Ads Management
    public function ads(Request $request)
    {
        $query = Ad::with(['user', 'category', 'location', 'images']);

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->verification_status && $request->verification_status !== 'all') {
            $query->where('verification_status', $request->verification_status);
        }

        if ($request->processing_status && $request->processing_status !== 'all') {
            $query->where('processing_status', $request->processing_status);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $ads = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($ads);
    }

    public function flaggedAds(Request $request)
    {
        $query = Ad::with(['user', 'category', 'location', 'images'])
            ->where('verification_status', 'flagged');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $ads = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($ads);
    }

    public function approveAd($id)
    {
        $ad = Ad::findOrFail($id);
        $ad->update(['status' => 'active']);
        
        NotificationService::adApproved($ad);
        NotificationService::notifyFollowersOfNewAd($ad);
        
        return response()->json(['message' => 'Ad approved', 'ad' => $ad]);
    }

    public function rejectAd($id)
    {
        $ad = Ad::findOrFail($id);
        $rejectionReason = request('reason', 'Your ad does not meet our listing guidelines.');
        $ad->update([
            'status' => 'rejected',
            'rejection_reason' => $rejectionReason,
        ]);
        
        NotificationService::adRejected($ad, $rejectionReason);
        
        return response()->json(['message' => 'Ad rejected', 'ad' => $ad]);
    }

    public function verifyAd($id)
    {
        $ad = Ad::findOrFail($id);
        $ad->update([
            'verification_status' => 'verified',
            'is_verified' => true,
        ]);
        
        return response()->json(['message' => 'Ad verified', 'ad' => $ad]);
    }

    public function reprocessAd($id)
    {
        $ad = Ad::findOrFail($id);
        $ad->update([
            'processing_status' => 'pending',
            'verification_status' => 'pending',
        ]);
        
        \App\Jobs\ProcessAdJob::dispatch($ad->id);
        
        return response()->json(['message' => 'Ad queued for reprocessing', 'ad' => $ad]);
    }

    public function deleteAd($id)
    {
        $ad = Ad::findOrFail($id);
        $ad->delete();
        return response()->json(['message' => 'Ad deleted']);
    }

    public function bulkDeleteAds(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:ads,id'
        ]);

        Ad::whereIn('id', $validated['ids'])->delete();

        return response()->json(['message' => 'Ads deleted successfully', 'count' => count($validated['ids'])]);
    }

    // Users Management
    public function users(Request $request)
    {
        $query = User::query();

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->role) {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($users);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $wasVerified = $user->verified;
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $id,
            'role' => 'sometimes|in:user,admin,moderator',
            'status' => 'sometimes|in:active,suspended,banned',
            'verified' => 'sometimes|boolean',
        ]);

        $user->update($validated);
        
        if (isset($validated['verified']) && $validated['verified'] && !$wasVerified) {
            NotificationService::accountVerified($user);
        }
        
        return response()->json($user);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }

    public function suspendUser($id)
    {
        $user = User::findOrFail($id);
        $user->update([
            'status' => 'suspended',
            'suspended_at' => now(),
        ]);
        
        NotificationService::accountSuspended($user);
        
        return response()->json(['message' => 'User suspended', 'user' => $user]);
    }

    public function banUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $reason = $request->reason ?? 'Violation of terms';
        $user->update([
            'status' => 'banned',
            'banned_at' => now(),
            'ban_reason' => $reason,
        ]);
        
        NotificationService::accountBanned($user, $reason);
        
        return response()->json(['message' => 'User banned', 'user' => $user]);
    }

    public function activateUser($id)
    {
        $user = User::findOrFail($id);
        $wasStatus = $user->status;
        $user->update([
            'status' => 'active',
            'suspended_at' => null,
            'banned_at' => null,
            'ban_reason' => null,
        ]);
        
        if ($wasStatus === 'suspended' || $wasStatus === 'banned') {
            NotificationService::accountUnsuspended($user);
        }
        
        return response()->json(['message' => 'User activated', 'user' => $user]);
    }

    // Categories Management
    public function categories(Request $request)
    {
        $query = Category::query();

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $categories = $query->orderBy('sort_order')->get();
        return response()->json($categories);
    }

    public function createCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories',
            'icon' => 'nullable|string',
            'image' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        $category = Category::create($validated);
        return response()->json($category, 201);
    }

    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:categories,slug,' . $id,
            'icon' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer',
        ]);

        $category->update($validated);
        return response()->json($category);
    }

    public function deleteCategory($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }

    // Locations Management
    public function locations(Request $request)
    {
        $query = Location::query();

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $locations = $query->orderBy('name')->get();
        return response()->json($locations);
    }

    public function createLocation(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:locations',
            'parent_id' => 'nullable|exists:locations,id',
        ]);

        $location = Location::create($validated);
        return response()->json($location, 201);
    }

    public function updateLocation(Request $request, $id)
    {
        $location = Location::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:locations,slug,' . $id,
            'is_active' => 'sometimes|boolean',
        ]);

        $location->update($validated);
        return response()->json($location);
    }

    public function deleteLocation($id)
    {
        $location = Location::findOrFail($id);
        $location->delete();
        return response()->json(['message' => 'Location deleted']);
    }

    // Reports
    public function reports(Request $request)
    {
        $reports = DB::table('reports')
            ->join('users', 'reports.user_id', '=', 'users.id')
            ->join('ads', 'reports.ad_id', '=', 'ads.id')
            ->select('reports.*', 'users.name as reporter_name', 'ads.title as ad_title')
            ->orderBy('reports.created_at', 'desc')
            ->paginate(20);

        return response()->json($reports);
    }

    public function resolveReport($id)
    {
        DB::table('reports')->where('id', $id)->update(['status' => 'resolved']);
        return response()->json(['message' => 'Report resolved']);
    }

    // Analytics
    public function analytics(Request $request)
    {
        $days = match($request->period) {
            '7days' => 7,
            '30days' => 30,
            '90days' => 90,
            'year' => 365,
            default => 7,
        };
        
        $adsByDay = Ad::select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $usersByDay = User::select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $categoryStats = Category::withCount('ads')
            ->orderBy('ads_count', 'desc')
            ->limit(10)
            ->get();

        // Transform data for frontend charts
        $userGrowth = $usersByDay->map(function($item) {
            return [
                'name' => Carbon::parse($item->date)->format('M d'),
                'users' => (int) $item->count
            ];
        })->toArray();

        $adsPosted = $adsByDay->map(function($item) {
            return [
                'name' => Carbon::parse($item->date)->format('M d'),
                'ads' => (int) $item->count
            ];
        })->toArray();

        $categoryColorsArr = ['#0ea5e9', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#64748b', '#f97316', '#a855f7', '#3b82f6'];
        $categoryDistribution = $categoryStats->map(function($cat, $index) use ($categoryColorsArr) {
            return [
                'name' => $cat->name,
                'value' => (int) $cat->ads_count,
                'color' => $categoryColorsArr[$index % count($categoryColorsArr)]
            ];
        })->toArray();

        // Ad status distribution
        $adStatusCounts = Ad::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();
        
        $statusColors = [
            'active' => '#10b981',
            'pending' => '#f59e0b',
            'rejected' => '#ef4444',
            'expired' => '#6b7280',
        ];
        
        $adStatus = $adStatusCounts->map(function($status) use ($statusColors) {
            return [
                'name' => ucfirst($status->status),
                'value' => (int) $status->count,
                'color' => $statusColors[$status->status] ?? '#64748b'
            ];
        })->toArray();

        return response()->json([
            'user_growth' => $userGrowth,
            'ads_posted' => $adsPosted,
            'category_distribution' => $categoryDistribution,
            'ad_status' => $adStatus,
        ]);
    }

    // Top States by Ad Posts with Categories
    public function statesAnalytics(Request $request)
    {
        $limit = $request->limit ?? 20;
        $sortBy = $request->sort_by ?? 'total_ads';
        $sortOrder = $request->sort_order ?? 'desc';

        $statesData = Ad::select('locations.name as state_name', 'locations.id as location_id')
            ->join('locations', 'ads.location_id', '=', 'locations.id')
            ->where('ads.status', 'active')
            ->groupBy('locations.id', 'locations.name')
            ->selectRaw('COUNT(ads.id) as total_ads')
            ->orderBy('total_ads', 'desc')
            ->limit($limit)
            ->get();

        $result = [];
        foreach ($statesData as $state) {
            $topCategories = Ad::select('categories.name', 'categories.id')
                ->join('categories', 'ads.category_id', '=', 'categories.id')
                ->where('ads.location_id', $state->location_id)
                ->where('ads.status', 'active')
                ->groupBy('categories.id', 'categories.name')
                ->selectRaw('COUNT(ads.id) as ad_count')
                ->orderBy('ad_count', 'desc')
                ->limit(3)
                ->pluck('name')
                ->toArray();

            $result[] = [
                'state' => $state->state_name,
                'total_ads' => (int) $state->total_ads,
                'top_categories' => $topCategories,
            ];
        }

        if ($sortBy === 'total_ads') {
            usort($result, function ($a, $b) use ($sortOrder) {
                return $sortOrder === 'desc' ? $b['total_ads'] - $a['total_ads'] : $a['total_ads'] - $b['total_ads'];
            });
        }

        return response()->json($result);
    }

    // Messages (Admin view)
    public function messages()
    {
        $messages = DB::table('conversations')
            ->join('users as sender', 'conversations.sender_id', '=', 'sender.id')
            ->join('users as receiver', 'conversations.receiver_id', '=', 'receiver.id')
            ->select('conversations.*', 'sender.name as sender_name', 'receiver.name as receiver_name')
            ->orderBy('conversations.updated_at', 'desc')
            ->paginate(20);

        return response()->json($messages);
    }

    // Broadcast
    public function broadcast(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'recipient_type' => 'required|in:all,users,admins',
        ]);

        // Get users to notify
        $users = User::query();
        
        if ($validated['recipient_type'] === 'admins') {
            $users->where('role', 'admin');
        } elseif ($validated['recipient_type'] === 'users') {
            $users->where('role', 'user');
        }
        
        $recipients = $users->get();
        $count = 0;
        
        foreach ($recipients as $user) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'broadcast',
                'title' => $validated['title'],
                'message' => $validated['message'],
                'data' => ['broadcast' => true],
            ]);
            $count++;
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Broadcast sent successfully',
            'recipients' => $count,
        ]);
    }

    // Settings
    public function settings()
    {
        $settings = DB::table('settings')->pluck('value', 'key');
        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        foreach ($request->all() as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $value, 'updated_at' => now()]
            );
        }
        return response()->json(['message' => 'Settings updated']);
    }

    // Bank Transfer Management
    public function bankTransfers(Request $request)
    {
        $query = Transaction::with(['user', 'wallet'])
            ->where('payment_method', 'bank_transfer')
            ->where('type', 'credit');

        // Filter by status
        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by user email or reference
        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('email', 'like', "%{$search}%")
                               ->orWhere('name', 'like', "%{$search}%");
                  });
            });
        }

        $transfers = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($transfers);
    }

    public function approveBankTransfer(Request $request, $id)
    {
        $request->validate([
            'admin_note' => 'nullable|string|max:500',
        ]);

        $transaction = Transaction::with(['user', 'wallet'])->findOrFail($id);

        // Check if already processed
        if ($transaction->status !== 'pending') {
            return response()->json([
                'message' => 'Transaction has already been processed',
            ], 400);
        }

        // Use DB transaction for atomicity
        DB::transaction(function () use ($transaction, $request) {
            $wallet = $transaction->wallet;
            $balanceBefore = $wallet->balance;

            // Credit wallet
            $wallet->increment('balance', $transaction->amount);
            $wallet->refresh();

            // Update transaction
            $transaction->update([
                'status' => 'success',
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->balance,
                'processed_at' => now(),
                'processed_by' => $request->user()->id,
                'admin_note' => $request->admin_note,
                'is_suspicious' => false, // Clear suspicious flag after manual review
            ]);

            // Log the action
            \Illuminate\Support\Facades\Log::info('Bank transfer approved', [
                'transaction_id' => $transaction->id,
                'admin_id' => $request->user()->id,
                'amount' => $transaction->amount,
            ]);
        });

        // Send notification to user
        $transaction->user->notify(new \App\Notifications\WalletFundedNotification(
            $transaction->amount,
            'Bank transfer approved'
        ));

        return response()->json([
            'message' => 'Bank transfer approved successfully',
            'transaction' => $transaction->fresh(),
        ]);
    }

    public function rejectBankTransfer(Request $request, $id)
    {
        $request->validate([
            'admin_note' => 'required|string|max:500',
        ]);

        $transaction = Transaction::with(['user', 'wallet'])->findOrFail($id);

        // Check if already processed
        if ($transaction->status !== 'pending') {
            return response()->json([
                'message' => 'Transaction has already been processed',
            ], 400);
        }

        // Update transaction
        $transaction->update([
            'status' => 'failed',
            'processed_at' => now(),
            'processed_by' => $request->user()->id,
            'admin_note' => $request->admin_note,
        ]);

        // Log the action
        \Illuminate\Support\Facades\Log::info('Bank transfer rejected', [
            'transaction_id' => $transaction->id,
            'admin_id' => $request->user()->id,
            'reason' => $request->admin_note,
        ]);

        return response()->json([
            'message' => 'Bank transfer rejected',
            'transaction' => $transaction->fresh(),
        ]);
    }

    public function getBankTransferStats()
    {
        $stats = [
            'pending' => Transaction::where('payment_method', 'bank_transfer')
                ->where('status', 'pending')
                ->count(),
            'approved' => Transaction::where('payment_method', 'bank_transfer')
                ->where('status', 'success')
                ->count(),
            'rejected' => Transaction::where('payment_method', 'bank_transfer')
                ->where('status', 'failed')
                ->count(),
            'suspicious' => Transaction::where('payment_method', 'bank_transfer')
                ->where('is_suspicious', true)
                ->where('status', 'pending')
                ->count(),
            'total_amount_pending' => Transaction::where('payment_method', 'bank_transfer')
                ->where('status', 'pending')
                ->sum('amount'),
            'total_amount_approved' => Transaction::where('payment_method', 'bank_transfer')
                ->where('status', 'success')
                ->sum('amount'),
        ];

        return response()->json($stats);
    }
}
