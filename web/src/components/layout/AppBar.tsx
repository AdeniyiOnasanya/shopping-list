import { Check } from "lucide-react";

export function AppBar({ title }: { title: string }) {
  return (
    <header className="bg-ink">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand">
          <Check
            aria-hidden="true"
            size={18}
            strokeWidth={3}
            className="text-ink"
          />
        </span>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>
    </header>
  );
}
