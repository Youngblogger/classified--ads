<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\Sanctum;

class AuthController extends Controller
{
    public function __construct(
        private OtpService $otpService
    ) {}
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        if (!Auth::attempt([$loginField => $request->login, 'password' => $request->password])) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();
        
        // Check if user's email is verified (skip for admin users)
        $isVerified = $user->role === 'admin' || $user->isEmailVerified();
        
        // If not verified, generate OTP and require verification
        if (!$isVerified) {
            // Generate OTP for unverified users trying to login
            $otpData = $this->otpService->createOrUpdateVerification($user);
            
            try {
                $this->otpService->sendOtpEmail($user, $otpData['otp']);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('OTP email failed: ' . $e->getMessage());
            }
            
            // Return requires_verification flag
            return response()->json([
                'message' => 'Please verify your email to continue.',
                'requires_verification' => true,
                'email' => $user->email,
                'user_id' => $user->id,
                'expires_at' => $otpData['expires_at']->toIso8601String(),
            ], 200);
        }

        // Check if user is banned/suspended
        if ($user->status === 'banned' || $user->status === 'suspended') {
            Auth::logout();
            return response()->json([
                'message' => 'Your account has been ' . $user->status . '.',
                'code' => 'account_' . $user->status,
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar,
                'google_avatar' => $user->google_avatar,
                'facebook_avatar' => $user->facebook_avatar,
                'role' => $user->role,
                'status' => $user->status,
                'verified' => $user->verified,
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'location' => 'nullable|string|max:255',
            'location_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        
        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('phone')) {
            $user->phone = $request->phone;
        }
        if ($request->has('location')) {
            $user->location = $request->location;
        }
        if ($request->has('location_id')) {
            $user->location_id = $request->location_id;
        }
        $user->save();

        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }

    public function updateAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        try {
            $user = $request->user();
            
            if ($request->hasFile('avatar')) {
                $file = $request->file('avatar');
                $filename = 'avatars/' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
                
                // Store in public disk
                $path = $file->storeAs('avatars', $user->id . '_' . time() . '.' . $file->getClientOriginalExtension(), 'public');
                $avatarUrl = '/storage/' . $path;
                
                $user->update(['avatar' => $avatarUrl]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Avatar updated successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'avatar_url' => $user->avatar,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload avatar: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Current password is incorrect'], 400);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['success' => true, 'message' => 'Password changed successfully']);
    }

    public function deleteAccount(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
            'confirm' => 'required|string|in:DELETE',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Please confirm account deletion'], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Incorrect password'], 400);
        }

        // Delete user's ads with images
        foreach ($user->ads as $ad) {
            foreach ($ad->images as $image) {
                if ($image->url && file_exists(public_path($image->url))) {
                    unlink(public_path($image->url));
                }
            }
            $ad->images()->delete();
            $ad->favorites()->delete();
            $ad->reports()->delete();
            $ad->delete();
        }

        // Delete user's favorites
        $user->favorites()->delete();

        // Delete user's conversations and messages
        $user->conversations()->delete();

        // Delete user's reviews
        $user->givenReviews()->delete();
        $user->receivedReviews()->delete();

        // Delete user's notifications
        $user->notifications()->delete();

        // Delete user's wallet if exists
        if ($user->wallet) {
            $user->wallet->delete();
        }

        // Delete email verification
        if ($user->emailVerification) {
            $user->emailVerification->delete();
        }

        // Delete user's tokens
        $user->tokens()->delete();

        // Delete the user
        $user->delete();

        return response()->json(['success' => true, 'message' => 'Account deleted successfully']);
    }

    public function google(Request $request)
    {
        $googleClientId = config('services.google.client_id');
        $googleClientSecret = config('services.google.client_secret');
        $appUrl = env('APP_URL', 'http://localhost:3000');

        if (!$googleClientId) {
            return response()->json(['message' => 'Google OAuth not configured'], 500);
        }

        // GET request - return redirect URL
        if ($request->isMethod('GET')) {
            $redirectUri = rtrim($appUrl, '/') . '/auth/google/callback';
            $state = bin2hex(random_bytes(16));
            
            session(['google_oauth_state' => $state]);
            
            $params = http_build_query([
                'client_id' => $googleClientId,
                'redirect_uri' => $redirectUri,
                'response_type' => 'code',
                'scope' => 'openid email profile',
                'access_type' => 'online',
                'state' => $state,
            ]);

            $url = 'https://accounts.google.com/o/oauth2/auth?' . $params;

            return response()->json(['url' => $url]);
        }

        // POST request - handle callback with authorization code
        $code = $request->input('code');
        $error = $request->input('error');

        $callbackUrl = rtrim($appUrl, '/') . '/auth/google/callback';

        if ($error) {
            return response()->json(['message' => $error], 400);
        }

        if (!$code) {
            return response()->json(['message' => 'Authorization code required'], 400);
        }

        // Exchange code for tokens
        $client = new \GuzzleHttp\Client();
        $redirectUri = $callbackUrl;

        try {
            $response = $client->post('https://oauth2.googleapis.com/token', [
                'form_params' => [
                    'client_id' => $googleClientId,
                    'client_secret' => $googleClientSecret,
                    'code' => $code,
                    'grant_type' => 'authorization_code',
                    'redirect_uri' => $redirectUri,
                ]
            ]);

            $tokenData = json_decode($response->getBody()->getContents(), true);
            $accessToken = $tokenData['access_token'];

            // Get user info from Google
            $userResponse = $client->get('https://www.googleapis.com/oauth2/v2/userinfo', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ]
            ]);

