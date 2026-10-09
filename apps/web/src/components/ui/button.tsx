"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "soft" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  href?: string;
}

function classes(variant: Variant, size: Size, className?: string) {
  return cn(
    "rw-btn",
    variant === "primary" && "rw-btn--primary",
    variant === "secondary" && "rw-btn--secondary",
    variant === "ghost" && "rw-btn--ghost",
    variant === "soft" && "rw-btn--soft",
    variant === "danger" && "rw-btn--danger",
    size === "sm" && "rw-btn--sm",
    size === "lg" && "rw-btn--lg",
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  arrow,
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const content = (
    <>
      {children}
      {arrow ? <ArrowRight className="rw-btn__arrow" size={18} strokeWidth={2} /> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes(variant, size, className)} {...(props as object)}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes(variant, size, className)} {...props}>
      {content}
    </button>
  );
}
