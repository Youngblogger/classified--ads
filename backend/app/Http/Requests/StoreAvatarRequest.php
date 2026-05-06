<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAvatarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'avatar' => 'required|file|mimes:jpeg,jpg,png,webp|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'avatar.required' => 'An avatar image is required.',
            'avatar.file' => 'The avatar must be a valid file.',
            'avatar.mimes' => 'Only JPEG, PNG, and WebP images are allowed for avatars.',
            'avatar.max' => 'The avatar must not exceed 2MB.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->hasFile('avatar')) {
            $file = $this->file('avatar');

            if ($file->getSize() > 2 * 1024 * 1024) {
                $this->merge(['_avatar_too_large' => true]);
            }
        }
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->boolean('_avatar_too_large')) {
                $validator->errors()->add('avatar', 'The avatar must not exceed 2MB.');
            }
        });
    }
}
