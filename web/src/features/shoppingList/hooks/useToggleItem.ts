import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast/useToast";
import { updateItem } from "../api/itemsApi";
import type { Item, ItemsPage } from "../types";

export function useToggleItem(listId: number, page: number) {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const queryKey = ["items", listId, page];

  const mutation = useMutation({
    mutationFn: (item: Item) =>
      updateItem(listId, item.id, { is_purchased: !item.is_purchased }),

    onMutate: async (item: Item) => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<ItemsPage>(queryKey);

      queryClient.setQueryData<ItemsPage>(queryKey, (current) => {
        if (!current) return current;

        const nowPurchased = !item.is_purchased;
        const step = nowPurchased ? 1 : -1;

        return {
          ...current,
          data: current.data.map((row) =>
            row.id === item.id ? { ...row, is_purchased: nowPurchased } : row,
          ),
          counts: {
            to_find: current.counts.to_find - step,
            in_trolley: current.counts.in_trolley + step,
          },
        };
      });

      return { previous };
    },

    onError: (_error, item, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }

      notify({
        tone: "error",
        message: `We could not update “${item.name}”. Please try again.`,
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items", listId] });
    },
  });

  return {
    toggleItem: mutation.mutate,
    isToggling: mutation.isPending,
  };
}
