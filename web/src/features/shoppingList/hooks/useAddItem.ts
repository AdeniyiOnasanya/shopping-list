import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { createItem } from "../api/itemsApi";
import type { NewItem, ValidationErrors } from "../types";

export function useAddItem(listId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: NewItem) => createItem(listId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", listId] });
    },
  });

  return {
    addItem: mutation.mutateAsync,
    isSaving: mutation.isPending,
    fieldErrors: toFieldErrors(mutation.error),
    reset: mutation.reset,
  };
}

function toFieldErrors(error: unknown): Record<string, string> {
  if (!isAxiosError(error) || error.response?.status !== 422) return {};

  const errors = error.response.data?.errors as ValidationErrors | undefined;
  if (!errors) return {};

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [field, messages[0]]),
  );
}
