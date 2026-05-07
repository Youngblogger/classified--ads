<?php

namespace App\Services;

use App\Models\Ad;
use App\Events\AdShared;
use Illuminate\Support\Facades\Log;

class ShareService
{
    public function generateShareLink(Ad $ad): array
    {
        $baseUrl = rtrim(config('app.url'), '/');

        $shareUrl = "{$baseUrl}/ads/{$ad->slug}";

        $utmParams = http_build_query([
            'utm_source' => 'share',
            'utm_medium' => 'social',
            'utm_campaign' => 'ad_share',
        ]);

        $trackableUrl = "{$shareUrl}?{$utmParams}";

        $ad->increment('share_count');

        event(new AdShared($ad));

        Log::info('Ad shared', [
            'ad_id' => $ad->id,
            'slug' => $ad->slug,
            'share_count' => $ad->share_count,
        ]);

        return [
            'direct_url' => $shareUrl,
            'trackable_url' => $trackableUrl,
            'title' => $ad->title,
            'description' => $this->generateShareText($ad),
        ];
    }

    public function generateWhatsAppLink(Ad $ad): string
    {
        $shareData = $this->generateShareLink($ad);
        $text = urlencode($shareData['description'] . "\n" . $shareData['trackable_url']);

        return "https://wa.me/?text={$text}";
    }

    public function generateFacebookLink(Ad $ad): string
    {
        $shareData = $this->generateShareLink($ad);

        $params = http_build_query([
            'u' => $shareData['trackable_url'],
            'quote' => $shareData['title'],
        ]);

        return "https://www.facebook.com/sharer/sharer.php?{$params}";
    }

    public function generateTwitterLink(Ad $ad): string
    {
        $shareData = $this->generateShareLink($ad);
        $text = urlencode($shareData['title'] . "\n" . $shareData['trackable_url']);

        return "https://twitter.com/intent/tweet?text={$text}";
    }

    public function trackShare(int $adId, string $platform = 'unknown'): void
    {
        $ad = Ad::find($adId);

        if (!$ad) {
            return;
        }

        $ad->increment('share_count');

        Log::info('Ad shared via platform', [
            'ad_id' => $adId,
            'platform' => $platform,
            'share_count' => $ad->share_count,
        ]);
    }

    protected function generateShareText(Ad $ad): string
    {
        $price = $ad->currency . ' ' . number_format($ad->price, 2);
        $location = $ad->location?->name ?? '';

        $text = "Check out this ad: {$ad->title}";

        if ($location) {
            $text .= " in {$location}";
        }

        $text .= " for {$price}";

        return $text;
    }
}
