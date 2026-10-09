import { cn } from "@/lib/cn";

export function Card({
  className,
  variant,
  interactive,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "sunken" | "leaf";
  interactive?: boolean;
}) {
  return (
    <div
      {...props}
      className={cn(
        "rw-card",
        variant === "sunken" && "rw-card--sunken",
        variant === "leaf" && "rw-card--leaf",
        interactive && "rw-card--interactive",
        className,
      )}
    >
      {children}
    </div>
  );
}
