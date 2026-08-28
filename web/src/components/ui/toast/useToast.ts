import { useContext } from "react";
import { ToastActionsContext } from "./ToastContext";

export function useToast() {
  const actions = useContext(ToastActionsContext);

  if (!actions) {
    throw new Error("useToast must be used inside a ToastProvider.");
  }

  return actions;
}
