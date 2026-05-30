<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('target_user_id');
            $table->index('ad_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['target_user_id']);
            $table->dropIndex(['ad_id']);
            $table->dropIndex(['created_at']);
        });
    }
};
