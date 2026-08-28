import { X } from "lucide-react";
import { useContext, useEffect } from "react";
import { ToastActionsContext, ToastStateContext } from "./ToastContext";
import type { Toast as ToastModel } from "./types";

const AUTO_DISMISS_MS = 4_000;

export function ToastViewport() {
  const toasts = useContext(ToastStateContext);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 pb-safe">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: ToastModel }) {
  const actions = useContext(ToastActionsContext);
  const isError = toast.tone === "error";

  useEffect(() => {
    // Errors stay until dismissed. They are something to act on.
    if (isError) return;

    const timer = setTimeout(() => actions?.dismiss(toast.id), AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [actions, isError, toast.id]);

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl px-4 py-3.5 text-white shadow-lg motion-safe:animate-toast-in ${
        isError ? "bg-danger" : "bg-ink"
      }`}
    >
      <p className="flex-1 text-sm">{toast.message}</p>

      <button
        type="button"
        onClick={() => actions?.dismiss(toast.id)}
        aria-label="Dismiss"
        className="-mr-1.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-on-dark-muted"
      >
        <X aria-hidden="true" size={18} />
      </button>
    </div>
  );
}
