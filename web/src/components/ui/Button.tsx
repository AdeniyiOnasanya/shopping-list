import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 text-base " +
  "disabled:cursor-not-allowed " +
  "disabled:border-disabled disabled:bg-disabled disabled:text-disabled-text";

const variants = {
  primary: "h-14 border-2 border-brand bg-brand font-bold text-ink",
  secondary: "h-12 border-2 border-ink bg-white font-semibold text-ink",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: Props) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
