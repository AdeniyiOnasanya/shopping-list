<?php

namespace App\Http\Controllers;

use App\Http\Requests\ItemIndexRequest;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Http\Resources\ItemResource;
use App\Models\Item;
use App\Models\ShoppingList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as Status;

class ItemController extends Controller
{
public function index(
    ItemIndexRequest $request,
    ShoppingList $shoppingList,
): AnonymousResourceCollection {
    // Falls back to 15 per page if not passed in the request
    $perPage = $request->integer('per_page', 15);

    $items = $shoppingList->items()
        ->orderBy('is_purchased')
        ->orderBy('id')
        ->paginate($perPage);

    return ItemResource::collection($items)->additional([
        'counts' => [
            'to_find' => $shoppingList->items()->where('is_purchased', false)->count(),
            'in_trolley' => $shoppingList->items()->where('is_purchased', true)->count(),
        ],
    ]);
}

    public function store(
        StoreItemRequest $request,
        ShoppingList $shoppingList,
    ): JsonResponse {
        $item = $shoppingList->items()->create($request->validated());

        return ItemResource::make($item)
            ->response()
            ->setStatusCode(Status::HTTP_CREATED);
    }

    public function update(
        UpdateItemRequest $request,
        ShoppingList $shoppingList,
        Item $item,
    ): ItemResource {
        $item->update($request->validated());

        return ItemResource::make($item);
    }

    public function destroy(ShoppingList $shoppingList, Item $item): Response
    {
        $item->delete();

        return response()->noContent();
    }
}