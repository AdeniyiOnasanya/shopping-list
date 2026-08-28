import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchItems } from "../api/itemsApi";

export function useItems(listId: number) {
  const [page, setPage] = useState(1);

  const { data, isPending, isError } = useQuery({
    queryKey: ["items", listId, page],
    queryFn: () => fetchItems(listId, page),
    placeholderData: keepPreviousData,
  });

  return {
    items: data?.data ?? [],
    page,
    lastPage: data?.meta.last_page ?? 1,
    total: data?.meta.total ?? 0,
    isLoading: isPending,
    isError,
    goToPage: setPage,
  };
}
