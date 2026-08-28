import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
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
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <PageShell>
        <ShoppingListView listId={1} />
      </PageShell>
    </QueryClientProvider>,
  );
}

function listOf(
  items: Array<{ id: number; name: string; price_pence: number }>,
) {
  return HttpResponse.json({
    data: items,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 25,
      total: items.length,
    },
  });
}

beforeEach(() => {
  server.use(http.get(itemsUrl, () => listOf([])));
});

it("opens the dialog from the footer button", async () => {
  const user = userEvent.setup();
  renderView();

  await user.click(await screen.findByRole("button", { name: /add item/i }));

  expect(
    screen.getByRole("heading", { name: /add an item/i }),
  ).toBeInTheDocument();
});

it("will not submit without a name", async () => {
  const user = userEvent.setup();
  renderView();

  await user.click(await screen.findByRole("button", { name: /add item/i }));
  await user.click(screen.getByRole("button", { name: /add to list/i }));

  expect(await screen.findByText(/give the item a name/i)).toBeInTheDocument();
});

it("rejects a price that is not an amount", async () => {
  const user = userEvent.setup();
  renderView();

  await user.click(await screen.findByRole("button", { name: /add item/i }));
  await user.type(screen.getByLabelText("Item"), "Coffee beans");
  await user.type(screen.getByLabelText("Price"), "lots");
  await user.click(screen.getByRole("button", { name: /add to list/i }));

  expect(await screen.findByText(/enter an amount like/i)).toBeInTheDocument();
});

it("sends the price in pence and closes on success", async () => {
  const user = userEvent.setup();
  let body: unknown;

  server.use(
    http.post(itemsUrl, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json(
        { data: { id: 9, name: "Coffee beans", price_pence: 675 } },
        { status: 201 },
      );
    }),
  );

  renderView();

  await user.click(await screen.findByRole("button", { name: /add item/i }));
  await user.type(screen.getByLabelText("Item"), "Coffee beans");
  await user.type(screen.getByLabelText("Price"), "6.75");
  await user.click(screen.getByRole("button", { name: /add to list/i }));

  await waitFor(() => {
    expect(body).toEqual({ name: "Coffee beans", price_pence: 675 });
  });

  await waitFor(() => {
    expect(
      screen.queryByRole("heading", { name: /add an item/i }),
    ).not.toBeInTheDocument();
  });
});

it("shows a duplicate rejected by the server on the name field", async () => {
  const user = userEvent.setup();

  server.use(
    http.post(itemsUrl, () =>
      HttpResponse.json(
        {
          message: "The given data was invalid.",
          errors: { name: ["That item is already on your list."] },
        },
        { status: 422 },
      ),
    ),
  );

  renderView();

  await user.click(await screen.findByRole("button", { name: /add item/i }));
  await user.type(screen.getByLabelText("Item"), "Milk");
  await user.click(screen.getByRole("button", { name: /add to list/i }));

  expect(await screen.findByText(/already on your list/i)).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: /add an item/i }),
  ).toBeInTheDocument();
});

it("closes on Escape without saving", async () => {
  const user = userEvent.setup();
  let posted = false;

  server.use(
    http.post(itemsUrl, () => {
      posted = true;
      return HttpResponse.json({ data: {} }, { status: 201 });
    }),
  );

  renderView();

  await user.click(await screen.findByRole("button", { name: /add item/i }));
  await user.keyboard("{Escape}");

  await waitFor(() => {
    expect(
      screen.queryByRole("heading", { name: /add an item/i }),
    ).not.toBeInTheDocument();
  });

  expect(posted).toBe(false);
});
