# shopping-list-api

Laravel 13 JSON API for the shopping list. Consumed by the React app in `../web`.

## Requirements

Docker Desktop. Everything else runs in containers through Laravel Sail.

## Running it

```bash
cp .env.example .env
composer install
php artisan key:generate
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate:fresh --seeder=ShoppingListSeeder
```

The API is at `http://localhost/api`. First boot pulls images, so give it a few minutes.

Add the alias so you're not typing the full path all day:

```bash
alias sail='[ -f sail ] && sh sail || sh vendor/bin/sail'
```

**Use `sail` for everything once the containers are up.** `DB_HOST=mysql` only resolves inside the Docker network, so `php artisan migrate` on the host fails with a connection error while `sail artisan migrate` works. The two exceptions are `composer install` and `key:generate`, which run before any container exists.

## Environment

| Variable          | Value                   | Why                                                                                  |
| ----------------- | ----------------------- | ------------------------------------------------------------------------------------ |
| `DB_HOST`         | `mysql`                 | The compose service name. `127.0.0.1` points at the PHP container, not the database. |
| `APP_PORT`        | `80`                    | Change if something already owns port 80.                                            |
| `FORWARD_DB_PORT` | `3307`                  | Only needed if you already run MySQL on 3306.                                        |
| `FRONTEND_URL`    | `http://localhost:5173` | Where the SPA runs.                                                                  |

## Endpoints

All nested under a list, all scoped so an item id belonging to another list returns 404.

| Method   | Path                                      | Purpose                                 |
| -------- | ----------------------------------------- | --------------------------------------- |
| `GET`    | `/api/shopping-lists/{list}/items`        | A page of items, plus whole-list counts |
| `POST`   | `/api/shopping-lists/{list}/items`        | Add an item                             |
| `PATCH`  | `/api/shopping-lists/{list}/items/{item}` | Mark picked up or not                   |
| `DELETE` | `/api/shopping-lists/{list}/items/{item}` | Remove an item                          |

`GET` accepts `page` and `per_page`. `per_page` is validated with a maximum of 100, because an unbounded page size is a free denial of service against your own database. The default of 25 lives on the server, since the server owns the pagination contract.

The index response wraps items in Laravel's paginated envelope and adds a sibling `counts` key:

```json
{
    "data": [
        {
            "id": 1,
            "name": "Milk",
            "price_pence": 130,
            "is_purchased": false,
            "position": 0
        }
    ],
    "links": { "first": "…", "last": "…", "prev": null, "next": null },
    "meta": { "current_page": 1, "last_page": 1, "per_page": 25, "total": 1 },
    "counts": { "to_find": 1, "in_trolley": 0 }
}
```

## Structure

```
app/
  Http/
    Controllers/ItemController.php
    Requests/          validation, one per action
    Resources/         the JSON contract
  Models/
  Rules/               UniqueItemNameInList
  Services/            ItemService
```

A request flows: **route** picks the controller and applies middleware, **form request** authorises and validates and never reaches the controller if validation fails, **controller** takes validated data and returns a response, **service** holds business rules, **model** is data access, **resource** shapes the JSON.

The rule that keeps it honest: if a controller has an `if` in it that isn't about HTTP, it belongs in the service.

`ItemService` only exists because story 6 gave it something to do. Toggling `is_purchased` still writes straight from the controller, because a service that forwards one call is decoration.

## Decisions

**Money is `unsignedInteger` pence, never a float or a decimal.** Exact in the database, exact in JSON, exact in JavaScript.

**`is_purchased` has a `boolean` cast on the model.** MySQL stores it as `tinyint(1)`, so without the cast the API sends `1` and `0` while the TypeScript type claims `boolean`. There is a test for exactly this.

**Duplicate names are caught by `App\Rules\UniqueItemNameInList`, not `Rule::unique`.** The built-in rule's case sensitivity comes from the collation, which differs between MySQL and the SQLite used in tests. `LOWER(name)` behaves the same on both. It costs an index scan, which is irrelevant on a shopping list and would not be on a large table.

**Routes are grouped with `->scopeBindings()`.** Laravel otherwise resolves `{item}` against the whole table, so an item belonging to another list could be deleted by guessing its id. `RemoveItemTest` has the regression test.

**`authorize()` returns `true` on every form request.** There are no users yet. At story 10 these become real policy checks.

## Tests

```bash
sail pest
```

Feature tests hit the real routes through the container and the database, so one test exercises the route, form request, binding, controller, service and resource together. There is one unit-level concern worth naming: `ItemService` is injected through the container, so it can be swapped in a test if that becomes useful.

Tests run against SQLite in memory for speed. CI would run MySQL, which matters for the collation and boolean cast behaviour described above.

The tests worth reading first, because they guard decisions rather than features:

- `RemoveItemTest` → "will not remove an item belonging to another list"
- `AddItemTest` → "treats a differently cased or padded name as the same item"
- `ToggleItemTest` → "counts the whole list, not the current page"
- `PersistenceTest` → story 5, which has no endpoint of its own

## Formatting

```bash
sail pint
```
