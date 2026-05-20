<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TodoController;
use Illuminate\Support\Facades\Route;

// Public routes (no auth required)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Protected routes (Sanctum token required)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Todos
    Route::get('/todos/stats',         [TodoController::class, 'stats']);
    Route::patch('/todos/{todo}/toggle', [TodoController::class, 'toggle']);
    Route::apiResource('/todos', TodoController::class);
});
