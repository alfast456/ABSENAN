<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/face/register', [AuthController::class, 'registerFace']);

    Route::post('/attendance/checkin', [AttendanceController::class, 'checkin']);
    Route::post('/attendance/checkout', [AttendanceController::class, 'checkout']);
    Route::get('/attendance/history', [AttendanceController::class, 'history']);
    Route::post('/attendance/request', [AttendanceController::class, 'submitRequest']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
