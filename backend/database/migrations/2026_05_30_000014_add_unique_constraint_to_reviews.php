<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Remove any existing duplicates before adding constraint
        DB::statement('
            DELETE r1 FROM reviews r1
            INNER JOIN reviews r2
            WHERE r1.id > r2.id
            AND r1.user_id = r2.user_id
            AND r1.target_user_id = r2.target_user_id
            AND (r1.ad_id = r2.ad_id OR (r1.ad_id IS NULL AND r2.ad_id IS NULL))
        ');

        Schema::table('reviews', function (Blueprint $table) {
            $table->unique(['user_id', 'target_user_id', 'ad_id'], 'reviews_unique');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropUnique('reviews_unique');
        });
    }
};