            $googleUser = json_decode($userResponse->getBody()->getContents(), true);

            // Find or create user
            $user = User::where('email', $googleUser['email'])->first();
            $googleAvatar = $googleUser['picture'] ?? null;

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser['name'] ?? 'Google User',
                    'email' => $googleUser['email'],
                    'password' => Hash::make(bin2hex(random_bytes(16))),
                    'google_avatar' => $googleAvatar,
                ]);
            } else {
                // Update Google avatar if changed
                if ($googleAvatar && $user->google_avatar !== $googleAvatar) {
                    $user->update(['google_avatar' => $googleAvatar]);
                }
            }

            $token = $user->createToken('google_token')->plainTextToken;

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'google_avatar' => $user->google_avatar,
                    'avatar' => $user->avatar,
                    'avatar_url' => $user->avatar,
                ],
                'token' => $token,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Google OAuth failed: ' . $e->getMessage()], 401);
        }
    }

    public function facebook(Request $request)
    {
        $facebookClientId = config('services.facebook.client_id');
        $facebookClientSecret = config('services.facebook.client_secret');
        $appUrl = env('APP_URL', 'http://localhost:3000');

        if (!$facebookClientId) {
            return response()->json(['message' => 'Facebook OAuth not configured'], 500);
        }

        // GET request - return redirect URL
        if ($request->isMethod('GET')) {
            $redirectUri = rtrim($appUrl, '/') . '/auth/facebook/callback';
            $state = bin2hex(random_bytes(16));
            
            session(['facebook_oauth_state' => $state]);
            
            $params = http_build_query([
                'client_id' => $facebookClientId,
                'redirect_uri' => $redirectUri,
                'response_type' => 'code',
                'scope' => 'email,public_profile',
                'state' => $state,
            ]);

            $url = 'https://www.facebook.com/v18.0/dialog/oauth?' . $params;

            return response()->json(['url' => $url]);
        }

        // POST request - handle callback with authorization code
        $code = $request->input('code');
        $error = $request->input('error');

        $callbackUrl = rtrim($appUrl, '/') . '/auth/facebook/callback';

        if ($error) {
            return response()->json(['message' => $error], 400);
        }

        if (!$code) {
            return response()->json(['message' => 'Authorization code required'], 400);
        }

        // Exchange code for tokens
        $client = new \GuzzleHttp\Client();
        $redirectUri = $callbackUrl;

        try {
            // Exchange code for access token
            $response = $client->post('https://graph.facebook.com/v18.0/oauth/access_token', [
                'query' => [
                    'client_id' => $facebookClientId,
                    'client_secret' => $facebookClientSecret,
                    'code' => $code,
                    'redirect_uri' => $redirectUri,
                ]
            ]);

            $tokenData = json_decode($response->getBody()->getContents(), true);
            $accessToken = $tokenData['access_token'] ?? null;

            if (!$accessToken) {
                return response()->json(['message' => 'Failed to get access token from Facebook'], 400);
            }

            // Get user info from Facebook
            $userResponse = $client->get('https://graph.facebook.com/me', [
                'query' => [
                    'fields' => 'id,name,email,picture',
                    'access_token' => $accessToken,
                ]
            ]);

            $facebookUser = json_decode($userResponse->getBody()->getContents(), true);

            if (!isset($facebookUser['email'])) {
                return response()->json(['message' => 'Email permission required'], 400);
            }

            // Find or create user
            $user = User::where('email', $facebookUser['email'])->first();
            $facebookAvatar = $facebookUser['picture']['data']['url'] ?? null;

            if (!$user) {
                $user = User::create([
                    'name' => $facebookUser['name'] ?? 'Facebook User',
                    'email' => $facebookUser['email'],
                    'password' => Hash::make(bin2hex(random_bytes(16))),
                    'facebook_avatar' => $facebookAvatar,
                ]);
            } else {
                // Update Facebook avatar if changed
                if ($facebookAvatar && $user->facebook_avatar !== $facebookAvatar) {
                    $user->update(['facebook_avatar' => $facebookAvatar]);
                }
            }

            $token = $user->createToken('facebook_token')->plainTextToken;

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'facebook_avatar' => $user->facebook_avatar,
                    'avatar' => $user->avatar,
                    'avatar_url' => $user->avatar,
                ],
                'token' => $token,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Facebook OAuth failed: ' . $e->getMessage()], 401);
        }
    }
}
