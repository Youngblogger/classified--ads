<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('boosted_ads', function (Blueprint $table) {
            $table->foreignId('plan_id')->nullable()->constrained('boost_plans')->nullOnDelete()->after('ad_id');
            $table->integer('priority_score')->default(0)->after('end_time');
            $table->bigInteger('impressions')->default(0)->after('priority_score');
            $table->bigInteger('clicks')->default(0)->after('impressions');
            $table->foreignId('payment_intent_id')->nullable()->constrained('payment_intents')->nullOnDelete()->after('payment_reference');
            $table->index('priority_score');
            $table->index(['priority_score', 'start_time']);
        });
    }

    public function down(): void
    {
        Schema::table('boosted_ads', function (Blueprint $table) {
            $table->dropForeign(['plan_id']);
            $table->dropForeign(['payment_intent_id']);
            $table->dropIndex(['priority_score']);
            $table->dropIndex(['priority_score', 'start_time']);
            $table->dropColumn(['plan_id', 'priority_score', 'impressions', 'clicks', 'payment_intent_id']);
        });
    }
};
