<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\CenterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DownloadSupportCasesController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\GuideImageController;
use App\Http\Controllers\SupportCaseController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::middleware('admin')->group(function () {
        Route::get('activity', ActivityLogController::class)->name('activity.index');
        Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
        Route::post('users', [UserManagementController::class, 'store'])->name('users.store');
        Route::put('users/{user}', [UserManagementController::class, 'update'])->name('users.update');
    });

    Route::resource('centers', CenterController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::middleware('technician')->group(function () {
        Route::post('drivers/import', [DriverController::class, 'import'])->name('drivers.import');
        Route::resource('drivers', DriverController::class)->only(['index', 'store', 'update', 'destroy']);
    });
    Route::resource('guides', GuideController::class);
    Route::get('guide-images/{guideImage}', GuideImageController::class)->name('guide-images.show');

    Route::get('support-cases/download', DownloadSupportCasesController::class)->name('support-cases.download');
    Route::get('support-cases/similar', [SupportCaseController::class, 'similar'])->name('support-cases.similar');

    Route::resource('support-cases', SupportCaseController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
