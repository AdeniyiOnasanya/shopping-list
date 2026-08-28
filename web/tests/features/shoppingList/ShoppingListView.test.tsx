import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { PageShell } from "@/components/layout/PageShell";
import { ShoppingListView } from "@/features/shoppingList/components/ShoppingListView";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const itemsUrl = "*/api/shopping-lists/1/items";

function renderView() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <PageShell>
        <ShoppingListView listId={1} />
      </PageShell>
    </QueryClientProvider>,
  );
}

function itemsPage(
  items: Array<{ id: number; name: string; price_pence: number }>,
  meta: Partial<Record<string, number>> = {},
) {
  return HttpResponse.json({
    data: items,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 25,
      total: items.length,
      ...meta,
    },
  });
}

it("shows the items on the list", async () => {
  server.use(
    http.get(itemsUrl, () =>
      itemsPage([
        { id: 1, name: "Wholemeal bread", price_pence: 140 },
        { id: 2, name: "Chicken thighs", price_pence: 550 },
      ]),
    ),
  );

  renderView();

  expect(await screen.findByText("Wholemeal bread")).toBeInTheDocument();
  expect(screen.getByText("£1.40")).toBeInTheDocument();
  expect(screen.getByText(/to find · 2/i)).toBeInTheDocument();
});

it("shows an empty state when there are no items", async () => {
  server.use(http.get(itemsUrl, () => itemsPage([])));

  renderView();

  expect(
    await screen.findByText(/nothing on the list yet/i),
  ).toBeInTheDocument();
});

it("hides the pager when there is only one page", async () => {
  server.use(
    http.get(itemsUrl, () =>
      itemsPage([{ id: 1, name: "Bananas", price_pence: 89 }]),
    ),
  );

  renderView();

  await screen.findByText("Bananas");
  expect(
    screen.queryByRole("button", { name: /next/i }),
  ).not.toBeInTheDocument();
});

it("loads the next page when Next is clicked", async () => {
  const user = userEvent.setup();

  server.use(
    http.get(itemsUrl, ({ request }) => {
      const page = Number(new URL(request.url).searchParams.get("page") ?? 1);

      return itemsPage(
        page === 1
          ? [{ id: 1, name: "Wholemeal bread", price_pence: 140 }]
          : [{ id: 2, name: "Porridge oats", price_pence: 185 }],
        { current_page: page, last_page: 2, total: 2 },
      );
    }),
  );

  renderView();

  expect(await screen.findByText("Wholemeal bread")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /next/i }));

  expect(await screen.findByText("Porridge oats")).toBeInTheDocument();
  expect(screen.queryByText("Wholemeal bread")).not.toBeInTheDocument();
});

it("shows an error when the request fails", async () => {
  server.use(http.get(itemsUrl, () => HttpResponse.error()));

  renderView();

  expect(await screen.findByRole("alert")).toBeInTheDocument();
});
