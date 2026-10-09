import { cn } from "@/lib/cn";

export function Badge({
  children,
  tone = "neutral",
  dot,
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "success" | "warning" | "danger" | "copper";
  dot?: boolean;
  className?: string;
}) {
  const style =
    tone === "primary"
      ? { background: "var(--rw-primary-soft)", color: "var(--rw-primary-soft-text)" }
      : tone === "copper"
        ? { background: "var(--rw-copper-soft)", color: "var(--rw-copper-text)" }
      : tone === "success"
        ? { background: "var(--rw-success-soft)", color: "var(--rw-success)" }
        : tone === "warning"
          ? { background: "var(--rw-warning-soft)", color: "var(--rw-warning)" }
          : tone === "danger"
            ? { background: "var(--rw-danger-soft)", color: "var(--rw-danger)" }
            : { background: "var(--rw-surface-sunken)", color: "var(--rw-text-muted)" };

  return (
    <span className={cn("rw-badge", className)} style={style}>
      {dot ? <span className="rw-badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function Tag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary";
}) {
  return (
    <span className={cn("rw-tag", tone === "neutral" && "rw-tag--neutral")}>{children}</span>
  );
}
