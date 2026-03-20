<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WatermarkSetting extends Model
{
    protected $fillable = [
        'enabled',
        'type',
        'text',
        'logo_url',
        'text_color',
        'shadow_color',
        'shadow_opacity',
        'position',
        'opacity',
        'font_size',
        'font_family',
        'font_path',
        'margin',
        'rotation',
        'show_ad_id',
        'apply_to_original',
        'apply_to_medium',
        'apply_to_thumbnail',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'show_ad_id' => 'boolean',
        'apply_to_original' => 'boolean',
        'apply_to_medium' => 'boolean',
        'apply_to_thumbnail' => 'boolean',
        'opacity' => 'integer',
        'font_size' => 'integer',
        'shadow_opacity' => 'integer',
        'margin' => 'integer',
        'rotation' => 'integer',
    ];

    public static function getSettings(): self
    {
        return self::first() ?? self::create([
            'text' => 'iList',
            'text_color' => '#FFFFFF',
            'shadow_color' => '#000000',
            'shadow_opacity' => 50,
            'position' => 'bottom_right',
            'opacity' => 80,
            'font_size' => 36,
            'margin' => 20,
            'rotation' => -45,
            'show_ad_id' => true,
            'apply_to_original' => true,
            'apply_to_medium' => true,
            'apply_to_thumbnail' => false,
        ]);
    }

    public function getWatermarkText(?int $adId = null): string
    {
        if ($this->show_ad_id && $adId) {
            return "{$this->text} | Ad ID: {$adId}";
        }
        return $this->text;
    }

    public function getFontPath(): ?string
    {
        if ($this->font_path && file_exists(storage_path('app/public/fonts/' . $this->font_path))) {
            return storage_path('app/public/fonts/' . $this->font_path);
        }

        $systemFonts = [
            'arial' => '/Windows/Fonts/arial.ttf',
            'arial_black' => '/Windows/Fonts/ariblk.ttf',
            'times_new_roman' => '/Windows/Fonts/times.ttf',
            'georgia' => '/Windows/Fonts/georgia.ttf',
            'verdana' => '/Windows/Fonts/verdana.ttf',
            'trebuchet_ms' => '/Windows/Fonts/trebuc.ttf',
        ];

        $fontKey = strtolower(str_replace(' ', '_', $this->font_family ?? 'arial'));
        
        if (isset($systemFonts[$fontKey]) && file_exists($systemFonts[$fontKey])) {
            return $systemFonts[$fontKey];
        }

        return null;
    }
}
