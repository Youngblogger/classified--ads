<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ad_fix_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ad_id')->constrained('ads')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action'); // auto_fix, delete_images, replace_images, etc.
            $table->json('old_data')->nullable();
            $table->json('new_data')->nullable();
            $table->string('status')->default('completed'); // completed, failed, pending
            $table->text('error_message')->nullable();
            $table->timestamps();
            
            $table->index('ad_id');
            $table->index('user_id');
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_fix_logs');
    }
};
