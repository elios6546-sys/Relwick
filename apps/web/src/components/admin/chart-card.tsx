export function ChartCard({
  title,
  children,
  hint,
}: {
  title: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rw-card" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <h2 style={{ font: "600 16px/1.3 var(--font-sans)", margin: 0 }}>{title}</h2>
        {hint ? (
          <span style={{ fontSize: 12, color: "var(--rw-text-muted)" }} title={hint}>
            Info
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
