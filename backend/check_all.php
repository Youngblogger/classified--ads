<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Ad;

$total = Ad::count();
$withWord = Ad::where('description', 'like', '%negotiable%')->orWhere('title', 'like', '%negotiable%')->count();
echo "Total ads: $total\n";
echo "With 'negotiable' in desc/title: $withWord\n";

$sample = Ad::where('description', 'like', '%negotiable%')->first();
if ($sample) {
    echo "Sample: ID={$sample->id}, negotiable={$sample->negotiable}, desc=" . substr($sample->description, 0, 200) . "\n";
}
