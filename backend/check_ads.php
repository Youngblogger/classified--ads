<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$ads = \App\Models\Ad::orderBy('created_at', 'desc')->take(5)->get(['id','title','is_seeded']);
foreach($ads as $ad) {
    echo $ad->id . ': ' . $ad->title . ' (Seeded: ' . ($ad->is_seeded ? 'Yes' : 'No') . ')' . PHP_EOL;
}
