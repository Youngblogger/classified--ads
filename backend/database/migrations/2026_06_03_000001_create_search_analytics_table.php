<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_analytics', function (Blueprint $table) {
            $table->id();
            $table->string('query', 255)->index();
            $table->string('normalized_query', 255)->nullable();
            $table->string('location', 100)->nullable()->index();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('fallback_level')->default(0)->index();
            $table->integer('results_count')->default(0);
            $table->integer('results_before_fallback')->default(0);
            $table->string('intent', 20)->nullable();
            $table->boolean('has_price_intent')->default(false);
            $table->string('engine', 20)->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->string('session_id', 100)->nullable()->index();
            $table->unsignedInteger('duration_ms')->default(0);
            $table->timestamp('created_at')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_analytics');
    }
};
