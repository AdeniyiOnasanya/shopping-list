import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ToastActionsContext, ToastStateContext } from "./ToastContext";
import { ToastViewport } from "./Toast";
import type { NewToast, Toast } from "./types";

/** Rapid actions should not stack a wall of toasts. */
const MAX_VISIBLE = 3;

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(({ tone = "success", message }: NewToast) => {
    setToasts((current) =>
      [...current, { id: nextId++, tone, message }].slice(-MAX_VISIBLE),
    );
  }, []);

  const actions = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastActionsContext.Provider value={actions}>
      <ToastStateContext.Provider value={toasts}>
        {children}
        <ToastViewport />
      </ToastStateContext.Provider>
    </ToastActionsContext.Provider>
  );
}
