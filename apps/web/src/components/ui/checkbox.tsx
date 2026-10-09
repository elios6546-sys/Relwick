"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function Checkbox({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={cn("rw-check", className)}>
      <input type="checkbox" {...props} />
      <span className="rw-check__box" aria-hidden="true">
        <Check size={12} strokeWidth={3} />
      </span>
      <span>{label}</span>
    </label>
  );
}

export function Radio({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={cn("rw-check rw-check--radio", className)}>
      <input type="radio" {...props} />
      <span className="rw-check__box" aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}

export function Switch({
  label,
  checked,
  onChange,
  className,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <label className={cn("rw-check", className)}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="rw-switch__track" aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}
