import { LucideIcon } from "lucide-react";

type Accent = "info" | "warning" | "success" | "destructive" | "primary" | "neutral";

const ACCENT_DOT: Record<Accent, string> = {
  info: "bg-info",
  warning: "bg-warning",
  success: "bg-success",
  destructive: "bg-destructive",
  primary: "bg-primary",
  neutral: "bg-muted-foreground",
};

interface KpiCardProps {
  icon?: LucideIcon;
  label: string;
  value: number | string;
  accent?: Accent;
  suffix?: string;
  hint?: string;
}

export function KpiCard({ label, value, accent = "neutral", suffix, hint }: KpiCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-5 transition-colors hover:border-foreground/20">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-1.5 h-1.5 rounded-full ${ACCENT_DOT[accent]}`} />
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      </div>
      <p className="text-3xl font-semibold text-foreground tabular-nums tracking-tight">
        {value}
        {suffix && <span className="text-sm font-normal text-muted-foreground ml-1.5">{suffix}</span>}
      </p>
      {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
    </div>
  );
}
