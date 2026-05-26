<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class BoostedAdResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'ad_id' => $this->ad_id,
            'boost_type' => $this->boost_type,
            'plan_id' => $this->plan_id,
            'plan_name' => $this->plan?->name ?? $this->boost_type,
            'badge_label' => $this->badge_label,
            'badge_icon' => $this->plan?->badge_icon,
            'priority_score' => $this->priority_score,
            'start_time' => $this->start_time?->toIso8601String(),
            'end_time' => $this->end_time?->toIso8601String(),
            'status' => $this->status,
            'impressions' => $this->impressions,
            'clicks' => $this->clicks,
            'ctr' => $this->ctr,
            'ad' => $this->whenLoaded('ad', fn() => [
                'id' => $this->ad->id,
                'title' => $this->ad->title,
                'slug' => $this->ad->slug,
                'price' => (float) $this->ad->price,
                'currency' => $this->ad->currency ?? 'NGN',
                'status' => $this->ad->status,
                'created_at' => $this->ad->created_at?->toIso8601String(),
            ]),
            'plan' => $this->whenLoaded('plan', fn() => [
                'id' => $this->plan->id,
                'name' => $this->plan->name,
                'type' => $this->plan->type,
                'price' => $this->plan->price,
                'duration_days' => $this->plan->duration_days,
                'badge_label' => $this->plan->badge_label,
                'badge_icon' => $this->plan->badge_icon,
                'priority_score' => $this->plan->priority_score,
            ]),
        ];
    }
}
