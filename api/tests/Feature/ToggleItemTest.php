<?php

use App\Models\Item;
use App\Models\ShoppingList;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('marks an item as picked up', function () {
    $list = ShoppingList::factory()->create();
    $item = Item::factory()->for($list)->create();

    $this->patchJson("/api/shopping-lists/{$list->id}/items/{$item->id}", [
        'is_purchased' => true,
    ])
        ->assertOk()
        ->assertJsonPath('data.is_purchased', true);

    expect($item->refresh()->is_purchased)->toBeTrue();
});

it('puts an item back on the list', function () {
    $list = ShoppingList::factory()->create();
    $item = Item::factory()->for($list)->purchased()->create();

    $this->patchJson("/api/shopping-lists/{$list->id}/items/{$item->id}", [
        'is_purchased' => false,
    ])
        ->assertOk()
        ->assertJsonPath('data.is_purchased', false);
});

it('returns a real boolean, not a one or a zero', function () {
    $list = ShoppingList::factory()->create();
    Item::factory()->for($list)->purchased()->create();

    $response = $this->getJson("/api/shopping-lists/{$list->id}/items");

    expect($response->json('data.0.is_purchased'))->toBeTrue();
});

it('requires is_purchased', function () {
    $list = ShoppingList::factory()->create();
    $item = Item::factory()->for($list)->create();

    $this->patchJson("/api/shopping-lists/{$list->id}/items/{$item->id}", [])
        ->assertStatus(422)
        ->assertJsonValidationErrors('is_purchased');
});

it('rejects a value that is not a boolean', function () {
    $list = ShoppingList::factory()->create();
    $item = Item::factory()->for($list)->create();

    $this->patchJson("/api/shopping-lists/{$list->id}/items/{$item->id}", [
        'is_purchased' => 'maybe',
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('is_purchased');
});

it('will not update an item belonging to another list', function () {
    $mine = ShoppingList::factory()->create();
    $theirs = ShoppingList::factory()->create();
    $theirItem = Item::factory()->for($theirs)->create();

    $this->patchJson("/api/shopping-lists/{$mine->id}/items/{$theirItem->id}", [
        'is_purchased' => true,
    ])->assertNotFound();

    expect($theirItem->refresh()->is_purchased)->toBeFalse();
});

it('lists everything still to find before everything in the trolley', function () {
    $list = ShoppingList::factory()->create();
    Item::factory()->for($list)->purchased()->create(['name' => 'Found it']);
    Item::factory()->for($list)->create(['name' => 'Still looking']);

    $this->getJson("/api/shopping-lists/{$list->id}/items")
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Still looking')
        ->assertJsonPath('data.1.name', 'Found it');
});

it('counts the whole list, not the current page', function () {
    $list = ShoppingList::factory()->create();
    Item::factory()->for($list)->count(20)->create();
    Item::factory()->for($list)->purchased()->count(10)->create();

    $firstPage = $this->getJson("/api/shopping-lists/{$list->id}/items");
    $secondPage = $this->getJson("/api/shopping-lists/{$list->id}/items?page=2");

    foreach ([$firstPage, $secondPage] as $response) {
        $response->assertOk()
            ->assertJsonPath('counts.to_find', 20)
            ->assertJsonPath('counts.in_trolley', 10);
    }
});