<?php

namespace App\Services;

class ReviewerNameUtility
{
    private const PLACEHOLDERS = [
        'user',
        'anonymous',
        'anonymous user',
        'guest',
        'null',
        'undefined',
        'test',
        'admin',
        'unknown',
    ];

    public static function normalize(?string $name): string
    {
        if ($name === null || $name === '') {
            return 'Anonymous User';
        }

        // 1. Strip HTML/script tags (XSS prevention)
        $name = strip_tags($name);

        // 2. Remove invisible unicode / control characters (except normal space)
        $name = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $name);
        $name = preg_replace('/[\x{80}-\x{9F}\x{AD}\x{200B}-\x{200F}\x{2028}-\x{202F}\x{FEFF}]/u', '', $name);

        // 3. Trim whitespace
        $name = trim($name);

        // 4. Collapse repeated spaces
        $name = preg_replace('/\s+/', ' ', $name);

        if ($name === '' || $name === ' ') {
            return 'Anonymous User';
        }

        if (self::isPlaceholderName($name)) {
            return 'Anonymous User';
        }

        if (self::isUuidLike($name)) {
            return 'Anonymous User';
        }

        // Length checks
        if (mb_strlen($name) < 2 || mb_strlen($name) > 30) {
            return 'Anonymous User';
        }

        return $name;
    }

    public static function isPlaceholderName(?string $name): bool
    {
        if ($name === null) return true;

        $trimmed = trim(mb_strtolower($name));

        if ($trimmed === '') return true;

        if (in_array($trimmed, self::PLACEHOLDERS, true)) return true;

        return false;
    }

    public static function isUuidLike(?string $value): bool
    {
        if ($value === null) return false;

        // Standard UUID
        if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $value)) {
            return true;
        }

        // UUID without dashes
        if (preg_match('/^[0-9a-f]{32}$/i', $value)) {
            return true;
        }

        return false;
    }
}
