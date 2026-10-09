"use client";

import Image from "next/image";
import { useTheme } from "@/components/theme/theme-provider";

export function Logo({ height = 26 }: { height?: number }) {
  const { theme } = useTheme();
  const src =
    theme === "dark" ? "/brand/relwick-logo-on-dark.svg" : "/brand/relwick-logo.svg";
  return (
    <Image
      src={src}
      alt="Relwick"
      width={Math.round(height * 4.2)}
      height={height}
      priority
      style={{ height, width: "auto" }}
    />
  );
}
