import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  prefix?: ReactNode;
};

export function TextField({ label, hint, error, prefix, ...props }: Props) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy = [hint && hintId, error && errorId]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>

      <div
        className={`flex h-14 items-center gap-1 rounded-lg border bg-white px-3.5 focus-within:border-2 focus-within:border-ink focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-brand ${
          error ? "border-2 border-invalid" : "border-field-edge"
        }`}
      >
        {prefix && <span className="text-subtle">{prefix}</span>}

        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className="h-full w-full bg-transparent text-base text-ink outline-none placeholder:text-placeholder"
          {...props}
        />
      </div>

      {hint && (
        <p id={hintId} className="text-xs text-subtle">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-xs font-medium text-invalid">
          {error}
        </p>
      )}
    </div>
  );
}
