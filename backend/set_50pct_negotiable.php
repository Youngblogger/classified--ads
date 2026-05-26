<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Ad;

$total = Ad::count();
$target = (int) ceil($total * 0.5);

$ids = Ad::where('negotiable', false)->inRandomOrder()->limit($target)->pluck('id');
$count = Ad::whereIn('id', $ids)->update(['negotiable' => true]);

echo "Updated {$count} ads to negotiable=true out of {$total}\n";
echo "True: " . Ad::where('negotiable', true)->count() . "\n";
echo "False: " . Ad::where('negotiable', false)->count() . "\n";
