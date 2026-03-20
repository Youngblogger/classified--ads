<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Ad;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class MessageController extends Controller
{
    public function conversations(Request $request)
    {
        $user = $request->user();
        
        $conversations = Conversation::with(['sender', 'receiver', 'ad', 'latestMessage'])
            ->where(function($q) use ($user) {
                $q->where('sender_id', $user->id)
                  ->orWhere('receiver_id', $user->id);
            })
            ->orderBy('last_message_at', 'desc')
            ->paginate(20);

        // Add participant attribute to each conversation
        foreach ($conversations as $conversation) {
            if ($conversation->sender_id === $user->id) {
                $conversation->participant = $conversation->receiver;
            } else {
                $conversation->participant = $conversation->sender;
            }
        }

        return response()->json($conversations);
    }

    public function getOrCreateConversation(Request $request)
    {
        logger('getOrCreateConversation called', [
            'user_id' => $request->user()?->id,
            'receiver_id' => $request->query('receiver_id'),
            'ad_id' => $request->query('ad_id'),
            'all_query' => $request->query(),
        ]);

        try {
            $validated = $request->validate([
                'receiver_id' => 'required|integer',
                'ad_id' => 'nullable|integer',
            ]);
        } catch (ValidationException $e) {
            logger('Validation failed', $e->errors());
            return response()->json([
                'error' => 'Validation failed',
                'details' => $e->errors(),
            ], 422);
        }

        $user = $request->user();

        // Don't allow messaging yourself
        if ($user->id == $validated['receiver_id']) {
            return response()->json(['error' => 'Cannot message yourself'], 400);
        }

        $query = Conversation::where(function($q) use ($user, $validated) {
            $q->where('sender_id', $user->id)
              ->where('receiver_id', $validated['receiver_id']);
            if (isset($validated['ad_id'])) {
                $q->where('ad_id', $validated['ad_id']);
            }
        })
        ->orWhere(function($q) use ($user, $validated) {
            $q->where('receiver_id', $user->id)
              ->where('sender_id', $validated['receiver_id']);
            if (isset($validated['ad_id'])) {
                $q->where('ad_id', $validated['ad_id']);
            }
        });

        $conversation = $query->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'sender_id' => $user->id,
                'receiver_id' => $validated['receiver_id'],
                'ad_id' => $validated['ad_id'] ?? null,
                'last_message_at' => now(),
            ]);
        }

        return response()->json($conversation);
    }

    public function messages(Request $request, $conversationId)
    {
        $user = $request->user();
        
        $conversation = Conversation::where(function($q) use ($user) {
                $q->where('sender_id', $user->id)
                  ->orWhere('receiver_id', $user->id);
            })
            ->findOrFail($conversationId);

        $messages = Message::with('sender')
            ->where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    public function sendMessage(Request $request, $conversationId)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'duration' => 'nullable|integer',
        ]);

        $user = $request->user();
        
        $conversation = Conversation::where(function($q) use ($user) {
                $q->where('sender_id', $user->id)
                  ->orWhere('receiver_id', $user->id);
            })
            ->findOrFail($conversationId);

        $messageData = [
            'conversation_id' => $conversationId,
            'sender_id' => $user->id,
            'content' => $validated['content'],
        ];

        // Handle file attachments (voice, image, etc.)
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $messageType = $request->input('message_type', 'file');
            
            $folder = match($messageType) {
                'voice' => 'voice',
                'image' => 'images',
                default => 'files',
            };
            
            $path = $file->store("messages/{$folder}", 'public');
            $attachmentUrl = asset('storage/' . $path);
            $messageData['attachment_url'] = $attachmentUrl;
            $messageData['content'] = $validated['content'];
        }

        // Add duration if provided
        if (isset($validated['duration'])) {
            $messageData['duration'] = $validated['duration'];
        }

        $message = Message::create($messageData);

        $conversation->update(['last_message_at' => now()]);

        $message->load('sender');

        return response()->json($message, 201);
    }

    public function deleteMessage(Request $request, $messageId)
    {
        $user = $request->user();
        
        $message = Message::where('id', $messageId)
            ->where('sender_id', $user->id)
            ->first();
        
        if (!$message) {
            return response()->json(['error' => 'Message not found or you do not have permission to delete it'], 404);
        }
        
        $message->delete();
        
        return response()->json(['message' => 'Message deleted successfully']);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'ad_id' => 'nullable|exists:ads,id',
            'message' => 'required|string',
            'message_type' => 'sometimes|string|in:text,image,file,voice',
            'duration' => 'nullable|integer',
        ]);

        $user = $request->user();

        // Don't allow messaging yourself
        if ($user->id == $validated['receiver_id']) {
            return response()->json(['error' => 'Cannot message yourself'], 400);
        }

        // Find or create conversation
        $conversation = Conversation::where(function($q) use ($user, $validated) {
            $q->where('sender_id', $user->id)
              ->where('receiver_id', $validated['receiver_id']);
            if (isset($validated['ad_id'])) {
                $q->where('ad_id', $validated['ad_id']);
            }
        })
        ->orWhere(function($q) use ($user, $validated) {
            $q->where('receiver_id', $user->id)
              ->where('sender_id', $validated['receiver_id']);
            if (isset($validated['ad_id'])) {
                $q->where('ad_id', $validated['ad_id']);
            }
        })
        ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'sender_id' => $user->id,
                'receiver_id' => $validated['receiver_id'],
                'ad_id' => $validated['ad_id'] ?? null,
                'last_message_at' => now(),
            ]);
        }

        $messageData = [
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'content' => $validated['message'],
            'message_type' => $validated['message_type'] ?? 'text',
        ];

        // Handle file attachments
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $messageType = $validated['message_type'] ?? 'file';
            
            // Determine folder based on message type
            $folder = match($messageType) {
                'voice' => 'voice',
                'image' => 'images',
                default => 'files',
            };
            
            $path = $file->store("messages/{$folder}", 'public');
            $attachmentUrl = asset('storage/' . $path);
            $messageData['attachment_url'] = $attachmentUrl;
            
            // Add duration if provided (for voice messages)
            if ($request->has('duration')) {
                $messageData['duration'] = $request->input('duration');
            }
        }

        $message = Message::create($messageData);

        $conversation->update(['last_message_at' => now()]);
        
        if ($conversation->ad) {
            NotificationService::newMessageOnAd($conversation->ad, $user, $validated['message']);
        }

        return response()->json([
            'id' => $message->id,
            'conversation_id' => $conversation->id,
            'sender_id' => $message->sender_id,
            'content' => $message->content,
            'message_type' => $validated['message_type'] ?? 'text',
            'attachment_url' => $message->attachment_url ?? null,
            'duration' => $message->duration ?? null,
            'is_read' => false,
            'read_at' => null,
            'created_at' => $message->created_at,
            'sender' => $message->sender,
        ], 201);
    }

    public function startConversation(Request $request)
    {
        $validated = $request->validate([
            'ad_id' => 'nullable|exists:ads,id',
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string',
        ]);

        $user = $request->user();

        $conversation = Conversation::where(function($q) use ($user, $validated) {
                $q->where('sender_id', $user->id)
                  ->where('receiver_id', $validated['receiver_id']);
                if (isset($validated['ad_id'])) {
                    $q->where('ad_id', $validated['ad_id']);
                }
            })
            ->orWhere(function($q) use ($user, $validated) {
                $q->where('receiver_id', $user->id)
                  ->where('sender_id', $validated['receiver_id']);
                if (isset($validated['ad_id'])) {
                    $q->where('ad_id', $validated['ad_id']);
                }
            })
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'sender_id' => $user->id,
                'receiver_id' => $validated['receiver_id'],
                'ad_id' => $validated['ad_id'] ?? null,
                'last_message_at' => now(),
            ]);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'content' => $validated['content'],
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json(['conversation' => $conversation, 'message' => $message], 201);
    }

    public function markAsRead(Request $request, $conversationId)
    {
        $user = $request->user();
        
        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Marked as read']);
    }
}
