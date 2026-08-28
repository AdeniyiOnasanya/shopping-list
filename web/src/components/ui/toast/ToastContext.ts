import { createContext } from "react";
import type { NewToast, Toast } from "./types";

export type ToastActions = {
  notify: (toast: NewToast) => void;
  dismiss: (id: number) => void;
};

export const ToastStateContext = createContext<Toast[]>([]);
export const ToastActionsContext = createContext<ToastActions | null>(null);
