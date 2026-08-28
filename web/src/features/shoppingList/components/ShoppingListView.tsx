import { useItems } from "../hooks/useItems";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { ItemRow } from "./ItemRow";
import { ItemsSkeleton } from "./ItemsSkeleton";
import { Pagination } from "./Pagination";
import { SectionLabel } from "./SectionLabel";

export function ShoppingListView({ listId }: { listId: number }) {
  const { items, page, lastPage, total, isLoading, isError, goToPage } =
    useItems(listId);

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

      <Pagination page={page} lastPage={lastPage} onChange={goToPage} />
    </>
  );
}
