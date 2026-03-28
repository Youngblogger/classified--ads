<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Ad;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = $request->user()
            ->favorites()
            ->with(['ad.images', 'ad.user', 'ad.location'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($favorites);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ad_id' => 'required|exists:ads,id',
        ]);

        $user = $request->user();
        
        $exists = Favorite::where('user_id', $user->id)
            ->where('ad_id', $validated['ad_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Already favorited'], 400);
        }

        $favorite = Favorite::create([
            'user_id' => $user->id,
            'ad_id' => $validated['ad_id'],
        ]);

        // Send notification to ad owner
        $ad = Ad::with('user')->find($validated['ad_id']);
        if ($ad && $ad->user_id !== $user->id) {
            NotificationService::newFavorite($ad, $user);
        }

        return response()->json(['message' => 'Added to favorites', 'favorite' => $favorite], 201);
    }

    public function destroy(Request $request, $adId)
    {
        $user = $request->user();
        
        $favorite = Favorite::where('user_id', $user->id)
            ->where('ad_id', $adId)
            ->first();

        if (!$favorite) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $favorite->delete();

        return response()->json(['message' => 'Removed from favorites']);
    }

    public function check(Request $request, $adId)
    {
        $isFavorite = Favorite::where('user_id', $request->user()->id)
            ->where('ad_id', $adId)
            ->exists();

        return response()->json(['is_favorite' => $isFavorite]);
    }
}
