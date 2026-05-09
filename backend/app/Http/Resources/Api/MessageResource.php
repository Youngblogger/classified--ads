<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'sender_id' => $this->sender_id,
            'content' => $this->content,
            'message_type' => $this->message_type ?? 'text',
            'attachment_url' => $this->attachment_url,
            'duration' => $this->duration,
            'is_read' => $this->read_at !== null,
            'read_at' => $this->read_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'sender' => $this->whenLoaded('sender', fn() => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
                'avatar' => $this->sender->full_avatar_url ?? $this->sender->avatar_url,
            ]),
        ];
    }
}
