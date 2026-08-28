import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Dialog({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="
        m-0 mt-auto w-full max-w-full rounded-t-2xl p-0 backdrop:bg-scrim
        sm:m-auto sm:max-w-md sm:rounded-2xl
      "
    >
      <div className="flex flex-col gap-4 px-5 pb-6 pt-3">
        <span
          aria-hidden="true"
          className="mx-auto h-1 w-10 rounded-full bg-edge sm:hidden"
        />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2.5 flex size-11 items-center justify-center rounded-lg text-ink"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        {children}
      </div>
    </dialog>
  );
}
