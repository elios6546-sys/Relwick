"use client";

import { cn } from "@/lib/cn";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="rw-field">
      <span className="rw-field__label">{label}</span>
      {children}
      {error ? (
        <span className="rw-field__hint rw-field__hint--error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="rw-field__hint">{hint}</span>
      ) : null}
    </label>
  );
}

export function Input({
  className,
  multiline,
  rows = 4,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  multiline?: boolean;
  rows?: number;
}) {
  if (multiline) {
    return (
      <textarea
        className={cn("rw-input", className)}
        rows={rows}
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    );
  }
  return <input className={cn("rw-input", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn("rw-input rw-select", className)} {...props}>
      {children}
    </select>
  );
}
