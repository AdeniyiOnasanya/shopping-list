# shopping-list-web

React single-page app for the shopping list. Talks to the Laravel API in `../api` over JSON.

## Requirements

Node 20 or newer, and the API running at `http://localhost` (see `../api/README.md`).

## Running it

```bash
cp .env.example .env
npm install
npm run dev
```

Runs at `http://localhost:5173`. The port is fixed with `strictPort`, so a clash fails loudly rather than quietly moving to 5174; it becomes part of the CORS and session configuration at story 10.

Start the API first, or every request fails.

## Scripts

| Command              | What it does               |
| -------------------- | -------------------------- |
| `npm run dev`        | Dev server with hot reload |
| `npm run build`      | Type check and build       |
| `npm run preview`    | Serve the production build |
| `npm run lint`       | ESLint                     |
| `npm test`           | Vitest, one run            |
| `npm run test:watch` | Vitest, watching           |

## Environment

```
VITE_API_URL=http://localhost
```

Vite only exposes variables prefixed with `VITE_` to the browser, so nothing secret belongs in this file.

## Structure

```
src/
  app/providers.tsx        query client and toasts
  components/
    layout/                AppBar, PageShell
    ui/                    Button, Dialog, TextField, Checkbox, toast/
  features/shoppingList/
    api/                   calls to the API
    components/            UI for this feature
    hooks/                 one per query or mutation
    types.ts               the API contract
  lib/
    apiClient.ts           the configured axios instance
    money.ts
tests/
  fixtures/                shared API response builders
  renderWithProviders.tsx
  features/shoppingList/
```

Organised by feature, not by file type. A feature owns its API calls, components, hooks and types; anything two features need moves down into `lib` or `components/ui`. The point is that a folder tells you what part of the product it belongs to rather than what kind of file it holds.

Tests mirror `api/tests/` rather than sitting beside the source, so both halves of the repo are laid out the same way. The `@/` alias is declared in `vite.config.ts` and `tsconfig.app.json` because TypeScript and Vite resolve modules independently.

## How data flows

**Server state lives in TanStack Query. Client state lives in `useState`.** The distinction matters: server state is a cache of something you don't own, which can go stale, arrive out of order or fail. `useState` models none of that. The current page number stays in `useState`, because that genuinely is yours.

Every query key includes the page: `['items', listId, page]`. Changing the page _is_ the refetch, so there's no dependency array and no manual refetch call. After a mutation, `invalidateQueries({ queryKey: ['items', listId] })` marks every page stale at once, which matters because adding or removing a row shifts items between pages.

All requests go through the single axios instance in `src/lib/apiClient.ts`. Nothing calls `fetch` or `axios` directly, so story 10's credentials setting is one line rather than a search across the codebase.

Types in `features/*/types.ts` are written by hand rather than generated, so the contract between the two apps is explicit and reviewable.

## Decisions

**Optimistic updates are used selectively.** Removing and ticking are optimistic with rollback on failure, because they happen constantly while you're walking round a shop and have to feel instant. Adding is not, because a created row needs a server-assigned id.

**Feedback matches how visible the action already is.** Removing a row makes it disappear, so it gets a success toast. Ticking a box visibly changes the row, so it doesn't — eight ticks would mean eight toasts. Failures always toast, because a silent rollback is baffling.

**Toasts use two React contexts, one for the list and one for the actions.** Every consumer of a context re-renders when its value changes, so with a single context, showing a toast would re-render every component that only wanted to send one. Split, the actions object never changes identity and only the viewport subscribes to state. Errors stay until dismissed; successes auto-dismiss.

**Dialogs use the native `<dialog>` element.** `showModal()` gives focus trapping, Escape to close, an inert background and a real `::backdrop`, with no dependency. Building any of that by hand is where accessible modals usually go wrong.

**Checkboxes are real `<input type="checkbox">`, hidden with `sr-only` rather than `hidden`.** `display: none` removes an element from the accessibility tree and makes it unfocusable. `sr-only` clips it while leaving it focusable and announced, so keyboard operation and screen reader output come free and the tests can use `getByRole('checkbox')`.

## Styling

Tailwind 4, configured through the Vite plugin and the `@theme` block in `src/index.css`. There is no `tailwind.config.js`.

The design's type scale overrides Tailwind's `--text-*` namespace, so `text-base` is the row size and no arbitrary values appear in the markup. Everything else sits on the 4px spacing grid.

**The brand green `#53A00A` never carries text and never sits under white text.** It's about 3.3:1 on white, which fails WCAG AA for normal text. It fills surfaces with ink on top; where green text is genuinely needed there's a separate `brand-text` token at `#3E7A08`, which passes at 5.3:1.

Focus rings are set once in the base layer on `:focus-visible`, rather than removed and re-added per component. One rule, impossible to forget on a new component, and only shown to keyboard users.

## Accessibility

Targeting WCAG 2.2 AA. Semantic markup, labelled controls, visible focus, 44px touch targets, and live regions for anything that changes without a page load.

Every action button names its item — "Remove Chicken thighs", "Move Bananas up" — so a screen reader hears which row it's on rather than sixteen identical labels. That's also how the tests target a specific row.

Ticked items use a strike-through as well as a colour change, never colour alone.

## Tests

```bash
npm test
```

Vitest with React Testing Library and jsdom. Vitest rather than Jest because it reads `vite.config.ts` directly, so the alias, plugins and TypeScript settings are shared rather than declared twice.

MSW intercepts HTTP at the network boundary, so the real axios client, the real query hooks and the real components all run. Nothing else is mocked.

Queries are by role and visible text rather than test IDs, so a test breaks when a user would notice and not when a class name changes.

Two things in `tests/` are worth knowing before you write a new one:

**`renderWithProviders`** builds a fresh `QueryClient` per test. A shared one leaks cache between tests and makes them pass or fail depending on the order they ran in. It also sets `retry: false`, or failure tests sit retrying until the assertion times out.

**`fixtures/items.ts`** builds the API response envelope in one place and _derives_ the counts from the items rather than taking them as an argument. A fixture that contradicts its own data produces failures that look like application bugs.

One thing that catches people out: because mutations invalidate and refetch, a stateless MSW handler will return stale data and undo a correct optimistic update. Tests covering a mutation keep a small flag so the fake server remembers what the mutation did. See `RemoveItem.test.tsx` and `ToggleItem.test.tsx`.

`tests/setup.ts` polyfills `HTMLDialogElement.showModal` and `close`, which jsdom does not implement. That means the tests don't prove focus trapping or the inert background — those hold in a real browser and the polyfill exists only to fill jsdom's gap.
