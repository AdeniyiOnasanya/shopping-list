import { Plus } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex size-22 items-center justify-center rounded-3xl border border-brand-tint-edge bg-brand-tint">
        <Plus aria-hidden="true" size={36} className="text-brand-text" />
      </div>
      <h2 className="mt-1.5 text-xl font-semibold text-ink">
        Nothing on the list yet
      </h2>
      <p className="max-w-70 text-base text-muted text-pretty">
        Add what you need and what you expect it to cost, and the list will keep
        track.
      </p>
    </div>
  );
}
