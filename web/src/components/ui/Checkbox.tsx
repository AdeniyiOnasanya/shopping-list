import { Check } from "lucide-react";
import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function Checkbox({ label, className = "", ...props }: Props) {
  return (
    <label
      className={`flex size-11 shrink-0 cursor-pointer items-center justify-center ${className}`}
    >
      <input type="checkbox" className="peer sr-only" {...props} />
      <span className="sr-only">{label}</span>

      <span
        aria-hidden="true"
        className="
          flex size-8 items-center justify-center rounded-lg border-[2.5px] border-ink
          text-transparent
          peer-checked:border-brand peer-checked:bg-brand peer-checked:text-ink
          peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2
          peer-focus-visible:outline-ink
        "
      >
        <Check size={20} strokeWidth={3.5} />
      </span>
    </label>
  );
}
