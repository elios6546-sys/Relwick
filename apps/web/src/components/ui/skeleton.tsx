export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        background: "var(--rw-surface-sunken)",
        borderRadius: "var(--radius-sm)",
        animation: "rw-fade 1.2s ease-in-out infinite alternate",
      }}
    />
  );
}
