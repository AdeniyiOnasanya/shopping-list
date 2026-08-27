<?php

namespace Database\Factories;

use App\Models\Item;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\ShoppingList;

/**
 * @extends Factory<Item>
 */
class ItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'shopping_list_id' => ShoppingList::factory(),
            'name' => fake()->randomElement([
                'Milk', 'Bread', 'Eggs', 'Banana', 'Rice', 'Grapes'
            ]),
            'price_pence' => fake()->numberBetween(50,900),
        ];
    }
}
