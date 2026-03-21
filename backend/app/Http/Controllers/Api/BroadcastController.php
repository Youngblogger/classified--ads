<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Broadcast;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;

class BroadcastController extends Controller
{
    public function index(Request $request)
    {
        $query = Broadcast::query();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $broadcasts = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($broadcasts);
    }

    public function show($id)
    {
        $broadcast = Broadcast::with('notifications.user')->findOrFail($id);
        return response()->json($broadcast);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'recipient_type' => 'required|in:all,users,admins,verified',
        ]);

        $broadcast = Broadcast::create([
            'created_by' => $request->user()->id,
            'title' => $validated['title'],
            'message' => $validated['message'],
            'target' => $validated['recipient_type'],
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        // Get recipients
        $query = User::query();
        
        switch ($validated['recipient_type']) {
            case 'admins':
                $query->where('role', 'admin');
                break;
            case 'verified':
                $query->whereNotNull('email_verified_at');
                break;
            case 'users':
                $query->where('role', 'user');
                break;
            // 'all' - no filter
        }

        $recipients = $query->get();
        $count = 0;

        foreach ($recipients as $user) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'broadcast',
                'title' => $validated['title'],
                'message' => $validated['message'],
                'data' => ['broadcast_id' => $broadcast->id],
            ]);
            $count++;
        }

        $broadcast->update(['recipient_count' => $count]);

        return response()->json([
            'message' => 'Broadcast sent',
            'broadcast' => $broadcast,
            'recipient_count' => $count,
        ], 201);
    }

    public function resend($id)
    {
        $broadcast = Broadcast::findOrFail($id);

        $broadcast->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return response()->json(['message' => 'Broadcast resent', 'broadcast' => $broadcast]);
    }

    public function destroy($id)
    {
        $broadcast = Broadcast::findOrFail($id);
        
        // Delete related notifications
        Notification::where('data->broadcast_id', $id)->delete();
        
        $broadcast->delete();

        return response()->json(['message' => 'Broadcast deleted']);
    }
}
