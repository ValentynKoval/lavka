import * as React from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-ink-900/15 bg-white px-4 text-ink-900 placeholder:text-ink-300 transition-colors focus:border-clay-500 focus:outline-none focus:ring-2 focus:ring-clay-500/20 disabled:opacity-60 aria-[invalid=true]:border-danger-500";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "min-h-28 py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldBase, "h-11 appearance-none bg-no-repeat pr-10", className)} {...props}>
      {children}
    </select>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-danger-500" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Checkbox({ className, label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2.5 text-sm text-ink-700", className)}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-ink-300 accent-clay-500 focus:ring-clay-500"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
