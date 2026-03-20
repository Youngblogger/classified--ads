<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = $request->user();
            if (!$user || $user->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            return $next($request);
        });
    }

    public function index()
    {
        $settings = Setting::pluck('value', 'key');
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $data = $request->all();
        
        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'updated_at' => now()]
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }

    public function getByKey($key)
    {
        $setting = Setting::where('key', $key)->first();
        return response()->json(['key' => $key, 'value' => $setting?->value]);
    }

    public function updateByKey(Request $request, $key)
    {
        $setting = Setting::updateOrCreate(
            ['key' => $key],
            ['value' => $request->value, 'updated_at' => now()]
        );

        return response()->json($setting);
    }
}
