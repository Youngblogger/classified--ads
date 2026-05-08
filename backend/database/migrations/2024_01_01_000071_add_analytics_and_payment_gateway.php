<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('metric_type');
            $table->unsignedInteger('value')->default(0);
            $table->timestamps();

            $table->unique(['date', 'metric_type'], 'date_metric_unique');
            $table->index(['date', 'metric_type']);
        });

        Schema::table('payment_intents', function (Blueprint $table) {
            $table->string('gateway')->default('paystack')->after('type');
            $table->string('gateway_reference')->nullable()->after('gateway');
            $table->json('gateway_response')->nullable()->after('gateway_reference');
            $table->string('processed_webhook_id')->nullable()->after('gateway_response');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_analytics');

        Schema::table('payment_intents', function (Blueprint $table) {
            $table->dropColumn(['gateway', 'gateway_reference', 'gateway_response', 'processed_webhook_id']);
        });
    }
};
