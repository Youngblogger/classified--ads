<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Font;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FontController extends Controller
{
    public function index()
    {
        $fonts = Font::orderBy('name')->get();
        return response()->json($fonts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'font' => 'required|file|mimes:ttf,otf|max:5120',
            'name' => 'required|string|max:255',
        ]);

        $file = $request->file('font');
        $extension = strtolower($file->getClientOriginalExtension());
        $filename = Str::uuid() . '_' . Str::slug($request->name) . '.' . $extension;
        $path = 'fonts/' . $filename;

        Storage::disk('public')->put($path, file_get_contents($file->getPathname()));

        $font = Font::create([
            'name' => $request->name,
            'filename' => $filename,
            'format' => $extension,
            'is_active' => true,
        ]);

        return response()->json($font, 201);
    }

    public function destroy(int $id)
    {
        $font = Font::findOrFail($id);
        
        $path = 'fonts/' . $font->filename;
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        $font->delete();

        return response()->json(['message' => 'Font deleted successfully']);
    }

    public function setDefault(int $id)
    {
        Font::where('is_active', true)->update(['is_active' => false]);
        
        $font = Font::findOrFail($id);
        $font->update(['is_active' => true]);

        return response()->json($font);
    }
}
