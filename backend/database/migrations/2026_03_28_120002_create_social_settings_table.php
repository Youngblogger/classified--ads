<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Stores social media API credentials securely
     */
    public function up(): void
    {
        Schema::create('social_settings', function (Blueprint $table) {
            $table->id();
            $table->string('platform'); // facebook, instagram, twitter
            $table->string('app_id')->nullable();
            $table->text('app_secret')->nullable();
            $table->text('access_token')->nullable();
            $table->string('page_id')->nullable();
            $table->string('instagram_business_id')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
            
            $table->unique('platform');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_settings');
    }
};
