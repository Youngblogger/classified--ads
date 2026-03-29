<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->index('category_id', 'ads_category_id_index');
            $table->index('location_id', 'ads_location_id_index');
            $table->index('created_at', 'ads_created_at_index');
            $table->index('status', 'ads_status_index');
            $table->index(['status', 'created_at'], 'ads_status_created_index');
            $table->index(['category_id', 'status'], 'ads_category_status_index');
            $table->index('is_featured', 'ads_is_featured_index');
            $table->index('user_id', 'ads_user_id_index');
            $table->index('price', 'ads_price_index');
        });

        Schema::table('ad_images', function (Blueprint $table) {
            $table->index('ad_id', 'ad_images_ad_id_index');
            $table->index('is_primary', 'ad_images_is_primary_index');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->index('parent_id', 'categories_parent_id_index');
            $table->index('is_active', 'categories_is_active_index');
            $table->index('slug', 'categories_slug_index')->unique();
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->index('parent_id', 'locations_parent_id_index');
            $table->index('is_active', 'locations_is_active_index');
            $table->index('slug', 'locations_slug_index')->unique();
        });
    }

    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropIndex('ads_category_id_index');
            $table->dropIndex('ads_location_id_index');
            $table->dropIndex('ads_created_at_index');
            $table->dropIndex('ads_status_index');
            $table->dropIndex('ads_status_created_index');
            $table->dropIndex('ads_category_status_index');
            $table->dropIndex('ads_is_featured_index');
            $table->dropIndex('ads_user_id_index');
            $table->dropIndex('ads_price_index');
        });

        Schema::table('ad_images', function (Blueprint $table) {
            $table->dropIndex('ad_images_ad_id_index');
            $table->dropIndex('ad_images_is_primary_index');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex('categories_parent_id_index');
            $table->dropIndex('categories_is_active_index');
            $table->dropIndex('categories_slug_index');
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->dropIndex('locations_parent_id_index');
            $table->dropIndex('locations_is_active_index');
            $table->dropIndex('locations_slug_index');
        });
    }
};
