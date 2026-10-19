"use client";

import { useEffect } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { create } from "zustand";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, tone = "success") => set((s) => ({ toasts: [...s.toasts, { id: ++counter, message, tone }].slice(-4) })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (m: string) => useToastStore.getState().push(m, "success"),
  error: (m: string) => useToastStore.getState().push(m, "error"),
  info: (m: string) => useToastStore.getState().push(m, "info"),
};

const icons: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-moss-500" />,
  error: <XCircle className="h-5 w-5 text-danger-500" />,
  info: <Info className="h-5 w-5 text-clay-500" />,
};

function ToastItem({ toast: item }: { toast: Toast }) {
  const { t } = useT();
  const dismiss = useToastStore((s) => s.dismiss);
  useEffect(() => {
    const timer = setTimeout(() => dismiss(item.id), 3500);
    return () => clearTimeout(timer);
  }, [item.id, dismiss]);
  return (
    <div role="status" className={cn("pointer-events-auto flex items-center gap-3 rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 shadow-float animate-fade-up")}>
      {icons[item.tone]}
      <span className="flex-1">{item.message}</span>
      <button onClick={() => dismiss(item.id)} className="text-ink-300 hover:text-ink-900" aria-label={t("common.close")}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
      {toasts.map((item) => (
        <ToastItem key={item.id} toast={item} />
      ))}
    </div>
  );
}
