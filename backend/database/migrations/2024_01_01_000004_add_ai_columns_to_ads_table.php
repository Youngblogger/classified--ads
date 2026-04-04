<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->foreignId('subcategory_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->json('tags')->nullable();
            $table->text('ai_summary')->nullable();
            $table->json('image_validation')->nullable();
            $table->enum('verification_status', ['pending', 'verified', 'flagged', 'rejected'])->default('pending');
            $table->enum('processing_status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->foreignId('ai_category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->decimal('ai_confidence', 5, 2)->nullable();
            $table->boolean('is_auto_categorized')->default(false);
            $table->text('rejection_reason')->nullable();
            $table->timestamp('processed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropForeign(['subcategory_id']);
            $table->dropForeign(['ai_category_id']);
            $table->dropColumn([
                'subcategory_id',
                'tags',
                'ai_summary',
                'image_validation',
                'verification_status',
                'processing_status',
                'ai_category_id',
                'ai_confidence',
                'is_auto_categorized',
                'rejection_reason',
                'processed_at',
            ]);
        });
    }
};
