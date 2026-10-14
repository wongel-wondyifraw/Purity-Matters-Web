"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export interface ToastCallable {
  (titleOrOptions: string | ToastOptions, description?: string): string;
  success: (title: string, description?: string, duration?: number) => string;
  error: (title: string, description?: string, duration?: number) => string;
  info: (title: string, description?: string, duration?: number) => string;
  warning: (title: string, description?: string, duration?: number) => string;
  dismiss: (id: string) => void;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (item: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
  toast: ToastCallable;
  success: (title: string, description?: string, duration?: number) => string;
  error: (title: string, description?: string, duration?: number) => string;
  info: (title: string, description?: string, duration?: number) => string;
  warning: (title: string, description?: string, duration?: number) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Standalone Toast Card Component
export function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return (
          <div className="w-8 h-8 rounded-xl bg-[#F6CE46]/20 border border-[#F6CE46]/40 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#F6CE46]" />
          </div>
        );
      case "error":
        return (
          <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
        );
      case "warning":
        return (
          <div className="w-8 h-8 rounded-xl bg-[#F6CE46]/20 border border-[#F6CE46]/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-[#F6CE46]" />
          </div>
        );
      case "info":
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-white" />
          </div>
        );
    }
  };

  return (
    <div
      role="alert"
      id={`toast-${toast.id}`}
      className="pointer-events-auto relative overflow-hidden bg-[#202328]/95 backdrop-blur-md text-white border border-white/10 shadow-2xl rounded-2xl p-4 flex items-start gap-3.5 w-full transition-all duration-300 animate-in slide-in-from-top-4 fade-in-0"
    >
      {getIcon()}

      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-sm font-semibold text-white tracking-tight leading-snug">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Close notification"
        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer -mr-1 -mt-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Global Provider & Container
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (item: Omit<ToastItem, "id">): string => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = item.duration ?? 4000;

      const newToast: ToastItem = {
        ...item,
        id,
        duration,
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep latest 5

      if (duration > 0) {
        const timer = setTimeout(() => {
          removeToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [removeToast]
  );

  useEffect(() => {
    const currentTimers = timersRef.current;
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer));
      currentTimers.clear();
    };
  }, []);

  const success = useCallback(
    (title: string, description?: string, duration?: number) => {
      return addToast({ type: "success", title, description, duration });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string, duration?: number) => {
      return addToast({ type: "error", title, description, duration });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string, duration?: number) => {
      return addToast({ type: "info", title, description, duration });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string, duration?: number) => {
      return addToast({ type: "warning", title, description, duration });
    },
    [addToast]
  );

  const dismiss = useCallback(
    (id: string) => {
      removeToast(id);
    },
    [removeToast]
  );

  const toastCallable = useMemo(() => {
    const fn = (titleOrOptions: string | ToastOptions, description?: string): string => {
      if (typeof titleOrOptions === "string") {
        return addToast({
          type: "success",
          title: titleOrOptions,
          description,
        });
      }
      return addToast({
        type: titleOrOptions.type || "success",
        title: titleOrOptions.title || "Notification",
        description: titleOrOptions.description,
        duration: titleOrOptions.duration,
      });
    };

    fn.success = success;
    fn.error = error;
    fn.info = info;
    fn.warning = warning;
    fn.dismiss = dismiss;

    return fn as ToastCallable;
  }, [addToast, success, error, info, warning, dismiss]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        toast: toastCallable,
        success,
        error,
        info,
        warning,
        dismiss,
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div
        id="toast-notification-viewport"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm sm:max-w-md pointer-events-none p-2 sm:p-0"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} toast={item} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Hook to access toasts
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return context;
}
