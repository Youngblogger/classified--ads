<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Fixing user created_at dates to be within Jan-Apr 2026...\n";

$users = DB::table('users')->get();
$months = [1, 2, 3, 4]; // January to April 2026

foreach ($users as $user) {
    $month = $months[array_rand($months)];
    $day = rand(1, 28);
    $createdDate = \Carbon\Carbon::create(2026, $month, $day, rand(0, 23), rand(0, 59), rand(0, 59));
    
    DB::table('users')->where('id', $user->id)->update([
        'created_at' => $createdDate,
        'updated_at' => $createdDate,
    ]);
}

echo "Updated " . count($users) . " users with dates between Jan-Apr 2026.\n";
