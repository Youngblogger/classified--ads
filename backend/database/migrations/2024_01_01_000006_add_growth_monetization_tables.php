<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boosted_ads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ad_id')->constrained('ads')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('boost_type', ['top', 'featured', 'highlight'])->default('top');
            $table->timestamp('start_time')->useCurrent();
            $table->timestamp('end_time');
            $table->enum('status', ['active', 'expired', 'cancelled'])->default('active');
            $table->string('payment_reference')->nullable();
            $table->timestamps();

            $table->index(['ad_id', 'status']);
            $table->index(['status', 'end_time']);
            $table->index(['boost_type', 'status', 'start_time']);
        });

        Schema::create('saved_ads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('ad_id')->constrained('ads')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['user_id', 'ad_id']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('payment_intents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('ad_id')->nullable()->constrained('ads')->onDelete('set null');
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('reference')->unique();
            $table->enum('type', ['boost', 'wallet', 'other'])->default('boost');
            $table->enum('status', ['pending', 'paid', 'failed', 'expired'])->default('pending');
            $table->json('metadata')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['reference', 'status']);
        });

        Schema::table('ads', function (Blueprint $table) {
            $table->integer('share_count')->default(0)->after('views');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boosted_ads');
        Schema::dropIfExists('saved_ads');
        Schema::dropIfExists('payment_intents');

        Schema::table('ads', function (Blueprint $table) {
            $table->dropColumn('share_count');
        });
    }
};
