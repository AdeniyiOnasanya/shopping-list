import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast/useToast";
import { deleteItem } from "../api/itemsApi";
import type { Item, Paginated } from "../types";

export function useRemoveItem(listId: number, page: number) {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const queryKey = ["items", listId, page];

  const mutation = useMutation({
    mutationFn: (item: Item) => deleteItem(listId, item.id),

    onMutate: async (item: Item) => {
      // Stop a refetch in flight from overwriting the optimistic change.
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Paginated<Item>>(queryKey);

      queryClient.setQueryData<Paginated<Item>>(queryKey, (current) => {
        if (!current) return current;

        return {
          ...current,
          data: current.data.filter((row) => row.id !== item.id),
          meta: { ...current.meta, total: current.meta.total - 1 },
        };
      });

      return { previous };
    },

    onSuccess: (_data, item) => {
      notify({ message: `Removed “${item.name}”` });
    },

    onError: (_error, item, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }

      notify({
        tone: "error",
        message: `We could not remove “${item.name}”. Please try again.`,
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items", listId] });
    },
  });

  return {
    removeItem: mutation.mutate,
    isRemoving: mutation.isPending,
    failed: mutation.isError,
  };
}
