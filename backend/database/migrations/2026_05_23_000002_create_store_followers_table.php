<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_followers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('created_at')->nullable();

            $table->unique(['store_id', 'user_id']);
            $table->index('store_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_followers');
    }
};
