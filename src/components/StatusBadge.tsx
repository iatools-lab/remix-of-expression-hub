import { FebStatus, STATUS_LABELS } from "@/types/feb";
import { cn } from "@/lib/utils";

const styles: Record<FebStatus, string> = {
  brouillon: "bg-muted text-muted-foreground border-border",
  en_attente_technique: "bg-info-soft text-info border-info/20",
  en_attente_pole: "bg-info-soft text-info border-info/20",
  en_attente_rpaf: "bg-warning-soft text-warning border-warning/20",
  en_attente_reception: "bg-warning-soft text-warning border-warning/20",
  validee: "bg-success-soft text-success border-success/20",
  rejetee: "bg-destructive-soft text-destructive border-destructive/20",
};

export function StatusBadge({ status, className }: { status: FebStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        styles[status],
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}
