<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    public function handle(Request $request, Closure $next): Response
    {
        // Sanitize all input data
        $this->sanitizeInput($request);

        $response = $next($request);

        // Add security headers
        return $this->addSecurityHeaders($response);
    }

    protected function sanitizeInput(Request $request): void
    {
        $input = $request->all();
        
        array_walk_recursive($input, function (&$value) {
            if (is_string($value)) {
                // Remove null bytes
                $value = str_replace("\0", '', $value);
                
                // Trim whitespace
                $value = trim($value);
                
                // Encode HTML entities for XSS prevention
                // Note: This is a basic sanitization. For stricter XSS protection,
                // consider using a library like HTML Purifier
                $value = htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            }
        });

        // Replace the input with sanitized values
        $request->replace($input);
    }

    protected function addSecurityHeaders(Response $response): Response
    {
        // Prevent MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        
        // Prevent clickjacking
        $response->headers->set('X-Frame-Options', 'DENY');
        
        // XSS Protection (for older browsers)
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        
        // Strict Transport Security (HTTPS only)
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        
        // Referrer Policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Content Security Policy
        $response->headers->set(
            'Content-Security-Policy',
            "default-src 'self'; " .
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " .
            "style-src 'self' 'unsafe-inline'; " .
            "img-src 'self' data: https:; " .
            "font-src 'self' data:; " .
            "connect-src 'self' https:; " .
            "frame-ancestors 'none';"
        );

        return $response;
    }
}
