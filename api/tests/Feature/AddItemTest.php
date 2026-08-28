<?php

use App\Models\Item;
use App\Models\ShoppingList;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('adds an item to the list', function () {
    $list = ShoppingList::factory()->create();

    $this->postJson("/api/shopping-lists/{$list->id}/items", [
        'name' => 'Coffee beans, 500 g',
        'price_pence' => 675,
    ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Coffee beans, 500 g')
        ->assertJsonPath('data.price_pence', 675)
        ->assertJsonStructure(['data' => ['id', 'name', 'price_pence']]);

    expect($list->items()->count())->toBe(1);
});

it('defaults the price to zero when it is left blank', function () {
    $list = ShoppingList::factory()->create();

    $this->postJson("/api/shopping-lists/{$list->id}/items", [
        'name' => 'Washing-up liquid',
        'price_pence' => '',
    ])
        ->assertCreated()
        ->assertJsonPath('data.price_pence', 0);
});

it('trims surrounding whitespace from the name', function () {
    $list = ShoppingList::factory()->create();

    $this->postJson("/api/shopping-lists/{$list->id}/items", [
        'name' => '   Bananas   ',
    ])->assertCreated();

    expect($list->items()->first()->name)->toBe('Bananas');
});

it('requires a name', function () {
    $list = ShoppingList::factory()->create();

    $this->postJson("/api/shopping-lists/{$list->id}/items", ['name' => ''])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');
});

it('rejects a name longer than 255 characters', function () {
    $list = ShoppingList::factory()->create();

    $this->postJson("/api/shopping-lists/{$list->id}/items", [
        'name' => str_repeat('a', 256),
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');
});

it('rejects a negative price', function () {
    $list = ShoppingList::factory()->create();

    $this->postJson("/api/shopping-lists/{$list->id}/items", [
        'name' => 'Bananas',
        'price_pence' => -1,
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('price_pence');
});

it('rejects a price that is not a whole number of pence', function () {
    $list = ShoppingList::factory()->create();

    $this->postJson("/api/shopping-lists/{$list->id}/items", [
        'name' => 'Bananas',
        'price_pence' => 1.5,
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('price_pence');
});

it('rejects an item already on the list', function () {
    $list = ShoppingList::factory()->create();
    Item::factory()->for($list)->create(['name' => 'Milk']);

    $this->postJson("/api/shopping-lists/{$list->id}/items", ['name' => 'Milk'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');

    expect($list->items()->count())->toBe(1);
});

it('treats a differently cased or padded name as the same item', function (string $name) {
    $list = ShoppingList::factory()->create();
    Item::factory()->for($list)->create(['name' => 'Milk']);

    $this->postJson("/api/shopping-lists/{$list->id}/items", ['name' => $name])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');
})->with(['milk', 'MILK', 'MiLk', '  Milk  ']);

it('allows the same name on a different list', function () {
    $mine = ShoppingList::factory()->create();
    $theirs = ShoppingList::factory()->create();
    Item::factory()->for($theirs)->create(['name' => 'Milk']);

    $this->postJson("/api/shopping-lists/{$mine->id}/items", ['name' => 'Milk'])
        ->assertCreated();
});

it('returns 404 for a list that does not exist', function () {
    $this->postJson('/api/shopping-lists/999/items', ['name' => 'Milk'])
        ->assertNotFound();
});