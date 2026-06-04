<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class AdListResource extends JsonResource
{
    public function toArray($request): array
    {
        $boost = $this->activeBoost;
        $image = $this->images->first();

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'price' => (float) $this->price,
            'currency' => $this->currency ?? 'NGN',
            'condition' => $this->condition,
            'negotiable' => (bool) $this->negotiable,
            'short_description' => $this->short_description ?: mb_substr(strip_tags($this->description ?? ''), 0, 120),
            'state' => $this->state,
            'lga' => $this->lga,
            'views' => $this->views,
            'created_at' => $this->created_at?->toIso8601String(),
            'is_verified' => (bool) $this->is_verified,
            'is_boosted' => $boost !== null,
            'boost_status' => $boost ? 'active' : null,
            'boost_type' => $boost?->boost_type,
            'boost_plan' => $boost?->plan?->type ?? $boost?->boost_type,
            'boost_end_time' => $boost?->end_time?->toIso8601String(),
            'boost_expires_at' => $boost?->end_time?->toIso8601String(),
            'plan_name' => $boost?->plan?->name,
            'badge_label' => $boost?->badge_label,
            'badge_icon' => $boost?->plan?->badge_icon,
            'boost_priority_score' => $boost?->priority_score ?? 0,
            'image' => $image ? [
                'id' => $image->id,
                'url' => $image->url,
                'thumbnail_url' => $image->thumbnail,
                'medium_url' => $image->medium_url,
                'is_primary' => (bool) $image->is_primary,
            ] : null,
            'images' => $this->whenLoaded('images', fn() => $this->images->take(5)->map(fn($img) => [
                'id' => $img->id,
                'url' => $img->url,
                'thumbnail_url' => $img->thumbnail,
                'medium_url' => $img->medium_url,
                'is_primary' => (bool) $img->is_primary,
            ])),
            'image_url' => $image?->url,
            'images_count' => $this->images->count(),
            'category' => $this->whenLoaded('category', fn() => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'location' => $this->whenLoaded('location', fn() => [
                'id' => $this->location->id,
                'name' => $this->location->name,
                'slug' => $this->location->slug,
            ]),
            'user' => $this->whenLoaded('user', fn() => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'avatar' => $this->user->full_avatar_url ?? $this->user->avatar_url,
                'is_verified' => (bool) $this->user->email_verified_at,
            ]),
            'status' => $this->status,
            'freshness_score' => max(0, 100 - (now()->diffInHours($this->created_at) / 24)),
        ];
    }
}
