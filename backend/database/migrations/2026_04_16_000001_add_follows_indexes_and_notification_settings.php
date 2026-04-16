<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add composite unique index to prevent duplicate follows
        Schema::table('follows', function (Blueprint $table) {
            // Check if index doesn't exist before adding
            if (!Schema::hasIndex('follows', 'follows_follower_following_unique')) {
                $table->unique(['follower_id', 'following_id'], 'follows_follower_following_unique');
            }
            
            // Add indexes for performance on common queries
            if (!Schema::hasIndex('follows', 'follows_follower_id_index')) {
                $table->index('follower_id', 'follows_follower_id_index');
            }
            
            if (!Schema::hasIndex('follows', 'follows_following_id_index')) {
                $table->index('following_id', 'follows_following_id_index');
            }
        });

        // Add index to notifications table for faster queries
        Schema::table('notifications', function (Blueprint $table) {
            if (!Schema::hasIndex('notifications', 'notifications_user_id_type_index')) {
                $table->index(['user_id', 'type'], 'notifications_user_id_type_index');
            }
            
            if (!Schema::hasIndex('notifications', 'notifications_user_id_read_at_index')) {
                $table->index(['user_id', 'read_at'], 'notifications_user_id_read_at_index');
            }
            
            if (!Schema::hasIndex('notifications', 'notifications_user_id_created_at_index')) {
                $table->index(['user_id', 'created_at'], 'notifications_user_id_created_at_index');
            }
        });

        // Add notification_settings column to users table for email preferences
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'notification_settings')) {
                $table->json('notification_settings')->nullable()->after('email_verified_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('follows', function (Blueprint $table) {
            $table->dropUnique('follows_follower_following_unique');
            $table->dropIndex('follows_follower_id_index');
            $table->dropIndex('follows_following_id_index');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_user_id_type_index');
            $table->dropIndex('notifications_user_id_read_at_index');
            $table->dropIndex('notifications_user_id_created_at_index');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('notification_settings');
        });
    }
};
