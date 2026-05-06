<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $rules = [
            'title' => 'required|string|max:255',
            'link_url' => 'nullable|string|max:500|url',
            'position' => 'required|string|max:50',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'sort_order' => 'integer|min:0',
        ];

        if ($this->hasFile('image')) {
            $rules['image'] = 'required|file|mimes:jpeg,jpg,png,webp|max:5120';
        } elseif ($this->filled('image_url')) {
            $rules['image_url'] = 'nullable|string|max:500|url';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'title.required' => 'A banner title is required.',
            'position.required' => 'A banner position is required.',
            'image.mimes' => 'Only JPEG, PNG, and WebP images are allowed for banners.',
            'image.max' => 'The banner image must not exceed 5MB.',
            'ends_at.after_or_equal' => 'The end date must be after or equal to the start date.',
        ];
    }
}
