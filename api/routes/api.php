<?php



use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ItemController;

Route::get('/shopping-lists/{shoppingList}/items', [ItemController::class, 'index']);