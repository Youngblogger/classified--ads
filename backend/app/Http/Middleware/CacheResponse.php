<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CacheResponse
{
    public function handle(Request $request, Closure $next, mixed $ttl = 300, string $scope = 'public'): Response
    {
        $ttlSeconds = (int) $ttl;
        $response = $next($request);

        if ($response->isSuccessful() && !$request->user()) {
            $response->headers->set('Cache-Control', "{$scope}, max-age={$ttlSeconds}, s-maxage={$ttlSeconds}");
            $response->headers->set('Expires', gmdate('D, d M Y H:i:s', time() + $ttlSeconds) . ' GMT');
            $response->headers->set('Vary', 'Accept-Encoding, Accept-Language');
        }

        return $response;
    }
}
