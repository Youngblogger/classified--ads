<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ad_images', function (Blueprint $table) {
            $table->string('image_hash', 64)->nullable()->after('public_id');
            $table->index('image_hash', 'ad_images_image_hash_index');
        });
    }

    public function down(): void
    {
        Schema::table('ad_images', function (Blueprint $table) {
            $table->dropIndex('ad_images_image_hash_index');
            $table->dropColumn('image_hash');
        });
    }
};
