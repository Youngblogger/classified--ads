<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_verified_seller')->default(false)->after('verified');
            $table->timestamp('seller_verified_at')->nullable()->after('is_verified_seller');
            $table->boolean('is_verified_business')->default(false)->after('seller_verified_at');
            $table->timestamp('business_verified_at')->nullable()->after('is_verified_business');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_verified_seller', 'seller_verified_at', 'is_verified_business', 'business_verified_at']);
        });
    }
};
