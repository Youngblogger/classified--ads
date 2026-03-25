<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('proof_image_url')->nullable()->after('payment_method');
            $table->boolean('is_suspicious')->default(false)->after('proof_image_url');
            $table->text('admin_note')->nullable()->after('is_suspicious');
            $table->unsignedBigInteger('processed_by')->nullable()->after('admin_note');
            $table->foreign('processed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['processed_by']);
            $table->dropColumn(['proof_image_url', 'is_suspicious', 'admin_note', 'processed_by']);
        });
    }
};
