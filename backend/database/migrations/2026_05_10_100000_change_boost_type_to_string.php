<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('boosted_ads', function (Blueprint $table) {
            $table->string('boost_type', 50)->change();
        });
    }

    public function down(): void
    {
        Schema::table('boosted_ads', function (Blueprint $table) {
            $table->enum('boost_type', ['top', 'featured', 'highlight'])->default('top')->change();
        });
    }
};
