import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog.tsx";
import { formatPence } from "@/lib/money.ts";
import { useItems } from "../../hooks/useItems.ts";
import { useRemoveItem } from "../../hooks/useRemoveItem.ts";
import { useToggleItem } from "../../hooks/useToggleItem.ts";
import { AddItemDialog } from "../AddItemDialog.tsx";
import { ListFooter } from "./ListFooter.tsx";
import { Pagination } from "../../../../components/ui/Pagination.tsx";
import type { Item } from "../../types.ts";
import ListBody from "@/features/shoppingList/components/List/ListBody.tsx";

export function ListView({ listId }: { listId: number }) {
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
