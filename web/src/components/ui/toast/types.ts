export type ToastTone = "success" | "error";

export type Toast = {
  id: number;
  tone: ToastTone;
  message: string;
};

export type NewToast = {
  tone?: ToastTone;
  message: string;
};
