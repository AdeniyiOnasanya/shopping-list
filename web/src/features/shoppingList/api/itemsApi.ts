import { apiClient } from "../../../lib/apiClient";
import type { Item, Paginated } from "../types";

export async function fetchItems(
  listId: number,
  page: number,
): Promise<Paginated<Item>> {
  const { data } = await apiClient.get<Paginated<Item>>(
    `/shopping-lists/${listId}/items`,
    { params: { page } },
  );

  return data;
}
