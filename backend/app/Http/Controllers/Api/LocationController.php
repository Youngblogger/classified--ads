<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::where('is_active', true)
            ->whereNull('parent_id')
            ->with(['children' => function ($query) {
                $query->where('is_active', true)->orderBy('name');
            }])
            ->orderBy('name')
            ->get()
            ->map(function ($state) {
                return [
                    'id' => $state->id,
                    'name' => $state->name,
                    'slug' => $state->slug,
                    'lgas' => $state->children->map(function ($lga) {
                        return [
                            'id' => $lga->id,
                            'name' => $lga->name
                        ];
                    })
                ];
            });

        return response()->json(['data' => $locations]);
    }

    public function show($slug)
    {
        $location = Location::where('slug', $slug)->firstOrFail();
        return response()->json(['data' => $location]);
    }
}
