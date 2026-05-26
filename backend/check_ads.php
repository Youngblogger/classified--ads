<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Ad;

$ads = Ad::where('negotiable', false)->limit(10)->get();
foreach ($ads as $ad) {
    $desc = substr($ad->description, 0, 120);
    $hasWord = stripos($ad->description, 'negotiable') !== false ? 'YES' : 'NO';
    echo "ID: {$ad->id} | hasWord: $hasWord | desc: $desc\n---\n";
}
