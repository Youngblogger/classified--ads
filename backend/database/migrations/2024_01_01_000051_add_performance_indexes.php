<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            if (!$this->hasIndex('ads', 'ads_status_index')) {
                $table->index('status');
            }
            if (!$this->hasIndex('ads', 'ads_status_created_at')) {
                $table->index(['status', 'created_at'], 'ads_status_created_at');
            }
            if (!$this->hasIndex('ads', 'ads_featured_created_at')) {
                $table->index(['status', 'is_featured', 'created_at'], 'ads_featured_created_at');
            }
            if (!$this->hasIndex('ads', 'ads_category_status')) {
                $table->index(['category_id', 'status'], 'ads_category_status');
            }
            if (!$this->hasIndex('ads', 'ads_location_status')) {
                $table->index(['location_id', 'status'], 'ads_location_status');
            }
            if (!$this->hasIndex('ads', 'ads_user_status')) {
                $table->index(['user_id', 'status'], 'ads_user_status');
            }
            if (!$this->hasIndex('ads', 'ads_slug_index')) {
                $table->index('slug');
            }
        });

        Schema::table('ad_images', function (Blueprint $table) {
            if (!$this->hasIndex('ad_images', 'ad_images_ad_sort')) {
                $table->index(['ad_id', 'sort_order'], 'ad_images_ad_sort');
            }
            // public_id column may not exist in some environments
            if (!$this->hasIndex('ad_images', 'ad_images_is_primary_index')) {
                $table->index('is_primary');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (!$this->hasIndex('users', 'users_created_at_index')) {
                $table->index('created_at');
            }
        });
    }

    protected function hasIndex(string $table, string $indexName): bool
    {
        $schema = config('database.connections.mysql.database');
        $tableName = config("database.connections.mysql.prefix") . $table;

        $result = \Illuminate\Support\Facades\DB::select(
            "SELECT COUNT(*) as count FROM information_schema.statistics WHERE table_schema = ? AND table_name = ? AND index_name = ?",
            [$schema, $tableName, $indexName]
        );

        return ($result[0]->count ?? 0) > 0;
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
            $table->dropIndex(['is_primary']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });
    }
};
