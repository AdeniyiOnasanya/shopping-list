import { TriangleAlert } from "lucide-react";

export function ErrorState() {
  return (
    <div
      role="alert"
      className="m-4 flex gap-3 rounded-xl border border-danger-edge bg-danger-tint p-4 sm:m-6"
    >
      <TriangleAlert
        aria-hidden="true"
        size={20}
        className="mt-0.5 shrink-0 text-danger"
      />

      <div>
        <p className="text-base font-semibold text-danger">
          We could not load your list
        </p>
        <p className="mt-1 text-sm text-muted">
          Check your connection and try again.
        </p>
      </div>
    </div>
  );
}
