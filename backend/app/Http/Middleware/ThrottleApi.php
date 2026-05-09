<?php

namespace App\Http\Middleware;

use App\Services\AntiAbuseService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ThrottleApi
{
    public function handle(Request $request, Closure $next): Response
    {
        $antiAbuse = app(AntiAbuseService::class);

        if ($antiAbuse->checkBotActivity()) {
            return response()->json([
                'success' => false,
                'message' => 'Too many requests. Please slow down.',
            ], 429);
        }

        return $next($request);
    }
}
