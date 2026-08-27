<?php

namespace App\Http\Controllers;

use App\Http\Requests\ItemIndexRequest;
use App\Http\Resources\ItemResource;
use App\Models\ShoppingList;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ItemController extends Controller
{
    public function index(ItemIndexRequest $request, ShoppingList $shoppingList): AnonymousResourceCollection
    {
        return ItemResource::collection(
            $shoppingList->items()->paginate($request->perPage())
        );
    }
}
