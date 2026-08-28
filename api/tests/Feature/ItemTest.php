<?php

use App\Models\Item;
use App\Models\ShoppingList;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns a page of items', function () {
    $list = ShoppingList::factory()
        ->has(Item::factory()->count(30))
        ->create();

    $this->getJson("/api/shopping-lists/{$list->id}/items")
        ->assertOk()
        ->assertJsonCount(25, 'data')
        ->assertJsonPath('meta.total', 30)
        ->assertJsonStructure([
            'data' => [['id', 'name', 'price_pence']],
            'links' => ['first', 'last', 'prev', 'next'],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
});

it('returns the second page', function () {
    $list = ShoppingList::factory()
        ->has(Item::factory()->count(30))
        ->create();

    $this->getJson("/api/shopping-lists/{$list->id}/items?page=2")
        ->assertOk()
        ->assertJsonCount(5, 'data')
        ->assertJsonPath('meta.current_page', 2);
});

it('returns an empty page when the list has no items', function () {
    $list = ShoppingList::factory()->create();

    $this->getJson("/api/shopping-lists/{$list->id}/items")
        ->assertOk()
        ->assertJsonCount(0, 'data')
        ->assertJsonPath('meta.total', 0);
});

it('rejects a per_page above the cap', function () {
    $list = ShoppingList::factory()->create();

    $this->getJson("/api/shopping-lists/{$list->id}/items?per_page=100000")
        ->assertStatus(422)
        ->assertJsonValidationErrors('per_page');
});

it('rejects a per_page below one', function () {
    $list = ShoppingList::factory()->create();

    $this->getJson("/api/shopping-lists/{$list->id}/items?per_page=0")
        ->assertStatus(422)
        ->assertJsonValidationErrors('per_page');
});

it('honours a valid per_page', function () {
    $list = ShoppingList::factory()
        ->has(Item::factory()->count(10))
        ->create();

    $this->getJson("/api/shopping-lists/{$list->id}/items?per_page=4")
        ->assertOk()
        ->assertJsonCount(4, 'data')
        ->assertJsonPath('meta.per_page', 4);
});

it('does not return items belonging to another list', function () {
    $list = ShoppingList::factory()->has(Item::factory()->count(2))->create();
    ShoppingList::factory()->has(Item::factory()->count(5))->create();

    $this->getJson("/api/shopping-lists/{$list->id}/items")
        ->assertOk()
        ->assertJsonPath('meta.total', 2);
});

it('returns 404 for a list that does not exist', function () {
    $this->getJson('/api/shopping-lists/999/items')->assertNotFound();
});