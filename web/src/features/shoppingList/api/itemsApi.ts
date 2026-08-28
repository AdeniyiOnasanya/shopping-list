import { apiClient } from "../../../lib/apiClient";
import type { Item, NewItem, Paginated } from "../types";

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

export async function createItem(
  listId: number,
  input: NewItem,
): Promise<Item> {
  const { data } = await apiClient.post<{ data: Item }>(
    `/shopping-lists/${listId}/items`,
    input,
  );

  return data.data;
}
