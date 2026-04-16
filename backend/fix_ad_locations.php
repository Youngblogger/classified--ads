<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Fixing existing seeded ads location data...\n";

$states = DB::table('locations')->whereNull('parent_id')->get();
$seededAds = DB::table('ads')->where('is_seeded', true)->get();

$updated = 0;
foreach ($seededAds as $ad) {
    $state = $states->random();
    $lgas = DB::table('locations')->where('parent_id', $state->id)->get();
    $lga = $lgas->isNotEmpty() ? $lgas->random() : null;
    
    DB::table('ads')->where('id', $ad->id)->update([
        'location_id' => $state->id,
        'state' => $state->name,
        'lga' => $lga ? $lga->name : $state->name,
    ]);
    
    $updated++;
}

echo "Updated $updated ads with proper state/LGA values.\n";
