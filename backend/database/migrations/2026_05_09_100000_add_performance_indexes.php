<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('ads')) {
            Schema::table('ads', function (Blueprint $table) {
                $indexes = ['ads_status_created_at_idx','ads_category_status_created_idx','ads_location_status_created_idx','ads_cat_loc_status_created_idx','ads_seeded_status_created_idx','ads_user_status_created_idx','ads_status_views_created_idx','ads_featured_status_created_idx','ads_verification_status_idx','ads_quality_status_created_idx','ads_processing_status_idx'];
                $existing = collect(DB::select('SHOW INDEX FROM ads'))->pluck('Key_name')->unique()->all();
                foreach ([
                    'ads_status_created_at_idx' => ['status', 'created_at'],
                    'ads_category_status_created_idx' => ['category_id', 'status', 'created_at'],
                    'ads_location_status_created_idx' => ['location_id', 'status', 'created_at'],
                    'ads_cat_loc_status_created_idx' => ['category_id', 'location_id', 'status', 'created_at'],
                    'ads_seeded_status_created_idx' => ['is_seeded', 'status', 'created_at'],
                    'ads_user_status_created_idx' => ['user_id', 'status', 'created_at'],
                    'ads_status_views_created_idx' => ['status', 'views', 'created_at'],
                    'ads_featured_status_created_idx' => ['is_featured', 'status', 'created_at'],
                    'ads_verification_status_idx' => ['verification_status', 'status'],
                    'ads_quality_status_created_idx' => ['quality_score', 'status', 'created_at'],
                    'ads_processing_status_idx' => ['processing_status', 'status'],
                ] as $name => $cols) {
                    if (!in_array($name, $existing)) {
                        $table->index($cols, $name);
                    }
                }
                try { DB::statement('ALTER TABLE ads ADD FULLTEXT INDEX ads_title_description_ft_idx (title, description)'); } catch (\Exception $e) {}
                try { DB::statement('ALTER TABLE ads ADD FULLTEXT INDEX ads_title_ft_idx (title)'); } catch (\Exception $e) {}
            });
        }

        if (Schema::hasTable('boosted_ads')) {
            Schema::table('boosted_ads', function (Blueprint $table) {
                $existing = collect(DB::select('SHOW INDEX FROM boosted_ads'))->pluck('Key_name')->unique()->all();
                foreach ([
                    'boosts_active_priority_idx' => ['status', 'end_time', 'priority_score'],
                    'boosts_user_status_created_idx' => ['user_id', 'status', 'created_at'],
                    'boosts_ad_status_end_idx' => ['ad_id', 'status', 'end_time'],
                    'boosts_status_end_idx' => ['status', 'end_time'],
                    'boosts_payment_intent_idx' => ['payment_intent_id'],
                ] as $name => $cols) {
                    if (!in_array($name, $existing)) {
                        $table->index($cols, $name);
                    }
                }
            });
        }

        if (Schema::hasTable('messages')) {
            Schema::table('messages', function (Blueprint $table) {
                $existing = collect(DB::select('SHOW INDEX FROM messages'))->pluck('Key_name')->unique()->all();
                foreach ([
                    'messages_conversation_created_idx' => ['conversation_id', 'created_at'],
                    'messages_unread_idx' => ['conversation_id', 'sender_id', 'read_at'],
                ] as $name => $cols) {
                    if (!in_array($name, $existing)) {
                        $table->index($cols, $name);
                    }
                }
            });
        }

        if (Schema::hasTable('conversations')) {
            Schema::table('conversations', function (Blueprint $table) {
                $existing = collect(DB::select('SHOW INDEX FROM conversations'))->pluck('Key_name')->unique()->all();
                foreach ([
                    'conv_sender_lastmsg_idx' => ['sender_id', 'last_message_at'],
                    'conv_receiver_lastmsg_idx' => ['receiver_id', 'last_message_at'],
                    'conv_sender_receiver_ad_idx' => ['sender_id', 'receiver_id', 'ad_id'],
                ] as $name => $cols) {
                    if (!in_array($name, $existing)) {
                        $table->index($cols, $name);
                    }
                }
            });
        }

        if (Schema::hasTable('ad_images')) {
            Schema::table('ad_images', function (Blueprint $table) {
                $existing = collect(DB::select('SHOW INDEX FROM ad_images'))->pluck('Key_name')->unique()->all();
                foreach ([
                    'img_ad_primary_sort_idx' => ['ad_id', 'is_primary', 'sort_order'],
                ] as $name => $cols) {
                    if (!in_array($name, $existing)) {
                        $table->index($cols, $name);
                    }
                }
            });
        }

        if (Schema::hasTable('notifications')) {
            Schema::table('notifications', function (Blueprint $table) {
                if (!Schema::hasIndex('notifications', 'notif_user_read_created_idx')) {
                    $table->index(['user_id', 'read_at', 'created_at'], 'notif_user_read_created_idx');
                }
            });
        }

        if (Schema::hasTable('ad_user_saves')) {
            Schema::table('ad_user_saves', function (Blueprint $table) {
                if (!Schema::hasIndex('ad_user_saves', 'saves_user_ad_idx')) {
                    $table->index(['user_id', 'ad_id'], 'saves_user_ad_idx');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('ads')) {
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
        }

        if (Schema::hasTable('boosted_ads')) {
            Schema::table('boosted_ads', function (Blueprint $table) {
                $table->dropIndex(['boosts_active_priority_idx']);
                $table->dropIndex(['boosts_user_status_created_idx']);
                $table->dropIndex(['boosts_ad_status_end_idx']);
                $table->dropIndex(['boosts_status_end_idx']);
                $table->dropIndex(['boosts_payment_intent_idx']);
            });
        }

        if (Schema::hasTable('messages')) {
            Schema::table('messages', function (Blueprint $table) {
                $table->dropIndex(['messages_conversation_created_idx']);
                $table->dropIndex(['messages_unread_idx']);
            });
        }

        if (Schema::hasTable('conversations')) {
            Schema::table('conversations', function (Blueprint $table) {
                $table->dropIndex(['conv_sender_lastmsg_idx']);
                $table->dropIndex(['conv_receiver_lastmsg_idx']);
                $table->dropIndex(['conv_sender_receiver_ad_idx']);
            });
        }

        if (Schema::hasTable('ad_images')) {
            Schema::table('ad_images', function (Blueprint $table) {
                $table->dropIndex(['img_ad_primary_sort_idx']);
            });
        }
    }
};
