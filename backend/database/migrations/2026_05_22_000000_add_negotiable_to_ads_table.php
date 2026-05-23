<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('ads', 'negotiable')) {
            Schema::table('ads', function (Blueprint $table) {
                $table->boolean('negotiable')->default(false)->after('price');
            });
        }
    }

    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropColumn('negotiable');
        });
    }
};
