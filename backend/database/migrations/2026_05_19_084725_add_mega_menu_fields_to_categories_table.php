<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'image')) {
                $table->string('image')->nullable()->after('icon');
            }
            if (!Schema::hasColumn('categories', 'level')) {
                $table->unsignedTinyInteger('level')->default(0)->after('parent_id');
            }
            if (!Schema::hasColumn('categories', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->after('is_active');
            }
            if (!Schema::hasColumn('categories', 'is_trending')) {
                $table->boolean('is_trending')->default(false)->after('is_featured');
            }
            if (!Schema::hasColumn('categories', 'category_badge')) {
                $table->string('category_badge')->nullable()->after('is_trending');
            }
            if (!Schema::hasColumn('categories', 'meta_title')) {
                $table->string('meta_title')->nullable()->after('category_badge');
            }
            if (!Schema::hasColumn('categories', 'meta_description')) {
                $table->text('meta_description')->nullable()->after('meta_title');
            }
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $columns = ['image', 'level', 'is_featured', 'is_trending', 'category_badge', 'meta_title', 'meta_description'];
            foreach ($columns as $col) {
                if (Schema::hasColumn('categories', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};