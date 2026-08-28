<?php

namespace App\Http\Requests;

use App\Models\ShoppingList;
use App\Rules\UniqueItemNameInList;
use Illuminate\Foundation\Http\FormRequest;

class StoreItemRequest extends FormRequest
{

    public const MAX_PRICE_PENCE = 1_000_000;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => is_string($this->input('name'))
                ? trim($this->input('name'))
                : $this->input('name'),
            'price_pence' => $this->filled('price_pence')
                ? $this->input('price_pence')
                : 0,
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                new UniqueItemNameInList($this->shoppingList()),
            ],
            'price_pence' => ['integer', 'min:0', 'max:' . self::MAX_PRICE_PENCE],
        ];
    }

    public function shoppingList(): ShoppingList
    {
        return $this->route('shoppingList');
    }
}
