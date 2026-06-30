"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  addToast: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastVariant, { icon: typeof CheckCircle2; className: string; iconClassName: string }> = {
  success: {
    icon: CheckCircle2,
    className: "border-accent/25 bg-surface text-t1",
    iconClassName: "text-accent",
  },
  error: {
    icon: AlertCircle,
    className: "border-pink/25 bg-pink-d text-pink",
    iconClassName: "text-pink",
  },
  info: {
    icon: Info,
    className: "border-border-s bg-surface text-t1",
    iconClassName: "text-t2",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, variant = "info" }: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current.slice(-2), { id, title, description, variant }]);
      window.setTimeout(() => removeToast(id), 4200);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-4 bottom-24 z-[70] flex flex-col gap-2 sm:bottom-5 sm:left-auto sm:right-5 sm:w-full sm:max-w-sm"
      >
        {toasts.map((toast) => {
          const style = toastStyles[toast.variant];
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              role={toast.variant === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border p-3 shadow-[0_10px_24px_rgba(24,48,84,0.12)]",
                "transition duration-200 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
                style.className
              )}
            >
              <Icon size={18} className={cn("mt-0.5 shrink-0", style.iconClassName)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description && <p className="mt-0.5 text-xs leading-relaxed text-current/80">{toast.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="focus-ring -mr-1 -mt-1 inline-flex min-h-8 min-w-8 items-center justify-center rounded-md text-current/65 hover:bg-current/10 hover:text-current"
                aria-label="Dismiss notification"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
