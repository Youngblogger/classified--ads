<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImageMap extends Model
{
    protected $table = 'product_images_map';
    
    protected $fillable = [
        'keyword',
        'image_path',
        'image_url',
    ];
}
