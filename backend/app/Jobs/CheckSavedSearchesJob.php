<?php

namespace App\Jobs;

use App\Models\Ad;
use App\Models\SavedSearch;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckSavedSearchesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    protected int $adId;

    public function __construct(int $adId)
    {
        $this->adId = $adId;
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        try {
            $ad = Ad::find($this->adId);
            if (!$ad) {
                Log::warning("CheckSavedSearchesJob: Ad {$this->adId} not found");
                return;
            }

            $savedSearches = SavedSearch::where('notify_in_app', true)
                ->orWhere('notify_email', true)
                ->get();

            foreach ($savedSearches as $savedSearch) {
                try {
                    if (!$this->matchesSearch($savedSearch, $ad)) {
                        continue;
                    }

                    if ($savedSearch->frequency === 'instant') {
                        NotificationService::send(
                            $savedSearch->user_id,
                            'saved_search_match',
                            'New Ad Matching Your Search',
                            "A new ad '{$ad->title}' matches your saved search '{$savedSearch->name}'.",
                            [
                                'saved_search_id' => $savedSearch->id,
                                'saved_search_name' => $savedSearch->name,
                                'ad_id' => $ad->id,
                                'ad_slug' => $ad->slug,
                                'ad_title' => $ad->title,
                            ]
                        );

                        $savedSearch->update(['last_notified_at' => now()]);
                    }
                } catch (\Exception $e) {
                    Log::error("CheckSavedSearchesJob: Failed to process saved search {$savedSearch->id}", [
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('CheckSavedSearchesJob failed: ' . $e->getMessage());
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("CheckSavedSearchesJob failed for ad {$this->adId} after {$this->tries} attempts", [
            'error' => $exception->getMessage(),
        ]);
    }

    protected function matchesSearch(SavedSearch $savedSearch, Ad $ad): bool
    {
        if ($savedSearch->user_id === $ad->user_id) {
            return false;
        }

        if ($ad->status !== 'active') {
            return false;
        }

        $params = $savedSearch->search_params;

        if (empty($params)) {
            return false;
        }

        if (!empty($params['keyword'])) {
            $keyword = strtolower($params['keyword']);
            $title = strtolower($ad->title);
            $description = strtolower($ad->description ?? '');
            if (!str_contains($title, $keyword) && !str_contains($description, $keyword)) {
                return false;
            }
        }

        if (!empty($params['category_id']) && $ad->category_id != $params['category_id']) {
            return false;
        }

        if (!empty($params['location_id']) && $ad->location_id != $params['location_id']) {
            return false;
        }

        if (!empty($params['min_price']) && $ad->price < $params['min_price']) {
            return false;
        }

        if (!empty($params['max_price']) && $ad->price > $params['max_price']) {
            return false;
        }

        if (!empty($params['condition']) && $ad->condition !== $params['condition']) {
            return false;
        }

        return true;
    }
}
