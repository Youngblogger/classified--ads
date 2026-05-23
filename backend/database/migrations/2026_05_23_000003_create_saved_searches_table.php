<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saved_searches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->json('search_params');
            $table->string('frequency')->default('instant');
            $table->boolean('notify_email')->default(true);
            $table->boolean('notify_in_app')->default(true);
            $table->timestamp('last_notified_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('frequency');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_searches');
    }
};
