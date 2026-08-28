import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { PageShell } from "@/components/layout/PageShell";
import { ShoppingListView } from "@/features/shoppingList/components/ShoppingListView";
import { renderWithProviders } from "../../renderWithProviders";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const itemsUrl = "*/api/shopping-lists/1/items";
const oneItemUrl = "*/api/shopping-lists/1/items/:itemId";

const items = [
  { id: 1, name: "Wholemeal bread", price_pence: 140 },
  { id: 2, name: "Porridge oats", price_pence: 185 },
];

function renderView() {
  return renderWithProviders(
    <PageShell>
      <ShoppingListView listId={1} />
    </PageShell>,
  );
}

beforeEach(() => {
  server.use(
    http.get(itemsUrl, () =>
      HttpResponse.json({
        data: items,
        meta: { current_page: 1, last_page: 1, per_page: 25, total: 2 },
      }),
    ),
  );
});

it("asks before removing, naming the item", async () => {
  const user = userEvent.setup();
  renderView();

  await user.click(
    await screen.findByRole("button", { name: "Remove Porridge oats" }),
  );

  expect(
    screen.getByRole("heading", { name: /remove .porridge oats.\?/i }),
  ).toBeInTheDocument();
});

it("keeps the item when you back out", async () => {
  const user = userEvent.setup();
  let deleted = false;

  server.use(
    http.delete(oneItemUrl, () => {
      deleted = true;
      return new HttpResponse(null, { status: 204 });
    }),
  );

  renderView();

  await user.click(
    await screen.findByRole("button", { name: "Remove Porridge oats" }),
  );
  await user.click(screen.getByRole("button", { name: /keep it/i }));

  await waitFor(() => {
    expect(
      screen.queryByRole("heading", { name: /remove/i }),
    ).not.toBeInTheDocument();
  });

  expect(deleted).toBe(false);
  expect(screen.getByText("Porridge oats")).toBeInTheDocument();
});

it("removes the row as soon as you confirm", async () => {
  const user = userEvent.setup();
  let deleted = false;

  server.use(
    // The fake server behaves like a real one: two items until the delete
    // lands, one afterwards. Serving one from the start would mean the row
    // was never rendered and the test would prove nothing.
    http.get(itemsUrl, () => {
      const data = deleted ? [items[0]] : items;

      return HttpResponse.json({
        data,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: data.length,
        },
      });
    }),
    http.delete(oneItemUrl, () => {
      deleted = true;
      return new HttpResponse(null, { status: 204 });
    }),
  );

  renderView();

  await user.click(
    await screen.findByRole("button", { name: "Remove Porridge oats" }),
  );
  await user.click(screen.getByRole("button", { name: "Remove" }));

  await waitFor(() => {
    expect(screen.queryByText("Porridge oats")).not.toBeInTheDocument();
  });

  expect(screen.getByText("Wholemeal bread")).toBeInTheDocument();
});

it("puts the row back and says so when the request fails", async () => {
  const user = userEvent.setup();

  server.use(
    http.delete(oneItemUrl, () => new HttpResponse(null, { status: 500 })),
  );

  renderView();

  await user.click(
    await screen.findByRole("button", { name: "Remove Porridge oats" }),
  );
  await user.click(screen.getByRole("button", { name: "Remove" }));

  await waitFor(() => {
    expect(screen.getByText("Porridge oats")).toBeInTheDocument();
  });

  expect(await screen.findByRole("alert")).toHaveTextContent(
    /could not remove/i,
  );
});

it("confirms the removal", async () => {
  const user = userEvent.setup();
  let deleted = false;

  server.use(
    http.get(itemsUrl, () => {
      const data = deleted ? [items[0]] : items;

      return HttpResponse.json({
        data,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: data.length,
        },
      });
    }),
    http.delete(oneItemUrl, () => {
      deleted = true;
      return new HttpResponse(null, { status: 204 });
    }),
  );

  renderView();

  await user.click(
    await screen.findByRole("button", { name: "Remove Porridge oats" }),
  );
  await user.click(screen.getByRole("button", { name: "Remove" }));

  expect(await screen.findByRole("status")).toHaveTextContent(
    /removed .porridge oats./i,
  );
});

it("sends the delete to the right item", async () => {
  const user = userEvent.setup();
  let requestedUrl = "";

  server.use(
    http.delete(oneItemUrl, ({ request }) => {
      requestedUrl = new URL(request.url).pathname;
      return new HttpResponse(null, { status: 204 });
    }),
  );

  renderView();

  await user.click(
    await screen.findByRole("button", { name: "Remove Porridge oats" }),
  );
  await user.click(screen.getByRole("button", { name: "Remove" }));

  await waitFor(() => {
    expect(requestedUrl).toBe("/api/shopping-lists/1/items/2");
  });
});
