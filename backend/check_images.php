<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$ad = App\Models\Ad::with('images')->first();

if ($ad) {
    echo "Ad Title: " . $ad->title . "\n";
    echo "Images:\n";
    foreach ($ad->images as $img) {
        echo "  - " . $img->url . "\n";
    }
} else {
    echo "No ads found\n";
}