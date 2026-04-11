<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$ad = App\Models\Ad::with('images')->where('is_seeded', true)->has('images')->first();
if ($ad) {
    echo "Title: " . $ad->title . PHP_EOL;
    echo "Images count: " . $ad->images->count() . PHP_EOL;
    foreach($ad->images as $img) {
        echo "  - " . $img->full_url . PHP_EOL;
    }
} else {
    echo "No seeded ad with images found" . PHP_EOL;
}
