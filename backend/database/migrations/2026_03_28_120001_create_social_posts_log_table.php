<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Logs each social media posting attempt with response/error details
     */
    public function up(): void
    {
        Schema::create('social_posts_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ad_id')->constrained()->onDelete('cascade');
            $table->foreignId('scheduled_post_id')->nullable()->constrained('scheduled_posts')->onDelete('set null');
            $table->string('platform'); // facebook, instagram, twitter
            $table->string('status'); // success, failed, pending, skipped
            $table->string('platform_post_id')->nullable();
            $table->text('platform_post_url')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('attempt_count')->default(0);
            $table->json('api_response')->nullable();
            $table->timestamps();
            
            $table->index(['platform', 'status']);
            $table->index('ad_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_posts_log');
    }
};
