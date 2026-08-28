import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatPence } from "@/lib/money";
import { useItems } from "../hooks/useItems";
import { useRemoveItem } from "../hooks/useRemoveItem";
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

  const { removeItem, isRemoving } = useRemoveItem(listId, page);

  const [isAdding, setIsAdding] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<Item | null>(null);

  // A new item goes to the end, which may be a page that does not exist yet.
  function showNewestItem() {
    goToPage(Math.ceil((total + 1) / perPage));
  }

  function confirmRemoval() {
    if (!pendingRemoval) return;

    // Removing the only row on a page would leave us on a page that no
    // longer exists, so step back before the list refetches.
    if (items.length === 1 && page > 1) {
      goToPage(page - 1);
    }

    removeItem(pendingRemoval);
    setPendingRemoval(null);
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <ListBody
          items={items}
          total={total}
          isLoading={isLoading}
          isError={isError}
          onRemove={setPendingRemoval}
        />
      </div>

      {!isLoading && !isError && (
        <div className="shrink-0">
          <Pagination page={page} lastPage={lastPage} onChange={goToPage} />
        </div>
      )}

      <ListFooter onAdd={() => setIsAdding(true)} />

      <AddItemDialog
        listId={listId}
        open={isAdding}
        onClose={() => setIsAdding(false)}
        onAdded={showNewestItem}
      />

      <ConfirmDialog
        open={pendingRemoval !== null}
        title={pendingRemoval ? `Remove “${pendingRemoval.name}”?` : ""}
        body={
          pendingRemoval
            ? `It'll come off your list. ${formatPence(pendingRemoval.price_pence)} comes off the total.`
            : ""
        }
        confirmLabel="Remove"
        isWorking={isRemoving}
        onConfirm={confirmRemoval}
        onCancel={() => setPendingRemoval(null)}
      />
    </>
  );
}

function ListBody({
  items,
  total,
  isLoading,
  isError,
  onRemove,
}: {
  items: Item[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  onRemove: (item: Item) => void;
}) {
  if (isLoading) return <ItemsSkeleton />;
  if (isError) return <ErrorState />;
  if (items.length === 0) return <EmptyState />;

  return (
    <>
      <SectionLabel count={total} />

      <ul>
        {items.map((item) => (
          <ItemRow key={item.id} item={item} onRemove={onRemove} />
        ))}
      </ul>
    </>
  );
}
