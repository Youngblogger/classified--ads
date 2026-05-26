<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Ad;

$count = Ad::where('negotiable', false)
    ->where(function ($q) {
        $q->where('description', 'like', '%egotiable%')
          ->orWhere('title', 'like', '%egotiable%');
    })
    ->update(['negotiable' => true]);

echo "Updated: $count\n";
echo "True: " . Ad::where('negotiable', true)->count() . "\n";
echo "False: " . Ad::where('negotiable', false)->count() . "\n";
