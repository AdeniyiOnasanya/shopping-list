import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatPence } from "@/lib/money";
import { useItems } from "../hooks/useItems";
import { useRemoveItem } from "../hooks/useRemoveItem";
import { useToggleItem } from "../hooks/useToggleItem";
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
    toFind,
    inTrolley,
    isLoading,
    isError,
    goToPage,
  } = useItems(listId);

  const { removeItem } = useRemoveItem(listId, page);
  const { toggleItem } = useToggleItem(listId, page);

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
          toFind={toFind}
          inTrolley={inTrolley}
          isLoading={isLoading}
          isError={isError}
          onToggle={toggleItem}
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
        onConfirm={confirmRemoval}
        onCancel={() => setPendingRemoval(null)}
      />
    </>
  );
}

type BodyProps = {
  items: Item[];
  toFind: number;
  inTrolley: number;
  isLoading: boolean;
  isError: boolean;
  onToggle: (item: Item) => void;
  onRemove: (item: Item) => void;
};

function ListBody({
  items,
  toFind,
  inTrolley,
  isLoading,
  isError,
  onToggle,
  onRemove,
}: BodyProps) {
  if (isLoading) return <ItemsSkeleton />;
  if (isError) return <ErrorState />;
  if (items.length === 0) return <EmptyState />;

  const stillToFind = items.filter((item) => !item.is_purchased);
  const inTheTrolley = items.filter((item) => item.is_purchased);

  return (
    <>
      {stillToFind.length > 0 && (
        <Section
          label="Still to find"
          count={toFind}
          items={stillToFind}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      )}

      {inTheTrolley.length > 0 && (
        <Section
          label="In the trolley"
          count={inTrolley}
          items={inTheTrolley}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      )}
    </>
  );
}

function Section({
  label,
  count,
  items,
  onToggle,
  onRemove,
}: {
  label: string;
  count: number;
  items: Item[];
  onToggle: (item: Item) => void;
  onRemove: (item: Item) => void;
}) {
  return (
    <>
      <SectionLabel label={label} count={count} />

      <ul>
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onToggle={onToggle}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </>
  );
}
