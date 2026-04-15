<?php

require __DIR__.'/vendor/autoload.php';

use Illuminate\Support\Facades\DB;

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

DB::statement('SET FOREIGN_KEY_CHECKS=0');
DB::table('ad_images')->delete();
DB::table('ads')->delete();
DB::statement('SET FOREIGN_KEY_CHECKS=1');

echo "Deleted all ads and images\n";