<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($notifications);
    }

    public function unread(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->whereNull('read_at')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json($notifications);
    }

    public function unreadCount(Request $request)
    {
        $count = $request->user()
            ->notifications()
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()
            ->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required_without_all:type|exists:users,id',
            'type' => 'required_without_all:user_id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'data' => 'nullable|array',
        ]);

        $users = isset($validated['user_id']) 
            ? User::where('id', $validated['user_id'])->get()
            : User::all();

        $notifications = [];
        foreach ($users as $user) {
            $notifications[] = Notification::create([
                'user_id' => $user->id,
                'type' => $validated['type'] ?? 'admin',
                'title' => $validated['title'],
                'message' => $validated['message'],
                'data' => $validated['data'] ?? null,
            ]);
        }

        return response()->json([
            'message' => 'Notifications sent',
            'count' => count($notifications),
            'notifications' => $notifications,
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }

    public function deleteAll(Request $request)
    {
        $count = $request->user()
            ->notifications()
            ->delete();

        return response()->json([
            'message' => 'All notifications deleted',
            'deleted_count' => $count,
        ]);
    }

    public function stats()
    {
        $stats = [
            'total' => Notification::count(),
            'today' => Notification::whereDate('created_at', today())->count(),
            'this_week' => Notification::where('created_at', '>=', now()->startOfWeek())->count(),
            'this_month' => Notification::where('created_at', '>=', now()->startOfMonth())->count(),
        ];

        return response()->json($stats);
    }
}
