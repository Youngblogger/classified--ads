<?php

namespace App\Console\Commands;

use App\Models\Ad;
use App\Models\SavedSearch;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessSavedSearches extends Command
{
    protected $signature = 'saved-searches:process';
    protected $description = 'Process daily and weekly saved searches and send notifications';

    public function handle()
    {
        $this->info('Processing saved searches...');

        $savedSearches = SavedSearch::where('notify_in_app', true)
            ->whereIn('frequency', ['daily', 'weekly'])
            ->dueForNotification()
            ->get();

        $processed = 0;

        foreach ($savedSearches as $savedSearch) {
            try {
                $params = $savedSearch->search_params;
                $query = Ad::where('status', 'active')
                    ->where('user_id', '!=', $savedSearch->user_id);

                if (!empty($params['category_id'])) {
                    $query->where('category_id', $params['category_id']);
                }

                if (!empty($params['location_id'])) {
                    $query->where('location_id', $params['location_id']);
                }

                if (!empty($params['min_price'])) {
                    $query->where('price', '>=', $params['min_price']);
                }

                if (!empty($params['max_price'])) {
                    $query->where('price', '<=', $params['max_price']);
                }

                if (!empty($params['condition'])) {
                    $query->where('condition', $params['condition']);
                }

                if (!empty($params['keyword'])) {
                    $keyword = $params['keyword'];
                    $query->where(function ($q) use ($keyword) {
                        $q->where('title', 'like', "%{$keyword}%")
                            ->orWhere('description', 'like', "%{$keyword}%");
                    });
                }

                $newAds = $query->where('created_at', '>=', $savedSearch->last_notified_at ?? now()->subDay())
                    ->count();

                if ($newAds > 0) {
                    $frequencyLabel = $savedSearch->frequency === 'daily' ? 'today' : 'this week';

                    NotificationService::send(
                        $savedSearch->user_id,
                        'saved_search_digest',
                        "{$newAds} New Ads Matching '{$savedSearch->name}'",
                        "There are {$newAds} new ads matching your saved search '{$savedSearch->name}' {$frequencyLabel}.",
                        [
                            'saved_search_id' => $savedSearch->id,
                            'saved_search_name' => $savedSearch->name,
                            'new_ads_count' => $newAds,
                        ]
                    );

                    $processed++;
                }

                $savedSearch->update(['last_notified_at' => now()]);
            } catch (\Exception $e) {
                Log::error("Failed to process saved search {$savedSearch->id}: {$e->getMessage()}");
            }
        }

        $this->info("Processed {$processed} saved searches with new matches.");
    }
}
