import type { ReactNode } from "react";
import { AppBar } from "./AppBar";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-page">
      <AppBar title="Shopping list" />

      <main className="mx-auto w-full max-w-3xl sm:px-6 sm:py-8">
        <div className="flex min-h-[60dvh] flex-col overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-edge">
          {children}
        </div>
      </main>
    </div>
  );
}
