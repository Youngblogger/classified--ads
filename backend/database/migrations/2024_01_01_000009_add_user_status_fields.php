<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('status', ['active', 'suspended', 'banned'])->default('active')->after('email');
            $table->boolean('verified')->default(false)->after('status');
            $table->timestamp('banned_at')->nullable()->after('verified');
            $table->timestamp('suspended_at')->nullable()->after('banned_at');
            $table->string('ban_reason')->nullable()->after('suspended_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'verified', 'banned_at', 'suspended_at', 'ban_reason']);
        });
    }
};
