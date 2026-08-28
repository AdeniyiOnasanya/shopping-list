import { useState } from "react";
import { useItems } from "../hooks/useItems";
import { AddItemDialog } from "./AddItemDialog";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { ItemRow } from "./ItemRow";
import { ItemsSkeleton } from "./ItemsSkeleton";
import { ListFooter } from "./ListFooter";
import { Pagination } from "./Pagination";
import { SectionLabel } from "./SectionLabel";
import type { Item } from "../types";

export function ShoppingListView({ listId }: { listId: number }) {
  const {
    items,
    page,
    lastPage,
    total,
    perPage,
    isLoading,
    isError,
    goToPage,
  } = useItems(listId);

  const [isAdding, setIsAdding] = useState(false);

  // The new item goes to the end of the list, which may be a page that
  // does not exist yet, so work out where it will land.
  function showNewestItem() {
    goToPage(Math.ceil((total + 1) / perPage));
  }

  return (
    <>
      <ListBody
        items={items}
        total={total}
        isLoading={isLoading}
        isError={isError}
      />

      {!isLoading && !isError && (
        <Pagination page={page} lastPage={lastPage} onChange={goToPage} />
      )}

      <ListFooter onAdd={() => setIsAdding(true)} />

      <AddItemDialog
        listId={listId}
        open={isAdding}
        onClose={() => setIsAdding(false)}
        onAdded={showNewestItem}
      />
    </>
  );
}

function ListBody({
  items,
  total,
  isLoading,
  isError,
}: {
  items: Item[];
  total: number;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) return <ItemsSkeleton />;
  if (isError) return <ErrorState />;
  if (items.length === 0) return <EmptyState />;

  return (
    <>
      <SectionLabel count={total} />

      <ul>
        {items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </ul>
    </>
  );
}
