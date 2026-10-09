"use client";

import { cn } from "@/lib/cn";

export function IconButton({
  label,
  variant = "ghost",
  size = "md",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: "ghost" | "secondary";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "rw-btn rw-btn--icon",
        variant === "ghost" && "rw-btn--ghost",
        variant === "secondary" && "rw-btn--secondary",
        size === "sm" && "rw-btn--sm",
        size === "lg" && "rw-btn--lg",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
