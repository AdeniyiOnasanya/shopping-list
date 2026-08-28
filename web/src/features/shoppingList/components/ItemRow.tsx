import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/Checkbox";
import { formatPence } from "@/lib/money";
import type { Item } from "../types";

type Props = {
  item: Item;
  onToggle: (item: Item) => void;
  onRemove: (item: Item) => void;
};

export function ItemRow({ item, onToggle, onRemove }: Props) {
  const done = item.is_purchased;

  return (
    <li
      className={`flex items-center gap-3 border-t border-line px-3 py-2 sm:px-4 ${
        done ? "min-h-15 bg-surface" : "min-h-18"
      }`}
    >
      <Checkbox
        label={`Picked up ${item.name}`}
        checked={done}
        onChange={() => onToggle(item)}
      />

      <span
        className={`flex-1 ${
          done
            ? "text-base text-muted line-through"
            : "text-lg font-semibold text-ink"
        }`}
      >
        {item.name}
      </span>

      <span
        className={`tabular-nums ${
          done
            ? "text-base text-muted line-through"
            : "text-lg font-bold text-ink"
        }`}
      >
        {formatPence(item.price_pence)}
      </span>

      <button
        type="button"
        onClick={() => onRemove(item)}
        aria-label={`Remove ${item.name}`}
        className="-mr-1 flex size-11 shrink-0 items-center justify-center rounded-lg text-danger"
      >
        <Trash2 aria-hidden="true" size={18} />
      </button>
    </li>
  );
}
