<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray($request): array
    {
        $user = $request->user();
        $participant = $this->sender_id === $user?->id ? $this->receiver : $this->sender;

        return [
            'id' => $this->id,
            'ad_id' => $this->ad_id,
            'last_message_at' => $this->last_message_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'unread_count' => $this->unread_count ?? 0,
            'participant' => $participant ? [
                'id' => $participant->id,
                'name' => $participant->name,
                'avatar' => $participant->full_avatar_url ?? $participant->avatar_url,
                'is_verified' => (bool) $participant->email_verified_at,
            ] : null,
            'ad' => $this->whenLoaded('ad', fn() => [
                'id' => $this->ad->id,
                'title' => $this->ad->title,
                'slug' => $this->ad->slug,
                'price' => (float) $this->ad->price,
            ]),
            'ad_image' => $this->whenLoaded('ad.images', fn() => $this->ad->images->first()?->thumbnail_url),
            'latest_message' => $this->whenLoaded('latestMessage', fn() => [
                'id' => $this->latestMessage->id,
                'content' => $this->latestMessage->content,
                'sender_id' => $this->latestMessage->sender_id,
                'message_type' => $this->latestMessage->message_type ?? 'text',
                'created_at' => $this->latestMessage->created_at?->toIso8601String(),
            ]),
        ];
    }
}
