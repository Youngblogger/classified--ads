<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Ad;
use App\Http\Resources\Api\AdListResource;

$ad = Ad::with(['images', 'category', 'location', 'activeBoost.plan'])->first();
$resource = new AdListResource($ad);
$arr = $resource->toArray(request());
echo 'negotiable: ' . json_encode($arr['negotiable']) . "\n";
echo 'ad.negotiable: ' . json_encode($ad->negotiable) . "\n";
echo 'Full keys: ' . implode(', ', array_keys($arr)) . "\n";
echo "\n--- First 10 ads ---\n";
$ads = Ad::limit(10)->get();
foreach ($ads as $a) {
    echo "ID:{$a->id} negotiable:" . json_encode($a->negotiable) . "\n";
}
