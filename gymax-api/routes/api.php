<?php

use App\Http\Controllers\Admin\CommentController as AdminCommentController;
use App\Http\Controllers\Admin\ExerciseController as AdminExerciseController;
use App\Http\Controllers\Admin\MuscleController as AdminMuscleController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\PlanController as AdminPlanController;
use App\Http\Controllers\Admin\PlanRequestController as AdminPlanRequestController;
use App\Http\Controllers\Admin\RewardController as AdminRewardController;
use App\Http\Controllers\Admin\RewardOrderController as AdminRewardOrderController;
use App\Http\Controllers\Admin\SportController as AdminSportController;
use App\Http\Controllers\Admin\UploadController as AdminUploadController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BmiController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PlanRequestController;
use App\Http\Controllers\RewardController;
use App\Http\Controllers\SportController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| عمومی (بدون لاگین)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/sports', [SportController::class, 'index']);
Route::get('/sports/{sport:slug}', [SportController::class, 'show']);
Route::get('/exercises/{exercise}', [ExerciseController::class, 'show']);
Route::get('/exercises/{exercise}/comments', [CommentController::class, 'index']);
Route::post('/bmi', [BmiController::class, 'calculate']);
Route::get('/subscription-plans', [SubscriptionController::class, 'plans']);
Route::get('/rewards', [RewardController::class, 'index']);

// پخش فایل ویدیو: فقط با لینک امضاشده‌ای که /exercises/{id}/video به مشترک‌ها می‌ده
Route::get('/exercises/{exercise}/stream', [ExerciseController::class, 'stream'])
    ->name('exercises.stream')
    ->middleware('signed');

/*
|--------------------------------------------------------------------------
| کاربر لاگین‌کرده
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/exercises/{exercise}/video', [ExerciseController::class, 'video']);
    Route::post('/exercises/{exercise}/comments', [CommentController::class, 'store']);

    Route::get('/subscription', [SubscriptionController::class, 'show']);
    Route::post('/subscription/checkout', [SubscriptionController::class, 'checkout']);

    Route::get('/plan-requests', [PlanRequestController::class, 'index']);
    Route::post('/plan-requests', [PlanRequestController::class, 'store']);

    Route::get('/plans', [PlanController::class, 'index']);
    Route::post('/plan-items/{planItem}/complete', [PlanController::class, 'complete']);
    Route::get('/xp', [PlanController::class, 'xp']);

    Route::post('/rewards/{reward}/redeem', [RewardController::class, 'redeem']);
    Route::get('/reward-orders', [RewardController::class, 'orders']);
});

/*
|--------------------------------------------------------------------------
| فقط ادمین
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', EnsureUserIsAdmin::class])->prefix('admin')->group(function () {
    Route::get('/ping', fn () => response()->json(['message' => 'admin ok']));

    Route::post('/sports', [AdminSportController::class, 'store']);
    Route::put('/sports/{sport}', [AdminSportController::class, 'update']);
    Route::delete('/sports/{sport}', [AdminSportController::class, 'destroy']);

    Route::get('/muscles', [AdminMuscleController::class, 'index']);
    Route::post('/muscles', [AdminMuscleController::class, 'store']);

    Route::get('/exercises', [AdminExerciseController::class, 'index']);
    Route::get('/exercises/{exercise}', [AdminExerciseController::class, 'show']);
    Route::post('/exercises', [AdminExerciseController::class, 'store']);
    Route::put('/exercises/{exercise}', [AdminExerciseController::class, 'update']);
    Route::delete('/exercises/{exercise}', [AdminExerciseController::class, 'destroy']);
    Route::post('/upload/video', [AdminUploadController::class, 'video']);

    Route::get('/plan-requests', [AdminPlanRequestController::class, 'index']);
    Route::get('/plan-requests/{planRequest}', [AdminPlanRequestController::class, 'show']);
    Route::post('/plan-requests/{planRequest}/plan', [AdminPlanController::class, 'store']);

    Route::get('/comments', [AdminCommentController::class, 'index']);
    Route::post('/comments/{comment}/reply', [AdminCommentController::class, 'reply']);
    Route::delete('/comments/{comment}', [AdminCommentController::class, 'destroy']);

    Route::get('/users', [AdminUserController::class, 'index']);
    Route::put('/users/{user}/role', [AdminUserController::class, 'updateRole']);

    Route::get('/rewards', [AdminRewardController::class, 'index']);
    Route::post('/rewards', [AdminRewardController::class, 'store']);
    Route::put('/rewards/{reward}', [AdminRewardController::class, 'update']);
    Route::delete('/rewards/{reward}', [AdminRewardController::class, 'destroy']);

    Route::get('/reward-orders', [AdminRewardOrderController::class, 'index']);
    Route::put('/reward-orders/{rewardOrder}', [AdminRewardOrderController::class, 'update']);

    Route::get('/payments', [AdminPaymentController::class, 'index']);
});
