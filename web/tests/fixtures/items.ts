import { HttpResponse } from "msw";
import type { Item } from "@/features/shoppingList/types";

type MetaOverrides = Partial<{
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}>;

export function itemsPage(items: Item[], meta: MetaOverrides = {}) {
  return HttpResponse.json({
    data: items,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 25,
      total: items.length,
      ...meta,
    },
    // Derived, never hardcoded. A fixture that disagrees with its own data
    // fails in ways that look like application bugs.
    counts: {
      to_find: items.filter((item) => !item.is_purchased).length,
      in_trolley: items.filter((item) => item.is_purchased).length,
    },
  });
}
