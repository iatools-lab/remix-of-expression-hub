import { LucideIcon } from "lucide-react";

type Accent = "info" | "warning" | "success" | "destructive" | "primary";

const ACCENT_CLASSES: Record<Accent, string> = {
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  destructive: "bg-destructive-soft text-destructive",
  primary: "bg-primary/10 text-primary",
};

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  accent: Accent;
  suffix?: string;
}

export function KpiCard({ icon: Icon, label, value, accent, suffix }: KpiCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2 text-foreground">
            {value}
            {suffix && <span className="text-base font-medium text-muted-foreground ml-1">{suffix}</span>}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ACCENT_CLASSES[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
