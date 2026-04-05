<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->unsignedTinyInteger('quality_score')->default(100)->after('is_seeded');
            $table->boolean('is_flagged')->default(false)->after('quality_score');
            $table->json('quality_flags')->nullable()->after('is_flagged');
            $table->timestamp('last_quality_check')->nullable()->after('quality_flags');
        });
    }

    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropColumn(['quality_score', 'is_flagged', 'quality_flags', 'last_quality_check']);
        });
    }
};
