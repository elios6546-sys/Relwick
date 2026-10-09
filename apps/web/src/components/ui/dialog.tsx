"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

export function Dialog({
  open,
  title,
  children,
  actions,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="rw-overlay" role="presentation" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rw-dialog-title"
        tabIndex={-1}
        className="rw-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="rw-dialog-title" className="rw-dialog__title">
          {title}
        </h2>
        <div className="rw-dialog__body">{children}</div>
        {actions ? <div className="rw-dialog__actions">{actions}</div> : null}
      </div>
    </div>
  );
}
