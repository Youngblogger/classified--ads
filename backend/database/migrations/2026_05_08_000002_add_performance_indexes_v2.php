<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function addIndexIfNotExists(string $table, string $indexName, string $columnsSql): void
    {
        try {
            DB::statement("ALTER TABLE `{$table}` ADD INDEX `{$indexName}`({$columnsSql})");
        } catch (\Exception $e) {
            // 1061 = Duplicate key name (index already exists)
            if ($e->getCode() !== '42000' && $e->getCode() !== 'HY000') {
                throw $e;
            }
            $msg = $e->getMessage();
            if (str_contains($msg, '1061') || str_contains($msg, 'Duplicate key name')) {
                return;
            }
            throw $e;
        }
    }

    public function up(): void
    {
        $this->addIndexIfNotExists('ads', 'ads_status_index', '`status`');
        $this->addIndexIfNotExists('ads', 'ads_category_id_index', '`category_id`');
        $this->addIndexIfNotExists('ads', 'ads_created_at_index', '`created_at`');
        $this->addIndexIfNotExists('ads', 'ads_user_status_index', '`user_id`, `status`');
        $this->addIndexIfNotExists('ads', 'ads_user_created_index', '`user_id`, `created_at`');

        $this->addIndexIfNotExists('boosted_ads', 'boosts_boost_type_index', '`boost_type`');
        $this->addIndexIfNotExists('boosted_ads', 'boosts_expires_at_index', '`end_time`');
        $this->addIndexIfNotExists('boosted_ads', 'boosts_status_index', '`status`');
        $this->addIndexIfNotExists('boosted_ads', 'boosts_active_ranking_index', '`status`, `end_time`, `priority_score`');
        $this->addIndexIfNotExists('boosted_ads', 'boosts_ad_status_end_index', '`ad_id`, `status`, `end_time`');

        $this->addIndexIfNotExists('messages', 'messages_conversation_id_index', '`conversation_id`');
        $this->addIndexIfNotExists('messages', 'messages_conv_created_index', '`conversation_id`, `created_at`');
        $this->addIndexIfNotExists('messages', 'messages_sender_conv_index', '`sender_id`, `conversation_id`');

        $this->addIndexIfNotExists('conversations', 'conv_sender_receiver_ad_index', '`sender_id`, `receiver_id`, `ad_id`');
        $this->addIndexIfNotExists('conversations', 'conv_last_message_index', '`last_message_at`');

        $this->addIndexIfNotExists('notifications', 'notifications_user_read_index', '`user_id`, `read_at`');
        $this->addIndexIfNotExists('notifications', 'notifications_user_created_index', '`user_id`, `created_at`');

        $this->addIndexIfNotExists('category_views', 'catviews_category_created_index', '`category_id`, `created_at`');

        $this->addIndexIfNotExists('reviews', 'reviews_ad_created_index', '`ad_id`, `created_at`');
        $this->addIndexIfNotExists('reviews', 'reviews_target_created_index', '`target_user_id`, `created_at`');

        $this->addIndexIfNotExists('favorites', 'favorites_user_ad_index', '`user_id`, `ad_id`');

        $this->addIndexIfNotExists('follows', 'follows_follower_following_index', '`follower_id`, `following_id`');
        $this->addIndexIfNotExists('follows', 'follows_following_follower_index', '`following_id`, `follower_id`');
    }

    public function down(): void
    {
        $indexes = [
            'ads' => ['ads_status_index', 'ads_category_id_index', 'ads_created_at_index', 'ads_user_status_index', 'ads_user_created_index'],
            'boosted_ads' => ['boosts_boost_type_index', 'boosts_expires_at_index', 'boosts_status_index', 'boosts_active_ranking_index', 'boosts_ad_status_end_index'],
            'messages' => ['messages_conversation_id_index', 'messages_conv_created_index', 'messages_sender_conv_index'],
            'conversations' => ['conv_sender_receiver_ad_index', 'conv_last_message_index'],
            'notifications' => ['notifications_user_read_index', 'notifications_user_created_index'],
            'category_views' => ['catviews_category_created_index'],
            'reviews' => ['reviews_ad_created_index', 'reviews_target_created_index'],
            'favorites' => ['favorites_user_ad_index'],
            'follows' => ['follows_follower_following_index', 'follows_following_follower_index'],
        ];

        foreach ($indexes as $table => $names) {
            foreach ($names as $index) {
                try {
                    Schema::table($table, fn ($t) => $t->dropIndex($index));
                } catch (\Exception $e) {
                    // Index may not exist
                }
            }
        }
    }
};
