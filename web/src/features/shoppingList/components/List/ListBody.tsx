import {ItemsSkeleton} from "@/features/shoppingList/components/ItemsSkeleton.tsx";
import {ErrorState} from "@/components/ui/ErrorState.tsx";
import {EmptyState} from "@/components/ui/EmptyState.tsx";
import type {Item} from "@/features/shoppingList/types.ts";
import Section from "@/features/shoppingList/components/List/ListSection.tsx";

type BodyProps = {
    items: Item[];
    toFind: number;
    inTrolley: number;
    isLoading: boolean;
    isError: boolean;
    onToggle: (item: Item) => void;
    onRemove: (item: Item) => void;
};

export default function ListBody({
                      items,
                      toFind,
                      inTrolley,
                      isLoading,
                      isError,
                      onToggle,
                      onRemove,
                  }: BodyProps) {
    if (isLoading) return <ItemsSkeleton />;
    if (isError) return <ErrorState
        header={'We could not load your list'}
        subHeader={'Check your connection and try again.p'}
    />;
    if (items.length === 0) return <EmptyState
        header={'Nothing on the list yet'}
        subHeader={'Add what you need and what you expect it to cost, and the list will keep'}
    />;

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