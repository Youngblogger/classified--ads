<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ad_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ad_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->integer('views')->default(0);
            $table->integer('unique_views')->default(0);
            $table->integer('favorites')->default(0);
            $table->integer('messages')->default(0);
            $table->integer('phone_clicks')->default(0);
            $table->integer('whatsapp_clicks')->default(0);
            $table->integer('shares')->default(0);
            $table->timestamps();

            $table->unique(['ad_id', 'date']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_analytics');
    }
};
