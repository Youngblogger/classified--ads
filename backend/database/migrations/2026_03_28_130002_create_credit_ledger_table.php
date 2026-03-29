<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Immutable credit transaction ledger
     */
    public function up(): void
    {
        Schema::create('credit_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['earn', 'spend', 'expire', 'bonus']);
            $table->integer('amount');
            $table->string('reason'); // referral_signup, first_ad, boost_ad, featured_listing, etc.
            $table->string('reference_type')->nullable(); // Ad, Promotion, etc.
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->integer('balance_after')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['reason']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('credit_ledger');
    }
};
