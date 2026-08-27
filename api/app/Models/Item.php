<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Item extends Model
{
   use HasFactory;

    protected $fillable = [
        'name',
        'price_pence',
    ];

     public function ShoppingList(): BelongsTo
     {
        return $this->belongsTo(ShoppingList::class);
     }
}
