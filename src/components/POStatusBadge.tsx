import { PurchaseOrderStatus, PO_STATUS_LABELS } from "@/types/purchase-order";
import { cn } from "@/lib/utils";

const styles: Record<PurchaseOrderStatus, string> = {
  brouillon: "bg-muted text-muted-foreground border-border",
  en_attente_rpaf: "bg-warning-soft text-warning border-warning/20",
  approuve: "bg-info-soft text-info border-info/20",
  envoye: "bg-info-soft text-info border-info/20",
  receptionne: "bg-success-soft text-success border-success/20",
  cloture: "bg-success-soft text-success border-success/20",
  rejete: "bg-destructive-soft text-destructive border-destructive/20",
  annule: "bg-muted text-muted-foreground border-border",
};

export function POStatusBadge({
  status,
  className,
}: {
  status: PurchaseOrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        styles[status],
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {PO_STATUS_LABELS[status]}
    </span>
  );
}
