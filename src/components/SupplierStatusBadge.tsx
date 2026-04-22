import { Supplier, SupplierStatus, SUPPLIER_STATUS_LABELS } from "@/types/supplier";
import { cn } from "@/lib/utils";

const styles: Record<SupplierStatus, string> = {
  actif: "bg-success-soft text-success border-success/20",
  inactif: "bg-muted text-muted-foreground border-border",
  blackliste: "bg-destructive-soft text-destructive border-destructive/20",
};

export function SupplierStatusBadge({
  status,
  className,
}: {
  status: Supplier["status"];
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
      {SUPPLIER_STATUS_LABELS[status]}
    </span>
  );
}
