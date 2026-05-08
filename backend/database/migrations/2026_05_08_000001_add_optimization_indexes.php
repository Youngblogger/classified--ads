<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->index('subcategory_id', 'ads_subcategory_id_index');
            $table->index(['category_id', 'subcategory_id', 'status'], 'ads_cat_subcat_status_index');
            $table->index(['status', 'created_at'], 'ads_status_created_at_index');
            $table->index(['location_id', 'status', 'created_at'], 'ads_loc_status_created_index');
        });

        Schema::table('ad_images', function (Blueprint $table) {
            $table->index(['ad_id', 'is_primary', 'sort_order'], 'ad_images_ad_primary_sort_index');
        });
    }

    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropIndex('ads_subcategory_id_index');
            $table->dropIndex('ads_cat_subcat_status_index');
            $table->dropIndex('ads_status_created_at_index');
            $table->dropIndex('ads_loc_status_created_index');
        });

        Schema::table('ad_images', function (Blueprint $table) {
            $table->dropIndex('ad_images_ad_primary_sort_index');
        });
    }
};
