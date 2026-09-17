import type {Item} from "@/features/shoppingList/types.ts";
import {SectionLabel} from "@/features/shoppingList/components/SectionLabel.tsx";
import {ItemRow} from "@/features/shoppingList/components/List/ItemRow.tsx";

export default function Section({
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

