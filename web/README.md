Web readme · MD

# shopping-list-web

React single-page app for the shopping list. Talks to the Laravel API in `../api` over JSON.

Built for the Mayden developer coding challenge.

## Stack

- React 19 with TypeScript
- Vite
- Tailwind CSS 4
- Axios
- Jest and React Testing Library

## Prerequisites

- Node 20 or newer
- The API running at `http://localhost` (see `../api/README.md`)

## Running it

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`.

The API has to be up first, or every request will fail. From the repo root:

```bash
cd api && ./vendor/bin/sail up -d
```

## Environment

```
VITE_API_URL=http://localhost
```

Vite only exposes variables prefixed with `VITE_` to the browser, so anything secret does not belong in this file.

## Scripts

| Command           | What it does                        |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Dev server with hot reload          |
| `npm run build`   | Type check and build for production |
| `npm run preview` | Serve the production build locally  |
| `npm run lint`    | ESLint                              |
| `npm test`        | Run the test suite                  |

## Structure

Organised by feature rather than by file type. A feature owns its own API calls, components, hooks and types. Anything two features need moves down into `lib` or `components/ui`.

```
src/
  features/
    shoppingList/
      api/          calls to the API
      components/   UI for this feature
      hooks/        data fetching and state
      types.ts      the API contract
  components/ui/    shared primitives
  lib/
    apiClient.ts    configured axios instance
```

The point is that a folder tells you what part of the product it belongs to, rather than what kind of file it holds. It stops the app becoming one components directory with everything in it.

## Talking to the API

All requests go through the single axios instance in `src/lib/apiClient.ts`, configured with `withCredentials` so session cookies are sent. Nothing calls `fetch` or `axios` directly.

Types in `features/*/types.ts` describe the API responses and are written by hand rather than generated, so the contract between the two apps is explicit.

## Testing

```bash
npm test
```

Jest with React Testing Library and jsdom. HTTP is intercepted with MSW rather than mocked at the axios level, so tests exercise the real client.

Components are queried by role and visible text rather than test IDs, so the tests break when a user would notice and not when an implementation detail changes.

## Accessibility

Targeting WCAG 2.2 AA. Semantic markup, labelled form controls, visible focus states, and touch targets large enough to use one-handed, since the list is meant to be used while walking round a supermarket.

## Notes

Tailwind 4 is configured through the Vite plugin and the `@theme` block in `src/index.css`. There is no `tailwind.config.js`.
