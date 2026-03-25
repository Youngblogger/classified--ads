<?php

use Illuminate\Support\Str;
use Illuminate\Foundation\Application;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = \App\Models\User::first();
if (!$user) {
    echo "No user found. Please create a user first.\n";
    exit;
}

$ads = [
    ['title' => 'iPhone 14 Pro Max 256GB', 'price' => 650000, 'description' => 'Like new iPhone 14 Pro Max, barely used, comes with box and charger'],
    ['title' => 'Toyota Camry 2018', 'price' => 8500000, 'description' => 'Well maintained Toyota Camry, automatic, leather seats'],
    ['title' => 'HP Laptop 15s', 'price' => 180000, 'description' => 'New HP Laptop 15s, 8GB RAM, 512GB SSD'],
    ['title' => 'Samsung Smart TV 55 inch', 'price' => 220000, 'description' => 'Samsung 55 inch 4K Smart TV, excellent picture quality'],
    ['title' => 'Modern Sofa Set', 'price' => 150000, 'description' => 'Beautiful 3-seater sofa, like new condition'],
    ['title' => 'Inverter AC 1.5HP', 'price' => 95000, 'description' => 'Energy saving inverter AC, cooling very fast'],
];

foreach ($ads as $adData) {
    $ad = \App\Models\Ad::create([
        'user_id' => $user->id,
        'category_id' => 1,
        'location_id' => 1,
        'title' => $adData['title'],
        'description' => $adData['description'],
        'price' => $adData['price'],
        'slug' => Str::slug($adData['title']) . '-' . rand(1000, 9999),
        'status' => 'active',
        'negotiable' => true,
    ]);
    echo "Created: " . $ad->title . "\n";
}

echo "Total ads: " . \App\Models\Ad::count() . "\n";
