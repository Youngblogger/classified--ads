<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = App\Models\User::first();
$category = App\Models\Category::where('slug', 'smartphones')->first();

$ad1 = App\Models\Ad::create([
    'user_id' => $user->id,
    'category_id' => $category->id,
    'title' => 'iPhone 13 Pro Max 256GB',
    'slug' => 'iphone-13-pro-max-256gb',
    'description' => 'Like new iPhone 13 Pro Max',
    'short_description' => 'Like new',
    'price' => 350000,
    'condition' => 'like_new',
    'status' => 'active',
    'location_id' => 1,
]);

$ad2 = App\Models\Ad::create([
    'user_id' => $user->id,
    'category_id' => $category->id,
    'title' => 'Toyota Camry 2010',
    'slug' => 'toyota-camry-2010',
    'description' => 'Well maintained Toyota Camry',
    'short_description' => 'Well maintained',
    'price' => 4500000,
    'condition' => 'like_new',
    'status' => 'active',
    'location_id' => 1,
]);

echo "Created 2 ads\n";
echo "Ad 1: {$ad1->title}\n";
echo "Ad 2: {$ad2->title}\n";