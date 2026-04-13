<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->string('state', 100)->nullable()->after('lga');
            $table->boolean('edited_by_admin')->default(false)->after('state');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            if (Schema::hasColumn('ads', 'edited_by_admin')) {
                $table->dropColumn('edited_by_admin');
            }
            if (Schema::hasColumn('ads', 'state')) {
                $table->dropColumn('state');
            }
        });
    }
};
