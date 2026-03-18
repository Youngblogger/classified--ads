<?php

use App\Http\Controllers\Api\AdController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\LocationController;
use Illuminate\Support\Facades\Route;

Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/{slug}', [CategoryController::class, 'show']);
});

Route::prefix('locations')->group(function () {
    Route::get('/', [LocationController::class, 'index']);
    Route::get('/{slug}', [LocationController::class, 'show']);
});

Route::prefix('ads')->group(function () {
    Route::get('/', [AdController::class, 'index']);
    Route::get('/featured', [AdController::class, 'featured']);
    Route::get('/recent', [AdController::class, 'recent']);
    Route::get('/{slug}', [AdController::class, 'show']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/ads', [AdController::class, 'store']);
});
