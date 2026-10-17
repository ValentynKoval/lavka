import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-clay-500 text-white hover:bg-clay-600 active:bg-clay-700 shadow-[0_8px_20px_-10px_rgb(194_99_63/0.7)]",
  secondary: "bg-ink-900 text-linen-50 hover:bg-ink-700",
  outline: "border border-ink-900/15 bg-white/60 text-ink-900 hover:border-ink-900/40 hover:bg-white",
  ghost: "text-ink-700 hover:bg-ink-900/5 hover:text-ink-900",
  danger: "bg-danger-50 text-danger-500 hover:bg-danger-500 hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2",
  icon: "h-10 w-10 p-0",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  href?: string;
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: Pick<ButtonProps, "variant" | "size" | "className">) {
  return cn(
    "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 select-none",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  href,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = buttonClasses({ variant, size, className });
  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
