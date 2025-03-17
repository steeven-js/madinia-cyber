<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FirebaseTestController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Route pour tester la connexion Firebase
    Route::get('firebase-test', [FirebaseTestController::class, 'testConnection'])
        ->name('firebase.test');

    // Route pour lister les utilisateurs Firebase
    Route::get('firebase-users', [FirebaseTestController::class, 'listUsers'])
        ->name('firebase.users');

    // Route pour attribuer un rôle à un utilisateur Firebase
    Route::post('firebase-users/set-role', [FirebaseTestController::class, 'setUserRole'])
        ->name('firebase.users.set-role');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
