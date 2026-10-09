"use client";

export function Tooltip({
  label,
  children,
  position = "top",
}: {
  label: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
}) {
  return (
    <span className={`rw-tip${position === "bottom" ? " rw-tip--bottom" : ""}`}>
      {children}
      <span className="rw-tip__bubble" role="tooltip">
        {label}
      </span>
    </span>
  );
}
