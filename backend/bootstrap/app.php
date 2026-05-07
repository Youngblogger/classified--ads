<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withProviders([
        \App\Providers\EventServiceProvider::class,
    ])
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'auth.api' => \App\Http\Middleware\ApiTokenAuth::class,
            'secure.admin' => \App\Http\Middleware\SecureAdminAuth::class,
            'admin.rate' => \App\Http\Middleware\AdminRateLimiter::class,
            'admin.ip' => \App\Http\Middleware\AdminIpRestriction::class,
            'sanitize' => \App\Http\Middleware\SanitizeInput::class,
            'throttle.uploads' => \App\Http\Middleware\ThrottleUploads::class,
        ]);
        
        // Apply sanitization middleware to API routes
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
            \App\Http\Middleware\SanitizeInput::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            return new \Illuminate\Http\JsonResponse([
                'success' => false,
                'message' => 'Unauthenticated. Please login to continue.',
                'redirect' => '/login',
            ], 401);
        });
        
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            return new \Illuminate\Http\JsonResponse([
                'success' => false,
                'message' => 'Resource not found.',
            ], 404);
        });
        
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $message = config('app.debug') ? $e->getMessage() : 'An error occurred.';
                return new \Illuminate\Http\JsonResponse([
                    'success' => false,
                    'message' => $message,
                    'error' => get_class($e),
                ], 500);
            }
        });
    })->create();
