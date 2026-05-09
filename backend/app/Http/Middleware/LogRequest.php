<?php

namespace App\Http\Middleware;

use App\Services\MonitoringService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);

        $response = $next($request);

        $duration = (microtime(true) - $start) * 1000;

        if (app()->bound(MonitoringService::class)) {
            $monitoring = app(MonitoringService::class);
            $monitoring->recordRequest(
                $request->method(),
                $request->path(),
                $response->getStatusCode(),
                $duration
            );
        }

        return $response;
    }
}
