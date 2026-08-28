import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { PageShell } from "@/components/layout/PageShell";
import { ShoppingListView } from "@/features/shoppingList/components/ShoppingListView";
import { itemsPage } from "../../fixtures/items";
import { renderWithProviders } from "../../renderWithProviders";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const itemsUrl = "*/api/shopping-lists/1/items";
const oneItemUrl = "*/api/shopping-lists/1/items/:itemId";

const toFind = {
  id: 1,
  name: "Chicken thighs",
  price_pence: 550,
  is_purchased: false,
};
const inTrolley = {
  id: 2,
  name: "Wholemeal bread",
  price_pence: 140,
  is_purchased: true,
};

function renderView() {
  return renderWithProviders(
    <PageShell>
      <ShoppingListView listId={1} />
    </PageShell>,
  );
}

beforeEach(() => {
  server.use(http.get(itemsUrl, () => itemsPage([toFind, inTrolley])));
});

it("shows both sections with whole-list counts", async () => {
  renderView();

  expect(await screen.findByText(/still to find · 1/i)).toBeInTheDocument();
  expect(screen.getByText(/in the trolley · 1/i)).toBeInTheDocument();
});

it("reflects what has already been picked up", async () => {
  renderView();

  expect(
    await screen.findByRole("checkbox", { name: "Picked up Wholemeal bread" }),
  ).toBeChecked();

  expect(
    screen.getByRole("checkbox", { name: "Picked up Chicken thighs" }),
  ).not.toBeChecked();
});

it("ticks the box straight away", async () => {
  const user = userEvent.setup();
  let picked = false;

  server.use(
    // The fake server has to remember, because onSettled refetches. A handler
    // that always returns the old value unticks the box again and makes
    // correct optimistic code look broken.
    http.get(itemsUrl, () =>
      itemsPage([{ ...toFind, is_purchased: picked }, inTrolley]),
    ),
    http.patch(oneItemUrl, async ({ request }) => {
      const body = (await request.json()) as { is_purchased: boolean };
      picked = body.is_purchased;

      return HttpResponse.json({ data: { ...toFind, is_purchased: picked } });
    }),
  );

  renderView();

  await user.click(
    await screen.findByRole("checkbox", { name: "Picked up Chicken thighs" }),
  );

  await waitFor(() => {
    expect(
      screen.getByRole("checkbox", { name: "Picked up Chicken thighs" }),
    ).toBeChecked();
  });
});

it("sends the opposite of the current state", async () => {
  const user = userEvent.setup();
  let body: unknown;

  server.use(
    http.patch(oneItemUrl, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ data: { ...inTrolley, is_purchased: false } });
    }),
  );

  renderView();

  await user.click(
    await screen.findByRole("checkbox", { name: "Picked up Wholemeal bread" }),
  );

  await waitFor(() => {
    expect(body).toEqual({ is_purchased: false });
  });
});

it("unticks and explains itself when the request fails", async () => {
  const user = userEvent.setup();

  server.use(
    http.patch(oneItemUrl, () => new HttpResponse(null, { status: 500 })),
  );

  renderView();

  await user.click(
    await screen.findByRole("checkbox", { name: "Picked up Chicken thighs" }),
  );

  await waitFor(() => {
    expect(
      screen.getByRole("checkbox", { name: "Picked up Chicken thighs" }),
    ).not.toBeChecked();
  });

  expect(await screen.findByRole("alert")).toHaveTextContent(
    /could not update/i,
  );
});

it("does not celebrate every tick with a toast", async () => {
  const user = userEvent.setup();
  let picked = false;

  server.use(
    http.get(itemsUrl, () =>
      itemsPage([{ ...toFind, is_purchased: picked }, inTrolley]),
    ),
    http.patch(oneItemUrl, async ({ request }) => {
      const body = (await request.json()) as { is_purchased: boolean };
      picked = body.is_purchased;

      return HttpResponse.json({ data: { ...toFind, is_purchased: picked } });
    }),
  );

  renderView();

  await user.click(
    await screen.findByRole("checkbox", { name: "Picked up Chicken thighs" }),
  );

  await waitFor(() => {
    expect(
      screen.getByRole("checkbox", { name: "Picked up Chicken thighs" }),
    ).toBeChecked();
  });

  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
