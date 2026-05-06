<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdImagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'images' => 'required|array|min:1|max:20',
            'images.*' => 'required|file|mimes:jpeg,jpg,png,webp,gif|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'images.required' => 'At least one image is required.',
            'images.array' => 'Images must be provided as an array.',
            'images.min' => 'At least one image is required.',
            'images.max' => 'Maximum 20 images allowed per ad.',
            'images.*.required' => 'Each image file is required.',
            'images.*.file' => 'Each image must be a valid file.',
            'images.*.mimes' => 'Only JPEG, PNG, WebP, and GIF images are allowed.',
            'images.*.max' => 'Each image must not exceed 5MB.',
        ];
    }

    public function failedValidation($validator)
    {
        $errors = $validator->errors();

        foreach ($this->file('images', []) as $index => $file) {
            if ($file && $file->getSize() > 5 * 1024 * 1024) {
                $errors->add("images.{$index}", "Image {$index} exceeds the 5MB size limit.");
            }

            if ($file && !in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/webp', 'image/gif'])) {
                $errors->add("images.{$index}", "Image {$index} has an invalid file type.");
            }
        }

        throw new \Illuminate\Validation\ValidationException($validator);
    }
}
