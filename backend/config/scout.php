<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Meilisearch Driver
    |--------------------------------------------------------------------------
    |
    | Scout is not used as the primary driver. Instead, MeiliSearchService
    | provides a direct Meilisearch integration with DB fallback.
    | This config is for the Meilisearch client used by that service.
    |
    */

    'meilisearch' => [
        'host' => env('MEILISEARCH_HOST', 'http://127.0.0.1:7700'),
        'key' => env('MEILISEARCH_KEY', ''),
        'index' => env('MEILISEARCH_INDEX', 'ads'),
    ],

];
