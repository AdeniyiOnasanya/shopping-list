import type { ReactNode } from "react";
import { AppBar } from "./AppBar";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <AppBar title="Shopping list" />

      <main className="mx-auto flex w-full max-w-3xl flex-1 overflow-hidden sm:px-6 sm:py-8">
        <div className="flex flex-1 flex-col overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-edge">
          {children}
        </div>
      </main>
    </div>
  );
}
