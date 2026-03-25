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
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
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
