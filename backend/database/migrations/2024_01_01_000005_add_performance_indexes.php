<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->index('status');
            $table->index(['status', 'created_at'], 'ads_status_created_at');
            $table->index(['status', 'is_featured', 'created_at'], 'ads_featured_created_at');
            $table->index(['category_id', 'status'], 'ads_category_status');
            $table->index(['location_id', 'status'], 'ads_location_status');
            $table->index(['user_id', 'status'], 'ads_user_status');
            $table->index('slug');
        });

        Schema::table('ad_images', function (Blueprint $table) {
            $table->index(['ad_id', 'sort_order'], 'ad_images_ad_sort');
            $table->index('public_id');
            $table->index('is_primary');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex('ads_status_created_at');
            $table->dropIndex('ads_featured_created_at');
            $table->dropIndex('ads_category_status');
            $table->dropIndex('ads_location_status');
            $table->dropIndex('ads_user_status');
            $table->dropIndex(['slug']);
        });

        Schema::table('ad_images', function (Blueprint $table) {
            $table->dropIndex('ad_images_ad_sort');
            $table->dropIndex(['public_id']);
            $table->dropIndex(['is_primary']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });
    }
};
