<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DeleteAllAdsSeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('ad_images')->truncate();
        DB::table('ads')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        echo "All ads deleted.\n";
    }
}
