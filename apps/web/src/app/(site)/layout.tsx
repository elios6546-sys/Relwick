import { ThemeProvider } from "@/components/theme/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { TrackerProvider } from "@/components/tracker/tracker-provider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <TrackerProvider>{children}</TrackerProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
