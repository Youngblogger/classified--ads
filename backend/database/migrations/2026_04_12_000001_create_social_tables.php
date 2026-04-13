<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create social_posts_log table
        if (!Schema::hasTable('social_posts_log')) {
            Schema::create('social_posts_log', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('ad_id');
                $table->unsignedBigInteger('scheduled_post_id')->nullable();
                $table->string('platform'); // facebook, instagram, x, whatsapp
                $table->string('status'); // success, failed, pending, skipped
                $table->string('platform_post_id')->nullable();
                $table->text('platform_post_url')->nullable();
                $table->text('error_message')->nullable();
                $table->integer('attempt_count')->default(0);
                $table->json('api_response')->nullable();
                $table->timestamps();
                
                $table->index(['platform', 'status']);
                $table->index('ad_id');
                
                // Foreign keys
                $table->foreign('ad_id')->references('id')->on('ads')->onDelete('cascade');
                $table->foreign('scheduled_post_id')->references('id')->on('scheduled_posts')->onDelete('set null');
            });
        }
        
        // Create scheduled_posts table
        if (!Schema::hasTable('scheduled_posts')) {
            Schema::create('scheduled_posts', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('ad_id');
                $table->timestamp('scheduled_time')->nullable();
                $table->string('status')->default('pending'); // pending, posted, failed, cancelled
                $table->json('platform_statuses')->nullable();
                $table->unsignedBigInteger('created_by');
                $table->timestamps();
                
                $table->index(['status', 'scheduled_time']);
                
                // Foreign keys
                $table->foreign('ad_id')->references('id')->on('ads')->onDelete('cascade');
                $table->foreign('created_by')->references('id')->on('users');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_posts_log');
        Schema::dropIfExists('scheduled_posts');
    }
};
