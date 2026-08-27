<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ShoppingList;
use App\Models\Item;

class ShoppingListSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $list = ShoppingList::factory()->create();

       collect([
        'Milk' => 100,
        'Bread' => 76,
        'Grapes' => 367,
        'Beans' => 234,
        'Rice' => 300,
        'Olive' => 400,
        
        ])->each(fn (int $pence, string $name) => Item::factory()->create([
        'shopping_list_id' => $list->id,
        'name' => $name,
        'price_pence' => $pence,
        ]));

    Item::factory()->count(30)->create(['shopping_list_id' => $list->id]);

    }
}
