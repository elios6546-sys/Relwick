import { notFound } from "next/navigation";
import { DevUiShowcase } from "./showcase";

export default function DevUiPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DevUiShowcase />;
}
