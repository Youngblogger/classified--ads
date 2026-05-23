<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class AdAnalytic extends Model
{
    protected $fillable = [
        'ad_id', 'date', 'views', 'unique_views', 'favorites',
        'messages', 'phone_clicks', 'whatsapp_clicks', 'shares',
    ];

    protected $casts = [
        'date' => 'date',
        'views' => 'integer',
        'unique_views' => 'integer',
        'favorites' => 'integer',
        'messages' => 'integer',
        'phone_clicks' => 'integer',
        'whatsapp_clicks' => 'integer',
        'shares' => 'integer',
    ];

    public function ad(): BelongsTo
    {
        return $this->belongsTo(Ad::class);
    }

    public static function recordView(int $adId): void
    {
        self::updateOrCreate(
            ['ad_id' => $adId, 'date' => now()->toDateString()],
            ['views' => DB::raw('views + 1')]
        );
    }

    public static function recordUniqueView(int $adId): void
    {
        self::updateOrCreate(
            ['ad_id' => $adId, 'date' => now()->toDateString()],
            ['unique_views' => DB::raw('unique_views + 1')]
        );
    }

    public static function recordFavorite(int $adId): void
    {
        self::updateOrCreate(
            ['ad_id' => $adId, 'date' => now()->toDateString()],
            ['favorites' => DB::raw('favorites + 1')]
        );
    }

    public static function recordUnfavorite(int $adId): void
    {
        self::where('ad_id', $adId)
            ->where('date', now()->toDateString())
            ->where('favorites', '>', 0)
            ->decrement('favorites');
    }

    public static function recordMessage(int $adId): void
    {
        self::updateOrCreate(
            ['ad_id' => $adId, 'date' => now()->toDateString()],
            ['messages' => DB::raw('messages + 1')]
        );
    }

    public static function recordPhoneClick(int $adId): void
    {
        self::updateOrCreate(
            ['ad_id' => $adId, 'date' => now()->toDateString()],
            ['phone_clicks' => DB::raw('phone_clicks + 1')]
        );
    }

    public static function recordWhatsAppClick(int $adId): void
    {
        self::updateOrCreate(
            ['ad_id' => $adId, 'date' => now()->toDateString()],
            ['whatsapp_clicks' => DB::raw('whatsapp_clicks + 1')]
        );
    }

    public static function recordShare(int $adId): void
    {
        self::updateOrCreate(
            ['ad_id' => $adId, 'date' => now()->toDateString()],
            ['shares' => DB::raw('shares + 1')]
        );
    }

    public static function getAdStats(int $adId, string $startDate, string $endDate)
    {
        return self::where('ad_id', $adId)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get();
    }

    public static function getAggregatedAdStats(int $adId): array
    {
        $stats = self::where('ad_id', $adId)
            ->selectRaw('
                COALESCE(SUM(views), 0) as total_views,
                COALESCE(SUM(unique_views), 0) as total_unique_views,
                COALESCE(SUM(favorites), 0) as total_favorites,
                COALESCE(SUM(messages), 0) as total_messages,
                COALESCE(SUM(phone_clicks), 0) as total_phone_clicks,
                COALESCE(SUM(whatsapp_clicks), 0) as total_whatsapp_clicks,
                COALESCE(SUM(shares), 0) as total_shares
            ')
            ->first();

        $totalClicks = $stats->total_phone_clicks + $stats->total_whatsapp_clicks;
        $stats->total_engagement_clicks = $totalClicks;
        $stats->ctr = $stats->total_views > 0
            ? round(($totalClicks / $stats->total_views) * 100, 2)
            : 0;

        return $stats->toArray();
    }

    public static function getTopPerforming(int $userId, int $limit = 10)
    {
        return self::join('ads', 'ad_analytics.ad_id', '=', 'ads.id')
            ->where('ads.user_id', $userId)
            ->selectRaw('
                ads.id, ads.title, ads.slug, ads.price, ads.created_at,
                COALESCE(SUM(ad_analytics.views), 0) as total_views,
                COALESCE(SUM(ad_analytics.unique_views), 0) as total_unique_views,
                COALESCE(SUM(ad_analytics.favorites), 0) as total_favorites,
                COALESCE(SUM(ad_analytics.messages), 0) as total_messages,
                COALESCE(SUM(ad_analytics.phone_clicks), 0) as total_phone_clicks,
                COALESCE(SUM(ad_analytics.whatsapp_clicks), 0) as total_whatsapp_clicks,
                COALESCE(SUM(ad_analytics.shares), 0) as total_shares
            ')
            ->groupBy('ads.id', 'ads.title', 'ads.slug', 'ads.price', 'ads.created_at')
            ->orderByDesc('total_views')
            ->limit($limit)
            ->get();
    }
}
