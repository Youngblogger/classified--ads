<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            if (!Schema::hasColumn('ads', 'clicks_count')) {
                $table->integer('clicks_count')->default(0)->after('views');
            }
            if (!Schema::hasColumn('ads', 'whatsapp_clicks')) {
                $table->integer('whatsapp_clicks')->default(0)->after('clicks_count');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropColumn(['clicks_count', 'whatsapp_clicks']);
        });
    }
};
