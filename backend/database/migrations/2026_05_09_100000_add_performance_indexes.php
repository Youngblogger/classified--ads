<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ============================================
        // ADS TABLE - Composite indexes for common queries
        // ============================================

        Schema::table('ads', function (Blueprint $table) {
            // Homepage feed: WHERE status=active AND (is_seeded OR processing_status=completed)
            // ORDER BY created_at DESC
            $table->index(['status', 'created_at'], 'ads_status_created_at_idx');

            // Category page: WHERE category_id=X AND status=active
            $table->index(['category_id', 'status', 'created_at'], 'ads_category_status_created_idx');

            // Location filter: WHERE location_id=X AND status=active
            $table->index(['location_id', 'status', 'created_at'], 'ads_location_status_created_idx');

            // Category + Location combined filter
            $table->index(['category_id', 'location_id', 'status', 'created_at'], 'ads_cat_loc_status_created_idx');

            // Boosted ads query: WHERE status=active AND is_seeded=true
            $table->index(['is_seeded', 'status', 'created_at'], 'ads_seeded_status_created_idx');

            // User's ads: WHERE user_id=X ORDER BY created_at DESC
            $table->index(['user_id', 'status', 'created_at'], 'ads_user_status_created_idx');

            // Trending: WHERE status=active AND created_at>=X ORDER BY views DESC
            $table->index(['status', 'views', 'created_at'], 'ads_status_views_created_idx');

            // Featured listing: WHERE is_featured=true AND status=active
            $table->index(['is_featured', 'status', 'created_at'], 'ads_featured_status_created_idx');

            // Verification status queries
            $table->index(['verification_status', 'status'], 'ads_verification_status_idx');

            // Quality score sorting
            $table->index(['quality_score', 'status', 'created_at'], 'ads_quality_status_created_idx');

            // Processing status queries
            $table->index(['processing_status', 'status'], 'ads_processing_status_idx');

            // Fulltext indexes for search
            DB::statement('ALTER TABLE ads ADD FULLTEXT INDEX ads_title_description_ft_idx (title, description)');
            DB::statement('ALTER TABLE ads ADD FULLTEXT INDEX ads_title_ft_idx (title)');
        });

        // ============================================
        // BOOSTED ADS TABLE
        // ============================================

        Schema::table('boosted_ads', function (Blueprint $table) {
            // Active boosts query: WHERE status=active AND end_time>now()
            $table->index(['status', 'end_time', 'priority_score'], 'boosts_active_priority_idx');

            // User's boosts: WHERE user_id=X
            $table->index(['user_id', 'status', 'created_at'], 'boosts_user_status_created_idx');

            // Ad boost lookup: WHERE ad_id=X AND status=active
            $table->index(['ad_id', 'status', 'end_time'], 'boosts_ad_status_end_idx');

            // Expiry query: WHERE status=active AND end_time<=now()
            $table->index(['status', 'end_time'], 'boosts_status_end_idx');

            // Payment intent reference
            $table->index(['payment_intent_id'], 'boosts_payment_intent_idx');
        });

        // ============================================
        // MESSAGES TABLE
        // ============================================

        Schema::table('messages', function (Blueprint $table) {
            // Chat messages: WHERE conversation_id=X ORDER BY created_at
            $table->index(['conversation_id', 'created_at'], 'messages_conversation_created_idx');

            // Unread count: WHERE conversation_id=X AND sender_id!=Y AND read_at IS NULL
            $table->index(['conversation_id', 'sender_id', 'read_at'], 'messages_unread_idx');
        });

        // ============================================
        // CONVERSATIONS TABLE
        // ============================================

        Schema::table('conversations', function (Blueprint $table) {
            // User conversations: WHERE sender_id=X OR receiver_id=X ORDER BY last_message_at DESC
            $table->index(['sender_id', 'last_message_at'], 'conv_sender_lastmsg_idx');
            $table->index(['receiver_id', 'last_message_at'], 'conv_receiver_lastmsg_idx');

            // Unique conversation lookup: WHERE sender_id=X AND receiver_id=Y AND ad_id=Z
            $table->index(['sender_id', 'receiver_id', 'ad_id'], 'conv_sender_receiver_ad_idx');
        });

        // ============================================
        // AD IMAGES TABLE
        // ============================================

        Schema::table('ad_images', function (Blueprint $table) {
            // Primary image lookup: WHERE ad_id=X AND is_primary=true
            $table->index(['ad_id', 'is_primary', 'sort_order'], 'img_ad_primary_sort_idx');
        });

        // ============================================
        // NOTIFICATIONS TABLE
        // ============================================

        Schema::table('notifications', function (Blueprint $table) {
            if (!Schema::hasIndex('notifications', 'notif_user_read_created_idx')) {
                $table->index(['user_id', 'read_at', 'created_at'], 'notif_user_read_created_idx');
            }
        });

        // ============================================
        // AD USER SAVES TABLE
        // ============================================

        Schema::table('ad_user_saves', function (Blueprint $table) {
            if (!Schema::hasIndex('ad_user_saves', 'saves_user_ad_idx')) {
                $table->index(['user_id', 'ad_id'], 'saves_user_ad_idx');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropIndex(['ads_status_created_at_idx']);
            $table->dropIndex(['ads_category_status_created_idx']);
            $table->dropIndex(['ads_location_status_created_idx']);
            $table->dropIndex(['ads_cat_loc_status_created_idx']);
            $table->dropIndex(['ads_seeded_status_created_idx']);
            $table->dropIndex(['ads_user_status_created_idx']);
            $table->dropIndex(['ads_status_views_created_idx']);
            $table->dropIndex(['ads_featured_status_created_idx']);
            $table->dropIndex(['ads_verification_status_idx']);
            $table->dropIndex(['ads_quality_status_created_idx']);
            $table->dropIndex(['ads_processing_status_idx']);
        });

        Schema::table('boosted_ads', function (Blueprint $table) {
            $table->dropIndex(['boosts_active_priority_idx']);
            $table->dropIndex(['boosts_user_status_created_idx']);
            $table->dropIndex(['boosts_ad_status_end_idx']);
            $table->dropIndex(['boosts_status_end_idx']);
            $table->dropIndex(['boosts_payment_intent_idx']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['messages_conversation_created_idx']);
            $table->dropIndex(['messages_unread_idx']);
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex(['conv_sender_lastmsg_idx']);
            $table->dropIndex(['conv_receiver_lastmsg_idx']);
            $table->dropIndex(['conv_sender_receiver_ad_idx']);
        });

        Schema::table('ad_images', function (Blueprint $table) {
            $table->dropIndex(['img_ad_primary_sort_idx']);
        });
    }
};
