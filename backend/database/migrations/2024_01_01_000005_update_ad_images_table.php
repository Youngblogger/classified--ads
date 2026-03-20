<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ad_images', function (Blueprint $table) {
            $table->string('original_url')->nullable()->after('url');
            $table->string('thumbnail_url')->nullable()->after('original_url');
            $table->integer('file_size')->nullable()->after('thumbnail_url');
        });
    }

    public function down(): void
    {
        Schema::table('ad_images', function (Blueprint $table) {
            $table->dropColumn(['original_url', 'thumbnail_url', 'file_size']);
        });
    }
};
