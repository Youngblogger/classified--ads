<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Font extends Model
{
    protected $fillable = [
        'name',
        'filename',
        'format',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function getFullPath(): string
    {
        return storage_path('app/public/fonts/' . $this->filename);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
