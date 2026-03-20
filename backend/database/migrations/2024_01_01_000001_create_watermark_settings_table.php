<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('watermark_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('enabled')->default(true);
            $table->enum('type', ['text', 'logo'])->default('text');
            $table->string('text')->default('iList');
            $table->string('logo_url')->nullable();
            $table->string('text_color')->default('#FFFFFF');
            $table->string('shadow_color')->default('#000000');
            $table->integer('shadow_opacity')->default(50);
            $table->enum('position', ['bottom_right', 'bottom_left', 'top_right', 'top_left', 'center'])->default('bottom_right');
            $table->integer('opacity')->default(80);
            $table->integer('font_size')->default(36);
            $table->string('font_family')->nullable();
            $table->string('font_path')->nullable();
            $table->integer('margin')->default(20);
            $table->integer('rotation')->default(-45);
            $table->boolean('show_ad_id')->default(true);
            $table->boolean('apply_to_original')->default(true);
            $table->boolean('apply_to_medium')->default(true);
            $table->boolean('apply_to_thumbnail')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('watermark_settings');
    }
};
