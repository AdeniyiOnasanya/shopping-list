<?php

namespace App\Http\Controllers;

use App\Http\Requests\ItemIndexRequest;
use App\Http\Requests\StoreItemRequest;
use App\Http\Resources\ItemResource;
use App\Models\ShoppingList;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class ItemController extends Controller
{
    public function index(ItemIndexRequest $request, ShoppingList $shoppingList): AnonymousResourceCollection
    {
        return ItemResource::collection(
            $shoppingList->items()->paginate($request->perPage())
        );
    }

    public function store(StoreItemRequest $request, ShoppingList $shoppingList): JsonResponse
    {
        $item = $shoppingList->items()->create($request->validated());

        return ItemResource::make($item)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function destroy(ShoppingList $shoppingList, Item $item): Response
    {
        $item->delete();

        return response()->noContent();
    }

}