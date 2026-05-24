<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\NotificationResource;
use App\Models\Notification;
use App\Models\User;
use App\Services\CacheService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 20), 50);

        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return NotificationResource::collection($notifications);
    }

    public function unread(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->whereNull('read_at')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return NotificationResource::collection($notifications);
    }

    public function unreadCount(Request $request)
    {
        $user = $request->user();
        $cacheKey = 'unread_count:' . $user->id;

        $count = CacheService::remember($cacheKey, CacheService::TTL_UNREAD_COUNT, function () use ($user) {
            return $user->notifications()->whereNull('read_at')->count();
        });

        return response()->json(['count' => $count])
            ->header('Cache-Control', 'private, max-age=60');
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->update(['read_at' => now()]);
        CacheService::clearUnreadCount($request->user()->id);

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()
            ->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        CacheService::clearUnreadCount($request->user()->id);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function destroy(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->delete();
        CacheService::clearUnreadCount($request->user()->id);

        return response()->json(['message' => 'Notification deleted']);
    }

    public function deleteAll(Request $request)
    {
        $request->user()
            ->notifications()
            ->delete();

        CacheService::clearUnreadCount($request->user()->id);

        return response()->json(['message' => 'All notifications deleted']);
    }
}
