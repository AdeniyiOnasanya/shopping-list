import { apiClient } from "@/lib/apiClient";
import type { Item, ItemsPage, NewItem } from "../types";

export async function fetchItems(
  listId: number,
  page: number,
): Promise<ItemsPage> {
  const { data } = await apiClient.get<ItemsPage>(
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

export async function updateItem(
  listId: number,
  itemId: number,
  changes: Partial<Pick<Item, "is_purchased">>,
): Promise<Item> {
  const { data } = await apiClient.patch<{ data: Item }>(
    `/shopping-lists/${listId}/items/${itemId}`,
    changes,
  );

  return data.data;
}

export async function deleteItem(
  listId: number,
  itemId: number,
): Promise<void> {
  await apiClient.delete(`/shopping-lists/${listId}/items/${itemId}`);
}
