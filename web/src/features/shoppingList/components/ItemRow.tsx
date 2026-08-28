import { Trash2 } from "lucide-react";
import { formatPence } from "@/lib/money";
import type { Item } from "../types";

type Props = {
  item: Item;
  onRemove: (item: Item) => void;
};

export function ItemRow({ item, onRemove }: Props) {
  return (
    <li className="flex min-h-16 items-center gap-3 border-t border-line px-4 py-2 sm:px-6">
      <span className="flex-1 text-base font-medium text-ink">{item.name}</span>

      <span className="text-base font-semibold tabular-nums text-ink">
        {formatPence(item.price_pence)}
      </span>

      <button
        type="button"
        onClick={() => onRemove(item)}
        aria-label={`Remove ${item.name}`}
        className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-danger"
      >
        <Trash2 aria-hidden="true" size={18} />
      </button>
    </li>
  );
}
