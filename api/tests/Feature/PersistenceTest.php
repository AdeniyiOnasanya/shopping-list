<?php

use App\Models\Item;
use App\Models\ShoppingList;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);


it('keeps items added during an earlier visit', function () {
    $list = ShoppingList::factory()->create();

    $this->postJson("/api/shopping-lists/{$list->id}/items", [
        'name' => 'Porridge oats',
        'price_pence' => 185,
    ])->assertCreated();

    $this->getJson("/api/shopping-lists/{$list->id}/items")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Porridge oats')
        ->assertJsonPath('data.0.price_pence', 185);
});

it('does not bring back items removed during an earlier visit', function () {
    $list = ShoppingList::factory()->create();
    $item = Item::factory()->for($list)->create(['name' => 'Washing-up liquid']);

    $this->deleteJson("/api/shopping-lists/{$list->id}/items/{$item->id}")
        ->assertNoContent();

    $this->getJson("/api/shopping-lists/{$list->id}/items")
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

it('keeps the state of the list between visits', function () {
    $list = ShoppingList::factory()->create();

    $chicken = Item::factory()->for($list)->create(['name' => 'Chicken thighs']);
    Item::factory()->for($list)->create(['name' => 'Bananas']);

    $this->patchJson("/api/shopping-lists/{$list->id}/items/{$chicken->id}", [
        'is_purchased' => true,
    ])->assertOk();

    $this->getJson("/api/shopping-lists/{$list->id}/items")
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Bananas')
        ->assertJsonPath('data.0.is_purchased', false)
        ->assertJsonPath('data.1.name', 'Chicken thighs')
        ->assertJsonPath('data.1.is_purchased', true);
});
