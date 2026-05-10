<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class AdDetailResource extends JsonResource
{
    public function toArray($request): array
    {
        $boost = $this->activeBoost;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'price' => (float) $this->price,
            'currency' => $this->currency ?? 'NGN',
            'condition' => $this->condition,
            'status' => $this->status,
            'state' => $this->state,
            'lga' => $this->lga,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'negotiable' => (bool) $this->negotiable,
            'views' => $this->views,
            'clicks_count' => $this->clicks_count,
            'share_count' => $this->share_count,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'is_featured' => (bool) $this->is_featured,
            'is_verified' => (bool) $this->is_verified,
            'is_boosted' => $boost !== null,
            'boost_status' => $boost ? 'active' : null,
            'boost_type' => $boost?->boost_type,
            'boost_plan' => $boost?->plan?->type ?? $boost?->boost_type,
            'boost_end_time' => $boost?->end_time?->toIso8601String(),
            'boost_expires_at' => $boost?->end_time?->toIso8601String(),
            'boost_priority_score' => $boost?->priority_score ?? 0,
            'plan_name' => $boost?->plan?->name,
            'badge_label' => $boost?->badge_label,
            'attributes' => $this->attributes ?? [],
            'images' => $this->whenLoaded('images', fn() => $this->images->map(fn($img) => [
                'id' => $img->id,
                'url' => $img->url,
                'thumbnail_url' => $img->thumbnail_url,
                'medium_url' => $img->medium_url,
                'is_primary' => (bool) $img->is_primary,
                'sort_order' => $img->sort_order,
            ])),
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
                'phone' => $this->user->phone,
                'is_verified' => (bool) $this->user->email_verified_at,
                'created_at' => $this->user->created_at?->toIso8601String(),
            ]),
            'is_saved' => $this->is_saved ?? false,
            'freshness_score' => max(0, 100 - (now()->diffInHours($this->created_at) / 24)),
        ];
    }
}
