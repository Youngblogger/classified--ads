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

        if ($response->isSuccessful()) {
            $isAuthenticated = $request->user() !== null;

            if ($isAuthenticated) {
                $response->headers->set('Cache-Control', 'private, no-cache, must-revalidate');
            } else {
                $staleWhileRevalidate = $ttlSeconds * 2;
                $staleIfError = $ttlSeconds * 4;

                $cacheControl = "{$scope}, max-age={$ttlSeconds}, s-maxage={$ttlSeconds}";
                $cacheControl .= ", stale-while-revalidate={$staleWhileRevalidate}";
                $cacheControl .= ", stale-if-error={$staleIfError}";
                $response->headers->set('Cache-Control', $cacheControl);
                $response->headers->set('Expires', gmdate('D, d M Y H:i:s', time() + $ttlSeconds) . ' GMT');
                $response->headers->set('Vary', 'Accept-Encoding, Accept-Language');

                $response->headers->set('CDN-Cache-Control', "max-age={$ttlSeconds}");
                $response->headers->set('Surrogate-Control', "max-age={$ttlSeconds}");
            }

            $response->headers->set('X-Cache-TTL', (string) $ttlSeconds);
        }

        return $response;
    }
}
