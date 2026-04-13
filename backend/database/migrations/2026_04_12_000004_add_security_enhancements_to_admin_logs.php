<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin_login_logs', function (Blueprint $table) {
            $table->string('risk_level')->default('low')->after('reason');
            $table->json('device_info')->nullable()->after('user_agent');
            $table->boolean('is_new_device')->default(false)->after('device_info');
            $table->string('country')->nullable()->after('is_new_device');
            $table->boolean('is_suspicious')->default(false)->after('country');
        });

        Schema::table('admin_activity_logs', function (Blueprint $table) {
            $table->string('risk_level')->default('low')->after('request_data');
            $table->json('session_info')->nullable()->after('risk_level');
        });
    }

    public function down(): void
    {
        Schema::table('admin_login_logs', function (Blueprint $table) {
            $table->dropColumn(['risk_level', 'device_info', 'is_new_device', 'country', 'is_suspicious']);
        });

        Schema::table('admin_activity_logs', function (Blueprint $table) {
            $table->dropColumn(['risk_level', 'session_info']);
        });
    }
};
