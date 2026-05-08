<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;

class ApiTokenAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please provide a valid token.',
            ], 401);
        }
        
        $accessToken = PersonalAccessToken::findToken($token);
        
        if (!$accessToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token.',
            ], 401);
        }
        
        // Check token expiration
        if ($accessToken->expires_at && Carbon::parse($accessToken->expires_at)->isPast()) {
            $accessToken->delete();
            return response()->json([
                'success' => false,
                'message' => 'Token has expired. Please login again.',
            ], 401);
        }
        
        $user = $accessToken->tokenable;
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 401);
        }
        
        if ($user->banned_at || $user->suspended_at) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been suspended or banned.',
            ], 403);
        }
        
        // Update last used timestamp to track activity
        $accessToken->last_used_at = Carbon::now();
        $accessToken->save();
        
        $request->setUserResolver(function () use ($user) {
            return $user;
        });
        
        return $next($request);
    }
}
