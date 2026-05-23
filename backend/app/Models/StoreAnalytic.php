<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreAnalytic extends Model
{
    protected $fillable = [
        'store_id', 'date', 'views', 'unique_visitors', 'followers_count',
        'ad_count', 'contact_clicks', 'whatsapp_clicks', 'phone_clicks',
    ];

    protected $casts = [
        'date' => 'date',
        'views' => 'integer',
        'unique_visitors' => 'integer',
        'followers_count' => 'integer',
        'ad_count' => 'integer',
        'contact_clicks' => 'integer',
        'whatsapp_clicks' => 'integer',
        'phone_clicks' => 'integer',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public static function recordView(int $storeId): void
    {
        self::updateOrCreate(
            ['store_id' => $storeId, 'date' => now()->toDateString()],
            ['views' => \DB::raw('views + 1')]
        );
    }

    public static function recordUniqueVisitor(int $storeId): void
    {
        self::updateOrCreate(
            ['store_id' => $storeId, 'date' => now()->toDateString()],
            ['unique_visitors' => \DB::raw('unique_visitors + 1')]
        );
    }

    public static function getPeriodStats(int $storeId, string $startDate, string $endDate)
    {
        return self::where('store_id', $storeId)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get();
    }
}
