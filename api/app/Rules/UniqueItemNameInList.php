<?php

namespace App\Rules;

use Closure;
use App\Models\ShoppingList;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class UniqueItemNameInList implements ValidationRule
{

    public function __construct(private readonly ShoppingList $list)
    {
    }
    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
         if (! is_string($value)) {
            return;
        }

        $alreadyOnList = $this->list->items()
            ->whereRaw('LOWER(name) = ?', [mb_strtolower(trim($value))])
            ->exists();

        if ($alreadyOnList) {
            $fail('That item is already on your list.');
        }
    }
}
