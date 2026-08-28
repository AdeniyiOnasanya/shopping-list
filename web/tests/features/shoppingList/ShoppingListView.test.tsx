import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { PageShell } from "@/components/layout/PageShell";
import { ShoppingListView } from "@/features/shoppingList/components/ShoppingListView";
import type { Item } from "@/features/shoppingList/types";
import { itemsPage } from "../../fixtures/items";
import { renderWithProviders } from "../../renderWithProviders";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const itemsUrl = "*/api/shopping-lists/1/items";

const bread: Item = {
  id: 1,
  name: "Wholemeal bread",
  price_pence: 140,
  is_purchased: false,
  position: 0,
};

const chicken: Item = {
  id: 2,
  name: "Chicken thighs",
  price_pence: 550,
  is_purchased: false,
  position: 1,
};

const bananas: Item = {
  id: 3,
  name: "Bananas",
  price_pence: 89,
  is_purchased: false,
  position: 2,
};

function renderView() {
  return renderWithProviders(
    <PageShell>
      <ShoppingListView listId={1} />
    </PageShell>,
  );
}

it("shows the items on the list", async () => {
  server.use(http.get(itemsUrl, () => itemsPage([bread, chicken])));

  renderView();

  expect(await screen.findByText("Wholemeal bread")).toBeInTheDocument();
  expect(screen.getByText("£1.40")).toBeInTheDocument();
  expect(screen.getByText("Chicken thighs")).toBeInTheDocument();
  expect(screen.getByText("£5.50")).toBeInTheDocument();
  expect(screen.getByText(/still to find · 2/i)).toBeInTheDocument();
});

it("shows an empty state when there are no items", async () => {
  server.use(http.get(itemsUrl, () => itemsPage([])));

  renderView();

  expect(
    await screen.findByText(/nothing on the list yet/i),
  ).toBeInTheDocument();
});

it("hides the pager when there is only one page", async () => {
  server.use(http.get(itemsUrl, () => itemsPage([bananas])));

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

      return itemsPage(page === 1 ? [bread] : [chicken], {
        current_page: page,
        last_page: 2,
        total: 2,
      });
    }),
  );

  renderView();

  expect(await screen.findByText("Wholemeal bread")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /next/i }));

  expect(await screen.findByText("Chicken thighs")).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByText("Wholemeal bread")).not.toBeInTheDocument();
  });
});

it("shows an error when the request fails", async () => {
  server.use(http.get(itemsUrl, () => HttpResponse.error()));

  renderView();

  expect(await screen.findByRole("alert")).toHaveTextContent(
    /could not load your list/i,
  );
});
