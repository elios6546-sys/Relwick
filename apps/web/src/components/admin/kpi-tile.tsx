import { formatNumber, formatPercent } from "@/lib/format";

export function KpiTile({
  label,
  value,
  change,
  invert,
  format = "number",
}: {
  label: string;
  value: number;
  change?: number | null;
  invert?: boolean;
  format?: "number" | "percent" | "duration";
}) {
  const display =
    format === "percent"
      ? formatPercent(value)
      : format === "duration"
        ? `${Math.round(value)} s`
        : formatNumber(value);

  let changeColor = "var(--rw-text-muted)";
  if (change != null && change !== 0) {
    const positive = invert ? change < 0 : change > 0;
    changeColor = positive ? "var(--rw-success)" : "var(--rw-danger)";
  }

  return (
    <div className="rw-card" style={{ padding: 18 }}>
      <div style={{ fontSize: 13, color: "var(--rw-text-muted)", marginBottom: 8 }}>{label}</div>
      <div style={{ font: "600 24px/1.1 var(--font-sans)", letterSpacing: "-0.02em" }}>{display}</div>
      {change != null ? (
        <div style={{ marginTop: 8, fontSize: 13, color: changeColor }}>
          {change > 0 ? "+" : ""}
          {change.toFixed(1).replace(".", ",")} % vs période précédente
        </div>
      ) : null}
    </div>
  );
}
