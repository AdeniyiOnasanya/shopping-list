import { formatPence } from "../../../lib/money";
import type { Item } from "../types";

export function ItemRow({ item }: { item: Item }) {
  return (
    <li className="flex min-h-16 items-center gap-4 border-t border-line px-4 py-2 sm:px-6">
      <span className="flex-1 text-base font-medium text-ink">{item.name}</span>
      <span className="text-base font-semibold tabular-nums text-ink">
        {formatPence(item.price_pence)}
      </span>
    </li>
  );
}
