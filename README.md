# Shopping list

A shopping list that tracks what you need, what you've picked up, and whether you're still inside your budget.

Built for the Mayden developer coding challenge.

- `api/` — Laravel 13 JSON API (PHP, MySQL, Sanctum, Pest)
- `web/` — React 19 single-page app (TypeScript, Vite, Tailwind 4, Vitest)

## Running it

You need Docker Desktop and Node 20 or newer.

```bash
# API
cd api
cp .env.example .env
composer install
php artisan key:generate
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate --seed
```

```bash
# Web, in a second terminal
cd web
cp .env.example .env
npm install
npm run dev
```

|     |                       |
| --- | --------------------- |
| App | http://localhost:5173 |
| API | http://localhost/api  |

The seeder creates one list with a few groceries on it.

## Tests

```bash
cd api && ./vendor/bin/sail pest
cd web && npm test
```

## Stories covered

| #   | Story                  | Notes                                                |
| --- | ---------------------- | ---------------------------------------------------- |
| 1   | View the list          | Paginated, 25 per page                               |
| 2   | Add items              | Rejects duplicates, case- and whitespace-insensitive |
| 3   | Remove items           | Confirmation dialog, optimistic with rollback        |
| 4   | Cross items off        | Two sections, whole-list counts                      |
| 5   | Persist between visits | Server-side in MySQL                                 |
| 6   | Reorder                | Up and down arrows                                   |

Stories 7 to 10 (total, budget, email, accounts) are not built. See "What I'd do next".

## Decisions worth knowing

**Money is stored as an integer number of pence.** Never a float. `0.1 + 0.2` is not `0.3` in binary floating point, and story 7 sums these. Integers are exact everywhere in the stack, including JavaScript, which has no decimal type at all. Conversion happens once, in `web/src/lib/money.ts`, where a comment explains why the rounding is there.

**Duplicate detection is a custom validation rule, not `Rule::unique`.** The built-in rule generates `WHERE name = ?`, and whether that is case-sensitive depends on the database collation: MySQL's default is not, SQLite's is. Tests run on SQLite and the app runs on MySQL, so the built-in rule would behave differently in each. `app/Rules/UniqueItemNameInList.php` compares on `LOWER(name)`, which is the same on both.

**Nested routes use scoped bindings.** Without them, `DELETE /shopping-lists/1/items/7` resolves item 7 from the whole table and deletes it even when it belongs to a different list. `->scopeBindings()` resolves through the relationship instead. There's a test for it in `RemoveItemTest`.

**Items sort unpurchased first, then by position.** That is what keeps the two sections coherent across pages: without it, page 1 could be entirely ticked and page 2 entirely unticked, and the headings would misrepresent the rest of the list.

**Section counts are whole-list figures, not page figures.** Two extra `COUNT` queries per request, which is the honest price of "still to find · 4" being true on every page.

**A service layer exists only where there is a rule to hold.** `ItemService` arrived at story 6, because assigning the next position and swapping neighbours is real work. Toggling a boolean still writes straight from the controller, because wrapping it would be ceremony. Knowing when not to add a layer matters as much as knowing how.

**Optimistic updates are used selectively.** Removing and ticking are optimistic with rollback, because they happen often and need to feel instant while you're walking round a shop. Adding and reordering are not: a created row needs a server-assigned id, and a reordered item's neighbour may be on a page the client hasn't loaded. Optimism hides latency where latency hurts; it isn't a default.

**Tests run on SQLite in memory for speed.** CI would run MySQL. One test in `ToggleItemTest` asserts `is_purchased` comes back as `true` rather than `1`, which is the difference the model cast makes and the kind of thing that only shows up on MySQL.

## What I'd do next

**Stories 7 and 8, the total and the budget.** Nearest to done: `budget_pence` is already on the `shopping_lists` table and every price is already an integer. The total should be computed server-side and returned alongside the paginated items, since summing a page would give the wrong answer.

**Story 9, sharing by email.** Sail already runs Mailpit, so the mail side is one config change and a mailable.

**Story 10, accounts.** `user_id` on `shopping_lists`, Sanctum in SPA cookie mode, and the `authorize()` methods on the form requests become real policy checks instead of returning `true`.

**Drag and drop for reordering.** The arrows work and are keyboard accessible; drag would be an addition rather than a replacement.

**Offline support.** The design has an offline screen and the story is set in a supermarket, where signal is often poor. Doing it properly needs a service worker and a sync queue.

## Time

Roughly six hours. The trade throughout was to finish fewer stories properly, with tests and accessible markup, rather than to sketch all ten.

## On AI

I used Claude while building this, mostly for reviewing my own approach and for talking through the trade-offs above. Every decision in this README is one I made and can defend, and I wrote or reviewed every line in the repository.
