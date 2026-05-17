<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE transactions MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending'");

        Schema::table('transactions', function (Blueprint $table) {
            $table->timestamp('expires_at')->nullable()->after('processed_at');
            $table->timestamp('expired_at')->nullable()->after('processed_at');
        });

        Schema::table('payment_intents', function (Blueprint $table) {
            $table->timestamp('expires_at')->nullable()->after('paid_at');
        });
    }

    public function down(): void
    {
        $defaultStatuses = ["'pending'", "'success'", "'failed'"];
        DB::statement("ALTER TABLE transactions MODIFY COLUMN status ENUM(" . implode(',', $defaultStatuses) . ") NOT NULL DEFAULT 'pending'");

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['expires_at', 'expired_at']);
        });

        Schema::table('payment_intents', function (Blueprint $table) {
            $table->dropColumn('expires_at');
        });
    }
};
