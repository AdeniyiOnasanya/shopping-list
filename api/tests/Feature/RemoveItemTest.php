<?php

use App\Models\Item;
use App\Models\ShoppingList;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('removes an item from the list', function () {
    $list = ShoppingList::factory()->create();
    $item = Item::factory()->for($list)->create();

    $this->deleteJson("/api/shopping-lists/{$list->id}/items/{$item->id}")
        ->assertNoContent();

    expect(Item::find($item->id))->toBeNull();
});

it('leaves the other items alone', function () {
    $list = ShoppingList::factory()->create();
    $doomed = Item::factory()->for($list)->create();
    Item::factory()->for($list)->count(3)->create();

    $this->deleteJson("/api/shopping-lists/{$list->id}/items/{$doomed->id}")
        ->assertNoContent();

    expect($list->items()->count())->toBe(3);
});

it('will not remove an item belonging to another list', function () {
    $mine = ShoppingList::factory()->create();
    $theirs = ShoppingList::factory()->create();
    $theirItem = Item::factory()->for($theirs)->create();

    $this->deleteJson("/api/shopping-lists/{$mine->id}/items/{$theirItem->id}")
        ->assertNotFound();

    expect(Item::find($theirItem->id))->not->toBeNull();
});

it('returns 404 for an item that does not exist', function () {
    $list = ShoppingList::factory()->create();

    $this->deleteJson("/api/shopping-lists/{$list->id}/items/999")
        ->assertNotFound();
});

it('returns 404 for a list that does not exist', function () {
    $item = Item::factory()->create();

    $this->deleteJson("/api/shopping-lists/999/items/{$item->id}")
        ->assertNotFound();
});