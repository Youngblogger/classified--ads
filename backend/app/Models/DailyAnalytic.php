<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyAnalytic extends Model
{
    protected $table = 'daily_analytics';

    protected $fillable = [
        'date',
        'metric_type',
        'value',
    ];

    protected $casts = [
        'date' => 'date',
        'value' => 'integer',
    ];
}
