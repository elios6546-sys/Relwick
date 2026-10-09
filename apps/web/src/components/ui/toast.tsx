"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
}

interface ToastContextValue {
  show: (title: string, description?: string, ms?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((title: string, description?: string, ms = 5000) => {
    const id = Date.now();
    setItems((prev) => [...prev, { id, title, description }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, ms);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="rw-toast-stack" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="rw-toast" role="status">
            <div>
              <div className="rw-toast__title">{t.title}</div>
              {t.description ? <div className="rw-toast__desc">{t.description}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast requiert ToastProvider.");
  return ctx;
}
