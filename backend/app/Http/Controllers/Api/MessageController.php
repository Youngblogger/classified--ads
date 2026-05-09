<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\MessageResource;
use App\Http\Resources\Api\ConversationResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Ad;
use App\Services\NotificationService;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class MessageController extends Controller
{
    public function conversations(Request $request)
    {
        $user = $request->user();
        $perPage = min((int) $request->input('per_page', 20), 50);

        $conversations = Conversation::with([
                'sender',
                'receiver',
                'ad' => fn($q) => $q->select('id', 'title', 'slug', 'price'),
                'ad.images' => fn($q) => $q->select('id', 'ad_id', 'thumbnail_url')->where('is_primary', true)->limit(1),
                'latestMessage',
            ])
            ->where(fn($q) => $q->where('sender_id', $user->id)->orWhere('receiver_id', $user->id))
            ->orderBy('last_message_at', 'desc')
            ->paginate($perPage);

        // Add unread count per conversation
        $conversations->getCollection()->each(function ($conversation) use ($user) {
            $conversation->unread_count = Message::where('conversation_id', $conversation->id)
                ->where('sender_id', '!=', $user->id)
                ->whereNull('read_at')
                ->count();
        });

        return ConversationResource::collection($conversations);
    }

    public function messages(Request $request, $conversationId)
    {
        $user = $request->user();
        $perPage = min((int) $request->input('per_page', 50), 100);
        $page = max((int) $request->input('page', 1), 1);

        $conversation = Conversation::where(fn($q) => $q->where('sender_id', $user->id)->orWhere('receiver_id', $user->id))
            ->findOrFail($conversationId);

        $messages = Message::with('sender:id,name,avatar_url,google_avatar,full_avatar_url')
            ->where('conversation_id', $conversationId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return MessageResource::collection($messages);
    }

    public function sendMessage(Request $request, $conversationId)
    {
        $validated = $request->validate([
            'content' => 'string|nullable',
            'message_type' => 'string|nullable',
            'duration' => 'nullable|integer',
        ]);

        $user = $request->user();

        $conversation = Conversation::where(fn($q) => $q->where('sender_id', $user->id)->orWhere('receiver_id', $user->id))
            ->findOrFail($conversationId);

        $messageData = [
            'conversation_id' => $conversationId,
            'sender_id' => $user->id,
            'content' => $validated['content'] ?? '',
        ];

        if ($request->hasFile('attachment')) {
            $result = $this->handleAttachment($request);
            if (isset($result['error'])) {
                return $result['error'];
            }
            $messageData = array_merge($messageData, $result);
        }

        $message = Message::create($messageData);
        $conversation->update(['last_message_at' => now()]);
        $message->load('sender');

        CacheService::clearUnreadCount($conversation->receiver_id);

        return response()->json(new MessageResource($message), 201);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'receiver_id' => 'required|exists:users,id',
                'ad_id' => 'nullable|exists:ads,id',
                'message' => 'string|nullable',
                'message_type' => 'sometimes|string|in:text,image,file,voice',
                'duration' => 'nullable|integer',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        }

        $user = $request->user();
        if ($user->id == $validated['receiver_id']) {
            return response()->json(['error' => 'Cannot message yourself'], 400);
        }

        $conversation = $this->findOrCreateConversation($user->id, $validated['receiver_id'], $validated['ad_id'] ?? null);

        $messageData = [
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'content' => $validated['message'] ?? '',
            'message_type' => $validated['message_type'] ?? 'text',
        ];

        if ($request->hasFile('attachment')) {
            $result = $this->handleAttachment($request);
            if (isset($result['error'])) {
                return $result['error'];
            }
            $messageData = array_merge($messageData, $result);
        }

        $hasContent = !empty(trim($validated['message'] ?? '')) || $request->hasFile('attachment');
        if (!$hasContent) {
            return response()->json([
                'conversation_id' => $conversation->id,
                'id' => null,
                'sender_id' => $user->id,
                'content' => '',
                'message_type' => 'text',
                'is_read' => false,
                'created_at' => $conversation->last_message_at?->toIso8601String(),
            ], 201);
        }

        $message = Message::create($messageData);
        $conversation->update(['last_message_at' => now()]);

        if ($conversation->ad) {
            NotificationService::newMessageOnAd($conversation->ad, $user, $validated['message'] ?? '');
        }

        CacheService::clearUnreadCount($conversation->receiver_id);

        $message->load('sender');

        return response()->json(new MessageResource($message), 201);
    }

    public function startConversation(Request $request)
    {
        $validated = $request->validate([
            'ad_id' => 'nullable|exists:ads,id',
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string',
        ]);

        $user = $request->user();
        $conversation = $this->findOrCreateConversation($user->id, $validated['receiver_id'], $validated['ad_id'] ?? null);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'content' => $validated['content'],
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json(['conversation' => $conversation, 'message' => new MessageResource($message)], 201);
    }

    public function markAsRead(Request $request, $conversationId)
    {
        $user = $request->user();

        $count = Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        CacheService::clearUnreadCount($user->id);

        return response()->json(['message' => 'Marked as read', 'count' => $count]);
    }

    public function getOrCreateConversation(Request $request)
    {
        try {
            $validated = $request->validate([
                'receiver_id' => 'required|integer',
                'ad_id' => 'nullable|integer',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'details' => $e->errors()], 422);
        }

        $user = $request->user();
        if ($user->id == $validated['receiver_id']) {
            return response()->json(['error' => 'Cannot message yourself'], 400);
        }

        $conversation = $this->findOrCreateConversation($user->id, $validated['receiver_id'], $validated['ad_id'] ?? null);

        return response()->json($conversation);
    }

    public function deleteMessage(Request $request, $messageId)
    {
        $user = $request->user();
        $message = Message::where('id', $messageId)->where('sender_id', $user->id)->first();

        if (!$message) {
            return response()->json(['error' => 'Message not found'], 404);
        }

        $message->delete();
        return response()->json(['message' => 'Message deleted successfully']);
    }

    private function findOrCreateConversation(int $userId, int $receiverId, ?int $adId): Conversation
    {
        $query = Conversation::where(fn($q) => $q->where('sender_id', $userId)->where('receiver_id', $receiverId))
            ->orWhere(fn($q) => $q->where('receiver_id', $userId)->where('sender_id', $receiverId));

        if ($adId) {
            $query->where('ad_id', $adId);
        }

        return $query->first() ?? Conversation::create([
            'sender_id' => $userId,
            'receiver_id' => $receiverId,
            'ad_id' => $adId,
            'last_message_at' => now(),
        ]);
    }

    private function handleAttachment(Request $request): array
    {
        $file = $request->file('attachment');
        $messageType = $request->input('message_type', 'file');

        if ($messageType === 'voice') {
            $allowedExtensions = ['webm', 'mp4', 'mpeg', 'wav', 'ogg', 'm4a', 'aac', '3gp', ''];
            $extension = strtolower($file->getClientOriginalExtension());
            $mimeType = $file->getMimeType();
            $mimeIsAudio = str_starts_with($mimeType, 'audio/');

            if (!in_array($extension, $allowedExtensions) && !$mimeIsAudio) {
                return ['error' => response()->json(['success' => false, 'message' => 'Invalid audio file type'], 422)];
            }
            if ($file->getSize() > 5 * 1024 * 1024) {
                return ['error' => response()->json(['success' => false, 'message' => 'Audio file too large'], 422)];
            }
        }

        $folder = match($messageType) {
            'voice' => 'voice',
            'image' => 'images',
            default => 'files',
        };

        $path = $file->store("messages/{$folder}", 'public');
        return [
            'attachment_url' => asset('storage/' . $path),
            'content' => $request->input('content', ''),
        ];
    }
}
