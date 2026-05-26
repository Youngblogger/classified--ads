<?php

namespace App\Http\Resources\Api;

use App\Models\CategoryField;
use Illuminate\Http\Resources\Json\JsonResource;

class AdDetailResource extends JsonResource
{
    public function toArray($request): array
    {
        $boost = $this->activeBoost;
        $specs = $this->buildSpecifications();

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
            'badge_icon' => $boost?->plan?->badge_icon,
            'attributes' => $this->attributes ?? [],
            'specifications' => $specs,
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
                'parent_id' => $this->category->parent_id,
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
                'full_avatar_url' => $this->user->full_avatar_url,
                'google_avatar' => $this->user->google_avatar,
                'facebook_avatar' => $this->user->facebook_avatar,
                'avatar_url' => $this->user->avatar_url,
                'phone' => $this->user->phone,
                'is_verified' => (bool) $this->user->email_verified_at,
                'created_at' => $this->user->created_at?->toIso8601String(),
            ]),
            'is_saved' => $this->is_saved ?? false,
            'freshness_score' => max(0, 100 - (now()->diffInHours($this->created_at) / 24)),
        ];
    }

    private function buildSpecifications(): array
    {
        $attrs = $this->attributes;
        if (!$attrs || !is_array($attrs)) {
            return [];
        }

        $category = $this->relationLoaded('category') ? $this->category : null;
        if (!$category) {
            return $this->flattenAttributes($attrs);
        }

        $fields = $category->relationLoaded('categoryFields')
            ? $category->categoryFields
            : CategoryField::where('category_id', $category->id)
                ->orderBy('group_name')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get();

        if ($fields->isEmpty()) {
            return $this->flattenAttributes($attrs);
        }

        $fieldMap = $fields->keyBy('name');
        $specs = [];

        foreach ($fields as $field) {
            $value = $attrs[$field->name] ?? null;
            if ($value === null || $value === '' || $value === []) {
                continue;
            }
            $specs[] = [
                'name' => $field->name,
                'label' => $field->label,
                'value' => $this->formatValue($field, $value),
                'raw_value' => $value,
                'type' => $field->type,
                'options' => $field->options ?? [],
                'group_name' => $field->group_name,
                'sort_order' => $field->sort_order,
            ];
        }

        return $specs;
    }

    private function formatValue($field, $value): string
    {
        if ($field->type === 'boolean') {
            return $value ? 'Yes' : 'No';
        }

        if ($field->type === 'select' && !empty($field->options) && is_string($value)) {
            $options = is_array($field->options) ? $field->options : json_decode($field->options, true) ?? [];
            $optionLabels = array_combine(
                array_map('strtolower', $options),
                $options
            );
            return $optionLabels[strtolower($value)] ?? $value;
        }

        if (is_array($value)) {
            return implode(', ', $value);
        }

        return (string) $value;
    }

    private function flattenAttributes(array $attrs): array
    {
        $specs = [];
        foreach ($attrs as $key => $value) {
            if ($value === null || $value === '' || $value === []) {
                continue;
            }
            $specs[] = [
                'name' => $key,
                'label' => $this->labelFromKey($key),
                'value' => is_array($value) ? implode(', ', $value) : (string) $value,
                'raw_value' => $value,
                'type' => is_bool($value) ? 'boolean' : (is_numeric($value) ? 'number' : 'text'),
                'options' => [],
                'group_name' => null,
                'sort_order' => 0,
            ];
        }
        return $specs;
    }

    private function labelFromKey(string $key): string
    {
        return str_replace('_', ' ', $key);
    }
}
