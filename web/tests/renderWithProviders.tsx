import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";

export function renderWithProviders(ui: ReactNode) {
  // A fresh client per test: a shared one leaks cache between tests and makes
  // them pass or fail depending on the order they ran in.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{ui}</ToastProvider>
    </QueryClientProvider>,
  );
}
