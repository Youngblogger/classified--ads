<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$ad = \App\Models\Ad::with('images')->first();
echo "Ad Title: " . $ad->title . "\n\n";
echo "Images:\n";
foreach ($ad->images as $img) {
    echo "  - url: " . $img->url . "\n";
    echo "    full_url: " . $img->full_url . "\n";
    echo "    original_url: " . $img->original_url . "\n\n";
}

echo "\nJSON output:\n";
echo json_encode($ad->images, JSON_PRETTY_JSON);
