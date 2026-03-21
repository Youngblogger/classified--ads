<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\User;
use App\Models\Category;
use App\Models\Location;
use App\Models\Notification;
use App\Services\NotificationService;
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
        
        return response()->json(['message' => 'Ad approved', 'ad' => $ad]);
    }

    public function rejectAd($id)
    {
        $ad = Ad::findOrFail($id);
        $rejectionReason = request('reason', 'Your ad does not meet our listing guidelines.');
        $ad->update(['status' => 'rejected']);
        
        NotificationService::adRejected($ad, $rejectionReason);
        
        return response()->json(['message' => 'Ad rejected', 'ad' => $ad]);
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
        $days = $request->days ?? 30;
        
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

        return response()->json([
            'ads_by_day' => $adsByDay,
            'users_by_day' => $usersByDay,
            'category_stats' => $categoryStats,
        ]);
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
}
